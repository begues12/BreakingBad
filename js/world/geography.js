"use strict";
// ======================= GEOGRAFÍA DE ALBUQUERQUE =======================
// Río Grande (de norte a sur, por el oeste del centro)
const RIVER_W = 130*SC;
const RIVER = catmull([[1350,-80],[1500,700],[1750,1400],[1950,2200],[2150,2900],[2250,3500],[2150,4200],[2350,4900],[2500,5700]],10);
function riverDist(x,y){ let m=1e9; for(let i=0;i<RIVER.length-1;i++){ const a=RIVER[i],b=RIVER[i+1]; if(Math.abs(y-a[1])>600&&Math.abs(y-b[1])>600) continue; m=Math.min(m,segDist(x,y,a[0],a[1],b[0],b[1])); } return m; }
function riverX(y){ for(let i=0;i<RIVER.length-1;i++){ const a=RIVER[i],b=RIVER[i+1]; if(y>=a[1]&&y<=b[1]) return a[0]+(b[0]-a[0])*(y-a[1])/((b[1]-a[1])||1); } return 2000*SC; }
function isDesert(x,y){ x/=SC; y/=SC; return (x>3300&&y>3780) || x>6120 || (x<170) || (y>5250&&x>2900); }
function desertness(x,y){
  x/=SC; y/=SC;
  return Math.max(clamp(Math.min(x-3300,y-3780)/260,0,1), clamp((x-6120)/200,0,1), clamp((170-x)/150,0,1), clamp(Math.min(y-5250,x-2900)/200,0,1));
}

