// Genera maps/abq.js: la isla de Albuquerque (ciudad al sur, desierto y montañas al norte).
// Uso:  node tools/generate-map.js
// El resultado se puede retocar después con tools/editor.html.
'use strict';
const fs = require('fs');
const path = require('path');

const W = 12000, H = 15000;          // tamaño del mundo (unidades de juego)
const BC = 16, HC = 64;               // tamaño de celda de las capas de bioma y altura
const BIOME = { DEEP:0, SHALLOW:1, BEACH:2, PARK:3, SUBURB:4, CITY:5, INDUSTRIAL:6, DESERT:7, ROCK:8, RIVER:9, BOSQUE:10 };

// ---------- utilidades ----------
let seed = 20080120;
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const rr = (a, b) => a + rnd() * (b - a);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
function segDist(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy; let t = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0; t = clamp(t, 0, 1); return Math.hypot(px - ax - dx * t, py - ay - dy * t); }
function polyDist(px, py, pts) { let m = 1e9; for (let i = 0; i < pts.length - 1; i++) m = Math.min(m, segDist(px, py, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1])); return m; }
function catmull(pts, step) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const n = Math.max(1, Math.ceil(dist(p1[0], p1[1], p2[0], p2[1]) / step));
    for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(j => 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); }
  }
  out.push(pts[pts.length - 1].slice(0, 2));
  return out;
}
// ruido de valor suave
const PERM = Array.from({ length: 512 }, () => rnd());
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const h = (a, b) => PERM[((a * 73856093) ^ (b * 19349663)) & 511];
  const s = t => t * t * (3 - 2 * t), u = s(xf), v = s(yf);
  return (h(xi, yi) * (1 - u) + h(xi + 1, yi) * u) * (1 - v) + (h(xi, yi + 1) * (1 - u) + h(xi + 1, yi + 1) * u) * v;
}
function fbm(x, y, oct) { let a = 0, f = 1, amp = 1, s = 0; for (let i = 0; i < (oct || 4); i++) { a += vnoise(x * f, y * f) * amp; s += amp; f *= 2; amp *= 0.5; } return a / s; }

// ---------- forma de la isla ----------
// superelipse alargada con costa irregular y una bahía al suroeste
function land(x, y) {
  const cx = 6000, cy = 7600, rx = 5150, ry = 6900;
  const dx = (x - cx) / rx, dy = (y - cy) / ry, a = Math.atan2(dy, dx);
  const r = Math.pow(Math.pow(Math.abs(dx), 3.2) + Math.pow(Math.abs(dy), 3.2), 1 / 3.2);
  let edge = 1 + (fbm(Math.cos(a) * 3 + 10, Math.sin(a) * 3 + 10, 4) - 0.5) * 0.22;
  edge -= Math.max(0, 1 - dist(x, y, 1700, 12900) / 1500) * 0.18;   // bahía
  return edge - r;   // >0 tierra
}

// ---------- geografía real de Albuquerque ----------
// Las coordenadas se toman del mapa ilustrado "Breaking maP" (imagen de 2000 px de ancho):
// la ciudad ocupa allí x 650-1340, y 195-1200 y se lleva a la mitad sur de la isla.
const T = (rx, ry) => [Math.round(1500 + (rx - 650) / 690 * 9300), Math.round(6000 + (ry - 195) / 1005 * 8700)];
const TL = pts => pts.map(p => T(p[0], p[1]));
// contorno del área urbana (Rio Rancho al noroeste, Heights al este, South Valley al sur)
const CITY_POLY = TL([[790,300],[870,280],[1000,260],[1120,300],[1200,330],[1335,370],[1340,600],[1340,780],[1300,840],[1220,880],[1110,930],[1060,960],[1020,1060],[1000,1190],[820,1195],[800,1050],[780,900],[700,820],[660,770],[700,690],[760,560],[790,430]]);
function inPoly(x, y, P) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
// distancia (con signo: negativa dentro) al borde de la ciudad
const CITY_RING = CITY_POLY.concat([CITY_POLY[0]]);
function cityDist(x, y) { const d = polyDist(x, y, CITY_RING); return inPoly(x, y, CITY_POLY) ? -d : d; }

// ---------- río Grande (de norte a sur, cruza la ciudad) ----------
const RIVER = catmull([[6800, 900], [7200, 3000], [6600, 5000]].concat(TL([[1140,205],[1080,330],[1010,430],[965,530],[925,610],[905,690],[935,760],[930,850],[915,960],[900,1080],[885,1205]])).concat([[3900, 15200]]), 60);
const RIVER_W = 300;

