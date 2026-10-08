"use strict";
// ======================= TEMPORADA 2 =======================
addMissions([
{ code:'2x01', season:'T2', title:'Seven Thirty-Seven', reward:5000,
  intro:[['W','737.000 dólares. Es lo que necesito para dejar a mi familia segura. Lo he calculado al céntimo.']],
  steps:[
    {type:'talk', at:'jesse', obj:'Habla con Jesse: Tuco está fuera de control', lines:[
      ['J','Tuco ha matado a uno de los suyos a golpes, tío. ¡Delante de nosotros! Somos los siguientes.'],
      ['W','Entonces lo envenenaremos. Ricina.'],
    ]},
    {type:'money', amount:60000, obj:'Cocina y vende para reunir $60,000'},
  ]},

{ code:'2x02', season:'T2', title:'Grilled', reward:8000,
  intro:[['N','Tuco os ha metido en su coche a punta de pistola. Os lleva a una casa perdida en el desierto.']],
  steps:[
    {type:'talk', at:'hector', obj:'En la casa de Héctor Salamanca', lines:[
      ['T','Este es mi tío Héctor. No habla, pero lo oye todo. ¿Verdad, tío?'],
      ['HE','*Ding* *ding*'],
      ['W','(La ricina está en el burrito. Si se lo come...)'],
      ['N','Héctor hace sonar la campanilla. Ha visto algo. Tuco saca la pistola.'],
      ['J','¡Corre, señor White!'],
    ], done(){ giveGun(24); }},
    {type:'kill', n:3, hp:90, obj:'¡Tuco y sus hombres! Defiéndete', lines:[
      ['N','Llega un coche: es Hank, que buscaba a Jesse. Hank mata a Tuco en un tiroteo.'],
      ['W','Tenemos que salir de aquí. Ahora.'],
    ]},
    {type:'escape', stars:2, obj:'Huye por el desierto antes de que Hank te vea'},
  ]},

{ code:'2x03', season:'T2', title:'Bit by a Dead Bee', reward:4000,
  steps:[
    {type:'goto', at:'super', obj:'Ve al supermercado para fabricar tu coartada', lines:[
      ['N','Walter se desnuda en mitad del supermercado. "Fuga disociativa", dirán los médicos.'],
    ]},
    {type:'talk', at:'hospital', obj:'Ingresa en el hospital y engaña a los médicos', lines:[
      ['S','¿Dónde estuviste tres días, Walt?'],
      ['W','No lo sé, Sky. No me acuerdo de nada.'],
    ]},
    {type:'talk', at:'jesse', obj:'Recupera el dinero de la autocaravana con Jesse', lines:[
      ['J','La DEA ha estado en mi casa preguntando por la autocaravana. La he escondido.'],
    ]},
  ]},

{ code:'2x04', season:'T2', title:'Down', reward:3000,
  steps:[
    {type:'talk', at:'jesse', obj:'Ve a casa de Jesse', lines:[
      ['N','La casa de Jesse está vacía. Sus padres se la han quitado.'],
      ['J','Lo he perdido todo, tío. Hasta la moto. Duermo en la autocaravana.'],
    ]},
    {type:'goto', at:'home', obj:'Vuelve a casa con tu familia', lines:[
      ['S','Me estás mintiendo, Walt. No sé en qué, pero me estás mintiendo.'],
      ['N','Skyler se va de casa sin decir adónde.'],
    ]},
    {type:'talk', at:'jesse', obj:'Habla con Jesse', lines:[
      ['W','Somos socios. Pero el que manda soy yo.'],
      ['J','...Vale. Necesito un sitio donde vivir. Y dinero.'],
    ]},
  ]},

{ code:'2x05', season:'T2', title:'Breakage', reward:6000,
  steps:[
    {type:'talk', at:'jesse', obj:'Organiza la red de distribución con Jesse', lines:[
      ['J','Badger, Skinny Pete y Combo. Cada uno su territorio. Yo controlo.'],
      ['W','Yo cocino. Tú gestionas. Nada de errores.'],
    ]},
    {type:'cook', at:'desert', obj:'Cocina una nueva remesa'},
    {type:'sell', lbs:2, obj:'Vende 2 lb a tus camellos (marcadores azules)'},
  ]},

{ code:'2x06', season:'T2', title:'Peekaboo', reward:5000,
  steps:[
    {type:'talk', at:'spooge', obj:'Ve a casa de Spooge: le robó a Skinny Pete', lines:[
      ['N','Dentro hay un niño pequeño delante de la tele. Sucio. Solo.'],
      ['J','Eh, colega... ¿tienes hambre? Toma.'],
      ['N','Los padres vuelven con un cajero automático robado. Mientras intentan abrirlo, la mujer lo deja caer sobre Spooge.'],
      ['J','Vámonos, chaval. Vamos a llamar a alguien que te cuide.'],
    ]},
    {type:'escape', stars:1, obj:'Sal de ahí antes de que llegue la policía'},
  ]},

{ code:'2x07', season:'T2', title:'Negro y Azul', reward:8000,
  intro:[['N','Corre el rumor: Jesse mató a Spooge aplastándolo con un cajero. Nadie se atreve a deberle dinero.']],
  steps:[
    {type:'phone', lines:[['W','(Llamada) Jesse, la reputación es dinero. Expande el negocio.']]},
    {type:'sell', lbs:3, obj:'Vende 3 lb aprovechando tu nueva reputación'},
    {type:'talk', at:'dea', obj:'Pásate por la DEA a ver a Hank', lines:[
      ['H','Me mandan a El Paso, Walt. Los cárteles... van a por los que copian su territorio. Lo del azul tiene a todos nerviosos.'],
    ]},
  ]},

{ code:'2x08', season:'T2', title:'Better Call Saul', reward:5000,
  intro:[['N','Badger ha sido detenido vendiendo a un policía. Necesitáis un abogado. Uno muy especial.']],
  steps:[
    {type:'talk', at:'saul', obj:'Contrata a Saul Goodman', lines:[
      ['SA','¡Better call Saul! Ustedes no necesitan un abogado. Necesitan un abogado CRIMINAL.'],
      ['W','Badger no puede hablar.'],
      ['SA','Badger tiene que entregar a Heisenberg. Pues le daremos un Heisenberg. Un actor. Un "falso" Heisenberg.'],
    ]},
    {type:'hold', at:'saul', secs:10, obj:'Espera mientras Saul monta el engaño'},
    {type:'kill', n:2, at:'saul', obj:'Los hombres de un rival intentan sacar tajada. Encárgate'},
  ],
  outro:[['SA','Bienvenidos a la familia. Y recordad: dinero en efectivo, sospechoso. Dinero lavado, legal.']] },

{ code:'2x09', season:'T2', title:'4 Days Out', reward:12000,
  intro:[['W','Las pruebas... creo que estoy peor. Tengo que dejarlo todo hecho. Una cocina enorme. Ahora.']],
  steps:[
    {type:'goto', at:'desert', car:'rv', obj:'Lleva la autocaravana muy adentro del desierto'},
    {type:'cook', at:'desert', obj:'Cocina la remesa más grande hasta ahora'},
    {type:'hold', at:'desert', secs:15, obj:'¡La batería ha muerto! Fabrica una pila casera (quédate en la autocaravana)', lines:[
      ['J','¿Una batería con monedas, esponjas y ácido? Está loco...'],
      ['N','El motor arranca. Jesse grita de alegría.'],
      ['J','¡Es usted un puto genio, señor White!'],
    ]},
  ]},

{ code:'2x10', season:'T2', title:'Over', reward:5000,
  steps:[
    {type:'talk', at:'hospital', obj:'Recoge los resultados en el hospital', lines:[
      ['X','Señor White, buenas noticias. El tumor ha reducido su tamaño un 80%. Está en remisión.'],
      ['N','Walter va al baño. Golpea el dispensador de toallas hasta abollarlo.'],
    ]},
    {type:'goto', at:'super', obj:'Ve a la ferretería del supermercado', lines:[
      ['N','Dos tipos compran material para cocinar. Novatos.'],
      ['W','Lárgate de mi territorio.'],
    ]},
  ]},

{ code:'2x11', season:'T2', title:'Mandala', reward:20000,
  steps:[
    {type:'talk', at:'saul', obj:'Saul tiene un contacto', lines:[
      ['SA','Hay un distribuidor. Discreto. Muy profesional. Os quiere ver.'],
    ]},
    {type:'cook', at:'desert', obj:'Cocina 38 libras para el distribuidor'},
    {type:'deliver', at:'pollos', lbs:2, pay:120000, obj:'Entrega la mercancía en Los Pollos Hermanos (1 hora, no llegues tarde)', lines:[
      ['G','Señor White. Llega tarde. No vuelva a hacerme esperar.'],
      ['G','Su producto es excelente. Pero no trabajo con drogadictos. Y su socio lo es.'],
    ]},
  ]},

{ code:'2x12', season:'T2', title:'Phoenix', reward:0,
  steps:[
    {type:'talk', at:'jane', obj:'Ve al apartamento de Jane: Jesse quiere su parte', lines:[
      ['JA','480.000 dólares, Walter. Su parte. Si no se la da, llamaré a la policía.'],
      ['W','...Está bien.'],
      ()=>pay(-20000),
    ]},
    {type:'goto', at:'home', obj:'Vuelve a casa: Holly acaba de nacer', lines:[
      ['N','Walter se pierde el nacimiento de su hija Holly. Estaba entregando la mercancía.'],
    ]},
  ]},

{ code:'2x13', season:'T2', title:'ABQ', reward:0,
  steps:[
    {type:'talk', at:'jane', obj:'Vuelve al apartamento de Jane de noche', lines:[
      ['N','Jesse y Jane están inconscientes. Han consumido heroína. Walter zarandea a Jesse y Jane se gira boca arriba.'],
      ['N','Jane empieza a ahogarse con su propio vómito. Walter da un paso hacia ella... y se detiene.'],
      ['N','La mira morir.'],
    ]},
    {type:'goto', at:'home', obj:'Vuelve a casa', lines:[
      ['N','Días después, Donald Margolis, el padre de Jane, vuelve a su torre de control. Destrozado.'],
      ['N','Dos aviones chocan sobre Albuquerque. Restos y un oso de peluche rosa caen en la piscina de los White.'],
      ['S','Me voy, Walt. Con los niños. Lo sé todo. Lo de las drogas.'],
    ]},
  ],
  outro:[['N','FIN DE LA TEMPORADA 2. Walter ha pasado de matar para sobrevivir a dejar morir a alguien para proteger su negocio.']] },
]);
