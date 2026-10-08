"use strict";
// ======================= TEMPORADA 5 — PARTE 1 =======================
addMissions([
{ code:'5x01', season:'T5', title:'Live Free or Die', reward:20000,
  intro:[['N','El portátil de Gus está en la sala de pruebas de la policía. Con las imágenes de las cámaras del laboratorio.']],
  steps:[
    {type:'talk', at:'tuco', obj:'Prepara un electroimán gigante en el desguace', lines:[
      ['M','¿Un imán? ¿En serio?'],
      ['W','Ciencia, Mike. Ciencia.'],
    ]},
    {type:'goto', at:'dea', car:'any', obj:'Aparca el camión junto a la comisaría', lines:[
      ['N','El imán arrastra todo lo metálico de la sala de pruebas. El portátil queda destrozado.'],
      ['J','¡Sí, cabrones! ¡Imanes!'],
    ]},
    {type:'escape', stars:3, obj:'¡Huye con el camión!'},
  ]},

{ code:'5x02', season:'T5', title:'Madrigal', reward:20000,
  steps:[
    {type:'talk', at:'saul', obj:'Reunión con Mike en la oficina de Saul', lines:[
      ['M','Te aguantaré, Walter. Pero yo me encargo de la distribución. Tú cocinas.'],
      ['LY','(Lydia) Puedo conseguir metilamina. Mucha. Mi empresa, Madrigal, la tiene.'],
    ]},
    {type:'chase', car:'sedan', name:'Coche de un testigo', hp:80, obj:'Uno de los hombres de Gus va a hablar. Detenle'},
  ]},

{ code:'5x03', season:'T5', title:'Hazard Pay', reward:40000,
  steps:[
    {type:'talk', at:'vamonos', obj:'Vamonos Pest: casas en fumigación como laboratorios', lines:[
      ['W','Tienda de campaña, fumigación, nadie entra. Tres días por casa. Perfecto.'],
    ]},
    {type:'cook', at:'vamonos', lab:true, obj:'Cocina en una casa bajo la carpa'},
    {type:'sell', lbs:3, obj:'Mike distribuye: vende 3 lb'},
  ]},

{ code:'5x04', season:'T5', title:'Fifty-One', reward:15000,
  steps:[
    {type:'talk', at:'carwash', obj:'Recoge tu Chrysler nuevo en el lavadero', lines:[['N','Walter compra un coche deportivo para él y otro para Junior. Skyler lo mira sin reconocerle.']]},
    {type:'talk', at:'home', obj:'Celebra tu 51 cumpleaños', lines:[
      ['N','Skyler entra en la piscina vestida. Se deja hundir.'],
      ['S','Voy a esperar, Walt. A que el cáncer vuelva.'],
    ]},
  ]},

{ code:'5x05', season:'T5', title:'Dead Freight', reward:60000,
  steps:[
    {type:'goto', at:'tren', obj:'Ve a las vías del tren', lines:[
      ['TO','Me llamo Todd. Trabajo para Vamonos Pest.'],
      ['W','El tren se detendrá aquí. Cambiaremos la metilamina por agua. Nadie sabrá que la robamos.'],
    ]},
    {type:'hold', at:'tren', secs:15, obj:'Bombea la metilamina mientras el tren está parado'},
    {type:'collect', at:'tren', n:3, item:'bidón de metilamina', obj:'Recoge los bidones antes de que el tren arranque', lines:[
      ['J','¡Lo hemos hecho! ¡Nadie lo sabe!'],
      ['N','Un chico en bici, Drew Sharp, os ha visto. Todd saca un arma y le dispara antes de que nadie pueda reaccionar.'],
    ]},
  ]},

{ code:'5x06', season:'T5', title:'Buyout', reward:0,
  steps:[
    {type:'talk', at:'saul', obj:'Mike y Jesse quieren vender su parte de la metilamina', lines:[
      ['M','Cinco millones cada uno, Walter. Un buen trato.'],
      ['W','No estoy en el negocio del dinero. Ni en el de la metanfetamina. Estoy en el negocio de los imperios.'],
    ]},
    {type:'goto', at:'home', obj:'Vuelve a casa: Jesse va a cenar', lines:[
      ['J','Este... está muy bueno el pescado.'],
      ['N','La cena más incómoda del mundo.'],
    ]},
  ]},

{ code:'5x07', season:'T5', title:'Say My Name', reward:80000,
  steps:[
    {type:'talk', at:'desert', obj:'Reunión con Declan en el desierto', lines:[
      ['D','¿Y tú quién demonios eres?'],
      ['W','Ya sabes quién soy. Di mi nombre.'],
      ['D','...Heisenberg.'],
      ['W','Tienes toda la razón.'],
    ]},
    {type:'goto', at:'tohajiilee', obj:'Mike huye. Ve al río donde se esconde', lines:[
      ['N','Walter le dispara a través de la ventanilla del coche. Mike se arrastra hasta la orilla del río.'],
      ['W','Lo siento, Mike. Podría haber conseguido los nombres de Lydia.'],
      ['M','Cállate y déjame morir en paz.'],
    ]},
  ]},

{ code:'5x08', season:'T5', title:'Gliding Over All', reward:200000,
  steps:[
    {type:'talk', at:'jack', obj:'Reúnete con el tío Jack', lines:[
      ['JK','Nueve hombres. Tres prisiones. Dos minutos. Es posible.'],
    ]},
    {type:'hold', at:'jack', secs:10, obj:'Espera: los hombres de Mike en prisión son eliminados', lines:[
      ['N','En dos minutos, los nueve hombres de Mike mueren en tres cárceles distintas.'],
    ]},
    {type:'money', amount:400000, obj:'Cocina y vende: construye tu imperio'},
    {type:'talk', at:'home', obj:'Vuelve a casa', lines:[
      ['S','He apilado el dinero en un trastero. No sé cuánto hay. No se puede contar. ¿Cuánto es suficiente, Walt?'],
      ['W','...Lo dejo.'],
      ['N','Comida familiar. Hank va al baño. Coge un libro: "Hojas de hierba", de Walt Whitman.'],
      ['N','"Para mi otro W.W. favorito. Ha sido un honor trabajar contigo. G.B."'],
      ['H','...'],
    ]},
  ],
  outro:[['N','FIN DE LA PRIMERA MITAD DE LA TEMPORADA 5. Hank sabe que Walter White es Heisenberg.']] },
]);
