"use strict";
// ======================= ACTUALIZACIÓN =======================
let cam={x:0,y:0,z:1};
let started=false, titleSel=0, paused=false;

function update(dt){
  const P=G.player;
  if(G.flash>0) G.flash-=dt*1.5;
  if(G.hurtFlash>0) G.hurtFlash-=dt;
  if(G.msgT>0) G.msgT-=dt;
  for(const f of G.floaters){ f.life-=dt; f.y-=30*dt; }
  G.floaters=G.floaters.filter(f=>f.life>0);

  if(G.cine){ updateCine(dt); return; }
  if(G.mg){ updateMinigame(dt); return; }
  if(G.dialog){
    const D=G.dialog, L=D.lines[D.i];
    if(L && !L.choices){ const prev=D.ch|0; D.ch=Math.min(L[1].length,D.ch+dt*55); if((D.ch|0)!==prev && (D.ch|0)%3===0) beep(220+Math.random()*80,0.02,'square',0.01); }
    if(L && L.choices){
      if(pressed['arrowup']||pressed['w']) D.choiceSel=(D.choiceSel+L.choices.length-1)%L.choices.length;
      if(pressed['arrowdown']||pressed['s']) D.choiceSel=(D.choiceSel+1)%L.choices.length;
      for(let i=0;i<L.choices.length;i++) if(pressed[String(i+1)]) { dialogChoose(i); return; }
      if(pressed['enter']||pressed[' ']||pressed['e']) { dialogChoose(D.choiceSel); return; }
      if(mouse.clicked && G._choiceRects){ for(const r of G._choiceRects) if(mouse.x>r.x&&mouse.x<r.x+r.w&&mouse.y>r.y&&mouse.y<r.y+r.h){ dialogChoose(r.i); return; } }
    } else if(pressed[' ']||pressed['enter']||pressed['e']||mouse.clicked) dialogNext();
    return;
  }
  if(G.cook){ updateCook(dt); return; }
  if(G.inside){ G.clock=(G.clock+dt*2)%(24*60); updateInterior(dt); if(G.card) updateMissions(dt); return; }
  if(G.dead){ G.deadT-=dt; if(G.deadT<=0) respawn(); updateWorld(dt); return; }

  G.clock=(G.clock+dt*2)%(24*60);
  G.heat=Math.max(0,G.heat-dt*0.25);
  if(G.runOvers) G.runOvers=Math.max(0,G.runOvers-dt/40); // se olvida un atropello cada 40 s

  updateGPS(dt);
  // --- jugador ---
  const car=P.inCar;
  if(car) P.z=car.z;
  if(car){
    if(car.driver!=='ride'){
      const throttle=!!(keys['w']||keys['arrowup']);
      const brake=!!(keys['s']||keys['arrowdown']);
      const steer=(keys['d']||keys['arrowright']?1:0)-(keys['a']||keys['arrowleft']?1:0);
      // Al volante, W/S controlan el coche y A/D giran respecto a su orientación.
      // A pie, en cambio, WASD conserva el movimiento global del mapa.
      driveCar(car,dt,throttle&&!brake,brake,steer,keys[' ']);
    }
    P.x=car.x; P.y=car.y; P.a=car.a;
    if(pressed['h']) beep(330,0.35,'sawtooth',0.05);
    if(car.dead){ P.inCar=null; }
    // atropellos
    if(!onDeck(car)) for(const p of G.peds) if(!p.dead && dist(p.x,p.y,car.x,car.y)<car.r+6) carHitsPed(car,p);
    if(Math.abs(car.v)>90) for(const t of G.thugs) if(t.hp>0 && dist(t.x,t.y,car.x,car.y)<car.r+8){ t.hp=0; sfx.crash(); }
    if(Math.abs(car.v)>90) for(const o of G.officers) if(o.hp>0 && dist(o.x,o.y,car.x,car.y)<car.r+8){ o.hp=0; sfx.crash(); }
  } else {
    let mx=(keys['d']||keys['arrowright']?1:0)-(keys['a']||keys['arrowleft']?1:0);
    let my=(keys['s']||keys['arrowdown']?1:0)-(keys['w']||keys['arrowup']?1:0);
    const run=keys['shift']; const sp=run?190:115;
    if(mx||my){ const l=Math.hypot(mx,my), dx=mx/l*sp*dt, dy=my/l*sp*dt;
      // Conserva el nivel vertical: al tablero se sube por la calzada de acceso,
      // no entrando de lado desde el terreno bajo el puente.
      let nz=walkStandZ(P.x,P.y,P.x+dx,P.y,P.z); if(nz!==null){ P.x+=dx; P.z=nz; }
      nz=walkStandZ(P.x,P.y,P.x,P.y+dy,P.z); if(nz!==null){ P.y+=dy; P.z=nz; }
      P.walk+=dt*(run?14:9); }
    resolve(P,9);
    const wx=mouse.x/cam.z+cam.x, wy=mouse.y/cam.z+cam.y;
    P.a=Math.atan2(wy-P.y,wx-P.x);
    weaponUse(dt);   // disparar, lanzar, rociar; rueda del ratón o 1-9 para cambiar de arma
  }

  // --- interacción (E) ---
  if(pressed['f']){ // F: subir/bajar del coche (como en GTA)
    if(car) exitCar();
    else { let best=null,bd=70; for(const c of G.cars){ if(c.dead||c.burnt) continue; const d=dist(c.x,c.y,P.x,P.y); if(d<bd){bd=d;best=c;} } if(best) enterCar(best); }
  } else if(pressed['e']){
    const m = nearMarker();
    if(m && (!car || Math.abs(car.v)<120)){ if(car){ car.v=0; car.vx=0; car.vy=0; car.av=0; } interact(m.key); }
    else if(car){ exitCar(); }
    else {
      let best=null,bd=60;
      for(const c of G.cars){ if(c.dead||c.burnt) continue; const d=dist(c.x,c.y,P.x,P.y); if(d<bd){bd=d;best=c;} }
      if(best) enterCar(best);
      else if(m) interact(m.key);
    }
  }
  if(car && pressed['e']===undefined){}

  updateWorld(dt);

  updateMissions(dt);
  if(P.hp<=0 && !G.dead){ G.dead='wasted'; G.deadT=3.5; if(P.inCar){P.inCar=null;} sfx.boom(); }
}

