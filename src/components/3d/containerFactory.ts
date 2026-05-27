import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// Factory de contenedor 3D reutilizable.
// Mismo modelo procedural validado en Explore3D — sin dependencias externas
// (no requiere GLTF/asset bin), textura de corrugaciones + brand text via
// CanvasTexture. Liviano (~2KB textura por cara) y renderiza igual en todos
// los browsers.
// ─────────────────────────────────────────────────────────────────────────────

export interface ContainerOpts {
  /** Color base (hex). Default navy Movex. */
  color?: string;
  /** Texto de marca dibujado en los lados (ej. "movex"). */
  brand?: string;
  /** Largo en unidades three.js. Default 12 (proporción 40ft). */
  length?: number;
  /** Alto. Default 2.6. */
  height?: number;
  /** Ancho. Default 2.4. */
  width?: number;
  /** Color del texto de marca. Default blanco. */
  brandColor?: string;
  /** Código de tracking pequeño abajo (ej. "MVXU 250624"). */
  trackingCode?: string;
}

function createContainerTexture(
  color: string,
  brand?: string,
  opts: { brandColor?: string; trackingCode?: string } = {},
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  // Base
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1024, 256);
  // Sombreado por desgaste
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "rgba(255,255,255,0.05)");
  grad.addColorStop(0.5, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.18)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 256);
  // Corrugaciones verticales
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
    ctx.fillStyle = opts.brandColor || "rgba(255,255,255,0.94)";
    ctx.font = "bold 128px 'Archivo', 'Inter', sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(brand.toLowerCase(), 60, 132);
  }
  if (opts.trackingCode) {
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "20px 'JetBrains Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(opts.trackingCode, 990, 220);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

export function makeContainerMesh(opts: ContainerOpts = {}) {
  const color = opts.color ?? "#1a2940";
  const length = opts.length ?? 12;
  const height = opts.height ?? 2.6;
  const width = opts.width ?? 2.4;

  const sideTex = createContainerTexture(color, opts.brand, {
    brandColor: opts.brandColor,
    trackingCode: opts.trackingCode,
  });
  const endTex = createContainerTexture(color);
  const geo = new THREE.BoxGeometry(length, height, width);

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
  const mesh = new THREE.Mesh(geo, [
    endMat,
    endMat,
    topMat,
    botMat,
    sideMat,
    sideMat,
  ]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
