# Pendientes — Movex Web

> **Cómo se usa este archivo**: cualquiera (Jon, colaborador, Claude) actualiza esto cuando agrega/cambia/completa una tarea. Es la **única fuente de verdad** sobre qué falta. Antes de tomar una tarea, marca `[in progress] — <tu nombre>` para que el otro no la duplique.

**Última actualización**: 2026-05-26 — por Claude (sesión iamdisenoco)

---

## 📋 Plan de animaciones detallado

Ver **[`docs/PLAN-ANIMACIONES.md`](./PLAN-ANIMACIONES.md)** — mapa completo
de cada animación del sitio, sección por sección, con status, configs, y
mejoras pendientes. Read it first antes de tocar animaciones.

## 🔥 Crítico (próxima sesión)

- [ ] **(usuario)** Revisar visualmente https://movex-web.vercel.app después del deploy y confirmar que todo funciona en browser real (no solo en MCP que tiene throttling)
- [ ] **(usuario)** Cambiar repo a **privado** si se quiere ocultar el código fuente (Settings → Danger Zone → Change visibility). Vercel + colaboración siguen funcionando igual.
- [x] **HECHO (2026-05-26)** Orden cambiado: ahora es Hero → Servicios → Empresa → Quiénes Somos → ...  Servicios sube sobre el Hero pinned (border-radius arriba + shadow).

---

## 💡 IDEAS futuras (anotadas, NO implementar todavía)

### Animación del isotipo: 3 contenedores cayendo apilados → forman las 3 rayas

**Idea de Jon (2026-05-26)** — concepto temático que conecta con el negocio:

Reemplazar la animación actual del isotipo en el intro (las 3 rayas que aparecen sliding desde lados alternos con stagger 120ms) por algo más narrativo y propio del rubro:

1. **3 contenedores 3D caen** desde arriba del viewport (uno tras otro o simultáneos con stagger).
2. **Se apilan** uno encima del otro al aterrizar (con sutil bounce físico).
3. **Pausa breve** (200-400ms) mostrando los 3 contenedores apilados como una torre.
4. **Se separan** ligeramente (cada uno hace slide hacia su posición inclinada final).
5. **Forman las 3 rayas del isotipo** (con la inclinación característica del logo nuevo).

**Por qué tiene sentido**:
- Movex = logística portuaria → **contenedores** son el ícono visual del negocio.
- Las 3 rayas del logo nuevo YA tienen forma alargada/apilable que sugiere contenedores.
- Conexión narrativa: "manejamos contenedores" → la animación lo dice visualmente antes de que aparezca el wordmark.

**Posibles implementaciones**:
- **Vanilla CSS**: 3 divs con `perspective` + `rotate3d` + `keyframes` con easing bounce (`cubic-bezier(0.34, 1.56, 0.64, 1)` para el aterrizaje).
- **3D real en three.js**: usar el canvas que ya tenemos del Intro3D, mostrar 3 cajas con texturas de contenedor (necesitaría asset o textura procedural).
- **Lottie**: animación pre-hecha en After Effects exportada a JSON, montada con `lottie-web`.

**Status**: 💤 ANOTADO, NO IMPLEMENTAR TODAVÍA. Esperar luz verde de Jon.

---

## 🎨 Animación intro (puntos 3 y 4 del último brief de Jon, pendientes de implementar)

> Jon mandó imágenes que no llegaron al chat. **Punto 1 y 2 quedaron sin hacer** porque dependen de ver las imágenes. Punto 3 y 4 sí pueden hacerse:

### Punto 3 — Líneas luminosas en el intro
- [x] **HECHO** (2026-05-26): primer intento engrosó las arcs (stroke 1.6) sin glow real. User dijo "no las pusiste luminosas solo las engrosaste". Fix correcto: bajado stroke a 0.55 + agregado **UnrealBloomPass** (post-processing) con strength 0.85, radius 0.55, threshold 0.18. Ver `docs/DECISIONES.md` para detalle.

