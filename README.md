# Heisenberg: Albuquerque

Juego en canvas 2D, sin dependencias ni build. Abrir `index.html` en el navegador.

## Estructura

```
index.html            Punto de entrada; carga los scripts en orden
css/style.css
js/
  core/     config.js (canvas, utilidades, RNG) · state.js · input.js · update.js (lógica por frame)
  world/    geography.js (mapa y lugares) · navigation.js (rutas por calles) · vehicles.js (física, IA policial)
  game/     missions.js (motor de misiones) · story.js (servicios del mundo abierto) · dialogue.js · cooking.js · shop.js · combat.js
  missions/ t1.js … t5b.js — un archivo por temporada; cada capítulo es una misión
  systems/  audio.js (sintetizado) · save.js
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
