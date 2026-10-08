"use strict";
// ======================= GEOGRAFÍA (a partir de maps/abq.js) =======================
// El mapa se edita con tools/editor.html. Aquí se construye todo lo que el juego necesita:
// carreteras con altura, cruces, lugares, edificios, árboles y colisiones.
//
// ALTURAS: cada carretera tiene una z por punto (puentes/rampas) o sigue el terreno.
// Un personaje o coche tiene una z y solo puede moverse a una superficie (suelo o calzada)
// cuya altura difiera poco de la suya: así no se sube a un puente por el lateral, se pasa
// por debajo, y las rampas funcionan solas.

const MAPL = decodeMap(MAP);
const BIOME_ID = Object.fromEntries(BIOMES.map(b=>[b.key,b.id]));
function biomeAt(x,y){ return mapBiome(MAP,MAPL,x,y); }
function groundZ(x,y){ return mapHeight(MAP,MAPL,x,y); }
function isWaterAt(x,y){ const b=BIOMES[biomeAt(x,y)]; return !!(b&&b.water); }
function isDesert(x,y){ const b=biomeAt(x,y); return b===BIOME_ID.desert||b===BIOME_ID.rock; }
const STEP_UP = 1.6;      // desnivel máximo que se salva de un paso (bordillo, rampa)
const DECK = 1.2;          // coincide con el inicio visual del tablero elevado

// --- carreteras ---
const RW = {hwy:255, main:186, street:138, ramp:130, dirt:114, rail:70};
const ROADS = MAP.roads.map((r,idx)=>{
  const pts=r.pts.map(p=>[p[0],p[1]]);
  const zs=r.pts.map(p=>p[2]!==undefined&&p[2]!==null ? p[2] : groundZ(p[0],p[1]));
  const elev=zs.map((z,i)=>z-groundZ(pts[i][0],pts[i][1]));
  const w=RW[r.kind]||138, cum=[0];
  for(let i=1;i<pts.length;i++) cum.push(cum[i-1]+dist(pts[i-1][0],pts[i-1][1],pts[i][0],pts[i][1]));
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; for(const p of pts){ x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1]); }
  const path=new Path2D(); pts.forEach((p,i)=>i?path.lineTo(p[0],p[1]):path.moveTo(p[0],p[1]));
  return {idx,name:r.name,kind:r.kind,bridge:!!r.bridge,pts,zs,elev,w,cum,len:cum[cum.length-1],path,bb:[x0-w,y0-w,x1+w,y1+w],cross:[],ends:[false,false],
    lane:r.kind==='hwy'?w*0.25:w*0.24, drive:r.kind!=='rail'};
});
function pointAt(r,s){
  s=clamp(s,0,r.len); let lo=0,hi=r.cum.length-1;
  while(hi-lo>1){ const m=(lo+hi)>>1; if(r.cum[m]<=s) lo=m; else hi=m; }
  const a=r.pts[lo], b=r.pts[hi], L=(r.cum[hi]-r.cum[lo])||1, t=(s-r.cum[lo])/L;
  return {x:a[0]+(b[0]-a[0])*t, y:a[1]+(b[1]-a[1])*t, a:Math.atan2(b[1]-a[1],b[0]-a[0]), z:r.zs[lo]+(r.zs[hi]-r.zs[lo])*t, e:r.elev[lo]+(r.elev[hi]-r.elev[lo])*t};
}
// rejilla espacial de segmentos
const SEGC=160, SEGGRID=new Map(), SEGS=[];
for(const r of ROADS) for(let i=0;i<r.pts.length-1;i++){
  const a=r.pts[i], b=r.pts[i+1];
  const sg={x1:a[0],y1:a[1],x2:b[0],y2:b[1],z1:r.zs[i],z2:r.zs[i+1],w:r.w,r,i,s0:r.cum[i]}; SEGS.push(sg);
  const pad=r.w/2+40;
  for(let cx=Math.floor((Math.min(a[0],b[0])-pad)/SEGC); cx<=Math.floor((Math.max(a[0],b[0])+pad)/SEGC); cx++)
  for(let cy=Math.floor((Math.min(a[1],b[1])-pad)/SEGC); cy<=Math.floor((Math.max(a[1],b[1])+pad)/SEGC); cy++){
    const k=cx*10000+cy; if(!SEGGRID.has(k)) SEGGRID.set(k,[]); SEGGRID.get(k).push(sg);
  }
}
function segsAt(x,y){ return SEGGRID.get(Math.floor(x/SEGC)*10000+Math.floor(y/SEGC))||[]; }
function segT(sg,x,y){ const dx=sg.x2-sg.x1, dy=sg.y2-sg.y1, l=dx*dx+dy*dy; return l?clamp(((x-sg.x1)*dx+(y-sg.y1)*dy)/l,0,1):0; }
function segZ(sg,x,y){ return sg.z1+(sg.z2-sg.z1)*segT(sg,x,y); }
function roadSurfaceAt(x,y,z,filter){
  let best=null,bd=Infinity;
  for(const sg of segsAt(x,y)){
    if(filter&&!filter(sg.r)||segDist(x,y,sg.x1,sg.y1,sg.x2,sg.y2)>sg.w/2+4) continue;
    const t=segT(sg,x,y), rz=segZ(sg,x,y), d=Math.abs(rz-z);
    if(d<bd){ bd=d; best={r:sg.r,z:rz,s:sg.s0+Math.hypot(sg.x2-sg.x1,sg.y2-sg.y1)*t,d,off:segDist(x,y,sg.x1,sg.y1,sg.x2,sg.y2),e:rz-groundZ(x,y)}; }
  }
  return best;
}
// calzada en (x,y); con z, solo la que está a esa altura
function roadAt(x,y,pad,z){ pad=pad||0; for(const s of segsAt(x,y)) if(segDist(x,y,s.x1,s.y1,s.x2,s.y2)<s.w/2+pad && (z===undefined||Math.abs(segZ(s,x,y)-z)<3)) return s; return null; }
function isRoad(x,y,z){ if(x<0||y<0||x>WW||y>WH) return false; return !!roadAt(x,y,0,z); }

