/**
 * Reveal post-intro usando Web Animations API (WAAPI).
 *
 * Por qué WAAPI y no CSS o JS transitions:
 *   - CSS @keyframes: se RESETEAN constantemente por algún loop interno
 *     (Lenis/parallax/MutationObserver). currentTime queda en 0.
 *   - JS CSS transitions: idem, las transitions quedan "stuck running".
 *   - WAAPI: independiente del DOM, NO se afecta por mutations al style
 *     del elemento, fill:forwards persiste el estado final.
 *
 * Hace 2 cosas:
 *   1. Remueve #intro-cover del DOM cuando intro-locked se quita
 *   2. Aplica WAAPI animation a cada [data-hero-entry] con stagger
 */

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function removeCover() {
  const cover = document.getElementById("intro-cover");
  if (!cover) return;
  cover.style.transition = "opacity 500ms ease-out";
  cover.style.opacity = "0";
  setTimeout(() => cover.remove(), 600);
}

function revealHero() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll<HTMLElement>("[data-hero-entry]").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }
  // Web Animations API — persiste, no se resetea con mutations
  const entries = Array.from(
    document.querySelectorAll<HTMLElement>("[data-hero-entry]"),
  );
  entries.forEach((el) => {
    const i = parseInt(el.dataset.heroEntry || "0", 10);
    // Stagger más AMPLIO + duración más LARGA para que sea visiblemente
    // perceptible (antes: 200+i*140 / 900ms → demasiado rápido, no se notaba)
    const delay = 300 + i * 280;
    const anim = el.animate(
      [
        { opacity: 0, transform: "translateY(80px)" },
        { opacity: 1, transform: "translateY(0px)" },
      ],
      {
        duration: 1400,
        delay,
        easing: EASE,
        fill: "forwards",
      },
    );
    // Aplicar el estado final también via inline style (backup en caso
    // de que algo elimine la WAAPI animation)
    anim.onfinish = () => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0px)";
    };
  });
}

function finish() {
  removeCover();
  revealHero();
}

function init() {
  if (typeof window === "undefined") return;

  // Si intro-locked no está al cargar, correr finish inmediato
  if (!document.documentElement.classList.contains("intro-locked")) {
    finish();
    return;
  }

  let done = false;
  const onceFinish = () => {
    if (done) return;
    done = true;
    finish();
  };

  window.addEventListener("mvx:intro-done", onceFinish, { once: true });

  // Polling cada 200ms
  const poll = setInterval(() => {
    if (done) {
      clearInterval(poll);
      return;
    }
    if (!document.documentElement.classList.contains("intro-locked")) {
      clearInterval(poll);
      onceFinish();
    }
  }, 200);

  // Safety net 12s
  setTimeout(() => {
    if (!done) {
      console.warn("[mvx] reveal safety net firing at 12s");
      document.documentElement.classList.remove("intro-locked");
      clearInterval(poll);
      onceFinish();
    }
  }, 12000);
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
}
