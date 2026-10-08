"use strict";
// ======================= INTERIORES =======================
// Cada interior se escribe como un plano ASCII por planta (js/interiors/plans.js).
// Leyenda (una letra = una celda de ICELL unidades):
//   suelos:   .  madera     ,  baldosa      :  moqueta    _  hormigón    =  terraza
//             g  césped     ~  agua (piscina, no se pisa)    r  alfombra    (espacio) vacío
//   muros:    #  pared      w  ventana      d  puerta (se pasa)
//   especial: E  salida a la calle     ^  escalera que sube     v  escalera que baja
//   muebles (bloquean; letras iguales contiguas = un solo mueble):
//             B cama  b cuna  S sofá  A sillón  T mesa  c silla  K encimera  O cocina  F nevera
//             N fregadero  L váter  U bañera  H ducha  V tele  D escritorio  Z armario/estantería
//             P planta  W lavadora  C coche  X equipo de laboratorio  Q reactor  M barriles  Y caja fuerte/archivador
// Los muebles con `use` en el plano (p.ej. la cama de Walt) se usan con E.

const ICELL = 22;
const INTERIORS = {};
function addInterior(key,def){ INTERIORS[key]=def; }

const FLOOR_CH = new Set(['.',',',':','_','=','g','r','~']);
const WALK_CH  = new Set(['.',',',':','_','=','g','r','d','E','^','v']);
const FURN_CH  = new Set(['B','b','S','A','T','c','K','O','F','N','L','U','H','V','D','Z','P','W','C','X','Q','M','Y']);

// convierte el plano en celdas, muebles agrupados y puntos especiales
function buildInterior(def){
  if(def.built) return def;
  def.floorsB=def.floors.map(fl=>{
    const rows=fl.map, H=rows.length, W=Math.max(...rows.map(r=>r.length));
    const at=(x,y)=>(rows[y]||'')[x]||' ';
    const cells=[], under=[];
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      const c=at(x,y); cells.push(c);
      // suelo bajo muebles/puertas: el suelo más frecuente alrededor
      let u=c;
      if(!FLOOR_CH.has(c)){ const cnt={}; for(let r=1;r<=3&&!Object.keys(cnt).length;r++) for(let j=-r;j<=r;j++) for(let i=-r;i<=r;i++){ const n=at(x+i,y+j); if(FLOOR_CH.has(n)&&n!=='~') cnt[n]=(cnt[n]||0)+1; }
        u=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0]||'.'; }
      under.push(u);
    }
    // muebles: componentes conexos de la misma letra
    const seen=new Uint8Array(W*H), furn=[];
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const c=cells[y*W+x]; if(!FURN_CH.has(c)||seen[y*W+x]) continue;
      let x0=x,x1=x,y0=y,y1=y; const st=[[x,y]]; seen[y*W+x]=1;
      while(st.length){ const [a,b]=st.pop(); x0=Math.min(x0,a);x1=Math.max(x1,a);y0=Math.min(y0,b);y1=Math.max(y1,b);
        for(const [i,j] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=a+i, ny=b+j; if(nx<0||ny<0||nx>=W||ny>=H) continue; const k=ny*W+nx; if(!seen[k]&&cells[k]===c){ seen[k]=1; st.push([nx,ny]); } } }
      furn.push({t:c,x:x0*ICELL,y:y0*ICELL,w:(x1-x0+1)*ICELL,h:(y1-y0+1)*ICELL,seed:(x*7+y*13)%17/17}); }
    const find=ch=>{ const out=[]; for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(cells[y*W+x]===ch) out.push({x:(x+.5)*ICELL,y:(y+.5)*ICELL}); return out; };
    return {W,H,cells,under,furn,exits:find('E'),up:find('^'),down:find('v'),name:fl.name};
  });
  def.built=true; return def;
}
function icell(F,x,y){ const i=Math.floor(x/ICELL), j=Math.floor(y/ICELL); if(i<0||j<0||i>=F.W||j>=F.H) return ' '; return F.cells[j*F.W+i]; }
function iwalk(F,x,y,r){ for(const [ox,oy] of [[-r,-r],[r,-r],[-r,r],[r,r],[0,0]]) if(!WALK_CH.has(icell(F,x+ox,y+oy))) return false; return true; }

