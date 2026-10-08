"use strict";
// ======================= TEMPORADA 4 =======================
addMissions([
{ code:'4x01', season:'T4', title:'Box Cutter', reward:0,
  intro:[['N','Victor ha atrapado a Walter. Lo llevan al laboratorio. Jesse llega poco después.']],
  steps:[
    {type:'goto', at:'lavanderia', obj:'Te llevan al laboratorio', lines:[
      ['W','Si me matáis, no tenéis cocinero. Gale está muerto. Sin mí, no hay producto.'],
      ['N','Gus entra. Se quita la chaqueta. Se pone un mono. Coge un cúter.'],
      ['N','Sin decir una palabra, le corta el cuello a Victor delante de vosotros.'],
      ['G','Bueno. Volved al trabajo.'],
    ]},
    {type:'cook', at:'lavanderia', lab:true, obj:'Vuelve al trabajo'},
  ]},

{ code:'4x02', season:'T4', title:'Thirty-Eight Snub', reward:5000,
  steps:[
    {type:'talk', at:'pawn', money:3000, obj:'Compra un revólver en secreto ($3,000)', lines:[
      ['X','Un .38 de cañón corto. Fácil de esconder. Practique el gesto.'],
    ], done(){ giveGun(30); }},
    {type:'goto', at:'pollos', obj:'Ve a por Gus a su casa (cerca de Los Pollos Hermanos)', lines:[
      ['N','Mike aparece de la nada. Walter guarda el arma. Gus no está.'],
    ]},
    {type:'talk', at:'jesse', obj:'Ve a ver a Jesse', lines:[['N','La casa de Jesse es una fiesta sin fin. Música. Gente. Él en medio, ausente.']]},
  ]},

{ code:'4x03', season:'T4', title:'Open House', reward:5000,
  steps:[
    {type:'talk', at:'hank', obj:'Visita a Hank y Marie', lines:[
      ['MA','(Con un objeto robado de una casa en venta) Hola, soy Tori. Me encanta esta casa.'],
      ['H','Walt... estoy postrado en una cama coleccionando minerales. "Son minerales, Marie".'],
    ]},
    {type:'talk', at:'carwash', obj:'Compra el A1A con Skyler', lines:[
      ['S','Le he bajado el precio a Bogdan. Ahora es nuestro.'],
    ]},
  ]},

{ code:'4x04', season:'T4', title:'Bullet Points', reward:8000,
  steps:[
    {type:'talk', at:'home', obj:'Ensaya con Skyler la historia del dinero (juego)', lines:[
      ['S','La historia es: ganaste dinero contando cartas en el blackjack. Ensayemos.'],
      ['W','¿De verdad es necesario un guion?'],
    ]},
    {type:'talk', at:'hank', obj:'Cena en casa de Hank', lines:[
      ['H','Mira este cuaderno de Gale. "W.W." ¿Walter White? ¡Ja! Es broma. "Woodrow Wilson", seguro.'],
      ['W','...Heisenberg está muerto, ¿no?'],
    ]},
  ]},

{ code:'4x05', season:'T4', title:'Shotgun', reward:10000,
  steps:[
    {type:'goto', at:'motel', obj:'Mike lleva a Jesse a una recogida. Acompañale', lines:[['M','Mantente quieto. Observa. Y no hables.']]},
    {type:'kill', n:3, obj:'¡Emboscada! Unos atracadores intentan robar el dinero'},
    {type:'goto', at:'hank', obj:'Cena con la familia en casa de Hank', lines:[
      ['W','(Borracho) Gale no era ningún genio. Ese tal Heisenberg sigue ahí fuera.'],
      ['H','¿Ah, sí? Bueno... quizá debería echarle un vistazo.'],
    ]},
  ]},

{ code:'4x06', season:'T4', title:'Cornered', reward:5000,
  steps:[
    {type:'talk', at:'home', obj:'Habla con Skyler', lines:[
      ['S','Estás en peligro, Walt. Admítelo.'],
      ['W','¿En peligro? Tú claramente no sabes con quién estás hablando.'],
      ['W','No estoy en peligro, Skyler. YO soy el peligro.'],
      ['W','Un tipo abre su puerta y le pegan un tiro... ¿y crees que ese soy yo? No. Yo soy el que llama a la puerta.'],
    ]},
    {type:'cook', at:'lavanderia', lab:true, obj:'Vuelve al laboratorio'},
  ]},

{ code:'4x07', season:'T4', title:'Problem Dog', reward:8000,
  steps:[
    {type:'chase', car:'sedan', name:'Coche de Jesse', hp:90, obj:'Jesse está fuera de control. Detén su coche', lines:[
      ['J','¡Déjeme en paz, tío! ¡Déjeme!'],
    ]},
    {type:'talk', at:'jesse', obj:'Habla con Jesse', lines:[
      ['W','Tienes que matar a Gus, Jesse. En cuanto tengas la ocasión.'],
      ['J','Mike me tiene vigilado todo el tiempo... Pero vale.'],
    ]},
  ]},

{ code:'4x08', season:'T4', title:'Hermanos', reward:10000,
  steps:[
    {type:'talk', at:'residencia', obj:'Gus visita a Héctor en la residencia', lines:[
      ['G','¿Recuerdas a Max, Héctor? Mi socio. El que mataste delante de mí, en la piscina de Don Eladio.'],
      ['G','He esperado veinte años.'],
      ['HE','*Ding*'],
    ]},
    {type:'talk', at:'hank', obj:'Hank sospecha de Los Pollos Hermanos', lines:[
      ['H','Walt, necesito un chófer. Hay huellas de Fring en el apartamento de Gale.'],
    ]},
  ]},

{ code:'4x09', season:'T4', title:'Bug', reward:5000,
  steps:[
    {type:'goto', at:'pollos', obj:'Lleva a Hank: coloca un localizador en el coche de Gus', lines:[
      ['N','Walter coloca el localizador. Pero Mike ya lo sabe todo.'],
    ]},
    {type:'kill', n:4, at:'desert', obj:'Un francotirador del cártel dispara a los hombres de Gus. Defiéndete', lines:[
      ['J','Gus se ha puesto delante de las balas como si nada. Es... no es humano, tío.'],
    ], start(){ giveGun(30); }},
  ]},

{ code:'4x10', season:'T4', title:'Salud', reward:25000,
  intro:[['N','Gus, Mike y Jesse viajan a México. Jesse tiene que demostrar su receta a los químicos del cártel.']],
  steps:[
    {type:'cook', at:'lavanderia', lab:true, obj:'(Jesse) Cocina delante de los químicos del cártel', pre:[['J','Yo no soy su ayudante. Soy el cocinero.']]},
    {type:'kill', n:5, hp:80, obj:'Gus ha envenenado a Don Eladio. ¡Sal de la hacienda!', lines:[
      ['N','Gus vomita en el baño. Sobrevive. Lleva veinte años preparando esta venganza.'],
    ], start(){ giveGun(40); }},
  ]},

{ code:'4x11', season:'T4', title:'Crawl Space', reward:0,
  steps:[
    {type:'goto', at:'desert', obj:'Gus te lleva al desierto', lines:[
      ['G','Te mataré a ti, a tu mujer, a tu hijo y a tu hija pequeña.'],
    ]},
    {type:'goto', at:'home', obj:'Corre a casa a por el dinero', lines:[
      ['S','Walt... le di el dinero a Ted. Para lo de Hacienda.'],
      ['N','Walter se arrastra por el sótano. Se ríe. Una carcajada histérica que no termina.'],
    ]},
    {type:'talk', at:'saul', obj:'Pide a Saul que llame al "desaparecedor"', lines:[
      ['SA','Medio millón por desaparecer. ¿Lo tienes?'],
      ['W','...No.'],
    ]},
  ]},

{ code:'4x12', season:'T4', title:'End Times', reward:10000,
  steps:[
    {type:'phone', lines:[['J','(Llamada) Brock está en el hospital. Está muy enfermo. La ricina... ¡Usted me la robó!']]},
    {type:'talk', at:'hospital', obj:'Ve al hospital', lines:[
      ['W','Jesse, no fui yo. Piensa: ¿quién puede envenenar a un niño? ¿Quién ha matado a Victor con un cúter?'],
      ['J','...Gus.'],
    ]},
    {type:'goto', at:'pollos', obj:'Coloca una bomba en el coche de Gus', lines:[
      ['N','Gus se detiene junto a su coche. Mira al tejado. Se da la vuelta y se va. Lo ha sabido.'],
    ]},
  ]},

{ code:'4x13', season:'T4', title:'Face Off', reward:100000,
  steps:[
    {type:'talk', at:'residencia', obj:'Visita a Héctor en la residencia', lines:[
      ['W','Héctor. Los dos queremos lo mismo.'],
      ['HE','*Ding*'],
    ]},
    {type:'hold', at:'residencia', secs:10, obj:'Espera fuera de la residencia', lines:[
      ['N','Gus entra en la habitación de Héctor. Héctor lo mira a los ojos. Toca la campanilla. Ding. Ding. Ding.'],
      ['N','Una explosión. Gus sale al pasillo. Se ajusta la corbata. Media cara arrancada. Cae muerto.'],
    ]},
    {type:'kill', n:3, at:'lavanderia', obj:'Asalta el laboratorio y libera a Jesse', start(){ giveGun(40); }},
    {type:'hold', at:'lavanderia', secs:8, obj:'Destruye el laboratorio', lines:[
      ['W','(Por teléfono, a Skyler) Se acabó. He ganado.'],
      ['N','En el jardín de Walter, una planta: lirio de los valles. Venenosa. Fue Walter quien envenenó a Brock.'],
    ]},
  ],
  outro:[['N','FIN DE LA TEMPORADA 4. Walter ya es el villano que decía combatir.']] },
]);
