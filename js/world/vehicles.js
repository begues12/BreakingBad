"use strict";
// ======================= FÍSICA DE VEHÍCULOS =======================
// Cuerpo rígido 2D: velocidad (vx,vy) independiente del morro, velocidad angular (w),
// agarre lateral de los neumáticos, masa e inercia. Choques por impulsos.
function carInertia(c){ return c.mass*(c.w*c.w+c.h*c.h)/2.5; }
function carCircles(c){
  const off=(c.w-c.h)/2, rr=c.h/2+2, ca=Math.cos(c.a), sa=Math.sin(c.a);
  return [[c.x+ca*off,c.y+sa*off,rr],[c.x-ca*off,c.y-sa*off,rr]];
}
function pushOut(x,y,r){
  let px=0,py=0;
  for(const s of solidsIn(x-r,y-r,x+r,y+r)){
    if(x+r<s.x||x-r>s.x+s.w||y+r<s.y||y-r>s.y+s.h) continue;
    const cx=clamp(x,s.x,s.x+s.w), cy=clamp(y,s.y,s.y+s.h);
    let dx=x-cx, dy=y-cy, d=Math.hypot(dx,dy);
    if(d<r){
      if(d<0.001){ const l=x-s.x, rr=s.x+s.w-x, t=y-s.y, b=s.y+s.h-y, m=Math.min(l,rr,t,b);
        if(m===l) px-=l+r; else if(m===rr) px+=rr+r; else if(m===t) py-=t+r; else py+=b+r; }
      else { px+=dx/d*(r-d); py+=dy/d*(r-d); }
    }
  }
  if(x-r<0) px+=r-x; if(y-r<0) py+=r-y; if(x+r>WW) px-=x+r-WW; if(y+r>WH) py-=y+r-WH;
  return [px,py];
}
function shakeCam(v){ G.shake=Math.max(G.shake||0,v); }
function sparks(x,y,n,vx,vy){
  for(let i=0;i<n;i++) G.parts.push({x,y,vx:(vx||0)*0.3+rand(-160,160),vy:(vy||0)*0.3+rand(-160,160),life:rand(.15,.4),c:Math.random()<.5?'#ffd76a':'#fff3c0',s:rand(1.5,3)});
}
function carImpact(c,impact,x,y){
  if(impact<90) return;
  const dmg=(impact-70)/11; c.hp-=dmg;
  if(impact>160){ sfx.crash(); sparks(x,y,Math.min(14,impact/30|0)); }
  const P=G.player;
  if(c===P.inCar){ shakeCam(Math.min(14,impact/40)); if(impact>380) hurtPlayer((impact-300)/25); }
}

