# Movex Web

Sitio web premium para **Movex** — operador logístico portuario internacional, subsidiaria del grupo Cargoban (Apartadó / Santa Marta, Colombia).

## 🌐 Producción

**https://movex-web.vercel.app**

## 🛠 Stack

Astro 6 · React 19 · Tailwind CSS 4 · three.js + three-globe · Lenis smooth scroll · Framer Motion · Deploy en Vercel.

## 🚀 Para arrancar

```bash
git clone https://github.com/iamdisenoco/movex-web.git
cd movex-web
npm install
npm run dev
```

Abre http://localhost:4321.

## 📖 Documentación

| Archivo | Para qué |
|---|---|
| **[ONBOARDING.md](./ONBOARDING.md)** | **Setup paso a paso desde PC nuevo** (instalar git/node/claude code, clonar, flujo git, troubleshooting). Empieza aquí si es tu primera vez. |
| [CLAUDE.md](./CLAUDE.md) | Convenciones del proyecto que Claude Code lee automáticamente. Stack, estructura, brand, reglas duras. |

## 📦 Estructura corta

```
movex-web/
├── public/          → Assets servidos (logos, imágenes, videos optimizados)
├── material/        → Assets crudos del cliente (NO en git, son locales)
├── src/
│   ├── data/site.ts → Single source of truth (copy, servicios, destinos)
│   ├── components/  → Astro + React islands
│   ├── pages/       → Routes (index.astro)
│   ├── scripts/     → animation.ts (Lenis + SplitText + Parallax + Card-Stack)
│   └── styles/      → global.css con @theme (paleta + fonts)
└── vercel.json
```

## 🤖 Workflow

1. `git pull` antes de empezar
2. Edita con Claude Code (`claude` en la terminal dentro del repo)
3. `git add -A && git commit -m "feat(area): descripción" && git push`
4. Vercel auto-deploya en ~30s

Detalles completos en [ONBOARDING.md](./ONBOARDING.md).

---

## 🧞 Comandos disponibles

| Comando | Acción |
| :--- | :--- |
| `npm install` | Instalar dependencias |
| `npm run dev` | Dev server en `localhost:4321` |
| `npm run build` | Build de producción a `./dist/` |
| `npm run preview` | Preview local del build |
