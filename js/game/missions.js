"use strict";
// ======================= MOTOR DE MISIONES =======================
// Cada capítulo de la serie es una misión. Una misión es una lista de pasos; cada paso tiene un
// tipo (talk, goto, cook, kill...) que define cuándo se completa. Las misiones se declaran como
// datos en js/missions/*.js con addMissions([...]).
//
// Campos comunes de un paso:
//   obj      texto del objetivo en pantalla
//   at       clave de LOC (o 'desert') donde ocurre
//   lines    diálogo que se reproduce al completar el paso (o al interactuar, en 'talk')
//   start()  se ejecuta al empezar el paso
//   done()   se ejecuta al terminarlo (tras el diálogo)
//
// Tipos:
//   talk     ir a `at` y pulsar E. Opcional: car:'rv'|'any' (llegar en ese vehículo), money:n (coste), product:n
//   goto     llegar a `at` (radio `r`), opcional car:'rv'|'any'
//   phone    llamada: reproduce `lines` nada más empezar
//   cook     cocinar en `at` (por defecto el desierto con la autocaravana); lab:true = sin autocaravana
//   kill     eliminar `n` enemigos que aparecen al acercarse a `at` (o junto al jugador si no hay `at`)
//   chase    detener un vehículo que huye (destruirlo); `car` = tipo de coche, `name`
//   collect  recoger `n` objetos (`item`) repartidos alrededor de `at`
//   escape   recibes `stars` estrellas y debes perderlas todas
//   survive  aguantar `secs` segundos con `stars` estrellas
//   hold     permanecer cerca de `at` durante `secs` segundos (vigilar, esperar, cocinar en un sitio)
//   money    tener al menos `amount` dólares (cocinando y vendiendo libremente)
//   sell     vender `lbs` libras desde que empieza el paso
//   deliver  llevar `lbs` libras de producto a `at` y pulsar E

const MISSIONS=[];
function addMissions(list){ for(const m of list) MISSIONS.push(m); }

function curMission(){ return G.side?SIDE[G.side.i]:MISSIONS[G.mi]; }
// ---------- extraños y locos (misiones secundarias) ----------
// Se juegan con los mismos pasos que la historia. Mientras dura una, la misión principal queda en pausa
// (se guarda su paso y estado) y al terminarla se vuelve exactamente a donde estabas.
const SIDE=[];
function addSide(list){ for(const s of list) SIDE.push(s); }
function sideAvailable(S){ return !(G.sideDone||{})[S.id] && G.mi>=missionIdx(S.from) && (S.to===undefined||G.mi<=missionIdx(S.to)); }
function startSide(id){
  const i=SIDE.findIndex(s=>s.id===id); if(i<0||G.side) return;
  const S=SIDE[i]; G.side={i,mainStep:G.step,mainMs:G.ms}; G.step=-1; G.ms={};
  G.card={t:0,code:'?',title:S.title,season:'Extraños'};
  const go=()=>nextStep(); if(S.intro) say(S.intro,go); else go();
}
function endSide(){
  const S=SIDE[G.side.i]; G.sideDone=G.sideDone||{}; G.sideDone[S.id]=true;
  if(S.reward){ G.money+=S.reward; floater(G.player.x,G.player.y,'+$'+S.reward.toLocaleString(),'#7f7'); sfx.cash(); }
  if(S.done) S.done();
  G.card={t:0,code:'?',title:S.title,season:'Extraños',complete:true,reward:S.reward};
  const back=()=>{ G.step=G.side.mainStep; G.ms=G.side.mainMs||{}; G.ms.finishing=false; G.side=null; clearMissionActors(); save(); };
  if(S.outro) say(S.outro,back); else back();
}
function curStep(){ const M=curMission(); return M&&M.steps[G.step]; }
// nivel de "Heisenberg" para el aspecto de Walter (cabeza rapada desde 1x06)
function heisLook(){ return G.mi>=missionIdx('2x01') && G.mi<missionIdx('5x15'); }

