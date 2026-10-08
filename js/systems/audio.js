"use strict";
// ======================= AUDIO (sintetizado) =======================
let AC=null;
function audio(){ if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return AC; }
function beep(freq,dur,type,vol,slide){
  const a=audio(); if(!a) return;
  const o=a.createOscillator(), g=a.createGain();
  o.type=type||'square'; o.frequency.value=freq;
  if(slide) o.frequency.exponentialRampToValueAtTime(slide,a.currentTime+dur);
  g.gain.value=vol||0.05; g.gain.exponentialRampToValueAtTime(0.0001,a.currentTime+dur);
  o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime+dur);
}
function noise(dur,vol){
  const a=audio(); if(!a) return;
  const buf=a.createBuffer(1,a.sampleRate*dur,a.sampleRate), d=buf.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length);
  const s=a.createBufferSource(), g=a.createGain(); s.buffer=buf; g.gain.value=vol||0.15;
  s.connect(g); g.connect(a.destination); s.start();
}
const sfx = {
  shot:()=>noise(0.12,0.25), boom:()=>{noise(0.8,0.5);beep(80,0.6,'sawtooth',0.2,30);},
  crash:()=>noise(0.18,0.2), cash:()=>{beep(880,0.08,'square',0.05);setTimeout(()=>beep(1320,0.12,'square',0.05),80);},
  blip:()=>beep(600,0.04,'square',0.02), star:()=>beep(300,0.3,'sawtooth',0.06,600),
  phone:()=>{beep(1000,0.1,'sine',0.06);setTimeout(()=>beep(1000,0.1,'sine',0.06),150);},
};

