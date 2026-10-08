"use strict";
// ======================= PANTALLA DE TÍTULO =======================
function drawTitle(t){
  ctx.setTransform(1,0,0,1,0,0);
  const g=ctx.createLinearGradient(0,0,0,VH); g.addColorStop(0,'#1d3b1f'); g.addColorStop(0.6,'#0b160c'); g.addColorStop(1,'#000');
  ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH);
  // humo
  for(let i=0;i<30;i++){ const x=(i*137+t*20)%VW, y=VH-((i*71+t*30)%VH); ctx.fillStyle='rgba(120,180,120,.04)'; ctx.beginPath(); ctx.arc(x,y,60+i%5*20,0,7); ctx.fill(); }
  const cx=VW/2, cy=VH/2-90;
  const el=(sym,num,x,y)=>{ ctx.fillStyle='#2e6b3f'; ctx.fillRect(x,y,96,96); ctx.strokeStyle='#cfe8cf'; ctx.lineWidth=2; ctx.strokeRect(x,y,96,96);
    txt(num,x+8,y+20,14,'#cfe8cf'); txt(sym,x+48,y+70,52,'#fff','center','900 '); };
  el('Br','35',cx-260,cy-60); txt('eaking',cx-160,cy+20,72,'#fff','left','900 ');
  el('Ba','56',cx-200,cy+50); txt('d',cx-100,cy+130,72,'#fff','left','900 ');
  txt('ALBUQUERQUE  —  CAPÍTULO 1: "SAY MY NAME"',cx,cy+200,18,'#9c9','center');
  const opts=hasSave()?['Continuar','Nueva partida']:['Nueva partida'];
  opts.forEach((o,i)=>{ const sel=i===titleSel%opts.length; txt((sel?'▶ ':'  ')+o,cx,cy+270+i*40,26,sel?'#ffd23a':'#ccc','center'); });
  txt('Juego fan no oficial. Contenido ficticio para mayores de 18 años.',cx,VH-30,13,'#777','center','');
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

