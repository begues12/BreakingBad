"use strict";
// ======================= ATAJOS PARA ESCRIBIR PLANOS =======================
// wide/med/low/high(fondo, luz, personajes, texto, opciones)
// close(id, fondo, luz, texto, opciones)  ·  det(atrezo, fondo, luz, texto, opciones)
// ch(id, x, opciones) coloca un personaje en la posición x (0..1)
const SH={
  wide:(bg,light,chars,cap,o)=>Object.assign({cam:'wide',bg,light,chars,cap},o),
  med:(bg,light,chars,cap,o)=>Object.assign({cam:'medium',bg,light,chars,cap},o),
  low:(bg,light,chars,cap,o)=>Object.assign({cam:'low',bg,light,chars,cap},o),
  high:(bg,light,chars,cap,o)=>Object.assign({cam:'high',bg,light,chars,cap},o),
  close:(id,bg,light,cap,o)=>Object.assign({cam:'close',focus:id,bg,light,cap},o),
  det:(prop,bg,light,cap,o)=>Object.assign({cam:'detail',focus:prop,bg,light,cap},o),
};
const ch=(id,x,o)=>Object.assign({id,x},o);
