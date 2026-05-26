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
        // Render polygons
        globe
          .polygonsData(countryFeatures)
          .polygonAltitude((f: any) => (f === colombiaFeature ? 0.015 : 0.008))
          .polygonCapColor((f: any) =>
            f === colombiaFeature ? "rgba(45,138,138,0.95)" : "rgba(143,160,196,0.32)",
          )
          .polygonSideColor(() => "rgba(45,138,138,0)")
          .polygonStrokeColor((f: any) =>
            f === colombiaFeature ? "#5fb3b3" : "rgba(255,255,255,0.55)",
          );
        setPhase("globe");
        // Timeline ajustado SIN tiempos muertos — total ~5.4s (era 8s):
        // 0.00s  globe aparece
        // 0.20s  arcs empiezan (era 1.2s — eliminado tiempo muerto entre globo y arcs)
        // 2.20s  arcs done (último arc 450 + 27*40 = 1530ms; conservamos ~200ms margen)
        // 2.20s  M gigante aparece (era 4.8s)
        // 3.20s  M se reduce y wordmark entra
        // 4.30s  matchmove a esquina
        // 5.20s  finish
        setTimeout(() => setPhase("highlight"), 100);
        setTimeout(() => {
          setPhase("routes");
          startArcAccumulation();
        }, 200);
        setTimeout(() => setPhase("lockup-big"), 2200);
        setTimeout(() => setPhase("lockup-pair"), 3200);
        setTimeout(() => setPhase("matchmove"), 4300);
        setTimeout(finish, 5200);
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
        .arcStroke(0.55)
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

  // Progress 0→1 basado en la phase actual (5.2s total).
  // El JSX usa esto para llenar la barra de carga de 0 a 100%.
  const progressByPhase: Record<Phase, number> = {
    boot: 0,
    globe: 0.08,
    highlight: 0.12,
    routes: 0.45,
    "lockup-big": 0.72,
    "lockup-pair": 0.88,
    matchmove: 0.98,
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
      {/* Globe canvas container — fades out when the GIANT M takes over */}
      <div
        ref={containerRef}
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity:
            phase === "lockup-big" || phase === "lockup-pair" || phase === "matchmove"
              ? 0
              : 1,
        }}
      />

      {/* Lockup: 3 stages.
          1. lockup-big   — GIANT isotipo M, ~60vh tall, centered, no wordmark yet.
          2. lockup-pair  — isotipo shrinks and slides left, wordmark "movex" slides in to the right.
          3. matchmove    — the whole pair scales down and lands at the nav top-left.

          Trick: we anchor a child wrapper at the lockup center for stages 1/2, then
          flip the wrapper to top-left + a calc()'d translate so the scale collapses
          toward the corner instead of toward the screen center. */}
      <div
        ref={lockupRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-[1000ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={{
          transformOrigin: phase === "matchmove" ? "0% 50%" : "center",
          transform:
            phase === "matchmove"
              ? "translate(calc(-50vw + 1.5rem), calc(-50vh + 2.4rem)) scale(0.32)"
              : "translate(0, 0) scale(1)",
        }}
      >
        <div className="flex items-center" style={{ gap: phase === "lockup-big" ? "0" : "clamp(0.75rem, 1.5vw, 1.5rem)" }}>
          <img
            src="/brand/movex-isotipo-white.svg"
            alt=""
            className="transition-all duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
            style={{
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
              filter: "drop-shadow(0 0 40px rgba(45,138,138,0.55))",
            }}
          />
          <span
            className="text-white leading-[0.95] transition-all duration-700 ease-out whitespace-nowrap overflow-hidden"
            style={{
              fontFamily: '"Saira Variable", system-ui, sans-serif',
              fontVariationSettings: '"wght" 400, "wdth" 125',
              letterSpacing: "-0.01em",
              fontSize: "clamp(3.5rem, 8vw, 7rem)",
              maxWidth:
                phase === "lockup-pair" || phase === "matchmove" ? "60vw" : "0",
              opacity: phase === "lockup-pair" || phase === "matchmove" ? 1 : 0,
              transform:
                phase === "lockup-pair" || phase === "matchmove"
                  ? "translateX(0)"
                  : "translateX(40px)",
            }}
          >
            movex
          </span>
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
