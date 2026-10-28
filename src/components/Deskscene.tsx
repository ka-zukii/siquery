import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  BASE_PITCH,
  HOME_POS,
  LIGHT,
  LOOK_PITCH,
  LOOK_YAW,
  MODEL_BYTES_FALLBACK,
  MODEL_URL,
  MON,
  ZOOM_MS,
} from "./desk-scene/desk-scene.config";
import type {
  DeskSceneProps,
  DocContent,
  Interactable,
  Sim,
} from "./desk-scene/types/desk-scene.types";
import { buildDesk } from "./desk-scene/buildDesk";
import { easeInOutCubic } from "./desk-scene/desk-scene.helpers";

export const DeskScene: React.FC<DeskSceneProps> = ({
  caseData,
  paused,
  onEnterPC,
  onBack,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const [doc, setDoc] = useState<DocContent | null>(null);

  const cb = useRef({ onEnterPC, caseData });
  cb.current = { onEnterPC, caseData };

  const sim = useRef<Sim>({
    mode: "desk",
    tween: null,
    px: 0,
    py: 0,
    yaw: 0,
    pitch: BASE_PITCH,
    paused: false,
    modalOpen: false,
  });
  const api = useRef<{ zoomOut: () => void } | null>(null);
  const prevPaused = useRef(paused);

  // Saat Desktop ditutup, kamera mundur dari layar kembali ke kursi.
  useEffect(() => {
    sim.current.paused = paused;
    if (prevPaused.current && !paused) api.current?.zoomOut();
    prevPaused.current = paused;
  }, [paused]);

  useEffect(() => {
    sim.current.modalOpen = doc !== null;
  }, [doc]);

  useEffect(() => {
    if (!doc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDoc(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doc]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const s = sim.current;
    let disposed = false;
    let raf = 0;
    let hovered: Interactable | null = null;

    /* Renderer */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = LIGHT.exposure;
    renderer.shadowMap.enabled = true;
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    /* Scene & kamera */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0a110f");
    scene.fog = new THREE.Fog("#0a110f", 16, 40);

    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 80);
    camera.position.copy(HOME_POS);
    const euler = new THREE.Euler(BASE_PITCH, 0, 0, "YXZ");
    camera.quaternion.setFromEuler(euler);

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    /* Cahaya ruangan */
    scene.add(new THREE.HemisphereLight(0xcfe3d8, 0x1a2a24, LIGHT.hemi));
    [-3, 4].forEach((x) => {
      const p = new THREE.PointLight(0xffe3b8, LIGHT.ceiling, 0, 2);
      p.position.set(x, 6.6, -6);
      scene.add(p);
    });

    /* Tween kamera */
    const startTween = (
      toPos: THREE.Vector3,
      toQuat: THREE.Quaternion,
      onDone: () => void,
    ) => {
      s.tween = {
        t0: performance.now(),
        dur: ZOOM_MS,
        fromPos: camera.position.clone(),
        toPos,
        fromQuat: camera.quaternion.clone(),
        toQuat,
        onDone,
      };
    };

    const enterMonitor = () => {
      if (s.mode !== "desk") return;
      setHoverLabel(null);
      const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const dH = MON.screenH / (2 * tanHalf);
      const dW = MON.screenW / (2 * tanHalf * camera.aspect);
      const d = Math.min(dH, dW) * 0.96; // sedikit overscan supaya layar penuh
      const toPos = new THREE.Vector3(0, MON.cy, MON.z + 0.065 + d);
      s.mode = "zoomIn";
      startTween(toPos, new THREE.Quaternion(), () => {
        s.mode = "monitor";
        cb.current.onEnterPC();
      });
    };

    const exitMonitor = () => {
      if (s.mode !== "monitor") return;
      s.yaw = 0;
      s.pitch = BASE_PITCH;
      s.px = 0;
      s.py = 0;
      s.mode = "zoomOut";
      startTween(
        HOME_POS.clone(),
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(BASE_PITCH, 0, 0, "YXZ"),
        ),
        () => {
          s.mode = "desk";
        },
      );
    };
    api.current = { zoomOut: exitMonitor };

    /* Interaksi */
    const ray = new THREE.Raycaster();
    let interactables: Interactable[] = [];
    const byObject = new Map<THREE.Object3D, Interactable>();

    const setHovered = (next: Interactable | null) => {
      if (hovered === next) return;
      hovered?.setHover(false);
      next?.setHover(true);
      hovered = next;
      renderer.domElement.style.cursor = next ? "pointer" : "default";
      setHoverLabel(next ? next.label : null);
    };

    const pick = (e: PointerEvent | MouseEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      s.px = ((e.clientX - r.left) / r.width) * 2 - 1;
      s.py = -(((e.clientY - r.top) / r.height) * 2 - 1);
      if (s.mode !== "desk" || s.modalOpen) return null;
      ray.setFromCamera(new THREE.Vector2(s.px, s.py), camera);
      const hits = ray.intersectObjects(
        interactables.map((i) => i.group),
        true,
      );
      if (!hits.length) return null;
      let o: THREE.Object3D | null = hits[0].object;
      while (o && !byObject.has(o)) o = o.parent;
      return o ? (byObject.get(o) ?? null) : null;
    };

    const onMove = (e: PointerEvent) => setHovered(pick(e));
    const onLeave = () => {
      s.px = 0;
      s.py = 0;
      setHovered(null);
    };
    const onClick = (e: MouseEvent) => {
      const target = pick(e);
      if (target) {
        setHovered(null);
        target.action();
      }
    };
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerleave", onLeave);
    renderer.domElement.addEventListener("click", onClick);

    /* Loop render */
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (s.paused && s.mode === "monitor") return; // hemat GPU saat di PC

      if (s.tween) {
        const k = Math.min((now - s.tween.t0) / s.tween.dur, 1);
        const e = easeInOutCubic(k);
        camera.position.lerpVectors(s.tween.fromPos, s.tween.toPos, e);
        camera.quaternion.slerpQuaternions(s.tween.fromQuat, s.tween.toQuat, e);
        if (k >= 1) {
          const done = s.tween.onDone;
          s.tween = null;
          done();
        }
      } else if (s.mode === "desk") {
        const f = 1 - Math.exp(-dt * 5);
        const targetYaw = -s.px * LOOK_YAW;
        const targetPitch = BASE_PITCH + s.py * LOOK_PITCH;
        s.yaw += (targetYaw - s.yaw) * f;
        s.pitch += (targetPitch - s.pitch) * f;
        euler.set(s.pitch, s.yaw, 0, "YXZ");
        camera.quaternion.setFromEuler(euler);
      }
      renderer.render(scene, camera);
    };

    /* Muat model + bangun meja */
    const init = async () => {
      try {
        await Promise.race([
          document.fonts?.ready ?? Promise.resolve(),
          new Promise((r) => setTimeout(r, 1500)),
        ]);
      } catch {
        /* font gagal dimuat: tetap lanjut dengan font cadangan */
      }
      if (disposed) return;

      const desk = buildDesk(cb.current.caseData, {
        openDoc: (d: DocContent) => setDoc(d),
        enterPC: enterMonitor,
      });
      scene.add(desk.root);
      interactables = desk.interactables;
      interactables.forEach((i) => {
        byObject.set(i.group, i);
      });

      new GLTFLoader().load(
        MODEL_URL,
        (gltf) => {
          if (disposed) return;
          scene.add(gltf.scene);
          setProgress(1);
          setReady(true);
        },
        (ev) => {
          if (disposed) return;
          const total = ev.total > 0 ? ev.total : MODEL_BYTES_FALLBACK;
          setProgress(Math.min(ev.loaded / total, 0.99));
        },
        () => {
          if (disposed) return;
          setError(
            "Model ruangan (library.glb) tidak ditemukan. Pastikan file ada di public/models/library.glb.",
          );
        },
      );
    };
    init();
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      api.current = null;
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerleave", onLeave);
      renderer.domElement.removeEventListener("click", onClick);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        const mats = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        mats.forEach((m) => {
          const withMap = m as THREE.MeshStandardMaterial;
          withMap.map?.dispose();
          m.dispose();
        });
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
    // Scene dibangun sekali saat mount; data kasus dibaca lewat ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lamp";

  return (
    <div className="absolute inset-0 overflow-hidden bg-desk font-sans text-paper">
      <div ref={mountRef} className="absolute inset-0" />

      {/* Layar loading */}
      {!ready && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-desk px-6 text-center">
          {error ? (
            <>
              <p className="max-w-md text-[15px] leading-relaxed text-paper/85">
                {error}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onBack}
                  className={`rounded-xl border border-paper/25 px-5 py-3 text-[15px] font-medium transition hover:border-paper/55 hover:bg-paper/5 ${focusRing}`}
                >
                  Kembali ke menu
                </button>
                <button
                  onClick={onEnterPC}
                  className={`rounded-xl bg-lamp px-5 py-3 text-[15px] font-semibold text-[#1d1608] transition hover:bg-[#f6c765] ${focusRing}`}
                >
                  Langsung ke komputer
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-display text-3xl font-bold">
                Menyiapkan meja kerja
              </h2>
              <div
                className="h-1.5 w-64 overflow-hidden rounded-full bg-paper/15"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
              >
                <div
                  className="h-full rounded-full bg-lamp transition-[width] duration-200"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <p className="font-mono text-[12px] text-paper/55">
                {Math.round(progress * 100)}%
              </p>
            </>
          )}
        </div>
      )}

      {/* Tombol kembali */}
      {ready && (
        <button
          onClick={onBack}
          className={`absolute left-4 top-4 z-20 rounded-xl border border-paper/20 bg-desk/70 px-4 py-2 text-[14px] font-medium backdrop-blur-md transition hover:border-paper/50 hover:bg-desk/90 ${focusRing}`}
        >
          ‹ Menu
        </button>
      )}

      {/* Petunjuk / label benda */}
      {ready && !doc && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center px-4">
          <p
            className={`rounded-full border px-5 py-2.5 text-[14px] backdrop-blur-md transition-colors ${
              hoverLabel
                ? "border-lamp/60 bg-desk/85 text-lamp"
                : "border-paper/15 bg-desk/70 text-paper/75"
            }`}
          >
            {hoverLabel ??
              "Arahkan kursor ke benda di meja. Klik monitor untuk membuka komputer."}
          </p>
        </div>
      )}

      {/* Pembaca dokumen */}
      {doc && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-6"
          onClick={() => setDoc(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={doc.title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full w-full max-w-lg overflow-y-auto rounded-[10px] bg-paper p-7 text-ink shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
          >
            <h3 className="font-display text-2xl font-bold leading-snug">
              {doc.title}
            </h3>
            <div className="my-4 border-t border-dashed border-ink/30" />
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink/90">
              {doc.body}
            </p>
            <button
              onClick={() => setDoc(null)}
              className={`mt-6 rounded-xl bg-ink px-5 py-2.5 text-[14px] font-semibold text-paper transition hover:bg-[#2b352f] ${focusRing}`}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
