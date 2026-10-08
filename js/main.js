"use strict";
// ======================= BUCLE =======================
let last=performance.now();
function loop(now){
  const dt=Math.min(0.05,(now-last)/1000); last=now;
  const t=now/1000;
  if(!started){ drawTitle(t); }
  else {
    if(pressed['p']||pressed['escape']||pressed['m']){ paused=!paused; if(!paused) closePauseMap(); }
    if(paused) drawPauseMap(t);
    else { update(dt); draw(t); }
  }
  for(const k in pressed) delete pressed[k];
  mouse.clicked=false; mouse.rclicked=false; mouse.wheel=0;
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
