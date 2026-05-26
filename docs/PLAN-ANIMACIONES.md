# Plan de Animaciones — Movex Web

> **Para qué sirve este archivo**: mapa completo de cada animación del sitio.
> Documenta qué hay implementado, cómo funciona, y qué falta mejorar para
> que el feel se sienta como mvplogistics.eu (referente).
>
> Cualquier Claude que edite animaciones debe leer ESTO primero antes de
> tocar nada. Update este doc cada vez que agregues / cambies / quites
> una animación.

**Última actualización**: 2026-05-26
**Total intro**: 6.5s · **Lenis lerp**: 0.07 (premium slow)

---

## 🎬 Orden actual de secciones

```
INTRO 3D (globo) → HERO → SERVICIOS → EMPRESA → QUIÉNES SOMOS →
LOGÍSTICA DIGITAL → SOSTENIBILIDAD → CONFIANZA → CONTACTO → FOOTER
```

(Reordenado 2026-05-26 a pedido de Jon — Servicios debe ir JUSTO
después del Hero, no después de Empresa).

---

## 🌐 Stack de animación global

| Capa | Herramienta | Config |
|---|---|---|
| **Smooth scroll** | Lenis 1.1 | lerp 0.07, duration 1.4s, wheelMultiplier 0.85, touchMultiplier 1.5 |
| **Easing standard** | CSS `cubic-bezier(0.16, 1, 0.3, 1)` | Apple-like soft anticipatorio |
| **3D intro** | three.js + three-globe + UnrealBloomPass | bloom strength 0.85 |
| **Reveals** | IntersectionObserver + CSS `[data-reveal]` | duration 1100ms |
| **SplitText** | Custom JS en `animation.ts` | stagger 28ms/char, transición 1200ms |
| **Parallax tied** | Custom rAF loop en `animation.ts` | transform translate3d scroll-tied |
| **Card stack** | Custom JS scroll-driven | sticky inner + cards absolute apiladas |

Todo en `src/scripts/animation.ts` (bundleado por Vite) y `src/styles/global.css`.

---

## 📍 INTRO 3D (`src/components/intro/Intro3D.tsx`)

**Estado**: ✅ Perfecta — Jon dijo "no hay que hacerle nada".

**Timeline 6.5s total**:

| t | Phase | Qué pasa |
|---|---|---|
| 0.0s | `globe` | Mundo aparece (neutral, Colombia indistinguible) |
| 0.9s | `highlight` | Colombia se ilumina (cap teal + stroke + altitud 0.022) |
| 1.8s | `routes` | Arcs luminosas (con bloom UnrealBloomPass) empiezan a salir de Colombia |
| 3.3s | `lockup-big` | Globe se difumina con scale 0.6 + mask radial. M gigante (60vh) aparece |
| 4.4s | `lockup-pair` | M se reduce a 9rem. Wordmark "movex" entra desde la derecha (stagger delay 150ms) |
| 5.5s | `matchmove` | Lockup vuela a la esquina superior izquierda del nav (escala 0.32) |
| 6.5s | `finish` | Despacha `mvx:intro-done`, remueve `intro-locked`, desbloquea scroll |

**Barra de progreso** inferior fillea 0→100% sincronizada.

**Skip handlers**: ESC, click, wheel, touchstart auto-skip + safety timeout 12s.

**FOUC guard**: `#intro-cover` (navy fullscreen) tapa el sitio desde el primer paint, antes de que React monte. CSS `:not(#intro-cover):not(astro-island)` deja visible solo lo necesario.

---

## 🎯 HERO (`src/components/hero/Hero.astro`)

**Estado**: ✅ Layout y entry animation funcionando.

**Animaciones implementadas**:

1. **Video del barco** — autoplay robusto con retry + fade-in al `canplay` + loop seamless (reset `currentTime` 0.15s antes del fin → sin salto)
2. **Parallax sutil del video** — `data-parallax="0.15" data-parallax-from="page"` → se queda atrás 15% del scroll
3. **Entry animation post-intro** — 4 elementos con stagger 140ms:
   - Brand label (0ms)
   - Título (140ms)
   - Body (280ms)
   - CTAs (420ms)
   - Cada uno: fade-in opacity 0→1 + slide-up translateY 40px→0 en 900ms con `cubic-bezier(0.16, 1, 0.3, 1)`