// ---------- zona urbana ----------
function cityness(x, y) { return land(x, y) > 0.07 && cityDist(x, y) < (fbm(x / 1500, y / 1500) - 0.5) * 300; }
const DOWNTOWN = T(995, 725);
const CITY_TOP = T(0, 260)[1];   // solo como referencia para el norte (desierto)

// ---------- capas ----------
const BW = Math.ceil(W / BC), BH = Math.ceil(H / BC), HW = Math.ceil(W / HC), HH = Math.ceil(H / HC);
function heightAt(x, y) {
  const l = land(x, y);
  if (l <= 0) return -3 + clamp(l * 40, -1, 0);           // mar
  if (polyDist(x, y, RIVER) < RIVER_W / 2) return -3;
  let h = 0.5 + fbm(x / 1600, y / 1600, 3) * 2;
  const cd = cityDist(x, y);
  if (cd > -400) {                                          // desierto ondulado fuera de la ciudad
    const k = clamp((cd + 400) / 1000, 0, 1);
    h += k * fbm(x / 900 + 7, y / 900, 4) * 9;
    // sierra de Sandía al noreste: cresta alta
    const ridge = Math.exp(-Math.pow((x - (9600 + (y - 3500) * 0.1)) / 850, 2)) * clamp((6300 - y) / 1200, 0, 1) * clamp((y - 900) / 900, 0, 1);
    h += ridge * (38 + fbm(x / 400, y / 400, 4) * 22);
    // volcanes del oeste (conos pequeños)
    for (const [vx, vy] of [[1900, 7600], [2200, 8600], [1700, 9500]]) h += Math.max(0, 1 - dist(x, y, vx, vy) / 380) * 22;
  }
  if (l < 0.04) h = Math.min(h, l * 40);                      // la costa baja hasta el agua
  return h;
}
const heightGrid = new Uint8Array(HW * HH);
heightGrid.fill(16); // terreno jugable plano a z=0; los biomas conservan su relieve visual

const biomeGrid = new Uint8Array(BW * BH);
for (let j = 0; j < BH; j++) for (let i = 0; i < BW; i++) {
  const x = i * BC + BC / 2, y = j * BC + BC / 2, l = land(x, y);
  let b;
  if (l <= -0.035) b = BIOME.DEEP;
  else if (l <= 0) b = BIOME.SHALLOW;
  else if (l < 0.022) b = BIOME.BEACH;
  else {
    const rd = polyDist(x, y, RIVER);
    if (rd < RIVER_W / 2) b = BIOME.RIVER;
    else if (rd < RIVER_W / 2 + 260 + fbm(x / 300, y / 300) * 180) b = BIOME.BOSQUE;
    else if (cityness(x, y)) {
      const dd = dist(x, y, DOWNTOWN[0], DOWNTOWN[1]);
      if (dd < 1100) b = BIOME.CITY;
      else if (dist(x, y, ...T(1120, 900)) < 900 || dist(x, y, ...T(1005, 770)) < 500 || dist(x, y, ...T(1110, 1080)) < 700) b = BIOME.INDUSTRIAL; // aeropuerto, rail yards, estudios
      else if (fbm(x / 500 + 50, y / 500, 2) > 0.74) b = BIOME.PARK;
      else b = BIOME.SUBURB;
    } else {
      const h = heightAt(x, y);
      b = h > 24 ? BIOME.ROCK : BIOME.DESERT;
    }
  }
  biomeGrid[j * BW + i] = b;
}

// ---------- carreteras ----------
const roads = [];
let rid = 0;
function addRoad(name, kind, ctrl, step) {
  const pts = catmull(ctrl, step || 70).map(p => [Math.round(p[0]), Math.round(p[1])]);
  const r = { id: rid++, name, kind, pts }; roads.push(r); return r;
}
const onLand = (x, y) => land(x, y) > 0.03;
// recorta una polilínea a los tramos que cumplen `ok`, devolviendo trozos
function splitBy(pts, ok) {
  const out = []; let cur = [];
  for (const p of pts) { if (ok(p[0], p[1])) cur.push(p); else { if (cur.length > 2) out.push(cur); cur = []; } }
  if (cur.length > 2) out.push(cur);
  return out;
}

