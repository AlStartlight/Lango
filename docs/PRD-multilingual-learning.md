# PRD — Lango: Pembelajaran Multibahasa 12 Bahasa & Kurikulum JLPT/CEFR

**Status:** Draft untuk persetujuan  
**Versi:** 1.0  
**Tanggal:** 2026-11-25  
**Pemilik:** Product  
**Spec terkait:** `context/feature-specs/08-locale-preference-and-curriculum.md` (locale & katalog), `context/feature-specs/09-multilingual-curriculum-platform.md` (platform konten)  
**Baseline PRD:** `docs/PRD.md` v1.1

**Update 2026-11-25:** Model pengalaman berbasis bank soal digantikan oleh pendekatan **story-first** di `docs/PRD-story-first-curriculum.md`. Keputusan platform konten, pipeline QA, locale, multi-bahasa, dan storage di dokumen ini tetap berlaku.

---

## 0. Ringkasan Keputusan yang Diminta

| ID | Keputusan | Rekomendasi | Dampak jika ditolak |
|---|---|---|---|
| **D-01** | Skala konten | Lantai agregat **120.000 soal** (12 × 10.000); target dan gate `full` **126.000 soal** (12 × 10.500) | 120.000 saja tidak membuat satu bahasa pun `full`; jangan campur lantai agregat dengan gate per bahasa |
| **D-02** | Bahasa yang dicakup | **12 bahasa** di registry: `en, es, id, ja, hi, de, ar, fr, pt, it, nl, ko`; kode UI Jepang tetap `jp`, kode konten `ja` | Katalog harus menurunkan klaim bahasa; `bn`/`zh`/`ru` harus dihapus atau ditandai tidak didukung |
| **D-03** | Framework | Jepang **JLPT N5–N1**; 11 bahasa lain **CEFR A1–C1** | Tidak ada jalur ujian yang jelas; konten sulit diurutkan |
| **D-04** | Model rilis | Bertahap per gelombang dengan status `full` / `beta` / `preview` / `none`; **tidak** ada fallback konten lintas bahasa | Peluncuran serentak berisiko merilis konten belum direview |
| **D-05** | Kualitas konten | **Tidak ada soal placeholder**; 100% soal punya penjelasan `id` + `en`; 100% listening punya audio + transkrip; review penutur asli | Target jumlah tercapai tetapi produk tidak dipercaya |
| **D-06** | Produksi konten | AI hanya untuk **drafting offline**; publikasi wajib lolos QA otomatis + review manusia; tidak ada generasi soal saat learner mengerjakan | Biaya dan latensi naik; kualitas tidak konsisten |
| **D-07** | Penyimpanan | Konten terstruktur di **PostgreSQL**; audio/gambar di object storage + CDN; sumber authoring JSON di repo (Git LFS) | Query progres/laporan sulit; duplikasi data |
| **D-08** | Multi-bahasa pengguna | Satu akun dapat mendaftar ke **banyak bahasa**; satu bahasa aktif; progres per bahasa terpisah | Pengguna harus membuat akun baru untuk bahasa kedua |
| **D-09** | Bahasa penjelasan | Rilis awal: `id`, `en`, plus `ja` untuk konten Jepang; locale lain fallback `en` dengan notice | 12 bahasa penjelasan berarti 1,5 juta+ baris terjemahan; tidak realistis di v1 |
| **D-10** | Legal/IP | Konten **original**, tidak menyalin soal JLPT/TOEFL/IELTS; disclaimer “tidak berafiliasi” | Risiko hukum dan takedown |

> **Rekomendasi angka:** 10.500 soal per bahasa dipilih karena strukturnya bersih: **5 level × 60 pelajaran, rata-rata 35 soal/pelajaran**. Ini melewati ambang 10.000 tanpa membuat struktur level timpang. Jumlah per pelajaran boleh 30–43; total per level tetap 2.100.

---

## 1. Ringkasan Eksekutif

Lango memposisikan diri sebagai platform belajar banyak bahasa, tetapi produk saat ini baru memiliki **satu jalur konten yang terlihat utuh** (Grammar Inggris) dan bahkan sebagian besar isinya masih placeholder. Dari 2.232 latihan Grammar Inggris yang ada, **2.112 (94,6%)** memakai kalimat contoh generik seperti “This is an example of …” dan bukan soal yang layak dipublikasikan. Number Name juga belum menjadi kurikulum bahasa yang utuh.

PRD ini mendefinisikan program untuk mengubah Lango dari **katalog bahasa** menjadi **platform pembelajaran multibahasa yang benar-benar berisi**:

- **Jepang:** JLPT N5–N1, 5 jenjang, 300 pelajaran, **10.500 soal**, lengkap dengan kosakata, kanji, tata bahasa, membaca, dan mendengar.
- **Inggris:** CEFR A1–C1, 5 jenjang, 300 pelajaran, **10.500 soal**.
- **10 bahasa lain:** masing-masing CEFR A1–C1, 300 pelajaran, **10.500 soal**.
- **Total:** 12 bahasa, 60 level, 720 unit, 3.600 pelajaran, **126.000 soal**, ±5.200 aset audio listening, ±11.000 passage/transkrip, dan materi pelajaran untuk setiap pelajaran.
- **Pengalaman:** satu akun dapat belajar beberapa bahasa; progres, level, dan review terpisah per bahasa; UI tetap mengikuti locale, konten mengikuti bahasa yang dipelajari.

Program ini **bukan** proyek konten sekali jalan. Ini adalah kapabilitas operasional: pipeline authoring, QA, publikasi berversi, koreksi soal, dan pengukuran kualitas item. Tanpa kapabilitas itu, 126.000 soal hanya akan menjadi 126.000 masalah.

**Definisi sukses:** 12 bahasa berstatus `full` dengan jumlah yang dapat diverifikasi API, nol placeholder, review penutur asli tercatat, dan learner dapat menyelesaikan satu pelajaran bermakna di bahasa mana pun tanpa kehilangan progres.

---

## 2. Konteks dan Masalah

### 2.1 Pernyataan masalah

Lango menjanjikan “belajar bahasa apa pun” di halaman marketing, tetapi pengguna yang memilih Jepang, Korea, Arab, atau bahasa lain akan bertemu salah satu dari tiga kondisi:

1. **Tidak ada konten** untuk bahasa tersebut.
2. **Konten Inggris** ditampilkan seolah-olah konten bahasa target.
3. **Konten ada, tetapi kualitasnya rendah** dan tidak diorganisir sebagai kurikulum.

Masalah intinya bukan sekadar jumlah soal. Masalahnya adalah **tidak ada model konten, pipeline kualitas, dan progres per bahasa** yang membuat 10.000+ soal per bahasa dapat dipercaya, dirawat, dan dijual.

### 2.2 Temuan audit baseline

| # | Temuan | Bukti | Dampak |
|---|---|---|---|
| **A-01** | 12 bahasa ada di registry dan seed, tetapi hanya Inggris yang punya modul konten | `prisma/seed.ts` `LANGUAGES`; `app/components/editor/workspace-page.tsx` hanya `number-name` + `grammar` | Janji marketing tidak terpenuhi |
| **A-02** | Grammar Inggris 2.232 latihan, tetapi 2.112 di antaranya memakai explanation/soal placeholder | `grammar-data.ts`: 2.112 × “This is an example of …”; 50 × “fundamental principle of …” | Konten tidak layak dipublikasikan; harus diganti, bukan diimpor |
| **A-03** | Distribusi level Grammar tidak seimbang | A1 4, A2 3, B1 3, B2 25, C1 25 pelajaran | Tidak ada jalur A1–B1 yang memadai |
| **A-04** | Belum ada tabel `Curriculum`, `Lesson`, `Question`, atau `Passage` | `prisma/schema.prisma` hanya model mock/legacy | Tidak ada sumber kebenaran konten |
| **A-05** | Progres hanya satu bahasa (`User.targetLanguage`) | `User.targetLanguage`, `User.cefrLevel`; tidak ada enrollment per bahasa | Belajar bahasa kedua merusak/menimpa konteks |
| **A-06** | `/learn` adalah workspace client-side tanpa URL konten yang stabil | `app/[lang]/learn/page.tsx` → `WorkspacePage` | Tidak bisa deep-link, resume, atau berbagi pelajaran |
| **A-07** | Tidak ada pipeline QA, versi konten, atau audit review | Tidak ada `content/`, `check:curriculum`, atau tabel review | Koreksi soal tidak terlacak |
| **A-08** | Kode locale `jp` berbeda dari kode konten `ja` | `app/i18n-config.ts` vs `number-data.ts` | Risiko fallback diam-diam ke Inggris/TTS salah |
| **A-09** | Daftar bahasa tersebar dan tidak konsisten; Bengali masih tampil | `app/utils/flags.ts`: `flagImages.bn`, `languagesList` Bengali dengan `href: '/learn/bengali'`; `languageOptions` 12 | Janji 12 bahasa bocor menjadi 13/14; link mati |
| **A-10** | Union kode Number Name memuat 21 bahasa di luar cakupan | `number-name/types.ts`: `bn`, `zh`, `ru`, `sv`, `da`, `fi`, `no`, `pl`, `tr` | TTS/audio bisa memakai kode tanpa konten; data kotor |
| **A-11** | Seed menyimpan nama tampilan di `targetLanguage`/`learningLanguage` | `prisma/seed.ts`: `"Spanish"` | Migrasi ke kode konten wajib; jika tidak, lookup gagal |

