# 📚 SiQuery: Campus Librarian

![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![SQL](https://img.shields.io/badge/Database-Local_SQL-4479A1?style=for-the-badge&logo=sqlite&logoColor=white)

> **Fokus ke layar. Periksa berkas di meja. Ketik kueri SQL untuk menyelesaikan tugas pustakawan.**

**SiQuery: Campus Librarian** adalah game teka-teki logika dan manajemen *database* berbasis *browser*, terinspirasi dari permainan bergaya _Database Detective_. Dalam game ini, pemain berperan sebagai petugas administrasi perpustakaan kampus. 

Tidak ada eksplorasi berjalan keliling ruangan; seluruh permainan berlangsung dari sudut pandang orang pertama di meja kerja Anda. Lingkungan meja (komputer, tumpukan formulir pendaftaran, kartu anggota mahasiswa, dan catatan tempel) di-*render* secara 3D interaktif menggunakan **Three.js**. Sementara itu, layar monitor komputer yang memuat terminal sistem manajemen perpustakaan dibangun menggunakan **React** dan **Tailwind CSS**. Pemain harus membaca petunjuk dari berkas di meja, lalu mengeksekusi kueri SQL yang tepat di komputer untuk menyelesaikan berbagai permasalahan sirkulasi dan keanggotaan.

---

## ✨ Fitur Utama

- **🖥️ Terminal Database Interaktif:** Layar utama permainan adalah sistem komputer perpustakaan. Ketik dan jalankan kueri SQL secara langsung untuk mencari data buku, memproses peminjaman, atau mendaftarkan anggota.
- **🗂️ Eksplorasi Meja Kerja 3D (Point-and-Click):** Gunakan _mouse_ untuk menginspeksi objek 3D di atas meja kerja Anda. Klik pada formulir kertas untuk membacanya, atau periksa catatan tempel (*sticky notes*) yang berisi petunjuk *password* atau instruksi dari pustakawan shift sebelumnya.
- **🧩 Teka-teki Berbasis Kueri (SQL Puzzles):** Pecahkan masalah harian. Contoh: _"Ada mahasiswa yang lupa judul buku yang dipinjam, tapi ingat nama depan penulis dan tahun terbitnya."_ Anda harus merangkai kueri yang tepat untuk menemukan ID buku tersebut.
- **📅 Manajemen Tugas Harian:** Selesaikan tumpukan _tiket_ tugas (pendaftaran massal mahasiswa baru, pelacakan buku hilang, perhitungan denda keterlambatan) yang terus diperbarui setiap harinya.

---

## 🎮 Mekanisme Permainan

1. **Menerima Tugas (Ticketing):** Di awal _shift_, Anda akan melihat tumpukan dokumen fisik di meja 3D atau notifikasi email masuk di layar komputer.
2. **Inspeksi Bukti Fisik:** Klik dan baca dokumen pendukung di atas meja (seperti KTM mahasiswa, struk pengembalian, atau daftar buku donasi).
3. **Analisis & Kueri:** Beralih ke layar monitor (UI React). Tulis kueri SQL (SELECT, INSERT, UPDATE, JOIN) pada terminal berdasarkan petunjuk dari dokumen fisik.
4. **Validasi & Eksekusi:** Sistem akan memvalidasi *output* data dari kueri Anda. Jika data yang dikembalikan sesuai dengan target tugas, masalah dianggap selesai dan tiket ditutup.
5. **Progresi:** Seiring berjalannya hari, struktur *database* yang harus dikelola akan semakin kompleks (melibatkan banyak relasi tabel).

---

## 🛠️ Spesifikasi & Tech Stack

| Teknologi | Peran dalam Proyek |
| :--- | :--- |
| **Three.js** | Me-*render* ruang lingkup meja kerja secara 3D (monitor, *keyboard*, kertas berkas, alat tulis) dan menangani interaksi klik (Raycaster). |
| **React** | Membangun UI yang ada **di dalam** layar monitor komputer (terminal SQL, *inbox* tugas, tabel hasil kueri). |
| **Tailwind CSS** | Melakukan *styling* secara cepat untuk UI sistem perpustakaan agar terlihat seperti OS retro atau dasbor admin modern. |
| **TypeScript** | Menjaga keamanan tipe data (*static typing*) pada logika *gameplay*, interaksi 3D, dan pemrosesan kueri. |
| **Local SQL (e.g., sql.js / alasql)** | Menjalankan *engine* SQL di sisi *client* (*browser*) untuk mengeksekusi dan memvalidasi kueri pemain terhadap *database* perpustakaan *dummy*. |
| **Vite** | *Build tool* dan *development server* super cepat untuk ekosistem React. |

---

## 📂 Struktur Direktori

```text
siquery/
├── public/
│   └── assets/              # Model 3D (meja, komputer, berkas, kertas), tekstur, suara
├── src/
│   ├── components/          # Komponen UI React (SQL Terminal, Data Table, Task Inbox)
│   ├── engine/              # Logika Three.js (Setup Scene Meja, Raycaster/Click Handler)
│   ├── database/            # Setup sql.js/alasql, skema relasional, dan dataset awal
│   ├── puzzles/             # Logika teka-teki, misi harian, dan sistem validasi jawaban
│   ├── App.tsx              # Manajemen state global (transisi 3D ke UI 2D layar)
│   ├── index.css            # Entry point Tailwind CSS
│   └── main.tsx             # Entry point aplikasi Vite
├── index.html               # Halaman utama
├── tailwind.config.js       # Konfigurasi Tailwind CSS
├── vite.config.ts           # Konfigurasi Vite
└── README.md                # Dokumentasi proyek
```

---

## 🚀 Cara Instalasi & Menjalankan Game

Proyek ini dibangun menggunakan Vite + React. Ikuti langkah berikut untuk menjalankan _development server_.

### Prasyarat

- Web Browser modern yang mendukung WebGL.
- [Node.js](https://nodejs.org/) (versi 16+ direkomendasikan).

### Langkah-langkah

1. **Clone repositori ini:**

   ```bash
   git clone https://github.com/username-anda/siquery.git
   cd siquery
   ```

2. **Instalasi dependensi:**

   ```bash
   npm install
   ```

3. **Jalankan Development Server:**

   ```bash
   npm run dev
   ```
   Buka URL yang muncul di terminal (biasanya `http://localhost:5173`) di _browser_ Anda.

---

## 🎯 Target Pencapaian (Roadmap)

- [x] Perancangan konsep *Database Detective* bergaya pustakawan & penentuan Tech Stack (React + Tailwind + Three.js).
- [ ] **Milestone 1: Meja Kerja 3D & Sistem Inspeksi**
  - Pembuatan dan pemuatan model 3D meja kerja, monitor, dan dokumen fisik.
  - Implementasi mekanik klik untuk membaca dokumen (KTM, formulir kertas).
- [ ] **Milestone 2: Mesin Database & UI Komputer**
  - Implementasi *local SQL engine* (menggunakan sql.js atau alasql).
  - Pembuatan UI terminal komputer (UI React) untuk mengetik SQL dan menampilkan hasil dalam bentuk tabel.
- [ ] **Milestone 3: Skenario Kasus & Validasi**
  - Pembuatan dataset *dummy* (Tabel: `students`, `books`, `loans`, `authors`).
  - Merancang sistem tiket/misi harian dari level dasar (SELECT) hingga kompleks (JOIN, UPDATE).
- [ ] _Playtesting_ dan perilisan versi `v1.0.0`.

---

## 👥 Tim Pengembang

Proyek ini dikembangkan oleh tim dari **Enuma Technology**:

- **Rizky Andika Sukma** - _Lead Developer & Database Logic Architect_
- **Anang Setiaji** - _3D Environment Designer & UI Developer_

---

<p align="center">
  Dibuat dengan ☕ dan kueri SQL oleh <b>Enuma Technology</b> (2026)
</p>