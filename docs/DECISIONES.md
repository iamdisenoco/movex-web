# Decisiones técnicas — Movex Web

> **Cómo se usa**: cada vez que tomes una decisión que afecte la arquitectura, el stack, una convención, o resuelvas un bug raro, agrega aquí. Esto evita que el próximo Claude (o el otro humano) reabra discusiones cerradas o caiga en bugs ya resueltos.

**Formato**: nuevas decisiones al inicio. Fecha en formato YYYY-MM-DD.

---

## 2026-05-26 — Fix definitivo del "cuadro": mask-image radial

**Problema persistía**: Tras quitar el `filter: blur`, el user mandó screenshot mostrando que **el cuadro alrededor del globo sigue visible** en la transición a la M.

**Causa real (más profunda que blur)**: El canvas WebGL de three.js es un **rectángulo** que ocupa toda la pantalla. La **atmosfera teal** del globe se renderiza más allá de la esfera, hasta cubrir más área del rectángulo. Cuando se aplica `transform: scale(0.6)`, el rectángulo entero (con su atmosfera teal que llega a los bordes) encoge y queda visible como una "isla rectangular brillante" sobre el `bg-navy-900` puro del wrapper.

No es el blur ni el scale per se — es que un canvas es siempre **rectangular**, y al encogerlo se ve.

**Fix**: aplicar `mask-image: radial-gradient(...)` al container del canvas → enmascara los bordes rectangulares, el canvas se ve **siempre circular**.

```ts
// Estado base (globe/highlight/routes): mask amplio, casi no afecta visualmente
maskImage: "radial-gradient(circle at center, black 80%, transparent 100%)"

// Estado lockup-big/pair/matchmove: mask contraído, el círculo se cierra
maskImage: "radial-gradient(circle at center, black 25%, transparent 55%)"
```

Quitado el `transform: scale` — el "encoger hacia el centro" ahora lo hace el propio mask contrayéndose con transición CSS. Resultado:
1. Estado base: globo + atmosfera ocupan ~80% del canvas, los bordes 20% no se notan (mask los oculta sutilmente).
2. Transición: el mask se contrae a 25%→55% mientras `opacity → 0`. El globo "implosiona" hacia un punto central que se desvanece — sin rectángulo visible.

**Lección clave**: cualquier canvas WebGL que se vaya a animar (scale, fade) **necesita mask-image radial** si el contenido visual es circular y el fondo es de color sólido distinto al clearColor. Sin mask, los bordes del rectángulo del canvas siempre serán visibles.

---

## 2026-05-26 — Quitado blur del fade-out del globe (revelaba cuadro)

**Problema**: User dijo "no me gustó que encerraste en un cuadro el mundo cuando se va y aparece la M, de resto está perfecto".

**Causa**: usé `filter: blur(18px)` en el container del canvas (que ocupa `inset-0` fullscreen). CSS blur difumina cada píxel del elemento incluyendo los bordes — eso revela el rectángulo del canvas como un halo borroso. Al combinarlo con `scale(0.45)`, el rectángulo se hace más chico pero visible.

**Fix**: removido el `filter: blur`. Dejado solo `opacity + transform: scale(0.6)`. El canvas tiene `setClearColor(0x000000, 0)` (transparente), así que al encoger NO deja borde — solo se ve el globo encogiendo y desapareciendo.

**Lección**: `filter: blur` en elementos absoluto-fullscreen **siempre** revela el rectángulo. Para difuminar contornos de un canvas, usar `mask-image: radial-gradient(...)` en su lugar (que no toca el área externa).

---

## 2026-05-26 — Intro timeline reescalonado + transición smooth globe→M

**Problema 1**: User dijo "la transición cuando sale el mundo no es tan smooth". El globe canvas hacía fade-out de opacity 1→0 en 700ms, sin más cambio. Se sentía un swap brusco.

