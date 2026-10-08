"use strict";
// ======================= RENDER =======================
function nightAmount(){
  const h=G.clock/60;
  if(h>=7&&h<=18) return 0;
  if(h>18&&h<21) return (h-18)/3;
  if(h>=5&&h<7) return 1-(h-5)/2;
  return 1;
}

let VIS=[], LIGHTS=[], NOISE_PAT=null, RENDER_READY=false;
const BIZ=['TAQUERÍA','MOTEL','LICORES','FERRETERÍA','LAVANDERÍA','DENTISTA','AUTO PARTS','DINER','TATTOO','FARMACIA','BAR','GASOLINERA','PIZZA','BURRITOS','EMPEÑOS','GIMNASIO'];
const GROUND_E=0.05;      // dibujar el tablero desde casi cero para evitar un corte visible al iniciar la rampa
const DECK_E=1.2;         // altura a partir de la que se trata como puente en cruces y elementos urbanos
const VISUAL_DECK_E=0.01; // separar las capas de dibujo sin esperar al umbral de colision del puente
const LIFT_H=0.07/9, LIFT_UP=12/9; // perspectiva por unidad de altura (z=9 ≈ 12 px hacia arriba)
function buildBridgeVisuals(r){
  const ranges=[]; let start=null,last=0,step=12;
  for(let s=0;s<=r.len;s+=step){ const p=pointAt(r,s), wet=isWaterAt(p.x,p.y);
    if(wet){ if(start===null) start=s; last=s; }
    else if(start!==null){ ranges.push([Math.max(0,start-60),Math.min(r.len,last+60)]); start=null; }
  }
  if(start!==null) ranges.push([Math.max(0,start-60),Math.min(r.len,last+60)]);
  return ranges.map(([a,b])=>{
    const center=new Path2D(), left=new Path2D(), right=new Path2D(), n=Math.max(1,Math.ceil((b-a)/12));
    for(let i=0;i<=n;i++){ const p=pointAt(r,a+(b-a)*i/n), nx=Math.cos(p.a+Math.PI/2), ny=Math.sin(p.a+Math.PI/2), off=r.w/2+SIDEWALK+2;
      if(i===0){ center.moveTo(p.x,p.y); left.moveTo(p.x+nx*off,p.y+ny*off); right.moveTo(p.x-nx*off,p.y-ny*off); }
      else { center.lineTo(p.x,p.y); left.lineTo(p.x+nx*off,p.y+ny*off); right.lineTo(p.x-nx*off,p.y-ny*off); }
    }
    return {center,left,right,w:r.w+SIDEWALK*2+10};
  });
}
function initRender(){
  const n=document.createElement('canvas'); n.width=n.height=96; const g=n.getContext('2d');
  for(let i=0;i<900;i++){ g.fillStyle=Math.random()<.5?'rgba(0,0,0,.07)':'rgba(255,255,255,.06)'; g.fillRect(Math.random()*96,Math.random()*96,1+Math.random()*2,1+Math.random()*2); }
  NOISE_PAT=ctx.createPattern(n,'repeat');
  // por carretera: trazado a ras de suelo y tramos elevados (puentes, rampas)
  for(const r of ROADS){
    const P=new Path2D(); let pen=false, deck=null; r.decks=[];
    const addDeck=(a,b)=>{
      if(b-a<0.01) return;
      if(deck&&Math.abs(deck[1]-a)<0.01) deck[1]=b;
      else { deck=[a,b]; r.decks.push(deck); }
    };
    // Divide the road at the exact point where it clears the ground. Sampling by
    // fixed distances left a visible gap between the road and the bridge deck.
    for(let i=0;i<r.pts.length-1;i++){
      const s0=r.cum[i], s1=r.cum[i+1], e0=r.elev[i], e1=r.elev[i+1];
      const p0=r.pts[i], p1=r.pts[i+1], above0=e0>GROUND_E, above1=e1>GROUND_E;
      if(above0!==above1){
        const t=(GROUND_E-e0)/(e1-e0), sc=s0+(s1-s0)*t;
        const x=p0[0]+(p1[0]-p0[0])*t, y=p0[1]+(p1[1]-p0[1])*t;
        if(above0) addDeck(s0,sc);
        else { if(pen){ P.lineTo(x,y); pen=false; } else P.moveTo(x,y); }
        if(above1){ addDeck(sc,s1); pen=false; }
        else { P.lineTo(p1[0],p1[1]); pen=true; }
      } else if(above0){ addDeck(s0,s1); pen=false; }
      else { if(!pen) P.moveTo(p0[0],p0[1]); P.lineTo(p1[0],p1[1]); pen=true; }
    }
    r.gpath=P;
    r.bridgeVisuals=r.bridge?buildBridgeVisuals(r):[];
  }
  RENDER_READY=true;
}
function rot(x,y,a,fn){ ctx.save(); ctx.translate(x,y); ctx.rotate(a); fn(); ctx.restore(); }
// desplazamiento aparente de algo que está a altura `e` sobre el suelo (pseudo-3D)
function liftOf(x,y,e){ const ccx=cam.x+VW/cam.z/2, ccy=cam.y+VH/cam.z/2; return [(x-ccx)*LIFT_H*e, ((y-ccy)*LIFT_H-LIFT_UP)*e]; }
function renderOnDeck(o){ return o.z!==undefined&&elevOf(o)>VISUAL_DECK_E; }
function liftObj(o){ const e=elevOf(o); return e>VISUAL_DECK_E?liftOf(o.x,o.y,e):[0,0]; }