function driveCar(c,dt,acc,brk,steer,hand,idle){
  if(c.hp<=0 && !c.burnt){ c.fire+=dt; acc=false; if(c.fire>4) { explodeCar(c); return; } }
  if(c.vx===undefined){ c.vx=Math.cos(c.a)*c.v; c.vy=Math.sin(c.a)*c.v; c.av=0; }
  const offroad=!isRoad(c.x,c.y);
  const top=c.max*(offroad?0.7:1);
  const ca=Math.cos(c.a), sa=Math.sin(c.a);
  let vf=c.vx*ca+c.vy*sa, vr=-c.vx*sa+c.vy*ca;
  // motor / freno / marcha atrás
  if(acc){ vf += (vf<-5 ? c.acc*3 : c.acc*Math.max(0,1.2-1.1*vf/top))*dt; }
  if(brk){ if(vf>15) vf-=c.acc*2.8*dt; else vf=Math.max(-c.max*0.38, vf-c.acc*0.9*dt); }
  const roll=(idle?520:offroad?240:110)*dt + Math.abs(vf)*0.18*dt;
  if(!acc&&!brk) vf = Math.abs(vf)<=roll?0:vf-Math.sign(vf)*roll;
  if(hand){ const f=420*dt; vf = Math.abs(vf)<=f?0:vf-Math.sign(vf)*f; }
  // agarre lateral alto (arcade): el coche va hacia donde apunta; solo derrapa con freno de mano
  const spdR=Math.min(1,Math.abs(vf)/c.max);
  let grip=(offroad?7:15)*(1-0.25*spdR)*(c.gripMul||1);
  if(hand) grip=1.5;
  if(idle) grip=14;
  const vr0=vr;
  vr*=Math.exp(-grip*dt);
  // dirección: el volante va rápido a la posición y vuelve aún más rápido al centro
  const sIn=c.steerS||0, toward=Math.abs(steer)>Math.abs(sIn)&&Math.sign(steer)===Math.sign(sIn||steer);
  c.steerS=sIn+(steer-sIn)*Math.min(1,dt*(toward?10:18));
  // menos giro a alta velocidad para que no culebree
  const targetW = c.steerS*c.turn*1.1*Math.min(1,Math.abs(vf)/80)*Math.sign(vf)*(1-0.45*spdR)*(hand?1.6:1);
  c.av += (targetW-c.av)*Math.min(1,dt*(hand?4:Math.abs(vf)>20?16:6));
  c.a += c.av*dt;
  c.vx=ca*vf-sa*vr; c.vy=sa*vf+ca*vr;
  c.x+=c.vx*dt; c.y+=c.vy*dt;
  c.v=vf;
  // derrape: marcas y chirrido
  const sliding=Math.abs(vr0)>70 || (brk&&vf>220) || (hand&&Math.abs(vf)>120);
  if(sliding && !idle){
    for(const side of [-1,1]) G.decals.push({x:c.x-ca*(c.w/2-6)-sa*side*(c.h/2-3), y:c.y-sa*(c.w/2-6)+ca*side*(c.h/2-3), r:2.6, c:'rgba(20,20,20,.28)'}); // ruedas traseras
    c.screech=(c.screech||0)-dt;
    if(c===G.player.inCar && c.screech<=0){ noise(0.18,0.035); beep(1400+Math.random()*300,0.15,'sawtooth',0.008); c.screech=0.22; }
    if(Math.abs(vr0)>140 && Math.random()<0.4) G.parts.push({x:c.x-ca*c.w/2,y:c.y-sa*c.w/2,vx:rand(-20,20),vy:rand(-20,20),life:0.7,c:'rgba(200,200,200,.25)',s:rand(6,10)});
  }
  collideWalls(c);
  // superficie bajo el coche: si el desnivel es grande (pretil, borde de puente, agua) choca y vuelve atrás
  { const sp=Math.hypot(c.vx,c.vy), nz=c._px===undefined?spawnZ(c.x,c.y,c.z):standZ(c.x,c.y,c.z,STEP_UP+sp*dt*0.3);
    if(nz===null){ c.x=c._px; c.y=c._py;
      if(sp>140){ sparks(c.x,c.y,6,c.vx,c.vy); carImpact(c,sp*0.4,c.x,c.y); }
      c.vx*=-0.25; c.vy*=-0.25; c.av*=0.5; }
    else c.z=nz; }
  c._px=c.x; c._py=c.y;
}
function collideWalls(c){
  const I=carInertia(c);
  for(const [cx,cy,rr] of carCircles(c)){
    const [px,py]=pushOut(cx,cy,rr); const pl=Math.hypot(px,py);
    if(pl<0.01) continue;
    c.x+=px; c.y+=py;
    const nx=px/pl, ny=py/pl;
    const rx=cx-nx*rr-c.x, ry=cy-ny*rr-c.y; // punto de contacto relativo al centro
    const vpx=c.vx-c.av*ry, vpy=c.vy+c.av*rx;
    const vn=vpx*nx+vpy*ny;
    if(vn<0){
      const rn=rx*ny-ry*nx;
      const j=-(1.25)*vn/(1/c.mass+rn*rn/I);
      c.vx+=j*nx/c.mass; c.vy+=j*ny/c.mass; c.av+=rn*j/I;
      // rozamiento contra la pared
      const tx=-ny, ty=nx, vt=vpx*tx+vpy*ty;
      const jt=clamp(-vt/(1/c.mass)*0.25,-Math.abs(j)*0.5,Math.abs(j)*0.5);
      c.vx+=jt*tx/c.mass; c.vy+=jt*ty/c.mass;
      carImpact(c,-vn,cx-nx*rr,cy-ny*rr);
      if(Math.abs(vt)>160 && Math.random()<0.6) sparks(cx-nx*rr,cy-ny*rr,2,c.vx,c.vy);
    }
  }
}
function collideCars(a,b){
  const P=G.player;
  for(const [ax,ay,ar] of carCircles(a)) for(const [bx,by,br] of carCircles(b)){
    const dx=bx-ax, dy=by-ay, d=Math.hypot(dx,dy), m=ar+br;
    if(d>=m||d<0.01) continue;
    const nx=dx/d, ny=dy/d;
    const kinA=a.driver==='ai', kinB=b.driver==='ai';
    const ima=kinA&&!kinB?0.15/a.mass:1/a.mass, imb=kinB&&!kinA?0.15/b.mass:1/b.mass;
    // separar según masa
    const pen=m-d, tot=ima+imb;
    a.x-=nx*pen*ima/tot; a.y-=ny*pen*ima/tot; b.x+=nx*pen*imb/tot; b.y+=ny*pen*imb/tot;
    // impulso en el punto de contacto
    const cx=ax+nx*ar, cy=ay+ny*ar;
    const rax=cx-a.x, ray=cy-a.y, rbx=cx-b.x, rby=cy-b.y;
    const Ia=carInertia(a), Ib=carInertia(b);
    const avx=(a.vx||0)-(a.av||0)*ray, avy=(a.vy||0)+(a.av||0)*rax;
    const bvx=(b.vx||0)-(b.av||0)*rby, bvy=(b.vy||0)+(b.av||0)*rbx;
    const vn=(bvx-avx)*nx+(bvy-avy)*ny;
    if(vn>=0) continue;
    const rna=rax*ny-ray*nx, rnb=rbx*ny-rby*nx;
    const j=-(1.3)*vn/(ima+imb+rna*rna/Ia+rnb*rnb/Ib);
    const wake=c=>{ if(c.driver==='ai'&&Math.abs(vn)>45){ c.driver=null; c.parked=true; c.angry=true; } };
    wake(a); wake(b);
    if(a.vx===undefined){ a.vx=Math.cos(a.a)*a.v; a.vy=Math.sin(a.a)*a.v; a.av=0; }
    if(b.vx===undefined){ b.vx=Math.cos(b.a)*b.v; b.vy=Math.sin(b.a)*b.v; b.av=0; }
    a.vx-=j*nx*ima; a.vy-=j*ny*ima; a.av=(a.av||0)-rna*j/Ia;
    b.vx+=j*nx*imb; b.vy+=j*ny*imb; b.av=(b.av||0)+rnb*j/Ib;
    // un poco de rozamiento entre carrocerías
    const tx=-ny, ty=nx, vt=(bvx-avx)*tx+(bvy-avy)*ty, jt=clamp(-vt*0.15/(ima+imb),-j*0.4,j*0.4);
    a.vx-=jt*tx*ima; a.vy-=jt*ty*ima; b.vx+=jt*tx*imb; b.vy+=jt*ty*imb;
    const imp=-vn;
    carImpact(a,imp*b.mass/(a.mass+b.mass)*2,cx,cy); carImpact(b,imp*a.mass/(a.mass+b.mass)*2,cx,cy);
    if(imp>100){
      if((a.driver==='cop'||b.driver==='cop') && (a===P.inCar||b===P.inCar)) setWanted(Math.max(G.wanted,1));
      if(imp>200 && (a===P.inCar||b===P.inCar) && Math.random()<0.3) beep(330,0.4,'sawtooth',0.04); // claxon enfadado
    }
    // mantener v (velocidad hacia delante) coherente para el resto del juego
    for(const c of [a,b]) c.v=c.vx*Math.cos(c.a)+c.vy*Math.sin(c.a);
  }
}

