import React, { useEffect } from "react";
import "./index.css";
import { GameFlow } from "./features/flow/GameFlow";
import { NotepadProvider } from "./shared/context/NotepadContext";
import { DesktopOnlyGate } from "./shared/ui/DesktopOnlyGate";
import { initScrollHints } from "./shared/utils/scrollHints";

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
