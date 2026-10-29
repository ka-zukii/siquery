import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { CaseData } from "@/types/case.types";
import { DESK, FLOOR_Y, HOME_POS, LIGHT, MACBOOK_MODEL_URL, MON, TOP_Y } from "./desk-scene.config";
import type { Handlers, Interactable, DocPage } from "./types/desk-scene.types";
import { box, clip, DISPLAY, makeCanvasTexture, makeHover, MONO, SANS, std, texturedPlane, wrapText } from "./desk-scene.helpers";

const loader = new GLTFLoader();

function loadGLB(url: string): Promise<THREE.Group> {
  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => resolve(gltf.scene as THREE.Group), undefined, reject);
  });
}

function box3Of(group: THREE.Group): THREE.Box3 {
  const box = new THREE.Box3();
  group.traverse((o) => {
    if (o instanceof THREE.Mesh) box.expandByObject(o);
  });
  return box;
}

// const hoverWithSfx = (group: THREE.Object3D, handlers: Handlers) => {
//   const visual = makeHover(group);
//   return (on: boolean) => {
//     if (on) handlers.playSound("hover");
//     visual(on);
//   };
// };

function findBodyMesh(group: THREE.Object3D): THREE.Mesh | null {
  let best: THREE.Mesh | null = null;
  let bestVolume = 0;
  group.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    const s = new THREE.Vector3();
    new THREE.Box3().setFromObject(o).getSize(s);
    const volume = s.x * s.y * s.z;
    if (volume > bestVolume) {
      bestVolume = volume;
      best = o;
    }
  });
  return best;
}

