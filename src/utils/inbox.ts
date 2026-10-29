import type { CaseData, EmailItem } from "../types/case.types";

/** Surat di UniMail. Kalau kasus tidak punya `emails`, pakai briefing sebagai satu surat. */
export const getInbox = (c: CaseData): EmailItem[] =>
  c.emails ?? [
    {
      id: "briefing",
      from: "head@library.univ.ac.id",
      to: "detective@siquery.os",
      subject: `Penting: Penyelidikan Kasus ${c.title}`,
      date: String(c.date),
      body: String(c.briefing),
    },
  ];
