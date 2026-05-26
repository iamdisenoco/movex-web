/**
 * Reveal post-intro — CSS transitions + JS stagger.
 *
 * SIN GSAP. La versión anterior usaba gsap.from() pero en producción
 * el bundle de Vercel no exponía gsap correctamente → las animaciones
 * nunca corrían y todo quedaba con opacity-0 invisible.
 *
 * Ahora: usa CSS transitions nativas + JS solo para:
 *   1. Remover la clase opacity-0 con stagger
 *   2. Aplicar inline transform: translateY(0) tras el delay
 *   3. Marcar [data-split] como data-revealed=true para los chars del título
 */

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const REDUCE = typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function playPostIntroReveal() {
  if (typeof window === "undefined") return;

  // En reduced-motion: mostrar todo inmediato sin animación.
  if (REDUCE) {
    document.querySelectorAll<HTMLElement>("[data-hero-entry]").forEach((el) => {
      el.classList.remove("opacity-0");
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    document
      .querySelectorAll<HTMLElement>("#hero [data-split]")
      .forEach((el) => el.setAttribute("data-revealed", "true"));
    return;
  }

  // ─── HERO entries: brand label / título / body / CTAs con stagger ───
  const heroEntries = Array.from(
    document.querySelectorAll<HTMLElement>("[data-hero-entry]"),
  );

  // Set initial state: opacity 0 + translateY 40px (manual override del CSS class)
  heroEntries.forEach((el) => {
    el.classList.remove("opacity-0"); // ← key: quitar la clase Tailwind opacity-0
    el.style.opacity = "0";
    el.style.transform = "translateY(40px)";
    el.style.transition = `opacity 900ms ${EASE}, transform 900ms ${EASE}`;
  });

  // Force reflow para que el initial state se aplique antes de la transición
  void document.body.offsetHeight;

  // Reveal con stagger 140ms
  heroEntries.forEach((el, idx) => {
    const i = parseInt(el.dataset.heroEntry || String(idx), 10);
    const delay = 200 + i * 140;
    setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, delay);
  });

  // ─── HERO chars del título: marcar data-revealed para que el CSS del proyecto
  //     dispare la animación stagger por char (28ms cada uno, ya está en global.css)
  setTimeout(() => {
    document
      .querySelectorAll("#hero [data-split]")
      .forEach((el) => el.setAttribute("data-revealed", "true"));
  }, 350);
}

// ─── Auto-trigger ───────────────────────────────────────────────
if (typeof window !== "undefined") {
  const start = () => {
    requestAnimationFrame(() => playPostIntroReveal());
  };

  const tryStart = () => {
    if (sessionStorage.getItem("mvx_intro_v6")) {
      // Intro ya vista: correr inmediato
      if (document.readyState === "complete" || document.readyState === "interactive") {
        start();
      } else {
        window.addEventListener("DOMContentLoaded", start, { once: true });
      }
    } else {
      // Esperar al evento de intro completada
      window.addEventListener("mvx:intro-done", start, { once: true });

      // Safety net: si en 10s no se disparó (intro buggea o no monta),
      // forzar el reveal igual.
      setTimeout(() => {
        const heroEntry = document.querySelector<HTMLElement>(
          '[data-hero-entry="0"]',
        );
        if (heroEntry && heroEntry.classList.contains("opacity-0")) {
          console.warn("[mvx] Reveal safety net: forcing play (intro-done never fired)");
          start();
        }
      }, 10000);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryStart, { once: true });
  } else {
    tryStart();
  }
}