// --- carreteras ---
const RW = {hwy:255, main:186, street:138, dirt:114};
const RDEF = [];
// comprueba que una calle nueva no se monte sobre otra (paralelas pegadas, cruces muy oblicuos, bucles o el río)
function roadOK(pts,kind){
  const w=RW[kind]/SC;
  for(const p of pts){ if(p[0]<80||p[1]<80||p[0]>6320||p[1]>5520) return false; if(riverDist(p[0],p[1])<65+w/2+40) return false; }
  for(let i=0;i<pts.length;i++) for(let j=i+14;j<pts.length;j++) if(dist(pts[i][0],pts[i][1],pts[j][0],pts[j][1])<w*1.4) return false;
  for(let i=1;i<pts.length-1;i+=2){
    const p=pts[i], dx=pts[i+1][0]-pts[i-1][0], dy=pts[i+1][1]-pts[i-1][1], dl=Math.hypot(dx,dy)||1;
    for(const o of RDEF){ const wo=RW[o.kind]/SC, lim=(w+wo)/2+70;
      for(let k=0;k<o.pts.length-1;k++){ const a=o.pts[k], b=o.pts[k+1];
        if(Math.abs(p[0]-a[0])>lim+300&&Math.abs(p[0]-b[0])>lim+300) continue;
        if(Math.abs(p[1]-a[1])>lim+300&&Math.abs(p[1]-b[1])>lim+300) continue;
        if(segDist(p[0],p[1],a[0],a[1],b[0],b[1])>=lim) continue;
        const ex=b[0]-a[0], ey=b[1]-a[1], el=Math.hypot(ex,ey)||1;
        if(Math.abs(dx*ey-dy*ex)/(dl*el)<0.7) return false;
      } }
  }
  return true;
}
const RING=150; // la circunvalación va a esta distancia del borde (unidades de diseño)
function road(name,kind,pts,sub,check){
  const m=kind==='hwy'?0:-14;
  pts=pts.map(p=>[clamp(p[0],RING+m,6400-RING-m),clamp(p[1],RING+m,5600-RING-m)]);
  const d=catmull(pts,sub||8);
  if(check && !roadOK(d,kind)) return false;
  RDEF.push({name,kind,pts:d}); return true;
}
(function(){ // circunvalación con esquinas redondeadas
  const x0=RING,y0=RING,x1=6400-RING,y1=5600-RING,rc=420, pts=[];
  const arc=(cx,cy,a0)=>{ for(let k=0;k<=8;k++){ const a=a0+k/8*Math.PI/2; pts.push([cx+Math.cos(a)*rc,cy+Math.sin(a)*rc]); } };
  pts.push([x0+rc,y0]); pts.push([x1-rc,y0]); arc(x1-rc,y0+rc,-Math.PI/2); pts.push([x1,y1-rc]); arc(x1-rc,y1-rc,0);
  pts.push([x0+rc,y1]); arc(x0+rc,y1-rc,Math.PI/2); pts.push([x0,y0+rc]); arc(x0+rc,y0+rc,Math.PI); pts.push([x0+rc+1,y0]);
  // tramos rectos densos para que los cruces se detecten bien
  const dense=[]; for(let i=0;i<pts.length-1;i++){ const a=pts[i],b=pts[i+1],n=Math.max(1,Math.ceil(dist(a[0],a[1],b[0],b[1])/120)); for(let k=0;k<n;k++) dense.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]); }
  dense.push(pts[pts.length-1]);
  RDEF.push({name:'Circunvalación','kind':'main',pts:dense});
})();
road('I-25','hwy',[[3520,-80],[3480,1200],[3380,2300],[3300,2650],[3180,3400],[3020,4200],[2780,5000],[2660,5700]]);
road('I-40','hwy',[[-80,2330],[900,2440],[1700,2560],[2600,2620],[3300,2650],[4300,2600],[5300,2500],[6480,2340]]);
road('Central Ave (Ruta 66)','main',[[-80,3150],[1200,3200],[2200,3215],[2900,3110],[3700,3150],[5000,3120],[6480,3060]]);
road('Paseo del Norte','main',[[230,820],[1000,900],[1600,950],[2600,860],[3500,800],[4600,760],[6000,700]]);
road('Montaño','main',[[1040,1650],[1800,1720],[2600,1660],[3480,1600]]);
road('Coors Blvd','main',[[880,-80],[1050,800],[1200,1600],[1350,2450],[1450,3200],[1520,4000],[1720,4800],[1900,5700]]);
road('Unser Blvd','main',[[300,430],[350,1500],[450,2400],[520,3200],[650,4300],[760,4700]]);
road('Tramway','main',[[5980,240],[6060,1500],[5960,2600],[5800,3200],[5600,3700]]);
road('Gibson Blvd','main',[[2900,3700],[3900,3780],[4700,4000]]);
road('Rio Bravo','main',[[1500,4400],[2150,4380],[2700,4350],[3060,4330]]);
road('Lomas Blvd','main',[[2700,2860],[3500,2900],[4500,2880],[5800,2850]]);
road('Montgomery Blvd','main',[[3420,1960],[4500,1990],[5900,1950]]);
road('Camino del desierto','dirt',[[4640,3985],[5100,4300],[5350,4650],[5550,5200],[5700,5650]]);
road('Rio Grande Blvd','street',[[2000,540],[2150,1400],[2380,2200],[2520,2900],[2560,3240]]);
road('Isleta Blvd','street',[[2420,3140],[2470,4000],[2560,4800],[2620,5700]]);
road('4th Street','street',[[2700,540],[2760,1400],[2860,2250],[2880,2700]],8,true);
road('Academy Rd','street',[[3460,1250],[4400,1220],[5300,1180],[6010,1150]],6,true);
// Downtown: dos calles que cruzan Central y Lomas
road('Downtown 1st','street',[[2760,2600],[2770,2990],[2780,3420]],4,true);
road('Downtown 3rd','street',[[3010,2690],[3020,2990],[3030,3380]],4,true);
// NE Heights: calles irregulares (no una cuadrícula perfecta)
for(let i=0;i<5;i++){
  const bx=3800+i*430; const pts=[];
  for(let y=300+sr(0,250); y<3700; y+=sr(330,470)) pts.push([bx+sr(-50,50)+y*0.03, y]);
  if(pts.length>2) road('Calle NE '+(i+1),'street',pts,6,true);
}
for(let j=0;j<4;j++){
  const by=[420,2280,3380,1600][j]+sr(-30,30); const pts=[];
  for(let x=3560+sr(0,120); x<5900; x+=sr(380,520)) pts.push([x, by+sr(-40,40)+x*0.02]);
  if(pts.length>2) road('Avenida NE '+(j+1),'street',pts,6,true);
}
// Westside: calles residenciales curvas (se descartan las que se pisan con otras)
for(let k=0,ok=0;k<90&&ok<16;k++){
  let x=sr(250,1500), y=sr(300,5100), a=sr(0,Math.PI*2); const pts=[[x,y]];
  for(let i=0;i<6;i++){
    a+=sr(-0.45,0.45); x+=Math.cos(a)*sr(230,320); y+=Math.sin(a)*sr(230,320);
    if(x<200||y<150||y>5450||x>riverX(y)-220) break;
    pts.push([x,y]);
  }
  if(pts.length>=3 && road('Calle residencial '+(ok+1),'street',pts,6,true)) ok++;
}
// South Valley / Barelas
for(let k=0,ok=0;k<40&&ok<6;k++){
  let x=sr(2350,2900), y=sr(3300,5200), a=sr(0,Math.PI*2); const pts=[[x,y]];
  for(let i=0;i<5;i++){ a+=sr(-0.5,0.5); x+=Math.cos(a)*sr(200,260); y+=Math.sin(a)*sr(200,260);
    if(x<riverX(y)+220||x>3000||y<3250||y>5450) break; pts.push([x,y]); }
  if(pts.length>=3 && road('Calle del valle '+(ok+1),'street',pts,6,true)) ok++;
}
// enlazar finales de calle sueltos con la calle más cercana que tengan delante
function onOtherRoad(p,self){
  for(const o of RDEF){ if(o===self) continue; if(self.kind!=='hwy' && o.kind==='hwy') continue; if(self.kind==='hwy' && o.kind!=='hwy' && o.name!=='Circunvalación') continue; const wo=RW[o.kind]/SC/2;
    for(let k=0;k<o.pts.length-1;k++){ const a=o.pts[k],b=o.pts[k+1]; if(segDist(p[0],p[1],a[0],a[1],b[0],b[1])<wo) return true; } }
  return false;
}
for(const r of RDEF){
  if(r.name==='Circunvalación') continue;
  for(const end of [0,1]){
    const P=end?r.pts[r.pts.length-1]:r.pts[0], Q=end?r.pts[r.pts.length-4]||r.pts[0]:r.pts[3]||r.pts[r.pts.length-1];
    if(onOtherRoad(P,r)) continue;
    const dx=P[0]-Q[0], dy=P[1]-Q[1], dl=Math.hypot(dx,dy)||1, ux=dx/dl, uy=dy/dl;
    let best=null, bd=900;
    for(const o of RDEF){ if(o===r) continue; if(r.kind==='hwy'?o.kind!=='hwy'&&o.name!=='Circunvalación':o.kind==='hwy') continue;
      for(let k=0;k<o.pts.length-1;k++){ const a=o.pts[k],b=o.pts[k+1];
        const ex=b[0]-a[0], ey=b[1]-a[1], l2=ex*ex+ey*ey||1, t=clamp(((P[0]-a[0])*ex+(P[1]-a[1])*ey)/l2,0,1);
        const cx=a[0]+ex*t, cy=a[1]+ey*t, d=dist(P[0],P[1],cx,cy);
        if(d>=bd||d<1) continue;
        if(((cx-P[0])*ux+(cy-P[1])*uy)/d<0.45) continue;               // tiene que estar más o menos delante
        let wet=false; for(let q=0;q<=10;q++){ if(riverDist(P[0]+(cx-P[0])*q/10,P[1]+(cy-P[1])*q/10)<90){ wet=true; break; } }
        if(wet) continue;
        bd=d; best=[cx,cy];
      } }
    if(!best) continue;
    const d=dist(P[0],P[1],best[0],best[1]), vx=(best[0]-P[0])/d, vy=(best[1]-P[1])/d;
    const add=[]; const n=Math.max(1,Math.ceil(d/100));
    for(let k=1;k<=n;k++) add.push([P[0]+vx*d*k/n,P[1]+vy*d*k/n]);
    add.push([best[0]+vx*12,best[1]+vy*12]); // un poco más allá del eje para que se detecte el cruce
    if(end) r.pts.push(...add); else r.pts.unshift(...add.reverse());
  }
}
// escalar todo al tamaño del mundo
for(const r of RDEF) r.pts=r.pts.map(p=>[p[0]*SC,p[1]*SC]);
for(const p of RIVER){ p[0]*=SC; p[1]*=SC; }

