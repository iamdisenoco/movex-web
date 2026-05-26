# Output Fase F — Movex Landing

**Generado:** 2026-05-24
**Decisiones de Jon en esta fase:**
- Idioma: Solo español (toggle EN queda para fase 2)
- Hero: Vista aérea de puerto con contenedores Movex (drone shot, cinematográfico)
- Tipografía: Inter

---

## 1. Brand Identity Refinado

### Tipografía
- **Primaria:** Inter (400, 500, 600, 700, 900) — Google Fonts
- **Display (hero / títulos grandes):** Inter 900 con `letter-spacing: -0.04em` para sensación premium tight
- **Monoespaciada (datos, números de tracking):** JetBrains Mono o IBM Plex Mono
- **Tamaño base:** 16px, escala 1.250 (Major Third)

### Paleta (definitiva, del manual de marca)
```
--navy-900:   #1a2940   /* fondo principal, hero */
--navy-700:   #2a3a55   /* secciones secundarias */
--navy-500:   #5a6a8a   /* texto secundario sobre claro */
--lavender:   #8a9bc4   /* acento sutil, hover states */
--teal-500:   #2d8a8a   /* CTA primario, brand accent */
--teal-300:   #5fb3b3   /* hover de teal-500 */
--sage-light: #a8c4a0   /* highlight sostenibilidad */
--sage-700:   #7ba090   /* sostenibilidad texto */
--white:      #fafbfc   /* fondo claro */
--gray-100:   #eef0f3   /* bordes, separadores */
--gray-500:   #6b7280   /* texto muted */
```

### Reglas de uso
- Hero: navy-900 dominante + teal-500 acento + white tipografía
- Body: white fondo + navy-900 texto + teal-500 CTAs
- Sostenibilidad: sage-light fondo + navy-900 texto (única sección con paleta cálida)
- Logística Digital (sección destacada): navy-900 fondo con grids de teal-500 (sci-fi data)
- Sombras: nunca hard shadows — solo glow sutil con teal-500 a 8% opacity

### Tono de copy
- Sentencias cortas, declarativas, en presente
- Cero adjetivos vacíos ("líder", "innovador", "revolucionario")
- Datos concretos > calificativos
- 1 idea por bloque, espacio en blanco generoso
- CTAs siempre verbo + sustantivo concreto ("Cotizar carga", "Hablar con operaciones")

---

## 2. Wireframe Completo

### Sección 0 — Navigation (sticky)
```
[Logo Movex] [Empresa] [Quiénes Somos] [Servicios ▾] [Sostenibilidad] [Contacto]   [Cotizar carga →]
```
- Fondo: blur backdrop sobre navy-900 con opacity 0.85
- Logo: versión blanca sobre navy
- CTA derecho: teal-500 background, navy-900 text, rounded-full

### Sección 1 — HERO
```
[Background: video loop de drone aéreo sobre puerto Movex]
[Overlay: gradient navy-900 → transparent, 40% opacity]

                        AVANCE
                        & MOVILIDAD

         Operador logístico portuario premium
         para carga internacional desde Apartadó
         y Santa Marta hacia el mundo.

         [Cotizar carga →]    [Conocer Movex]

                ↓ scroll
```
- Tipografía hero: Inter 900, 96px en desktop, letter-spacing -0.04em
- Subtítulo: Inter 400, 22px, navy-500 sobre overlay
- CTAs: primario teal-500 sólido, secundario outline white
- Scroll indicator animado abajo

### Sección 2 — EMPRESA (Introducción + Datos)
```
                Más de una década moviendo
                el comercio del país.

[texto introducción 2-3 párrafos, max-width 720px, navy-900]

────────────────────────────────────────────────────

  {{CAJAS_ANUALES}}      {{CONTENEDORES_AÑO}}      {{VEHICULOS}}      {{PAISES_SERVIDOS}}
  Cajas movilizadas      Contenedores al año       Vehículos          Países atendidos
```
- Contadores animados al hacer scroll into view (count-up de 0)
- Tipografía números: Inter 900, 72px, teal-500
- Labels: Inter 500, 14px, uppercase, letter-spacing 0.08em, navy-500
- Fondo: white, separadores gray-100

