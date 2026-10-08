"use strict";
// ======================= TIENDA =======================
function openShop(){
  const P=G.player;
  const buy=(cost,fn,txt)=>()=>{ if(G.money<cost) return [['N','No tienes suficiente dinero.']]; G.money-=cost; fn(); sfx.cash(); return [['N',txt]]; };
  const fmt=n=>'$'+n.toLocaleString('en-US');
  const weaponsMenu=()=>[{choices:WEAPONS.filter(w=>w.kind==='gun').map(w=>hasWeapon(w.id)
      ? [w.name+': munición x'+w.ammoPack[0]+' — '+fmt(w.ammoPack[1]), buy(w.ammoPack[1],()=>addAmmo(w.id,w.ammoPack[0]),'+'+w.ammoPack[0]+' de munición para '+w.name+'.')]
      : [w.name+' — '+fmt(w.price), buy(w.price,()=>giveWeapon(w.id,w.ammoPack[0]),'Has comprado: '+w.name+'. Rueda del ratón para cambiar de arma.')]).concat([['Volver',()=>[]]])}];
  const chemMenu=()=>{ const ok=WEAPONS.filter(w=>CHEM_UNLOCK[w.id]&&G.mi>=missionIdx(CHEM_UNLOCK[w.id]));
    if(!ok.length) return [['V','No sé de qué me habla. Aquí solo hay herramientas y relojes.']];
    return [['V','Material de laboratorio, sin preguntas. Lo que haga usted con él es cosa suya.'],
      {choices:ok.map(w=>[w.name+' x'+w.ammoPack[0]+' — '+fmt(w.ammoPack[1]), buy(w.ammoPack[1],()=>giveWeapon(w.id,w.ammoPack[0]),'Walter prepara: '+w.name+'.')]).concat([['Volver',()=>[]]])}]; };
  say([
    ['V','Bienvenido a la casa de empeños. Aquí no se hacen preguntas. ¿Qué necesitas?'],
    {choices:[
      ['Armas y munición…', weaponsMenu],
      ['Reactivos químicos (armas químicas)…', chemMenu],
      ['Chaleco antibalas — $2,500', buy(2500,()=>P.armor=100,'Chaleco equipado.')],
      ['Reparar autocaravana/coches propios — $800', buy(800,()=>{ G.cars.forEach(c=>{ if(c.owned){c.hp=c.maxhp;c.fire=0;} }); },'Vehículos reparados.')],
      ['Nada, gracias', ()=>[]],
    ]},
  ]);
}