const ROADS = RDEF.map((r,idx)=>{
  const w=RW[r.kind]; const cum=[0];
  for(let i=1;i<r.pts.length;i++) cum.push(cum[i-1]+dist(r.pts[i-1][0],r.pts[i-1][1],r.pts[i][0],r.pts[i][1]));
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; for(const p of r.pts){ x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1]); }
  const path=new Path2D(); r.pts.forEach((p,i)=>i?path.lineTo(p[0],p[1]):path.moveTo(p[0],p[1]));
  return {idx,name:r.name,kind:r.kind,pts:r.pts,w,cum,len:cum[cum.length-1],path,bb:[x0-w,y0-w,x1+w,y1+w],cross:[],lane:r.kind==='hwy'?w*0.25:w*0.24};
});
function pointAt(r,s){
  s=clamp(s,0,r.len); let lo=0,hi=r.cum.length-1;
  while(hi-lo>1){ const m=(lo+hi)>>1; if(r.cum[m]<=s) lo=m; else hi=m; }
  const a=r.pts[lo], b=r.pts[hi], L=(r.cum[hi]-r.cum[lo])||1, t=(s-r.cum[lo])/L;
  return {x:a[0]+(b[0]-a[0])*t, y:a[1]+(b[1]-a[1])*t, a:Math.atan2(b[1]-a[1],b[0]-a[0])};
}
// rejilla espacial de segmentos
const SEGC=160, SEGGRID=new Map();
const SEGS=[];
for(const r of ROADS) for(let i=0;i<r.pts.length-1;i++){
  const a=r.pts[i], b=r.pts[i+1];
  const sg={x1:a[0],y1:a[1],x2:b[0],y2:b[1],w:r.w,r,i,s0:r.cum[i]}; SEGS.push(sg);
  const pad=r.w/2+40;
  for(let cx=Math.floor((Math.min(a[0],b[0])-pad)/SEGC); cx<=Math.floor((Math.max(a[0],b[0])+pad)/SEGC); cx++)
  for(let cy=Math.floor((Math.min(a[1],b[1])-pad)/SEGC); cy<=Math.floor((Math.max(a[1],b[1])+pad)/SEGC); cy++){
    const k=cx*10000+cy; if(!SEGGRID.has(k)) SEGGRID.set(k,[]); SEGGRID.get(k).push(sg);
  }
}
function segsAt(x,y){ return SEGGRID.get(Math.floor(x/SEGC)*10000+Math.floor(y/SEGC))||[]; }
function roadAt(x,y,pad){ pad=pad||0; for(const s of segsAt(x,y)) if(segDist(x,y,s.x1,s.y1,s.x2,s.y2)<s.w/2+pad) return s; return null; }
// información de autopista en un punto: ¿sobre la calzada? y altura del puente (0..1)
function hwyInfo(x,y){
  let on=false, f=0;
  for(const sg of segsAt(x,y)){ if(sg.r.kind!=='hwy') continue; const d=segDist(x,y,sg.x1,sg.y1,sg.x2,sg.y2);
    if(d<sg.w/2) on=true;
    if(d<sg.w/2+80 && typeof liftF==='function'){ const dx=sg.x2-sg.x1, dy=sg.y2-sg.y1, l=Math.hypot(dx,dy)||1;
      const sv=sg.s0+clamp(((x-sg.x1)*dx+(y-sg.y1)*dy)/(l*l),0,1)*l; f=Math.max(f,liftF(sg.r,sv)); } }
  return {on,f};
}
// accesos a la autopista: extremos, enlaces a nivel y calles que desembocan en ella.
// En el resto del trazado hay quitamiedos: no se puede subir ni bajar por el lateral.
let HWY_GATES=null;
function hwyGates(){
  if(HWY_GATES) return HWY_GATES; HWY_GATES=[];
  for(const r of ROADS) if(r.kind==='hwy') for(const p of [r.pts[0],r.pts[r.pts.length-1]]) HWY_GATES.push([p[0],p[1],r.w+60]);
  for(const c of CROSSINGS) if(c.level && (c.a.kind==='hwy'||c.b.kind==='hwy')) HWY_GATES.push([c.x,c.y,c.w+60]);
  for(const r of ROADS) if(r.kind!=='hwy') for(const p of [r.pts[0],r.pts[r.pts.length-1]]){
    const h=hwyInfo(p[0],p[1]); if(h.on && h.f<0.03) HWY_GATES.push([p[0],p[1],r.w+50]); }
  return HWY_GATES;
}
function nearHwyGate(x,y){ return hwyGates().some(g=>Math.abs(x-g[0])<g[2]&&Math.abs(y-g[1])<g[2]&&dist(x,y,g[0],g[1])<g[2]); }
// nivel: 0 = calle/suelo, 1 = autopista. Solo se cambia en los accesos y a ras de suelo.
function layerAt(x,y,prev){
  const h=hwyInfo(x,y);
  if(prev===undefined) return h.on?1:0;
  if(prev===1) return (!h.on && h.f<0.12 && nearHwyGate(x,y)) ? 0 : 1;
  return (h.on && h.f<0.03 && nearHwyGate(x,y)) ? 1 : 0;
}
// ¿posición prohibida para ese nivel? (atravesar quitamiedos o pretiles)
function hwyBlocked(x,y,layer){
  const h=hwyInfo(x,y);
  if(layer===1) return !h.on && (h.f>=0.12 || !nearHwyGate(x,y));
  return h.on && h.f<0.12 && !nearHwyGate(x,y);   // bajo el tablero (f alto) sí se puede pasar
}
function isRoad(x,y){ if(x<0||y<0||x>WW||y>WH) return false; return !!roadAt(x,y,0); }
function nearestRoad(x,y,filter){
  let best=null,bd=1e9;
  for(const s of SEGS){ if(filter&&!filter(s.r)) continue; const d=segDist(x,y,s.x1,s.y1,s.x2,s.y2); if(d<bd){bd=d;best=s;} }
  const dx=best.x2-best.x1, dy=best.y2-best.y1, l=dx*dx+dy*dy; const t=clamp(((x-best.x1)*dx+(y-best.y1)*dy)/l,0,1);
  return {seg:best, r:best.r, x:best.x1+dx*t, y:best.y1+dy*t, s:best.s0+Math.sqrt(l)*t, a:Math.atan2(dy,dx), d:bd};
}
// cruces entre carreteras
const CROSSINGS=[];
(function(){
  const seen=new Set();
  for(const [k,list] of SEGGRID) for(let i=0;i<list.length;i++) for(let j=i+1;j<list.length;j++){
    const A=list[i], Bs=list[j]; if(A.r===Bs.r) continue;
    const key=SEGS.indexOf(A)+'_'+SEGS.indexOf(Bs); if(seen.has(key)) continue; seen.add(key);
    const d1x=A.x2-A.x1,d1y=A.y2-A.y1,d2x=Bs.x2-Bs.x1,d2y=Bs.y2-Bs.y1, den=d1x*d2y-d1y*d2x; if(Math.abs(den)<1e-6) continue;
    const t=((Bs.x1-A.x1)*d2y-(Bs.y1-A.y1)*d2x)/den, u=((Bs.x1-A.x1)*d1y-(Bs.y1-A.y1)*d1x)/den;
    if(t<0||t>1||u<0||u>1) continue;
    const x=A.x1+t*d1x, y=A.y1+t*d1y;
    if(CROSSINGS.some(c=>dist(c.x,c.y,x,y)<20)) continue;
    const id=CROSSINGS.length, sa=A.s0+Math.hypot(d1x,d1y)*t, sb=Bs.s0+Math.hypot(d2x,d2y)*u;
    const level=(A.r.kind==='hwy')===(Bs.r.kind==='hwy') || A.r.name==='Circunvalación' || Bs.r.name==='Circunvalación'; // calle bajo autopista = paso elevado; la circunvalación enlaza a nivel
    CROSSINGS.push({id,x,y,a:A.r,b:Bs.r,level,w:Math.max(A.r.w,Bs.r.w),sa,sb});
    if(level){ A.r.cross.push({id,s:sa,other:Bs.r.idx,os:sb}); Bs.r.cross.push({id,s:sb,other:A.r.idx,os:sa}); }
  }
})();

