// Chapter 4: Jam Jaga (tingkat menengah)
import type { CaseData } from "@/types/case.types";

export const jamJagaCase: CaseData = {
  id: "04-jam-jaga",
  title: "Jam Jaga",
  date: "27 Oktober 2026",
  meta: {
    number: "04",
    location: "Pos Satpam",
    level: 3,
    levelLabel: "Menengah",
    summary:
      "Cocokkan jam masuk dengan jadwal jaga. Siapa yang masuk saat tidak ada petugas di pos?",
    skills: ["BETWEEN", "SUBQUERY", "EXISTS"],
  },
  briefing:
    "Pos satpam mencatat jam jaga setiap petugas. Temukan setiap pintu masuk yang berhasil (DITERIMA) pada saat tidak ada petugas yang sedang berjaga di tanggal yang sama. Tampilkan kartu, tanggal, jam, dan pintunya.",

  hints: [
    "Hanya masuk yang berstatus DITERIMA yang perlu diperiksa. Filter kolom hasil lebih dulu.",
    "Masuk dianggap terjaga bila ada jadwal di tanggal yang sama dengan jam di antara jam_mulai dan jam_selesai. Cari masuk yang tidak punya jadwal seperti itu dengan NOT EXISTS.",
  ],

  clues: [
    {
      id: "clue-01",
      objectName: "Mesh_JadwalJaga",
      title: "Catatan Pos Satpam",
      category: "document",
      dateOrTag: "27 Okt 2026",
      content:
        "Pos satpam hanya dijaga sampai pukul 19.00 pada Selasa 27 Oktober. Pintu Samping sering dibiarkan terbuka setelah jam itu.",
    },
  ],

  schemaSql: `
    CREATE TABLE petugas_jaga (
        petugas_id INT PRIMARY KEY,
        nama VARCHAR(100) NOT NULL
    );

    CREATE TABLE jadwal_jaga (
        jadwal_id INT PRIMARY KEY,
        petugas_id INT NOT NULL,
        tanggal DATE NOT NULL,
        jam_mulai TIME NOT NULL,
        jam_selesai TIME NOT NULL
    );

    CREATE TABLE pintu_masuk (
        log_id INT PRIMARY KEY,
        card_id VARCHAR(20) NOT NULL,
        pintu VARCHAR(50) NOT NULL,
        tanggal DATE NOT NULL,
        jam TIME NOT NULL,
        hasil VARCHAR(20) NOT NULL
    );

    INSERT INTO petugas_jaga VALUES
    (301, 'Pak Dimas'),
    (302, 'Bu Ratna');

    INSERT INTO jadwal_jaga VALUES
    (1, 301, '2026-10-26', '07:00:00', '15:00:00'),
    (2, 302, '2026-10-26', '15:00:00', '22:00:00'),
    (3, 301, '2026-10-27', '07:00:00', '15:00:00'),
    (4, 302, '2026-10-27', '15:00:00', '19:00:00');

    INSERT INTO pintu_masuk VALUES
    (1, 'CRD-9001', 'Pintu Utama',    '2026-10-27', '08:10:00', 'DITERIMA'),
    (2, 'CRD-9002', 'Pintu Utama',    '2026-10-27', '16:30:00', 'DITERIMA'),
    (3, 'CRD-9003', 'Pintu Samping',  '2026-10-27', '20:45:00', 'DITERIMA'),
    (4, 'CRD-9004', 'Pintu Samping',  '2026-10-27', '21:10:00', 'DITOLAK'),
    (5, 'CRD-9001', 'Pintu Samping',  '2026-10-27', '21:30:00', 'DITERIMA'),
    (6, 'CRD-9005', 'Pintu Utama',    '2026-10-27', '19:30:00', 'DITERIMA'),
    (7, 'CRD-9002', 'Pintu Utama',    '2026-10-26', '20:00:00', 'DITERIMA'),
    (8, 'CRD-9003', 'Pintu Utama',    '2026-10-26', '22:30:00', 'DITERIMA'),
    (9, 'CRD-9005', 'Pintu Samping',  '2026-10-26', '06:50:00', 'DITERIMA');
  `,

  // Kunci validasi: 5 masuk yang berhasil tanpa petugas jaga, tanpa baris DITOLAK
  answerSql: `
    SELECT p.card_id, p.tanggal, p.jam, p.pintu
    FROM pintu_masuk p
    WHERE p.hasil = 'DITERIMA'
      AND NOT EXISTS (
        SELECT 1
        FROM jadwal_jaga j
        WHERE j.tanggal = p.tanggal
          AND p.jam BETWEEN j.jam_mulai AND j.jam_selesai
      );
  `,
};
