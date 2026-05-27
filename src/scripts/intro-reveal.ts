/**
 * Reveal post-intro — SOLO maneja la remoción del cover navy.
 *
 * Las animaciones del hero son CSS @keyframes puras (en global.css)
 * disparadas automáticamente cuando html no tiene la clase intro-locked.
 * Sin JS interference, sin race conditions, sin opacity stuck.
 */

function removeCover() {
  const cover = document.getElementById("intro-cover");
  if (!cover) return;
  cover.style.transition = "opacity 500ms ease-out";
  cover.style.opacity = "0";
  setTimeout(() => cover.remove(), 600);
}

function init() {
  if (typeof window === "undefined") return;

  // Si intro-locked no está al cargar, remover cover inmediato
  if (!document.documentElement.classList.contains("intro-locked")) {
    removeCover();
    return;
  }

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    removeCover();
  };

  window.addEventListener("mvx:intro-done", finish, { once: true });

  // Polling cada 200ms: detecta cuando intro-locked se quita
  const poll = setInterval(() => {
    if (done) {
      clearInterval(poll);
      return;
    }
    if (!document.documentElement.classList.contains("intro-locked")) {
      clearInterval(poll);
      finish();
    }
  }, 200);

  // Safety net: 12s — fuerza unlock pase lo que pase
  setTimeout(() => {
    if (!done) {
      console.warn("[mvx] reveal safety net firing at 12s");
      document.documentElement.classList.remove("intro-locked");
      clearInterval(poll);
      finish();
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
