"use strict";
// ======================= CINEMÁTICAS =======================
// Pequeñas escenas animadas que ponen en situación cada capítulo. Se declaran como datos en
// js/cutscenes/t*.js con addCutscenes('1x03',[escena,...]). Una escena es {title, shots:[plano,...]}.
//
// Plano (todas las posiciones en 0..1 del ancho de pantalla; el suelo está en y≈0.8):
//   bg     fondo: desert, lab, bath, basement, home, school, party, junkyard, warehouse, hacienda,
//          office, market, street, hospital, interrog, rv, sky, pool, snow, bar, crawl, diner,
//          train, nursing, carpark, garage, black
//   light  cold | warm | hard | fluor | dim | tv | night | clean  (gradación de color)
//   cam    wide | medium | close | detail | low | high   ·  focus: personaje (close) o atrezo (detail)
//   move   static | push | pull | shake | pan | drift | fast (montaje rápido)
//   chars  [{id, x, pose, act, face, s}]  pose: stand sit kneel lie walk laugh raise shoot cower
//                                          act: walkin walkout fall shake  · face: 1 derecha, -1 izquierda
//   props  [{t, x, y, s}]   (ver drawProp)
//   cap    texto de situación (abajo)   ·  say [id,'frase'] subtítulo con nombre
//   fx     flash | explosion | slowmo | underwater | fadein | fadeout | tvglow | bars
//   dur    segundos (por defecto 3.2)

const CUTSCENES = {};
function addCutscenes(code,scenes){ CUTSCENES[code]=scenes; }

// ---------- reproducción ----------
function playCutscene(scenes,onEnd){
  if(!scenes||!scenes.length){ if(onEnd) onEnd(); return; }
  G.cine={scenes,si:0,shi:0,t:0,onEnd};
}
function cineShot(){ const C=G.cine; return C&&C.scenes[C.si]&&C.scenes[C.si].shots[C.shi]; }
function cineNext(){
  const C=G.cine; C.shi++; C.t=0;
  if(C.shi>=C.scenes[C.si].shots.length){ C.si++; C.shi=0; }
  if(C.si>=C.scenes.length){ const f=C.onEnd; G.cine=null; if(f) f(); }
}
function updateCine(dt){
  const C=G.cine, S=cineShot(); if(!S){ cineNext(); return; }
  C.t+=dt*(S.fx==='slowmo'?0.6:1);
  if(pressed['escape']){ C.si=C.scenes.length; cineNext(); return; }
  if((pressed['enter']||pressed[' ']||pressed['e']||mouse.clicked)&&C.t>0.35){ cineNext(); return; }
  if(C.t>=(S.dur||3.2)&&!C.hold) cineNext();
}

// ---------- dibujo ----------
const CINE_GRADE={
  cold:['rgba(120,170,220,.16)','rgba(10,20,40,.25)'], warm:['rgba(255,170,80,.16)','rgba(40,20,0,.2)'],
  hard:['rgba(255,220,140,.12)','rgba(60,30,0,.35)'], fluor:['rgba(180,230,190,.14)','rgba(20,30,20,.2)'],
  dim:['rgba(40,30,20,.45)','rgba(0,0,0,.55)'], tv:['rgba(80,120,200,.25)','rgba(0,0,10,.6)'],
  night:['rgba(20,30,70,.45)','rgba(0,0,10,.5)'], clean:['rgba(255,255,255,.06)','rgba(0,0,0,.12)'] };
function drawCine(t){
  const C=G.cine, S=cineShot(); if(!S) return;
  const W=VW, H=VH, dur=S.dur||3.2, k=clamp(C.t/dur,0,1), bar=Math.round(H*0.11);
  ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
  // cámara
  let z=1, ox=0, oy=0;
  if(S.cam==='medium') z=1.35; if(S.cam==='low'){ z=1.15; oy=H*0.08; } if(S.cam==='high'){ z=0.95; oy=-H*0.05; }
  if(S.move==='push') z*=1+0.14*k; if(S.move==='pull') z*=1.14-0.14*k;
  if(S.move==='pan') ox=(0.5-k)*W*0.12; if(S.move==='drift') ox=Math.sin(t*0.6)*W*0.01;
  if(S.move==='shake'||S.move==='fast'){ ox+=Math.sin(t*23)*4+Math.sin(t*37)*3; oy+=Math.cos(t*29)*4; }
  ctx.save(); ctx.translate(W/2+ox,H/2+oy); ctx.scale(z,z); ctx.translate(-W/2,-H/2);
  if(S.cam==='close'&&S.focus) drawCloseUp(S,W,H,t,k);
  else if(S.cam==='detail'&&S.focus) drawDetail(S,W,H,t,k);
  else { cineBackdrop(S.bg||'black',W,H,t,S.cam);
    const items=[...(S.props||[]).map(p=>({p,y:p.z!==undefined?p.z:(p.y===undefined?0.8:p.y)})),...(S.chars||[]).map(c=>({c,y:c.y||0.8}))].sort((a,b)=>a.y-b.y);
    for(const it of items){ if(it.p){ const p=it.p; drawProp(p.t,p.x*W,(p.y===undefined?0.8:p.y)*H,(p.s||1)*H/700,t); } else drawFigure(it.c,W,H,t,k,S.cam); } }
  ctx.restore();
  // efectos
  if(S.fx==='flash'&&k<0.25){ ctx.fillStyle=`rgba(255,255,255,${1-k*4})`; ctx.fillRect(0,0,W,H); }
  if(S.fx==='explosion'){ const e=clamp(1-Math.abs(k-0.35)*3,0,1); ctx.fillStyle=`rgba(255,${180+60*e|0},120,${e*0.85})`; ctx.fillRect(0,0,W,H);
    for(let i=0;i<30;i++){ const a=i*2.4, r=k*W*0.7*(0.4+((i*37)%10)/10); ctx.fillStyle=`rgba(${120+i*4},${90+i*2},60,${(1-k)*0.6})`; ctx.beginPath(); ctx.arc(W/2+Math.cos(a)*r,H*0.55+Math.sin(a)*r*0.5,18+i%7*6,0,7); ctx.fill(); } }
  if(S.fx==='underwater'){ ctx.fillStyle='rgba(30,110,150,.45)'; ctx.fillRect(0,0,W,H); ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=2;
    for(let i=0;i<12;i++){ const bx=(i*137+t*20)%W, by=H-((t*60+i*90)%H); ctx.beginPath(); ctx.arc(bx,by,3+i%4,0,7); ctx.stroke(); } }
  if(S.fx==='tvglow'){ ctx.fillStyle=`rgba(120,160,255,${0.12+0.08*Math.sin(t*9)+0.05*Math.sin(t*23)})`; ctx.fillRect(0,0,W,H); }
  const g=CINE_GRADE[S.light]; if(g){ ctx.fillStyle=g[0]; ctx.fillRect(0,0,W,H);
    const v=ctx.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,W*0.7); v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,g[1]); ctx.fillStyle=v; ctx.fillRect(0,0,W,H); }
  // el filtro amarillo de la serie solo en luz cálida/dura (México, desierto, casa); laboratorio, nieve y noche quedan fríos
  if(!S.light||S.light==='hard'||S.light==='warm') colorGrade(0);
  // fundidos (inicio y fin de escena)
  const first=C.shi===0, last=C.shi===C.scenes[C.si].shots.length-1;
  let fade=0; if(first) fade=Math.max(fade,1-C.t/0.6); if(last&&!S.noFade) fade=Math.max(fade,(C.t-(dur-0.5))/0.5); if(S.fx==='fadeout') fade=Math.max(fade,k);
  if(fade>0){ ctx.fillStyle=`rgba(0,0,0,${clamp(fade,0,1)})`; ctx.fillRect(0,0,W,H); }
  // bandas de cine y textos
  ctx.fillStyle='#000'; ctx.fillRect(0,0,W,bar); ctx.fillRect(0,H-bar,W,bar);
  const sc=C.scenes[C.si];
  txt(sc.title||'',24,bar*0.62,15,'rgba(255,210,58,.9)','left','700 ');
  txt('ENTER: siguiente plano · ESC: saltar',W-24,bar*0.62,12,'rgba(255,255,255,.45)','right');
  if(S.cap){ const n=Math.floor(clamp(C.t*45,0,S.cap.length)); txt(S.cap.slice(0,n),W/2,H-bar*0.42,18,'#eee','center'); }
  if(S.say){ const ch=CHAR[S.say[0]]||{n:''}, n=Math.floor(clamp(C.t*40,0,S.say[1].length)); ctx.font='bold 22px "Segoe UI",Arial';
    const line=(ch.n?ch.n+': ':'')+S.say[1].slice(0,n), w=ctx.measureText(line).width+30;
    ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(W/2-w/2,H-bar-62,w,40); txt(line,W/2,H-bar-35,22,'#ffd23a','center','700 '); }
}

