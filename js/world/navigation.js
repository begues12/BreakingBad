"use strict";
// ======================= NAVEGACIÓN POR LA RED VIARIA =======================
// Grafo: nodos = cruces a nivel + extremos de cada carretera; aristas = tramos de carretera.
// Lo usa la IA de la policía para perseguir siguiendo calles en vez de ir en línea recta.

const NAV = (function(){
  const nodes=[], byKey=new Map();
  const node=(key,x,y)=>{ if(byKey.has(key)) return byKey.get(key); const n={id:nodes.length,x,y,edges:[]}; nodes.push(n); byKey.set(key,n); return n; };
  const stops=new Map(); // carretera -> [{s,node}] ordenado por s
  for(const r of ROADS){
    if(!r.drive) continue;
    const L=[];
    const a=pointAt(r,0), b=pointAt(r,r.len);
    L.push({s:0,node:node('e'+r.idx+'a',a.x,a.y)}, {s:r.len,node:node('e'+r.idx+'b',b.x,b.y)});
    for(const x of r.cross){ const c=CROSSINGS[x.id]; L.push({s:x.s,node:node('x'+x.id,c.x,c.y)}); }
    L.sort((p,q)=>p.s-q.s);
    stops.set(r,L);
    for(let i=0;i<L.length-1;i++){ const A=L[i], B=L[i+1], ds=B.s-A.s; if(ds<1||A.node===B.node) continue;
      const cost=ds/SPEED_OF[r.kind];
      A.node.edges.push({to:B.node,r,s0:A.s,s1:B.s,cost}); B.node.edges.push({to:A.node,r,s0:B.s,s1:A.s,cost}); }
  }
  return {nodes,stops};
})();

// posición en la red: carretera transitable más cercana a esa altura
function navProject(x,y,z){ return nearestRoad(x,y,r=>r.drive,z===undefined?undefined:z); }

// Ruta de (x0,y0) a (x1,y1) como lista de puntos muestreados a lo largo de las calles.
function navRoute(x0,y0,l0,x1,y1,l1){
  const A=navProject(x0,y0,l0), B=navProject(x1,y1,l1);
  const pts=[];
  const sample=(r,sa,sb)=>{ const n=Math.max(1,Math.ceil(Math.abs(sb-sa)/70)); for(let i=1;i<=n;i++){ const p=pointAt(r,sa+(sb-sa)*i/n); pts.push([p.x,p.y]); } };
  if(A.r===B.r){ sample(A.r,A.s,B.s); pts.push([x1,y1]); return pts; }
  // nodos vecinos del origen y del destino sobre su carretera
  const around=(P)=>{ const L=NAV.stops.get(P.r); let i=0; while(i<L.length-1&&L[i+1].s<P.s) i++; return [L[i],L[Math.min(i+1,L.length-1)]]; };
  const dist0=new Float64Array(NAV.nodes.length).fill(Infinity), prev=new Array(NAV.nodes.length), done=new Uint8Array(NAV.nodes.length);
  const v=SPEED_OF[A.r.kind];
  const open=[];
  for(const st of around(A)){ const c=Math.abs(st.s-A.s)/v; if(c<dist0[st.node.id]){ dist0[st.node.id]=c; prev[st.node.id]={start:true,r:A.r,s0:A.s,s1:st.s}; open.push(st.node); } }
  const goal=new Map(); for(const st of around(B)) goal.set(st.node.id,Math.abs(st.s-B.s)/SPEED_OF[B.r.kind]);
  let best=null, bestCost=Infinity;
  while(open.length){
    let bi=0; for(let i=1;i<open.length;i++) if(dist0[open[i].id]<dist0[open[bi].id]) bi=i;
    const n=open.splice(bi,1)[0]; if(done[n.id]) continue; done[n.id]=1;
    const dn=dist0[n.id]; if(dn>=bestCost) break;
    if(goal.has(n.id) && dn+goal.get(n.id)<bestCost){ bestCost=dn+goal.get(n.id); best=n; }
    for(const e of n.edges){ const nd=dn+e.cost; if(nd<dist0[e.to.id]){ dist0[e.to.id]=nd; prev[e.to.id]={from:n,e}; open.push(e.to); } }
  }
  if(!best){ pts.push([x1,y1]); return pts; }
  const chain=[]; for(let n=best;;){ const p=prev[n.id]; chain.push(p); if(p.start) break; n=p.from; }
  chain.reverse();
  for(const p of chain) sample(p.start?p.r:p.e.r, p.start?p.s0:p.e.s0, p.start?p.s1:p.e.s1);
  const fin=NAV.stops.get(B.r).find(st=>st.node===best); sample(B.r,fin.s,B.s);
  pts.push([x1,y1]);
  return pts;
}

// ¿línea recta libre de edificios entre dos puntos?
function clearLine(x0,y0,x1,y1){
  const d=dist(x0,y0,x1,y1), n=Math.ceil(d/30);
  for(let i=1;i<n;i++){ const t=i/n; if(hitSolid(x0+(x1-x0)*t,y0+(y1-y0)*t,6)) return false; }
  return true;
}
