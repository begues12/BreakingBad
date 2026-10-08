"use strict";
// ======================= CINEMÁTICAS — TEMPORADA 3 =======================
(function(){ const {wide,med,low,high,close,det}=SH;

addCutscenes('3x01',[
  {title:'3x01 · Escena 1 — Walter vuelve a casa', shots:[
    wide('street','hard',[ch('W',0.5,{s:0.55})],'Su "vida normal" ya no encaja con él.',{dur:3.4}),
  ]},
  {title:'3x01 · Escena 2 — Jesse', shots:[
    close('J','nursing','dim','El vacío que ha dejado Jane.',{tight:true,dur:3.6}),
  ]},
]);
addCutscenes('3x02',[
  {title:'3x02 · Escena 1 — Walter en su casa', shots:[
    med('home','warm',[ch('W',0.5)],'Intenta recuperar un espacio que ya ha perdido.'),
  ]},
  {title:'3x02 · Escena 2 — Walter conduce', shots:[
    low('desert','hard',[],'La carretera, otra vez, como transición.',{props:[{t:'aztek',x:0.5,s:0.6}],move:'pan'}),
  ]},
]);
addCutscenes('3x03',[
  {title:'3x03 · Escena 1 — Walter y Skyler', shots:[
    med('home','warm',[ch('W',0.25),ch('S',0.78,{face:-1})],'Un conflicto psicológico. Nada se mueve.'),
  ]},
  {title:'3x03 · Escena 2 — Skyler y Ted', shots:[
    close('TE','office','warm','Encuadres más íntimos. Luz más cálida.'),
  ]},
]);
addCutscenes('3x04',[
  {title:'3x04 · Escena 1 — Walter descubre lo de Ted', shots:[
    close('W','home','warm','Celos. Pérdida de control.',{move:'push',dur:3.6}),
  ]},
  {title:'3x04 · Escena 2 — Jesse cocina', shots:[
    det('crystal','rv','hard','Jesse empieza a tener autonomía.',{move:'fast'}),
    close('J','rv','hard','',{say:['J','96%. No está mal, ¿eh?']}),
  ]},
]);
addCutscenes('3x05',[
  {title:'3x05 · Escena 1 — Gus presenta el laboratorio', shots:[
    wide('lab','cold',[ch('G',0.3),ch('W',0.42)],'Simetría. Casi quirúrgico.',{move:'pan',dur:4}),
  ]},
  {title:'3x05 · Escena 2 — Walter observa el laboratorio', shots:[
    close('W','lab','cold','El lugar perfecto para convertirse en Heisenberg.',{move:'push',dur:4}),
  ]},
]);
addCutscenes('3x06',[
  {title:'3x06 · Escena 1 — El laboratorio', shots:[
    wide('lab','cold',[ch('W',0.36),ch('J',0.62,{face:-1})],'Limpio, ordenado, controlado.',{move:'drift'}),
  ]},
  {title:'3x06 · Escena 2 — Hank encuentra la autocaravana', shots:[
    med('junkyard','hard',[ch('H',0.45,{act:'walkin'})],'A centímetros de descubrirlo todo.',{props:[{t:'rv',x:0.8}],move:'shake'}),
    close('H','junkyard','hard','',{move:'shake',dur:2}),
  ]},
]);
addCutscenes('3x07',[
  {title:'3x07 · Escena 1 — "Tienes un minuto"', shots:[
    close('H','carpark','hard','',{say:['X','Dos hombres vienen a matarte. Tienes un minuto.'],dur:3.4}),
    low('carpark','hard',[ch('PR',0.75,{face:-1,pose:'shoot'}),ch('H',0.3,{pose:'shoot'})],'',{move:'fast',fx:'flash',dur:2}),
  ]},
  {title:'3x07 · Escena 2 — Hank en el aparcamiento', shots:[
    wide('carpark','hard',[ch('H',0.5,{pose:'lie',s:0.7})],'Solo en el espacio. Vulnerable.',{dur:3.6}),
  ]},
]);
addCutscenes('3x08',[
  {title:'3x08 · Escena 1 — Gus en el hospital', shots:[
    med('hospital','clean',[ch('G',0.5)],'Rodeado de caos. Su postura transmite control.'),
  ]},
  {title:'3x08 · Escena 2 — Walter y Jesse', shots:[
    med('lab','cold',[ch('W',0.3),ch('J',0.72,{face:-1})],'Empieza la división.'),
  ]},
]);
addCutscenes('3x09',[
  {title:'3x09 · Escena 1 — Walter cocina', shots:[
    det('crystal','lab','cold','El laboratorio, casi un lugar de culto.',{move:'drift'}),
    wide('lab','cold',[ch('W',0.5)],'',{move:'push'}),
  ]},
  {title:'3x09 · Escena 2 — Jesse y Andrea', shots:[
    med('home','warm',[ch('J',0.42),ch('AN',0.58,{face:-1})],'Una humanidad que Jesse creía perdida.'),
  ]},
]);
addCutscenes('3x10',[
  {title:'3x10 · Escena 1 — La mosca', shots:[
    det('fly','lab','cold','Contaminación.',{dur:2.4}),
    high('lab','cold',[ch('W',0.5,{pose:'raise'})],'El espacio se deforma.',{move:'drift'}),
  ]},
  {title:'3x10 · Escena 2 — Walter y Jesse hablan de Jane', shots:[
    close('W','lab','dim','',{say:['W','Hubo un momento perfecto para morir...'],tight:true,dur:4}),
    close('J','lab','dim','Walter está a punto de confesar. Se contiene.',{tight:true}),
  ]},
]);
addCutscenes('3x11',[
  {title:'3x11 · Escena 1 — Jesse y Andrea', shots:[
    med('home','warm',[ch('J',0.42),ch('AN',0.58,{face:-1})],'Lejos del mundo criminal. Por un momento.'),
  ]},
  {title:'3x11 · Escena 2 — Walter manipula a Jesse', shots:[
    close('W','lab','cold','Walter vuelve a tomar el control.',{cam:'close',move:'push'}),
  ]},
]);
addCutscenes('3x12',[
  {title:'3x12 · Escena 1 — Mike cuenta su historia', shots:[
    close('M','office','dim','',{say:['M','Nada de medias tintas, Walter.'],dur:4.2}),
  ]},
  {title:'3x12 · Escena 2 — Walter atropella a los camellos', shots:[
    wide('street','night',[ch('J',0.25,{pose:'cower'}),ch('X',0.55,{face:-1,pose:'shoot'}),ch('X',0.68,{face:-1})],'',{dur:2}),
    wide('street','night',[],'',{props:[{t:'aztek',x:0.55}],move:'fast',fx:'flash',dur:1.4}),
    close('W','street','night','',{say:['W','Corre.'],dur:2.4}),
  ]},
]);
addCutscenes('3x13',[
  {title:'3x13 · Escena 1 — Walter sabe que Gus va a matarlo', shots:[
    close('W','lab','cold','La geometría del laboratorio ahora es una prisión.',{move:'push',dur:4}),
  ]},
  {title:'3x13 · Escena 2 — Jesse dispara a Gale', shots:[
    med('home','warm',[ch('J',0.35,{pose:'shoot'}),ch('GA',0.68,{face:-1})],'Una puerta. Un arma.',{dur:2.6}),
    close('GA','home','warm','',{say:['GA','No tienes por qué hacer esto...'],dur:2.6}),
    close('J','home','warm','La pausa antes del disparo.',{tight:true,fx:'fadeout',dur:3.4}),
  ]},
]);
})();
