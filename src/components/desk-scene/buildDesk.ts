import * as THREE from "three";
import type { CaseData } from "../../types/case.types";
import { DESK, FLOOR_Y, LIGHT, MON, TOP_Y } from "./desk-scene.config";
import type {
  DocContent,
  Handlers,
  Interactable,
} from "./types/desk-scene.types";
import {
  box,
  clip,
  DISPLAY,
  HAND,
  makeCanvasTexture,
  makeHover,
  MONO,
  SANS,
  std,
  texturedPlane,
  wrapText,
} from "./desk-scene.helpers";

export const buildDesk = (caseData: CaseData, handlers: Handlers) => {
  const root = new THREE.Group();
  const interactables: Interactable[] = [];
  const hintText =
    caseData.hints && caseData.hints.length > 0
      ? caseData.hints[0]
      : "Mulai dari tabel access_logs.";

  /* ---- Meja ---- */
  const wood = std("#3d2a1b", 0.8);
  const tabletop = box(DESK.w, 0.16, DESK.d, wood);
  tabletop.position.set(DESK.x, TOP_Y - 0.08, DESK.z);
  root.add(tabletop);
  [-1, 1].forEach((side) => {
    const leg = box(0.16, DESK.h - 0.16, DESK.d - 0.1, wood);
    leg.position.set(
      DESK.x + side * (DESK.w / 2 - 0.1),
      FLOOR_Y + (DESK.h - 0.16) / 2,
      DESK.z,
    );
    root.add(leg);
  });
  const back = box(DESK.w - 0.4, 0.9, 0.08, wood);
  back.position.set(DESK.x, TOP_Y - 0.16 - 0.45, DESK.z - DESK.d / 2 + 0.1);
  root.add(back);

  const deskMat = box(3.6, 0.025, 1.35, std("#1c3329", 0.95));
  deskMat.position.set(0, TOP_Y + 0.0125, DESK.z + 0.25);
  root.add(deskMat);

  /* ---- Monitor ---- */
  const monitor = new THREE.Group();
  const bezel = box(MON.w, MON.h, 0.12, std("#0b1411", 0.5, 0.2));
  bezel.position.set(0, MON.cy, MON.z);
  const neck = box(0.22, 0.55, 0.1, std("#101d18", 0.5, 0.3));
  neck.position.set(0, TOP_Y + 0.275, MON.z - 0.05);
  const stand = box(1.0, 0.04, 0.6, std("#101d18", 0.5, 0.3));
  stand.position.set(0, TOP_Y + 0.045, MON.z);

  const screenTex = makeCanvasTexture(1024, 593, (ctx, w, h) => {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#0f1b17");
    bg.addColorStop(1, "#08110e");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(
      w * 0.15,
      -20,
      10,
      w * 0.15,
      -20,
      w * 0.7,
    );
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
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(MON.screenW, MON.screenH),
    new THREE.MeshBasicMaterial({ map: screenTex }),
  );
  screen.position.set(0, MON.cy, MON.z + 0.065);
  monitor.add(bezel, neck, stand, screen);
  root.add(monitor);
  interactables.push({
    group: monitor,
    label: "Komputer perpustakaan. Klik untuk masuk.",
    action: handlers.enterPC,
    setHover: makeHover(monitor),
  });

  /* ---- Keyboard & mouse ---- */
  const kbTex = makeCanvasTexture(512, 192, (ctx, w, h) => {
    ctx.fillStyle = "#16241f";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#26382f";
    const rows = [14, 14, 13, 12];
    rows.forEach((n, r) => {
      const kw = (w - 24) / n;
      for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.roundRect(12 + i * kw + 2, 14 + r * 42, kw - 4, 34, 5);
        ctx.fill();
      }
    });
  });
  const keyboard = box(1.5, 0.07, 0.52, std("#101d18", 0.6, 0.2));
  keyboard.position.set(0, TOP_Y + 0.025 + 0.035, DESK.z + 0.5);
  const kbTop = texturedPlane(1.46, 0.48, kbTex);
  kbTop.rotation.x = -Math.PI / 2;
  kbTop.position.set(0, 0.037, 0);
  keyboard.add(kbTop);
  root.add(keyboard);

  const mouse = box(0.2, 0.06, 0.32, std("#101d18", 0.5, 0.2));
  mouse.position.set(1.15, TOP_Y + 0.025 + 0.03, DESK.z + 0.5);
  root.add(mouse);

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
  folder.position.set(-2.1, TOP_Y + 0.03, DESK.z + 0.35);
  folder.rotation.y = 0.18;
  root.add(folder);
  interactables.push({
    group: folder,
    label: "Berkas kasus. Klik untuk membaca.",
    action: () =>
      handlers.openDoc({
        title: `Berkas kasus: ${caseData.title}`,
        body: String(caseData.briefing),
      }),
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

  /* ---- Papan memo dengan catatan tempel ---- */
  const board = new THREE.Group();
  const corkBoard = box(1.35, 1.0, 0.06, std("#6a4a2e", 0.95));
  const feet = box(1.35, 0.06, 0.3, std("#3d2a1b", 0.8));
  feet.position.set(0, -0.53, 0.12);
  corkBoard.position.set(0, 0, 0);
  board.add(corkBoard, feet);

  const makeSticky = (
    title: string,
    text: string,
    x: number,
    y: number,
    rotZ: number,
    doc: DocContent,
  ) => {
    const tex = makeCanvasTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = "#f6d66a";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(0, 0, w, 22);
      ctx.fillStyle = "#3b2f08";
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.font = `700 26px ${HAND}`;
      ctx.fillText(title, 18, 56);
      ctx.font = `500 22px ${HAND}`;
      wrapText(ctx, clip(text, 70), 18, 92, w - 36, 28);
    });
    const note = texturedPlane(0.5, 0.5, tex);
    note.position.set(x, y, 0.035);
    note.rotation.z = rotZ;
    note.castShadow = true;
    const g = new THREE.Group();
    g.add(note);
    board.add(g);
    interactables.push({
      group: g,
      label: `${title}. Klik untuk membaca.`,
      action: () => handlers.openDoc(doc),
      setHover: makeHover(g),
    });
  };
  makeSticky(
    "Password arsip",
    "Lihat catatan shift malam.",
    -0.32,
    0.18,
    0.06,
    {
      title: "Catatan tempel",
      body: "Password arsip: lihat catatan shift malam.\n\n— Bu Wati",
    },
  );
  makeSticky("Petunjuk", hintText, 0.3, -0.12, -0.08, {
    title: "Petunjuk",
    body: hintText,
  });

  board.position.set(2.05, TOP_Y + 0.85, DESK.z - 0.6);
  board.rotation.y = -0.18;
  root.add(board);

  /* ---- Tumpukan buku (dekorasi) ---- */
  const bookColors = ["#2f6b57", "#a8462f", "#d9a640"];
  bookColors.forEach((c, i) => {
    const book = box(0.95 - i * 0.06, 0.14, 0.66, std(c, 0.8));
    book.position.set(2.2, TOP_Y + 0.07 + i * 0.145, DESK.z + 0.45);
    book.rotation.y = 0.12 * (i - 1);
    root.add(book);
  });

  /* ---- Lampu meja ---- */
  const lamp = new THREE.Group();
  const lampMetal = std("#1c2f28", 0.4, 0.6);
  const lampBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.32, 0.06, 28),
    lampMetal,
  );
  lampBase.position.y = 0.03;
  const arm1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 1.2, 12),
    lampMetal,
  );
  arm1.position.set(0.1, 0.65, 0);
  arm1.rotation.z = -0.18;
  const arm2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.95, 12),
    lampMetal,
  );
  arm2.position.set(0.5, 1.2, 0);
  arm2.rotation.z = Math.PI / 2 - 0.35;
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 0.42, 28, 1, true),
    new THREE.MeshStandardMaterial({
      color: "#f0b84b",
      roughness: 0.5,
      metalness: 0.3,
      side: THREE.DoubleSide,
    }),
  );
  shade.position.set(0.9, 1.22, 0);
  shade.rotation.z = -0.35;
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffd48a }),
  );
  bulb.position.set(0.88, 1.1, 0);
  [lampBase, arm1, arm2, shade].forEach((m) => (m.castShadow = true));
  lamp.add(lampBase, arm1, arm2, shade, bulb);
  lamp.position.set(-2.25, TOP_Y, DESK.z - 0.3);
  root.add(lamp);

  const lampLight = new THREE.SpotLight(0xffc46b, LIGHT.lamp, 0, 0.75, 0.7, 2);
  lampLight.position.set(-2.25 + 0.88, TOP_Y + 1.05, DESK.z - 0.3);
  lampLight.target.position.set(-0.6, TOP_Y, DESK.z + 0.4);
  lampLight.castShadow = true;
  lampLight.shadow.mapSize.set(1024, 1024);
  lampLight.shadow.bias = -0.0005;
  root.add(lampLight, lampLight.target);

  /* ---- Cahaya layar ---- */
  const glow = new THREE.PointLight(0x9be8c9, LIGHT.screenGlow, 0, 2);
  glow.position.set(0, MON.cy, MON.z + 0.6);
  root.add(glow);

  return { root, interactables };
};