### Sección 3 — QUIÉNES SOMOS (Timeline + Valores)
```
                    Nuestra historia
                    [línea timeline horizontal con hitos]

  2012 ───● ─────── 2018 ───● ─────── 2024 ───● ─────── 2026 ───●
  Fundación          Expansión Santa    Logística         Movex:
  Cargoban           Marta              Digital           plataforma
  (Apartadó)                                              internacional

────────────────────────────────────────────────────

[3 columnas: Misión / Visión / Valores]
```
- Timeline interactivo: hover en cada hito muestra card flotante con detalle
- Valores: 4 cards (Confianza, Trazabilidad, Sostenibilidad, Eficiencia) con icono lineal teal-500

### Sección 4 — SERVICIOS (tabs interactivos)
```
                     Lo que hacemos

   [Operaciones    [Operaciones    [Logística     [Logística    [Alquiler de
    terrestres]     portuarias]     digital ★]     global]       equipos]
   ──────────                       (destacado)

   [Card grid del servicio seleccionado, scroll-driven reveal]
   [Cada servicio: icono lineal + título + 1 línea descriptiva]
```
- Tab "Logística Digital" tiene badge "★ Diferenciador Movex" y borde teal
- Scroll-driven: las cards aparecen con fade-up + stagger al entrar viewport
- Items por categoría: ver `contexto.md` (lista completa del Excel del cliente)

### Sección 5 — LOGÍSTICA DIGITAL (feature destacado)
```
[Fondo navy-900 fullbleed]
[Background: imagen de dashboard holográfico sobre contenedor, overlay grid teal animado]

         Tu carga, visible en tiempo real.

         Trazabilidad end-to-end. Auditoría continua de cadena de frío.
         Consultoría de procesos. Software hecho a la operación.

         [Ver demo de trazabilidad →]
```
- Esta sección rompe el flujo del sitio (fondo oscuro) para destacar el diferenciador
- Animación: las líneas del grid pulsan suavemente como un radar

### Sección 6 — SOSTENIBILIDAD (paleta sage)
```
[Fondo sage-light]

         Crecemos donde operamos.

[4 cards: Fundación Movex / FONDECAR / Bienestar laboral / Ambiente]
[Cada card: imagen reducida + título + 2 líneas + link "Conocer más →"]
```
- Única sección con paleta cálida (rompe la fría dominante)
- Si hay fotos reales del cliente eventualmente, reemplazan a las IA-generated

### Sección 7 — CONFIANZA (certificados + clientes)
```
                  Certificaciones y aliados

[Grid de logos: BASC, OEA, ISO, navieras (MAERSK, MSC...) — placeholders]
```
- Logos en grayscale, color al hover
- Si no hay logos reales, dejar 8 placeholders con outline + texto "Logo cliente"

### Sección 8 — CONTACTO
```
                Hablemos de tu carga.

[Grid 2 columnas]
[Izquierda: formulario  Nombre / Empresa / Email / Tel / Mensaje + select tipo de carga]
[Derecha: info contacto]
        Apartadó (sede principal)
        [dirección + tel + email]

        Santa Marta (operaciones portuarias)
        [dirección + tel + email]

        WhatsApp directo: [+57 XXX XXX XXXX]

[Mapa abajo, fullbleed, con marker en Apartadó y Santa Marta]
```

### Sección 9 — FOOTER
```
[Fondo navy-900]
[Logo Movex blanco] [Tagline: AVANCE & MOVILIDAD]
[4 columnas: Empresa / Servicios / Sostenibilidad / Legal]
[Redes: IG, LinkedIn, YouTube]

──────────────────────
© 2026 Movex by Cargoban Group. Todos los derechos reservados.
```

---

## 3. Prompt One-Shot para Claude Design

> **Cómo usar:** Abrí Claude Design → Nuevo proyecto → modo **High Fidelity** → adjuntá las 5 imágenes generadas + 3 videos generados (paso R y A) → pegá el prompt completo de abajo en el chat → enviá. Una sola corrida.

