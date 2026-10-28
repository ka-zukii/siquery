import React from "react";
import "./index.css";
import { GameFlow } from "./components/Gameflow";
import { NotepadProvider } from "./context/NotepadContext";

const App: React.FC = () => (
  <NotepadProvider>
    <GameFlow />
  </NotepadProvider>
);

export default App;