**Problema 2**: User dijo "primero debe aparecer el mundo, luego que se resalte Colombia, luego que salgan las líneas". El timeline previo tenía:
- `setTimeout(highlight, 100)` ← 100ms
- `setTimeout(routes, 200)` ← 100ms más
Las 3 phases iniciales pasaban en 200ms total — el user no percibía la secuencia.

**Solución 1 (transición smooth globe→M)** en `Intro3D.tsx`:
- Globe canvas ahora transiciona `opacity + transform + filter` en 1400ms con easing `cubic-bezier(0.32,0.72,0,1)` (soft, anticipatorio).
- En lockup phases: el globe encoge a `scale(0.45)` + blur `18px` + opacity 0 simultáneamente.
- Resultado: el globo "se difumina hacia el centro" como morpheándose, no un fade plano.

**Solución 2 (timeline con respiración)**:
```
0.00s  globe        → mundo aparece (TODOS los países neutral, Colombia indistinguible)
0.90s  highlight    → applyColombiaHighlight(): cap teal + stroke + altitud +
                     se ve la transición REAL del país destacándose
1.80s  routes       → empiezan a salir las arcs (con bloom luminoso)
3.80s  lockup-big   → M gigante aparece, globe se difumina (1400ms)
4.90s  lockup-pair  → wordmark "movex" entra desde derecha
6.00s  matchmove    → todo el lockup vuela a la esquina del nav
7.00s  finish       → desbloquea scroll
```

**Cambio clave del highlight**: antes los polygons cargaban con Colombia YA destacada → el user nunca veía "el resaltado" porque era el estado inicial. Ahora cargan neutrales y a 900ms se aplica `applyColombiaHighlight()` que actualiza `polygonAltitude` + `polygonCapColor` + `polygonStrokeColor` dinámicamente. Visible.

**Progress bar** ajustado para reflejar los nuevos tiempos:
```
globe       12%   (era 8%)
highlight   25%   (era 12%)
routes      55%   (era 45%)
lockup-big  72%
lockup-pair 88%
matchmove   98%
done        100%
```

Total intro: **7s** (vs 5.2s anterior) — más largo pero mejor narrativa secuencial.

---

## 2026-05-26 — Hero video robusto (autoplay policy fix)

**Problema**: User reportó "ya no está el video en el hero" en producción.

**Causa**: el archivo se servía OK (HTTP 200, Content-Length: 17.9MB) pero Chrome rechazaba el autoplay silenciosamente. El video tag `autoplay muted playsinline` debería funcionar pero en algunos escenarios (sticky parent + heavy page + bandwidth) el browser ignora autoplay.

**Solución** en `src/components/hero/Hero.astro`:
1. Agregado **fallback visual** detrás del video — gradient navy + radial bokeh teal, así el hero NUNCA se ve vacío aunque el video tarde.
2. Video inicia con `opacity-0` y hace fade-in al evento `canplay` (cuando el primer frame está listo).
3. Script JS:
   - Setea `muted=true` y `playsInline=true` explícitamente (override por si HTML attrs se perdieron).
   - Llama `play()` en mount.
   - Si `play()` rechaza → escucha el primer `click`/`touchstart`/`keydown`/`wheel` y reintenta.
   - `visibilitychange` listener: si el usuario vuelve a la pestaña y el video está paused, reintenta.

**Lección**: nunca confiar solo en `autoplay` HTML attribute. Para videos críticos del hero: fallback visual + script de retry son obligatorios.

---

## 2026-05-26 — Intro arcs luminosas con UnrealBloomPass

**Problema**: User pidió "que las líneas sean luminosas que alumbren un poco". Primer intento fue subir `arcStroke` de 0.5 a 1.6 → "no las pusiste luminosas solo las engrosaste".

**Causa**: confundí ancho con brillo. "Luminoso" = glow real (emisión de luz alrededor), no = grosor.