// primer plano: retrato grande sin marco sobre el fondo desenfocado de la escena
function drawCloseUp(S,W,H,t,k){
  cineBackdrop(S.bg||'black',W,H,t,'close');
  ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillRect(0,0,W,H);           // fondo "desenfocado" y más oscuro
  const r=H*(S.tight?0.5:0.36), x=W*(S.fx2||0.5+(S.side||0)*0.18), y=H*0.52+(S.cam==='low'?H*0.06:0);
  PORTRAIT_HAT=HAT_BG.has(S.bg); PORTRAIT_BARE=true; drawPortrait(S.focus,x,y,r,!!S.say&&S.say[0]===S.focus&&Math.sin(t*14)>0,t); PORTRAIT_BARE=false;
  PORTRAIT_HAT=null;
  if(S.act==='laugh'){ ctx.save(); ctx.globalAlpha=0.15; ctx.translate(Math.sin(t*30)*4,0); PORTRAIT_BARE=true; drawPortrait(S.focus,x,y,r,true,t); PORTRAIT_BARE=false; ctx.restore(); }
}
// plano detalle: el objeto enorme en el centro
function drawDetail(S,W,H,t,k){
  cineBackdrop(S.bg||'black',W,H,t,'close'); ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(0,0,W,H);
  const g=ctx.createRadialGradient(W/2,H/2,10,W/2,H/2,H*0.6); g.addColorStop(0,'rgba(255,240,200,.18)'); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  drawProp(S.focus,W/2,H*0.66,H/170*(S.s||1),t);
}

