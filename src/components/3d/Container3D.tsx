import { useEffect, useRef } from "react";
import * as THREE from "three";
import { makeContainerMesh } from "./containerFactory";

// ─────────────────────────────────────────────────────────────────────────────
// Container3D — contenedor Movex 3D reusable como "objeto decorativo".
//
// Variantes:
//   - "hero":    chiquito, auto-rotate suave, mouse parallax (tilt).
//   - "digital": grande, halo teal, data points orbitando, scroll subtle.
//
// Convención: el componente OCUPA su contenedor padre. Hacer el wrapper con
// el tamaño deseado (ej. <div class="w-[420px] h-[280px]"><Container3D ... /></div>)
// ─────────────────────────────────────────────────────────────────────────────

type Variant = "hero" | "digital";

interface Props {
  variant: Variant;
  /** Si true, agrega data points pulsantes orbitando (solo digital por default). */
  dataPoints?: boolean;
  /** Si true, el contenedor reacciona a mouse position (parallax tilt). */
  mouseParallax?: boolean;
  /** Si true, auto-rotate suave en idle. */
  autoRotate?: boolean;
  /** Color de fondo del canvas (transparente por default — bg pasa a través). */
  clearColor?: string;
  /** Velocidad del auto-rotate (rad/s). Default 0.15. */
  rotateSpeed?: number;
}

export default function Container3D({
  variant,
  dataPoints,
  mouseParallax = true,
  autoRotate = true,
  clearColor,
  rotateSpeed = 0.15,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return; // padding/layout aún no resuelto

    // ── Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: clearColor === undefined,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(w, h);
    if (clearColor !== undefined) {
      renderer.setClearColor(new THREE.Color(clearColor), 1);
    } else {
      renderer.setClearColor(0x000000, 0);
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = variant === "digital" ? 1.15 : 1.0;
    container.appendChild(renderer.domElement);

    // ── Scene + camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
    camera.position.set(0, 1.2, 18);
    camera.lookAt(0, 0, 0);

    // ── Lights
    const ambient = new THREE.AmbientLight(0x6080a0, 0.55);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffd6a8, 1.2);
    key.position.set(8, 10, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x5fb3b3, 0.5);
    fill.position.set(-8, 4, 4);
    scene.add(fill);
    // Rim teal sutil (refuerza glow del bloom)
    const rim = new THREE.PointLight(0x5fb3b3, 1.6, 30, 1.8);
    rim.position.set(-4, 2, 8);
    scene.add(rim);

    // NOTA: SIN EffectComposer/UnrealBloomPass intencionalmente.
    // El bloom rellena con negro y rompe el alpha del canvas → se ve una
    // caja negra rectangular sobre el video del hero (bug visto 2026-05-26).
    // El glow lo simulamos con drop-shadow CSS en el wrapper + PointLight
    // teal interno. Sin bloom = canvas verdaderamente transparente.

    // ── El contenedor Movex
    const containerMesh = makeContainerMesh({
      color: "#1a2940",
      brand: "movex",
      trackingCode: variant === "digital" ? "MVXU 250624" : undefined,
    });
    containerMesh.position.set(0, 0, 0);
    // Pose inicial — 3/4 view (no frontal puro, da más profundidad)
    containerMesh.rotation.y = -0.6;
    containerMesh.rotation.x = 0.05;
    scene.add(containerMesh);

    // Halo / rim teal sutil alrededor (solo digital)
    let halo: THREE.Mesh | null = null;
    if (variant === "digital") {
      halo = new THREE.Mesh(
        new THREE.BoxGeometry(12.4, 3.0, 2.8),
        new THREE.MeshBasicMaterial({
          color: 0x5fb3b3,
          transparent: true,
          opacity: 0.08,
          side: THREE.BackSide,
        }),
      );
      scene.add(halo);
    }

    // ── Data points orbitando (refuerza "Logística Digital")
    const dpEnabled = dataPoints ?? variant === "digital";
    let dpGroup: THREE.Group | null = null;
    if (dpEnabled) {
      dpGroup = new THREE.Group();
      const dpCount = variant === "digital" ? 32 : 12;
      for (let i = 0; i < dpCount; i++) {
        const angle = (i / dpCount) * Math.PI * 2;
        const r = 8 + Math.random() * 2.5;
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 10, 10),
          new THREE.MeshBasicMaterial({ color: 0x5fb3b3, transparent: true }),
        );
        dot.position.set(
          Math.cos(angle) * r,
          (Math.random() - 0.5) * 4,
          Math.sin(angle) * r * 0.5, // achatado en z para sensación de "anillo"
        );
        dpGroup.add(dot);
      }
      scene.add(dpGroup);
    }

    // ── Mouse parallax — captura mouse en window y aplica tilt al contenedor
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = -0.6;
    let targetRotX = 0.05;
    const onPointerMove = (e: PointerEvent) => {
      if (!mouseParallax) return;
      // Normalizar mouse a -1..1 desde el centro del viewport
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX = nx;
      mouseY = ny;
      targetRotY = -0.6 + nx * 0.4;
      targetRotX = 0.05 - ny * 0.18;
    };
    if (mouseParallax) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    // ── Resize observer (el contenedor padre puede cambiar de tamaño)
    const ro = new ResizeObserver(() => {
      const W = container.clientWidth;
      const H = container.clientHeight;
      if (W === 0 || H === 0) return;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    // ── Animation loop (setInterval — bulletproof en headless)
    let disposed = false;
    const startTime = performance.now();
    const animate = (now: number) => {
      if (disposed) return;
      const elapsed = (now - startTime) / 1000;

      // Auto-rotate base (suma a target del mouse parallax si está activo)
      if (autoRotate && !mouseParallax) {
        containerMesh.rotation.y = -0.6 + elapsed * rotateSpeed;
        containerMesh.rotation.x = 0.05 + Math.sin(elapsed * 0.6) * 0.04;
      } else if (autoRotate && mouseParallax) {
        // Drift constante + lerp al target del mouse
        targetRotY += rotateSpeed * 0.016 * 0.4; // muy lento para no marear
        containerMesh.rotation.y +=
          (targetRotY - containerMesh.rotation.y) * 0.08;
        containerMesh.rotation.x +=
          (targetRotX - containerMesh.rotation.x) * 0.08;
      } else if (mouseParallax) {
        containerMesh.rotation.y +=
          (targetRotY - containerMesh.rotation.y) * 0.08;
        containerMesh.rotation.x +=
          (targetRotX - containerMesh.rotation.x) * 0.08;
      }

      if (halo) {
        halo.position.copy(containerMesh.position);
        halo.rotation.copy(containerMesh.rotation);
      }

      if (dpGroup) {
        dpGroup.rotation.y = elapsed * 0.18;
        dpGroup.children.forEach((child, i) => {
          const dot = child as THREE.Mesh;
          const mat = dot.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.45 + 0.45 * Math.sin(elapsed * 2 + i * 0.7);
          // Subtle floating vertical
          dot.position.y +=
            Math.sin(elapsed * 1.5 + i * 0.5) * 0.005 -
            (dot.position.y - (i % 2 === 0 ? 0.5 : -0.5)) * 0.01;
        });
      }

      renderer.render(scene, camera);
    };
    const ticker = setInterval(() => {
      if (disposed) return;
      animate(performance.now());
    }, 16);

    return () => {
      disposed = true;
      clearInterval(ticker);
      if (mouseParallax) window.removeEventListener("pointermove", onPointerMove);
      ro.disconnect();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [variant, dataPoints, mouseParallax, autoRotate, clearColor, rotateSpeed]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
    />
  );
}
