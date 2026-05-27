import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { introDestinations, brand } from "../../data/site";

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
};

// CDN endpoint with CORS open for world topology.
// 110m is light enough that three-globe processes it fast (50m made the GPU stall).
const COUNTRIES_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const TOPOJSON_URL =
  "https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js";

declare global {
  interface Window {
    topojson: any;
  }
}

async function loadTopojson(): Promise<any> {
  if (typeof window === "undefined") return null;
  if (window.topojson) return window.topojson;
  await new Promise<void>((res, rej) => {
    const s = document.createElement("script");
    s.src = TOPOJSON_URL;
    s.onload = () => res();
    s.onerror = () => rej(new Error("topojson-client failed"));
    document.head.appendChild(s);
  });
  return window.topojson;
}

export default function Intro3D() {
  const containerRef = useRef<HTMLDivElement>(null);
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
  const [status, setStatus] = useState<string>("Initializing");

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

  // Three.js scene setup
  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    let raf = 0;
    let disposed = false;
    let arcInterval: ReturnType<typeof setInterval> | null = null;
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let globe: ThreeGlobe;

    const w = container.clientWidth;
    const h = container.clientHeight;

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    // Cap pixel ratio at 1.5 — HiDPI 2x doubles pixel count for negligible gain at this scale.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
    camera.position.z = 260;

    // ─────────────────────────────────────────────────────────────
    // POST-PROCESSING: UnrealBloomPass para que las arcs brillen REAL.
    // Sin esto, "ancho" no es "luminoso". Bloom hace glow real en
    // píxeles brillantes (las arcs color teal-300 > threshold).
    // ─────────────────────────────────────────────────────────────
    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    composer.setSize(w, h);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      0.85, // strength — intensidad del glow
      0.55, // radius — qué tan lejos se difumina
      0.18, // threshold — qué tan brillante debe ser un píxel para "glowear"
    );
    composer.addPass(bloomPass);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.45);
    dir.position.set(120, 80, 200);
    scene.add(dir);

    // Globe shell — FULLY opaque so arcs going around the back of the globe
    // are properly hidden by depth testing (this was causing 'lines on the sea'
    // — they were actually arcs visible through the semi-transparent sphere).
    globe = new ThreeGlobe()
      .showAtmosphere(true)
      // Atmósfera teal más intensa y alta — sirve como "glow" ambiental para
      // que las arcs parezcan luminosas reflejándose en la atmósfera.
      .atmosphereColor(COLORS.teal300)
      .atmosphereAltitude(0.28)
      .showGlobe(true)
      .globeMaterial(
        new THREE.MeshPhongMaterial({
          color: new THREE.Color("#0d1626"),
          emissive: new THREE.Color("#0a1422"),
          emissiveIntensity: 0.4,
          shininess: 6,
        }),
      );

    // Punto luz teal extra cerca de Colombia para reforzar el glow de las arcs
    const tealGlow = new THREE.PointLight(0x5fb3b3, 1.8, 600, 1.8);
    tealGlow.position.set(0, 0, 200);
    scene.add(tealGlow);

    scene.add(globe);

    // Load countries
    let countryFeatures: any[] = [];
    let colombiaFeature: any = null;

    const setupCountries = async () => {
      try {
        setStatus("Loading topojson");
        const topojson = await loadTopojson();
        setStatus("Loading world map");
        const res = await fetch(COUNTRIES_URL);
        if (!res.ok) throw new Error("countries fetch failed " + res.status);
        const world = await res.json();
        const fc = topojson.feature(world, world.objects.countries);
        countryFeatures = fc.features;
        // Colombia ISO numeric 170
        colombiaFeature = countryFeatures.find((f: any) => f.id === "170");
        setStatus(`Loaded ${countryFeatures.length} countries · Colombia ${colombiaFeature ? "✓" : "✗"}`);
        if (disposed) return;
        // Render polygons — estado INICIAL neutral: Colombia se ve igual al
        // resto del mundo. Esto deja una "pausa visual" donde se ve el
        // planeta entero antes de que se resalte Colombia.
        globe
          .polygonsData(countryFeatures)
          .polygonAltitude(() => 0.008)
          .polygonCapColor(() => "rgba(143,160,196,0.32)")
          .polygonSideColor(() => "rgba(45,138,138,0)")
          .polygonStrokeColor(() => "rgba(255,255,255,0.55)");
        setPhase("globe");

        // ─────────────────────────────────────────────────────────────────
        // Timeline OPTIMIZADO (M aparece RÁPIDO tras las arcs):
        //   0.00s  globe aparece (mundo neutral, sin destacar Colombia)
        //   0.90s  highlight: Colombia se ilumina (cap teal + stroke + altitud)
        //   1.80s  routes: empiezan a salir las líneas neon
        //   3.30s  arcs done (último 450+27*40=1530ms, ~80% completas)
        //   3.30s  lockup-big: M gigante aparece JUSTO cuando las arcs terminan
        //                     (era 3.80s — quitado el gap muerto de 500ms)
        //   4.40s  lockup-pair: M se reduce + wordmark entra
        //   5.50s  matchmove: el lockup vuela a la esquina del nav
        //   6.50s  finish: removemos la intro y desbloqueamos scroll
        // ─────────────────────────────────────────────────────────────────

        // Función que aplica el "highlight" a Colombia — cambio visible que
        // el usuario percibe como "ahora me están mostrando MI país".
        const applyColombiaHighlight = () => {
          if (disposed) return;
          globe
            .polygonAltitude((f: any) => (f === colombiaFeature ? 0.022 : 0.008))
            .polygonCapColor((f: any) =>
              f === colombiaFeature
                ? "rgba(45,138,138,0.95)"
                : "rgba(143,160,196,0.32)",
            )
            .polygonStrokeColor((f: any) =>
              f === colombiaFeature ? "#5fb3b3" : "rgba(255,255,255,0.55)",
            );
        };

        setTimeout(() => {
          setPhase("highlight");
          applyColombiaHighlight();
        }, 900);
        setTimeout(() => {
          setPhase("routes");
          startArcAccumulation();
        }, 1800);
        setTimeout(() => setPhase("lockup-big"), 3300);  // M aparece RÁPIDO tras arcs
        setTimeout(() => setPhase("lockup-pair"), 4400);
        setTimeout(() => setPhase("matchmove"), 5500);
        setTimeout(finish, 6500);
      } catch (err) {
        console.warn("[intro] countries failed, falling back", err);
        // Fallback: skip straight to lockup sin status text
        setTimeout(() => {
          setPhase("lockup-pair");
          setTimeout(finish, 600);
        }, 800);
      }
    };

    // Pre-build all arcs with per-arc altitude (random per destination so they
    // don't all overlap) and a STAGGERED draw-in duration. All arcs start
    // animating at the same time, but the first ones complete fast (~700ms) and
    // the later ones take longer (~2.2s) → continuous, accumulating feel without
    // ever destroying & recreating meshes.
    const allArcs = introDestinations.map((dst, i) => {
      const from =
        dst.from === "apartado"
          ? brand.origin
          : dst.from === "santamarta"
            ? brand.secondaryOrigin
            : { lat: 4.5, lng: -74 };
      // Great-circle-ish distance (just angular degrees, good enough to scale altitude).
      const dLat = dst.lat - from.lat;
      const dLng = dst.lng - from.lng;
      const angDist = Math.sqrt(dLat * dLat + dLng * dLng);
      const altitude = Math.min(0.06 + angDist / 380, 0.22);
      return {
        startLat: from.lat,
        startLng: from.lng,
        endLat: dst.lat,
        endLng: dst.lng,
        color: COLORS.teal300,
        altitude,
        // Stagger más rápido (450..1490ms vs 700..2860ms anterior) — sin tiempo muerto
        animTime: 450 + i * 40,
      };
    });

    const startArcAccumulation = () => {
      if (disposed) return;
      // Líneas LUMINOSAS reales — stroke DELGADO (0.55) pero con
      // UnrealBloomPass aplicado en post-processing. El bloom hace que
      // el color teal-300 (#5fb3b3) emita luz visible alrededor del trazo.
      // NO subir el stroke — el glow viene del bloom, no del grosor.
      globe
        .arcColor("color")
        .arcStroke(0.32) // más delgado — Jon pidió líneas más finas con más cantidad
        .arcAltitude("altitude")
        .arcDashLength(1)
        .arcDashGap(0)
        .arcDashInitialGap(1)
        .arcDashAnimateTime("animTime")
        .arcsTransitionDuration(0)
        .arcsData(allArcs);

      // Destination dots in one shot too — same staggered fade idea via opacity tween
      // would require a custom shader; for now we just show them all with a small radius.
      const points = allArcs.map((a) => ({
        lat: a.endLat,
        lng: a.endLng,
        color: COLORS.teal,
      }));
      globe
        .pointsData(points)
        .pointColor("color")
        .pointAltitude(0.03) // hover above surface, but small enough to not be a 'sun' over the country
        .pointRadius(0.55)
        .pointResolution(6) // 6 instead of 10 — same visual at this scale, far less geometry
        .pointsMerge(true); // merge all into one mesh — single draw call, big perf win

      // (Debug labels removed — root cause was sphere transparency, not coords)
    };

    setupCountries();

    // Colombia centered from the start (lng -74). Drift super slow — Colombia barely moves.
    const colombiaLng = -74;
    const baseRotY = THREE.MathUtils.degToRad(-colombiaLng); // +74°
    globe.rotation.y = baseRotY;
    globe.rotation.x = THREE.MathUtils.degToRad(-8);

    // three-globe handles its own internal animations via d3-timer; we just keep
    // rendering each frame and update the globe rotation.
    const startTime = performance.now();
    const animate = (now: number) => {
      if (disposed) return;
      const elapsed = now - startTime;
      // Very slow westward drift — at this rate Colombia stays in frame for 30+ seconds.
      const driftDelta = elapsed * 0.00003; // ~1.7°/s
      globe.rotation.y = baseRotY + driftDelta;
      // Subtle breathing tilt
      const breath = Math.sin(elapsed * 0.0005) * 0.012;
      globe.rotation.x = THREE.MathUtils.degToRad(-8) + breath;
      // Usar composer en vez de renderer directo → aplica el UnrealBloomPass.
      composer.render();
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    // Resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloomPass.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      if (arcInterval) clearInterval(arcInterval);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      renderer.domElement.remove();
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
      {/* Globe canvas container — el canvas WebGL es rectangular y al hacer
          scale-down se ve EL RECTÁNGULO como un cuadro distinto del bg navy.
          Fix: aplicar mask-image radial → el canvas SIEMPRE se ve circular,
          sus bordes rectangulares quedan enmascarados (invisibles).
          Estado base: mask muy amplio (90%→100%) → solo enmascara las esquinas
          del rectángulo, no afecta visualmente al globo + atmosfera.
          Estado lockup: mask se contrae (40%→70%) acompañando el scale-down,
          el globo encoge dentro de un círculo que también encoge.
          Sin transform scale: el scale lo hace el propio mask radial. */}
      <div
        ref={containerRef}
        className="absolute inset-0 transition-[opacity,mask-image,-webkit-mask-image] duration-[1400ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{
          opacity:
            phase === "lockup-big" || phase === "lockup-pair" || phase === "matchmove"
              ? 0
              : 1,
          maskImage:
            phase === "lockup-big" || phase === "lockup-pair" || phase === "matchmove"
              ? "radial-gradient(circle at center, black 25%, transparent 55%)"
              : "radial-gradient(circle at center, black 80%, transparent 100%)",
          WebkitMaskImage:
            phase === "lockup-big" || phase === "lockup-pair" || phase === "matchmove"
              ? "radial-gradient(circle at center, black 25%, transparent 55%)"
              : "radial-gradient(circle at center, black 80%, transparent 100%)",
        }}
      />

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
              // Color de las rayas: arranca en teal-300 (mismo color de las
              // arcs) y se vuelve blanco a los 700ms del lockup-big.
              color: linesWhite ? "#ffffff" : COLORS.teal300,
              filter:
                phase === "lockup-big"
                  ? linesWhite
                    ? "drop-shadow(0 0 60px rgba(45,138,138,0.7))"
                    : "drop-shadow(0 0 80px rgba(95,179,179,0.85))"
                  : "drop-shadow(0 0 30px rgba(45,138,138,0.45))",
              willChange: "height, opacity, filter, color",
              // Force GPU layer — ayuda con el rasterizado de los paths
              // grandes (60vh) que se veían pixelados a veces.
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
          {/* Wordmark "movex" — usa el SVG oficial del logo (paths de la
              fuente Neurial Grotesk del manual de marca), NO texto HTML
              con Saira Variable. Fidelidad 100% al logo oficial. */}
          <img
            src="/brand/movex-wordmark-white.svg"
            alt="movex"
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
              filter: "drop-shadow(0 0 30px rgba(45,138,138,0.35))",
            }}
          />
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
