"use strict";
// ======================= MINIJUEGOS =======================
// Tipos reutilizables. Cada misión tiene uno (ver js/missions/minigames.js), como paso 'game'.
//   timing   pulsa ESPACIO cuando la aguja está en la zona verde (hits aciertos, 3 fallos)
//   mash     machaca ESPACIO para llenar la barra antes de que acabe el tiempo
//   sequence memoriza la secuencia de flechas y repítela
//   scrub    pasa el ratón (con clic) por las manchas hasta limpiarlas todas
//   wires    une cada cable con su color (clic izquierda → clic derecha)
//   stealth  llega a la salida (y recoge los objetos) sin entrar en los conos de visión
//   aim      haz clic en los objetivos antes de que desaparezcan (fly: se mueven)
//   balance  mantén la aguja centrada con A/D contra la deriva durante X segundos
//   count    suma el importe exacto con billetes

function startMinigame(def,onWin,onFail){
  const o=Object.assign({},def.opts||{});
  G.mg={def,type:def.game,t:0,o,onWin,onFail,done:null,msg:''};
  MG[def.game].init(G.mg,o);
  sfx.blip();
}
function mgEnd(win){ const M=G.mg; if(M.done) return; M.done=win?'win':'fail'; M.endT=0; win?sfx.cash():sfx.crash(); }
function updateMinigame(dt){
  const M=G.mg; M.t+=dt;
  if(M.done){ M.endT+=dt; if(M.endT>1.3&&(pressed[' ']||pressed['enter']||pressed['e']||mouse.clicked||M.endT>3)){ G.mg=null; (M.done==='win'?M.onWin:M.onFail)(); } return; }
  if(pressed['escape']){ mgEnd(false); return; }
  if(M.t<0.6) return;  // pequeña pausa para leer el título
  MG[M.type].update(M,dt);
}
// ---------- dibujo común ----------
function drawMinigame(t){
  const M=G.mg, D=M.def;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle='rgba(8,10,8,.86)'; ctx.fillRect(0,0,VW,VH);
  const pw=Math.min(980,VW-40), ph=Math.min(600,VH-60), px=(VW-pw)/2, py=(VH-ph)/2;
  ctx.fillStyle='#16201a'; roundRect(px,py,pw,ph,14); ctx.fill(); ctx.strokeStyle='#3e6b4a'; ctx.lineWidth=2; ctx.stroke();
  // cabecera estilo tabla periódica
  ctx.fillStyle='#2e6b3f'; ctx.fillRect(px+20,py+18,54,54); ctx.strokeStyle='#9fe09f'; ctx.strokeRect(px+20,py+18,54,54);
  txt(curMission()?curMission().code:'',px+47,py+52,15,'#fff','center','800 ');
  txt(D.title||'Minijuego',px+90,py+44,24,'#ffd23a','left','800 ');
  txt(D.hint||MG[M.type].hint,px+90,py+68,14,'#bfd8bf','left');
  const A={x:px+24,y:py+92,w:pw-48,h:ph-150};
  ctx.save(); ctx.beginPath(); ctx.rect(A.x,A.y,A.w,A.h); ctx.clip();
  ctx.fillStyle='#0e1510'; ctx.fillRect(A.x,A.y,A.w,A.h);
  MG[M.type].draw(M,A,t);
  ctx.restore();
  if(M.msg) txt(M.msg,VW/2,py+ph-24,16,'#ddd','center');
  txt('ESC: rendirse',px+pw-20,py+ph-24,12,'#6a7a6a','right');
  if(M.done){ ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(px,py,pw,ph);
    txt(M.done==='win'?'¡CONSEGUIDO!':'HAS FALLADO',VW/2,VH/2,54,M.done==='win'?'#7f7':'#f66','center','900 ');
    if(M.done==='fail') txt('Vuelve a intentarlo cuando quieras (E en el lugar)',VW/2,VH/2+40,16,'#ccc','center'); }
}
const bar=(x,y,w,h,f,col)=>{ ctx.fillStyle='#253025'; ctx.fillRect(x,y,w,h); ctx.fillStyle=col||'#5ad16a'; ctx.fillRect(x,y,w*clamp(f,0,1),h); ctx.strokeStyle='#4a5a4a'; ctx.strokeRect(x,y,w,h); };
const mouseIn=(A)=>mouse.x>=A.x&&mouse.x<=A.x+A.w&&mouse.y>=A.y&&mouse.y<=A.y+A.h;

