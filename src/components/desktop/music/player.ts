export interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
}

/** Daftar lagu. Taruh file di public/audio/bgm/ lalu tambahkan entri di sini. */
export const TRACKS: Track[] = [
  {
    id: "after-hours",
    title: "After Hours in the Archive",
    artist: "Musik latar SiQuery",
    src: `${import.meta.env.BASE_URL}audio/bgm/After_Hours_in_the_Archive.mp3`,
  },
  {
    id: "between-the-stacks",
    title: "Between the Stacks",
    artist: "Musik latar SiQuery",
    src: `${import.meta.env.BASE_URL}audio/bgm/Between_the_Stacks.mp3`,
  },
  {
    id: "paperback-moonlight",
    title: "Paperback Moonlight",
    artist: "Musik latar SiQuery",
    src: `${import.meta.env.BASE_URL}audio/bgm/Paperback_Moonlight.mp3`,
  },
  {
    id: "patterns-in-amber",
    title: "Patterns in Amber",
    artist: "Musik latar SiQuery",
    src: `${import.meta.env.BASE_URL}audio/bgm/Patterns_in_Amber.mp3`,
  },
  {
    id: "the-last-pencil-stroke",
    title: "The Last Pencil Stroke",
    artist: "Musik latar SiQuery",
    src: `${import.meta.env.BASE_URL}audio/bgm/The_Last_Pencil_Stroke.mp3`,
  },
  {
    id: "the-librarians-ledger",
    title: "The Librarian's Ledger",
    artist: "Musik latar SiQuery",
    src: `${import.meta.env.BASE_URL}audio/bgm/The_Librarian_s_Ledger.mp3`,
  },
  {
    id: "the-quiet-archive",
    title: "The Quiet Archive",
    artist: "Musik latar SiQuery",
    src: `${import.meta.env.BASE_URL}audio/bgm/The_Quiet_Archive.mp3`,
  },
];

let audio: HTMLAudioElement | null = null;
let index = 0;
let repeatAll = true;
let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;

/** Satu elemen audio untuk seluruh desktop, supaya musik tetap jalan saat jendela ditutup */
export const getAudio = (): HTMLAudioElement => {
  if (!audio) {
    audio = new Audio();
    audio.preload = "auto";
    audio.addEventListener("ended", () => {
      if (index < TRACKS.length - 1 || repeatAll) {
        loadTrack((index + 1) % TRACKS.length, true);
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
