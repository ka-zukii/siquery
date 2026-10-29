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
}

