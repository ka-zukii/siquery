const KEY = "siquery.tutorialDone";

export const isTutorialDone = (): boolean => {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

export const markTutorialDone = () => {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // Tidak apa-apa bila tidak bisa disimpan; panduan hanya muncul lagi
  }
};

export interface TutorialState {
  ranQuery: boolean;
  ranOk: boolean;
  solved: boolean;
}

/** Langkah panduan yang sedang berlaku. Null bila panduan sudah tidak diperlukan. */
export const tutorialStep = (
  s: TutorialState,
): { text: string; highlightRun: boolean } | null => {
  if (s.solved) return null;
  if (!s.ranQuery) {
    return {
      text: "Langkah 1: tulis kueri di Konsol SQL, lalu tekan Jalankan kueri atau Ctrl + Enter. Klik nama tabel di sidebar untuk melihat isinya dulu.",
      highlightRun: true,
    };
  }
  if (!s.ranOk) {
    return {
      text: "Kueri belum berhasil dijalankan. Baca pesan error di bawah, lalu perbaiki penulisannya.",
      highlightRun: true,
    };
  }
  return {
    text: "Bagus, kueri sudah berjalan. Bandingkan hasilnya dengan petunjuk, lalu ubah kondisinya sampai hasilnya cocok dengan target.",
    highlightRun: true,
  };
};
