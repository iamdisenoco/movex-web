# 📁 docs/ — Documentación del proyecto Movex Web

Esta carpeta es el **"vault" compartido** del proyecto, versionado en git. Cualquier cosa que necesites guardar sobre el proyecto va aquí.

## Estructura

```
docs/
├── README.md              ← este archivo (te explica el sistema)
├── PENDIENTES.md          ← single source of truth de qué falta hacer
├── DECISIONES.md          ← changelog de decisiones técnicas (append-only)
└── vault/                 ← contexto histórico del proyecto (copia del vault Obsidian de Jon)
    ├── contexto.md        ← brief inicial del cliente Cargoban/Movex
    ├── plan-frame.md      ← metodología FRAME usada para construir el sitio
    ├── output-fase-f.md   ← outputs de research fase Foundation
    ├── skill-frame-movex.md  ← skill custom usada para generar la landing
    └── asset-manifest.md  ← lista de assets generados con IA (Replicate, etc.)
```

## 🔄 Flujo de trabajo entre colaboradores

### Antes de empezar una sesión
```bash
git pull                                    # trae cambios del otro
cat docs/PENDIENTES.md                      # ve qué hay para hacer
```

### Al tomar una tarea
1. Abre `docs/PENDIENTES.md`
2. Cambia `[ ]` por `[in progress] — <tu nombre>`
3. Commit + push **inmediato** para que el otro vea que la tomaste
   ```bash
   git add docs/PENDIENTES.md
   git commit -m "chore(pendientes): tomo X"
   git push
   ```

### Al terminar una tarea
1. Mueve el item a la sección "✅ Hecho" en `docs/PENDIENTES.md`
2. Si fue una decisión técnica (no solo cosmética), agrega entrada en `docs/DECISIONES.md`
3. Commit con mensaje descriptivo + push

### Si encuentras un bug nuevo o feature por hacer
1. Agrégalo en `docs/PENDIENTES.md` en la sección que corresponda
2. Commit + push

### Si tienes acceso al vault Obsidian de Jon (Google Drive)
- Path: `G:\Mi unidad\GRUPO I A M\PROYECTOS\CLAUDE\80 - Proyectos\Sitio Web Movex\`
- Ahí están los archivos originales (PDFs, HTMLs viejos, MP4s) que NO copiamos al repo por tamaño
- Si necesitas algo de ahí: pídeselo a Jon o accede directo si te dio permisos
- **Cualquier `.md` nuevo o actualizado debe vivir en `docs/vault/` del repo** (no solo en Obsidian) para que el otro Claude lo lea

## 📌 Reglas importantes

1. **`docs/PENDIENTES.md` y `docs/DECISIONES.md` son sagrados** — no los borres, no los reorganices destructivamente. Append, no rewrite.
2. **Si el otro Claude/colaborador tomó una tarea (`[in progress]`)**, NO la duplicas. Busca otra.
3. **Antes de tomar decisiones grandes** (cambiar stack, refactor masivo): documenta el RAZONAMIENTO en `DECISIONES.md` ANTES de codear. Si Jon dice no, ya hay registro de por qué se considera.
4. **El vault en `docs/vault/` es histórico** — no edites esos archivos, son snapshot del momento de creación del sitio. Si quieres documentar algo NUEVO, hazlo en `PENDIENTES.md` o `DECISIONES.md`.
5. **No metas archivos pesados aquí** (>1MB). Esto es solo `.md`. Imágenes/videos van en `public/` si se sirven, o en `material/` si son crudos (local-only, no en git).

## 🤖 Para el Claude que va a editar

Cuando arranques una sesión:
1. Lee `docs/PENDIENTES.md` → entiende qué hay para hacer hoy
2. Si una tarea es ambigua, revisa `docs/vault/contexto.md` para el background
3. Si vas a tomar decisión técnica nueva, primero revisa `docs/DECISIONES.md` para ver si ya hay precedente
4. Al terminar tu trabajo: **actualiza PENDIENTES.md y DECISIONES.md** + commit + push