// ---------- MUNDO ESTÁTICO EN BALDOSAS (caché) ----------
// Terreno, carreteras, aceras, cruces, vías, parcelas, matorrales y farolas no cambian: se pintan
// una vez en baldosas de TILE×TILE y cada frame solo se copian las visibles. Cada frame se generan
// como mucho TILE_BUDGET baldosas nuevas para no dar tirones al moverse rápido.
const TILE=512, TILE_MAX=70, TILE_BUDGET=1;
const TILES=new Map(); let tileUse=0;
function getTile(i,j,force){
  const k=i*10000+j; let T=TILES.get(k);
  if(T){ T.used=++tileUse; return T; }
  if(!force) return null;
  // reciclar el lienzo de la baldosa menos usada (crear lienzos nuevos dispara el recolector de basura)
  let c=null;
  if(TILES.size>=TILE_MAX){ let ok=null,ou=1e18; for(const [kk,v] of TILES) if(v.used<ou){ ou=v.used; ok=kk; } c=TILES.get(ok).c; TILES.delete(ok); }
  if(!c){ c=document.createElement('canvas'); c.width=c.height=TILE; }
  const lights=[], saved=ctx; ctx=c.getContext('2d');
  ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,TILE,TILE);
  ctx.setTransform(1,0,0,1,-i*TILE,-j*TILE);
  try{ drawStatic(i*TILE,j*TILE,(i+1)*TILE,(j+1)*TILE,lights); } finally { ctx=saved; }
  T={c,lights,used:++tileUse}; TILES.set(k,T);
  return T;
}
function drawWorld(t){
  if(!RENDER_READY) initRender();
  const z=cam.z, x0=cam.x, y0=cam.y, x1=x0+VW/z, y1=y0+VH/z;
  VIS=solidsIn(x0-120,y0-120,x1+120,y1+120);
  ctx.fillStyle='#265c80'; ctx.fillRect(x0-50,y0-50,x1-x0+100,y1-y0+100);
  ctx.imageSmoothingEnabled=true;
  LIGHTS=[]; let budget=G.tileWarm?40:TILE_BUDGET; const warm=G.tileWarm; G.tileWarm=false;
  const i0=Math.floor(x0/TILE), i1=Math.floor(x1/TILE), j0=Math.floor(y0/TILE), j1=Math.floor(y1/TILE);
  // primero las que están cerca del centro de la pantalla
  const order=[]; for(let i=i0;i<=i1;i++) for(let j=j0;j<=j1;j++) order.push([i,j,Math.hypot(i-(i0+i1)/2,j-(j0+j1)/2)]);
  order.sort((a,b)=>a[2]-b[2]);
  for(const [i,j] of order){
    let T=getTile(i,j,false); if(!T&&budget>0){ budget--; T=getTile(i,j,true); }
    if(T){ ctx.drawImage(T.c,i*TILE,j*TILE,TILE+0.5,TILE+0.5); for(const l of T.lights) LIGHTS.push(l); }
    else { // aún sin generar: el terreno a baja resolución mientras tanto
      ctx.drawImage(groundCanvas,i*TILE/GS,j*TILE/GS,TILE/GS,TILE/GS,i*TILE,j*TILE,TILE,TILE); }
  }
  // baldosas vecinas por adelantado si sobra presupuesto
  if(!warm&&budget>0) for(let i=i0-1;i<=i1+1&&budget>0;i++) for(let j=j0-1;j<=j1+1&&budget>0;j++) if(!getTile(i,j,false)){ budget--; getTile(i,j,true); }
  // calcomanías (sangre, frenadas...): dinámicas
  for(const d of G.decals){ if(d.x<x0-40||d.x>x1+40||d.y<y0-40||d.y>y1+40) continue; ctx.fillStyle=d.c; ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,7); ctx.fill(); }
}
// trozos a ras de suelo de una carretera dentro de una caja (con el desfase de discontinuas correcto)
function drawBridgeDetails(){
  for(const r of ROADS){ if(!r.bridgeVisuals||!r.bridgeVisuals.length) continue;
    for(const b of r.bridgeVisuals){
      ctx.save(); ctx.translate(10,12); ctx.strokeStyle='rgba(0,0,0,.22)'; ctx.lineWidth=b.w+8; ctx.lineCap='round'; ctx.stroke(b.center); ctx.restore();
      ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle='#857f74'; ctx.lineWidth=8; ctx.stroke(b.left); ctx.stroke(b.right);
      ctx.strokeStyle='#d8d2c4'; ctx.lineWidth=4; ctx.stroke(b.left); ctx.stroke(b.right);
      ctx.lineCap='butt';
    }
  }
}
function groundPieces(r,x0,y0,x1,y1){
  const m=r.w/2+SIDEWALK+80, out=[]; let path=null, pen=false, startS=0;
  const inBox=p=>p[0]>x0-m&&p[0]<x1+m&&p[1]>y0-m&&p[1]<y1+m;
  const begin=(p,s)=>{ path=new Path2D(); path.moveTo(p[0],p[1]); pen=true; startS=s; };
  const finish=()=>{ if(path&&pen) out.push({...r,path,dashOff:startS}); path=null; pen=false; };
  for(let i=0;i<r.pts.length-1;i++){
    const a=r.pts[i], b=r.pts[i+1], s0=r.cum[i], s1=r.cum[i+1], e0=r.elev[i], e1=r.elev[i+1];
    if(!inBox(a)&&!inBox(b)){ finish(); continue; }
    const low0=e0<=GROUND_E, low1=e1<=GROUND_E;
    if(low0!==low1){
      const t=(GROUND_E-e0)/(e1-e0), c=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t], sc=s0+(s1-s0)*t;
      if(low0){ if(!pen) begin(a,s0); path.lineTo(c[0],c[1]); finish(); }
      else { finish(); begin(c,sc); path.lineTo(b[0],b[1]); }
    } else if(low0){
      if(!pen) begin(a,s0); path.lineTo(b[0],b[1]);
    } else finish();
  }
  finish();
  return out;
}
// todo lo estático de una zona del mundo (se pinta dentro de una baldosa)
function drawStatic(x0,y0,x1,y1,lights){
  // terreno (bioma + relieve) y grano
  ctx.fillStyle='#265c80'; ctx.fillRect(x0,y0,x1-x0,y1-y0);
  ctx.imageSmoothingEnabled=true;
  const sx=Math.max(0,x0/GS), sy=Math.max(0,y0/GS), sw=Math.min(groundCanvas.width,x1/GS)-sx, sh=Math.min(groundCanvas.height,y1/GS)-sy;
  if(sw>0&&sh>0) ctx.drawImage(groundCanvas,sx,sy,sw,sh,sx*GS,sy*GS,sw*GS,sh*GS);
  ctx.fillStyle=NOISE_PAT; ctx.fillRect(x0,y0,x1-x0,y1-y0);
  // matorrales del desierto
  for(const d of decoDesert){ if(d.x<x0-30||d.x>x1+30||d.y<y0-30||d.y>y1+30) continue;
    ctx.fillStyle=d.c<.5?'rgba(110,105,60,.85)':'rgba(140,100,70,.8)'; ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,7); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.12)'; ctx.beginPath(); ctx.arc(d.x-d.r*0.3,d.y-d.r*0.3,d.r*0.45,0,7); ctx.fill(); }
  // aparcamientos de lugares importantes
  for(const L of LOTS){ if(L.x>x1+20||L.x2<x0-20||L.y>y1+20||L.y2<y0-20) continue;
    if(L.house){ const P=L.L, bcx=P.bx+P.bw/2, bcy=P.by+P.bh/2;
      const jesse=P.key==='jesse', walt=P.key==='home';
      ctx.fillStyle=jesse?'#c4ad6c':walt?'#cfc6b6':'#c9b28a'; ctx.fillRect(L.x,L.y,L.x2-L.x,L.y2-L.y);
      ctx.fillStyle=jesse?'rgba(150,120,60,.4)':walt?'rgba(120,110,100,.45)':'rgba(120,95,60,.3)';
      for(let i=0;i<(walt?220:60);i++){ const r=mulberry(i*7919+3); ctx.fillRect(L.x+r()*(L.x2-L.x),L.y+r()*(L.y2-L.y),2,2); }
      if(walt){ ctx.fillStyle='#4f7a3a'; const gx=(P.x+bcx)/2, gy=(P.y+bcy)/2; roundRect(gx-60,gy-26,52,40,10); ctx.fill(); }
      ctx.fillStyle=walt?'#b9b5ac':'#a8a296'; ctx.fillRect(P.x-45,P.y-45,90,90); ctx.fillRect(P.parkX-(walt?55:40),P.parkY-(walt?55:40),walt?110:80,walt?110:80);
      if(L.pool){ const dx=bcx-P.x, dy=bcy-P.y, dl=Math.hypot(dx,dy)||1, px=bcx+dx/dl*(Math.max(P.bw,P.bh)/2+40), py=bcy+dy/dl*(Math.max(P.bw,P.bh)/2+40);
        ctx.fillStyle='#e9e3d4'; roundRect(px-38,py-22,76,44,10); ctx.fill(); ctx.fillStyle='#3fb6d8'; roundRect(px-32,py-16,64,32,8); ctx.fill(); }
      ctx.strokeStyle=jesse?'#ece7dc':'rgba(130,100,70,.85)'; ctx.lineWidth=jesse?5:3; ctx.strokeRect(L.x-4,L.y-4,L.x2-L.x+8,L.y2-L.y+8);
      continue; }
    ctx.fillStyle='#4f5054'; ctx.fillRect(L.x,L.y,L.x2-L.x,L.y2-L.y);
    ctx.strokeStyle='rgba(255,255,255,.55)'; ctx.lineWidth=2;
    for(let x=L.x+16;x<L.x2-10;x+=30){ ctx.beginPath(); ctx.moveTo(x,L.y+8); ctx.lineTo(x,L.y+40); ctx.moveTo(x,L.y2-8); ctx.lineTo(x,L.y2-40); ctx.stroke(); }
    ctx.strokeStyle='#c9c2b0'; ctx.lineWidth=4; ctx.strokeRect(L.x,L.y,L.x2-L.x,L.y2-L.y); }
  // patios, entradas, piscinas y aparcamientos de comercios
  for(const s of solidsIn(x0-150,y0-150,x1+150,y1+150)){ if(s.kind!=='bld') continue; drawLot(s); }
  // carreteras a ras de suelo (solo los trozos que caen en la zona)
  const vis=ROADS.filter(r=>!(r.bb[0]>x1+150||r.bb[2]<x0-150||r.bb[1]>y1+150||r.bb[3]<y0-150));
  const pieces=k=>vis.filter(k).flatMap(r=>groundPieces(r,x0,y0,x1,y1));
  const rails=pieces(r=>r.kind==='rail');
  drawRail(rails,false);
  drawRoadSet(pieces(r=>r.kind!=='hwy'&&r.kind!=='rail'),false,x0,y0,x1,y1);
  drawRoadSet(pieces(r=>r.kind==='hwy'),true,x0,y0,x1,y1);
  drawRail(rails,true);
  drawDeckShadows(vis,x0,y0,x1,y1);
  // farolas
  for(const r of vis){ if(r.kind!=='main'&&r.kind!=='hwy') continue;
    for(let s=60;s<r.len;s+=200){ const p=pointAt(r,s); if(p.x<x0-40||p.x>x1+40||p.y<y0-40||p.y>y1+40) continue;
      if(p.e>DECK_E) continue;
      const side=(Math.floor(s/200)%2)?1:-1, n=p.a+Math.PI/2*side, off=r.w/2+(r.kind==='hwy'?4:SIDEWALK-4);
      const lx=p.x+Math.cos(n)*off, ly=p.y+Math.sin(n)*off;
      if(roadAt(lx,ly,0)&&roadAt(lx,ly,0).r!==r) continue;
      ctx.strokeStyle='#555'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(lx-Math.cos(n)*14,ly-Math.sin(n)*14); ctx.stroke();
      ctx.fillStyle='#333'; ctx.beginPath(); ctx.arc(lx,ly,3,0,7); ctx.fill();
      ctx.fillStyle='#ffe9a8'; ctx.beginPath(); ctx.arc(lx-Math.cos(n)*14,ly-Math.sin(n)*14,2.5,0,7); ctx.fill();
      const L=[lx-Math.cos(n)*14,ly-Math.sin(n)*14]; if(L[0]>=x0&&L[0]<x1&&L[1]>=y0&&L[1]<y1) lights.push(L); } }
}

function drawLot(s){
  const cx=s.x+s.w/2, cy=s.y+s.h/2, fa=Math.atan2(s.fy,s.fx), half=(Math.abs(s.fx)>Math.abs(s.fy)?s.w:s.h)/2;
  const rnd=mulberry((s.seed*1e6)|0);
  if(s.house){
    // patio de grava o césped con muro de bloques
    const e=14;
    ctx.fillStyle=s.yard==='grass'?'#86a05a':'#cbb48e'; ctx.fillRect(s.x-e,s.y-e,s.w+2*e,s.h+2*e);
    ctx.fillStyle=s.yard==='grass'?'rgba(60,90,30,.35)':'rgba(120,95,60,.35)';
    for(let i=0;i<14;i++) ctx.fillRect(s.x-e+rnd()*(s.w+2*e),s.y-e+rnd()*(s.h+2*e),2,2);
    // piscina en el patio trasero
    if(s.pool){ const px=cx-s.fx*(half+14), py=cy-s.fy*(half+14);
      ctx.fillStyle='#e9e3d4'; roundRect(px-16,py-11,32,22,6); ctx.fill(); ctx.fillStyle='#3fb6d8'; roundRect(px-13,py-8,26,16,5); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.6)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(px-8,py-2); ctx.quadraticCurveTo(px-3,py-5,px+2,py-2); ctx.stroke(); }
    ctx.strokeStyle='rgba(130,100,70,.85)'; ctx.lineWidth=2.5; ctx.strokeRect(s.x-e-6,s.y-e-6,s.w+2*e+12,s.h+2*e+12);
    // camino de entrada hasta la calle
    if(s.layer===0){ rot(cx,cy,fa,()=>{ const lat=(rnd()-.5)*(Math.min(s.w,s.h)*0.4);
      ctx.fillStyle='#a8a296'; ctx.fillRect(half-2,lat-10,s.toRoad-half+4,20);
      ctx.fillStyle='rgba(0,0,0,.08)'; ctx.fillRect(half-2,lat-10,s.toRoad-half+4,3);
      ctx.fillStyle='#d9cfb8'; ctx.fillRect(half,lat-16,8,6); }); }
  } else {
    // aparcamiento de comercio
    rot(cx,cy,fa,()=>{ const wid=(Math.abs(s.fx)>Math.abs(s.fy)?s.h:s.w)+20;
      ctx.fillStyle='#57585c'; ctx.fillRect(half-4,-wid/2,s.toRoad-half+4,wid);
      ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=1.5;
      for(let y=-wid/2+12;y<wid/2-6;y+=16){ ctx.beginPath(); ctx.moveTo(half+4,y); ctx.lineTo(half+30,y); ctx.stroke(); } });
    ctx.fillStyle='#a49f94'; ctx.fillRect(s.x-6,s.y-6,s.w+12,s.h+12);
  }
}

