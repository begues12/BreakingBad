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
for (let j = 0; j < HH; j++) for (let i = 0; i < HW; i++) heightGrid[j * HW + i] = clamp(Math.round((heightAt(i * HC + HC / 2, j * HC + HC / 2) + 4) * 4), 0, 255);

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
// autopistas (trazado real: I-25 norte-sur al este del río, I-40 este-oeste; se cruzan en el "Big I")
addRoad('I-25', 'hwy', [[7400, 1300], [7600, 3200], [8000, 5200]].concat(TL([[1205,205],[1185,300],[1150,430],[1100,540],[1060,620],[1045,700],[1042,800],[1035,950],[1025,1050],[1010,1150]])).concat([[6200, 14900]]), 70);
addRoad('I-40', 'hwy', [[900, 9700]].concat(TL([[665,770],[730,740],[790,705],[900,668],[980,662],[1045,670],[1150,690],[1270,730],[1335,760]])).concat([[11050, 11700]]), 70);
// avenidas (dentro del área urbana)
const inCityRoad = (x, y) => onLand(x, y) && cityDist(x, y) < 250;
function avenue(name, rpts) { for (const piece of splitBy(catmull(TL(rpts), 70), inCityRoad)) if (piece.length > 4) addRoad(name, 'main', piece, 70); }
avenue('Central Ave (Ruta 66)', [[650,800],[720,790],[800,768],[860,748],[920,738],[960,735],[1010,742],[1050,746],[1120,752],[1200,760],[1280,766],[1345,772]]);
avenue('Paseo del Norte', [[760,470],[860,470],[960,468],[1060,465],[1160,462],[1260,462],[1340,465]]);
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
const hwyOK = (x, y) => roads.filter(r => r.kind === 'hwy').every(r => polyDist(x, y, r.pts) > 230);
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
{ const coast = roads.find(r => r.name === 'Ruta de la costa');
  for (const r of roads.filter(r => r.kind === 'hwy')) {
    while (r.pts.length > 2 && land(...r.pts[0]) < 0.06) r.pts.shift();
    while (r.pts.length > 2 && land(...r.pts[r.pts.length - 1]) < 0.06) r.pts.pop();
    for (const end of [0, 1]) { const p = end ? r.pts[r.pts.length - 1] : r.pts[0]; let best = null, bd = 1e9;
      for (const q of coast.pts) { const d = dist(p[0], p[1], q[0], q[1]); if (d < bd) { bd = d; best = q; } }
      if (best && bd < 1500) { const seg = []; const k = Math.ceil(bd / 70); for (let i = 1; i <= k; i++) seg.push([Math.round(p[0] + (best[0] - p[0]) * i / k), Math.round(p[1] + (best[1] - p[1]) * i / k)]);
        if (end) r.pts.push(...seg); else r.pts.unshift(...seg.reverse()); } } } }

