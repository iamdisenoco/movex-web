# Sitio Web Movex — Contexto del proyecto

**Creado:** 2026-05-24
**Cliente:** Dueños de Cargoban (S.A.S., Apartadó/Urabá/Santa Marta) lanzando nueva marca **Movex**
**Estado:** Brief recibido, pendiente armar sitio
**Carpeta:** `80 - Proyectos/Sitio Web Movex/`

---

## 1. Brief de la marca (PDF `movex.pdf`)

- **Nombre:** Movex
- **Tagline:** "AVANCE & MOVILIDAD"
- **Logo:** "M" estilizado en forma de flecha/onda + wordmark `movex` (minúscula, sans-serif redondeada)
- **Paleta cromática** (8 variantes en el manual):
  - Navy oscuro (primario)
  - Lavanda/púrpura suave
  - Azul medio
  - Teal
  - Sage green claro
  - Sage medio
- **Aplicaciones visuales:** logo sobre contenedor marítimo (mockup MVXU 250624), fondo de patio de contenedores con MAERSK y otras navieras visibles
- **Tono visual:** corporativo, marítimo-portuario, premium, paleta fría con acentos vivos

## 2. Estructura del sitio (Excel `Información Pagina web.xlsx`)

El cliente entregó un mapa de 5 secciones. **Importante:** menciona "Introducción Cargoban" en la sección EMPRESA → confirma que el sitio Movex hereda y replica la propuesta de Cargoban (los dueños son los mismos).

### EMPRESA
- Introducción (texto presentación)
- Datos de interés (cajas anuales, contenedores/año, vehículos) — **automático/contador animado**
- Valor agregado
- Certificados
- Noticias (interactivo)

### QUIENES SOMOS
- Reseña Historia (interactiva — probablemente timeline)
- Misión
- Visión
- Valores Corporativos
- Experiencia

### SERVICIOS — Interactivo (5 categorías)

**Operaciones terrestres:**
- Descargue de camiones (carga paletizada o suelta)
- Consolidación de contenedores
- Desconsolidación de contenedores
- Apoyo a inspecciones de autoridades
- Inspecciones de calidad
- Etiquetado de productos
- Operación de equipos portuarios
- Mantenimiento de equipo portuario y flotante
- Alistamiento de contenedores
- Auxiliares de grúa para contenedores

**Operaciones Portuarias:**
- Trincado y destrincado de contenedores y mercancías
- Conexión y desconexión de contenedores a bordo
- Estiba y desestiba de carga general
- Estiba y desestiba de contenedores
- Estiba y desestiba de carga refrigerada

**Logística Digital:**
- Trazabilidad del servicio y de la carga
- Administración, control y auditoría de cadena de frío
- Consultoría y asesoría para mejoramiento de procesos
- Tarja de mercancía o chequeo
- Diseño, implementación de software en operaciones

**Logística Global:**
- Gestión segura de carga — asesoramiento pólizas
- Asesoramiento y consultoría en transporte
- Coordinación de transporte terrestre y marítimo
- Agenciamiento aduanero y cumplimiento regulatorio

**Alquiler de equipos:**
- Equipos de manipulación
- Equipos de seguridad y control
- Equipos de mantenimiento y reparación portuarios

### SOSTENIBILIDAD
- Fundación (probablemente equivalente a "Fundación Cargoban" — @cargobanfundacion en IG)
- FONDECAR
- Bienestar laboral
- Empleos
- Ambiente

### CONTÁCTANOS
- Formulario

## 3. Investigación de Cargoban (marca origen)

- **Razón social:** Cargoban Operador Logístico y Portuario S.A.S.
- **Fundada:** 24 febrero 2012
- **Sede:** Apartadó (Urabá Antioqueño) — operaciones también en Santa Marta
- **Sector:** Operador logístico portuario y extraportuario
- **Servicios:** logística extraportuaria, transporte terrestre, almacenaje, consolidación, desconsolidación, distribución, re-empaque, etiquetado. Maneja refrigerados, congelados, perecederos, sacos, proyectos, maquinaria, vehículos, granel.
- **Crecimiento 2023:** +18.83% ingresos netos
- **IG corporativo:** [@cargobanoperador](https://www.instagram.com/cargobanoperador/) (967 seguidores)
- **Fundación:** [@cargobanfundacion](https://www.instagram.com/cargobanfundacion/) (834 seguidores)
- **Web:** https://cargoban.com.co/ (devuelve 403 a fetchers — visitar manualmente para screenshot)

## 4. Hipótesis para diferenciar Movex de Cargoban

Como Movex es marca nueva del mismo grupo replicando el mismo negocio, hipótesis a confirmar con el cliente:

- ¿Movex es una marca paralela para mercado diferente (internacional vs. nacional, premium vs. economy)?
- ¿Movex se enfoca solo en una vertical (ej. solo logística digital + global, sin operaciones físicas)?
- ¿O es rebranding parcial / segmentación regional?

El logo es notoriamente más moderno y minimalista que el típico estilo Cargoban (azul corporativo tradicional). La paleta multi-tonal (navy + teal + sage + lavanda) sugiere posicionamiento más premium/tech.

## 5. Pendientes antes de arrancar FRAME

- [ ] Confirmar con cliente: qué diferenciador real tiene Movex vs Cargoban
- [ ] Conseguir fotos reales de operaciones (Apartadó/Santa Marta) o usar stock + IA
- [ ] Conseguir datos numéricos reales (cajas/año, contenedores/año, vehículos) para los contadores
- [ ] Definir si se mantiene Fundación o es nueva
- [ ] Definir hosting (cliente prefiere?) — Vercel default

## 6. Stack propuesto (basado en framework FRAME del video L_0vx859tF0)

| Fase | Herramienta | Output |
|------|-------------|--------|
| F — Fundación | Claude Chat + skill.md + screenshot motionsites.ai | brand identity + structure + prompts |
| R — Render | Chat GPT Image 2 (Higgsfield) | hero + 4-5 imágenes seccionales |
| A — Animation | Higgsfield (Sedance/Kling) | 2-3 videos lupeables (puerto/contenedores/grúas) |
| M — Mount | Claude Design (one-shot) | landing completa |
| E — Entrega | Claude Code → Vercel | deploy + dominio movex.com.co |
