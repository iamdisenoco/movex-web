# Plan FRAME — Sitio Web Movex

**Basado en:** framework FRAME del video L_0vx859tF0 (Benjamín Cordero, Imperio Digital)
**Decisiones de Jon (2026-05-24):**
- Posicionamiento: **internacional/premium** (mercado distinto a Cargoban)
- Imágenes/videos: **100% IA** (Higgsfield + ChatGPT Image 2)
- Métricas: **placeholders** que el cliente confirma después

**Decisiones de Jon (2026-05-25, post ref Viamaster):**
- Tipografía display: **Archivo Black** (Google Fonts) — reemplaza Inter para títulos/hero. Inspirado en Archivo Expanded que usa viamaster-intl.com
- Body sigue en Inter Tight
- Aplicar patterns visuales de Viamaster: hero marquee horizontal, cards de servicios en carousel, footer minimalista display, botón back-to-top
- Ver detalle completo en `ref/viamaster-intl.md`

---

## Posicionamiento estratégico

Movex no es "el sitio bonito de Cargoban" — es la marca premium internacional del mismo grupo. Targeting:

- Importadores/exportadores grandes (volumen ≥ 50 contenedores/mes)
- Navieras y forwarders internacionales (MAERSK, MSC, Hapag-Lloyd)
- Manufactura/agroindustria que exporta refrigerado
- Empresas que valoran trazabilidad digital y cumplimiento aduanero

**Tono:** ejecutivo, global, cinematográfico. Inglés opcional (toggle ES/EN si presupuesto lo permite).
**Inspiración visual:** Maersk.com, Flexport, DSV. NO sitios de transporte local colombianos.

---

## F — Fundación

### Inputs para Claude Chat (sesión separada, no Claude Design)

1. **skill.md** propio (lo construyo aparte en `skill-frame-movex.md`)
2. **Template de motionsites.ai** — buscar uno con:
   - Hero con video de fondo (loop)
   - Sección con contadores animados
   - Grid de servicios con scroll-driven animation
   - Timeline interactivo (para "Reseña Historia")
3. **Brief de marca** (extracto de contexto.md)
4. **Screenshots de referencia premium** (Maersk, Flexport)

### Prompt inicial (borrador para Claude Chat)

> "Vamos a crear una landing page para Movex, marca premium internacional de operaciones logísticas portuarias y extraportuarias en Colombia (Apartadó/Santa Marta). Target: importadores/exportadores grandes y navieras. Paleta: navy oscuro #1a2940, teal #2d8a8a, sage green #a8c4a0, lavanda #8a9bc4. Tagline: 'AVANCE & MOVILIDAD'. Estilo: cinematográfico, minimalista, con videos de contenedores en loop y scroll-driven animations. Necesito: brand identity, wireframe, prompt one-shot para Claude Design, prompts de 5 imágenes hero y 3 videos lupeables."

### Outputs esperados de la fase F

- [ ] Brand identity refinada
- [ ] Wireframe de las 6 secciones (Empresa, Quienes Somos, Servicios, Sostenibilidad, Contacto + Hero)
- [ ] **Prompt one-shot** para Claude Design (lo más importante)
- [ ] 5 prompts de imágenes (hero, servicios, sostenibilidad, equipo, dashboard digital)
- [ ] 3 prompts de transición de video (hero loop, servicios scroll, contenedor giratorio)

---

## R — Render (imágenes)

### Lista de imágenes a generar en Higgsfield/ChatGPT Image 2

1. **Hero principal** — puerto al atardecer, contenedores Movex apilados, grúa STS al fondo, neblina dramática. Plano cinematográfico.
2. **Operaciones terrestres** — camión + contenedor siendo cargado, plano cenital, paleta navy/teal.
3. **Operaciones portuarias** — buque portacontenedores siendo desestibado, grúa en movimiento, perspectiva baja heroica.
4. **Logística digital** — dashboard holográfico flotando sobre contenedor, datos en tiempo real, estilo sci-fi sobrio.
5. **Sostenibilidad/Fundación** — equipo humano con uniforme Movex sage green, contexto comunidad Apartadó, luz cálida.

Formato: 16:9 (hero) y 1:1 (cuadradas para secciones). Generar en high-quality después de validar low-quality.

---

## A — Animation (videos lupeables)

### 3 videos clave

1. **Hero loop (8-10s)** — drone aéreo de puerto con contenedores Movex, movimiento sutil de cámara, frame inicial = frame final
2. **Transición servicios** — partículas de datos fluyendo entre contenedores, abstracto
3. **Contador / Métricas** — contenedor girando 360° en plano cerrado, fondo navy difuminado

**Setting Higgsfield:**
- Modelo: Sedance o Kling (probar ambos)
- Frame inicial = frame final (mismo asset)
- Prompt termina con: `make it perfectly loopable`
- Resolución: 1080p (subir a 4K solo si vale la pena)

---

## M — Mount (Claude Design)

### Workflow

1. Proyecto nuevo en Claude Design → **High Fidelity**
2. Adjuntar: 5 imágenes + 3 videos + prompt one-shot del paso F
3. Generar (one-shot, sin preguntas)
4. Iterar SOLO con:
   - Draw tool (marcar zonas)
   - Comentarios
   - Tweaks/sliders (colores, espaciados)
   - Batchear cambios en un solo mensaje (ahorra tokens)

### Secciones de la landing (orden tentativo)

1. **Hero** — video loop + "AVANCE & MOVILIDAD" + CTA "Conoce Movex"
2. **Quiénes Somos** — texto corto + animación de timeline (Reseña Historia)
3. **Datos de interés** — 4 contadores animados (cajas, contenedores, vehículos, países servidos) con placeholders editables
4. **Servicios** — tabs interactivos por categoría (Terrestres, Portuarias, Digital, Global, Alquiler) con scroll-driven cards
5. **Logística Digital (destacado)** — feature dedicado con visual dashboard (el diferenciador premium)
6. **Sostenibilidad** — Fundación + Fondecar + Bienestar + Ambiente
7. **Certificados / Confianza** — logos navieras/clientes (placeholders)
8. **Contacto** — formulario + WhatsApp + ubicaciones (Apartadó, Santa Marta)
9. **Footer** — links + redes (cargobanoperador, cargobanfundacion)

---

## E — Entrega

1. Handoff a Claude Code desde Claude Design (Ctrl+B → copia prompt → pega en Claude Code)
2. `--dangerously-skip-permissions` para fetch automático
3. Crear repo `movex-web` en GitHub (organización GRUPO I A M)
4. Deploy en Vercel
5. Vincular dominio: `movex.com.co` (registrar si no está) o subdominio temporal `movex.vercel.app`
6. Configurar DNS/CNAME automático desde Claude Code

---

## Próximas acciones inmediatas

1. **Construir el skill.md** (`skill-frame-movex.md`) — yo lo armo, ~10 min
2. **Sacar screenshot de Cargoban actual** — necesitamos referencia visual (Jon abre cargoban.com.co manualmente y manda screenshot, o uso Quickshot equivalente)
3. **Seleccionar template de motionsites.ai** — Jon entra a motionsites.ai, elige 1-2 templates que le gusten, manda links/screenshots
4. **Arrancar fase F en Claude Chat** — primera conversación generando brand + prompts

---

## Riesgos / pendientes

- Cliente debe entregar: datos numéricos reales, certificados/logos navieras, dominio (¿ya lo registró?)
- Si no hay presupuesto Higgsfield/ChatGPT Plus: alternativas Replicate / Fal / Leonardo
- Si Claude Design se queda corto: fallback a Cursor + shadcn/Framer Motion manual
