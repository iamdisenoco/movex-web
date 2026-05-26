/**
 * Reveal post-intro — orquesta la entrada de TODOS los elementos visibles
 * después de que la intro animation termina (evento `mvx:intro-done`).
 *
 * Usa GSAP timeline en lugar de CSS transitions + setTimeout porque GSAP:
 *   1. Permite stagger preciso entre elementos
 *   2. Tiene easings premium (power3.out, expo.out, back.out)
 *   3. Coordina múltiples animaciones en un solo timeline (todas
 *      sincronizadas, sin race conditions de setTimeout)
 *   4. Aplica styles inline tal como hace MVP (translate:none scale:none
 *      transform:translate(...))
 *
 * Patrón identificado en mvplogistics.eu: `gsap.from(...)` aplica un estado
 * INICIAL (offscreen / opacity 0) y anima hacia el estado natural del DOM.
 * Easing dominante: `power3.out` (cubic-bezier soft).
 */
import { gsap } from "gsap";

// Easing default para todo el sitio — power3.out es el más común en MVP
// (decelera rápido al final, sensación premium).
const DEFAULT_EASE = "power3.out";

export function playPostIntroReveal() {
  if (typeof window === "undefined") return;
  // Respeta prefers-reduced-motion: mostrar todo inmediato, sin animación.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document
      .querySelectorAll<HTMLElement>("[data-hero-entry], [data-nav-entry]")
      .forEach((el) => (el.style.opacity = "1"));
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: DEFAULT_EASE } });

  // ─── 1) NAV: logo desde arriba + menu items con stagger desde arriba ───
  const navLogo = document.querySelector("#site-nav a[aria-label='Movex inicio']");
  const navLinks = document.querySelectorAll("#site-nav .nav-link");
  const navCTA = document.querySelector("#site-nav a[href='#contacto']");

  if (navLogo) {
    tl.from(
      navLogo,
      { y: -30, opacity: 0, duration: 0.9 },
      0,
    );
  }
  if (navLinks.length) {
    tl.from(
      navLinks,
      { y: -20, opacity: 0, duration: 0.7, stagger: 0.07 },
      0.15,
    );
  }
  if (navCTA) {
    tl.from(navCTA, { y: -20, opacity: 0, duration: 0.7 }, 0.55);
  }

  // ─── 2) HERO: brand label + título + body + CTAs en cascada ───
  // Cada elemento del hero ya tiene data-hero-entry="N" con opacity:0 inline.
  // Lo seteamos a opacity:1 inmediato y dejamos que GSAP haga el from().
  const heroEntries = document.querySelectorAll<HTMLElement>("[data-hero-entry]");
  heroEntries.forEach((el) => (el.style.opacity = ""));

  if (heroEntries.length) {
    tl.from(
      heroEntries,
      {
        y: 60,
        opacity: 0,
        duration: 1.1,
        stagger: 0.13,
        ease: "expo.out",
      },
      0.3, // empieza 300ms después del nav
    );
  }

  // ─── 3) SPLIT TEXT del hero ───
  // NO tocar los chars con GSAP — el sistema CSS+IntersectionObserver del
  // proyecto ya los maneja correctamente (transition por char con stagger 28ms).
  // Si GSAP se mete acá, hay race condition con SplitText que corre paralelo,
  // los chars pueden quedar invisibles (vimos ese bug).
  //
  // Solo le damos un "empujón": marcar [data-split] como data-revealed="true"
  // un poco después del nav reveal, así los chars caen en su animación CSS
  // natural sin tener que esperar al IntersectionObserver.
  tl.call(
    () => {
      document
        .querySelectorAll("#hero [data-split]")
        .forEach((el) => el.setAttribute("data-revealed", "true"));
    },
    [],
    0.35,
  );
}

// Auto-trigger: si sessionStorage tiene mvx_intro_v6 (intro ya vista), correr
// inmediato. Si no, esperar al evento mvx:intro-done de Intro3D.
if (typeof window !== "undefined") {
  const start = () => {
    // Pequeño delay para que el DOM esté completamente listo y el match-move
    // de la intro haya terminado.
    requestAnimationFrame(() => playPostIntroReveal());
  };
  if (sessionStorage.getItem("mvx_intro_v6")) {
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
  } else {
    window.addEventListener("mvx:intro-done", start, { once: true });
  }
}
