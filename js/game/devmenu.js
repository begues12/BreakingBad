"use strict";
// ======================= MENÚ DE PRUEBAS (F9) =======================
// Salta a cualquier misión y paso con un estado limpio y coherente con ese punto de la historia:
// partida nueva, autocaravana si ya la tenías, pistola desde 1x06, dinero suficiente, sin policía,
// sin diálogos ni interiores abiertos, y el jugador colocado donde ocurre el paso elegido.
const DEV={open:false, tab:0, sel:0, step:0, cine:false, scroll:0, csel:0,
  god:false, noCops:false, ammo:false, carGod:false, fps:false};
const devCar=(type)=>{ const P=G.player, a=P.a||0, x=P.x+Math.cos(a)*90, y=P.y+Math.sin(a)*90, c=spawnCar(type,x,y,a,{owned:true}); c.z=spawnZ(x,y); toast('Coche: '+type,2); };
const DEV_CHEATS=[
  {label:'Inmortal',              flag:'god'},
  {label:'La policía no te persigue (salvo si la misión lo exige)', flag:'noCops', on(){ G.wanted=missionWantsCops()?G.wanted:0; G.search=null; }},
  {label:'Munición infinita',     flag:'ammo', on(){ const P=G.player; if(!P.gun){ P.gun=true; P.ammo=60; } }},
  {label:'Coche indestructible',  flag:'carGod'},
  {label:'Mostrar FPS y tiempos', flag:'fps'},
  {label:'Curarse y chaleco',     run(){ const P=G.player; P.hp=100; P.armor=100; }},
  {label:'Reparar el coche actual', run(){ const c=G.player.inCar; if(c){ c.hp=c.maxhp; c.fire=0; c.burnt=false; } else toast('No vas en coche',2); }},
  {label:'+$100.000',             run(){ G.money+=100000; sfx.cash(); }},
  {label:'Pistola y 200 balas',   run(){ const P=G.player; P.gun=true; P.ammo+=200; }},
  {label:'Todas las armas (con munición)', run(){ for(const w of WEAPONS) if(w.id!=='fists') addAmmo(w.id,(w.ammoPack||[50])[0]*3); G.wShow=3; }},
  {label:'Producto: 10 lb al 99%', run(){ G.product+=10; G.purity=0.99; }},
  {label:'Quitar estrellas',      run(){ G.wanted=0; G.search=null; G.evadeT=0; }},
  {label:'+1 estrella',           run(){ const nc=DEV.noCops; DEV.noCops=false; setWanted(G.wanted+1); DEV.noCops=nc; }},
  {label:'Teletransporte al objetivo / destino', run(){ const P=G.player, T=G.waypoint||missionTarget(); if(!T){ toast('No hay objetivo ni destino marcado',2); return; }
      const nr=nearestRoad(T.x,T.y,r=>r.drive); const tx=P.inCar?nr.x:T.x+30, ty=P.inCar?nr.y:T.y+30; if(P.inCar){ P.inCar.x=tx; P.inCar.y=ty; P.inCar.z=spawnZ(tx,ty); P.inCar.vx=P.inCar.vy=P.inCar.v=0; P.inCar._px=undefined; }
      P.x=tx; P.y=ty; P.z=spawnZ(tx,ty); cam.x=P.x-VW/cam.z/2; cam.y=P.y-VH/cam.z/2; G.tileWarm=true; }},
  {label:'Aparecer sedán',        run(){ devCar('sedan'); }},
  {label:'Aparecer Pontiac Aztek', run(){ devCar('aztek'); }},
  {label:'Aparecer autocaravana (tuya)', run(){ devCar('rv'); G.rvId=G.cars[G.cars.length-1].id; }},
  {label:'Aparecer coche patrulla', run(){ devCar('cop'); }},
  {label:'Hora: +3 h',            run(){ G.clock=(G.clock+180)%(24*60); }},
  {label:'Completar el paso actual de la misión', run(){ if(G.dialog||G.cine||G.mg){ toast('Termina primero el diálogo/escena',2); return; } if(curStep()) finishStep(); }},
  {label:'Repetir misiones secundarias ya hechas', run(){ G.sideDone={}; }},
];