// --- superficies y alturas ---
function surfacesAt(x,y){
  const out=[]; if(!isWaterAt(x,y)) out.push(groundZ(x,y));
  for(const s of segsAt(x,y)) if(segDist(x,y,s.x1,s.y1,s.x2,s.y2)<s.w/2+4) out.push(segZ(s,x,y));
  return out;
}
// altura a la que quedaría algo que está a altura z y se mueve a (x,y); null si no puede (pretil, agua, desnivel)
function standZ(x,y,z,step,fromX,fromY){
  step=step||STEP_UP; let best=null,bd=step;
  // una calzada al alcance de un paso tiene prioridad sobre el terreno: así se sube por las rampas
  // desde el primer centímetro (antes se quedaba pegado al suelo y acababa pasando por debajo del tablero)
  // (de las calzadas al alcance, la del tramo más cercano: es por la que vas, no la del tramo anterior)
  let road=null, rdist=1e9;
  for(const sg of segsAt(x,y)){ const dd=segDist(x,y,sg.x1,sg.y1,sg.x2,sg.y2); if(dd>=sg.w/2+4) continue; const sz=segZ(sg,x,y); if(Math.abs(sz-z)>step) continue; if(dd<rdist-0.5){ rdist=dd; road=sz; } }
  if(road!==null) return road;
  for(const s of surfacesAt(x,y)){ const d=Math.abs(s-z); if(d<=bd){ bd=d; best=s; } }
  return best;
}
// El peatÃ³n conserva la capa en la que estÃ¡: para cambiar entre suelo y tablero
// debe usar el extremo de una rampa, nunca cruzar el pretil por el lateral.
function walkStandZ(x0,y0,x,y,z,step){
  step=step||STEP_UP;
  const fromDeck=z-groundZ(x0,y0)>DECK, ground=groundZ(x,y), options=[]; let preferred=null;
  const prior=roadSurfaceAt(x0,y0,z), groundD=Math.abs(z-groundZ(x0,y0));
  const onPrior=prior&&prior.d<=step&&prior.off<prior.r.w/2-10&&(prior.d+0.1<groundD||Math.abs(prior.e)<=0.1);
  const moved=Math.hypot(x-x0,y-y0);
  if(!fromDeck&&!isWaterAt(x,y)) options.push(ground);
  for(const sg of segsAt(x,y)){
    if(segDist(x,y,sg.x1,sg.y1,sg.x2,sg.y2)>sg.w/2+4) continue;
    const t=segT(sg,x,y), rz=segZ(sg,x,y), e=rz-ground, s=sg.s0+Math.hypot(sg.x2-sg.x1,sg.y2-sg.y1)*t;
    if(Math.abs(rz-z)>step) continue;
    const high=e>DECK;
    const sameRoad=onPrior&&prior.r===sg.r&&Math.abs(s-prior.s)>=moved*0.35;
    const sameHighLayer=fromDeck&&high&&onPrior&&prior.e>DECK;
    const end=Math.max(36,sg.r.w*0.35);
    const atLow=sg.r.ends[0]&&s<=end, atHigh=sg.r.ends[1]&&sg.r.len-s<=end;
    if(!fromDeck&&high&&!(sameRoad||sg.r.kind==='ramp'&&atLow)) continue;
    if(sg.r.kind==='ramp'&&!sameRoad&&!sameHighLayer&&!(fromDeck&&atHigh)&&!(!fromDeck&&atLow)) continue;
    if(fromDeck&&!high&&!sameRoad&&!(onPrior&&prior.r.kind==='ramp'&&prior.s<=end)) continue;
    if(!fromDeck&&(sameRoad&&e>0.1||sg.r.kind==='ramp'&&atLow)) preferred=rz;
    options.push(rz);
  }
  if(preferred!==null) return preferred;
  let best=null,bd=step;
  for(const value of options){ const d=Math.abs(value-z); if(d<=bd){ bd=d; best=value; } }
  return best;
}
// altura inicial al aparecer en un punto: la superficie más alta (si está sobre un puente, arriba)
function spawnZ(x,y,prefer){
  const S=surfacesAt(x,y); if(!S.length) return groundZ(x,y);
  if(prefer!==undefined){ let b=S[0]; for(const s of S) if(Math.abs(s-prefer)<Math.abs(b-prefer)) b=s; return b; }
  return Math.min(...S);
}
function elevOf(o){ return (o.z||0)-groundZ(o.x,o.y); }   // altura sobre el suelo
function onDeck(o){ return elevOf(o)>DECK; }