// carretera de la costa (vuelta a la isla)
{
  const ring = [];
  for (let k = 0; k < 96; k++) {
    const a = k / 96 * Math.PI * 2; let r0 = 0.2, r1 = 1.2;
    const at = r => [6000 + Math.cos(a) * r * 5150, 7600 + Math.sin(a) * r * 6900];
    for (let it = 0; it < 30; it++) { const m = (r0 + r1) / 2, p = at(m); if (land(p[0], p[1]) > 0.05) r0 = m; else r1 = m; }
    ring.push(at(r0));
  }
  ring.push(ring[0]);
  addRoad('Ruta de la costa', 'main', ring, 80);
}
// avenidas (dentro del área urbana)
const inCityRoad = (x, y) => onLand(x, y) && cityDist(x, y) < 250;
function avenue(name, rpts) { for (const piece of splitBy(catmull(TL(rpts), 70), inCityRoad)) if (piece.length > 4) addRoad(name, 'main', piece, 70); }
avenue('Central Ave (Ruta 66)', [[650,800],[720,790],[800,768],[860,748],[920,738],[960,735],[1010,742],[1050,746],[1120,752],[1200,760],[1280,766],[1345,772]]);
// Llevar el cruce con 4th Street bastante al norte para que quede en terreno
// plano y separado de la rampa del puente de 4th Street.
avenue('Paseo del Norte', [[760,470],[860,470],[920,445],[960,395],[990,365],[1030,350],[1160,350],[1260,352],[1340,355]]);
avenue('Montgomery Blvd', [[1060,600],[1160,600],[1260,600],[1340,600]]);
avenue('Menaul Blvd', [[930,648],[1030,650],[1130,652],[1230,652],[1340,652]]);
avenue('Lomas Blvd', [[960,712],[1050,714],[1150,716],[1250,718],[1340,720]]);
avenue('Gibson Blvd', [[930,830],[1030,832],[1130,834],[1230,836],[1300,838]]);
avenue('Rio Bravo Blvd', [[800,945],[880,940],[960,938],[1040,936]]);
avenue('Alameda Blvd', [[800,380],[900,372],[1000,365],[1120,360]]);
avenue('Coors Blvd', [[830,280],[835,400],[838,520],[836,640],[830,760],[826,880],[822,1000],[818,1190]]);
avenue('Rio Grande Blvd', [[865,500],[858,600],[862,680],[875,730]]);
avenue('4th Street', [[995,300],[992,420],[990,540],[988,660],[985,760],[975,880],[960,1000],[950,1190]]);
avenue('Isleta Blvd', [[878,790],[872,880],[862,980],[850,1100],[842,1190]]);
avenue('San Mateo Blvd', [[1150,380],[1150,500],[1150,620],[1150,740],[1150,840]]);
avenue('Wyoming Blvd', [[1250,380],[1250,500],[1250,620],[1250,740],[1250,850]]);
avenue('Juan Tabo Blvd', [[1300,400],[1300,520],[1300,640],[1300,760]]);
avenue('Tramway Blvd', [[1220,330],[1300,360],[1336,450],[1338,600],[1336,740]]);
avenue('Unser Blvd', [[700,420],[710,560],[705,700],[700,820]]);
// calles: en los Heights (al este de la I-25) cuadrícula regular; al oeste y al sur, algo más irregular
const riverOK = (x, y) => polyDist(x, y, RIVER) > RIVER_W / 2 + 160;
let sn = 1;
const ok = (x, y) => cityDist(x, y) < -120 && riverOK(x, y) && land(x, y) > 0.1;
for (let y = 6400; y < H; y += 880) {
  const pts = []; for (let x = 0; x <= W; x += 450) pts.push([x, y + (x < T(1050, 0)[0] ? (fbm(x / 1200, y / 300 + 9) - 0.5) * 200 : 0)]);
  for (const piece of splitBy(catmull(pts, 70), ok)) if (piece.length > 6) addRoad('Calle ' + (sn++), 'street', piece, 70);
}
for (let x = 1600; x < W; x += 840) {
  const pts = []; for (let y = 6000; y <= H; y += 450) pts.push([x + (x < T(1050, 0)[0] ? (fbm(x / 300 + 4, y / 1200) - 0.5) * 200 : 0), y]);
  for (const piece of splitBy(catmull(pts, 70), ok)) if (piece.length > 6) addRoad('Calle ' + (sn++), 'street', piece, 70);
}
// ronda: contorno de la ciudad desplazado 200 hacia dentro; las calles de la cuadrícula acaban en ella
{ const R=[], n=CITY_POLY.length;
  for (let i = 0; i < n; i++) { const a = CITY_POLY[(i + n - 1) % n], b = CITY_POLY[i], c = CITY_POLY[(i + 1) % n];
    const n1 = [a[1] - b[1], b[0] - a[0]], n2 = [b[1] - c[1], c[0] - b[0]], nx = n1[0] / Math.hypot(...n1) + n2[0] / Math.hypot(...n2), ny = n1[1] / Math.hypot(...n1) + n2[1] / Math.hypot(...n2), l = Math.hypot(nx, ny) || 1;
    let q = [b[0] + nx / l * 200, b[1] + ny / l * 200]; if (!inPoly(q[0], q[1], CITY_POLY)) q = [b[0] - nx / l * 200, b[1] - ny / l * 200]; R.push(q); }
  R.push(R[0]);
  for (const piece of splitBy(catmull(R, 70), (x, y) => land(x, y) > 0.06)) addRoad('Ronda urbana', 'main', piece, 70); }
