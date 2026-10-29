import React, { useEffect } from "react";
import "./index.css";
import { GameFlow } from "./components/Gameflow";
import { NotepadProvider } from "./context/NotepadContext";
import { DesktopOnlyGate } from "./components/DesktopOnlyGate";
import { initScrollHints } from "./utils/scrollHints";

const App: React.FC = () => {
  useEffect(() => initScrollHints(), []);

  return (
    <DesktopOnlyGate>
      <NotepadProvider>
        <GameFlow />
      </NotepadProvider>
    </DesktopOnlyGate>
  );
};

export default App;
