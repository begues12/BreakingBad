"use strict";
// ======================= VIDA DE LOS PEATONES =======================
// Reacciones con bocadillos, humor, gestos, golpes de coche graduados (lento = empujón, rápido = atropello),
// conversaciones entre ellos, teléfono, perros que pasean, gente que se sienta, mira el móvil o hace fotos.
const PED_SAY={
  bump:['¡Eh, mira por dónde vas!','¡Cuidado, hombre!','¡Oye!','¿Estás ciego?','Perdona, ¿eh?','¡Que me pisas!'],
  run:['¡Uy! ¿Qué prisa hay?','¡Más despacio!','¡Casi me tiras!','¿Y este loco?'],
  car_slow:['¡Ay! ¡Que me has dado!','¡¿Pero qué haces?!','¡Aprende a conducir!','¡Voy a llamar a la policía!','¡Mi pierna!'],
  car_horn:['¡Ya voy, ya voy!','¡Pita a tu madre!','¡Tranquilo!','¡Qué impaciente!'],
  car_near:['¡Frena!','¡Cuidado!','¡Eh, la acera es para andar!'],
  gun:['¡Tiene un arma!','¡Corred!','¡Socorro!','¡Llamad a la policía!','¡No dispare!'],
  aim:['¡No me apuntes!','Tranquilo... tranquilo...','¡Por favor, no!'],
  heis:['¿Ese no es...?','Me suena su cara...','Qué tío más raro.','¿Has visto ese sombrero?'],
  hello:['Buenos días.','Hola.','Qué calor hace hoy.','¿Qué tal?','Buenas.'],
  chat:['¿Viste el partido?','Mi cuñado dice que...','La gasolina está carísima.','Han abierto un Pollos Hermanos nuevo.','¿Te has enterado de lo de los aviones?','Este barrio ya no es lo que era.','Dicen que hay un tal Heisenberg...','Hace un calor horrible.'],
  phone:['Sí, mamá... sí...','¿Me oyes? No hay cobertura.','Llego en diez minutos.','No, no, el martes no puedo.','Te dije que no.'],
  scared_after:['Qué susto...','Esta ciudad está fatal.','Me tiemblan las piernas.'],
  dog:['¡Rex, ven aquí!','Buen chico.','¡No, ese no se come!'],
};
const pick=a=>a[(Math.random()*a.length)|0];
function pedSay(p,kind,col,dur){ if(p.dead) return; if(p.bub&&p.bub.t>0&&p.bub.pri>(kind==='gun'?3:1)) return;
  p.bub={txt:pick(PED_SAY[kind]),t:dur||2.6,col:col||'#fff',pri:kind==='gun'||kind==='car_slow'?3:1}; }
function pedMood(p,m,t){ p.mood=m; p.moodT=t||4; }

// golpe de coche graduado: despacio empuja y enfada; rápido hiere o mata
function carHitsPed(car,p){
  const v=Math.abs(car.v), P=G.player;
  if(p.dead) return;
  if(v<45){ // apenas un roce: le apartas
    const a=Math.atan2(p.y-car.y,p.x-car.x); p.x=car.x+Math.cos(a)*(car.r+8); p.y=car.y+Math.sin(a)*(car.r+8);
    if(!p.bumpT||p.bumpT<=0){ pedSay(p,'bump','#ffd27a'); pedMood(p,'angry',5); p.bumpT=2; p.shake=0.6; } return; }
  if(v<160){ // golpe: cae al suelo, se levanta cojeando y muy enfadado
    p.down=1.8; p.hurt=(p.hurt||0)+1; p.blastA=Math.atan2(p.y-car.y,p.x-car.x); p.blastPush=v*0.8; p.flee=0;
    pedSay(p,'car_slow','#ff9a7a',3); pedMood(p,'angry',10); sfx.crash();
    if(p.hurt>=3) { killPed(p); runOver(); }
    else { G.heat=Math.min(100,G.heat+2); const cop=witnessCop(500); if(cop){ setWanted(Math.max(G.wanted,1)); cop.driver='cop'; } }
    return; }
  killPed(p); sfx.crash(); runOver();
}

