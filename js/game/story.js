"use strict";
// ======================= HISTORIA =======================
// La historia vive en js/missions/*.js (un capítulo = una misión). Aquí solo quedan los
// servicios del mundo abierto: hospital, casa, empeños, cocina libre y venta.
function missionIdx(code){ return MISSIONS.findIndex(m=>m.code===code); }
function passed(code){ return G.mi>missionIdx(code); }          // capítulo ya superado
function canDeal(){ return G.mi>=missionIdx('2x05'); }          // red de camellos de Jesse
function labOpen(){ return G.mi>missionIdx('3x05') && G.mi<=missionIdx('4x13'); } // superlaboratorio de Gus
function tentsOpen(){ return G.mi>missionIdx('5x03'); }        // casas fumigadas de Vamonos Pest

function intro(){ startMission(0); }

function interact(key){
  const P=G.player;
  // lugares con interior: se entra andando y lo que toque de la misión ocurre dentro
  if(INTERIORS[key] && !G.inside && !P.inCar && enterInterior(key)){ missionInteract(key); return true; }
  if(missionInteract(key)) return true;
  // cocina libre
  const cookSpot = key==='desert' || (key==='lavanderia'&&labOpen()) || (key==='vamonos'&&tentsOpen());
  if(cookSpot && G.mi>0){
    if(key==='desert' && !rvNear('desert')){ toast('Trae la autocaravana aquí para cocinar.'); return true; }
    if(G.money<1000){ toast('Necesitas $1,000 para suministros.'); return true; }
    say([['W','Suministros: $1,000. Manos a la obra.'],()=>{G.money-=1000; floater(P.x,P.y,'-$1,000','#f66');}], ()=>startCook(false));
    return true;
  }
  if(key==='tuco' && G.mi>=missionIdx('1x06') && G.mi<missionIdx('2x02')){ sellTo('tuco'); return true; }
  if(key==='hospital'){
    if(P.hp>=100){ toast('Estás bien de salud.'); return true; }
    if(G.money<300){ toast('Tratamiento: $300. No te alcanza.'); return true; }
    G.money-=300; P.hp=100; floater(P.x,P.y,'Curado -$300','#6cf'); sfx.cash(); return true;
  }
  if(key==='pawn'){ openShop(); return true; }
  if(key==='home'){
    say([['N','Has descansado. Salud restablecida. Partida guardada.'],()=>{ P.hp=100; save(); }]);
    return true;
  }
  if(key && key.startsWith('dealer')){ sellTo(key); return true; }
  return false;
}

function sellTo(who){
  const P=G.player;
  if(!canDeal() && who!=='tuco'){ toast('Aún no tienes contactos para vender.'); return; }
  if(G.product<=0){ toast('No tienes producto. Cocina en el desierto.'); return; }
  let lbs, price, heat;
  if(who==='tuco'){ lbs=G.product; price=7000; heat=8; }
  else { lbs=Math.min(1,G.product); price=10000; heat=22; }
  const pay=Math.round(lbs*price*(0.5+G.purity)); // pureza 0.5..0.99 -> 1.0x..1.49x
  G.product=+(G.product-lbs).toFixed(1); if(G.product<=0){ G.product=0; }
  G.money+=pay; G.heat+=heat; G.soldLbs=(G.soldLbs||0)+lbs; sfx.cash();
  floater(P.x,P.y,'+$'+pay.toLocaleString()+'  ('+lbs+' lb)');
  const lines = who==='tuco'
    ? [['T','¡Esto es lo que quiero ver! ¡Azul como el cielo, ese! Aquí tienes: $'+pay.toLocaleString()]]
    : [['J',['Yo, este material vuela. Aquí está lo tuyo.','Los clientes se vuelven locos con el azul.','Tío, la poli está rondando. Mejor no volver muy pronto.'][(Math.random()*3)|0]]];
  say(lines);
  if(G.heat>=100){ G.heat=40; setWanted(2); toast('¡La DEA te ha identificado! Calor al máximo.',5); }
}

