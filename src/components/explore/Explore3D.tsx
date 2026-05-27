import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// ─────────────────────────────────────────────────────────────────────────────
// Movex Explore 3D — propuesta scroll-driven (variación del index)
// Vanilla three.js (mismo patrón que Intro3D).
// El scroll del documento controla la cámara: aérea → zoom contenedor → buque
// → vista wide. Las secciones HTML viven encima del canvas (z-10) y tienen
// pointer-events: none salvo donde explícitamente las queremos clickeables.
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = {
  navy: "#0d1626",
  navyMid: "#1a2940",
  teal: "#2d8a8a",
  teal300: "#5fb3b3",
  sage: "#a8c4a0",
  white: "#fafbfc",
  sunset: "#d9905a",
};

// Paleta de contenedores realista (Movex destaca por contraste).
const CONTAINER_COLORS = [
  { color: "#b13d3d", brand: "" }, // rojo MAERSK-ish
  { color: "#3a5a7c", brand: "" }, // azul medio
  { color: "#7c5b3a", brand: "" }, // rust
  { color: "#3a7c5a", brand: "" }, // verde
  { color: "#7c5a3a", brand: "" }, // marrón
  { color: "#5a3a7c", brand: "" }, // púrpura
  { color: "#3a7c7c", brand: "" }, // teal oscuro
  { color: "#b8a14d", brand: "" }, // mostaza
];

/** Easing helper for smooth keyframe interpolation. */
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Linear interpolation. */
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Crea textura procedural de un lado de contenedor con corrugaciones + brand opcional. */
function createContainerTexture(color: string, brand?: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  // Base
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1024, 256);
  // Sombreado por desgaste (gradiente sutil)
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "rgba(255,255,255,0.05)");
  grad.addColorStop(0.5, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.18)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 256);
  // Corrugaciones verticales — alternar claro/oscuro
  for (let x = 0; x < 1024; x += 16) {
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(x, 0, 1, 256);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fillRect(x + 8, 0, 1, 256);
  }
  // Rieles superior/inferior
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(0, 0, 1024, 16);
  ctx.fillRect(0, 240, 1024, 16);
  // Tornillos
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  for (let x = 32; x < 1024; x += 96) {
    ctx.beginPath();
    ctx.arc(x, 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, 248, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Brand text
  if (brand) {
    ctx.fillStyle = "rgba(255,255,255,0.94)";
    ctx.font = "bold 128px 'Archivo', 'Inter', sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(brand.toLowerCase(), 60, 132);
    // Mini codigo abajo derecha
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "20px 'JetBrains Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText("MVXU 250624", 990, 220);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/** Crea un contenedor 12L x 2.6H x 2.4W. */
function makeContainer(color: string, brand?: string) {
  const sideTex = createContainerTexture(color, brand);
  const endTex = createContainerTexture(color);
  const geo = new THREE.BoxGeometry(12, 2.6, 2.4);
  const sideMat = new THREE.MeshStandardMaterial({
    map: sideTex,
    roughness: 0.7,
    metalness: 0.2,
  });
  const endMat = new THREE.MeshStandardMaterial({
    map: endTex,
    roughness: 0.7,
    metalness: 0.2,
  });
  const topMat = new THREE.MeshStandardMaterial({
    color: "#3a3a3a",
    roughness: 0.85,
    metalness: 0.15,
  });
  const botMat = new THREE.MeshStandardMaterial({
    color: "#1a1a1a",
    roughness: 0.9,
  });
  const mesh = new THREE.Mesh(geo, [endMat, endMat, topMat, botMat, sideMat, sideMat]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Grúa STS pórtico procedural. */
function makeCrane() {
  const group = new THREE.Group();
  const steelMat = new THREE.MeshStandardMaterial({
    color: "#c98a3a",
    roughness: 0.6,
    metalness: 0.4,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: "#1a1a1a",
    roughness: 0.8,
  });
  // 4 patas
  for (const [x, z] of [
    [-9, -6],
    [9, -6],
    [-9, 6],
    [9, 6],
  ]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(1.5, 38, 1.5), steelMat);
    leg.position.set(x, 19, z);
    leg.castShadow = true;
    group.add(leg);
  }
  // Vigas transversales (top)
  const topBeamH = new THREE.Mesh(new THREE.BoxGeometry(20, 1.8, 1.5), steelMat);
  topBeamH.position.set(0, 38, -6);
  group.add(topBeamH);
  const topBeamH2 = topBeamH.clone();
  topBeamH2.position.set(0, 38, 6);
  group.add(topBeamH2);
  // Cantilever (sale hacia el mar)
  const cantilever = new THREE.Mesh(new THREE.BoxGeometry(38, 1.6, 14), steelMat);
  cantilever.position.set(-12, 40, 0);
  cantilever.castShadow = true;
  group.add(cantilever);
  // Contrapeso (sale hacia tierra)
  const counter = new THREE.Mesh(new THREE.BoxGeometry(14, 1.6, 12), steelMat);
  counter.position.set(16, 40, 0);
  group.add(counter);
  // Cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3, 3.5), darkMat);
  cabin.position.set(-4, 36, 0);
  group.add(cabin);
  // Spreader colgando
  const spreader = new THREE.Mesh(new THREE.BoxGeometry(13, 0.5, 3), darkMat);
  spreader.position.set(-22, 20, 0);
  group.add(spreader);
  // Cables del spreader
  const cableMat = new THREE.LineBasicMaterial({ color: "#222" });
  for (const [dx, dz] of [
    [-6, -1.2],
    [6, -1.2],
    [-6, 1.2],
    [6, 1.2],
  ]) {
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-22 + dx, 20, dz),
      new THREE.Vector3(-22 + dx, 39.5, dz),
    ]);
    group.add(new THREE.Line(g, cableMat));
  }
  return group;
}

/** Buque portacontenedores procedural muy simplificado. */
function makeShip() {
  const group = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({
    color: "#1f2a3a",
    roughness: 0.65,
    metalness: 0.3,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: "#b13d3d",
    roughness: 0.6,
  });
  // Casco
  const hull = new THREE.Mesh(new THREE.BoxGeometry(80, 6, 14), hullMat);
  hull.position.y = 3;
  hull.castShadow = true;
  hull.receiveShadow = true;
  group.add(hull);
  // Banda roja waterline
  const band = new THREE.Mesh(new THREE.BoxGeometry(80.2, 0.8, 14.2), accentMat);
  band.position.y = 1.5;
  group.add(band);
  // Puente de mando (popa)
  const bridge = new THREE.Mesh(
    new THREE.BoxGeometry(8, 10, 12),
    new THREE.MeshStandardMaterial({ color: "#f0f0f0", roughness: 0.55 }),
  );
  bridge.position.set(30, 11, 0);
  bridge.castShadow = true;
  group.add(bridge);
  // Chimenea
  const stack = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.6, 5, 12),
    new THREE.MeshStandardMaterial({ color: "#b13d3d" }),
  );
  stack.position.set(32, 18, 0);
  group.add(stack);
  // Stack de contenedores sobre el deck
  const seedColors = CONTAINER_COLORS.slice(0, 6);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      for (let stk = 0; stk < 2; stk++) {
        const c = seedColors[(row + col + stk) % seedColors.length];
        const cont = makeContainer(c.color);
        cont.position.set(-25 + col * 12.5, 7.5 + stk * 2.8, -3.6 + row * 3.6);
        group.add(cont);
      }
    }
  }
  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// KEYFRAMES de cámara — el scroll progress (0..1) interpola entre ellos.
