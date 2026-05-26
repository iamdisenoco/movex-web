/**
 * Movex global animation stack:
 *  1) Lenis smooth scroll (lerp + raf)
 *  2) SplitText reveal — divide [data-split] en .word > .char con stagger
 *  3) Parallax tied — [data-parallax="speed"] se transladan con scroll progress
 *  4) IntersectionObserver reveal — para [data-reveal] clásico
 *  5) Nav ready toggle (post-intro)
 *  6) Counter countup
 *
 *  Todo se desactiva con prefers-reduced-motion.
 */
import Lenis from "lenis";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ─────────────────────────────────────────────────────────────────
// 1) LENIS — smooth scroll lerp
// ─────────────────────────────────────────────────────────────────
let lenis: Lenis | null = null;
if (!reduce) {
  lenis = new Lenis({
    duration: 1.05,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    lerp: 0.1,
  });

  const root = document.documentElement;
  lenis.on("scroll", ({ scroll }: { scroll: number }) => {
    root.style.setProperty("--scroll-y", scroll + "px");
  });

  const raf = (t: number) => {
    lenis!.raf(t);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // Anchor links → Lenis smooth scroll con offset por nav
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis!.scrollTo(target as HTMLElement, { offset: -64, duration: 1.2 });
    });
  });

  if (document.documentElement.classList.contains("intro-locked")) {
    lenis.stop();
  }
  const resumeScroll = () => {
    if (!lenis) return;
    document.documentElement.classList.remove("intro-locked");
    lenis.start();
  };
  window.addEventListener("mvx:intro-done", resumeScroll);

  // SAFETY NET 1: si en 12s el intro no terminó (bug, error, navegador lento),
  // forzar unlock — el user nunca debe quedarse atascado sin poder scrollear.
  setTimeout(() => {
    if (document.documentElement.classList.contains("intro-locked")) {
      console.warn("[mvx] Intro animation didn't finish in 12s — forcing unlock");
      sessionStorage.setItem("mvx_intro_v6", "1");
      resumeScroll();
    }
  }, 12000);

  // SAFETY NET 2: si el user intenta scrollear (wheel/touch) y la intro está
  // todavía mounted, asumimos que quiere saltar y forzamos unlock.
  const onEarlyScroll = () => {
    if (document.documentElement.classList.contains("intro-locked")) {
      sessionStorage.setItem("mvx_intro_v6", "1");
      resumeScroll();
    }
  };
  window.addEventListener("wheel", onEarlyScroll, { passive: true });
  window.addEventListener("touchstart", onEarlyScroll, { passive: true });
}

// ─────────────────────────────────────────────────────────────────
// 2) SPLIT TEXT — divide text nodes en spans char-por-char
// ─────────────────────────────────────────────────────────────────
function splitText(el: HTMLElement) {
  if (el.dataset.splitted === "true") return;
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue || "";
      const frag = document.createDocumentFragment();
      const words = text.split(/(\s+)/);
      words.forEach((w) => {
        if (/^\s+$/.test(w)) {
          frag.appendChild(document.createTextNode(w));
          return;
        }
        if (!w) return;
        const word = document.createElement("span");
        word.className = "word";
        [...w].forEach((c) => {
          const ch = document.createElement("span");
          ch.className = "char";
          ch.textContent = c;
          word.appendChild(ch);
        });
        frag.appendChild(word);
      });
      node.parentNode?.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.childNodes.length) {
      [...node.childNodes].forEach(walk);
    }
  };
  [...el.childNodes].forEach(walk);
  const chars = el.querySelectorAll<HTMLElement>(".char");
  chars.forEach((c, i) => c.style.setProperty("--ci", String(i)));
  el.style.setProperty("--char-total", String(chars.length));
  el.dataset.splitted = "true";
}

document.querySelectorAll<HTMLElement>("[data-split]").forEach(splitText);

