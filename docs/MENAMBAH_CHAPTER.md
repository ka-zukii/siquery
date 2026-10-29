# Panduan Menambah Chapter

Langkah berikut menambahkan chapter baru ke SiQuery.

## 1. Buat Folder dan File Cerita

Buat folder `src/cases/<nomor>-<judul-slug>/` dan file `story.ts` di dalamnya. Contoh: `src/cases/11-contoh-kasus/story.ts`.

Gunakan kerangka berikut:

```ts
// Chapter 11: Contoh Kasus (tingkat menengah)
import type { CaseData } from "../../types/case.types";

export const contohKasusCase: CaseData = {
  id: "11-contoh-kasus",          // harus unik, sama dengan nama folder
  title: "Contoh Kasus",
  date: "26 Oktober 2026",
  briefing:
    "Teks pembuka yang muncul di awal chapter.",

  meta: {
    number: "11",
    location: "Meja Layanan",
    level: 2,                     // 1–5
    levelLabel: "Dasar",          // Dasar, Menengah, Sulit, Sangat sulit, ...
    summary: "Ringkasan satu-dua kalimat untuk kartu menu.",
    skills: ["SELECT", "WHERE"],  // konsep SQL yang dipakai
  },

  hints: [
    "Petunjuk pertama.",
  ],

  schemaSql: `
    CREATE TABLE anggota (
      id INT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL
    );

    INSERT INTO anggota VALUES
    (1, 'Budi'),
    (2, 'Sari');
  `,

  // Kueri target. Pemain harus menghasilkan baris yang sama.
  answerSql: `
    SELECT nama FROM anggota WHERE id = 1;
  `,
};
```

## 2. Daftarkan Chapter

Buka `src/cases/index.ts` lalu:

1. Import chapter baru:
   ```ts
   import { contohKasusCase } from "./11-contoh-kasus/story";
   ```
2. Tambahkan ke array `CASES`:
   ```ts
   export const CASES: CaseData[] = [
     // ...chapter lain
     contohKasusCase,
   ].sort(...)
   ```

Jika chapter itu sebelumnya ada di `UPCOMING_CHAPTERS`, hapus entri placeholder-nya agar tidak tampil dua kali. Array `CASES` diurutkan otomatis berdasarkan `meta.number`.

## 3. Pilih Mode Validasi

Pilih salah satu:

- **Berbasis kueri**: isi `answerSql`. Pemain menang saat hasil kuerinya memuat semua baris jawaban. Cocok untuk chapter SQL murni.
- **Berbasis laporan**: isi `report` dengan `fields` dan `answer`. Cocok untuk chapter investigasi yang meminta pemain menentukan pelaku atau fakta tertentu.

Contoh `report`:

```ts
report: {
  fields: [
    {
      key: "pelaku",
      label: "Siapa pelakunya?",
      hint: "Petunjuk tambahan untuk pemain.",
      options: [
        { value: "101", label: "Budi" },
        { value: "102", label: "Sari" },
      ],
    },
  ],
  answer: { pelaku: "101" },
  successMessage: "Laporan diterima. Kasus ditutup.",
},
```

Untuk chapter investigasi, kamu juga bisa menambahkan `clues` dan `emails` agar pemain mendapat petunjuk di meja dan di UniMail.

## 4. Tambahkan Objek di Meja (Opsional)

Jika chapter memakai `clues`, setiap `ClueItem` perlu `objectName` yang sama dengan nama mesh di model 3D. Mesh itu harus sudah ada di model `.glb` atau dibuat di `buildDesk.ts`.

```ts
clues: [
  {
    id: "surat-1",
    objectName: "Mesh_SuratPengembalian", // nama mesh di Three.js (contoh; pakai nama mesh yang ada di model)
    title: "Surat Pengembalian",
    category: "document",          // "document" atau "evidence"
    dateOrTag: "24 Oktober 2026",
    content: "Isi berkas yang tampil saat diklik.",
  },
],
```

## 5. Uji

```bash
npm run build   # cek tipe dan build produksi
npm run lint    # cek lint
npm run dev     # uji manual di browser
```

Saat uji manual, pastikan:

- Kartu chapter muncul di menu dengan status "Mulai investigasi".
- Skema tampil dengan benar di sidebar DB Studio.
- Kueri target lolos validasi, dan kueri yang salah tidak lolos.
- Formulir laporan menerima jawaban yang benar (untuk mode berbasis laporan).

## Tips Menulis Data

- Pakai data Bahasa Indonesia agar konsisten dengan chapter lain.
- Jika ada lebih dari satu jawaban yang mungkin, pikirkan apakah kueri pemain yang "hampir benar" bisa lolos. Validasi hanya memeriksa jumlah baris dan isi baris jawaban.
- Hindari `NULL` di kolom yang dipakai untuk jawaban, kecuali memang bagian dari teka-teki.
- Gunakan `schemaSql` yang sederhana. Tabel yang terlalu banyak membuat pemain kewalahan.
