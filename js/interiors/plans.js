"use strict";
// ======================= PLANOS DE INTERIORES =======================
// Leyenda en js/interiors/interiors.js. Cada fila es una franja de celdas; la puerta de
// la calle es la E. Las coordenadas de npcs/uses son en celdas (x columna, y fila).

// --- Casa White (3828 Piermont Dr): rancho de una planta, piscina detrás, garaje doble ---
addInterior('home',{ name:'Casa White',
  floors:[{ name:'Planta baja', map:[
    'gggggggggggggggggggggggggggggggggggggg',
    'g====================================g',
    'g==TTT===~~~~~~~~~~~~~~~~====c=c=====g',
    'g==TTT===~~~~~~~~~~~~~~~~====TTT==P==g',
    'g========~~~~~~~~~~~~~~~~====c=c=====g',
    'g====================================g',
    '######ww#########dd######ww##########',
    '#ZZ:::::::::#.............#,,,,,,,,,#',
    '#::::BBBB:::#VVV..........#,KKKKKK,F#',
    '#::::BBBB:::d....SSSSSS...d,,,,,,,,N#',
    '#::::BBBB:::#.........A...#,,TTTT,,K#',
    '#:::::::::::#...rrrrrrr...#,,TTTT,,O#',
    '###d#########...rrrrrrr...#,,,,,,,,K#',
    '#,,,,,,,,,,,d.............d,,,,,,,,,#',
    '#UUU,,L,#####......P......#####d#####',
    '#,,,,,,,#::::d.................#____#',
    '##d######::::#....ZZZZ.........d_W__#',
    '#,,,L,,,#BB::#.................#_W__#',
    '#,UUU,,,#BB::#####dd############____#',
    '#########::::#ZZ:::::::::#_CCCCC____#',
    '#bb::::::::::#:::::::::::#_CCCCC____#',
    '#bb::::::Z:::#::BBB::::::#_CCCCC____#',
    '#:::::::::::::d::BBB:::D:#_CCCCC__Y_#',
    '################ww#########____EE____#',
  ]}],
  npcs:[{id:'S',x:31,y:10,body:'#1d7a3c',talk:()=>[['S',heisLook()?'El dinero está detrás del aislamiento del garaje. Ten cuidado, Walt.':'¿Has comido algo, Walt? Hay pastel de carne.']]},
        {id:'WJ',x:15,y:11,body:'#7a3a32',talk:()=>[['WJ','Papá, ¿has visto mi desayuno? Es lo más importante del día.']]}],
  uses:[{x:6,y:9,label:'Dormir (guardar)',run:()=>say([['N','Has descansado. Salud restablecida. Partida guardada.'],()=>{ G.player.hp=100; save(); }])},
        {x:34,y:22,label:'Dinero escondido',run:()=>say([['W',heisLook()?'Detrás del aislamiento. Más dinero del que puedo gastar.':'Herramientas, el calentador... nada interesante.']])}],
});

// --- Casa de Jesse (322 16th St SW): estilo colonial español, dos plantas y sótano ---
addInterior('jesse',{ name:'Casa de Jesse', entryFloor:1,
  floors:[
  { name:'Sótano', map:[
    '##################',
    '#________________#',
    '#__MM__________Z_#',
    '#__MM____________#',
    '#________________#',
    '#_____Y__________#',
    '#____________W___#',
    '#______________^^#',
    '##################',
  ]},
  { name:'Planta baja', map:[
    '###########################',
    '#....................#,,,,#',
    '#..SSSS.......VV.....#,,W,#',
    '#..SSSS..............d,,,,#',
    '#........rrrrr.......####d#',
    '#..A.....rrrrr...........,#',
    '#........rrrrr.......#,KKK#',
    '####.#####.....v^....#,,,,#',
    '#..........##.....d..d,,,O#',
    '#..TTTT....##..........,,F#',
    '#..TTTT....##..L,....#,,,N#',
    '#..........##..,,,...#,,,,#',
    '##ww######d####ddd####d####',
    '==========================',
    '==P====c==c========P=======',
    '============EE=============',
  ]},
  { name:'Primera planta', map:[
    '###########################',
    '#::::::::::#,,,,#:::::::::#',
    '#:BBBB:::::#U,,L#:::BBB:::#',
    '#:BBBB:::::#U,,,#:::BBB:::#',
    '#:BBBB:::Z:#,,,,#:::::::Z:#',
    '#::::::::::###d##:::::::::#',
    '#:::::d...........d:::::::#',
    '#######.......v.#####d#####',
    '      #.........#  #,,,,#  ',
    '      ###########  #,H,L#  ',
    '                   ######  ',
  ]}],
  npcs:[{id:'J',floor:1,x:6,y:5,body:'#262626',talk:()=>[['J',['Yo, señor White.','¿Qué pasa, tío? ¿Cocinamos o qué?','Ciencia, perra.'][(Math.random()*3)|0]]]},
        {id:'K8',floor:0,x:4,y:4,body:'#2a2a3a',when:()=>G.mi>=1&&G.mi<=2,talk:()=>[['K8','Suéltame, profesor. No tienes estómago para esto.']]}],
});