// ─────────────────────────────────────────────────────────────────
// 3) INTERSECTION OBSERVER — dispara reveals (clásicos + split)
// ─────────────────────────────────────────────────────────────────
if (reduce) {
  document
    .querySelectorAll("[data-reveal], [data-split]")
    .forEach((el) => el.setAttribute("data-revealed", "true"));
} else {
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.setAttribute("data-revealed", "true");
          revealObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  document
    .querySelectorAll("[data-reveal], [data-split]")
    .forEach((el) => revealObs.observe(el));
}

// ─────────────────────────────────────────────────────────────────
// 4) PARALLAX — translate3d tied DIRECTAMENTE al scrollY (técnica MVP).
//    Cada elemento se traslada DOWN con ty = (scrollY - anchor) * speed.
//    Modo "section" (default): anchor = top de la section padre. Elemento
//    permanece "anclado" mientras la section no entra, y empieza a parallax
//    una vez que cruza el viewport.
//    Modo "page" (data-parallax-from="page"): anchor = 0 (top de la página).
//    Útil para el video del hero — se traslada DOWN con scroll global.
// ─────────────────────────────────────────────────────────────────
if (!reduce) {
  type PEl = { el: HTMLElement; speed: number; anchor: number; mode: "page" | "section" };
  const parallaxEls: PEl[] = [];

  const resolveAnchor = (el: HTMLElement, mode: "page" | "section"): number => {
    if (mode === "page") return 0;
    // section mode: anchor = top absoluto de la section padre más cercana
    let p: HTMLElement | null = el.parentElement;
    while (p && p.tagName !== "SECTION" && p.tagName !== "BODY") p = p.parentElement;
    if (!p || p.tagName === "BODY") return 0;
    const r = p.getBoundingClientRect();
    return r.top + window.scrollY;
  };

  document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
    const mode = (el.dataset.parallaxFrom === "page" ? "page" : "section") as "page" | "section";
    parallaxEls.push({
      el,
      speed: parseFloat(el.dataset.parallax || "0.3"),
      anchor: resolveAnchor(el, mode),
      mode,
    });
  });

  // Recalcular anchors tras window resize / load (layout shifts)
  const recomputeAnchors = () => {
    parallaxEls.forEach((p) => {
      // Reset transform para medir el natural position
      const prev = p.el.style.transform;
      p.el.style.transform = "";
      p.anchor = resolveAnchor(p.el, p.mode);
      p.el.style.transform = prev;
    });
  };
  window.addEventListener("load", recomputeAnchors);
  window.addEventListener("resize", recomputeAnchors);

  const scaleEls = [...document.querySelectorAll<HTMLElement>("[data-scale-on-scroll]")];

  let lastY = -1;
  const tick = () => {
    const y = window.scrollY;
    if (y !== lastY) {
      lastY = y;
      const vh = window.innerHeight;

      parallaxEls.forEach(({ el, speed, anchor, mode }) => {
        // Para modo "page": el video se traslada DOWN con scrollY (técnica MVP)
        // Para modo "section": solo cuando la section ha empezado a scrollearse
        const offset = y - anchor;
        const ty = offset * speed;
        el.style.transform = `translate3d(0, ${ty.toFixed(2)}px, 0)`;
      });

      scaleEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        const enter = Math.max(0, Math.min(1, 1 - r.top / vh));
        const scale = 1.15 - enter * 0.15;
        el.style.transform = `scale(${scale.toFixed(4)})`;
      });
    }
    requestAnimationFrame(tick);
  };
  if (parallaxEls.length || scaleEls.length) requestAnimationFrame(tick);
}