function startMission(i){
  G.mi=i; G.step=-1; G.ms={};
  const M=MISSIONS[i];
  if(!M){ G.ended=true; toast('Has completado Breaking Bad. Modo libre.',6); save(); return; }
  G.card={t:0,code:M.code,title:M.title,season:M.season};
  sfx.star();
  if(M.start) M.start();
  const go=()=>nextStep();
  const intro=()=>{ if(M.intro) say(M.intro,go); else go(); };
  const cs=CUTSCENES[M.code], cineStart=M.cineStart===undefined?1:M.cineStart;
  if(cs) playCutscene(cs.slice(0,cineStart),intro); else intro();
}
function nextStep(){
  G.step++; G.ms={t:0};
  const M=curMission(), S=curStep();
  if(!S){ return completeMission(); }
  save();
  if(S.start) S.start();
  const T=STEP_TYPES[S.type]; if(T&&T.start) T.start(S,G.ms);
  if(S.obj) toast('OBJETIVO: '+S.obj,4);
}
// termina el paso actual: diálogo de cierre y siguiente paso
function finishStep(extraLines){
  const S=curStep(); if(!S||G.ms.finishing) return;
  G.ms.finishing=true;
  const lines=[...(extraLines||[]),...(S.type==='talk'||S.type==='phone'?[]:(S.lines||[]))];
  const after=()=>{ if(S.done) S.done(); clearMissionActors(); nextStep(); };
  if(lines.length) say(lines,after); else after();
}
function completeMission(){
  if(G.side){ endSide(); return; }
  const M=curMission();
  if(M.reward){ G.money+=M.reward; floater(G.player.x,G.player.y,'+$'+M.reward.toLocaleString(),'#7f7'); sfx.cash(); }
  G.done=(G.done||0)+1;
  G.card={t:0,code:M.code,title:M.title,season:M.season,complete:true,reward:M.reward};
  const go=()=>startMission(G.mi+1);
  const outro=()=>{ if(M.outro) say(M.outro,()=>{ G.cardWait=go; }); else G.cardWait=go; };
  const cs=CUTSCENES[M.code], n0=M.cineStart===undefined?1:M.cineStart; if(cs&&cs.length>n0){ G.card=null; playCutscene(cs.slice(n0),()=>{ G.card={t:0,code:M.code,title:M.title,season:M.season,complete:true,reward:M.reward}; outro(); }); } else outro();
}
// Personajes que hablan en persona en un paso aparecen físicamente en el lugar. Con arrive:true
// llegan en coche (no se puede hablar con ellos hasta que aparcan). Las llamadas "(Llamada)..." no cuentan.
function stepSpeakers(S){
  const ids=new Set();
  for(const l of (S.lines||[])) if(Array.isArray(l)&&typeof l[1]==='string'&&!['W','N','P','X','V'].includes(l[0])&&!/^\((Llamada|Por teléfono|Grabado)/.test(l[1])) ids.add(l[0]);
  const at=S.at; for(const n of WORLD_NPC) if(n.loc===at&&G.mi>=n.from&&(n.to===undefined||G.mi<=n.to)) ids.delete(n.id);
  return [...ids];
}
function spawnStepActors(S,ms){
  const ids=S.actors||stepSpeakers(S), L=locOf(S.at); if(!ids.length||!L) return;
  G.actors=ids.map((id,i)=>({id,x:L.x+40+i*28,y:L.y+18,a:0,hidden:!!S.arrive}));
  if(S.arrive){ const P=G.player; let nr=null;
    for(let k=0;k<12&&!nr;k++){ const a=k*0.52, q=nearestRoad(L.x+Math.cos(a)*900,L.y+Math.sin(a)*900,r=>r.drive&&r.kind!=='hwy'); if(dist(q.x,q.y,P.x,P.y)>500) nr=q; }
    nr=nr||nearestRoad(L.x+900,L.y,r=>r.drive);
    const c=spawnCar(S.arriveCar||'sedan',nr.x,nr.y,nr.a,{driver:'ride',mission:true});
    c.route=navRoute(c.x,c.y,c.z,L.parkX||L.x,L.parkY||L.y); c.ri=0; c.goal=[L.parkX||L.x,L.parkY||L.y]; ms.arriveCar=c.id; ms.waiting=true; }
}
function updateStepActors(ms){
  if(!ms.waiting) return; const c=G.cars.find(c=>c.id===ms.arriveCar); if(!c){ ms.waiting=false; return; }
  if(c.arrived){ ms.waiting=false; c.driver=null; c.parked=true; G.actors.forEach((a,i)=>{ a.hidden=false; a.x=c.x+Math.cos(c.a+Math.PI/2)*(30+i*24); a.y=c.y+Math.sin(c.a+Math.PI/2)*(30+i*24); }); sfx.blip(); }
}
function drawStepActors(t){
  // quienes dan las misiones secundarias, de pie junto a su "?"
  if(!G.side) for(const S of SIDE){ if(!sideAvailable(S)) continue; const L=locOf(S.at); if(!L) continue;
    const id=(S.intro&&S.intro.find(l=>Array.isArray(l)&&l[0]!=='N'&&l[0]!=='W')||['X'])[0], Lk=LOOK[id]||LOOK.X, x=L.x+(S.dx||0)+18, y=L.y+(S.dy||0);
    drawPerson(x,y,Math.atan2(G.player.y-y,G.player.x-x),Lk.cloth||'#444',Lk.skin,0,false,false); }
  for(const a of (G.actors||[])){ if(a.hidden) continue; const L=(a.id==='W'?walterLook():LOOK[a.id])||{skin:'#d9b08c',cloth:'#444'};
    const ang=a.run?a.a:Math.atan2(G.player.y-a.y,G.player.x-a.x);
    drawPerson(a.x,a.y,ang,a.body||L.cloth||'#444',L.skin,a.walk||0,!!a.gun,false);
    ctx.font='bold 11px sans-serif'; ctx.textAlign='center'; ctx.fillStyle='rgba(0,0,0,.7)'; const n=(CHAR[a.id]||{}).n||''; ctx.fillText(n,a.x+1,a.y-17); ctx.fillStyle='#fff'; ctx.fillText(n,a.x,a.y-18); }
}
function clearMissionActors(){
  G.actors=[];
  G.thugs=G.thugs.filter(t=>!t.mission);
  for(const c of G.cars) if(c.mission){ c.mission=false; if(c.driver==='flee') c.driver='ai'; }
  G.pickups=[];
}

// ---------- utilidades de los pasos ----------
function locOf(key){ return key==='desert'?DESERT:LOC[key]; }
function nearLoc(key,r){ const L=locOf(key), P=G.player; return L && dist(L.x,L.y,P.x,P.y)<(r||(key==='desert'?160:90)) && Math.abs(P.z-groundZ(L.x,L.y))<STEP_UP; }
function inCarKind(kind){
  const c=G.player.inCar; if(!kind) return true; if(!c) return false;
  return kind==='any' || (kind==='rv' && c.id===G.rvId);
}
function spawnEnemies(n,x,y,opt){
  opt=opt||{};
  for(let i=0;i<n;i++){
    let px=x,py=y;
    for(let t=0;t<40;t++){ px=x+rand(-320,320); py=y+rand(-320,320); if(!hitSolid(px,py,12)&&!inWater(px,py)&&dist(px,py,G.player.x,G.player.y)>220) break; }
    G.thugs.push({x:px,y:py,z:spawnZ(px,py),a:0,hp:opt.hp||60,cool:rand(1,2),col:opt.col||'#222',walk:0,mission:true});
  }
}

const STEP_TYPES={
  // trayecto con conductor: el jugador va dentro y la cámara sigue al vehículo hasta el destino
  ride:{ start(S,ms){ const A=locOf(S.from), B=locOf(S.to), P=G.player;
      if(G.inside) exitInterior(); if(P.inCar){ P.inCar.driver=null; P.inCar=null; }
      const nr=nearestRoad(A.x,A.y,r=>r.drive&&r.kind!=='hwy');
      const c=spawnCar(S.car||'ambulance',nr.x,nr.y,nr.a,{driver:'ride',mission:true,name:S.name||'Ambulancia',siren:0});
      c.route=navRoute(c.x,c.y,c.z,B.parkX||B.x,B.parkY||B.y); c.ri=0; c.goal=[B.parkX||B.x,B.parkY||B.y];
      P.inCar=c; P.x=c.x; P.y=c.y; ms.car=c.id; ms.t=0; sfx.phone&&0; },
    update(S,ms,dt){ const c=G.cars.find(c=>c.id===ms.car); ms.t+=dt; if(!c){ finishStep(); return; }
      if(Math.floor(ms.t*2)%2===0&&Math.floor((ms.t-dt)*2)%2===1) beep(960,0.25,'sine',0.02);   // sirena
      if(c.arrived||ms.t>60){ const P=G.player, B=locOf(S.to);
        if(S.keep){ c.driver=null; c.parked=true; c.v=c.vx=c.vy=0; G.keepCar=c.id; }
        else { P.inCar=null; P.x=B.x; P.y=B.y; P.z=spawnZ(B.x,B.y); c.dead=true; }
        finishStep(); } } },
  // escena en el mundo: actores que van de un punto a otro (relativos al lugar `at`) mientras el jugador mira
  watch:{ start(S,ms){ const L=locOf(S.at); ms.t=0; ms.finishing=false;
      G.actors=(S.actors||[]).map(a=>({id:a.id,x:L.x+a.from[0],y:L.y+a.from[1],fx:L.x+a.from[0],fy:L.y+a.from[1],tx:L.x+a.to[0],ty:L.y+a.to[1],t0:a.delay||0,dur:a.dur||3,body:a.body,gun:a.gun,run:true,walk:0}));
      G.camFocus={x:L.x+(S.look||[0,0])[0],y:L.y+(S.look||[0,0])[1]}; if(S.cap) toast(S.cap,S.dur||6); },
    update(S,ms,dt){ ms.t+=dt;
      for(const a of G.actors){ const k=clamp((ms.t-a.t0)/a.dur,0,1); if(k>0&&k<1){ a.walk+=dt*16; a.a=Math.atan2(a.ty-a.fy,a.tx-a.fx); } a.x=a.fx+(a.tx-a.fx)*k; a.y=a.fy+(a.ty-a.fy)*k; a.hidden=k>=1&&a.vanish; }
      if(ms.t>=(S.dur||6)){ G.camFocus=null;
        if(S.release){ const c=G.cars.find(c=>c.id===G.keepCar), P=G.player; if(c){ P.inCar=null; P.x=c.x+30; P.y=c.y+30; c.dead=true; } G.keepCar=null; }
        finishStep(); } } },
  // cinemática dentro de la misión (y después el diálogo `lines`, si lo hay)
  cine:{ start(S,ms){ ms.finishing=true; playCutscene(S.scenes,()=>{ G.ms.finishing=false; finishStep(); }); } },
  // minijuego: en el lugar `at` se lanza con E; sin `at` arranca solo (y se reintenta a los 3 s si se falla)
  game:{ interact(S){ STEP_TYPES.game.go(S); },
    go(S){ const ms=G.ms; if(ms.playing) return; ms.playing=true;
      startMinigame(S,()=>{ ms.playing=false; finishStep(); },()=>{ ms.playing=false; ms.wait=3; toast('Inténtalo de nuevo'+(S.at?' (E en el lugar)':''),3); }); },
    update(S,ms,dt){ if(S.at) return; ms.wait=(ms.wait||0.4)-dt; if(!ms.playing&&ms.wait<=0) STEP_TYPES.game.go(S); } },
  talk:{ start(S,ms){ spawnStepActors(S,ms); }, update(S,ms){ updateStepActors(ms); if(S.auto&&!ms.waiting&&!ms.autoGo&&!G.dialog&&!G.cine){ ms.autoGo=true; STEP_TYPES.talk.interact(S); } },
    interact(S){
      if(G.ms.waiting){ toast('Todavía no han llegado...'); return; }
      if(S.car && !inCarKind(S.car) && !(S.car==='rv' && rvNear(S.at))){ toast(S.car==='rv'?'Tienes que venir con la autocaravana.':'Tienes que venir en coche.'); return; }
      if(S.money && G.money<S.money){ toast('Necesitas $'+S.money.toLocaleString()+'.'); return; }
      if(S.product && G.product<S.product){ toast('Necesitas '+S.product+' lb de producto. Cocina primero.'); return; }
      if(S.money){ G.money-=S.money; floater(G.player.x,G.player.y,'-$'+S.money.toLocaleString(),'#f66'); }
      if(S.product){ G.product=+(G.product-S.product).toFixed(1); }
      const continueTalk=()=>say(S.lines||[],()=>finishStep());
      if(S.scenes){ G.ms.finishing=true; playCutscene(S.scenes,()=>{ G.ms.finishing=false; continueTalk(); }); }
      else continueTalk(); } },
  goto:{ update(S){ if(nearLoc(S.at,S.r) && (!S.car||inCarKind(S.car))) finishStep(); } },
  phone:{ start(S){ sfx.phone(); say(S.lines||[],()=>finishStep()); } },
  cook:{ interact(S){
      if(!S.lab && !rvNear(S.at||'desert')){ toast('Trae la autocaravana para cocinar.'); return; }
      say(S.pre||[['W','Manos a la obra.']],()=>startCook(false)); } ,
    cooked(S){ finishStep(); } },
  kill:{ update(S,ms){
      const L=S.at?locOf(S.at):null;
      if(!ms.spawned && (!L || dist(L.x,L.y,G.player.x,G.player.y)<650)){ ms.spawned=true;
        spawnEnemies(S.n||4,L?L.x:G.player.x,L?L.y:G.player.y,S); if(S.pre) say(S.pre); }
      if(ms.spawned && !G.thugs.some(t=>t.mission&&t.hp>0)) finishStep(); },
    info(S){ return G.ms.spawned?'Enemigos: '+G.thugs.filter(t=>t.mission).length:null; } },
  chase:{ start(S,ms){
      const L=S.at?locOf(S.at):null, P=G.player;
      let x=L?L.x:P.x+300, y=L?L.y:P.y; const nr=nearestRoad(x,y,r=>r.drive&&r.kind!=='hwy');
      const c=spawnCar(S.car||'sedan',nr.x,nr.y,nr.a,{driver:'flee',mission:true,name:S.name});
      c.hp=c.maxhp=S.hp||c.maxhp; ms.car=c.id; },
    update(S,ms){ const c=G.cars.find(c=>c.id===ms.car);
      if(!c||c.dead||c.hp<=0||c.burnt) finishStep(); } },
  collect:{ start(S,ms){
      const L=locOf(S.at)||G.player, radius=S.radius||260; G.pickups=[];
      for(let i=0;i<(S.n||3);i++){ let x,y; for(let t=0;t<40;t++){ x=L.x+rand(-radius,radius); y=L.y+rand(-radius,radius); if(!hitSolid(x,y,14)&&!inWater(x,y)) break; }
        G.pickups.push({x,y,z:spawnZ(x,y,G.player.z),item:S.item||'barril'}); } },
    update(S){ const P=G.player;
      for(const p of G.pickups) if(!p.got && dist(p.x,p.y,P.x,P.y)<(P.inCar?40:24) && Math.abs(P.z-p.z)<STEP_UP){ p.got=true; sfx.blip(); floater(p.x,p.y,'+1 '+p.item,'#ffd23a'); }
      if(G.pickups.length && G.pickups.every(p=>p.got)) finishStep(); },
    info(S){ return 'Recogido: '+G.pickups.filter(p=>p.got).length+' / '+G.pickups.length; } },
  escape:{ start(S){ setWanted(S.stars||2); }, update(S,ms){ ms.t+=1/60; if(ms.t>1 && G.wanted===0) finishStep(); } },
  survive:{ start(S){ setWanted(S.stars||2); }, update(S,ms,dt){ ms.t+=dt; if(G.wanted<(S.stars||2)) setWanted(S.stars||2); if(ms.t>=S.secs){ G.wanted=0; finishStep(); } },
    info(S){ return 'Aguanta: '+Math.max(0,Math.ceil(S.secs-G.ms.t))+' s'; } },
  hold:{ update(S,ms,dt){ if(nearLoc(S.at,S.r||200)) ms.t+=dt; if(ms.t>=S.secs) finishStep(); },
    info(S){ return nearLoc(S.at,S.r||200)?'Espera: '+Math.max(0,Math.ceil(S.secs-G.ms.t))+' s':null; } },
  money:{ update(S){ if(G.money>=S.amount) finishStep(); },
    info(S){ return 'Dinero: $'+Math.floor(G.money).toLocaleString()+' / $'+S.amount.toLocaleString(); } },
  sell:{ start(S,ms){ ms.sold0=G.soldLbs||0; }, update(S,ms){ if((G.soldLbs||0)-ms.sold0>=S.lbs) finishStep(); },
    info(S){ return 'Vendido: '+((G.soldLbs||0)-G.ms.sold0).toFixed(1)+' / '+S.lbs+' lb'; } },
  deliver:{ interact(S){
      if(G.product<(S.lbs||1)){ toast('Necesitas '+(S.lbs||1)+' lb de producto.'); return; }
      G.product=+(G.product-(S.lbs||1)).toFixed(1); G.soldLbs=(G.soldLbs||0)+(S.lbs||1);
      if(S.pay){ G.money+=S.pay; sfx.cash(); floater(G.player.x,G.player.y,'+$'+S.pay.toLocaleString()); }
      finishStep(); } },
};
function rvNear(key){ const rv=G.cars.find(c=>c.id===G.rvId), L=locOf(key||'desert'); return rv&&L&&dist(rv.x,rv.y,L.x,L.y)<280; }

// ---------- integración con el juego ----------
function updateMissions(dt){
  if(G.card){ G.card.t+=dt;
    if(G.card.complete){ if(G.card.t>3.2 && !G.dialog){ G.card=null; const go=G.cardWait; G.cardWait=null; if(go) go(); } }
    else if(G.card.code==='?'&&G.card.t>2.6) G.card=null;
    else if(G.card.t>3.2) G.card=null; }
  if(G.dialog||G.cook||G.mg) return;
  const S=curStep(); if(!S||G.ms.finishing) return;
  const T=STEP_TYPES[S.type]; if(T&&T.update) T.update(S,G.ms,dt);
}
// E junto a un lugar: ¿lo consume el paso actual?
function missionInteract(key){
  const S=curStep(); if(!S||G.ms.finishing||G.card) return false;
  const T=STEP_TYPES[S.type];
  if(T&&T.interact&&(S.at||'desert')===key){ T.interact(S); return true; }
  return false;
}
function missionCooked(){ const S=curStep(); if(S&&S.type==='cook') STEP_TYPES.cook.cooked(S); }
function missionTarget(){
  const S=curStep(); if(!S||G.card) return null;
  if(S.type==='chase'){ const c=G.cars.find(c=>c.id===G.ms.car); return c?{x:c.x,y:c.y,z:c.z,name:S.name||'Objetivo',key:'_chase'}:null; }
  if(S.type==='kill' && G.ms.spawned){ const t=G.thugs.find(t=>t.mission&&t.hp>0); return t?{x:t.x,y:t.y,z:t.z,name:'Enemigo',key:'_kill'}:null; }
  if(S.type==='collect'){ const p=G.pickups.find(p=>!p.got); return p?{x:p.x,y:p.y,z:p.z,name:p.item,key:'_pick'}:null; }
  if(S.type==='money'||S.type==='sell'||S.type==='escape'||S.type==='survive'||S.type==='phone') return null;
  const L=locOf(S.at||(S.type==='cook'?'desert':null)); return L?Object.assign({key:S.at||'desert'},L):null;
}
function missionInfo(){ const S=curStep(); const T=S&&STEP_TYPES[S.type]; return T&&T.info?T.info(S):null; }

// IA de un coche que huye (persecuciones)
function aiFlee(c,dt){
  const P=G.player, d=dist(c.x,c.y,P.x,P.y);
  c.fleeT=(c.fleeT||0)-dt;
  if(!c.route||c.fleeT<=0||c.ri>=c.route.length-1){
    // escoge un punto lejos del jugador
    let bx=c.x,by=c.y,bd=-1;
    for(let i=0;i<6;i++){ const x=c.x+rand(-1500,1500), y=c.y+rand(-1500,1500); const s=dist(x,y,P.x,P.y); if(x>200&&y>200&&x<WW-200&&y<WH-200&&s>bd){ bd=s; bx=x; by=y; } }
    c.route=navRoute(c.x,c.y,c.z,bx,by); c.ri=0; c.fleeT=4; }
  while(c.ri<c.route.length-1 && dist(c.x,c.y,c.route[c.ri][0],c.route[c.ri][1])<80) c.ri++;
  const [tx,ty]=c.route[c.ri], ta=Math.atan2(ty-c.y,tx-c.x), diff=angDiff(c.a,ta);
  if(c.rev>0){ c.rev-=dt; driveCar(c,dt,false,true,-Math.sign(diff),false); return; }
  const fast=d<900;
  driveCar(c,dt,fast&&Math.abs(diff)<2,Math.abs(diff)>1.4&&c.v>200,clamp(diff*2.2,-1,1),false);
  if(Math.abs(c.v)<25&&fast){ c.stuck=(c.stuck||0)+dt; if(c.stuck>1){ c.rev=0.8; c.stuck=0; c.route=null; } } else c.stuck=0;
}

// ---------- dibujo: objetos a recoger + tarjeta del capítulo ----------
function drawPickups(t,upper){
  for(const p of (G.pickups||[])){ if(p.got) continue;
    const elevated=p.z!==undefined&&elevOf(p)>DECK;
    if(elevated!==upper) continue;
    const [lx,ly]=elevated?liftObj(p):[0,0]; ctx.save(); ctx.translate(lx,ly);
    const b=Math.sin(t*4)*2;
    ctx.fillStyle='rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(p.x+3,p.y+5,9,5,0,0,7); ctx.fill();
    ctx.fillStyle='#2a6fb0'; roundRect(p.x-8,p.y-10+b,16,18,4); ctx.fill();
    ctx.fillStyle='#ffd23a'; ctx.fillRect(p.x-8,p.y-3+b,16,4);
    ctx.strokeStyle='rgba(255,210,58,'+(0.5+0.5*Math.sin(t*5))+')'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(p.x,p.y,18,0,7); ctx.stroke(); ctx.restore(); }
}
function drawMissionCard(){
  const C=G.card; if(!C) return;
  const a=clamp(Math.min(C.t*3,(3.2-C.t)*3),0,1);
  ctx.save(); ctx.globalAlpha=a;
  ctx.fillStyle='rgba(0,0,0,.72)'; ctx.fillRect(0,VH*0.32,VW,VH*0.26);
  // tabla periódica: el código del capítulo como un elemento
  const bx=VW/2-260, by=VH*0.36, bs=92;
  ctx.fillStyle='#1f5a2a'; ctx.fillRect(bx,by,bs,bs); ctx.strokeStyle='#8fdc8f'; ctx.lineWidth=3; ctx.strokeRect(bx,by,bs,bs);
  txt(C.code,bx+bs/2,by+bs/2+12,30,'#fff','center','900 ');
  txt(C.season,bx+bs/2,by+18,12,'#bfe8bf','center');
  txt(C.complete?'CAPÍTULO COMPLETADO':'CAPÍTULO',bx+bs+24,by+28,16,C.complete?'#7f7':'#ffd23a','left','700 ');
  txt(C.title,bx+bs+24,by+66,38,'#fff','left','900 ');
  if(C.complete&&C.reward) txt('+$'+C.reward.toLocaleString(),bx+bs+24,by+92,18,'#7f7','left');
  ctx.restore();
}

// ---------- ayudas para los guiones de misión ----------
function giveGun(ammo){ const P=G.player; P.gun=true; P.ammo+=ammo||24; }
function giveRV(key){ const L=LOC[key]; const rv=spawnCar('rv',L.parkX,L.parkY,L.parkA,{owned:true,name:'Autocaravana'}); G.rvId=rv.id; return rv; }
function loseRV(){ const rv=G.cars.find(c=>c.id===G.rvId); if(rv){ if(G.player.inCar===rv) G.player.inCar=null; rv.dead=true; } G.rvId=null; }
function pay(n){ G.money+=n; sfx.cash(); floater(G.player.x,G.player.y,(n>=0?'+$':'-$')+Math.abs(n).toLocaleString(),n>=0?'#7f7':'#f66'); }
