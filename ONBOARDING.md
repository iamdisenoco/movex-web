# Movex Web — Setup desde PC nuevo (onboarding completo)

> **Para qué sirve este documento**: Estás abriendo este proyecto por primera vez en un PC nuevo, sin nada instalado, y quieres editar el sitio web Movex con Claude Code igual que lo hace Jon. Sigue los pasos en orden y en ~20 minutos estás operando.

---

## 🎯 Resumen del proyecto en 3 líneas

**Movex Logistics** es un sitio web premium para una empresa colombiana de logística portuaria internacional con sede en Apartadó y Santa Marta. Hecho en **Astro 6 + React 19 + Tailwind 4 + three.js**, desplegado en **Vercel** con auto-deploy desde GitHub. La parte interesante: animaciones tipo "Awwwards" — intro 3D con globo terráqueo, scroll-stacking de secciones, card-stack pinned scroll-driven, SplitText reveal, Lenis smooth scroll.

| Recurso | URL |
|---|---|
| **Sitio en producción** | https://movex-web.vercel.app |
| **Repo GitHub** | https://github.com/iamdisenoco/movex-web |
| **Dashboard Vercel** | https://vercel.com/iamdisenocos-projects/movex-web |

---

## 0. Antes de empezar — lo que vas a necesitar

