"use strict";
// ======================= CINEMÁTICAS — TEMPORADA 4 =======================
(function(){ const {wide,med,low,high,close,det}=SH;

addCutscenes('4x01',[
  {title:'4x01 · Escena 1 — Box Cutter', shots:[
    wide('lab','cold',[ch('W',0.2,{pose:'sit'}),ch('J',0.32,{pose:'sit'}),ch('M',0.5),ch('VI',0.72,{face:-1})],'Luz blanca, fría, quirúrgica. Todos esperan.',{dur:3.6}),
    med('lab','cold',[ch('G',0.15,{act:'walkin'})],'Gus entra. Se quita la chaqueta. Se pone un mono.',{dur:3.4}),
    det('boxcutter','lab','cold','',{dur:2.2}),
    wide('lab','cold',[ch('G',0.62),ch('VI',0.72,{face:-1,act:'fall'})],'',{dur:2.4}),
    close('G','lab','cold','',{say:['G','Bueno. Volved al trabajo.'],dur:3.2}),
  ]},
  {title:'4x01 · Escena 2 — Walter y Jesse encerrados', shots:[
    close('J','lab','cold','El laboratorio es ahora una cárcel.',{tight:true}),
  ]},
]);
addCutscenes('4x02',[
  {title:'4x02 · Escena 1 — Walter compra el arma', shots:[
    det('revolver','office','dim','Movimientos nerviosos. Practica el gesto.',{move:'shake'}),
    close('W','office','dim','Intenta convertirse en alguien capaz de matar a Gus.'),
  ]},
  {title:'4x02 · Escena 2 — Jesse en la fiesta', shots:[
    wide('home','tv',[ch('X',0.15),ch('BA',0.3),ch('J',0.5,{pose:'sit'}),ch('SP',0.7),ch('X',0.85,{face:-1})],'Caos fuera. Vacío dentro.',{move:'shake'}),
  ]},
]);
addCutscenes('4x03',[
  {title:'4x03 · Escena 1 — Marie robando', shots:[
    med('home','clean',[ch('MA',0.45,{act:'walkin'})],'Objetos domésticos como piezas de exposición.',{move:'pan'}),
  ]},
  {title:'4x03 · Escena 2 — Jesse en su casa', shots:[
    wide('home','tv',[ch('X',0.12),ch('X',0.25),ch('J',0.5,{pose:'sit',s:0.8}),ch('X',0.82)],'La casa llena. Jesse, completamente solo.'),
  ]},
]);
addCutscenes('4x04',[
  {title:'4x04 · Escena 1 — Hank investiga a Gale', shots:[
    det('book','office','clean','"W.W."',{dur:2.6}),
    close('H','office','clean','Hank empieza a reconstruir el puzzle.'),
  ]},
  {title:'4x04 · Escena 2 — Walter y Skyler inventan su historia', shots:[
    med('home','warm',[ch('W',0.38,{pose:'sit'}),ch('S',0.62,{pose:'sit',face:-1})],'La casa, una escenografía. Ellos, actores.',{props:[{t:'table',x:0.5}]}),
  ]},
]);
addCutscenes('4x05',[
  {title:'4x05 · Escena 1 — Mike y Jesse', shots:[
    med('street','hard',[ch('M',0.4,{pose:'sit'}),ch('J',0.58,{pose:'sit'})],'Jesse aprende cómo funciona de verdad este mundo.',{move:'pan'}),
  ]},
  {title:'4x05 · Escena 2 — Walter espera', shots:[
    wide('home','dim',[ch('W',0.5,{pose:'sit',s:0.7})],'Cuanto más controla, menos controla.'),
  ]},
]);
addCutscenes('4x06',[
  {title:'4x06 · Escena 1 — Skyler frente a Walter', shots:[
    close('S','home','warm','Le mira como a un desconocido.',{side:-1}),
    close('W','home','warm','',{side:1,dur:2.4}),
  ]},
  {title:'4x06 · Escena 2 — "I am the danger"', shots:[
    close('W','home','dim','',{say:['W','No estoy en peligro, Skyler. Yo soy el peligro.'],tight:true,cam:'close',move:'push',dur:4.4}),
    close('W','home','dim','',{say:['W','Yo soy el que llama a la puerta.'],tight:true,dur:3.6}),
  ]},
]);
addCutscenes('4x07',[
  {title:'4x07 · Escena 1 — Jesse en el grupo de apoyo', shots:[
    close('J','nursing','clean','',{say:['J','¿Y si el perro era un problema... y lo matas?'],dur:4}),
  ]},
  {title:'4x07 · Escena 2 — Walter y Jesse', shots:[
    med('lab','cold',[ch('W',0.32,{pose:'sit'}),ch('J',0.68,{face:-1,pose:'cower'})],'Maestro y alumno. O manipulador y víctima.'),
  ]},
]);
addCutscenes('4x08',[
  {title:'4x08 · Escena 1 — Gus y Max', shots:[
    wide('hacienda','warm',[ch('G',0.42),ch('X',0.55,{face:-1})],'Antes de la transformación.',{dur:3.6}),
  ]},
  {title:'4x08 · Escena 2 — Gus frente a Héctor', shots:[
    med('nursing','clean',[ch('G',0.32),ch('HE',0.68,{face:-1,pose:'sit'})],'Veinte años de odio en una conversación tranquila.',{props:[{t:'wheelchair',x:0.68}]}),
    close('G','nursing','clean','',{say:['G','Mírame, Héctor.']}),
  ]},
]);
addCutscenes('4x09',[
  {title:'4x09 · Escena 1 — Walter ataca a Jesse', shots:[
    med('home','dim',[ch('W',0.42,{pose:'raise'}),ch('J',0.58,{face:-1,pose:'raise'})],'Walter pierde el control.',{move:'fast',dur:2.4}),
  ]},
  {title:'4x09 · Escena 2 — Mike y Gus', shots:[
    wide('office','clean',[ch('M',0.25),ch('G',0.75,{face:-1})],'Fríos, profesionales, a punto de explotar.'),
  ]},
]);
addCutscenes('4x10',[
  {title:'4x10 · Escena 1 — Gus en México', shots:[
    wide('hacienda','hard',[ch('G',0.5,{s:0.6})],'Territorio enemigo.',{move:'push',dur:3.6}),
  ]},
  {title:'4x10 · Escena 2 — Gus envenena al cártel', shots:[
    det('glass','hacienda','hard','Una botella de tequila. Un regalo.'),
    close('G','hacienda','hard','',{say:['G','Salud.'],dur:2.6}),
    wide('hacienda','hard',[ch('X',0.3,{act:'fall'}),ch('X',0.5,{act:'fall'}),ch('G',0.7,{face:-1})],'Todos caen. Gus sigue en pie.',{fx:'slowmo'}),
  ]},
]);
addCutscenes('4x11',[
  {title:'4x11 · Escena 1 — Walter busca el dinero', shots:[
    med('crawl','dim',[ch('W',0.5,{pose:'kneel'})],'Cajones. Aislamiento. Nada.',{move:'fast'}),
  ]},
  {title:'4x11 · Escena 2 — La risa en el suelo', shots:[
    high('crawl','dim',[ch('W',0.5,{pose:'lie'})],'Atrapado bajo su propia casa.',{move:'pull',dur:3.4}),
    close('W','crawl','dim','',{act:'laugh',tight:true,move:'pull',dur:4.6}),
  ]},
]);
addCutscenes('4x12',[
  {title:'4x12 · Escena 1 — Walter espera a Gus', shots:[
    wide('carpark','hard',[],'Cualquier cosa puede ocurrir.',{props:[{t:'aztek',x:0.5,s:0.8}],dur:3.6}),
  ]},
  {title:'4x12 · Escena 2 — Walter prepara la bomba', shots:[
    det('bomb','garage','dim','La química, otra vez, para sobrevivir.',{move:'push'}),
  ]},
]);
addCutscenes('4x13',[
  {title:'4x13 · Escena 1 — Héctor y Gus', shots:[
    med('nursing','clean',[ch('HE',0.6,{pose:'sit',face:-1}),ch('G',0.2,{act:'walkin',from:-0.1})],'Héctor no se mueve. Gus se acerca. La cámara espera.',{props:[{t:'wheelchair',x:0.6}],dur:4}),
    det('bell','nursing','clean','Ding. Ding. Ding.',{dur:2.2}),
    wide('nursing','clean',[],'',{fx:'explosion',move:'shake',dur:2}),
    med('nursing','dim',[ch('G',0.4,{act:'walkout'})],'Gus sale caminando. Como si nada.',{dur:3}),
    close('G','nursing','dim','Se ajusta la corbata. Cae.',{fx:'fadeout',dur:3}),
  ]},
  {title:'4x13 · Escena 2 — Walter y Jesse', shots:[
    med('hospital','clean',[ch('W',0.38),ch('J',0.6,{face:-1})],'',{say:['J','Brock se va a poner bien.']}),
    det('lily','home','warm','Lirio de los valles.'),
    close('W','home','warm','Ya sabe que ha ganado.',{move:'push'}),
  ]},
]);
})();
