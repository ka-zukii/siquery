import type { CoachStep } from "@/shared/ui/CoachMarks";

export const DESKTOP_TOUR_KEY = "siquery.tour.desktop";
export const STUDIO_TOUR_KEY = "siquery.tour.studio";

export const isTourDone = (key: string): boolean => {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
};

export const markTourDone = (key: string) => {
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    // Tidak apa-apa bila tidak bisa disimpan; tur hanya muncul lagi
  }
};

export const clearTourDone = (key: string) => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Tidak apa-apa; tur akan tetap dianggap sudah selesai di sesi ini
  }
};

/** Tur saat pertama kali masuk ke komputer */
export const DESKTOP_TOUR: CoachStep[] = [
  {
    target: "menubar",
    title: "Bilah menu",
    text: "Di sini tampil nama aplikasi yang sedang aktif dan jam.",
  },
  {
    target: "desktop-icons",
    title: "Ikon di meja",
    text: "Klik ikon untuk membuka aplikasi. Isinya sama dengan dock di bawah.",
  },
  {
    target: "dock",
    title: "Dock",
    text: "DB Studio untuk menulis kueri, UniMail untuk membaca surat, Catatan untuk menyimpan temuan, dan Laporkan untuk menyerahkan kesimpulanmu.",
  },
  {
    target: "dock-exit",
    title: "Kembali ke meja",
    text: "Tekan ikon Meja atau Esc untuk berdiri dari komputer.",
  },
];

/** Tur saat DB Studio dibuka pertama kali */
export const STUDIO_TOUR: CoachStep[] = [
  {
    target: "studio-lessons",
    title: "Kelas latihan",
    text: "Selesaikan pelajaran satu per satu. Pelajaran berikutnya terbuka setelah jawabanmu benar.",
  },
  {
    target: "studio-schema",
    title: "Skema database",
    text: "Daftar tabel dan kolomnya. Klik nama tabel untuk melihat isinya. Tabel yang kamu buat juga muncul di sini.",
  },
  {
    target: "studio-editor",
    title: "Konsol SQL",
    text: "Tulis kueri di sini. Tekan Ctrl + Enter untuk menjalankannya.",
  },
  {
    target: "studio-run",
    title: "Jalankan kueri",
    text: "Tombol ini menjalankan kueri yang ada di konsol. Hasilnya tampil di bawah.",
  },
  {
    target: "studio-result",
    title: "Hasil kueri",
    text: "Baris hasil tampil di sini. Bila belum sesuai target, pesan \"Belum tepat\" muncul di atasnya.",
  },
  {
    target: "studio-hints",
    title: "Petunjuk",
    text: "Petunjuk singkat untuk tugas ini. Bacalah bila kamu belum yakin langkahnya.",
  },
  {
    target: "studio-history",
    title: "Riwayat kueri",
    text: "Kueri yang pernah kamu jalankan tersimpan di sini. Klik salah satu untuk memakainya lagi.",
  },
];