export const buildDesk = async (caseData: CaseData, handlers: Handlers) => {
  const root = new THREE.Group();
  const interactables: Interactable[] = [];

  /* ---- Meja ---- */
  const wood = std("#3d2a1b", 0.8);
  const tabletop = box(DESK.w, 0.16, DESK.d, wood);
  tabletop.position.set(DESK.x, TOP_Y - 0.08, DESK.z);
  root.add(tabletop);
  [-1, 1].forEach((side) => {
    const leg = box(0.16, DESK.h - 0.16, DESK.d - 0.1, wood);
    leg.position.set(DESK.x + side * (DESK.w / 2 - 0.1), FLOOR_Y + (DESK.h - 0.16) / 2, DESK.z);
    root.add(leg);
  });
  const back = box(DESK.w - 0.4, 0.9, 0.08, wood);
  back.position.set(DESK.x, TOP_Y - 0.16 - 0.45, DESK.z - DESK.d / 2 + 0.1);
  root.add(back);

  const deskMat = box(3.6, 0.025, 1.35, std("#1c3329", 0.95));
  deskMat.position.set(0, TOP_Y + 0.0125, DESK.z + 0.25);
  root.add(deskMat);

  /* ---- Macbook di atas meja (gantikan monitor + keyboard) ---- */
  const macbookScene = await loadGLB(MACBOOK_MODEL_URL);
  const macbook = macbookScene.clone();

  /* Skala macbook agar sesuai ukuran meja (target lebar ~1.5 unit). */
  const macBB = box3Of(macbook);
  const macSize = new THREE.Vector3();
  macBB.getSize(macSize);
  const scale = 1.5 / macSize.x;
  macbook.scale.set(scale, scale, scale);
  macbook.updateMatrixWorld();

  /* Posisikan di atas permukaan meja. */
  const macBBWorld = box3Of(macbook);
  const macCenter = new THREE.Vector3();
  macBBWorld.getCenter(macCenter);
  macbook.position.set(DESK.x - macCenter.x, TOP_Y - macBBWorld.min.y + 0.01, DESK.z - macCenter.z);
  macbook.updateMatrixWorld();

  macbook.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  /* ---- Layar macbook dengan tampilan OS (seperti monitor sebelumnya) ---- */
  const screenTex = makeCanvasTexture(1024, 593, (ctx, w, h) => {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#0f1b17");
    bg.addColorStop(1, "#08110e");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(w * 0.15, -20, 10, w * 0.15, -20, w * 0.7);
    glow.addColorStop(0, "rgba(240,184,75,0.28)");
    glow.addColorStop(1, "rgba(240,184,75,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(11,20,17,0.85)";
    ctx.fillRect(0, 0, w, 40);
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillStyle = "#f0b84b";
    ctx.font = `700 22px ${DISPLAY}`;
    ctx.fillText("SiQuery OS", 20, 21);
    ctx.textAlign = "right";
    ctx.fillStyle = "#8fa89d";
    ctx.font = `500 18px ${MONO}`;
    ctx.fillText("08:00", w - 20, 21);

    ctx.textAlign = "center";
    ctx.fillStyle = "#efe6d0";
    ctx.font = `800 54px ${DISPLAY}`;
    ctx.fillText("Sistem Perpustakaan Kampus", w / 2, h * 0.42);
    ctx.fillStyle = "#9be8c9";
    ctx.font = `500 26px ${MONO}`;
    ctx.fillText("> klik layar untuk masuk_", w / 2, h * 0.58);
    ctx.fillStyle = "#8fa89d";
    ctx.font = `400 20px ${SANS}`;
    ctx.fillText("Tiket tugas menunggu di kotak masuk", w / 2, h * 0.7);
  });
  // const screenW = 1.2;
  // const screenH = 0.75;
  root.add(macbook);

  const lidMesh = findBodyMesh(macbook);
  if (!lidMesh) throw new Error("Mesh bodi macbook tidak ditemukan");
  if (!lidMesh) throw new Error("Mesh bodi macbook tidak ditemukan");

  const from = HOME_POS.clone(); // posisi kamera
  const aim = new THREE.Vector3(DESK.x, TOP_Y + 1.0, DESK.z); // titik tengah tutup, perlu disesuaikan
  const ray = new THREE.Raycaster(from, aim.clone().sub(from).normalize());
  const hit = ray.intersectObject(lidMesh, false)[0];
  if (!hit || !hit.face) throw new Error("Permukaan tutup layar tidak terkena raycast");

  const normal = hit.face.normal.clone().transformDirection(lidMesh.matrixWorld);

  const SCREEN_W = 1.45; // lebar tampilan, naikkan jika kurang lebar
  const SCREEN_H = 0.95; // tinggi tampilan (sekitar 16:10)
  const SCREEN_OFFSET_Y = -0.4; // negatif = turun, positif = naik

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H), new THREE.MeshBasicMaterial({ map: screenTex, side: THREE.DoubleSide }));
  screen.position.copy(hit.point).addScaledVector(normal, 0.01);
  screen.position.y += SCREEN_OFFSET_Y;
  screen.lookAt(screen.position.clone().add(normal));
  root.add(screen);

  const macPos = screen.getWorldPosition(new THREE.Vector3());

  interactables.push({
    group: screen,
    label: "Macbook. Klik layar untuk masuk.",
    action: handlers.enterPC,
    setHover: makeHover(screen),
  });

  interactables.push({
    group: macbook,
    label: "Macbook. Klik untuk masuk.",
    action: handlers.enterPC,
    setHover: makeHover(macbook),
  });

  /* ---- Berkas kasus (map) ---- */
  const folder = new THREE.Group();
  const cover = box(1.15, 0.06, 1.5, std("#b9a574", 0.85));
  const sheetTex = makeCanvasTexture(512, 660, (ctx, w, h) => {
    ctx.fillStyle = "#efe6d0";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#1d2420";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = `700 30px ${SANS}`;
    ctx.fillText("Berkas kasus", 36, 70);
    ctx.font = `800 44px ${DISPLAY}`;
    wrapText(ctx, clip(caseData.title, 48), 36, 140, w - 72, 52);
    ctx.fillStyle = "rgba(29,36,32,0.55)";
    ctx.font = `400 24px ${MONO}`;
    ctx.fillText(clip(String(caseData.date), 28), 36, h - 120);
    ctx.strokeStyle = "rgba(29,36,32,0.25)";
    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(36, h - 90);
    ctx.lineTo(w - 36, h - 90);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#2f7a55";
    ctx.font = `700 22px ${SANS}`;
    ctx.fillText("Klik untuk membaca", 36, h - 48);
  });
  const sheet = texturedPlane(1.05, 1.35, sheetTex);
  sheet.rotation.x = -Math.PI / 2;
  sheet.position.y = 0.032;
  folder.add(cover, sheet);
  folder.position.set(-1.45, TOP_Y + 0.03, DESK.z + 0.35);
  folder.rotation.y = 0.18;
  root.add(folder);
  interactables.push({
    group: folder,
    label: "Berkas kasus. Klik untuk membaca.",
    action: () => {
      const pages: DocPage[] = [
        ...(caseData.clues ?? []).map((c) => ({
          tag: `${c.category === "evidence" ? "Barang bukti" : "Dokumen"} · ${c.dateOrTag}`,
          title: c.title,
          body: c.content,
          kind: "clue" as const,
        })),
        ...caseData.hints.map((h, i) => ({
          tag: `Petunjuk ${i + 1}`,
          title: "Petunjuk",
          body: h,
          kind: "hint" as const,
        })),
      ];
      if (handlers.isSolved()) {
        pages.push({
          tag: "Status",
          title: "Kasus ditutup",
          body: caseData.report?.successMessage ?? "Hasil kueri sudah sesuai dengan target tugas.",
          kind: "status",
          stamp: caseData.report ? "DITERIMA" : "TERPECAHKAN",
        });
      }
      handlers.playSound("slide", { durationMs: 500 });
      handlers.openDoc({
        title: `Berkas kasus: ${caseData.title}`,
        body: String(caseData.briefing),
        pages,
      });
    },
    setHover: makeHover(folder),
  });

  /* ---- Kartu akses petugas ---- */
  const idCard = new THREE.Group();
  const cardBase = box(0.95, 0.02, 0.6, std("#efe6d0", 0.6));
  const cardTex = makeCanvasTexture(512, 324, (ctx, w, h) => {
    ctx.fillStyle = "#efe6d0";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#15231e";
    ctx.fillRect(0, 0, w, 70);
    ctx.fillStyle = "#f0b84b";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.font = `700 28px ${DISPLAY}`;
    ctx.fillText("Kartu Akses Petugas", 24, 36);
    ctx.fillStyle = "rgba(29,36,32,0.18)";
    ctx.fillRect(24, 100, 120, 150);
    ctx.fillStyle = "#1d2420";
    ctx.textBaseline = "alphabetic";
    ctx.font = `600 26px ${SANS}`;
    ctx.fillText("Perpustakaan Kampus", 170, 130);
    ctx.fillStyle = "rgba(29,36,32,0.6)";
    ctx.font = `400 22px ${MONO}`;
    ctx.fillText("card_id tercatat di", 170, 176);
    ctx.fillText("tabel access_logs", 170, 208);
  });
  const cardFace = texturedPlane(0.9, 0.57, cardTex);
  cardFace.rotation.x = -Math.PI / 2;
  cardFace.position.y = 0.0105;
  idCard.add(cardBase, cardFace);
  idCard.position.set(1.45, TOP_Y + 0.025 + 0.012, DESK.z + 0.55);
  idCard.rotation.y = -0.3;
  root.add(idCard);
  interactables.push({
    group: idCard,
    label: "Kartu akses petugas. Klik untuk memeriksa.",
    action: () =>
      handlers.openDoc({
        title: "Kartu akses petugas",
        body: "Nomor kartu pada kartu ini tercatat di tabel access_logs. Cocokkan dengan data anggota di tabel members untuk menelusuri siapa yang masuk ke sebuah ruangan.",
      }),
    setHover: makeHover(idCard),
  });

  /* ---- Tumpukan buku (dekorasi) ---- */
  const bookColors = ["#2f6b57", "#a8462f", "#d9a640"];
  bookColors.forEach((c, i) => {
    const book = box(0.95 - i * 0.06, 0.14, 0.66, std(c, 0.8));
    book.position.set(2.2, TOP_Y + 0.07 + i * 0.145, DESK.z + 0.45);
    book.rotation.y = 0.12 * (i - 1);
    root.add(book);
  });

  /* ---- Lampu meja ---- */
  const LAMP_X = -2.4;
  const LAMP_Z = DESK.z - 0.75;
  const lamp = new THREE.Group();
  const lampMetal = std("#1c2f28", 0.35, 0.7);

  // Batang silinder dari titik a ke titik b
  const rod = (a: THREE.Vector3, b: THREE.Vector3, r: number) => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 16), lampMetal);
    m.position.copy(a).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    m.castShadow = true;
    lamp.add(m);
  };

  // Sendi bulat di sambungan batang
  const joint = (p: THREE.Vector3, r: number) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), lampMetal);
    m.position.copy(p);
    m.castShadow = true;
    lamp.add(m);
  };

  // Dasar lampu
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.06, 40), lampMetal);
  base.position.y = 0.03;
  base.castShadow = true;
  base.receiveShadow = true;
  lamp.add(base);

  // Titik-titik sambungan lengan
  const J1 = new THREE.Vector3(0, 0.95, 0); // bahu (di atas tiang)
  const J2 = new THREE.Vector3(0.6, 1.5, 0); // siku
  const H = new THREE.Vector3(1.15, 1.25, 0); // kepala lampu

  rod(new THREE.Vector3(0, 0.06, 0), J1, 0.03); // tiang
  rod(J1, J2, 0.025); // lengan atas
  rod(J2, H, 0.025); // lengan bawah
  joint(J1, 0.05);
  joint(J2, 0.04);

  // Kepala lampu, dimiringkan sedikit ke arah meja
  const head = new THREE.Group();
  head.position.copy(H);
  head.rotation.z = 0.25;

  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 0.34, 40, 1, true),
    new THREE.MeshStandardMaterial({
      color: "#f0b84b",
      roughness: 0.45,
      metalness: 0.25,
      side: THREE.DoubleSide,
    }),
  );
  shade.position.set(0, -0.05, 0);
  shade.castShadow = true;

  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe2a8 }));
  bulb.position.set(0, -0.12, 0);

  head.add(shade, bulb);
  lamp.add(head);

  lamp.position.set(LAMP_X, TOP_Y, LAMP_Z);
  root.add(lamp);

  // Cahaya dari bohlam, diarahkan ke area berkas
  const lampLight = new THREE.SpotLight(0xffc46b, LIGHT.lamp, 0, 0.9, 0.7, 2);
  lampLight.position.set(LAMP_X + H.x, TOP_Y + H.y - 0.15, LAMP_Z);
  lampLight.target.position.set(-1.35, TOP_Y, DESK.z + 0.25);
  lampLight.castShadow = true;
  lampLight.shadow.mapSize.set(1024, 1024);
  lampLight.shadow.bias = -0.0005;
  root.add(lampLight, lampLight.target);

  /* ---- Cahaya layar ---- */
  const glow = new THREE.PointLight(0x9be8c9, LIGHT.screenGlow, 0, 2);
  glow.position.set(0, MON.cy, MON.z + 0.6);
  root.add(glow);

  return { root, interactables, macPos };
};