// ---------- TRAMOS ELEVADOS (puentes, rampas, autopistas) ----------
// recorre un tramo elevado devolviendo trozos visibles de muestras {p,lx,ly}
function deckPieces(r,d,x0,y0,x1,y1){
  const pieces=[]; let cur=null; const m=500;
  const samples=[]; for(let s=d[0];s<d[1];s+=12) samples.push(s); samples.push(d[1]);
  for(const s of samples){ const p=pointAt(r,s);
    if(p.x<x0-m||p.x>x1+m||p.y<y0-m||p.y>y1+m){ cur=null; continue; }
    if(!cur){ cur=[]; pieces.push(cur); }
    const [lx,ly]=liftOf(p.x,p.y,Math.max(0,p.e)); cur.push({p,lx,ly,s}); }
  return pieces.filter(c=>c.length>1);
}
// en el suelo: sombra del tablero y pilares
function drawDeckShadows(vis,x0,y0,x1,y1){
  for(const r of vis) for(const d of (r.decks||[])) for(const pc of deckPieces(r,d,x0,y0,x1,y1)){
    ctx.save(); ctx.lineCap='butt'; ctx.lineJoin='round'; ctx.strokeStyle='rgba(0,0,0,.28)'; ctx.lineWidth=r.w+10;
    ctx.beginPath(); pc.forEach((q,i)=>{ const k=Math.min(1,q.p.e/6); i?ctx.lineTo(q.p.x+12*k,q.p.y+14*k):ctx.moveTo(q.p.x+12*k,q.p.y+14*k); }); ctx.stroke(); ctx.restore();
    // pilares cada ~200 donde hay altura suficiente y no caen sobre otra calzada
    for(let i=0;i<pc.length;i+=17){ const q=pc[i]; if(q.p.e<3) continue;
      for(const lat of [-0.3,0.3]){ const nx=Math.cos(q.p.a+Math.PI/2)*r.w*lat, ny=Math.sin(q.p.a+Math.PI/2)*r.w*lat, px=q.p.x+nx, py=q.p.y+ny;
        const o=roadAt(px,py,6); if(o&&o.r!==r) continue;
        ctx.fillStyle='rgba(0,0,0,.3)'; ctx.fillRect(px-7,py-5,16,16);
        ctx.fillStyle='#9a958b'; ctx.fillRect(px-8,py-8,16,16); ctx.fillStyle='#b8b2a6'; ctx.fillRect(px-8,py-8,16,5); } }
  }
}
// el tablero elevado (encima de los coches que pasan por debajo)
function drawOverpasses(){
  const z=cam.z, x0=cam.x, y0=cam.y, x1=x0+VW/z, y1=y0+VH/z;
  const vis=ROADS.filter(r=>r.decks&&r.decks.length&&!(r.bb[0]>x1+500||r.bb[2]<x0-500||r.bb[1]>y1+500||r.bb[3]<y0-500));
  const merges=new Map();
  for(const c of CROSSINGS){
    if(!c.level) continue;
    const h=c.a.kind==='hwy'?c.a:c.b.kind==='hwy'?c.b:null;
    const ramp=c.a.kind==='ramp'?c.a:c.b.kind==='ramp'?c.b:null;
    if(h&&ramp){
      const hs=c.a===h?c.sa:c.sb, rs=c.a===ramp?c.sa:c.sb;
      if(Math.min(Math.abs(rs),Math.abs(rs-ramp.len))>1) continue;
      const hp=pointAt(h,hs), rp=pointAt(ramp,rs), dx=rp.x-hp.x, dy=rp.y-hp.y;
      const side=Math.sign(Math.cos(hp.a)*dy-Math.sin(hp.a)*dx)||1;
      let join=ramp._deckJoin;
      if(!join){
        let h0=hs,h1=hs,r0=rs,r1=rs,rampSide=0;
        for(let s=0;s<=ramp.len;s+=24){
          const p=pointAt(ramp,s); if(p.e<=DECK_E) continue;
          const near=nearestRoad(p.x,p.y,q=>q===h,p.z);
          if(!near||near.d>(h.w+ramp.w)/2+8) continue;
          const hp2=pointAt(h,near.s), dx2=p.x-hp2.x, dy2=p.y-hp2.y;
          const hs2=Math.sign(Math.cos(hp2.a)*dy2-Math.sin(hp2.a)*dx2)||1;
          if(hs2!==side) continue;
          const rx=hp2.x-p.x, ry=hp2.y-p.y;
          const rsd=Math.sign(Math.cos(p.a)*ry-Math.sin(p.a)*rx)||-side;
          if(!rampSide) rampSide=rsd;
          if(rsd!==rampSide) continue;
          h0=Math.min(h0,near.s); h1=Math.max(h1,near.s); r0=Math.min(r0,s); r1=Math.max(r1,s);
        }
        join={h,side,rampSide,h0:Math.max(0,h0-h.w*0.12),h1:Math.min(h.len,h1+h.w*0.12),r0:Math.max(0,r0-24),r1:Math.min(ramp.len,r1+24)};
        ramp._deckJoin=join;
      }
      if(!merges.has(h)) merges.set(h,[]);
      merges.get(h).push(join);
      continue;
    }
    // En cruces elevados a la misma altura, interrumpir ambos pretiles para
    // formar una intersección continua en vez de dibujar una calzada encima.
    const A=pointAt(c.a,c.sa), B=pointAt(c.b,c.sb);
    if(!c.a.decks.length||!c.b.decks.length||A.e<=DECK_E||B.e<=DECK_E) continue;
    for(const [r,s,other,os] of [[c.a,c.sa,c.b,c.sb],[c.b,c.sb,c.a,c.sa]]){
      const p=pointAt(r,s), q=pointAt(other,os), angle=Math.abs(Math.sin(angDiff(p.a,q.a)));
      const half=other.w*0.5*angle+30;
      if(!merges.has(r)) merges.set(r,[]);
      merges.get(r).push({side:1,h0:Math.max(0,s-half),h1:Math.min(r.len,s+half)});
      merges.get(r).push({side:-1,h0:Math.max(0,s-half),h1:Math.min(r.len,s+half)});
    }
  }
  const items=[];
  for(const r of vis) for(const d of r.decks) for(const pc of deckPieces(r,d,x0,y0,x1,y1)) items.push({r,d,pc,e:Math.max(...pc.map(q=>q.p.e))});
  items.sort((a,b)=>a.e-b.e);   // los más altos encima
  for(const {r,d,pc} of items){
    const lifted=new Path2D(), wallL=[], wallR=[];
    pc.forEach((q,i)=>{ const p=q.p; i?lifted.lineTo(p.x+q.lx,p.y+q.ly):lifted.moveTo(p.x+q.lx,p.y+q.ly);
      const nx=Math.cos(p.a+Math.PI/2)*(r.w/2+6), ny=Math.sin(p.a+Math.PI/2)*(r.w/2+6);
      wallL.push([p.x+nx,p.y+ny,p.x+nx+q.lx,p.y+ny+q.ly]); wallR.push([p.x-nx,p.y-ny,p.x-nx+q.lx,p.y-ny+q.ly]); });
    // Abrir el pretil de la autopista donde entra una rampa y hacer que los
    // pretiles de la propia rampa terminen antes del carril de incorporación.
    const wallRuns=[];
    const wallGap=(side,s)=>(r.kind==='ramp'&&r._deckJoin&&r._deckJoin.rampSide===side&&s>=r._deckJoin.r0&&s<=r._deckJoin.r1)
      || (merges.get(r)||[]).some(m=>m.side===side&&s>=m.h0&&s<=m.h1);
    for(const [side,W] of [[1,wallL],[-1,wallR]]){
      let run=[W[0]];
      for(let i=0;i<W.length-1;i++){
        if(wallGap(side,(pc[i].s+pc[i+1].s)/2)){
          if(run.length>1) wallRuns.push(run);
          run=[];
        } else { if(!run.length) run.push(W[i]); run.push(W[i+1]); }
      }
      if(run.length>1) wallRuns.push(run);
    }
    for(const W of wallRuns){
      ctx.fillStyle='#857f74'; ctx.beginPath();
      W.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));
      for(let i=W.length-1;i>=0;i--) ctx.lineTo(W[i][2],W[i][3]);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=1; ctx.beginPath(); W.forEach((q,i)=>{ if(i%5===0){ ctx.moveTo(q[0],q[1]); ctx.lineTo(q[2],q[3]); } }); ctx.stroke();
    }
    // Cerrar solo los extremos reales de un puente; nunca los cortes de
    // cámara ni las puntas de una rampa que se incorpora a la autopista.
    if(r.kind!=='ramp') for(const q of [pc[0],pc[pc.length-1]]){
      const trueStart=q.s<0.5&&r.elev[0]>DECK_E&&!r.ends[0];
      const trueEnd=q.s>r.len-0.5&&r.elev[r.elev.length-1]>DECK_E&&!r.ends[1];
      if(!trueStart&&!trueEnd) continue;
      const nx=Math.cos(q.p.a+Math.PI/2)*r.w/2, ny=Math.sin(q.p.a+Math.PI/2)*r.w/2;
      ctx.fillStyle='#857f74'; ctx.beginPath();
      ctx.moveTo(q.p.x+nx,q.p.y+ny); ctx.lineTo(q.p.x-nx,q.p.y-ny);
      ctx.lineTo(q.p.x-nx+q.lx,q.p.y-ny+q.ly); ctx.lineTo(q.p.x+nx+q.lx,q.p.y+ny+q.ly);
      ctx.closePath(); ctx.fill();
    }
    // tablero: la misma carretera siguiendo el trazado elevado
    drawRoadSet([{...r,path:lifted}],true,x0,y0,x1,y1,true);
    // pretiles de hormigón
    ctx.strokeStyle='#d8d2c4'; ctx.lineWidth=4; ctx.lineCap='butt';
    for(const W of wallRuns){ ctx.beginPath(); W.forEach((q,i)=>i?ctx.lineTo(q[2],q[3]):ctx.moveTo(q[2],q[3])); ctx.stroke(); }
    ctx.lineCap='round';
  }
  // Unir visualmente los tableros que se cruzan a la misma altura. Los
  // pretiles ya se abren arriba; este asfalto cubre las juntas que dejaban
  // ver los extremos de cada calzada en el centro del cruce.
  for(const c of CROSSINGS){
    if(!c.level||c.x<x0-300||c.x>x1+300||c.y<y0-300||c.y>y1+300) continue;
    const A=pointAt(c.a,c.sa), B=pointAt(c.b,c.sb);
    if(!c.a.decks.length||!c.b.decks.length||A.e<=DECK_E||B.e<=DECK_E||Math.abs(A.e-B.e)>0.35) continue;
    const sin=Math.max(0.4,Math.abs(Math.sin(angDiff(A.a,B.a))));
    for(const [r,s,o] of [[c.a,c.sa,c.b],[c.b,c.sb,c.a]]){
      const half=(o.w/2+10)/sin, s0=Math.max(0,s-half), s1=Math.min(r.len,s+half);
      const p0=pointAt(r,s0), p1=pointAt(r,s1), corners=[];
      const [l0x,l0y]=liftOf(p0.x,p0.y,Math.max(0,p0.e)), [l1x,l1y]=liftOf(p1.x,p1.y,Math.max(0,p1.e));
      for(const [p,side] of [[p0,1],[p1,1],[p1,-1],[p0,-1]]){
        const nx=Math.cos(p.a+Math.PI/2)*r.w/2*side, ny=Math.sin(p.a+Math.PI/2)*r.w/2*side;
        const lift=p===p0?[l0x,l0y]:[l1x,l1y], px=p.x+nx, py=p.y+ny;
        corners.push([px+lift[0],py+lift[1]]);
      }
      ctx.fillStyle='#3e3e41'; ctx.beginPath();
      corners.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));
      ctx.closePath(); ctx.fill();
    }
  }
}
// vía del tren: balasto, traviesas y dos raíles (la vía va de este a oeste: raíles desplazados en vertical)
function drawRail(list,top){
  ctx.lineJoin='round'; ctx.lineCap='butt';
  for(const r of list){
    if(!top){ ctx.strokeStyle='#8f8678'; ctx.lineWidth=r.w; ctx.stroke(r.path); continue; }
    ctx.strokeStyle='#5a4532'; ctx.lineWidth=44; ctx.setLineDash([7,11]); ctx.stroke(r.path); ctx.setLineDash([]);
    for(const off of [-11,11]){ ctx.save(); ctx.translate(0,off); ctx.strokeStyle='#4a4e54'; ctx.lineWidth=4; ctx.stroke(r.path); ctx.strokeStyle='#c4c8ce'; ctx.lineWidth=2; ctx.stroke(r.path); ctx.restore(); }
  }
}
function drawRoadSet(list,elev,x0,y0,x1,y1,noShadow){
  if(!list.length) return;
  ctx.lineJoin='round';
  const S=(r,col,w,dash)=>{ ctx.lineCap='butt'; ctx.strokeStyle=col; ctx.lineWidth=w; if(dash){ ctx.setLineDash(dash); ctx.lineDashOffset=r.dashOff||0; } ctx.stroke(r.path); if(dash){ ctx.setLineDash([]); ctx.lineDashOffset=0; } };
  if(elev&&!noShadow) for(const r of list){ ctx.save(); ctx.translate(12,14); S(r,'rgba(0,0,0,.28)',r.w+16); ctx.restore(); }
  for(const r of list){ if(r.kind==='dirt'){ S(r,'#a98b5f',r.w+10); S(r,'#b79a6c',r.w); continue; }
    if(elev){ S(r,'#7f7b73',r.w+14); S(r,'#a7a299',r.w+8); }
    else if(r.kind==='main'){ // acera de ladrillo rojo con bordillo pintado de amarillo (centro de ABQ)
      const A=r.w+SIDEWALK*2;
      S(r,'#8f5440',A+4); S(r,'#b06a4f',A); S(r,'rgba(70,30,20,.3)',A,[2,8]); S(r,'#c27c5f',r.w+SIDEWALK); // ladrillo + franja
      S(r,'#e2c23c',r.w+5); }
    else { const A=r.w+SIDEWALK*2; // acera de hormigón con juntas
      S(r,'#aaa598',A+4); S(r,'#cfcabd',A); S(r,'rgba(0,0,0,.12)',A,[1.5,22]); S(r,'#e3dfd5',r.w+5); } }
  // fondos de saco: glorieta al final de una calle que no desemboca en ninguna otra
  if(!elev) for(const r of list){ if(r.kind!=='street'&&r.kind!=='main') continue;
    for(const end of [0,1]){ if(r.ends[end]) continue; const p=pointAt(r,end?r.len:0); if(p.e>DECK_E) continue;
      if(p.x<x0-200||p.x>x1+200||p.y<y0-200||p.y>y1+200) continue;
      const R=r.w*0.75; ctx.fillStyle=r.kind==='main'?'#b06a4f':'#cfcabd'; ctx.beginPath(); ctx.arc(p.x,p.y,R+SIDEWALK,0,7); ctx.fill();
      ctx.fillStyle=r.kind==='main'?'#e2c23c':'#e3dfd5'; ctx.beginPath(); ctx.arc(p.x,p.y,R+2.5,0,7); ctx.fill(); } }
  for(const r of list){ if(r.kind==='dirt'){ S(r,'rgba(120,95,60,.5)',r.w*0.6,[8,22]); continue; }
    S(r,'#3e3e41',r.w); }
  if(!elev) for(const r of list){ if(r.kind!=='street'&&r.kind!=='main') continue;
    for(const end of [0,1]){ if(r.ends[end]) continue; const p=pointAt(r,end?r.len:0); if(p.e>DECK_E) continue;
      if(p.x<x0-200||p.x>x1+200||p.y<y0-200||p.y>y1+200) continue;
      ctx.fillStyle='#3e3e41'; ctx.beginPath(); ctx.arc(p.x,p.y,r.w*0.75,0,7); ctx.fill(); } }
  // marcas viales
  for(const r of list){ const A='#3e3e41';
    if(r.kind==='hwy'){ S(r,'#eeeeee',r.w-8); S(r,A,r.w-12); S(r,'#e8e8e8',r.w*0.5+2,[30,26]); S(r,A,r.w*0.5-2); S(r,'#d9b53a',7); S(r,A,2.5); }
    else if(r.kind==='main'){ S(r,'#dedede',r.w-8); S(r,A,r.w-11); S(r,'#d9b53a',6); S(r,A,2); }
    else if(r.kind==='ramp'){ S(r,'#dedede',r.w-8); S(r,A,r.w-11); }
    else if(r.kind==='street'){ S(r,'rgba(217,181,58,.75)',2,[18,16]); } }
  // cruces a nivel: tapar las marcas dentro del cruce y pintar pasos de cebra
  if(!elev) for(const c of CROSSINGS){
    if(!c.level||c.e>DECK_E||c.x<x0-200||c.x>x1+200||c.y<y0-200||c.y>y1+200) continue;
    if(c.a.kind==='hwy'||c.b.kind==='hwy'||c.a.kind==='dirt'||c.b.kind==='dirt'||c.a.kind==='rail'||c.b.kind==='rail') continue;
    const sinA=Math.max(0.4,Math.abs(Math.sin(pointAt(c.a,c.sa).a-pointAt(c.b,c.sb).a)));
    // cada calzada se repinta lisa a lo ancho de la otra: el cruce queda limpio, sin líneas cruzadas
    ctx.strokeStyle='#3e3e41'; ctx.lineCap='butt';
    for(const [r,s,o] of [[c.a,c.sa,c.b],[c.b,c.sb,c.a]]){ const h=(o.w/2)/sinA+2;
      ctx.lineWidth=r.w; ctx.beginPath(); for(let k=-h;k<=h+0.1;k+=Math.max(4,h/4)){ const p=pointAt(r,s+k); k===-h?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y); } ctx.stroke(); }
    for(const [r,s,o] of [[c.a,c.sa,c.b],[c.b,c.sb,c.a]]) for(const side of [-1,1]){
      const ds=s+side*((o.w/2+SIDEWALK*0.6)/sinA+6);
      if(ds<0||ds>r.len) continue;                                      // la calle termina en el cruce (T)
      const p=pointAt(r,ds);
      const on=roadAt(p.x,p.y,4); if(on&&on.r!==r) continue;          // caería dentro de otra calzada
      if(segsAt(p.x,p.y).some(g=>g.r!==r&&g.r!==o&&g.r.kind!=='hwy'&&segDist(p.x,p.y,g.x1,g.y1,g.x2,g.y2)<g.w/2+r.w/2)) continue;
      rot(p.x,p.y,p.a,()=>{ ctx.fillStyle='rgba(240,240,240,.8)'; for(let y=-r.w/2+5;y<r.w/2-5;y+=9) ctx.fillRect(-5,y,10,5);
        ctx.fillStyle='rgba(240,240,240,.85)'; ctx.fillRect(side*9-1.5,0,3,r.w/2-3); });
    }
  }
}