// --- Lugares de la historia (se colocan junto a la calle más cercana) ---
const LOC = {
  home:    {tx:4520,ty:1830, name:'Casa White',            roof:'#c9ab95', wall:'#d9c49c', size:[170,120]},
  jesse:   {tx:4250,ty:3330, name:'Casa de Jesse',         roof:'#b8613d', wall:'#efebe2', size:[170,120]},
  rvlot:   {tx:2650,ty:3900, name:'Autocaravanas',         roof:'#6f6f6f', wall:'#aaa'},
  tuco:    {tx:2720,ty:4520, name:'Desguace Salamanca',    roof:'#4f4232', wall:'#7a6a55'},
  saul:    {tx:4950,ty:2960, name:'Saul Goodman & Asoc.',  roof:'#b39a55', wall:'#e8dcb0'},
  pollos:  {tx:3800,ty:1080, name:'Los Pollos Hermanos',   roof:'#e9cba6', wall:'#e2bf98'},
  carwash: {tx:5150,ty:1300, name:'Lavadero A1A',          roof:'#2f74b8', wall:'#d0e4f5'},
  dea:     {tx:3060,ty:2960, name:'DEA / Policía APD',     roof:'#2b3a4f', wall:'#8a96a6'},
  hospital:{tx:3650,ty:3320, name:'Hospital UNM',          roof:'#e9e9e9', wall:'#c8d5dd'},
  pawn:    {tx:1250,ty:2900, name:'Casa de Empeños',       roof:'#4f7a2e', wall:'#c7b98c'},
  // --- lugares de las misiones (temporadas 1-5) ---
  jane:    {tx:4520,ty:3330, name:'Apartamento de Jane',   roof:'#8a5a3a', wall:'#d8c0a0', size:[150,110]},
  hank:    {tx:2500,ty:760,  name:'Casa de Hank y Marie',  roof:'#7a6a5a', wall:'#d9cbb0', size:[170,120]},
  super:   {tx:2350,ty:1600, name:'Supermercado',          roof:'#c9c4b8', wall:'#e0d8c8'},
  instituto:{tx:3250,ty:1650,name:'Instituto J.P. Wynne',  roof:'#a85a3a', wall:'#d8b890'},
  almacen: {tx:1000,ty:4300, name:'Almacén químico',       roof:'#6a7078', wall:'#9aa0a8'},
  spooge:  {tx:600, ty:3800, name:'Casa de Spooge',        roof:'#5a4a3a', wall:'#a89070', size:[150,110]},
  lavanderia:{tx:2150,ty:3650,name:'Lavandería Industrial',roof:'#8a9098', wall:'#c8ccd0'},
  gale:    {tx:3300,ty:620,  name:'Apartamento de Gale',   roof:'#6a5a4a', wall:'#d0c0a8', size:[150,110]},
  vamonos: {tx:5500,ty:3300, name:'Vamonos Pest',          roof:'#c8a020', wall:'#d8c8a0'},
  ted:     {tx:4050,ty:2150, name:'Beneke Fabricators',    roof:'#7a8088', wall:'#b8bcc0'},
  motel:   {tx:600, ty:1400, name:'Motel Crossroads',      roof:'#a0522d', wall:'#d8b890'},
  residencia:{tx:1300,ty:2050,name:'Residencia Casa Tranquila',roof:'#b07a5a', wall:'#e0d0b8'},
  gretchen:{tx:5550,ty:700,  name:'Casa de Gretchen y Elliott',roof:'#4a4a4a', wall:'#e8e4dc', size:[190,130]},
  tren:    {tx:300, ty:2400, name:'Vías del tren',         roof:'#5a4a3a', wall:'#8a7a6a'},
  hector:  {tx:4550,ty:4100, name:'Casa en el desierto',   roof:'#8a6a4a', wall:'#c8a880', size:[150,110]},
  jack:    {tx:4850,ty:4150, name:'Complejo de Jack',      roof:'#5a5040', wall:'#8a7a60'},
  tohajiilee:{tx:5500,ty:5130,name:"To'hajiilee",          roof:'#9a7a50', wall:'#b89a70'},
};
const solids = [];   // {x,y,w,h,roof,wall,name,kind}
const RESERVED = [];
const LOTS = [];
function placeLoc(L,tx,ty){
  const nr=nearestRoad(tx,ty,r=>r.kind==='main'||r.kind==='street');
  let nx=tx-nr.x, ny=ty-nr.y, nl=Math.hypot(nx,ny);
  if(nl<1){ nx=Math.cos(nr.a+Math.PI/2); ny=Math.sin(nr.a+Math.PI/2); nl=1; }
  nx/=nl; ny/=nl;
  const hw=nr.r.w/2, o={};
  o.x=nr.x+nx*(hw+50); o.y=nr.y+ny*(hw+50);
  o.parkX=o.x+Math.cos(nr.a)*75; o.parkY=o.y+Math.sin(nr.a)*75; o.parkA=nr.a;
  const sz=L.size||[230,150], horiz=Math.abs(nx)>Math.abs(ny);
  const bw=horiz?sz[1]:sz[0], bh=horiz?sz[0]:sz[1], D=hw+50+40+(horiz?bw:bh)/2;
  o.bx=nr.x+nx*D-bw/2; o.by=nr.y+ny*D-bh/2; o.bw=bw; o.bh=bh;
  // validar: edificio fuera de calles/río, parking y entrada libres
  for(let i=0;i<=6;i++) for(let j=0;j<=6;j++){ const x=o.bx-10+(bw+20)*i/6, y=o.by-10+(bh+20)*j/6;
    if(roadAt(x,y,4)||riverDist(x,y)<RIVER_W/2+40||isDesert(x,y)) return null; }
  for(const [x,y] of [[o.x,o.y],[o.parkX,o.parkY]]) if(riverDist(x,y)<RIVER_W/2+40) return null;
  if(roadAt(o.parkX,o.parkY,-nr.r.w/2+20)&&roadAt(o.parkX,o.parkY,0)&&roadAt(o.parkX,o.parkY,0).r!==nr.r) return null;
  for(const r of RESERVED) if(o.bx-30<r[2]&&o.bx+bw+30>r[0]&&o.by-30<r[3]&&o.by+bh+30>r[1]) return null;
  for(const [x,y] of [[o.x,o.y],[o.parkX,o.parkY]]){
    if(x>o.bx-30&&x<o.bx+bw+30&&y>o.by-30&&y<o.by+bh+30) return null;
    for(const q of solids) if(x>q.x-30&&x<q.x+q.w+30&&y>q.y-30&&y<q.y+q.h+30) return null;
    for(const r of RESERVED) if(x>r[0]-20&&x<r[2]+20&&y>r[1]-20&&y<r[3]+20) return null;
  }
  return o;
}
for(const k in LOC){
  const L=LOC[k]; L.key=k; L.tx*=SC; L.ty*=SC; let o=null;
  const sizes=[L.size||[230,150],[180,130],[150,110]];
  for(const sz of sizes){ if(o) break; const keep=L.size; L.size=sz;
    for(let rad=0;rad<1400&&!o;rad+=40) for(let a=0;a<6.28&&!o;a+=rad?0.4:7) o=placeLoc(L,L.tx+Math.cos(a)*rad,L.ty+Math.sin(a)*rad);
    if(!o) L.size=keep; }
  if(!o){ console.warn('no se pudo colocar',k); o=placeLoc(L,L.tx,L.ty)||{x:L.tx,y:L.ty,parkX:L.tx+60,parkY:L.ty,parkA:0,bx:L.tx-60,by:L.ty+60,bw:120,bh:90}; }
  Object.assign(L,o);
  solids.push({x:L.bx,y:L.by,w:L.bw,h:L.bh,roof:L.roof,wall:L.wall,name:L.name,key:k,kind:'special',seed:srand()});
  const lx0=Math.min(L.x-80,L.parkX-50,L.bx-20), ly0=Math.min(L.y-80,L.parkY-50,L.by-20), lx1=Math.max(L.x+80,L.parkX+50,L.bx+L.bw+20), ly1=Math.max(L.y+80,L.parkY+50,L.by+L.bh+20);
  RESERVED.push([lx0,ly0,lx1,ly1]);
  LOTS.push({x:Math.min(L.x-70,L.bx-12),y:Math.min(L.y-70,L.by-12),x2:Math.max(L.x+70,L.bx+L.bw+12),y2:Math.max(L.y+70,L.by+L.bh+12),house:!!L.size,pool:k==='home',L});
}
const DESERT = {key:'desert', name:'Desierto (cocina)', x:5330*SC, y:4660*SC};
LOC.desert = DESERT;
RESERVED.push([DESERT.x-260,DESERT.y-260,DESERT.x+260,DESERT.y+260]);
const DEALERS = [[1000,1300,'Camello: Badger'],[4330,2330,'Camello: Skinny Pete'],[2480,4200,'Camello: Combo']].map(([x,y,name])=>{
  x*=SC; y*=SC;
  const nr=nearestRoad(x,y,r=>r.kind!=='hwy'&&r.kind!=='dirt'); const n=nr.a+Math.PI/2;
  return {x:nr.x+Math.cos(n)*(nr.r.w/2+SIDEWALK*0.6), y:nr.y+Math.sin(n)*(nr.r.w/2+SIDEWALK*0.6), name};
});
for(const d of DEALERS) RESERVED.push([d.x-30,d.y-30,d.x+30,d.y+30]);

