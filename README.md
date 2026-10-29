# 📚 SiQuery: Campus Librarian

![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![SQL](https://img.shields.io/badge/Database-Local_SQL-4479A1?style=for-the-badge&logo=sqlite&logoColor=white)

> **Fokus ke layar. Periksa berkas di meja. Ketik kueri SQL untuk menyelesaikan tugas pustakawan.**

**SiQuery: Campus Librarian** adalah game teka-teki logika dan manajemen *database* berbasis *browser*. Pemain berperan sebagai petugas administrasi perpustakaan kampus. Seluruh permainan berlangsung dari sudut pandang orang pertama: pemain duduk di meja kerja (dirender dengan **Three.js**), memeriksa berkas dan barang bukti, lalu mengetik kueri SQL di layar komputer (dibangun dengan **React** dan **Tailwind CSS**) untuk menyelesaikan kasus sirkulasi, keanggotaan, dan kehilangan di perpustakaan.

🎮 **Demo:** [siquery.vercel.app](https://siquery.vercel.app)

---

## ✨ Fitur

- **🖥️ Desktop & DB Studio:** Layar komputer berisi aplikasi yang bisa dibuka dan ditutup, lengkap dengan animasi bergaya macOS. Terminal SQL (`DB Studio`) mendukung *syntax highlighting* dan autokapital untuk kata kunci SQL.
- **🗂️ Eksplorasi Meja 3D:** Klik objek di meja (berkas, KTM, catatan tempel, struk) untuk membacanya.
- **✉️ Aplikasi Pendukung:** `UniMail` untuk email masuk, `Catatan` untuk catatan tempel, `Laporkan` untuk mengirim formulir laporan akhir kasus, dan `Music` untuk musik latar.
- **🧩 Teka-teki SQL:** Setiap chapter punya skema dan data sendiri. Pemain harus menemukan kueri yang tepat untuk menjawab kasus.
- **📅 Progresi Chapter:** Kasus makin sulit, dari `SELECT` dasar sampai `JOIN`, `SUBQUERY`, dan `GROUP BY`.

---

## 🎮 Cara Bermain

1. **Pilih chapter** di menu utama lalu tekan **Mulai investigasi**.
2. **Baca briefing** dan periksa objek di meja kerja 3D.
3. **Klik monitor** untuk masuk ke layar komputer.
4. **Tulis kueri SQL** di DB Studio. Hasilnya langsung tampil dalam bentuk tabel.
5. **Selesaikan kasus**: untuk chapter berbasis kueri, hasil kueri harus cocok dengan jawaban target. Untuk chapter investigasi, isi formulir di aplikasi `Laporkan`.
6. **Tekan `Esc`** atau pilih *Kembali ke meja* untuk keluar dari layar komputer.

Status chapter saat ini:

| No | Chapter | Level | Konsep SQL |
| :-- | :--- | :-- | :--- |
| 01 | Pendaftaran Anggota Baru | Dasar | SELECT, WHERE, AND, ORDER BY |
| 02 | Kartu Aktif | Dasar-menengah | COUNT, GROUP BY, HAVING |
| 03 | Jejak Peminjaman | Menengah | JOIN, LEFT JOIN, IS NULL |
| 04 | Jam Jaga | Menengah | BETWEEN, SUBQUERY, EXISTS |
| 05 | Denah Tersembunyi | Sulit | WITH, CASE, UNION |
| 06 | The Missing Manuscript | Sangat sulit | JOIN, SUBQUERY, GROUP BY |
| 07 | Rak yang Berpindah | Menengah | GROUP BY, HAVING, COUNT *(segera hadir)* |
| 08 | Denda yang Tak Pernah Dibayar | Menengah | LEFT JOIN, SUM, COALESCE *(segera hadir)* |
| 09 | Surat Tanpa Nama | Sulit | LIKE, ORDER BY *(segera hadir)* |
| 10 | Malam Terakhir | Sangat sulit | JOIN, SUBQUERY, GROUP BY *(segera hadir)* |

> Daftar di atas diambil dari `meta` masing-masing chapter. Chapter 07 sampai 10 belum punya data cerita dan hanya tampil sebagai placeholder di `UPCOMING_CHAPTERS`.

---

## 🛠️ Tech Stack

| Teknologi | Peran dalam Proyek |
| :--- | :--- |
| **Three.js** (`three`) | Merender meja kerja 3D, monitor, dan dokumen. Interaksi klik memakai Raycaster. |
| **React 19** | Membangun seluruh UI di dalam layar komputer: desktop, jendela aplikasi, terminal SQL, dan menu utama. |
| **Tailwind CSS v4** | *Styling* UI, dikonfigurasi lewat `@tailwindcss/postcss` dan `postcss.config.js`. |
| **TypeScript** | Tipe data untuk cerita kasus, hasil kueri, dan logika game. |
| **sql.js** | Menjalankan SQLite di *browser* (WebAssembly) untuk mengeksekusi kueri pemain. |
| **Font Awesome** | Ikon untuk dock dan aplikasi desktop. |
| **Vite 8** | *Build tool* dan *development server*. |
| **oxlint** | Linter. |

Dokumentasi teknis tambahan:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): alur game, struktur folder, dan cara data mengalir antar komponen.
- [`docs/MENAMBAH_CHAPTER.md`](docs/MENAMBAH_CHAPTER.md): panduan membuat chapter baru.

---

## 📂 Struktur Proyek

```text
siquery/
├── public/
│   ├── audio/               # Musik latar (bgm/) dan efek suara (effect/)
│   ├── models/              # Model 3D .glb: library, meja, macbook, rak, folder dokumen
│   └── sql-wasm.wasm        # Binary sql.js
├── src/
│   ├── cases/               # Data chapter, satu folder per chapter (story.ts)
│   ├── components/          # Komponen UI utama (MainMenu, Gameflow, Deskscene, Desktop, ...)
│   │   ├── desk-scene/      # Pembangun meja 3D dan konfigurasinya
│   │   ├── desktop/         # Aplikasi di dalam desktop (UniMail, Notepad, Report, Music, dock)
│   │   └── main-menu/       # Kartu chapter, panel audio, data contoh kueri
│   ├── context/             # DatabaseContext, NotepadContext
│   ├── engine/              # DatabaseEngine: wrapper sql.js (init, runQuery, reset)
│   ├── hooks/               # useDatabase, useWindowManager, useBGM, useSound, audioSettings
│   ├── types/               # Tipe CaseData, QueryResult, CaseReport, dan lainnya
│   ├── utils/               # parseSchema, checkAnswer, sqlHighlight, inbox, macAnimations
│   ├── App.tsx
│   ├── main.tsx             # Entry point Vite
│   └── index.css            # Tailwind dan gaya global
├── index.html
├── vite.config.ts
├── postcss.config.js
├── .oxlintrc.json
├── tsconfig*.json
└── package.json
```

---

## 🚀 Instalasi & Menjalankan

### Prasyarat

- Browser modern dengan dukungan WebGL.
- [Node.js](https://nodejs.org/) versi yang didukung Vite 8 (disarankan 20.19+ atau 22.12+).
- npm (ikut terpasang bersama Node.js).

### Langkah

```bash
# 1. Clone repositori
git clone https://github.com/ka-zukii/siquery.git
cd siquery

# 2. Pasang dependensi
npm install

# 3. Jalankan development server
npm run dev
```

Buka `http://localhost:5173` di browser.

### Script lain

| Perintah | Fungsi |
| :--- | :--- |
| `npm run dev` | Development server dengan HMR |
| `npm run build` | Cek tipe (`tsc -b`) lalu build produksi ke `dist/` |
| `npm run preview` | Menjalankan hasil build secara lokal |
| `npm run lint` | Menjalankan oxlint |

---

## 🤝 Berkontribusi

Ingin menambah chapter atau memperbaiki sesuatu? Baca [`docs/MENAMBAH_CHAPTER.md`](docs/MENAMBAH_CHAPTER.md) dan [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) terlebih dahulu. Sebelum mengirim perubahan, jalankan `npm run build` dan `npm run lint`.

---

## 🎯 Roadmap

- [x] Konsep *Database Detective* bergaya pustakawan dan pemilihan tech stack.
- [x] Meja kerja 3D dengan interaksi klik pada berkas dan barang bukti.
- [x] Mesin SQL di browser dan terminal DB Studio.
- [x] Sistem chapter dengan validasi jawaban dan formulir laporan.
- [x] Desktop bergaya macOS dengan jendela dan dock.
- [ ] Chapter 07 sampai 10.
- [ ] Playtesting dan rilis `v1.0.0`.

---

## 👥 Tim Pengembang

Dikembangkan oleh tim **Enuma Technology**:

- **Rizky Andika Sukma**: *Lead Developer & Database Logic Architect*
- **Anang Setiaji**: *3D Environment Designer & UI Developer*

---

## 📄 Lisensi

Belum ditentukan. Tambahkan file `LICENSE` sebelum repositori dibuka untuk umum.

<p align="center">
  Dibuat dengan ☕ dan kueri SQL oleh <b>Enuma Technology</b> (2026)
</p>