function nearestRoad(x,y,filter,z){
  // búsqueda en anillos crecientes de la rejilla; si no aparece nada cerca, recorrido completo
  const ok=s=>(!filter||filter(s.r))&&(z===undefined||Math.abs(segZ(s,x,y)-z)<=3);
  let best=null,bd=1e9;
  const ci=Math.floor(x/SEGC), cj=Math.floor(y/SEGC);
  for(let ring=0; ring<=12 && !(best&&bd<(ring-1)*SEGC); ring++){
    for(let i=ci-ring;i<=ci+ring;i++) for(let j=cj-ring;j<=cj+ring;j++){
      if(Math.max(Math.abs(i-ci),Math.abs(j-cj))!==ring) continue;
      const l=SEGGRID.get(i*10000+j); if(!l) continue;
      for(const s of l){ if(!ok(s)) continue; const d=segDist(x,y,s.x1,s.y1,s.x2,s.y2); if(d<bd){bd=d;best=s;} }
    }
  }
  if(!best) for(const s of SEGS){ if(!ok(s)) continue; const d=segDist(x,y,s.x1,s.y1,s.x2,s.y2); if(d<bd){bd=d;best=s;} }
  if(!best) return z!==undefined?nearestRoad(x,y,filter):null;
  const dx=best.x2-best.x1, dy=best.y2-best.y1, l=dx*dx+dy*dy; const t=clamp(((x-best.x1)*dx+(y-best.y1)*dy)/l,0,1);
  return {seg:best, r:best.r, x:best.x1+dx*t, y:best.y1+dy*t, z:best.z1+(best.z2-best.z1)*t, s:best.s0+Math.sqrt(l)*t, a:Math.atan2(dy,dx), d:bd};
}

