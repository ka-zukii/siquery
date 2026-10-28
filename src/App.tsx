import React from "react";
import "./index.css";
import { GameFlow } from "./components/Gameflow";
import { DatabaseProvider } from "./context/DatabaseContext";
import { missingManuscriptCase } from "./cases/01-missing-manuscript/story";

const App: React.FC = () => (
  <DatabaseProvider schemaSql={missingManuscriptCase.schemaSql}>
    <GameFlow caseData={missingManuscriptCase} />
  </DatabaseProvider>
);

export default App;