// ---------- figuras de cuerpo entero ----------
// La cabeza y los hombros son el mismo retrato detallado de los diálogos (drawPortrait), así cada
// personaje es reconocible en los planos generales; debajo se dibuja el cuerpo con su ropa.
// Unidades del retrato: cabeza en y≈-4 (de -34 a 30), hombros hasta y=60; el cuerpo llega a los pies en y=200.
function drawFigure(c,W,H,t,k,cam){
  const L=(c.id==='W'?walterLook():LOOK[c.id])||LOOK.X;
  const sc=(c.s||1)*(cam==='low'?1.2:cam==='high'?0.85:1)*(c.y!==undefined?(0.55+0.55*c.y):1);
  const u=H*0.0016*sc;                       // tamaño de una unidad del retrato en píxeles
  let x=c.x*W, y=(c.y||0.8)*H, face=c.face||1, pose=c.pose||'stand';
  const from=W*(c.from!==undefined?c.from:(face>0?-0.15:1.15));
  if(c.act==='walkin'){ x=from+(c.x*W-from)*clamp(k*1.6,0,1); if(k<0.62) pose='walk'; }
  if(c.act==='walkout'){ x=c.x*W+(face*W*0.6)*clamp(k*1.3-0.2,0,1); pose='walk'; }
  if(c.act==='fall'&&k>0.45) pose='lie';
  if(c.act==='shake') x+=Math.sin(t*40)*3;
  const under=c.outfit==='underwear';          // camiseta de tirantes y calzoncillos (apertura de 1x01)
  const cloth=under?'#f2efe6':c.body||L.cloth||'#444', pants=under?L.skin:c.pants||(L.female?shade(cloth,-30):'#2e2d33'), skin=L.skin, shoe=under?'#3a2e24':'#1e1a18';
  const over=under?{outfit:'tank',cloth:'#f2efe6',shirt:null,tie:null}:c.body?{outfit:'tee',cloth:c.body,shirt:null,tie:null}:null;
  const walk=pose==='walk'?Math.sin(t*8):0, sit=pose==='sit', kneel=pose==='kneel';
  ctx.save(); ctx.translate(x,y); ctx.scale(u,u);
  if(pose==='lie'){ ctx.rotate(-Math.PI/2*face); ctx.translate(0,-30); }
  // sombra en el suelo
  ctx.fillStyle='rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(0,2,62,12,0,0,7); ctx.fill();
  const lift=sit?62:kneel?52:0;             // sentado/arrodillado: el cuerpo baja
  // silla
  if(sit&&!c.noChair){ ctx.fillStyle='#5a3a22'; ctx.fillRect(-46,-150,92,10); ctx.fillRect(-46,-150,8,150); ctx.fillRect(38,-150,8,150);
    ctx.fillStyle='#6e4a2c'; ctx.fillRect(-52,-84,104,12); ctx.fillStyle='#4a2e1a'; ctx.fillRect(-48,-72,8,72); ctx.fillRect(40,-72,8,72); }
  // piernas
  ctx.lineCap='round'; ctx.strokeStyle=pants; ctx.lineWidth=24;
  const hipY=-110+lift;
  if(sit){ for(const sx of [-14,14]){ ctx.beginPath(); ctx.moveTo(sx,hipY); ctx.lineTo(sx*1.1,hipY+14); ctx.lineTo(sx*1.15,-10); ctx.stroke(); } }
  else if(kneel){ for(const sx of [-14,14]){ ctx.beginPath(); ctx.moveTo(sx,hipY); ctx.lineTo(sx*1.2,-12); ctx.stroke(); } }
  else { for(const [sx,ph] of [[-14,1],[14,-1]]){ const sw=walk*ph*16; ctx.beginPath(); ctx.moveTo(sx,hipY); ctx.lineTo(sx+sw*0.5,-58); ctx.lineTo(sx+sw,-10); ctx.stroke(); } }
  ctx.fillStyle=shoe; for(const [sx,ph] of [[-14,1],[14,-1]]){ const sw=sit||kneel?0:walk*ph*16; ctx.beginPath(); ctx.ellipse(sx*(sit?1.15:1)+sw+face*5,-5,17,8,0,0,7); ctx.fill(); }
  // torso (de los hombros a la cadera)
  const ty=-196+lift;
  const tg=ctx.createLinearGradient(-48,0,48,0); tg.addColorStop(0,shade(cloth,-30)); tg.addColorStop(0.45,cloth); tg.addColorStop(1,shade(cloth,-45));
  ctx.fillStyle=tg; ctx.beginPath(); ctx.moveTo(-50,ty+20); ctx.lineTo(50,ty+20); ctx.lineTo(42,hipY+6); ctx.lineTo(-42,hipY+6); ctx.closePath(); ctx.fill();
  if(L.shirt&&!L.female&&!over){ ctx.fillStyle=L.shirt; ctx.beginPath(); ctx.moveTo(-13,ty+20); ctx.lineTo(13,ty+20); ctx.lineTo(9,hipY+4); ctx.lineTo(-9,hipY+4); ctx.closePath(); ctx.fill(); }
  if(L.tie&&!over){ ctx.fillStyle=L.tie; ctx.beginPath(); ctx.moveTo(-4,ty+22); ctx.lineTo(4,ty+22); ctx.lineTo(6,ty+70); ctx.lineTo(0,ty+78); ctx.lineTo(-6,ty+70); ctx.closePath(); ctx.fill(); }
  if(under){ ctx.fillStyle='#ece8de'; ctx.beginPath(); ctx.moveTo(-34,hipY-6); ctx.lineTo(34,hipY-6); ctx.lineTo(30,hipY+12); ctx.lineTo(6,hipY+26); ctx.lineTo(-6,hipY+26); ctx.lineTo(-30,hipY+12); ctx.closePath(); ctx.fill(); ctx.fillStyle='#d8d2c4'; ctx.fillRect(-34,hipY-6,68,5); }
  else { ctx.fillStyle='#2a2420'; ctx.fillRect(-42,hipY-6,84,8); }   // cinturón
  // brazos (hombro → codo → mano)
  const arm=(sx,ex,ey,hx,hy)=>{ ctx.strokeStyle=under?skin:shade(cloth,-12); ctx.lineWidth=20; ctx.beginPath(); ctx.moveTo(sx,ty+30); ctx.lineTo(ex,ey); ctx.lineTo(hx,hy); ctx.stroke();
    ctx.fillStyle=skin; ctx.beginPath(); ctx.arc(hx,hy,9,0,7); ctx.fill(); };
  const aw=walk*12;
  // brazo trasero
  arm(-46*face,-56*face,ty+80+aw,-52*face+aw,ty+130);
  if(pose==='shoot'){ arm(46*face,80*face,ty+48,118*face,ty+44); ctx.fillStyle='#151515'; ctx.fillRect(face>0?112:-150,ty+30,38,12); ctx.fillRect(face>0?114:-126,ty+36,12,20); }
  else if(pose==='raise'){ arm(46*face,64*face,ty-10,58*face,ty-62); }
  else if(pose==='cower'){ arm(46*face,52*face,ty+50,18*face,ty+6); }
  else if(sit){ arm(46*face,54*face,ty+76,30*face,hipY+6); }
  else arm(46*face,56*face,ty+80-aw,52*face-aw,ty+130);
  ctx.restore();
  // cabeza y hombros: el retrato detallado
  const hx=x+(pose==='lie'?-face*H*0.0016*sc*150:0), hy=y+(pose==='lie'?-30*u:(-196+lift-2)*u)+(pose==='laugh'?Math.sin(t*16)*2:0);
  PORTRAIT_OVERRIDE=over; PORTRAIT_BARE=true; PORTRAIT_HAT=c.id==='W'?(c.hat===false?false:heisLook()&&HAT_BG.has(G.cine&&cineShot()?cineShot().bg:'desert')):null;
  if(pose==='lie'){ ctx.save(); ctx.translate(hx,y-24*u); ctx.rotate(-Math.PI/2*face); drawPortrait(c.id,0,0,50*u,false,t); ctx.restore(); }
  else drawPortrait(c.id,hx,hy+ (pose==='cower'?10*u:0),50*u,false,t);
  PORTRAIT_BARE=false; PORTRAIT_HAT=null; PORTRAIT_OVERRIDE=null;
}

