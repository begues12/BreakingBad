"use strict";
// ======================= CINEMÁTICAS — TEMPORADA 2 =======================
(function(){ const {wide,med,low,high,close,det}=SH;

addCutscenes('2x01',[
  {title:'2x01 · Escena 1 — La pistola y el desierto', shots:[
    low('desert','hard',[ch('W',0.5,{s:0.45})],'Walter, diminuto frente a un mundo mucho mayor que él.',{dur:3.6}),
    det('gun','desert','hard','Un arma en el desierto.'),
  ]},
  {title:'2x01 · Escena 2 — Walter calcula cuánto dinero necesita', shots:[
    det('money','home','warm','Cáncer → dinero → producción → riesgo.'),
    close('W','home','warm','',{say:['W','737.000 dólares.']}),
  ]},
]);
addCutscenes('2x02',[
  {title:'2x02 · Escena 1 — Walter y Jesse secuestrados', shots:[
    med('home','hard',[ch('W',0.32,{pose:'sit'}),ch('J',0.48,{pose:'sit'}),ch('HE',0.75,{pose:'sit',face:-1})],'Una casa en el desierto que parece una prisión.',{props:[{t:'wheelchair',x:0.75},{t:'bell',x:0.79,y:0.6}],light:'hard'}),
    det('bell','home','hard','Ding.',{dur:2}),
  ]},
  {title:'2x02 · Escena 2 — Hank llega al lugar', shots:[
    wide('desert','hard',[ch('H',0.3,{pose:'shoot'}),ch('T',0.75,{face:-1,pose:'shoot'})],'Exteriores abiertos. Aquí Hank tiene ventaja.',{move:'shake'}),
    wide('desert','hard',[ch('T',0.7,{act:'fall'})],'',{fx:'flash',dur:2}),
  ]},
]);
addCutscenes('2x03',[
  {title:'2x03 · Escena 1 — Desnudo en el supermercado', shots:[
    wide('market','fluor',[ch('W',0.5,{body:'#e7bf9c',pants:'#e7bf9c',s:0.8})],'La cámara no lo trata como algo espectacular. Por eso funciona.',{dur:3.6}),
  ]},
  {title:'2x03 · Escena 2 — Jesse interrogado', shots:[
    med('interrog','fluor',[ch('J',0.35,{pose:'sit'}),ch('H',0.68,{face:-1})],'Luz fluorescente. Jesse improvisa.'),
    close('J','interrog','fluor','',{say:['J','¿Qué autocaravana? Yo no sé nada de una autocaravana.']}),
  ]},
]);
addCutscenes('2x04',[
  {title:'2x04 · Escena 1 — Jesse vuelve a su casa', shots:[
    wide('street','hard',[ch('J',0.5,{s:0.6})],'Jesse, aislado en el encuadre. Lo está perdiendo todo.',{dur:3.6}),
  ]},
  {title:'2x04 · Escena 2 — Walter y Skyler', shots:[
    med('home','warm',[ch('W',0.25),ch('S',0.8,{face:-1})],'En la misma habitación. Cada vez más lejos.',{props:[{t:'table',x:0.52}]}),
  ]},
]);
addCutscenes('2x05',[
  {title:'2x05 · Escena 1 — Jesse organiza su distribución', shots:[
    med('street','night',[ch('J',0.3),ch('BA',0.5,{face:-1}),ch('SP',0.66,{face:-1})],'Badger, Skinny Pete, Combo. El negocio ya es una estructura.',{move:'pan'}),
  ]},
  {title:'2x05 · Escena 2 — Hank recibe reconocimiento', shots:[
    med('office','clean',[ch('H',0.5)],'Hank, en el centro. Heisenberg, cada vez más cerca de él.'),
    close('H','office','clean','',{say:['H','Ese tal Heisenberg... lo voy a pillar.']}),
  ]},
]);
addCutscenes('2x06',[
  {title:'2x06 · Escena 1 — La casa de los drogadictos', shots:[
    med('basement','dim',[ch('J',0.45,{act:'walkin'})],'Oscura, sucia. Lo descubrimos a la vez que Jesse.',{move:'shake'}),
  ]},
  {title:'2x06 · Escena 2 — El niño', shots:[
    med('home','warm',[ch('J',0.45,{pose:'kneel'})],'Una faceta protectora que Jesse suele esconder.',{props:[{t:'tv',x:0.75}]}),
    close('J','home','warm','',{say:['J','Eh, colega. ¿Tienes hambre?']}),
  ]},
]);
addCutscenes('2x07',[
  {title:'2x07 · Escena 1 — Jesse y Tuco', shots:[
    close('T','junkyard','hard','La cámara tampoco es estable. Tuco es imprevisible.',{move:'shake'}),
  ]},
  {title:'2x07 · Escena 2 — Hank después de Tuco', shots:[
    wide('office','dim',[ch('H',0.5,{pose:'sit'})],'Hank, solo en un encuadre demasiado amplio.'),
    close('H','office','dim','Las consecuencias de la violencia.',{move:'push'}),
  ]},
]);
addCutscenes('2x08',[
  {title:'2x08 · Escena 1 — Primera aparición de Saul Goodman', shots:[
    wide('office','clean',[ch('SA',0.5)],'Banderas, carteles, la Estatua de la Libertad. Otro mundo.'),
    close('SA','office','clean','',{say:['SA','¿Problemas con la ley? Better call Saul!']}),
  ]},
  {title:'2x08 · Escena 2 — Saul en el agujero', shots:[
    high('desert','hard',[ch('SA',0.5,{pose:'kneel'})],'Saul, literalmente debajo de ellos.',{props:[{t:'hole',x:0.5,y:0.86}]}),
    low('desert','hard',[ch('W',0.4,{hat:true}),ch('J',0.6,{face:-1})],'',{say:['SA','¡Fue Ignacio! ¡Fue Ignacio!']}),
  ]},
]);
addCutscenes('2x09',[
  {title:'2x09 · Escena 1 — La autocaravana en el desierto', shots:[
    wide('desert','hard',[],'Dos personas en una caja pequeña, en un espacio gigantesco.',{props:[{t:'rv',x:0.5,s:0.45}],dur:3.6}),
  ]},
  {title:'2x09 · Escena 2 — La batería no funciona', shots:[
    med('rv','hard',[ch('W',0.4),ch('J',0.6,{face:-1})],'Cuanta más desesperación, más cerca la cámara.',{move:'push'}),
    det('battery','rv','hard','Monedas, esponjas, ácido.'),
    close('J','rv','hard','',{say:['J','¡Es usted un puto genio, señor White!']}),
  ]},
]);
addCutscenes('2x10',[
  {title:'2x10 · Escena 1 — Remisión', shots:[
    med('home','warm',[ch('S',0.3),ch('W',0.5),ch('WJ',0.7,{face:-1})],'Debería ser un momento feliz.'),
  ]},
  {title:'2x10 · Escena 2 — El dispensador', shots:[
    med('hospital','fluor',[ch('W',0.5,{act:'shake',pose:'raise'})],'Un objeto cotidiano. Una válvula de escape para la rabia.',{move:'static'}),
  ]},
]);
addCutscenes('2x11',[
  {title:'2x11 · Escena 1 — Walter conoce a Gus', shots:[
    med('diner','clean',[ch('W',0.35,{pose:'sit'}),ch('G',0.62,{face:-1})],'Gus, centrado y ordenado. Control absoluto.',{props:[{t:'counter',x:0.5}]}),
    close('G','diner','clean','',{say:['G','No trabajo con gente impredecible.']}),
  ]},
  {title:'2x11 · Escena 2 — Jesse conoce a Jane', shots:[
    close('JA','home','warm','La luz cambia cuando Jesse está con ella.',{move:'drift'}),
  ]},
]);
addCutscenes('2x12',[
  {title:'2x12 · Escena 1 — Jesse y Jane', shots:[
    med('home','dim',[ch('J',0.4,{pose:'lie'}),ch('JA',0.6,{pose:'lie'})],'Hipnótico y peligroso a la vez.',{move:'drift'}),
  ]},
  {title:'2x12 · Escena 2 — Walter observa', shots:[
    med('home','dim',[ch('JA',0.35,{pose:'lie'}),ch('W',0.7,{face:-1})],'Podría intervenir.',{dur:4}),
    close('W','home','dim','La cámara prolonga el momento.',{tight:true,dur:4}),
  ]},
]);
addCutscenes('2x13',[
  {title:'2x13 · Escena 1 — Jane y Walter', shots:[
    close('W','home','dim','Observa. No interviene.',{dur:3.6}),
  ]},
  {title:'2x13 · Escena 2 — El accidente aéreo', shots:[
    wide('sky','clean',[],'Sobre Albuquerque.',{props:[{t:'plane',x:0.3,y:0.3},{t:'plane',x:0.7,y:0.28}],dur:2.6}),
    wide('sky','clean',[],'',{fx:'explosion',dur:2.2}),
    det('teddy','pool','clean','Una decisión privada. Consecuencias enormes.',{fx:'slowmo'}),
  ]},
]);
})();
