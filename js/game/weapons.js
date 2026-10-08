"use strict";
// ======================= ARMAS =======================
// Inventario: la pistola sigue usando P.gun / P.ammo (compatibilidad con misiones y partidas guardadas);
// el resto de armas está en P.inv = {id: munición}. P.wsel = arma elegida. Rueda del ratón: cambiar de arma.
//   kind: melee (cuerpo a cuerpo) · gun (balas) · throw (se lanza: explode | gas) · spray (cono químico)
const WEAPONS=[
  {id:'fists',    name:'Puños',                     kind:'melee', cool:0.45, dmg:22, range:30},
  {id:'pistol',   name:'Pistola Ruger',             kind:'gun',   cool:0.28, dmg:34, spread:0.04, price:1500, ammoPack:[30,300]},
  {id:'revolver', name:'Revólver .38',              kind:'gun',   cool:0.5,  dmg:65, spread:0.015, price:3000, ammoPack:[18,400]},
  {id:'shotgun',  name:'Escopeta',                  kind:'gun',   cool:0.85, dmg:20, spread:0.24, pellets:7, life:0.28, price:5000, ammoPack:[12,500]},
  {id:'smg',      name:'Subfusil',                  kind:'gun',   cool:0.075,dmg:15, spread:0.09, price:8000, ammoPack:[90,600]},
  {id:'m60',      name:'Ametralladora M60',         kind:'gun',   cool:0.06, dmg:30, spread:0.07, price:25000, ammoPack:[150,1500]},
  {id:'fulminate',name:'Fulminato de mercurio',     kind:'throw', fx:'explode', cool:0.9, dmg:140, radius:110, price:0, ammoPack:[3,1200]},
  {id:'phosphine',name:'Gas fosfina',               kind:'throw', fx:'gas', cool:1.2, dmg:22, radius:120, price:0, ammoPack:[2,2000]},
  {id:'acid',     name:'Ácido fluorhídrico',        kind:'spray', cool:0.05, dmg:5,  range:130, price:0, ammoPack:[100,1500]},
];
const WBY=Object.fromEntries(WEAPONS.map(w=>[w.id,w]));
// las armas químicas se "fabrican" con química: se desbloquean al avanzar en la historia
const CHEM_UNLOCK={fulminate:'1x06', phosphine:'1x02', acid:'1x03'};

function wInv(){ const P=G.player; return P.inv||(P.inv={}); }
function hasWeapon(id){ const P=G.player; return id==='fists'||(id==='pistol'?!!P.gun:wInv()[id]!==undefined); }
function ammoOf(id){ const P=G.player; if(id==='fists') return Infinity; return id==='pistol'?P.ammo:(wInv()[id]||0); }
function addAmmo(id,n){ const P=G.player; if(id==='pistol'){ P.gun=true; P.ammo=(P.ammo||0)+n; } else wInv()[id]=(wInv()[id]||0)+n; }
function giveWeapon(id,ammo){ addAmmo(id,ammo||0); G.player.wsel=id; G.wShow=2.5; }
function useAmmo(id){ if(DEV.ammo||id==='fists') return; const P=G.player; if(id==='pistol') P.ammo--; else wInv()[id]--; }
function curWeapon(){ const P=G.player; let id=P.wsel; if(!id||!hasWeapon(id)) id=P.gun?'pistol':'fists'; P.wsel=id; return WBY[id]; }
function ownedWeapons(){ return WEAPONS.filter(w=>hasWeapon(w.id)); }
function cycleWeapon(dir){
  const own=ownedWeapons(), i=own.indexOf(curWeapon()); const w=own[(i+dir+own.length)%own.length];
  G.player.wsel=w.id; G.wShow=2.2; sfx.blip();
}