// --- cruces: a nivel si las dos calzadas están a la misma altura; si no, una pasa por encima ---
const CROSSINGS=[];
(function(){
  const add=(A,B,x,y,sa,sb)=>{
    if(CROSSINGS.some(c=>Math.abs(c.x-x)<30&&Math.abs(c.y-y)<30&&((c.a===A.r&&c.b===B.r)||(c.a===B.r&&c.b===A.r)))) return;
    const za=pointAt(A.r,sa).z, zb=pointAt(B.r,sb).z, level=Math.abs(za-zb)<2;
    const id=CROSSINGS.length; CROSSINGS.push({id,x,y,a:A.r,b:B.r,level,w:Math.max(A.r.w,B.r.w),sa,sb,z:za,e:pointAt(A.r,sa).e});
    if(level && A.r.drive && B.r.drive){ A.r.cross.push({id,s:sa,other:B.r.idx,os:sb}); B.r.cross.push({id,s:sb,other:A.r.idx,os:sa}); }
    if(level){ for(const [r,s] of [[A.r,sa],[B.r,sb]]){ if(s<r.w) r.ends[0]=true; if(s>r.len-r.w) r.ends[1]=true; } }
  };
  const seen=new Set();
  for(const [,list] of SEGGRID) for(let i=0;i<list.length;i++) for(let j=i+1;j<list.length;j++){
    const A=list[i], B=list[j]; if(A.r===B.r) continue;
    const key=A.r.idx+'_'+A.i+'_'+B.r.idx+'_'+B.i; if(seen.has(key)) continue; seen.add(key);
    const d1x=A.x2-A.x1,d1y=A.y2-A.y1,d2x=B.x2-B.x1,d2y=B.y2-B.y1, den=d1x*d2y-d1y*d2x; if(Math.abs(den)<1e-6) continue;
    const t=((B.x1-A.x1)*d2y-(B.y1-A.y1)*d2x)/den, u=((B.x1-A.x1)*d1y-(B.y1-A.y1)*d1x)/den;
    if(t<0||t>1||u<0||u>1) continue;
    add(A,B,A.x1+t*d1x,A.y1+t*d1y,A.s0+Math.hypot(d1x,d1y)*t,B.s0+Math.hypot(d2x,d2y)*u);
  }
  // finales de calle que desembocan dentro de otra calzada (cruces en T)
  for(const r of ROADS) for(const end of [0,1]){
    const p=end?r.pts[r.pts.length-1]:r.pts[0], s=end?r.len:0, z=end?r.zs[r.zs.length-1]:r.zs[0];
    for(const sg of segsAt(p[0],p[1])){ if(sg.r===r) continue;
      if(segDist(p[0],p[1],sg.x1,sg.y1,sg.x2,sg.y2)>sg.w/2+8 || Math.abs(segZ(sg,p[0],p[1])-z)>2) continue;
      const t=segT(sg,p[0],p[1]), x=sg.x1+(sg.x2-sg.x1)*t, y=sg.y1+(sg.y2-sg.y1)*t;
      // Una rampa entra por el borde: conserva el nodo en su extremo físico,
      // aunque el eje de la autopista pase unas decenas de unidades más adentro.
      add({r},sg,r.kind==='ramp'?p[0]:x,r.kind==='ramp'?p[1]:y,s,sg.s0+Math.hypot(sg.x2-sg.x1,sg.y2-sg.y1)*t);
      r.ends[end]=true; break; }
  }
  // Las carreteras cerradas (como la ruta costera) conectan sus dos extremos
  // consigo mismas; no deben aparecer como fondos de saco.
  for(const r of ROADS) if(dist(r.pts[0][0],r.pts[0][1],r.pts[r.pts.length-1][0],r.pts[r.pts.length-1][1])<Math.max(4,r.w*0.1)) r.ends[0]=r.ends[1]=true;
})();