### 2.3 Mengapa sekarang

- **Permintaan ujian nyata:** Jepang adalah pasar dengan jalur JLPT yang jelas; pengguna mencari N5–N1, bukan “Japanese beginner”.
- **Biaya teknis meningkat:** setiap bulan tanpa model konten membuat migrasi 126.000 soal makin mahal dan progres pengguna makin sulit dipetakan.
- **Kepercayaan produk:** konten placeholder yang terlanjur dirilis lebih merusak daripada empty state yang jujur.
- **Skala operasional:** AI membuat drafting 10.000+ soal mungkin secara biaya, tetapi hanya review manusia yang membuatnya layak.

### 2.4 Jobs to Done

| Job | Konteks | Keberhasilan |
|---|---|---|
| “Saya ingin lulus JLPT N4 tahun depan.” | Karyawan Indonesia, belajar 20 menit/hari | Tahu posisi level, menyelesaikan jalur N5→N4, latihan listening, percaya pada pembahasan |
| “Saya butuh bahasa Inggris untuk rapat kerja.” | Profesional, level B1 | Bisa memilih fokus speaking/use of English, latihan konteks kerja |
| “Saya sedang belajar bahasa keempat; jangan buat saya mulai dari nol akun baru.” | Polyglot | Satu akun, banyak bahasa, progres terpisah, bisa berpindah kapan saja |
| “Saya sudah pernah belajar, tapi tidak tahu level saya.” | Returning learner | Panduan level yang jelas dan bisa memilih level tanpa dikunci |
| “Saya menemukan jawaban yang salah.” | Learner di tengah latihan | Bisa melaporkan; soal diperbaiki/di-retire tanpa menghapus riwayat |

---

## 3. Visi, Positioning, dan Prinsip

### 3.1 Visi

**Satu aplikasi untuk belajar bahasa yang benar-benar kamu pilih, dengan jalur yang jelas menuju kemampuan yang bisa dibuktikan.**

### 3.2 Positioning

Lango bukan pengganti sertifikasi resmi. Lango adalah **latihan terstruktur, harian, dan terukur** yang mengikuti kerangka yang dikenal (JLPT/CEFR), dengan konten original dan pembahasan yang membantu learner memahami kesalahan.

### 3.3 Prinsip produk

1. **Kualitas > jumlah.** 10.500 soal yang direview lebih baik daripada 30.000 soal hasil generate tanpa kurasi.
2. **Jujur tentang ketersediaan.** `beta` berarti beta; `none` berarti belum ada. Tidak ada fallback diam-diam ke Inggris.
3. **Level adalah janji, bukan label.** Setiap level punya can-do statement, cakupan kosakata/kanji/grammar, dan checkpoint.
4. **Satu akun, banyak bahasa.** Bahasa aktif adalah preferensi, bukan identitas.
5. **Progress harus bertahan.** Ganti bahasa, ganti UI locale, atau refresh tidak boleh menghapus progres.
6. **Konten adalah data berversi.** Setiap soal punya ID, versi, status, reviewer, dan lisensi.
7. **Belajar tidak menghukum.** Kesalahan menghasilkan penjelasan, bukan rasa malu; tidak ada timer wajib.
8. **Aksesibel sejak desain.** RTL, font CJK/Devanagari, transkrip audio, keyboard, dan screen reader bukan tambahan akhir.

### 3.4 Non-goals program ini

- Sertifikasi resmi, skor resmi JLPT/TOEFL/IELTS, atau klaim kelulusan.
- Menyalin/mereproduksi soal ujian resmi atau “past paper”.
- Speaking assessment otomatis (pronunciation scoring) — tetap modul terpisah.
- Placement test adaptif penuh — v1 memakai self-select + panduan level.
- Framework lain (TOPIK, HSK, DELF, Goethe, DELE) — arsitektur disiapkan, implementasi tidak.
- 12 bahasa penjelasan penuh pada rilis awal — hanya `id`, `en`, `ja`.
- CMS admin penuh — v1 memakai CLI + PR review.
- Billing/subscription baru — monetisasi mengikuti kebijakan produk yang ada.
- Offline download 126.000 soal.

---

## 4. Target Pengguna

### 4.1 Persona utama

| Persona | Profil | Kebutuhan | Pemicu | Risiko churn |
|---|---|---|---|---|
| **Rani — JLPT planner** | 24, karyawan, Indonesia, target N4 | Jalur N5–N4, kanji, listening, pembahasan bahasa Indonesia | Ujian 9 bulan lagi | Tidak tahu progres; listening terlalu sulit; penjelasan Inggris |
| **Bagas — English professional** | 31, B1, ingin B2 | Grammar/use of English, reading cepat, latihan konteks kerja | Promosi | Konten terlalu akademik; tidak relevan |
| **Sinta — Polyglot** | 27, sudah belajar Jepang & Spanyol | Banyak bahasa dalam satu akun, progres terpisah | Ingin bahasa ketiga | Harus membuat akun baru; progres tercampur |
| **Dimas — Retaker N2** | 29, gagal N2 sekali | Latihan N2 intensif, analisis kelemahan, mock section | Ujian berikutnya | Latihan terlalu mudah; tidak ada item stats |
| **Maya — Content reviewer** | 35, native Japanese speaker, kontraktor | Alat review, checklist, konteks level, audit trail | Kebutuhan kapasitas | Alur review manual, tidak ada insentif kualitas |

### 4.2 Kebutuhan lintas persona

- Tahu **di mana saya sekarang** (level, unit, pelajaran, progres).
- Tahu **apa yang harus dilakukan hari ini** (plan, rekomendasi, review jatuh tempo).
- Tahu **mengapa jawaban saya salah** (pembahasan, aturan, contoh).
- Tahu **apakah saya siap ujian** (checkpoint, cakupan skill, bukan klaim palsu).
- Bisa **berpindah bahasa** tanpa kehilangan apa pun.

---

## 5. Ruang Lingkup dan Komitmen Volume

### 5.1 In scope

| Area | Deliverable | Prioritas |
|---|---|---|
| Registry & availability | 12 bahasa, status dan jumlah dari DB/API; hapus `bn`/Bengali dari flags/`languagesList` dan batasi union Number Name ke 12 kode | P0 |
| Multi-language enrollment | Profil bahasa per akun, bahasa aktif, level aktif | P0 |
| Katalog kurikulum | 12 bahasa × 5 level, jumlah pelajaran/soal | P0 |
| Kurikulum Jepang | JLPT N5–N1, 10.500 soal, 300 pelajaran | P0 |
| Kurikulum Inggris | CEFR A1–C1, 10.500 soal, 300 pelajaran | P0 |
| 10 bahasa lain | Masing-masing 10.500 soal, 300 pelajaran | P0 (gelombang) |
| Materi pelajaran | Objective, explanation, rules, examples, tips, vocab set | P0 |
| Question types | MCQ, fill, ordering, matching, kanji reading, reading, listening, correction | P0 |
| Audio listening | ±5.200 aset, transkrip, CDN | P0 |
| Progress per bahasa | Lesson progress, resume, mastery, review | P0 |
| Feedback & results | Pembahasan, jawaban benar, ulangi salah | P0 |
| Localization | UI 12 locale; penjelasan `id`/`en`/`ja` | P0 |
| Content pipeline | Authoring, QA, import, publish, rollback, retirement | P0 |
| Content health | Item stats, flag, correction workflow | P1 |
| Checkpoint/level test | Memakai bank soal, bukan konten baru | P1 |
| Search & filter | Bahasa, level, skill, judul pelajaran | P1 |
| Analytics | Funnel, engagement, learning outcome, item health | P1 |
| Admin read-only | Dashboard kesehatan konten | P2 |

### 5.2 Out of scope

Lihat §3.4. Tambahan: tutor marketplace, live session, AI tutor percakapan, laporan PDF, dan ekspor SCORM tidak termasuk dalam PRD ini.

### 5.3 Status ketersediaan

| Status | Definisi | Yang dilihat learner |
|---|---|---|
| **`full`** | 10.500 soal published, 300 pelajaran, 100% materi/audio, review sign-off, tidak ada placeholder | Jalur lengkap; badge “Lengkap” |
| **`beta`** | Minimal 2.100 soal published (1 level penuh), review tercatat, audio untuk level tersebut | Badge “Beta · X soal”; tetap bisa dipakai |
| **`preview`** | 1 unit pilot (±175 soal) untuk uji internal/early access | Badge “Pratinjau”; akses terbatas |
| **`none`** | Belum ada konten published | Empty state jujur + CTA ganti bahasa |

Aturan: status dihitung dari **soal published**, bukan draft. Tidak ada bahasa yang tampil `full` jika kurang dari 10.500 soal published.

### 5.4 Komitmen volume

