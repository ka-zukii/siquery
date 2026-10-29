import React from "react";
import "./index.css";
import { GameFlow } from "./components/Gameflow";
import { NotepadProvider } from "./context/NotepadContext";
import { DesktopOnlyGate } from "./components/DesktopOnlyGate";

const App: React.FC = () => (
  <DesktopOnlyGate>
    <NotepadProvider>
      <GameFlow />
    </NotepadProvider>
  </DesktopOnlyGate>
);

export default App;
