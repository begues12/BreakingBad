"use strict";
// ======================= CINEMÁTICAS — TEMPORADA 1 =======================
// La escena 1 se reproduce al empezar la misión; el resto, al completarla.
(function(){ const {wide,med,low,high,close,det}=SH;

// 1x01: las tres primeras escenas son la apertura del juego (se ven al empezar partida)
addCutscenes('1x01',[
  {title:'Breaking Bad', shots:[
    {bg:'title',cam:'wide',light:'clean',dur:4.6,move:'push'},
  ]},
  {title:'1x01 · Apertura — Pantalones en el desierto', shots:[
    wide('desert','hard',[],'Desierto de Nuevo México. Unos pantalones caen del cielo.',{move:'pan',props:[{t:'rv',x:0.55}]}),
    wide('desert','hard',[],'Una autocaravana avanza dando bandazos por la arena.',{props:[{t:'rv',x:0.5}],move:'shake',dur:2.6}),
    low('desert','hard',[ch('W',0.42,{pose:'shoot',outfit:'underwear'})],'Un hombre en calzoncillos apunta a la carretera. Se oyen sirenas.',{props:[{t:'rv',x:0.75}],move:'push'}),
    close('W','desert','hard','',{say:['W','Mi nombre es Walter Hartwell White. Esto no es una admisión de culpa.'],move:'push',dur:4.2}),
  ]},
  {title:'1x01 · Tres semanas antes', shots:[
    {bg:'black',cam:'wide',cap:'Tres semanas antes.',dur:2.6,noFade:true},
    wide('home','warm',[ch('S',0.32,{pose:'sit',y:0.74}),ch('W',0.5,{pose:'sit',y:0.74}),ch('WJ',0.64,{pose:'sit',face:-1,y:0.74}),ch('H',0.84,{face:-1,y:0.9,pose:'raise'}),ch('MA',0.93,{face:-1,y:0.86})],'Albuquerque. Walter White cumple cincuenta años.',{props:[{t:'table',x:0.5,y:0.86,s:1.25,z:0.8},{t:'cake',x:0.41,y:0.86,s:1.25,z:0.81}],dur:4}),
    close('H','home','warm','',{say:['H','¡Eh, poned las noticias! ¡Que salgo yo!'],dur:2.8}),
    det('tv','home','warm','La DEA desmantela un laboratorio de metanfetamina.',{dur:2.8}),
    det('money','home','warm','Una mesa llena de billetes.',{dur:2.4}),
    close('W','home','warm','',{say:['W','Hank... ¿cuánto dinero es eso?'],dur:3}),
    close('H','home','warm','',{say:['H','Unos setecientos mil. Si quieres emoción, Walt, ven un día conmigo a una redada.'],dur:4.2}),
  ]},
  {title:'1x01 · Escena final — La primera línea cruzada', shots:[
    wide('desert','hard',[ch('W',0.3),ch('J',0.45)],'La primera cocina. Lo primero que sale mal.',{props:[{t:'rv',x:0.75}]}),
    close('W','desert','hard','',{say:['W','Ya no hay vuelta atrás.'],move:'push'}),
  ]},
]);
addCutscenes('1x02',[
  {title:'1x02 · Escena 1 — Dos problemas', shots:[
    wide('desert','hard',[ch('W',0.35,{pose:'kneel'}),ch('J',0.6,{face:-1})],'La autocaravana. Un cadáver. Y Krazy-8, vivo.',{props:[{t:'rv',x:0.82}]}),
    med('desert','hard',[ch('W',0.42),ch('J',0.62,{face:-1,pose:'raise'})],'',{say:['J','¿A cara o cruz? ¿En serio vamos a decidirlo así?']}),
  ]},
  {title:'1x02 · Escena 2 — Polietileno', shots:[
    wide('bath','cold',[ch('J',0.68,{face:-1,pose:'cower'})],'El ácido atraviesa la bañera, el suelo y el techo.',{props:[{t:'tub',x:0.4}],fx:'flash'}),
    close('W','bath','cold','',{say:['W','Te dije que necesitábamos polietileno, Jesse.']}),
  ]},
]);
addCutscenes('1x03',[
  {title:'1x03 · Escena 1 — Walter limpia la bañera', shots:[
    med('bath','cold',[ch('W',0.62,{pose:'kneel',face:-1})],'Un baño normal. Lo que Walter está limpiando no lo es.',{props:[{t:'tub',x:0.38}],move:'drift'}),
    close('W','bath','cold','Azulejos, frío, sin salida.',{move:'push'}),
  ]},
  {title:'1x03 · Escena 2 — Walter habla con Krazy-8', shots:[
    wide('basement','dim',[ch('K8',0.3,{pose:'sit'}),ch('W',0.72,{face:-1,pose:'sit'})],'Uno encadenado. El otro con la llave.',{props:[{t:'chain',x:0.26},{t:'plate',x:0.5}]}),
    close('K8','basement','dim','',{say:['K8','No tienes estómago para esto, profesor.'],side:-1}),
    close('W','basement','dim','',{say:['W','Lo siento. Lo siento. Lo siento.'],side:1,dur:3.6}),
  ]},
]);
addCutscenes('1x04',[
  {title:'1x04 · Escena 1 — Walter comunica a la familia que tiene cáncer', shots:[
    med('home','warm',[ch('S',0.3,{pose:'sit'}),ch('W',0.5,{pose:'sit'}),ch('WJ',0.68,{pose:'sit',face:-1}),ch('H',0.86,{face:-1})],'Todavía es un marido y un padre. Todavía.',{props:[{t:'table',x:0.5}]}),
    close('WJ','home','warm','',{say:['WJ','¿Por qué no luchas? ¿Por qué no luchas, papá?']}),
  ]},
  {title:'1x04 · Escena 2 — El instituto después del diagnóstico', shots:[
    high('school','fluor',[ch('W',0.5,{s:0.7})],'Un aula enorme. Un profesor pequeño. Una vida rutinaria.'),
    close('W','school','fluor','',{say:['W','La química es el estudio del cambio.']}),
  ]},
]);
addCutscenes('1x05',[
  {title:'1x05 · Escena 1 — Walter y Gretchen', shots:[
    med('party','clean',[ch('W',0.35),ch('GR',0.68,{face:-1})],'Elegancia, dinero, Gray Matter. La vida que pudo tener.'),
    close('GR','party','clean','',{say:['GR','Elliott y yo queremos pagarte el tratamiento, Walt.']}),
  ]},
  {title:'1x05 · Escena 2 — Walter rechaza la ayuda', shots:[
    close('W','home','warm','',{cam:'close',say:['W','No.'],move:'push',dur:2.6}),
    close('W','home','warm','Sin gritar ni amenazar. El encuadre lo hace definitivo.',{tight:true,dur:2.8}),
  ]},
]);
addCutscenes('1x06',[
  {title:'1x06 · Escena 1 — Walter entra en el local de Tuco', shots:[
    wide('junkyard','hard',[ch('W',0.3,{act:'walkin',hat:false})],'El territorio de Tuco. Walter entra con la cabeza rapada.'),
    low('junkyard','hard',[ch('W',0.38),ch('T',0.66,{face:-1})],'',{say:['W','Me llamo Heisenberg.']}),
  ]},
  {title:'1x06 · Escena 2 — Explosión del fulminato de mercurio', shots:[
    det('crystal','junkyard','hard','"¿Esto es metanfetamina?"',{dur:2}),
    close('T','junkyard','hard','',{dur:1.4,move:'fast'}),
    wide('junkyard','hard',[ch('W',0.38),ch('T',0.66,{face:-1,pose:'cower'})],'',{fx:'explosion',move:'shake',dur:2.2}),
    close('W','junkyard','hard','Después de la explosión, Walter sigue tranquilo.',{say:['W','Mi socio te traerá el dinero.'],move:'push'}),
  ]},
]);
addCutscenes('1x07',[
  {title:'1x07 · Escena final — Walter enseña el producto a Tuco', shots:[
    det('crystal','junkyard','hard','Dos libras. Pureza del 99%.'),
    close('T','junkyard','hard','',{say:['T','¡Esto es lo que quiero ver! ¡Azul!'],move:'fast',dur:2.4}),
    close('W','junkyard','hard','La relación de poder empieza a cambiar.',{move:'push'}),
  ]},
]);
})();