4. **SplitText reveal** del título "Avance. / Movilidad global." — chars con stagger 28ms (variante "slow" para la 2da línea = 42ms)
5. **Sticky pin** — hero envuelto en `<div height: 100vh>` + section `position: sticky top:0 h:100vh z:0`

**Cómo se siente**:
- Carga: intro termina → hero aparece con elementos en cascada
- Scroll: hero queda pinned, video parallax sutil, Servicios sube tapándolo

---

## 🛠 SERVICIOS (`src/components/sections/Servicios.astro`)

**Estado**: ✅ Card stack funcionando. Ahora también scroll-stacking sobre el Hero (con `rounded-t-[40px]` y `z-20`).

**Animaciones**:

1. **Scroll-stacking sobre Hero** — section tiene `z-20 bg-navy-900 rounded-t-[40px] sm:rounded-t-[56px] shadow-[0_-20px_60px_rgba(0,0,0,0.4)]`. Sube tapando al Hero sticky.

2. **Card-stack scroll-driven** — los 5 services se apilan en el mismo lugar. Conforme scrolleas, cada card transiciona translateY(100% → 0% → -100%) con `stage = progress × N - i`. Inspirado en MVP (que usa GSAP ScrollTrigger pin — yo lo hago vanilla).

3. **Imagen cross-fade** — la imagen del service activo cambia con opacity transition 500ms.

4. **Counter + dots** sincronizados con activeIdx.

5. **Headline decorativo** "SERVICIOS GLOBALES" en background con `data-parallax="0.28"` — se mueve más lento que el contenido.

6. **Título "Lo que hacemos — end-to-end."** con SplitText por chars.

---

## 🏢 EMPRESA (`src/components/sections/Empresa.astro`)

**Estado**: ✅ Funcionando como segunda card en el scroll-stack.

**Animaciones**:

1. **Scroll-stacking** (continúa de Servicios) — `z-20 bg-navy-900 rounded-t-[40px] sm:rounded-t-[56px] shadow`. Sube tapando Servicios.

2. **Headline decorativo** "MÁS DE UNA DÉCADA" — `data-parallax="0.15"` en background.

3. **Título "Movex Company."** con SplitText.

4. **Reveals** en párrafos con `data-reveal="up"` + delays escalonados.

5. **Counters animados** (countup) — números cuentan de 0 al target en 1.6s con easing cubic.

---

## 🏆 QUIÉNES SOMOS (`src/components/sections/QuienesSomos.astro`)

**Estado**: ✅ Funcionando.

**Animaciones**:

1. **Sticky title left + cards right** — el título grande "Nuestras ventajas." queda pinned arriba a la izquierda con `lg:sticky lg:top-32` mientras las 8 cards scrollean a la derecha.

2. **Cards reveal** — cada card con `data-reveal="right"` + delay escalonado 60ms.

3. **Título SplitText** — "Nuestras ventajas." con chars stagger.

4. **Timeline strip** abajo — 4 puntos history con animación reveal individual.

---

## 💻 LOGÍSTICA DIGITAL (`src/components/sections/LogisticaDigital.astro`)

**Estado**: ✅ Funcionando.

**Animaciones**:

1. **Imagen dashboard background** con `data-parallax="0.15"`.

2. **Título split en 3 líneas** — "Tu carga, / visible / en tiempo real."

3. **CTA reveal** con delay 200ms.

---

## 🌱 SOSTENIBILIDAD (`src/components/sections/Sostenibilidad.astro`)

**Estado**: ✅ Funcionando.

**Animaciones**:

1. **Título split** "Crecemos / donde operamos."

2. **Cards** con `data-reveal="up"` + delay escalonado 100ms cada una.

3. **Imágenes** con hover scale 1.10 + filter hue-rotate variable.

---

## 🤝 CONFIANZA (`src/components/sections/Confianza.astro`)

