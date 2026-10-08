"use strict";
// ======================= TIENDA =======================
function openShop(){
  const P=G.player;
  const buy=(cost,fn,txt)=>()=>{ if(G.money<cost) return [['N','No tienes suficiente dinero.']]; G.money-=cost; fn(); sfx.cash(); return [['N',txt]]; };
  say([
    ['V','Bienvenido a la casa de empeños. Aquí no se hacen preguntas. ¿Qué necesitas?'],
    {choices:[
      [P.gun?'Munición x30 — $300':'Pistola + 30 balas — $1,500', P.gun?buy(300,()=>P.ammo+=30,'+30 balas.'):buy(1500,()=>{P.gun=true;P.ammo+=30;},'Has comprado una pistola Ruger.')],
      ['Chaleco antibalas — $2,500', buy(2500,()=>P.armor=100,'Chaleco equipado.')],
      ['Reparar autocaravana/coches propios — $800', buy(800,()=>{ G.cars.forEach(c=>{ if(c.owned){c.hp=c.maxhp;c.fire=0;} }); },'Vehículos reparados.')],
      ['Nada, gracias', ()=>[]],
    ]},
  ]);
}

