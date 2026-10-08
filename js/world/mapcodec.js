"use strict";
// ======================= FORMATO DEL MAPA =======================
// Compartido por el juego y por tools/editor.html.
// MAP = { w, h, biome:{cell,cols,rows,rle}, height:{cell,cols,rows,scale,offset,data},
//         roads:[{id,name,kind,pts:[[x,y,z?],...]}], places:{key:{x,y,name,...}}, cook:{x,y}, dealers:[[x,y,name]] }
// - biome: un byte por celda (ver BIOMES), comprimido en RLE (pares valor,repeticiones) y base64
// - height: un byte por celda; altura = byte*scale + offset
// - z en un punto de carretera: altura absoluta (puente/rampa). Sin z, la carretera sigue el terreno.

const BIOMES = [
  {id:0,  key:'deep',       name:'Mar profundo',   col:[38,92,128],   water:true},
  {id:1,  key:'shallow',    name:'Agua poco prof.',col:[60,140,160],  water:true},
  {id:2,  key:'beach',      name:'Playa',          col:[226,206,158]},
  {id:3,  key:'park',       name:'Parque',         col:[128,150,84]},
  {id:4,  key:'suburb',     name:'Barrio',         col:[196,180,142]},
  {id:5,  key:'city',       name:'Centro',         col:[176,168,152]},
  {id:6,  key:'industrial', name:'Industrial',     col:[168,160,144]},
  {id:7,  key:'desert',     name:'Desierto',       col:[212,176,120]},
  {id:8,  key:'rock',       name:'Roca / sierra',  col:[150,112,86]},
  {id:9,  key:'river',      name:'Río',            col:[70,128,142],  water:true},
  {id:10, key:'bosque',     name:'Bosque del río', col:[120,138,80]},
];

function b64ToBytes(s){ const bin=atob(s), out=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) out[i]=bin.charCodeAt(i); return out; }
function bytesToB64(u){ let s=''; for(let i=0;i<u.length;i+=0x8000) s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000)); return btoa(s); }
function rleDecode(b64,n){ const src=b64ToBytes(b64), out=new Uint8Array(n); let o=0; for(let i=0;i<src.length;i+=2){ out.fill(src[i],o,o+src[i+1]); o+=src[i+1]; } return out; }
function rleEncode(arr){ const out=[]; for(let i=0;i<arr.length;){ const v=arr[i]; let n=1; while(i+n<arr.length&&arr[i+n]===v&&n<255) n++; out.push(v,n); i+=n; } return bytesToB64(Uint8Array.from(out)); }

// decodifica las capas a arrays editables
function decodeMap(M){
  return {
    biome: rleDecode(M.biome.rle, M.biome.cols*M.biome.rows),
    height: b64ToBytes(M.height.data),
  };
}
// vuelve a empaquetar (para exportar desde el editor)
function encodeMap(M,layers){
  const out=JSON.parse(JSON.stringify(M));
  out.biome.rle=rleEncode(layers.biome);
  out.height.data=bytesToB64(layers.height);
  return out;
}
// consultas sobre las capas decodificadas
function mapBiome(M,L,x,y){
  const c=M.biome.cell, i=Math.floor(x/c), j=Math.floor(y/c);
  if(i<0||j<0||i>=M.biome.cols||j>=M.biome.rows) return 0;
  return L.biome[j*M.biome.cols+i];
}
function mapHeight(M,L,x,y){ // bilineal
  const H=M.height, fx=x/H.cell-0.5, fy=y/H.cell-0.5;
  const i=Math.max(0,Math.min(H.cols-2,Math.floor(fx))), j=Math.max(0,Math.min(H.rows-2,Math.floor(fy)));
  const u=Math.max(0,Math.min(1,fx-i)), v=Math.max(0,Math.min(1,fy-j)), g=(a,b)=>L.height[b*H.cols+a];
  const h=(g(i,j)*(1-u)+g(i+1,j)*u)*(1-v)+(g(i,j+1)*(1-u)+g(i+1,j+1)*u)*v;
  return h*H.scale+H.offset;
}
