"use strict";
// ======================= HUD =======================
let mini=null;
function buildMini(){
  const S=0.03;
  mini=document.createElement('canvas'); mini.width=WW*S; mini.height=WH*S;
  const m=mini.getContext('2d');
  m.drawImage(groundCanvas,0,0,mini.width,mini.height);
  m.save(); m.scale(S,S); m.lineJoin='round'; m.lineCap='round';
  m.strokeStyle='#3f7d95'; m.lineWidth=RIVER_W*1.3; const rp=new Path2D(); RIVER.forEach((p,i)=>i?rp.lineTo(p[0],p[1]):rp.moveTo(p[0],p[1])); m.stroke(rp);
  m.fillStyle='rgba(90,75,60,.55)'; for(const s of solids) if(s.kind==='bld'||s.kind==='special'||s.kind==='mesa') m.fillRect(s.x,s.y,s.w,s.h);
  for(const r of ROADS){ m.strokeStyle=r.kind==='hwy'?'#e8c45a':r.kind==='main'?'#f2f2f2':r.kind==='dirt'?'#9a7a50':'#cfcfcf'; m.lineWidth=r.kind==='hwy'?150:r.kind==='main'?110:70; m.stroke(r.path); }
  m.restore();
  mini.S=S;
}
function txt(t,x,y,size,col,align,font){
  ctx.font=(font||'bold ')+size+'px "Segoe UI",Arial,sans-serif'; ctx.textAlign=align||'left'; ctx.textBaseline='alphabetic';
  ctx.fillStyle='rgba(0,0,0,.85)'; ctx.fillText(t,x+2,y+2); ctx.fillStyle=col||'#fff'; ctx.fillText(t,x,y);
}
function wrap(t,maxW){ const words=t.split(' '), lines=[]; let cur=''; for(const w of words){ const tt=cur?cur+' '+w:w; if(ctx.measureText(tt).width>maxW&&cur){lines.push(cur);cur=w;} else cur=tt; } if(cur)lines.push(cur); return lines; }