// ---------- entrar / salir ----------
function enterInterior(key){
  const def=INTERIORS[key]; if(!def) return false;
  if(G.wanted>0){ toast('No puedes entrar con la policía detrás.'); return false; }
  buildInterior(def);
  const P=G.player; if(P.inCar) return false;
  const fi=def.entryFloor||0, F=def.floorsB[fi], ex=F.exits[0]||{x:F.W*ICELL/2,y:F.H*ICELL/2};
  G.inside={key,f:fi,wx:P.x,wy:P.y,wz:P.z,t:0};
  P.x=ex.x; P.y=ex.y-ICELL; G.inside.cool=0.6;
  sfx.blip(); toast(def.name+(F.name?' — '+F.name:''),2.5);
  return true;
}
function exitInterior(){
  const I=G.inside, P=G.player; if(!I) return;
  P.x=I.wx; P.y=I.wy; P.z=I.wz; G.inside=null; cam.x=P.x-VW/cam.z/2; cam.y=P.y-VH/cam.z/2; sfx.blip();
}
function changeFloor(dir){
  const I=G.inside, def=INTERIORS[I.key], nf=I.f+dir, F=def.floorsB[nf]; if(!F) return;
  const tgt=(dir>0?F.down:F.up)[0]||F.exits[0]||{x:F.W*ICELL/2,y:F.H*ICELL/2};
  I.f=nf; I.cool=0.8; const P=G.player; P.x=tgt.x; P.y=tgt.y+ICELL*0.9; if(!iwalk(F,P.x,P.y,8)) P.y=tgt.y-ICELL*0.9;
  sfx.blip(); toast(def.name+' — '+(F.name||('Planta '+nf)),2);
}

// ---------- actualización dentro ----------
function interiorUse(){ // E dentro: salir, escaleras o muebles con uso
  const I=G.inside, def=INTERIORS[I.key], F=def.floorsB[I.f], P=G.player;
  for(const e of F.exits) if(dist(e.x,e.y,P.x,P.y)<ICELL*1.4){ exitInterior(); return; }
  for(const u of (def.uses||[])) if((u.floor||0)===I.f && dist(u.x*ICELL,u.y*ICELL,P.x,P.y)<ICELL*2){ u.run(); return; }
  if(missionInteract(I.key)) return;
  for(const n of (def.npcs||[])) if((n.floor||0)===I.f && dist(n.x*ICELL,n.y*ICELL,P.x,P.y)<ICELL*2.5 && n.talk){ say(n.talk()); return; }
}
function updateInterior(dt){
  const I=G.inside, def=INTERIORS[I.key], F=def.floorsB[I.f], P=G.player;
  I.t+=dt; I.cool-=dt;
  let mx=(keys['d']||keys['arrowright']?1:0)-(keys['a']||keys['arrowleft']?1:0);
  let my=(keys['s']||keys['arrowdown']?1:0)-(keys['w']||keys['arrowup']?1:0);
  const sp=keys['shift']?160:100;
  if(mx||my){ const l=Math.hypot(mx,my), dx=mx/l*sp*dt, dy=my/l*sp*dt;
    if(iwalk(F,P.x+dx,P.y,8)) P.x+=dx; if(iwalk(F,P.x,P.y+dy,8)) P.y+=dy; P.walk+=dt*10; P.a=Math.atan2(my,mx); }
  // escaleras: al pisarlas se cambia de planta
  if(I.cool<=0){ const c=icell(F,P.x,P.y); if(c==='^') changeFloor(1); else if(c==='v') changeFloor(-1); }
  // salir andando por la puerta de la calle
  if(I.cool<=0 && icell(F,P.x,P.y)==='E' && my>0){ exitInterior(); return; }
  if(pressed['e']) interiorUse();
}

// ---------- dibujo ----------
const FLOOR_STYLE={
  '.':{c:'#a8794a',l:'rgba(60,35,15,.25)',plank:true}, ',':{c:'#d9d4c8',l:'rgba(0,0,0,.12)',grid:true}, ':':{c:'#b9a88c'},
  '_':{c:'#8f8c86',l:'rgba(0,0,0,.08)',grid:true}, '=':{c:'#c8b49a',l:'rgba(0,0,0,.12)',grid:true}, 'g':{c:'#6f8a45'},
  'r':{c:'#8a3a2e',l:'rgba(255,220,160,.25)'}, '~':{c:'#3fb6d8'} };
