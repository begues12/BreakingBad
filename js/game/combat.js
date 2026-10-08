"use strict";
// ======================= COMBATE / POLICÍA =======================
// con el truco "sin policía" no se gana búsqueda, salvo en pasos de misión que la exigen (huir, aguantar)
function missionWantsCops(){ const S=typeof curStep==='function'&&curStep(); return !!(S&&(S.type==='escape'||S.type==='survive')); }
function setWanted(n){ n=clamp(n,0,5); if(DEV.noCops&&n>G.wanted&&!missionWantsCops()) return; if(n>G.wanted){ sfx.star(); } G.wanted=n; G.evadeT=0; }
function spawnThugs(n){
  const L=LOC.tuco;
  for(let i=0;i<n;i++){
    let x,y;
    for(let t=0;t<30;t++){ x=L.x+rand(-350,350); y=L.y+rand(80,350); if(!hitSolid(x,y,12)&&!inWater(x,y)&&dist(x,y,G.player.x,G.player.y)>200) break; }
    G.thugs.push({x,y,z:spawnZ(x,y),a:0,hp:60,cool:rand(1,2),col:'#222',walk:0});
  }
}
function fire(x,y,a,owner,spread,dmg,life){
  a+=rand(-spread,spread);
  G.bullets.push({x:x+Math.cos(a)*16,y:y+Math.sin(a)*16,vx:Math.cos(a)*1300,vy:Math.sin(a)*1300,life:life||0.7,owner,dmg:dmg||25});
  sfx.shot();
}
function hurtPlayer(d){
  if(DEV.god) return;
  const P=G.player;
  if(P.armor>0){ const ab=Math.min(P.armor,d*0.7); P.armor-=ab; d-=ab; }
  P.hp-=d; G.hurtFlash=0.3;
}
function blastDamage(source,target,radius,maxDamage){
  const sz=source.z===undefined?groundZ(source.x,source.y):source.z;
  const tz=target.z===undefined?groundZ(target.x,target.y):target.z;
  const dz=Math.abs(tz-sz);
  if(dz>4.5) return 0; // el tablero de un puente protege de la explosión de abajo
  const d=dist(source.x,source.y,target.x,target.y);
  if(d>=radius) return 0;
  const falloff=1-d/radius;
  return maxDamage*falloff*falloff*(1-dz/6);
}
function explodeCar(c){
  c.dead=true; sfx.boom(); G.flash=Math.max(G.flash,0.6);
  for(let i=0;i<30;i++) G.parts.push({x:c.x,y:c.y,vx:rand(-250,250),vy:rand(-250,250),life:rand(.5,1.5),c:Math.random()<.6?'#f93':'#444',s:rand(5,14)});
  G.decals.push({x:c.x,y:c.y,r:58,c:'rgba(20,20,20,.6)'});
  const P=G.player;
  const playerDamage=blastDamage(c,{x:P.x,y:P.y,z:P.z},270,120);
  if(playerDamage>0) hurtPlayer(P.inCar&&P.inCar!==c?playerDamage*0.4:playerDamage);
  for(const p of G.peds){
    if(p.dead) continue;
    const damage=blastDamage(c,p,270,100);
    if(damage<=0) continue;
    p.hp=(p.hp===undefined?38:p.hp)-damage;
    p.blastA=Math.atan2(p.y-c.y,p.x-c.x); p.blastPush=Math.max(p.blastPush||0,Math.min(240,damage*2)); p.flee=6;
    if(p.hp<=0) killPed(p);
  }
  for(const t of G.thugs){ const damage=blastDamage(c,t,290,125); if(damage>0) t.hp-=damage; }
  for(const o of G.officers){ const damage=blastDamage(c,o,290,125); if(damage>0) o.hp-=damage; }
  for(const other of G.cars){
    if(other===c||other.dead||other.burnt) continue;
    const damage=blastDamage(c,other,300,180);
    if(damage<=0) continue;
    other.hp-=damage;
    const dx=other.x-c.x, dy=other.y-c.y, d=Math.hypot(dx,dy)||1, impulse=damage*2.2;
    other.vx=(other.vx||Math.cos(other.a)*(other.v||0))+dx/d*impulse;
    other.vy=(other.vy||Math.sin(other.a)*(other.v||0))+dy/d*impulse;
    other.v=Math.hypot(other.vx,other.vy);
    other.a=Math.atan2(other.vy,other.vx);
    if(other.driver==='ai'){ other.driver=null; other.parked=true; }
    if(other.driver==='cop') setWanted(Math.max(G.wanted,3));
    if(other.hp<=0) other.fire=Math.max(other.fire||0,4-clamp(damage/180,0,1)*3.2);
  }
  if(P.inCar===c){ P.inCar=null; }
  if(c.driver==='cop'){ setWanted(Math.max(G.wanted,3)); }
  c.driver=null; c.burnt=true; c.color='#2a2a2a'; c.v=0; c.vx=0; c.vy=0; c.av=0; c.fire=0; c.hp=0;
}
function killPed(p){
  p.dead=true; p.deadT=40;
  G.decals.push({x:p.x+rand(-5,5),y:p.y+rand(-5,5),r:rand(10,16),c:'rgba(120,0,0,.7)'});
  G.peds.forEach(o=>{ if(!o.dead&&dist(o.x,o.y,p.x,p.y)<300) o.flee=6; });
}


// ¿Puede un agente en (x,y,z) ver al jugador? Si uno está en un puente y el otro debajo,
// el tablero bloquea la visión (diferencia de altura).
function copSees(x,y,z,range){
  const P=G.player;
  if(dist(x,y,P.x,P.y)>=range) return false;
  return Math.abs((z===undefined?spawnZ(x,y):z)-(P.z||0))<3;
}

// Atropellos: uno suelto sin testigos solo da "calor"; la policía actúa si lo ve o si se repite.
// Atropello: solo es delito si una patrulla lo ve. Sin testigos, solo sube el "calor".
function runOver(){
  G.heat=Math.min(100,G.heat+6);
  const cop=witnessCop(650);
  if(cop||copNear(500)){ setWanted(Math.max(G.wanted,1)); if(cop){ cop.driver='cop'; cop.siren=0; } toast('¡Una patrulla te ha visto!',3); }
}
