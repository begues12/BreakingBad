"use strict";
// ======================= COCINA (minijuego abstracto) =======================
function startCook(first){
  G.cook={t:0,dur:30,temp:40,band:68,bandW:12,inBand:0,total:0,ev:null,evT:rand(3,6),pen:0,first,done:false,res:null};
}
function updateCook(dt){
  const C=G.cook;
  if(C.done){ if(pressed[' ']||pressed['enter']||pressed['e']||mouse.clicked) finishCook(); return; }
  C.t+=dt;
  // la franja ideal se desplaza poco a poco
  C.band = 68 + Math.sin(C.t*0.35)*10 + Math.sin(C.t*1.3)*3;
  const up = keys['w']||keys['arrowup'], dn = keys['s']||keys['arrowdown'];
  C.temp += (up?38:0)*dt - (dn?38:0)*dt + Math.sin(C.t*2.1)*6*dt - 4*dt;
  C.temp = clamp(C.temp,0,100);
  C.total+=dt; if(Math.abs(C.temp-C.band)<C.bandW/2) C.inBand+=dt;
  if(C.temp>95){ C.pen+=dt*0.08; }
  // eventos
  C.evT-=dt;
  if(!C.ev && C.evT<=0){
    const opts=[['Q','¡Sube la presión! Abre la válvula'],['R','¡Remueve la mezcla!'],['F','¡Ajusta el filtro!'],['T','¡Comprueba el termómetro!']];
    const o=opts[(Math.random()*opts.length)|0]; C.ev={k:o[0].toLowerCase(),label:o[0],txt:o[1],t:1.8}; sfx.blip();
  }
  if(C.ev){
    C.ev.t-=dt;
    for(const k in pressed){ if(k.length===1 && k!=='w'&&k!=='s'){ if(k===C.ev.k){ floater(G.player.x,G.player.y-30,'¡Bien!','#7f7'); C.ev=null; C.evT=rand(3,6); } else { C.pen+=0.03; } break; } }
    if(C.ev && C.ev.t<=0){ C.pen+=0.06; C.ev=null; C.evT=rand(3,6); toast('Evento fallido: pureza reducida',2); }
  }
  if(C.t>=C.dur){
    const ratio=C.inBand/C.total;
    let pur=clamp(0.55+ratio*0.45-C.pen,0.3,0.991);
    const lbs=+(2+ratio*3).toFixed(1);
    C.done=true; C.res={pur,lbs};
  }
}
function finishCook(){
  const C=G.cook, r=C.res;
  // mezcla de pureza ponderada con el stock
  G.purity = G.product>0 ? (G.purity*G.product + r.pur*r.lbs)/(G.product+r.lbs) : r.pur;
  G.product = +(G.product + r.lbs).toFixed(1);
  G.heat += 5;
  const first=C.first; G.cook=null;
  const pct=(r.pur*100).toFixed(1);
  toast('Cocina terminada: '+r.lbs+' lb al '+pct+'% de pureza',5);
  save();
  missionCooked();
}

