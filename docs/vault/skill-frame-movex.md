---
name: frame-movex
description: Guía a Claude para construir la landing page de Movex (marca premium internacional de operaciones logísticas portuarias en Apartadó/Santa Marta, Colombia) usando el framework FRAME (Fundación, Render, Animation, Mount, Entrega). Cargá este archivo en Claude Chat al inicio de la fase F.
version: 1.0
date: 2026-05-24
---

# Skill: FRAME para Movex

## Propósito

Este documento te indica (a Claude) cómo conducir la conversación de **fase Fundación** para generar la landing page de Movex en una sola sesión productiva. La salida de esta conversación debe ser suficiente para pasar a Render → Animation → Mount → Entrega sin tener que volver a iterar acá.

## Contexto de marca (NO inventes nada fuera de esto)

### Identidad
- **Nombre:** Movex
- **Tagline oficial:** "AVANCE & MOVILIDAD"
- **Dueños:** Grupo de Cargoban Operador Logístico y Portuario S.A.S. (Apartadó, fundada 2012)
- **Posicionamiento:** marca premium internacional. Movex NO compite con Cargoban — la complementa apuntando a importadores/exportadores grandes, navieras, manufactura/agroindustria de exportación.
- **Sede:** Apartadó (Urabá Antioqueño) + Santa Marta
- **Operaciones reales:** las mismas que Cargoban (operaciones terrestres, portuarias, logística digital, logística global, alquiler de equipos), pero con énfasis en **logística digital + global** como diferenciador premium.

### Paleta cromática (del manual de marca)
- Navy oscuro `#1a2940` (primario, dominante)
- Azul medio `#5a6a8a`
- Lavanda/púrpura suave `#8a9bc4`
- Teal `#2d8a8a`
- Sage green claro `#a8c4a0`
- Sage medio `#7ba090`

Uso: navy como base, teal como acento de marca, sage/lavanda como secundarios para evitar dureza.

### Tono de comunicación
- Ejecutivo, internacional, confiable
- Cero jerga marketinera ("revolucionario", "disruptivo", "next-level")
- Datos concretos > adjetivos
- Spanish neutro, opción de English en futuro toggle
- Inspiración: maersk.com, flexport.com, dsv.com (NO sitios de transporte locales colombianos)

### Audiencia
- Importadores/exportadores ≥ 50 contenedores/mes
- Navieras y forwarders (MAERSK, MSC, Hapag-Lloyd, CMA CGM)
- Agroindustria exportadora (banano, café, palma — relevante a Urabá)
- Manufactura con cadena de frío

## Estructura del sitio (del Excel del cliente)

6 secciones obligatorias. Respetá los nombres tal cual:

1. **Hero** (no está en el Excel pero es obligatorio)
2. **EMPRESA** → Introducción, Datos de interés (contadores animados), Valor agregado, Certificados, Noticias
3. **QUIENES SOMOS** → Reseña Historia (timeline interactivo), Misión, Visión, Valores Corporativos, Experiencia
4. **SERVICIOS** (interactivo, 5 categorías):
   - Operaciones terrestres (10 items)
   - Operaciones Portuarias (5 items)
   - Logística Digital (5 items) — **destacar como diferenciador premium**
   - Logística Global (4 items)
   - Alquiler de equipos (3 items)
5. **SOSTENIBILIDAD** → Fundación, FONDECAR, Bienestar laboral, Empleos, Ambiente
6. **CONTÁCTANOS** → formulario + ubicaciones + WhatsApp

Los detalles exactos de cada item están en `contexto.md` del proyecto. Si te falta algún detalle, pedímelo antes de inventar.

## Framework FRAME (qué tenés que hacer en cada fase)

### F — Fundación (esta conversación)

Tu trabajo en esta fase:

1. **Confirmar el brand identity** (paleta, tipografía sugerida, tono visual) — proponé 2-3 opciones de tipografía sans-serif premium (ej. Inter, Geist, Söhne, Aeonik, Neue Haas Grotesk)
2. **Diseñar el wireframe** sección por sección, indicando qué va arriba/abajo, qué CTAs, qué microcopy
3. **Generar el prompt one-shot para Claude Design** — texto largo, autocontenido, que cuando se pegue en Claude Design (modo High Fidelity) produzca el sitio completo en una sola corrida
4. **Generar prompts de imágenes** (5 imágenes — ver lista en `plan-frame.md`)
5. **Generar prompts de video con loop** (3 videos — terminar SIEMPRE con `make it perfectly loopable`)