// percepción: qué ve un peatón a su alrededor
function pedSense(p,dt){
  const P=G.player, d=dist(p.x,p.y,P.x,P.y);
  p.bumpT=(p.bumpT||0)-dt; p.senseT=(p.senseT||0)-dt;
  if(p.senseT>0) return; p.senseT=0.25;
  const car=P.inCar;
  if(!car&&d<22&&(keys['shift'])&&P.walk){ pedSay(p,'run','#ffd27a'); pedMood(p,'angry',3); p.shake=0.4; p.a=Math.atan2(P.y-p.y,P.x-p.x); return; }
  if(!car&&d<16&&!p.down){ const a=Math.atan2(p.y-P.y,p.x-P.x); p.x+=Math.cos(a)*6; p.y+=Math.sin(a)*6; if(p.bumpT<=0){ pedSay(p,'bump','#ffd27a'); pedMood(p,'angry',4); p.bumpT=3; } return; }
  if(car&&d<90&&Math.abs(car.v)>200&&!isRoad(p.x,p.y)){ pedSay(p,'car_near','#ffd27a'); p.flee=2; return; }
  if(car&&d<120&&pressed['h']){ pedSay(p,'car_horn','#ffd27a'); pedMood(p,'angry',3); if(isRoad(p.x,p.y)) p.flee=1.5; return; }
  // te apuntan con un arma (a pie, mirando hacia ellos)
  if(!car&&P.gun&&curWeapon().kind!=='melee'&&d<200&&Math.abs(angDiff(P.a,Math.atan2(p.y-P.y,p.x-P.x)))<0.18&&!p.flee){ pedSay(p,'aim','#ffb0b0'); p.hands=2; pedMood(p,'scared',4); return; }
  // saludan o comentan al cruzarse (y reconocen a Heisenberg)
  if(!car&&d<60&&!p.greeted&&Math.random()<0.35){ p.greeted=true; if(typeof heisLook==='function'&&heisLook()&&Math.random()<0.4) pedSay(p,'heis','#cfe8ff'); else pedSay(p,'hello','#e8f8e8',2); p.a=Math.atan2(P.y-p.y,P.x-p.x); }
}

// actividades cuando no pasa nada: hablar con otro, teléfono, sentarse, mirar escaparates
function pedIdle(p,dt){
  p.actT=(p.actT===undefined?rand(4,14):p.actT)-dt;
  if(p.act){ p.act.t-=dt; if(p.act.t<=0){ if(p.act.kind==='chat'&&p.act.with) p.act.with.act=null; p.act=null; p.actT=rand(8,20); } return true; }
  if(p.actT>0) return false;
  p.actT=rand(8,20); const r=Math.random();
  if(r<0.35){ const o=G.peds.find(q=>q!==p&&!q.dead&&!q.act&&!q.flee&&dist(q.x,q.y,p.x,p.y)<60);
    if(o){ const t=rand(6,12); p.act={kind:'chat',t,with:o}; o.act={kind:'chat',t,with:p}; p.a=Math.atan2(o.y-p.y,o.x-p.x); o.a=p.a+Math.PI; return true; } }
  if(r<0.6){ p.act={kind:'phone',t:rand(5,10)}; return true; }
  if(r<0.75){ p.act={kind:'look',t:rand(3,6)}; p.a+=Math.PI/2*(Math.random()<.5?1:-1); return true; }
  return false;
}
// se llama desde updatePed: devuelve true si el peatón no debe andar este frame
function pedLife(p,dt){
  if(p.dead) return true;
  if(p.bub){ p.bub.t-=dt; if(p.bub.t<=0) p.bub=null; }
  if(p.moodT>0){ p.moodT-=dt; if(p.moodT<=0){ if(p.mood==='scared'&&Math.random()<0.4) pedSay(p,'scared_after','#ddd'); p.mood=null; } }
  if(p.shake>0) p.shake-=dt; if(p.hands>0) p.hands-=dt;
  if(p.down>0){ p.down-=dt; if(p.blastPush>0){ p.x+=Math.cos(p.blastA)*p.blastPush*dt; p.y+=Math.sin(p.blastA)*p.blastPush*dt; p.blastPush=Math.max(0,p.blastPush-500*dt); resolve(p,7); }
    if(p.down<=0){ p.limp=12; attachPed(p); } return true; }
  if(p.limp>0) p.limp-=dt;
  pedSense(p,dt);
  if(p.flee>0) return false;
  if(p.mood==='angry'&&p.moodT>2){ p.a=Math.atan2(G.player.y-p.y,G.player.x-p.x); return true; }   // se queda mirándote mal
  if(p.hands>0) return true;
  if(pedIdle(p,dt)){ if(p.act&&p.act.kind==='chat'&&Math.random()<dt*0.35) pedSay(p,'chat','#e8e8e8',2.6);
    if(p.act&&p.act.kind==='phone'&&Math.random()<dt*0.25) pedSay(p,'phone','#e8e8e8',2.4); return true; }
  if(p.dog&&Math.random()<dt*0.03) pedSay(p,'dog','#e8e8e8',2);
  return false;
}
// reacción de todos a un disparo/explosión cercano
function pedsHearShot(x,y,r){ for(const p of G.peds){ if(p.dead||dist(p.x,p.y,x,y)>r) continue; p.flee=7; p.act=null; pedMood(p,'scared',10); if(Math.random()<0.5) pedSay(p,'gun','#ffb0b0',2.2); } }