---

```
Construye una landing page para "Movex — Avance & Movilidad", marca premium internacional de operaciones logísticas portuarias y extraportuarias del grupo Cargoban, con sede en Apartadó (Urabá Antioqueño) y operaciones en Santa Marta, Colombia. Target: importadores/exportadores grandes, navieras internacionales (MAERSK, MSC, Hapag-Lloyd, CMA CGM), agroindustria exportadora (banano, café, palma) y manufactura con cadena de frío.

TÉCNICA Y STACK:
- Salida en High Fidelity, una sola página index.html con todos los assets.
- Tipografía: Inter (Google Fonts: 400, 500, 600, 700, 900) + JetBrains Mono para números/tracking.
- Diseño mobile-first con breakpoints: 640px, 1024px, 1440px.
- Scroll-driven animations con CSS scroll-timeline o Intersection Observer (no librerías pesadas).
- Lazy loading de imágenes y videos.
- Cero blog, cero CMS — todo estático.

PALETA EXACTA (no inventar otros colores):
--navy-900: #1a2940 / --navy-700: #2a3a55 / --navy-500: #5a6a8a
--lavender: #8a9bc4 / --teal-500: #2d8a8a / --teal-300: #5fb3b3
--sage-light: #a8c4a0 / --sage-700: #7ba090
--white: #fafbfc / --gray-100: #eef0f3 / --gray-500: #6b7280

ESTRUCTURA (9 secciones, en este orden):

1. NAV STICKY: blur backdrop sobre navy-900 a 85% opacity. Logo blanco izquierda. Links centrales: Empresa, Quiénes Somos, Servicios (dropdown), Sostenibilidad, Contacto. CTA derecho "Cotizar carga →" en teal-500 con rounded-full.

2. HERO: full-viewport. Background: video adjuntado "hero-loop.mp4" en loop muted autoplay, object-fit cover. Overlay gradient navy-900 (40% opacity) → transparente. Centro: título "AVANCE & MOVILIDAD" en Inter 900 a 96px desktop (48px mobile), letter-spacing -0.04em, color white. Subtítulo Inter 400 22px navy-500 (sobre overlay): "Operador logístico portuario premium para carga internacional desde Apartadó y Santa Marta hacia el mundo." Dos CTAs en fila: primario "Cotizar carga →" (teal-500 sólido), secundario "Conocer Movex" (outline white). Indicador scroll animado abajo.

3. EMPRESA: fondo white, padding vertical generoso. Título centrado Inter 700 56px: "Más de una década moviendo el comercio del país." Párrafo introductorio max-width 720px, Inter 400 18px navy-900 con texto sobre experiencia portuaria del grupo Cargoban (escribir 2 párrafos originales, no copiar de ningún lado). Separador gray-100 horizontal. Fila de 4 contadores animados (animar count-up al entrar viewport): {{CAJAS_ANUALES}}, {{CONTENEDORES_AÑO}}, {{VEHICULOS}}, {{PAISES_SERVIDOS}}. Números en Inter 900 72px teal-500. Labels debajo en Inter 500 14px uppercase letter-spacing 0.08em navy-500: "Cajas movilizadas", "Contenedores al año", "Vehículos en flota", "Países atendidos".

4. QUIÉNES SOMOS: fondo white. Título "Nuestra historia". Timeline horizontal con 4 hitos (2012 Fundación, 2018 Expansión Santa Marta, 2024 Logística Digital, 2026 Movex internacional). Cada hito es un círculo teal-500 conectado por línea. Hover en hito muestra card flotante con descripción. Debajo, grid de 3 columnas: Misión / Visión / Valores. Misión: "Conectar la carga de nuestros clientes con el mundo de manera segura, ágil y trazable." Visión: "Ser el operador logístico portuario referente de América Latina en logística digital de exportación." Valores en 4 cards con iconos lineales teal-500: Confianza, Trazabilidad, Sostenibilidad, Eficiencia.

5. SERVICIOS: fondo white. Título "Lo que hacemos." Tabs horizontales (en mobile: dropdown): Operaciones terrestres / Operaciones portuarias / Logística digital ★ / Logística global / Alquiler de equipos. El tab "Logística digital" tiene badge teal "★ Diferenciador Movex" y se ve más prominente. Al cambiar de tab, scroll-driven reveal de un grid de cards (3 columnas desktop, 1 mobile). Cada card: icono lineal teal-500 + título Inter 600 18px + 1 línea descriptiva Inter 400 15px navy-500. Contenido de cada tab (usar exacto):
   - Terrestres: Descargue de camiones / Consolidación de contenedores / Desconsolidación de contenedores / Apoyo a inspecciones / Inspecciones de calidad / Etiquetado / Operación de equipos portuarios / Mantenimiento portuario / Alistamiento de contenedores / Auxiliares de grúa.
   - Portuarias: Trincado y destrincado / Conexión y desconexión a bordo / Estiba y desestiba general / Estiba y desestiba de contenedores / Estiba y desestiba refrigerada.
   - Logística digital: Trazabilidad end-to-end / Auditoría de cadena de frío / Consultoría de procesos / Tarja y chequeo / Software a medida.
   - Logística global: Gestión segura de carga / Asesoramiento de transporte / Coordinación marítimo y terrestre / Agenciamiento aduanero.
   - Alquiler: Equipos de manipulación / Equipos de seguridad / Equipos de mantenimiento portuario.

6. LOGÍSTICA DIGITAL (sección destacada full-bleed): fondo navy-900. Background image adjuntada "digital-dashboard.png" con opacity 0.4 y blend mode multiply. Encima, grid animado de líneas teal-500 que pulsan como radar (CSS animation, ciclo 4s). Título Inter 900 64px white: "Tu carga, visible en tiempo real." Subtítulo Inter 400 20px navy-500 (sobre fondo oscuro usar lavender en su lugar): "Trazabilidad end-to-end. Auditoría continua de cadena de frío. Consultoría de procesos. Software hecho a la operación." CTA "Ver demo de trazabilidad →" en teal-500.

7. SOSTENIBILIDAD: fondo sage-light. Título Inter 700 56px navy-900: "Crecemos donde operamos." Grid 4 cards: Fundación Movex / FONDECAR / Bienestar laboral / Ambiente. Cada card: imagen redondeada (usar imagen "sostenibilidad.png" adjuntada, replicada o variantes), título Inter 600 20px navy-900, 2 líneas descriptivas Inter 400 15px sage-700, link "Conocer más →" en teal-500.

8. CONFIANZA: fondo white. Título "Certificaciones y aliados." Grid de 8 logos placeholder en grayscale (outline gray-500 con texto "Logo aliado" en cada uno), que pasan a color al hover.

9. CONTACTO: fondo navy-700. Título white "Hablemos de tu carga." Grid 2 columnas: izquierda formulario (Nombre / Empresa / Email / Teléfono / Tipo de carga (select: General, Refrigerada, Granel, Maquinaria, Otra) / Mensaje + botón "Enviar solicitud" teal-500), derecha info: Apartadó (dirección placeholder, tel, email), Santa Marta (dirección placeholder, tel, email), WhatsApp directo. Debajo del grid, embed de mapa fullbleed con marker en ambas ciudades (placeholder iframe Google Maps).

10. FOOTER: fondo navy-900. Logo Movex blanco + tagline "AVANCE & MOVILIDAD" debajo. 4 columnas: Empresa / Servicios / Sostenibilidad / Legal. Iconos sociales: Instagram, LinkedIn, YouTube. Línea inferior centrada: "© 2026 Movex by Cargoban Group. Todos los derechos reservados."

ASSETS ADJUNTADOS (ya subidos):
- hero-loop.mp4 (video sección 2)
- portuario.png (no usar en hero, sino como segunda imagen de sección Servicios)
- terrestre.png (imagen de operaciones terrestres en sección 5)
- digital-dashboard.png (background sección 6)
- sostenibilidad.png (imagen base sección 7, replicar variantes para las 4 cards)
- servicios-transition.mp4 (video opcional entre sección 4 y 5, fullbleed 200vh trigger scroll)
- contador-360.mp4 (video opcional sutil en sección Empresa, detrás de los números, opacity 0.15)

RESTRICCIONES:
- NO inventar números reales (mantener los placeholders {{CAJAS_ANUALES}} etc.)
- NO inventar logos de clientes (placeholders en sección Confianza)
- NO usar emojis en el sitio.
- NO usar sombras duras, solo glow sutil con teal-500 a 8% opacity.
- NO librerías pesadas (sin GSAP, sin Framer, sin Anime.js — solo CSS + IntersectionObserver vanilla).

OBJETIVO FINAL: una landing que un importador/exportador grande mire y piense "estos saben lo que hacen". Premium, ejecutiva, motion-driven sin ser ruidosa.
```

