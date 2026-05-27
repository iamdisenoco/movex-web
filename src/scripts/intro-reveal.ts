/**
 * Intro cover/unlock handler.
 *
 * Las animaciones del hero ahora las maneja HeroReveal.tsx (React + Framer Motion).
 * Este script solo:
 *   1. Remueve #intro-cover del DOM cuando intro-locked se quita
 *   2. SAFETY NET AGRESIVO 5s: si la intro no termina, fuerza unlock +
 *      dispatcha mvx:intro-done para que HeroReveal arranque
 */

function removeCover() {
  const cover = document.getElementById("intro-cover");
  if (!cover) return;
  cover.style.transition = "opacity 500ms ease-out";
  cover.style.opacity = "0";
  setTimeout(() => cover.remove(), 600);
}

function forceFinish() {
  document.documentElement.classList.remove("intro-locked");
  sessionStorage.setItem("mvx_intro_v6", "1");
  window.dispatchEvent(new Event("mvx:intro-done"));
  removeCover();
}

function init() {
  if (typeof window === "undefined") return;

  if (!document.documentElement.classList.contains("intro-locked")) {
    removeCover();
    return;
  }

  let done = false;
  const onceFinish = () => {
    if (done) return;
    done = true;
    removeCover();
  };

  window.addEventListener("mvx:intro-done", onceFinish, { once: true });

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

  // SAFETY NET AGRESIVO 5s — si la intro no termina, forzar unlock +
  // dispatchar el evento explícitamente para que HeroReveal arranque.
  setTimeout(() => {
    if (!done) {
      console.warn("[mvx] intro safety net firing at 5s");
      clearInterval(poll);
      forceFinish();
      done = true;
    }
  }, 5000);
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
}
