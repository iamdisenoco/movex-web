# MVP Logistics — análisis para rediseño Movex

**URL:** https://mvplogistics.eu/en/main-en/
**Estudiado:** 2026-05-25
**Decisión:** Movex Web se rediseña completo siguiendo este lenguaje, adaptado a paleta + tipografía Movex.

---

## Tipografía descubierta (vía CSS inspect)

```css
/* Display (todos los titulares, números, navegación) */
font-family: BebasNeuePro, sans-serif;

/* Body */
font-family: Inter, sans-serif;
```

**Equivalentes gratis para Movex:**
- **Bebas Neue Pro** → `Bebas Neue` en Google Fonts (idéntica visualmente, sólo 1 weight)
- `Inter` → ya la tenemos como Inter Tight Variable

## Paleta cromática observada

```
--mvp-white:      #ffffff
--mvp-navy:       #1f1f61   /* navy-purple muy oscuro, usado en cards primarias y texto */
--mvp-card-bg:    #f4f4f7   /* gris muy claro, casi blanco, fondo de cards secundarias */
```

**Adaptación a Movex:**
- Reemplazar `#1f1f61` por `#1a2940` (navy Movex) en cards primarias
- Mantener `#f4f4f7` para cards secundarias / fondo claro
- Acento `#2d8a8a` (teal Movex) donde MVP usa el navy más vivo

## Estructura de la página (de hero a footer)

### 1. Hero
- **Header**: card blanca centrada en el top con nav (About, Services, Blog, Contacts). Logo a la izquierda en card pequeña.
- **Letras flotantes**: "M.", "V.", "P." espaciadas en la parte superior del viewport. A la derecha "TRANS-LOGISTICS" como tagline.
- **Background**: imagen cinematográfica gris oscura (un camión moderno).
- **Headline gigante** en blanco Bebas: "WE DELIVER MORE THAN CARGO — WE DELIVER PEACE OF MIND."
- **Card flotante a la derecha**: "04/06 · OUR SERVICES" con servicios que rotan (Customs Clearance, Door-to-Door, etc) con un slider de progreso teal/dark.

### 2. About / Company
- **Card gigante navy** que se superpone al hero (parallax o overlap visual)
- **Etiqueta superior**: "ABOUT US" izq, "M.V.P. TRANS-LOGISTICS" der
- **Titular**: "M.V.P. COMPANY" en Bebas blanco
- **Body**: 4-5 líneas describiendo la empresa
- **CTA**: card blanca "LEARN MORE ABOUT US"
- **Letra decorativa gigante** "OVER 20 YEARS ON THE MARKET" en el background, semi-transparente, asomándose por los bordes

### 3. Our Advantages
- **Layout 2 columnas**: izquierda "OUR ADVANTAGES" gigante en Bebas navy. Derecha 8 cards apiladas verticalmente con sus advantages.
- **Cada card**: título corto en Bebas navy (3-4 palabras max) + body chico Inter al lado derecho
- Ejemplos: "20+ YEARS OF PROVEN SUCCESS", "A MODERN FLEET", "24/7 CUSTOMER SUPPORT", "ROUTE OPTIMIZATION", "AN IN-HOUSE TEAM", "CARGO INSURANCE", "FLEXIBLE COOPERATION TERMS", "WAREHOUSES IN STRATEGIC REGIONS"
- **Bordes redondeados pronunciados** (~24px)
- Fondo blanco, cards gris claro #f4f4f7

### 4. Services
- **Card grande con imagen** oscura cinematográfica (camión en warehouse iluminado)
- Cada servicio es una sub-card con texto + visual

### 5+ Después
- Más secciones que no llegué a capturar (blog, contactos, etc)

---

## Patrones clave para replicar en Movex

### A. Tipografía display ultra-condensed
- Movex pasa de Archivo Black → **Bebas Neue** (Google Fonts, gratis)
- Aplicable a TODOS los titulares, números, etiquetas, navegación

### B. Cards con bordes redondeados grandes (24px+)
- Padding generoso
- Bordes navy primario (`#1a2940`) o gris claro
- Sombras sutiles (no exageradas)

### C. Layout 2-columnas: título gigante izq + cards apiladas der
- Para sección "Our Advantages" / equivalente Movex
- Título sticky o con parallax si scroll respeta

### D. Letras decorativas gigantes en background
- "OVER 20 YEARS ON THE MARKET" semi-transparent overflow del card
- Para Movex: "MORE THAN A DECADE MOVING TRADE" o similar

### E. Numeración fraccionaria
- "04/06" en services slider
- Tipografía Bebas, navy semi-transparent

### F. Cards superpuestas (overlap entre secciones)
- About card se monta sobre la parte baja del hero
- Crea sensación de capas / collage editorial

### G. Headline split con em-dash
- "WE DELIVER MORE THAN CARGO — WE DELIVER PEACE OF MIND"
- Patrón: claim corto + em-dash + benefit emocional

### H. CTAs como cards blancas en fondo navy
- Botón "LEARN MORE ABOUT US" es una card grande blanca
- No el pill teal típico — más editorial

### I. Hero con letras espaciadas en topbar
- "M. V. P." como wordmark expansivo en hero header
- Para Movex: "M. O. V. E. X." con espaciado generoso?
- O "M . V . X ." si queremos mantener el branding M (isotipo)

### J. Servicios como slider/rotator
- Cards de servicios cambian (Customs → Door-to-Door → ...) con animación
- Indicador de progreso lineal abajo
- Numeración 0X/06

---

## Plan de rediseño para Movex

### Fase 1: Foundation (1 sesión)
1. Instalar Bebas Neue (Google Fonts) + actualizar `@theme` block
2. Actualizar `Layout.astro` para nuevo branding
3. Definir nuevas CSS variables: navy primario, gris card, blanco
4. Crear utility classes Tailwind para cards estilo MVP

### Fase 2: Hero post-intro (1 sesión)
1. Después de la intro 3D del globo → **transición a video de contenedor abriéndose** (cuando Jon lo provea, lo pondremos)
2. Reemplazar hero actual por estructura MVP:
   - Nav en card flotante blanca centrada
   - Letras "M. O. V. E. X." espaciadas en topbar
   - "AVANCE & MOVILIDAD" decorativo en hero
   - Headline gigante "MUCHO MÁS QUE CARGA — MOVEMOS CONFIANZA"
   - Card flotante "0X/06 · NUESTROS SERVICIOS" rotating

### Fase 3: Secciones núcleo (2-3 sesiones)
1. **Sección About**: card navy gigante que se monta sobre el hero
2. **Sección Ventajas Movex**: layout 2 columnas con 8 advantages cards
3. **Servicios**: cards rotating con imágenes oscuras cinematográficas
4. **Footer**: estilo MVP pero con tagline Movex

### Fase 4: Animaciones (1 sesión)
1. Parallax entre cards
2. Letras decorativas gigantes con scroll-trigger
3. Numeración fraccionaria animada
4. Slider de servicios automático

### Fase 5: Deploy
1. Vercel + dominio movex.com.co

---

## Screenshots referencia
(disponibles via session screenshot history — IDs ss_77133e4tg, ss_1632mf6om, ss_0377imbnn, ss_0146di74i, ss_7377yqxic, ss_71428qpuz, ss_8002mtkvz, ss_0146di74i)