function updateWorld(dt){
  const P=G.player;
  // ---------- coches ----------
  for(const c of G.cars){
    if(c.dead) continue;
    if(c.burnt){ continue; }
    if(c.hp<=0 && c.driver!=='player'){ c.fire+=dt; if(c.fire>4){ explodeCar(c); continue; } }
    if(c.driver==='ai') aiTraffic(c,dt);
    else if(c.driver==='cop') aiCop(c,dt);
    else if(c.driver==='flee') aiFlee(c,dt);
    else if(c.driver==='ride') aiRide(c,dt);
    else if(c.driver===null || c.parked){
      if(c.driver!=='player') driveCar(c,dt,false,false,0,false,true);
    }
    if(c.siren!==undefined) c.siren+=dt;
  }
  // colisiones coche-coche (impulsos)
  const cs=G.cars.filter(c=>!c.dead);
  for(let i=0;i<cs.length;i++) for(let j=i+1;j<cs.length;j++){
    const a=cs[i], b=cs[j];
    if(a.driver==='ai'&&b.driver==='ai') continue;
    if(Math.abs((a.z||0)-(b.z||0))>3) continue;
    const lim=(a.w+b.w)/2+4; if(Math.abs(a.x-b.x)>lim||Math.abs(a.y-b.y)>lim) continue;
    collideCars(a,b);
  }
  // peatón jugador vs coches
  if(!P.inCar) for(const c of cs){ if(Math.abs(c.z-P.z)>3) continue; const d=dist(c.x,c.y,P.x,P.y); if(d<c.r+9){ const nx=(P.x-c.x)/(d||1), ny=(P.y-c.y)/(d||1); P.x=c.x+nx*(c.r+9); P.y=c.y+ny*(c.r+9); if(Math.abs(c.v)>150){ hurtPlayer(Math.abs(c.v)/12); c.v*=0.5; c.vx*=0.5; c.vy*=0.5; } } }
  G.cars=G.cars.filter(c=>!(c.dead&&!c.burnt));

  if(G.decals.length>700) G.decals.splice(0,G.decals.length-700);
  // ---------- policía ----------
  const cops=G.cars.filter(c=>c.driver==='cop');
  const want=G.wanted*2;
  if(cops.length<want && Math.random()<dt*1.2) spawnCop();
  if(G.wanted===0) for(const c of cops){ if(dist(c.x,c.y,P.x,P.y)>900){ c.dead=true; } else { c.driver=null; c.parked=true; } }
  if(G.wanted>0){
    const seen=cops.some(c=>copSees(c.x,c.y,c.z,650)) || G.officers.some(o=>o.hp>0&&o.state==='out'&&copSees(o.x,o.y,o.z,500));
    if(!seen) G.evadeT+=dt; else G.evadeT=Math.max(0,G.evadeT-dt*2);
    if(G.evadeT>5+G.wanted*2.5){ G.wanted--; G.evadeT=0; toast(G.wanted? 'Pierdes una estrella':'¡Has despistado a la policía!',2); }
    // arresto
    const spd=P.inCar?Math.abs(P.inCar.v):0;
    const close=cops.some(c=>Math.abs(c.z-P.z)<3 && dist(c.x,c.y,P.x,P.y)<75 && Math.abs(c.v)<120) || G.officers.some(o=>o.hp>0&&o.state==='out'&&Math.abs((o.z||0)-P.z)<3&&dist(o.x,o.y,P.x,P.y)<45);
    if(close && spd<40){ G.bustT+=dt; if(G.bustT>2.5 && !G.dead){ G.dead='busted'; G.deadT=3.5; sfx.star(); } } else G.bustT=Math.max(0,G.bustT-dt);
  } else G.bustT=0;

  // ---------- tráfico / peatones: mantener densidad ----------
  const traffic=G.cars.filter(c=>c.driver==='ai').length;
  // densidad según lo urbano que sea el entorno (centro lleno, desierto casi vacío)
  if(!G.crowdT||(G.crowdT-=dt)<=0){ G.crowdT=1; let s=0; for(let i=0;i<9;i++){ const a=i*0.7, r=i?900:0; s+=density(P.x+Math.cos(a)*r,P.y+Math.sin(a)*r); } G.crowd=clamp(s/9/0.85,0.03,1); }
  const crowd=G.crowd||1;
  if(traffic<Math.round(4+26*crowd)) spawnTraffic(false);
  for(const c of G.cars){
    if(c.owned||c.mission||c===P.inCar||c.driver==='cop'||c.driver==='ride') continue;
    if(dist(c.x,c.y,P.x,P.y)>2200) c.dead=true;
  }
  G.cars=G.cars.filter(c=>!c.dead||c.burnt).filter(c=>!(c.burnt&&dist(c.x,c.y,P.x,P.y)>2500));
  for(const p of G.peds){
    if(p.dead){ p.deadT-=dt; continue; }
    updatePed(p,dt);
    for(const c of cs) if(c.driver!=='player' && !onDeck(c) && Math.abs(c.v)>120 && dist(c.x,c.y,p.x,p.y)<c.r+5) killPed(p);
  }
  G.peds=G.peds.filter(p=>!(p.dead&&p.deadT<=0) && dist(p.x,p.y,P.x,P.y)<1700);
  const alive=G.peds.filter(p=>!p.dead), maxPeds=Math.round(2+78*crowd);
  for(let k=0;k<3&&alive.length+k<maxPeds;k++) spawnPed(false);
  if(alive.length>maxPeds+5) for(const p of alive){ if(dist(p.x,p.y,P.x,P.y)>800&&!p.flee){ p.gone=true; if(--alive.length<=maxPeds) break; } }
  G.peds=G.peds.filter(p=>!p.gone);

  // ---------- matones ----------
  for(const t of G.thugs){
    if(t.hp<=0) continue;
    const d=dist(t.x,t.y,P.x,P.y);
    t.a=Math.atan2(P.y-t.y,P.x-t.x);
    if(d>220){ t.x+=Math.cos(t.a)*95*dt; t.y+=Math.sin(t.a)*95*dt; t.walk+=dt*10; }
    else if(d<120){ t.x-=Math.cos(t.a)*60*dt; t.y-=Math.sin(t.a)*60*dt; }
    else { t.x+=Math.cos(t.a+Math.PI/2)*50*dt*(t.side||1); t.y+=Math.sin(t.a+Math.PI/2)*50*dt*(t.side||1); if(Math.random()<dt) t.side=-(t.side||1); }
    resolve(t,9);
    t.cool-=dt;
    if(t.cool<=0 && d<480){ fire(t.x,t.y,t.a,'thug',0.12,9); t.cool=rand(0.7,1.5); }
  }
  for(const t of G.thugs) if(t.hp<=0 && !t.gone){ t.gone=true; G.decals.push({x:t.x,y:t.y,r:14,c:'rgba(120,0,0,.7)'}); G.kills++; G.money+=rand(100,600)|0; }
  G.thugs=G.thugs.filter(t=>t.hp>0);

  // ---------- agentes a pie ----------
  for(const o of G.officers){
    if(o.hp<=0) continue;
    const d=dist(o.x,o.y,P.x,P.y);
    const carGone=!o.car||o.car.dead||o.car.burnt;
    const playerFled=d>700 || (P.inCar && Math.abs(P.inCar.v)>200 && d>420);
    if(o.state==='out' && (G.wanted===0 || playerFled)) o.state='return';
    if(o.state==='return' && G.wanted>0 && !playerFled && d<500) o.state='out';
    if(o.state==='return'){
      if(carGone){ o.a=Math.atan2(o.y-P.y,o.x-P.x); o.x+=Math.cos(o.a)*80*dt; o.y+=Math.sin(o.a)*80*dt; o.walk+=dt*10; if(d>900) o.gone=true; }
      else { o.a=Math.atan2(o.car.y-o.y,o.car.x-o.x); o.x+=Math.cos(o.a)*150*dt; o.y+=Math.sin(o.a)*150*dt; o.walk+=dt*14;
        if(dist(o.x,o.y,o.car.x,o.car.y)<o.car.w/2+14) o.gone=true; }
      resolve(o,8); continue;
    }
    o.a=Math.atan2(P.y-o.y,P.x-o.x);
    const shooting=G.wanted>=2;
    const keep=shooting?190:20; // con 1 estrella van a por ti para esposarte
    if(d>keep+40){ o.x+=Math.cos(o.a)*(shooting?120:140)*dt; o.y+=Math.sin(o.a)*(shooting?120:140)*dt; o.walk+=dt*12; }
    else if(shooting && d<keep-60){ o.x-=Math.cos(o.a)*70*dt; o.y-=Math.sin(o.a)*70*dt; o.walk+=dt*8; }
    else if(shooting){ o.x+=Math.cos(o.a+Math.PI/2)*55*dt*o.side; o.y+=Math.sin(o.a+Math.PI/2)*55*dt*o.side; o.walk+=dt*8; if(Math.random()<dt*0.8) o.side*=-1; }
    resolve(o,8);
    o.cool-=dt;
    if(shooting && o.cool<=0 && copSees(o.x,o.y,0,430)){
      fire(o.x,o.y,o.a,'cop',P.inCar?0.09:0.13,G.wanted>=4?11:8);
      o.cool=rand(0.55,1.2)*(G.wanted>=4?0.75:1);
    }
    if(Math.random()<dt*0.25) beep(o.dea?260:300,0.12,'sawtooth',0.015); // "¡Alto, policía!"
  }
  for(const o of G.officers) if(o.hp<=0 && !o.dead){ o.dead=true; G.decals.push({x:o.x,y:o.y,r:14,c:'rgba(120,0,0,.7)'}); G.bodies=(G.bodies||[]); G.bodies.push({x:o.x,y:o.y,a:o.a,t:40,col:o.dea?'#1b1b1b':'#1d2b4a'}); setWanted(Math.max(G.wanted+1,3)); }
  G.officers=G.officers.filter(o=>!o.dead&&!o.gone&&dist(o.x,o.y,P.x,P.y)<1600);
  if(G.bodies){ for(const b of G.bodies) b.t-=dt; G.bodies=G.bodies.filter(b=>b.t>0); }

  // ---------- balas ----------
  for(const b of G.bullets){
    const steps=3;
    for(let s=0;s<steps&&b.life>0;s++){
      b.x+=b.vx*dt/steps; b.y+=b.vy*dt/steps;
      if(hitSolid(b.x,b.y,1)){ b.life=0; G.parts.push({x:b.x,y:b.y,vx:rand(-40,40),vy:rand(-40,40),life:.3,c:'#ffd',s:3}); break; }
      if(b.owner==='player'){
        for(const p of G.peds) if(!p.dead&&dist(p.x,p.y,b.x,b.y)<9){ killPed(p); b.life=0; if(G.thugs.length===0) setWanted(Math.max(G.wanted,copNear(800)?2:1)); }
        for(const o of G.officers) if(o.hp>0&&dist(o.x,o.y,b.x,b.y)<11){ o.hp-=b.dmg; b.life=0; G.parts.push({x:b.x,y:b.y,vx:rand(-60,60),vy:rand(-60,60),life:.4,c:'#900',s:4}); setWanted(Math.max(G.wanted,2)); }
        for(const t of G.thugs) if(t.hp>0&&dist(t.x,t.y,b.x,b.y)<11){ t.hp-=b.dmg; b.life=0; G.parts.push({x:b.x,y:b.y,vx:rand(-60,60),vy:rand(-60,60),life:.4,c:'#900',s:4}); }
        for(const c of G.cars) if(!c.dead&&!c.burnt&&c!==P.inCar&&dist(c.x,c.y,b.x,b.y)<c.r){ c.hp-=b.dmg*0.5; b.life=0; if(c.driver==='cop') setWanted(Math.max(G.wanted,2)); if(c.driver==='ai'){c.driver=null;c.parked=true;} }
      } else {
        if(dist(P.x,P.y,b.x,b.y)<(P.inCar?P.inCar.r:10)){ b.life=0; if(P.inCar) {P.inCar.hp-=b.dmg*0.6; hurtPlayer(b.dmg*0.3);} else hurtPlayer(b.dmg); }
      }
    }
    b.life-=dt;
  }
  G.bullets=G.bullets.filter(b=>b.life>0);
  for(const p of G.parts){ p.x+=p.vx*dt; p.y+=p.vy*dt; p.vx*=1-2*dt; p.vy*=1-2*dt; p.life-=dt; }
  G.parts=G.parts.filter(p=>p.life>0);
  // humo/fuego de coches dañados
  for(const c of G.cars){
    if(c.burnt){ if(Math.random()<dt*4) G.parts.push({x:c.x+rand(-10,10),y:c.y+rand(-10,10),vx:rand(-10,10),vy:rand(-40,-10),life:1.5,c:'rgba(60,60,60,.5)',s:rand(8,16)}); continue; }
    if(c.hp<c.maxhp*0.35 && Math.random()<dt*8) G.parts.push({x:c.x,y:c.y,vx:rand(-15,15),vy:rand(-50,-20),life:1,c:c.hp<=0?'#f73':'rgba(80,80,80,.5)',s:rand(6,12)});
  }
  if(G.decals.length>400) G.decals.splice(0,G.decals.length-400);
}

