/**
 * Reveal post-intro — VERSIÓN ULTRA DEFENSIVA.
 *
 * Bugs anteriores que hicieron que NUNCA funcionara:
 *   1. GSAP no cargaba en prod → import fallaba silenciosamente
 *   2. El evento mvx:intro-done se disparaba ANTES de que el listener se
 *      registrara (race condition entre intro y este script)
 *   3. El CSS del cover dependía de transition que no se aplicaba
 *
 * Ahora:
 *   - Sin imports externos (no GSAP, no Lenis dependencies)
 *   - Polling cada 200ms checando si intro-locked está presente
 *   - Cuando intro-locked se quita (o nunca estuvo), corre el reveal
 *   - Remueve el #intro-cover DIRECTAMENTE del DOM (sin depender de CSS)
 *   - Safety net: a los 12s fuerza el reveal pase lo que pase
 */

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function reveal() {
  if (typeof window === "undefined") return;
  if ((window as any).__mvxRevealed) return;
  (window as any).__mvxRevealed = true;

  console.log("[mvx-reveal] starting reveal");

  // 1. Remover cover navy del DOM (no esperar transition CSS)
  const cover = document.getElementById("intro-cover");
  if (cover) {
    cover.style.transition = "opacity 500ms ease-out";
    cover.style.opacity = "0";
    setTimeout(() => cover.remove(), 600);
  }

  // 2. Reveal hero entries con stagger
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heroEntries = Array.from(
    document.querySelectorAll<HTMLElement>("[data-hero-entry]"),
  );
  heroEntries.forEach((el, idx) => {
    el.classList.remove("opacity-0");
    const i = parseInt(el.dataset.heroEntry || String(idx), 10);
    if (reduce) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }
    el.style.opacity = "0";
    el.style.transform = "translateY(40px)";
    el.style.transition = `opacity 900ms ${EASE}, transform 900ms ${EASE}`;
    const delay = 200 + i * 140;
    setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, delay);
  });

  // 3. Trigger SplitText chars del título (data-revealed)
  setTimeout(() => {
    document
      .querySelectorAll("#hero [data-split]")
      .forEach((el) => el.setAttribute("data-revealed", "true"));
  }, 350);
}

function init() {
  if (typeof window === "undefined") return;

  // Escuchar el evento explícito de intro
  window.addEventListener("mvx:intro-done", reveal, { once: true });

  // Polling cada 200ms: si intro-locked no está, correr reveal.
  // Esto cubre el caso donde mvx:intro-done ya se disparó antes de que
  // este listener se registrara.
  const poll = setInterval(() => {
    if ((window as any).__mvxRevealed) {
      clearInterval(poll);
      return;
    }
    const locked = document.documentElement.classList.contains("intro-locked");
    if (!locked) {
      clearInterval(poll);
      reveal();
    }
  }, 200);

  // Safety net: a los 12s reveal pase lo que pase (intro buggea, error, etc.)
  setTimeout(() => {
    if (!(window as any).__mvxRevealed) {
      console.warn("[mvx-reveal] safety net firing after 12s");
      document.documentElement.classList.remove("intro-locked");
      clearInterval(poll);
      reveal();
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
