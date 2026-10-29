# Arsitektur SiQuery

Dokumen ini menjelaskan bagaimana bagian-bagian SiQuery saling terhubung.

## Struktur Folder

Kode dibagi menjadi tiga lapisan:

- **`features/`**: satu folder per bagian permainan (menu, meja 3D, desktop, aplikasi, studio).
- **`shared/`**: kode yang dipakai lintas fitur (audio, context, hooks, komponen UI, utilitas).
- **`content/`**: data yang bukan logika, yaitu cerita chapter, tutorial, dan contoh kueri.

Selain itu ada `engine/` untuk mesin database dan `types/` untuk tipe bersama. Alias `@/` menunjuk ke `src/`, jadi import selalu ditulis dari sana, misalnya `@/shared/audio/useSound`.

## Alur Game

Game punya tiga fase yang dikelola di `src/features/flow/GameFlow.tsx`:

```
menu  ──(Mulai investigasi)──▶  desk (dunia 3D)  ──(klik monitor)──▶  pc (Desktop)
pc    ──(Esc / Kembali ke meja)──▶  desk  ──(‹ Menu)──▶  menu
```

- **menu**: `src/features/menu/MainMenu.tsx` menampilkan kartu chapter dari `src/content/cases/index.ts`. Chapter yang belum tersedia tampil sebagai "Segera hadir".
- **desk**: `src/features/desk-scene/DeskScene.tsx` merender meja, kamera orang pertama, dan objek yang bisa diklik.
- **pc**: `src/features/desktop/Desktop.tsx` menampilkan layar komputer dengan dock dan jendela aplikasi.

Setiap chapter dibungkus `DatabaseProvider` dengan `key` berupa id chapter. Akibatnya, database baru dibuat saat chapter dimulai, lalu tetap hidup selama pemain keluar-masuk komputer di chapter yang sama.

## Data Chapter

Satu chapter adalah satu objek `CaseData` (`src/types/case.types.ts`) yang disimpan di `src/content/cases/<nomor-judul>/story.ts`.

| Field | Fungsi |
| :--- | :--- |
| `id`, `title`, `date`, `briefing` | Identitas dan teks pembuka |
| `meta` | Nomor, lokasi, level 1–5, ringkasan, dan `skills` untuk kartu menu |
| `schemaSql` | `CREATE TABLE` dan `INSERT` yang membentuk database chapter |
| `answerSql` | Kueri target. Dipakai untuk validasi otomatis |
| `report` | Formulir laporan akhir (dipakai sebagai pengganti `answerSql`) |
| `clues` | Berkas dan barang bukti yang bisa dibaca di meja 3D |
| `emails` | Email yang tampil di aplikasi UniMail |
| `hints` | Petunjuk yang bisa dibuka pemain |
| `solution` | Kunci lama dari kasus pertama, belum dipakai untuk validasi |

## Mesin Database

- `src/engine/DatabaseEngine.ts` membungkus **sql.js**. Metodenya: `init(schemaSql)`, `runQuery(query)`, `resetDatabase()`, `close()`, dan `isReady()`.
- `src/shared/context/DatabaseContext.tsx` dan `src/shared/hooks/useDatabase.ts` menyediakan engine dan hasilnya ke komponen React.
- `runQuery` mengembalikan `QueryResult` (`columns`, `values`, `error`).
- Binary `sql-wasm.wasm` dimuat dari paket `sql.js` lewat import `?url` di Vite, jadi tidak perlu disalin ke `public/`.

## Validasi Jawaban

`src/shared/utils/checkAnswer.ts` menyediakan `isSameResult(player, expected)`:

- Jumlah baris harus sama dengan jawaban target.
- Setiap baris jawaban harus ditemukan di hasil pemain. Urutan baris dan kolom tidak penting.
- Kolom tambahan di hasil pemain diperbolehkan.
- Hasil kosong selalu dianggap salah.

File yang sama juga menyediakan `countMatchingRows`, `buildFeedback`, dan `describeFeedback` untuk memberi umpan balik ke pemain.

Chapter berbasis kueri memakai `answerSql`. Chapter investigasi memakai `report`, yaitu formulir pilihan ganda di aplikasi Laporkan dengan kunci `answer`.

## Sidebar Skema

`src/shared/utils/parseSchema.ts` membaca `CREATE TABLE` dari `schemaSql` dengan regex lalu mengambil nama tabel dan kolomnya lewat `parseSchema`. Hasilnya dipakai untuk daftar tabel di DB Studio.

## Meja 3D

- `src/features/desk-scene/desk-scene.config.ts` menyimpan semua angka posisi, ukuran, kamera, dan pencahayaan. Ubah nilai di sini untuk menyesuaikan tampilan.
- `buildDesk.ts` membangun meja dan objek dari model `.glb` di `public/models/`.
- `desk-scene.helpers.ts` berisi bantuan untuk objek dan kamera.
- Skala model: 1 unit ≈ 0,47 m.

## Desktop

- `src/features/desktop/Desktop.tsx` mengatur dock, jendela, dan aplikasi yang dibuka.
- `src/shared/hooks/useWindowManager.ts` dan `src/shared/ui/OSWindow.tsx` mengatur jendela (buka, tutup, minimize, dan fokus).
- Daftar aplikasi dock ada di `src/features/desktop/constants/desktop.constants.tsx`.
- Aplikasi (`id` di dock):
  - `siquery`: DB Studio (`src/features/studio/SiQueryStudio.tsx`)
  - `unimail`: UniMail (`src/features/apps/UniMailApp.tsx`)
  - `notepad`: Catatan (`src/features/apps/Notepad.tsx`, state di `src/shared/context/NotepadContext.tsx`)
  - `report`: Laporkan (`src/features/apps/ReportApp.tsx`)
  - `music`: Music (`src/features/apps/music/`)
  - `guide`: Panduan (`src/features/apps/GuideApp.tsx`)
- `src/shared/ui/DocViewer.tsx` menampilkan berkas yang dibuka dari meja.

## Audio

- Musik latar dikelola `src/shared/audio/useBGM.ts`, efek suara `src/shared/audio/useSound.ts`, dan tombol `src/shared/audio/useButtonSound.ts`.
- Pemutar musik (playlist, waktu, dan analyser) ada di `src/shared/audio/player.ts`.
- Pengaturan volume disimpan di `localStorage` lewat `src/shared/audio/audioSettings.ts`.