---

## 4. Prompts de Imágenes (5)

> **Cómo usar:** Pegá cada prompt en ChatGPT Image 2 (vía Higgsfield o directo en ChatGPT Plus). Generá baja calidad primero para validar composición; cuando guste, regenerá en alta calidad.

### Imagen 1 — Hero (aunque va a quedar de video, generar también versión estática como fallback)
**Formato:** 16:9, 2560x1440
```
Cinematic aerial drone shot at golden hour over a massive container port in coastal Colombia. Multiple rows of intermodal shipping containers in deep navy blue (#1a2940), some with the subtle "M" Movex logo in white visible on the side. In the background, large blue MAERSK and grey MSC container stacks. A blue MAERSK Triple-E class container ship docked at the pier, two STS gantry cranes silhouetted against the warm orange sunset sky. Soft volumetric atmospheric haze, lens flare from the setting sun on the upper right. Color grading: navy and teal in shadows, warm amber in highlights, cinematic teal-and-orange complement. Composition: rule of thirds with the ship at the lower-right intersection, containers leading diagonally from bottom-left. No people visible. No text. Photorealistic, 35mm lens equivalent, slight motion blur on cranes. Highly detailed, 8K, professional commercial photography style, mood of premium global trade.
```

### Imagen 2 — Operaciones terrestres
**Formato:** 1:1, 1600x1600
```
Top-down aerial photograph of a logistics yard. A modern blue cargo truck with a navy blue (#1a2940) container being loaded by a reach stacker crane (also navy blue). Painted yellow lines on the asphalt indicating bays. Soft overhead daylight from a slightly overcast sky. Color palette dominated by deep navy, asphalt grey, and small teal accents (#2d8a8a) on safety vests of distant workers. Clean, organized, premium industrial look. No text or logos. Photorealistic, 8K, drone photography aesthetic, slight bird's eye perspective.
```