| Bahasa | Kode konten | Framework | Level | Pelajaran | Soal | Target status |
|---|---|---|---|---|---|---|
| Jepang | `ja` | JLPT | N5, N4, N3, N2, N1 | 300 | **10.500** | `full` |
| Inggris | `en` | CEFR | A1, A2, B1, B2, C1 | 300 | **10.500** | `full` |
| Indonesia | `id` | CEFR | A1–C1 | 300 | **10.500** | `full` |
| Spanyol | `es` | CEFR | A1–C1 | 300 | **10.500** | `full` |
| Prancis | `fr` | CEFR | A1–C1 | 300 | **10.500** | `full` |
| Jerman | `de` | CEFR | A1–C1 | 300 | **10.500** | `full` |
| Portugis | `pt` | CEFR | A1–C1 | 300 | **10.500** | `full` |
| Italia | `it` | CEFR | A1–C1 | 300 | **10.500** | `full` |
| Belanda | `nl` | CEFR | A1–C1 | 300 | **10.500** | `full` |
| Korea | `ko` | CEFR | A1–C1 | 300 | **10.500** | `full` |
| Hindi | `hi` | CEFR | A1–C1 | 300 | **10.500** | `full` |
| Arab | `ar` | CEFR | A1–C1 | 300 | **10.500** | `full` |
| **Total** | **12** | **2 framework** | **60 level** | **3.600** | **126.000** | **12 `full`** |

**Ambang minimum agregat:** 120.000 soal (12 × 10.000). **Target dan gate `full`:** 126.000 (12 × 10.500). Keduanya bukan hal yang sama: 120.000 adalah lantai “program tidak gagal total”, sedangkan `full` mensyaratkan **10.500 per bahasa**. Jika salah satu bahasa <10.500, statusnya maksimum `beta` dan total 126.000 tidak tercapai.

### 5.5 Definisi sukses program

| Dimensi | Metrik | Target |
|---|---|---|
| **Coverage** | Bahasa berstatus `full` | 12/12 pada akhir program |
| **Coverage** | Soal published | 126.000 |
| **Coverage** | Pelajaran + materi published | 3.600 |
| **Quality** | Soal placeholder | 0 |
| **Quality** | Soal dengan penjelasan `id` + `en` | 100% |
| **Quality** | Listening dengan audio + transkrip | 100% |
| **Quality** | Reading dengan passage | 100% |
| **Quality** | Duplikat fingerprint | 0 |
| **Quality** | Near-duplicate | < 0,5% |
| **Quality** | Defect rate sampel review | ≤ 1% |
| **Quality** | Answer-key audit | ≥ 98% benar (metrik audit); 0 jawaban salah diketahui lolos publish |
| **Learning** | Lesson completion (started → completed) | ≥ 70% |
| **Learning** | Akurasi latihan meningkat setelah 4 minggu | +10 poin persentase |
| **Engagement** | D7 retention learner aktif | +15% vs baseline |
| **Engagement** | Learner dengan ≥ 2 bahasa terdaftar | ≥ 20% dalam 6 bulan |
| **Performance** | p95 muat pelajaran | ≤ 300 ms (server), LCP ≤ 2,5 s |
| **Ops** | Waktu koreksi soal kritis | ≤ 72 jam |
| **Ops** | Throughput review | ≥ 2.000 soal/minggu pada steady state |

---

## 6. Information Architecture dan User Journey

### 6.1 Peta rute

| Rute | Isi | Auth |
|---|---|---|
| `/[lang]/learn` | Workspace “Hari ini” untuk bahasa aktif | Ya |
| `/[lang]/learn?module=curriculum` | Katalog kurikulum | Ya |
| `/[lang]/learn?module=curriculum&language=ja` | Hub bahasa Jepang + level | Ya |
| `/[lang]/learn?module=curriculum&language=ja&level=N5` | Daftar unit/pelajaran N5 | Ya |
| `/[lang]/learn?module=curriculum&language=ja&level=N5&lesson=<id>` | Pelajaran | Ya |
| `/[lang]/practice/review` | Review jatuh tempo lintas modul (hindari tabrakan dengan `/[lang]/reviews` marketing) | Ya |
| `/[lang]/progress` | Progres per bahasa | Ya |
| `/[lang]/profile` | Bahasa & wilayah, bahasa belajar, level | Ya |
| `/[lang]/onboarding` | Pilih bahasa, level, goal | Ya |

Catatan: `[lang]` adalah **locale UI**, bukan bahasa belajar. Kode rute `jp` tetap dipertahankan untuk URL; kode konten Jepang adalah `ja`. Detail keputusan ini ada di FS-08.

### 6.2 Navigasi utama

- **Sidebar:** Hari Ini, Kurikulum, Review, Progres, Profil.
- **Header:** bahasa aktif + level, streak, XP, tombol ganti bahasa.
- **Dalam pelajaran:** breadcrumb bahasa → level → unit → pelajaran; tombol keluar; progress soal.
- **Mobile:** bottom navigation untuk 4 tujuan utama; sidebar menjadi drawer.

### 6.3 Hierarki layar

```
Dashboard (bahasa aktif)
└── Katalog bahasa (12)
    └── Hub bahasa (level N5–N1 / A1–C1)
        └── Level (unit 1–12)
            └── Unit (5 pelajaran)
                └── Pelajaran (materi + 30–43 soal)
                    ├── Practice
                    └── Results / Review
```

### 6.4 Journey utama

**A. Rani mulai JLPT N4**

1. Onboarding: pilih “Jepang”, target “JLPT”, level “N5”.
2. Dashboard menampilkan jalur N5, unit 1, estimasi 20 menit/hari.
3. Rani membuka pelajaran kosakata; melihat daftar kata + furigana + audio.
4. Mengerjakan 30–43 soal; feedback menampilkan pembahasan bahasa Indonesia.
5. Hasil: akurasi 74%; item salah masuk review; rekomendasi unit berikutnya.
6. Setelah 3 unit, checkpoint 20 soal; Rani melihat cakupan skill dan kelemahan.
7. Di profil, Rani menambahkan bahasa Inggris; progres Jepang tidak berubah.

**B. Bagas kembali setelah seminggu**

1. Login → dashboard menampilkan “Lanjutkan B1 Unit 4, soal 12”.
2. Resume bekerja; tidak mengulang soal yang sudah dijawab.
3. Review menampilkan 8 item jatuh tempo dari kesalahan sebelumnya.
4. Setelah selesai, streak global bertambah; progres B1 tersimpan.

**C. Sinta berpindah bahasa**

1. Dari hub Jepang, Sinta membuka pemilih bahasa.
2. Memilih Spanyol; bahasa aktif berubah, level Spanyol masih A1.
3. Kembali ke Jepang; posisi N3 unit 2 soal 18 tetap ada.
4. UI tetap Indonesia; konten mengikuti bahasa aktif.

**D. Dimas berlatih N2**

1. Memilih N2 langsung (tidak dikunci oleh N1/N3).
2. Mengerjakan reading passage panjang; melihat pembahasan dan referensi grammar.
3. Checkpoint N2 menunjukkan akurasi per skill: reading 68%, listening 81%.
4. Rekomendasi: 2 unit reading + 1 unit listening; tidak ada klaim “siap lulus”.

**E. Learner menemukan jawaban salah**

1. Menekan “Laporkan soal” di results.
2. Memilih alasan: jawaban salah, audio rusak, penjelasan tidak jelas, typo.
3. Laporan masuk antrean; soal ditandai; jika dikonfirmasi, soal di-retire/direvisi.
4. Learner melihat status laporan; attempt lama tetap tersimpan.

**F. Pengguna baru memilih bahasa tanpa konten**

1. Katalog menampilkan 12 bahasa; Arab berstatus `beta`/`none`.
2. Jika `none`: empty state “Kurikulum Arab belum tersedia”, CTA ganti bahasa.
3. Tidak ada konten Inggris yang muncul; tidak ada redirect diam-diam.

---

## 7. Functional Requirements

Prioritas: **P0** wajib untuk rilis `full`; **P1** untuk pengalaman lengkap; **P2** untuk skala/ops.

### FR-01 — Registry bahasa & ketersediaan

- Registry statis 12 bahasa menjadi satu-satunya sumber metadata: kode, endonym, arah teks, script, framework, status, jumlah soal.
- API `GET /api/v1/languages` mengembalikan 12 bahasa + `availability` + `questionCount` + `lessonCount`.
- Jumlah dihitung dari soal `published`; draft/retired tidak dihitung.
- Tidak ada daftar bahasa duplikat di komponen.

**Acceptance:** semua halaman menampilkan 12 bahasa dari registry; menambah/menghapus bahasa hanya mengubah satu entri + konten.

### FR-02 — Multi-language enrollment & bahasa aktif

- Satu akun dapat memiliki banyak `UserLanguageProfile` (satu per bahasa).
- Satu bahasa aktif pada satu waktu; `User.targetLanguage` menyimpan pointer aktif.
- Level aktif per bahasa disimpan di profil bahasa.
- Menambahkan bahasa tidak menghapus progres bahasa lain.
- Onboarding memungkinkan memilih lebih dari satu bahasa (opsional) atau menambah nanti.

**Acceptance:** learner dengan Jepang + Inggris dapat berpindah tanpa kehilangan `LessonProgress`, XP, atau review.

### FR-03 — Katalog & level picker

- Katalog menampilkan 12 bahasa dengan status jujur dan jumlah.
- Hub bahasa menampilkan 5 level, can-do statement, jumlah pelajaran/soal, dan status.
- Level dapat dipilih bebas; urutan direkomendasikan tetapi tidak mengunci.
- Level guide menjelaskan siapa yang cocok, cakupan, dan estimasi waktu.

