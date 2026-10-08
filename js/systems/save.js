"use strict";
// ======================= GUARDADO =======================
function save(){
  try{
    const P=G.player, rv=G.cars.find(c=>c.id===G.rvId);
    localStorage.setItem('heisenberg_save',JSON.stringify({money:G.money,product:G.product,purity:G.purity,heat:G.heat,clock:G.clock,mi:G.mi,step:G.side?G.side.mainStep:G.step,sideDone:G.sideDone||{},soldLbs:G.soldLbs,loyalty:G.loyalty,
      gun:P.gun,ammo:P.ammo,inv:P.inv||{},wsel:P.wsel,armor:P.armor,px:G.inside?G.inside.wx:P.x,py:G.inside?G.inside.wy:P.y,hasRv:!!G.rvId,rvx:rv?rv.x:0,rvy:rv?rv.y:0,ended:G.ended}));
  }catch(e){}
}
function hasSave(){ try{ return !!localStorage.getItem('heisenberg_save'); }catch(e){ return false; } }
function load(){
  let s; try{ s=JSON.parse(localStorage.getItem('heisenberg_save')); }catch(e){}
  newGame(); if(!s) return false;
  Object.assign(G,{money:s.money,product:s.product,purity:s.purity,heat:s.heat,clock:s.clock,mi:s.mi||0,soldLbs:s.soldLbs||0,sideDone:s.sideDone||{},loyalty:s.loyalty,ended:s.ended});
  const P=G.player; P.gun=s.gun; P.ammo=s.ammo; P.inv=s.inv||{}; P.wsel=s.wsel; P.armor=s.armor; P.x=LOC.home.x; P.y=LOC.home.y-10;
  if(s.hasRv){ const rv=spawnCar('rv',LOC.home.parkX-Math.cos(LOC.home.parkA)*150,LOC.home.parkY-Math.sin(LOC.home.parkA)*150,LOC.home.parkA,{owned:true,name:'Autocaravana'}); G.rvId=rv.id; }
  // retomar la misión en el paso guardado
  G.step=(s.step|0)-1; G.ms={}; nextStep();
  return true;
}

