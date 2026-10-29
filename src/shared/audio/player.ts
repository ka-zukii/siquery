export interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
  /** Warna utama lagu: dipakai untuk tombol, baris terpilih, dan latar */
  accent: string;
  /** Gradient artwork [atas, bawah] */
  gradient: [string, string];
  /** Tag suasana singkat */
  mood: string;
  /** Deskripsi satu kalimat */
  note: string;
}

/** Daftar lagu. Taruh file di public/audio/bgm/ lalu tambahkan entri di sini. */
export const TRACKS: Track[] = [
  {
    id: "after-hours",
    title: "After Hours in the Archive",
    artist: "Musik latar SiQuery",
    src: `${import.meta.env.BASE_URL}audio/bgm/After_Hours_in_the_Archive.mp3`,
    accent: "#fa2d55",
    gradient: ["#ff6b8b", "#5b1d3a"],
    mood: "Tenang",
    note: "Lampu meja masih menyala, rak-rak mulai sepi.",
  },
  {
    id: "between-the-stacks",
    title: "Between the Stacks",
    artist: "Musik latar SiQuery",
    src: `${import.meta.env.BASE_URL}audio/bgm/Between_the_Stacks.mp3`,
    accent: "#e8590c",
    gradient: ["#ffa94d", "#6b2d0f"],
    mood: "Santai",
    note: "Melangkah pelan di antara lorong rak buku.",
  },
  {
    id: "paperback-moonlight",
    title: "Paperback Moonlight",
    artist: "Musik latar SiQuery",
    src: `${import.meta.env.BASE_URL}audio/bgm/Paperback_Moonlight.mp3`,
    accent: "#7048e8",
    gradient: ["#b197fc", "#2b1b5e"],
    mood: "Malam hari",
    note: "Cahaya bulan jatuh di sampul buku saku.",
  },
  {
    id: "patterns-in-amber",
    title: "Patterns in Amber",
    artist: "Musik latar SiQuery",
    src: `${import.meta.env.BASE_URL}audio/bgm/Patterns_in_Amber.mp3`,
    accent: "#d9730d",
    gradient: ["#ffd43b", "#7a4a00"],
    mood: "Hangat",
    note: "Pola-pola yang perlahan terlihat di balik data.",
  },
  {
    id: "the-last-pencil-stroke",
    title: "The Last Pencil Stroke",
    artist: "Musik latar SiQuery",
    src: `${import.meta.env.BASE_URL}audio/bgm/The_Last_Pencil_Stroke.mp3`,
    accent: "#1c7ed6",
    gradient: ["#74c0fc", "#0b2e57"],
    mood: "Fokus",
    note: "Satu goresan terakhir sebelum kasus ditutup.",
  },
  {
    id: "the-librarians-ledger",
    title: "The Librarian's Ledger",
    artist: "Musik latar SiQuery",
    src: `${import.meta.env.BASE_URL}audio/bgm/The_Librarian_s_Ledger.mp3`,
    accent: "#2f9e44",
    gradient: ["#8ce99a", "#0f3d1e"],
    mood: "Teliti",
    note: "Mencocokkan catatan, baris demi baris.",
  },
  {
    id: "the-quiet-archive",
    title: "The Quiet Archive",
    artist: "Musik latar SiQuery",
    src: `${import.meta.env.BASE_URL}audio/bgm/The_Quiet_Archive.mp3`,
    accent: "#0b7285",
    gradient: ["#66d9e8", "#062f3a"],
    mood: "Hening",
    note: "Arsip yang tenang, tempat jawaban disimpan.",
  },
];

let audio: HTMLAudioElement | null = null;
let index = 0;
let repeatAll = true;
let shuffle = false;
let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;

/** Satu elemen audio untuk seluruh desktop, supaya musik tetap jalan saat jendela ditutup */
export const getAudio = (): HTMLAudioElement => {
  if (!audio) {
    audio = new Audio();
    audio.preload = "auto";
    audio.addEventListener("ended", () => {
      if (shuffle || index < TRACKS.length - 1 || repeatAll) {
        loadTrack(nextIndex(), true);
      }
    });
  }
  return audio;
};

export const getIndex = () => index;

export const getRepeat = () => repeatAll;

export const setRepeatAll = (v: boolean) => {
  repeatAll = v;
};

export const getShuffle = () => shuffle;

export const setShuffle = (v: boolean) => {
  shuffle = v;
};

/** Indeks lagu berikutnya: acak (bukan lagu yang sama) atau berurutan */
export const nextIndex = (): number => {
  if (shuffle && TRACKS.length > 1) {
    let n = index;
    while (n === index) n = Math.floor(Math.random() * TRACKS.length);
    return n;
  }
  return (index + 1) % TRACKS.length;
};

/** AudioContext harus dinyalakan setelah ada interaksi pemain */
export const resumeAnalyser = () => {
  void audioCtx?.resume();
};

export const loadTrack = (i: number, autoplay: boolean) => {
  const a = getAudio();
  index = i;
  a.src = TRACKS[i].src;
  a.load();
  if (autoplay) {
    resumeAnalyser();
    void a.play().catch(() => {});
  }
};

/** Analyser untuk visualisasi spektrum. Dibuat sekali dan dipasang pada elemen audio yang sama. */
export const getAnalyser = (): AnalyserNode | null => {
  if (analyser) return analyser;
  try {
    audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(getAudio());
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
  } catch {
    analyser = null;
  }
  return analyser;
};

/** Dipanggil saat pemain keluar dari kasus */
export const stopMusic = () => {
  audio?.pause();
};
