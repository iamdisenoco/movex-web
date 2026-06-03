# Patterns dinámicos para sección Servicios — referentes

**Fecha:** 2026-05-27
**Contexto:** Jon pidió rediseñar la sección Servicios para que **todos los servicios se vean a la vez** (no scroll-stack uno por uno) y que el layout sea **muy interactivo y creativo**. Referentes agnósticos a logística — patterns visuales aplicables a las 5 categorías Movex (Terrestres, Portuarias, Digital, Global, Alquiler de Equipos).

---

## A. Bento grid asimétrico

- **URL referente:** https://www.apple.com/apple-vision-pro/
- **Qué mirar:** scrollear a la sección de features. Cards de distintos tamaños (la principal grande, secundarias chicas), hover lift + zoom sutil de imagen.
- **Por qué funciona para Movex:** permite jerarquía visual — "Logística Digital" (el diferenciador, marcado `featured: true` en `site.ts`) ocupa la card más grande; el resto en cards menores. Todo visible en un viewport.
- **Densidad de items:** maneja bien copy variable. Items por servicio se muestran como bullets dentro de cada card.

## B. Bubble/orbit physics

- **URL referente:** https://lusion.co
- **Qué mirar:** homepage. Burbujas flotando con físicas magnéticas, reaccionan al cursor.
- **Por qué funciona:** wow factor "futurístico premium", refuerza el posicionamiento de marca premium internacional.
- **Riesgo:** difícil de leer si hay mucho copy por servicio. Mejor si cada servicio se reduce a 1 título + ícono.

## C. Accordion expandible (one-open o multi-open)

- **URL referente:** https://linear.app/method (sección "Built for modern product teams")
- **Qué mirar:** todas las features visibles colapsadas como filas. Hover/click expande una sin esconder las otras.
- **Por qué funciona para Movex:** denso, toda la info accesible sin scroll. Ideal porque "Operaciones Terrestres" tiene 10 ítems mientras otras tienen 4-5 — accordion absorbe la asimetría.
- **Inspiración secundaria:** https://stripe.com/atlas (FAQs / steps).

## D. Tabs/filter dinámico con grid morphing

- **URL referente:** https://stripe.com/payments
- **Qué mirar:** sección "One platform". Botones de filtro arriba, grid abajo que se reorganiza con animación al cambiar filtro.
- **Por qué funciona:** familiar UX, claro, organiza mucho contenido sin abrumar.
- **Variante:** las 5 categorías como tabs grandes arriba; al hacer hover/click, el área inferior cambia mostrando los items de esa categoría.

## E. Mouse-reactive grid

- **URL referente:** https://www.cuberto.com/services/
- **Qué mirar:** grid de servicios. Cards reaccionan al mouse position (inclinación 3D sutil, iluminación dinámica).
- **Por qué funciona:** subtil, premium, da sensación de "sitio vivo" sin ser invasivo. Coherente con el resto de microinteractions ya implementadas en Movex (magnetic CTAs, cursor custom).

## F. Marquee horizontal autoplay + hover pause

- **URL referente:** https://stripe.com/ (marquee de logos abajo — principio similar)
- **Variante para servicios:** las 5 cards de servicios pasan en loop horizontal. Hover detiene el marquee y expande la card que está bajo el cursor.
- **Por qué funciona:** compacto (todos en un viewport horizontal), descubrimiento natural.
- **Riesgo:** si el usuario nunca pasa el mouse, no descubre el detalle.

---

## Mi recomendación (Claude) para Movex

**A (bento) o C (accordion)** — porque tu lista de items por servicio es densa (Operaciones Terrestres: 10 items). Bento le da peso visual al diferenciador "Logística Digital". Accordion mantiene todo el detalle accesible sin que el usuario decida qué leer primero.

**Pendiente de decisión:** Jon elige cuál pattern aplicar. Una vez decidido, el código actual del card-stack scroll-driven (`Servicios.astro` + `data-card-stack` handler en `animation.ts`) se reemplaza por el nuevo pattern.
