/**
 * Micro-interactions — vanilla TS, sin dependencias.
 *
 * Convención: cada interacción se activa con un atributo data-* en el elemento.
 * Aplicar atributos en los Astro/JSX para opt-in granular.
 *
 *   data-magnetic         → el elemento se mueve sutilmente hacia el cursor en hover
 *   data-magnetic-strength="0.25"  → opcional, default 0.3
 *   data-ripple           → onda teal expandiéndose desde punto de click
 *   data-cursor-target    → el cursor custom crece sobre este elemento
 *
 * El script se monta una sola vez al cargar la página. Los listeners son
 * delegated o por-elemento según el caso.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1) MAGNETIC HOVER
// ─────────────────────────────────────────────────────────────────────────────

function initMagnetic() {
  const els = document.querySelectorAll<HTMLElement>("[data-magnetic]");
  els.forEach((el) => {
    const strength = parseFloat(el.dataset.magneticStrength || "0.3");
    let raf = 0;
    let target = { x: 0, y: 0 };
    let current = { x: 0, y: 0 };

    const tick = () => {
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;
      el.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      if (
        Math.abs(target.x - current.x) > 0.05 ||
        Math.abs(target.y - current.y) > 0.05
      ) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      target.x = dx * strength;
      target.y = dy * strength;
      if (!raf) raf = requestAnimationFrame(tick);
    });

    el.addEventListener("pointerleave", () => {
      target.x = 0;
      target.y = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    });
    // NO seteamos will-change inline aquí — chocaría con SSR hydration en
    // los CTAs de React island. El will-change lo aplicamos vía CSS en
    // global.css con [data-magnetic] selector.
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2) RIPPLE on click
// ─────────────────────────────────────────────────────────────────────────────

function initRipple() {
  document.addEventListener("pointerdown", (e) => {
    const target = (e.target as HTMLElement)?.closest<HTMLElement>("[data-ripple]");
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    const ripple = document.createElement("span");
    ripple.className = "mvx-ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;

    // El elemento target debe tener position:relative y overflow:hidden
    // (lo aseguramos via CSS .mvx-ripple-host)
    const prevPos = getComputedStyle(target).position;
    if (prevPos === "static") target.style.position = "relative";
    const prevOverflow = getComputedStyle(target).overflow;
    if (prevOverflow === "visible") target.style.overflow = "hidden";

    target.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3) CUSTOM CURSOR (dot + ring)
// ─────────────────────────────────────────────────────────────────────────────

function initCursor() {
  // Solo desktop con pointer fino — saltamos touch devices
  if (!matchMedia("(pointer: fine)").matches) return;

  // Flecha náutica SVG — el "tip" de la flecha (0,0) cae justo donde apunta
  // el mouse. Path inspirada en carta náutica / compass-rose.
  const SVG_NS = "http://www.w3.org/2000/svg";
  const cursor = document.createElementNS(SVG_NS, "svg");
  cursor.setAttribute("class", "mvx-cursor");
  cursor.setAttribute("viewBox", "0 0 40 56");
  cursor.setAttribute("width", "24");
  cursor.setAttribute("height", "34");
  cursor.innerHTML =
    '<path d="M0 0 L0 50 L14 38 L22 56 L30 52 L22 34 L40 32 Z" />';
  document.body.appendChild(cursor);

  let mouseX = -100,
    mouseY = -100;

  document.addEventListener("pointermove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Sin lerp — 1:1 con el mouse. La flecha apunta con su tip (0,0) al
    // pixel exacto del cursor del sistema.
    cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  });

  // Activate state on interactive elements
  const interactiveSel = "a, button, [data-cursor-target]";
  document.addEventListener(
    "pointerover",
    (e) => {
      const t = e.target as HTMLElement;
      if (t.closest && t.closest(interactiveSel)) {
        cursor.classList.add("mvx-cursor--active");
      }
    },
    true,
  );
  document.addEventListener(
    "pointerout",
    (e) => {
      const t = e.target as HTMLElement;
      if (t.closest && t.closest(interactiveSel)) {
        cursor.classList.remove("mvx-cursor--active");
      }
    },
    true,
  );

  // Hide on touch start (revert to system cursor for touch users)
  document.addEventListener(
    "touchstart",
    () => {
      cursor.remove();
    },
    { once: true, passive: true },
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4) SCROLL PROGRESS BAR (top)
// ─────────────────────────────────────────────────────────────────────────────

function initScrollProgress() {
  const bar = document.createElement("div");
  bar.className = "mvx-scroll-progress";
  document.body.appendChild(bar);

  // Combinamos scroll events + setInterval(50) para garantizar updates en
  // todos los entornos (browser real, preview headless, Lenis smooth scroll).
  // El setInterval es watchdog — solo aplica si hubo cambio real.
  let lastP = -1;
  const update = () => {
    const el = document.scrollingElement || document.documentElement;
    const max = el.scrollHeight - el.clientHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0;
    if (Math.abs(p - lastP) < 0.001) return;
    lastP = p;
    bar.style.transform = `scaleX(${p})`;
  };
  document.addEventListener("scroll", update, { passive: true, capture: true });
  window.addEventListener("scroll", update, { passive: true });
  setInterval(update, 50);
  update();
}

// ─────────────────────────────────────────────────────────────────────────────
// Init — esperamos a DOM ready
// ─────────────────────────────────────────────────────────────────────────────

function init() {
  initMagnetic();
  initRipple();
  initCursor();
  initScrollProgress();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Re-scan magnetic on view transitions / route changes (Astro view-transitions)
document.addEventListener("astro:page-load", initMagnetic);
