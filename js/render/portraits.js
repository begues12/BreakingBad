"use strict";
// ======================= RETRATOS DIBUJADOS =======================
const LOOK = {
  W: {skin:'#e7bf9c',hair:'baldsides',hc:'#8f857a',eyes:'#5f7a80',glasses:'rect',beard:'goatee',bc:'#7a5c42',bc2:'#a89888',
      outfit:'plaidjacket',cloth:'#2c2a28',shirt:'#e6e8ee',check:'#5b74a8',hw:22,hh:30,jaw:14,wrinkles:3,brow:'#7a6a5a',browA:0.12,thinLips:true},
  J: {skin:'#efcdb0',hair:'spiky',hc:'#8a6c48',eyes:'#4f95c8',beard:'stubble',bc:'#9a7650',outfit:'tee',cloth:'#151515',
      hw:20,hh:28,jaw:12,brow:'#7a5a3a',browA:0.24,thinLips:true},
  S: {skin:'#f0cfb6',hair:'bob',hc:'#d2aa6c',eyes:'#6a9ab5',outfit:'tee',cloth:'#1d1d22',lips:'#b46a62',earrings:true,
      hw:20,hh:27,jaw:10,brow:'#a98250',browA:0.04,female:true},
  H: {skin:'#e0a988',hair:'bald',eyes:'#5a6a60',outfit:'suit',cloth:'#4f4234',shirt:'#e2d6b2',tie:'#6a2a2a',tieStripe:'#c0b090',
      hw:25,hh:30,jaw:19,wrinkles:2,brow:'#6a5040',browA:0.22,thick:true,thinLips:true},
  SA:{skin:'#e6b998',hair:'swept',hc:'#5e4430',eyes:'#5a4632',outfit:'suit',cloth:'#2c2828',shirt:'#e39c84',tie:'#c8a040',tieStripe:'#7a5a20',
      hw:21,hh:30,jaw:13,wrinkles:2,brow:'#4e3828',browA:-0.06,smirk:true,thinLips:true},
  T: {skin:'#b47a52',hair:'buzz',hc:'#121010',eyes:'#24160e',beard:'stubble',bc:'#2a1e16',outfit:'chainshirt',cloth:'#efe9da',pendant:true,
      hw:24,hh:29,jaw:19,brow:'#141010',browA:0.34,thick:true,wrinkles:2,thinLips:true},
  G: {skin:'#6e4630',hair:'receding',hc:'#2e2a28',eyes:'#24160e',glasses:'gus',beard:'stubble',bc:'#8a8480',outfit:'suit',cloth:'#62818c',shirt:'#a9c7e2',tie:'#2a333d',tieStripe:'#4a5560',
      hw:21,hh:30,jaw:12,wrinkles:2,brow:'#2a2420',browA:0.03},
  WJ:{skin:'#ecc9a8',hair:'shaggy',hc:'#4e3420',eyes:'#5a4030',outfit:'plaidopen',cloth:'#7a3a32',shirt:'#5e5e60',check:'#3a4a6a',hw:20,hh:28,jaw:12,brow:'#4a3020',browA:0.02},
  D: {skin:'#e6c09a',hair:'short',hc:'#8a7050',eyes:'#4a5a60',beard:'stubble',bc:'#8a7050',outfit:'jacket',cloth:'#3a3a3a',shirt:'#777',hw:21,hh:28,jaw:13,brow:'#6a5038',browA:0.1},
  M: {skin:'#e2b896',hair:'bald',eyes:'#5a6a70',outfit:'jacket',cloth:'#8a8270',shirt:'#c9c2ae',hw:23,hh:30,jaw:16,wrinkles:3,brow:'#a09080',browA:0.18,thinLips:true},
  HE:{skin:'#b07a58',hair:'bald',eyes:'#2a1a10',outfit:'shirttie',cloth:'#3a3a40',shirt:'#e8e4da',tie:'#2a2a2a',tieStripe:'#444',hw:22,hh:29,jaw:15,wrinkles:3,brow:'#d8d0c8',browA:0.32,thick:true},
  GA:{skin:'#ecc8aa',hair:'wavy',hc:'#3a2a20',eyes:'#3a4a3a',glasses:'wire',beard:'stubble',bc:'#4a3a2a',outfit:'striped',cloth:'#7a8a6a',shirt:'#cfd6c0',hw:20,hh:29,jaw:12,brow:'#3a2a20',browA:0.02},
  JA:{skin:'#f2d4bc',hair:'bob',hc:'#1a1414',eyes:'#4a3a30',outfit:'tank',cloth:'#1a1a1a',lips:'#9a4a4a',hw:19,hh:27,jaw:10,brow:'#1a1414',browA:0.06,female:true},
  MA:{skin:'#efccb0',hair:'bob',hc:'#5a3a2a',eyes:'#5a6a50',outfit:'blouse',cloth:'#6a3a8a',lips:'#9a4a7a',earrings:true,hw:20,hh:27,jaw:10,brow:'#5a3a2a',browA:0.04,female:true},
  TO:{skin:'#eccaaa',hair:'short',hc:'#6a5040',eyes:'#4a6a8a',outfit:'jacket',cloth:'#4a5a3a',shirt:'#8a8a7a',hw:20,hh:28,jaw:13,brow:'#6a5040',browA:0},
  JK:{skin:'#dcb08e',hair:'buzz',hc:'#9a9890',eyes:'#4a4a40',beard:'mustache',bc:'#9a9890',outfit:'jacket',cloth:'#2a2a2a',shirt:'#5a5a5a',hw:22,hh:29,jaw:15,wrinkles:3,brow:'#8a8880',browA:0.2},
  LY:{skin:'#f0d4c0',hair:'bob',hc:'#3a2a20',eyes:'#4a5a6a',outfit:'blouse',cloth:'#9a8aaa',lips:'#a06070',hw:19,hh:28,jaw:9,brow:'#3a2a20',browA:0.1,female:true},
  K8:{skin:'#c8956a',hair:'short',hc:'#141010',eyes:'#2a1a10',beard:'fullshort',bc:'#1e1612',outfit:'vest',cloth:'#c9a030',shirt:'#f4f2ec',hw:21,hh:29,jaw:14,brow:'#141010',browA:0.12},
  EM:{skin:'#d2a47c',hair:'beanie',hc:'#18181a',eyes:'#1e1610',narrow:true,beard:'goatee',bc:'#1e1814',outfit:'tank',cloth:'#3a3d44',tattoo:true,cord:true,hw:21,hh:29,jaw:15,brow:'#1e1814',browA:0.26},
  GR:{skin:'#f0d0b8',hair:'bob',hc:'#8a5a3a',eyes:'#4a6a7a',outfit:'blouse',cloth:'#c8b8a8',lips:'#b07070',earrings:true,hw:20,hh:28,jaw:10,brow:'#8a5a3a',browA:0.04,female:true},
  EL:{skin:'#ecc8ac',hair:'short',hc:'#6a6058',eyes:'#4a5a6a',beard:'stubble',bc:'#7a7068',outfit:'suit',cloth:'#3a3a40',shirt:'#e8e8ee',tie:'#6a7a8a',tieStripe:'#8a9aaa',hw:21,hh:29,jaw:13,brow:'#6a6058',browA:0.06},
  BA:{skin:'#eccaaa',hair:'cap',hc:'#3a3a3a',eyes:'#4a3a2a',beard:'stubble',bc:'#8a6a4a',outfit:'tee',cloth:'#5a6a3a',hw:21,hh:28,jaw:13,brow:'#6a5040',browA:0.06},
  SP:{skin:'#eccaaa',hair:'cap',hc:'#2a2a2a',eyes:'#3a4a5a',beard:'stubble',bc:'#6a5040',outfit:'jacket',cloth:'#2a2a2a',shirt:'#5a5a5a',hw:19,hh:29,jaw:12,brow:'#4a3a2a',browA:0.1},
  AN:{skin:'#c8946c',hair:'bob',hc:'#1a1410',eyes:'#3a2a20',outfit:'blouse',cloth:'#c86a6a',lips:'#a05050',earrings:true,hw:19,hh:27,jaw:10,brow:'#1a1410',browA:0.04,female:true},
  VI:{skin:'#c09070',hair:'buzz',hc:'#2a2420',eyes:'#2a2420',outfit:'shirttie',cloth:'#3a3a3a',shirt:'#2a2a2a',tie:'#1a1a1a',tieStripe:'#333333',hw:22,hh:29,jaw:15,brow:'#2a2420',browA:0.12},
  TE:{skin:'#ecc8ac',hair:'swept',hc:'#8a6a4a',eyes:'#4a6a8a',outfit:'suit',cloth:'#3a4a6a',shirt:'#e8e8f0',tie:'#8a2a3a',tieStripe:'#c08090',hw:21,hh:29,jaw:13,brow:'#8a6a4a',browA:0},
  HU:{skin:'#5a3a28',hair:'bald',eyes:'#1a1410',outfit:'jacket',cloth:'#2a2a2a',shirt:'#eeeeee',hw:26,hh:30,jaw:20,brow:'#1a1410',browA:0.06,thick:true},
  GO:{skin:'#c8946c',hair:'short',hc:'#1a1410',eyes:'#2a1a10',beard:'mustache',bc:'#1a1410',outfit:'shirttie',cloth:'#4a5a6a',shirt:'#e8e8ee',tie:'#2a3a5a',tieStripe:'#4a5a7a',hw:22,hh:29,jaw:15,brow:'#1a1410',browA:0.1},
  PR:{skin:'#b07a58',hair:'shaved',eyes:'#1a1410',outfit:'suit',cloth:'#c8c4bc',shirt:'#e8e4dc',tie:'#c8c4bc',tieStripe:'#b0aca4',hw:23,hh:30,jaw:16,brow:'#1a1410',browA:0.3,thick:true},
  DO:{skin:'#e8c8ac',hair:'receding',hc:'#9a9088',eyes:'#4a5a6a',glasses:'thick',outfit:'shirttie',cloth:'#5a5a5a',shirt:'#e0e0e8',tie:'#4a4a6a',tieStripe:'#6a6a8a',hw:21,hh:29,jaw:13,wrinkles:3,brow:'#9a9088',browA:0.1},
  SH:{skin:'#dcb08e',hair:'cap',hc:'#5a5030',eyes:'#4a4a40',beard:'mustache',bc:'#6a5a40',outfit:'shirttie',cloth:'#8a7a4a',shirt:'#c8b88a',tie:'#4a3a20',tieStripe:'#6a5a30',hw:23,hh:29,jaw:16,brow:'#6a5a40',browA:0.1},
  BG:{skin:'#e8c4a4',hair:'swept',hc:'#2a2420',eyes:'#4a4a3a',outfit:'shirttie',cloth:'#3a3a40',shirt:'#e8e8e0',tie:'#6a2a2a',tieStripe:'#8a3a3a',hw:22,hh:30,jaw:14,brow:'#1a1410',browA:0.36,thick:true,wrinkles:2},
  HA:{skin:'#c08a64',hair:'short',hc:'#2a2420',eyes:'#2a2420',beard:'mustache',bc:'#2a2420',outfit:'tee',cloth:'#4a5a6a',hw:22,hh:29,jaw:15,brow:'#2a2420',browA:0.05},
  OJ:{skin:'#c89070',hair:'receding',hc:'#c8c4bc',eyes:'#3a2a20',beard:'goatee',bc:'#d8d4cc',outfit:'tee',cloth:'#6a5a40',hw:23,hh:29,jaw:15,wrinkles:3,brow:'#c8c4bc',browA:0.04},
  CL:{skin:'#d8b090',hair:'short',hc:'#3a2a20',eyes:'#3a3a30',beard:'stubble',bc:'#3a2a20',outfit:'tee',cloth:'#5a4a40',hw:23,hh:29,jaw:16,brow:'#3a2a20',browA:0.1},
  CO:{skin:'#b88660',hair:'cap',hc:'#2a2a2a',eyes:'#2a1a10',beard:'stubble',bc:'#2a2420',outfit:'tee',cloth:'#2a2a3a',hw:20,hh:28,jaw:12,brow:'#2a2420',browA:0.05},
  KW:{skin:'#eccaaa',hair:'swept',hc:'#6a5040',eyes:'#4a6a8a',outfit:'suit',cloth:'#1a1a1e',shirt:'#e8e8f0',tie:'#2a3a6a',tieStripe:'#4a5a8a',hw:21,hh:29,jaw:14,brow:'#6a5040',browA:-0.08,smirk:true},
  FR:{skin:'#eccaaa',hair:'bob',hc:'#2a1a14',eyes:'#4a3a30',outfit:'blouse',cloth:'#7a5a6a',lips:'#a04a5a',earrings:true,hw:20,hh:28,jaw:10,brow:'#2a1a14',browA:0.12,female:true},
  KE:{skin:'#eccaaa',hair:'short',hc:'#8a6a4a',eyes:'#4a6a7a',glasses:'wire',outfit:'jacket',cloth:'#6a7a5a',shirt:'#e8e0d0',hw:21,hh:28,jaw:13,brow:'#8a6a4a',browA:0},
  GM:{skin:'#e8c4a4',hair:'short',hc:'#8a8480',eyes:'#4a5a6a',outfit:'suit',cloth:'#2a3040',shirt:'#e8e8f0',tie:'#5a2a2a',tieStripe:'#7a3a3a',hw:22,hh:30,jaw:14,brow:'#8a8480',browA:0.06,wrinkles:2},
  KA:{skin:'#f0d4bc',hair:'bob',hc:'#c8a060',eyes:'#4a6a8a',outfit:'tee',cloth:'#e87aa8',hw:18,hh:24,jaw:8,brow:'#c8a060',browA:0,female:true},
  LA:{skin:'#e0b896',hair:'short',hc:'#5a4a3a',eyes:'#4a4a3a',beard:'stubble',bc:'#5a4a3a',outfit:'jacket',cloth:'#5a4a30',shirt:'#8a8a7a',hw:22,hh:29,jaw:15,brow:'#5a4a3a',browA:0.08},
  DW:{skin:'#ecc8ac',hair:'receding',hc:'#7a6a5a',eyes:'#4a5a6a',glasses:'wire',outfit:'suit',cloth:'#4a4a50',shirt:'#e8e8f0',tie:'#6a6a2a',tieStripe:'#8a8a3a',hw:21,hh:29,jaw:13,brow:'#7a6a5a',browA:0.1},
  BR:{skin:'#c8946c',hair:'buzz',hc:'#2a1a14',eyes:'#2a1a14',outfit:'tee',cloth:'#3a6aa0',hw:18,hh:24,jaw:9,brow:'#2a1a14',browA:0},
  X: {skin:'#d9b08c',hair:'short',hc:'#3a3a3a',eyes:'#3a3a3a',outfit:'jacket',cloth:'#333333',shirt:'#555555',hw:21,hh:28,jaw:13,brow:'#3a3a3a',browA:0.1},
  V: {skin:'#d9b08c',hair:'cap',hc:'#a22',eyes:'#4a3020',beard:'mustache',bc:'#4a3a2a',outfit:'tee',cloth:'#6a6a6a',hw:22,hh:28,jaw:14,brow:'#4a3a2a',browA:0},
};