### Imagen 3 — Operaciones portuarias
**Formato:** 16:9, 2560x1440
```
Low-angle heroic shot of a massive blue STS (ship-to-shore) gantry crane in mid-operation, lifting a single navy blue (#1a2940) shipping container against a dramatic deep blue sky with backlit clouds. Below, a sliver of the deck of a container ship visible. The crane's structural steel is painted teal (#2d8a8a) accent at the joints. Bird-eye view of the crane spreader and container suspended. Composition emphasizes scale and engineering: the container looks small relative to the crane structure. Sharp, crisp, professional documentary photography. No people visible. No text. Photorealistic, 24mm wide-angle lens, slight HDR, 8K, color graded with deep blue shadows and subtle teal mid-tones.
```

### Imagen 4 — Logística Digital (dashboard holográfico)
**Formato:** 16:9, 2560x1440
```
Sci-fi sober visualization: a translucent holographic dashboard floating in the air above a single navy blue (#1a2940) shipping container in a dimly lit warehouse. The dashboard displays a clean grid of cargo tracking data: container IDs, GPS coordinates, temperature graphs (cold chain monitoring), ETA timers — rendered as glowing teal (#2d8a8a) wireframe UI with monospace numeric labels. Around the container, faint teal volumetric light beams emanate upward. The warehouse background is heavily blurred bokeh navy. Mood: corporate sci-fi, restrained, Apple-keynote aesthetic, no neon excess. No people visible. No text in actual readable letters (use abstract glyphs or generic Lorem-style numbers). Photorealistic CG render, 50mm lens, shallow depth of field, 8K, cinematic.
```

