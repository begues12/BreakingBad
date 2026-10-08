"use strict";
// ======================= CINEMÁTICAS — TEMPORADA 5 =======================
(function(){ const {wide,med,low,high,close,det}=SH;

// ---------- parte 1 ----------
addCutscenes('5x01',[
  {title:'5x01 · Escena 1 — 52 años', shots:[
    wide('diner','clean',[ch('W',0.5,{pose:'sit',s:0.7,hat:false})],'Solo en un restaurante. Barba, pelo. Otro hombre.',{move:'push',dur:3.6}),
    det('plate','diner','clean','Beicon en forma de 52.'),
  ]},
  {title:'5x01 · Escena 2 — Imanes', shots:[
    wide('street','night',[],'',{props:[{t:'car',x:0.5,s:1.1}],fx:'flash',move:'shake',dur:2.2}),
    close('J','street','night','',{say:['J','¡Sí, cabrones! ¡Imanes!'],dur:2.6}),
  ]},
]);
addCutscenes('5x02',[
  {title:'5x02 · Escena 1 — Madrigal', shots:[
    wide('office','clean',[ch('X',0.5,{s:0.6})],'Fría, corporativa. El imperio de Gus era mucho mayor.',{move:'pan'}),
  ]},
  {title:'5x02 · Escena 2 — Walter, Jesse y Mike', shots:[
    med('warehouse','dim',[ch('W',0.3),ch('J',0.5),ch('M',0.7)],'Alineados. Una nueva organización.'),
  ]},
]);
addCutscenes('5x03',[
  {title:'5x03 · Escena 1 — Las casas de fumigación', shots:[
    wide('home','warm',[ch('TO',0.2,{act:'walkin'}),ch('J',0.45,{act:'walkin'}),ch('W',0.65,{act:'walkin'})],'Una cadena de producción industrial.',{move:'pan'}),
  ]},
  {title:'5x03 · Escena 2 — Mike reparte el dinero', shots:[
    det('money','warehouse','dim','Sobres, billetes, manos. Funciona como una empresa.'),
    close('M','warehouse','dim','',{say:['M','Pago por riesgo. Para mis chicos.']}),
  ]},
]);
addCutscenes('5x04',[
  {title:'5x04 · Escena 1 — Walter cumple 51', shots:[
    med('home','warm',[ch('W',0.42,{pose:'sit'}),ch('S',0.6,{pose:'sit',face:-1})],'Todo parece normal. Debajo, una tensión enorme.',{props:[{t:'table',x:0.5}]}),
  ]},
  {title:'5x04 · Escena 2 — Skyler en la piscina', shots:[
    wide('pool','warm',[ch('S',0.5,{act:'walkin'})],'',{dur:2.4}),
    close('S','pool','cold','El sonido cambia. Se separa del mundo de Walter.',{fx:'underwater',move:'drift',dur:4}),
  ]},
]);
addCutscenes('5x05',[
  {title:'5x05 · Escena 1 — El robo del tren', shots:[
    wide('train','hard',[ch('J',0.2,{pose:'kneel'}),ch('TO',0.32)],'Un atraco de película.',{move:'pan',dur:3.6}),
    det('barrel','train','hard','Metilamina por agua. Nadie lo sabrá.'),
    med('desert','hard',[ch('W',0.35),ch('J',0.5,{pose:'raise'}),ch('TO',0.62)],'',{say:['J','¡Lo hemos hecho!']}),
  ]},
  {title:'5x05 · Escena 2 — Drew Sharp', shots:[
    wide('desert','hard',[ch('W',0.3),ch('J',0.4),ch('TO',0.5)],'A lo lejos, un chico en bicicleta.',{props:[{t:'bike',x:0.88,s:0.6},{t:'tarantula',x:0.84,s:0.5}],fx:'slowmo',dur:3.6}),
    wide('desert','hard',[],'El horror viene de la decisión, no de la violencia.',{fx:'fadeout',dur:3.2}),
  ]},
]);
addCutscenes('5x06',[
  {title:'5x06 · Escena 1 — Jesse quiere abandonar', shots:[
    med('warehouse','dim',[ch('J',0.35,{pose:'sit'}),ch('W',0.65,{face:-1})],'Jesse, agotado. Walter, tranquilo. Posiciones invertidas.'),
  ]},
  {title:'5x06 · Escena 2 — En el salón', shots:[
    wide('home','warm',[ch('W',0.25,{pose:'sit'}),ch('J',0.75,{pose:'sit',face:-1})],'Simetría. Y vacío entre los dos.'),
    close('W','home','warm','',{say:['W','No estoy en el negocio de la metanfetamina. Estoy en el de los imperios.'],dur:4}),
  ]},
]);
addCutscenes('5x07',[
  {title:'5x07 · Escena 1 — "Say my name"', shots:[
    wide('desert','hard',[ch('W',0.35),ch('D',0.65,{face:-1})],'',{props:[{t:'car',x:0.15,s:0.7},{t:'car',x:0.85,s:0.7}],dur:2.6}),
    close('W','desert','hard','',{say:['W','Di mi nombre.'],cam:'close',tight:true,dur:3}),
    close('D','desert','hard','',{say:['D','...Heisenberg.'],dur:2.6}),
    close('W','desert','hard','',{say:['W','Tienes toda la razón.'],tight:true,move:'push',dur:3}),
  ]},
  {title:'5x07 · Escena 2 — Walter mata a Mike', shots:[
    wide('desert','warm',[ch('M',0.4,{pose:'sit'}),ch('W',0.62,{face:-1})],'A la orilla del río. Sorprendentemente tranquilo.',{dur:3.6}),
    close('M','desert','warm','',{say:['M','Cállate y déjame morir en paz.'],fx:'fadeout',dur:3.6}),
  ]},
]);
addCutscenes('5x08',[
  {title:'5x08 · Escena 1 — Los asesinatos en prisión', shots:[
    wide('interrog','cold',[ch('X',0.3),ch('X',0.6,{face:-1,act:'fall'})],'Dos minutos.',{move:'fast',dur:1.6}),
    wide('hospital','cold',[ch('X',0.5,{act:'fall'})],'Tres prisiones.',{move:'fast',dur:1.6}),
    wide('basement','cold',[ch('X',0.4),ch('X',0.6,{face:-1,act:'fall'})],'Nueve hombres.',{move:'fast',dur:1.6}),
    close('W','home','warm','Una operación logística.',{dur:2.6}),
  ]},
  {title:'5x08 · Escena 2 — Hank encuentra el libro', shots:[
    med('bath','clean',[ch('H',0.5,{pose:'sit'})],'Un baño. Una comida familiar.',{dur:2.6}),
    det('book','bath','clean','"A mi otro W.W. favorito."',{move:'push',dur:3.4}),
    close('H','bath','clean','Hank acaba de descubrir que Walter es Heisenberg.',{tight:true,fx:'fadeout',dur:4}),
  ]},
]);

// ---------- parte 2 ----------
addCutscenes('5x09',[
  {title:'5x09 · Escena 1 — Hank y Walter en el garaje', shots:[
    med('garage','dim',[ch('W',0.28),ch('H',0.72,{face:-1})],'Heisenberg frente al hombre que puede destruirlo.',{dur:3.4}),
    close('H','garage','dim','',{say:['H','Fuiste tú. Siempre fuiste tú.']}),
    close('W','garage','dim','',{say:['W','Quizá tu mejor opción sea andarte con mucho cuidado.'],tight:true,dur:4}),
  ]},
  {title:'5x09 · Escena 2 — Una nueva coartada', shots:[
    det('phone','home','dim','Walter vuelve a ser un estratega.'),
  ]},
]);
addCutscenes('5x10',[
  {title:'5x10 · Escena 1 — Walter entierra el dinero', shots:[
    wide('desert','hard',[ch('W',0.5,{s:0.45,pose:'kneel'})],'Siete barriles. Ochenta millones. Una carga absurda.',{props:[{t:'barrel',x:0.6,s:0.5},{t:'shovel',x:0.45,s:0.5}],dur:3.8}),
  ]},
  {title:'5x10 · Escena 2 — Skyler y Walter', shots:[
    close('S','home','dim','Ya no le mira.'),
  ]},
]);
addCutscenes('5x11',[
  {title:'5x11 · Escena 1 — La confesión falsa', shots:[
    det('tv','home','dim','Heisenberg convierte una confesión en estrategia.'),
    close('W','home','tv','',{say:['W','Mi nombre es Walter Hartwell White...'],fx:'tvglow',dur:3.6}),
  ]},
  {title:'5x11 · Escena 2 — Jesse descubre la verdad', shots:[
    close('J','office','hard','La ricina. Brock. Todo encaja.',{move:'push',dur:4}),
  ]},
]);
addCutscenes('5x12',[
  {title:'5x12 · Escena 1 — Jesse en casa de Walter', shots:[
    med('home','dim',[ch('J',0.5,{act:'walkin'})],'Gasolina.',{move:'drift',dur:3.4}),
  ]},
  {title:'5x12 · Escena 2 — Hank y Jesse', shots:[
    med('home','warm',[ch('H',0.35),ch('J',0.65,{face:-1,pose:'sit'})],'Por fin, una oportunidad de enfrentarse a Walter.'),
  ]},
]);
addCutscenes('5x13',[
  {title:"5x13 · Escena 1 — To'hajiilee", shots:[
    wide('desert','hard',[ch('W',0.5,{s:0.45})],'El paisaje que era su poder ahora lo hace indefenso.',{move:'push',dur:3.6}),
  ]},
  {title:'5x13 · Escena 2 — Hank arresta a Walter', shots:[
    med('desert','hard',[ch('W',0.42,{pose:'kneel'}),ch('H',0.66,{face:-1,pose:'shoot'})],'Heisenberg, por debajo de Hank.',{dur:3.4}),
    close('H','desert','hard','',{say:['H','Walter White, queda detenido.'],dur:3}),
  ]},
]);
addCutscenes('5x14',[
  {title:'5x14 · Escena 1 — Hank', shots:[
    wide('desert','hard',[ch('W',0.3,{pose:'kneel'}),ch('H',0.6,{pose:'kneel',face:-1}),ch('JK',0.75,{face:-1,pose:'shoot'})],'El desierto. La distancia.',{dur:3.6}),
    close('H','desert','hard','',{say:['H','Haz lo que tengas que hacer.'],dur:3.4}),
    wide('desert','hard',[ch('W',0.5,{pose:'lie',s:0.6})],'Walter, insignificante.',{fx:'flash',dur:4}),
  ]},
  {title:'5x14 · Escena 2 — Walter y Skyler', shots:[
    med('home','hard',[ch('S',0.42,{pose:'raise'}),ch('W',0.6,{face:-1})],'La estabilidad de la cámara ha desaparecido.',{move:'shake',dur:3}),
  ]},
  {title:'5x14 · Escena 3 — Holly', shots:[
    close('W','street','warm','',{say:['X','Mamá.'],dur:3.2}),
    close('W','street','warm','La consecuencia, por fin, de frente.',{tight:true,dur:3.6}),
  ]},
]);
addCutscenes('5x15',[
  {title:'5x15 · Escena 1 — La cabaña', shots:[
    wide('snow','cold',[ch('W',0.62,{s:0.5,hat:false})],'Quería un imperio. Está completamente solo.',{props:[{t:'cabin',x:0.35,s:0.7}],dur:4}),
  ]},
  {title:'5x15 · Escena 2 — La televisión', shots:[
    close('W','bar','tv','Su familia lo rechaza. Solo puede mirar.',{fx:'tvglow',move:'push',dur:4.2}),
  ]},
]);
addCutscenes('5x16',[
  {title:'5x16 · Escena 1 — El regreso', shots:[
    low('desert','hard',[ch('W',0.5,{act:'walkin',s:0.8})],'Un western. Heisenberg vuelve para terminar su historia.',{dur:3.8}),
  ]},
  {title:'5x16 · Escena 2 — Walter y Skyler', shots:[
    med('home','dim',[ch('W',0.38,{hat:false}),ch('S',0.62,{face:-1})],'Ya no intenta dominar la conversación.'),
    close('W','home','dim','',{say:['W','Lo hice por mí. Me gustaba. Se me daba bien.'],tight:true,dur:4.6}),
  ]},
  {title:'5x16 · Escena 3 — La ametralladora', shots:[
    det('machinegun','garage','dim','Todo lo que sabe, en una última operación.',{move:'push'}),
    wide('warehouse','hard',[ch('JK',0.4,{act:'fall'}),ch('X',0.55,{act:'fall'}),ch('TO',0.7,{pose:'cower'})],'',{move:'fast',fx:'flash',dur:2.4}),
  ]},
  {title:'5x16 · Escena 4 — Jesse y Todd', shots:[
    close('J','warehouse','hard','Ya no actúa para Walter. Es su propia decisión.',{tight:true,dur:3.6}),
  ]},
  {title:'5x16 · Escena 5 — Walter muere', shots:[
    wide('lab','cold',[ch('W',0.3,{act:'walkin',hat:false})],'El laboratorio completo.',{dur:3.4}),
    det('tank','lab','cold','',{move:'push',dur:2.8}),
    high('lab','cold',[ch('W',0.5,{pose:'lie'})],'Rodeado por aquello que creó.',{move:'pull',dur:4.2}),
    wide('black','clean',[],'Fin.',{dur:3}),
  ]},
]);
})();