function drawTree(x,y,r,c,bare,variant){
  if(bare){ // álamo/olmo en invierno: ramas desnudas
    ctx.fillStyle='rgba(0,0,0,.16)'; ctx.beginPath(); ctx.arc(x+r*0.5,y+r*0.5,r,0,7); ctx.fill();
    ctx.strokeStyle='rgba(120,95,70,.9)'; ctx.lineCap='round';
    const rnd=mulberry(variant!==undefined?variant*7919+r:(x*31+y)|0), n=7;
    for(let i=0;i<n;i++){ const a=i/n*6.283+rnd()*0.6, l=r*(0.7+rnd()*0.35);
      const mx=x+Math.cos(a)*l*0.5, my=y+Math.sin(a)*l*0.5;
      ctx.lineWidth=r*0.12; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(mx,my); ctx.stroke();
      ctx.lineWidth=r*0.05; ctx.beginPath();
      for(const d of [-0.45,0.45]){ ctx.moveTo(mx,my); ctx.lineTo(x+Math.cos(a+d)*l,y+Math.sin(a+d)*l); } ctx.stroke(); }
    ctx.fillStyle='rgba(200,170,130,.18)'; ctx.beginPath(); ctx.arc(x,y,r*0.9,0,7); ctx.fill(); // ramillas finas
    ctx.fillStyle='#8a7258'; ctx.beginPath(); ctx.arc(x,y,r*0.16,0,7); ctx.fill();
    return; }
  ctx.fillStyle='rgba(0,0,0,.22)'; ctx.beginPath(); ctx.arc(x+r*0.5,y+r*0.5,r,0,7); ctx.fill();
  const base=c<.33?'#4d6f34':c<.66?'#5f7d3a':'#6f8a3e';
  ctx.fillStyle=base; ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.15)'; ctx.beginPath(); ctx.arc(x+r*0.3,y+r*0.3,r*0.7,0,7); ctx.fill();
  ctx.fillStyle='rgba(190,220,120,.25)'; ctx.beginPath(); ctx.arc(x-r*0.35,y-r*0.35,r*0.5,0,7); ctx.fill();
}

