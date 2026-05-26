# CLAUDE.md — instrucciones de proyecto Movex Web

**IMPORTANTE:** este archivo lo leo (Claude) cada vez que abro este proyecto.
Define las convenciones para que Jon no tenga que repetirlas.

## Stack

- **Framework:** Astro 6 + React 19 islands
- **Styling:** Tailwind CSS 4 (via Vite plugin)
- **3D:** three.js + three-globe + react-three-fiber + @react-three/drei
- **Animation:** Framer Motion
- **Fonts:** Archivo Variable (display, used at `font-stretch:125%` for expanded look — Viamaster style) + Inter Tight Variable (body) + JetBrains Mono (numerics). Apply via `font-display` utility class.
- **Deploy target:** Vercel (auto-deploy desde main branch en GitHub)

## Estructura de carpetas

```
movex-web/
├── CLAUDE.md            ← este archivo (instrucciones para mí)
├── material/            ← assets CRUDOS del cliente (NO se sirven en el sitio)
│   ├── videos/          ← videos del cliente, sin optimizar
│   ├── images/          ← fotos del cliente, sin optimizar
│   ├── docs/            ← briefs PDF, manuales de marca, Excel
│   └── refs/            ← URLs, screenshots, sitios de inspiración
├── public/              ← assets SERVIDOS por Astro (optimizados, comprimidos)
│   ├── brand/           ← logo SVG en variantes
│   ├── assets/images/   ← imágenes finales (JPG/WebP optimizados)
│   ├── assets/videos/   ← videos finales (MP4/WebM optimizados, < 10MB cada uno)
│   └── fonts/           ← Archivo Black + variable fonts
└── src/
    ├── data/site.ts     ← single source of truth: copy, paleta, destinos
    ├── components/
    │   ├── intro/       ← Intro3D React island
    │   ├── nav/
    │   ├── hero/
    │   └── sections/    ← cada sección del sitio
    ├── layouts/
    ├── pages/
    └── styles/
```

## Reglas automáticas (las aplico SIN preguntar)

### Cuando Jon descarga nuevo material
1. **Videos** → `material/videos/<nombre-limpio>.mov` (sin timestamps, sin uuids)
2. **Imágenes** → `material/images/<nombre-limpio>.jpg`
3. **PDFs/docs** → `material/docs/`
4. **URLs/refs** → registrar en `material/refs/index.md` con captura

### Antes de servir un asset
1. Para video: convertir a MP4 H.264 + WebM VP9, comprimir a < 10 MB con ffmpeg
2. Para imagen: convertir a WebP, target < 200 KB
3. Copiar a `public/assets/...`
4. Referenciar desde el código por su path en public/

### Versionado
- Cada cambio significativo: `git commit` con mensaje descriptivo
- Branches: `feature/<descripcion>` para experimentos, merge a `main` cuando esté estable

### Cuando Jon menciona un nuevo sitio de referencia
- Agregar entrada en `material/refs/index.md` con URL, fecha, qué nos interesa
- Screenshots a `material/refs/screenshots/<dominio>/`

## Brand Movex

- **Paleta:** ver `src/styles/global.css` → @theme block
- **Tipografía:**
  - **Display:** Archivo Variable a `font-stretch: 125%` (expanded). Pesos 500-600. Viamaster-inspired — letras anchas, espaciadas, no condensed.
  - **Body:** Inter Tight Variable, peso 400-500, line-height generoso (1.6+).
  - Usar `font-display` o `font-display-xl` utility classes (definidas en global.css @layer base).
- **Logo:** isotipo M (SVG) + wordmark "movex" (texto Archivo Variable a 125% stretch, no SVG)

## Design system (post-rediseño 2026-05-25)

Combinamos dos referencias:
- **MVP Logistics** (mvplogistics.eu) → cómo funciona la página: cards redondeadas grandes, scroll parallax, letras decorativas gigantes en background, numeración fraccionaria, cards superpuestas entre secciones
- **Viamaster International** (viamaster-intl.com) → tipografía y jerarquía de copy: Archivo Expanded, títulos split en 2 colores (teal + white), body en bloques de 2-3 párrafos con respiración, CTAs como pills (primary teal + secondary outline)
- **Sede:** Apartadó (Urabá, Colombia) y Santa Marta
- **Posicionamiento:** operador logístico portuario premium internacional, subsidiaria del grupo Cargoban

## Vault del proyecto (fuera del repo)

`G:\Mi unidad\GRUPO I A M\PROYECTOS\CLAUDE\80 - Proyectos\Sitio Web Movex\`

Contiene archivos originales del cliente, contexto.md, plan-frame.md, output-fase-f.md, skill-frame-movex.md. NO se sincroniza con git (Google Drive). Para referencia histórica.

## Dev workflow

```bash
cd movex-web
npm run dev   # localhost:4321
npm run build # output a dist/
```

Si dev se cae: `taskkill /F /IM node.exe` y reiniciar.