// --- Apartamento de Jane (dúplex junto a casa de Jesse) ---
addInterior('jane',{ name:'Apartamento de Jane',
  floors:[{ map:[
    '#####################',
    '#::::::::#,,,,,,#,,,#',
    '#:BBBB:::#KKKOF,#U,L#',
    '#:BBBB:::#,,,,,,#U,,#',
    '#::::::Z:#,,TT,,##d##',
    '#::::::::d,,TT,,,,,,#',
    '####d#####,,,,,,,,,,#',
    '#.........SSSS......#',
    '#..V......rrrr...P..#',
    '#.........rrrr......#',
    '#####ww#####EE#######',
  ]}],
  npcs:[{id:'JA',x:12,y:8,body:'#1a1a1a',when:()=>G.mi<missionIdx('2x13'),talk:()=>[['JA','Jesse no está. Y si viene a buscarle por negocios, mejor váyase.']]}],
});

// --- Saul Goodman & Asociados: recepción con la Estatua de la Libertad y despacho ---
addInterior('saul',{ name:'Saul Goodman & Asociados',
  floors:[{ map:[
    '#######################',
    '#ZZZZZZZZZ#...........#',
    '#.........#..DDDDDD...#',
    '#..P......#..DDDDDD...#',
    '#.........d.....c.....#',
    '#..c.c.c..#..AA...AA..#',
    '#.........#...........#',
    '#,,,,,,,,,####d########',
    '#,,DDDD,,,,,,,,,,,,,,,#',
    '#,,,c,,,,,,,,,,,,,,P,,#',
    '#,,,,,,,,,,,,,,,,,,,,,#',
    '#####ww#####EE####ww###',
  ]}],
  npcs:[{id:'SA',x:16,y:2.6,body:'#5a5b62',talk:()=>[['SA','Si tienes un problema con la ley... ya sabes a quién llamar. ¿Qué te trae por aquí?']]},
        {id:'HU',x:6,y:9.5,body:'#2a2a2a',when:()=>G.mi>=missionIdx('3x01'),talk:()=>[['HU','...']]}],
});

// --- Los Pollos Hermanos: comedor, mostrador, cocina y despacho de Gus ---
addInterior('pollos',{ name:'Los Pollos Hermanos',
  floors:[{ map:[
    '###########################',
    '#,,,,,,,,,,,,#_________#..#',
    '#,cTTc,,cTTc,#_OOO_KKK_#D.#',
    '#,,,,,,,,,,,,#_________d..#',
    '#,cTTc,,cTTc,#_FF__KKK_#..#',
    '#,,,,,,,,,,,,#_________####',
    '#,,,,,,,,,,,,KKKKKKdKKKK__#',
    '#,cTTc,,cTTc,,,,,,,,,,,,,,#',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,#',
    '#,cTTc,,P,,,,,,,,,,,,,P,,,#',
    '#ww#ww#ww#####EE####ww#ww##',
  ]}],
  npcs:[{id:'G',x:25,y:2.5,body:'#eee29a',when:()=>G.mi>=missionIdx('2x11')&&G.mi<=missionIdx('4x13'),talk:()=>[['G','Bienvenido a Los Pollos Hermanos. Donde algo delicioso siempre se está cocinando.']]}],
});