function aiTraffic(c,dt){
  const P=G.player, r0=ROADS[c.road];
  // ¿obstáculo delante?
  let target=SPEED_OF[r0.kind];
  const fx=c.x+Math.cos(c.a)*55, fy=c.y+Math.sin(c.a)*55;
  for(const o of G.cars){ if(o!==c && !o.dead && Math.abs(o.z-c.z)<3 && Math.abs(o.x-fx)<40 && Math.abs(o.y-fy)<40 && dist(o.x,o.y,fx,fy)<36){ target=0; break; } }
  if(dist(P.x,P.y,fx,fy)<38) { target=0; if(Math.random()<dt*0.5) beep(400,0.2,'sawtooth',0.02); }
  for(const p of G.peds) if(!p.dead && Math.abs(p.x-fx)<30 && dist(p.x,p.y,fx,fy)<26){ target=0; break; }
  // frenar en curvas cerradas
  const ahead=pointAt(r0,c.s+c.dir*60), here=pointAt(r0,c.s);
  if(Math.abs(angDiff(here.a,ahead.a))>0.5) target=Math.min(target,110);
  c.v += clamp(target-c.v,-520*dt,200*dt);
  const ps=c.s; c.s+=c.v*dt*c.dir;
  for(const x of r0.cross){
    if((x.s-ps)*(x.s-c.s)<=0 && c.lastX!==x.id){
      c.lastX=x.id;
      if(Math.random()<0.4){ c.road=x.other; c.s=x.os; c.dir=Math.random()<.5?1:-1; break; }
    }
  }
  const r1=ROADS[c.road];
  if(c.s<=0){ c.s=0; c.dir=1; c.lastX=-1; } else if(c.s>=r1.len){ c.s=r1.len; c.dir=-1; c.lastX=-1; }
  const p=trafficPos(c); c.x=p.x; c.y=p.y; c.z=p.z; c.a+=angDiff(c.a,p.a)*Math.min(1,dt*9);
  c.vx=Math.cos(c.a)*c.v; c.vy=Math.sin(c.a)*c.v; c.av=0;
}
function spawnCop(){
  const P=G.player;
  for(let t=0;t<30;t++){
    const a=rand(0,Math.PI*2), d=rand(850,1150);
    const x=P.x+Math.cos(a)*d, y=P.y+Math.sin(a)*d;
    if(!isRoad(x,y)||hitSolid(x,y,22)) continue;
    spawnCar(G.wanted>=4?'dea':'cop',x,y,Math.atan2(P.y-y,P.x-x),{driver:'cop',v:200,siren:0});
    return;
  }
}
function aiCop(c,dt){
  const P=G.player;
  const d=dist(c.x,c.y,P.x,P.y);
  // con agentes fuera, el coche se queda parado esperándolos
  if(c.unloaded){
    driveCar(c,dt,false,false,0,false,true);
    if(!G.officers.some(o=>o.car===c)) c.unloaded=false;
    return;
  }
  const footP=!P.inCar||Math.abs(P.inCar.v)<60;
  const wantsOut=G.officers.length<6 && copSees(c.x,c.y,c.z,400) && ((G.wanted>=2 && d<330) || (G.wanted>=1 && footP && d<220));
  if(wantsOut){
    driveCar(c,dt,false,true,0,true);
    if(Math.abs(c.v)<40){
      c.unloaded=true;
      const n=G.wanted>=3?2:1;
      for(let i=0;i<n;i++){
        const side=i?-1:1, ang=c.a+side*Math.PI/2;
        let x=c.x+Math.cos(ang)*(c.h/2+12), y=c.y+Math.sin(ang)*(c.h/2+12);
        if(hitSolid(x,y,8)||inWater(x,y)){ x=c.x-Math.cos(ang)*(c.h/2+12); y=c.y-Math.sin(ang)*(c.h/2+12); }
        G.officers.push({x,y,z:c.z,a:ang,hp:60,car:c,cool:rand(0.6,1.2),walk:0,side:Math.random()<.5?1:-1,state:'out',dea:c.type==='dea'});
      }
      beep(520,0.08,'square',0.03);
    }
    return;
  }
  // --- objetivo: con visión directa, interceptar; si no, ruta por calles hasta la última posición conocida ---
  const sees=copSees(c.x,c.y,c.z,700) && clearLine(c.x,c.y,P.x,P.y);
  if(sees) G.lastSeen={x:P.x,y:P.y,z:P.z};
  if(c.lead===undefined) c.lead=rand(0.25,0.9);                 // cada patrulla anticipa distinto: se abren y flanquean
  let tx,ty;
  if(sees && d<450){
    const pv=P.inCar?P.inCar:{vx:0,vy:0}, k=clamp(d/500,0,1)*c.lead;
    tx=P.x+pv.vx*k; ty=P.y+pv.vy*k;                              // punto de intercepción
    c.route=null;
  } else {
    const L=G.lastSeen||{x:P.x,y:P.y,z:P.z};
    c.routeT=(c.routeT||0)-dt;
    if(!c.route||c.routeT<=0||dist(c.goalX||0,c.goalY||0,L.x,L.y)>150){
      c.route=navRoute(c.x,c.y,c.z,L.x,L.y,L.z); c.ri=0; c.routeT=1.2; c.goalX=L.x; c.goalY=L.y; }
    // avanzar por la ruta (punto de mira ~90 por delante)
    while(c.ri<c.route.length-1 && dist(c.x,c.y,c.route[c.ri][0],c.route[c.ri][1])<90) c.ri++;
    [tx,ty]=c.route[c.ri];
    // llegó a donde te vio por última vez y no te ve: rastrea la zona
    if(!sees && dist(c.x,c.y,L.x,L.y)<120 && c.ri>=c.route.length-1){
      const nr=navProject(L.x+rand(-500,500),L.y+rand(-500,500)); G.lastSeen={x:nr.x,y:nr.y,z:nr.z}; }
  }
  const ta=Math.atan2(ty-c.y,tx-c.x);
  if(c.rev>0){ c.rev-=dt; driveCar(c,dt,false,true,Math.sign(angDiff(c.a,ta))*-1,false); return; }
  const diff=angDiff(c.a,ta);
  const steer=clamp(diff*2.2,-1,1);
  // frenar antes de las curvas cerradas de la ruta
  let sharp=Math.abs(diff);
  if(c.route && c.ri<c.route.length-1){ const [ax,ay]=c.route[c.ri], [bx,by]=c.route[Math.min(c.route.length-1,c.ri+2)];
    sharp=Math.max(sharp,Math.abs(angDiff(Math.atan2(ay-c.y,ax-c.x),Math.atan2(by-ay,bx-ax)))); }
  const close=sees && d<110;
  const vmax=close?160:sharp>1.2?190:sharp>0.6?300:9999;
  const wantFast=!close && c.v<vmax;
  driveCar(c,dt,wantFast && Math.abs(diff)<2.2, c.v>vmax+40 || (close&&c.v>60), steer, Math.abs(diff)>1.3&&c.v>260);
  if(Math.abs(c.v)<25 && !close){ c.stuck=(c.stuck||0)+dt; if(c.stuck>1){ c.rev=0.9; c.stuck=0; c.route=null; } } else c.stuck=0;
}

