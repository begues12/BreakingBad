"use strict";
// ======================= DIÁLOGOS =======================
const CHAR = {
  W:{n:'Walter White', c:'#2e6b3f', i:'WW'}, J:{n:'Jesse Pinkman', c:'#c7a12a', i:'JP'},
  S:{n:'Skyler White', c:'#7b4b8a', i:'SW'}, H:{n:'Hank Schrader', c:'#7a5230', i:'HS'},
  SA:{n:'Saul Goodman', c:'#b8862b', i:'SG'}, T:{n:'Tuco Salamanca', c:'#8b1e1e', i:'TS'},
  G:{n:'Gustavo Fring', c:'#c99c2c', i:'GF'}, V:{n:'Vendedor', c:'#666', i:'V'},
  D:{n:'Declan', c:'#555', i:'D'}, N:{n:'', c:'#000', i:''}, P:{n:'📱 Teléfono', c:'#225', i:'☎'},
  WJ:{n:'Walter Jr.', c:'#3a6aa0', i:'WJ'},
  M:{n:'Mike Ehrmantraut', c:'#6a6a5a', i:'ME'}, HE:{n:'Héctor Salamanca', c:'#5a3a2a', i:'HE'}, GA:{n:'Gale Boetticher', c:'#5a7a5a', i:'GB'},
  JA:{n:'Jane Margolis', c:'#3a2a3a', i:'JM'}, MA:{n:'Marie Schrader', c:'#6a3a8a', i:'MS'}, TO:{n:'Todd Alquist', c:'#5a6a7a', i:'TA'},
  JK:{n:'Tío Jack', c:'#4a4a4a', i:'JK'}, LY:{n:'Lydia Rodarte-Quayle', c:'#7a6a8a', i:'LR'}, K8:{n:'Krazy-8', c:'#3a3a5a', i:'K8'},
  EM:{n:'Emilio Koyama', c:'#4a4a3a', i:'EK'}, GR:{n:'Gretchen Schwartz', c:'#8a6a5a', i:'GS'}, EL:{n:'Elliott Schwartz', c:'#5a5a6a', i:'ES'},
  BA:{n:'Badger', c:'#5a5a3a', i:'BA'}, SP:{n:'Skinny Pete', c:'#3a3a3a', i:'SP'}, AN:{n:'Andrea Cantillo', c:'#6a4a5a', i:'AC'},
  VI:{n:'Victor', c:'#3a3a3a', i:'VI'}, TE:{n:'Ted Beneke', c:'#5a6a8a', i:'TB'}, HU:{n:'Huell Babineaux', c:'#2a2a2a', i:'HB'},
  GO:{n:'Agente Gomez', c:'#4a5a6a', i:'SG'}, PR:{n:'Los Primos', c:'#2a2a2a', i:'LP'}, DO:{n:'Donald Margolis', c:'#5a5a5a', i:'DM'},
  SH:{n:'Sheriff', c:'#4a4a2a', i:'SH'}, X:{n:'Desconocido', c:'#333', i:'?'},
};
// line: [who, text] | {choices:[[text, fn]]} | function
function say(lines, onEnd){
  G.dialog = {lines:lines.slice(), i:0, ch:0, onEnd, choiceSel:0};
  advanceToValid();
}
function advanceToValid(){
  const D=G.dialog;
  while(D && D.i<D.lines.length && typeof D.lines[D.i]==='function'){
    const fn=D.lines[D.i]; D.i++; const extra=fn(); if(Array.isArray(extra)) D.lines.splice(D.i,0,...extra);
  }
  if(D && D.i>=D.lines.length){ G.dialog=null; if(D.onEnd) D.onEnd(); }
}
function dialogNext(){
  const D=G.dialog, L=D.lines[D.i];
  if(L.choices) return;
  const txt=L[1];
  if(D.ch<txt.length){ D.ch=txt.length; return; }
  D.i++; D.ch=0; advanceToValid();
}
function dialogChoose(n){
  const D=G.dialog, L=D.lines[D.i];
  if(!L||!L.choices||!L.choices[n]) return;
  D.i++; D.ch=0;
  const extra = L.choices[n][1]();
  if(Array.isArray(extra)) D.lines.splice(D.i,0,...extra);
  advanceToValid();
}
function toast(t,dur){ G.msg=t; G.msgT=dur||4; }
function floater(x,y,t,c){ G.floaters.push({x,y,t,c:c||'#7f7',life:1.6}); }

