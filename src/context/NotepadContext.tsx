import React, { createContext, useContext, useMemo, useState } from "react";

interface NotepadContextValue {
  text: string;
  setText: (value: string) => void;
}

const NotepadContext = createContext<NotepadContextValue | null>(null);

/**
 * Menyimpan isi Notepad di state React. Pasang provider ini di atas
 * komponen yang bisa ter-unmount (misalnya Desktop), supaya teks tetap ada
 * saat jendela ditutup atau pemain kembali ke meja. Reload halaman akan
 * mengosongkannya.
 */
export const NotepadProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [text, setText] = useState("");

  const value = useMemo(() => ({ text, setText }), [text]);

  return (
    <NotepadContext.Provider value={value}>{children}</NotepadContext.Provider>
  );
};

export const useNotepad = () => {
  const ctx = useContext(NotepadContext);
  if (!ctx) {
    throw new Error("useNotepad harus dipakai di dalam NotepadProvider");
  }
  return ctx;
};
