import * as THREE from "three";

export const DISPLAY = "Fraunces, Georgia, serif";
export const SANS = "'Instrument Sans', system-ui, sans-serif";
export const MONO = "'IBM Plex Mono', ui-monospace, monospace";
export const HAND = "'Marker Felt', 'Noteworthy', 'Comic Sans MS', cursive";

export const makeCanvasTexture = (
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

export const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
) => {
  let line = "";
  for (const word of text.split(/\s+/)) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      y += lineH;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
};

export const clip = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

export const std = (color: number | string, rough = 0.75, metal = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });

export const box = (
  w: number,
  h: number,
  d: number,
  material: THREE.Material,
  shadow = true,
) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.castShadow = shadow;
  m.receiveShadow = true;
  return m;
};

export const texturedPlane = (w: number, h: number, map: THREE.Texture) => {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map, roughness: 0.9 }),
  );
  m.receiveShadow = true;
  return m;
};

export const makeHover = (group: THREE.Object3D) => (on: boolean) => {
  group.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((m) => {
      if (m instanceof THREE.MeshStandardMaterial) {
        m.emissive.set(on ? 0xf0b84b : 0x000000);
        m.emissiveIntensity = on ? 0.22 : 0;
      } else if (m instanceof THREE.MeshBasicMaterial) {
        m.color.setScalar(on ? 1.3 : 1);
      }
    });
  });
};

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