**Solución** en `src/components/intro/Intro3D.tsx`:
1. Stroke de vuelta a **0.55** (delgadas como antes).
2. Agregado **UnrealBloomPass** de three.js post-processing:
   ```ts
   import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
   import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
   import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

   const composer = new EffectComposer(renderer);
   composer.addPass(new RenderPass(scene, camera));
   const bloomPass = new UnrealBloomPass(
     new THREE.Vector2(w, h),
     0.85,   // strength
     0.55,   // radius
     0.18,   // threshold (bajo → arcs teal-300 entran al bloom)
   );
   composer.addPass(bloomPass);
   ```
3. Render loop: cambiar `renderer.render(scene, camera)` → `composer.render()`.
4. Resize handler: también `composer.setSize()` y `bloomPass.setSize()`.

**Resultado**: arcs delgadas pero con halo de luz teal alrededor de cada trazo. Visualmente "luminosas".

**Lección**: en three.js, glow real requiere post-processing (bloom). El emissive material solo emite en su propio fragmento, no irradia.

---

## 2026-05-26 — Sistema de vault compartido en el repo

**Contexto**: Jon trabaja desde su PC con vault Obsidian local. Otro colaborador va a editar desde otro PC sin acceso al Google Drive de Jon.

**Decisión**: Copiar los `.md` críticos del vault Movex (`G:\...\80 - Proyectos\Sitio Web Movex\`) a `docs/vault/` en el repo. NO copiar PDFs/HTMLs/MP4s pesados (van por separado si se necesitan).

**Sistema de pendientes**: `docs/PENDIENTES.md` es la **única fuente de verdad** sobre qué falta. Se versiona en git, ambos pueden editar.

**Sistema de decisiones**: este archivo. Append-only, fecha al inicio de cada entrada.

---

## 2026-05-26 — Bug fix: scroll bloqueado tras intro

**Problema**: Tras cargar el sitio, la intro animation (globo 3D) terminaba pero el scroll quedaba bloqueado. `html.lenis-stopped` persistía.

**Causa**: `finish()` en `Intro3D.tsx` removía `intro-locked` del html pero NO disparaba `window.dispatchEvent(new Event("mvx:intro-done"))`. Lenis nunca se reanudaba.

**Solución** (commit `f96275c`):
1. `finish()` ahora dispatcha el evento global
2. `animation.ts` agregó 2 safety nets:
   - Timeout 12s → auto-unlock si la intro no termina
   - Wheel/touchstart → si user intenta scrollear, asumir skip y unlock

**Lección**: cuando un componente "controla" el scroll vía algo (Lenis stop), el cleanup DEBE notificar al sistema con un evento. Mejor un evento global que un callback prop, así desacoplas componentes.

---

## 2026-05-26 — Card-stack scroll-driven en Servicios

**Contexto**: Jon pidió replicar exacto el efecto de Services en mvplogistics.eu.

**Cómo lo identifiqué**: JS inspection en vivo de mvplogistics.eu durante scroll real. Encontré que los 6 services-item están todos `position: absolute` en el mismo punto, con transforms coordinados:
```
.services__item-1: matrix(1, 0, 0, 1, -298.9, -300.5)   ← ya salió
.services__item-2..6: matrix(1, 0, 0, 1, -298.9, +736)  ← apilados abajo
```
Más 4 `.pin-spacer` confirmando GSAP ScrollTrigger pin.

**Implementación equivalente (vanilla, sin GSAP)** en `Servicios.astro` + `src/scripts/animation.ts`:
- Section con `height: (N+1) × 100vh` = pin-space natural CSS
- Inner `sticky top:0 h:100vh`
- 5 cards apiladas con `position: absolute inset-0`
- JS calcula `stage = progress × N - i` por card:
  - `stage < -1` → translateY(100%) abajo, no entró
  - `stage ∈ [-1, 1]` → translateY(-stage × 100%) transición
  - `stage > 1` → translateY(-100%) ya salió

**Beneficio vs GSAP**: 0 dependencias extra, control fino, fácil de modificar.

---

## 2026-05-26 — Scroll-stacking hero + Empresa

**Contexto**: Jon quería que el card de Empresa "subiera tapando" al hero conforme scrolleas (como MVP).

**Cómo lo identifiqué**: en mvplogistics, a scrollY=650, `hero rectTop=-324` y `.hero__video-wrapper transform: translate3d(0, 324, 0)`. Es decir, el video wrapper se traslada DOWN con `scrollY × 0.5`.

**Implementación más limpia que MVP** (commit `5af1f09`):
- Hero envuelto en pin space (`height: 100vh`)
- Hero mismo es `position: sticky top:0 h:100vh z:0` → queda pegado
- Empresa section ahora ES el card: `bg-navy-900 + rounded-t-[40px/56px] + z-20 + shadow`

**Por qué sticky vs transform**: más simple, sin JS, comportamiento nativo CSS, mejor performance en mobile.

---

## 2026-05-26 — Nav glass-pill estilo muffment

**Contexto**: Jon dijo "si aparece la franja cuando scrolleas que sea con efecto crystal como el de muffment y no una franja completa si no solo para el menú".

**Implementación** (`src/components/nav/Nav.astro`):
- 3 elementos horizontales independientes: logo / pill central glass / CTA
- Solo el `<nav id="nav-pill">` tiene `data-[active=true]:backdrop-blur-md data-[active=true]:bg-white/10`
- Activación vía IntersectionObserver con sentinel (NO `window.scroll` listener, porque Lenis intercepta wheel y `window.scrollY` no actualiza igual)

**Por qué IntersectionObserver vs scroll listener**: Lenis maneja el smooth scroll, así que el scroll nativo no siempre dispara como esperas. IntersectionObserver es agnóstico de la lib de scroll.

---

## 2026-05-26 — Lenis + SplitText reveal

**Contexto**: Jon quería el "feel smooth" de MVP. Inspeccioné MVP y descubrí que NO usa Lenis ni GSAP — usa **SplitText pattern** (chars wrapped en spans con stagger) + IntersectionObserver reveals.

**Implementación Movex**:
- Lenis 1.1 para smooth scroll (lerp 0.1) — pero esto es Movex-only, MVP no lo usa
- SplitText custom en `src/scripts/animation.ts`: divide `[data-split]` en `.word > .char` con CSS variable `--ci` para stagger
- Variantes: default 22ms, `data-split="fast"` 12ms, `data-split="slow"` 35ms

**Por qué SplitText custom vs librería**: 100 líneas de código vs 5KB+ de Splitting.js o similar. Y con `[data-split]` data-attribute, declarative y limpio.

---

## 2026-05-26 — Brand: Saira Variable + Hanken Grotesk

**Contexto**: Replicar typography de viamaster-intl.com (Archivo Expanded + Deuterium). Ambas son fuentes Adobe paid.

**Solución**: closest free matches en variable fonts:
- Display: **Saira Variable** (wght 400, wdth 125) — wide + slim igual que Archivo Expanded
- Body: **Hanken Grotesk Variable** (wght 300) — geometric grotesk light igual que Deuterium light

**Servidas via `@fontsource-variable/saira/{wght,wdth}.css`** + `@fontsource-variable/hanken-grotesk`.

**Aplicación**: utility classes `font-display` y `font-display-xl` en `src/styles/global.css` `@layer base`.

---

## 2026-05-26 — Stack inicial

**Stack elegido**:
- Astro 6 (static SSG) + React 19 islands → buen balance perf/DX
- Tailwind 4 via `@tailwindcss/vite`
- three.js + three-globe + react-three-fiber para intro 3D
- Vercel deploy auto desde GitHub main

**Por qué Astro vs Next**:
- Sitio mayormente estático → no necesitamos SSR
- Islands architecture → solo Intro3D es React, el resto es Astro plain (más rápido)
- Static export → Vercel free tier sin problema, edge caching máximo

**Convención branches**: `main` (default GitHub now), feature branches solo para experimentos grandes que tarden días.