**Acceptance:** learner dapat membuka N2 tanpa menyelesaikan N5; sistem tetap menandai level sebagai “disarankan” bukan “terkunci”.

### FR-04 — Kurikulum Jepang JLPT N5–N1

- 5 level × 60 pelajaran; 2.100 soal/level (rata-rata 35 soal/pelajaran); 10.500 soal; 300 pelajaran; 60 unit.
- Setiap level memiliki distribusi skill: kosakata 620, kanji 400, tata bahasa 480, membaca 320, mendengar 280.
- Kanji, kosakata, dan grammar mengikuti whitelist level; N5 tidak boleh memakai kanji N1.
- N5/N4 menyediakan furigana pada kata sulit; N2/N1 tidak.
- Listening memakai audio natural; kecepatan sesuai level; transkrip tersedia setelah submit.
- Reading memakai passage original (notifikasi, email, artikel, esai) dengan panjang sesuai level.
- Tidak ada klaim resmi JLPT; disclaimer ditampilkan di hub dan halaman hasil.

**Acceptance:** API `GET /api/v1/curricula/ja` melaporkan 5 level, 60 pelajaran/level, 2.100 soal/level, total 10.500.

### FR-05 — Kurikulum Inggris CEFR A1–C1

- 5 level × 60 pelajaran; 2.100 soal/level (rata-rata 35 soal/pelajaran); 10.500 soal; 300 pelajaran.
- Skill: kosakata 450, tata bahasa 600, membaca 400, mendengar 350, use of English 300 per level.
- Variasi ejaan `en-US` utama; catatan `en-GB` pada item relevan.
- Listening mencakup aksen US/UK/AU secara proporsional.
- 60 pelajaran Grammar lama **tidak otomatis diimpor**; konten baru memakai ID baru dan `ContentMigrationMap`. Hanya 40 latihan A1–B1 yang lolos review boleh diimpor ulang; 2.112 placeholder B2/C1 diganti total. Attempt lama yang tidak dipetakan tetap read-only.

**Acceptance:** 10.500 soal published; tidak ada soal dengan explanation placeholder; `LessonProgress` lama dipetakan; attempt yang tidak dipetakan tetap dapat dibaca sebagai riwayat.

### FR-06 — Kurikulum 10 bahasa lain

- Semua memakai CEFR A1–C1, 60 pelajaran/level, 2.100 soal/level, 10.500 soal.
- Kekhususan bahasa:

| Bahasa | Fokus konten |
|---|---|
| `id` | Afiks, imbuhan, register formal/santai, konjungsi |
| `es` | Gender, konjugasi, `ser/estar`, variasi `es-ES` + catatan LatAm |
| `fr` | Gender, konjugasi, liaison, `fr-FR` |
| `de` | Kasus, genus, Wortstellung, `de-DE` |
| `pt` | `pt-BR`, konjugasi, pronomina |
| `it` | Gender, konjugasi, artikula, `it-IT` |
| `nl` | Urutan kata, `de/het`, `nl-NL` |
| `ko` | Hangul, honorifik, partikel; CEFR-aligned, bukan TOPIK |
| `hi` | Devanagari, gender/verb agreement, transliterasi opsional |
| `ar` | RTL, MSA, root pattern, transliterasi Latin untuk pemula |

**Acceptance:** 12 bahasa tampil; yang `beta` menampilkan badge + count; yang `none` menampilkan empty state; tidak ada fallback ke Inggris.

### FR-07 — Lesson player & question types

- Tipe soal P0: `multiple_choice`, `fill_blank`, `ordering`, `matching`, `kanji_reading`, `reading_comprehension`, `listening_comprehension`, `correction`.
- Setiap tipe punya renderer, keyboard support, dan aturan penilaian server-side.
- Urutan soal dapat dilanjutkan; posisi terakhir tersimpan.
- Satu pelajaran 30–43 soal (rata-rata 35); estimasi 8–12 menit.
- Tidak ada timer wajib; mode tantangan opsional.
- Jawaban tidak dikirim ke client sebelum submit.

**Acceptance:** learner dapat menyelesaikan pelajaran dari awal sampai hasil di mobile 360 px dan desktop; refresh mengembalikan posisi terakhir.

### FR-08 — Materi pelajaran

- Setiap pelajaran memiliki: objective, explanation, 3–6 rules, 4–8 examples, tips, dan vocabulary set 8–15 item.
- Materi tersedia dalam bahasa target (contoh/immersi) + dukungan `id`/`en`.
- Materi boleh memiliki tabel (konjugasi, partikel, honorifik) dan catatan budaya.
- Materi tidak boleh berupa teks generik/template.
- Setiap pelajaran punya estimasi waktu dan prasyarat.

**Acceptance:** 3.600 pelajaran memiliki materi lengkap; tidak ada halaman materi kosong.

### FR-09 — Listening & audio

- 20.650 soal listening; ±5.200 aset audio (beberapa soal berbagi audio).
- Audio: 15–90 detik, mono, loudness normal, transkrip tersimpan.
- Kontrol putar/ulang; tidak ada batas replay yang menghukum; transcript tersedia (aksesibilitas).
- Audio gagal dimuat → tampilkan transcript + tombol retry; sesi tidak crash.
- Audio disajikan dari CDN/object storage, bukan dari DB.

**Acceptance:** 100% soal listening punya `audioAssetId` valid + transkrip; audio start ≤ 1 detik pada 4G.

### FR-10 — Dukungan script, furigana, transliterasi, RTL

- Jepang: furigana opsional via `<ruby>`; font CJK; line-height 1.75.
- Korea: font Hangul; dukungan honorifik.
- Hindi: font Devanagari; transliterasi opsional.
- Arab: `dir="rtl"` untuk konten; pilihan jawaban Latin di-`bidi-isolate`; layout mirror.
- Input jawaban: normalisasi Unicode (NFC/NFKC), trim, case-insensitive untuk Latin; aturan khusus untuk Jepang (full/half-width) dan Arab (harakat opsional).
- Font dimuat via `next/font`, bukan CDN runtime.

**Acceptance:** halaman `/ar/learn` RTL tanpa overflow; furigana tidak merusak layout; input Jepang full-width diterima.

### FR-11 — Feedback, results, dan review

- Feedback benar: konfirmasi + 1 kalimat penguatan.
- Feedback salah: jawaban learner, jawaban benar, penjelasan 1–3 kalimat, konsep terkait.
- Feedback tidak hilang otomatis; learner menekan “Lanjut”.
- Results: akurasi, XP, waktu, daftar salah, tombol “Ulangi yang salah” dan “Review”.
- Item salah masuk SRS dengan `conceptKey` per bahasa.
- Review menampilkan due item, bahasa, level, dan alasan.

**Acceptance:** 100% jawaban salah menampilkan jawaban benar + penjelasan; review due muncul di dashboard.

### FR-12 — Progress, resume, dan dashboard per bahasa

- `LessonProgress` per learner + lesson; status `not_started`, `in_progress`, `completed`, `mastered`.
- Resume menyimpan `currentExerciseIndex` dan `lastQuestionId`.
- Dashboard per bahasa: level aktif, unit berikutnya, soal terakhir, akurasi, waktu belajar, review due.
- Streak bersifat **global** (belajar bahasa apa pun menghitung); XP dan menit per bahasa dilacak terpisah.
- Ganti bahasa tidak menghapus progres; ganti UI locale tidak mengubah progres.

**Acceptance:** refresh/resume bekerja; progres bahasa A tetap ada setelah 30 hari tidak aktif dan learner beralih ke bahasa B.

### FR-13 — Bahasa penjelasan & fallback

- Profil menyimpan `explanationLocale` (`id`, `en`, `ja`).
- Setiap soal punya penjelasan `id` + `en`; soal Jepang juga `ja`.
- Jika locale penjelasan tidak tersedia, tampilkan `en` + notice “Penjelasan tersedia dalam bahasa Inggris.”
- UI locale tidak memaksa bahasa penjelasan.
- Machine translation hanya untuk draft; publikasi butuh review manusia.

**Acceptance:** learner dengan UI Jepang yang belajar Inggris tetap dapat penjelasan sesuai `explanationLocale`; fallback terlihat, bukan diam-diam.

### FR-14 — Pipeline authoring, QA, dan publish

- Sumber authoring: JSON per unit di repo, tervalidasi schema; audio di object storage.
- Pipeline: blueprint → AI draft → QA otomatis → review manusia → import idempotent → publish release → monitor.
- Publish bersifat atomik per `ContentRelease`; rollback status/pointer ke release sebelumnya < 5 menit; restore konten penuh < 30 menit.
- ID stabil; published immutable; koreksi membuat versi baru.
- Soal `retired` tidak dihapus jika punya attempt.
- CI gagal jika count < target, duplikat, audio/penjelasan hilang, atau placeholder.

**Acceptance:** impor dua kali tidak menduplikasi; rilis yang gagal tidak mengubah konten learner; rollback berhasil.

### FR-15 — Koreksi & retirement

