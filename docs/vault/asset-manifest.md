# Asset Manifest — Movex Landing

**Generado:** 2026-05-25
**Variantes elegidas por Jon:** "el que tú quieras"
**Selección de Claude:** basada en tamaño = más data = más detalle pre-upscale

---

## Imágenes finales (5)

Carpeta: `G:\Mi unidad\GRUPO I A M\PROYECTOS\CLAUDE\80 - Proyectos\Sitio Web Movex\assets\`

| # | Archivo | Uso | Aspect | Tamaño |
|---|---------|-----|--------|--------|
| 1 | `01-hero.jpg` | Fallback estático del hero (si el video falla) | 16:9 | 441 KB |
| 2 | `02-terrestre.jpg` | Sección Servicios > Operaciones terrestres | 1:1 | 539 KB |
| 3 | `03-portuario.jpg` | Sección Servicios > Operaciones portuarias | 16:9 | 410 KB |
| 4 | `04-digital-dashboard.jpg` | Sección Logística Digital (background) | 16:9 | 297 KB |
| 5 | `05-sostenibilidad.jpg` | Sección Sostenibilidad (base + replicar variantes para 4 cards) | 1:1 | 390 KB |

**Modelo usado:** `black-forest-labs/flux-1.1-pro` @ 95 quality, JPG
**Total imágenes:** ~2 MB

---

## Videos finales elegidos (3 + upscale pendiente)

| # | Archivo elegido | Uso | Duración | Tamaño 720p | 1080p upscaled |
|---|-----------------|-----|----------|-------------|----------------|
| 1 | `video-1-hero-v2.mp4` | Hero loop background | 5s | 4.11 MB | (pendiente upscale) |
| 2 | `video-2-transicion-v1.mp4` | Background sección entre Servicios y Digital | 5s | 2.37 MB | (pendiente upscale) |
| 3 | `video-3-contador-v2.mp4` | Background sutil detrás de contadores en sección Empresa | 5s | 2.04 MB | (pendiente upscale) |

**Modelo usado:** `kwaivgi/kling-v2.0` @ 720p, 5s, cfg 0.5
**Upscale pendiente:** `topazlabs/video-upscale` → 1080p (esperando créditos)

### Variantes alternativas (no usadas, conservadas por si acaso)
- `video-1-hero-v1.mp4` (3.85 MB)
- `video-1-hero-v3.mp4` (3.4 MB)
- `video-2-transicion-v2.mp4` (2.05 MB)
- `video-3-contador-v1.mp4` (1.39 MB)
- `video-3-contador-v3.mp4` (1.36 MB)

---

## Mapeo a secciones del sitio (output-fase-f.md)

| Sección del sitio | Asset principal | Asset secundario |
|-------------------|-----------------|------------------|
| 1. Hero | `video-1-hero-v2.mp4` (loop) | `01-hero.jpg` (fallback) |
| 3. EMPRESA (Datos) | `video-3-contador-v2.mp4` (background opacity 15%) | — |
| 5. SERVICIOS — Terrestres | `02-terrestre.jpg` | — |
| 5. SERVICIOS — Portuarias | `03-portuario.jpg` | — |
| Transición a Logística Digital | `video-2-transicion-v1.mp4` | — |
| 6. LOGÍSTICA DIGITAL | `04-digital-dashboard.jpg` (background opacity 40% + blend multiply) | — |
| 7. SOSTENIBILIDAD | `05-sostenibilidad.jpg` (replicar variantes para 4 cards) | — |

---

## Costos de generación

| Item | Modelo | Cantidad | Costo unitario | Total |
|------|--------|----------|----------------|-------|
| Imágenes | FLUX 1.1 Pro | 5 | ~$0.04 | ~$0.20 |
| Videos | Kling v2.0 (5s) | 8 (3 elegidos + 5 variantes) | ~$1.00 | ~$8.00 |
| Upscale (pendiente) | Topaz Video Upscale 1080p | 3 | ~$0.80 | ~$2.40 |
| **Total estimado** | | | | **~$10.60** |

---

## Próximo paso

Una vez Jon recargue créditos y completemos upscales:
1. Reemplazar/renombrar videos elegidos como `video-1-hero-final.mp4`, etc.
2. Pasar a Fase M (Claude Design) con:
   - 5 imágenes
   - 3 videos finales 1080p
   - Prompt one-shot de `output-fase-f.md` sección 3