const MG={
  timing:{ hint:'Pulsa ESPACIO cuando la aguja esté en la zona verde.',
    init(M,o){ M.hits=0; M.miss=0; M.need=o.hits||4; M.sp=o.speed||1.4; M.zw=o.zone||0.14; M.zc=rand(0.25,0.75); M.p=0; M.flash=0; },
    update(M,dt){ M.p=(Math.sin(M.t*M.sp*2.2)+1)/2; M.flash=Math.max(0,M.flash-dt);
      if(pressed[' ']){ if(Math.abs(M.p-M.zc)<M.zw/2){ M.hits++; M.flash=0.3; sfx.blip(); M.zc=rand(0.15,0.85); M.sp*=1.08; if(M.hits>=M.need) mgEnd(true); }
        else { M.miss++; M.flash=-0.3; if(M.miss>=3) mgEnd(false); } }
      M.msg='Aciertos '+M.hits+'/'+M.need+'   ·   Fallos '+M.miss+'/3'; },
    draw(M,A){ const bx=A.x+60,bw=A.w-120,by=A.y+A.h/2-30; ctx.fillStyle='#253025'; ctx.fillRect(bx,by,bw,60);
      ctx.fillStyle=M.flash>0?'#9f9':M.flash<0?'#f88':'#3fa04f'; ctx.fillRect(bx+bw*(M.zc-M.zw/2),by,bw*M.zw,60);
      ctx.fillStyle='#fff'; ctx.fillRect(bx+bw*M.p-3,by-14,6,88); } },
  mash:{ hint:'Machaca ESPACIO para llenar la barra antes de que se acabe el tiempo.',
    init(M,o){ M.f=0; M.lim=o.time||8; M.dec=o.decay||0.18; },
    update(M,dt){ if(pressed[' ']) { M.f+=0.055; sfx.blip&&0; } M.f=Math.max(0,M.f-M.dec*dt); if(M.f>=1) mgEnd(true); if(M.t-0.6>M.lim) mgEnd(false);
      M.msg='Tiempo: '+Math.max(0,M.lim-(M.t-0.6)).toFixed(1)+' s'; },
    draw(M,A,t){ bar(A.x+80,A.y+A.h/2-40,A.w-160,80,M.f,M.f>0.75?'#ffd23a':'#5ad16a');
      txt('ESPACIO',A.x+A.w/2,A.y+A.h/2+100+Math.sin(t*20)*3,30,'#fff','center','900 '); } },
  sequence:{ hint:'Memoriza la secuencia y repítela con las flechas (o WASD).',
    init(M,o){ M.len=o.len||4; M.rounds=o.rounds||3; M.round=0; MG.sequence.next(M); },
    next(M){ M.seq=[]; for(let i=0;i<M.len+M.round;i++) M.seq.push((Math.random()*4)|0); M.show=0; M.inp=[]; M.phase='show'; M.st=M.t; },
    update(M){ const K=[['arrowup','w'],['arrowright','d'],['arrowdown','s'],['arrowleft','a']];
      if(M.phase==='show'){ M.show=Math.floor((M.t-M.st)/0.7); if(M.show>=M.seq.length) M.phase='input'; M.msg='Observa...'; return; }
      M.msg='Tu turno: '+M.inp.length+'/'+M.seq.length+'   ·   Ronda '+(M.round+1)+'/'+M.rounds;
      for(let k=0;k<4;k++) if(K[k].some(x=>pressed[x])){ if(M.seq[M.inp.length]!==k){ mgEnd(false); return; } M.inp.push(k); sfx.blip();
        if(M.inp.length===M.seq.length){ M.round++; if(M.round>=M.rounds) mgEnd(true); else MG.sequence.next(M); } } },
    draw(M,A){ const ar=['▲','▶','▼','◀'], cx=A.x+A.w/2, cy=A.y+A.h/2;
      if(M.phase==='show'){ const on=M.show<M.seq.length&&((M.t-M.st)%0.7)<0.5; if(on) txt(ar[M.seq[M.show]],cx,cy+40,120,'#5ad1ff','center','900 '); }
      else { M.seq.forEach((s,i)=>{ const x=cx+(i-(M.seq.length-1)/2)*60; ctx.fillStyle=i<M.inp.length?'#2e6b3f':'#253025'; ctx.fillRect(x-24,cy-24,48,48); if(i<M.inp.length) txt(ar[M.inp[i]],x,cy+12,30,'#fff','center','900 '); }); } } },
  scrub:{ hint:'Mantén pulsado el ratón y pásalo por encima de las manchas.',
    init(M,o){ M.spots=[]; for(let i=0;i<(o.spots||14);i++) M.spots.push({x:rand(0.08,0.92),y:rand(0.1,0.9),r:rand(22,42),hp:1}); M.lim=o.time||20; M.color=o.color||'rgba(120,80,40,'; },
    update(M,dt){ const A=M.A; if(A&&mouse.down) for(const s of M.spots){ if(s.hp>0&&dist(mouse.x,mouse.y,A.x+s.x*A.w,A.y+s.y*A.h)<s.r+14) s.hp-=dt*1.6; }
      const left=M.spots.filter(s=>s.hp>0).length; if(!left) mgEnd(true); if(M.t-0.6>M.lim) mgEnd(false);
      M.msg='Quedan '+left+'   ·   Tiempo: '+Math.max(0,M.lim-(M.t-0.6)).toFixed(1)+' s'; },
    draw(M,A){ M.A=A; ctx.fillStyle='#d9dcd6'; ctx.fillRect(A.x,A.y,A.w,A.h); ctx.strokeStyle='rgba(0,0,0,.08)'; for(let x=A.x;x<A.x+A.w;x+=40){ ctx.beginPath(); ctx.moveTo(x,A.y); ctx.lineTo(x,A.y+A.h); ctx.stroke(); } for(let y=A.y;y<A.y+A.h;y+=40){ ctx.beginPath(); ctx.moveTo(A.x,y); ctx.lineTo(A.x+A.w,y); ctx.stroke(); }
      for(const s of M.spots) if(s.hp>0){ ctx.fillStyle=M.color+(0.85*s.hp)+')'; ctx.beginPath(); ctx.arc(A.x+s.x*A.w,A.y+s.y*A.h,s.r,0,7); ctx.fill(); }
      if(mouseIn(A)){ ctx.strokeStyle='#fff'; ctx.beginPath(); ctx.arc(mouse.x,mouse.y,16,0,7); ctx.stroke(); } } },
  wires:{ hint:'Haz clic en un cable de la izquierda y luego en el de su mismo color a la derecha.',
    init(M,o){ const C=['#e44','#4c4','#48f','#ec3','#c4e','#fff'].slice(0,o.n||4); M.L=C.slice(); M.R=C.slice().sort(()=>Math.random()-.5); M.links=[]; M.sel=-1; M.err=0; M.lim=o.time||20; },
    update(M){ const A=M.A; if(!A) return; if(M.t-0.6>M.lim){ mgEnd(false); return; }
      M.msg='Errores '+M.err+'/3   ·   Tiempo: '+Math.max(0,M.lim-(M.t-0.6)).toFixed(1)+' s';
      if(!mouse.clicked) return; const n=M.L.length, y=i=>A.y+A.h*(i+1)/(n+1);
      for(let i=0;i<n;i++){ if(dist(mouse.x,mouse.y,A.x+100,y(i))<26&&!M.links.some(l=>l[0]===i)) M.sel=i;
        if(M.sel>=0&&dist(mouse.x,mouse.y,A.x+A.w-100,y(i))<26){ if(M.R[i]===M.L[M.sel]){ M.links.push([M.sel,i]); sfx.blip(); M.sel=-1; if(M.links.length===n) mgEnd(true); } else { M.err++; M.sel=-1; if(M.err>=3) mgEnd(false); } } } },
    draw(M,A){ M.A=A; const n=M.L.length, y=i=>A.y+A.h*(i+1)/(n+1);
      ctx.lineWidth=10; ctx.lineCap='round';
      for(const [a,b] of M.links){ ctx.strokeStyle=M.L[a]; ctx.beginPath(); ctx.moveTo(A.x+100,y(a)); ctx.bezierCurveTo(A.x+A.w/2,y(a),A.x+A.w/2,y(b),A.x+A.w-100,y(b)); ctx.stroke(); }
      if(M.sel>=0){ ctx.strokeStyle=M.L[M.sel]; ctx.globalAlpha=.6; ctx.beginPath(); ctx.moveTo(A.x+100,y(M.sel)); ctx.lineTo(mouse.x,mouse.y); ctx.stroke(); ctx.globalAlpha=1; }
      for(let i=0;i<n;i++){ for(const [x,c] of [[A.x+100,M.L[i]],[A.x+A.w-100,M.R[i]]]){ ctx.fillStyle='#333'; ctx.fillRect(x-30,y(i)-16,60,32); ctx.fillStyle=c; ctx.beginPath(); ctx.arc(x,y(i),13,0,7); ctx.fill(); } } } },
  stealth:{ hint:'Muévete con WASD. Recoge los objetos y llega a la salida sin que te vean.',
    init(M,o){ M.p={x:0.05,y:0.5}; M.exit={x:0.95,y:0.5}; M.items=[]; for(let i=0;i<(o.items||2);i++) M.items.push({x:rand(0.3,0.8),y:rand(0.15,0.85),got:false});
      M.g=[]; for(let i=0;i<(o.guards||3);i++){ const x=0.25+i*0.6/Math.max(1,(o.guards||3)-1); M.g.push({x,y:0.5,a:Math.random()*6,ax:x,ph:Math.random()*6,v:o.speed||0.5,vert:i%2===0}); } },
    update(M,dt){ const s=0.22*dt; let mx=(keys['d']||keys['arrowright']?1:0)-(keys['a']||keys['arrowleft']?1:0), my=(keys['s']||keys['arrowdown']?1:0)-(keys['w']||keys['arrowup']?1:0);
      M.p.x=clamp(M.p.x+mx*s,0.02,0.98); M.p.y=clamp(M.p.y+my*s*1.7,0.04,0.96);
      for(const g of M.g){ const k=Math.sin(M.t*g.v+g.ph); if(g.vert){ g.y=0.5+k*0.38; g.a=Math.cos(M.t*g.v+g.ph)>0?Math.PI/2:-Math.PI/2; } else { g.y=0.5+Math.cos(g.ph)*0.3; g.a=M.t*g.v*0.8+g.ph; }
        const A=M.A; if(!A) continue; const dx=(M.p.x-g.x)*A.w, dy=(M.p.y-g.y)*A.h, d=Math.hypot(dx,dy), ang=Math.abs(angDiff(g.a,Math.atan2(dy,dx)));
        if(d<190&&ang<0.45) { mgEnd(false); return; } }
      for(const it of M.items) if(!it.got&&M.A&&dist(M.p.x*M.A.w,M.p.y*M.A.h,it.x*M.A.w,it.y*M.A.h)<26){ it.got=true; sfx.blip(); }
      const left=M.items.filter(i=>!i.got).length; M.msg=left?'Objetos por recoger: '+left:'¡Ahora a la salida!';
      if(!left&&M.A&&dist(M.p.x*M.A.w,M.p.y*M.A.h,M.exit.x*M.A.w,M.exit.y*M.A.h)<34) mgEnd(true); },
    draw(M,A){ M.A=A; ctx.fillStyle='#1b2420'; ctx.fillRect(A.x,A.y,A.w,A.h); const P=(o)=>[A.x+o.x*A.w,A.y+o.y*A.h];
      for(const g of M.g){ const [x,y]=P(g); ctx.fillStyle='rgba(255,230,120,.16)'; ctx.beginPath(); ctx.moveTo(x,y); ctx.arc(x,y,190,g.a-0.45,g.a+0.45); ctx.closePath(); ctx.fill(); ctx.fillStyle='#d33'; ctx.beginPath(); ctx.arc(x,y,12,0,7); ctx.fill(); }
      for(const it of M.items) if(!it.got){ const [x,y]=P(it); ctx.fillStyle='#2a6fb0'; ctx.fillRect(x-10,y-12,20,24); ctx.fillStyle='#ffd23a'; ctx.fillRect(x-10,y-3,20,5); }
      const [ex,ey]=P(M.exit); ctx.fillStyle=M.items.every(i=>i.got)?'#3fa04f':'#334'; ctx.fillRect(ex-18,ey-30,36,60);
      const [px,py]=P(M.p); ctx.fillStyle='#eac9a5'; ctx.beginPath(); ctx.arc(px,py,11,0,7); ctx.fill(); ctx.strokeStyle='#000'; ctx.lineWidth=2; ctx.stroke(); } },
  aim:{ hint:'Haz clic sobre los objetivos antes de que desaparezcan.',
    init(M,o){ M.need=o.need||8; M.hit=0; M.esc=0; M.maxEsc=o.miss||4; M.tg=[]; M.next=0; M.fly=!!o.fly; M.life=o.life||1.6; },
    update(M,dt){ const A=M.A; if(!A) return; M.next-=dt;
      if(M.next<=0&&M.tg.length<(M.fly?1:3)){ M.tg.push({x:rand(0.1,0.9),y:rand(0.15,0.85),t:0,vx:rand(-0.4,0.4),vy:rand(-0.4,0.4)}); M.next=rand(0.4,0.9); }
      for(const g of M.tg){ g.t+=dt; if(M.fly){ g.vx+=rand(-2,2)*dt; g.vy+=rand(-2,2)*dt; g.x=clamp(g.x+g.vx*dt,0.05,0.95); g.y=clamp(g.y+g.vy*dt,0.05,0.95); if(g.x<=0.05||g.x>=0.95) g.vx*=-1; if(g.y<=0.05||g.y>=0.95) g.vy*=-1; } }
      if(mouse.clicked) for(const g of M.tg){ if(dist(mouse.x,mouse.y,A.x+g.x*A.w,A.y+g.y*A.h)<(M.fly?24:30)){ g.dead=true; M.hit++; sfx.shot&&sfx.shot(); if(M.fly){ g.x=rand(.1,.9); g.y=rand(.1,.9); g.dead=false; } break; } }
      for(const g of M.tg) if(!M.fly&&!g.dead&&g.t>M.life){ g.dead=true; M.esc++; }
      M.tg=M.tg.filter(g=>!g.dead);
      if(M.hit>=M.need) mgEnd(true); if(M.esc>=M.maxEsc) mgEnd(false); if(M.fly&&M.t>40) mgEnd(false);
      M.msg='Aciertos '+M.hit+'/'+M.need+(M.fly?'':'   ·   Escapados '+M.esc+'/'+M.maxEsc); },
    draw(M,A,t){ M.A=A; for(const g of M.tg){ const x=A.x+g.x*A.w, y=A.y+g.y*A.h;
        if(M.fly){ ctx.fillStyle='#111'; ctx.beginPath(); ctx.ellipse(x,y,9,6,0,0,7); ctx.fill(); ctx.fillStyle='rgba(200,220,255,.6)'; const w=Math.sin(t*60)*4; ctx.beginPath(); ctx.ellipse(x-5,y-7+w,8,4,.6,0,7); ctx.ellipse(x+5,y-7-w,8,4,-.6,0,7); ctx.fill(); }
        else { const f=1-g.t/M.life; ctx.strokeStyle='#f55'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(x,y,28,0,7); ctx.stroke(); ctx.beginPath(); ctx.arc(x,y,14,0,7); ctx.stroke(); ctx.fillStyle='#f55'; ctx.beginPath(); ctx.arc(x,y,4,0,7); ctx.fill(); ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,y,34,-Math.PI/2,-Math.PI/2+f*6.28); ctx.stroke(); } }
      if(mouseIn(A)){ ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(mouse.x-12,mouse.y); ctx.lineTo(mouse.x+12,mouse.y); ctx.moveTo(mouse.x,mouse.y-12); ctx.lineTo(mouse.x,mouse.y+12); ctx.stroke(); } } },
  balance:{ hint:'Mantén la aguja dentro de la zona con A / D.',
    init(M,o){ M.v=0.5; M.vel=0; M.in=0; M.need=o.time||10; M.out=0; M.zw=o.zone||0.24; M.drift=o.drift||0.6; },
    update(M,dt){ M.vel+=(Math.sin(M.t*1.3)*0.6+Math.sin(M.t*3.1)*0.4+rand(-1,1))*M.drift*dt; M.vel+=((keys['d']||keys['arrowright']?1:0)-(keys['a']||keys['arrowleft']?1:0))*1.6*dt; M.vel*=0.96;
      M.v=clamp(M.v+M.vel*dt,0,1); const ok=Math.abs(M.v-0.5)<M.zw/2; if(ok){ M.in+=dt; M.out=0; } else { M.out+=dt; if(M.out>2.2) mgEnd(false); }
      if(M.in>=M.need) mgEnd(true); M.msg=(ok?'Bien… ':'¡Fuera de la zona! ')+M.in.toFixed(1)+' / '+M.need+' s'; },
    draw(M,A){ const cx=A.x+A.w/2, cy=A.y+A.h*0.72, R=Math.min(A.w*0.4,A.h*0.6);
      ctx.lineWidth=26; ctx.strokeStyle='#352'; ctx.beginPath(); ctx.arc(cx,cy,R,Math.PI,0); ctx.stroke();
      ctx.strokeStyle='#3fa04f'; ctx.beginPath(); ctx.arc(cx,cy,R,Math.PI+Math.PI*(0.5-M.zw/2),Math.PI+Math.PI*(0.5+M.zw/2)); ctx.stroke();
      const a=Math.PI+Math.PI*M.v; ctx.strokeStyle='#fff'; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(a)*R*1.05,cy+Math.sin(a)*R*1.05); ctx.stroke();
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(cx,cy,10,0,7); ctx.fill(); bar(A.x+60,A.y+20,A.w-120,14,M.in/M.need); } },
  count:{ hint:'Haz clic en los billetes hasta sumar exactamente la cantidad pedida.',
    init(M,o){ M.rounds=o.rounds||3; M.round=0; M.err=0; M.unit=o.unit||1; MG.count.next(M); },
    next(M){ M.target=(((Math.random()*40)|0)*10+40)*M.unit; M.sum=0; },
    update(M){ const A=M.A; if(!A||!mouse.clicked) return; const B=[100,50,20,10];
      B.forEach((b,i)=>{ const x=A.x+A.w*(i+1)/5, y=A.y+A.h*0.62; if(Math.abs(mouse.x-x)<70&&Math.abs(mouse.y-y)<36){ M.sum+=b*M.unit; sfx.blip();
        if(M.sum===M.target){ M.round++; sfx.cash(); if(M.round>=M.rounds) mgEnd(true); else MG.count.next(M); }
        else if(M.sum>M.target){ M.err++; M.sum=0; if(M.err>=3) mgEnd(false); } } });
      if(dist(mouse.x,mouse.y,A.x+A.w/2,A.y+A.h*0.88)<40) M.sum=0;
      M.msg='Ronda '+(M.round+1)+'/'+M.rounds+'   ·   Pasados de largo '+M.err+'/3'; },
    draw(M,A){ M.A=A; const f=n=>'$'+n.toLocaleString('en-US');
      txt('Objetivo: '+f(M.target),A.x+A.w/2,A.y+60,34,'#ffd23a','center','900 '); txt('Llevas: '+f(M.sum),A.x+A.w/2,A.y+110,28,M.sum>M.target?'#f66':'#7f7','center','800 ');
      [100,50,20,10].forEach((b,i)=>{ const x=A.x+A.w*(i+1)/5, y=A.y+A.h*0.62; ctx.fillStyle='#5a8a4a'; roundRect(x-70,y-36,140,72,6); ctx.fill(); ctx.strokeStyle='#cfe8b8'; ctx.lineWidth=2; ctx.stroke(); txt(f(b*M.unit),x,y+10,22,'#fff','center','800 '); });
      txt('[ volver a empezar ]',A.x+A.w/2,A.y+A.h*0.9,14,'#aaa','center'); } },
};