function respawn(){
  const P=G.player, how=G.dead;
  G.dead=false; G.wanted=0; G.evadeT=0; G.bustT=0; G.thugs=[];
  if(how==='wasted'){ const fee=Math.min(G.money,Math.round(G.money*0.05)+500); G.money-=fee; P.x=LOC.hospital.x; P.y=LOC.hospital.y+10; toast('Facturas del hospital: -$'+fee.toLocaleString(),4); }
  else { const lost=G.product; G.product=0; P.gun=false; P.ammo=0; P.x=LOC.dea.x; P.y=LOC.dea.y+10; G.heat=0; toast('Saul te ha sacado bajo fianza. Has perdido '+lost+' lb y tus armas.',5); }
  P.hp=100; P.armor=0; P.inCar=null;
  G.cars.forEach(c=>{ if(c.driver==='cop') c.dead=true; }); G.officers=[];
  // reintentar el paso de misión actual
  if(curStep()){ G.step--; nextStep(); }
  // asegúrate de que la autocaravana existe
  if(G.rvId && !G.cars.some(c=>c.id===G.rvId && !c.burnt)){ const rv=spawnCar('rv',LOC.rvlot.parkX,LOC.rvlot.parkY,LOC.rvlot.parkA,{owned:true}); G.rvId=rv.id; toast('Saul te consiguió otra autocaravana (en el concesionario).',5); }
}


