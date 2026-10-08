// Revisa el mapa en busca de incoherencias. Uso: node tools/check-map.js
// Carga el juego en una VM (sin navegador) y comprueba carreteras, cruces, lugares y conexiones.
'use strict';
const vm=require('vm'), fs=require('fs'), path=require('path');
const root=path.join(__dirname,'..');
const P=()=>new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:P(),apply:()=>P(),construct:()=>P()});
const IMGD=(w,h)=>({data:new Uint8ClampedArray(w*h*4),width:w,height:h});
const ctx={innerWidth:800,innerHeight:600,addEventListener(){},requestAnimationFrame(){},localStorage:{getItem:()=>null,setItem(){}},
  document:{getElementById:()=>({getContext:()=>P(),addEventListener(){}}),addEventListener(){},createElement:()=>({getContext:()=>new Proxy(P(),{get:(t,k)=>k==='createImageData'?IMGD:P()})})},
  Math,console,performance:{now:()=>0},AudioContext:P(),Image:function(){},Path2D:P(),setTimeout(){},atob:s=>Buffer.from(s,'base64').toString('binary'),btoa:s=>Buffer.from(s,'binary').toString('base64'),location:{search:'',hash:''}};
ctx.window=ctx; vm.createContext(ctx);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const m of html.matchAll(/src="([^"]+)"/g)){ if(m[1].includes('main.js')) continue; vm.runInContext(fs.readFileSync(path.join(root,m[1]),'utf8'),ctx,{filename:m[1]}); }
vm.runInContext(`
const out=[]; const add=(t,x,y)=>out.push({t,x:Math.round(x),y:Math.round(y)});
// 1) finales de calle sin cruce (fondos de saco)
let dead=0; for(const r of ROADS){ if(!r.drive||r.kind==='hwy'||r.kind==='dirt') continue; for(const e of [0,1]) if(!r.ends[e]){ dead++; const p=r.pts[e?r.pts.length-1:0]; add('fondo de saco: '+r.name,p[0],p[1]); } }
// 2) tramos sobre el agua sin ser puente (muestra también el interior de cada segmento)
let wet=0; for(const r of ROADS){ if(r.kind==='rail') continue; let found=false;
  for(let i=0;i<r.pts.length-1&&!found;i++){ const a=r.pts[i],b=r.pts[i+1],n=Math.ceil(dist(a[0],a[1],b[0],b[1])/32);
    for(let k=0;k<=n;k++){ const t=k/n,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,z=r.zs[i]+(r.zs[i+1]-r.zs[i])*t;
      if(isWaterAt(x,y)&&z-groundZ(x,y)<0.5){ wet++; add('carretera en el agua: '+r.name,x,y); found=true; break; } } } }
// 3) lugares lejos de una calle o inalcanzables por carretera
const start=navProject(LOC.home.parkX,LOC.home.parkY);
let far=0, unreach=0; for(const k in LOC){ const L=LOC[k], nr=nearestRoad(L.x,L.y,r=>r.drive); if(nr.d>260){ far++; add('lugar lejos de la calle: '+L.name,L.x,L.y); }
  const route=navRoute(LOC.home.parkX,LOC.home.parkY,undefined,L.x,L.y); const end=route[route.length-2]||route[0]; if(!end||dist(end[0],end[1],L.x,L.y)>700){ unreach++; add('sin ruta desde casa: '+L.name,L.x,L.y); } }
// 4) autopistas que terminan en el agua o sin enlazar
for(const r of ROADS) if(r.kind==='hwy') for(const e of [0,1]){ const p=r.pts[e?r.pts.length-1:0]; if(isWaterAt(p[0],p[1])) add('autopista acaba en el agua: '+r.name,p[0],p[1]); else if(!r.ends[e]) add('autopista sin enlace: '+r.name,p[0],p[1]); }
// 5) rampas de acceso sin conexión en alguno de sus extremos
let rampEnds=0; for(const r of ROADS){ if(r.kind!=='ramp') continue; for(const e of [0,1]) if(!r.ends[e]){ rampEnds++; const p=r.pts[e?r.pts.length-1:0]; add('rampa sin conexión: '+r.name,p[0],p[1]); } }
console.log('Rampas sin conexión: '+rampEnds);
// 6) edificios sobre la calzada
let ov=0; for(const s of solids){ if(s.kind!=='bld'&&s.kind!=='special') continue; if(roadAt(s.x+s.w/2,s.y+s.h/2,0)){ ov++; add('edificio sobre la calzada',s.x,s.y); } }
console.log('Resumen: '+dead+' fondos de saco · '+wet+' carreteras en el agua · '+far+' lugares lejos de la calle · '+unreach+' lugares sin ruta · '+ov+' edificios sobre la calzada · '+ROADS.length+' carreteras · '+CROSSINGS.length+' cruces');
const verbose=${process.argv.includes('-v')};
if(verbose){ for(const r of ROADS.filter(r=>r.kind==='ramp')) console.log(' - '+r.name+': inicio '+(r.ends[0]?'conectado':'libre')+', final '+(r.ends[1]?'conectado':'libre')+', cruces '+r.cross.length);
  for(const o of out) console.log(' - '+o.t+' ('+o.x+','+o.y+')'); }
else for(const o of out.filter(o=>!o.t.startsWith('fondo'))) console.log(' - '+o.t+' ('+o.x+','+o.y+')');
`,ctx);