function drawHUD(t){
  const P=G.player;
  // dinero/estrellas (esquina sup. derecha, estilo GTA)
  const rx=VW-20;
  txt('$'+Math.floor(G.money).toLocaleString('en-US').padStart(9,'0'),rx,48,34,'#3dbb5c','right','800 ');
  const hh=Math.floor(G.clock/60), mm=Math.floor(G.clock%60);
  txt(String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0'),rx,82,22,'#eee','right');
  for(let i=0;i<5;i++){
    const on=i<G.wanted, blink=on&&G.evadeT>2&&Math.floor(t*4)%2;
    txt('★',rx-i*30,120,28,on?(blink?'#888':'#fff'):'rgba(255,255,255,.18)','right');
  }
  // salud / chaleco
  const bx=rx-200;
  ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(bx,132,200,12); ctx.fillStyle='#c0392b'; ctx.fillRect(bx+2,134,196*clamp(P.hp/100,0,1),8);
  if(P.armor>0){ ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(bx,148,200,8); ctx.fillStyle='#4aa3df'; ctx.fillRect(bx+2,150,196*P.armor/100,4); }
  let yy=180;
  if(P.gun){ txt('🔫 Ruger  '+P.ammo,rx,yy,18,'#ddd','right'); yy+=26; }
  if(G.product>0){ txt('Producto: '+G.product+' lb  ('+(G.purity*100).toFixed(1)+'%)',rx,yy,18,'#5ad1ff','right'); yy+=26; }
  if(G.mi>=2){
    txt('Calor DEA',rx-110,yy+4,14,'#ccc','right');
    ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(rx-100,yy-8,100,10);
    ctx.fillStyle=G.heat>70?'#e74c3c':G.heat>40?'#f39c12':'#f1c40f'; ctx.fillRect(rx-99,yy-7,98*clamp(G.heat/100,0,1),8); yy+=26;
  }
  if(P.inCar){
    const c=P.inCar; txt((c.name||(c.type==='cop'?'Coche patrulla':c.type==='dea'?'SUV de la DEA':'Sedán'))+'  '+Math.round(Math.abs(c.v)*0.16)+' mph',rx,yy,16,'#eee','right'); yy+=20;
    ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(rx-100,yy-8,100,8); ctx.fillStyle=c.hp<c.maxhp*0.3?'#e67e22':'#bbb'; ctx.fillRect(rx-99,yy-7,98*clamp(c.hp/c.maxhp,0,1),6);
  }
  // objetivo
  const S=curStep(), M=curMission();
  if(S&&S.obj&&!G.card){ ctx.font='bold 18px "Segoe UI",Arial'; const label=M.code+' · '+S.obj, w=ctx.measureText(label).width+30;
    ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(20,20,w,34); txt(label,35,43,18,'#ffd23a');
    const info=missionInfo(); if(info) txt(info,35,78,15,'#eee'); }
  drawMissionCard();

  // minimapa
  if(!mini) buildMini();
  const MS=200, mx=20, my=VH-MS-20, S2=mini.S;
  ctx.save(); ctx.beginPath(); ctx.arc(mx+MS/2,my+MS/2,MS/2,0,7); ctx.clip();
  ctx.fillStyle='#000'; ctx.fillRect(mx,my,MS,MS);
  const zoom=2.2;
  ctx.translate(mx+MS/2,my+MS/2); ctx.scale(zoom,zoom); ctx.translate(-P.x*S2,-P.y*S2);
  ctx.drawImage(mini,0,0);
  if(G.gps){ ctx.strokeStyle='#ff4fa0'; ctx.lineWidth=2.2/zoom*2; ctx.lineJoin='round'; ctx.stroke(gpsPath(S2)); }
  for(const m of activeMarkers()){ ctx.fillStyle=m.main?'#ffd23a':m.col; ctx.beginPath(); ctx.arc(m.x*S2,m.y*S2,m.main?5/zoom*2:3/zoom*2,0,7); ctx.fill(); }
  for(const c of G.cars){ if(c.driver==='cop'){ ctx.fillStyle=Math.floor(t*6)%2?'#f33':'#36f'; ctx.fillRect(c.x*S2-2,c.y*S2-2,4,4); } else if(c.owned&&c!==P.inCar){ ctx.fillStyle='#9f9'; ctx.fillRect(c.x*S2-1.5,c.y*S2-1.5,3,3); } }
  for(const th of G.thugs){ ctx.fillStyle='#f00'; ctx.fillRect(th.x*S2-1.5,th.y*S2-1.5,3,3); }
  for(const o of G.officers){ ctx.fillStyle='#4af'; ctx.fillRect(o.x*S2-1.5,o.y*S2-1.5,3,3); }
  ctx.restore();
  ctx.strokeStyle='rgba(0,0,0,.8)'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(mx+MS/2,my+MS/2,MS/2,0,7); ctx.stroke();
  ctx.save(); ctx.translate(mx+MS/2,my+MS/2); ctx.rotate(P.a); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.moveTo(8,0); ctx.lineTo(-6,-5); ctx.lineTo(-6,5); ctx.fill(); ctx.restore();
  // destino del GPS
  if(G.waypoint){ const W=G.waypoint, a=Math.atan2(W.y-P.y,W.x-P.x), d=dist(W.x,W.y,P.x,P.y), rr=Math.min(MS/2-10,d*S2*zoom);
    ctx.save(); ctx.translate(mx+MS/2+Math.cos(a)*rr,my+MS/2+Math.sin(a)*rr); ctx.fillStyle='#ff4fa0'; ctx.strokeStyle='#fff'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(0,0,5,0,7); ctx.fill(); ctx.stroke(); ctx.restore();
    txt(Math.round(d/10)+' m',mx+MS-4,my+MS+2,13,'#ff8cc4','right'); }
  // flecha al objetivo si está fuera del minimapa
  const MT=missionTarget();
  if(MT){ const L=MT; const a=Math.atan2(L.y-P.y,L.x-P.x), d=dist(L.x,L.y,P.x,P.y);
    if(d*S2*zoom>MS/2-6){ ctx.save(); ctx.translate(mx+MS/2+Math.cos(a)*(MS/2-10),my+MS/2+Math.sin(a)*(MS/2-10)); ctx.rotate(a); ctx.fillStyle='#ffd23a'; ctx.beginPath(); ctx.moveTo(8,0); ctx.lineTo(-6,-6); ctx.lineTo(-6,6); ctx.fill(); ctx.restore(); }
    txt(Math.round(d/10)+' m',mx+MS/2,my-6,14,'#ffd23a','center');
  }

  // ayuda contextual
  if(!G.dialog && !G.cook && !G.dead){
    const m=nearMarker();
    let hint=null;
    if(m && !P.inCar) hint='E — '+(m.name||'Interactuar');
    else if(m && P.inCar) hint='E — '+(m.name||'Interactuar')+'   ·   F — Bajar';
    else if(!P.inCar){ for(const c of G.cars) if(!c.burnt&&dist(c.x,c.y,P.x,P.y)<60){ hint='E — Subir al vehículo'+(c.owned?'':' (robar)'); break; } }
    if(hint){ ctx.font='bold 18px sans-serif'; const w=ctx.measureText(hint).width+30; ctx.fillStyle='rgba(0,0,0,.7)'; ctx.fillRect(VW/2-w/2,VH-200,w,36); txt(hint,VW/2,VH-176,18,'#fff','center'); }
  }
  if(G.msgT>0){ ctx.globalAlpha=clamp(G.msgT,0,1); ctx.font='bold 20px sans-serif'; const w=ctx.measureText(G.msg).width+40; ctx.fillStyle='rgba(0,0,0,.75)'; ctx.fillRect(VW/2-w/2,90,w,42); txt(G.msg,VW/2,118,20,'#ffd23a','center'); ctx.globalAlpha=1; }
  if(G.bustT>0.3){ txt('¡LA POLICÍA TE ESTÁ DETENIENDO! ¡HUYE!',VW/2,170,24,'#f55','center'); }

  if(G.dead){
    ctx.fillStyle='rgba(0,0,0,.45)'; ctx.fillRect(0,0,VW,VH);
    txt(G.dead==='wasted'?'HAS MUERTO':'ARRESTADO',VW/2,VH/2,72,G.dead==='wasted'?'#c0392b':'#5dade2','center','900 ');
  }
  if(G.cook) drawCook(t);
  if(G.dialog) drawDialog(t);
}

function drawDialog(t){
  const D=G.dialog, L=D.lines[D.i]; if(!L) return;
  const W=Math.min(980,VW-40), H=L.choices?60+L.choices.length*46:170, x=(VW-W)/2, y=VH-H-30;
  ctx.fillStyle='rgba(8,10,12,.88)'; roundRect(x,y,W,H,10); ctx.fill();
  ctx.strokeStyle='rgba(120,200,120,.5)'; ctx.lineWidth=2; ctx.stroke();
  G._choiceRects=null;
  if(L.choices){
    txt('Elige:',x+24,y+36,18,'#9c9');
    G._choiceRects=[];
    L.choices.forEach((c,i)=>{
      const ry=y+50+i*46, sel=i===D.choiceSel || (mouse.x>x+20&&mouse.x<x+W-20&&mouse.y>ry&&mouse.y<ry+40);
      ctx.fillStyle=sel?'rgba(70,160,90,.45)':'rgba(255,255,255,.07)'; roundRect(x+20,ry,W-40,40,6); ctx.fill();
      txt((i+1)+'.  '+c[0],x+36,ry+27,18,sel?'#fff':'#ddd');
      G._choiceRects.push({x:x+20,y:ry,w:W-40,h:40,i});
    });
    return;
  }
  const ch=CHAR[L[0]]||CHAR.N;
  let tx=x+24;
  if(ch.i){
    drawPortrait(L[0],x+70,y+88,58,(D.ch|0)<L[1].length,t);
    tx=x+140;
    txt(ch.n,tx,y+38,20,ch.c==='#000'?'#fff':lighten(ch.c));
  }
  ctx.font=(ch.i?'':'italic ')+'20px "Segoe UI",Arial';
  const shown=L[1].slice(0,D.ch|0);
  const lines=wrap(shown,x+W-tx-24);
  lines.forEach((ln,i)=>txt(ln,tx,y+(ch.i?72:50)+i*27,20,ch.i?'#f2f2f2':'#e8d9a8','left',ch.i?'':'italic '));
  if((D.ch|0)>=L[1].length && Math.floor(t*2)%2) txt('▼ ESPACIO',x+W-24,y+H-16,13,'#9c9','right');
}
function lighten(c){ return c; }

