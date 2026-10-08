"use strict";
// ======================= INPUT =======================
const keys={}, pressed={};
let mouse={x:0,y:0,down:false,clicked:false,rclicked:false,wheel:0};
addEventListener('keydown',e=>{ const k=e.key.toLowerCase(); if(!keys[k]) pressed[k]=true; keys[k]=true; if([' ','arrowup','arrowdown','arrowleft','arrowright','f9','pageup','pagedown','tab'].includes(k)) e.preventDefault(); });
addEventListener('keyup',e=>{ keys[e.key.toLowerCase()]=false; });
cv.addEventListener('mousemove',e=>{ mouse.x=e.clientX; mouse.y=e.clientY; });
cv.addEventListener('mousedown',e=>{ if(e.button===2){ mouse.rclicked=true; return; } mouse.down=true; mouse.clicked=true; });
cv.addEventListener('wheel',e=>{ mouse.wheel+=e.deltaY; e.preventDefault(); },{passive:false});
addEventListener('mouseup',()=>mouse.down=false);
cv.addEventListener('contextmenu',e=>e.preventDefault());