function devToggle(){ DEV.open=!DEV.open; if(DEV.open){ DEV.sel=Math.max(0,(G&&G.mi)||0); DEV.step=0; } }
// lugar donde empieza un paso (para colocar al jugador)
function devStepPlace(S){
  if(!S) return 'home';
  if(S.type==='ride') return S.from;
  if(S.at) return S.at;
  if(S.type==='cook') return 'desert';
  return null;
}
function devLaunch(mi,step){
  const M=MISSIONS[mi]; if(!M) return;
  DEV.open=false; paused=false;
  newGame(); started=true; mini=null;
  G.card=null; G.cine=null; G.dialog=null; G.mg=null; G.cook=null; G.inside=null; G.actors=[]; G.camFocus=null; G.keepCar=null;
  const P=G.player, at=k=>missionIdx(k);
  // estado que corresponde a ese punto de la serie
  G.money=Math.max(G.money,150000);
  if(mi>=at('1x06')||M.steps.slice(0,step).some(s=>s.type==='kill')){ P.gun=true; P.ammo=60; }
  const hasRV=mi>at('1x01')&&mi<at('3x06') || (mi===at('1x01')&&step>M.steps.findIndex(s=>s.at==='rvlot'));
  if(hasRV){ const L=LOC.home; const rv=spawnCar('rv',L.parkX-Math.cos(L.parkA)*150,L.parkY-Math.sin(L.parkA)*150,L.parkA,{owned:true,name:'Autocaravana'}); G.rvId=rv.id; }
  // colocar al jugador cerca de donde ocurre el paso (en la calle, nunca dentro de un edificio)
  const key=devStepPlace(M.steps[step]), L=key?locOf(key):LOC.home;
  P.x=(L.x||LOC.home.x); P.y=(L.y||LOC.home.y)+30; P.z=spawnZ(P.x,P.y); P.inCar=null;
  const own=G.cars.find(c=>c.owned&&c.type!=='rv'); if(own){ own.x=P.x+70; own.y=P.y; own.z=spawnZ(own.x,own.y); own.vx=own.vy=own.v=0; }
  if(hasRV&&key==='desert'){ const rv=G.cars.find(c=>c.id===G.rvId); rv.x=P.x-80; rv.y=P.y; rv.z=spawnZ(rv.x,rv.y); }
  cam.x=P.x-VW/cam.z/2; cam.y=P.y-VH/cam.z/2; G.tileWarm=true;
  // arrancar la misión en el paso elegido
  if(step===0&&DEV.cine){ startMission(mi); return; }
  G.mi=mi; G.step=step-1; G.ms={};
  if(step===0&&M.start) M.start();
  nextStep();
  toast('PRUEBA: '+M.code+' · paso '+(step+1)+'/'+M.steps.length,4);
}
function devUpdate(){
  if(pressed['tab']||pressed['q']||pressed['e']){ DEV.tab=1-DEV.tab; return; }
  if(DEV.tab===1){ const n=DEV_CHEATS.length;
    if(pressed['arrowup']||pressed['w']) DEV.csel=(DEV.csel+n-1)%n;
    if(pressed['arrowdown']||pressed['s']) DEV.csel=(DEV.csel+1)%n;
    if(pressed['enter']||pressed[' ']){ const C=DEV_CHEATS[DEV.csel];
      if(C.flag){ DEV[C.flag]=!DEV[C.flag]; if(DEV[C.flag]&&C.on) C.on(); toast(C.label+': '+(DEV[C.flag]?'SÍ':'NO'),2); } else { C.run(); toast(C.label,2); } sfx.blip(); }
    if(pressed['escape']||pressed['f9']) DEV.open=false;
    return; }
  const n=MISSIONS.length, M=MISSIONS[DEV.sel];
  if(pressed['arrowup']||pressed['w']){ DEV.sel=(DEV.sel+n-1)%n; DEV.step=0; }
  if(pressed['arrowdown']||pressed['s']){ DEV.sel=(DEV.sel+1)%n; DEV.step=0; }
  if(pressed['pageup']){ DEV.sel=Math.max(0,DEV.sel-10); DEV.step=0; }
  if(pressed['pagedown']){ DEV.sel=Math.min(n-1,DEV.sel+10); DEV.step=0; }
  if(pressed['arrowleft']||pressed['a']) DEV.step=Math.max(0,DEV.step-1);
  if(pressed['arrowright']||pressed['d']) DEV.step=Math.min(M.steps.length-1,DEV.step+1);
  if(pressed['c']) DEV.cine=!DEV.cine;
  if(pressed['enter']||pressed[' ']) devLaunch(DEV.sel,DEV.step);
  else if(pressed['escape']||pressed['f9']) DEV.open=false;
}
function drawDevMenu(){
  ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle='rgba(6,10,8,.94)'; ctx.fillRect(0,0,VW,VH);
  const x0=Math.max(30,VW/2-440), w=Math.min(880,VW-60);
  txt('MENÚ DE DESARROLLO',x0,52,26,'#ffd23a','left','900 ');
  ['MISIONES','TRUCOS'].forEach((t,i)=>{ const tx=x0+w-230+i*120; ctx.fillStyle=DEV.tab===i?'#2e6b3f':'#1a2a20'; ctx.fillRect(tx,30,112,30); txt(t,tx+56,51,14,DEV.tab===i?'#fff':'#8a9a8a','center','800 '); });
  txt('TAB cambiar de pestaña',x0+w-120,76,11,'#6a7a6a','center');
  if(DEV.tab===1){ txt('↑↓ elegir · ENTER activar · ESC/F9 cerrar',x0,78,13,'#9ab09a','left');
    DEV_CHEATS.forEach((C,i)=>{ const y=118+i*27, on=i===DEV.csel; if(on){ ctx.fillStyle='#24402c'; ctx.fillRect(x0-8,y-19,w,25); }
      txt(C.label,x0+40,y,15,on?'#fff':'#ccc','left');
      if(C.flag){ ctx.fillStyle=DEV[C.flag]?'#3fa04f':'#3a3a3a'; ctx.fillRect(x0,y-14,28,16); txt(DEV[C.flag]?'SÍ':'NO',x0+14,y-1,10,'#fff','center','800 '); }
      else txt('▶',x0+14,y,13,'#ffd23a','center'); });
    return; }
  txt('↑↓ misión · ←→ paso · RePág/AvPág saltar 10 · C cinemáticas · ENTER empezar · ESC/F9 cerrar',x0,78,13,'#9ab09a','left');
  const rowH=24, rows=Math.floor((VH-210)/rowH);
  if(DEV.sel<DEV.scroll) DEV.scroll=DEV.sel; if(DEV.sel>=DEV.scroll+rows) DEV.scroll=DEV.sel-rows+1;
  for(let i=DEV.scroll;i<Math.min(MISSIONS.length,DEV.scroll+rows);i++){
    const M=MISSIONS[i], y=110+(i-DEV.scroll)*rowH, on=i===DEV.sel;
    if(on){ ctx.fillStyle='#24402c'; ctx.fillRect(x0-8,y-17,w,rowH-2); }
    txt(M.code,x0,y,15,on?'#fff':'#8fcf8f','left','800 ');
    txt(M.title,x0+60,y,15,on?'#fff':'#c8c8c8','left');
    txt(M.steps.length+' pasos',x0+w-20,y,12,'#7a8a7a','right');
  }
  // detalle de la misión seleccionada: lista de pasos
  const M=MISSIONS[DEV.sel], S=M.steps[DEV.step], by=VH-92;
  ctx.fillStyle='#14201a'; ctx.fillRect(x0-8,by-24,w,84); ctx.strokeStyle='#3e6b4a'; ctx.strokeRect(x0-8,by-24,w,84);
  txt('Paso '+(DEV.step+1)+'/'+M.steps.length+' · '+S.type+(S.at?' @ '+((locOf(S.at)||{}).name||S.at):'')+(S.from?' · '+S.from+' → '+S.to:''),x0,by,15,'#ffd23a','left','700 ');
  txt(S.obj||S.title||'',x0,by+24,14,'#ddd','left');
  txt('Cinemáticas: '+(DEV.cine?'SÍ (solo al empezar en el paso 1)':'NO'),x0,by+46,13,DEV.cine?'#7f7':'#aaa','left');
}