// ---------- dibujo de extras: perro, móvil, manos arriba, caído, bocadillo y emoticono ----------
function drawPedExtras(p,t){
  if(p.dead) return;
  const off=p.shake>0?Math.sin(t*60)*2:0;
  if(p.dog){ const dx=p.x-Math.cos(p.a)*-22+Math.sin(t*3)*3, dy=p.y-Math.sin(p.a)*-22; ctx.strokeStyle='rgba(60,40,20,.7)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(dx,dy); ctx.stroke();
    ctx.fillStyle=p.dog; ctx.beginPath(); ctx.ellipse(dx,dy,6,3.5,p.a,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(dx+Math.cos(p.a)*6,dy+Math.sin(p.a)*6,3,0,7); ctx.fill(); }
  if(p.act&&p.act.kind==='phone'){ ctx.fillStyle='#222'; ctx.fillRect(p.x+Math.cos(p.a+0.9)*6-2,p.y+Math.sin(p.a+0.9)*6-3,4,6); ctx.fillStyle='#6cf'; ctx.fillRect(p.x+Math.cos(p.a+0.9)*6-1,p.y+Math.sin(p.a+0.9)*6-2,2,3); }
  if(p.hands>0){ ctx.fillStyle=p.skin; for(const s of [-1,1]){ ctx.beginPath(); ctx.arc(p.x+Math.cos(p.a+s*1.3)*9,p.y+Math.sin(p.a+s*1.3)*9,2.6,0,7); ctx.fill(); } }
  // emoticono de humor sobre la cabeza
  const ico=p.down>0?'💫':p.mood==='angry'?'💢':p.mood==='scared'?'💦':p.limp>0?'🩹':p.act&&p.act.kind==='chat'?'💬':null;
  if(ico){ ctx.font='13px "Segoe UI Emoji",sans-serif'; ctx.textAlign='center'; ctx.fillText(ico,p.x+10+off,p.y-12); }
  // bocadillo
  if(p.bub){ const a=Math.min(1,p.bub.t*2); ctx.globalAlpha=a; ctx.font='bold 11px "Segoe UI",Arial'; const w=ctx.measureText(p.bub.txt).width+12, bx=p.x-w/2+off, by=p.y-44;
    ctx.fillStyle='rgba(20,20,20,.82)'; roundRect(bx,by,w,19,7); ctx.fill(); ctx.beginPath(); ctx.moveTo(p.x-4,by+19); ctx.lineTo(p.x+4,by+19); ctx.lineTo(p.x,by+26); ctx.fill();
    ctx.fillStyle=p.bub.col; ctx.textAlign='center'; ctx.fillText(p.bub.txt,p.x+off,by+13.5); ctx.globalAlpha=1; }
}