// --- rejilla espacial de sólidos ---
const SOLC=200, SOLGRID=new Map();
function addSolid(s){
  for(let cx=Math.floor(s.x/SOLC); cx<=Math.floor((s.x+s.w)/SOLC); cx++)
  for(let cy=Math.floor(s.y/SOLC); cy<=Math.floor((s.y+s.h)/SOLC); cy++){
    const k=cx*10000+cy; if(!SOLGRID.has(k)) SOLGRID.set(k,[]); SOLGRID.get(k).push(s);
  }
}
let qStamp=0;
function solidsIn(x0,y0,x1,y1){
  qStamp++; const out=[];
  for(let cx=Math.floor(x0/SOLC); cx<=Math.floor(x1/SOLC); cx++)
  for(let cy=Math.floor(y0/SOLC); cy<=Math.floor(y1/SOLC); cy++){
    const l=SOLGRID.get(cx*10000+cy); if(!l) continue;
    for(const s of l) if(s._q!==qStamp){ s._q=qStamp; out.push(s); }
  }
  return out;
}
solids.forEach(addSolid);

// --- edificios a lo largo de las calles ---
const ROOFS = ['#7d6a55','#8a7a66','#6e6258','#9b8467','#a08c70','#6b5f52','#857565','#5f5a55','#a56b4a','#b9a27f'];
const WALLS = ['#d9c7a3','#cdb58f','#e0cfae','#c9b089','#d7c2a0','#bfae8f','#e4c9a8'];
const ADOBE = ['#c99a6b','#d4a77a','#b9835a','#dcb48a','#c48d64','#e0bf98','#a8744d','#d9b28f','#cfa27e'];
const TRIMS = ['#2f6f8f','#3b7a57','#8a3b2b','#e8dcc0','#5a4636','#2e5a7a'];
function density(x,y){
  if(isDesert(x,y)) return 0;
  const dt=dist(x,y,2900*SC,3000*SC); if(dt<420*SC) return 0.95;
  if(x>3450*SC && y<3750*SC) return 0.85;          // NE Heights
  if(x<riverX(y)) return 0.6;                // Westside
  if(y>3300*SC) return 0.45;                    // South Valley
  return 0.7;
}
function canPlace(x,y,w,h){
  if(x<20||y<20||x+w>WW-20||y+h>WH-20) return false;
  for(const r of RESERVED) if(x<r[2]&&x+w>r[0]&&y<r[3]&&y+h>r[1]) return false;
  for(let i=0;i<=4;i++) for(let j=0;j<=4;j++){
    const px=x+w*i/4, py=y+h*j/4;
    if(roadAt(px,py,12)) return false;
    if(riverDist(px,py)<RIVER_W/2+60) return false;
  }
  for(const s of solidsIn(x-8,y-8,x+w+8,y+h+8)) if(x-8<s.x+s.w&&x+w+8>s.x&&y-8<s.y+s.h&&y+h+8>s.y) return false;
  return true;
}
for(const r of ROADS){
  if(r.kind==='hwy'||r.kind==='dirt') continue;
  for(const side of [1,-1]){
    let s=20;
    while(s<r.len-20){
      const p=pointAt(r,s), n=p.a+Math.PI/2*side, nx=Math.cos(n), ny=Math.sin(n);
      const dens=density(p.x,p.y);
      const big=r.kind==='main' || dist(p.x,p.y,2900*SC,3000*SC)<420*SC;
      let step=50;
      for(let layer=0;layer<3;layer++){
        if(srand()>dens) continue;
        const bw=big&&layer===0?sr(70,140):sr(42,70), bh=big&&layer===0?sr(60,120):sr(40,64);
        const off=r.w/2+SIDEWALK+8+layer*95+Math.max(bw,bh)/2;
        const cx=p.x+nx*off, cy=p.y+ny*off;
        if(canPlace(cx-bw/2,cy-bh/2,bw,bh)){
          const house=!(big&&layer===0);
          const downtown=dist(cx,cy,2900*SC,3000*SC)<360*SC && !house;
          const s2={x:cx-bw/2,y:cy-bh/2,w:bw,h:bh,kind:'bld',seed:srand(),house,tall:downtown,
            roof:house?(srand()<0.35?'pitched':'flat'):'comm', // 'comm' puede convertirse en teja en el render
            wall:house?ADOBE[(srand()*ADOBE.length)|0]:WALLS[(srand()*WALLS.length)|0],
            trim:TRIMS[(srand()*TRIMS.length)|0],
            fx:-nx, fy:-ny, toRoad:off-r.w/2, layer,
            pool:house&&layer===0&&srand()<0.22, cooler:srand()<0.6, yard:srand()<0.3?'grass':'gravel'};
          solids.push(s2); addSolid(s2);
          if(layer===0) step=Math.max(bw,bh)+sr(14,40);
        }
      }
      s+=step;
    }
  }
}
// árboles decorativos: bosque del río y jardines
const TREES=[];
{ // álamos (cottonwoods) sin hojas en el jardín delantero de Jesse
  const L=LOC.jesse, bcx=L.bx+L.bw/2, bcy=L.by+L.bh/2;
  for(const f of [0.45,0.7]) TREES.push({x:bcx+(L.x-bcx)*f+(f-.55)*90, y:bcy+(L.y-bcy)*f-(f-.55)*90, r:30, c:0.5, bare:true}); }
