/**
 * Movex global animation stack:
 *  1) Scroll nativo (Lenis removido por perf 2026-05-26)
 *  2) SplitText reveal — divide [data-split] en .word > .char con stagger
 *  3) Parallax tied — [data-parallax="speed"] se transladan con scroll progress
 *  4) IntersectionObserver reveal — para [data-reveal] clásico
 *  5) Nav ready toggle (post-intro)
 *  6) Counter countup
 *
 *  Todo se desactiva con prefers-reduced-motion.
 */

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ─────────────────────────────────────────────────────────────────
// 1) SCROLL — nativo del browser (Lenis removido por perf)
//
// Razón: el scroll se sentía "tostado". Lenis smooth-scroll requiere
// rAF infinito + dispara scroll events en cada tick + agrega un nivel
// de indirección entre wheel y movement. Con el card-stack handler +
// parallax + sticky + video escalado, el costo acumulado bajaba el FPS
// a niveles inaceptables. Volver al scroll nativo es responsivo 1:1.
//
// La sensación "premium smooth" la dejamos a las transitions de los
// elementos (cards entrando, parallax tied, fade-ins).
// ─────────────────────────────────────────────────────────────────

// Anchor links → scroll smooth nativo del browser
if (!reduce) {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id.length < 2) return;
      const target = document.querySelector(id) as HTMLElement | null;
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });
}

// Safety nets de intro — siguen siendo necesarias por si el intro se atora.
const resumeScroll = () => {
  document.documentElement.classList.remove("intro-locked");
};
window.addEventListener("mvx:intro-done", resumeScroll);

setTimeout(() => {
  if (document.documentElement.classList.contains("intro-locked")) {
    console.warn("[mvx] Intro animation didn't finish in 12s — forcing unlock");
    sessionStorage.setItem("mvx_intro_v6", "1");
    resumeScroll();
  }
}, 12000);

const onEarlyScroll = () => {
  if (document.documentElement.classList.contains("intro-locked")) {
    sessionStorage.setItem("mvx_intro_v6", "1");
    resumeScroll();
  }
};
window.addEventListener("wheel", onEarlyScroll, { passive: true });
window.addEventListener("touchstart", onEarlyScroll, { passive: true });

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

  // Render coalescido: en lugar de un rAF infinito, escucho scroll/resize y
  // disparo UN rAF por evento. Ahorra ~60 rAFs/s cuando el user no se mueve.
  let queued = false;
  const render = () => {
    queued = false;
    const y = window.scrollY;
    const vh = window.innerHeight;

    parallaxEls.forEach(({ el, speed, anchor }) => {
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
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(render);
  };
  if (parallaxEls.length || scaleEls.length) {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    render();
  }
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
    const titles = section.querySelectorAll<HTMLElement>("[data-stack-title]");
    const counter = section.querySelector<HTMLElement>("[data-stack-counter]");
    const imageCounter = section.querySelector<HTMLElement>("[data-stack-image-counter]");
    const watermark = section.querySelector<HTMLElement>("[data-stack-watermark]");
    const dots = section.querySelectorAll<HTMLElement>("[data-stack-dot]");

    // Easing con HOLD cerca del centro — `pow(abs, 2.2)` hace que cuando
    // stage está cerca de 0 (card centrada), el movimiento es pequeño →
    // la card "respira" en su posición. Lejos del centro (|stage|→1) el
    // movimiento es completo (±100%). Es lo que pidió Jon: que la card
    // se "detenga" cuando está alineada horizontalmente.
    const holdEase = (stage: number): number => {
      const s = Math.sign(stage);
      const a = Math.min(1, Math.abs(stage));
      return s * Math.pow(a, 2.2) * 100;
    };

    const updateStack = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const total_scroll = section.offsetHeight - vh;
      const scrolled = Math.max(0, -rect.top);
      const progress = Math.max(0, Math.min(1, scrolled / total_scroll));
      const cardProgress = progress * total;
      let activeIdx = Math.min(total - 1, Math.max(0, Math.floor(cardProgress)));

      cards.forEach((card, i) => {
        const stage = cardProgress - i;
        let ty: number;
        if (stage <= -1) ty = 100;
        else if (stage >= 1) ty = -100;
        else ty = -holdEase(stage);
        card.style.transform = `translate3d(0, ${ty.toFixed(2)}%, 0)`;
        const op = stage <= -1 || stage >= 1.05 ? 0 : 1;
        card.style.opacity = String(op);
        card.style.zIndex = String(100 - Math.round(Math.abs(stage) * 10));
      });

      images.forEach((img, i) => {
        img.style.opacity = i === activeIdx ? "1" : "0";
      });

      // Stack de títulos overlay sobre la imagen — mismo opacity toggle
      titles.forEach((t, i) => {
        t.style.opacity = i === activeIdx ? "1" : "0";
      });

      const padded = (n: number) => String(n).padStart(2, "0");
      if (counter) counter.textContent = `${padded(activeIdx + 1)} / ${padded(total)}`;
      if (imageCounter) imageCounter.innerHTML = `${padded(activeIdx + 1)}<span class="text-white/40">/${padded(total)}</span>`;
      // Watermark gigante del número activo — refuerza la variación
      if (watermark) watermark.textContent = padded(activeIdx + 1);

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
// 4.6) SCROLL SPY — resalta el link del nav según la sección visible.
//      IntersectionObserver con rootMargin que solo dispara cuando la
//      section está en el 20% central del viewport. Aplica data-active
//      al link correspondiente; CSS hace el resto.
// ─────────────────────────────────────────────────────────────────
if (!reduce) {
  const navLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('#site-nav a.nav-link[href^="#"]'),
  );
  const sectionMap = new Map<string, HTMLAnchorElement>();
  navLinks.forEach((a) => {
    const id = a.getAttribute("href") || "";
    sectionMap.set(id.slice(1), a);
  });

  const sections = Array.from(sectionMap.keys())
    .map((id) => document.getElementById(id))
    .filter(Boolean) as HTMLElement[];

  if (sections.length) {
    const setActive = (id: string | null) => {
      navLinks.forEach((a) => {
        const myId = a.getAttribute("href")?.slice(1);
        a.dataset.active = myId === id ? "true" : "false";
      });
    };

    const spyObs = new IntersectionObserver(
      (entries) => {
        // Tomar la entrada visible con más intersection ratio.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      {
        // Banda central del viewport (~20% alto) — solo activa cuando la
        // sección está realmente "en foco" del usuario.
        rootMargin: "-40% 0px -40% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    sections.forEach((s) => spyObs.observe(s));
  }
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