// quitar tramos que van en paralelo y casi encima de otra carretera más importante (formaban explanadas de asfalto)
{ const rank = { hwy: 3, main: 2, ramp: 2, street: 1, dirt: 0, rail: -1 };
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

// enlazar los finales sueltos de calles y avenidas con la carretera más cercana (sin cruzar el río)
{ const near = (p, self) => roads.some(o => o !== self && o.kind !== 'hwy' && o.kind !== 'rail' && polyDist(p[0], p[1], o.pts) < 90);
  for (const r of roads) { if (r.kind === 'hwy' || r.kind === 'rail' || r.kind === 'ramp') continue;
    for (const end of [0, 1]) { const p = end ? r.pts[r.pts.length - 1] : r.pts[0]; if (near(p, r)) continue;
      let best = null, bd = 900;
      for (const o of roads) { if (o === r || o.kind === 'hwy' || o.kind === 'rail' || o.kind === 'ramp') continue;
        for (const q of o.pts) { const d = dist(p[0], p[1], q[0], q[1]); if (d >= bd || d < 1) continue;
          let wet = false; for (let k = 0; k <= 12; k++) { const x = p[0] + (q[0] - p[0]) * k / 12, y = p[1] + (q[1] - p[1]) * k / 12; if (polyDist(x, y, RIVER) < RIVER_W / 2 + 60 || land(x, y) < 0.05) { wet = true; break; } }
          if (!wet) { bd = d; best = q; } } }
      if (!best) continue;
      const seg = [], k = Math.max(1, Math.ceil(bd / 70)); for (let i = 1; i <= k; i++) seg.push([Math.round(p[0] + (best[0] - p[0]) * i / k), Math.round(p[1] + (best[1] - p[1]) * i / k)]);
      if (end) r.pts.push(...seg); else r.pts.unshift(...seg.reverse()); } } }

// ---------- altura de las carreteras ----------
// Las autopistas van elevadas (z=9) por la ciudad y sobre el río; bajan a ras de suelo en el desierto.
// Las avenidas que cruzan el río van en puente.
const groundZ = (x, y) => heightAt(x, y);
for (const r of roads) {
  if (r.kind === 'hwy') {
    for (const p of r.pts) { const urban = (cityDist(p[0], p[1]) < 200 || polyDist(p[0], p[1], RIVER) < RIVER_W) && land(p[0], p[1]) > 0.16; if (urban) p[2] = 9; }
  } else if (r.kind !== 'rail') {
    for (const p of r.pts) if (polyDist(p[0], p[1], RIVER) < RIVER_W / 2 + 140) p[2] = 3;
  }
}
// rampas suaves: interpolar la altura hacia el suelo en los extremos de cada tramo elevado
for (const r of roads) {
  const P = r.pts, n = P.length, RAMP = r.kind === 'hwy' ? 8 : 3;   // puntos de rampa (~70 u cada uno)
  const zs = P.map(p => p[2]);
  for (let i = 0; i < n; i++) {
    if (zs[i] !== undefined) continue;
    // distancia (en puntos) al tramo elevado más cercano
    let best = null;
    for (let d = 1; d <= RAMP; d++) { for (const j of [i - d, i + d]) if (j >= 0 && j < n && zs[j] !== undefined) { best = { d, z: zs[j] }; break; } if (best) break; }
    if (best) { const g = groundZ(P[i][0], P[i][1]), t = best.d / (RAMP + 1); P[i][2] = +(best.z + (g - best.z) * t * t * (3 - 2 * t)).toFixed(2); }
  }
}
// rampas de acceso a la I-25 y la I-40 en la ciudad: desde una avenida suben en paralelo hasta el tablero
function rampFrom(hwyName, nearX, nearY, side) {
  const h = roads.find(r => r.name === hwyName);
  let bi = 0, bd = 1e9; h.pts.forEach((p, i) => { const d = dist(p[0], p[1], nearX, nearY); if (d < bd) { bd = d; bi = i; } });
  const a = h.pts[Math.max(0, bi - 1)], b = h.pts[Math.min(h.pts.length - 1, bi + 1)], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const nx = Math.cos(ang + Math.PI / 2) * side, ny = Math.sin(ang + Math.PI / 2) * side, ux = Math.cos(ang), uy = Math.sin(ang);
  const merge = h.pts[Math.min(h.pts.length - 1, bi + 9)];
  const start = [merge[0] - ux * 900 + nx * 230, merge[1] - uy * 900 + ny * 230];
  const pts = [];
  for (let k = 0; k <= 14; k++) { const t = k / 14, e = t * t * (3 - 2 * t);
    pts.push([Math.round(start[0] + (merge[0] - start[0]) * t + nx * 0 ), Math.round(start[1] + (merge[1] - start[1]) * t), 0]);
    pts[k][2] = +(groundZ(pts[k][0], pts[k][1]) + (9 - groundZ(pts[k][0], pts[k][1])) * e).toFixed(2); }
  // el inicio se engancha a la avenida más cercana (a nivel)
  roads.push({ id: rid++, name: 'Acceso ' + hwyName, kind: 'ramp', pts });
}
for (const [hn, rx, ry, s] of [['I-25',1100,540,1],['I-25',1042,800,-1],['I-25',1030,1000,1],['I-40',800,705,1],['I-40',1150,690,-1],['I-40',1270,730,1]]) rampFrom(hn, ...T(rx, ry), s);

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
