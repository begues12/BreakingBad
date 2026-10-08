"use strict";
// ======================= ESTADO =======================
const CARTYPES = {
  sedan:{w:44,h:22,r:20,max:520,acc:380,turn:2.6,hp:100,mass:1},
  aztek:{w:46,h:24,r:21,max:480,acc:350,turn:2.5,hp:120,mass:1.25,color:'#8a9a5b'},
  rv:   {w:70,h:30,r:28,max:340,acc:210,turn:1.75,hp:220,mass:2.6,gripMul:0.85,color:'#e8e2cf'},
  cop:  {w:46,h:22,r:20,max:560,acc:430,turn:2.8,hp:140,mass:1.2,gripMul:1.1,color:'#f2f2f2'},
  ambulance:{w:62,h:28,r:26,max:520,acc:380,turn:2.3,hp:300,mass:2.2,color:'#f4f4f2'},
  dea:  {w:48,h:24,r:21,max:560,acc:430,turn:2.8,hp:160,mass:1.6,gripMul:1.05,color:'#1d1f24'},
};
const CARCOLORS=['#a33','#335','#ddd','#222','#6a6a6a','#2a5a8a','#8a6a2a','#5a2a5a','#c8b070','#3a6a3a','#b55a2a'];

let G; // estado global
function newGame(){
  G = {
    money:8000, product:0, purity:0, heat:0, wanted:0, evadeT:0, bustT:0,
    clock: 9*60, mi:0, step:-1, ms:{}, pickups:[], soldLbs:0, card:null, loyalty:0, rvId:null, sold:{}, kills:0,
    player:{x:LOC.home.x, y:LOC.home.y-10, z:spawnZ(LOC.home.x,LOC.home.y-10), a:-Math.PI/2, hp:100, armor:0, gun:false, ammo:0, cool:0, inCar:null, walk:0},
    cars:[], peds:[], thugs:[], officers:[], bullets:[], decals:[], parts:[], floaters:[],
    nextId:1, dialog:null, cook:null, msg:null, msgT:0, ended:false, flash:0,
  };
  spawnCar('aztek', LOC.home.parkX, LOC.home.parkY, LOC.home.parkA, {owned:true, name:'Pontiac Aztek'});
  for(let i=0;i<34;i++) spawnTraffic(true);
  for(let i=0;i<80;i++) spawnPed(true);
  for(let i=0;i<14;i++) spawnParked();
  cam.x=G.player.x-VW/2; cam.y=G.player.y-VH/2; G.tileWarm=true;
}

