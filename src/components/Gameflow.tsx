import React, { useEffect, useState } from "react";
import { MainMenu } from "./MainMenu";
import { DeskScene } from "./Deskscene";
import { Desktop } from "./Desktop";
import { useBgm } from "../hooks/useBGM";
import type { CaseData } from "../types/case.types";

type Phase = "menu" | "desk" | "pc";

const FADE_MS = 400;

// File ada di public/audio/bgm/. BASE_URL menjaga path tetap benar
// kalau game di-deploy di subfolder.
const MENU_BGM = `${import.meta.env.BASE_URL}audio/bgm/After_Hours_in_the_Archive.mp3`;

interface GameFlowProps {
  caseData: CaseData;
}

/**
 * Alur game:
 *   menu  --(Mulai investigasi)-->  desk (dunia 3D)  --(klik monitor)-->  pc (Desktop)
 *   pc    --(Kembali ke meja / Esc)-->  desk  --(‹ Menu)-->  menu
 *
 * DeskScene tetap terpasang selama fase "desk" dan "pc", jadi model 3D
 * tidak dimuat ulang tiap kali pemain keluar-masuk komputer.
 */
export const GameFlow: React.FC<GameFlowProps> = ({ caseData }) => {
  const [phase, setPhase] = useState<Phase>("menu");
  const [pcMounted, setPcMounted] = useState(false);
  const [pcVisible, setPcVisible] = useState(false);

  // Musik menu: fade in di menu, fade out saat pemain masuk ke meja 3D
  useBgm(MENU_BGM, phase === "menu");

  // Desktop memudar masuk saat kamera tiba di layar, dan memudar keluar saat kembali.
  useEffect(() => {
    if (phase === "pc") {
      setPcMounted(true);
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setPcVisible(true)),
      );
      return () => cancelAnimationFrame(raf);
    }
    setPcVisible(false);
    const t = setTimeout(() => setPcMounted(false), FADE_MS);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-desk">
      {phase === "menu" && (
        <div className="absolute inset-0 overflow-y-auto">
          <MainMenu caseData={caseData} onStartCase={() => setPhase("desk")} />
        </div>
      )}

      {phase !== "menu" && (
        <DeskScene
          caseData={caseData}
          paused={phase === "pc"}
          onEnterPC={() => setPhase("pc")}
          onBack={() => setPhase("menu")}
        />
      )}

      {pcMounted && (
        <div
          className="absolute inset-0 z-50 transition-opacity ease-out"
          style={{
            opacity: pcVisible ? 1 : 0,
            transitionDuration: `${FADE_MS}ms`,
          }}
        >
          <Desktop caseData={caseData} onExit={() => setPhase("desk")} />
        </div>
      )}
    </div>
  );
};