for(let i=0;i<4000;i++){
  const y=sr(0,WH), side=srand()<.5?-1:1, x=riverX(y)+side*sr(RIVER_W/2+15,370);
  if(roadAt(x,y,8)) continue; TREES.push({x,y,r:sr(10,20),c:srand()});
}
for(let i=0;i<5000;i++){
  const x=sr(150,WW-300), y=sr(100,WH-200); if(density(x,y)===0||roadAt(x,y,10)||riverDist(x,y)<RIVER_W/2+10) continue;
  if(solidsIn(x-12,y-12,x+12,y+12).some(s=>x+10>s.x&&x-10<s.x+s.w&&y+10>s.y&&y-10<s.y+s.h)) continue;
  TREES.push({x,y,r:sr(7,14),c:srand()});
}
// desierto: rocas, cactus, mesas y la sierra de Sandía al este
const decoDesert = [];
for(let i=0;i<1100;i++){
  const x=sr(100,WW-60), y=sr(60,WH-60);
  if(!isDesert(x,y)||roadAt(x,y,40)) continue;
  if(dist(x,y,DESERT.x,DESERT.y)<280) continue;
  const mount = x>6150*SC;
  if(mount||srand()<0.1){
    const w=mount?sr(120,260):sr(110,220),h=mount?sr(120,300):sr(70,150);
    if(!canPlaceRock(x-w/2,y-h/2,w,h)) continue;
    const s={x:x-w/2,y:y-h/2,w,h,roof:mount?'#8a6a55':'#a5502e',wall:mount?'#5e4636':'#7b3a20',kind:'mesa',seed:srand()}; solids.push(s); addSolid(s);
  } else if(srand()<0.45){
    const s={x:x-9,y:y-9,w:18,h:18,roof:'#4c7a3a',wall:'#355a28',kind:'cactus',seed:srand()}; solids.push(s); addSolid(s);
  } else decoDesert.push({x,y,r:6+srand()*14,c:srand()});
}
function canPlaceRock(x,y,w,h){
  for(let i=0;i<=4;i++) for(let j=0;j<=4;j++) if(roadAt(x+w*i/4,y+h*j/4,30)) return false;
  return !solidsIn(x,y,x+w,y+h).some(s=>x<s.x+s.w&&x+w>s.x&&y<s.y+s.h&&y+h>s.y);
}