- Learner dapat melaporkan soal (jawaban salah, audio, penjelasan, typo).
- Laporan masuk antrean; status `open`, `triaged`, `fixed`, `retired`, `rejected`.
- Soal kritis (jawaban salah/audio rusak) ditandai dan di-`retire` dari rilis berikutnya ≤ 72 jam.
- Attempt lama tetap; statistik item dipisah per versi.
- Learner melihat status laporan (opsional, P1).

**Acceptance:** soal yang di-retire tidak muncul untuk learner baru; learner yang sudah mengerjakan tetap dapat melihat hasil lama.

### FR-16 — Search & filter

- Filter katalog: bahasa, framework, level, status.
- Filter pelajaran: skill, unit, status progress.
- Pencarian judul/objective dalam bahasa aktif; tidak ada pencarian lintas bahasa di v1.
- Hasil kosong menampilkan saran yang relevan, bukan halaman kosong.

**Acceptance:** filter mengembalikan hasil < 300 ms untuk 3.600 pelajaran; query injection aman.

### FR-17 — Analytics & observability

- Event: `curriculum_viewed`, `language_enrolled`, `language_activated`, `level_selected`, `lesson_started`, `question_answered`, `lesson_completed`, `lesson_abandoned`, `review_started`, `review_completed`, `audio_failed`, `question_reported`, `content_release_published`.
- Properti: `languageCode`, `level`, `lessonId`, `questionId`, `type`, `skill`, `correct`, `latencyMs`, `source`.
- Tidak ada PII di event.
- Dashboard: funnel per bahasa, completion, accuracy, D7, item health, error rate audio.

**Acceptance:** dashboard dapat menjawab “berapa learner Jepang yang menyelesaikan N5 unit 1 minggu ini?” dan “soal mana dengan p-value < 0,2?”.

### FR-18 — Accessibility

- WCAG 2.1 AA untuk layar inti.
- Keyboard-only untuk seluruh alur pelajaran; focus visible; target 44×44 px.
- Audio punya transkrip; tidak ada konten hanya warna/audio.
- `prefers-reduced-motion` dihormati.
- Screen reader membaca soal, pilihan, feedback, dan progress dengan benar.
- RTL dan font script diuji.

**Acceptance:** axe tidak menemukan violation kritis; keyboard-only menyelesaikan satu pelajaran Jepang dan satu pelajaran Arab.

### FR-19 — Gamifikasi & checkpoint

**Prioritas:** P0 untuk XP/streak/hearts; P1 untuk checkpoint.

- XP: 10 per jawaban benar pertama, 2 per benar ulang, 20 bonus pelajaran selesai, 30 bonus perfect; cap harian 500.
- Hearts: 5; salah mengurangi 1; regen 1/30 menit; mode “Latihan bebas” tanpa hearts dan tanpa XP.
- Streak global; tidak ada hukuman visual berlebihan.
- Checkpoint 20–30 soal per unit/level memakai bank soal existing; bukan konten baru.
- Checkpoint menampilkan akurasi per skill; tidak mengklaim skor resmi ujian.

**Acceptance:** XP tidak bisa digandakan lewat submit ulang; checkpoint tidak menghabiskan hearts; hasil checkpoint memberi rekomendasi unit.

### FR-20 — Content health dashboard (P2)

- Read-only: coverage per bahasa/level/skill, soal tanpa audio, soal tanpa penjelasan, item flag, release terakhir, defect rate.
- Bisa difilter dan diekspor CSV.
- Hanya untuk admin/content lead.

**Acceptance:** content lead dapat melihat status 12 bahasa dalam satu layar; angka cocok dengan API publik.

---

## 8. Persyaratan Konten

### 8.1 Matematika volume

- **Per level:** 60 pelajaran; **2.100 soal**; rata-rata 35 soal/pelajaran (rentang 30–43).
- **Per bahasa:** 5 level × 2.100 = **10.500 soal**; 300 pelajaran; 60 unit.
- **Total:** 12 × 10.500 = **126.000 soal**; 3.600 pelajaran; 720 unit.
- **Minimum:** 12 × 10.000 = 120.000 soal.

### 8.2 Distribusi skill per level

**Jepang (JLPT), 2.100 soal/level:**

| Skill | Soal | Pelajaran | Rata-rata soal/pelajaran |
|---|---:|---:|---:|
| Kosakata | 620 | 18 | ±34 |
| Kanji | 400 | 12 | ±33 |
| Tata bahasa | 480 | 14 | ±34 |
| Membaca | 320 | 8 | 40 |
| Mendengar | 280 | 8 | 35 |
| **Total** | **2.100** | **60** | **35** |

**Inggris (CEFR), 2.100 soal/level:**

| Skill | Soal | Pelajaran | Rata-rata soal/pelajaran |
|---|---:|---:|---:|
| Kosakata | 450 | 15 | 30 |
| Tata bahasa | 600 | 18 | ±33 |
| Membaca | 400 | 10 | 40 |
| Mendengar | 350 | 10 | 35 |
| Use of English | 300 | 7 | ±43 |
| **Total** | **2.100** | **60** | **35** |

**10 bahasa lain (CEFR), 2.100 soal/level:**

| Skill | Soal | Pelajaran | Rata-rata soal/pelajaran |
|---|---:|---:|---:|
| Kosakata | 500 | 15 | ±33 |
| Tata bahasa | 600 | 18 | ±33 |
| Membaca | 400 | 10 | 40 |
| Mendengar | 350 | 10 | 35 |
| Penggunaan bahasa | 250 | 7 | ±36 |
| **Total** | **2.100** | **60** | **35** |

### 8.3 Total soal per skill (126.000)

| Skill | Jepang | Inggris | 10 bahasa lain | Total |
|---|---:|---:|---:|---:|
| Kosakata | 3.100 | 2.250 | 25.000 | **30.350** |
| Tata bahasa | 2.400 | 3.000 | 30.000 | **35.400** |
| Kanji | 2.000 | 0 | 0 | **2.000** |
| Membaca | 1.600 | 2.000 | 20.000 | **23.600** |
| Mendengar | 1.400 | 1.750 | 17.500 | **20.650** |
| Use/penggunaan | 0 | 1.500 | 12.500 | **14.000** |
| **Total** | **10.500** | **10.500** | **105.000** | **126.000** |

### 8.4 Tipe soal

Tipe soal dan skill adalah dua dimensi berbeda; satu skill dapat memakai beberapa tipe. Distribusi per level:

| Tipe | Jepang | Inggris | Bahasa lain |
|---|---:|---:|---:|
| `multiple_choice` | 650 | 600 | 600 |
| `fill_blank` | 220 | 450 | 450 |
| `kanji_reading` | 400 | 0 | 0 |
| `ordering` | 50 | 100 | 100 |
| `matching` | 100 | 150 | 150 |
| `reading_comprehension` | 320 | 400 | 400 |
| `listening_comprehension` | 280 | 350 | 350 |
| `correction` | 80 | 50 | 50 |
| **Total** | **2.100** | **2.100** | **2.100** |

Total seluruh program: **36.250 MCQ**, **25.850 fill**, **2.000 kanji**, **5.750 ordering**, **8.750 matching**, **23.600 reading**, **20.650 listening**, **3.150 correction** = **126.000**.

### 8.5 Materi & aset

| Aset | Jumlah | Catatan |
|---|---:|---|
| Materi pelajaran | 3.600 | Objective, explanation, rules, examples, tips, vocab set |
| Unit overview | 720 | Tujuan unit + checkpoint |
| Level guide | 60 | 12 bahasa × 5 level |
| Language guide | 12 | Cara belajar, script, variasi bahasa |
| Reading passage | ±5.900 | 23.600 soal membaca, ±4 soal/passage |
| Listening script | ±5.200 | 20.650 soal listening, ±4 soal/audio |
| Audio asset | ±5.200 | 15–90 detik, transkrip, checksum |
| Penjelasan soal | 262.500 | 126.000 × (`id` + `en`) + 10.500 `ja` untuk Jepang |

### 8.6 Quality bar

**Wajib untuk setiap soal published:**

1. Skema valid; ID unik; fingerprint unik.
2. Tepat satu jawaban benar (untuk MCQ/reading/listening); pilihan tidak duplikat.
3. Prompt dan pilihan dalam bahasa target; rasio teks target ≥ 90% (kecuali item terjemahan yang disengaja).
4. Penjelasan ada, spesifik, 1–3 kalimat, bukan template.
5. Level whitelist Jepang dipatuhi (kanji/kosakata/grammar).
6. Passage/audio ada untuk soal yang membutuhkannya; transkrip ada.
7. Tidak ada konten sensitif, ilegal, atau melanggar hak cipta.
8. Sign-off tercatat di `ContentReview` level/unit; soal yang direview individual mencatat `reviewedBy` + `reviewedAt` dan `reviewStatus` (`automated` / `sampled` / `full`).
9. Tidak ada jawaban yang bisa ditebak dari format/panjang pilihan.
10. Tidak ada soal yang menyalin ujian resmi.

**Review manusia:**

- 100% materi pelajaran, objective, passage, dan audio script.
- 100% soal N1, N2, C1 (independent native review).
- ≥ 20% sampel acak soal N3–N5/A1–B2; jika defect rate sampel > 2%, review 100% unit tersebut; jika > 5%, tolak level.
- 100% soal yang ditandai QA otomatis.
- 100% soal lolos automated QA; sign-off unit/level dicatat oleh language lead.
- Native reviewer per bahasa menandatangani level sebelum `full`.