// --- Lavandería Industrial (Lavandería Brillante) y el superlaboratorio bajo tierra ---
addInterior('lavanderia',{ name:'Lavandería Industrial', entryFloor:1,
  floors:[
  { name:'Superlaboratorio', map:[
    '##############################',
    '#____________________________#',
    '#__XXXX____QQQ_____QQQ____ZZ_#',
    '#__XXXX____QQQ_____QQQ____ZZ_#',
    '#__________QQQ_____QQQ_______#',
    '#____________________________#',
    '#__KKKKKKKKKKK____XXXXXX_____#',
    '#______________________MM____#',
    '#__ZZ__________________MM__^^#',
    '##############################',
  ]},
  { name:'Lavandería', map:[
    '##############################',
    '#____________________________#',
    '#_WW_WW_WW_WW_WW_WW_WW____vv_#',
    '#____________________________#',
    '#_KKKKKKKKK______MMMM___ZZZZ_#',
    '#____________________________#',
    '#_WW_WW_WW_WW_WW_WW_WW_______#',
    '#____________________##d######',
    '#____________________#_______#',
    '#####ww#####EE#######ww#######',
  ]}],
  uses:[{floor:0,x:12,y:3,label:'Cocinar en el reactor',run:()=>{ if(labOpen()) interact('lavanderia'); else toast('El laboratorio no está operativo ahora mismo.'); }}],
  npcs:[{id:'VI',floor:1,x:24,y:8.5,body:'#2a2a2a',when:()=>G.mi>=missionIdx('3x05')&&G.mi<missionIdx('4x01'),talk:()=>[['VI','El señor Fring le espera abajo. No toque nada que no deba.']]},
        {id:'GA',floor:0,x:16,y:5,body:'#7a8a6a',when:()=>G.mi>=missionIdx('3x06')&&G.mi<missionIdx('3x13'),talk:()=>[['GA','¡Señor White! Mire esta pureza... es casi poesía.']]}],
});

// --- Casa de Hank y Marie: todo morado y la colección de minerales ---
addInterior('hank',{ name:'Casa de Hank y Marie',
  floors:[{ map:[
    '##########################',
    '#::::::::::#,,,,,,,,,,,,,#',
    '#::BBBB::::#,KKKKKOF,,,,,#',
    '#::BBBB::Z:#,,,,,,,,,,,,,#',
    '#::::::::::#,,,TTTT,,,,,,#',
    '#####d######,,,TTTT,,,,,,#',
    '#..........d,,,,,,,,,,,,,#',
    '#.SSSS.....############d##',
    '#..........#ZZZZZZZZZZ...#',
    '#..rrrr..V.#...D.........#',
    '#..rrrr....d..........P..#',
    '#####ww########EE#########',
  ]}],
  npcs:[{id:'MA',x:16,y:3.5,body:'#6a3a8a',talk:()=>[['MA','¿Te gusta el nuevo color de las cortinas? Se llama "lavanda real".']]},
        {id:'H',x:15,y:9.5,body:'#232323',talk:()=>[['H',G.mi>=missionIdx('5x09')?'Sé quién eres, Walt.':'Son MINERALES, Marie. No rocas. Minerales.']]}],
});

// --- Apartamento de Gale: plantas, karaoke y su pequeño laboratorio casero ---
addInterior('gale',{ name:'Apartamento de Gale',
  floors:[{ map:[
    '######################',
    '#.P.P.P.P.P.#,,,,,,,,#',
    '#...........#,KKKOF,,#',
    '#..SSSS.....#,,,,,,,,#',
    '#..rrrr..V..d,,XX,,,,#',
    '#..rrrr.....#,,XX,,,,#',
    '#...........#####d####',
    '#....DD.....d::::::::#',
    '#.P.....P...#::BBB::Z#',
    '######EE#############',
  ]}],
  npcs:[{id:'GA',x:6,y:4.5,body:'#7a8a6a',when:()=>G.mi<missionIdx('3x13'),talk:()=>[['GA','¿Le apetece un café? Lo preparo con mi propio equipo de destilación.']]}],
});

// --- Lavadero A1A: oficina y caja ---
addInterior('carwash',{ name:'Lavadero A1A',
  floors:[{ map:[
    '##################',
    '#,,,,,,,,#.......#',
    '#,DDDD,,,#..YY...#',
    '#,,c,,,,,d.......#',
    '#,,,,,,,,#..DD...#',
    '#KKKKKK,,#########',
    '#,,,,,,,,,,,,,,P,#',
    '#####EE#####ww####',
  ]}],
  npcs:[{id:'S',x:4,y:3.5,body:'#1d7a3c',when:()=>G.mi>=missionIdx('3x11'),talk:()=>[['S','Las cuentas cuadran al céntimo, Walt. Así es como se blanquea dinero.']]}],
});
