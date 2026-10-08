"use strict";
// ======================= TEMPORADA 5 — PARTE 2 =======================
addMissions([
{ code:'5x09', season:'T5', title:'Blood Money', reward:0,
  steps:[
    {type:'talk', at:'hank', obj:'Ve a casa de Hank: el localizador ha desaparecido', lines:[
      ['W','El localizador estaba en mi coche, Hank. Eras tú.'],
      ['H','Fuiste tú. Siempre fuiste tú.'],
      ['W','Si no estás seguro de quién soy... quizá tu mejor opción sea andarte con mucho cuidado.'],
    ]},
  ]},

{ code:'5x10', season:'T5', title:'Buried', reward:0,
  steps:[
    {type:'goto', at:'tohajiilee', car:'any', obj:'Entierra el dinero en el desierto, en To\'hajiilee', lines:[
      ['N','Siete barriles. Ochenta millones. Walter apunta las coordenadas.'],
    ]},
    {type:'goto', at:'home', obj:'Vuelve a casa'},
    {type:'phone', lines:[['S','(Llamada) Walt. Marie ha estado aquí. Hank quiere tu confesión. Calla y no digas nada.']]},
  ]},

{ code:'5x11', season:'T5', title:'Confessions', reward:0,
  steps:[
    {type:'talk', at:'hank', obj:'Cena en un restaurante con Hank y Marie', lines:[
      ['MA','¿Por qué no te suicidas, Walt?'],
      ['N','Walter les entrega un DVD. Una "confesión": dice que Hank es Heisenberg y que él fue obligado.'],
    ]},
    {type:'talk', at:'saul', obj:'Saul se lleva a Jesse para que desaparezca', lines:[
      ['J','Huell me ha quitado la marihuana... igual que me quitaron el tabaco con la ricina...'],
      ['J','Fue USTED. ¡USTED envenenó a Brock!'],
    ]},
    {type:'chase', car:'sedan', name:'Jesse con gasolina', hp:120, obj:'¡Jesse va a quemar tu casa! Detenle'},
  ]},

{ code:'5x12', season:'T5', title:'Rabid Dog', reward:0,
  steps:[
    {type:'goto', at:'home', obj:'Vuelve a casa: huele a gasolina', lines:[
      ['N','Hank detuvo a Jesse antes de que prendiera fuego. Ahora Jesse colabora con la DEA.'],
    ]},
    {type:'hold', at:'jane', secs:12, obj:'Espera a Jesse en la plaza (la DEA vigila)', lines:[
      ['J','(Grabado) No voy a hacerlo así, Hank. Tengo una idea mejor. Voy a ir a por él donde más le duele.'],
    ]},
  ]},

{ code:'5x13', season:"T5", title:"To'hajiilee", reward:0,
  steps:[
    {type:'phone', lines:[
      ['J','(Llamada) Tengo su dinero, señor White. Lo estoy quemando barril a barril.'],
      ['W','¡No! ¡Ya voy, ya voy!'],
      ['W','(Llamada a Jack) Necesito vuestra ayuda. Coordenadas: To\'hajiilee.'],
    ]},
    {type:'goto', at:'tohajiilee', car:'any', obj:'¡Corre al desierto antes de que quemen el dinero!', lines:[
      ['N','Era un engaño. Hank y Gomez salen de un coche con las armas en alto.'],
      ['W','(Llamada a Jack) ¡No vengáis! ¡Cancelad!'],
      ['H','Walter White... tienes derecho a guardar silencio.'],
      ['N','Por el horizonte aparecen las furgonetas de Jack.'],
    ]},
    {type:'kill', n:6, hp:90, at:'tohajiilee', obj:'Tiroteo en el desierto', start(){ giveGun(40); }},
  ]},

{ code:'5x14', season:'T5', title:'Ozymandias', reward:0,
  steps:[
    {type:'talk', at:'tohajiilee', obj:'Tras el tiroteo', lines:[
      ['W','¡Jack, por favor! Os doy el dinero. ¡Ochenta millones!'],
      ['H','Eres el tío más listo que conozco, y eres demasiado estúpido para ver que lo decidió hace diez minutos.'],
      ['H','Haz lo que tengas que hacer.'],
      ['N','Jack dispara. Walter se derrumba en la arena.'],
      ['W','...Vi morir a Jane. Estaba allí. Podría haberla salvado. Y no lo hice.'],
      ['N','Jack se lleva a Jesse. Encadenado. Le obligarán a cocinar.'],
    ]},
    {type:'talk', at:'home', obj:'Vuelve a casa', lines:[
      ['WJ','¿Es verdad? ¿Mataste al tío Hank?'],
      ['S','¡Fuera de aquí!'],
      ['N','Walter se lleva a Holly. Llora en el coche. "Mama".'],
      ['W','(Por teléfono, sabiendo que la policía escucha) ¡Tú no has hecho nada, Skyler! ¡Todo esto es mío!'],
      ['N','Walter deja a Holly en un camión de bomberos.'],
    ]},
  ]},

{ code:'5x15', season:'T5', title:'Granite State', reward:0,
  intro:[['N','New Hampshire. Una cabaña en la nieve. Walter está completamente solo. Tiene un barril con 11 millones que no sirven para nada.']],
  steps:[
    {type:'phone', lines:[
      ['WJ','(Llamada) ¡No quiero tu dinero! ¿Por qué no te mueres ya?'],
      ['N','En la tele del bar, Gretchen y Elliott minimizan el papel de Walter en Gray Matter.'],
      ['W','...Vuelvo a Albuquerque.'],
    ]},
    {type:'goto', at:'motel', obj:'Has vuelto a Albuquerque. Escóndete en el motel'},
  ]},

{ code:'5x16', season:'T5', title:'Felina', reward:0,
  steps:[
    {type:'talk', at:'gretchen', obj:'Visita a Gretchen y Elliott', lines:[
      ['W','Le daréis 9.720.000 dólares a mi hijo cuando cumpla dieciocho.'],
      ['N','Dos punteros láser rojos aparecen sobre sus pechos. Son Badger y Skinny Pete con punteros.'],
    ]},
    {type:'talk', at:'home', obj:'Visita a Skyler', lines:[
      ['W','Todo lo que hice... lo hice por mí. Me gustaba. Se me daba bien. Y me sentía... vivo.'],
      ['N','Walter acaricia a Holly dormida. Se marcha.'],
    ]},
    {type:'kill', n:6, hp:90, at:'jack', obj:'El complejo de Jack. Activa la ametralladora del maletero', start(){ giveGun(200); }, lines:[
      ['N','Jesse estrangula a Todd con su propia cadena.'],
      ['JK','Si me matas, no sabrás dónde está tu dinero.'],
      ['N','Walter le dispara sin dejarle terminar.'],
      ['W','Hazlo tú, Jesse. Lo quieres.'],
      ['J','No. Hágalo usted.'],
    ]},
    {type:'hold', at:'jack', secs:6, obj:'Jesse escapa en el El Camino. Déjale ir',
      lines:[['N','Jesse atraviesa la verja. Grita y ríe al volante. Libre.']] },
    {type:'goto', at:'jack', obj:'Vuelve al laboratorio de Jack', lines:[
      ['N','Walter acaricia los instrumentos del laboratorio. Su reflejo en el acero.'],
      ['N','La policía entra. Walter yace en el suelo. Sonríe.'],
      ['N','FIN DE BREAKING BAD.'],
    ]},
  ],
  outro:[['N','"Lo hice porque me gustaba." — Gracias por jugar. Sigue en modo libre.']] },
]);
