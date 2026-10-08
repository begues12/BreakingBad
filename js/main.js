"use strict";
// ======================= BUCLE =======================
let last=performance.now(); const DBG={u:0,d:0,n:0}; let BENCH=null;
function loop(now){
  if(BENCH&&started&&!paused){ // prueba de rendimiento real (con requestAnimationFrame, como al jugar)
    const P=G.player, el=now-BENCH.t0; if(el>4000) BENCH.dir=-9; P.x+=BENCH.dir; P.z=spawnZ(P.x,P.y);
    if(BENCH.last) BENCH.gap.push(now-BENCH.last); BENCH.last=now;
    if(el>8000){ const st=v=>{ const s=[...v].sort((x,y)=>x-y); return 'media '+(v.reduce((x,y)=>x+y,0)/v.length).toFixed(2)+' · p95 '+s[Math.floor(s.length*0.95)].toFixed(2)+' · p99 '+s[Math.floor(s.length*0.99)].toFixed(2)+' · máx '+s[s.length-1].toFixed(2);};
      console.log('BENCH trabajo por frame (ms): '+st(BENCH.work)); console.log('BENCH intervalo entre frames (ms): '+st(BENCH.gap)+' · frames '+BENCH.gap.length); window.BENCH_RESULT='trabajo '+st(BENCH.work)+' | intervalo '+st(BENCH.gap)+' | frames '+BENCH.gap.length; BENCH=null; }
  }
  const w0=performance.now();
  const dt=Math.min(0.05,(now-last)/1000); last=now;
  const t=now/1000;
  if(!started){ drawTitle(t); }
  else {
    if(pressed['p']||pressed['escape']||pressed['m']){ paused=!paused; if(!paused) closePauseMap(); }
    if(paused) drawPauseMap(t);
    else { const f0=performance.now(); update(dt); const f1=performance.now(); draw(t); const f2=performance.now();
      if(G.camLock){ DBG.u=DBG.u*0.9+(f1-f0)*0.1; DBG.d=DBG.d*0.9+(f2-f1)*0.1; DBG.n++; txt('update '+DBG.u.toFixed(1)+' ms · draw '+DBG.d.toFixed(1)+' ms · frames '+DBG.n,VW/2,VH-30,16,'#0f0','center'); } }
  }
  if(BENCH) BENCH.work.push(performance.now()-w0);
  for(const k in pressed) delete pressed[k];
  mouse.clicked=false; mouse.rclicked=false; mouse.wheel=0;
  requestAnimationFrame(loop);
}
// depuración: index.html#debug&at=x,y[&z=zoom][&clock=minutos] arranca directamente en ese punto
if(/[?&#]debug/.test(location.search+location.hash)){
  const q=new URLSearchParams(location.search.slice(1)+'&'+location.hash.slice(1)); started=true; newGame();
  const at=(q.get('at')||'').split(',').map(Number);
  if(at.length===2&&!isNaN(at[0])){ const P=G.player; P.x=at[0]; P.y=at[1]; P.z=spawnZ(at[0],at[1]); for(const c of G.cars) if(c.owned){ c.x=P.x+60; c.y=P.y; c.z=spawnZ(c.x,c.y); } }
  if(q.get('clock')) G.clock=+q.get('clock');
  if(q.has('bench')) BENCH={t0:performance.now(),dir:9,work:[],gap:[],last:0};   // ver loop(): 8 s conduciendo de verdad
  if(q.get('cine')){ const sc=CUTSCENES[q.get('cine')]; const si=+(q.get('scene')||0), sh=+(q.get('shot')||0); playCutscene(sc.slice(si,si+1)); G.cine.shi=sh; G.cine.t=+(q.get('t')||1.2); G.cine.hold=true; }
  if(q.get('inside')){ const k=q.get('inside'); G.player.inCar=null; enterInterior(k); if(q.get('floor')){ G.inside.f=+q.get('floor'); const F=INTERIORS[k].floorsB[G.inside.f]; G.player.x=F.W*ICELL/2; G.player.y=F.H*ICELL/2; } }
  if(q.get('z')){ cam.z=+q.get('z'); G.camLock=true; }
  cam.x=G.player.x-VW/cam.z/2; cam.y=G.player.y-VH/cam.z/2;
}
requestAnimationFrame(loop);