**Ambang defect:**

| Kategori | Ambang | Tindakan |
|---|---|---|
| Jawaban salah | 0 | Wajib diperbaiki sebelum publish |
| Audio hilang/rusak | 0 | Wajib diperbaiki |
| Penjelasan placeholder | 0 | Wajib diganti |
| Duplikat persis | 0 | Wajib dihapus |
| Near-duplicate | < 0,5% | Review dan diversifikasi |
| Typo/format | < 1% | Perbaiki pada rilis berikutnya |
| Defect sampel | ≤ 2% | Jika > 2%, review 100% unit; jika > 5%, tolak level |
| Answer-key audit | ≥ 98% | Metrik audit; jawaban salah yang diketahui tetap 0 toleransi |

### 8.7 Model produksi

```
Blueprint level
  → AI draft (offline, prompt versioned)
  → automated QA (schema, language, duplicate, level whitelist, audio)
  → human review (native reviewer + editor)
  → import (idempotent, staged)
  → publish release (atomic)
  → pilot / psychometric monitoring
  → correct / retire
```

- AI **tidak** digunakan saat learner mengerjakan soal.
- Setiap draft mencatat `generationMeta` (model, prompt version, tanggal) untuk audit.
- Editor bahasa memastikan konsistensi istilah dan gaya.
- Content lead mengelola kalender rilis dan kapasitas reviewer.

### 8.8 IP & legal

- Semua soal original; tidak ada reproduksi soal JLPT/TOEFL/IELTS atau bahan berhak cipta.
- Nama “JLPT” digunakan secara deskriptif; disclaimer: “Lango tidak berafiliasi dengan Japan Foundation/JEES.”
- Audio original atau berlisensi; simpan bukti lisensi/voice release.
- Passage original; kutipan sastra hanya jika public domain atau berlisensi.
- Kebijakan takedown dan audit plagiarisme sebelum publish.

---

## 9. UX & Design Requirements

### 9.1 Layar utama

| Layar | Tujuan | Elemen wajib | State |
|---|---|---|---|
| **Katalog bahasa** | Memilih bahasa | 12 kartu, status, jumlah, level | Loading, `none`, `beta`, error |
| **Hub bahasa** | Memilih level | 5 level, can-do, progress, level guide | Loading, locked? (tidak), error |
| **Level path** | Melihat unit | 12 unit, 5 pelajaran, progress, checkpoint | Loading, empty, error |
| **Lesson intro** | Memahami tujuan | Objective, estimasi, vocab preview, CTA | Loading, error |
| **Lesson player** | Belajar | Materi, soal, audio, progress, hearts/XP | Loading, answering, feedback, paused, error, offline |
| **Results** | Menutup sesi | Akurasi, XP, item salah, review, next | Success, retry, no XP |
| **Review** | Mengulang | Due count, daftar item, mulai | Empty, in progress, done |
| **Progress** | Melihat kemajuan | Per bahasa, level, skill, waktu, streak | Loading, empty, error |
| **Report soal** | Melaporkan masalah | Alasan, catatan, kirim | Loading, sukses, error |

### 9.2 Anatomi lesson player

1. **Header:** keluar, progress `12/35`, hearts, XP.
2. **Konteks:** bahasa + level + skill + instruksi (maks. 2 baris).
3. **Materi/soal:** teks, passage, audio, atau gambar.
4. **Area jawaban:** pilihan/input/susun; target ≥44 px.
5. **Feedback:** benar/salah + penjelasan + konsep.
6. **Footer:** “Lanjut” aktif setelah feedback; “Laporkan soal” di menu.

### 9.3 Aturan feedback

- Jangan tampilkan jawaban sebelum submit.
- Salah: tampilkan jawaban learner, jawaban benar, penjelasan, dan konsep.
- Benar: konfirmasi + penguatan singkat.
- Tidak ada auto-advance < 1 detik.
- Tidak ada suara negatif/animasi hukuman.
- Audio dapat diputar ulang; transkrip tersedia.

### 9.4 UX khusus bahasa

- **Jepang:** furigana toggle; font Noto Sans JP; reading vertikal tidak diperlukan; input IME didukung; full/half-width dinormalisasi.
- **Korea:** Hangul; honorifik ditandai; font Noto Sans KR.
- **Hindi:** Devanagari; transliterasi opsional; font Noto Sans Devanagari.
- **Arab:** RTL; font Noto Naskh Arabic/IBM Plex Sans Arabic; pilihan jawaban Latin di-`bidi-isolate`; layout mirror; angka tetap LTR.
- **Bahasa Latin:** font Plus Jakarta Sans; diakritik didukung.

### 9.5 States

- **Loading:** skeleton untuk katalog/hub; spinner untuk lesson.
- **Empty:** bahasa `none` → empty state jujur.
- **Beta:** badge + count + disclaimer.
- **Error:** pesan spesifik + retry; progress aman.
- **Offline:** tampilkan status offline; jawaban terakhir tetap di layar dan dapat dicoba ulang. Antrean offline penuh bukan bagian v1.
- **Audio error:** transcript + retry; tombol lanjut tetap tersedia.

### 9.6 Microcopy (contoh)

| Konteks | Gunakan | Hindari |
|---|---|---|
| Beta | “Beta · 2.100 soal. Kami masih meninjau konten.” | “Segera lengkap” |
| Tidak ada konten | “Kurikulum Arab belum tersedia. Coba bahasa lain?” | “Error 404” |
| Salah | “Belum tepat. Jawaban yang benar: …” | “Salah!” |
| Ganti bahasa | “Lanjutkan belajar Jepang? Progresmu tersimpan.” | “Keluar” |
| Level bebas | “Kamu bisa mulai dari level mana pun. N5 disarankan.” | “Level terkunci” |
| Laporan terkirim | “Terima kasih. Kami akan meninjau soal ini.” | “Laporan diterima” |

### 9.7 Aksesibilitas

- Kontras ≥ 4,5:1; target sentuh ≥ 44×44 px.
- Keyboard-only untuk seluruh alur.
- `aria-live` untuk feedback dan perubahan progress.
- Transcript audio; caption untuk video (jika ada).
- `prefers-reduced-motion`.
- Font size 200% tanpa kehilangan konten.
- Screen reader diuji pada lesson Jepang + Arab.

---

## 10. Data & API (Ringkas)

### 10.1 Prinsip

1. Konten dan progres dipisah.
2. Konten berversi; ID stabil; published immutable.
3. Answer key hanya di server.
4. Progress per learner + lesson + bahasa.
5. Konten besar (audio/gambar) di object storage, bukan DB.

### 10.2 Entitas konseptual

`Language`, `UserLanguageProfile`, `Curriculum`, `CurriculumLevel`, `CurriculumUnit`, `CurriculumLesson`, `LessonLocalization`, `Passage`, `AudioAsset`, `Question`, `QuestionChoice`, `QuestionLocalization`, `QuestionRevision`, `ContentRelease`, `ContentReview`, `QuestionStat`, `LessonProgress`, `ExerciseAttempt`, `SpacedReviewItem`, `UserLanguageStats`.

Detail schema, index, dan migrasi ada di **FS-09 §4–§6 dan §9**.

### 10.3 API surface

| Endpoint | Auth | Kegunaan |
|---|---|---|
| `GET /api/v1/languages` | Tidak | Registry + availability + count |
| `GET /api/v1/curricula/:language` | Tidak | Ringkasan level/pelajaran/soal |
| `GET /api/v1/curricula/:language/levels/:level/lessons` | Ya | Unit/pelajaran + progress |
| `GET /api/v1/curricula/:language/lessons` | Ya | Filter/pencarian pelajaran (level, skill, q) |
| `GET /api/v1/lessons/:id` | Ya | Materi + soal tanpa jawaban |
| `POST /api/v1/attempts` | Ya | Submit jawaban, idempotent |
| `POST /api/v1/lessons/:id/complete` | Ya | Selesaikan pelajaran |
| `GET /api/v1/progress?language=` | Ya | Progres per bahasa |
| `POST /api/v1/me/languages` | Ya | Tambah/aktifkan bahasa |
| `PATCH /api/v1/me` | Ya | Bahasa aktif, level, explanation locale |
| `POST /api/v1/reports` | Ya | Laporkan soal |
| `GET /api/v1/review?language=` | Ya | Review due |

### 10.4 Invariant kontrak

1. `answerKey`, `isCorrect`, dan `explanation` tidak pernah dikirim sebelum submit.
2. Submit duplikat mengembalikan hasil yang sama; XP tidak ganda.
3. Mutasi progres dalam transaksi.
4. Soal `retired` tidak dikirim ke learner baru.
5. Ganti bahasa tidak menghapus progres.
6. Semua respons menyertakan `requestId`.

---

## 11. Non-Functional Requirements

### 11.1 Performance

| Metrik | Target |
|---|---|
| p95 muat pelajaran (server) | ≤ 300 ms |
| LCP lesson (mobile 4G) | ≤ 2,5 s |
| Audio start | ≤ 1 s |
| Payload lesson | ≤ 250 KB gzip |
| Katalog (cache) | ≤ 100 ms |
| Submit attempt p95 | ≤ 500 ms |

