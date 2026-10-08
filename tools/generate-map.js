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

// ---------- río Grande (de norte a sur, cruza la ciudad) ----------
const RIVER = catmull([[4300, 1500], [4500, 3200], [4200, 5200], [4500, 7000], [4250, 8800], [4450, 10400], [4150, 12000], [4400, 13600], [4300, 15200]], 60);
const RIVER_W = 300;

// ---------- zona urbana ----------
const CITY_TOP = 8300;
function cityness(x, y) { return land(x, y) > 0.07 && y > CITY_TOP + (fbm(x / 1500, 3) - 0.5) * 500; }
const DOWNTOWN = [5600, 10700];

// ---------- capas ----------
const BW = Math.ceil(W / BC), BH = Math.ceil(H / BC), HW = Math.ceil(W / HC), HH = Math.ceil(H / HC);
function heightAt(x, y) {
  const l = land(x, y);
  if (l <= 0) return -3 + clamp(l * 40, -1, 0);           // mar
  if (polyDist(x, y, RIVER) < RIVER_W / 2) return -3;
  let h = 0.5 + fbm(x / 1600, y / 1600, 3) * 2;
  if (y < CITY_TOP + 600) {                                 // desierto ondulado
    const k = clamp((CITY_TOP + 600 - y) / 800, 0, 1);
    h += k * fbm(x / 900 + 7, y / 900, 4) * 9;
    // sierra de Sandía al noreste: cresta alta
    const ridge = Math.exp(-Math.pow((x - (9300 + (y - 4500) * 0.12)) / 900, 2)) * clamp((8200 - y) / 1200, 0, 1) * clamp((y - 900) / 900, 0, 1);
    h += ridge * (38 + fbm(x / 400, y / 400, 4) * 22);
    // volcanes del oeste (conos pequeños)
    for (const [vx, vy] of [[1900, 5600], [2400, 6400], [1600, 6900]]) h += Math.max(0, 1 - dist(x, y, vx, vy) / 380) * 22;
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
      else if ((x < 4300 && y > 11800) || (y > 9000 && y < 9600 && x > 4500 && x < 6500)) b = BIOME.INDUSTRIAL;
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
// autopistas
addRoad('I-25', 'hwy', [[5900, 900], [6100, 2600], [5800, 4600], [6000, 6600], [5700, 8400], [5500, 9800], [5450, 11200], [5250, 12800], [5100, 14300]], 70);
addRoad('I-40', 'hwy', [[1250, 9850], [2800, 9900], [4400, 9800], [5500, 9800], [7200, 9700], [8900, 9750], [10700, 9550]], 70);

// avenidas de la ciudad (este-oeste)
const EW = [
  ['Paseo del Norte', 8700], ['Montgomery Blvd', 9300], ['Lomas Blvd', 10250], ['Central Ave (Ruta 66)', 10850],
  ['Gibson Blvd', 11550], ['Rio Bravo Blvd', 12350], ['Valle Sur', 13100]];
for (const [name, y] of EW) {
  const pts = []; for (let x = 0; x <= W; x += 400) pts.push([x, y + (fbm(x / 2500, y / 900) - 0.5) * 260]);
  for (const piece of splitBy(catmull(pts, 70), (x, y) => onLand(x, y))) addRoad(name, 'main', piece, 70);
}
// avenidas norte-sur
const NS = [['Coors Blvd', 2600], ['Rio Grande Blvd', 3700], ['4th Street', 5000], ['San Mateo Blvd', 6600], ['Wyoming Blvd', 7800], ['Tramway Blvd', 9200]];
for (const [name, x] of NS) {
  const pts = []; for (let y = CITY_TOP - 300; y <= H; y += 400) pts.push([x + (fbm(x / 900, y / 2500) - 0.5) * 300, y]);
  for (const piece of splitBy(catmull(pts, 70), (x, y) => onLand(x, y))) addRoad(name, 'main', piece, 70);
}
// calles: cuadrícula algo irregular entre avenidas (no cruzan el río)
const riverOK = (x, y) => polyDist(x, y, RIVER) > RIVER_W / 2 + 160;
let sn = 1;
for (let y = CITY_TOP + 300; y < H; y += 620) {
  if (EW.some(e => Math.abs(e[1] - y) < 260)) continue;
  const pts = []; for (let x = 0; x <= W; x += 450) pts.push([x, y + (fbm(x / 1200, y / 300 + 9) - 0.5) * 120]);
  for (const piece of splitBy(catmull(pts, 70), (x, y) => cityness(x, y) && riverOK(x, y) && land(x, y) > 0.1)) if (piece.length > 6) addRoad('Calle ' + (sn++), 'street', piece, 70);
}
for (let x = 1500; x < W; x += 560) {
  if (NS.some(e => Math.abs(e[1] - x) < 260)) continue;
  const pts = []; for (let y = CITY_TOP; y <= H; y += 450) pts.push([x + (fbm(x / 300 + 4, y / 1200) - 0.5) * 120, y]);
  for (const piece of splitBy(catmull(pts, 70), (x, y) => cityness(x, y) && riverOK(x, y) && land(x, y) > 0.1)) if (piece.length > 6) addRoad('Calle ' + (sn++), 'street', piece, 70);
}
// paseos junto al río (recogen las calles que terminan en la orilla)
for (const side of [-1, 1]) {
  const pts = RIVER.filter(p => p[1] > CITY_TOP).map((p, i, a) => { const q = a[Math.min(a.length - 1, i + 1)], o = a[Math.max(0, i - 1)], ang = Math.atan2(q[1] - o[1], q[0] - o[0]) + Math.PI / 2;
    return [p[0] + Math.cos(ang) * side * (RIVER_W / 2 + 110), p[1] + Math.sin(ang) * side * (RIVER_W / 2 + 110)]; });
  for (const piece of splitBy(pts.filter((p, i) => i % 3 === 0), (x, y) => onLand(x, y) && land(x, y) > 0.06)) addRoad(side < 0 ? 'Paseo del Bosque Oeste' : 'Paseo del Bosque Este', 'street', piece, 70);
}
// desierto: caminos de tierra y vía del tren
addRoad('Camino de la cocina', 'dirt', [[6040, 6200], [7000, 6000], [7900, 5300], [8200, 4700]], 70);
addRoad("Camino de To'hajiilee", 'dirt', [[5850, 4000], [4700, 3900], [3400, 3500], [2300, 2900], [1700, 2500]], 70);
addRoad('Camino del rancho', 'dirt', [[6000, 3000], [7200, 2700], [8000, 2100]], 70);
addRoad('Ruta 66 vieja', 'main', [[2600, 8000], [2500, 6800], [3000, 5600], [3900, 5000], [5900, 4800]], 70);
addRoad('Ferrocarril BNSF', 'rail', [[900, 7300], [3000, 7350], [5200, 7200], [7400, 7350], [9800, 7300], [11100, 7250]], 70);

// ---------- altura de las carreteras ----------
// Las autopistas van elevadas (z=9) por la ciudad y sobre el río; bajan a ras de suelo en el desierto.
// Las avenidas que cruzan el río van en puente.
const groundZ = (x, y) => heightAt(x, y);
for (const r of roads) {
  if (r.kind === 'hwy') {
    for (const p of r.pts) { const urban = p[1] > CITY_TOP - 200 || polyDist(p[0], p[1], RIVER) < RIVER_W; if (urban) p[2] = 9; }
  } else if (r.kind !== 'rail') {
    for (const p of r.pts) if (polyDist(p[0], p[1], RIVER) < RIVER_W / 2 + 60) p[2] = 1;
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
for (const [hn, x, y, s] of [['I-25', 5500, 9300, 1], ['I-25', 5450, 11000, -1], ['I-25', 5300, 12500, 1], ['I-40', 3200, 9850, 1], ['I-40', 7600, 9700, -1], ['I-40', 9300, 9700, 1]]) rampFrom(hn, x, y, s);

// ---------- lugares de la historia ----------
const places = {
  home:{x:7350,y:9050, name:'Casa White', roof:'#c9ab95', wall:'#d9c49c', size:[170,120]},
  jesse:{x:6300,y:11300, name:'Casa de Jesse', roof:'#b8613d', wall:'#efebe2', size:[170,120]},
  jane:{x:6650,y:11350, name:'Apartamento de Jane', roof:'#8a5a3a', wall:'#d8c0a0', size:[150,110]},
  rvlot:{x:3600,y:12500, name:'Autocaravanas', roof:'#6f6f6f', wall:'#aaaaaa'},
  tuco:{x:3300,y:13300, name:'Desguace Salamanca', roof:'#4f4232', wall:'#7a6a55'},
  saul:{x:7900,y:10450, name:'Saul Goodman & Asoc.', roof:'#b39a55', wall:'#e8dcb0'},
  pollos:{x:6900,y:8650, name:'Los Pollos Hermanos', roof:'#e9cba6', wall:'#e2bf98'},
  carwash:{x:8500,y:9350, name:'Lavadero A1A', roof:'#2f74b8', wall:'#d0e4f5'},
  dea:{x:5300,y:10450, name:'DEA / Policía APD', roof:'#2b3a4f', wall:'#8a96a6'},
  hospital:{x:6100,y:10500, name:'Hospital UNM', roof:'#e9e9e9', wall:'#c8d5dd'},
  pawn:{x:3000,y:10900, name:'Casa de Empeños', roof:'#4f7a2e', wall:'#c7b98c'},
  hank:{x:2900,y:9000, name:'Casa de Hank y Marie', roof:'#7a6a5a', wall:'#d9cbb0', size:[170,120]},
  super:{x:6200,y:9400, name:'Supermercado', roof:'#c9c4b8', wall:'#e0d8c8'},
  instituto:{x:7700,y:11500, name:'Instituto J.P. Wynne', roof:'#a85a3a', wall:'#d8b890'},
  almacen:{x:3100,y:12000, name:'Almacén químico', roof:'#6a7078', wall:'#9aa0a8'},
  spooge:{x:2400,y:12600, name:'Casa de Spooge', roof:'#5a4a3a', wall:'#a89070', size:[150,110]},
  lavanderia:{x:4900,y:12200, name:'Lavandería Industrial', roof:'#8a9098', wall:'#c8ccd0'},
  gale:{x:5000,y:9050, name:'Apartamento de Gale', roof:'#6a5a4a', wall:'#d0c0a8', size:[150,110]},
  vamonos:{x:9300,y:11300, name:'Vamonos Pest', roof:'#c8a020', wall:'#d8c8a0'},
  ted:{x:8300,y:12100, name:'Beneke Fabricators', roof:'#7a8088', wall:'#b8bcc0'},
  motel:{x:1900,y:9500, name:'Motel Crossroads', roof:'#a0522d', wall:'#d8b890'},
  residencia:{x:3400,y:10300, name:'Residencia Casa Tranquila', roof:'#b07a5a', wall:'#e0d0b8'},
  gretchen:{x:9800,y:9000, name:'Casa de Gretchen y Elliott', roof:'#4a4a4a', wall:'#e8e4dc', size:[190,130]},
  tren:{x:6400,y:7230, name:'Vías del tren', roof:'#5a4a3a', wall:'#8a7a6a', desert:true},
  hector:{x:7300,y:6050, name:'Casa en el desierto', roof:'#8a6a4a', wall:'#c8a880', size:[150,110], desert:true},
  jack:{x:7400,y:2600, name:'Complejo de Jack', roof:'#5a5040', wall:'#8a7a60', desert:true},
  tohajiilee:{x:2000,y:2700, name:"To'hajiilee", roof:'#9a7a50', wall:'#b89a70', desert:true},
};
const cook = { x: 8150, y: 4500 };
const dealers = [[3500, 9400, 'Camello: Badger'], [7000, 10050, 'Camello: Skinny Pete'], [4800, 12900, 'Camello: Combo']];

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