// paseos junto al río (recogen las calles que terminan en la orilla)
for (const side of [-1, 1]) {
  const pts = RIVER.map((p, i, a) => { const q = a[Math.min(a.length - 1, i + 1)], o = a[Math.max(0, i - 1)], ang = Math.atan2(q[1] - o[1], q[0] - o[0]) + Math.PI / 2;
    return [p[0] + Math.cos(ang) * side * (RIVER_W / 2 + 110), p[1] + Math.sin(ang) * side * (RIVER_W / 2 + 110)]; });
  for (const piece of splitBy(pts.filter((p, i) => i % 3 === 0), (x, y) => cityness(x, y) && land(x, y) > 0.06)) addRoad(side < 0 ? 'Paseo del Bosque Oeste' : 'Paseo del Bosque Este', 'street', piece, 70);
}
// desierto (norte y oeste): caminos de tierra y la vía del tren (paralela a la I-25, como el Rail Runner)
addRoad('Camino de la cocina', 'dirt', [T(1205,205), [8200, 4300], [8600, 3600]], 70);
addRoad("Camino de To'hajiilee", 'dirt', [T(760,560), [2600, 7400], [2000, 5600], [1900, 4200]], 70);
addRoad('Camino del rancho', 'dirt', [[7500, 2900], [8600, 2500], [9200, 2100]], 70);
addRoad('Ferrocarril BNSF', 'rail', [[6600, 1500], [7100, 3400]].concat(TL([[1170,210],[1130,330],[1080,470],[1030,580],[1010,700],[1005,770],[1000,880],[985,1000],[970,1120]])).concat([[5000, 14900]]), 70);

// autopistas: los extremos que caen en el mar se recortan y se enlazan con la carretera de la costa
// quitar tramos que van en paralelo y casi encima de otra carretera más importante (formaban explanadas de asfalto)
{ const rank = { main: 2, street: 1, dirt: 0, rail: -1 };
  const segDir = (P, i) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)]; return Math.atan2(b[1] - a[1], b[0] - a[0]); };
  const keep = [];
  for (const r of roads) {
    if (r.kind !== 'street' && r.kind !== 'main') { keep.push(r); continue; }
    const bad = r.pts.map((p, i) => { const d0 = segDir(r.pts, i);
      for (const o of roads) { if (o === r || rank[o.kind] < rank[r.kind] || (rank[o.kind] === rank[r.kind] && o.id > r.id) || o.kind === 'rail') continue;
        let bd = 1e9, bj = -1; for (let j = 0; j < o.pts.length; j++) { const d = dist(p[0], p[1], o.pts[j][0], o.pts[j][1]); if (d < bd) { bd = d; bj = j; } }
        if (bd < 300) { let da = Math.abs(d0 - segDir(o.pts, bj)) % Math.PI; da = Math.min(da, Math.PI - da); if (da < 0.5) return true; } }
      return false; });
    let cur = [];
    const flush = () => { if (cur.length > 4) keep.push({ id: rid++, name: r.name, kind: r.kind, pts: cur }); cur = []; };
    r.pts.forEach((p, i) => { if (bad[i]) flush(); else cur.push(p); }); flush();
  }
  roads.length = 0; roads.push(...keep); }

// la vía del tren no se mete en el mar
for (const r of roads) if (r.kind === 'rail') { while (r.pts.length > 2 && land(...r.pts[0]) < 0.08) r.pts.shift(); while (r.pts.length > 2 && land(...r.pts[r.pts.length - 1]) < 0.08) r.pts.pop(); }

