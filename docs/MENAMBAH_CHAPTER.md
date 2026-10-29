# Panduan Menambah Chapter

Langkah berikut menambahkan chapter baru ke SiQuery.

## 1. Buat Folder dan File Cerita

Buat folder `src/content/cases/<nomor>-<judul-slug>/` dan file `story.ts` di dalamnya. Contoh: `src/content/cases/11-contoh-kasus/story.ts`.

Gunakan kerangka berikut:

```ts
// Chapter 11: Contoh Kasus (tingkat menengah)
import type { CaseData } from "@/types/case.types";

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

Buka `src/content/cases/index.ts` lalu:

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

Jika chapter itu sebelumnya ada di `UPCOMING_CHAPTERS` di file yang sama, hapus entri placeholder-nya agar tidak tampil dua kali. Array `CASES` diurutkan otomatis berdasarkan `meta.number`.

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

Jika chapter memakai `clues`, setiap `ClueItem` perlu `objectName` yang sama dengan nama mesh di model 3D. Mesh itu harus sudah ada di model `.glb` atau dibuat di `src/features/desk-scene/buildDesk.ts`.

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

## Chapter Latihan (Pelajaran Berurutan)

Chapter latihan bisa berisi beberapa pelajaran yang harus diselesaikan satu per satu. Pelajaran pertama yang belum selesai ditampilkan di panel "Kelas latihan" di atas konsol. Setelah pelajaran terakhir selesai, tiket ditandai selesai.

Isi `lessons` dengan daftar berikut. Setiap pelajaran punya `answerSql` sendiri:

```ts
lessons: [
  {
    id: "pelajaran-1-select",
    title: "Memilih kolom dengan SELECT",
    explanation: "Penjelasan konsep singkat.",
    exampleSql: "SELECT judul\nFROM buku;",   // contoh yang berbeda dari jawaban
    prompt: "Tugas yang harus diselesaikan pemain.",
    answerSql: "SELECT judul, pengarang FROM buku;",
  },
  {
    id: "pelajaran-2-order-by",
    // ...
    ordered: true, // urutan baris juga dicek, untuk ORDER BY
  },
],
```

Chapter dengan `lessons` tidak perlu `answerSql` di level chapter. Jangan menaruh `answerSql` di level chapter sekaligus, karena validasi utama berpindah ke pelajaran.

## Kunci Gabung untuk Contekan (Opsional)

Contekan JOIN mencari kunci gabung dari skema secara otomatis. Tebakan ini bisa meleset, misalnya bila dua tabel hanya kebetulan punya kolom bernama sama. Karena itu, isi `cheatJoin` bila chapter punya relasi:

```ts
cheatJoin: {
  a: "peminjaman",      // tabel pertama (alias a)
  aKey: "buku_id",      // kolom di tabel pertama
  b: "buku",            // tabel kedua (alias b)
  bKey: "id",           // kolom di tabel kedua
},
```

Bila pencocokannya bukan kesamaan nilai, tambahkan `on` dengan kondisi kustom, misalnya `on: "b.nama LIKE '%' || <bagian nama dari a.dari> || '%'"`. Pakai placeholder seperti `<...>` agar contekan tidak membocorkan jawaban.

## Tur (Coach Marks)

Tur menyorot elemen yang punya atribut `data-tour="nama"`. Daftar langkah ada di `src/content/coachMarks.ts`. Langkah yang elemennya tidak ada di halaman dilewati otomatis, jadi elemen yang hanya muncul di chapter tertentu, misalnya panel kelas latihan, aman dimasukkan ke tur Studio.
Tur hanya tampil sekali. Status disimpan di `localStorage` dengan kunci `siquery.tour.desktop` dan `siquery.tour.studio`. Untuk menguji ulang, hapus kunci tersebut dari penyimpanan browser.

## Petunjuk Bertahap dan Progres

- Chapter biasa punya `hints` di level chapter. Satu petunjuk terbuka di awal, lalu bertambah setiap dua kali jawaban salah.
- Pelajaran di chapter latihan bisa punya `hints` sendiri. Logikanya sama, dihitung per pelajaran.
- Status selesai disimpan di `localStorage` dengan kunci `siquery.solved.<id>`, dan dipakai menu katalog untuk menampilkan stempel SELESAI.
- Glosarium ada di `src/content/glossary.ts`. Tambahkan entri di sana bila ada kata kunci baru.

## Tes Otomatis

Jalankan `npm test` untuk memeriksa validator, pesan error, petunjuk bertahap, progres, contekan, dan jawaban setiap pelajaran di chapter latihan. Tambahkan tes baru di samping file yang diuji, dengan akhiran `.test.ts`.

Setiap chapter baru sebaiknya punya tes yang memastikan kueri targetnya bisa dijalankan pada skemanya. Lihat `src/content/cases/cases.test.ts` sebagai contoh.
