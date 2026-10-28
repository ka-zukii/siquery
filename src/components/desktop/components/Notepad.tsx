import React from "react";
import { useNotepad } from "../../../context/NotepadContext";

export const NotepadApp: React.FC = () => {
  const { text, setText } = useNotepad();

  return (
    <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      className="h-full w-full resize-none bg-sticky p-5 font-['Marker_Felt','Noteworthy',sans-serif] text-base leading-relaxed text-[#3b2f08] placeholder:text-[#3b2f08]/50 focus:outline-none"
      placeholder="Tulis catatan petunjuk investigasi di sini..."
    />
  );
};
