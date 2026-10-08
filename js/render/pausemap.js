"use strict";
// ======================= MAPA DE PAUSA + GPS =======================
// En pausa se abre el mapa completo: clic = marcar destino, rueda = zoom, arrastrar = mover,
// clic derecho = quitar destino. La ruta se dibuja en el mapa, el minimapa y la calzada.

const PMAP={z:1,cx:null,cy:null,drag:null};

function setWaypoint(x,y){
  const nr=nearestRoad(x,y,r=>r.kind!=='hwy');
  G.waypoint={x:nr.x,y:nr.y}; G.gps=null; G.gpsT=0;
  beep(880,0.06,'square',0.03);
}
// recalcula la ruta GPS cada segundo; se borra al llegar
function updateGPS(dt){
  const W=G.waypoint, P=G.player; if(!W) return;
  if(dist(P.x,P.y,W.x,W.y)<90){ G.waypoint=null; G.gps=null; toast('Has llegado a tu destino',2); return; }
  G.gpsT=(G.gpsT||0)-dt;
  if(!G.gps||G.gpsT<=0){ G.gps=navRoute(P.x,P.y,P.layer||0,W.x,W.y,0); G.gpsT=1; }
}
function gpsPath(scale){
  const p=new Path2D(), P=G.player; p.moveTo(P.x*scale,P.y*scale);
  for(const [x,y] of G.gps) p.lineTo(x*scale,y*scale); return p;
}
// línea de ruta sobre la calzada (en coordenadas de mundo)
function drawGPSWorld(t){
  if(!G.gps) return;
  ctx.save(); ctx.lineJoin='round'; ctx.lineCap='round';
  ctx.strokeStyle='rgba(255,210,58,.35)'; ctx.lineWidth=10; ctx.setLineDash([22,18]); ctx.lineDashOffset=-t*60; ctx.stroke(gpsPath(1));
  ctx.restore();
}

function drawPauseMap(t){
  if(!mini) buildMini();
  const S2=mini.S, P=G.player;
  const fit=Math.min(VW/(mini.width+40),VH/(mini.height+40));
  if(PMAP.cx===null){ PMAP.cx=P.x*S2; PMAP.cy=P.y*S2; PMAP.z=Math.max(fit,2); }
  // zoom con la rueda (hacia el cursor)
  if(mouse.wheel){ const k=Math.exp(-mouse.wheel*0.0015), nz=clamp(PMAP.z*k,fit,8);
    const wx=PMAP.cx+(mouse.x-VW/2)/PMAP.z, wy=PMAP.cy+(mouse.y-VH/2)/PMAP.z;
    PMAP.z=nz; PMAP.cx=wx-(mouse.x-VW/2)/nz; PMAP.cy=wy-(mouse.y-VH/2)/nz; mouse.wheel=0; }
  // arrastrar para mover; clic sin arrastre = destino
  if(mouse.clicked) PMAP.drag={x:mouse.x,y:mouse.y,cx:PMAP.cx,cy:PMAP.cy,moved:false};
  if(PMAP.drag&&mouse.down){ const dx=mouse.x-PMAP.drag.x, dy=mouse.y-PMAP.drag.y;
    if(Math.abs(dx)+Math.abs(dy)>6) PMAP.drag.moved=true;
    if(PMAP.drag.moved){ PMAP.cx=PMAP.drag.cx-dx/PMAP.z; PMAP.cy=PMAP.drag.cy-dy/PMAP.z; } }
  if(PMAP.drag&&!mouse.down){
    if(!PMAP.drag.moved){ setWaypoint((PMAP.cx+(mouse.x-VW/2)/PMAP.z)/S2,(PMAP.cy+(mouse.y-VH/2)/PMAP.z)/S2); updateGPS(0); }
    PMAP.drag=null; }
  if(mouse.rclicked){ G.waypoint=null; G.gps=null; mouse.rclicked=false; }
  PMAP.cx=clamp(PMAP.cx,0,mini.width); PMAP.cy=clamp(PMAP.cy,0,mini.height);

  ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle='#14110d'; ctx.fillRect(0,0,VW,VH);
  ctx.save(); ctx.translate(VW/2,VH/2); ctx.scale(PMAP.z,PMAP.z); ctx.translate(-PMAP.cx,-PMAP.cy);
  ctx.imageSmoothingEnabled=true; ctx.drawImage(mini,0,0);
  const u=1/PMAP.z; // 1 px de pantalla
  if(G.gps){ ctx.strokeStyle='#ffd23a'; ctx.lineWidth=4*u; ctx.lineJoin='round'; ctx.stroke(gpsPath(S2)); }
  // lugares
  ctx.textAlign='center'; ctx.font=`bold ${12*u}px "Segoe UI",Arial`;
  for(const k in LOC){ const L=LOC[k]; ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(L.x*S2,L.y*S2,4*u,0,7); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.7)'; ctx.fillText(L.name,L.x*S2+u,L.y*S2-8*u+u); ctx.fillStyle='#fff'; ctx.fillText(L.name,L.x*S2,L.y*S2-8*u); }
  for(const m of activeMarkers()){ ctx.fillStyle=m.main?'#ffd23a':m.col; ctx.beginPath(); ctx.arc(m.x*S2,m.y*S2,(m.main?7:5)*u,0,7); ctx.fill(); }
  if(G.waypoint){ const x=G.waypoint.x*S2, y=G.waypoint.y*S2; // chincheta
    ctx.fillStyle='#ff4fa0'; ctx.beginPath(); ctx.arc(x,y-14*u,7*u,0,7); ctx.moveTo(x-6*u,y-11*u); ctx.lineTo(x,y); ctx.lineTo(x+6*u,y-11*u); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x,y-14*u,2.5*u,0,7); ctx.fill(); }
  // jugador
  ctx.save(); ctx.translate(P.x*S2,P.y*S2); ctx.rotate(P.a); ctx.scale(u,u);
  ctx.fillStyle='#fff'; ctx.strokeStyle='#000'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(11,0); ctx.lineTo(-8,-7); ctx.lineTo(-8,7); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore();
  ctx.restore();

  // cabecera y ayuda
  ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(0,0,VW,54); ctx.fillRect(0,VH-36,VW,36);
  txt('PAUSA · MAPA',24,36,24,'#ffd23a','left','900 ');
  if(G.waypoint) txt('Destino a '+Math.round(dist(P.x,P.y,G.waypoint.x,G.waypoint.y)/10)+' m',VW-24,34,16,'#ff8cc4','right');
  txt('Clic: marcar destino   ·   Clic derecho: quitar   ·   Rueda: zoom   ·   Arrastrar: mover   ·   P / ESC: continuar',VW/2,VH-13,14,'#ddd','center');
}
function closePauseMap(){ PMAP.cx=null; PMAP.drag=null; }
