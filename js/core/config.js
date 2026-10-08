"use strict";
// ======================= CONFIG / MUNDO =======================
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
let VW = 0, VH = 0;
function resize(){ VW = cv.width = innerWidth; VH = cv.height = innerHeight; }
addEventListener('resize', resize); resize();

// El trazado se diseña en "unidades de diseño" y luego se escala por SC al mundo real
const SC = 1.5;
const SIDEWALK = 24; // ancho de acera a cada lado de calles y avenidas
const WW = 6400*SC, WH = 5600*SC;

function mulberry(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const srand = mulberry(1987);
const rand = (a,b)=>a+Math.random()*(b-a);
const sr = (a,b)=>a+srand()*(b-a);
const clamp = (v,a,b)=>v<a?a:v>b?b:v;
const dist = (a,b,c,d)=>Math.hypot(a-c,b-d);
const angDiff = (a,b)=>{ let d=b-a; while(d>Math.PI)d-=2*Math.PI; while(d<-Math.PI)d+=2*Math.PI; return d; };
function segDist(px,py,x1,y1,x2,y2){
  const dx=x2-x1, dy=y2-y1, l=dx*dx+dy*dy; let t=l?((px-x1)*dx+(py-y1)*dy)/l:0; t=clamp(t,0,1);
  return Math.hypot(px-(x1+t*dx),py-(y1+t*dy));
}
function catmull(pts,sub){
  const out=[];
  for(let i=0;i<pts.length-1;i++){
    const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];
    for(let k=0;k<sub;k++){
      const t=k/sub,t2=t*t,t3=t2*t, f=j=>0.5*((2*p1[j])+(-p0[j]+p2[j])*t+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2+(-p0[j]+3*p1[j]-3*p2[j]+p3[j])*t3);
      out.push([f(0),f(1)]);
    }
  }
  out.push(pts[pts.length-1]); return out;
}