1. **Una cuenta de GitHub** (te toca crearla en github.com si no tienes)
2. **Jon te invita como collaborator** al repo (que él entre a https://github.com/iamdisenoco/movex-web/settings/access → Add people → tu username de GitHub). Aceptas la invitación que te llega al email.
3. **Una cuenta de Claude.ai** (mejor pro o team para tener Claude Code).

---

## 1. Instalar Git (3 min)

**Windows**: Descarga desde https://git-scm.com/download/win → instalador `.exe` → "Next" hasta el final con defaults.

**Verificar** abriendo PowerShell o cmd:
```bash
git --version
```
Debe decir algo como `git version 2.4x.x`.

**Configurar TU identidad** (estos commits saldrán con tu nombre):
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

---

## 2. Instalar Node.js (3 min)

Necesitamos **Node 22 LTS o superior** (Astro 6 lo requiere).

Descarga desde https://nodejs.org/ → versión **LTS** (la verde a la izquierda) → instalador `.msi` → Next con defaults.

**Verificar**:
```bash
node --version    # debe ser v22.x.x o superior
npm --version     # debe ser 10.x.x o superior
```

---

## 3. Instalar Claude Code (5 min)

```bash
npm install -g @anthropic-ai/claude-code
```

Después:
```bash
claude login
```
Te abre el browser, login con tu cuenta Claude (la misma de claude.ai).

**Verificar**:
```bash
claude --version
```

---

## 4. Clonar el repo y instalar dependencias (3 min)

Asumiendo que ya Jon te invitó como collaborator y aceptaste:

```bash
cd C:\Users\<tu-usuario>\Downloads
git clone https://github.com/iamdisenoco/movex-web.git
cd movex-web
npm install
```

La primera vez `npm install` puede tardar 1-2 min (descarga ~400MB de dependencias incluyendo three.js).

---

## 5. Arrancar el dev server y verificar que funciona (1 min)

```bash
npm run dev
```

Abre http://localhost:4321 en el navegador. Deberías ver el sitio Movex con la intro animation del globo terráqueo. Si llega a cargar el hero (video del barco de carga + texto "Avance. Movilidad global."), todo está OK.

**Tips**:
- Si dev se cae con error de puerto en uso: `taskkill /F /IM node.exe` (Windows) y vuelve a correr `npm run dev`.
- La intro animation se ve solo la primera vez por sesión del navegador (usa `sessionStorage.mvx_intro_v6`). Si quieres volver a verla: en DevTools → Application → Session Storage → borra esa key y refresca.

---

## 6. Abrir Claude Code en el proyecto

```bash
# Ya estando dentro de C:\Users\<tu-usuario>\Downloads\movex-web
claude
```

Claude Code abrirá en la carpeta del proyecto. Va a leer automáticamente:
- `CLAUDE.md` (instrucciones del proyecto — Stack, convenciones, brand)
- `ONBOARDING.md` (este archivo)

---

## 7. Flujo de trabajo del día a día

### **ANTES de editar nada** — trae cambios del otro colaborador:
```bash
git pull
```

### **Mientras editas con Claude** — Claude se encarga de los cambios.

### **Cuando termines un bloque de cambios** — guárdalos:
```bash
git add -A
git commit -m "feat(seccion): qué cambió"
git push
```

Vercel auto-deploya en ~30 segundos. Visita https://movex-web.vercel.app para verificar.

### **Si tienes conflict con cambios de Jon**:
```bash
git pull --rebase
# Resuelve los conflicts a mano o pidiendole a Claude
git add <archivos-resueltos>
git rebase --continue
git push
```

### **Reglas para evitar conflicts**:
- Avisa por WhatsApp antes de cambios grandes ("voy a refactorizar Servicios")
- Si va a ser intensivo, trabaja en branch separado:
  ```bash
  git checkout -b feature/lo-que-haces
  # ...trabaja...
  git push -u origin feature/lo-que-haces
  # Y haces PR en GitHub
  ```

---

## 8. Estructura del proyecto (lo que importa)

```
movex-web/
├── CLAUDE.md           ← Convenciones (Claude lo lee solo)
├── ONBOARDING.md       ← Este archivo
├── README.md           ← (opcional, breve)
├── package.json
├── astro.config.mjs
├── vercel.json         ← Config deploy
├── .vercelignore       ← Qué NO sube a Vercel (material/)
├── .gitignore          ← Qué NO sube a git
├── material/           ← ⚠️ NO ESTÁ EN EL REPO. Assets crudos cliente, son LOCALES.
│   ├── videos/         ← .mov pesados (>250MB cada uno)
│   └── refs/           ← screenshots de referencias
├── public/             ← Assets servidos por Astro (optimizados)
│   ├── brand/          ← Logo SVG en variantes
│   └── assets/
│       ├── images/     ← .jpg/.webp optimizados
│       └── videos/     ← .mp4 < 20MB (los que se sirven)
└── src/
    ├── data/site.ts            ← Single source of truth (copy, paleta, servicios, destinos)
    ├── components/
    │   ├── intro/Intro3D.tsx   ← Globo 3D + match-move al nav (React island)
    │   ├── nav/Nav.astro       ← Nav glass-pill estilo muffment
    │   ├── hero/Hero.astro     ← Hero sticky con video
    │   └── sections/
    │       ├── Empresa.astro
    │       ├── Servicios.astro       ← Card-stack scroll-driven (5 cards pinned)
    │       ├── QuienesSomos.astro
    │       ├── LogisticaDigital.astro
    │       ├── Sostenibilidad.astro
    │       ├── Confianza.astro
    │       ├── Contacto.astro
    │       └── Footer.astro
    ├── layouts/Layout.astro
    ├── pages/index.astro       ← Orden de las sections
    ├── scripts/animation.ts    ← Lenis + SplitText + Parallax + Card-Stack
    └── styles/global.css       ← @theme con paleta + fonts + reveal animations
```

### ⚠️ Carpetas que NO están en el repo pero existen local en el PC de Jon

- `material/videos/` → contiene los .mov crudos de cliente (>250MB), demasiado pesados para git. Si necesitas alguno, pídeselos a Jon (Google Drive / WeTransfer).
- `material/images/` → fotos crudas
- `material/docs/` → PDFs del cliente, briefs

Estas carpetas están en `.gitignore` y `.vercelignore` — no las commitees.

---

## 9. Stack y convenciones (resumen — el detalle está en CLAUDE.md)

### Stack
- **Framework**: Astro 6 (modo static SSG) + React 19 islands
- **Styling**: Tailwind CSS 4 (via `@tailwindcss/vite`)
- **3D**: three.js + three-globe + react-three-fiber + drei
- **Smooth scroll**: Lenis 1.1
- **Fonts**: Saira Variable (display, wide style) + Hanken Grotesk Variable (body light) — variable fonts via `@fontsource-variable/*`

### Paleta brand (definida en `src/styles/global.css` `@theme`)
- `--color-navy-900`: `#1a2940` (primary dark)
- `--color-navy-700`: `#2a3a55`
- `--color-teal-500`: `#2d8a8a` (accent CTA)
- `--color-teal-300`: `#5fb3b3` (accent hover/title highlight)
- `--color-sage-light`: `#a8c4a0` (sostenibilidad section)
- `--color-lavender`: `#8a9bc4`

### Tipografía
- Aplicar via clases utility: `font-display` (titles), `font-display-xl` (hero/grandes), `font-display-italic`
- Body por default usa Hanken Grotesk a weight 300 (light)

### Convención de commits (estilo conventional)
```
feat(seccion): qué se agregó
fix(seccion): qué se arregló
chore: tareas de mantenimiento (deploy, deps, etc.)
refactor: cambio interno sin afectar funcionalidad
style: ajustes solo visuales
```
Y al final del mensaje siempre:
```
Co-Authored-By: claude-flow <ruv@ruv.net>
```

### Reglas duras (NO romper)
1. **Branch principal es `main`** (no `master`).
2. **NUNCA commitees archivos en `material/`** — son crudos del cliente.
3. **NUNCA commitees `.env`, `.env.production`, `.vercel/`** — están en gitignore.
4. **NUNCA hagas `git push --force` a `main`** sin avisar a Jon. Puede borrar trabajo del otro.
5. **Antes de empezar a editar: `git pull`**. Siempre.
6. **Después de cambios significativos: `git push`**. Vercel auto-deploya.

---

## 10. Animaciones complejas implementadas (para que no las rompas accidentalmente)

### Intro 3D (`src/components/intro/Intro3D.tsx`)
- Globo terráqueo centrado en Colombia, rotación lenta.
- Arcos a 22 destinos comerciales que aparecen progresivamente.
- Match-move a la esquina superior izquierda como el isotipo del nav.
- Skip con ESC, click, o auto-skip a 12s (safety net en `animation.ts`).
- Una vez vista, se salta en cargas futuras (sessionStorage `mvx_intro_v6`).
- Si la editas: cuidado con `finish()` — debe llamar a `window.dispatchEvent(new Event("mvx:intro-done"))` o el scroll queda bloqueado por Lenis stopped.

### Hero + Empresa scroll-stacking (`Hero.astro` + `Empresa.astro`)
- Hero envuelto en `<div height: 100vh>` pin space + `<section sticky top:0 h:100vh>` queda pegado mientras scrolleas.
- Empresa es el "card" que sube tapando al hero: `bg-navy-900 rounded-t-[40px] z-20`.
- El video del hero se queda atrás visualmente, el card sube cubriendo desde abajo.

### Servicios card-stack (`Servicios.astro` + `animation.ts`)
- Section con `height: (N+1) × 100vh` = pin space para scroll.
- Inner sticky top:0 h:100vh queda fijo durante todo el scroll.
- 5 cards apiladas con `position: absolute inset-0`.
- JS calcula `stage = progress × N - i` por cada card → translateY 100% → 0% → -100%.
- Imagen + counter + dots se sincronizan con activeIdx.

### SplitText reveal (`animation.ts`)
- Atributo `data-split` divide cualquier título en `.word > .char` con stagger.
- Variantes: default 22ms, `data-split="fast"` 12ms, `data-split="slow"` 35ms.
- IntersectionObserver dispara `data-revealed="true"` cuando entra al viewport.

### Parallax tied (`animation.ts`)
- Atributo `data-parallax="0.3"` → translate3d Y proporcional al scroll.
- Modo default ancla al top de la section padre.
- Modo `data-parallax-from="page"` ancla al top del documento (para el hero video).

### Lenis smooth scroll
- Lerp 0.1, easing exponencial.
- Anchor links usan `lenis.scrollTo()` con offset -64 (para no quedar bajo el nav).
- Se pausa durante intro, reanuda con evento `mvx:intro-done`.
- Safety nets si la intro falla: timeout 12s + wheel/touchstart auto-skip.

### Nav glass-pill (`Nav.astro`)
- Estilo muffment-web: 3 elementos horizontales (logo / pill central glass / CTA).
- Solo el pill central tiene `backdrop-blur-md` + `bg-white/10` al scrollear (vía IntersectionObserver sentinel).
- NO es franja edge-to-edge.

---

## 11. Sistema de docs compartido (`docs/`) — léelo SIEMPRE

**El vault del proyecto ahora vive EN EL REPO**, no en Google Drive. Cualquier cosa que necesites saber del proyecto está en `docs/`:

```
docs/
├── README.md          ← cómo funciona este sistema
├── PENDIENTES.md      ← QUÉ FALTA HACER. Léelo al inicio de cada sesión.
├── DECISIONES.md      ← Por qué tomamos cada decisión técnica
└── vault/             ← Contexto histórico (briefs, plan, refs)
    ├── contexto.md
    ├── plan-frame.md
    ├── output-fase-f.md
    ├── skill-frame-movex.md
    └── asset-manifest.md
```

### ⚠️ Reglas (no las rompas, son sagradas):

**Al arrancar sesión**:
1. `git pull` (trae los pendientes/decisiones que actualizó el otro)
2. Leer `docs/PENDIENTES.md` y ver qué hay
3. Si una tarea es ambigua: leer `docs/vault/contexto.md` para entender el proyecto

**Al tomar una tarea**:
- En `docs/PENDIENTES.md`, cambiar `[ ]` por `[in progress] — <tu nombre>` y push INMEDIATO. Esto evita que el otro tome la misma tarea.

**Al terminar una tarea**:
- Mover el item a "✅ Hecho" en `docs/PENDIENTES.md`
- Si fue decisión técnica importante: agregar entrada en `docs/DECISIONES.md` con fecha y razonamiento
- Commit + push

**Si encuentras un bug o feature nuevo**:
- Agregar entrada en `docs/PENDIENTES.md` en la sección apropiada (Crítico, Animación, Features)
- Commit + push

### Vault Obsidian local de Jon (solo fallback)

`G:\Mi unidad\GRUPO I A M\PROYECTOS\CLAUDE\80 - Proyectos\Sitio Web Movex\` solo está en el PC de Jon — contiene archivos pesados (PDFs del brand book, HTMLs v1-v6 de Claude Design, MP4s sin compresión). NO van al repo por tamaño. Si necesitas algo específico de ahí, pídeselo a Jon. **No es necesario** para editar el sitio.

---

## 12. Troubleshooting frecuente

| Síntoma | Solución |
|---|---|
| `npm run dev` se cae con "port in use" | `taskkill /F /IM node.exe` (Windows) o `pkill node` (mac/linux), volver a correr |
| Push rechazado por GitHub: "file too large" | Algún archivo >100MB en commits. Revisa `git log --stat`, sácalo del index con `git rm --cached <archivo>`, agrégalo a `.gitignore`, recommit |
| Build de Vercel falla | Mira logs en https://vercel.com/iamdisenocos-projects/movex-web — suele ser typo de TypeScript o import roto. Corrige local, `git push` |
| Conflict al pull | `git status` te dice qué archivos. Edita resolviendo `<<<<<<<` `=======` `>>>>>>>`, después `git add` y `git commit` |
| El intro no termina y no puedo scrollear | El safety net debería destrancarte tras 12s o al primer wheel/touch. Si no, abre DevTools console: `sessionStorage.setItem('mvx_intro_v6','1'); location.reload()` |
| Los videos no cargan en dev local | Los videos servidos viven en `public/assets/videos/`. Si solo clonaste el repo, deberían estar. Si no aparecen, pídeselos a Jon |

---

## 13. Cómo deployear un cambio (esto pasa automático)

```bash
# Ya editaste lo que querías
git add -A
git commit -m "feat(hero): cambia headline a 'Movemos lo que importa'"
git push
```

Vercel detecta el push y deploya. En ~30 segundos el cambio está en https://movex-web.vercel.app.

Si quieres ver el progreso del deploy: https://vercel.com/iamdisenocos-projects/movex-web/deployments

---

## 14. Para Claude (instrucciones para el agente que va a editar)

Cuando Jon abra una nueva sesión en este PC, **antes de hacer cualquier cambio** revisa:

1. **`CLAUDE.md`** — convenciones, stack, brand, reglas duras
2. **`src/data/site.ts`** — single source of truth para copy y data
3. **`src/styles/global.css`** — paleta y typography tokens
4. **Las sections en orden** (`src/pages/index.astro`):
   - Hero → Empresa → Servicios → QuienesSomos → LogisticaDigital → Sostenibilidad → Confianza → Contacto

**Si Jon te pide cambiar copy** → tocá `src/data/site.ts` (NO hardcodees en cada componente).
**Si Jon te pide cambiar colores** → tocá `src/styles/global.css` `@theme {}`.
**Si Jon te pide nuevas animaciones complejas** → estudia el patrón existente en `src/scripts/animation.ts` antes de añadir libs externas.
**Si Jon menciona "ese efecto de tal sitio"** → inspecciona en vivo con MCP browser (computed styles, getBoundingClientRect), no adivines.

**Sigue las reglas de CLAUDE.md** y siempre `git push` después de cambios verificados.

---

## ¿Listo? Resumen 1-2-3

1. ✅ Instalaste git, node, claude code, te invitaron al repo
2. ✅ `git clone` + `npm install` + `npm run dev` y ves el sitio
3. ✅ `claude` desde la carpeta y empiezas a editar — Claude lee `CLAUDE.md` y este `ONBOARDING.md` automáticamente

**Cualquier duda durante el setup**: mensaje a Jon por WhatsApp con screenshot del error.

¡Bienvenido al proyecto! 🚀