// ---------- desenredar: cruces limpios de solo dos calles ----------
// Reglas: en un cruce solo se encuentran dos calles; nada de cruces muy oblicuos; los cruces van
// separados. Cuando no se cumple, se recorta la calle menos importante cerca del cruce.
const RANK = { hwy: 3, main: 2, street: 1 };
const ground = r => r.kind === 'main' || r.kind === 'street' || r.kind === 'hwy';
const roadLen = r => { let L = 0; for (let i = 1; i < r.pts.length; i++) L += dist(r.pts[i-1][0], r.pts[i-1][1], r.pts[i][0], r.pts[i][1]); return L; };
function crossingsOf(list) {
  const out = [], box = r => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of r.pts) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); } return [x0, y0, x1, y1]; };
  const B = list.map(box);
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const A = list[i], C = list[j], a = B[i], c = B[j]; if (a[0] > c[2] + 200 || c[0] > a[2] + 200 || a[1] > c[3] + 200 || c[1] > a[3] + 200) continue;
    for (let k = 0; k < A.pts.length - 1; k++) { const p = A.pts[k], q = A.pts[k + 1];
      for (let m = 0; m < C.pts.length - 1; m++) { const u = C.pts[m], v = C.pts[m + 1];
        const d1x = q[0] - p[0], d1y = q[1] - p[1], d2x = v[0] - u[0], d2y = v[1] - u[1], den = d1x * d2y - d1y * d2x; if (Math.abs(den) < 1e-6) continue;
        const t = ((u[0] - p[0]) * d2y - (u[1] - p[1]) * d2x) / den, w = ((u[0] - p[0]) * d1y - (u[1] - p[1]) * d1x) / den;
        if (t < 0 || t > 1 || w < 0 || w > 1) continue;
        let ang = Math.abs(Math.atan2(d1y, d1x) - Math.atan2(d2y, d2x)) % Math.PI; ang = Math.min(ang, Math.PI - ang);
        out.push({ x: p[0] + d1x * t, y: p[1] + d1y * t, a: A, b: C, ang }); } } }
  // cruces en T: una calle que termina dentro de otra
  for (const A of list) for (const e of [0, A.pts.length - 1]) { const p = A.pts[e], q = A.pts[e ? e - 1 : 1];
    for (const C of list) { if (C === A) continue; let bd = 1e9, bj = 0; for (let j = 0; j < C.pts.length - 1; j++) { const d = segDist(p[0], p[1], C.pts[j][0], C.pts[j][1], C.pts[j + 1][0], C.pts[j + 1][1]); if (d < bd) { bd = d; bj = j; } }
      if (bd > 100) continue;
      let ang = Math.abs(Math.atan2(p[1] - q[1], p[0] - q[0]) - Math.atan2(C.pts[bj + 1][1] - C.pts[bj][1], C.pts[bj + 1][0] - C.pts[bj][0])) % Math.PI; ang = Math.min(ang, Math.PI - ang);
      if (!out.some(o => dist(o.x, o.y, p[0], p[1]) < 60 && ((o.a === A && o.b === C) || (o.a === C && o.b === A)))) out.push({ x: p[0], y: p[1], a: A, b: C, ang, tee: true }); } }
  return out;
}
// quita los puntos de una calle a menos de `rad` de (x,y) y la parte en trozos
function cutRoad(r, x, y, rad) {
  const pieces = []; let cur = [];
  for (const p of r.pts) { if (dist(p[0], p[1], x, y) < rad) { if (cur.length) pieces.push(cur); cur = []; } else cur.push(p); }
  if (cur.length) pieces.push(cur);
  const keep = pieces.filter(pc => pc.length > 4);
  const i = roads.indexOf(r); roads.splice(i, 1);
  for (const pc of keep) roads.push({ id: rid++, name: r.name, kind: r.kind, pts: pc });
}
const weaker = (a, b) => (RANK[a.kind] !== RANK[b.kind]) ? (RANK[a.kind] < RANK[b.kind] ? a : b) : (roadLen(a) < roadLen(b) ? a : b);
function untangle() {
for (let iter = 0; iter < 40; iter++) {
  const cs = crossingsOf(roads.filter(ground)), cuts = [], touched = new Set();
  const cut = (r, x, y, rad) => { if (touched.has(r) || r.kind === 'hwy') return; touched.add(r); cuts.push([r, x, y, rad]); };
  for (const c of cs) {
    if (touched.has(c.a) || touched.has(c.b)) continue;
    // a las autopistas solo las cruzan avenidas
    if ((c.a.kind === 'hwy') !== (c.b.kind === 'hwy')) { const o = c.a.kind === 'hwy' ? c.b : c.a; if (o.kind === 'street') { cut(o, c.x, c.y, 300); continue; } }
    if (c.ang < 0.7) { cut(weaker(c.a, c.b), c.x, c.y, 260); continue; }                 // cruce muy oblicuo
    const near = cs.find(o => o !== c && dist(o.x, o.y, c.x, c.y) < 420 && new Set([c.a.name, c.b.name, o.a.name, o.b.name]).size > 2);
    if (near) { let w = c.a; for (const r of [c.b, near.a, near.b]) w = weaker(w, r); cut(w, (c.x + near.x) / 2, (c.y + near.y) / 2, 300); }
  }
  if (process.env.DBG) console.log('pasada',iter,'cruces',cs.length,'recortes',cuts.length);
  if (!cuts.length) break;
  for (const [r, x, y, rad] of cuts) cutRoad(r, x, y, rad);
}
}
untangle();
// enlazar los finales sueltos solo si el enlace es limpio: casi perpendicular y lejos de otros cruces
{ const cs = crossingsOf(roads.filter(ground));
  for (const r of roads) { if (!ground(r)) continue;
    for (const end of [0, 1]) { const p = end ? r.pts[r.pts.length - 1] : r.pts[0], q = end ? r.pts[r.pts.length - 3] : r.pts[2]; if (!q) continue;
      if (roads.some(o => o !== r && ground(o) && polyDist(p[0], p[1], o.pts) < 90)) continue;
      const dirA = Math.atan2(p[1] - q[1], p[0] - q[0]); let best = null, bd = 700;
      for (const o of roads) { if (o === r || !ground(o) || (o.kind === 'hwy' && r.kind === 'street')) continue;
        for (let j = 1; j < o.pts.length - 1; j++) { const t = o.pts[j], d = dist(p[0], p[1], t[0], t[0] === t[0] ? t[1] : 0); if (d >= bd || d < 1) continue;
          const toward = Math.atan2(t[1] - p[1], t[0] - p[0]); let dev = Math.abs(toward - dirA) % (2 * Math.PI); dev = Math.min(dev, 2 * Math.PI - dev); if (dev > 0.6) continue;  // hacia delante
          const oa = Math.atan2(o.pts[j + 1][1] - o.pts[j - 1][1], o.pts[j + 1][0] - o.pts[j - 1][0]); let ang = Math.abs(toward - oa) % Math.PI; ang = Math.min(ang, Math.PI - ang); if (ang < 0.9) continue;  // casi perpendicular
          if (cs.some(c => dist(c.x, c.y, t[0], t[1]) < 380)) continue;                       // lejos de otros cruces
          let wet = false; for (let k = 0; k <= 10; k++) { const x = p[0] + (t[0] - p[0]) * k / 10, y = p[1] + (t[1] - p[1]) * k / 10; if (polyDist(x, y, RIVER) < RIVER_W / 2 + 60 || land(x, y) < 0.05) { wet = true; break; } }
          if (!wet) { bd = d; best = t; } } }
      if (!best) continue;
      const seg = [], k = Math.max(1, Math.ceil(bd / 70)); for (let i = 1; i <= k; i++) seg.push([Math.round(p[0] + (best[0] - p[0]) * i / k), Math.round(p[1] + (best[1] - p[1]) * i / k)]);
      if (end) r.pts.push(...seg); else r.pts.unshift(...seg.reverse()); } } }
