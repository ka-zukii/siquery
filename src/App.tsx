import React, { useState } from "react";
import "./index.css";
import { MainMenu } from "./components/MainMenu";
import { Desktop } from "./components/Desktop";
import { DatabaseProvider } from "./context/DatabaseContext";
import { missingManuscriptCase } from "./cases/01-missing-manuscript/story";

const App: React.FC = () => {
  const [inGame, setInGame] = useState(false);

  const handleStartGame = () => {
    setInGame(true);
  };

  const handleExitToMenu = () => {
    setInGame(false);
  };

  if (!inGame) {
    return (
      <MainMenu
        caseData={missingManuscriptCase}
        onStartCase={handleStartGame}
      />
    );
  }

  return (
    /* DatabaseProvider diletakkan di sini agar engine SQLite WASM diinisialisasi
       hanya saat game aktif dan dishare ke seluruh jendela Desktop */
    <DatabaseProvider schemaSql={missingManuscriptCase.schemaSql}>
      {/* Background Overlay */}
      <div className="overlay-backdrop fixed inset-0 bg-black/70 backdrop-blur-[10px] flex justify-center items-center z-50">
        {/* Frame Monitor PC Fisik (Matte Dark Bezel) */}
        <div className="pc-monitor-frame w-[96vw] max-w-[1320px] h-[92vh] bg-black border-[10px] border-b-[22px] border-[#2a2a2d] rounded-[22px] shadow-[0_0_0_1px_#4a4a4e,0_40px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
          {/* Bezel Atas Monitor & Webcam */}
          <div className="monitor-bezel-top bg-[#2a2a2d] py-1 px-4 flex justify-center items-center gap-2 text-[0.62rem] text-[#6e6e73] tracking-[1.5px] font-semibold select-none">
            <div className="webcam-dot w-[6px] h-[6px] rounded-full bg-[#30d158] shadow-[0_0_6px_#30d158]" />
            <span>SIQUERY MONITOR DISPLAY</span>
          </div>

          {/* Layar Desktop di Dalam Monitor */}
          <div className="desktop-screen flex-1 relative overflow-hidden bg-[#09090b] select-none">
            <Desktop caseData={missingManuscriptCase} />
          </div>
        </div>
      </div>
    </DatabaseProvider>
  );
};

export default App;
