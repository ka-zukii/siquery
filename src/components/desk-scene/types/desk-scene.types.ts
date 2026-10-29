import * as THREE from "three";
import type { CaseData } from "../../../types/case.types";
import type { SoundType } from "../../../hooks/useSound";

export interface DeskSceneProps {
  caseData: CaseData;
  /** true saat tampilan PC (Desktop) sedang terbuka di atas scene ini */
  paused: boolean;
  /** dipanggil setelah kamera selesai masuk ke layar monitor */
  onEnterPC: () => void;
  onBack: () => void;
}

export interface DocPage {
  tag: string;
  title: string;
  body: string;
  kind: "briefing" | "clue" | "hint" | "status";
  stamp?: string;
}

export interface DocContent {
  title: string;
  body: string;
  /** halaman tambahan yang bisa digeser (clue, petunjuk) */
  pages?: DocPage[];
}

export type Mode = "desk" | "zoomIn" | "monitor" | "zoomOut";

export interface Tween {
  t0: number;
  dur: number;
  fromPos: THREE.Vector3;
  toPos: THREE.Vector3;
  fromQuat: THREE.Quaternion;
  toQuat: THREE.Quaternion;
  onDone: () => void;
}

export interface Sim {
  mode: Mode;
  tween: Tween | null;
  px: number;
  py: number;
  yaw: number;
  pitch: number;
  paused: boolean;
  modalOpen: boolean;
}

export interface Interactable {
  group: THREE.Object3D;
  label: string;
  action: () => void;
  setHover: (on: boolean) => void;
}

export interface Handlers {
  openDoc: (doc: DocContent) => void;
  enterPC: () => void;
  isSolved: () => boolean;
  playSound: (type: SoundType, opts?: { durationMs?: number }) => void;
}