function headPath(w,h,jaw){
  ctx.beginPath();
  ctx.moveTo(0,-h);
  ctx.bezierCurveTo(w*0.75,-h, w*1.02,-h*0.62, w,-h*0.08);
  ctx.bezierCurveTo(w*0.98,h*0.45, jaw*1.05,h*0.88, 0,h);
  ctx.bezierCurveTo(-jaw*1.05,h*0.88, -w*0.98,h*0.45, -w,-h*0.08);
  ctx.bezierCurveTo(-w*1.02,-h*0.62, -w*0.75,-h, 0,-h);
  ctx.closePath();
}
function eyeShape(x,y,L,t,id){
  const blink=(Math.floor(t*10+id.length*7)%42)===0;
  // cuenca/sombra
  ctx.fillStyle='rgba(90,50,30,.13)'; ctx.beginPath(); ctx.ellipse(x,y-0.5,6.5,4.2,0,0,7); ctx.fill();
  if(blink){ ctx.strokeStyle='rgba(60,30,20,.8)'; ctx.lineWidth=1.3; ctx.beginPath(); ctx.moveTo(x-5,y); ctx.quadraticCurveTo(x,y+1.5,x+5,y); ctx.stroke(); return; }
  ctx.save();
  const eh=L.narrow?0.6:1; ctx.beginPath(); ctx.moveTo(x-5.2,y); ctx.quadraticCurveTo(x,y-(L.female?4.2:3.6)*eh,x+5.2,y); ctx.quadraticCurveTo(x,y+2.8*eh,x-5.2,y); ctx.closePath();
  ctx.fillStyle='#f4efe8'; ctx.fill(); ctx.clip();
  ctx.fillStyle=L.eyes; ctx.beginPath(); ctx.arc(x,y-0.2,2.6,0,7); ctx.fill();
  ctx.fillStyle='#0c0a08'; ctx.beginPath(); ctx.arc(x,y-0.2,1.15,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(x+0.9,y-1.1,0.6,0,7); ctx.fill();
  ctx.restore();
  // párpado superior
  ctx.strokeStyle='rgba(40,20,15,.85)'; ctx.lineWidth=L.female?1.6:1.2;
  ctx.beginPath(); ctx.moveTo(x-5.4,y+0.2); ctx.quadraticCurveTo(x,y-(L.female?4.4:3.8),x+5.4,y+0.2); ctx.stroke();
  // pliegue y ojeras
  ctx.strokeStyle='rgba(90,50,35,.35)'; ctx.lineWidth=0.8;
  ctx.beginPath(); ctx.moveTo(x-4.5,y-3.2); ctx.quadraticCurveTo(x,y-5.6,x+4.5,y-3.2); ctx.stroke();
  if(L.wrinkles||id==='J'){ ctx.beginPath(); ctx.moveTo(x-4,y+2.6); ctx.quadraticCurveTo(x,y+4.4,x+4,y+2.6); ctx.stroke(); }
}

// Walter cambia a lo largo de la serie: pelo y bigote → rapado (quimio) → calvo con perilla →
// nariz vendada (4x09-4x10) → pelo y barba canosos en New Hampshire (5x15-5x16)
function walterLook(){
  const L=LOOK.W, i=(typeof G!=='undefined'&&G&&G.mi)||0, at=c=>typeof missionIdx==='function'&&typeof MISSIONS!=='undefined'?missionIdx(c):({'1x06':5,'3x01':20,'4x09':41,'4x10':42,'5x15':60})[c];
  if(i<at('1x06')) return Object.assign({},L,{hair:'walt1',hc:'#7a6650',hc2:'#a49a8c',wrinkles:3,beard:'mustache',bc:'#7a6250',bc2:null,glasses:'rect',cloth:'#7a6e52',check:'#9a8a62',browA:0.06});
  if(i<at('3x01')) return Object.assign({},L,{hair:'shaved',hc:'#8f857a',beard:'mustache',bc:'#7a6250',bc2:null,outfit:'plaidopen',cloth:'#3e6a3e',shirt:'#e8e8e0',check:'#2e5a2e'});
  if(i>=at('5x15')) return Object.assign({},L,{hair:'receding',hc:'#9a9288',beard:'goatee',bc:'#8a8278',bc2:'#b8b0a6',glasses:'thick',cloth:'#3a3530',wrinkles:3});
  return Object.assign({},L,{hair:'bald'},(i>=at('4x09')&&i<=at('4x10'))?{bandage:true}:{});
}
// estampado de eslabones en diagonal (camisa de Tuco)
function chainPattern(x,y,w,h,col){ ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip(); ctx.strokeStyle=col; ctx.lineWidth=1.1;
  for(let k=-w;k<w*1.2;k+=10){ for(let t=0;t<h*1.6;t+=5){ const cx=x+k+t*0.7, cy=y+t*0.7; ctx.beginPath(); ctx.ellipse(cx,cy,2.3,1.3,0.78,0,7); ctx.stroke(); } }
  ctx.restore(); }
function chainPatternClipTri(sd){}
let PORTRAIT_BARE=false;
let PORTRAIT_OVERRIDE=null; // cambios de ropa del retrato (cinemáticas: que el busto coincida con el cuerpo)
let PORTRAIT_HAT=null; // null: según el sitio del jugador · true/false: forzado (cinemáticas)
const HAT_BG=new Set(['desert','junkyard','warehouse','street','carpark','tohajiilee','train','diner','hacienda','office','snow']);
function walterHat(){ if(!heisLook()) return false; if(PORTRAIT_HAT!==null) return PORTRAIT_HAT; return !(typeof G!=='undefined'&&G.inside); } // true: sin marco circular ni fondo (primeros planos de las cinemáticas)
function drawPortrait(id,cx,cy,r,talking,t){
  ctx.save(); ctx.translate(cx,cy);
  ctx.beginPath(); if(PORTRAIT_BARE) ctx.rect(-r*4,-r*4,r*8,r*8); else ctx.arc(0,0,r,0,7); ctx.closePath();
  // fondo ahumado azul-gris (como un póster)
  const bg=ctx.createRadialGradient(-r*0.3,-r*0.4,r*0.1,0,0,r*1.1);
  bg.addColorStop(0,'#5a6a7a'); bg.addColorStop(0.55,'#2a3440'); bg.addColorStop(1,'#0d1117');
  if(!PORTRAIT_BARE) ctx.fillStyle=bg, ctx.fill();
  ctx.save(); ctx.clip();
  if(!PORTRAIT_BARE) for(let i=0;i<5;i++){ ctx.fillStyle='rgba(180,200,220,.05)'; ctx.beginPath(); ctx.arc(Math.sin(t*0.3+i*2)*r*0.6,Math.cos(t*0.2+i)*r*0.5,r*0.45,0,7); ctx.fill(); }
  const s=r/50; ctx.scale(s,s);
  if(id==='P'){
    ctx.fillStyle='#222'; roundRect(-16,-28,32,56,6); ctx.fill(); ctx.fillStyle='#6cf'; ctx.fillRect(-12,-22,24,36);
    const v=Math.floor(t*4)%2; ctx.strokeStyle='#fff'; ctx.lineWidth=3;
    for(let i=1;i<=2;i++){ ctx.globalAlpha=v||i===1?1:.3; ctx.beginPath(); ctx.arc(18,-20,i*9,-1,0.2); ctx.stroke(); } ctx.globalAlpha=1;
    ctx.restore(); ringPortrait(r); ctx.restore(); return;
  }
  let L=LOOK[id]; if(!L){ ctx.restore(); ctx.restore(); return; }
  if(id==='W') L=walterLook();
  if(PORTRAIT_OVERRIDE) L=Object.assign({},L,PORTRAIT_OVERRIDE);
  const heis = id==='W' && walterHat();
  if(heis) L=Object.assign({},L,{outfit:'jacket',cloth:'#2b2b2b',shirt:'#55504a',hat:true,browA:0.2});
  const W=L.hw, H=L.hh, HY=-4; // centro de la cabeza
  const E=(x,y,rx,ry,c,rot)=>{ ctx.fillStyle=c; ctx.beginPath(); ctx.ellipse(x,y,rx,ry,rot||0,0,7); ctx.fill(); };

  // --- pelo largo por detrás ---
  if(L.hair==='wavy'){
    ctx.fillStyle=shade(L.hc,-35);
    ctx.beginPath(); ctx.moveTo(-W-10,HY-10); ctx.quadraticCurveTo(-W-18,HY+30,-W-6,HY+46); ctx.lineTo(W+6,HY+46); ctx.quadraticCurveTo(W+18,HY+30,W+10,HY-10); ctx.closePath(); ctx.fill();
  }
  // --- ropa ---
  ctx.save(); ctx.translate(0,0);
  const shoulders=()=>{ ctx.beginPath(); ctx.moveTo(-56,60); ctx.lineTo(-50,40); ctx.quadraticCurveTo(-42,26,-13,22); ctx.lineTo(13,22); ctx.quadraticCurveTo(42,26,50,40); ctx.lineTo(56,60); ctx.closePath(); };
  shoulders();
  const cg=ctx.createLinearGradient(-50,0,50,0); cg.addColorStop(0,shade(L.cloth,-30)); cg.addColorStop(0.45,L.cloth); cg.addColorStop(1,shade(L.cloth,-45));
  ctx.fillStyle=cg; ctx.fill();
  ctx.save(); shoulders(); ctx.clip();
  if(L.outfit==='striped'){ ctx.strokeStyle='rgba(255,255,255,.18)'; ctx.lineWidth=1; for(let x=-56;x<60;x+=4.5){ ctx.beginPath(); ctx.moveTo(x,20); ctx.lineTo(x+2,62); ctx.stroke(); }
    ctx.fillStyle=shade(L.cloth,-15); ctx.beginPath(); ctx.moveTo(-13,22); ctx.lineTo(-4,38); ctx.lineTo(-16,32); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(13,22); ctx.lineTo(4,38); ctx.lineTo(16,32); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#e8d8c8'; ctx.fillRect(-1,30,2,30); }
  if(L.outfit==='jacket'){ ctx.fillStyle=L.shirt; ctx.beginPath(); ctx.moveTo(-14,22); ctx.lineTo(14,22); ctx.lineTo(10,62); ctx.lineTo(-10,62); ctx.closePath(); ctx.fill();
    ctx.fillStyle=shade(L.cloth,15); ctx.beginPath(); ctx.moveTo(-14,22); ctx.lineTo(-22,24); ctx.lineTo(-12,62); ctx.lineTo(-9,62); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(14,22); ctx.lineTo(22,24); ctx.lineTo(12,62); ctx.lineTo(9,62); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.12)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(-24,26); ctx.lineTo(-14,62); ctx.moveTo(24,26); ctx.lineTo(14,62); ctx.stroke(); }
  if(L.outfit==='blouse'){ ctx.fillStyle=L.skin; ctx.beginPath(); ctx.moveTo(-12,22); ctx.lineTo(12,22); ctx.lineTo(0,42); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.25)'; ctx.beginPath(); ctx.moveTo(-12,22); ctx.lineTo(-20,24); ctx.lineTo(-2,46); ctx.lineTo(0,42); ctx.closePath(); ctx.fill(); }
  if(L.outfit==='shirttie'||L.outfit==='suit'){
    ctx.fillStyle=L.shirt; ctx.beginPath(); ctx.moveTo(-14,22); ctx.lineTo(14,22); ctx.lineTo(12,62); ctx.lineTo(-12,62); ctx.closePath(); ctx.fill();
    ctx.fillStyle=shade(L.shirt,-25); ctx.beginPath(); ctx.moveTo(-13,22); ctx.lineTo(-3,30); ctx.lineTo(-10,34); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(13,22); ctx.lineTo(3,30); ctx.lineTo(10,34); ctx.closePath(); ctx.fill();
    ctx.fillStyle=L.tie; ctx.beginPath(); ctx.moveTo(-3,28); ctx.lineTo(3,28); ctx.lineTo(2,32); ctx.lineTo(5,58); ctx.lineTo(0,63); ctx.lineTo(-5,58); ctx.lineTo(-2,32); ctx.closePath(); ctx.fill();
    if(L.tieStripe){ ctx.save(); ctx.beginPath(); ctx.moveTo(-3,28); ctx.lineTo(3,28); ctx.lineTo(2,32); ctx.lineTo(5,58); ctx.lineTo(0,63); ctx.lineTo(-5,58); ctx.lineTo(-2,32); ctx.closePath(); ctx.clip(); ctx.strokeStyle=L.tieStripe; ctx.lineWidth=1.3; for(let k=20;k<70;k+=4){ ctx.beginPath(); ctx.moveTo(-8,k); ctx.lineTo(8,k+7); ctx.stroke(); } ctx.restore(); }
    if(L.outfit==='suit'){
      ctx.fillStyle=L.cloth; ctx.beginPath(); ctx.moveTo(-14,22); ctx.lineTo(-26,24); ctx.lineTo(-8,60); ctx.lineTo(-6,40); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(14,22); ctx.lineTo(26,24); ctx.lineTo(8,60); ctx.lineTo(6,40); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.35)'; ctx.lineWidth=1; ctx.stroke(); } }
  if(L.outfit==='bowling'){ ctx.fillStyle=L.shirt; ctx.fillRect(-40,24,10,40); ctx.fillRect(30,24,10,40);
    ctx.fillStyle='#3a3a3a'; ctx.beginPath(); ctx.moveTo(-13,22); ctx.lineTo(0,34); ctx.lineTo(13,22); ctx.closePath(); ctx.fill(); }
  if(L.outfit==='vest'){ ctx.fillStyle=L.shirt; ctx.fillRect(-56,20,112,44); ctx.fillStyle=L.shirt; ctx.beginPath(); ctx.moveTo(-14,22); ctx.lineTo(14,22); ctx.lineTo(0,34); ctx.fill();
    ctx.fillStyle=L.cloth; ctx.beginPath(); ctx.moveTo(-40,24); ctx.lineTo(-14,20); ctx.lineTo(-8,62); ctx.lineTo(-42,62); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(40,24); ctx.lineTo(14,20); ctx.lineTo(8,62); ctx.lineTo(42,62); ctx.closePath(); ctx.fill();
    ctx.strokeStyle=shade(L.cloth,-30); ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(-14,20); ctx.lineTo(-8,62); ctx.moveTo(14,20); ctx.lineTo(8,62); ctx.stroke(); }
  if(L.outfit==='tank'){ ctx.fillStyle=L.skin; ctx.fillRect(-56,20,26,44); ctx.fillRect(30,20,26,44); ctx.fillStyle=shade(L.skin,-25); ctx.fillRect(-32,20,3,44); ctx.fillRect(29,20,3,44);
  if(L.tattoo){ ctx.strokeStyle='rgba(30,40,50,.55)'; ctx.lineWidth=1.2; for(const sx of [-43,43]){ for(let k=0;k<4;k++){ ctx.beginPath(); ctx.arc(sx+(k%2?4:-4),30+k*8,4+k%2,0,5); ctx.stroke(); } ctx.fillStyle='rgba(30,40,50,.5)'; ctx.fillRect(sx-12,58,24,3); } }
  if(L.cord){ ctx.strokeStyle='#3a2a1e'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(-12,22); ctx.quadraticCurveTo(0,40,12,22); ctx.stroke(); }
    ctx.fillStyle=L.skin; ctx.beginPath(); ctx.ellipse(0,22,14,10,0,0,Math.PI); ctx.fill(); }
  if(L.outfit==='plaidjacket'||L.outfit==='plaidopen'){
    ctx.save();
    if(L.outfit==='plaidopen') shoulders(); else { ctx.beginPath(); ctx.moveTo(-15,22); ctx.lineTo(15,22); ctx.lineTo(14,64); ctx.lineTo(-14,64); ctx.closePath(); }
    ctx.clip(); ctx.fillStyle=L.outfit==='plaidopen'?L.cloth:L.shirt; ctx.fillRect(-60,15,120,60);
    ctx.fillStyle=L.check; ctx.globalAlpha=L.outfit==='plaidopen'?0.45:0.55;
    for(let x=-60;x<60;x+=6) ctx.fillRect(x,15,2.2,60); for(let y=15;y<75;y+=6) ctx.fillRect(-60,y,120,2.2);
    ctx.globalAlpha=1; ctx.restore();
    if(L.outfit==='plaidjacket'){
      ctx.fillStyle=L.cloth; ctx.beginPath(); ctx.moveTo(-15,22); ctx.lineTo(-28,24); ctx.lineTo(-10,64); ctx.lineTo(-8,40); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(15,22); ctx.lineTo(28,24); ctx.lineTo(10,64); ctx.lineTo(8,40); ctx.closePath(); ctx.fill();
      ctx.fillStyle=L.shirt; ctx.beginPath(); ctx.moveTo(-13,22); ctx.lineTo(-2,31); ctx.lineTo(-11,35); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(13,22); ctx.lineTo(2,31); ctx.lineTo(11,35); ctx.closePath(); ctx.fill(); }
    else { ctx.fillStyle=L.shirt; ctx.beginPath(); ctx.moveTo(-12,22); ctx.lineTo(12,22); ctx.lineTo(9,64); ctx.lineTo(-9,64); ctx.closePath(); ctx.fill();
      ctx.fillStyle=shade(L.shirt,-20); ctx.beginPath(); ctx.ellipse(0,23,11,4,0,0,Math.PI); ctx.fill(); }
  }
  if(L.outfit==='chainshirt'){ // camisa crema con estampado diagonal de cadenas, cuello abierto y colgante (Tuco)
    chainPattern(-60,18,120,50,'#1c1a18');
    ctx.fillStyle=shade(L.cloth,-12); for(const sd of [-1,1]){ ctx.beginPath(); ctx.moveTo(sd*13,20); ctx.lineTo(sd*26,24); ctx.lineTo(sd*6,40); ctx.closePath(); ctx.fill(); chainPatternClipTri(sd); }
    ctx.fillStyle=L.skin; ctx.beginPath(); ctx.moveTo(-8,21); ctx.lineTo(8,21); ctx.lineTo(0,42); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#d8d4c8'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(-7,22); ctx.quadraticCurveTo(0,40,7,22); ctx.stroke();
    ctx.fillStyle='#e0dcd0'; ctx.beginPath(); ctx.ellipse(0,40,3.5,5,0,0,7); ctx.fill(); ctx.strokeStyle='#8a8478'; ctx.lineWidth=.8; ctx.stroke();
  }
  if(L.outfit==='tee'){ ctx.fillStyle=shade(L.cloth,-30); ctx.beginPath(); ctx.ellipse(0,23,12,5,0,0,Math.PI); ctx.fill(); }
  ctx.restore(); ctx.restore();
  if(L.chain){ ctx.strokeStyle='#e8c33a'; ctx.lineWidth=2.2; ctx.beginPath(); ctx.arc(0,24,14,0.25,Math.PI-0.25); ctx.stroke(); }
  if(L.pendant){ ctx.strokeStyle='#cfcfcf'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(-4,24); ctx.lineTo(0,34); ctx.lineTo(4,24); ctx.stroke(); ctx.fillStyle='#dcdcdc'; ctx.beginPath(); ctx.ellipse(0,37,2.5,4,0,0,7); ctx.fill(); }
  if(L.necklace){ ctx.fillStyle='#f5f0e6'; for(let a=0.35;a<Math.PI-0.3;a+=0.18){ ctx.beginPath(); ctx.arc(Math.cos(a)*11,24+Math.sin(a)*10,1.1,0,7); ctx.fill(); } }

  // --- cuello ---
  const ng=ctx.createLinearGradient(0,HY+H-10,0,26); ng.addColorStop(0,shade(L.skin,-55)); ng.addColorStop(1,shade(L.skin,-20));
  ctx.fillStyle=ng; ctx.beginPath(); ctx.moveTo(-W*0.48,HY+H-8); ctx.lineTo(-W*0.55,24); ctx.quadraticCurveTo(0,30,W*0.55,24); ctx.lineTo(W*0.48,HY+H-8); ctx.closePath(); ctx.fill();
  // --- orejas ---
  E(-W+1,HY+2,4.5,8,shade(L.skin,-18)); E(W-1,HY+2,4.5,8,shade(L.skin,-28));
  E(-W+1.5,HY+2,2,4.5,shade(L.skin,-40)); E(W-1.5,HY+2,2,4.5,shade(L.skin,-48));

  // --- cabeza con sombreado ---
  ctx.save(); ctx.translate(0,HY);
  headPath(W,H,L.jaw);
  const fg=ctx.createRadialGradient(-W*0.35,-H*0.35,2,0,0,H*1.25);
  fg.addColorStop(0,shade(L.skin,22)); fg.addColorStop(0.55,L.skin); fg.addColorStop(1,shade(L.skin,-50));
  ctx.fillStyle=fg; ctx.fill();
  ctx.save(); headPath(W,H,L.jaw); ctx.clip();
  // sombra lateral derecha y bajo pómulos
  const sg=ctx.createLinearGradient(W*0.2,0,W,0); sg.addColorStop(0,'rgba(60,25,10,0)'); sg.addColorStop(1,'rgba(60,25,10,.35)');
  ctx.fillStyle=sg; ctx.fillRect(0,-H,W,2*H);
  E(-W*0.62,8,5,7,'rgba(110,40,20,.10)',0.3); E(W*0.62,8,5,7,'rgba(90,30,15,.16)',-0.3);
  // mejillas
  E(-W*0.5,7,6,4,L.female?'rgba(220,110,110,.18)':'rgba(210,110,90,.10)'); E(W*0.5,7,6,4,L.female?'rgba(220,110,110,.15)':'rgba(210,110,90,.08)');
  // barba de pocos días
  if(L.beard==='stubble'){ ctx.fillStyle=L.bc; ctx.globalAlpha=0.28; ctx.beginPath(); ctx.moveTo(-W,4); ctx.quadraticCurveTo(-W*0.6,10,-8,10); ctx.lineTo(8,10); ctx.quadraticCurveTo(W*0.6,10,W,4); ctx.lineTo(W,H); ctx.lineTo(-W,H); ctx.closePath(); ctx.fill(); ctx.globalAlpha=1; }
  // brillo en calva
  if(L.hair==='bald'||L.hair==='baldsides'||L.hair==='shaved'){ const bg2=ctx.createRadialGradient(-W*0.3,-H*0.7,1,-W*0.3,-H*0.7,W*0.6); bg2.addColorStop(0,'rgba(255,255,255,.35)'); bg2.addColorStop(1,'rgba(255,255,255,0)'); ctx.fillStyle=bg2; ctx.fillRect(-W,-H,2*W,H); }
  // arrugas de frente
  if(L.wrinkles){ ctx.strokeStyle='rgba(100,50,30,.22)'; ctx.lineWidth=0.8; for(let i=0;i<L.wrinkles+1;i++){ ctx.beginPath(); ctx.moveTo(-W*0.45,-H*0.42-i*3.2); ctx.quadraticCurveTo(0,-H*0.48-i*3.2,W*0.45,-H*0.42-i*3.2); ctx.stroke(); } }
  ctx.restore();

  // --- pelo ---
  ctx.fillStyle=L.hc;
  if(L.hair==='baldsides'){ ctx.globalAlpha=.85; E(-W+2,-4,4,9,L.hc,0.1); E(W-2,-4,4,9,L.hc,-0.1); ctx.globalAlpha=1; }
  if(L.hair==='shaved'){ ctx.save(); headPath(W,H,L.jaw); ctx.clip(); ctx.globalAlpha=.4; E(0,-H*0.5,W+2,H*0.55,L.hc); ctx.restore(); ctx.globalAlpha=1; }
  if(L.hair==='buzz'||L.hair==='short'||L.hair==='receding'){
    ctx.save(); headPath(W+1,H+1,L.jaw); ctx.clip();
    ctx.beginPath(); ctx.moveTo(-W-2,-2);
    if(L.hair==='receding'){ ctx.quadraticCurveTo(-W*0.9,-H*0.55,-W*0.5,-H*0.62); ctx.quadraticCurveTo(0,-H*0.5,W*0.5,-H*0.62); ctx.quadraticCurveTo(W*0.9,-H*0.55,W+2,-2); }
    else { ctx.quadraticCurveTo(-W*0.85,-H*0.55,-W*0.3,-H*0.6); ctx.quadraticCurveTo(0,-H*0.56,W*0.3,-H*0.62); ctx.quadraticCurveTo(W*0.85,-H*0.55,W+2,-2); }
    ctx.lineTo(W+2,-H-4); ctx.lineTo(-W-2,-H-4); ctx.closePath();
    ctx.globalAlpha=L.hair==='buzz'?0.75:1; ctx.fill(); ctx.globalAlpha=1;
    // textura
    ctx.fillStyle='rgba(255,255,255,.07)'; for(let i=0;i<30;i++){ ctx.fillRect(-W+((i*37)%(2*W)),-H+((i*13)%(H*0.4)),1,2); }
    ctx.restore();
  }
  if(L.hair==='walt1'){ // Walter T1: pelo castaño claro y fino, peinado hacia atrás, entradas marcadas en "M" y laterales cortos
    ctx.save(); headPath(W+1,H+1,L.jaw); ctx.clip();
    const g=ctx.createLinearGradient(0,-H,0,-H*0.3); g.addColorStop(0,shade(L.hc,18)); g.addColorStop(1,shade(L.hc,-12));
    // masa superior: cubre la coronilla; el borde delantero dibuja las entradas (frente despejada en el centro-lateral)
    ctx.fillStyle=g; ctx.beginPath();
    ctx.moveTo(-W-2,-H*0.12);
    ctx.quadraticCurveTo(-W*0.98,-H*0.5,-W*0.7,-H*0.66);          // patilla → sien
    ctx.quadraticCurveTo(-W*0.48,-H*0.62,-W*0.36,-H*0.8);         // entrada izquierda (hueco hacia atrás)
    ctx.quadraticCurveTo(-W*0.16,-H*0.84,0,-H*0.76);               // mechón central algo adelantado
    ctx.quadraticCurveTo(W*0.16,-H*0.84,W*0.36,-H*0.8);
    ctx.quadraticCurveTo(W*0.48,-H*0.62,W*0.7,-H*0.66);           // entrada derecha
    ctx.quadraticCurveTo(W*0.98,-H*0.5,W+2,-H*0.12);
    ctx.lineTo(W+2,-H-4); ctx.lineTo(-W-2,-H-4); ctx.closePath(); ctx.fill();
    // peinado hacia atrás: pocas líneas suaves dentro de la masa, nunca fuera
    ctx.save(); ctx.clip(); ctx.strokeStyle='rgba(255,240,210,.18)'; ctx.lineWidth=0.9;
    for(let i=-3;i<=3;i++){ ctx.beginPath(); ctx.moveTo(i*W*0.17,-H*0.78); ctx.quadraticCurveTo(i*W*0.2,-H*0.92,i*W*0.26,-H-2); ctx.stroke(); }
    ctx.strokeStyle='rgba(60,40,20,.18)'; for(const sd of [-1,1]){ ctx.beginPath(); ctx.moveTo(sd*W*0.82,-H*0.2); ctx.quadraticCurveTo(sd*W*0.86,-H*0.45,sd*W*0.62,-H*0.72); ctx.stroke(); }
    ctx.restore();
    // un poco de canas en las sienes
    ctx.fillStyle='rgba(200,195,185,.35)'; for(const sd of [-1,1]){ ctx.beginPath(); ctx.ellipse(sd*W*0.9,-H*0.3,W*0.12,H*0.16,0,0,7); ctx.fill(); }
    ctx.restore();
  }
  if(L.hair==='swept'){
    ctx.beginPath(); ctx.moveTo(-W-2,0); ctx.quadraticCurveTo(-W-4,-H*0.9,-W*0.2,-H-3); ctx.quadraticCurveTo(W*0.9,-H-4,W+2,-H*0.3); ctx.lineTo(W+1,2);
    ctx.quadraticCurveTo(W*0.7,-H*0.5,W*0.1,-H*0.62); ctx.quadraticCurveTo(-W*0.6,-H*0.55,-W*0.8,-H*0.25); ctx.lineTo(-W+1,2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle=shade(L.hc,30); ctx.lineWidth=0.8; for(let i=0;i<4;i++){ ctx.beginPath(); ctx.moveTo(-W*0.7+i*4,-H*0.75); ctx.quadraticCurveTo(0,-H-1+i,W*0.8,-H*0.5+i*2); ctx.stroke(); }
  }
  if(L.hair==='wavy'){
    const hg=ctx.createLinearGradient(0,-H,0,H); hg.addColorStop(0,shade(L.hc,25)); hg.addColorStop(1,shade(L.hc,-20)); ctx.fillStyle=hg;
    ctx.beginPath(); ctx.moveTo(-W-6,H*0.9);
    ctx.quadraticCurveTo(-W-12,0,-W-4,-H*0.7); ctx.quadraticCurveTo(-W*0.4,-H-10,W*0.4,-H-6); ctx.quadraticCurveTo(W+12,-H*0.7,W+8,0); ctx.quadraticCurveTo(W+12,H*0.5,W+4,H*0.9);
    ctx.quadraticCurveTo(W*0.9,H*0.3,W*0.8,-H*0.3); ctx.quadraticCurveTo(W*0.3,-H*0.55,-W*0.1,-H*0.75); ctx.quadraticCurveTo(-W*0.6,-H*0.3,-W*0.85,-H*0.1); ctx.quadraticCurveTo(-W*0.95,H*0.4,-W-6,H*0.9);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle=shade(L.hc,45); ctx.lineWidth=1; for(let i=0;i<5;i++){ ctx.beginPath(); ctx.moveTo(-W*0.8+i*3,-H*0.6); ctx.quadraticCurveTo(-W-4+i,0,-W-2+i*2,H*0.7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(W*0.5-i*2,-H*0.7); ctx.quadraticCurveTo(W+6-i,0,W+2-i*2,H*0.7); ctx.stroke(); }
  }
  if(L.hair==='spiky'){
    ctx.beginPath(); ctx.moveTo(-W-1,-4); ctx.quadraticCurveTo(-W-2,-H*0.75,-W*0.6,-H*0.9);
    for(let i=0;i<=8;i++){ const x=-W*0.6+i*W*0.15; ctx.lineTo(x+2,-H-5-(i%2?4:0)); ctx.lineTo(x+W*0.08,-H*0.88); }
    ctx.quadraticCurveTo(W+2,-H*0.75,W+1,-4); ctx.quadraticCurveTo(W*0.6,-H*0.6,0,-H*0.68); ctx.quadraticCurveTo(-W*0.6,-H*0.6,-W-1,-4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle=shade(L.hc,35); ctx.lineWidth=0.8; for(let i=0;i<7;i++){ ctx.beginPath(); ctx.moveTo(-W*0.5+i*W*0.17,-H*0.7); ctx.lineTo(-W*0.45+i*W*0.17,-H-2); ctx.stroke(); }
  }
  if(L.hair==='bob'){
    const hg=ctx.createLinearGradient(0,-H,0,H); hg.addColorStop(0,shade(L.hc,25)); hg.addColorStop(1,shade(L.hc,-25)); ctx.fillStyle=hg;
    ctx.beginPath(); ctx.moveTo(-W-6,H*0.75); ctx.quadraticCurveTo(-W-10,-H*0.2,-W*0.7,-H*0.85); ctx.quadraticCurveTo(0,-H-8,W*0.7,-H*0.85); ctx.quadraticCurveTo(W+10,-H*0.2,W+6,H*0.75);
    ctx.quadraticCurveTo(W+2,H*0.9,W-2,H*0.7); ctx.quadraticCurveTo(W*0.95,0,W*0.6,-H*0.5); ctx.quadraticCurveTo(0,-H*0.62,-W*0.75,-H*0.35); ctx.quadraticCurveTo(-W*0.95,0,-W+2,H*0.7); ctx.quadraticCurveTo(-W-2,H*0.9,-W-6,H*0.75); ctx.closePath(); ctx.fill();
    ctx.strokeStyle=shade(L.hc,45); ctx.lineWidth=1; for(let i=0;i<4;i++){ ctx.beginPath(); ctx.moveTo(-W*0.3+i*5,-H*0.8); ctx.quadraticCurveTo(-W-2,-H*0.2+i*3,-W-3+i,H*0.6); ctx.stroke(); }
  }
  if(L.hair==='shaggy'){
    ctx.beginPath(); ctx.moveTo(-W-3,4); ctx.quadraticCurveTo(-W-6,-H*0.9,0,-H-5); ctx.quadraticCurveTo(W+6,-H*0.9,W+3,4);
    ctx.lineTo(W-2,-H*0.25); ctx.lineTo(W*0.5,-H*0.18); ctx.lineTo(W*0.3,-H*0.35); ctx.lineTo(0,-H*0.12); ctx.lineTo(-W*0.25,-H*0.3); ctx.lineTo(-W*0.55,-H*0.1); ctx.lineTo(-W+2,-H*0.3); ctx.closePath(); ctx.fill();
    ctx.strokeStyle=shade(L.hc,30); ctx.lineWidth=0.9; for(let i=0;i<6;i++){ ctx.beginPath(); ctx.moveTo(-W*0.6+i*W*0.25,-H*0.85); ctx.quadraticCurveTo(-W*0.4+i*W*0.2,-H*0.5,-W*0.5+i*W*0.22,-H*0.2); ctx.stroke(); }
  }
  if(L.hair==='beanie'){ ctx.beginPath(); ctx.ellipse(0,-H*0.42,W+3,H*0.7,0,Math.PI,0); ctx.fill(); ctx.fillRect(-W-3,-H*0.46,2*W+6,8);
    ctx.strokeStyle='rgba(255,255,255,.08)'; ctx.lineWidth=1; for(let x=-W;x<W;x+=4){ ctx.beginPath(); ctx.moveTo(x,-H*0.46); ctx.lineTo(x,-H*0.38); ctx.stroke(); } }
  if(L.hair==='cap'){ ctx.beginPath(); ctx.ellipse(0,-H*0.45,W+2,H*0.62,0,Math.PI,0); ctx.fill(); ctx.fillRect(-W-2,-H*0.5,2*W+4,5); E(9,-H*0.45+3,20,4,shade(L.hc,-25)); }

  // mechones: el pelo deja de ser una masa lisa (luces y sombras en la dirección del peinado, borde irregular)
  if(['short','buzz','swept','wavy','shaggy','spiky','bob'].includes(L.hair)&&L.hc){
    ctx.save(); headPath(W+3,H+3,L.jaw); ctx.clip();
    const top=-H-2, bot=L.hair==='bob'?H*0.2:-H*0.5, dir=L.hair==='swept'?0.6:L.hair==='walt1'?0.35:0.15, n=L.hair==='buzz'?10:18;
    for(let i=0;i<n;i++){ const x0=-W+((i*37)%100)/100*2*W, len=(bot-top)*(0.35+((i*13)%10)/20);
      ctx.strokeStyle=i%3?'rgba(255,255,255,.13)':'rgba(0,0,0,.18)'; ctx.lineWidth=i%3?0.9:1.2;
      ctx.beginPath(); ctx.moveTo(x0,top+2); ctx.quadraticCurveTo(x0+dir*8,top+len*0.5,x0+dir*14,top+len); ctx.stroke(); }
    ctx.restore();
    if(['short','receding','walt1','swept'].includes(L.hair)){ ctx.fillStyle=L.hc; for(const sx of [-1,1]){ ctx.beginPath(); ctx.moveTo(sx*(W-1),-H*0.15); ctx.lineTo(sx*(W+1),-H*0.02); ctx.lineTo(sx*(W-3),-H*0.05); ctx.closePath(); ctx.fill(); } } // patillas
  }
  // --- cejas ---
  ctx.strokeStyle=L.brow; ctx.lineCap='round'; ctx.lineWidth=L.thick?3.2:L.female?1.6:2.4;
  const by=-6, ba=L.browA*10;
  ctx.beginPath(); ctx.moveTo(-15,by-1); ctx.quadraticCurveTo(-10,by-3,-4,by-1+ba*0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(15,by-1); ctx.quadraticCurveTo(10,by-3,4,by-1+ba*0.6); ctx.stroke();
  if(L.browA>0.15){ ctx.strokeStyle='rgba(90,40,25,.3)'; ctx.lineWidth=0.8; ctx.beginPath(); ctx.moveTo(-1.5,by-4); ctx.lineTo(-1,by+1); ctx.moveTo(1.5,by-4); ctx.lineTo(1,by+1); ctx.stroke(); }
  ctx.lineCap='butt';
  // --- ojos ---
  eyeShape(-9,0,L,t,id); eyeShape(9,0,L,t,id);
  // --- nariz ---
  ctx.strokeStyle=shade(L.skin,-45); ctx.lineWidth=1.1;
  ctx.beginPath(); ctx.moveTo(-2.2,1); ctx.quadraticCurveTo(-3.2,7,-4.4,10.5); ctx.stroke();
  E(1.2,9,4,3,shade(L.skin,12));
  ctx.fillStyle=shade(L.skin,-60); E(-2.6,11.2,1.6,0.9,shade(L.skin,-60)); E(2.6,11.2,1.6,0.9,shade(L.skin,-60));
  ctx.strokeStyle=shade(L.skin,-40); ctx.beginPath(); ctx.moveTo(-5,10.5); ctx.quadraticCurveTo(0,13.5,5,10.5); ctx.stroke();
  // surcos nasogenianos
  if(L.wrinkles||id==='T'||id==='H'){ ctx.strokeStyle='rgba(100,45,25,.25)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(-6,9); ctx.quadraticCurveTo(-9,15,-8,19); ctx.moveTo(6,9); ctx.quadraticCurveTo(9,15,8,19); ctx.stroke(); }
  // --- boca ---
  const open=talking?Math.abs(Math.sin(t*15))*2.6:0;
  const my=17, mw=L.female?6:7, sm=L.smirk?1.5:0;
  ctx.fillStyle=L.lips||shade(L.skin,-55);
  ctx.beginPath(); ctx.moveTo(-mw,my); ctx.quadraticCurveTo(-2,my-(L.thinLips?1.2:2.2),0,my-1); ctx.quadraticCurveTo(2,my-(L.thinLips?1.2:2.2),mw,my-sm); ctx.quadraticCurveTo(0,my+open+0.5,-mw,my); ctx.fill();
  if(open>0.5){ ctx.fillStyle='#3a1510'; ctx.beginPath(); ctx.ellipse(0,my+open*0.5,mw*0.75,open*0.6,0,0,7); ctx.fill(); ctx.fillStyle='#eee'; ctx.fillRect(-3,my,6,Math.min(1.2,open*0.4)); }
  ctx.fillStyle=L.lips||shade(L.skin,-40); ctx.globalAlpha=L.lips?1:0.7;
  ctx.beginPath(); ctx.moveTo(-mw+1,my+open*0.9); ctx.quadraticCurveTo(0,my+open+(L.thinLips?2:3),mw-1,my+open*0.9-sm*0.5); ctx.quadraticCurveTo(0,my+open+0.8,-mw+1,my+open*0.9); ctx.fill(); ctx.globalAlpha=1;
  E(0,my+open+4,4,1.2,'rgba(80,30,20,.12)');
  // --- barba ---
  if(L.beard==='fullshort'){ // barba corta y recortada que cubre mandíbula y mentón (Krazy-8)
    ctx.fillStyle=L.bc; ctx.globalAlpha=0.5; ctx.beginPath(); ctx.moveTo(-W+1,0); ctx.quadraticCurveTo(-W*0.8,H*0.75,0,H+1); ctx.quadraticCurveTo(W*0.8,H*0.75,W-1,0);
    ctx.lineTo(W-4,6); ctx.quadraticCurveTo(W*0.4,my+3,6,my+open+4); ctx.lineTo(-6,my+open+4); ctx.quadraticCurveTo(-W*0.4,my+3,-W+4,6); ctx.closePath(); ctx.fill(); ctx.globalAlpha=1;
    E(-3.5,my-3,4.5,1.8,L.bc,0.15); E(3.5,my-3,4.5,1.8,L.bc,-0.15); }
  if(L.beard==='goatee'){
    ctx.fillStyle=L.bc;
    ctx.beginPath(); ctx.moveTo(-9,my+1); ctx.quadraticCurveTo(-9,my-5,-2,my-3.6); ctx.lineTo(2,my-3.6); ctx.quadraticCurveTo(9,my-5,9,my+1);
    ctx.lineTo(8,my+7); ctx.quadraticCurveTo(6,H-1,0,H+1); ctx.quadraticCurveTo(-6,H-1,-8,my+7); ctx.closePath();
    ctx.moveTo(-5.5,my+open+1.6); ctx.quadraticCurveTo(0,my+open+5,5.5,my+open+1.6); ctx.quadraticCurveTo(0,my-1.5,-5.5,my+open+1.6);
    ctx.fill('evenodd');
    if(L.bc2){ ctx.strokeStyle=L.bc2; ctx.lineWidth=0.7; for(let i=0;i<14;i++){ const x=-7+i; ctx.beginPath(); ctx.moveTo(x,my+5); ctx.lineTo(x*0.8,H-2+Math.abs(x)*-0.3); ctx.stroke(); } }
  }
  if(L.beard==='mustache'){ E(-3.5,my-3,4.5,2,L.bc,0.2); E(3.5,my-3,4.5,2,L.bc,-0.2); }
  if(L.earrings){ ctx.strokeStyle='#e8d8a0'; ctx.lineWidth=1.3; ctx.beginPath(); ctx.arc(-W+1,10,2.6,0,7); ctx.stroke(); ctx.beginPath(); ctx.arc(W-1,10,2.6,0,7); ctx.stroke(); }
  // --- gafas ---
  if(L.glasses){
    const gw=L.glasses==='thick'?3:L.glasses==='gus'?1.4:L.glasses==='rect'?1.3:1.1;
    ctx.strokeStyle=L.glasses==='thick'?'#121212':L.glasses==='gus'?'#3a3a3a':'#8a7a5a'; ctx.lineWidth=gw;
    ctx.fillStyle='rgba(210,230,255,.10)';
    for(const sx of [-9,9]){ if(L.glasses==='wire'){ ctx.beginPath(); ctx.ellipse(sx,0.5,7.2,5.6,0,0,7); } else { roundRect(sx-7.5,-4.5,15,10,L.glasses==='gus'?2:3); } ctx.fill(); ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=0.7; ctx.beginPath(); ctx.moveTo(sx-4,-3); ctx.lineTo(sx-1,-3.5); ctx.stroke();
      ctx.strokeStyle=L.glasses==='thick'?'#121212':L.glasses==='gus'?'#3a3a3a':'#8a7a5a'; ctx.lineWidth=gw; }
    ctx.beginPath(); ctx.moveTo(-2,-0.5); ctx.quadraticCurveTo(0,-2,2,-0.5); ctx.moveTo(-16.5,-0.5); ctx.lineTo(-W+0.5,-2); ctx.moveTo(16.5,-0.5); ctx.lineTo(W-0.5,-2); ctx.stroke();
  }
  if(L.shades){ ctx.fillStyle='#0d0d0d'; roundRect(-16,-H*0.62,13,6,3); ctx.fill(); roundRect(3,-H*0.62,13,6,3); ctx.fill(); ctx.fillRect(-3,-H*0.62+1,6,1.5);
    ctx.fillStyle='rgba(255,255,255,.25)'; ctx.fillRect(-13,-H*0.62+1,4,1); ctx.fillRect(6,-H*0.62+1,4,1); }
  ctx.restore();
  // --- sombrero de Heisenberg ---
  if(L.hat){ ctx.save(); ctx.translate(0,HY);
    E(0,-H*0.62,W+15,6.5,'#121212'); ctx.fillStyle='#161616'; ctx.beginPath(); ctx.moveTo(-W+1,-H*0.62); ctx.lineTo(-W+3,-H-12); ctx.quadraticCurveTo(0,-H-16,W-3,-H-12); ctx.lineTo(W-1,-H*0.62); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#2f2f2f'; ctx.fillRect(-W+1.5,-H*0.62-6,2*W-3,4.5);
    ctx.fillStyle='rgba(255,255,255,.08)'; ctx.fillRect(-W+5,-H-9,8,12);
    ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillRect(-W,-H*0.6,2*W,4); ctx.restore(); }
  ctx.restore();
  if(L.bandage){ ctx.save(); ctx.rotate(-0.25); ctx.fillStyle='#f2ece0'; roundRect(-9,3,18,6,2); ctx.fill(); ctx.strokeStyle='rgba(120,100,80,.4)'; ctx.lineWidth=0.6; ctx.strokeRect(-9,3,18,6); ctx.restore(); ctx.fillStyle='rgba(120,40,60,.25)'; ctx.beginPath(); ctx.ellipse(-9,1,5,3,0,0,7); ctx.fill(); }
  if(!PORTRAIT_BARE) ringPortrait(r);
  ctx.restore();
}
function ringPortrait(r){
  ctx.strokeStyle='#000'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,0,r,0,7); ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(0,0,r-3,0,7); ctx.stroke();
}
function shade(hex,amt){
  if(!hex||hex[0]!=='#') return hex;
  let h=hex.slice(1); if(h.length===3) h=h.split('').map(c=>c+c).join('');
  const n=parseInt(h,16); const f=v=>clamp(v+amt,0,255);
  return 'rgb('+f(n>>16)+','+f((n>>8)&255)+','+f(n&255)+')';
}

// personajes visibles en el mapa (junto a sus lugares)
const WORLD_NPC = [
  {id:'J', loc:'jesse', from:0, body:'#262626'},
  {id:'V', loc:'rvlot', from:0, to:0, body:'#6a6a6a', hat:'cap'},
  {id:'T', loc:'tuco', from:5, to:8, body:'#eeeeee'},
  {id:'SA', loc:'saul', from:14, body:'#5a5b62'},
  {id:'G', loc:'pollos', from:17, to:44, body:'#eee29a'},
  {id:'S', loc:'carwash', from:0, body:'#1d7a3c', hair:'long'},
  {id:'H', loc:'dea', from:0, body:'#232323'},
];
function drawWorldNPCs(t){
  for(const n of WORLD_NPC){
    if(G.mi<n.from || (n.to!==undefined && G.mi>n.to)) continue;
    const L=LOC[n.loc], x=L.x+38, y=L.y-6, look=LOOK[n.id];
    const a=Math.atan2(G.player.y-y,G.player.x-x);
    drawPerson(x,y,a,n.body,look.skin,0,false,false);
    ctx.save(); ctx.translate(x,y); ctx.rotate(a);
    if(n.hat==='beanie'){ E2(1,0,5.6,'#2e2e2e'); }
    else if(n.hat==='cap'){ E2(1,0,5.6,'#a22'); }
    else if(n.hair==='long'){ E2(-1,0,6.4,'#c9a060'); }
    else if(look.hair!=='bald'&&look.hair!=='shaved'){ E2(-1,0,4.8,look.hc); }
    ctx.restore();
    if(dist(G.player.x,G.player.y,x,y)<260){ txt(CHAR[n.id].n,x,y-22,13,'#fff','center'); }
  }
}
function E2(x,y,r,c){ ctx.fillStyle=c; ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill(); }

function drawCook(t){
  const C=G.cook;
  ctx.fillStyle='rgba(0,0,0,.75)'; ctx.fillRect(0,0,VW,VH);
  const W=Math.min(640,VW-40), H=440, x=(VW-W)/2, y=(VH-H)/2;
  ctx.fillStyle='#14181a'; roundRect(x,y,W,H,14); ctx.fill(); ctx.strokeStyle='#3cf'; ctx.lineWidth=2; ctx.stroke();
  txt('LABORATORIO MÓVIL',x+W/2,y+40,26,'#5ad1ff','center','900 ');
  if(C.done){
    const r=C.res;
    txt('LOTE TERMINADO',x+W/2,y+130,34,'#fff','center','900 ');
    txt('Pureza: '+(r.pur*100).toFixed(1)+'%',x+W/2,y+200,30,r.pur>0.9?'#5ad1ff':r.pur>0.75?'#9f9':'#fc6','center');
    txt('Cantidad: '+r.lbs+' lb',x+W/2,y+245,24,'#ddd','center');
    txt(r.pur>0.95?'"Esto no es cocina. Esto es arte." ':r.pur>0.8?'"Aceptable. Pero podemos hacerlo mejor."':'"Esto es basura, Jesse. Basura."',x+W/2,y+300,18,'#aaa','center','italic ');
    txt('Pulsa ESPACIO',x+W/2,y+H-30,16,'#9c9','center');
    return;
  }
  // termómetro
  const tx=x+60, ty=y+80, th=300;
  ctx.fillStyle='#222'; ctx.fillRect(tx,ty,46,th);
  const by=ty+th-(C.band+C.bandW/2)/100*th; ctx.fillStyle='rgba(60,220,90,.45)'; ctx.fillRect(tx,by,46,C.bandW/100*th);
  const ty2=ty+th-C.temp/100*th; const inb=Math.abs(C.temp-C.band)<C.bandW/2;
  ctx.fillStyle=inb?'#5f5':C.temp>C.band?'#f44':'#4af'; ctx.fillRect(tx-6,ty2-3,58,6);
  txt(Math.round(C.temp*1.2+20)+'°C',tx+23,ty+th+28,16,'#ddd','center');
  // estado
  const cx=x+150;
  txt('Mantén la temperatura en la franja verde',cx,y+100,18,'#eee');
  txt('W / ↑  calentar      S / ↓  enfriar',cx,y+128,16,'#aaa');
  const ratio=C.total?C.inBand/C.total:0;
  txt('Precisión: '+(ratio*100).toFixed(0)+'%',cx,y+180,22,ratio>0.8?'#5ad1ff':'#fff');
  txt('Tiempo: '+Math.max(0,C.dur-C.t).toFixed(1)+' s',cx,y+214,20,'#ddd');
  if(C.temp>95) txt('¡SOBRECALENTAMIENTO!',cx,y+250,22,'#f44');
  // evento
  if(C.ev){
    ctx.fillStyle=Math.floor(t*6)%2?'#c0392b':'#7b241c'; roundRect(cx,y+275,W-190,90,10); ctx.fill();
    txt(C.ev.txt,cx+20,y+310,20,'#fff');
    txt('Pulsa  ['+C.ev.label+']',cx+20,y+345,26,'#ffd23a','left','900 ');
    ctx.fillStyle='#fff'; ctx.fillRect(cx,y+368,(W-190)*C.ev.t/1.8,4);
  }
  // barra de progreso
  ctx.fillStyle='#333'; ctx.fillRect(x+30,y+H-34,W-60,10); ctx.fillStyle='#5ad1ff'; ctx.fillRect(x+30,y+H-34,(W-60)*C.t/C.dur,10);
}