// segunda pasada: los enlaces nuevos tampoco pueden formar cruces amontonados
untangle();
// las calles que se han quedado muy cortas sobran (antes de comprobar la conectividad)
for (let i = roads.length - 1; i >= 0; i--) if (ground(roads[i]) && roads[i].kind !== 'hwy' && roadLen(roads[i]) < 500) roads.splice(i, 1);
// conectividad: toda carretera transitable tiene que estar unida a la red principal. Las que se han
// quedado aisladas (tramos recortados, caminos de tierra) se enlazan con la carretera conectada más cercana.
{ const drive = r => r.kind !== 'rail';
  for (let pass = 0; pass < 12; pass++) {
    const list = roads.filter(drive), idx = new Map(list.map((r, i) => [r, i])), adj = list.map(() => []);
    const touch = (a, b) => { for (const e of [a.pts[0], a.pts[a.pts.length - 1]]) if (polyDist(e[0], e[1], b.pts) < 100) return true; return false; };
    for (const c of crossingsOf(list)) { adj[idx.get(c.a)].push(idx.get(c.b)); adj[idx.get(c.b)].push(idx.get(c.a)); }
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) if (touch(list[i], list[j]) || touch(list[j], list[i])) { adj[i].push(j); adj[j].push(i); }
    // componente principal = la de la carretera de la costa
    const seen = new Set(); let st = [list.findIndex(r => r.name === 'Ruta de la costa')]; seen.add(st[0]);
    while (st.length) { const i = st.pop(); for (const j of adj[i]) if (!seen.has(j)) { seen.add(j); st.push(j); } }
    const lost = list.filter((r, i) => !seen.has(i)); if (!lost.length) break;
    const conn = list.filter((r, i) => seen.has(i));
    for (const r of lost) { let best = null, bd = 2500, bend = 0;
      for (const end of [0, 1]) { const p = end ? r.pts[r.pts.length - 1] : r.pts[0];
        for (const o of conn) for (const q of o.pts) { const d = dist(p[0], p[1], q[0], q[1]); if (d >= bd) continue;
          let wet = false; for (let k = 0; k <= 12; k++) { const x = p[0] + (q[0] - p[0]) * k / 12, y = p[1] + (q[1] - p[1]) * k / 12; if (polyDist(x, y, RIVER) < RIVER_W / 2 + 40 || land(x, y) < 0.05) { wet = true; break; } }
          if (!wet) { bd = d; best = q; bend = end; } } }
      if (!best) continue;
      const p = bend ? r.pts[r.pts.length - 1] : r.pts[0], seg = [], k = Math.max(1, Math.ceil(bd / 70));
      for (let i = 1; i <= k; i++) seg.push([Math.round(p[0] + (best[0] - p[0]) * i / k), Math.round(p[1] + (best[1] - p[1]) * i / k)]);
      if (bend) r.pts.push(...seg); else r.pts.unshift(...seg.reverse());
      break;   // de uno en uno: tras cada enlace se recalcula la red
    }
  } }