### Punto 4 — Tiempos muertos + cleanup visual del intro
- [x] **HECHO** (2026-05-26): Timeline reescalonado con respiración intencional entre fases. Después de feedback del user "primero el mundo, luego se resalta Colombia, luego salen las líneas" → fases ya tienen 900ms cada una. Detalle en `DECISIONES.md`.
- [x] **HECHO** (2026-05-26): Transición globe→M ahora con scale 0.45 + blur 18px + ease soft (1400ms). Se siente morpheándose.
- [ ] **Quitar TODOS los textos de los lados del intro**:
  - `MVX // 04°53'N · 75°50'W` (esquina sup izq)
  - `LOADED 177 COUNTRIES · COLOMBIA ✓` (esquina sup der)
  - `PRESS ESC OR CLICK TO SKIP` (esquina inf izq)
  - `SKIP →` (esquina inf der) — mantener funcionalidad de click anywhere para skip
- [ ] **Dejar SOLO** abajo una **barra de progreso** que simule loading. Debe llegar a 100% cuando la animación termine.
  - Barra horizontal full-width, posición inferior
  - Color: teal-500 sobre fondo navy-700/30
  - Progreso vinculado al `phase` actual: 0% al inicio, 25% en globe, 50% en routes, 75% en lockup-big, 100% en matchmove

## ⏳ Esperando imágenes de Jon (puntos 1 y 2)

- [ ] **Punto 1**: Jon dijo "después de esta sección debe seguir es lo de mis servicios". **Necesita imagen** para saber a qué sección se refiere. Hipótesis: probablemente el orden Hero → Empresa → Servicios necesita ajuste, o quiere agregar otra sección antes de Servicios. **PREGUNTAR cuando arranque la sesión**: "¿cuál sección debe quedar antes de Servicios y dónde va lo que sacamos?"
- [ ] **Punto 2**: Sobre la animación de los números (counters de Empresa). Jon dijo "mira cómo están los números, recuerda no quitar la animación". **Necesita imagen** para ver el problema visual. Verificar que la `data-countup` sigue funcionando en `Empresa.astro` con `parseInt(c.value)`.

---

## 🎬 Features pendientes del proyecto

- [ ] **Regenerar videos en Higgsfield HD** (los actuales son los compressed a 17MB; se quieren versiones 4K originales para refactor en H.265 con mejor calidad)
- [ ] **Conectar dominio movex.com.co** (Vercel → Domains → Add). Necesita acceso al panel DNS del cliente.
- [ ] **Implementar form de contacto real** en `src/components/sections/Contacto.astro` (actualmente es `<form>` sin action). Opciones: Formspree, Resend, o endpoint Vercel Function.
- [ ] **Sección "Quiénes Somos" / timeline**: revisar contenido y verificar que tiene la historia real de Cargoban (no placeholder).
- [ ] **Tema mobile responsive**: probar en 375px, 768px. La sección Servicios card-stack en mobile probablemente requiere otro pattern (las cards se ven muy chicas).
- [ ] **SEO**: agregar `<meta>` específicos por sección, sitemap.xml, robots.txt
- [ ] **Performance**: lazy-load del componente Intro3D (only on first load), code-split del three.js bundle (~700KB)

---

## ✅ Hecho (changelog rápido)

Ver `docs/DECISIONES.md` para el detalle completo. Resumen:

- [x] Stack Astro 6 + React 19 + Tailwind 4 + three.js
- [x] Intro 3D con globo + arcos + match-move a nav
- [x] Hero sticky + scroll-stacking (Empresa sube tapando hero)
- [x] Servicios card-stack scroll-driven (5 cards pinned)
- [x] SplitText reveal por chars con stagger
- [x] Lenis smooth scroll + parallax tied
- [x] Nav glass-pill estilo muffment (solo menú central)
- [x] Bug fix: scroll bloqueado tras intro (faltaba dispatch `mvx:intro-done`)
- [x] Deploy Vercel + GitHub auto-deploy
- [x] ONBOARDING.md + README.md para que otro colaborador arranque
- [x] Vault con contexto del proyecto copiado a `docs/vault/`

---

## 📋 Reglas para mantener este archivo limpio

1. **Antes de tomar una tarea**: cámbiala a `[in progress] — <nombre>` y haz push (avisa al otro).
2. **Al completarla**: muévela a la sección "✅ Hecho" con la fecha, y agrega entrada en `docs/DECISIONES.md` si fue una decisión técnica.
3. **Si encuentras un bug nuevo**: agrégalo en "🔥 Crítico" o "🎬 Features pendientes" según urgencia.
4. **No borres tareas viejas** — pásalas a "✅ Hecho" para tener histórico.
5. **Si dudas si algo es prioritario**, preguntale a Jon antes de hacer.
