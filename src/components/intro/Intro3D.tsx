import { useEffect, useRef, useState } from "react";
// three.js / ThreeGlobe imports removidos — el globo se quitó del intro.
// Si en el futuro se quiere reactivar, ver git history del commit "Quitar globo del intro".

type Phase =
  | "boot"
  | "globe"
  | "highlight"
  | "routes"
  | "lockup-big"
  | "lockup-pair"
  | "matchmove"
  | "done";

const STORAGE_KEY = "mvx_intro_v6";

const COLORS = {
  navy: "#1a2940",
  navy500: "#5a6a8a",
  teal: "#2d8a8a",
  teal300: "#5fb3b3",
  sage: "#a8c4a0",
  white: "#fafbfc",
  arcBlue: "#2c5fc4", // Azul navy futurista para las arcs (antes teal300)
};


export default function Intro3D() {
  const lockupRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("boot");
  // Color de las 3 rayas del isotipo — empieza teal (como las arcs) y
  // pasa a blanco tras un delay para dar la sensación de "energía
  // canalizándose en el logo".
  const [linesWhite, setLinesWhite] = useState(false);
  // Early-skip si ya se vio la intro o el usuario prefiere reduced motion.
  // Esto evita inicializar three.js / WebGL — ahorra ~700KB de CPU/GPU en
  // re-cargas y permite que el resto del page (Lenis, SplitText) no se congele.
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const seen = sessionStorage.getItem(STORAGE_KEY);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return !seen && !reduced;
  });

  // Si arrancó deshabilitado, despachar el evento done de una y desbloquear scroll.
  useEffect(() => {
    if (enabled) return;
    if (typeof window === "undefined") return;
    document.documentElement.classList.remove("intro-locked");
    window.dispatchEvent(new Event("mvx:intro-done"));
  }, [enabled]);

  // Skip resto del efecto si ya estaba deshabilitado.
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (seen) {
      setEnabled(false);
      finish();
      return;
    }
    if (reduced) {
      setPhase("lockup-pair");
      setTimeout(finish, 500);
      return;
    }
  }, [enabled]);

  // Trigger del cambio teal → blanco cuando entran las rayas.
  // Las rayas empiezan a animar en "lockup-big". A ~800ms (cuando ya
  // están casi en su posición final, stagger total = 240ms + 1100ms anim
  // = ~1340ms; metemos el cambio a la mitad para que se vea cómo cambian)
  // se hace el fade a blanco.
  useEffect(() => {
    if (phase === "lockup-big") {
      const t = setTimeout(() => setLinesWhite(true), 700);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Skip handler
  useEffect(() => {
    if (!enabled) return;
    const skip = (e: KeyboardEvent | MouseEvent) => {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      setPhase("lockup-pair");
      setTimeout(() => setPhase("matchmove"), 300);
      setTimeout(finish, 1000);
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("click", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("click", skip);
    };
  }, [enabled]);

  // Timeline simple — SIN globo. Cliente pidió quitar la animación del mundo,
  // arrancar directo con el lockup del logo (M grande → M+wordmark → match-move).
  // Sin three.js, sin canvas, sin arcs: solo el lockup HTML/SVG anima.
  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Arranca inmediato en lockup-big — sin pasar por globe/highlight/routes
    timers.push(setTimeout(() => { if (!disposed) setPhase("lockup-big"); }, 100));
    timers.push(setTimeout(() => { if (!disposed) setPhase("lockup-pair"); }, 1600));
    timers.push(setTimeout(() => { if (!disposed) setPhase("matchmove"); }, 2900));
    timers.push(setTimeout(() => { if (!disposed) finish(); }, 3900));

    return () => {
      disposed = true;
      timers.forEach(clearTimeout);
    };
  }, [enabled]);


  function finish() {
    sessionStorage.setItem(STORAGE_KEY, "1");
    document.documentElement.classList.remove("intro-locked");
    const nav = document.getElementById("site-nav");
    nav?.setAttribute("data-ready", "true");
    nav?.querySelectorAll<HTMLElement>("[data-ready]").forEach((el) => el.setAttribute("data-ready", "true"));
    // Despachar evento global para reanudar Lenis y desbloquear scroll.
    // Sin esto, Lenis queda "stopped" y la página no scrollea aunque ya no
    // se vea la intro.
    window.dispatchEvent(new Event("mvx:intro-done"));
    setPhase("done");
  }

  if (!enabled || phase === "done") return null;

  // Progress 0→1 basado en la phase actual (6.5s total).
  // Tiempos: 0.9 / 1.8 / 3.3 / 4.4 / 5.5 / 6.5
  const progressByPhase: Record<Phase, number> = {
    boot: 0,
    globe: 0.14,        // 0.9s   — mundo aparece
    highlight: 0.28,    // 1.8s   — Colombia se destaca
    routes: 0.51,       // 3.3s   — arcs terminaron
    "lockup-big": 0.68, // 4.4s   — M grande
    "lockup-pair": 0.85,// 5.5s   — M + wordmark
    matchmove: 0.98,    // 6.5s   — match-move al nav
    done: 1,
  };
  const pct = Math.round(progressByPhase[phase] * 100);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-50 bg-navy-900 transition-opacity duration-[800ms] ease-out"
      style={{
        opacity: phase === "matchmove" ? 0 : 1,
        pointerEvents: phase === "matchmove" ? "none" : "auto",
      }}
    >
      {/* (Globe canvas container removido — el cliente quitó la animación del mundo.
           Ahora la intro arranca directo con el lockup del logo.) */}

      {/* Lockup: 3 stages.
          1. lockup-big   — GIANT isotipo M, ~60vh tall, centered, no wordmark yet.
          2. lockup-pair  — isotipo shrinks and slides left, wordmark "movex" slides in to the right.
          3. matchmove    — the whole pair scales down and lands at the nav top-left.

          Trick: we anchor a child wrapper at the lockup center for stages 1/2, then
          flip the wrapper to top-left + a calc()'d translate so the scale collapses
          toward the corner instead of toward the screen center. */}
      {/* Lockup container — easing super-soft (Apple-like cubic-bezier),
          duraciones largas, will-change para que el browser optimice. */}
      <div
        ref={lockupRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          transition: "transform 1300ms cubic-bezier(0.16, 1, 0.3, 1)",
          transformOrigin: phase === "matchmove" ? "0% 50%" : "center",
          transform:
            phase === "matchmove"
              ? "translate(calc(-50vw + 1.5rem), calc(-50vh + 2.4rem)) scale(0.32)"
              : "translate(0, 0) scale(1)",
          willChange: "transform",
        }}
      >
        <div
          className="flex items-center"
          style={{
            gap: phase === "lockup-big" ? "0" : "clamp(0.75rem, 1.5vw, 1.5rem)",
            transition: "gap 900ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Isotipo nuevo de 3 RAYAS (en vez de la M antigua). SVG inline
              para poder animar cada raya individualmente con stagger.
              Cada raya entra desde un eje distinto:
                r-top  → slide desde la izquierda (translateX -120%)
                r-mid  → slide desde la derecha (translateX +120%)
                r-bot  → slide desde la izquierda (translateX -120%)
              Transición 1100ms cubic-bezier(0.16,1,0.3,1) con stagger 120ms. */}
          <svg
            viewBox="0 0 210 170"
            fill="currentColor"
            preserveAspectRatio="xMidYMid meet"
            shape-rendering="geometricPrecision"
            aria-hidden="true"
            style={{
              transition:
                "height 1100ms cubic-bezier(0.16, 1, 0.3, 1), opacity 700ms cubic-bezier(0.32, 0.72, 0, 1), filter 900ms ease-out, color 900ms cubic-bezier(0.32, 0.72, 0, 1)",
              height:
                phase === "lockup-big"
                  ? "60vh"
                  : phase === "lockup-pair" || phase === "matchmove"
                    ? "clamp(5rem, 10vw, 9rem)"
                    : "0vh",
              opacity:
                phase === "lockup-big" ||
                phase === "lockup-pair" ||
                phase === "matchmove"
                  ? 1
                  : 0,
              // Color de las rayas: arranca en arcBlue (mismo color de las arcs
              // del globo) y se vuelve blanco a los 700ms del lockup-big.
              color: linesWhite ? "#ffffff" : COLORS.arcBlue,
              // Sin drop-shadow filter — causaba rasterización del SVG y pixelación
              // cuando el isotipo crecía a 60vh. GPU layer mantiene crisp.
              filter: "none",
              willChange: "height, opacity, color",
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
            }}
          >
            {/* 3 rayas separadas. Cuando phase >= lockup-big, cada una
                desliza desde un lado distinto con stagger 120ms.
                r-top (i=0, desde izq) → r-mid (i=1, desde der) → r-bot (i=2, desde izq) */}
            {(() => {
              const lineVisible =
                phase === "lockup-big" || phase === "lockup-pair" || phase === "matchmove";
              const lineStyle = (i: number, dir: "left" | "right") => ({
                transition:
                  "transform 1100ms cubic-bezier(0.16,1,0.3,1), opacity 700ms cubic-bezier(0.16,1,0.3,1)",
                transitionDelay: `${i * 120}ms`,
                transform: lineVisible
                  ? "translateX(0)"
                  : dir === "left"
                    ? "translateX(-120%)"
                    : "translateX(120%)",
                opacity: lineVisible ? 1 : 0,
                willChange: "transform, opacity",
              });
              return (
                <>
                  <path
                    d="M122.8,31.47c-.68-.4-1.22-.29-1.74-.29-25.29,0-50.57,0-75.86-.01-1.21,0-2.1.4-2.98,1.21-5.04,4.7-9.56,9.9-14.59,14.62-3.78,3.55-7.49,7.2-10.91,11.12-.38.43-1.2.81-1.01,1.31.23.65,1.1.28,1.7.37.1.01.19,0,.29,0,25.33,0,50.67,0,76,.03.98,0,1.63-.32,2.26-1.01,3.33-3.59,6.96-6.89,10.26-10.53,2.63-2.9,5.62-5.48,8.43-8.21,2.81-2.73,5.55-5.53,8.14-8.62Z"
                    style={lineStyle(0, "left")}
                  />
                  <path
                    d="M192.27,70.99c-.04-.13-.09-.26-.13-.39-.8,0-1.61,0-2.41,0-2.13-.03-18.51.03-22.21.03-25.25,0-50.49,0-75.74,0-19.31,0-38.62,0-57.93,0-.73,0-1.43-.04-2.02.56-4.73,4.73-9.44,9.48-14.23,14.14-4.28,4.16-8.21,8.68-12.81,12.52-.41.34-.93.65-1.06,1.42.93,0,1.75,0,2.57,0,45.68,0,91.35,0,137.03.01,6.42,0,12.84,0,19.26-.01.5,0,.99.12,1.47-.36,2.47-2.47,5.02-4.85,7.49-7.32,2.68-2.67,5.21-5.51,7.95-8.09,4.35-4.09,8.37-8.49,12.79-12.5Z"
                    style={lineStyle(1, "right")}
                  />
                  <path
                    d="M35.25,140.28c.74.05,1.22.1,1.69.1,25.68,0,51.35,0,77.03.02.67,0,1.19-.14,1.67-.67,1.49-1.64,3.11-3.16,4.68-4.71,4.07-4.02,8.11-8.09,12.09-12.2,3.06-3.16,6.28-6.2,9.44-9.29.41-.4,1.07-.84.84-1.41-.24-.59-1.04-.36-1.6-.36-25.38,0-50.77,0-76.15-.02-1,0-1.78.28-2.45,1.01-1.78,1.91-3.55,3.85-5.41,5.69-3.51,3.48-7.12,6.88-10.63,10.36-2.85,2.83-5.38,5.96-8.51,8.53-.95.78-1.93,1.6-2.69,2.95Z"
                    style={lineStyle(2, "left")}
                  />
                </>
              );
            })()}
          </svg>
          {/* Wordmark "movex" — SVG INLINE (no <img>) para crisp en cualquier tamaño.
              Antes con <img + drop-shadow> el browser rasterizaba el SVG → pixelación
              al escalar. Inline SVG se renderiza como vector siempre. */}
          <svg
            viewBox="220 25 440 130"
            fill="#ffffff"
            preserveAspectRatio="xMidYMid meet"
            aria-label="movex"
            style={{
              display: "block",
              transition:
                "max-width 1000ms cubic-bezier(0.16, 1, 0.3, 1), opacity 700ms cubic-bezier(0.32, 0.72, 0, 1) 150ms, transform 1000ms cubic-bezier(0.16, 1, 0.3, 1) 100ms, height 1100ms cubic-bezier(0.16,1,0.3,1)",
              height:
                phase === "lockup-pair" || phase === "matchmove"
                  ? "clamp(3rem, 6vw, 5rem)"
                  : "0",
              maxWidth:
                phase === "lockup-pair" || phase === "matchmove" ? "60vw" : "0",
              opacity: phase === "lockup-pair" || phase === "matchmove" ? 1 : 0,
              transform:
                phase === "lockup-pair" || phase === "matchmove"
                  ? "translateX(0)"
                  : "translateX(60px)",
              willChange: "max-width, opacity, transform, height",
              filter: "none",
            }}
          >
            <path d="m282.29,119.63c-1.47-4.2-2.98-8.39-4.41-12.6-2.74-8.07-5.42-16.17-8.18-24.24-1.99-5.84-4.11-11.64-6.08-17.49-2.13-6.3-4.14-12.64-6.24-18.95-1.48-4.46-3.14-8.86-4.5-13.35-.58-1.92-1.44-2.84-3.5-2.81-5.35.07-10.71.1-16.06-.02-2.4-.05-3.26.71-3.24,3.24.13,11.14.06,22.27.06,33.41,0,22.77.02,45.54-.06,68.31,0,2.39.53,3.42,3.11,3.18,2.56-.24,5.17-.26,7.73-.01,2.82.27,3.72-.62,3.71-3.54-.12-26.25-.1-52.5-.12-78.75,0-1.68,0-3.36,0-5.03,2.2,3.74,3.13,7.74,4.52,11.58,2.79,7.7,4.83,15.67,7.64,23.37,3.14,8.63,6.06,17.33,8.91,26.06,2.71,8.3,5.8,16.46,8.6,24.73.41,1.22.97,1.55,2.08,1.55,4.07-.02,8.13,0,12.2-.02.66,0,1.64.16,1.71-.74.16-1.96,1.31-3.5,1.89-5.27,2.02-6.14,3.98-12.31,6.05-18.43,2.08-6.14,4.3-12.23,6.39-18.36,2.28-6.69,4.5-13.39,6.7-20.11,1.43-4.37,2.73-8.79,4.18-13.16,1.26-3.81,2.66-7.57,4-11.35.5,1.82.55,3.59.5,5.35-.63,21.67-.27,43.35-.37,65.02-.02,4.47.11,8.95-.07,13.42-.11,2.71.52,4.02,3.56,3.71,2.75-.28,5.55-.16,8.32-.02,2.02.11,2.48-.71,2.48-2.6-.05-33.91-.07-67.81.01-101.72,0-3-1.29-3.8-3.92-3.76-4.86.07-9.72.15-14.58-.04-2.33-.09-3.02,1-3.61,2.94-1.45,4.69-3.15,9.31-4.69,13.97-2.06,6.24-4.01,12.52-6.1,18.75-1.46,4.36-3.1,8.67-4.63,13.01-1.4,3.97-2.8,7.93-4.15,11.92-1.59,4.71-3.2,9.42-4.66,14.18-1.49,4.86-3.54,9.53-5.19,14.69Z" />
            <path d="m417.26,84.43c-1.25-5.29-3.1-10.13-6.52-14.25-6.62-7.99-14.92-12.62-25.57-12.68-7.02-.04-13.84-.02-20.33,3.53-11.66,6.38-17.06,16.75-19.11,29.22-1.02,6.24-.92,12.58-.16,18.93.75,6.28,2.53,12.21,6.01,17.31,6.96,10.23,16.82,15.32,29.05,14.74,8.46.26,16.14-1.49,22.71-6.46,9.96-7.54,13.56-18.42,15-30.27.82-6.74.52-13.37-1.07-20.07Zm-13.43,19.92c-1.07,5.2-2.07,10.41-4.61,15.16-2.8,5.23-6.91,8.37-12.93,9.23-3.5.51-6.95.44-10.31-.15-5.5-.98-9.53-4.31-12.26-9.18-3.36-6-4.38-12.56-4.49-19.69.32-8.75,1.64-17.64,8.04-24.68,4.73-5.21,10.98-6.5,17.84-5.63,6.95.88,12.63,4.07,15.47,10.38,3.47,7.71,5.02,15.99,3.25,24.56Z" />
            <path d="m458.03,122.22c-1.21-2.94-1.85-5.3-2.61-7.56-3.3-9.85-6.25-19.81-9.46-29.69-2.42-7.45-4.98-14.86-7.59-22.25-.52-1.48-.95-3.3-3.27-3.25-3.57.08-7.14-.04-10.71-.03-1.76,0-2.38.8-2.1,2.65.42,2.77,1.75,5.2,2.65,7.77,2.51,7.21,5.61,14.22,8.02,21.46,2.57,7.72,5.65,15.23,8.36,22.89,2.67,7.55,5.67,14.98,8.4,22.51.38,1.06.82,1.49,1.81,1.49,4.07.02,8.13,0,12.2.03,1.04,0,1.71-.45,2.04-1.39,1.67-4.72,3.48-9.39,5.29-14.06,3.93-10.13,7.42-20.43,11.22-30.61,3.73-10,7.61-19.95,11.48-29.91.62-1.61.7-2.69-1.42-2.72-3.76-.05-7.53-.06-11.29-.11-1.4-.02-1.96,1.03-2.28,2.02-1.22,3.72-2.54,7.4-3.87,11.08-2.86,7.95-5.43,16.01-8.14,24.01-2.8,8.26-5.61,16.51-8.72,25.64Z" />
            <path d="m569.4,92.07c-.83-7.14-2.02-14.25-6.31-20.3-4.73-6.67-11.15-10.65-19.07-12.85-7.78-2.16-15.37-1.7-22.67.85-9.11,3.18-15.52,9.92-19.64,18.57-5.07,10.64-5.57,22.15-3.44,33.36,2.6,13.73,10.24,24.04,24.45,28.01,11.95,3.34,23.25,1.92,33.29-5.65,6.24-4.7,10.47-10.92,11.95-18.84.35-1.86-.34-2.05-1.75-2.06-2.48-.01-5.02.28-7.41-.19-3.1-.62-4.38,1-5.26,3.37-4.68,12.7-21.51,15.92-31.4,9.53-6.96-4.5-8.75-11.93-9.82-19.58-.33-2.33.57-3.1,2.87-3.08,8.62.09,17.25.04,25.87.04v-.04c8.62,0,17.25-.05,25.87.04,1.92.02,2.66-.53,2.56-2.53-.14-2.87.24-5.79-.09-8.64Zm-16.68.27c-6.34-.16-12.69-.06-19.03-.05-6.34,0-12.69-.07-19.03.04-2.06.03-2.54-.62-2.1-2.58,1.51-6.82,4.39-12.7,10.33-16.81,3.41-2.36,7.27-3.1,11.18-3.15,6.77-.09,12.69,2.16,16.67,7.99,2.4,3.52,3.39,7.69,4.38,11.79.45,1.86-.12,2.83-2.4,2.77Z" />
            <path d="m609.49,86.51c-5.56-8.5-11.09-16.88-16.53-25.31-.71-1.09-1.31-1.82-2.73-1.79-4.26.08-8.53-.03-12.79.06-2.62.05-2.98.78-1.51,3.06,1.95,3.04,4,6.01,6.04,8.99,5.61,8.21,11.16,16.46,16.93,24.55.96,1.35,1.02,2.16.21,3.35-8.33,12.17-16.66,24.34-25,36.5-.38.56-1.12,1-.82,1.77.33.84,1.2.53,1.84.54,4.46.04,8.92,0,13.38.05,1.24.01,1.86-.49,2.53-1.56,5.25-8.37,10.64-16.65,15.91-25.01,1.13-1.79,2.17-1.89,3.23-.17,5.22,8.43,10.79,16.64,16.28,24.9.84,1.27,1.61,1.84,3.01,1.83,4.26-.03,8.53-.05,12.79-.05,2.02,0,2.91-.38,1.42-2.52-3.18-4.56-6.18-9.25-9.3-13.85-5.16-7.59-10.35-15.16-15.57-22.72-.59-.86-1.12-1.47-.3-2.57,3.11-4.22,6.13-8.51,9.16-12.79,4.91-6.95,9.82-13.91,14.67-20.91.53-.76,1.14-1.95.89-2.64-.34-.93-1.69-.78-2.67-.78-1.88-.01-3.81.25-5.64-.06-5.22-.86-9.16.6-11.41,5.64-.16.36-.32.72-.53,1.04-4.45,6.77-8.92,13.53-13.48,20.45Z" />
          </svg>
        </div>
      </div>

      {/*
        Barra de progreso "loading" — simula carga de la página.
        Llega a 100% cuando la animación termina (phase=matchmove/done).
        Sustituye los textos laterales (MVX coords + status + Skip) que el
        user pidió eliminar.
      */}
      <div className="absolute bottom-10 inset-x-0 px-6 lg:px-10 transition-opacity duration-500"
           style={{ opacity: phase === "matchmove" ? 0 : 1 }}>
        <div className="mx-auto max-w-3xl flex items-center gap-4">
          {/* Track */}
          <div className="relative flex-1 h-px bg-white/15 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-teal-300 transition-[width] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                width: `${pct}%`,
                boxShadow: "0 0 16px rgba(95,179,179,0.7)",
              }}
            />
          </div>
          {/* Percentage */}
          <span
            className="font-mono text-[10px] tracking-[0.25em] text-white/70 tabular-nums w-12 text-right"
          >
            {String(pct).padStart(3, "0")}%
          </span>
        </div>
      </div>
    </div>
  );
}