function drawBuildings(){
  const z=cam.z, x0=cam.x, y0=cam.y, x1=x0+VW/z, y1=y0+VH/z;
  const ccx=x0+VW/z/2, ccy=y0+VH/z/2;
  for(const tr of treesIn(x0-30,y0-30,x1+30,y1+30)) drawTreeSprite(tr);
  const list=VIS.slice().sort((a,b)=>(a.y+a.h)-(b.y+b.h));
  for(const s of list){
    if(s.x>x1+60||s.y>y1+60||s.x+s.w<x0-60||s.y+s.h<y0-60) continue;
    if(s.kind==='cactus'){ const x=s.x+9,y=s.y+9;
      ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(x-2,y,14,4);
      ctx.fillStyle='#3e6b2e'; roundRect(x-3,y-16,7,26,3); ctx.fill(); roundRect(x-11,y-8,6,12,3); ctx.fill(); roundRect(x+5,y-12,6,12,3); ctx.fill();
      ctx.fillRect(x-8,y,8,3); ctx.fillRect(x+2,y-3,6,3);
      ctx.fillStyle='rgba(255,255,255,.2)'; ctx.fillRect(x-2,y-14,2,22); continue; }
    const hgt = s.kind==='mesa'?0.14 : s.kind==='special'?0.06 : s.tall?0.06+s.seed*0.05 : s.house?0.025+s.seed*0.012 : 0.045;
    // desplazamiento del tejado por la perspectiva, limitado: si no, en los bordes de la pantalla los edificios
    // altos se estiraban en franjas larguísimas que tapaban calles y otros edificios
    let ox=(s.x+s.w/2-ccx)*hgt, oy=(s.y+s.h/2-ccy)*hgt;
    const omax=Math.min(s.kind==='mesa'?60:s.tall?34:16, Math.min(s.w,s.h)*0.45), ol=Math.hypot(ox,oy);
    if(ol>omax){ ox*=omax/ol; oy*=omax/ol; }
    ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(s.x+6,s.y+8,s.w+ (s.tall?20:4),s.h+(s.tall?24:4));
    // paredes
    ctx.fillStyle=s.kind==='mesa'?s.wall:(s._wd||(s._wd=shade(s.wall,-25)));
    // paredes como un prisma: la planta y las cuatro caras que la unen con el tejado desplazado.
    // (la silueta fija de antes solo valía para edificios a un lado de la cámara: en los demás faltaba pared)
    { const x0=s.x,y0=s.y,x1=s.x+s.w,y1=s.y+s.h, base=ctx.fillStyle, dark=s.kind==='mesa'?base:shade(s.wall,-45);
      const face=(ax,ay,bx,by,c)=>{ ctx.fillStyle=c; ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.lineTo(bx+ox,by+oy); ctx.lineTo(ax+ox,ay+oy); ctx.closePath(); ctx.fill(); };
      ctx.fillRect(x0,y0,s.w,s.h);
      face(x0,y0,x1,y0,base); face(x1,y0,x1,y1,base); face(x0,y0,x0,y1,base);
      face(x0,y1,x1,y1,dark);                                   // fachada sur, en sombra
      ctx.fillStyle=base; }
    if(s.tall){ ctx.strokeStyle='rgba(30,50,70,.45)'; ctx.lineWidth=2; for(let k=0.2;k<1;k+=0.2){ ctx.beginPath(); ctx.moveTo(s.x+ox*k,s.y+s.h+oy*k); ctx.lineTo(s.x+s.w+ox*k,s.y+s.h+oy*k); ctx.stroke(); } }
    const rx=s.x+ox, ry=s.y+oy;
    // el tejado no depende de la cámara: se pinta una vez en un sprite y luego solo se copia
    ctx.drawImage(roofSprite(s),rx-ROOF_PAD,ry-ROOF_PAD);
  }
}
const ROOF_PAD=36;
// Tejados como sprites individuales, con un límite (LRU) y un "pool" por tamaño: al expulsar un
// tejado su lienzo se reutiliza para otro del mismo tamaño, sin crear lienzos nuevos (el recolector
// de basura de Chrome daba tirones de ~600 ms cada pocos segundos por crear lienzos sin parar).
const ROOF_MAX=500, ROOF_LRU=[], ROOF_POOL=new Map();
function roofSprite(s){
  if(s._roof){ s._roofUse=++tileUse; return s._roof; }
  const w=Math.ceil((s.w+ROOF_PAD*2)/32)*32, h=Math.ceil((s.h+ROOF_PAD*2)/32)*32, key=w*10000+h;
  if(ROOF_LRU.length>=ROOF_MAX){ // expulsar el menos usado de una muestra y devolver su lienzo al pool
    let bi=0; for(let i=1;i<24;i++){ const j=(Math.random()*ROOF_LRU.length)|0; if(ROOF_LRU[j]._roofUse<ROOF_LRU[bi]._roofUse) bi=j; }
    const old=ROOF_LRU[bi]; ROOF_LRU[bi]=ROOF_LRU[ROOF_LRU.length-1]; ROOF_LRU.pop();
    const pk=old._roof.width*10000+old._roof.height; if(!ROOF_POOL.has(pk)) ROOF_POOL.set(pk,[]); ROOF_POOL.get(pk).push(old._roof); old._roof=null; }
  const pool=ROOF_POOL.get(key); let c=pool&&pool.pop();
  if(!c){ c=document.createElement('canvas'); c.width=w; c.height=h; }
  const saved=ctx; ctx=c.getContext('2d');
  try{ ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,w,h); drawRoof(s,ROOF_PAD,ROOF_PAD); } finally { ctx=saved; }
  s._roofUse=++tileUse; ROOF_LRU.push(s);
  return s._roof=c;
}
// árboles: un sprite por tamaño/color/tipo (hay decenas de miles en el mapa)
const TREE_SPR=new Map();
function drawTreeSprite(tr){
  const bare=tr.bare||((tr.r*977)|0)%3===0, r=Math.round(tr.r), cb=tr.c<.33?0:tr.c<.66?1:2, v=bare?((tr.x|0)%4):0, key=r*100+cb*10+v+(bare?1000:0);
  let c=TREE_SPR.get(key);
  if(!c){ const S=Math.ceil(r*3.2+8); c=document.createElement('canvas'); c.width=c.height=S;
    const saved=ctx; ctx=c.getContext('2d'); try{ drawTree(S/2-r*0.25,S/2-r*0.25,r,cb*0.33+0.1,bare,v); } finally { ctx=saved; }
    c.off=S/2-r*0.25; TREE_SPR.set(key,c); }
  ctx.drawImage(c,tr.x-c.off,tr.y-c.off);
}
function drawRoof(s,rx,ry){
    if(s.kind==='mesa'){ ctx.fillStyle=s.roof; ctx.fillRect(rx,ry,s.w,s.h); ctx.fillStyle='rgba(255,255,255,.08)'; ctx.fillRect(rx+6,ry+6,s.w*0.5,s.h*0.4);
      ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=2; for(let i=1;i<4;i++){ ctx.beginPath(); ctx.moveTo(rx,ry+s.h*i/4); ctx.lineTo(rx+s.w,ry+s.h*i/4+6); ctx.stroke(); } return; }
    if(s.kind==='special'){ drawSpecialRoof(s,rx,ry); return; }
    if(s.house) drawHouseRoof(s,rx,ry); else drawCommRoof(s,rx,ry);
}