function inWater(x,y){ return riverDist(x,y)<RIVER_W/2 && !isRoad(x,y); }
function hitSolid(x,y,r){
  for(const s of solidsIn(x-r,y-r,x+r,y+r)){
    if(x+r<s.x||x-r>s.x+s.w||y+r<s.y||y-r>s.y+s.h) continue;
    const cx=clamp(x,s.x,s.x+s.w), cy=clamp(y,s.y,s.y+s.h);
    if((x-cx)**2+(y-cy)**2<r*r) return s;
  }
  return null;
}
function resolve(o,r){ // empuja círculo fuera de los sólidos; devuelve true si chocó
  let hit=false;
  for(const s of solidsIn(o.x-r,o.y-r,o.x+r,o.y+r)){
    if(o.x+r<s.x||o.x-r>s.x+s.w||o.y+r<s.y||o.y-r>s.y+s.h) continue;
    const cx=clamp(o.x,s.x,s.x+s.w), cy=clamp(o.y,s.y,s.y+s.h);
    let dx=o.x-cx, dy=o.y-cy, d=Math.hypot(dx,dy);
    if(d<r){
      hit=true;
      if(d<0.001){
        const l=o.x-s.x, rr=s.x+s.w-o.x, t=o.y-s.y, b=s.y+s.h-o.y, m=Math.min(l,rr,t,b);
        if(m===l)o.x=s.x-r; else if(m===rr)o.x=s.x+s.w+r; else if(m===t)o.y=s.y-r; else o.y=s.y+s.h+r;
      } else { o.x=cx+dx/d*r; o.y=cy+dy/d*r; }
    }
  }
  // río (solo se cruza por los puentes) y bordes del mundo
  if(inWater(o.x,o.y)){ if(o._px!==undefined){ o.x=o._px; o.y=o._py; } hit=true; }
  if(o.x<r||o.y<r||o.x>WW-r||o.y>WH-r){ o.x=clamp(o.x,r,WW-r); o.y=clamp(o.y,r,WH-r); hit=true; }
  o._px=o.x; o._py=o.y;
  return hit;
}