### R — Render (no es esta fase)

El usuario llevará tus prompts de imagen a Higgsfield/ChatGPT Image 2. No generes imágenes, solo los prompts en texto.

### A — Animation (no es esta fase)

El usuario llevará tus prompts de video a Higgsfield (modelo Sedance o Kling). Recordá que para loop perfecto: mismo frame inicial = mismo frame final.

### M — Mount (no es esta fase)

El usuario pegará todo (imágenes + videos + tu prompt one-shot) en Claude Design.

### E — Entrega (no es esta fase)

Handoff a Claude Code para deploy en Vercel + dominio `movex.com.co`.

## Outputs esperados de esta sesión (al final)

Devolveme TODO esto en un único mensaje final estructurado:

```markdown
## 1. Brand Identity Refinado
- Tipografía primaria: ...
- Tipografía secundaria: ...
- Justificación: ...

## 2. Wireframe
[sección por sección, bullets de qué contiene]

## 3. Prompt One-Shot para Claude Design
[bloque de texto autocontenido, ~800-1500 palabras, que incluya: estructura, contenido, animaciones, paleta, tipografía, instrucciones explícitas de uso de los videos y las imágenes que se le adjuntarán]

## 4. Prompts de Imágenes (5)
### Imagen 1 — Hero
[prompt detallado para ChatGPT Image 2 / Higgsfield, formato 16:9, ~150 palabras]
### Imagen 2 — Operaciones Terrestres
[...]
### Imagen 3 — Operaciones Portuarias
[...]
### Imagen 4 — Logística Digital (dashboard holográfico)
[...]
### Imagen 5 — Sostenibilidad/Fundación
[...]

## 5. Prompts de Video Loop (3)
### Video 1 — Hero loop (8-10s)
Frame inicial = frame final: [descripción del frame]
Transición: [prompt detallado]
Termina con: "make it perfectly loopable"
### Video 2 — Transición servicios
[...]
### Video 3 — Contador / Métricas
[...]
```

## Restricciones (NO HACER)

- ❌ No inventes datos numéricos (contadores). Usá placeholders: `{{CAJAS_ANUALES}}`, `{{CONTENEDORES_AÑO}}`, `{{VEHICULOS}}`, `{{PAISES_SERVIDOS}}` — el cliente los completa después.
- ❌ No inventes certificados ni logos de clientes. Dejá zonas reservadas con placeholder.
- ❌ No uses emojis en el sitio (este es target B2B premium internacional, no D2C casual).
- ❌ No copies texto de cargoban.com.co — Movex es marca nueva, escribí copy original.
- ❌ No mezcles paletas de fuera del manual. Solo los 6 colores listados arriba.
- ❌ No propongas features sin animación cuando hay opción animada (es una landing motion-driven).
- ❌ No incluyas blog/CMS en el MVP (eso es fase 2).

## Sí hacer

- ✅ Microcopy específico al sector (contenedores, FCL/LCL, NVOCC, AGENCIAMIENTO, INCOTERMS, BL, B/L, agente naviero, cadena de frío).
- ✅ Mencionar Apartadó y Santa Marta como ubicaciones reales.
- ✅ Destacar **Logística Digital** como diferenciador (es lo que la mayoría de competidores locales no tiene).
- ✅ Sostenibilidad con peso real (Fundación + Fondecar + bienestar laboral son trabajo concreto de Cargoban).
- ✅ CTA primaria: "Solicitar cotización" o "Hablemos de tu carga".
- ✅ CTA secundaria: "Ver servicios" / "Conocer Movex".

## Cómo arrancar la conversación (yo, el usuario, voy a decir)

"Acá tenés el skill-frame-movex.md adjunto. También adjunto el manual de marca (movex.pdf), el mapa del sitio (Información Pagina web.xlsx) y un screenshot del template de motionsites.ai que me gustó (link: [URL]). Arrancá con la fase F."

Tu respuesta inmediata debe ser:

1. Confirmar lo que recibiste
2. Hacerme 3-5 preguntas críticas que falten (ej. ¿toggle ES/EN?, ¿priorizamos qué servicio destacar primero?, ¿tenés URL de competidores que te gusten?)
3. Después de mis respuestas, generar TODOS los outputs del bloque anterior en un solo mensaje