// ─────────────────────────────────────────────────────────────────
// 4.5) CARD STACK — scroll-driven sequencer (estilo MVP services__items).
//      Cada section[data-card-stack] tiene altura (N+1)*100vh.
//      Adentro: cards apiladas con [data-stack-card="i"] todas en mismo lugar.
//      Conforme scrolleas, cada card transiciona translateY(100% → 0% → -100%).
//      Mientras una card está en su "viewport" (1vh de scroll), está visible.
// ─────────────────────────────────────────────────────────────────
if (!reduce) {
  const stacks = document.querySelectorAll<HTMLElement>("[data-card-stack]");
  stacks.forEach((section) => {
    const total = parseInt(section.dataset.cardStackCount || "0", 10);
    if (!total) return;
    const cards = section.querySelectorAll<HTMLElement>("[data-stack-card]");
    const images = section.querySelectorAll<HTMLElement>("[data-stack-image]");
    const counter = section.querySelector<HTMLElement>("[data-stack-counter]");
    const imageCounter = section.querySelector<HTMLElement>("[data-stack-image-counter]");
    const dots = section.querySelectorAll<HTMLElement>("[data-stack-dot]");

    const updateStack = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      // Distance scrolled INSIDE the section, normalized [0..1]
      // Cuando section.top = 0 → progress 0. Cuando section.bottom = vh → progress 1.
      const total_scroll = section.offsetHeight - vh;
      const scrolled = Math.max(0, -rect.top);
      const progress = Math.max(0, Math.min(1, scrolled / total_scroll));
      // Stage por card: 0 = la primera está centrada; total-1 = última centrada
      const cardProgress = progress * total;
      let activeIdx = Math.min(total - 1, Math.max(0, Math.floor(cardProgress)));

      cards.forEach((card, i) => {
        // stage = -∞ (no llegó), 0 (centrada), 1 (saliendo), +∞ (ya salió)
        const stage = cardProgress - i;
        let ty: number;
        if (stage <= -1) ty = 100;
        else if (stage >= 1) ty = -100;
        else ty = -stage * 100;
        card.style.transform = `translate3d(0, ${ty.toFixed(2)}%, 0)`;
        // opacity para suavizar el fade en los extremos
        const op = stage <= -1 || stage >= 1.05 ? 0 : 1;
        card.style.opacity = String(op);
        // z-index: más alto el que se acerca a 0
        card.style.zIndex = String(100 - Math.round(Math.abs(stage) * 10));
      });

      images.forEach((img, i) => {
        img.style.opacity = i === activeIdx ? "1" : "0";
      });

      const padded = (n: number) => String(n).padStart(2, "0");
      if (counter) counter.textContent = `${padded(activeIdx + 1)} / ${padded(total)}`;
      if (imageCounter) imageCounter.innerHTML = `${padded(activeIdx + 1)}<span class="text-white/40">/${padded(total)}</span>`;

      dots.forEach((dot, i) => {
        if (i === activeIdx) {
          dot.classList.add("bg-teal-300", "w-8");
          dot.classList.remove("bg-white/20", "w-4");
        } else {
          dot.classList.remove("bg-teal-300", "w-8");
          dot.classList.add("bg-white/20", "w-4");
        }
      });
    };

    // Suscribir al rAF loop existente sería más eficiente, pero usar scroll listener
    // pasivo basta. Lenis emite eventos scroll nativos también.
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        updateStack();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateStack);
    updateStack();
  });
}

// ─────────────────────────────────────────────────────────────────
// 5) NAV READY (post-intro)
// ─────────────────────────────────────────────────────────────────
const markNavReady = () => {
  const header = document.getElementById("site-nav");
  if (!header) return;
  header.setAttribute("data-ready", "true");
  header
    .querySelectorAll<HTMLElement>("[data-ready]")
    .forEach((el) => el.setAttribute("data-ready", "true"));
};
if (sessionStorage.getItem("mvx_intro_v6")) {
  markNavReady();
} else {
  window.addEventListener("mvx:intro-done", markNavReady, { once: true });
}

// ─────────────────────────────────────────────────────────────────
// 6) COUNTUP — números animados
// ─────────────────────────────────────────────────────────────────
const counterObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement;
      const target = parseInt(
        el.getAttribute("data-countup") || el.textContent || "0",
        10
      );
      if (!isFinite(target) || target <= 0) {
        counterObs.unobserve(el);
        return;
      }
      const start = performance.now();
      const dur = 1600;
      const tick = (now: number) => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.floor(target * eased).toLocaleString("es-CO");
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString("es-CO");
      };
      requestAnimationFrame(tick);
      counterObs.unobserve(el);
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll("[data-countup]").forEach((el) => counterObs.observe(el));