// ---------- fondos ----------
function cineBackdrop(bg,W,H,t,cam){
  const G0=H*0.8, sky=(a,b)=>{ const g=ctx.createLinearGradient(0,0,0,G0); g.addColorStop(0,a); g.addColorStop(1,b); ctx.fillStyle=g; ctx.fillRect(-W,-H,W*3,G0+H); };
  const floor=(c,line)=>{ ctx.fillStyle=c; ctx.fillRect(-W,G0,W*3,H); if(line){ ctx.strokeStyle=line; ctx.lineWidth=1; for(let x=-W;x<W*2;x+=60){ ctx.beginPath(); ctx.moveTo(x,G0); ctx.lineTo(x+(x-W/2)*0.6,H*1.2); ctx.stroke(); } } };
  const wall=(c,tile)=>{ ctx.fillStyle=c; ctx.fillRect(-W,-H,W*3,G0+H); if(tile){ ctx.strokeStyle=tile; ctx.lineWidth=1; for(let x=-W;x<W*2;x+=40){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,G0); ctx.stroke(); } for(let y=0;y<G0;y+=40){ ctx.beginPath(); ctx.moveTo(-W,y); ctx.lineTo(W*2,y); ctx.stroke(); } } };
  const win=(x,y,w,h,c)=>{ ctx.fillStyle=c||'#bfe0f0'; ctx.fillRect(x,y,w,h); ctx.strokeStyle='#3a3028'; ctx.lineWidth=6; ctx.strokeRect(x,y,w,h); ctx.beginPath(); ctx.moveTo(x+w/2,y); ctx.lineTo(x+w/2,y+h); ctx.stroke(); };
  const mesas=(c,y0)=>{ ctx.fillStyle=c; for(let i=-2;i<8;i++){ const x=i*W*0.22, w=W*(0.12+((i*7+20)%5)/30), h=H*(0.06+((i*3+20)%4)/40); ctx.fillRect(x,y0-h,w,h); ctx.beginPath(); ctx.moveTo(x-20,y0); ctx.lineTo(x,y0-h); ctx.lineTo(x,y0); ctx.fill(); ctx.beginPath(); ctx.moveTo(x+w,y0-h); ctx.lineTo(x+w+20,y0); ctx.lineTo(x+w,y0); ctx.fill(); } };
  switch(bg){
    case 'desert': case 'train': case 'tohajiilee':
      sky('#4f8fd0','#f0d8a8'); mesas('#b8714a',G0-H*0.02); ctx.fillStyle='#d9b27a'; ctx.fillRect(-W,G0-H*0.02,W*3,H);
      floor('#d4a96c'); ctx.fillStyle='rgba(120,90,50,.35)'; for(let i=0;i<40;i++) ctx.fillRect((i*197)%W,G0+((i*53)%(H*0.18)),6,3);
      if(bg==='train'){ ctx.fillStyle='#5a4532'; ctx.fillRect(-W,G0-8,W*3,6); for(let i=0;i<6;i++){ const x=((i*260-t*120)%(W*1.6))-W*0.2; ctx.fillStyle=i===0?'#c8402a':'#6a6e72'; ctx.fillRect(x,G0-110,240,100); ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(x+40,G0-8,14,0,7); ctx.arc(x+200,G0-8,14,0,7); ctx.fill(); } }
      break;
    case 'sky': sky('#3a78c0','#a8d0f0'); ctx.fillStyle='rgba(255,255,255,.7)'; for(let i=0;i<6;i++){ ctx.beginPath(); ctx.ellipse((i*300+t*15)%(W+300)-150,80+i*40,120,26,0,0,7); ctx.fill(); }
      ctx.fillStyle='#6a5a4a'; for(let i=0;i<40;i++){ const h=30+((i*37)%5)*20; ctx.fillRect(i*(W/40),G0+40-h,W/40-4,h); } break;
    case 'snow': sky('#8aa0b8','#e8eef4'); ctx.fillStyle='#4a5a50'; for(let i=0;i<14;i++){ const x=i*W/13; ctx.beginPath(); ctx.moveTo(x,G0); ctx.lineTo(x+30,G0-180-(i%3)*40); ctx.lineTo(x+60,G0); ctx.fill(); }
      floor('#f2f4f6'); ctx.fillStyle='rgba(255,255,255,.8)'; for(let i=0;i<80;i++) ctx.fillRect((i*97+t*30)%W,(i*61+t*50)%H,3,3); break;
    case 'lab': wall('#e8ecee','rgba(0,0,0,.06)'); floor('#9aa0a6','rgba(0,0,0,.1)');
      for(let i=0;i<4;i++){ const x=W*0.12+i*W*0.25; ctx.fillStyle='#c8ced4'; ctx.fillRect(x,G0-H*0.42,90,H*0.42); ctx.fillStyle='#e8ecef'; ctx.fillRect(x+10,G0-H*0.4,20,H*0.38); ctx.strokeStyle='#7a8086'; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(x+45,G0-H*0.42); ctx.lineTo(x+45,G0-H*0.6); ctx.lineTo(x+W*0.25,G0-H*0.6); ctx.stroke(); }
      ctx.fillStyle='rgba(255,255,255,.5)'; for(let i=0;i<5;i++) ctx.fillRect(i*W/5+40,20,W/5-80,10); break;
    case 'bath': wall('#dfe8e6','rgba(60,90,90,.18)'); floor('#c8d0ce','rgba(0,0,0,.1)'); break;
    case 'basement': case 'crawl': wall('#6a6460','rgba(0,0,0,.12)'); floor('#5a5550'); ctx.strokeStyle='#3a3632'; ctx.lineWidth=12; ctx.beginPath(); ctx.moveTo(-W,H*0.18); ctx.lineTo(W*2,H*0.18); ctx.moveTo(W*0.7,H*0.18); ctx.lineTo(W*0.7,G0); ctx.stroke();
      if(bg==='crawl'){ ctx.fillStyle='#2a2420'; ctx.fillRect(-W,-H,W*3,H*0.55); } break;
    case 'home': {
      wall('#e3d2b2');
      // zócalo de madera, moldura y rodapié
      ctx.fillStyle='#b99a72'; ctx.fillRect(-W,G0-H*0.2,W*3,H*0.2); ctx.fillStyle='#d8c29c'; ctx.fillRect(-W,G0-H*0.205,W*3,6); ctx.fillStyle='#7a5a3a'; ctx.fillRect(-W,G0-10,W*3,10);
      ctx.strokeStyle='rgba(90,60,30,.25)'; ctx.lineWidth=2; for(let x=-W;x<W*2;x+=W*0.09){ ctx.strokeRect(x+10,G0-H*0.19,W*0.09-20,H*0.17); }
      // ventana con cortinas y el desierto fuera
      const wx=W*0.6, wy=H*0.12, ww=W*0.24, wh=H*0.32, sg=ctx.createLinearGradient(0,wy,0,wy+wh); sg.addColorStop(0,'#7fb2e0'); sg.addColorStop(0.7,'#f0d8a8'); sg.addColorStop(1,'#d4a96c');
      ctx.fillStyle=sg; ctx.fillRect(wx,wy,ww,wh); ctx.fillStyle='#b8714a'; ctx.beginPath(); ctx.moveTo(wx,wy+wh*0.78); ctx.lineTo(wx+ww*0.3,wy+wh*0.62); ctx.lineTo(wx+ww*0.55,wy+wh*0.74); ctx.lineTo(wx+ww*0.8,wy+wh*0.6); ctx.lineTo(wx+ww,wy+wh*0.7); ctx.lineTo(wx+ww,wy+wh); ctx.lineTo(wx,wy+wh); ctx.fill();
      ctx.strokeStyle='#f2ead8'; ctx.lineWidth=8; ctx.strokeRect(wx,wy,ww,wh); ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(wx+ww/2,wy); ctx.lineTo(wx+ww/2,wy+wh); ctx.moveTo(wx,wy+wh/2); ctx.lineTo(wx+ww,wy+wh/2); ctx.stroke();
      for(const [cx,dir] of [[wx-W*0.03,1],[wx+ww+W*0.03,-1]]){ ctx.fillStyle='#8a5a6a'; ctx.beginPath(); ctx.moveTo(cx-W*0.025,wy-14); ctx.lineTo(cx+W*0.025,wy-14); ctx.quadraticCurveTo(cx+dir*W*0.01,wy+wh*0.5,cx+W*0.03,wy+wh+20); ctx.lineTo(cx-W*0.03,wy+wh+20); ctx.quadraticCurveTo(cx-dir*W*0.01,wy+wh*0.5,cx-W*0.025,wy-14); ctx.fill(); }
      ctx.fillStyle='#6a4a2a'; ctx.fillRect(wx-W*0.07,wy-18,ww+W*0.14,6);
      // cuadros
      for(const [px,py,pw,ph,c] of [[W*0.14,H*0.16,W*0.1,H*0.13,'#6a8aa8'],[W*0.28,H*0.2,W*0.06,H*0.09,'#a8846a'],[W*0.9,H*0.18,W*0.07,H*0.12,'#7a9a6a']]){
        ctx.fillStyle='#5a3a22'; ctx.fillRect(px-6,py-6,pw+12,ph+12); ctx.fillStyle='#f2ead8'; ctx.fillRect(px,py,pw,ph); ctx.fillStyle=c; ctx.fillRect(px+8,py+8,pw-16,ph-16); }
      // lámpara de pie con su luz
      const lx=W*0.05; ctx.fillStyle='#3a3028'; ctx.fillRect(lx-3,G0-H*0.42,6,H*0.42); ctx.fillStyle='#f0e0b8'; ctx.beginPath(); ctx.moveTo(lx-30,G0-H*0.42); ctx.lineTo(lx+30,G0-H*0.42); ctx.lineTo(lx+20,G0-H*0.5); ctx.lineTo(lx-20,G0-H*0.5); ctx.fill();
      const lg=ctx.createRadialGradient(lx,G0-H*0.44,10,lx,G0-H*0.44,H*0.35); lg.addColorStop(0,'rgba(255,220,150,.35)'); lg.addColorStop(1,'rgba(255,220,150,0)'); ctx.fillStyle=lg; ctx.fillRect(lx-H*0.35,G0-H*0.8,H*0.7,H*0.7);
      floor('#9c6e44','rgba(60,35,15,.22)');
      // alfombra y sombra de contacto pared-suelo
      ctx.fillStyle='#8a3a2e'; ctx.beginPath(); ctx.ellipse(W*0.5,G0+H*0.09,W*0.32,H*0.06,0,0,7); ctx.fill(); ctx.strokeStyle='rgba(240,200,140,.4)'; ctx.lineWidth=3; ctx.beginPath(); ctx.ellipse(W*0.5,G0+H*0.09,W*0.29,H*0.045,0,0,7); ctx.stroke();
      const sh=ctx.createLinearGradient(0,G0,0,G0+30); sh.addColorStop(0,'rgba(0,0,0,.25)'); sh.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=sh; ctx.fillRect(-W,G0,W*3,30);
      break; }
    case 'garage': wall('#cfc6b6'); floor('#8f8c86'); ctx.fillStyle='#7a6a55'; ctx.fillRect(W*0.1,H*0.1,W*0.5,G0-H*0.1); ctx.strokeStyle='#5a4a3a'; for(let y=H*0.1;y<G0;y+=30){ ctx.beginPath(); ctx.moveTo(W*0.1,y); ctx.lineTo(W*0.6,y); ctx.stroke(); } break;
    case 'school': wall('#d8d4c0'); floor('#b8b4a0','rgba(0,0,0,.08)'); ctx.fillStyle='#2e4a3a'; ctx.fillRect(W*0.15,H*0.12,W*0.7,H*0.3); ctx.fillStyle='rgba(255,255,255,.6)'; ctx.font='28px serif'; ctx.fillText('C₁₀H₁₅N',W*0.22,H*0.3); break;
    case 'party': wall('#f2ece0'); floor('#7a5a3a','rgba(0,0,0,.1)'); win(W*0.1,H*0.12,W*0.25,H*0.4,'#3a5a8a'); win(W*0.6,H*0.12,W*0.25,H*0.4,'#3a5a8a'); break;
    case 'junkyard': sky('#5f9ad8','#f0e0b8'); floor('#8a7a62'); for(let i=0;i<7;i++){ ctx.fillStyle=['#6a4a3a','#4a5a6a','#7a6a4a'][i%3]; ctx.fillRect(i*W/6-30,G0-90-(i%3)*40,W/6-10,90+(i%3)*40); } break;
    case 'warehouse': wall('#5a5e64','rgba(0,0,0,.15)'); floor('#6a6e72'); for(let i=0;i<5;i++){ ctx.fillStyle='#3a5a8a'; ctx.fillRect(W*0.05+i*W*0.2,G0-H*0.35,W*0.12,H*0.35); ctx.fillStyle='#e8c040'; ctx.fillRect(W*0.05+i*W*0.2,G0-H*0.22,W*0.12,10); } break;
    case 'hacienda': sky('#4f8fd0','#f8e0b0'); ctx.fillStyle='#e8d0a8'; ctx.fillRect(-W,H*0.25,W*3,G0-H*0.25); ctx.fillStyle='#b05a3a'; ctx.fillRect(-W,H*0.2,W*3,H*0.06);
      for(let i=0;i<6;i++){ ctx.fillStyle='#7a5a3a'; ctx.beginPath(); ctx.arc(i*W/5,H*0.5,W*0.06,Math.PI,0); ctx.fill(); } ctx.fillStyle='#3fb6d8'; ctx.fillRect(-W,G0,W*3,H*0.08); floor('#d8c8a8'); ctx.fillStyle='#3fb6d8'; ctx.fillRect(-W,G0+10,W*3,40); break;
    case 'office': wall('#d8c8a8'); floor('#6a4a30'); ctx.fillStyle='#2a3a6a'; ctx.fillRect(W*0.1,H*0.1,60,100); ctx.fillStyle='#a22'; ctx.fillRect(W*0.1+60,H*0.1,20,100);
      ctx.fillStyle='#6a9a8a'; ctx.beginPath(); ctx.moveTo(W*0.85,G0); ctx.lineTo(W*0.85,G0-H*0.5); ctx.lineTo(W*0.87,G0-H*0.6); ctx.lineTo(W*0.89,G0-H*0.5); ctx.lineTo(W*0.89,G0); ctx.fill(); break;
    case 'market': wall('#eef0ea'); floor('#d8d8d0','rgba(0,0,0,.08)'); for(let i=0;i<4;i++){ ctx.fillStyle='#c8ccd0'; ctx.fillRect(i*W/3-40,H*0.3,W/4,G0-H*0.3); ctx.fillStyle=['#c33','#3a3','#33c','#cc3'][i]; for(let j=0;j<5;j++) ctx.fillRect(i*W/3-30+j*30,H*0.35,22,G0-H*0.4); } break;
    case 'street': case 'carpark': sky(bg==='carpark'?'#5f9ad8':'#1a2238',bg==='carpark'?'#e8dcc0':'#3a3050'); ctx.fillStyle=bg==='carpark'?'#8a7a6a':'#2a2a34'; for(let i=0;i<8;i++) ctx.fillRect(i*W/7-20,G0-150-(i%3)*60,W/7-15,150+(i%3)*60); floor('#3e3e41'); ctx.fillStyle='#d9b53a'; for(let x=-W;x<W*2;x+=80) ctx.fillRect(x,G0+40,40,5); break;
    case 'hospital': wall('#e4ecee','rgba(0,0,0,.05)'); floor('#c8d0d4','rgba(0,0,0,.08)'); ctx.fillStyle='#8aa0b0'; for(let i=0;i<6;i++) ctx.fillRect(i*W/5+20,G0-90,W/5-50,40); break;
    case 'interrog': wall('#b8bcb0'); floor('#7a7e78'); ctx.fillStyle='#1a1a1a'; ctx.fillRect(W*0.6,H*0.15,W*0.3,H*0.25); break;
    case 'rv': wall('#d8cfb4'); floor('#8a7a62'); ctx.fillStyle='#bfe0f0'; ctx.fillRect(W*0.1,H*0.2,W*0.15,H*0.15); ctx.fillRect(W*0.75,H*0.2,W*0.15,H*0.15); ctx.fillStyle='#b8bec4'; ctx.fillRect(W*0.35,G0-H*0.3,W*0.3,H*0.3); break;
    case 'pool': sky('#4f8fd0','#d0e8f0'); ctx.fillStyle='#e8e0d0'; ctx.fillRect(-W,G0-20,W*3,H); ctx.fillStyle='#3fb6d8'; ctx.fillRect(W*0.1,G0,W*0.8,H*0.15); break;
    case 'bar': case 'diner': wall(bg==='bar'?'#3a2a20':'#e8d8b8'); floor(bg==='bar'?'#2a1e16':'#c8a878'); ctx.fillStyle=bg==='bar'?'#5a3a28':'#c84030'; ctx.fillRect(-W,G0-60,W*3,60); if(bg==='bar'){ ctx.fillStyle='#1a1a1a'; ctx.fillRect(W*0.62,H*0.14,W*0.22,H*0.18); ctx.fillStyle='rgba(120,160,255,.6)'; ctx.fillRect(W*0.63,H*0.15,W*0.2,H*0.16); } break;
    case 'nursing': wall('#e8e0cc'); floor('#b8b09a'); win(W*0.7,H*0.15,W*0.18,H*0.3); break;
    case 'title': { // cabecera de la serie: humo verde y los símbolos de la tabla periódica
      const g=ctx.createRadialGradient(W/2,H/2,20,W/2,H/2,W*0.7); g.addColorStop(0,'#2e5a28'); g.addColorStop(1,'#0a1608'); ctx.fillStyle=g; ctx.fillRect(-W,-H,W*3,H*3);
      for(let i=0;i<14;i++){ ctx.fillStyle='rgba(170,220,150,.05)'; ctx.beginPath(); ctx.arc(W*0.5+Math.sin(t*0.4+i*1.7)*W*0.35,H*0.5+Math.cos(t*0.3+i*2.3)*H*0.3,90+i*12,0,7); ctx.fill(); }
      const k=G.cine?G.cine.t:2, box=(x,y,sym,num,a)=>{ ctx.globalAlpha=a; ctx.fillStyle='#2e6b3f'; ctx.fillRect(x,y,120,120); ctx.strokeStyle='#9fe09f'; ctx.lineWidth=3; ctx.strokeRect(x,y,120,120);
        ctx.fillStyle='#fff'; ctx.font='bold 16px "Segoe UI",Arial'; ctx.textAlign='left'; ctx.fillText(num,x+8,y+22); ctx.font='900 60px "Segoe UI",Arial'; ctx.fillText(sym,x+18,y+90); ctx.globalAlpha=1; };
      const x0=W*0.5-230, y0=H*0.3;
      box(x0,y0,'Br','35',clamp(k-0.3,0,1)); box(x0+80,y0+140,'Ba','56',clamp(k-0.9,0,1));
      ctx.globalAlpha=clamp(k-1.5,0,1); ctx.fillStyle='#fff'; ctx.font='900 80px "Segoe UI",Arial'; ctx.textAlign='left'; ctx.fillText('eaking',x0+132,y0+95); ctx.fillText('d',x0+212,y0+235); ctx.globalAlpha=1;
      break; }
    default: ctx.fillStyle='#0b0b0d'; ctx.fillRect(-W,-H,W*3,H*3);
  }
}

