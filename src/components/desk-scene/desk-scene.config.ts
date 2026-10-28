import * as THREE from "three";

// Taruh file di: public/models/library.glb
export const MODEL_URL = `${import.meta.env.BASE_URL}models/library.glb`;
export const MODEL_BYTES_FALLBACK = 10_404_716;

// Skala model: pintu setinggi ±4.5 unit, jadi 1 unit ≈ 0.47 m.
// Semua ukuran meja di bawah sudah disesuaikan dengan skala itu.
export const FLOOR_Y = 0.13;
export const DESK = { x: 0, z: -7.4, w: 5.4, d: 2.2, h: 1.7 };
export const TOP_Y = FLOOR_Y + DESK.h;
export const MON = {
  z: -7.75,
  w: 2.1,
  h: 1.3,
  screenW: 1.9,
  screenH: 1.1,
  cy: TOP_Y + 1.15,
};

// Kamera orang pertama: duduk di depan meja, hanya boleh menoleh sedikit.
export const HOME_POS = new THREE.Vector3(0, 3.0, -4.9);
export const BASE_PITCH = -0.17;
export const LOOK_YAW = 0.32;
export const LOOK_PITCH = 0.1;
export const ZOOM_MS = 1100;

// Kalau suasana terlalu gelap/terang, ubah angka di sini saja.
export const LIGHT = {
  hemi: 0.9,
  ceiling: 20,
  lamp: 8,
  screenGlow: 0.8,
  exposure: 1.0,
};
