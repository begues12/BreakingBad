"use strict";
// ======================= PANTALLA DE TÍTULO =======================
function drawTitle(t){
  ctx.setTransform(1,0,0,1,0,0);
  const g=ctx.createLinearGradient(0,0,0,VH); g.addColorStop(0,'#1d3b1f'); g.addColorStop(0.6,'#0b160c'); g.addColorStop(1,'#000');
  ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH);
  // humo
  for(let i=0;i<30;i++){ const x=(i*137+t*20)%VW, y=VH-((i*71+t*30)%VH); ctx.fillStyle='rgba(120,180,120,.04)'; ctx.beginPath(); ctx.arc(x,y,60+i%5*20,0,7); ctx.fill(); }
  // logo medido: "Br|eaking" y debajo "Ba|d", con "Ba" desplazado como en la cabecera de la serie;
  // todo el bloque se centra con su anchura real y escala en pantallas pequeñas
  const cx=VW/2, S=Math.min(1,VW/760,VH/620), box=104*S, fs=Math.round(78*S), gap=8*S;
  ctx.font=`900 ${fs}px "Segoe UI",Arial`; const wE=ctx.measureText('eaking').width, wD=ctx.measureText('d').width;
  const shift=box*0.62;                                   // "Ba" empieza un poco más a la derecha que "Br"
  const blockW=Math.max(box+gap+wE, shift+box+gap+wD), x0=cx-blockW/2;
  const lineH=box+14*S, y0=Math.max(30, VH*0.42-lineH-20*S); // dos líneas; el bloque queda por encima del centro
  const el=(sym,num,x,y)=>{ ctx.fillStyle='#2e6b3f'; ctx.fillRect(x,y,box,box); ctx.strokeStyle='#cfe8cf'; ctx.lineWidth=2; ctx.strokeRect(x+1,y+1,box-2,box-2);
    txt(num,x+8*S,y+20*S,Math.round(15*S),'#cfe8cf','left','700 '); txt(sym,x+box/2,y+box*0.72,Math.round(56*S),'#fff','center','900 '); };
  const base=(y)=>y+box*0.78;                              // línea base del texto alineada con el símbolo
  el('Br','35',x0,y0); txt('eaking',x0+box+gap,base(y0),fs,'#fff','left','900 ');
  el('Ba','56',x0+shift,y0+lineH); txt('d',x0+shift+box+gap,base(y0+lineH),fs,'#fff','left','900 ');
  const yb=y0+lineH*2+18*S;                                // debajo del logo
  ctx.fillStyle='rgba(207,232,207,.35)'; ctx.fillRect(cx-150*S,yb,300*S,1.5);
  txt('ALBUQUERQUE, NUEVO MÉXICO',cx,yb+34*S,Math.round(18*S),'#9c9','center','700 ');
  const cy=yb+60*S-230;                                    // las opciones de abajo se colocan respecto a cy
  const opts=hasSave()?['Continuar','Nueva partida']:['Nueva partida'];
  opts.forEach((o,i)=>{ const sel=i===titleSel%opts.length, by=cy+270+i*54, bw=280;
    ctx.fillStyle=sel?'rgba(46,107,63,.9)':'rgba(0,0,0,.35)'; ctx.fillRect(cx-bw/2,by-30,bw,42); ctx.strokeStyle=sel?'#ffd23a':'rgba(207,232,207,.3)'; ctx.lineWidth=sel?2:1; ctx.strokeRect(cx-bw/2+.5,by-29.5,bw-1,41);
    txt(o,cx,by-1,22,sel?'#ffd23a':'#ddd','center','700 '); });
  txt('F9: menú de pruebas (saltar a cualquier misión)',cx,VH-54,12,'#5a7a5a','center',''); txt('Juego fan no oficial. Contenido ficticio para mayores de 18 años.',cx,VH-30,13,'#777','center','');
  if(pressed['arrowup']||pressed['w']) titleSel=(titleSel+opts.length-1)%opts.length;
  if(pressed['arrowdown']||pressed['s']) titleSel=(titleSel+1)%opts.length;
  if(pressed['enter']||pressed[' ']||mouse.clicked){
    audio();
    const ch=opts[titleSel%opts.length];
    started=true; mini=null;
    if(ch==='Continuar'){ load(); toast('Partida cargada',3); }
    else { newGame(); intro(); }
  }
}