// ---------- atrezo ----------
function drawProp(p,x,y,s,t){
  ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
  const R=(c,a,b,w,h,r)=>{ ctx.fillStyle=c; roundRect(a,b,w,h,r||0); ctx.fill(); };
  switch(p){
    case 'tub': R('#f4f4f2',-110,-70,220,70,24); R('#dfe6e4',-96,-62,192,40,16); ctx.fillStyle='rgba(120,90,40,.35)'; ctx.fillRect(-90,-40,180,18); break;
    case 'table': ctx.fillStyle='#5a3a20'; ctx.fillRect(-150,-100,14,100); ctx.fillRect(136,-100,14,100);
      R('#f2ece0',-170,-118,340,22,4); ctx.fillStyle='#e4dccc'; ctx.beginPath(); ctx.moveTo(-170,-96); ctx.lineTo(170,-96); ctx.lineTo(160,-60); ctx.quadraticCurveTo(0,-50,-160,-60); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.08)'; ctx.lineWidth=2; for(let i=-140;i<160;i+=40){ ctx.beginPath(); ctx.moveTo(i,-96); ctx.lineTo(i*0.95,-58); ctx.stroke(); }
      for(const dx of [-90,0,90]){ ctx.fillStyle='#fafafa'; ctx.beginPath(); ctx.ellipse(dx,-118,22,6,0,0,7); ctx.fill(); } break;
    case 'chair': ctx.fillStyle='#6a4a2e'; ctx.fillRect(-20,-50,40,8); ctx.fillRect(-20,-50,6,50); ctx.fillRect(14,-50,6,50); ctx.fillRect(14,-100,6,52); break;
    case 'rv': R('#e8e2cf',-170,-130,340,110,14); R('#7a6a4a',-170,-70,340,10); R('#bfe0f0',-150,-115,60,34,4); R('#bfe0f0',90,-115,60,34,4); ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(-110,-18,22,0,7); ctx.arc(110,-18,22,0,7); ctx.fill(); break;
    case 'car': case 'aztek': case 'chrysler': R(p==='aztek'?'#8a9a5b':p==='chrysler'?'#1a1a1a':'#a33',-130,-70,260,52,18); R(p==='aztek'?'#7a8a4b':p==='chrysler'?'#111':'#822',-80,-105,150,40,14); R('#bfe0f0',-70,-98,60,28,6); R('#bfe0f0',0,-98,60,28,6); ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(-80,-18,20,0,7); ctx.arc(80,-18,20,0,7); ctx.fill(); break;
    case 'money': for(let i=0;i<14;i++){ R(i%2?'#5a8a4a':'#6a9a5a',-90+(i%5)*36,-14-Math.floor(i/5)*14,34,13,2); } break;
    case 'barrel': for(const dx of [-50,0,50]){ R('#2a5a8a',dx-22,-80,44,80,6); ctx.fillStyle='#1a3a5a'; ctx.fillRect(dx-22,-55,44,4); ctx.fillRect(dx-22,-28,44,4); } break;
    case 'barrels': for(const dx of [-72,-24,24,72]){ R('#2a5a8a',dx-18,-78,36,78,6); ctx.fillStyle='#1a3a5a'; ctx.fillRect(dx-18,-53,36,4); ctx.fillRect(dx-18,-27,36,4); } break;
    case 'reaction':
      R('#4b5052',-74,-58,148,58,12); R('#292d30',-82,-12,164,18,5);
      ctx.fillStyle='rgba(145,205,166,.82)'; ctx.beginPath(); ctx.ellipse(0,-57,67,8,0,0,7); ctx.fill();
      ctx.fillStyle='rgba(225,245,220,.72)'; for(let i=0;i<5;i++){ const bx=Math.sin(t*2.4+i*1.7)*42, by=-62-((t*42+i*19)%54); ctx.beginPath(); ctx.arc(bx,by,3+i%3,0,7); ctx.fill(); }
      ctx.strokeStyle='rgba(175,230,190,.48)'; ctx.lineWidth=5; for(let i=0;i<4;i++){ const sx=(i-1.5)*24, sway=Math.sin(t*1.8+i)*9; ctx.beginPath(); ctx.moveTo(sx,-65); ctx.bezierCurveTo(sx+sway,-90,sx-sway,-104,sx+sway,-132); ctx.stroke(); }
      break;
    case 'gun': case 'revolver': ctx.fillStyle='#1a1a1c'; ctx.fillRect(-60,-30,90,16); ctx.fillRect(-60,-30,26,46); if(p==='revolver'){ ctx.beginPath(); ctx.arc(-20,-22,12,0,7); ctx.fill(); } ctx.fillStyle='#5a3a20'; ctx.fillRect(-58,-10,22,32); break;
    case 'boxcutter': R('#e8c040',-70,-16,110,22,6); ctx.fillStyle='#c8ced4'; ctx.beginPath(); ctx.moveTo(40,-14); ctx.lineTo(80,-6); ctx.lineTo(40,2); ctx.fill(); break;
    case 'crystal': for(let i=0;i<9;i++){ ctx.fillStyle=`hsl(${195+i*3},80%,${55+i%3*8}%)`; ctx.beginPath(); const a=-60+i*15, b=-20-((i*13)%30); ctx.moveTo(a,b); ctx.lineTo(a+14,b-18); ctx.lineTo(a+28,b); ctx.lineTo(a+14,b+10); ctx.fill(); } break;
    case 'bell': R('#c8a040',-24,-50,48,40,10); R('#a88030',-6,-62,12,14,4); ctx.fillStyle='#e8d070'; ctx.beginPath(); ctx.arc(-6,-36,6,0,7); ctx.fill(); break;
    case 'wheelchair': ctx.strokeStyle='#3a3a3a'; ctx.lineWidth=6; ctx.beginPath(); ctx.arc(-10,-40,40,0,7); ctx.stroke(); ctx.fillStyle='#2a2a2e'; ctx.fillRect(-40,-110,60,60); ctx.fillRect(-40,-150,12,60); break;
    case 'book': R('#2a4a6a',-70,-40,140,90,4); ctx.fillStyle='#f2ead8'; ctx.fillRect(-66,-36,132,82); ctx.fillStyle='#3a3020'; ctx.font='italic 13px Georgia'; ctx.textAlign='center'; ctx.fillText('Hojas de hierba',0,-10); ctx.font='italic 9px Georgia'; ctx.fillText('A mi otro W.W. favorito.',0,12); ctx.fillText('G.B.',30,30); break;
    case 'tv': R('#1a1a1c',-90,-120,180,120,6); ctx.fillStyle=`rgba(120,170,255,${0.6+0.2*Math.sin(t*9)})`; ctx.fillRect(-80,-112,160,100); break;
    case 'phone': R('#222',-22,-80,44,84,8); R('#6cf',-16,-72,32,58,3); break;
    case 'battery': R('#5a5a5a',-60,-50,120,50,4); ctx.fillStyle='#c84'; for(let i=0;i<8;i++) ctx.fillRect(-54+i*14,-46,10,8); break;
    case 'fly': ctx.fillStyle='#111'; ctx.beginPath(); ctx.ellipse(0,-20,10,6,0,0,7); ctx.fill(); ctx.fillStyle='rgba(200,220,255,.5)'; const fw=Math.sin(t*60)*4; ctx.beginPath(); ctx.ellipse(-4,-28+fw,8,4,0.6,0,7); ctx.ellipse(4,-28-fw,8,4,-0.6,0,7); ctx.fill(); break;
    case 'bomb': R('#4a4e54',-40,-30,80,30,4); ctx.strokeStyle='#c33'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(-30,-30); ctx.bezierCurveTo(-30,-70,30,-70,30,-30); ctx.stroke(); ctx.fillStyle=Math.sin(t*8)>0?'#f33':'#600'; ctx.beginPath(); ctx.arc(0,-15,5,0,7); ctx.fill(); break;
    case 'machinegun': ctx.fillStyle='#222'; ctx.fillRect(-120,-40,240,22); ctx.fillRect(-40,-18,30,40); ctx.fillRect(110,-36,40,10); ctx.fillStyle='#c8a040'; for(let i=0;i<8;i++) ctx.fillRect(-100+i*14,-18,6,20); break;
    case 'glass': for(const dx of [-40,0,40]){ ctx.fillStyle='rgba(220,240,255,.6)'; ctx.beginPath(); ctx.moveTo(dx-14,-80); ctx.lineTo(dx+14,-80); ctx.lineTo(dx+6,-50); ctx.lineTo(dx-6,-50); ctx.fill(); ctx.fillStyle='#c8a040'; ctx.fillRect(dx-12,-76,24,14); ctx.fillStyle='rgba(220,240,255,.6)'; ctx.fillRect(dx-2,-50,4,40); ctx.fillRect(dx-12,-12,24,4); } break;
    case 'tank': R('#c8ced4',-50,-200,100,200,14); R('#e8ecef',-38,-190,24,180,8); break;
    case 'plane': ctx.fillStyle='#e8e8ea'; ctx.beginPath(); ctx.ellipse(0,0,110,16,0,0,7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-10,0); ctx.lineTo(30,-70); ctx.lineTo(46,-70); ctx.lineTo(30,0); ctx.fill(); ctx.beginPath(); ctx.moveTo(-90,0); ctx.lineTo(-100,-34); ctx.lineTo(-84,-34); ctx.lineTo(-74,0); ctx.fill(); break;
    case 'teddy': ctx.fillStyle='#e87aa8'; ctx.beginPath(); ctx.arc(0,-40,30,0,7); ctx.arc(0,-90,22,0,7); ctx.arc(-18,-108,9,0,7); ctx.arc(18,-108,9,0,7); ctx.fill(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(-8,-94,3,0,7); ctx.fill(); break;
    case 'plate': ctx.fillStyle='#f2f2f0'; ctx.beginPath(); ctx.ellipse(0,-10,60,16,0,0,7); ctx.fill(); ctx.fillStyle='#a33'; ctx.font='bold 20px sans-serif'; ctx.textAlign='center'; ctx.fillText('52',0,-4); break;
    case 'shovel': ctx.strokeStyle='#6a4a2e'; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(0,-140); ctx.lineTo(0,-30); ctx.stroke(); R('#8a8e94',-18,-34,36,36,6); break;
    case 'chain': ctx.strokeStyle='#8a8e94'; ctx.lineWidth=4; for(let i=0;i<8;i++){ ctx.beginPath(); ctx.ellipse(i*14-50,-50-i*6,8,5,i%2?0:1.5,0,7); ctx.stroke(); } break;
    case 'bed': R('#d8cfbf',-130,-50,260,40,6); R('#6a2a2a',-60,-58,190,30,8); R('#f4f0e8',-128,-66,60,22,8); break;
    case 'cabin': R('#6a4a30',-160,-180,320,180,4); ctx.fillStyle='#3a2a1e'; ctx.beginPath(); ctx.moveTo(-190,-170); ctx.lineTo(0,-280); ctx.lineTo(190,-170); ctx.fill(); ctx.fillStyle='#ffd27a'; ctx.fillRect(-100,-120,60,50); break;
    case 'counter': R('#c84030',-200,-70,400,70,4); R('#e8e0d0',-200,-80,400,12,2); break;
    case 'hole': ctx.fillStyle='#3a2a1a'; ctx.beginPath(); ctx.ellipse(0,0,140,30,0,0,7); ctx.fill(); break;
    case 'bike': ctx.strokeStyle='#c33'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(-40,-30,28,0,7); ctx.arc(40,-30,28,0,7); ctx.moveTo(-40,-30); ctx.lineTo(0,-70); ctx.lineTo(40,-30); ctx.stroke(); break;
    case 'lily': ctx.strokeStyle='#3e6a2e'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(10,-60,40,-90); ctx.stroke();
      ctx.fillStyle='#4f7a3a'; ctx.beginPath(); ctx.ellipse(-20,-40,14,50,-0.3,0,7); ctx.ellipse(24,-34,12,44,0.4,0,7); ctx.fill();
      ctx.fillStyle='#f4f4ee'; for(let i=0;i<5;i++){ ctx.beginPath(); ctx.arc(14+i*7,-74-i*4+Math.sin(t*2+i)*1.5,6,0,Math.PI); ctx.fill(); } break;
    case 'cake': ctx.translate(0,-120); R('#f4ece0',-40,-34,80,34,6); R('#c86a8a',-40,-36,80,8,4); ctx.fillStyle='#e8c040'; for(const dx of [-20,0,20]){ ctx.fillRect(dx-2,-56,4,20); ctx.fillStyle='#ffb020'; ctx.beginPath(); ctx.ellipse(dx,-60,3,6+Math.sin(t*12+dx)*1.5,0,0,7); ctx.fill(); ctx.fillStyle='#e8c040'; } break;
    case 'mustard': R('#f4f4f2',-90,-120,180,120,8); ctx.strokeStyle='#d8d8d4'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(0,-120); ctx.lineTo(0,0); ctx.stroke();
      ctx.fillStyle='#d8a820'; ctx.beginPath(); ctx.ellipse(-30,-62,16,9,0.4,0,7); ctx.fill(); ctx.beginPath(); ctx.ellipse(-16,-54,6,4,0,0,7); ctx.fill(); break;
    case 'tarantula': ctx.fillStyle='#2a1a10'; ctx.beginPath(); ctx.ellipse(0,-14,16,10,0,0,7); ctx.fill(); ctx.strokeStyle='#2a1a10'; ctx.lineWidth=3; for(let i=0;i<4;i++) for(const sd of [-1,1]){ ctx.beginPath(); ctx.moveTo(sd*8,-14); ctx.lineTo(sd*(24+i*4),-26+i*8); ctx.lineTo(sd*(30+i*4),-6+i*2); ctx.stroke(); } break;
  }
  ctx.restore();
}