### Imagen 5 — Sostenibilidad
**Formato:** 1:1, 1600x1600
```
Warm, documentary-style photograph of a small group of Colombian logistics workers in sage green (#a8c4a0) safety vests with a subtle "M" logo, in a community setting in the Urabá region. Background: lush tropical green (banana plantations or coastal vegetation). Golden hour warm sunlight. Three workers (gender and ethnicity diverse, Colombian Caribbean coast appearance) talking to a local resident, smiling, natural candid moment — not posed. Soft focus on background. Color palette: sage green, warm cream, navy accent on a hard hat. No text or logos visible directly. Photorealistic documentary photography, 85mm lens, shallow depth of field, 8K, mood of authentic community engagement (not corporate stock photo cliché).
```

---

## 5. Prompts de Video Loop (3)

> **Cómo usar:** Higgsfield → modelo Sedance o Kling → subir misma imagen como **frame inicial Y frame final** → pegar prompt → seleccionar 8s loop → 1080p. Generar 2-3 versiones por video y elegir la mejor.

### Video 1 — Hero loop (8-10s, 16:9)
**Frame inicial = frame final:** Imagen 1 (aerial port shot at golden hour)
**Prompt de transición:**
```
Subtle cinematic camera movement: a very slow drone push-in forward, advancing roughly 10 meters total over 8 seconds. Atmospheric haze drifts slowly from left to right across the container yard. The MAERSK container ship in the background remains stationary. A single STS crane in the distance moves its spreader downward almost imperceptibly. Sunset light flickers gently on container surfaces. Camera returns to the exact starting frame at the end. Cinematic, restrained, no people, no abrupt motion. make it perfectly loopable
```

### Video 2 — Transición servicios (4-6s, 16:9)
**Frame inicial = frame final:** abstract field of small teal (#2d8a8a) particles floating against deep navy (#1a2940) background, like data points or fireflies in a dark room
**Prompt de transición:**
```
Slow particle flow: the teal data particles drift in a coordinated swirl, forming an abstract path that suggests cargo movement from one side to the other. Light teal trails connect adjacent particles momentarily then fade. The overall density and distribution returns to identical starting configuration at end. Minimal motion blur. Abstract, technological, restrained. make it perfectly loopable
```

### Video 3 — Contador / Métricas (sutil background, 8s, 16:9)
**Frame inicial = frame final:** A single navy blue (#1a2940) shipping container shot in a clean studio environment with soft teal rim lighting, rotated to show its 3/4 perspective angle, against pure navy background with subtle radial vignette
**Prompt de transición:**
```
The shipping container rotates very slowly in place clockwise on its vertical axis, completing exactly 360 degrees over the full 8 seconds. Soft teal rim light remains stationary, creating shifting highlights along the container edges as it turns. Subtle dust particles drift sparsely in the air, lit by the rim light. Camera does not move. Container surface details (ridges, locking bars, paint texture) stay sharp throughout. Restrained, hypnotic, premium product reveal aesthetic. Background opacity will be reduced to 15% in final composite (use this video as ambient backdrop behind animated counters). make it perfectly loopable
```

---

## 6. Próximos pasos (orden)

1. **Higgsfield/ChatGPT (fase R):** generar las 5 imágenes con los prompts arriba (low → high quality)
2. **Higgsfield (fase A):** generar los 3 videos con frame inicial = frame final
3. **Claude Design (fase M):** abrir proyecto, modo High Fidelity, adjuntar 5 imágenes + 3 videos, pegar el prompt one-shot de la sección 3, enviar
4. **Iterar en Claude Design:** usar Draw, comentarios y tweaks/sliders. Batchear cambios.
5. **Claude Code (fase E):** handoff desde Claude Design (Ctrl+B), fetch local, crear repo movex-web en GitHub, deploy en Vercel, vincular dominio movex.com.co
