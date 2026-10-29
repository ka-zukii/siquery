// Chapter 7: Rak yang Berpindah (tingkat menengah)
import type { CaseData } from "../../types/case.types";

export const rakBerpindahCase: CaseData = {
  id: "07-rak-berpindah",
  title: "Rak yang Berpindah",
  date: "29 Oktober 2026",
  meta: {
    number: "07",
    location: "Katalog Rak",
    level: 3,
    levelLabel: "Menengah",
    summary:
      "Beberapa buku terus berpindah rak tanpa ada yang mencatatnya di kartu katalog. Cari buku yang paling sering dipindah.",
    skills: ["GROUP BY", "HAVING", "COUNT"],
  },
  briefing:
    "Katalog menunjukkan beberapa buku berpindah rak berulang kali dalam sebulan, sementara kartu katalog tidak pernah diperbarui. Cari buku yang lokasinya diubah dua kali atau lebih, beserta jumlah perubahannya.",

  hints: [
    "Hitung jumlah perubahan per buku dengan COUNT(*), lalu kelompokkan dengan GROUP BY book_id.",
    "Syarat jumlah setelah pengelompokan ditulis dengan HAVING, bukan WHERE.",
  ],

  clues: [
    {
      id: "clue-01",
      objectName: "Mesh_KatalogRak",
      title: "Catatan Katalog",
      category: "document",
      dateOrTag: "28 Okt 2026",
      content:
        "Rak B2 dan D1 tidak tercatat di denah lantai sejak awal Oktober. Kartu katalog di laci tidak ikut diperbarui.",
    },
  ],

  schemaSql: `
    CREATE TABLE riwayat_lokasi (
        log_id INT PRIMARY KEY,
        book_id VARCHAR(20) NOT NULL,
        lokasi_lama VARCHAR(50) NOT NULL,
        lokasi_baru VARCHAR(50) NOT NULL,
        tanggal DATE NOT NULL,
        diubah_oleh VARCHAR(100) NOT NULL
    );

    INSERT INTO riwayat_lokasi VALUES
    (1, 'BK-201', 'Rak A1', 'Rak B2', '2026-10-01', 'Yoga'),
    (2, 'BK-202', 'Rak C1', 'Rak C2', '2026-10-02', 'Rina'),
    (3, 'BK-201', 'Rak B2', 'Rak D1', '2026-10-05', 'Yoga'),
    (4, 'BK-203', 'Rak A2', 'Rak A3', '2026-10-06', 'Doni'),
    (5, 'BK-201', 'Rak D1', 'Rak A1', '2026-10-09', 'Bagas'),
    (6, 'BK-202', 'Rak C2', 'Rak C1', '2026-10-10', 'Rina'),
    (7, 'BK-204', 'Rak E1', 'Rak E2', '2026-10-11', 'Doni');
  `,

  // Kunci validasi: BK-201 (3 kali) dan BK-202 (2 kali)
  answerSql: `
    SELECT book_id, COUNT(*) AS jumlah_pindah
    FROM riwayat_lokasi
    GROUP BY book_id
    HAVING COUNT(*) >= 2;
  `,
};
