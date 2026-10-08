"use strict";
// ======================= EXTRAÑOS Y LOCOS =======================
// Misiones secundarias con personajes episódicos (no de la trama principal). Aparecen en el mapa
// como "?" morado a partir del capítulo `from` (y hasta `to`, si el personaje deja de estar).
//   id, who (nombre en el mapa), at (lugar), dx/dy (desplazamiento del marcador), from/to, title, intro, steps, outro, reward
addSide([
{ id:'bogdan', who:'Bogdan', at:'carwash', dx:60, from:'1x02', to:'3x10', title:'Las alfombrillas', reward:1500,
  intro:[['BG','Walter. Hoy falta gente. Usted limpia los coches. Y bien limpios, no como la última vez.'],['W','Bogdan, tengo un doctorado en química.'],['BG','Y yo tengo lavadero. Venga.']],
  steps:[
    {type:'game', game:'scrub', at:'carwash', title:'Limpia el coche de un cliente', opts:{spots:14,time:20,color:'rgba(90,70,40,'}},
    {type:'game', game:'scrub', at:'carwash', title:'Otro coche. Este lleva barro del desierto', opts:{spots:18,time:22,color:'rgba(150,110,60,'}},
  ],
  outro:[['BG','Bien. Muy bien. ¿Ve? No es tan difícil limpiar coches.'],['W','(Algún día este lavadero será mío.)']] },

{ id:'hugo', who:'Hugo, el conserje', at:'instituto', dx:-60, from:'1x06', to:'2x13', title:'El conserje sabe cosas', reward:2500,
  intro:[['HA','Señor White, ha desaparecido material del laboratorio de química. El director cree que he sido yo.'],['W','(Fui yo.)'],['HA','Si encuentro lo que falta, conservo mi trabajo. ¿Me ayuda a buscar por el instituto?']],
  steps:[
    {type:'collect', at:'instituto', n:4, item:'material de laboratorio', obj:'Encuentra el material escondido por el instituto'},
    {type:'talk', at:'instituto', obj:'Devuélvele el material a Hugo', lines:[['HA','¡Todo! Gracias, señor White. Usted es un buen hombre.'],['W','...De nada, Hugo.']]},
  ] },

{ id:'oldjoe', who:'Old Joe', at:'tuco', dx:80, dy:60, from:'2x01', title:'Chatarra con historia', reward:3000,
  intro:[['OJ','¿Buscas piezas? Aquí tengo de todo. Pero me han robado un coche del desguace esta mañana.'],['OJ','Tráemelo de una pieza... o de varias, me da igual. Es chatarra.']],
  steps:[
    {type:'chase', car:'sedan', name:'Coche robado del desguace', hp:260, obj:'Persigue el coche robado del desguace de Old Joe'},
    {type:'talk', at:'tuco', obj:'Vuelve con Old Joe', lines:[['OJ','Ja, ja. Lo has dejado peor de lo que estaba. Perfecto, así pesa menos en la prensa.']]},
  ] },

{ id:'clovis', who:'Clovis', at:'rvlot', dx:70, from:'2x04', to:'3x05', title:'Bajo el capó', reward:2000,
  intro:[['CL','¿Tú eres el amigo de Jesse? Esa autocaravana tiene la instalación eléctrica hecha un asco.'],['CL','Ayúdame a recablearla y te hago precio de amigo.']],
  steps:[
    {type:'game', game:'wires', at:'rvlot', title:'Recablea la autocaravana', opts:{n:5,time:24}},
  ],
  outro:[['CL','Arranca a la primera. Y nada de preguntas sobre ese olor químico, ¿eh?']] },

{ id:'combo', who:'Combo', at:'spooge', dx:-80, from:'2x05', to:'2x10', title:'La esquina de Combo', reward:3500,
  intro:[['CO','Yo, señor White. Unos tíos se están metiendo en mi esquina. Me han quitado la mercancía.'],['CO','Van en un coche rojo. Tío, si no la recupero, Jesse me mata.']],
  steps:[
    {type:'chase', car:'sedan', name:'Coche de los rivales', hp:240, obj:'Detén el coche de los rivales de Combo'},
    {type:'collect', n:3, item:'bolsa de producto', obj:'Recoge la mercancía que se les ha caído'},
  ],
  outro:[['CO','¡Eres un crack, tío! Te debo una. Bueno... te debo varias.']] },

{ id:'badger', who:'Badger', at:'jesse', dx:90, dy:60, from:'2x05', title:'El guion de Star Trek', reward:1000,
  intro:[['BA','Oiga, señor White, tengo un guion de Star Trek. Escuche: Kirk, Spock y Chekov tienen un concurso de comer tartas...'],['W','Badger...'],['BA','¡No, no, escuche! Es buenísimo. No se me duerma.']],
  steps:[
    {type:'game', game:'balance', title:'No te duermas mientras Badger cuenta su guion', opts:{time:14,drift:0.5,zone:0.26}},
  ],
  outro:[['BA','...y entonces Chekov vomita tarta de arándanos encima de Kirk. Fin.'],['W','Es... algo.'],['BA','¡Sabía que le gustaría!']] },

{ id:'skinny', who:'Skinny Pete', at:'residencia', dx:70, from:'2x05', title:'Bach en el teclado', reward:1000,
  intro:[['SP','¿Sabías que toco el piano, tío? Desde los nueve años. Venga, tócalo conmigo. Sigue las notas.']],
  steps:[
    {type:'game', game:'sequence', title:'Toca a dúo con Skinny Pete', opts:{len:4,rounds:3}},
  ],
  outro:[['SP','Nada mal para un profesor de química, yo.']] },

{ id:'kenwins', who:'Ken Wins', at:'super', dx:-90, from:'1x04', to:'2x06', title:'Ken gana', reward:1500,
  intro:[['KW','(Al teléfono, a gritos) ¡Compra! ¡Compra! ¡Ken gana! ¡Siempre!'],['W','(El del BMW. Otra vez.)']],
  steps:[
    {type:'chase', car:'sedan', name:'BMW de Ken Wins', hp:200, obj:'Dale una lección a Ken Wins y a su BMW'},
  ],
  outro:[['N','La matrícula del BMW, abollada en el suelo: "KEN WINS".'],['W','Hoy no, Ken.']] },

{ id:'francesca', who:'Francesca', at:'saul', dx:-70, dy:40, from:'2x08', title:'Papeles de Saul', reward:2500,
  intro:[['FR','Saul ha perdido unos expedientes. Otra vez. Y si los encuentra la policía, nos vamos todos a la cárcel.'],['FR','Están desperdigados por el aparcamiento. Date prisa.']],
  steps:[
    {type:'collect', at:'saul', n:4, item:'expediente', obj:'Recoge los expedientes de Saul'},
    {type:'talk', at:'saul', obj:'Devuélveselos a Francesca', lines:[['FR','Gracias. No le digas a Saul que me lo has contado. Y que sepas que esto no lo cubre mi sueldo.']]},
  ] },

{ id:'kettleman', who:'Los Kettleman', at:'gretchen', dx:90, from:'2x08', title:'La tienda de campaña', reward:4000,
  intro:[['KE','Nosotros... no sabemos nada de ningún dinero. Nada.'],['N','Saul dice que el dinero de los Kettleman está escondido en una tienda de campaña, junto a su casa.']],
  steps:[
    {type:'game', game:'stealth', at:'gretchen', title:'Entra en la tienda de campaña sin que te vean', opts:{guards:2,items:2}},
    {type:'game', game:'count', title:'Cuenta el dinero escondido', opts:{rounds:2,unit:1000}},
  ],
  outro:[['N','Medio millón en una tienda de campaña. Saul se queda su "comisión", claro.']] },

{ id:'merkert', who:'George Merkert', at:'dea', dx:-80, dy:40, from:'3x08', title:'Informes para el jefe', reward:3000,
  intro:[['GM','Walter, ¿verdad? El cuñado de Hank. Necesito unas muestras del almacén químico para la investigación.'],['W','(Muestras... de mi propio producto.)']],
  steps:[
    {type:'collect', at:'almacen', n:3, item:'muestra', obj:'Recoge las muestras en el almacén químico'},
    {type:'talk', at:'dea', obj:'Entrégaselas a Merkert', lines:[['GM','Gracias. Ese tal Heisenberg es meticuloso. Casi admirable.'],['W','Casi.']]},
  ] },

{ id:'kaylee', who:'Kaylee', at:'hospital', dx:90, dy:-60, from:'3x07', title:'Burbujas en el parque', reward:1500,
  intro:[['M','Mi nieta. Kaylee. Le prometí que jugaríamos un rato. ¿Me ayudas a que no se aburra?'],['KA','¡Explota las burbujas, abuelo!']],
  steps:[
    {type:'game', game:'aim', title:'Explota las burbujas de Kaylee', opts:{need:12,life:1.8,miss:6}},
  ],
  outro:[['KA','¡Otra vez!'],['M','Otro día, cariño. El señor tiene trabajo.']] },

{ id:'lawson', who:'Lawson', at:'pawn', dx:80, dy:60, from:'4x02', title:'Galería de tiro', reward:2000,
  intro:[['LA','Un .38 de cañón corto es bonito, pero hay que saber usarlo. Ven, practica en mi galería.']],
  steps:[
    {type:'game', game:'aim', title:'Prácticas de tiro con Lawson', opts:{need:14,life:1.2,miss:5}},
  ],
  outro:[['LA','Tienes buena mano para ser profesor. Toma, munición de regalo. Y no me cuentes para qué.']],
  done(){ giveGun(60); } },

{ id:'dan', who:'Dan Wachsberger', at:'motel', dx:-80, from:'4x02', to:'5x07', title:'Depósito seguro', reward:5000,
  intro:[['DW','Mike me ha pedido que lleve un dinero a una caja de seguridad. Pero hay un coche patrulla que no me quita ojo.'],['DW','Usted lo lleva. Yo... me quedo aquí, muy tranquilo.']],
  steps:[
    {type:'escape', stars:1, obj:'Lleva el dinero sin que te pare la policía'},
    {type:'goto', at:'carwash', obj:'Deja el dinero en el lavadero'},
  ],
  outro:[['DW','(Al teléfono) Recibido. Mike dice que es usted de fiar. De momento.']] },

{ id:'huell', who:'Huell', at:'saul', dx:80, dy:-60, from:'4x07', title:'Una cama de dinero', reward:3000,
  intro:[['HU','...'],['HU','El jefe dice que hay que apilar esto. Ayúdame. Y no lo cuentes.']],
  steps:[
    {type:'game', game:'count', title:'Apila los fajos con Huell', opts:{rounds:3,unit:1000}},
  ],
  outro:[['HU','Bien. Ahora me echo una siesta. Encima.']] },

{ id:'brock', who:'Brock', at:'jane', dx:90, dy:60, from:'4x13', title:'Una tarde con Brock', reward:1000,
  intro:[['BR','Jesse dice que eres listo. ¿Juegas conmigo a la consola?'],['W','(...)']],
  steps:[
    {type:'game', game:'aim', title:'Juega a la consola con Brock', opts:{need:10,life:1.4,miss:5}},
  ],
  outro:[['BR','Juegas raro. Pero has ganado.'],['N','Walter sonríe. Por dentro, algo no encaja.']] },
]);