// Cada keyframe: { t: 0..1, pos: [x,y,z], lookAt: [x,y,z], fov: number }
// La narrativa: 0 aérea → 0.3 patio → 0.5 contenedor héroe Movex →
// 0.7 vista buque → 1.0 aérea wide.
// ─────────────────────────────────────────────────────────────────────────────
type Kf = { t: number; pos: [number, number, number]; look: [number, number, number]; fov: number };

const KEYFRAMES: Kf[] = [
  // Aérea drone, mirando el puerto desde el sur, alto
  { t: 0.0, pos: [40, 80, 90], look: [0, 5, 0], fov: 55 },
  // Descenso, entrando al puerto
  { t: 0.18, pos: [20, 30, 50], look: [0, 5, 0], fov: 50 },
  // Nivel patio, lateral del stack de contenedores
  { t: 0.32, pos: [10, 6, 24], look: [0, 4, 0], fov: 45 },
  // Aproximación al contenedor héroe Movex (en x=0,y=4,z=0)
  { t: 0.48, pos: [2, 3.5, 9], look: [0, 3.5, 0], fov: 40 },
  // Frontal del contenedor héroe — texto Movex bien visible
  { t: 0.6, pos: [0, 3, 7.5], look: [0, 3, 0], fov: 35 },
  // Vuelta — vista hacia el buque
  { t: 0.78, pos: [-15, 14, -20], look: [-30, 8, -25], fov: 50 },
  // Retirada aérea wide
  { t: 1.0, pos: [-60, 60, -80], look: [-10, 6, -20], fov: 60 },
];