// vehículo con conductor que lleva al jugador de pasajero (ambulancia, coche de Tuco...)
function aiRide(c,dt){
  while(c.ri<c.route.length-1 && dist(c.x,c.y,c.route[c.ri][0],c.route[c.ri][1])<70) c.ri++;
  const [tx,ty]=c.route[c.ri], ta=Math.atan2(ty-c.y,tx-c.x), diff=angDiff(c.a,ta);
  let sharp=Math.abs(diff); if(c.ri<c.route.length-2){ const [ax,ay]=c.route[c.ri],[bx,by]=c.route[c.ri+2]; sharp=Math.max(sharp,Math.abs(angDiff(Math.atan2(ay-c.y,ax-c.x),Math.atan2(by-ay,bx-ax)))); }
  const vmax=sharp>1?170:sharp>0.5?260:420, left=dist(c.x,c.y,c.goal[0],c.goal[1]);
  driveCar(c,dt,c.v<vmax&&left>120,c.v>vmax+40||left<120,clamp(diff*2.4,-1,1),false);
  if(Math.abs(c.v)<20&&left>120){ c.stuck=(c.stuck||0)+dt; if(c.stuck>1.5){ const p=c.route[Math.min(c.route.length-1,c.ri+1)]; c.x=p[0]; c.y=p[1]; c.z=spawnZ(p[0],p[1]); c.stuck=0; } } else c.stuck=0;
  c.arrived=left<130&&Math.abs(c.v)<40;
}