function spawnCar(type,x,y,a,extra){
  const T = CARTYPES[type];
  const car = Object.assign({id:G.nextId++, type, x, y, a, v:0, w:T.w, h:T.h, r:T.r, max:T.max, acc:T.acc, turn:T.turn,
    hp:T.hp, maxhp:T.hp, mass:T.mass||1, gripMul:T.gripMul||1, vx:Math.cos(a)*((extra&&extra.v)||0), vy:Math.sin(a)*((extra&&extra.v)||0), av:0, color:T.color||CARCOLORS[(Math.random()*CARCOLORS.length)|0], driver:null,
    fire:0, siren:0, stuck:0, rev:0, dir:0, lastI:'', shootCd:1}, extra||{});
  if(car.z===undefined) car.z=spawnZ(x,y);
  G.cars.push(car); return car;
}
// punto de calle aleatorio cerca del jugador (anillo rmin..rmax)
function roadPointNear(rmin,rmax,filter){
  const P=G.player;
  for(let t=0;t<12;t++){
    const ang=rand(0,Math.PI*2), d=rand(rmin,rmax), x=P.x+Math.cos(ang)*d, y=P.y+Math.sin(ang)*d;
    if(x<0||y<0||x>WW||y>WH) continue;
    const nr=nearestRoad(x,y,filter); if(!nr) continue;
    const dd=dist(nr.x,nr.y,P.x,P.y); if(dd<rmin*0.8||dd>rmax*1.2) continue;
    return nr;
  }
  return null;
}
const SPEED_OF={hwy:330,main:200,street:140,ramp:200,dirt:110,rail:1};
function trafficPos(c){
  const r=ROADS[c.road], p=pointAt(r,c.s), ta=c.dir>0?p.a:p.a+Math.PI;
  return {x:p.x+Math.cos(ta+Math.PI/2)*r.lane, y:p.y+Math.sin(ta+Math.PI/2)*r.lane, a:ta, z:p.z};
}
function spawnTraffic(anywhere){
  for(let tries=0;tries<10;tries++){
    const nr=roadPointNear(anywhere?250:950,anywhere?1600:1500,r=>r.drive&&r.kind!=='dirt'); if(!nr) continue;
    const c={road:nr.r.idx,s:nr.s,dir:Math.random()<.5?1:-1}; const p=trafficPos(c);
    if(G.cars.some(o=>dist(o.x,o.y,p.x,p.y)<90)) continue;
    return spawnCar('sedan',p.x,p.y,p.a,{driver:'ai',road:c.road,s:c.s,dir:c.dir,v:SPEED_OF[nr.r.kind]*0.7,z:p.z});
  }
}
function spawnParked(){
  for(let t=0;t<10;t++){
    const nr=roadPointNear(300,1500,r=>r.kind==='street'||r.kind==='main'); if(!nr) continue;
    const side=Math.random()<.5?1:-1, n=nr.a+Math.PI/2*side, off=nr.r.w/2-12;
    const x=nr.x+Math.cos(n)*off, y=nr.y+Math.sin(n)*off;
    if(hitSolid(x,y,22)||G.cars.some(o=>dist(o.x,o.y,x,y)<60)) continue;
    spawnCar('sedan',x,y,nr.a+(side<0?Math.PI:0),{parked:true}); return;
  }
}
const PEDCOL=['#c33','#36c','#3a3','#cc3','#a5a','#eee','#333','#e83','#6cc'];
const PED_ROAD=r=>r.kind==='street'||r.kind==='main';
function sidewalkPos(r,sv,side){ const p=pointAt(r,sv), n=p.a+Math.PI/2; const off=r.w/2+SIDEWALK*0.55; return {x:p.x+Math.cos(n)*off*side, y:p.y+Math.sin(n)*off*side, a:p.a}; }
function attachPed(p){ // engancha un peatón a la acera más cercana
  const nr=nearestRoad(p.x,p.y,PED_ROAD); if(!nr) return;
  const n=nr.a+Math.PI/2, side=((p.x-nr.x)*Math.cos(n)+(p.y-nr.y)*Math.sin(n))>=0?1:-1;
  p.road=nr.r.idx; p.s=nr.s; p.side=side; p.dir=Math.random()<.5?1:-1; p.lastX=-1;
  const t=sidewalkPos(nr.r,p.s,side); p.mode='go'; p.tx=t.x; p.ty=t.y;
}
function spawnPed(anywhere){
  for(let t=0;t<10;t++){
    const nr=roadPointNear(anywhere?120:650,anywhere?1300:1250,PED_ROAD); if(!nr) continue;
    const side=Math.random()<.5?1:-1, pos=sidewalkPos(nr.r,nr.s,side);
    if(inWater(pos.x,pos.y)||hitSolid(pos.x,pos.y,6)) continue;
    if(Math.random()>density(pos.x,pos.y)*1.15+0.02) continue;   // sin casas alrededor casi nadie pasea
    G.peds.push({x:pos.x,y:pos.y,a:pos.a,road:nr.r.idx,s:nr.s,side,dir:Math.random()<.5?1:-1,mode:'walk',lastX:-1,
      sp:rand(38,58),col:PEDCOL[(Math.random()*PEDCOL.length)|0],skin:['#e6c09a','#c69468','#8d5a3b','#f1d3b5'][(Math.random()*4)|0],
      flee:0,walk:0,turnT:rand(2,6)});
    return;
  }
}
function updatePed(p,dt){
  const P=G.player;
  if(p.flee>0){
    p.flee-=dt; const a=Math.atan2(p.y-P.y,p.x-P.x); p.a=a+Math.sin(p.walk)*0.2;
    p.x+=Math.cos(p.a)*130*dt; p.y+=Math.sin(p.a)*130*dt; p.walk+=dt*14;
    resolve(p,7);
    if(p.flee<=0) attachPed(p);
    return;
  }
  if(p.mode==='go'||p.mode==='cross'){ // ir andando hasta un punto (cruzar o volver a la acera)
    const dx=p.tx-p.x, dy=p.ty-p.y, d=Math.hypot(dx,dy);
    p.goT=(p.goT||0)+dt; if(p.goT>6){ p.x=p.tx; p.y=p.ty; }
    if(d<3){ p.mode='walk'; p.goT=0; return; }
    p.a=Math.atan2(dy,dx); const st=Math.min(d,(p.mode==='cross'?p.sp*1.25:p.sp)*dt);
    p.x+=dx/d*st; p.y+=dy/d*st; p.walk+=dt*9;
    if(p.mode==='go') resolve(p,7);
    return;
  }
  const r=ROADS[p.road]; if(!r){ attachPed(p); return; }
  const ps=p.s; p.s+=p.dir*p.sp*dt;
  // cruces: decidir al llegar al borde de la otra calle
  for(const x of r.cross){
    const o=ROADS[x.other]; if(!PED_ROAD(o)) continue;
    const edge=x.s-p.dir*(o.w/2+16);
    if((edge-ps)*(edge-p.s)<=0 && p.lastX!==x.id){
      p.lastX=x.id; const rnd=Math.random();
      if(rnd<0.3){ // cruzar su propia calle por el paso de cebra
        p.s=edge; p.side=-p.side; const t=sidewalkPos(r,p.s,p.side); p.mode='cross'; p.tx=t.x; p.ty=t.y; return;
      } else if(rnd<0.6){ // girar por la acera de la otra calle
        const here=sidewalkPos(r,edge,p.side);
        const nr=nearestRoad(here.x,here.y,q=>q===o);
        const n=nr.a+Math.PI/2, side=((here.x-nr.x)*Math.cos(n)+(here.y-nr.y)*Math.sin(n))>=0?1:-1;
        p.road=o.idx; p.side=side; p.dir=(nr.s<x.os)?-1:1; p.s=nr.s+p.dir*10; p.lastX=x.id;
        const t=sidewalkPos(o,p.s,side); p.mode='go'; p.tx=t.x; p.ty=t.y; return;
      }
      // si no, sigue recto cruzando la otra calle por su paso de cebra
    }
  }
  if(p.s<=8){ p.s=8; p.dir=1; p.lastX=-1; } else if(p.s>=r.len-8){ p.s=r.len-8; p.dir=-1; p.lastX=-1; }
  const t=sidewalkPos(r,p.s,p.side);
  p.a=Math.atan2(t.y-p.y,t.x-p.x)||p.a; p.x=t.x; p.y=t.y; p.walk+=dt*8;
}

