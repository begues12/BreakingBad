# Heisenberg: Albuquerque

Juego en canvas 2D, sin dependencias ni build. Abrir `index.html` en el navegador.

## Estructura

```
index.html            Punto de entrada; carga los scripts en orden
maps/abq.js           El mapa (isla): biomas, alturas, carreteras con altura, lugares
tools/editor.html     Editor visual del mapa · tools/generate-map.js genera la isla desde cero
css/style.css
js/
  core/     config.js (canvas, utilidades, RNG) · state.js · input.js · update.js (lógica por frame)
  world/    geography.js (mapa y lugares) · navigation.js (rutas por calles) · vehicles.js (física, IA policial)
  game/     missions.js (motor de misiones) · story.js (servicios del mundo abierto) · dialogue.js · cooking.js · shop.js · combat.js
  missions/ t1.js … t5b.js — un archivo por temporada; cada capítulo es una misión
  systems/  audio.js (sintetizado) · save.js
  interiors/ interiors.js (motor) · plans.js (planos ASCII de cada casa)
  cutscenes/ engine.js (cámara, fondos, figuras, atrezo) · shots.js · t1..t5.js (planos por capítulo)
  render/   render.js (mundo) · hud.js · portraits.js · title.js · pausemap.js (mapa y GPS)
  main.js   Bucle principal
```

Los scripts son clásicos (no módulos ES) y comparten el ámbito global, así que
**el orden en `index.html` importa**: un archivo solo puede usar en tiempo de
carga lo definido en archivos anteriores (dentro de funciones no hay restricción).
Para añadir un sistema nuevo, crea su archivo en la carpeta que corresponda y
añade su `<script>` antes de `js/main.js`.

## Misiones

Cada capítulo de la serie es una misión declarada como datos en `js/missions/`. Una misión
tiene `intro`, `steps` y `outro`; cada paso tiene un `type` (talk, goto, phone, cook, kill,
chase, collect, escape, survive, hold, money, sell, deliver). Los tipos están documentados
al principio de `js/game/missions.js`. Para añadir un capítulo basta con añadir un objeto al
`addMissions([...])` de su temporada.

## Mapa y alturas

El mapa vive en `maps/abq.js`. Ábrelo con `tools/editor.html` para pintar biomas y relieve,
dibujar carreteras (cada punto puede tener altura: puentes y rampas) y mover lugares.
Dos calzadas que se cruzan a la misma altura forman un cruce; si no, una pasa por encima.
Personajes y coches solo pasan a superficies con una altura parecida a la suya.

## Interiores

`js/interiors/plans.js`: cada interior es un plano ASCII por planta (leyenda en
`interiors.js`). Se entra pulsando E en la puerta del lugar.

## Cinemáticas

`js/cutscenes/t*.js`: cada capítulo tiene escenas con planos (`wide`, `med`, `close`, `det`...).
La escena 1 se ve al empezar la misión y el resto al completarla. Para revisar un plano:
`index.html#debug&cine=4x06&scene=1&shot=0&t=2`.