function copNear(r){ return G.cars.some(c=>!c.dead&&(c.driver==='cop'||c.patrol)&&copSees(c.x,c.y,c.z,r)); }
// patrulla más cercana que te ve (para que pase a perseguirte)
function witnessCop(r){ let best=null,bd=r; for(const c of G.cars){ if(c.dead||!c.patrol||c.driver!=='ai') continue; const d=dist(c.x,c.y,G.player.x,G.player.y); if(d<bd&&copSees(c.x,c.y,c.z,r)){ bd=d; best=c; } } return best; }

function nearMarker(){
  const P=G.player;
  for(const m of activeMarkers()) if(dist(m.x,m.y,P.x,P.y)<(m.key==='desert'?150:55) && Math.abs(P.z-(m.z===undefined?groundZ(m.x,m.y):m.z))<STEP_UP) return m;
  return null;
}
function activeMarkers(){
  const list=[], T=missionTarget();
  if(T) list.push(Object.assign({main:true},T));
  list.push(Object.assign({svc:'+',col:'#e44'},LOC.hospital), Object.assign({svc:'$',col:'#4a4'},LOC.pawn), Object.assign({svc:'⌂',col:'#ccc'},LOC.home));
  if(!G.side) for(const S of SIDE) if(sideAvailable(S)){ const L=locOf(S.at); if(L) list.push({key:'side:'+S.id,x:L.x+(S.dx||0),y:L.y+(S.dy||0),name:S.who+': '+S.title,svc:'?',col:'#b46ad8',side:S}); }
  if(canDeal()) DEALERS.forEach((d,i)=>list.push({key:'dealer'+i,x:d.x,y:d.y,name:d.name,svc:'●',col:'#39f'}));
  if(G.mi>=missionIdx('1x06') && G.mi<missionIdx('2x02')) list.push(Object.assign({svc:'T',col:'#a33'},LOC.tuco));
  if(G.rvId) list.push(Object.assign({svc:'⚗',col:'#3cf'},DESERT));
  if(labOpen()) list.push(Object.assign({svc:'⚗',col:'#3cf'},LOC.lavanderia));
  if(tentsOpen()) list.push(Object.assign({svc:'⚗',col:'#3cf'},LOC.vamonos));
  // eliminar duplicados (el objetivo de la misión tiene prioridad)
  const seen={}; return list.filter(m=>{ if(seen[m.key]) return false; seen[m.key]=1; return true; });
}

function enterCar(c){
  const P=G.player;
  if(c.driver==='ai'||c.driver==='cop'){
    // sacar al conductor
    G.peds.push({x:c.x+Math.cos(c.a+Math.PI/2)*30,y:c.y+Math.sin(c.a+Math.PI/2)*30,z:c.z,a:0,sp:70,col:c.driver==='cop'?'#124':'#888',skin:'#e6c09a',flee:8,walk:0,turnT:3,hp:38});
    if(c.driver==='cop'||c.patrol) setWanted(Math.max(G.wanted,2));
    else if(copNear(700)||Math.random()<0.25) setWanted(Math.max(G.wanted,1));
    toast('Coche robado',2);
  } else if(c.parked && !c.owned && Math.random()<0.4){ toast('¡Alarma del coche!',2); beep(900,0.6,'square',0.03); if(copNear(800)) setWanted(Math.max(G.wanted,1)); }
  c.driver='player'; c.parked=false; P.inCar=c;
}
function exitCar(){
  const P=G.player, c=P.inCar; if(Math.abs(c.v)>140) return;
  for(const side of [1,-1]){
    const x=c.x+Math.cos(c.a+side*Math.PI/2)*(c.h/2+16), y=c.y+Math.sin(c.a+side*Math.PI/2)*(c.h/2+16);
    if(!hitSolid(x,y,9)){ P.x=x; P.y=y; break; }
  }
  c.driver=null; c.v*=0.5; c.vx*=0.5; c.vy*=0.5; P.inCar=null; if(!c.owned) c.parked=true;
}

