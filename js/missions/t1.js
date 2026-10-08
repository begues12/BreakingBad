"use strict";
// ======================= TEMPORADA 1 =======================
addMissions([
{ code:'1x01', season:'T1', title:'Pilot', reward:0, cineStart:3,
  steps:[
    {type:'talk', at:'instituto', obj:'Da tu clase de química en el instituto', start(){ setTimeout(()=>toast('WASD moverse/conducir · F coche · E interactuar · ESPACIO freno de mano · Clic disparar · P/M mapa',10),4500); }, lines:[
      ['W','La química es el estudio de la materia. Pero yo prefiero verla como el estudio del cambio.'],
      ['W','Crecimiento, decadencia, transformación. Es fascinante, de verdad.'],
      ['N','Nadie en el aula está escuchando.'],
    ]},
    {type:'talk', at:'carwash', obj:'Ve a tu segundo trabajo: el lavadero', lines:[
      ['X','(Bogdan) Walter, hoy faltan manos fuera. Lava este coche.'],
      ['N','El coche es de Chad, un alumno suyo. Se ríe y le hace fotos mientras Walter frota las llantas.'],
      ['N','Walter tose. No puede respirar. Se desploma junto al coche.'],
    ]},
    {type:'talk', at:'hospital', obj:'Te han llevado al hospital', lines:[
      ['X','Señor White, tiene usted un carcinoma pulmonar. Inoperable. Con tratamiento... quizá un par de años.'],
      ['W','(Tiene mostaza en la bata.)'],
      ['N','Walter no se lo cuenta a nadie. Llega a casa y le dice a Skyler que el día ha ido bien.'],
    ]},
    {type:'goto', at:'spooge', obj:'Acompaña a Hank a la redada de la DEA', lines:[
      ['H','Quédate en el coche, Walt. En serio.'],
      ['N','Los agentes sacan esposado a Emilio Koyama. Desde el coche, Walter ve a otro chico saltar por la ventana del vecino, a medio vestir.'],
      ['W','(...Pinkman. Jesse Pinkman. Un antiguo alumno.)'],
      ['N','Walter no dice nada. Jesse escapa.'],
    ]},
    {type:'talk', at:'jesse', obj:'Esa noche, ve a casa de Jesse Pinkman', lines:[
      ['J','¿Señor White? ¿Qué hace aquí, tío? ¿Me ha seguido?'],
      ['W','Te vi esta mañana, Jesse. Saltando por la ventana mientras la DEA detenía a tu socio.'],
      ['W','Tú conoces el negocio. Yo conozco la química. O cocinas conmigo... o le cuento a la DEA dónde estás.'],
      ['J','...¿Usted? ¿Don Aburrido de los cardiganes?'],
      {choices:[
        ['"Socios al 50%."', ()=>{ G.loyalty+=1; return [['J','Vale... Me gusta cómo suena eso, señor White.']]; }],
        ['"Yo cocino, tú vendes. 70/30."', ()=>{ G.loyalty-=1; return [['J','¿Setenta-treinta? Menudo cabrón está hecho, tío.']]; }],
      ]},
      ['W','Necesitaremos material de laboratorio. Yo me encargo.'],
    ]},
    {type:'collect', at:'instituto', n:3, item:'material de laboratorio', obj:'Llévate material del laboratorio del instituto'},
    {type:'talk', at:'rvlot', money:7000, obj:'Jesse ha encontrado una autocaravana: págala ($7,000)', lines:[
      ['J','Una Fleetwood Bounder. Siete mil. Mi colega Combo dice que el motor está bien... más o menos.'],
      ['W','Son mis ahorros. Todos.'],
    ], done(){ giveRV('rvlot'); }},
    {type:'cook', at:'desert', obj:'Conduce la autocaravana al desierto y cocina', pre:[
      ['W','Nada de atajos. Nada de chapuzas. Precisión.'],
      ['N','MINIJUEGO: mantén la temperatura en la franja verde con W/S y pulsa la tecla de cada evento.'],
    ], lines:[
      ['J','Tío... es lo más puro que he visto en mi vida. ¡Es usted un artista!'],
      ['J','Se lo llevo a Krazy-8. El primo de Emilio. Paga bien.'],
    ]},
    {type:'talk', at:'desert', obj:'Krazy-8 y Emilio llegan al desierto', lines:[
      ['EM','¡Es él! ¡El viejo estaba en la redada con la DEA! ¡Es un chivato!'],
      ['K8','Así que trabajas para la poli, abuelo. Mala elección.'],
      ['W','Esperad. Os enseñaré la receta. Dentro de la autocaravana.'],
      ['N','Walter echa fósforo rojo al agua hirviendo. Gas de fosfina. Sale y sujeta la puerta desde fuera.'],
      ['N','La autocaravana arranca a toda prisa con Walter al volante. Jesse inconsciente. Dos hombres dentro. Se oyen sirenas.'],
    ], done(){ giveGun(12); }},
    {type:'escape', stars:2, obj:'Se oyen sirenas. ¡Pierde a la policía!', lines:[
      ['N','Las sirenas pasan de largo. Eran camiones de bomberos: el desierto se está quemando.'],
      ['N','Walter vuelve a casa. Esa noche, Skyler lo nota distinto. Él también.'],
    ]},
  ],
  outro:[['N','Walter ha cruzado una línea. Ya no hay vuelta atrás.']] },

{ code:'1x02', season:'T1', title:"Cat's in the Bag...", reward:2000,
  intro:[['J','¡Tío, tenemos dos cadáveres en la autocaravana! ¡Bueno... uno y medio! ¡Krazy-8 está vivo!']],
  steps:[
    {type:'goto', at:'desert', car:'rv', obj:'Vuelve con la autocaravana al desierto'},
    {type:'hold', at:'desert', secs:12, obj:'Limpia la autocaravana (quédate cerca)', lines:[
      ['W','Encargaste un contenedor de plástico, Jesse. De POLIETILENO.'],
      ['J','¡Ya me encargo yo del cuerpo! Usted ocúpese del otro.'],
    ]},
    {type:'goto', at:'jesse', obj:'Lleva a Krazy-8 al sótano de Jesse', lines:[
      ['N','Encadenáis a Krazy-8 a una tubería del sótano. Está vivo. Y os ha visto la cara.'],
      ['K8','No tienes estómago para esto, profesor.'],
    ]},
    {type:'collect', at:'jesse', n:3, item:'producto químico', obj:'Consigue material de limpieza en la zona'},
  ]},

{ code:'1x03', season:'T1', title:"...And the Bag's in the River", reward:3000,
  steps:[
    {type:'talk', at:'jesse', obj:'Baja al sótano a hablar con Krazy-8', lines:[
      ['K8','Me llamo Domingo. Mis padres tienen una tienda de muebles. Tú y yo somos iguales, Walter.'],
      ['W','Tengo que decidir si te dejo vivir.'],
      ['N','Walter sube a por un sándwich. Al limpiar los pedazos de un plato roto, falta uno.'],
      {choices:[
        ['Liberarlo', ()=>[['K8','Gracias, profesor...'],['N','Krazy-8 se lanza hacia Walter con el trozo de plato. No hay elección.']]],
        ['Enfrentarte a él', ()=>[['W','Te falta un trozo del plato, Domingo.']]],
      ]},
      ['N','Walter estrangula a Krazy-8 con el candado de la bici. Llora mientras lo hace. "Lo siento".'],
    ]},
    {type:'goto', at:'home', obj:'Vuelve a casa con Skyler', lines:[
      ['S','¿Dónde estabas, Walt? Marie dice que fumas marihuana.'],
      ['W','Sky... tengo cáncer.'],
    ]},
  ]},

{ code:'1x04', season:'T1', title:'Cancer Man', reward:3000,
  steps:[
    {type:'talk', at:'home', obj:'Cuenta a la familia lo del cáncer', lines:[
      ['H','Walt, lo que necesites. Lo que sea.'],
      ['S','Hay un oncólogo, el mejor de la ciudad. Noventa mil dólares.'],
      ['WJ','¿Por qué no luchas, papá? ¿Por qué no luchas?'],
    ]},
    {type:'talk', at:'jesse', obj:'Habla con Jesse', lines:[
      ['J','Mis padres me echaron de casa. Mi hermano pequeño es el niño perfecto.'],
      ['W','Jesse, necesitamos dinero. Ya.'],
    ]},
    {type:'chase', car:'sedan', name:'BMW del capullo', hp:70, obj:'Ese imbécil del BMW te ha robado el aparcamiento. Destrózale el coche', lines:[
      ['W','...Me siento vivo. Por primera vez en años.'],
    ]},
  ]},

{ code:'1x05', season:'T1', title:'Gray Matter', reward:4000,
  steps:[
    {type:'talk', at:'gretchen', obj:'Ve a la fiesta de Elliott y Gretchen', lines:[
      ['EL','Walt, únete a Gray Matter. Te pagaremos el tratamiento. Todo.'],
      ['GR','Por los viejos tiempos, Walt.'],
      {choices:[
        ['Rechazar la oferta', ()=>[['W','No necesito vuestra caridad.'],['N','El orgullo de Walter pesa más que su salud.']]],
        ['Fingir que aceptas', ()=>[['W','Me lo pensaré.'],['N','Walter sabe que nunca aceptará. Mentir ya le sale natural.']]],
      ]},
    ]},
    {type:'talk', at:'jesse', obj:'Ve a ver a Jesse', lines:[
      ['J','He intentado cocinar yo solo con Badger. Sale una mierda. 70% como mucho.'],
      ['W','Lo haremos a mi manera. Calidad. Siempre calidad.'],
    ]},
    {type:'cook', at:'desert', obj:'Cocina en el desierto con la autocaravana'},
  ]},

{ code:'1x06', season:'T1', title:"Crazy Handful of Nothin'", reward:0,
  intro:[['N','La quimioterapia le quita el pelo. Walter se rapa la cabeza. En el espejo ya no ve a un profesor.']],
  steps:[
    {type:'phone', lines:[['J','(Llamada) Señor White... fui a venderle a Tuco Salamanca. Me ha dado una paliza y se ha quedado el producto. Estoy en el hospital.']]},
    {type:'talk', at:'hospital', obj:'Visita a Jesse en el hospital', lines:[
      ['J','Tuco está como una cabra, tío. Ni se le ocurra ir.'],
      ['W','Dame su dirección.'],
    ]},
    {type:'cook', at:'desert', obj:'Prepara un "regalo" para Tuco: cocina en el desierto', pre:[['W','Fulminato de mercurio. Parece cristal. No lo es.']]},
    {type:'talk', at:'tuco', product:1, obj:'Ve al desguace de Tuco con el producto', lines:[
      ['T','¿Tú eres el del cristal azul? ¿El abuelito con gafas?'],
      ['W','Me llaman Heisenberg.'],
      ['N','Walter lanza un fragmento al suelo. Una explosión revienta todas las ventanas.'],
      ['T','...¡Estás loco, güey! ...Me gusta. Cincuenta mil. Y me traes dos libras cada semana.'],
      ()=>pay(50000),
    ]},
  ]},

{ code:'1x07', season:'T1', title:'A No-Rough-Stuff-Type Deal', reward:5000,
  steps:[
    {type:'talk', at:'jesse', obj:'Organízate con Jesse: Tuco quiere más', lines:[
      ['J','¿Dos libras a la semana? Necesitamos metilamina. Mucha.'],
      ['W','Sé dónde hay. Un almacén químico.'],
    ]},
    {type:'collect', at:'almacen', n:4, item:'barril de metilamina', obj:'Roba los barriles de metilamina del almacén'},
    {type:'escape', stars:2, obj:'¡Ha saltado la alarma! Pierde a la policía'},
    {type:'cook', at:'desert', obj:'Cocina la remesa para Tuco'},
    {type:'talk', at:'tuco', product:2, obj:'Entrega 2 lb a Tuco', lines:[
      ['T','¡Esto es lo que quiero ver! ¡Azul como el cielo!'],
      ['N','Uno de los hombres de Tuco hace un comentario. Tuco lo mata a golpes delante de vosotros.'],
      ['J','Tío... tío... tenemos que salir de esto.'],
      ()=>pay(35000),
    ]},
  ],
  outro:[['N','FIN DE LA TEMPORADA 1. Walter ya no solo quiere dinero: empieza a disfrutar del poder.']] },
]);