for (let i = roads.length - 1; i >= 0; i--) if (ground(roads[i]) && roadLen(roads[i]) < 500) roads.splice(i, 1);

// ---------- altura de las carreteras ----------
// Las autopistas van elevadas (z=9) por la ciudad y sobre el río; bajan a ras de suelo en el desierto.
// Las avenidas que cruzan el río van en puente.
for(const r of roads){
  if(r.kind==='rail') continue;
  r.bridge=r.pts.some(p=>polyDist(p[0],p[1],RIVER)<RIVER_W/2);
  for(const p of r.pts) delete p[2];
}

// ---------- lugares de la historia ----------
// Posiciones del mapa de referencia (números rojos de "Breaking maP"); los lugares sin número se
// colocan donde tiene sentido en la serie. P(rx,ry,{...}) convierte coordenadas del mapa.
const P = (rx, ry, o) => { const [x, y] = T(rx, ry); return Object.assign({ x, y }, o); };
const places = {
  home:       P(1255,608, {name:'Casa White', roof:'#c9ab95', wall:'#d9c49c', size:[170,120]}),                  // 3 · NE Heights
  saul:       P(1278,598, {name:'Saul Goodman & Asoc.', roof:'#b39a55', wall:'#e8dcb0'}),                         // 2 · Montgomery
  hank:       P(1300,575, {name:'Casa de Hank y Marie', roof:'#7a6a5a', wall:'#d9cbb0', size:[170,120]}),         // 4 · al pie de la sierra
  carwash:    P(1260,668, {name:'Lavadero A1A', roof:'#2f74b8', wall:'#d0e4f5'}),                                  // 5 · Menaul
  motel:      P(1045,725, {name:'Motel Crossroads', roof:'#a0522d', wall:'#d8b890'}),                              // 6 · Central
  jane:       P(1068,754, {name:'Apartamento de Jane', roof:'#8a5a3a', wall:'#d8c0a0', size:[150,110]}),          // 7 · dúplex de Jesse y Jane
  jesse:      P(948,742,  {name:'Casa de Jesse', roof:'#b8613d', wall:'#efebe2', size:[170,120]}),                 // 16 · Huning Castle, junto al río
  hector:     P(942,1180, {name:'Casa en el desierto', roof:'#8a6a4a', wall:'#c8a880', size:[150,110], desert:true}), // 9 · Tío Salamanca, al sur
  pollos:     P(880,1000, {name:'Los Pollos Hermanos', roof:'#e9cba6', wall:'#e2bf98'}),                          // 10 · Twisters, South Valley
  tren:       P(1004,770, {name:'Rail Yards', roof:'#5a4a3a', wall:'#8a7a6a'}),                                     // 11
  dea:        P(992,738,  {name:'DEA / Policía APD', roof:'#2b3a4f', wall:'#8a96a6'}),                              // 12-13 · Civic Plaza
  tuco:       P(970,748,  {name:'Desguace Salamanca', roof:'#4f4232', wall:'#7a6a55'}),                              // 14 · cuartel de Tuco
  pawn:       P(978,722,  {name:'Casa de Empeños', roof:'#4f7a2e', wall:'#c7b98c'}),                                // 15 · junto al Dog House
  lavanderia: P(1035,628, {name:'Lavandería Industrial', roof:'#8a9098', wall:'#c8ccd0'}),                         // 17 · Delta Linen
  instituto:  P(957,300,  {name:'Instituto J.P. Wynne', roof:'#a85a3a', wall:'#d8b890'}),                           // 18 · Rio Rancho High
  super:      P(1180,642, {name:'Supermercado', roof:'#c9c4b8', wall:'#e0d8c8'}),
  hospital:   P(1085,700, {name:'Hospital UNM', roof:'#e9e9e9', wall:'#c8d5dd'}),                                   // junto a la universidad
  gale:       P(1010,610, {name:'Apartamento de Gale', roof:'#6a5a4a', wall:'#d0c0a8', size:[150,110]}),
  residencia: P(905,620,  {name:'Residencia Casa Tranquila', roof:'#b07a5a', wall:'#e0d0b8'}),
  ted:        P(1100,840, {name:'Beneke Fabricators', roof:'#7a8088', wall:'#b8bcc0'}),
  vamonos:    P(1200,820, {name:'Vamonos Pest', roof:'#c8a020', wall:'#d8c8a0'}),
  almacen:    P(1110,905, {name:'Almacén químico', roof:'#6a7078', wall:'#9aa0a8'}),                                 // junto al aeropuerto
  rvlot:      P(870,860,  {name:'Autocaravanas', roof:'#6f6f6f', wall:'#aaaaaa'}),
  spooge:     P(860,700,  {name:'Casa de Spooge', roof:'#5a4a3a', wall:'#a89070', size:[150,110]}),
  gretchen:   P(1240,400, {name:'Casa de Gretchen y Elliott', roof:'#4a4a4a', wall:'#e8e4dc', size:[190,130]}),   // Sandia Heights
  jack:       {x:8800, y:2600, name:'Complejo de Jack', roof:'#5a5040', wall:'#8a7a60', desert:true},
  tohajiilee: {x:2000, y:4300, name:"To'hajiilee", roof:'#9a7a50', wall:'#b89a70', desert:true},               // al oeste, en el desierto
};
const cook = { x: 8500, y: 3700 };
const dealers = [P(1150,560,{}), P(1020,790,{}), P(870,950,{})].map((p,i) => [p.x, p.y, ['Camello: Badger','Camello: Skinny Pete','Camello: Combo'][i]]);

// ---------- exportar ----------
function rle(arr) { const out = []; for (let i = 0; i < arr.length;) { const v = arr[i]; let n = 1; while (i + n < arr.length && arr[i + n] === v && n < 255) n++; out.push(v, n); i += n; } return Buffer.from(out).toString('base64'); }
const map = {
  version: 1, name: 'Albuquerque', w: W, h: H,
  biome: { cell: BC, cols: BW, rows: BH, rle: rle(biomeGrid) },
  height: { cell: HC, cols: HW, rows: HH, scale: 0.25, offset: -4, data: Buffer.from(heightGrid).toString('base64') },
  roads, places, cook, dealers,
};
const out = path.join(__dirname, '..', 'maps', 'abq.js');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, '// Mapa generado por tools/generate-map.js y editable con tools/editor.html\n"use strict";\nconst MAP = ' + JSON.stringify(map) + ';\n');
console.log('mapa escrito en', out, (fs.statSync(out).size / 1024).toFixed(0) + ' KB,', roads.length, 'carreteras');