Strategi: cache katalog; query `select` tanpa answer key; audio CDN; preload audio pertama; jangan memuat 3.600 pelajaran ke bundle.

### 11.2 Skala & reliabilitas

- 126.000 soal, ±500.000 pilihan, ±262.500 penjelasan, ±11.000 passage, ±5.200 audio.
- Target 10.000 DAU awal; 5.000 concurrent learner.
- Uptime API 99,9%; error rate 5xx < 0,5%.
- Backup harian; restore diuji bulanan.
- Release konten immutable + rollback status < 5 menit / restore penuh < 30 menit.

### 11.3 Keamanan

- Answer key server-only; DTO di-audit.
- Auth + ownership pada semua endpoint progres.
- Rate limit submit/report.
- Content import hanya via CI/service token.
- Audio via signed CDN URL untuk learner terautentikasi.
- Tidak ada PII di analytics/log konten.
- Audit akses admin.

### 11.4 Privasi

- Data belajar (attempt, progres) dapat diekspor/dihapus.
- Retensi log ≤ 90 hari; event agregat ≤ 24 bulan.
- Tidak ada data learner di prompt AI authoring.
- Kebijakan privasi mencakup konten dan audio.

### 11.5 i18n & SEO

- UI 12 locale; tier: `en`, `id`, `jp` full; `es`, `fr`, `de`, `pt`, `it`, `nl` full UI; `hi`, `ar`, `ko` minimal + audit script.
- Konten belajar tidak diterjemahkan ke UI locale secara otomatis.
- Halaman learn `noindex`; katalog publik boleh diindeks dengan canonical/hreflang yang benar.
- `html lang` BCP-47; `jp` → `ja`.

### 11.6 Observability

- Structured log: `requestId`, `userId` hash, `route`, `languageCode`, `latency`.
- Error tracking: audio, API, content import.
- Dashboard: availability, completion, item health, audio failure, release status.
- Alert: error rate > 1%, audio failure > 2%, content release gagal.

### 11.7 Biaya & unit economics

- Biaya utama: drafting AI, review manusia, audio, QA.
- Ukur biaya per soal published dan per bahasa.
- Target indikatif: biaya authoring + review ≤ 35% dari biaya konten per bahasa (disesuaikan dengan model bisnis).
- Optimasi: reuse passage/audio, template prompt, review sampling, TTS untuk bahasa non-Jepang.

---

## 12. Content Operations & Governance

### 12.1 Peran

| Peran | Tanggung jawab |
|---|---|
| **Head of Content** | Kalender rilis, standar kualitas, kapasitas |
| **Language Lead** | Blueprint level, konsistensi linguistik, sign-off |
| **Native Reviewer** | Review soal/materi, checklist, approve |
| **Editor** | Gaya, konsistensi istilah, metadata |
| **Content QA** | Automated QA, sampling, laporan defect |
| **Pipeline Engineer** | Import, publish, rollback, monitoring |
| **Support** | Triase laporan learner |

### 12.2 Workflow

```
Blueprint → Draft → Automated QA → Native review → Editor approval
→ Import staging → Publish release → Pilot → Monitor → Correct/Retire
```

### 12.3 SLA

| Aktivitas | SLA |
|---|---|
| Triase laporan jawaban salah | ≤ 24 jam |
| Perbaikan/retire soal kritis | ≤ 72 jam |
| Review unit baru | ≤ 5 hari kerja |
| Publish release | ≤ 1 hari setelah sign-off |
| Rollback status/pointer | ≤ 5 menit |
| Restore konten penuh (rollback) | ≤ 30 menit |
| Audit kualitas bulanan | 1×/bulan |

### 12.4 Ritme rilis

- **Mingguan:** patch konten (typo, audio, penjelasan).
- **Dua mingguan:** unit baru.
- **Bulanan:** release versi + laporan kualitas.
- **Kuartalan:** audit sampel 12 bahasa + review kebijakan.

### 12.5 Insiden konten

- **Severity 1:** jawaban benar salah secara masif / audio rusak / konten sensitif → tarik release/soal, komunikasi ke learner, post-mortem.
- **Severity 2:** penjelasan membingungkan / typo berulang → perbaiki rilis berikutnya.
- **Severity 3:** saran gaya → backlog.

### 12.6 Kebijakan AI

- AI hanya untuk draft/outline/varian.
- Prompt tidak berisi data learner.
- Output wajib lolos schema + human review.
- Catat model/prompt version.
- Tidak ada klaim “AI-generated” sebagai kualitas; kualitas adalah hasil review.

---

## 13. Analytics & Metrics

### 13.1 North Star

**Weekly Active Learners who complete at least one lesson in their active language (WAL-L).**

### 13.2 Funnel per bahasa

`catalog_viewed → language_enrolled → level_selected → lesson_started → lesson_completed → next_lesson_started → D7 return`

### 13.3 Event inti

| Event | Properti | Tujuan |
|---|---|---|
| `curriculum_viewed` | `languageCode`, `availability` | Minat |
| `language_enrolled` | `languageCode`, `source` | Adopsi |
| `language_activated` | `from`, `to` | Multi-bahasa |
| `level_selected` | `languageCode`, `level` | Pilihan level |
| `lesson_started` | `lessonId`, `level`, `skill` | Engagement |
| `question_answered` | `questionId`, `type`, `correct`, `latencyMs`, `attemptNo` | Learning |
| `lesson_completed` | `lessonId`, `accuracy`, `xp`, `durationSec` | Outcome |
| `lesson_abandoned` | `lessonId`, `progressPct` | Drop-off |
| `review_started/completed` | `dueCount`, `reviewed`, `correct` | Retention |
| `audio_failed` | `audioId`, `error` | Kualitas |
| `question_reported` | `questionId`, `reason` | Kualitas |
| `content_release_published` | `version`, `counts` | Ops |

### 13.4 Dashboard

- Coverage: 12 bahasa × 5 level × skill.
- Quality: item p-value, flag, report rate, audio failure.
- Learning: completion, accuracy, time-on-task, checkpoint.
- Retention: D1/D7/D30 per bahasa.
- Ops: throughput review, release lag, defect rate.

### 13.5 Eksperimen

- Urutan level (linear vs bebas).
- Panjang pelajaran (25 vs 35 soal).
- Feedback style (ringkas vs detail).
- Checkpoint timing.
- Tidak ada eksperimen yang mengurangi kualitas konten.

---

## 14. Roadmap & Rencana Rilis

> Estimasi indikatif; kapasitas reviewer adalah faktor pembatas. Asumsi throughput steady state **2.000–2.500 soal reviewed/minggu**.
>
> **Kapasitas penulisan/terjemahan:** 126.000 soal × 2 penjelasan (`id` + `en`) = **252.000 string penjelasan**, ditambah 3.600 materi pelajaran, ±11.000 passage/script, dan ±5.200 audio. Dengan 1,5–2 menit per penjelasan, ini ±6.300–8.400 jam kerja penulis/peninjau bahasa, atau ±3–4 FTE penulis bilingual sepanjang program. Jadwal 72 minggu mengasumsikan pod **8–10 FTE** (penulis, native reviewer, editor, QA); jika pod lebih kecil, kurangi cakupan gelombang—bukan menurunkan quality bar.
>
> 70 soal P0 adalah bagian dari 12.600 soal P1, bukan tambahan.

| Fase | Durasi | Cakupan | Soal kumulatif | Exit gate |
|---|---:|---|---:|---|
| **P0 — Fondasi** | 4 minggu | Schema konten, pipeline, registry, 2 pelajaran pilot (Jepang N5, Inggris A1) | 70 | Pipeline + API + UI pilot; QA otomatis |
| **P1 — Jepang N5–N3 + Inggris A1–B1** | 8 minggu | 6.300 + 6.300 | 12.600 | `beta`; 100% audio/passage level pilot; review sample |
| **P2 — Jepang N2–N1 + Inggris B2–C1** | 10 minggu | 4.200 + 4.200; mulai `id`/`es` | 21.000 | Jepang & Inggris `full`; tidak ada placeholder |
| **P3 — Gelombang B** | 18 minggu | `id`, `es`, `fr`, `de` penuh (42.000) | 63.000 | 6 bahasa `full`; RTL/font audit |
| **P4 — Gelombang C** | 26 minggu | `pt`, `it`, `nl`, `ko`, `hi`, `ar` penuh (63.000) | 126.000 | 12 bahasa `full`; audit akhir |
| **P5 — Skala & polish** | 6 minggu | Content health, analytics, cost optimization | 126.000 | Semua AC; runbook; audit |

Total ± 72 minggu (± 17 bulan) termasuk buffer. Jika tim reviewer diperbesar, P3/P4 dapat dipercepat; jika tidak, tanggal `full` harus dimundurkan, bukan statusnya dipaksakan.

### 14.1 Urutan prioritas konten

1. Jepang N5–N3 (permintaan terbesar, level dasar).
2. Inggris A1–B1 (pasar utama, konten lama bisa dijadikan pelajaran).
3. Jepang N2–N1 + Inggris B2–C1 (pengguna serius).
4. `id`, `es`, `fr`, `de` (pasar terbesar berikutnya).
5. `pt`, `it`, `nl`, `ko`, `hi`, `ar` (termasuk RTL/script).