// --- textura del terreno (pre-renderizada) ---
const GS=12;
const groundCanvas=document.createElement('canvas'); groundCanvas.width=WW/GS; groundCanvas.height=WH/GS;
(function(){
  const g=groundCanvas.getContext('2d'), W=groundCanvas.width, H=groundCanvas.height, im=g.createImageData(W,H), d=im.data;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const wx=x*GS, wy=y*GS;
    const des=desertness(wx,wy);
    let r=188+(205-188)*des, gg=174+(174-174)*des, b=140+(118-140)*des;
    if(wx>6100*SC){ const m=clamp((wx-6100*SC)/400,0,1); r+=(150-r)*m; gg+=(118-gg)*m; b+=(92-b)*m; }
    const rd=riverDist(wx,wy);
    if(rd<400){ const f=1-rd/400; r+=(104-r)*f; gg+=(128-gg)*f; b+=(72-b)*f; }
    const n=(Math.sin(wx*0.0021+Math.cos(wy*0.0017)*2)*Math.cos(wy*0.0023)*9) + ((Math.sin(wx*12.9898+wy*78.233)*43758.5453)%1)*10;
    const i=(y*W+x)*4; d[i]=r+n; d[i+1]=gg+n; d[i+2]=b+n*0.7; d[i+3]=255;
  }
  g.putImageData(im,0,0);
})();

