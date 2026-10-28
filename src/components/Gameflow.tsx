import React, { useEffect, useState } from "react";
import { MainMenu } from "./MainMenu";
import { DeskScene } from "./Deskscene";
import { Desktop } from "./Desktop";
import type { CaseData } from "../types/case.types";

type Phase = "menu" | "desk" | "pc";

const FADE_MS = 400;

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