// --- Lugares de la historia (se colocan junto a la calle más cercana) ---
const LOC = {};
for(const k in MAP.places) LOC[k]=Object.assign({},MAP.places[k]);
const solids = [];   // {x,y,w,h,roof,wall,name,kind}
const RESERVED = [];
const LOTS = [];
function placeLoc(L,tx,ty){
  const nr=nearestRoad(tx,ty,r=>(r.kind==='main'||r.kind==='street'||(L.desert&&r.kind==='dirt'))&&!r.elev.some(e=>e>DECK));
  let nx=tx-nr.x, ny=ty-nr.y, nl=Math.hypot(nx,ny);
  if(nl<1){ nx=Math.cos(nr.a+Math.PI/2); ny=Math.sin(nr.a+Math.PI/2); nl=1; }
  nx/=nl; ny/=nl;
  const hw=nr.r.w/2, o={};
  o.x=nr.x+nx*(hw+50); o.y=nr.y+ny*(hw+50);
  o.parkX=o.x+Math.cos(nr.a)*75; o.parkY=o.y+Math.sin(nr.a)*75; o.parkA=nr.a;
  const sz=L.size||[230,150], horiz=Math.abs(nx)>Math.abs(ny);
  const bw=horiz?sz[1]:sz[0], bh=horiz?sz[0]:sz[1], D=hw+50+40+(horiz?bw:bh)/2;
  o.bx=nr.x+nx*D-bw/2; o.by=nr.y+ny*D-bh/2; o.bw=bw; o.bh=bh;
  for(let i=0;i<=6;i++) for(let j=0;j<=6;j++){ const x=o.bx-10+(bw+20)*i/6, y=o.by-10+(bh+20)*j/6;
    if(roadAt(x,y,4)||isWaterAt(x,y)||(!L.desert&&isDesert(x,y))) return null; }
  for(const [x,y] of [[o.x,o.y],[o.parkX,o.parkY]]) if(isWaterAt(x,y)) return null;
  for(const r of RESERVED) if(o.bx-30<r[2]&&o.bx+bw+30>r[0]&&o.by-30<r[3]&&o.by+bh+30>r[1]) return null;
  for(const [x,y] of [[o.x,o.y],[o.parkX,o.parkY]]){
    if(x>o.bx-30&&x<o.bx+bw+30&&y>o.by-30&&y<o.by+bh+30) return null;
    for(const q of solids) if(x>q.x-30&&x<q.x+q.w+30&&y>q.y-30&&y<q.y+q.h+30) return null;
    for(const r of RESERVED) if(x>r[0]-20&&x<r[2]+20&&y>r[1]-20&&y<r[3]+20) return null;
  }
  return o;
}
for(const k in LOC){
  const L=LOC[k]; L.key=k; L.tx=L.x; L.ty=L.y; let o=null;
  const sizes=[L.size||[230,150],[180,130],[150,110]];
  for(const sz of sizes){ if(o) break; const keep=L.size; L.size=sz;
    for(let rad=0;rad<1400&&!o;rad+=40) for(let a=0;a<6.28&&!o;a+=rad?0.4:7) o=placeLoc(L,L.tx+Math.cos(a)*rad,L.ty+Math.sin(a)*rad);
    if(!o) L.size=keep; }
  if(!o){ console.warn('no se pudo colocar',k); o={x:L.tx,y:L.ty,parkX:L.tx+60,parkY:L.ty,parkA:0,bx:L.tx-60,by:L.ty+60,bw:120,bh:90}; }
  Object.assign(L,o);
  solids.push({x:L.bx,y:L.by,w:L.bw,h:L.bh,roof:L.roof,wall:L.wall,name:L.name,key:k,kind:'special',seed:srand()});
  const lx0=Math.min(L.x-80,L.parkX-50,L.bx-20), ly0=Math.min(L.y-80,L.parkY-50,L.by-20), lx1=Math.max(L.x+80,L.parkX+50,L.bx+L.bw+20), ly1=Math.max(L.y+80,L.parkY+50,L.by+L.bh+20);
  RESERVED.push([lx0,ly0,lx1,ly1]);
  LOTS.push({x:Math.min(L.x-70,L.bx-12),y:Math.min(L.y-70,L.by-12),x2:Math.max(L.x+70,L.bx+L.bw+12),y2:Math.max(L.y+70,L.by+L.bh+12),house:!!L.size,pool:k==='home',L});
}
const DESERT = {key:'desert', name:'Desierto (cocina)', x:MAP.cook.x, y:MAP.cook.y};
LOC.desert = DESERT;
RESERVED.push([DESERT.x-260,DESERT.y-260,DESERT.x+260,DESERT.y+260]);
const DEALERS = MAP.dealers.map(([x,y,name])=>{
  const nr=nearestRoad(x,y,r=>(r.kind==='main'||r.kind==='street')&&!r.elev.some(e=>e>DECK)); const n=nr.a+Math.PI/2;
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

// --- edificios a lo largo de las calles, según el bioma ---
const WALLS = ['#d9c7a3','#cdb58f','#e0cfae','#c9b089','#d7c2a0','#bfae8f','#e4c9a8'];
const ADOBE = ['#c99a6b','#d4a77a','#b9835a','#dcb48a','#c48d64','#e0bf98','#a8744d','#d9b28f','#cfa27e'];
const TRIMS = ['#2f6f8f','#3b7a57','#8a3b2b','#e8dcc0','#5a4636','#2e5a7a'];
const ZONE = {   // densidad, ¿casas?, ¿altos?
  [BIOME_ID.city]:{d:0.95,house:0,tall:1}, [BIOME_ID.suburb]:{d:0.78,house:1}, [BIOME_ID.industrial]:{d:0.8,house:0,big:1},
  [BIOME_ID.desert]:{d:0.02,house:1}, [BIOME_ID.beach]:{d:0.1,house:1} };
function density(x,y){ const z=ZONE[biomeAt(x,y)]; return z?z.d:0; }
function canPlace(x,y,w,h){
  if(x<20||y<20||x+w>WW-20||y+h>WH-20) return false;
  for(const r of RESERVED) if(x<r[2]&&x+w>r[0]&&y<r[3]&&y+h>r[1]) return false;
  for(let i=0;i<=4;i++) for(let j=0;j<=4;j++){
    const px=x+w*i/4, py=y+h*j/4;
    if(roadAt(px,py,12)||isWaterAt(px,py)) return false;
  }
  for(const s of solidsIn(x-8,y-8,x+w+8,y+h+8)) if(x-8<s.x+s.w&&x+w+8>s.x&&y-8<s.y+s.h&&y+h+8>s.y) return false;
  return true;
}
for(const r of ROADS){
  if(r.kind==='hwy'||r.kind==='dirt'||r.kind==='rail'||r.kind==='ramp') continue;
  for(const side of [1,-1]){
    let s=20;
    while(s<r.len-20){
      const p=pointAt(r,s), n=p.a+Math.PI/2*side, nx=Math.cos(n), ny=Math.sin(n);
      let step=50;
      if(p.e>DECK){ s+=step; continue; }                 // nada bajo los puentes
      const Z=ZONE[biomeAt(p.x+nx*120,p.y+ny*120)];
      if(Z) for(let layer=0;layer<3;layer++){
        if(srand()>Z.d) continue;
        const big=(r.kind==='main'&&!Z.house)||Z.tall||Z.big;
        const bw=big&&layer===0?sr(70,Z.big?190:140):sr(42,70), bh=big&&layer===0?sr(60,Z.big?160:120):sr(40,64);
        const off=r.w/2+SIDEWALK+8+layer*95+Math.max(bw,bh)/2;
        const cx=p.x+nx*off, cy=p.y+ny*off;
        if(canPlace(cx-bw/2,cy-bh/2,bw,bh)){
          const house=!!Z.house && !(big&&layer===0);
          const s2={x:cx-bw/2,y:cy-bh/2,w:bw,h:bh,kind:'bld',seed:srand(),house,tall:!!Z.tall&&!house,
            roof:house?(srand()<0.35?'pitched':'flat'):'comm',
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
// árboles: bosque del río, parques y jardines
const TREES=[];
{ const L=LOC.jesse, bcx=L.bx+L.bw/2, bcy=L.by+L.bh/2;   // álamos sin hojas delante de casa de Jesse
  for(const f of [0.45,0.7]) TREES.push({x:bcx+(L.x-bcx)*f+(f-.55)*90, y:bcy+(L.y-bcy)*f-(f-.55)*90, r:30, c:0.5, bare:true}); }
const treeOK=(x,y)=>!roadAt(x,y,10)&&!isWaterAt(x,y)&&!solidsIn(x-12,y-12,x+12,y+12).some(s=>x+10>s.x&&x-10<s.x+s.w&&y+10>s.y&&y-10<s.y+s.h);
for(let i=0;i<26000;i++){
  const x=sr(0,WW), y=sr(0,WH), b=biomeAt(x,y);
  const p = b===BIOME_ID.bosque?0.9 : b===BIOME_ID.park?0.55 : b===BIOME_ID.suburb?0.12 : b===BIOME_ID.city?0.03 : 0;
  if(p===0||srand()>p||!treeOK(x,y)) continue;
  TREES.push(b===BIOME_ID.bosque?{x,y,r:sr(14,24),c:srand()}:{x,y,r:sr(7,14),c:srand()});
}
// rejilla de árboles para no recorrer los 26.000 en cada frame
const TREEC=400, TREEGRID=new Map();
for(const tr of TREES){ const k=Math.floor(tr.x/TREEC)*10000+Math.floor(tr.y/TREEC); if(!TREEGRID.has(k)) TREEGRID.set(k,[]); TREEGRID.get(k).push(tr); }
function treesIn(x0,y0,x1,y1){ const out=[]; for(let i=Math.floor(x0/TREEC);i<=Math.floor(x1/TREEC);i++) for(let j=Math.floor(y0/TREEC);j<=Math.floor(y1/TREEC);j++){ const l=TREEGRID.get(i*10000+j); if(l) for(const t of l) if(t.x>x0&&t.x<x1&&t.y>y0&&t.y<y1) out.push(t); } return out; }
// desierto: rocas, cactus y alguna mesa
const decoDesert = [];
function canPlaceRock(x,y,w,h){
  for(let i=0;i<=4;i++) for(let j=0;j<=4;j++){ const px=x+w*i/4, py=y+h*j/4; if(roadAt(px,py,30)||!isDesert(px,py)) return false; }
  return !solidsIn(x,y,x+w,y+h).some(s=>x<s.x+s.w&&x+w>s.x&&y<s.y+s.h&&y+h>s.y);
}
for(let i=0;i<7000;i++){
  const x=sr(100,WW-60), y=sr(60,WH-60);
  if(!isDesert(x,y)||roadAt(x,y,40)) continue;
  if(dist(x,y,DESERT.x,DESERT.y)<280) continue;
  if(srand()<0.04){
    const w=sr(110,220),h=sr(70,150);
    if(!canPlaceRock(x-w/2,y-h/2,w,h)) continue;
    const s={x:x-w/2,y:y-h/2,w,h,roof:'#a5502e',wall:'#7b3a20',kind:'mesa',seed:srand()}; solids.push(s); addSolid(s);
  } else if(srand()<0.4){
    const s={x:x-9,y:y-9,w:18,h:18,roof:'#4c7a3a',wall:'#355a28',kind:'cactus',seed:srand()}; solids.push(s); addSolid(s);
  } else decoDesert.push({x,y,r:6+srand()*14,c:srand()});
}

function inWater(x,y){ return isWaterAt(x,y) && !isRoad(x,y); }
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
  const high=o.z!==undefined && onDeck(o);   // sobre un puente no hay edificios
  if(!high) for(const s of solidsIn(o.x-r,o.y-r,o.x+r,o.y+r)){
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
  // desniveles (pretiles, agua): volver a la última posición válida
  const nz=o===G.player&&o.z!==undefined
    ? walkStandZ(o._px===undefined?o.x:o._px,o._py===undefined?o.y:o._py,o.x,o.y,o.z)
    : standZ(o.x,o.y,o.z===undefined?spawnZ(o.x,o.y):o.z);
  if(nz===null){ if(o._px!==undefined){ o.x=o._px; o.y=o._py; if(o._pz!==undefined) o.z=o._pz; } hit=true; } else o.z=nz;
  if(o.x<r||o.y<r||o.x>WW-r||o.y>WH-r){ o.x=clamp(o.x,r,WW-r); o.y=clamp(o.y,r,WH-r); hit=true; }
  o._px=o.x; o._py=o.y; o._pz=o.z;
  return hit;
}

// --- textura del terreno (una celda de bioma = un píxel; el escalado suaviza los bordes) ---
const GS=MAP.biome.cell;
const groundCanvas=document.createElement('canvas'); groundCanvas.width=MAP.biome.cols; groundCanvas.height=MAP.biome.rows;
(function(){
  const B=MAP.biome, Hm=MAP.height, W=B.cols, H=B.rows;
  const g=groundCanvas.getContext('2d'), im=g.createImageData(W,H), d=im.data;
  // alturas en coma flotante para muestrear rápido
  const HF=new Float32Array(MAPL.height.length); for(let i=0;i<HF.length;i++) HF[i]=MAPL.height[i]*Hm.scale+Hm.offset;
  const hAt=(x,y)=>{ const fx=x/Hm.cell-0.5, fy=y/Hm.cell-0.5, i=Math.max(0,Math.min(Hm.cols-2,fx|0)), j=Math.max(0,Math.min(Hm.rows-2,fy|0)), u=clamp(fx-i,0,1), v=clamp(fy-j,0,1), k=j*Hm.cols+i;
    return (HF[k]*(1-u)+HF[k+1]*u)*(1-v)+(HF[k+Hm.cols]*(1-u)+HF[k+Hm.cols+1]*u)*v; };
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const wx=(x+.5)*GS, wy=(y+.5)*GS, b=BIOMES[MAPL.biome[y*W+x]]||BIOMES[0];
    let r=b.col[0], gg=b.col[1], bb=b.col[2];
    const h0=hAt(wx,wy);
    if(b.water){ const f=clamp(-h0/4,0,1)*0.25; r*=1-f; gg*=1-f; bb*=1-f*0.5; }
    else { const sh=clamp(1+((h0-hAt(wx+40,wy))+(h0-hAt(wx,wy+40)))*0.05,0.6,1.35); r*=sh; gg*=sh; bb*=sh; } // relieve, luz del noroeste
    const n=((Math.sin(wx*12.9898+wy*78.233)*43758.5453)%1)*7;
    const i=(y*W+x)*4; d[i]=r+n; d[i+1]=gg+n; d[i+2]=bb+n*0.7; d[i+3]=255;
  }
  g.putImageData(im,0,0);
})();