function drawHouseRoof(s,rx,ry){
  const rnd=mulberry((s.seed*1e6)|0), w=s.w, h=s.h;
  if(s.roof==='pitched'){
    // tejado de teja a dos aguas
    const horiz=w>=h; const base='#b45f3e';
    ctx.fillStyle=base; ctx.fillRect(rx,ry,w,h);
    ctx.fillStyle='rgba(0,0,0,.18)'; if(horiz) ctx.fillRect(rx,ry+h/2,w,h/2); else ctx.fillRect(rx+w/2,ry,w/2,h);
    ctx.strokeStyle='rgba(80,30,15,.35)'; ctx.lineWidth=1;
    ctx.beginPath(); if(horiz){ for(let x=rx+3;x<rx+w;x+=4){ ctx.moveTo(x,ry); ctx.lineTo(x,ry+h); } } else { for(let y=ry+3;y<ry+h;y+=4){ ctx.moveTo(rx,y); ctx.lineTo(rx+w,y); } } ctx.stroke();
    ctx.strokeStyle='#8a4128'; ctx.lineWidth=3; ctx.beginPath(); if(horiz){ ctx.moveTo(rx+2,ry+h/2); ctx.lineTo(rx+w-2,ry+h/2); } else { ctx.moveTo(rx+w/2,ry+2); ctx.lineTo(rx+w/2,ry+h-2); } ctx.stroke();
  } else {
    // tejado plano estilo pueblo con pretil y vigas
    ctx.fillStyle=shade(s.wall,-8); ctx.fillRect(rx,ry,w,h);
    ctx.fillStyle=shade(s.wall,-30); ctx.fillRect(rx+4,ry+4,w-8,h-8);
    ctx.fillStyle='rgba(255,255,255,.06)'; ctx.fillRect(rx+4,ry+4,w-8,(h-8)/2);
    ctx.strokeStyle=shade(s.wall,15); ctx.lineWidth=3; ctx.strokeRect(rx+1.5,ry+1.5,w-3,h-3);
    // vigas en la fachada
    ctx.fillStyle='#5a3a22';
    if(Math.abs(s.fx)>Math.abs(s.fy)){ const ex=s.fx>0?rx+w:rx-4; for(let y=ry+6;y<ry+h-4;y+=8) ctx.fillRect(ex,y,4,3); }
    else { const ey=s.fy>0?ry+h:ry-4; for(let x=rx+6;x<rx+w-4;x+=8) ctx.fillRect(x,ey,3,4); }
    // canal de desagüe
    ctx.fillStyle='#7a6a55'; ctx.fillRect(s.fx>0?rx-5:rx+w,ry+h*0.6,5,3);
  }
  // swamp cooler / placas solares / chimenea
  if(s.cooler){ const cx=rx+w*(0.25+rnd()*0.5)-6, cy=ry+h*(0.25+rnd()*0.5)-5;
    ctx.fillStyle='rgba(0,0,0,.3)'; ctx.fillRect(cx+2,cy+2,12,10); ctx.fillStyle='#9a9a98'; ctx.fillRect(cx,cy,12,10);
    ctx.strokeStyle='#6e6e6c'; ctx.lineWidth=1; for(let k=2;k<12;k+=3){ ctx.beginPath(); ctx.moveTo(cx+k,cy+1); ctx.lineTo(cx+k,cy+9); ctx.stroke(); } }
  if(s.seed>0.82 && w>48){ const px=rx+6, py=ry+6; ctx.fillStyle='#1f3352'; ctx.fillRect(px,py,22,14); ctx.strokeStyle='rgba(150,180,220,.5)'; ctx.lineWidth=0.7; for(let k=5;k<22;k+=5){ ctx.beginPath(); ctx.moveTo(px+k,py); ctx.lineTo(px+k,py+14); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(px,py+7); ctx.lineTo(px+22,py+7); ctx.stroke(); }
  if(s.seed<0.25){ ctx.fillStyle='#7a5a44'; ctx.fillRect(rx+w-12,ry+5,7,7); ctx.fillStyle='#3a2a20'; ctx.fillRect(rx+w-11,ry+6,5,5); }
}
function drawCommRoof(s,rx,ry){
  const rnd=mulberry((s.seed*1e6)|0), w=s.w, h=s.h;
  if(!s.tall && s.seed<0.45){ drawMissionRoof(s,rx,ry); drawSign(s,rx,ry); return; }
  ctx.fillStyle=s.tall?'#6d717a':'#9b978f'; ctx.fillRect(rx,ry,w,h);
  ctx.fillStyle=s.tall?'#5a5e66':'#8c887f'; ctx.fillRect(rx+4,ry+4,w-8,h-8);
  ctx.strokeStyle='rgba(0,0,0,.12)'; ctx.lineWidth=1; for(let y=ry+12;y<ry+h-4;y+=12){ ctx.beginPath(); ctx.moveTo(rx+4,y); ctx.lineTo(rx+w-4,y); ctx.stroke(); }
  const n=2+((rnd()*3)|0);
  for(let i=0;i<n;i++){ const ux=rx+8+rnd()*(w-30), uy=ry+8+rnd()*(h-28);
    ctx.fillStyle='rgba(0,0,0,.3)'; ctx.fillRect(ux+2,uy+2,18,14); ctx.fillStyle='#b4b4b0'; ctx.fillRect(ux,uy,18,14);
    ctx.fillStyle='#55575a'; ctx.beginPath(); ctx.arc(ux+9,uy+7,5,0,7); ctx.fill(); ctx.strokeStyle='#999'; ctx.beginPath(); ctx.moveTo(ux+4,uy+7); ctx.lineTo(ux+14,uy+7); ctx.stroke(); }
  if(s.tall){ ctx.strokeStyle='#d8c040'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(rx+w/2,ry+h/2,Math.min(w,h)*0.25,0,7); ctx.stroke(); ctx.fillStyle='#d8c040'; ctx.font='bold 14px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('H',rx+w/2,ry+h/2); return; }
  drawSign(s,rx,ry);
}
// tejado a cuatro aguas; style 'tile' = teja árabe, 'metal' = chapa con juntas alzadas
function drawHipRoof(rx,ry,w,h,base,style){
  const m=Math.min(w,h)/2, cx1=rx+m, cx2=rx+w-m, cy1=ry+m, cy2=ry+h-m;
  const faces=[[ [rx,ry],[rx+w,ry],[cx2,cy1],[cx1,cy1] ,10],
               [ [rx+w,ry],[rx+w,ry+h],[cx2,cy2],[cx2,cy1] ,-12],
               [ [rx+w,ry+h],[rx,ry+h],[cx1,cy2],[cx2,cy2] ,-26],
               [ [rx,ry+h],[rx,ry],[cx1,cy1],[cx1,cy2] ,0]];
  ctx.save(); ctx.beginPath(); ctx.rect(rx,ry,w,h); ctx.clip();
  for(const [a,b,c,d,sh] of faces){ ctx.fillStyle=shade(base,sh); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...c); ctx.lineTo(...d); ctx.closePath(); ctx.fill(); }
  // juntas / hileras de tejas, perpendiculares al alero
  ctx.strokeStyle=style==='tile'?'rgba(90,35,15,.35)':'rgba(255,255,255,.22)'; ctx.lineWidth=style==='tile'?1.4:0.8;
  const g=style==='tile'?4:5; ctx.beginPath();
  for(let x=rx+g;x<rx+w;x+=g){ ctx.moveTo(x,ry); ctx.lineTo(x,ry+Math.min(m,Math.min(x-rx,rx+w-x))); ctx.moveTo(x,ry+h); ctx.lineTo(x,ry+h-Math.min(m,Math.min(x-rx,rx+w-x))); }
  for(let y=ry+g;y<ry+h;y+=g){ const k=Math.min(m,Math.min(y-ry,ry+h-y)); ctx.moveTo(rx,y); ctx.lineTo(rx+k,y); ctx.moveTo(rx+w,y); ctx.lineTo(rx+w-k,y); }
  ctx.stroke();
  if(style==='tile'){ ctx.strokeStyle='rgba(90,35,15,.25)'; ctx.lineWidth=1; ctx.setLineDash([2,4]); ctx.stroke(); ctx.setLineDash([]); }
  // limatesas y cumbrera
  ctx.strokeStyle=shade(base,style==='tile'?-35:25); ctx.lineWidth=2; ctx.beginPath();
  ctx.moveTo(rx,ry); ctx.lineTo(cx1,cy1); ctx.lineTo(cx2,cy1); ctx.lineTo(rx+w,ry); ctx.moveTo(rx,ry+h); ctx.lineTo(cx1,cy2); ctx.lineTo(cx2,cy2); ctx.lineTo(rx+w,ry+h);
  ctx.moveTo(cx1,cy1); ctx.lineTo(cx1,cy2); ctx.moveTo(cx2,cy1); ctx.lineTo(cx2,cy2); ctx.stroke();
  ctx.restore();
}
// estilo "Mission Revival" (como la estación Alvarado): estuco, teja naranja, remates turquesa, torre con cúpula azul
function drawMissionRoof(s,rx,ry){
  const w=s.w, h=s.h;
  ctx.fillStyle=s.wall; ctx.fillRect(rx-3,ry-3,w+6,h+6);
  drawHipRoof(rx+2,ry+2,w-4,h-4,'#d9692e','tile');
  ctx.strokeStyle='#2fa59a'; ctx.lineWidth=2; ctx.strokeRect(rx-3,ry-3,w+6,h+6);
  if(s.seed<0.18){ // torre con cúpula
    const tx=s.fx<0?rx+6:rx+w-22, ty=s.fy<0?ry+6:ry+h-22;
    ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(tx+3,ty+3,18,18);
    ctx.fillStyle=shade(s.wall,12); ctx.fillRect(tx,ty,18,18);
    ctx.fillStyle='#1f4fa3'; ctx.beginPath(); ctx.arc(tx+9,ty+9,6.5,0,7); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.4)'; ctx.beginPath(); ctx.arc(tx+7,ty+7,2.5,0,7); ctx.fill(); }
}
// Los Pollos Hermanos: estuco melocotón, pretil escalonado rojo, rótulo amarillo y ventanas azules
function drawPollosRoof(s,rx,ry){
  const w=s.w, h=s.h, RED='#c8281e';
  ctx.fillStyle=s.roof; ctx.fillRect(rx,ry,w,h);
  ctx.fillStyle=shade(s.roof,-14); ctx.fillRect(rx+6,ry+6,w-12,h-12);
  ctx.strokeStyle=RED; ctx.lineWidth=5; ctx.strokeRect(rx+2.5,ry+2.5,w-5,h-5);
  // escalón central del pretil en la fachada
  ctx.fillStyle=RED; ctx.fillRect(rx+w*0.3,ry+h-12,w*0.4,10);
  // ventanas azules en la fachada
  ctx.fillStyle='#1f6fd1'; for(const f of [0.12,0.22,0.78]) ctx.fillRect(rx+w*f,ry+h-1,w*0.07,4);
  // equipos de aire en el tejado
  ctx.fillStyle='#b4b4b0'; ctx.fillRect(rx+w*0.15,ry+h*0.2,18,14); ctx.fillRect(rx+w*0.7,ry+h*0.25,18,14);
  // rótulo
  ctx.save(); const sw=Math.min(w*0.8,200), sh=34, sx=rx+w/2-sw/2, sy=ry+h/2-sh/2;
  ctx.fillStyle=RED; ctx.fillRect(sx-3,sy-3,sw+6,sh+6); ctx.fillStyle='#f2c41a'; ctx.fillRect(sx,sy,sw,sh);
  ctx.fillStyle='#2a8fd6'; ctx.beginPath(); ctx.arc(rx+w/2,sy+sh/2,13,0,7); ctx.fill();
  ctx.fillStyle='#f0a020'; ctx.beginPath(); ctx.arc(rx+w/2-4,sy+sh/2+3,5,0,7); ctx.arc(rx+w/2+4,sy+sh/2+3,5,0,7); ctx.fill(); // pollitos
  ctx.fillStyle='#d01f1f'; ctx.fillRect(rx+w/2-6,sy+sh/2-7,3,4); ctx.fillRect(rx+w/2+3,sy+sh/2-7,3,4);
  ctx.font='bold 12px Georgia,serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle=RED;
  ctx.fillText('LOS POLLOS',sx+(sw/2-15)/2,sy+sh/2+1); ctx.fillText('HERMANOS',sx+sw-(sw/2-15)/2,sy+sh/2+1);
  ctx.restore();
}
function drawSign(s,rx,ry){
  const w=s.w, h=s.h;
  // rótulo hacia la calle
  const name=BIZ[(s.seed*BIZ.length*7|0)%BIZ.length];
  ctx.save(); ctx.font='bold 11px "Segoe UI",Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
  const tx=rx+w/2+s.fx*(w/2-9), ty=ry+h/2+s.fy*(h/2-9);
  const tw=ctx.measureText(name).width+8;
  ctx.fillStyle=['#a8322a','#1f5f8a','#e0a020','#2f7a46','#6a2a7a'][(s.seed*13|0)%5]; ctx.fillRect(tx-tw/2,ty-7,tw,14);
  ctx.fillStyle='#fff'; ctx.fillText(name,tx,ty+0.5); ctx.restore();
}
function drawSpecialRoof(s,rx,ry){
  if(s.key==='pollos'){ drawPollosRoof(s,rx,ry); return; }
  if(s.name.startsWith('Casa ')){
    if(s.key==='home'){ // Walt: rancho de estuco beige con tejado de chapa a cuatro aguas
      ctx.fillStyle=s.wall; ctx.fillRect(rx-3,ry-3,s.w+6,s.h+6);
      drawHipRoof(rx,ry,s.w*0.62,s.h,s.roof,'metal'); drawHipRoof(rx+s.w*0.58,ry+s.h*0.12,s.w*0.42,s.h*0.88,s.roof,'metal'); // casa + garaje
      for(const [px,py] of [[0.3,0.35],[0.75,0.5]]){ ctx.fillStyle='#b8b2a8'; ctx.beginPath(); ctx.arc(rx+s.w*px,ry+s.h*py,3.5,0,7); ctx.fill(); } // respiraderos
    } else if(s.key==='jesse'){ // Jesse: estuco blanco, teja roja, dos plantas en "L"
      ctx.fillStyle=s.wall; ctx.fillRect(rx-3,ry-3,s.w+6,s.h+6);
      drawHipRoof(rx,ry,s.w,s.h*0.55,s.roof,'tile'); drawHipRoof(rx+s.w*0.6,ry,s.w*0.4,s.h,s.roof,'tile');
      drawHipRoof(rx+s.w*0.18,ry+s.h*0.6,s.w*0.36,s.h*0.4,shade(s.roof,8),'tile'); // porche con arcos
    } else drawHouseRoof({wall:s.wall,roof:'pitched',fx:0,fy:1,seed:s.seed,cooler:true,w:s.w,h:s.h},rx,ry);
    ctx.save(); ctx.font='bold 13px "Segoe UI",Arial'; ctx.textAlign='center'; ctx.fillStyle='rgba(0,0,0,.6)'; const tw=ctx.measureText(s.name).width+12;
    ctx.fillRect(rx+s.w/2-tw/2,ry-22,tw,18); ctx.fillStyle='#fff'; ctx.fillText(s.name,rx+s.w/2,ry-8); ctx.restore(); return; }
  ctx.fillStyle=s.roof; ctx.fillRect(rx,ry,s.w,s.h);
  ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=3; ctx.strokeRect(rx+5,ry+5,s.w-10,s.h-10);
  ctx.fillStyle='rgba(255,255,255,.08)'; ctx.fillRect(rx+5,ry+5,s.w-10,(s.h-10)/2);
  ctx.save(); ctx.font='bold 20px Georgia,serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  const words=s.name.split(' '); const mid=Math.ceil(words.length/2);
  const lines=s.w<180&&words.length>2?[words.slice(0,mid).join(' '),words.slice(mid).join(' ')]:[s.name];
  lines.forEach((l,i)=>{ const yy=ry+s.h/2+(i-(lines.length-1)/2)*22; ctx.fillStyle='rgba(0,0,0,.45)'; ctx.fillText(l,rx+s.w/2+1,yy+1); ctx.fillStyle='rgba(255,255,255,.92)'; ctx.fillText(l,rx+s.w/2,yy); });
  ctx.restore();
}

function drawMarkers(t,upper){
  for(const m of activeMarkers()){
    const elevated=renderOnDeck(m);
    if(elevated!==upper) continue;
    const pulse=1+Math.sin(t*4)*0.12;
    const col=m.main?'#ffd23a':m.col;
    const [lx,ly]=elevated?liftObj(m):[0,0];
    ctx.save(); ctx.translate(lx,ly); ctx.translate(m.x,m.y);
    ctx.globalAlpha=0.35; ctx.fillStyle=col; ctx.beginPath(); ctx.arc(0,0,(m.key==='desert'?140:30)*pulse,0,7); ctx.fill();
    ctx.globalAlpha=1; ctx.strokeStyle=col; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,0,(m.key==='desert'?140:30)*pulse,0,7); ctx.stroke();
    if(m.main){ ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(0,-30-10*Math.abs(Math.sin(t*3))); ctx.lineTo(-10,-48-10*Math.abs(Math.sin(t*3))); ctx.lineTo(10,-48-10*Math.abs(Math.sin(t*3))); ctx.fill(); }
    else { ctx.fillStyle='#fff'; ctx.font='bold 16px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(m.svc||'',0,0); }
    ctx.restore();
  }
}

function drawPerson(x,y,a,body,skin,walk,gun,hat){
  ctx.save(); ctx.translate(x,y); ctx.rotate(a);
  const sw=Math.sin(walk)*5;
  ctx.fillStyle='rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(3,3,10,8,0,0,7); ctx.fill();
  ctx.fillStyle='#222'; ctx.fillRect(-4+sw,-7,7,4); ctx.fillRect(-4-sw,3,7,4);
  ctx.fillStyle=body; ctx.beginPath(); ctx.ellipse(0,0,6,10,0,0,7); ctx.fill();
  if(gun) drawHeld(gun===true?'pistol':gun);
  ctx.fillStyle=skin; ctx.beginPath(); ctx.arc(1,0,5.2,0,7); ctx.fill();
  if(hat){ ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(1,0,6.5,0,7); ctx.fill(); ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(1,0,4.5,0,7); ctx.fill(); }
  ctx.restore();
}

function drawActorLayer(upper,t){
  const actor=(o,fn)=>{
    const elevated=renderOnDeck(o);
    if(elevated!==upper) return;
    const [lx,ly]=elevated?liftObj(o):[0,0];
    ctx.save(); ctx.translate(lx,ly); fn(); ctx.restore();
  };
  for(const p of G.peds){
    if(p.dead) actor(p,()=>{ ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.a); ctx.fillStyle=p.col; ctx.fillRect(-10,-4,16,8); ctx.fillStyle=p.skin; ctx.beginPath(); ctx.arc(9,0,4.5,0,7); ctx.fill(); ctx.restore(); });
    else actor(p,()=>{ if(p.down>0){ ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.blastA||0); ctx.fillStyle=p.col; ctx.fillRect(-10,-4,16,8); ctx.fillStyle=p.skin; ctx.beginPath(); ctx.arc(9,0,4.5,0,7); ctx.fill(); ctx.restore(); } else drawPerson(p.x,p.y,p.a,p.col,p.skin,p.limp>0?p.walk*0.5:p.walk,false); drawPedExtras(p,t); });
  }
  if(!upper){ drawWorldNPCs(t); drawStepActors(t); }
  for(const th of G.thugs) actor(th,()=>drawPerson(th.x,th.y,th.a,'#2a2a2a','#b07850',th.walk,true));
  for(const b of (G.bodies||[])) actor(b,()=>{ ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(b.a); ctx.fillStyle=b.col; ctx.fillRect(-10,-4,16,8); ctx.fillStyle='#e0b896'; ctx.beginPath(); ctx.arc(9,0,4.5,0,7); ctx.fill(); ctx.restore(); });
  for(const o of G.officers) actor(o,()=>{
    drawPerson(o.x,o.y,o.a,o.dea?'#1b1b1b':'#1d2b4a','#d9b08c',o.walk,true,false);
    ctx.save(); ctx.translate(o.x,o.y); ctx.rotate(o.a); ctx.fillStyle=o.dea?'#1b1b1b':'#14203a'; ctx.beginPath(); ctx.arc(1,0,5.6,0,7); ctx.fill(); ctx.fillStyle=o.dea?'#e8c33a':'#c9a640'; ctx.fillRect(4,-1.5,3,3);
    if(o.dea){ ctx.fillStyle='#e8c33a'; ctx.font='bold 5px sans-serif'; ctx.fillText('DEA',-6,2); } ctx.restore();
  });
  const P=G.player;
  if(!P.inCar&&!G.dead) actor(P,()=>drawPerson(P.x,P.y,P.a,heisLook()?'#2b2b2b':'#8e1f24','#eac9a5',P.walk,curWeapon().id,heisLook()));
}