**Estado**: ✅ Funcionando (placeholders de logos).

**Animaciones**:

1. **Título split** "Certificaciones / y aliados."

2. **Grid de placeholders** con hover grayscale-0 + opacity-100.

---

## 📞 CONTACTO (`src/components/sections/Contacto.astro`)

**Estado**: ✅ Funcionando.

**Animaciones**:

1. **Card oscuro grande** con headline decorativo "HABLEMOS" en background `data-parallax="0.3"`.

2. **Título split** "Hablemos / de tu carga."

3. **Form** con focus states teal-300 en inputs.

⏳ **Pendiente**: backend del form (actualmente solo alert demo).

---

## ⏳ MEJORAS PENDIENTES (priorizadas)

### 🔥 Alta prioridad

- [ ] **Mobile**: verificar que el card-stack de Servicios funcione bien en mobile (en pantallas pequeñas, las cards pueden verse muy chicas — quizás cambiar a stack vertical normal en `< 768px`).
- [ ] **Anchor scrolls**: cuando das click en "Sobre Movex" → `#empresa`, el scroll-to debe coordinar con el sticky del Hero (puede saltar mal). Verificar offset.
- [ ] **Test del orden nuevo** (Hero → Servicios → Empresa) — confirmar que Servicios sube bien sobre el Hero pinned.

### 🟡 Media prioridad

- [ ] **Form contacto real**: actualmente `onsubmit alert demo`. Conectar a Formspree / Resend / Vercel Function.
- [ ] **Smooth scroll a anchor links con `lenis.scrollTo()` offset -64px** (para no quedar bajo el nav). Ya existe en `animation.ts` pero verificar.
- [ ] **Más coherencia de easings**: hacer un pase y verificar que TODO use `cubic-bezier(0.16, 1, 0.3, 1)` (Apple soft). Hoy hay mezcla con `cubic-bezier(0.22, 1, 0.36, 1)` y `cubic-bezier(0.65, 0, 0.35, 1)`.

### 🟢 Baja prioridad / nice-to-have

- [ ] **Cursor custom** estilo Awwwards (sutil círculo que cambia al hover).
- [ ] **Page transition** si en el futuro hay más páginas (no aplica para landing single-page).
- [ ] **Sound effects** (subtle whoosh en transiciones) — solo si Jon quiere.
- [ ] **Magnetic effect** en CTAs (botones que se "atraen" al cursor).

---

## 🔧 Para debuggear / inspeccionar el feel del referente

Si necesitas comparar con MVP en cualquier momento:

```bash
# 1. Abrir MVP en Chrome MCP
mcp__Claude_in_Chrome__navigate → https://mvplogistics.eu/en/main-en/

# 2. Grabar GIF del scroll real (esencial — screenshots estáticos no captan movimiento)
mcp__Claude_in_Chrome__gif_creator action=start_recording
# ...scroll...
mcp__Claude_in_Chrome__gif_creator action=stop_recording + export download=true

# 3. Inspeccionar libs/transforms en vivo
mcp__Claude_in_Chrome__javascript_tool → getComputedStyle(...).transform, etc.
```

**Findings clave de MVP (de inspecciones previas, ver `docs/DECISIONES.md`):**
- NO usan GSAP, Lenis, Framer Motion, Locomotive Scroll, AOS, Splitting.js
- Todo en `main.js` (483KB de código vanilla custom)
- Preloader cinematográfico con truck rotando + texto reveal letter-by-letter + counter 0-100%
- Hero pinned con position:sticky o equivalente
- Sections scroll-stacking con border-radius arriba
- Services cards apiladas en el mismo punto (GSAP ScrollTrigger pin)

---

## 📚 Referencias técnicas

- **Lenis docs**: https://github.com/darkroomengineering/lenis
- **three.js post-processing (UnrealBloomPass)**: https://threejs.org/docs/#examples/en/postprocessing/EffectComposer
- **cubic-bezier visualizer**: https://cubic-bezier.com/#0.16,1,0.3,1
- **Inspecciones de MVP previas**: `docs/DECISIONES.md` (entradas del 2026-05-26)