### 14.2 Definisi `full`

- 10.500 soal published; 300 pelajaran; 5 level.
- 100% materi, passage, audio, penjelasan.
- 0 placeholder; 0 jawaban salah diketahui.
- Review native sign-off per level.
- API count cocok dengan manifest.
- Performance + a11y lolos.

---

## 15. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Skala 126.000 soal tidak tercapai | Janji produk gagal | Gelombang + status `beta` jujur + CI count |
| Kualitas AI draft rendah | Kepercayaan turun | Review manusia + sampling + item stats + retire |
| Reviewer kurang | Rilis molor | Rekrut native reviewer; vendor; prioritaskan ja/en |
| Biaya audio besar | Margin turun | 5.200 audio (bukan 20.650); TTS + spot-check; reuse |
| Pelanggaran IP | Hukum/takedown | Original content; plagiarism check; disclaimer; legal review |
| Migrasi progres lama | Kehilangan data | Mapping ID; dual-read; backup; rollback |
| 12 bahasa penjelasan | Terjemahan tidak selesai | Tier `id`/`en`/`ja`; fallback transparan |
| RTL/script rusak | Tidak terbaca | Font khusus; logical CSS; audit screenshot |
| Performance DB | Lambat | Index; select; cache; audio CDN; load test |
| Scope creep framework lain | Fokus hilang | Non-goals; arsitektur extensible tanpa implementasi |
| Konten sensitif | Reputasi | Moderation + review + takedown |
| Learner bingung dua axis bahasa | UX kacau | Label “UI vs belajar”; chip mismatch; FS-08 |

---

## 16. Asumsi & Pertanyaan Terbuka

### 16.1 Asumsi

- 12 bahasa di registry adalah daftar resmi.
- `jp` tetap rute UI; `ja` kode konten.
- 10.500/bahasa adalah target dan gate `full`; 120.000 adalah lantai agregat, bukan gate `full`.
- Tidak ada placement test adaptif di v1.
- Audio listening diproduksi sebagai aset, bukan TTS runtime.
- Konten disimpan di PostgreSQL; JSON sumber authoring.
- Tim memiliki/merekrut native reviewer untuk 12 bahasa.
- Explanation locale rilis awal `id`, `en`, `ja`.
- Framework lain tidak diimplementasikan.

### 16.2 Pertanyaan terbuka

1. Apakah 126.000 soal harus selesai sebelum monetisasi Pro, atau beta cukup untuk membuka Pro?
2. Apakah Jepang memakai audio voice talent 100%, atau TTS + review untuk N3–N5?
3. Apakah `id`/`en`/`ja` cukup untuk penjelasan, atau perlu `es`/`ar` pada rilis awal?
4. Apakah level harus berurutan (soft lock) atau bebas sepenuhnya? Rekomendasi: bebas dengan rekomendasi.
5. Apakah perlu mock test JLPT per level (bukan hanya checkpoint)?
6. Siapa pemilik konten: in-house, vendor, atau hybrid?
7. Apakah audio/CDN memakai signed URL atau publik?
8. Apakah konten boleh dikontribusikan komunitas dengan review?
9. Berapa SLA koreksi yang dijanjikan ke learner?
10. Apakah perlu laporan pembelian konten (entitlement) per bahasa?

---

## 17. Acceptance Criteria (Program)

| ID | Skenario | Ekspektasi |
|---|---|---|
| **AC-P01** | Buka katalog | 12 bahasa, status + jumlah; tidak ada fallback lintas bahasa |
| **AC-P02** | `GET /curricula/ja` | 5 level; 60 pelajaran/level; 2.100 soal/level; 10.500 total |
| **AC-P03** | `GET /curricula/en` | 5 level; 60 pelajaran/level; 2.100 soal/level; 10.500 total |
| **AC-P04** | 10 bahasa lain | Masing-masing 10.500 soal; total 126.000 |
| **AC-P05** | Materi & aset | 3.600 materi; ±5.200 audio; 100% listening punya transkrip |
| **AC-P06** | Placeholder | 0 soal/materi dengan teks template |
| **AC-P07** | Penjelasan | 100% soal punya `id` + `en`; Jepang juga `ja` |
| **AC-P08** | Review | 100% N1/N2/C1 + passage + materi direview; sampel level lain tercatat |
| **AC-P09** | Multi-bahasa | Learner dapat mendaftar 2+ bahasa; progres terpisah |
| **AC-P10** | Ganti bahasa | Progres bahasa lama tetap; bahasa aktif berubah |
| **AC-P11** | Resume | Refresh mengembalikan soal terakhir; tidak reset |
| **AC-P12** | Beta/none | Badge + empty state jujur; tidak ada konten Inggris |
| **AC-P13** | Performance | p95 ≤ 300 ms; LCP ≤ 2,5 s; audio ≤ 1 s |
| **AC-P14** | A11y/RTL | Keyboard-only; axe kritis 0; Arab RTL; font CJK/Devanagari |
| **AC-P15** | QA gate | CI gagal jika count/duplikat/audio/penjelasan/placeholder |
| **AC-P16** | Legal | Disclaimer JLPT; tidak ada soal resmi; lisensi audio |
| **AC-P17** | Analytics | Funnel + item health + audio failure tersedia |
| **AC-P18** | Rollback | Status/pointer < 5 menit; restore penuh < 30 menit; progress tidak rusak |

---

## 18. Lampiran

### A. Matriks volume per bahasa

| Bahasa | Level | Pelajaran | Unit | Soal | Soal listening | Soal membaca | Audio (est.) | Passage (est.) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Jepang | 5 | 300 | 60 | 10.500 | 1.400 | 1.600 | 350 | 400 |
| Inggris | 5 | 300 | 60 | 10.500 | 1.750 | 2.000 | 438 | 500 |
| 10 bahasa lain (each) | 5 | 300 | 60 | 10.500 | 1.750 | 2.000 | 438 | 500 |
| **Total** | **60** | **3.600** | **720** | **126.000** | **20.650** | **23.600** | **±5.200** | **±5.900** |

### B. Contoh struktur pelajaran (ringkas)

```json
{
  "lesson": {
    "id": "ja-jlpt-n5-u01-l03",
    "level": "N5",
    "unit": 1,
    "position": 3,
    "title": "自己紹介",
    "objective": "Memperkenalkan nama dan asal dengan です/から来ました",
    "skill": "grammar",
    "estimatedMinutes": 8
  },
  "materials": {
    "id": { "explanation": "...", "rules": [], "examples": [], "tips": [] },
    "en": { "explanation": "...", "rules": [], "examples": [], "tips": [] }
  },
  "questions": [
    {
      "id": "ja-jlpt-n5-u01-l03-q0012",
      "type": "multiple_choice",
      "skill": "grammar",
      "prompt": "わたしは インドネシア ___ きました。",
      "choices": [
        { "id": "a", "label": "から" },
        { "id": "b", "label": "まで" },
        { "id": "c", "label": "より" },
        { "id": "d", "label": "ほど" }
      ],
      "answerKey": { "choiceId": "a" },
      "explanations": {
        "id": "「から来ました」berarti 'datang dari'. Partikel から menandai asal.",
        "en": "「から来ました」 means 'came from'. The particle から marks the origin.",
        "ja": "「から来ました」は起点を表します。"
      },
      "difficulty": 1,
      "tags": ["particle", "origin", "n5"],
      "license": "original",
      "source": "Lango curriculum team"
    }
  ]
}
```

### C. Glosarium

| Istilah | Arti |
|---|---|
| **JLPT** | Japanese-Language Proficiency Test; kerangka level N5–N1 |
| **CEFR** | Common European Framework of Reference; level A1–C1 |
| **Soal published** | Soal dengan status `published` dan reviewer sign-off |
| **Release** | Snapshot konten immutable dengan versi |
| **Retire** | Menonaktifkan soal tanpa menghapus attempt |
| **Fingerprint** | Hash normalisasi prompt + jawaban untuk deteksi duplikat |
| **P-value** | Proporsi jawaban benar; indikator kesulitan item |
| **Checkpoint** | Tes singkat per unit/level dari bank soal |
| **Explanation locale** | Bahasa pembahasan, terpisah dari UI locale |

### D. Referensi

- `docs/PRD.md` — PRD v1.1 baseline.
- `context/feature-specs/08-locale-preference-and-curriculum.md` — dua axis bahasa, katalog, URL.
- `context/feature-specs/09-multilingual-curriculum-platform.md` — spec teknis program ini.
- `context/architecture-context.md` — batas sistem dan storage.
- `context/ui-context.md` — token, tipografi, aksesibilitas.
- JLPT (informasi resmi level): https://www.jlpt.jp/
- CEFR (deskriptor): https://www.coe.int/en/web/common-european-framework-reference-languages/
- Next.js 16 docs: `node_modules/next/dist/docs/`

---

**Catatan akhir:** PRD ini sengaja menolak ilusi “10.000 soal per bahasa” sebagai satu kali generate. Angka tersebut hanya bermakna jika disertai model konten, review, versi, dan operasi koreksi. Jika tim tidak dapat memenuhi quality bar, turunkan cakupan bahasa—bukan standar kualitas.