function drawCar(c,t){
  ctx.save(); ctx.translate(c.x,c.y); ctx.rotate(c.a);
  const w=c.w,h=c.h;
  ctx.fillStyle='rgba(0,0,0,.3)'; ctx.fillRect(-w/2+4,-h/2+4,w,h);
  // ruedas
  ctx.fillStyle='#111'; ctx.fillRect(-w/2+5,-h/2-2,10,4); ctx.fillRect(w/2-15,-h/2-2,10,4); ctx.fillRect(-w/2+5,h/2-2,10,4); ctx.fillRect(w/2-15,h/2-2,10,4);
  ctx.fillStyle=c.color; roundRect(-w/2,-h/2,w,h,5); ctx.fill();
  if(c.type==='cop'){ ctx.fillStyle='#111'; ctx.fillRect(-w/2,-h/2,12,h); ctx.fillRect(w/2-10,-h/2,10,h); }
  if(c.type==='ambulance'){ ctx.fillStyle='#d22'; ctx.fillRect(-w/2,-2,w,4); ctx.fillStyle='#e8e8e8'; ctx.fillRect(-w/2+2,-h/2+2,w-20,h-4);
    ctx.fillStyle='#d22'; ctx.fillRect(-10,-3,14,6); ctx.fillRect(-6,-7,6,14); ctx.fillStyle='rgba(30,45,60,.85)'; ctx.fillRect(w/2-15,-h/2+3,7,h-6);
    if(c.siren!==undefined){ const on=Math.floor(t*8)%2; ctx.fillStyle=on?'#f22':'#fff'; ctx.fillRect(w/2-20,-h/2+1,4,6); ctx.fillStyle=on?'#fff':'#f22'; ctx.fillRect(w/2-20,h/2-7,4,6); }
  } else if(c.type==='rv'){
    ctx.fillStyle='#b8a984'; ctx.fillRect(-w/2+4,-h/2+2,w-20,4); ctx.fillRect(-w/2+4,h/2-6,w-20,4);
    ctx.fillStyle='#8a7a5a'; ctx.fillRect(-w/2+10,-6,14,12);
    ctx.fillStyle='#3a4a55'; ctx.fillRect(w/2-14,-h/2+3,8,h-6);
  } else if(!c.burnt){
    ctx.fillStyle='rgba(30,45,60,.85)'; ctx.fillRect(w/2-17,-h/2+3,7,h-6); ctx.fillRect(-w/2+5,-h/2+4,5,h-8);
    ctx.fillStyle='rgba(255,255,255,.12)'; ctx.fillRect(-w/2+11,-h/2+3,w/2,h-6);
  }
  if(!c.burnt){ ctx.fillStyle='#ffe9a0'; ctx.fillRect(w/2-3,-h/2+2,3,4); ctx.fillRect(w/2-3,h/2-6,3,4);
    ctx.fillStyle='#a11'; ctx.fillRect(-w/2,-h/2+2,2,4); ctx.fillRect(-w/2,h/2-6,2,4); }
  if((c.type==='cop'||c.type==='dea') && c.driver==='cop'){
    const on=Math.floor(t*8)%2;
    ctx.fillStyle=on?'#f22':'#24f'; ctx.fillRect(-3,-h/2+2,6,h/2-2);
    ctx.fillStyle=on?'#24f':'#f22'; ctx.fillRect(-3,0,6,h/2-2);
  }
  ctx.restore();
  // faros nocturnos
  if(nightAmount()>0.3 && !c.burnt && (c.driver||c===G.player.inCar)){
    ctx.save(); ctx.translate(c.x,c.y); ctx.rotate(c.a); ctx.globalCompositeOperation='lighter';
    const g=ctx.createRadialGradient(c.w/2,0,5,c.w/2+90,0,130); g.addColorStop(0,'rgba(255,240,180,.28)'); g.addColorStop(1,'rgba(255,240,180,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(c.w/2,-8); ctx.lineTo(c.w/2+200,-70); ctx.lineTo(c.w/2+200,70); ctx.lineTo(c.w/2,8); ctx.fill();
    ctx.restore();
  }
}
function roundRect(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }

function draw(t){
  if(G.mg){ drawMinigame(t); return; }
  if(G.cine){ drawCine(t); return; }
  if(G.inside){ drawInterior(t); drawHUD(t); return; }
  const P=G.player;
  // cámara
  const sp=P.inCar?Math.abs(P.inCar.v):0;
  const tz=clamp(1.1-sp/1800,0.82,1.1)*Math.min(1,Math.max(VW,VH)/1300+0.25);
  if(!G.camLock) cam.z+= (tz-cam.z)*0.02;
  const lead=P.inCar?0.22:0;
  const FX=G.camFocus?G.camFocus.x:P.x, FY=G.camFocus?G.camFocus.y:P.y;
  const tx=FX+(P.inCar&&!G.camFocus?Math.cos(P.inCar.a)*P.inCar.v*lead:0)-VW/cam.z/2, ty=FY+(P.inCar&&!G.camFocus?Math.sin(P.inCar.a)*P.inCar.v*lead:0)-VH/cam.z/2;
  cam.x+=(tx-cam.x)*0.09; cam.y+=(ty-cam.y)*0.09;
  cam.x=clamp(cam.x,0,Math.max(0,WW-VW/cam.z)); cam.y=clamp(cam.y,0,Math.max(0,WH-VH/cam.z));
  let shake=(G.flash>0?G.flash*10:0)+(G.shake||0);
  if(G.shake) G.shake=Math.max(0,G.shake-0.6);
  ctx.setTransform(cam.z,0,0,cam.z,(-cam.x+rand(-shake,shake))*cam.z,(-cam.y+rand(-shake,shake))*cam.z);
  drawWorld(t);
  drawGPSWorld(t);
  drawMarkers(t,false);
  drawPickups(t,false);
  drawActorLayer(false,t);
  for(const c of G.cars) if(!renderOnDeck(c)) drawCar(c,t);
  drawOverpasses();
  for(const c of G.cars) if(renderOnDeck(c)){ const [lx,ly]=liftObj(c); ctx.save(); ctx.translate(lx,ly); drawCar(c,t); ctx.restore(); }
  drawMarkers(t,true);
  drawPickups(t,true);
  drawActorLayer(true,t);
  ctx.fillStyle='#ffe58a';
  for(const b of G.bullets){ ctx.fillRect(b.x-2,b.y-2,4,4); }
  drawWeaponFx(t);
  drawBuildings(); drawSignals(t);
  for(const p of G.parts){ ctx.globalAlpha=clamp(p.life,0,1); ctx.fillStyle=p.c; ctx.beginPath(); ctx.arc(p.x,p.y,p.s*(1.5-p.life*0.5),0,7); ctx.fill(); }
  ctx.globalAlpha=1;
  ctx.font='bold 18px sans-serif'; ctx.textAlign='center';
  for(const f of G.floaters){ ctx.globalAlpha=clamp(f.life,0,1); ctx.fillStyle='#000'; ctx.fillText(f.t,f.x+1,f.y-29); ctx.fillStyle=f.c; ctx.fillText(f.t,f.x,f.y-30); }
  ctx.globalAlpha=1;
  ctx.setTransform(1,0,0,1,0,0);

  // calima del desierto / noche
  const n=nightAmount();
  colorGrade(n);
  if(n>0){
    const g=ctx.createRadialGradient(VW/2,VH/2,60,VW/2,VH/2,Math.max(VW,VH)*0.7);
    g.addColorStop(0,`rgba(10,15,40,${0.25*n})`); g.addColorStop(1,`rgba(5,8,25,${0.72*n})`);
    ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH);
  }
  if(n>0.25){ ctx.save(); ctx.globalCompositeOperation='lighter';
    for(const [lx,ly] of LIGHTS){ const sx=(lx-cam.x)*cam.z, sy=(ly-cam.y)*cam.z; if(sx<-80||sy<-80||sx>VW+80||sy>VH+80) continue;
      const g2=ctx.createRadialGradient(sx,sy,2,sx,sy,70*cam.z); g2.addColorStop(0,`rgba(255,220,140,${0.35*n})`); g2.addColorStop(1,'rgba(255,220,140,0)');
      ctx.fillStyle=g2; ctx.fillRect(sx-70*cam.z,sy-70*cam.z,140*cam.z,140*cam.z); }
    ctx.restore(); }
  if(G.wanted>0){ const on=Math.floor(t*3)%2; ctx.fillStyle=on?'rgba(255,0,0,.05)':'rgba(0,60,255,.05)'; ctx.fillRect(0,0,VW,VH); }
  if(G.hurtFlash>0){ ctx.fillStyle=`rgba(200,0,0,${G.hurtFlash})`; ctx.fillRect(0,0,VW,VH); }
  if(G.flash>0){ ctx.fillStyle=`rgba(255,240,200,${clamp(G.flash,0,1)*0.8})`; ctx.fillRect(0,0,VW,VH); }
  drawHUD(t);
}


