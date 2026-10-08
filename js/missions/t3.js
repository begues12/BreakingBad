"use strict";
// ======================= TEMPORADA 3 =======================
addMissions([
{ code:'3x01', season:'T3', title:'No Más', reward:3000,
  intro:[['N','Dos hombres con trajes plateados se arrastran por el desierto hacia un santuario de la Santa Muerte. Llevan un dibujo de Heisenberg.']],
  steps:[
    {type:'talk', at:'home', obj:'Vuelve a casa', lines:[
      ['S','Quiero el divorcio, Walt. Y quiero que te vayas.'],
      ['W','Lo he dejado, Sky. Se acabó.'],
    ]},
    {type:'talk', at:'residencia', obj:'Visita a Jesse en el centro de rehabilitación', lines:[
      ['J','Yo la maté, señor White. A Jane. Es culpa mía.'],
      ['W','No es culpa tuya, Jesse. Nada de esto lo es.'],
    ]},
  ]},

{ code:'3x02', season:'T3', title:'Caballo sin Nombre', reward:3000,
  steps:[
    {type:'escape', stars:1, obj:'Te ha parado un policía y le has gritado. Huye'},
    {type:'goto', at:'home', obj:'Vuelve a casa, aunque Skyler no quiera', lines:[
      ['S','No puedes estar aquí, Walt.'],
      ['W','Es mi casa. Mis hijos. No me voy a ir.'],
      ['N','Los Primos están dentro de la casa. Esperando con un hacha. Pero reciben un mensaje: "POLLO". Se marchan.'],
    ]},
  ]},

{ code:'3x03', season:'T3', title:'I.F.T.', reward:3000,
  steps:[
    {type:'talk', at:'ted', obj:'Ve a ver a Ted Beneke', lines:[
      ['TE','Walter... esto es incómodo. Skyler y yo...'],
      ['N','Skyler se ha acostado con Ted. "I fucked Ted".'],
    ]},
    {type:'goto', at:'home', obj:'Vuelve a casa', lines:[['N','Walter prepara la cena para sus hijos como si nada hubiera pasado. La guerra doméstica ha empezado.']]},
  ]},

{ code:'3x04', season:'T3', title:'Green Light', reward:5000,
  steps:[
    {type:'chase', car:'sedan', name:'Coche de Ted', hp:80, obj:'Persigue a Ted y sácalo de la carretera', lines:[
      ['W','¡TED!'],
      ['N','Ted escapa a pie. Walter queda como un loco delante de todos.'],
    ]},
    {type:'cook', at:'desert', obj:'Jesse cocina por su cuenta. Cocina con él en el desierto', lines:[
      ['J','Es su receta, señor White. 96%. No es lo mismo sin usted... pero casi.'],
    ]},
  ]},

{ code:'3x05', season:'T3', title:'Más', reward:30000,
  steps:[
    {type:'talk', at:'pollos', obj:'Reúnete con Gus Fring', lines:[
      ['G','Un millón de dólares por tres meses de trabajo, señor White. Un laboratorio de primera.'],
      ['W','No quiero tener nada que ver con esto.'],
      ['G','Un hombre provee para su familia. Aunque no le aprecien.'],
      {choices:[
        ['"Acepto."', ()=>[['G','Una decisión sensata.']]],
        ['"Acepto. Y Jesse viene conmigo."', ()=>{ G.loyalty+=1; return [['G','Será usted responsable de él.']]; }],
      ]},
    ]},
    {type:'goto', at:'lavanderia', obj:'Visita la Lavandería Industrial', lines:[
      ['N','Bajo la lavandería hay un laboratorio impecable. Acero inoxidable. Capacidad industrial.'],
      ['W','...Es perfecto.'],
    ]},
  ]},

{ code:'3x06', season:'T3', title:'Sunset', reward:10000,
  steps:[
    {type:'cook', at:'lavanderia', lab:true, obj:'Primera cocina en el superlaboratorio de Gus'},
    {type:'phone', lines:[['J','(Llamada) ¡Señor White! ¡Hank me ha seguido hasta el desguace! ¡Estoy dentro de la autocaravana!']]},
    {type:'goto', at:'tuco', obj:'Ve al desguace a salvar a Jesse', lines:[
      ['SA','(Llamada falsa a Hank) Agente Schrader, su mujer ha tenido un accidente. Está en el hospital.'],
      ['N','Hank sale corriendo. La autocaravana se convierte en un cubo de metal en la prensa.'],
    ], done(){ loseRV(); }},
  ]},

{ code:'3x07', season:'T3', title:'One Minute', reward:10000,
  intro:[['N','Hank recibe una llamada: "Tienes un minuto. Vienen a por ti".']],
  steps:[
    {type:'goto', at:'super', obj:'Ve al aparcamiento del supermercado con Hank', lines:[
      ['PR','...'],
      ['N','Los Primos aparecen. Uno embiste con su coche.'],
    ], done(){ giveGun(30); }},
    {type:'kill', n:2, hp:220, col:'#ddd', obj:'¡Los Primos! Sobrevive', lines:[
      ['N','Hank, herido, consigue acabar con ellos. Una bala en la cabeza.'],
    ]},
  ]},

{ code:'3x08', season:'T3', title:'I See You', reward:8000,
  steps:[
    {type:'goto', at:'hospital', obj:'Ve al hospital a ver a Hank', lines:[
      ['MA','Está en cirugía. No saben si volverá a andar.'],
      ['G','(Entra en la sala de espera) Lo siento muchísimo. He donado a la investigación de la DEA.'],
      ['W','(Él lo sabía. Lo ha permitido. Gus es mucho más peligroso de lo que pensaba).'],
    ]},
    {type:'cook', at:'lavanderia', lab:true, obj:'Vuelve a la lavandería y cocina'},
  ]},

{ code:'3x09', season:'T3', title:'Kafkaesque', reward:15000,
  steps:[
    {type:'cook', at:'lavanderia', lab:true, obj:'Producción industrial en el laboratorio'},
    {type:'sell', lbs:3, obj:'Jesse vende por su cuenta: 3 lb a sus camellos'},
    {type:'talk', at:'jesse', obj:'Habla con Jesse', lines:[
      ['J','He conocido a alguien en las reuniones. Andrea. Tiene un hijo, Brock.'],
    ]},
  ]},

{ code:'3x10', season:'T3', title:'Fly', reward:5000,
  steps:[
    {type:'hold', at:'lavanderia', secs:20, obj:'Hay una mosca en el laboratorio. ¡Atrápala! (quédate en la lavandería)', lines:[
      ['W','Contaminación. No puede quedar nada. Nada.'],
      ['W','Jesse... ¿sabes en qué momento debería haber muerto? Hay un momento... justo antes... de que todo saliera mal.'],
      ['N','Walter está a punto de confesarle lo de Jane. Calla.'],
    ]},
  ]},

{ code:'3x11', season:'T3', title:'Abiquiu', reward:8000,
  steps:[
    {type:'talk', at:'carwash', obj:'Skyler quiere comprar el lavadero para blanquear el dinero', lines:[
      ['S','El A1A. Lo compraremos. Y lavaremos el dinero aquí. Pero a mi manera.'],
    ]},
    {type:'talk', at:'jane', obj:'Visita a Jesse y Andrea', lines:[
      ['AN','Mi hermano pequeño, Tomás... trabaja para unos camellos. Mató a un amigo de Jesse.'],
      ['J','Los mismos tíos que trabajan para Gus. Voy a matarlos.'],
    ]},
  ]},

{ code:'3x12', season:'T3', title:'Half Measures', reward:20000,
  steps:[
    {type:'talk', at:'saul', obj:'Mike te advierte: no hagas tonterías', lines:[
      ['M','No hagas medias tintas, Walter. O todo o nada. Las medias tintas acaban mal.'],
    ]},
    {type:'goto', at:'spooge', r:300, obj:'Jesse va a enfrentarse a los camellos. Ve allí', lines:[
      ['N','Dos camellos encañonan a Jesse en la esquina.'],
    ]},
    {type:'chase', car:'sedan', name:'Camellos de Gus', hp:60, obj:'¡Atropella a los camellos con el coche antes de que maten a Jesse!', lines:[
      ['W','Corre.'],
      ['N','Walter remata al último. Le grita a Jesse: "¡Corre!".'],
    ], start(){ giveGun(12); }},
    {type:'escape', stars:2, obj:'Huye de la escena'},
  ]},

{ code:'3x13', season:'T3', title:'Full Measure', reward:50000,
  steps:[
    {type:'talk', at:'desert', obj:'Reunión con Gus en el desierto', lines:[
      ['G','Hiciste lo que hiciste. Ahora lo hecho, hecho está. No volverá a pasar.'],
      ['N','Walter sabe que Gus está formando a Gale para sustituirle. Cuando Gale aprenda, Walter morirá.'],
    ]},
    {type:'phone', lines:[
      ['W','(Llamada) Jesse... Mike va a matarme. Ve a casa de Gale. Ahora. Es la única forma.'],
    ]},
    {type:'goto', at:'gale', obj:'Llega al apartamento de Gale antes que Mike', lines:[
      ['GA','¿Jesse? ¿Qué haces aquí?'],
      ['N','Jesse le apunta temblando. Llorando. Dispara.'],
    ]},
  ],
  outro:[['N','FIN DE LA TEMPORADA 3. Walter y Jesse están ahora en guerra abierta con Gus.']] },
]);