const FURN_STYLE={
  B:['#e8e2d6','#6a2a2a'], b:['#f0ece2','#c9a26a'], S:['#5e5448','#7a6e60'], A:['#6a5a48','#857360'], T:['#7a5230','#8f6440'], c:['#6a4a2e','#7f5a38'],
  K:['#c9c2b4','#e4ddd0'], O:['#3a3a3c','#5a5a5e'], F:['#e8e8ea','#c8c8cc'], N:['#c0c6cc','#9aa2aa'], L:['#f2f2f2','#d8d8d8'], U:['#f2f2f2','#cfe9f2'],
  H:['#d8e4ea','#b8c8d0'], V:['#1c1c1e','#3a3a40'], D:['#6a4a30','#86603e'], Z:['#5a4030','#70503a'], P:['#3e6a2e','#5a8a3e'], W:['#e4e4e6','#b8bcc0'],
  C:['#8a9a5b','#a4b46e'], X:['#b8bec4','#dfe4e8'], Q:['#c8ced4','#e8ecef'], M:['#2a5a8a','#3a6ea0'], Y:['#4a4e54','#62666c'] };
function drawInterior(t){
  const I=G.inside, def=INTERIORS[I.key], F=def.floorsB[I.f], P=G.player;
  const z=1.7; cam.z=z; cam.x=P.x-VW/z/2; cam.y=P.y-VH/z/2;
  ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle='#14120f'; ctx.fillRect(0,0,VW,VH);
  ctx.setTransform(z,0,0,z,-cam.x*z,-cam.y*z);
  const C=ICELL;
  // suelos
  for(let j=0;j<F.H;j++) for(let i=0;i<F.W;i++){ const c=F.cells[j*F.W+i]; if(c===' ') continue;
    const u=FLOOR_CH.has(c)?c:F.under[j*F.W+i], st=FLOOR_STYLE[u]||FLOOR_STYLE['.'], x=i*C, y=j*C;
    ctx.fillStyle=st.c; ctx.fillRect(x,y,C+0.5,C+0.5);
    if(u==='~'){ ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=1; ctx.beginPath(); const o=Math.sin(t*2+i+j)*3; ctx.moveTo(x+3,y+C/2+o); ctx.quadraticCurveTo(x+C/2,y+C/2-4+o,x+C-3,y+C/2+o); ctx.stroke(); }
    else if(st.plank){ ctx.fillStyle=st.l; ctx.fillRect(x,y+((i%2)?C/2:0),C,1); ctx.fillRect(x+((j*7)%C),y,1,C/2); }
    else if(st.grid){ ctx.strokeStyle=st.l; ctx.lineWidth=1; ctx.strokeRect(x+.5,y+.5,C-1,C-1); }
    else if(u==='g'){ ctx.fillStyle='rgba(40,70,20,.3)'; ctx.fillRect(x+((i*5)%C),y+((j*11)%C),2,2); }
    else if(u==='r'){ ctx.strokeStyle=st.l; ctx.strokeRect(x+3,y+3,C-6,C-6); } }
  // escaleras y salidas
  for(let j=0;j<F.H;j++) for(let i=0;i<F.W;i++){ const c=F.cells[j*F.W+i], x=i*C, y=j*C;
    if(c==='^'||c==='v'){ ctx.fillStyle=c==='^'?'#cfc6b6':'#7a7266'; ctx.fillRect(x,y,C,C); ctx.strokeStyle='rgba(0,0,0,.35)'; ctx.lineWidth=1.5; for(let k=1;k<5;k++){ ctx.beginPath(); ctx.moveTo(x,y+k*C/5); ctx.lineTo(x+C,y+k*C/5); ctx.stroke(); }
      ctx.fillStyle='#ffd23a'; ctx.font='bold 12px sans-serif'; ctx.textAlign='center'; ctx.fillText(c==='^'?'▲':'▼',x+C/2,y+C/2+4); }
    if(c==='E'){ ctx.fillStyle='rgba(255,210,58,'+(0.35+0.25*Math.sin(t*4))+')'; ctx.fillRect(x+2,y+2,C-4,C-4); } }
  // muebles
  for(const f of F.furn) drawFurniture(f,t);
  // muros (con relieve) y ventanas
  for(let j=0;j<F.H;j++) for(let i=0;i<F.W;i++){ const c=F.cells[j*F.W+i], x=i*C, y=j*C;
    if(c==='#'||c==='w'){ // muro continuo: contorno oscuro solo donde no sigue otro muro
      const isW=(a,b)=>{ const n=icell(F,a,b); return n==='#'||n==='w'; };
      const L=isW(x-1,y+1)?0:3, R=isW(x+C+1,y+1)?0:3, T=isW(x+1,y-1)?0:3, Bm=isW(x+1,y+C+1)?0:3;
      ctx.fillStyle='#2b2622'; ctx.fillRect(x,y,C+0.5,C+0.5); ctx.fillStyle='#e9e1d2'; ctx.fillRect(x+L,y+T,C-L-R+0.5,C-T-Bm+0.5);
      if(c==='w'){ ctx.fillStyle='#9fd0e8'; const hor=icell(F,x-C+1,y+1)==='#'||icell(F,x+C+1,y+1)==='#'||icell(F,x-C+1,y+1)==='w'||icell(F,x+C+1,y+1)==='w'; hor?ctx.fillRect(x,y+C/2-2,C,4):ctx.fillRect(x+C/2-2,y,4,C); } }
    if(c==='d'){ ctx.strokeStyle='rgba(60,40,25,.8)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,y,C*0.9,0,Math.PI/2); ctx.stroke(); } }
  // personajes del interior
  for(const n of (def.npcs||[])){ if((n.floor||0)!==I.f) continue; if(n.when&&!n.when()) continue;
    const L=LOOK[n.id]||{skin:'#e6c09a'}, x=n.x*C, y=n.y*C; drawPerson(x,y,Math.atan2(P.y-y,P.x-x),n.body||'#444',L.skin,0,false,false);
    ctx.fillStyle='#fff'; ctx.font='bold 10px sans-serif'; ctx.textAlign='center'; ctx.fillText((CHAR[n.id]||{}).n||'',x,y-16); }
  // jugador
  drawPerson(P.x,P.y,P.a,heisLook()?'#2b2b2b':'#8e1f24','#eac9a5',P.walk,false,heisLook());
  // iluminación cálida interior
  ctx.setTransform(1,0,0,1,0,0);
  const g=ctx.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*0.25,VW/2,VH/2,Math.max(VW,VH)*0.7);
  g.addColorStop(0,'rgba(255,200,120,0)'); g.addColorStop(1,'rgba(20,12,4,.55)'); ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH);
  colorGrade(nightAmount()*0.5);
  // indicaciones
  const near=interiorHint(F,def,P); if(near){ ctx.font='bold 18px sans-serif'; const w=ctx.measureText(near).width+30; ctx.fillStyle='rgba(0,0,0,.7)'; ctx.fillRect(VW/2-w/2,VH-200,w,36); txt(near,VW/2,VH-176,18,'#fff','center'); }
  txt(def.name+(F.name?' · '+F.name:''),24,VH-24,18,'#ffd23a','left','700 ');
}
function interiorHint(F,def,P){
  for(const e of F.exits) if(dist(e.x,e.y,P.x,P.y)<ICELL*1.4) return 'E — Salir';
  for(const u of (def.uses||[])) if((u.floor||0)===G.inside.f && dist(u.x*ICELL,u.y*ICELL,P.x,P.y)<ICELL*2) return 'E — '+u.label;
  for(const n of (def.npcs||[])) if((n.floor||0)===G.inside.f && (!n.when||n.when()) && dist(n.x*ICELL,n.y*ICELL,P.x,P.y)<ICELL*2.5) return 'E — Hablar con '+((CHAR[n.id]||{}).n||'');
  return null;
}
function drawFurniture(f,t){
  const [a,b]=FURN_STYLE[f.t]||['#777','#999'], {x,y,w,h}=f, p=3;
  ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(x+p+3,y+p+4,w-2*p,h-2*p);
  switch(f.t){
    case 'B': case 'b': // cama: colcha + almohadas en el lado más corto
      ctx.fillStyle=f.t==='b'?b:'#d8cfbf'; roundRect(x+p,y+p,w-2*p,h-2*p,4); ctx.fill();
      ctx.fillStyle=f.t==='b'?a:b; roundRect(x+p+2,y+p+(h>w?h*0.28:2),w-2*p-4,h>w?h*0.66:h-2*p-4,3); ctx.fill();
      ctx.fillStyle='#f4f0e8'; if(h>w){ roundRect(x+p+3,y+p+3,(w-2*p)/2-4,h*0.18,3); ctx.fill(); roundRect(x+w/2+1,y+p+3,(w-2*p)/2-4,h*0.18,3); ctx.fill(); }
      else { roundRect(x+p+3,y+p+3,w*0.18,(h-2*p)/2-4,3); ctx.fill(); roundRect(x+p+3,y+h/2+1,w*0.18,(h-2*p)/2-4,3); ctx.fill(); } break;
    case 'S': case 'A': ctx.fillStyle=a; roundRect(x+p,y+p,w-2*p,h-2*p,6); ctx.fill(); ctx.fillStyle=b; roundRect(x+p+5,y+p+5,w-2*p-10,h-2*p-10,4); ctx.fill(); break;
    case 'T': ctx.fillStyle=a; roundRect(x+p,y+p,w-2*p,h-2*p,4); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.12)'; ctx.fillRect(x+p+3,y+p+3,w-2*p-6,(h-2*p)/3); break;
    case 'c': ctx.fillStyle=a; roundRect(x+w*0.25,y+h*0.25,w*0.5,h*0.5,3); ctx.fill(); break;
    case 'O': ctx.fillStyle=a; ctx.fillRect(x+p,y+p,w-2*p,h-2*p); ctx.strokeStyle='#888'; ctx.lineWidth=1.5; for(const [i,j] of [[.3,.3],[.7,.3],[.3,.7],[.7,.7]]){ ctx.beginPath(); ctx.arc(x+w*i,y+h*j,Math.min(w,h)*0.13,0,7); ctx.stroke(); } break;
    case 'L': ctx.fillStyle=a; roundRect(x+w*0.2,y+h*0.1,w*0.6,h*0.8,8); ctx.fill(); ctx.fillStyle='#cfe3ea'; ctx.beginPath(); ctx.ellipse(x+w/2,y+h*0.58,w*0.18,h*0.22,0,0,7); ctx.fill(); break;
    case 'U': case 'H': ctx.fillStyle=a; roundRect(x+p,y+p,w-2*p,h-2*p,8); ctx.fill(); ctx.fillStyle=b; roundRect(x+p+4,y+p+4,w-2*p-8,h-2*p-8,6); ctx.fill(); break;
    case 'V': ctx.fillStyle=a; ctx.fillRect(x+p,y+h/2-3,w-2*p,6); ctx.fillStyle='rgba(120,180,255,'+(0.2+0.1*Math.sin(t*6))+')'; ctx.fillRect(x+p,y+h/2+3,w-2*p,10); break;
    case 'P': ctx.fillStyle='#6a4a30'; ctx.beginPath(); ctx.arc(x+w/2,y+h/2,Math.min(w,h)*0.3,0,7); ctx.fill(); ctx.fillStyle=a; ctx.beginPath(); ctx.arc(x+w/2,y+h/2,Math.min(w,h)*0.42,0,7); ctx.fill(); ctx.fillStyle=b; ctx.beginPath(); ctx.arc(x+w/2-3,y+h/2-3,Math.min(w,h)*0.22,0,7); ctx.fill(); break;
    case 'C': ctx.fillStyle=a; roundRect(x+p+4,y+p,w-2*p-8,h-2*p,10); ctx.fill(); ctx.fillStyle='#2a3036'; roundRect(x+w*0.25,y+h*0.22,w*0.5,h*0.2,4); ctx.fill(); roundRect(x+w*0.25,y+h*0.62,w*0.5,h*0.14,4); ctx.fill(); break;
    case 'Q': ctx.fillStyle=a; ctx.beginPath(); ctx.arc(x+w/2,y+h/2,Math.min(w,h)/2-p,0,7); ctx.fill(); ctx.fillStyle=b; ctx.beginPath(); ctx.arc(x+w/2-4,y+h/2-4,Math.min(w,h)/3,0,7); ctx.fill(); ctx.strokeStyle='#8a9096'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x+w/2,y+h/2,Math.min(w,h)/2-p,0,7); ctx.stroke(); break;
    case 'M': for(let i=x+p;i<x+w-p-6;i+=ICELL*0.9) for(let j=y+p;j<y+h-p-6;j+=ICELL*0.9){ ctx.fillStyle=a; ctx.beginPath(); ctx.arc(i+ICELL*0.4,j+ICELL*0.4,ICELL*0.38,0,7); ctx.fill(); ctx.fillStyle=b; ctx.beginPath(); ctx.arc(i+ICELL*0.4,j+ICELL*0.4,ICELL*0.22,0,7); ctx.fill(); } break;
    default: ctx.fillStyle=a; ctx.fillRect(x+p,y+p,w-2*p,h-2*p); ctx.fillStyle=b; ctx.fillRect(x+p+2,y+p+2,w-2*p-4,Math.max(3,(h-2*p)*0.3));
  }
}