// semáforos en báculo sobre los cruces de avenidas (como en Central Ave / 1st St)
function drawSignals(t){
  const x0=cam.x, y0=cam.y, x1=x0+VW/cam.z, y1=y0+VH/cam.z;
  const candidates=CROSSINGS.filter(c=>c.level&&c.a.kind==='main'&&c.b.kind==='main'&&c.x>=x0-120&&c.x<=x1+120&&c.y>=y0-120&&c.y<=y1+120);
  // In dense junctions, keep one signal set for the most perpendicular
  // crossing instead of adding another set for every road pair.
  const score=c=>Math.abs(Math.sin(angDiff(pointAt(c.a,c.sa).a,pointAt(c.b,c.sb).a)))+Math.min(c.a.w,c.b.w)*0.0001;
  const selected=[];
  candidates.sort((a,b)=>score(b)-score(a)||a.id-b.id);
  for(const c of candidates){ if(selected.some(q=>Math.hypot(q.x-c.x,q.y-c.y)<190)) continue; selected.push(c); }
  for(const c of selected){
    const phase=((t+c.x*0.001)%16)<8; // alterna qué calle tiene verde
    for(const [r,s,o,green] of [[c.a,c.sa,c.b,phase],[c.b,c.sb,c.a,!phase]]) for(const side of [-1,1]){
      const p=pointAt(r,s-side*(o.w/2+16)), n=p.a+Math.PI/2*side, off=r.w/2+10;
      const bx=p.x+Math.cos(n)*off, by=p.y+Math.sin(n)*off; // poste en la esquina
      const ex=bx-Math.cos(n)*(off+r.w*0.15), ey=by-Math.sin(n)*(off+r.w*0.15); // extremo del brazo sobre la calzada
      const [lx,ly]=liftOf(p.x,p.y,Math.max(0,p.e));
      const dbx=bx+lx, dby=by+ly, dex=ex+lx, dey=ey+ly;
      ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(dbx+5,dby+6); ctx.lineTo(dex+5,dey+6); ctx.stroke();
      ctx.strokeStyle='#8b8f93'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(dbx,dby); ctx.lineTo(dex,dey); ctx.stroke();
      ctx.fillStyle='#5c6064'; ctx.beginPath(); ctx.arc(dbx,dby,4,0,7); ctx.fill();
      for(const k of [0.55,1]){ const hx=dbx+(dex-dbx)*k, hy=dby+(dey-dby)*k;
        ctx.fillStyle='#1d1d1f'; ctx.beginPath(); ctx.arc(hx,hy,4.5,0,7); ctx.fill();
        const amber=green&&((t+c.x*0.001)%8)>6.5;
        ctx.fillStyle=amber?'#ffb020':green?'#3ee07a':'#ff3a2e';
        ctx.beginPath(); ctx.arc(hx,hy,2.6,0,7); ctx.fill(); }
    }
  }
}

// filtro amarillo "estilo Breaking Bad" (escenas en Albuquerque / México): tinte cálido,
// contraste suave y viñeta tostada. De noche se atenúa para no ensuciar el azul.
let VIGNETTE=null, VIG_W=0, VIG_H=0;
function colorGrade(n){
  const k=1-n*0.75;
  ctx.save();
  ctx.globalCompositeOperation='multiply'; ctx.fillStyle=`rgba(255,214,110,${0.42*k})`; ctx.fillRect(0,0,VW,VH);
  ctx.globalCompositeOperation='soft-light'; ctx.fillStyle=`rgba(255,180,60,${0.35*k})`; ctx.fillRect(0,0,VW,VH);
  ctx.globalCompositeOperation='screen'; ctx.fillStyle=`rgba(120,80,10,${0.10*k})`; ctx.fillRect(0,0,VW,VH); // negros lavados, tono "polvo"
  if(!VIGNETTE||VIG_W!==VW||VIG_H!==VH){ VIG_W=VW; VIG_H=VH;
    VIGNETTE=ctx.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*0.35,VW/2,VH/2,Math.max(VW,VH)*0.75);
    VIGNETTE.addColorStop(0,'rgba(90,55,10,0)'); VIGNETTE.addColorStop(1,'rgba(90,55,10,.45)'); }
  ctx.globalCompositeOperation='multiply'; ctx.globalAlpha=k; ctx.fillStyle=VIGNETTE; ctx.fillRect(0,0,VW,VH);
  ctx.restore();
}

// lo que lleva en la mano (vista cenital, el personaje mira hacia +x): según el arma
function drawHeld(id){
  const R=(c,x,y,w,h)=>{ ctx.fillStyle=c; ctx.fillRect(x,y,w,h); };
  switch(id){
    case 'fists': ctx.fillStyle='#eac9a5'; ctx.beginPath(); ctx.arc(8,-4,2.6,0,7); ctx.arc(8,4,2.6,0,7); ctx.fill(); break;
    case 'pistol': R('#111',6,1,12,3); break;
    case 'revolver': R('#1a1a1a',6,1,15,3); R('#555',9,0,4,5); break;
    case 'shotgun': R('#5a3a20',2,0,8,5); R('#222',10,1,20,3); break;
    case 'smg': R('#1a1a1a',5,0,15,4); R('#1a1a1a',10,4,3,5); break;
    case 'm60': R('#2a2a2a',2,-1,28,5); R('#c8a040',8,4,8,3); R('#222',28,0,6,2); break;
    case 'fulminate': ctx.fillStyle='#8fd0ff'; ctx.beginPath(); ctx.moveTo(10,-3); ctx.lineTo(14,1); ctx.lineTo(10,5); ctx.lineTo(6,1); ctx.fill(); break;
    case 'phosphine': ctx.fillStyle='#cfe8d0'; ctx.beginPath(); ctx.arc(11,1,4,0,7); ctx.fill(); ctx.fillStyle='#8cd060'; ctx.beginPath(); ctx.arc(11,2,2.6,0,7); ctx.fill(); break;
    case 'acid': R('#e8e4d8',5,-2,8,7); R('#e8c040',7,0,4,3); R('#666',13,0,6,2); break;
    default: R('#111',6,1,12,3);
  }
}
