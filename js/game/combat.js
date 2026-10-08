"use strict";
// ======================= COMBATE / POLICÍA =======================
function setWanted(n){ n=clamp(n,0,5); if(n>G.wanted){ sfx.star(); } G.wanted=n; G.evadeT=0; }
function spawnThugs(n){
  const L=LOC.tuco;
  for(let i=0;i<n;i++){
    let x,y;
    for(let t=0;t<30;t++){ x=L.x+rand(-350,350); y=L.y+rand(80,350); if(!hitSolid(x,y,12)&&!inWater(x,y)&&dist(x,y,G.player.x,G.player.y)>200) break; }
    G.thugs.push({x,y,a:0,hp:60,cool:rand(1,2),col:'#222',walk:0});
  }
}
function fire(x,y,a,owner,spread,dmg){
  a+=rand(-spread,spread);
  G.bullets.push({x:x+Math.cos(a)*16,y:y+Math.sin(a)*16,vx:Math.cos(a)*1300,vy:Math.sin(a)*1300,life:0.7,owner,dmg:dmg||25});
  sfx.shot();
}
function hurtPlayer(d){
  const P=G.player;
  if(P.armor>0){ const ab=Math.min(P.armor,d*0.7); P.armor-=ab; d-=ab; }
  P.hp-=d; G.hurtFlash=0.3;
}
function explodeCar(c){
  c.dead=true; sfx.boom(); G.flash=Math.max(G.flash,0.6);
  for(let i=0;i<30;i++) G.parts.push({x:c.x,y:c.y,vx:rand(-250,250),vy:rand(-250,250),life:rand(.5,1.5),c:Math.random()<.6?'#f93':'#444',s:rand(5,14)});
  G.decals.push({x:c.x,y:c.y,r:40,c:'rgba(20,20,20,.6)'});
  const P=G.player;
  if(dist(c.x,c.y,P.x,P.y)<110){ hurtPlayer(P.inCar===c?100:45); }
  for(const p of G.peds) if(!p.dead && dist(p.x,p.y,c.x,c.y)<100) killPed(p);
  for(const t of G.thugs) if(dist(t.x,t.y,c.x,c.y)<100) t.hp=0;
  if(P.inCar===c){ P.inCar=null; }
  if(c.driver==='cop'){ setWanted(Math.max(G.wanted,3)); }
  c.driver=null; c.burnt=true; c.color='#2a2a2a'; c.v=0; c.vx=0; c.vy=0; c.av=0; c.fire=0; c.hp=0;
}
function killPed(p){
  p.dead=true; p.deadT=40;
  G.decals.push({x:p.x+rand(-5,5),y:p.y+rand(-5,5),r:rand(10,16),c:'rgba(120,0,0,.7)'});
  G.peds.forEach(o=>{ if(!o.dead&&dist(o.x,o.y,p.x,p.y)<300) o.flee=6; });
}


// ¿Puede un agente en (x,y,layer) ver al jugador? Si uno está sobre el puente
// (tramo elevado) y el otro abajo, el tablero bloquea la visión.
function copSees(x,y,layer,range){
  const P=G.player;
  if(dist(x,y,P.x,P.y)>=range) return false;
  const pl=P.layer||0, cl=layer||0;
  if(pl===cl) return true;
  const [ex,ey]=pl?[P.x,P.y]:[x,y];   // quien está en la autopista
  return hwyInfo(ex,ey).f<0.3;         // en rampas casi a ras de suelo sí se ven
}

// Atropellos: uno suelto sin testigos solo da "calor"; la policía actúa si lo ve o si se repite.
function runOver(){
  G.runOvers=(G.runOvers||0)+1; G.heat=Math.min(100,G.heat+6);
  const witnessed=copNear(600);
  if(witnessed || G.runOvers>=3) setWanted(Math.max(G.wanted,1));
  if(G.runOvers>=6) setWanted(Math.max(G.wanted,2));
}
