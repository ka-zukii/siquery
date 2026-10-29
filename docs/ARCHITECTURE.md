# Arsitektur SiQuery

Dokumen ini menjelaskan bagaimana bagian-bagian SiQuery saling terhubung.

## Alur Game

Game punya tiga fase yang dikelola di `src/components/Gameflow.tsx`:

```
menu  ──(Mulai investigasi)──▶  desk (dunia 3D)  ──(klik monitor)──▶  pc (Desktop)
pc    ──(Esc / Kembali ke meja)──▶  desk  ──(‹ Menu)──▶  menu
```

- **menu**: `MainMenu.tsx` menampilkan kartu chapter dari `src/cases/index.ts`. Chapter yang belum tersedia tampil sebagai "Segera hadir".
- **desk**: `Deskscene.tsx` merender meja, kamera orang pertama, dan objek yang bisa diklik.
- **pc**: `Desktop.tsx` menampilkan layar komputer dengan dock dan jendela aplikasi.

Setiap chapter dibungkus `DatabaseProvider` dengan `key` berupa id chapter. Akibatnya, database baru dibuat saat chapter dimulai, lalu tetap hidup selama pemain keluar-masuk komputer di chapter yang sama.

## Data Chapter

Satu chapter adalah satu objek `CaseData` (`src/types/case.types.ts`) yang disimpan di `src/cases/<nomor-judul>/story.ts`.

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

- `src/engine/DatabaseEngine.ts` membungkus **sql.js**. Metodenya: `init(schemaSql)`, `runQuery(query)`, `resetDatabase()`, dan `close()`.
- `src/context/DatabaseContext.tsx` dan `src/hooks/useDatabase.ts` menyediakan engine dan hasilnya ke komponen React.
- `runQuery` mengembalikan `QueryResult` (`columns`, `values`, `error`).
- Binary `sql-wasm.wasm` dimuat dari `public/` lewat import `?url` di Vite.

## Validasi Jawaban

`src/utils/checkAnswer.ts` menyediakan `isSameResult(player, expected)`:

- Jumlah baris harus sama dengan jawaban target.
- Setiap baris jawaban harus ditemukan di hasil pemain. Urutan baris dan kolom tidak penting.
- Kolom tambahan di hasil pemain diperbolehkan.
- Hasil kosong selalu dianggap salah.

Chapter berbasis kueri memakai `answerSql`. Chapter investigasi memakai `report`, yaitu formulir pilihan ganda di aplikasi Laporkan dengan kunci `answer`.

## Sidebar Skema

`src/utils/parseSchema.ts` membaca `CREATE TABLE` dari `schemaSql` dengan regex lalu mengambil nama tabel dan kolomnya. Hasilnya dipakai untuk daftar tabel di DB Studio.

## Meja 3D

- `src/components/desk-scene/desk-scene.config.ts` menyimpan semua angka posisi, ukuran, kamera, dan pencahayaan. Ubah nilai di sini untuk menyesuaikan tampilan.
- `buildDesk.ts` membangun meja dan objek dari model `.glb` di `public/models/`.
- `desk-scene.helpers.ts` berisi bantuan untuk objek dan kamera.
- Skala model: 1 unit ≈ 0,47 m.

## Desktop

- `Desktop.tsx` mengatur dock, jendela, dan aplikasi yang dibuka.
- `hooks/useWindowManager.ts` dan `OSWindow.tsx` mengatur jendela (buka, tutup, minimize, dan fokus).
- Daftar aplikasi dock ada di `components/desktop/constants/desktop.constants.tsx`.
- Aplikasi: DB Studio (`SiQueryStudio.tsx`), UniMail, Catatan (`context/NotepadContext.tsx`), Laporkan (`ReportApp.tsx`), dan Music.
- `DocViewer.tsx` menampilkan berkas yang dibuka dari meja.

## Audio

- Musik latar dikelola `hooks/useBGM.ts`, efek suara `hooks/useSound.ts`.
- Pengaturan volume disimpan di `localStorage` lewat `hooks/audioSettings.ts`.