/** Encuentra los 2 keyframes que enmarcan el progress actual e interpola. */
function sampleCamera(progress: number) {
  let i = 0;
  while (i < KEYFRAMES.length - 1 && KEYFRAMES[i + 1].t < progress) i++;
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[Math.min(i + 1, KEYFRAMES.length - 1)];
  const span = b.t - a.t || 1;
  const localT = easeInOut(Math.max(0, Math.min(1, (progress - a.t) / span)));
  return {
    pos: [
      lerp(a.pos[0], b.pos[0], localT),
      lerp(a.pos[1], b.pos[1], localT),
      lerp(a.pos[2], b.pos[2], localT),
    ] as [number, number, number],
    look: [
      lerp(a.look[0], b.look[0], localT),
      lerp(a.look[1], b.look[1], localT),
      lerp(a.look[2], b.look[2], localT),
    ] as [number, number, number],
    fov: lerp(a.fov, b.fov, localT),
  };
}

export default function Explore3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(w, h);
    renderer.setClearColor(0x0d1626, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x14223a, 60, 280);
    scene.background = new THREE.Color(0x14223a);

    // Camera
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 1000);
    camera.position.set(...KEYFRAMES[0].pos);
    camera.lookAt(...KEYFRAMES[0].look);

    // ── Post-processing (bloom para neon teal accents)
    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    composer.setSize(w, h);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.6, 0.6, 0.55);
    composer.addPass(bloomPass);

    // ── Lighting: atardecer cálido + ambient frío para contrastes
    const ambient = new THREE.AmbientLight(0x6080a0, 0.4);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffcc99, 1.4);
    sun.position.set(60, 80, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -80;
    sun.shadow.camera.right = 80;
    sun.shadow.camera.top = 80;
    sun.shadow.camera.bottom = -80;
    sun.shadow.camera.far = 200;
    scene.add(sun);

    const tealRim = new THREE.PointLight(0x5fb3b3, 2.0, 80, 1.5);
    tealRim.position.set(0, 8, 12);
    scene.add(tealRim);

    // ── Suelo del patio (concreto)
    const groundGeo = new THREE.PlaneGeometry(400, 400, 1, 1);
    const groundMat = new THREE.MeshStandardMaterial({
      color: "#3a3530",
      roughness: 0.95,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // ── Agua (zona del buque, al norte/lejos)
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 200),
      new THREE.MeshStandardMaterial({
        color: "#0e2030",
        roughness: 0.3,
        metalness: 0.6,
        emissive: "#0a1a26",
        emissiveIntensity: 0.3,
      }),
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.05, -120);
    scene.add(water);

    // ── Stack de contenedores en el patio (filas a izquierda y derecha)
    // El centro (x=0, z=0) queda libre para el contenedor héroe Movex.
    const containersGroup = new THREE.Group();
    scene.add(containersGroup);

    // Filas izquierda y derecha del patio
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        for (let stk = 0; stk < 3; stk++) {
          const c = CONTAINER_COLORS[(row * 3 + col + stk) % CONTAINER_COLORS.length];
          const cont = makeContainer(c.color);
          // Lado izquierdo
          cont.position.set(
            -22 - row * 13,
            1.3 + stk * 2.8,
            -12 + col * 4,
          );
          cont.rotation.y = 0;
          containersGroup.add(cont);
          // Lado derecho — espejo
          const cont2 = makeContainer(c.color);
          cont2.position.set(
            22 + row * 13,
            1.3 + stk * 2.8,
            -12 + col * 4,
          );
          containersGroup.add(cont2);
        }
      }
    }
    // Algunos atrás (fila lejana)
    for (let i = 0; i < 8; i++) {
      const c = CONTAINER_COLORS[i % CONTAINER_COLORS.length];
      const cont = makeContainer(c.color);
      cont.position.set(-50 + i * 14, 1.3, -50);
      containersGroup.add(cont);
      if (i % 2 === 0) {
        const cont2 = makeContainer(c.color);
        cont2.position.set(-50 + i * 14, 4.1, -50);
        containersGroup.add(cont2);
      }
    }

    // ── Contenedor HÉROE Movex — centrado, navy con wordmark grande
    const hero = makeContainer(COLORS.navyMid, "movex");
    hero.position.set(0, 1.3, 0);
    hero.castShadow = true;
    scene.add(hero);

    // Rim teal alrededor del contenedor héroe (borde luminoso sutil)
    const heroRim = new THREE.Mesh(
      new THREE.BoxGeometry(12.15, 2.75, 2.55),
      new THREE.MeshBasicMaterial({
        color: 0x5fb3b3,
        transparent: true,
        opacity: 0.06,
        side: THREE.BackSide,
      }),
    );
    heroRim.position.copy(hero.position);
    scene.add(heroRim);

    // ── Grúa STS (un par, hacia el agua)
    const crane1 = makeCrane();
    crane1.position.set(-15, 0, -60);
    scene.add(crane1);
    const crane2 = makeCrane();
    crane2.position.set(20, 0, -65);
    scene.add(crane2);

    // ── Buque al fondo, en el agua
    const ship = makeShip();
    ship.position.set(-25, 0, -110);
    ship.rotation.y = 0.1;
    scene.add(ship);

    // ── Pequeñas luces neon teal flotando (data points alrededor del héroe)
    // Servirán para la fase "logística digital" cuando el scroll se acerque.
    const dataPoints = new THREE.Group();
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const r = 4 + Math.random() * 2;
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x5fb3b3 }),
      );
      dot.position.set(
        Math.cos(angle) * r,
        2 + Math.sin(i * 1.7) * 2,
        Math.sin(angle) * r,
      );
      dataPoints.add(dot);
    }
    dataPoints.position.copy(hero.position);
    scene.add(dataPoints);

    // ── Scroll progress: leemos directamente desde el RAF (no depende de
    // scroll events, que en algunos headless browsers no disparan con scroll
    // programático). `document.scrollingElement` apunta al elemento que
    // realmente scrollea — funciona ya sea html, body o cualquier wrapper.
    const readScrollProgress = () => {
      const el = document.scrollingElement || document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const top = el.scrollTop;
      return max > 0 ? Math.min(1, Math.max(0, top / max)) : 0;
    };

    // ── Resize
    const onResize = () => {
      if (!container) return;
      const W = container.clientWidth;
      const H = container.clientHeight;
      renderer.setSize(W, H);
      composer.setSize(W, H);
      bloomPass.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // ── Animation loop
    // Usamos setInterval a ~60fps en lugar de requestAnimationFrame porque
    // algunos entornos headless (preview tooling, screenshot capture) no
    // disparan el callback de RAF. setInterval es bulletproof en todos los
    // entornos. Costo en browser real despreciable (16ms = 60fps target).
    let disposed = false;
    let frameCount = 0;
    const startTime = performance.now();

    const animate = (now: number) => {
      if (disposed) return;
      const elapsed = (now - startTime) / 1000;

      // Read scroll progress each frame (no event listener needed)
      const p = readScrollProgress();
      progressRef.current = p;
      // Throttle React HUD updates to ~12fps (no need for 60fps on a percentage label)
      if (frameCount++ % 5 === 0) setProgress(p);

      // Camera follows scroll progress through keyframes
      const sample = sampleCamera(p);
      camera.position.set(...sample.pos);
      camera.lookAt(...sample.look);
      if (Math.abs(camera.fov - sample.fov) > 0.01) {
        camera.fov = sample.fov;
        camera.updateProjectionMatrix();
      }

      // Data points pulsing alrededor del héroe — solo visibles cerca
      const heroVisibility = Math.max(
        0,
        1 - Math.abs(progressRef.current - 0.55) * 4,
      );
      dataPoints.children.forEach((dot, i) => {
        const m = dot as THREE.Mesh;
        const mat = m.material as THREE.MeshBasicMaterial;
        mat.opacity = heroVisibility * (0.5 + 0.5 * Math.sin(elapsed * 2 + i));
        mat.transparent = true;
        m.position.y = 2 + Math.sin(elapsed + i * 0.5) * 1.5;
      });
      dataPoints.rotation.y = elapsed * 0.15;

      // Buque drift horizontal sutil (parece navegando)
      ship.position.x = -25 + Math.sin(elapsed * 0.05) * 4;

      composer.render();
    };
    const ticker = setInterval(() => {
      if (disposed) return;
      animate(performance.now());
    }, 16);

    return () => {
      disposed = true;
      clearInterval(ticker);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <>
      {/* Canvas WebGL — fixed background detrás del contenido */}
      <div
        ref={containerRef}
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none"
      />
      {/* Indicador de progreso de scroll (esquina) */}
      <div className="fixed bottom-6 right-6 z-30 flex items-center gap-3 pointer-events-none">
        <span className="font-mono text-[10px] tracking-[0.25em] text-white/60">
          {String(Math.round(progress * 100)).padStart(3, "0")}%
        </span>
        <div className="relative w-20 h-px bg-white/15 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-teal-300"
            style={{
              width: `${progress * 100}%`,
              boxShadow: "0 0 12px rgba(95,179,179,0.7)",
            }}
          />
        </div>
      </div>
    </>
  );
}