// ---------- disparar / lanzar ----------
function weaponUse(dt){
  const P=G.player, W=curWeapon(); P.cool-=dt;
  if(mouse.wheel&&!G.dialog){ cycleWeapon(mouse.wheel>0?1:-1); mouse.wheel=0; }
  for(let k=1;k<=9&&!G.dialog;k++) if(pressed[String(k)]){ const own=ownedWeapons(); if(own[k-1]){ P.wsel=own[k-1].id; G.wShow=2; } }
  const auto=W.id==='smg'||W.id==='m60'||W.kind==='spray';
  const trig=auto?mouse.down:(mouse.down&&(W.cool<0.35||mouse.clicked));
  if(!trig||P.cool>0) return;
  if(ammoOf(W.id)<=0){ if(mouse.clicked) toast('Sin munición: '+W.name+'. Cómprala en la Casa de Empeños.',2); return; }
  P.cool=W.cool; useAmmo(W.id);
  const loud=W.kind==='gun'||W.fx==='explode';
  if(W.kind==='melee') punch(P,W);
  else if(W.kind==='gun'){ for(let i=0;i<(W.pellets||1);i++) fire(P.x,P.y,P.a,'player',W.spread,W.dmg,W.life); if(W.id==='shotgun'||W.id==='m60') shakeCam(W.id==='m60'?2:5); }
  else if(W.kind==='throw') throwItem(P,W);
  else if(W.kind==='spray') acidSpray(P,W);
  if(loud||W.kind==='throw'){ pedsHearShot(P.x,P.y,450);
    if(G.wanted<1 && G.thugs.length===0 && copNear(700)) setWanted(W.kind==='throw'?2:1); }
}
function punch(P,W){
  const fx=P.x+Math.cos(P.a)*20, fy=P.y+Math.sin(P.a)*20; sfx.crash&&beep(140,0.06,'square',0.03);
  const hit=(o)=>dist(o.x,o.y,fx,fy)<W.range;
  for(const p of G.peds) if(!p.dead&&hit(p)){ p.flee=8; p.hits=(p.hits||0)+1; if(p.hits>=3) killPed(p); if(copNear(500)) setWanted(Math.max(G.wanted,1)); return; }
  for(const t of G.thugs) if(t.hp>0&&hit(t)){ t.hp-=W.dmg; return; }
  for(const o of G.officers) if(o.hp>0&&hit(o)){ o.hp-=W.dmg; setWanted(Math.max(G.wanted,2)); return; }
}
function throwItem(P,W){
  const wx=mouse.x/cam.z+cam.x, wy=mouse.y/cam.z+cam.y, d=Math.min(380,dist(P.x,P.y,wx,wy)), a=P.a;
  G.throws=G.throws||[]; G.throws.push({x:P.x,y:P.y,tx:P.x+Math.cos(a)*d,ty:P.y+Math.sin(a)*d,sx:P.x,sy:P.y,t:0,dur:0.25+d/700,w:W.id});
}
function acidSpray(P,W){
  G.parts.push({x:P.x+Math.cos(P.a)*16,y:P.y+Math.sin(P.a)*16,vx:Math.cos(P.a+rand(-0.25,0.25))*rand(260,340),vy:Math.sin(P.a+rand(-0.25,0.25))*rand(260,340),life:0.45,c:'rgba(170,255,90,.75)',s:rand(3,6)});
  const inCone=o=>{ const d=dist(o.x,o.y,P.x,P.y); return d<W.range&&Math.abs(angDiff(P.a,Math.atan2(o.y-P.y,o.x-P.x)))<0.32; };
  for(const p of G.peds) if(!p.dead&&inCone(p)){ p.flee=6; p.acid=(p.acid||0)+W.dmg; if(p.acid>40) killPed(p); }
  for(const t of G.thugs) if(t.hp>0&&inCone(t)) t.hp-=W.dmg;
  for(const o of G.officers) if(o.hp>0&&inCone(o)){ o.hp-=W.dmg; setWanted(Math.max(G.wanted,2)); }
  for(const c of G.cars) if(!c.dead&&c!==P.inCar&&inCone(c)) c.hp-=W.dmg*0.6;
}
// daño en área (explosiones y gas) a todo lo que haya en el radio
function areaDamage(x,y,r,dmg,cause){
  const P=G.player;
  for(const p of G.peds) if(!p.dead&&dist(p.x,p.y,x,y)<r){ if(cause==='gas'){ p.gas=(p.gas||0)+dmg; p.flee=5; if(p.gas>45) killPed(p); } else killPed(p); }
  for(const t of G.thugs) if(t.hp>0&&dist(t.x,t.y,x,y)<r) t.hp-=dmg;
  for(const o of G.officers) if(o.hp>0&&dist(o.x,o.y,x,y)<r){ o.hp-=dmg; setWanted(Math.max(G.wanted,3)); }
  if(cause!=='gas') for(const c of G.cars) if(!c.dead&&dist(c.x,c.y,x,y)<r+20) c.hp-=dmg*1.2;
  if(dist(P.x,P.y,x,y)<r&&!P.inCar) hurtPlayer(cause==='gas'?dmg*0.6:dmg*0.5);
}
function updateWeapons(dt){
  // proyectiles lanzados (arco hasta el punto apuntado)
  for(const T of (G.throws||[])){ T.t+=dt; const k=Math.min(1,T.t/T.dur); T.x=T.sx+(T.tx-T.sx)*k; T.y=T.sy+(T.ty-T.sy)*k; T.h=Math.sin(k*Math.PI)*40;
    if(k>=1&&!T.done){ T.done=true; const W=WBY[T.w];
      if(W.fx==='explode'){ G.flash=Math.max(G.flash||0,0.5); shakeCam(16); sfx.boom(); areaDamage(T.x,T.y,W.radius,W.dmg,'explode');
        G.decals.push({x:T.x,y:T.y,r:46,c:'rgba(20,20,20,.55)'}); for(let i=0;i<40;i++) G.parts.push({x:T.x,y:T.y,vx:rand(-260,260),vy:rand(-260,260),life:rand(.4,1.1),c:Math.random()<.5?'#ffb030':'#555',s:rand(5,14)}); }
      else { G.clouds=G.clouds||[]; G.clouds.push({x:T.x,y:T.y,r:20,R:W.radius,t:0,life:8,dmg:W.dmg}); beep(90,0.6,'sawtooth',0.02); } } }
  if(G.throws) G.throws=G.throws.filter(T=>!T.done);
  // nubes de gas fosfina: crecen, dañan lo que hay dentro y se disipan
  for(const C of (G.clouds||[])){ C.t+=dt; C.r=Math.min(C.R,C.r+90*dt); if(Math.floor(C.t*2)!==Math.floor((C.t-dt)*2)) areaDamage(C.x,C.y,C.r,C.dmg*0.5,'gas'); }
  if(G.clouds) G.clouds=G.clouds.filter(C=>C.t<C.life);
  if(G.wShow>0) G.wShow-=dt;
}
function drawWeaponFx(t){
  for(const C of (G.clouds||[])){ const a=Math.min(1,(C.life-C.t)/2)*0.55;
    for(let i=0;i<6;i++){ const ox=Math.sin(t*0.8+i*1.7)*C.r*0.35, oy=Math.cos(t*0.6+i*2.1)*C.r*0.35;
      const g=ctx.createRadialGradient(C.x+ox,C.y+oy,4,C.x+ox,C.y+oy,C.r*0.8); g.addColorStop(0,`rgba(150,220,90,${a})`); g.addColorStop(1,'rgba(150,220,90,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(C.x+ox,C.y+oy,C.r*0.8,0,7); ctx.fill(); } }
  for(const T of (G.throws||[])){ ctx.fillStyle='rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(T.x,T.y,6,3,0,0,7); ctx.fill();
    ctx.fillStyle=T.w==='fulminate'?'#9fd8ff':'#c8e870'; ctx.beginPath(); ctx.arc(T.x,T.y-T.h,5,0,7); ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.stroke(); }
}
// HUD: arma actual y, al cambiar, la lista de armas
// icono dibujado de cada arma (estilo GTA): silueta blanca con contorno oscuro, en una caja de w×h
function drawWeaponIcon(id,x,y,w,h){
  ctx.save(); ctx.translate(x+w/2,y+h/2); const k=Math.min(w/120,h/60); ctx.scale(k,k);
  ctx.lineJoin='round'; ctx.lineCap='round';
  const P=(fn)=>{ ctx.beginPath(); fn(); ctx.closePath(); ctx.fillStyle='#f4f4f0'; ctx.strokeStyle='#111'; ctx.lineWidth=4; ctx.stroke(); ctx.fill(); };
  const D=(c,fn)=>{ ctx.fillStyle=c; ctx.beginPath(); fn(); ctx.fill(); };
  switch(id){
    case 'fists': P(()=>{ ctx.moveTo(-26,-14); ctx.quadraticCurveTo(-28,-24,-16,-24); ctx.lineTo(20,-24); ctx.quadraticCurveTo(30,-24,30,-12); ctx.lineTo(30,10); ctx.quadraticCurveTo(30,22,16,22); ctx.lineTo(-14,22); ctx.quadraticCurveTo(-26,22,-26,10); });
      ctx.strokeStyle='#999'; ctx.lineWidth=2; for(const x of [-12,2,16]){ ctx.beginPath(); ctx.moveTo(x,-24); ctx.lineTo(x,-6); ctx.stroke(); } break;
    case 'pistol': P(()=>{ ctx.moveTo(-40,-16); ctx.lineTo(40,-16); ctx.lineTo(40,-2); ctx.lineTo(-6,-2); ctx.lineTo(-12,4); ctx.lineTo(-14,24); ctx.lineTo(-32,24); ctx.lineTo(-26,-2); ctx.lineTo(-40,-2); });
      D('#999',()=>{ ctx.rect(-6,-2,12,8); }); break;
    case 'revolver': P(()=>{ ctx.moveTo(-14,-16); ctx.lineTo(46,-14); ctx.lineTo(46,-6); ctx.lineTo(10,-4); ctx.lineTo(4,6); ctx.lineTo(-10,6); ctx.lineTo(-16,26); ctx.lineTo(-34,24); ctx.lineTo(-26,-2); ctx.lineTo(-34,-14); });
      D('#888',()=>{ ctx.arc(-2,-6,9,0,7); }); break;
    case 'shotgun': P(()=>{ ctx.moveTo(-56,-4); ctx.lineTo(-30,-10); ctx.lineTo(56,-10); ctx.lineTo(56,-2); ctx.lineTo(0,-2); ctx.lineTo(-4,6); ctx.lineTo(-30,4); ctx.lineTo(-58,14); });
      D('#999',()=>{ ctx.rect(4,-2,28,6); }); break;
    case 'smg': P(()=>{ ctx.moveTo(-40,-14); ctx.lineTo(36,-14); ctx.lineTo(36,-8); ctx.lineTo(48,-8); ctx.lineTo(48,-2); ctx.lineTo(10,-2); ctx.lineTo(8,26); ctx.lineTo(-2,26); ctx.lineTo(-4,-2); ctx.lineTo(-18,-2); ctx.lineTo(-22,14); ctx.lineTo(-34,14); ctx.lineTo(-30,-2); ctx.lineTo(-40,-2); }); break;
    case 'm60': P(()=>{ ctx.moveTo(-58,-2); ctx.lineTo(-36,-12); ctx.lineTo(44,-12); ctx.lineTo(44,-8); ctx.lineTo(58,-8); ctx.lineTo(58,-3); ctx.lineTo(20,-3); ctx.lineTo(16,4); ctx.lineTo(-10,4); ctx.lineTo(-14,16); ctx.lineTo(-24,16); ctx.lineTo(-22,4); ctx.lineTo(-58,10); });
      ctx.strokeStyle='#c8a040'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(-2,4); ctx.quadraticCurveTo(4,22,24,26); ctx.stroke();
      ctx.strokeStyle='#333'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(30,-3); ctx.lineTo(24,18); ctx.moveTo(30,-3); ctx.lineTo(38,18); ctx.stroke(); break;
    case 'fulminate': // cristal azul
      for(const [x,y,r] of [[-14,6,14],[6,-4,18],[20,10,11]]){ ctx.save(); ctx.translate(x,y); P(()=>{ ctx.moveTo(0,-r); ctx.lineTo(r*0.8,0); ctx.lineTo(0,r); ctx.lineTo(-r*0.8,0); }); ctx.fillStyle='rgba(90,190,255,.55)'; ctx.beginPath(); ctx.moveTo(0,-r); ctx.lineTo(r*0.8,0); ctx.lineTo(0,0); ctx.fill(); ctx.restore(); } break;
    case 'phosphine': // matraz con gas verde
      P(()=>{ ctx.moveTo(-6,-26); ctx.lineTo(6,-26); ctx.lineTo(6,-8); ctx.lineTo(24,22); ctx.lineTo(-24,22); ctx.lineTo(-6,-8); });
      D('rgba(120,210,70,.9)',()=>{ ctx.moveTo(-15,8); ctx.lineTo(15,8); ctx.lineTo(22,20); ctx.lineTo(-22,20); });
      ctx.fillStyle='rgba(150,220,90,.5)'; for(const [x,y,r] of [[10,-28,6],[18,-36,8],[4,-40,5]]){ ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill(); } break;
    case 'acid': // bidón con símbolo de corrosivo
      P(()=>{ ctx.moveTo(-18,-20); ctx.lineTo(10,-20); ctx.lineTo(10,-26); ctx.lineTo(20,-26); ctx.lineTo(20,-16); ctx.lineTo(22,24); ctx.lineTo(-22,24); });
      D('#e8c040',()=>{ ctx.moveTo(0,-8); ctx.lineTo(12,12); ctx.lineTo(-12,12); });
      D('#111',()=>{ ctx.arc(0,6,2.5,0,7); }); break;
  }
  ctx.restore();
}
function drawWeaponHud(rx,yy){
  const W=curWeapon(), am=ammoOf(W.id), bw=150, bh=64, bx=rx-bw;
  // caja del arma actual: icono + munición
  ctx.fillStyle='rgba(0,0,0,.5)'; roundRect(bx,yy-14,bw,bh,8); ctx.fill();
  drawWeaponIcon(W.id,bx+8,yy-10,bw-16,bh-26);
  txt(W.id==='fists'?'':(DEV.ammo?'∞':String(am)),rx-8,yy+bh-20,16,am>0||W.id==='fists'?'#fff':'#f77','right','800 ');
  txt(W.name,bx+8,yy+bh-20,11,'#bbb','left');
  yy+=bh+4;
  // al cambiar de arma: rueda de iconos
  if(G.wShow>0){ const own=ownedWeapons(), n=own.length, s=56; ctx.globalAlpha=Math.min(1,G.wShow);
    own.forEach((w,i)=>{ const x=rx-n*(s+4)+i*(s+4), on=w===W; ctx.fillStyle=on?'rgba(46,107,63,.9)':'rgba(0,0,0,.6)'; roundRect(x,yy,s,40,6); ctx.fill();
      if(on){ ctx.strokeStyle='#ffd23a'; ctx.lineWidth=2; ctx.stroke(); }
      drawWeaponIcon(w.id,x+4,yy+4,s-8,26); txt(String(i+1),x+5,yy+38,9,'#ccc','left','700 '); });
    ctx.globalAlpha=1; yy+=48; }
  return yy;
}
