export interface Chapter {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  date: string;
  location: string;
  level: number; // 1-5
  levelLabel: string;
  description: string;
  skills: string[];
  isAvailable: boolean;
  /** Status progres pemain untuk kartu katalog */
  progress?: { done: boolean; label: string };
  /** Label kecil di tab kartu, misalnya "Mulai di sini" */
  badge?: string;
}

