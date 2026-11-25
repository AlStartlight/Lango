# PRD — Lango: Platform Pembelajaran Bahasa Berbasis Modul Gamifikasi

| Field | Nilai |
| --- | --- |
| **Nama produk** | Lango |
| **Jenis dokumen** | Product Requirements Document (PRD) |
| **Versi** | 1.1 — Draft untuk review |
| **Tanggal** | 25 November 2026 |
| **Pemilik** | Product |
| **Reviewer** | Design, Engineering, Content, QA, Growth |
| **Target rilis** | v1.0 — awal Q2 2027 (estimasi) |
| **Dokumen terkait** | `context/project-overview.md`, `context/architecture-context.md`, `context/ui-context.md`, `context/feature-specs/02-auth-system.md` (legacy Clerk — digantikan PRD ini), `context/feature-specs/05-gemification-learn-number-to-language-target.md`, `context/feature-specs/06-grammer-features.md`, `docs/API_MOCK_DATA.md` |

> **Status dokumen.** Ini adalah draft untuk diputuskan bersama. Angka target, estimasi waktu, dan keputusan teknis di dalamnya adalah rekomendasi awal, bukan komitmen final. Bagian 18 mencantumkan keputusan yang harus disetujui sebelum eksekusi.

> **Cara membaca.** Bagian 1–6 menjelaskan *mengapa* dan *apa* yang dibangun. Bagian 7–12 menjelaskan *bagaimana* produk dan sistem bekerja. Bagian 13–19 mengatur kualitas, metrik, roadmap, risiko, dan kriteria rilis.

---

## 0. Ringkasan Keputusan yang Diminta

Lima keputusan strategis berikut membentuk seluruh isi PRD. Keputusan turunan (D-06–D-10) tercatat di bagian 18. Setiap keputusan memerlukan persetujuan Product, Engineering, dan Design sebelum Fase 0 dimulai.

| ID | Keputusan | Rekomendasi | Alasan |
| --- | --- | --- | --- |
| **D-01** | Fokus pasar dan produk v1 | **Module-first learning**: English untuk pembelajar dewasa Indonesia/Asia Tenggara. AI tutor dan tutor marketplace ditunda ke v2. | Modul Grammar dan Number Name sudah berjalan; AI tutor dan marketplace belum punya implementasi sama sekali. Fokus modul memberi jalur tercepat menuju produk yang bisa dipakai dan diukur. |
| **D-02** | Identitas pengguna | **Autentikasi kustom email + password dengan bcrypt.** Sesi server-side melalui cookie HttpOnly; verifikasi email dan lupa password melalui email transaksional. Clerk dihapus. | Autentikasi saat ini terbelah: UI memakai Clerk, API memakai JWT kustom. Satu sistem auth sendiri memberi kontrol penuh atas data pengguna, alur reset password, biaya, dan konsistensi sesi. |
| **D-03** | Penyimpanan konten | **Content-as-code** (JSON/TS berversi) untuk v1, dengan katalog konten di database. CMS penuh masuk v1.1. | 25.000+ baris konten saat ini berupa TS hardcoded. Memindahkan semuanya ke CMS sebelum ada kebutuhan authoring akan memperlambat peluncuran. |
| **D-04** | Arsitektur informasi | **Ganti metafora “Editor” menjadi “Learn”.** Hapus konsep project/canvas/dialog project dari alur belajar. | Produk ini adalah platform belajar, bukan workspace desain. Navigasi “Editor”, “Projects”, dan “New Project” membingungkan pengguna dan menyembunyikan modul belajar. |
| **D-05** | Cakupan gamifikasi v1 | **XP, level, streak, hearts, dan badge inti** dengan perhitungan server-side. Leaderboard dan tantangan teman ditunda. | Gamifikasi client-side saat ini mudah dimanipulasi dan tidak konsisten antar-modul. Leaderboard membutuhkan skala pengguna yang belum ada. |

---

## 1. Ringkasan Eksekutif

Lango memiliki fondasi teknis yang layak: Next.js 16, Prisma/PostgreSQL, situs marketing multilingual, serta dua modul belajar yang sudah berjalan di sisi klien — **Grammar** (60 pelajaran, 2.232 latihan, 4 tipe soal) dan **Number Name** (7 fase permainan, 6 bahasa). Autentikasi saat ini memakai Clerk dan akan diganti dengan **email + password berbasis bcrypt** beserta verifikasi email dan lupa password. Namun produk ini **belum menjadi produk belajar yang utuh**:

- Progres belajar hanya hidup di `useState`. Refresh halaman menghapus XP, streak, jawaban, dan penyelesaian pelajaran.
- Tidak ada onboarding, beranda belajar, dasbor progres, antrean review, atau alasan untuk kembali besok.
- Autentikasi tidak konsisten: UI memakai Clerk, API memakai JWT kustom, dan keduanya tidak saling mengenal. Bahkan seluruh rute `/{locale}/*` saat ini diperlakukan publik oleh `proxy.ts`. Target v1.0 adalah satu sistem auth email + password (bcrypt) dengan sesi server-side, verifikasi email, dan lupa password.
- Kurikulum tidak seimbang: hanya 4 pelajaran A1, 3 pelajaran A2, dan 3 pelajaran B1, sementara B2 dan C1 masing-masing 25 pelajaran. Pengguna baru akan cepat kehabisan materi di level pemula.
- Model database meniru bentuk data mock (30 model, banyak field presentasional), bukan domain belajar (mastery, attempt, review, SRS).
- Tidak ada test otomatis, error tracking, atau event analytics produk.

**PRD ini mendefinisikan v1.0 sebagai perubahan dari “dua demo modul” menjadi “produk belajar harian yang tersimpan, terukur, dan layak ditinggalkan lalu dikunjungi lagi”.**

Inti v1.0:

1. **Onboarding 2 menit** — target bahasa, level awal, goal harian, zona waktu.
2. **Beranda “Hari ini”** — satu rencana belajar yang jelas: lanjutkan pelajaran, review yang jatuh tempo, pemanasan Number Name.
3. **Session runner yang tersimpan** — setiap jawaban divalidasi server, setiap pelajaran dapat dilanjutkan.
4. **Progres dan review** — mastery per konsep, SRS ringan, rekomendasi latihan berikutnya.
5. **Gamifikasi konsisten** — XP, level, streak, hearts, dan badge yang dihitung server.
6. **Konten yang cukup untuk 30 hari pertama** — minimal 12 pelajaran A1 dan 12 pelajaran A2 sebelum rilis, dengan B1 dilengkapi setelahnya.

Target 90 hari setelah rilis: activation ≥ 60%, D7 ≥ 30%, D30 ≥ 15%, lesson completion ≥ 70%, dan 1.000 Weekly Active Learners. Target ini adalah hipotesis yang dikalibrasi ulang setelah 4 minggu data aktual.

**Yang tidak termasuk v1.0:** AI tutor percakapan, sesi live dengan tutor manusia, marketplace tutor, pembayaran, leaderboard, dan aplikasi mobile native. Semua itu tetap bagian dari visi, tetapi tidak boleh mendahului loop belajar inti.

---

## 2. Konteks dan Masalah

### 2.1 Pernyataan masalah

Pembelajar bahasa dewasa yang sibuk ingin membuat kemajuan nyata dalam 10–15 menit per hari. Mereka tidak kekurangan aplikasi; mereka kekurangan **alur yang jelas, penjelasan yang bisa dipercaya, dan bukti kemajuan**. Kebanyakan aplikasi memberi latihan yang repetitif tanpa menjelaskan *mengapa* jawaban salah, atau memberi kursus panjang yang tidak menyesuaikan level dan waktu pengguna.

Lango menargetkan celah itu dengan latihan singkat yang:

- terasa seperti permainan, bukan ujian;
- menjelaskan kesalahan secara langsung;
- mengingat apa yang sudah dikuasai dan apa yang perlu diulang;
- menunjukkan kemajuan yang bisa dipercaya.

### 2.2 Masalah yang terlihat dari kondisi produk saat ini

| Masalah | Dampak bagi pengguna | Dampak bagi bisnis |
| --- | --- | --- |
| Progres tidak tersimpan | Pengguna harus mengulang dari nol setiap refresh; tidak ada rasa kemajuan | Tidak ada retensi, tidak ada data belajar, tidak bisa mengukur value |
| Tidak ada onboarding/beranda | Pengguna mendarat di “editor” tanpa tahu harus mulai dari mana | Drop-off tinggi sebelum pelajaran pertama |
| Konten pemula tipis | Pengguna A1/A2 kehabisan materi dalam beberapa sesi | Tidak bisa memenuhi janji “belajar dari nol” |
| Tidak ada review | Materi yang salah tidak pernah muncul lagi | Belajar tidak efektif; mastery tidak nyata |
| Dua sistem auth (Clerk + JWT) | Sesi UI dan API tidak sinkron; rute dapat diakses tanpa proteksi yang konsisten; tidak ada reset password | Risiko keamanan dan data pengguna |
| Tidak ada analytics produk | Tim tidak tahu di mana pengguna berhenti | Keputusan produk berdasarkan asumsi |

### 2.3 Mengapa sekarang

- Dua modul inti sudah ada dan bisa didemokan; investasi konten Grammar (2.232 latihan) dan Number Name (7 fase, 6 bahasa) sudah cukup besar untuk tidak dibuang.
- Fondasi auth, database, dan UI sudah tersedia; yang hilang adalah lapisan produk, bukan lapisan teknologi dari nol.
- Menambah modul baru sebelum loop inti selesai akan menggandakan technical debt dan memperlebar jarak antara demo dan produk.
- Peluncuran v1.0 membutuhkan setidaknya satu siklus retensi yang terukur sebelum investasi AI tutor atau marketplace dapat dibenarkan.

### 2.4 Jobs to be Done

1. **Saat saya punya 10 menit di sela kerja, saya ingin latihan yang jelas dan singkat, supaya saya merasa maju tanpa harus menyusun kurikulum sendiri.**
2. **Saat saya salah menjawab, saya ingin tahu alasannya dan diingatkan lagi nanti, supaya kesalahan yang sama tidak terulang.**
3. **Saat saya ragu apakah saya berkembang, saya ingin melihat bukti kemajuan yang jujur, supaya saya termotivasi untuk kembali.**
4. **Saat saya mulai belajar bahasa baru, saya ingin tahu harus mulai dari mana, supaya saya tidak merasa tersesat.**

---

## 3. Visi dan Strategi Produk

### 3.1 Visi

> **Membuat latihan bahasa 10 menit yang terasa personal, menjelaskan alasannya, dan membuat orang ingin kembali besok.**

### 3.2 Misi

Lango membantu pembelajar dewasa membangun kebiasaan bahasa melalui tiga pilar yang dibangun berurutan:

1. **Practice** — modul latihan terstruktur yang menyenangkan dan tersimpan (v1).
2. **Coach** — AI tutor yang memberi umpan balik percakapan dan pelafalan (v2).
3. **Community** — tutor manusia dan sesi live untuk praktik nyata (v2+).

### 3.3 Positioning

> **Untuk pembelajar dewasa yang sibuk, Lango adalah latihan bahasa harian yang menjelaskan setiap kesalahan dan mengingat apa yang perlu diulang — tanpa komitmen kursus panjang.**

Pembeda yang harus dijaga:

| Pembeda | Bukti yang harus terlihat di produk |
| --- | --- |
| **Jelas** | Setiap jawaban salah mendapat penjelasan singkat, bukan hanya “salah”. |
| **Ingat** | Progres, mastery, dan antrean review tersimpan lintas perangkat. |
| **Singkat** | Satu sesi dapat diselesaikan dalam 5–15 menit dan selalu punya titik henti yang jelas. |
| **Adil** | XP dan streak dihitung server; tidak ada farming dari refresh atau klik berulang. |

### 3.4 Prinsip produk

1. **Satu sesi, satu kemenangan.** Setiap sesi harus memberi satu hal yang bisa dibanggakan: pelajaran selesai, streak bertambah, atau konsep naik level.
2. **Jelaskan, jangan hanya menilai.** Umpan balik adalah fitur inti, bukan tambahan.
3. **Progres adalah janji.** Jika layar mengatakan “tersimpan”, data harus benar-benar tersimpan.
4. **Kesulitan menyesuaikan pengguna, bukan sebaliknya.** Konten yang terlalu mudah atau terlalu sulit sama-sama merusak retensi.
5. **Gratis untuk loop inti.** Latihan, progres, dan review dasar harus bisa dinikmati tanpa membayar; monetisasi menyasar kedalaman, bukan akses dasar.

### 3.5 Non-goals v1.0

- Bukan aplikasi percakapan bebas dengan AI.
- Bukan marketplace tutor atau platform video conference.
- Bukan alat pembuat kurikulum untuk guru/sekolah.
- Bukan aplikasi untuk anak di bawah 13 tahun (kepatuhan COPPA).
- Bukan sertifikasi CEFR resmi.

---

## 4. Target Pengguna

### 4.1 Persona utama

| Persona | Konteks | Tujuan | Rasa sakit | Kriteria sukses |
| --- | --- | --- | --- | --- |
| **Rani, 24 — Professional Learner** | Staf marketing di Jakarta, bekerja 9–6, belajar English untuk rapat dan email | Mampu menulis email dan berbicara di meeting dalam 3 bulan | Waktu terbatas; takut salah grammar di depan atasan; pernah mencoba aplikasi lain tetapi berhenti karena tidak melihat kemajuan | Menyelesaikan 3 sesi/minggu; merasa lebih percaya diri menulis email |
| **Budi, 19 — Exam Learner** | Mahasiswa semester 3, menyiapkan TOEFL/IELTS | Naik skor grammar dan reading | Butuh penjelasan aturan, bukan hanya hafalan; sensitif harga | Menyelesaikan jalur B1–B2; akurasi latihan naik |
| **Sari, 35 — Travel Learner** | Ibu rumah tangga, belajar Spanish/English untuk traveling | Bisa berkomunikasi dasar saat liburan | Pemula total; mudah frustrasi jika materi terlalu cepat | Menyelesaikan A1; streak 7 hari |

**Persona sekunder:** pembelajar muda (18–24) yang menyukai gamifikasi dan ingin latihan cepat; pengguna desktop yang ingin fokus grammar.

**Anti-persona:** pembelajar C2 yang mencari analisis linguistik mendalam; sekolah/institusi yang membutuhkan LMS dan dashboard guru; anak-anak.

### 4.2 Kebutuhan lintas persona

| Kebutuhan | Implikasi produk |
| --- | --- |
| Umpan balik yang jelas dan tidak menghakimi | Microcopy suportif, penjelasan singkat, opsi “lihat aturan” |
| Sesi yang bisa dimulai kapan saja | Resume, daily plan, sesi 5 menit |
| Rasa aman untuk mencoba | Tanpa timer wajib di latihan inti; hearts dapat dipulihkan |
| Bukti kemajuan | Dasbor progres, riwayat, mastery per konsep |
| Kontrol atas data | Pengaturan privasi, ekspor, hapus akun |

---

## 5. Baseline Produk Saat Ini

Bagian ini adalah audit jujur atas repositori per 25 November 2026. Ini penting agar roadmap tidak dibangun di atas asumsi yang salah. **Catatan:** `context/architecture-context.md` dan `context/feature-specs/02-auth-system.md` masih menyebut Clerk; PRD ini mengusulkan penggantian dengan auth kustom email/password (D-02), sehingga bagian auth di dokumen tersebut berstatus legacy sampai keputusan disetujui dan diimplementasikan.

### 5.1 Yang sudah ada

| Area | Status | Bukti di repositori |
| --- | --- | --- |
| Situs marketing | **Berjalan** | 12 locale (`en, es, id, jp, hi, de, ar, fr, pt, it, nl, ko`), halaman home, languages, pricing, reviews, how-it-works, about, legal, SEO/JSON-LD, sitemap, GA, cookie consent |
| Auth UI | **Sebagian** | Clerk provider, halaman sign-in/sign-up dua panel, `proxy.ts`; tetapi proteksi rute tidak konsisten. Kondisi ini akan diganti auth kustom email/password. |
| Shell aplikasi | **Berjalan (metafora salah)** | `app/[lang]/editor/*` dengan navbar, sidebar “Projects”, Tabs, UserButton |
| Grammar module | **Berjalan di klien** | 60 pelajaran, 2.232 latihan, 4 tipe soal, dashboard CEFR, lesson view, practice, results |
| Number Name module | **Berjalan di klien** | 7 fase (flashcard, listen & pick, tap number, spell, speed quiz, survival, mastery), 6 bahasa (en, es, fr, de, id, ja) |
| Gamifikasi | **Sebagian, client-side** | XP, level, streak, hearts ditampilkan; badge belum diimplementasikan; tidak ada persistensi |
| API | **Sebagian** | 19 route handler (auth JWT, profile, settings, daily exercise, grammar, tutor, lessons results, home feed, community, onboarding, health, OG, Clerk proxy yang akan dihapus) |
| Database | **Sebagian** | Prisma + PostgreSQL, 30 model, seed data; model meniru mock API, bukan domain belajar |
| Design system | **Sebagian** | shadcn/ui, token CSS di `globals.css`; tetapi komponen editor memakai hex hardcoded dan tema gelap terpisah dari tema marketing |

### 5.2 Yang belum ada atau belum layak

| Kategori | Gap | Tingkat keparahan |
| --- | --- | --- |
| **Produk** | Onboarding, beranda harian, dasbor progres, antrean review, pencarian konten, pengaturan belajar | **Blocker** |
| **Persistensi** | Tidak ada penyimpanan progres Grammar/Number Name; `useState` hilang saat refresh | **Blocker** |
| **Auth** | Clerk dan JWT kustom tidak terhubung; `proxy.ts` menganggap semua `/{locale}/*` publik; tidak ada provisioning user, sesi server-side, verifikasi email, atau lupa password | **Blocker** |
| **Konten** | A1/A2/B1 hanya 10 pelajaran; B2/C1 50 pelajaran; tidak ada skema konten berversi; tidak ada validasi otomatis | **Blocker** |
| **Domain data** | Tidak ada model `LessonProgress`, `ExerciseAttempt`, `ReviewItem`, `XpEvent`, `Badge` yang sesuai kebutuhan; `User.password` belum dinamai/divalidasi sebagai hash dan belum ada tabel `Session`, token verifikasi/reset | **Blocker** |
| **Gamifikasi** | XP/streak/hearts tidak dihitung server; tidak ada anti-abuse; aturan berbeda antar-modul | **Tinggi** |
| **Kualitas** | Tidak ada test otomatis, error tracking, atau observability; tidak ada migrasi Prisma | **Tinggi** |
| **Analytics** | Tidak ada event produk; hanya GA marketing | **Tinggi** |
| **Aksesibilitas** | Belum ada audit WCAG; animasi dan audio belum memiliki kontrol preferensi | **Sedang** |
| **i18n** | 12 locale UI, tetapi konten belajar hanya English; Number Name 6 bahasa; tidak ada pemisahan locale UI vs locale konten | **Sedang** |
| **Dokumentasi** | Dokumen konteks menyebut Liveblocks, Trigger.dev, Vercel Blob, dan Daily.co, tetapi tidak ada dependensi maupun implementasinya di `package.json` | **Sedang** (risiko ekspektasi) |

### 5.3 Temuan kritis

**F-01 — Progres belajar tidak pernah meninggalkan browser.**
`ModuleProvider`, `GrammarProvider`, dan `NumberNameModule` menyimpan semua state di memori. Tidak ada panggilan API untuk menyimpan attempt, lesson completion, XP, atau review. Akibatnya produk tidak dapat menjalankan janji intinya: mengingat pengguna.

**F-02 — Auth terbelah, proteksi rute bocor, dan tidak ada pemulihan akun.**
`proxy.ts` menandai semua path `/{locale}/*` sebagai publik (termasuk `/en/editor`), sementara API memakai `Authorization: Bearer` dengan JWT kustom. Clerk tidak mengisi identitas ke API. Tidak ada sesi server-side yang dapat dicabut, verifikasi email, atau alur lupa password. Target v1.0: satu auth kustom email + password dengan bcrypt, tabel `Session`, token reset/verifikasi sekali pakai, dan email transaksional.

**F-03 — Kurikulum tidak seimbang dan tidak berversi.**
Konten Grammar adalah file TypeScript 25.067 baris tanpa skema validasi. Level A1–B1 hanya 10 pelajaran; B2–C1 50 pelajaran. Pengguna baru akan kehabisan materi sebelum kebiasaan terbentuk. Tidak ada mekanisme untuk menambah, mereview, atau merilis konten secara aman.

**F-04 — Tidak ada loop retensi.**
Tidak ada onboarding, beranda, daily goal yang terlihat, pengingat, review terjadwal, atau laporan mingguan. Satu-satunya alasan untuk kembali adalah mengingat sendiri modul yang pernah dibuka.

**F-05 — Metafora “Editor” menyesatkan.**
Navbar menyebut “Projects”, tombol “New Project” membuka Number Name, dan sidebar menampilkan “My Projects/Shared” yang tidak relevan. Ini sisa dari produk canvas/workspace. Pengguna belajar tidak mencari “project”.

**F-06 — Model data meniru mock, bukan domain.**
`DailyChallenge`, `Exercise`, `Choice`, `LessonResult`, `TutorSession`, dan model lain mengikuti JSON mock `docs/API_MOCK_DATA.md`. Tidak ada entitas yang dibutuhkan untuk mastery, SRS, atau analitik belajar. `User.password` ada tetapi tidak dipakai oleh Clerk, dan belum ada `Session`, `EmailVerificationToken`, atau `PasswordResetToken`.

**F-07 — Tidak ada jaring pengaman rilis.**
Tidak ada unit/integration/e2e test, tidak ada error tracking, tidak ada feature flag, dan tidak ada migrasi database. Setiap perubahan berisiko tinggi.

**F-08 — Janji marketing mendahului kemampuan produk.**
Homepage dan manifest menjanjikan “native speakers”, “flexible scheduling”, dan “personalized learning paths”, sementara v1 belum memiliki tutor, jadwal, atau jalur yang benar-benar personal. Perbedaan ini meningkatkan churn dan merusak kepercayaan. Copy marketing harus diselaraskan dengan v1 (modul latihan + review) dan klaim tutor diaktifkan kembali saat v2 siap.

### 5.4 Implikasi terhadap strategi

1. **Jangan menambah modul baru sebelum loop inti selesai.** Vocabulary dan Speaking ditunda sampai Grammar/Number Name tersimpan dan punya review.
2. **Perbaiki identitas dan data lebih dulu.** Auth dan model progres adalah fondasi yang tidak bisa ditambal belakangan.
3. **Investasi konten harus seimbang dengan akuisisi.** Menambah pengguna tanpa konten A1–B1 yang cukup akan mempercepat churn.
4. **Gunakan aset yang ada.** 2.232 latihan Grammar dan 7 fase Number Name adalah modal awal; fokus pada kualitas, bukan kuantitas baru.
5. **Selaraskan janji dan kenyataan.** Perbarui copy marketing sebelum kampanye akuisisi; jangan menjanjikan tutor live sebelum v2.

---

## 6. Scope dan Prioritas Rilis

### 6.1 Definisi prioritas

| Prioritas | Arti | Konsekuensi jika tidak selesai |
| --- | --- | --- |
| **P0** | Wajib untuk v1.0 | Tidak boleh rilis |
| **P1** | Penting untuk 4–6 minggu setelah rilis | Rilis tetap bisa, tetapi retensi tertekan |
| **P2** | Eksperimen / fase berikutnya | Tidak masuk v1.0 |

### 6.2 v1.0 — “Core Learning Loop” (P0)

| Epic | Hasil yang dijanjikan |
| --- | --- |
| **E1. Identitas & akun** | Satu auth email + password (bcrypt), sesi server-side, verifikasi email, lupa password, rute terlindungi |
| **E2. Onboarding** | Pengguna baru memilih target bahasa, level, goal harian, zona waktu dalam ≤ 2 menit |
| **E3. Beranda “Hari ini”** | Satu rencana belajar yang jelas dan dapat dimulai dengan satu ketukan |
| **E4. Session runner** | Pelajaran dapat dimulai, dijeda, dilanjutkan, dan diselesaikan; jawaban divalidasi server |
| **E5. Number Name v1** | 7 fase, 6 bahasa, progres tersimpan, mastery 75% |
| **E6. Grammar v1** | Jalur CEFR, 4 tipe soal, hasil, mastery, minimal 24 pelajaran A1–A2 |
| **E7. Progres & review** | Dasbor progres, mastery per konsep, antrean review SRS ringan |
| **E8. Gamifikasi v1** | XP, level, streak, hearts, badge inti; dihitung server |
| **E9. Content ops** | Skema konten berversi, validasi CI, katalog konten di database |
| **E10. Analytics & kualitas** | Event produk, funnel, error tracking, test kritis |
| **E11. Pengaturan** | Profil, preferensi belajar, aksesibilitas dasar |

### 6.3 v1.1 — “Retention & Depth” (P1, 4–6 minggu setelah v1.0)

- Notifikasi/email pengingat harian dan review.
- Ganti email dengan verifikasi ganda (email lama + email baru).
- Laporan mingguan (“week in review”).
- Placement test adaptif untuk menentukan level awal.
- Grammar Reference Library dengan pencarian.
- Vocabulary Builder beta (50 kata pertama).
- Badge yang lebih kaya dan streak freeze.
- PWA/offline untuk sesi yang sudah dimulai (bukan unduhan penuh).
- Panel admin konten ringan (import, publish, rollback).

### 6.4 v2 — “Coach & Community” (P2, kuartal berikutnya)

- AI tutor percakapan dengan riwayat sesi.
- Latihan pelafalan dengan speech recognition dan skor.
- Tutor marketplace dan booking sesi.
- Sesi live (video/audio) dengan shared notes.
- Leaderboard opt-in dan tantangan teman.
- Monetisasi Pro (AI, speaking, offline, konten premium).
- Aplikasi mobile native atau PWA lanjutan.

### 6.5 Di luar cakupan (semua fase)

- Sertifikasi CEFR resmi.
- Dashboard sekolah/enterprise.
- Kursus yang dibuat pengguna.
- Forum sosial dan komentar pada pelajaran.
- Pembayaran sebelum ada bukti retensi.
- Dukungan anak di bawah 13 tahun.
- OAuth/social login, MFA, dan SSO di v1.0 (dievaluasi untuk v1.1/v2).

### 6.6 Definisi sukses v1.0

v1.0 dianggap berhasil jika, dalam 30 hari setelah peluncuran publik:

1. ≥ 60% pengguna baru menyelesaikan onboarding.
2. ≥ 50% pengguna baru menyelesaikan pelajaran pertama dalam 24 jam; ≥ 60% memverifikasi email dalam 7 hari.
3. ≥ 25% kembali pada hari ke-7 (target 90 hari: ≥ 30%).
4. ≥ 60% pelajaran yang dimulai diselesaikan (target 90 hari: ≥ 70%).
5. ≥ 30% pengguna dengan item review jatuh tempo menyelesaikan review (target 90 hari: ≥ 40%).
6. Tidak ada kehilangan progres yang dilaporkan (0 tiket kritis).
7. p95 API baca < 300 ms, submit attempt < 500 ms; crash-free session ≥ 99,5%.

---

## 7. Arsitektur Informasi dan Navigasi

### 7.1 Peta rute yang diusulkan

| Rute | Akses | Fungsi |
| --- | --- | --- |
| `/` | Publik | Redirect berdasarkan sesi dan locale |
| `/{locale}` | Publik | Marketing home (tetap) |
| `/{locale}/sign-in`, `/{locale}/sign-up` | Publik | Auth email + password |
| `/{locale}/forgot-password` | Publik | Form permintaan tautan reset password |
| `/{locale}/reset-password` | Publik (token) | Form password baru dari tautan email |
| `/{locale}/verify-email` | Publik (token) | Verifikasi email dari tautan |
| `/{locale}/onboarding` | Terlindungi, belum onboarding | Target bahasa, level, goal, zona waktu |
| `/{locale}/learn` | Terlindungi | Beranda “Hari ini” |
| `/{locale}/learn/modules` | Terlindungi | Daftar modul |
| `/{locale}/learn/modules/[module]` | Terlindungi | Hub modul (level/fase) |
| `/{locale}/learn/lesson/[lessonId]` | Terlindungi | Session runner |
| `/{locale}/learn/review` | Terlindungi | Antrean review |
| `/{locale}/learn/results/[sessionId]` | Terlindungi | Ringkasan sesi |
| `/{locale}/progress` | Terlindungi | Dasbor progres & riwayat |
| `/{locale}/profile` | Terlindungi | Profil, preferensi, privasi |
| `/api/v1/*` | Terlindungi (kecuali katalog) | API produk |

**Perubahan dari kondisi saat ini:**

- `/{locale}/editor` dipertahankan sebagai redirect 301 ke `/{locale}/learn` selama 1 rilis, lalu dihapus.
- Konsep “Projects”, “Shared”, “New Project”, dan dialog project dihapus dari alur belajar.
- “Number Name” dan “Grammar” menjadi modul di dalam `/learn/modules`, bukan item sidebar project.
- `/{locale}/languages`, `/{locale}/pricing`, dan halaman marketing lain tetap publik.
- Halaman auth memakai form sendiri (email, password, lupa password), bukan komponen Clerk.

### 7.2 Navigasi utama

**Mobile (≤ 768 px):** bottom navigation dengan empat item:

1. **Learn** — beranda hari ini.
2. **Review** — antrean review dengan badge jumlah item jatuh tempo.
3. **Progress** — dasbor progres.
4. **Profile** — akun, preferensi, bantuan.

**Desktop (≥ 1024 px):** sidebar kiri ringkas (Learn, Review, Progress, Modules) + top bar dengan streak, XP, dan menu profil. Sidebar dapat diciutkan; tidak boleh menutupi konten secara permanen.

**Tablet:** bottom navigation dipertahankan; sidebar menjadi overlay.

### 7.3 Hierarki layar

```
Learn (Hari ini)
├── Rencana hari ini
│   ├── Lanjutkan pelajaran → Session runner
│   ├── Review jatuh tempo → Review session
│   └── Pemanasan Number Name → Module hub
├── Modul
│   ├── Grammar → Level CEFR → Lesson
│   └── Number Name → Level angka → Phase
├── Progress
│   ├── Ringkasan
│   ├── Mastery per konsep
│   └── Riwayat
└── Profile
    ├── Profil & target
    ├── Preferensi belajar
    ├── Notifikasi
    └── Privasi & data
```

### 7.4 Prinsip navigasi

- **Satu tujuan per layar.** Beranda menjawab “apa yang harus saya lakukan sekarang?”.
- **Kedalaman maksimal tiga ketukan** dari beranda ke latihan.
- **Kembali selalu aman.** Meninggalkan sesi tidak menghilangkan progres; sesi dapat dilanjutkan.
- **Tidak ada jalan buntu.** Empty state selalu menawarkan aksi berikutnya.

---

## 8. User Journeys

### 8.1 Journey A — Pengguna baru menyelesaikan sesi pertama

**Aktor:** Rani, baru mendaftar.
**Tujuan:** menyelesaikan satu pelajaran dalam < 10 menit.

1. Rani membuka `/en` dan menekan “Start learning”.
2. Rani mengisi form sign-up: nama, email, password, konfirmasi password. Server menyimpan `passwordHash` (bcrypt), membuat sesi HttpOnly, dan mengirim email verifikasi. Rani langsung masuk tanpa menunggu verifikasi.
3. Rani diarahkan ke onboarding:
   - Target bahasa: English (default untuk locale `id`).
   - Level: “Saya bisa memahami kalimat sederhana” → rekomendasi A2.
   - Goal harian: 15 menit.
   - Zona waktu terdeteksi `Asia/Jakarta`; dapat diubah.
4. Sistem membuat rencana hari ini: 1 pelajaran A2 + 3 pemanasan Number Name.
5. Rani menekan “Mulai pelajaran”. Session runner menampilkan penjelasan singkat, lalu 4 latihan.
6. Setiap jawaban langsung mendapat umpan balik dan penjelasan. Jawaban disimpan via `POST /api/v1/attempts`.
7. Setelah latihan terakhir, ringkasan menampilkan akurasi, XP, dan “besok: review 2 konsep”.
8. Rani menutup aplikasi. Progres tetap ada saat ia kembali; banner “verifikasi email” tetap terlihat sampai ia mengklik tautan.

**Edge cases:**

- Onboarding ditinggalkan di tengah → dilanjutkan dari langkah terakhir.
- Email sudah terdaftar → tampilkan pesan generik dan tautan “Masuk” / “Lupa password”, jangan membocorkan status akun.
- Token verifikasi kedaluwarsa → tombol “Kirim ulang verifikasi” dengan rate limit.
- Jaringan putus saat submit → jawaban disimpan lokal dan dikirim ulang saat online; UI menandai “menunggu sinkronisasi”.

### 8.2 Journey B — Pengguna kembali besok

1. Rani membuka `/en/learn`.
2. Beranda menampilkan: streak 1 hari, goal 15 menit (8 menit tercapai), dan rencana hari ini:
   - Review 2 konsep (5 menit) — alasan: “2 konsep perlu diulang”.
   - Lanjutkan A2: Past Simple — alasan: “Lanjutan dari pelajaran terakhir”.
3. Ia memilih review. Dua soal muncul, masing-masing dengan penjelasan.
4. Setelah review, ia menyelesaikan pelajaran berikutnya.
5. Goal harian tercapai → animasi singkat, XP +30, streak menjadi 2.
6. Ia melihat progres minggu ini dan menutup aplikasi.

### 8.3 Journey C — Review jatuh tempo

1. Pengguna dengan 8 item review membuka tab Review (badge “8”).
2. Antrean diurutkan berdasarkan overdue dan prioritas; pengguna dapat memilih “Mulai semua” atau per item.
3. Setiap jawaban memperbarui jadwal SRS: benar → interval lebih panjang; salah → kembali dalam 1 hari.
4. Jika semua selesai: “Review selesai. 6 dari 8 benar. 2 konsep akan muncul lagi besok.”
5. Jika pengguna berhenti di tengah: sisa item tetap jatuh tempo; progres per item tersimpan.

### 8.4 Journey D — Naik level dan mastery

1. Pengguna menyelesaikan semua pelajaran A1 Grammar.
2. Sistem menandai A1 “completed” dan menawarkan “Mastery Check A1” (20 soal campuran).
3. Lulus ≥ 75% → badge “A1 Grammar Master”, XP bonus, B1 path terbuka; ringkasan menunjukkan konsep terlemah.
4. Gagal → rekomendasi 3 pelajaran spesifik, bukan mengulang seluruh level.
5. Mastery test dapat diulang setelah 24 jam; percobaan tidak memberi XP berulang.

### 8.5 Journey E — Pemulihan setelah gagal

- **Hearts habis:** sesi dijeda, bukan dihapus. Pengguna dapat menunggu regenerasi (1 heart/30 menit), menyelesaikan sesi tanpa XP, atau kembali besok.
- **Kesalahan berulang:** setelah 3 kesalahan pada konsep yang sama, sistem menawarkan “lihat aturan” dan memasukkan konsep ke review prioritas tinggi.
- **Offline:** sesi yang sudah dimulai dapat dilanjutkan; jawaban diantrikan dan disinkronkan. Sesi baru memerlukan koneksi (v1.1 untuk offline penuh).

### 8.6 Journey F — Lupa password dan verifikasi email

**Lupa password (forgot password):**

1. Dari halaman sign-in, pengguna menekan “Lupa password?”.
2. Pengguna memasukkan email. Sistem **selalu** menampilkan pesan yang sama: “Jika email terdaftar, tautan reset telah dikirim.”
3. Jika email terdaftar, sistem membuat token acak 32 byte, menyimpan hash-nya dengan masa berlaku 30 menit, dan mengirim tautan `/{locale}/reset-password?token=...`.
4. Pengguna membuka tautan, memasukkan password baru + konfirmasi. Server memvalidasi kebijakan password, menyimpan hash bcrypt baru, menandai token terpakai, dan **mencabut semua sesi** pengguna.
5. Pengguna diarahkan ke sign-in dengan pesan sukses dan dapat masuk dengan password baru.

**Verifikasi email:**

1. Setelah sign-up, sistem mengirim tautan verifikasi (token 24 jam, sekali pakai).
2. Pengguna dapat tetap belajar; banner “Verifikasi email” tampil di beranda dan profil.
3. Mengklik tautan menandai `emailVerifiedAt`; banner hilang.
4. Sebelum terverifikasi, pengguna tidak dapat mengubah email atau menghapus akun; perubahan password melalui pengaturan juga memerlukan verifikasi.

**Edge cases:**

- Token kedaluwarsa/terpakai → tampilkan “Tautan tidak valid atau kedaluwarsa” + tombol minta tautan baru.
- Email tidak terdaftar → respons dan timing dibuat seragam; jangan membocorkan keberadaan akun.
- Terlalu banyak permintaan → `429` dengan pesan “Coba lagi dalam 15 menit”.
- Password baru sama dengan password lama → tolak dengan pesan jelas.
- Email gagal terkirim → antrean retry; tampilkan status “email sedang dikirim” dan opsi hubungi support.

---

## 9. Functional Requirements

**Konvensi ID:** `AUTH`, `ONB`, `HOME`, `SES`, `NUM`, `GRM`, `PRG`, `GAM`, `CNT`, `ANL`, `SET`. Setiap requirement memiliki kriteria penerimaan yang dapat diuji. Requirement tanpa penanda prioritas dianggap **P0**.

### E1. Identitas dan Akun

| ID | Requirement | Prioritas | Kriteria penerimaan |
| --- | --- | --- | --- |
| **AUTH-01** | Registrasi email + password dengan bcrypt. | P0 | Email dinormalisasi (lowercase, trim); password minimal 8 karakter dan maksimal 72 byte, ditolak jika ada di daftar password umum; `passwordHash` memakai bcrypt cost ≥ 12; tidak ada password plaintext di log/DB; email duplikat menghasilkan pesan generik; `User`, `UserStats`, dan sesi dibuat dalam satu transaksi; email verifikasi dikirim setelah commit. |
| **AUTH-02** | Login email + password. | P0 | Password diverifikasi dengan bcrypt; kredensial salah menghasilkan pesan generik “Email atau password salah”; rate limit 10 percobaan/15 menit per IP dan 5/15 menit per akun; respons tidak memuat hash/password; `rememberMe` opsional memperpanjang sesi; akun `passwordHash = null` (legacy) ditolak dan diarahkan ke lupa password. |
| **AUTH-03** | Sesi server-side yang dapat dicabut. | P0 | Cookie `HttpOnly`, `Secure`, `SameSite=Lax`; masa berlaku 7 hari default atau 30 hari dengan “Ingat saya” (sliding, maksimum absolut 90 hari); token sesi acak disimpan sebagai hash di tabel `Session`; logout mencabut sesi aktif; reset password mencabut semua sesi; request dengan sesi dicabut mendapat `401`. |
| **AUTH-04** | Proteksi rute dan onboarding gate. | P0 | Hanya marketing, halaman auth, dan katalog yang publik; `/{locale}/learn/*`, `/{locale}/progress`, `/{locale}/profile`, dan `/api/v1/*` privat memerlukan sesi; pengguna anonim diarahkan ke sign-in dengan `redirect_url`; `/{locale}/editor` tidak dapat diakses anonim; user tanpa `onboardingCompletedAt` diarahkan ke onboarding. |
| **AUTH-05** | Verifikasi email dengan token sekali pakai. | P0 | Token 32 byte, disimpan sebagai hash, berlaku 24 jam, sekali pakai; token lama tidak valid saat resend; tautan verifikasi membuka `/{locale}/verify-email`; resend maksimal 3×/jam; banner verifikasi tampil sampai `emailVerifiedAt` terisi; pengguna belum terverifikasi dapat belajar, tetapi wajib verifikasi untuk mengubah email/menghapus akun; perubahan password melalui pengaturan juga memerlukan verifikasi (reset via email tetap tersedia). |
| **AUTH-06** | Lupa password via email (forgot password). | P0 | `POST /api/v1/auth/forgot-password` selalu mengembalikan pesan generik dan tidak membocorkan keberadaan akun; token 32 byte berlaku 30 menit, sekali pakai, disimpan sebagai hash; token lama tidak valid saat permintaan baru; rate limit 3 permintaan/jam per email dan per IP; halaman reset memvalidasi kebijakan password; reset yang berhasil menandai email terverifikasi, mencabut semua sesi, dan mengirim email konfirmasi; token tidak boleh muncul di log atau referrer. |
| **AUTH-07** | Ganti password untuk pengguna yang sudah login. | P1 | Wajib email terverifikasi dan password saat ini; password baru mengikuti kebijakan; semua sesi lain dicabut; email konfirmasi dikirim; pengguna tetap login di sesi saat ini. |
| **AUTH-08** | Logout dari perangkat saat ini dan semua perangkat. | P0 | Logout menghapus cookie dan mencabut sesi di DB; “keluar dari semua perangkat” mencabut seluruh sesi user; UI mengonfirmasi sebelum aksi massal. |
| **AUTH-09** | Pengguna dapat mengekspor dan menghapus akun beserta datanya (UU PDP/GDPR). | P1 | Wajib email terverifikasi + konfirmasi password; ekspor JSON dalam < 24 jam; hapus akun menghapus PII dan progres dalam 30 hari; email konfirmasi dikirim. |
| **AUTH-10** | Peran `learner` menjadi satu-satunya peran v1; struktur siap untuk `tutor` di v2. | P1 | Field `role` tersedia dengan default `learner`; tidak ada UI tutor di v1; otorisasi berbasis peran teruji. |
| **AUTH-11** | Rate limit dan audit peristiwa autentikasi. | P0 | Login, registrasi, forgot/reset, dan verifikasi dibatasi per IP + akun; percobaan gagal dicatat tanpa password/token; alert jika lonjakan gagal login > 100/menit; log disimpan ≤ 90 hari. |

### E2. Onboarding

| ID | Requirement | Prioritas | Kriteria penerimaan |
| --- | --- | --- | --- |
| **ONB-01** | Pengguna memilih target bahasa; English menjadi default untuk locale `id`. Grammar v1 hanya tersedia untuk English; 5 bahasa lain (es, fr, de, id, ja) tersedia untuk Number Name dan diberi label cakupan yang jujur. | P0 | Pilihan tersimpan di `User.targetLanguage`; Number Name memakai bahasa target tersebut, bukan `lang="en"` hardcoded; jika Grammar belum tersedia untuk bahasa itu, UI menampilkan “segera hadir”, bukan level kosong. |
| **ONB-02** | Pengguna memilih level awal (A1–C1) dengan deskripsi konkret dan rekomendasi. | P0 | Setiap opsi memiliki contoh kemampuan; level tersimpan dan menentukan jalur awal. Placement test adaptif masuk P1. |
| **ONB-03** | Pengguna memilih goal harian: 5, 10, 15, atau 30 menit. | P0 | Tersimpan di `dailyGoalMinutes`; beranda menghitung progres terhadap goal tersebut. |
| **ONB-04** | Pengguna memilih motivasi (karier, ujian, traveling, hobi, keluarga). | P1 | Tersimpan; dipakai untuk rekomendasi konten dan copy. Boleh dilewati. |
| **ONB-05** | Zona waktu terdeteksi otomatis dan dapat diubah. | P0 | Default dari browser; batas hari streak dihitung di zona waktu pengguna. |
| **ONB-06** | Onboarding selesai dalam ≤ 2 menit dan dapat dilanjutkan. | P0 | 4 langkah inti (motivasi opsional), progress indicator, tombol back; state tersimpan per langkah; completion event terkirim. |

### E3. Beranda “Hari Ini”

| ID | Requirement | Prioritas | Kriteria penerimaan |
| --- | --- | --- | --- |
| **HOME-01** | Beranda menampilkan rencana hari ini yang dihasilkan aturan: lanjutkan pelajaran, review jatuh tempo, pemanasan modul. | P0 | Rencana berisi maksimal 3 item, total estimasi 5–15 menit, dan dapat dimulai dengan satu ketukan. |
| **HOME-02** | Menampilkan status goal harian, streak, XP, dan level. | P0 | Angka konsisten dengan data server; tidak ada perbedaan setelah refresh. |
| **HOME-03** | Menampilkan tombol “Lanjutkan” untuk sesi yang belum selesai. | P0 | Sesi yang ditinggalkan di tengah dapat dilanjutkan pada soal terakhir; tidak ada pengulangan XP. |
| **HOME-04** | Menampilkan pintu masuk review dengan jumlah item jatuh tempo. | P0 | Badge jumlah akurat; jika 0, tampil empty state “Tidak ada review hari ini”. |
| **HOME-05** | Menampilkan ringkasan progres minggu ini: pelajaran, menit, akurasi. | P1 | Data dihitung dari activity/attempt; waktu mengikuti zona waktu pengguna. |
| **HOME-06** | Setiap item rencana memiliki alasan yang dapat dibaca pengguna. | P1 | Contoh: “Lanjutan dari pelajaran terakhir”, “3 konsep perlu diulang”. |
| **HOME-07** | Semua state (loading, error, empty, offline) ditangani secara eksplisit. | P0 | Tidak ada layar kosong tanpa aksi; error memiliki tombol “Coba lagi”; skeleton muncul < 300 ms. |
| **HOME-08** | Beranda mobile-first dan dapat digunakan satu tangan. | P0 | Tombol utama berada di area jangkauan; tidak ada horizontal scroll pada 360 px. |

#### E3.1 Aturan rencana harian v1

Rencana dihasilkan di server dengan urutan prioritas berikut, lalu dipotong agar total estimasi 5–15 menit dan maksimal 3 item:

1. **Sesi yang belum selesai** — selalu tampil pertama dengan CTA “Lanjutkan”.
2. **Review jatuh tempo** — maksimal 10 item atau 5 menit, mana yang lebih dulu.
3. **Pelajaran berikutnya** di jalur level pengguna (belum selesai, berurutan).
4. **Pemanasan modul** — 3–5 menit Number Name atau latihan cepat, hanya jika dua item pertama belum memenuhi goal.

Aturan tambahan:

- Jika goal harian sudah tercapai, tampilkan rencana opsional, bukan wajib.
- Jika tidak ada review dan tidak ada pelajaran berikutnya, tampilkan “Mastery check” atau “Jelajahi modul lain”.
- Alasan setiap item dikirim ke klien (lihat HOME-06) dan tidak boleh kosong.
- Rencana dihitung ulang saat halaman dimuat; perubahan hearts/streak tidak boleh membuat item hilang di tengah sesi.

### E4. Session Runner

| ID | Requirement | Prioritas | Kriteria penerimaan |
| --- | --- | --- | --- |
| **SES-01** | Sesi dapat dimulai, dijeda, dilanjutkan, dan diselesaikan. | P0 | `LessonProgress` dibuat saat mulai; posisi soal terakhir tersimpan; resume memulihkan state. |
| **SES-02** | Session runner mendukung minimal empat tipe soal: multiple choice, fill-in-the-blank, sentence ordering, correction. | P0 | Keempat tipe tampil dan dapat dijawab di mobile/desktop; tipe tidak dikenal menampilkan fallback yang aman. |
| **SES-03** | Setiap jawaban divalidasi dan dinilai di server. | P0 | Klien tidak dapat menaikkan XP dengan memodifikasi payload; server mengembalikan `correct`, `explanation`, `xpAwarded`. |
| **SES-04** | Umpan balik langsung menampilkan benar/salah, jawaban benar, dan penjelasan. | P0 | Penjelasan muncul ≤ 300 ms setelah respons; tidak ada jawaban benar yang bocor sebelum submit. |
| **SES-05** | Hearts berkurang saat jawaban salah dan diregenerasi sesuai aturan. | P0 | Perubahan hearts atomik di server; refresh tidak menggandakan pengurangan; regenerasi berbasis waktu server. |
| **SES-06** | Ringkasan sesi menampilkan akurasi, XP, hearts, konsep lemah, dan langkah berikutnya. | P0 | Semua angka berasal dari server; CTA “Review konsep lemah” mengarah ke antrean yang tepat. |
| **SES-07** | XP diberikan secara idempoten dan tidak dapat diulang dengan refresh. | P0 | `clientAttemptId` unik per user; submit ulang mengembalikan hasil yang sama tanpa XP tambahan. |
| **SES-08** | Sesi dapat dioperasikan dengan keyboard dan screen reader. | P0 | Fokus terkelola; semua kontrol memiliki label; urutan baca logis; tidak ada jebakan fokus. |
| **SES-09** | Event sesi dikirim untuk analitik. | P1 | `lesson_started`, `exercise_answered`, `lesson_completed`, `session_abandoned` terkirim dengan properti yang terdokumentasi. |

### E5. Number Name

| ID | Requirement | Prioritas | Kriteria penerimaan |
| --- | --- | --- | --- |
| **NUM-01** | Modul dapat dibuka dari daftar modul dan dari beranda; bahasa mengikuti target bahasa pengguna, dapat diganti. | P0 | 6 bahasa yang didukung tampil; pilihan tersimpan; tidak ada lagi `lang="en"` hardcoded untuk semua pengguna. |
| **NUM-02** | Tujuh fase tersedia: flashcard, listen & pick, tap number, spell, speed quiz, survival, mastery. | P0 | Setiap fase dapat diselesaikan dan memberi progres; fase terkunci sampai prasyarat selesai. |
| **NUM-03** | Tujuh level angka: 0–10, 11–20, puluhan, 21–99, ratusan, ribuan, jutaan. | P0 | Level terkunci/terbuka berdasarkan mastery level sebelumnya; konten sesuai rentang. |
| **NUM-04** | Audio angka diputar dari rekaman native, dengan fallback TTS. | P0 | Audio diputar hanya setelah interaksi pengguna; tersedia tombol putar ulang; transcript/teks angka terlihat. |
| **NUM-05** | XP, hearts, dan streak Number Name memakai aturan gamifikasi global. | P0 | Tidak ada aturan ganda; XP yang terlihat sama dengan yang tersimpan di `XpEvent`. |
| **NUM-06** | Mastery test lulus ≥ 75% dan membuka level berikutnya. | P0 | Hasil dihitung dari 20 soal campuran; percobaan gagal memberi rekomendasi level/fase. |
| **NUM-07** | Angka yang sering salah masuk antrean review. | P1 | Setiap angka/concept key memiliki `ReviewItem`; muncul di tab Review. |
| **NUM-08** | Konten angka divalidasi native speaker dan mendukung transliterasi untuk aksara non-Latin. | P0 | Checklist QA per bahasa; tidak ada terjemahan mesin tanpa review; teks Arab/Jepang tampil benar. |
| **NUM-09** | Fase Speak the Number, Friend Challenge, dan Shopping Simulation ditunda. | P2 | Tidak ada UI setengah jadi; tercatat di backlog v2. |
| **NUM-10** | Ordinal dan angka dalam konteks (harga, tanggal, telepon) masuk v1.1. | P1 | Konten baru mengikuti skema; muncul sebagai level tambahan. |

### E6. Grammar

| ID | Requirement | Prioritas | Kriteria penerimaan |
| --- | --- | --- | --- |
| **GRM-01** | Jalur belajar Grammar diorganisasi per CEFR A1–C1 dan kategori grammar. | P0 | Pengguna dapat memilih level; rekomendasi level mengikuti onboarding; semua level memiliki deskripsi. |
| **GRM-02** | Setiap pelajaran berisi penjelasan, aturan, contoh, tabel/tips, dan 3–5 latihan. | P0 | Validasi skema menolak pelajaran tanpa penjelasan atau < 3 latihan; semua field wajib terisi. |
| **GRM-03** | Empat tipe latihan didukung: multiple choice, fill-in-the-blank, ordering, correction. | P0 | Setiap tipe memiliki komponen dan validasi jawaban sendiri; tidak ada bug navigasi antar-tipe. |
| **GRM-04** | Fill-in-the-blank menerima variasi jawaban (case-insensitive, kontraksi, toleransi ejaan ringan). | P1 | `answerVariants` diuji; jawaban valid tidak ditolak; jawaban jelas salah tetap salah. |
| **GRM-05** | Kurikulum seimbang: minimal 12 pelajaran A1 dan 12 pelajaran A2 saat v1.0; B1 minimal 8; B2/C1 tetap tersedia sebagai beta. | P0 | Content audit menunjukkan jumlah dan kualitas; tidak ada level kosong di jalur A1–B1. |
| **GRM-06** | Pelajaran dapat ditandai selesai dan mastered. | P0 | `LessonProgress.status` berpindah `in_progress → completed → mastered`; timestamp tersimpan. |
| **GRM-07** | Hasil pelajaran menampilkan akurasi, XP, jawaban benar/salah, dan penjelasan. | P0 | Hasil dapat dibuka kembali dari riwayat; data konsisten dengan attempt. |
| **GRM-08** | Konsep yang salah masuk antrean review dengan prioritas. | P0 | `conceptKey` ada di setiap latihan; prioritas dihitung dari error count dan recency. |
| **GRM-09** | Grammar Reference Library dengan pencarian dan tautan ke pelajaran. | P1 | Minimal 20 entri; pencarian < 300 ms; dapat dibuka dari latihan tanpa kehilangan jawaban. |
| **GRM-10** | Category mastery quiz dan badge per kategori. | P1 | Kuis ≥ 10 soal; lulus ≥ 80%; badge hanya diberikan sekali. |
| **GRM-11** | Audio untuk istilah dan contoh kunci. | P1 | Audio tersedia untuk minimal 50% pelajaran A1–B1; transcript tersedia. |
| **GRM-12** | Konten Grammar memiliki versi dan checksum; perubahan tidak merusak progres lama. | P0 | `contentVersion` tersimpan di attempt; migrasi konten tidak mengubah ID pelajaran/latihan. |

### E7. Progres dan Review

| ID | Requirement | Prioritas | Kriteria penerimaan |
| --- | --- | --- | --- |
| **PRG-01** | Dasbor progres menampilkan pelajaran selesai, mastery, akurasi, menit belajar, dan streak. | P0 | Semua metrik dapat dihitung ulang dari event/attempt; tidak ada angka hardcoded. |
| **PRG-02** | Progres dipecah per modul dan per level CEFR/fase. | P0 | Pengguna dapat melihat Grammar A1 vs A2 dan Number Name level 1 vs 2. |
| **PRG-03** | Activity heatmap/riwayat harian tersedia. | P1 | 28 hari terakhir; hari tanpa aktivitas tetap terlihat; waktu mengikuti zona waktu. |
| **PRG-04** | Antrean review berisi item yang jatuh tempo, diurutkan berdasarkan overdue dan priority. | P0 | Item yang belum jatuh tempo tidak muncul; item salah muncul kembali sesuai jadwal; jumlah akurat. |
| **PRG-05** | Sesi review dapat diselesaikan dan memperbarui jadwal SRS. | P0 | Setiap jawaban memperbarui `interval`, `ease`, `dueAt`; ringkasan review tersedia. |
| **PRG-06** | Laporan mingguan berisi ringkasan, kekuatan, dan fokus berikutnya. | P1 | Dikirim/ditampilkan setiap Senin; dapat dibuka dari Progress. |
| **PRG-07** | Pengguna dapat mengekspor riwayat belajar. | P1 | Format JSON/CSV; tautan unduhan berlaku 7 hari. |
| **PRG-08** | Mastery pelajaran didefinisikan eksplisit: seluruh latihan diselesaikan dengan akurasi ≥ 80% pada attempt terakhir, lalu dipertahankan melalui review. Mastery check level memakai ambang modul (Number Name 75%, Grammar 80%). | P0 | Status `mastered` hanya diberikan jika kriteria terpenuhi; jika review konsep gagal berulang, status turun ke `needs_review` dan item masuk prioritas tinggi. |

#### E7.1 Aturan SRS v1

SRS v1 memakai SM-2 yang disederhanakan. Setiap konsep memiliki satu `ReviewItem` per user.

| Kondisi | Perubahan interval | Perubahan ease | Status |
| --- | --- | --- | --- |
| Benar, jawaban cepat (< 5 detik) | `interval = max(1, round(interval × ease))` | `ease = min(2,8, ease + 0,1)` | Active |
| Benar, jawaban normal | `interval = max(1, round(interval × ease))` | Tidak berubah | Active |
| Salah | `interval = 1` | `ease = max(1,3, ease − 0,2)`; `lapses++` | Active, priority high |
| Pertama kali dibuat | `interval = 1`, `dueAt = besok` | `2,5` | Active |
| 3× benar berturut-turut dengan interval ≥ 30 hari | Tetap | Tetap | Retired (tidak muncul, riwayat disimpan) |

**Prioritas:**

- `high` jika `lapses ≥ 3` atau overdue ≥ 3 hari.
- `medium` jika overdue 1–2 hari.
- `low` jika due hari ini dan belum overdue.

**Batas:** interval maksimal 180 hari. `dueAt` dihitung dari tengah malam zona waktu pengguna, bukan dari jam submit. Item review yang belum dijawab tidak dihapus dan tetap muncul di antrean.

### E8. Gamifikasi

| ID | Requirement | Prioritas | Kriteria penerimaan |
| --- | --- | --- | --- |
| **GAM-01** | XP diberikan sesuai tabel aturan tunggal untuk semua modul. | P0 | Tabel aturan XP di E8.1 diimplementasikan di server; tidak ada penambahan XP dari klien. |
| **GAM-02** | Level pengguna dihitung dari total XP dengan kurva yang terdokumentasi. | P0 | Level tidak pernah turun; batas harian XP mencegah farming; level tampil konsisten di semua layar. |
| **GAM-03** | Streak dihitung per hari di zona waktu pengguna; satu aktivitas kualifikasi per hari. | P0 | Aktivitas pada 23:59 dan 00:01 di zona waktu yang sama dihitung berbeda hari; perjalanan lintas zona waktu tidak memecah streak secara tidak adil. |
| **GAM-04** | Hearts maksimal 5, berkurang 1 per jawaban salah, regenerasi 1 per 30 menit. | P0 | Waktu regenerasi dari server; tidak ada pembelian hearts di v1; hearts 0 menjeda sesi. |
| **GAM-05** | Badge inti tersedia: first lesson, 7-day streak, first mastery, 100 exercises, perfect lesson, module completion. | P1 | Badge diberikan sekali, memiliki timestamp, dan tampil di profil. |
| **GAM-06** | Sistem mencegah penyalahgunaan XP/streak. | P0 | Rate limit submit; attempt duplikat tidak memberi XP; XP jawaban benar hanya sekali per latihan per hari; jawaban yang dikirim < 300 ms tetap dicatat tetapi tidak memberi bonus kecepatan. |
| **GAM-07** | Leaderboard mingguan opt-in per bahasa. | P2 | Tidak ada leaderboard di v1; desain privasi disiapkan untuk v2. |
| **GAM-08** | Streak freeze satu kali per minggu. | P1 | Dapat diaktifkan pengguna; tidak mengurangi streak; tercatat di riwayat. |

#### E8.1 Tabel aturan XP (v1)

| Aksi | XP | Batas |
| --- | --- | --- |
| Jawaban benar | 10 | Pertama kali benar per latihan per hari; ulangan di hari yang sama = 0 |
| Bonus pertama kali benar | +5 | Sekali per latihan seumur akun |
| Menyelesaikan pelajaran | 50 | Sekali per pelajaran; ulangan = 10 |
| Akurasi 100% dalam pelajaran | +25 | Sekali per pelajaran |
| Menyelesaikan goal harian | 30 | Sekali per hari |
| Menyelesaikan item review | 5 | Per item, maksimal 50/hari |
| Menyelesaikan fase Number Name | 20 | Sekali per fase per level |
| Lulus mastery test | 100 | Sekali per level |
| **Batas XP harian** | 500 | Reset tengah malam zona waktu pengguna |

#### E8.2 Kurva level

- XP untuk naik dari level `L` ke `L+1` = `100 + (L - 1) × 50`.
- Level maksimal v1: 50.
- Level tidak pernah turun.
- Contoh: Level 1 → 2 membutuhkan 100 XP; Level 2 → 3 membutuhkan 150 XP; total 250 XP untuk mencapai level 3.

#### E8.3 Badge inti

| Badge | Pemicu |
| --- | --- |
| First Steps | Menyelesaikan pelajaran pertama |
| Week Warrior | Streak 7 hari |
| Perfect Session | Akurasi 100% dalam satu pelajaran (≥ 4 latihan) |
| Century | 100 latihan benar |
| Number Ninja | Lulus mastery Number Name level 1 |
| Grammar Explorer | Menyelesaikan 10 pelajaran Grammar |
| A1 Master | Lulus mastery check A1 |
| Comeback | Kembali setelah 7 hari tidak aktif dan menyelesaikan sesi |

### E9. Content Operations

| ID | Requirement | Prioritas | Kriteria penerimaan |
| --- | --- | --- | --- |
| **CNT-01** | Skema konten berversi untuk lesson, exercise, concept key, dan audio. | P0 | Skema Zod tersedia; `schemaVersion` wajib; validasi berjalan di CI. |
| **CNT-02** | Katalog konten (modul, level, pelajaran, jumlah latihan) tersedia di database. | P0 | API katalog mengembalikan data dari DB; konten penuh dapat tetap di file/objek. |
| **CNT-03** | Pipeline import/seed memvalidasi, menghitung checksum, dan menolak konten duplikat/ID bentrok. | P0 | `npm run content:validate` gagal pada konten invalid; import idempoten. |
| **CNT-04** | Setiap konten melewati review native speaker dan checklist kualitas. | P0 | Checklist tersimpan per pelajaran; status `draft/reviewed/published`; hanya published yang tampil. |
| **CNT-05** | Aset audio memiliki pipeline unggah, penamaan, dan fallback TTS. | P1 | Semua audio punya metadata bahasa, angka/teks, dan transcript; aset hilang tidak membuat sesi crash. |
| **CNT-06** | Konten dapat di-rollback dan di-feature-flag. | P1 | Versi sebelumnya dapat dipulihkan < 5 menit; flag mematikan modul tanpa deploy. |

### E10. Analytics, Notifikasi, dan Kualitas

| ID | Requirement | Prioritas | Kriteria penerimaan |
| --- | --- | --- | --- |
| **ANL-01** | Event produk terdefinisi dan terkirim dengan skema properti. | P0 | Tabel event di bagian 14 diimplementasikan; tidak ada PII di properti. |
| **ANL-02** | Dashboard funnel acquisition → activation → retention → learning outcome tersedia. | P0 | Dashboard dapat menjawab: berapa yang onboarding, berapa yang mulai, berapa yang selesai, berapa yang kembali D7. |
| **ANL-03** | Error tracking dan structured logging aktif. | P0 | Error frontend/backend memiliki `requestId`; alert untuk error rate > 1%. |
| **ANL-04** | Consent analytics dihormati; pengguna dapat menolak. | P0 | Tidak ada event non-esensial sebelum consent; penolakan tersimpan. |
| **ANL-05** | Preferensi notifikasi tersedia. | P1 | Email/push reminder opt-in; unsubscribe satu klik. |
| **ANL-06** | Pengingat harian dan review dikirim pada jam yang dipilih pengguna. | P1 | Tidak lebih dari 1 email/hari; jam mengikuti zona waktu; berhenti setelah 7 hari tidak aktif (kecuali re-engagement eksplisit). |

### E11. Pengaturan

| ID | Requirement | Prioritas | Kriteria penerimaan |
| --- | --- | --- | --- |
| **SET-01** | Profil menampilkan nama, avatar, bahasa asli, target bahasa, level, dan goal. | P0 | Dapat diedit; perubahan langsung terlihat di beranda. |
| **SET-02** | Preferensi belajar: goal harian, pengingat, suara tutor, target bahasa. | P1 | Tersimpan dan dipakai oleh mesin rekomendasi. |
| **SET-03** | Preferensi aksesibilitas: kurangi animasi, ukuran teks, transcript audio. | P1 | Preferensi dihormati di seluruh modul; tidak merusak layout. |
| **SET-04** | Halaman bantuan/FAQ dan kontak. | P1 | Tautan dari setiap layar error; tidak ada halaman kosong. |

---

## 10. UX dan Design Requirements

### 10.1 Prinsip desain

1. **Tenang, bukan ramai.** Satu aksi utama per layar; gamifikasi tidak boleh menutupi konten belajar.
2. **Jelas sebelum cantik.** Label tombol memakai kata kerja; status selalu terlihat.
3. **Konsisten lintas modul.** XP, hearts, streak, dan pola feedback memiliki aturan visual yang sama.
4. **Mobile-first, desktop-capable.** Semua fitur inti dapat diselesaikan di layar 360 px.
5. **Aman untuk salah.** Warna error tidak menghukum; penjelasan selalu menyertai.

### 10.2 Sistem desain

Kondisi saat ini memiliki dua sistem visual: marketing (terang, hangat) dan editor (gelap, hardcoded). v1.0 harus menyatukan keduanya.

| Aspek | Keputusan |
| --- | --- |
| **Tema default** | Terang, mengikuti `context/ui-context.md`: `--bg-base #F9F7F4`, permukaan putih, aksen oranye `#FF6B35`, AI violet `#7C3AED`. |
| **Dark mode** | P1. Disiapkan melalui token, bukan hardcoded. Tidak perlu di v1.0. |
| **Token** | Semua komponen memakai token CSS (`bg-base`, `text-primary`, `border-default`, dll.). Tidak ada hex baru di komponen. |
| **Tipografi** | Plus Jakarta Sans untuk UI; Lora untuk body pelajaran; skala 12/14/16/18/24/32. |
| **Radius** | `rounded-lg` elemen kecil, `rounded-2xl` kartu, `rounded-3xl` modal, `rounded-full` badge. |
| **Ikon** | Lucide, stroke, ukuran 16/20/24 px. |
| **Gerak** | Transisi 150–200 ms; hormati `prefers-reduced-motion`; tidak ada animasi yang menghalangi input. |
| **Warna status** | Sukses `--state-success`, error `--state-error`, warning `--state-warning`; jangan gunakan warna sebagai satu-satunya penanda. |

**Perbaikan wajib:** ganti seluruh hex hardcoded di `app/components/editor/*` dan `app/[lang]/editor/*` dengan token. Ini mengurangi risiko visual drift dan mempermudah dark mode.

### 10.3 Spesifikasi layar utama

| Layar | Tujuan | Elemen wajib | State |
| --- | --- | --- | --- |
| **Sign in** | Masuk ke akun | Email, password, “Ingat saya”, “Lupa password?”, tautan daftar | Loading, invalid credentials, rate limited, server error |
| **Sign up** | Membuat akun | Nama, email, password, konfirmasi, syarat & ketentuan | Loading, email sudah terdaftar (generik), password lemah, sukses |
| **Forgot password** | Meminta tautan reset | Email, tombol kirim, tautan kembali ke sign-in | Loading, pesan generik sukses, rate limited |
| **Reset password** | Menetapkan password baru | Password baru, konfirmasi, indikator kekuatan, status token | Valid, invalid/expired, loading, sukses |
| **Verify email** | Memverifikasi alamat email | Status verifikasi, tombol kirim ulang, tautan ke Learn | Verifying, verified, invalid/expired, rate limited |
| **Onboarding** | Menentukan jalur awal | Progress 1/4, pilihan bahasa, level, goal, timezone, tombol “Lanjut” | Loading, error, back, resume |
| **Learn (Hari ini)** | Menjawab “apa sekarang?” | Sapaan, streak/XP/goal, kartu rencana (maks. 3), CTA utama, pintasan modul | Loading skeleton, empty plan, error, offline |
| **Module hub** | Memilih level/fase | Judul modul, deskripsi, progres, daftar level dengan status kunci/terbuka | Loading, locked, completed |
| **Session runner** | Mengerjakan latihan | Progress soal, instruksi, area jawaban, feedback, hearts, tombol keluar | Loading, answering, feedback, paused, error, offline |
| **Results** | Menutup sesi | Akurasi, XP, hearts, konsep lemah, CTA review/next | Success, retry, no XP (hearts habis) |
| **Review** | Mengulang konsep lemah | Jumlah due, daftar item, mulai semua, estimasi waktu | Empty, in progress, done |
| **Progress** | Membuktikan kemajuan | Ringkasan, mastery per modul, heatmap, riwayat, laporan mingguan | Loading, empty (user baru), error |
| **Profile** | Mengelola akun | Profil, target, preferensi, notifikasi, privasi, hapus akun | Saving, error, confirm |

### 10.4 Anatomi layar latihan

Urutan dari atas ke bawah:

1. **Header:** tombol keluar, progress `3/5`, hearts.
2. **Konteks:** tipe soal + instruksi singkat (maks. 2 baris).
3. **Konten:** soal, audio play, atau kata yang harus disusun.
4. **Area jawaban:** pilihan/input/letters; target sentuh ≥ 44 px.
5. **Feedback:** muncul setelah submit; benar → ringkas; salah → jawaban benar + penjelasan + “Mengapa?”.
6. **Footer:** tombol “Lanjut” (aktif setelah feedback), tautan “Lihat aturan” (P1).

**Aturan feedback:**

- Jangan menampilkan jawaban benar sebelum submit.
- Untuk salah: tampilkan jawaban pengguna, jawaban benar, penjelasan 1–3 kalimat, dan konsep yang perlu diulang.
- Untuk benar: konfirmasi + 1 kalimat penguatan; tidak perlu penjelasan panjang.
- Jangan gunakan suara negatif atau animasi hukuman.

### 10.5 Microcopy

| Konteks | Gunakan | Hindari |
| --- | --- | --- |
| Salah jawab | “Belum tepat. Jawaban yang benar: …” | “Salah!”, “Gagal” |
| Hearts habis | “Nyawa habis. Istirahat sebentar, atau lanjut tanpa XP.” | “Kamu kalah.” |
| Streak putus | “Streak-mu berhenti di 6 hari. Mulai lagi hari ini?” | “Streak hilang selamanya.” |
| Empty review | “Tidak ada review hari ini. Kerjakan pelajaran baru untuk membuka review.” | “Kosong.” |
| Error jaringan | “Koneksi terputus. Jawabanmu aman — coba lagi.” | “Error 500.” |
| Email sudah terdaftar | “Jika email ini sudah terdaftar, silakan masuk atau gunakan lupa password.” | “Email sudah dipakai.” |
| Lupa password terkirim | “Jika email terdaftar, tautan reset telah dikirim. Periksa inbox dan folder spam.” | “Email tidak ditemukan.” |
| Reset berhasil | “Password berhasil diperbarui. Silakan masuk kembali.” | “Password diganti.” |
| Token kedaluwarsa | “Tautan tidak valid atau sudah kedaluwarsa. Minta tautan baru.” | “Token error.” |
| Verifikasi berhasil | “Email terverifikasi. Akunmu aman.” | “Verifikasi selesai.” |

### 10.6 Aksesibilitas

- Target WCAG 2.1 AA: kontras teks ≥ 4,5:1, elemen besar ≥ 3:1.
- Semua kontrol dapat dijangkau keyboard; fokus terlihat; urutan fokus logis.
- Setiap audio memiliki transcript/teks alternatif.
- `prefers-reduced-motion` menonaktifkan confetti dan animasi besar.
- Ukuran teks dapat diperbesar 200% tanpa kehilangan konten.
- Form memiliki label eksplisit; error diumumkan via `aria-live`.
- Form auth mendukung `autocomplete` (`email`, `current-password`, `new-password`), tombol tampilkan password, dan ringkasan error di atas form.
- Timer tidak boleh menjadi satu-satunya cara menyelesaikan latihan inti; mode tanpa waktu tersedia.
- Diuji dengan screen reader (VoiceOver/NVDA) pada minimal 3 layar inti.

### 10.7 i18n dan konten

- UI: 12 locale yang sudah ada; minimal `en` dan `id` lengkap untuk v1.0.
- Konten belajar: bahasa target terpisah dari locale UI. Pengguna `id` dapat belajar English dengan UI Indonesia.
- RTL (Arab) diuji untuk layout, ikon, dan progress bar.
- Format angka/tanggal mengikuti locale, tetapi konten Number Name mengikuti bahasa target.
- Tidak ada string UI hardcoded di komponen; gunakan i18next/react-i18next yang sudah ada.
- Terjemahan konten dilakukan manusia; mesin hanya untuk draft.

---

## 11. Data Model

### 11.1 Prinsip

1. **Progres adalah data relasional, bukan blob.** Attempt, mastery, review, dan XP disimpan sebagai baris terstruktur agar dapat dihitung, diaudit, dan diekspor.
2. **Konten dan progres dipisahkan.** Konten berversi; progres merujuk pada ID konten yang stabil. Perubahan konten tidak boleh merusak riwayat.
3. **Server adalah sumber kebenaran.** XP, hearts, streak, dan jadwal review dihitung server; klien hanya menampilkan.
4. **Tidak ada PII di analytics.** Event memakai `userId` pseudonim, bukan email/nama.
5. **Auth kustom dengan bcrypt.** Password disimpan hanya sebagai hash bcrypt; token sesi, verifikasi, dan reset disimpan sebagai hash; tidak ada `clerkId` atau ketergantungan Clerk di model v1.

### 11.2 Entitas konseptual v1

| Entitas | Tujuan | Atribut kunci | Relasi |
| --- | --- | --- | --- |
| **User** | Identitas dan profil belajar | `email`, `passwordHash`, `emailVerifiedAt`, `role`, `targetLanguage`, `cefrLevel`, `dailyGoalMinutes`, `timezone`, `onboardingCompletedAt` | 1–1 `UserStats`; 1–N `Session`, progres |
| **Session** | Sesi login server-side | `tokenHash`, `expiresAt`, `lastUsedAt`, `revokedAt`, `ipHash`, `userAgentHash` | N–1 User |
| **EmailVerificationToken** | Token verifikasi email | `tokenHash`, `expiresAt`, `usedAt` | N–1 User |
| **PasswordResetToken** | Token lupa password | `tokenHash`, `expiresAt`, `usedAt`, `requestedIpHash` | N–1 User |
| **AuthEvent** | Audit peristiwa auth | `event`, `ipHash`, `userAgentHash`, `metadata`, `createdAt` | N–1 User (opsional) |
| **UserStats** | Ringkasan gamifikasi | `xpTotal`, `level`, `streakCurrent`, `streakLongest`, `hearts`, `heartsUpdatedAt`, `lastActivityDate` | 1–1 User |
| **Language** | Katalog bahasa | `code`, `label`, `nativeName`, `supportsNumbers`, `isActive` | 1–N NumberItem |
| **Module** | Modul belajar | `slug`, `name`, `description`, `status`, `sortOrder` | 1–N ModuleLevel |
| **ModuleLevel** | Level di dalam modul (CEFR/fase angka) | `code`, `title`, `cefrLevel?`, `languageCode?`, `sortOrder` | 1–N Lesson |
| **Lesson** | Pelajaran | `slug`, `title`, `cefrLevel`, `difficulty`, `sortOrder`, `contentVersion`, `status` | 1–N Exercise; 1–N LessonProgress |
| **LessonContent** | Payload konten berversi | `version`, `schemaVersion`, `payload`, `checksum`, `status` | N–1 Lesson |
| **Exercise** | Latihan | `type`, `prompt`, `options`, `correctAnswer`, `answerVariants`, `explanation`, `conceptKey`, `points`, `sortOrder` | N–1 Lesson; 1–N Attempt |
| **LessonProgress** | Status belajar per user | `status`, `bestAccuracy`, `lastAccuracy`, `attemptCount`, `currentExerciseIndex`, `timeSpentSeconds`, `completedAt`, `masteredAt` | N–1 User, Lesson |
| **ExerciseAttempt** | Setiap jawaban | `clientAttemptId`, `answer`, `isCorrect`, `score`, `timeSpentMs`, `xpAwarded`, `createdAt` | N–1 User, Exercise |
| **ReviewItem** | Jadwal SRS per konsep | `conceptKey`, `easeFactor`, `intervalDays`, `dueAt`, `lapses`, `priority`, `status` | N–1 User |
| **XpEvent** | Ledger XP | `amount`, `sourceType`, `sourceId`, `idempotencyKey` | N–1 User |
| **Badge** | Definisi badge | `slug`, `title`, `criteria` | 1–N UserBadge |
| **UserBadge** | Badge yang diraih | `earnedAt` | N–1 User, Badge |
| **DailyActivity** | Agregat harian | `date`, `minutes`, `xp`, `lessonsCompleted`, `reviewsCompleted`, `goalMet` | N–1 User |
| **NumberItem** | Item angka per bahasa | `languageCode`, `value`, `word`, `transliteration`, `audioUrl`, `levelCode`, `isOrdinal` | 1–N NumberAttempt |
| **NumberAttempt** | Jawaban latihan angka | `phase`, `isCorrect`, `timeMs`, `xpAwarded` | N–1 User, NumberItem |
| **NotificationPreference** | Preferensi pengingat | `dailyReminder`, `reviewReminder`, `emailOptIn`, `reminderHour` | 1–1 User |

### 11.3 Perubahan skema Prisma yang diusulkan

Perubahan berikut bersifat **aditif** terlebih dahulu; penghapusan model lama dilakukan setelah migrasi selesai.

```prisma
model User {
  id                    String    @id @default(cuid())
  email                 String    @unique
  passwordHash          String?
  emailVerifiedAt       DateTime?
  name                  String
  avatarUrl             String?
  nativeLanguage        String    @default("id")
  targetLanguage        String    @default("en")
  role                  String    @default("learner")
  cefrLevel             String    @default("A1")
  dailyGoalMinutes      Int       @default(15)
  timezone              String    @default("Asia/Jakarta")
  onboardingCompletedAt DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  stats          UserStats?
  sessions       Session[]
  verificationTokens EmailVerificationToken[]
  passwordResetTokens PasswordResetToken[]
  authEvents     AuthEvent[]
  lessonProgress LessonProgress[]
  attempts       ExerciseAttempt[]
  numberAttempts NumberAttempt[]
  reviewItems    ReviewItem[]
  xpEvents       XpEvent[]
  badges         UserBadge[]
  dailyActivity  DailyActivity[]
}

model Session {
  id           String    @id @default(cuid())
  userId       String
  tokenHash    String    @unique
  expiresAt    DateTime
  lastUsedAt   DateTime  @default(now())
  revokedAt    DateTime?
  ipHash       String?
  userAgentHash String?
  createdAt    DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, revokedAt])
  @@index([expiresAt])
}

model EmailVerificationToken {
  id        String    @id @default(cuid())
  userId    String
  tokenHash String    @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, expiresAt])
}

model PasswordResetToken {
  id              String    @id @default(cuid())
  userId          String
  tokenHash       String    @unique
  expiresAt       DateTime
  usedAt          DateTime?
  requestedIpHash String?
  createdAt       DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, expiresAt])
}

model AuthEvent {
  id            String   @id @default(cuid())
  userId        String?
  event         String
  ipHash        String?
  userAgentHash String?
  metadata      Json?
  createdAt     DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
  @@index([event, createdAt])
}

model UserStats {
  userId          String    @id
  xpTotal         Int       @default(0)
  level           Int       @default(1)
  streakCurrent   Int       @default(0)
  streakLongest   Int       @default(0)
  lastActivityDate DateTime?
  hearts          Int       @default(5)
  heartsUpdatedAt DateTime  @default(now())
  dailyXp         Int       @default(0)
  dailyXpDate     DateTime?
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model LessonProgress {
  id                 String    @id @default(cuid())
  userId             String
  lessonId           String
  status             String    @default("not_started")
  bestAccuracy       Int       @default(0)
  lastAccuracy       Int       @default(0)
  attemptCount       Int       @default(0)
  currentExerciseIndex Int     @default(0)
  timeSpentSeconds   Int       @default(0)
  startedAt          DateTime?
  completedAt        DateTime?
  masteredAt         DateTime?
  updatedAt          DateTime  @updatedAt

  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, lessonId])
  @@index([userId, status])
}

model ExerciseAttempt {
  id               String   @id @default(cuid())
  clientAttemptId  String
  userId           String
  exerciseId       String
  lessonId         String
  answer           Json
  isCorrect        Boolean
  score            Int
  timeSpentMs      Int
  attemptNumber    Int
  xpAwarded        Int      @default(0)
  createdAt        DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, clientAttemptId])
  @@index([userId, createdAt])
  @@index([exerciseId])
}

model ReviewItem {
  id            String   @id @default(cuid())
  userId        String
  moduleId      String
  languageCode  String?
  conceptKey    String
  sourceType    String
  sourceId      String?
  easeFactor    Float    @default(2.5)
  intervalDays  Int      @default(1)
  dueAt         DateTime
  lapses        Int      @default(0)
  reviewCount   Int      @default(0)
  priority      String   @default("medium")
  status        String   @default("active")
  lastReviewedAt DateTime?
  createdAt     DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, conceptKey])
  @@index([userId, dueAt, status])
}

model XpEvent {
  id             String   @id @default(cuid())
  userId         String
  amount         Int
  sourceType     String
  sourceId       String?
  idempotencyKey String
  createdAt      DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, idempotencyKey])
  @@index([userId, createdAt])
}

model DailyActivity {
  id               String   @id @default(cuid())
  userId           String
  date             DateTime
  minutes          Int      @default(0)
  xp               Int      @default(0)
  lessonsCompleted Int      @default(0)
  reviewsCompleted Int      @default(0)
  goalMet          Boolean  @default(false)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, date])
}

model NumberItem {
  id              String  @id @default(cuid())
  languageCode    String
  value           Int
  word            String
  transliteration String?
  audioUrl        String?
  levelCode       String
  isOrdinal       Boolean @default(false)

  attempts NumberAttempt[]
  @@unique([languageCode, value, isOrdinal])
  @@index([languageCode, levelCode])
}

model NumberAttempt {
  id           String   @id @default(cuid())
  userId       String
  numberItemId String
  phase        String
  isCorrect    Boolean
  timeMs       Int
  xpAwarded    Int      @default(0)
  createdAt    DateTime @default(now())

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  numberItem NumberItem @relation(fields: [numberItemId], references: [id], onDelete: Cascade)
  @@index([userId, createdAt])
  @@index([numberItemId])
}
```

**Catatan penting:**

- `User.passwordHash` wajib untuk user baru. Selama migrasi dari Clerk, field ini boleh `null` sementara; user lama diarahkan ke alur “atur password” melalui email. Login menolak akun tanpa password dan menampilkan opsi lupa password.
- `Session`, `EmailVerificationToken`, dan `PasswordResetToken` menyimpan **hash** token, bukan token mentah. Token mentah hanya ada di cookie/tautan email.
- `User.email` dinormalisasi lowercase dan unik; email change (P1) memerlukan verifikasi ulang.
- Model lama yang meniru mock (`DailyChallenge`, `Choice`, `LessonResult`, `TutorSession`, `GrammarDetail`, `StudyGroup`, `GlobalChallenge`) tidak dipakai v1.0. Jangan hapus sebelum audit data produksi; arsipkan atau biarkan dengan status deprecated.
- `Exercise` di v1 dapat tetap membaca konten dari file; katalog dan metadata tetap perlu ada di DB untuk join progres. Detail konten penuh dapat disimpan di `LessonContent.payload` saat CMS aktif.
- Number Name memakai `NumberItem`/`NumberAttempt`, bukan `LessonProgress`, karena sesi dibangkitkan dari item angka per bahasa. `conceptKey` review memakai format `number.{languageCode}.{value}` agar tidak tercampur antar-bahasa.

### 11.4 Strategi migrasi

| Langkah | Aktivitas | Kriteria selesai |
| --- | --- | --- |
| **M1** | Tambah model auth (`Session`, `EmailVerificationToken`, `PasswordResetToken`, `AuthEvent`), `passwordHash` nullable, `emailVerifiedAt`; pertahankan `clerkId` sementara; migrasi non-destruktif | `prisma migrate dev` bersih; schema tervalidasi; data lama tidak hilang |
| **M2** | Buat script backfill katalog dari data Grammar/Number Name saat ini; pertahankan ID pelajaran/latihan | Jumlah lesson/exercise di DB sama dengan sumber; checksum cocok |
| **M3** | Implementasi register/login/session/verifikasi/lupa password + email provider. Untuk user Clerk lama: cocokkan email, buat `User` dengan `passwordHash = null`, kirim email “atur password” | User baru dapat daftar/login; user lama menerima tautan atur password; tidak ada duplikat email |
| **M4** | Ganti UI Clerk dengan halaman auth sendiri; ganti `proxy.ts` menjadi pengecekan sesi; hapus `ClerkProvider`, komponen Clerk, dan route proxy Clerk | Sign-in/sign-up/forgot/reset/verify berfungsi; rute terlindungi; tidak ada dependensi Clerk di runtime |
| **M5** | Hapus `clerkId`, env Clerk, dependensi `@clerk/*`, route `/api/__clerk`, dan endpoint JWT lama; arsipkan model mock | `npm ls @clerk/nextjs` kosong; tidak ada referensi Clerk; dokumentasi diperbarui |

**Prinsip migrasi:** perubahan aditif terlebih dahulu, lalu penghapusan bertahap. Backup harian sebelum migrasi produksi. Jika tidak ada user Clerk produksi, M3-M4 dapat langsung mengganti auth tanpa jalur “atur password”.

### 11.5 Skema konten (contoh)

```json
{
  "schemaVersion": 1,
  "lessonId": "a2-past-simple",
  "module": "grammar",
  "cefrLevel": "A2",
  "title": "Past Simple",
  "description": "Talk about finished actions in the past.",
  "contentVersion": "2026-11-25.1",
  "content": {
    "explanation": "Use the past simple for actions that started and finished in the past.",
    "rules": [
      {
        "title": "Regular verbs: -ed",
        "text": "Add -ed to most verbs: work → worked, play → played.",
        "highlight": true
      }
    ],
    "examples": [
      {
        "correct": "I visited my grandmother yesterday.",
        "annotation": "Finished action + specific past time"
      }
    ],
    "tips": ["Look for time markers: yesterday, last week, in 2019."]
  },
  "exercises": [
    {
      "id": "a2-past-simple-fb-1",
      "type": "fill_blank",
      "conceptKey": "grammar.past_simple.regular",
      "prompt": "She ___ (visit) her aunt last weekend.",
      "correctAnswer": "visited",
      "answerVariants": ["visited"],
      "explanation": "Past simple of 'visit' is 'visited' because the action finished last weekend.",
      "points": 10,
      "difficulty": "easy"
    }
  ]
}
```

**Aturan skema:**

- `lessonId`, `exercise.id`, dan `conceptKey` tidak boleh berubah setelah dipublikasikan.
- `schemaVersion` wajib; perubahan breaking menaikkan versi dan menyediakan migrasi.
- `conceptKey` mengikuti pola `{module}.{category}.{concept}` dan menjadi kunci SRS.
- Semua teks yang tampil ke pengguna harus dapat diterjemahkan; konten bahasa target dipisahkan dari UI.
- Validasi CI menolak ID duplikat, jawaban kosong, dan latihan tanpa penjelasan.

---

## 12. API Contracts

### 12.1 Konvensi

| Aspek | Keputusan |
| --- | --- |
| **Base path** | `/api/v1` |
| **Format** | JSON; envelope `{ success, data, error, meta }` (mempertahankan helper yang sudah ada) |
| **Auth** | Sesi server-side via cookie `HttpOnly` (tanpa Clerk, tanpa JWT stateless untuk web); token sesi opaque, disimpan sebagai hash di DB; `401` jika tidak valid/dicabut. |
| **Otorisasi** | `userId` selalu diambil dari sesi, tidak pernah dari body/query. |
| **Idempotensi** | Mutasi penting (attempt, XP, complete) menerima `clientAttemptId`/`Idempotency-Key`. |
| **Pagination** | Cursor-based: `?cursor=...&limit=20` (maks. 50). |
| **Error** | `{ success: false, error: { code, message }, meta: { requestId } }`; pesan ramah pengguna. |
| **Rate limit** | 60 request/menit per user untuk API umum; 20/menit untuk submit attempt; login 10/15 menit per IP + 5/15 menit per akun; register 5/jam per IP; forgot 3/jam per email/IP. |
| **Caching** | Katalog publik `s-maxage=60`; data pengguna `no-store`. |
| **Versi** | Perubahan breaking → `/api/v2`; penambahan field backward-compatible. |

### 12.2 Matriks otorisasi

| Area | Anonim | Learner | Tutor (v2) | Admin |
| --- | --- | --- | --- | --- |
| Registrasi & login | Tulis | — | — | — |
| Lupa/reset password | Tulis | Tulis | Tulis | — |
| Verifikasi email | Tulis | Tulis | Tulis | — |
| Katalog bahasa/modul | Baca | Baca | Baca | Baca/tulis |
| Konten pelajaran | Baca (preview) | Baca penuh | Baca | Baca/tulis |
| Profil & progres sendiri | — | Baca/tulis | Baca | Baca |
| Attempt & XP | — | Tulis | — | Baca |
| Review | — | Baca/tulis | — | Baca |
| Admin konten | — | — | — | Tulis |

### 12.3 Endpoint v1

| Method | Path | Fungsi | Auth | Catatan |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | Daftar email + password | Publik | Bcrypt; rate limit 5/jam; kirim verifikasi |
| POST | `/api/v1/auth/login` | Masuk email + password | Publik | Rate limit per IP + akun; `rememberMe`; set cookie sesi |
| POST | `/api/v1/auth/logout` | Keluar dari sesi saat ini | Learner | Cabut sesi + hapus cookie |
| POST | `/api/v1/auth/logout-all` | Keluar dari semua perangkat | Learner | Cabut semua `Session` user |
| GET | `/api/v1/auth/session` | Status sesi + `emailVerifiedAt` | Learner | Untuk bootstrap UI |
| POST | `/api/v1/auth/forgot-password` | Kirim tautan reset password | Publik | Selalu respons generik; rate limit 3/jam |
| POST | `/api/v1/auth/reset-password` | Set password baru dengan token | Publik (token) | Token sekali pakai; cabut semua sesi |
| POST | `/api/v1/auth/verify-email` | Verifikasi email dengan token | Publik (token) | Token 24 jam; sekali pakai |
| POST | `/api/v1/auth/resend-verification` | Kirim ulang verifikasi | Learner | Maks. 3/jam |
| PATCH | `/api/v1/auth/password` | Ganti password (login) | Learner | Wajib password lama; cabut sesi lain |
| GET | `/api/v1/catalog/languages` | Daftar bahasa target | Publik | Cache 60 s |
| GET | `/api/v1/catalog/modules` | Daftar modul + status | Publik | Cache 60 s |
| GET | `/api/v1/catalog/modules/[slug]` | Level dan daftar pelajaran | Publik | Tanpa konten jawaban |
| GET | `/api/v1/number-name/items` | Item angka per bahasa/level | Learner | `?language=en&level=1` |
| GET | `/api/v1/me` | Profil + stats + onboarding state | Learner | — |
| PATCH | `/api/v1/me` | Update profil/zona waktu | Learner | Validasi Zod |
| POST | `/api/v1/onboarding` | Simpan onboarding | Learner | Idempoten |
| GET | `/api/v1/home` | Rencana hari ini + widget | Learner | Satu request untuk beranda |
| GET | `/api/v1/lessons/[id]` | Konten pelajaran + progress | Learner | Tanpa `correctAnswer` sebelum submit |
| POST | `/api/v1/lessons/[id]/start` | Mulai/resume sesi | Learner | Mengembalikan `sessionId` & posisi |
| POST | `/api/v1/attempts` | Submit jawaban latihan Grammar | Learner | Validasi + XP + jadwal review |
| POST | `/api/v1/number-attempts` | Submit jawaban Number Name | Learner | Validasi item, XP, jadwal review |
| POST | `/api/v1/lessons/[id]/complete` | Tutup pelajaran | Learner | Idempoten; XP completion |
| GET | `/api/v1/sessions/[id]/summary` | Ringkasan sesi | Learner | Hanya pemilik |
| GET | `/api/v1/progress/overview` | Metrik progres | Learner | — |
| GET | `/api/v1/progress/modules/[slug]` | Detail per modul | Learner | — |
| GET | `/api/v1/review` | Antrean review jatuh tempo | Learner | `?limit=20` |
| POST | `/api/v1/review/[itemId]/answer` | Jawab item review | Learner | Update SRS |
| GET | `/api/v1/gamification` | XP, level, streak, hearts | Learner | — |
| GET | `/api/v1/badges` | Badge dimiliki + tersedia | Learner | — |
| PATCH | `/api/v1/settings` | Preferensi belajar/notifikasi | Learner | — |
| POST | `/api/v1/events` | Event analytics | Learner/Publik | Consent-aware; tanpa PII |
| DELETE | `/api/v1/me` | Hapus akun | Learner | Konfirmasi password + grace period |
| PATCH | `/api/v1/me/email` | Ubah email dengan verifikasi ulang | Learner | P1; kirim tautan verifikasi ke email baru |
| POST | `/api/v1/admin/content/import` | Import konten | Admin | P1 |
| POST | `/api/v1/admin/content/[id]/publish` | Publish/rollback | Admin | P1 |

### 12.4 Contoh payload

**POST `/api/v1/auth/register`**

```json
{
  "name": "Rani",
  "email": "rani@example.com",
  "password": "correct-horse-battery",
  "confirmPassword": "correct-horse-battery"
}
```

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_01J8Z3",
      "email": "rani@example.com",
      "name": "Rani",
      "emailVerifiedAt": null
    },
    "sessionExpiresAt": "2026-12-02T07:00:00.000Z"
  },
  "error": null,
  "meta": { "requestId": "req_01J...", "timestamp": "2026-11-25T07:00:00.000Z" }
}
```

> Respons sukses menyetel cookie `lango_session` dengan `HttpOnly; Secure; SameSite=Lax`. Password dan hash tidak pernah dikembalikan.

**POST `/api/v1/auth/forgot-password`**

```json
{ "email": "rani@example.com" }
```

```json
{
  "success": true,
  "data": {
    "message": "Jika email terdaftar, tautan reset telah dikirim."
  },
  "error": null,
  "meta": { "requestId": "req_01J...", "timestamp": "2026-11-25T07:00:00.000Z" }
}
```

Respons ini **sama** untuk email terdaftar maupun tidak, termasuk status dan bentuk body, untuk mencegah enumerasi akun.

**POST `/api/v1/auth/reset-password`**

```json
{
  "token": "raw-token-dari-email",
  "newPassword": "new-correct-horse-battery",
  "confirmPassword": "new-correct-horse-battery"
}
```

```json
{
  "success": true,
  "data": {
    "message": "Password berhasil diperbarui. Silakan masuk kembali."
  },
  "error": null,
  "meta": { "requestId": "req_01J...", "timestamp": "2026-11-25T07:00:00.000Z" }
}
```

Reset yang berhasil mencabut semua sesi lama dan mengirim email konfirmasi. Token yang sudah dipakai/kedaluwarsa mengembalikan `400` dengan kode `INVALID_RESET_TOKEN`.

**GET `/api/v1/home`**

```json
{
  "success": true,
  "data": {
    "user": {
      "name": "Rani",
      "level": 3,
      "xp": 1240,
      "streak": 6,
      "hearts": 4,
      "dailyGoalMinutes": 15
    },
    "today": {
      "minutesDone": 8,
      "goalMet": false,
      "plan": [
        {
          "type": "review",
          "count": 2,
          "estimatedMinutes": 3,
          "reason": "2 konsep perlu diulang"
        },
        {
          "type": "lesson",
          "lessonId": "a2-past-simple",
          "title": "Past Simple",
          "estimatedMinutes": 7,
          "reason": "Lanjutan dari pelajaran terakhir"
        }
      ]
    }
  },
  "error": null,
  "meta": { "requestId": "req_01J...", "timestamp": "2026-11-25T07:00:00.000Z" }
}
```

**POST `/api/v1/attempts`**

```json
{
  "clientAttemptId": "att_01J8Z3K4",
  "sessionId": "ses_01J8Z3",
  "exerciseId": "a2-past-simple-fb-1",
  "answer": "visited",
  "timeSpentMs": 4200
}
```

```json
{
  "success": true,
  "data": {
    "correct": true,
    "correctAnswer": "visited",
    "explanation": "Past simple of 'visit' is 'visited' because the action finished last weekend.",
    "xpAwarded": 15,
    "hearts": 4,
    "progress": {
      "currentExerciseIndex": 2,
      "totalExercises": 5
    },
    "review": {
      "conceptKey": "grammar.past_simple.regular",
      "nextDueAt": "2026-11-27T07:00:00.000Z"
    }
  },
  "error": null,
  "meta": { "requestId": "req_01J...", "timestamp": "2026-11-25T07:01:00.000Z" }
}
```

**POST `/api/v1/number-attempts`**

```json
{
  "clientAttemptId": "num_01J8Z4",
  "itemId": "num_en_17",
  "phase": "listen-pick",
  "answer": 17,
  "timeMs": 1800
}
```

```json
{
  "success": true,
  "data": {
    "correct": true,
    "correctAnswer": 17,
    "word": "seventeen",
    "xpAwarded": 10,
    "hearts": 4,
    "review": {
      "conceptKey": "number.en.17",
      "nextDueAt": "2026-11-27T07:00:00.000Z"
    }
  },
  "error": null,
  "meta": { "requestId": "req_01J...", "timestamp": "2026-11-25T07:03:00.000Z" }
}
```

**GET `/api/v1/review`**

```json
{
  "success": true,
  "data": {
    "dueCount": 3,
    "items": [
      {
        "id": "rev_01J8...",
        "conceptKey": "grammar.past_simple.regular",
        "module": "grammar",
        "title": "Past Simple — regular verbs",
        "priority": "high",
        "overdueDays": 1
      }
    ]
  },
  "error": null,
  "meta": { "requestId": "req_01J...", "timestamp": "2026-11-25T07:02:00.000Z" }
}
```

### 12.5 Kode error

| HTTP | Kode | Kapan |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Payload tidak valid |
| 400 | `INVALID_RESET_TOKEN` | Token reset tidak valid, kedaluwarsa, atau sudah dipakai |
| 400 | `INVALID_VERIFICATION_TOKEN` | Token verifikasi email tidak valid/kedaluwarsa |
| 401 | `UNAUTHORIZED` | Tidak ada sesi valid |
| 401 | `INVALID_CREDENTIALS` | Email/password salah (pesan generik) |
| 403 | `FORBIDDEN` | Bukan pemilik resource / email belum terverifikasi untuk aksi sensitif |
| 404 | `NOT_FOUND` | Resource tidak ada |
| 409 | `CONFLICT` | Duplikat attempt/email |
| 429 | `RATE_LIMITED` | Melebihi batas |
| 500 | `INTERNAL_ERROR` | Kesalahan tak terduga |
| 503 | `SERVICE_UNAVAILABLE` | DB/penyimpanan aset/email down; sertakan `retryAfter` |

### 12.6 Aturan kontrak yang tidak boleh dilanggar

1. Endpoint tidak pernah menerima `userId` dari klien untuk keputusan otorisasi.
2. `correctAnswer` tidak dikirim sebelum jawaban disubmit (kecuali mode review yang memerlukan).
3. Semua mutasi progres berada dalam transaksi database.
4. Submit duplikat mengembalikan hasil yang sama, bukan error atau XP ganda.
5. Setiap respons menyertakan `meta.requestId` untuk korelasi log.
6. Perubahan bentuk respons harus backward-compatible atau menaikkan versi API.

---

## 13. Non-Functional Requirements

### 13.1 Performance

| Metrik | Target | Cara ukur |
| --- | --- | --- |
| LCP halaman Learn (mobile 4G) | ≤ 2,5 s | Lighthouse/field data |
| Interaksi sesi (INP) | ≤ 200 ms | Web Vitals |
| p95 API baca | ≤ 300 ms | APM |
| p95 API submit attempt | ≤ 500 ms | APM |
| Waktu muat pelajaran dari cache | ≤ 1 s | Synthetic |
| Bundle JS halaman lesson | ≤ 250 KB gzip | Build analysis |
| Cold start server | ≤ 3 s | Platform metrics |

**Strategi:** server components untuk data awal; streaming untuk bagian non-kritis; cache katalog; preload pelajaran berikutnya; hindari memuat seluruh 25.000 baris konten ke bundle klien — pisahkan per pelajaran.

### 13.2 Keamanan

- Semua rute aplikasi dan mutasi API privat memerlukan sesi server-side yang valid; halaman auth/katalog tetap publik.
- Perbaiki `proxy.ts`: jangan menandai seluruh `/{locale}/*` sebagai publik; hanya marketing + auth + katalog.
- **Password:** bcrypt cost ≥ 12; password minimal 8 karakter/maksimal 72 byte; tolak password umum (blocklist 10k teratas atau HIBP k-anonymity); tidak pernah disimpan/di-log dalam bentuk plaintext; bandingkan dengan bcrypt.
- **Sesi:** token acak ≥ 256 bit; cookie `HttpOnly; Secure; SameSite=Lax`; hash token di DB; rotasi sesi saat login; masa berlaku 30 hari sliding; cabut sesi saat logout/reset/ganti password.
- **Reset & verifikasi:** token acak 32 byte; hash di DB; sekali pakai; reset 30 menit, verifikasi 24 jam; invalidasi token lama saat permintaan baru; halaman reset mengirim `Referrer-Policy: no-referrer`, tidak memuat aset pihak ketiga, dan access log meredaksi query token.
- **Anti-enumerasi:** login, forgot password, dan register menghasilkan pesan/timing yang seragam untuk email terdaftar/tidak.
- **Anti-brute force:** rate limit per IP + akun, backoff eksponensial, dan captcha setelah 5 kegagalan berturut-turut (P1).
- CSRF aman karena cookie `SameSite=Lax` + verifikasi origin untuk mutasi; aksi sensitif (ganti password, hapus akun) meminta password ulang.
- CSP diperbarui: hapus domain Clerk; tambahkan domain email/analytics yang diperlukan; hapus `unsafe-eval` bila memungkinkan.
- Rahasia hanya di server env; tidak ada kunci di bundle klien; hapus `JWT_SECRET`/`JWT_REFRESH_SECRET` fallback (`fallback-secret-change-me`) sebelum produksi.
- Email transaksional: verifikasi SPF/DKIM/DMARC, signature webhook penyedia email, sanitasi template, dan jangan tampilkan alamat pengguna lain.
- Dependency scanning dan audit mingguan; tidak ada paket tanpa pemeliharaan.
- Log tidak boleh memuat email, token, password, jawaban mentah yang sensitif, atau PII; audit event auth disimpan ≤ 90 hari.

### 13.3 Privasi dan kepatuhan

- **Dasar hukum:** persetujuan untuk analytics non-esensial; kontrak untuk data akun.
- **Data minimum:** hanya kumpulkan yang diperlukan untuk belajar dan komunikasi.
- **Retensi:** log aplikasi ≤ 90 hari; event analytics agregat ≤ 24 bulan; data akun dihapus ≤ 30 hari setelah permintaan.
- **Hak pengguna:** akses, ekspor, koreksi, hapus, dan tarik consent.
- **Anak:** produk tidak ditujukan untuk < 13 tahun; verifikasi usia minimum pada sign-up.
- **Lokasi data:** dokumentasikan region database dan vendor (penyedia email, hosting, analytics).
- **Kebijakan:** perbarui privacy policy dan cookie policy agar sesuai implementasi; tautan dari onboarding.

### 13.4 Aksesibilitas

- Target WCAG 2.1 AA (lihat bagian 10.6).
- Audit otomatis (axe) di CI untuk halaman utama; audit manual per rilis.
- Tidak ada konten yang hanya disampaikan lewat warna, audio, atau animasi.
- Semua alur inti dapat diselesaikan dengan keyboard dan screen reader.

### 13.5 Reliabilitas dan observability

| Aspek | Target |
| --- | --- |
| Uptime API | 99,9% bulanan |
| Error rate 5xx | < 0,5% request |
| Crash-free session | ≥ 99,5% |
| Waktu pemulihan (MTTR) | < 30 menit |
| Backup database | Harian, retensi 30 hari, uji restore bulanan |

- Structured logging dengan `requestId`, `userId` (hash), `route`, `latency`.
- Error tracking frontend/backend dengan alert ke Slack/email.
- Health check (`/api/health`) diperluas: DB, penyedia email, penyimpanan aset.
- Email transaksional: ≥ 99% terkirim < 60 detik; retry 3× dengan backoff; bounce/complaint ditangani; alert jika kegagalan > 1%.
- Feature flag untuk modul dan eksperimen.
- Runbook untuk insiden: auth down, DB down, audio gagal, konten rusak.

### 13.6 Skalabilitas

- Target awal: 10.000 pengguna terdaftar, 1.000 WAL, 5.000 concurrent learner (target arsitektur).
- Connection pooling Prisma/pg; index pada `userId`, `lessonId`, `dueAt`, dan `Session.expiresAt`.
- Job harian membersihkan sesi/token kedaluwarsa dan `AuthEvent` lebih dari 90 hari.
- Konten dilayani dari cache/CDN; API tidak membaca file besar per request.
- Pemisahan job berat (analytics aggregation, email) dari request path.
- Tidak ada background task AI di v1; jika v2 menambah AI, gunakan queue dan worker terpisah.

### 13.7 Kompatibilitas

- Browser: Chrome, Safari, Firefox, Edge — 2 versi terakhir.
- Mobile: iOS Safari 16+, Android Chrome 110+.
- Resolusi minimum: 360×640; target desktop 1440×900.
- Tidak ada dependensi native yang memblokir web.
- PWA installable (v1.1) dengan offline untuk sesi aktif.

### 13.8 i18n

- UI strings di `app/locales/*.json`; tidak ada hardcoded string di komponen.
- Konten belajar terpisah per bahasa target; metadata bahasa di DB.
- Format tanggal/angka mengikuti locale UI, kecuali konten Number Name.
- RTL didukung untuk Arab; diuji pada layout utama.
- Fallback ke English jika terjemahan tidak ada; tidak menampilkan key mentah.

---

## 14. Analytics dan Eksperimen

### 14.1 Taksonomi event

| Event | Kapan | Properti kunci | Tujuan |
| --- | --- | --- | --- |
| `sign_up_started` | Klik sign-up | `locale`, `source` | Mengukur funnel auth |
| `sign_up_completed` | Akun dibuat | `locale`, `method` (`email`) | Activation |
| `email_verification_sent` | Email verifikasi dikirim | `locale`, `trigger` | Deliverability |
| `email_verified` | Email berhasil diverifikasi | `hoursSinceSignup` | Kualitas akun |
| `login_succeeded` | Login berhasil | `method`, `rememberMe` | Kesehatan auth |
| `login_failed` | Login gagal | `reason` (`invalid_credentials`, `rate_limited`) | Keamanan |
| `password_reset_requested` | Permintaan lupa password | `locale` | Dukungan akun |
| `password_reset_completed` | Password berhasil direset | `hoursSinceRequest` | Pemulihan akun |
| `logout` | Pengguna logout | `scope` (`current`, `all`) | Sesi |
| `onboarding_started` | Masuk onboarding | `locale` | Drop-off onboarding |
| `onboarding_step_completed` | Tiap langkah | `step`, `value` | Drop-off per langkah |
| `onboarding_completed` | Selesai onboarding | `targetLanguage`, `cefrLevel`, `dailyGoal` | Activation |
| `home_viewed` | Beranda tampil | `hasPlan`, `dueCount` | Engagement |
| `lesson_started` | Sesi dimulai | `module`, `lessonId`, `cefrLevel`, `source` | Engagement |
| `exercise_answered` | Jawaban disubmit | `type`, `correct`, `attemptNo`, `latencyMs`, `conceptKey` | Learning outcome |
| `lesson_completed` | Pelajaran selesai | `module`, `lessonId`, `accuracy`, `xp`, `durationSec` | Completion |
| `session_abandoned` | Keluar sebelum selesai | `lessonId`, `progressPct` | Drop-off |
| `review_started` | Review dimulai | `dueCount` | Retention |
| `review_completed` | Review selesai | `reviewed`, `correct` | Retention |
| `module_opened` | Modul dibuka | `module`, `level` | Engagement |
| `phase_completed` | Fase Number Name selesai | `phase`, `level`, `accuracy` | Learning outcome |
| `badge_unlocked` | Badge didapat | `badgeId` | Motivation |
| `error_shown` | Error UI | `code`, `screen` | Kualitas |
| `settings_updated` | Preferensi berubah | `field` | Personalisasi |
| `account_deleted` | Akun dihapus | — | Kepatuhan |

**Aturan:** tidak ada email, nama, atau teks jawaban bebas di properti. `userId` dikirim sebagai ID pseudonim. Event non-esensial hanya dikirim setelah consent.

### 14.2 Funnel utama

```
Landing → Sign-up → Onboarding → First lesson → Lesson complete → D1 return → D7 return → D30 return
```

Setiap langkah memiliki dashboard drop-off harian dan segmentasi per locale, sumber akuisisi, level awal, dan perangkat.

### 14.3 Dashboard wajib

1. **Acquisition:** pengunjung, sign-up, conversion rate per locale/source.
2. **Activation:** onboarding completion, time-to-first-lesson, first-lesson completion.
3. **Engagement:** DAU/WAU, sesi per pengguna, menit belajar, modul populer.
4. **Learning outcome:** akurasi per tipe soal, mastery rate, konsep paling sering salah.
5. **Retention:** D1/D7/D30 cohort, streak distribution, review adherence.
6. **Quality:** error rate, p95 latency, audio failure, crash-free sessions.
7. **Auth & deliverability:** registrasi→login success, email verification rate, reset completion, bounce rate, login failure rate.
8. **Gamification:** XP distribution, level distribution, badge unlock rate (guardrail anti-farming).

### 14.4 Eksperimen awal (setelah 4 minggu data)

| Eksperimen | Hipotesis | Metrik utama | Guardrail |
| --- | --- | --- | --- |
| Onboarding 4 langkah vs 3 langkah | Lebih sedikit langkah menaikkan completion tanpa menurunkan relevansi | Onboarding completion → first lesson | Kualitas rekomendasi level |
| Default goal 10 vs 15 menit | Goal lebih kecil menaikkan streak | D7 retention | Rata-rata menit belajar |
| Review di beranda vs tab terpisah | Visibilitas menaikkan review adherence | Review completion | Completion pelajaran baru |
| Panjang sesi 5 vs 10 soal | Sesi lebih pendek menaikkan completion | Lesson completion | Akurasi/mastery |
| Pesan streak loss | Copy empatik menurunkan churn | D7 return setelah streak putus | Keluhan pengguna |
| Verifikasi email soft (boleh belajar) vs hard (wajib sebelum onboarding) | Soft verification menaikkan activation tanpa menurunkan kualitas akun | Activation & verification rate | Bounce/complaint rate |

**Aturan eksperimen:** satu variabel utama per tes; durasi minimal 2 minggu atau hingga signifikansi; hentikan jika guardrail memburuk.

---

## 15. Metrik Keberhasilan

### 15.1 North Star Metric

> **Weekly Active Learners (WAL): jumlah pengguna unik yang menyelesaikan minimal satu pelajaran atau sesi review dalam 7 hari.**

Alasan: mengukur nilai belajar yang benar-benar dikonsumsi, bukan sekadar login. Metrik ini menghubungkan akuisisi, kualitas konten, dan retensi.

### 15.2 Pohon metrik

| Lapisan | Metrik | Definisi |
| --- | --- | --- |
| **Akuisisi** | Visitor → sign-up | Persentase pengunjung marketing yang membuat akun |
| **Activation** | Onboarding completion | Pengguna baru yang menyelesaikan onboarding |
| | Time to first lesson | Median waktu dari sign-up ke pelajaran pertama |
| | Email verification rate | Persentase akun yang terverifikasi dalam 7 hari |
| **Engagement** | Sessions/week | Rata-rata sesi belajar per WAL per minggu |
| | Minutes/week | Rata-rata menit belajar per WAL |
| **Learning** | Lesson completion | Pelajaran yang dimulai dan diselesaikan |
| | Accuracy | Rata-rata akurasi latihan |
| | Mastery rate | Persentase pelajaran yang mencapai status mastered |
| **Retention** | D1/D7/D30 | Cohort kembali pada hari ke-1/7/30 |
| | Streak 7+ | Persentase WAL dengan streak ≥ 7 |
| | Review adherence | Item review jatuh tempo yang diselesaikan |
| **Quality** | Crash-free | Sesi tanpa error fatal |
| | p95 latency | Latensi API |
| | Support tickets | Tiket per 1.000 WAL |

### 15.3 Target v1.0

Target di bawah adalah **hipotesis awal** untuk 90 hari setelah peluncuran publik. Baseline produk belum terukur karena belum ada analytics; angka akan dikalibrasi setelah 4 minggu.

| Metrik | Baseline | Target 30 hari | Target 90 hari | Sumber |
| --- | --- | --- | --- | --- |
| Onboarding completion | — | ≥ 60% | ≥ 70% | Event |
| First lesson dalam 24 jam | — | ≥ 50% | ≥ 60% | Event |
| Email verification rate (7 hari) | — | ≥ 60% | ≥ 75% | Event |
| D1 retention | — | ≥ 40% | ≥ 45% | Cohort |
| D7 retention | — | ≥ 25% | ≥ 30% | Cohort |
| D30 retention | — | — | ≥ 15% | Cohort |
| Lesson completion | — | ≥ 60% | ≥ 70% | Event |
| Sessions/week (WAL) | — | ≥ 2,5 | ≥ 3 | Event |
| Review adherence | — | ≥ 30% | ≥ 40% | Event |
| Streak 7+ | — | ≥ 15% | ≥ 20% | DB |
| Mastery rate (pelajaran) | — | ≥ 25% | ≥ 35% | DB |
| Weekly Active Learners | 0 | 300 | 1.000 | Event |
| Crash-free session | — | ≥ 99% | ≥ 99,5% | Monitoring |
| p95 API latency (baca) | — | ≤ 400 ms | ≤ 300 ms | APM |

**Target pertumbuhan (asumsi perencanaan):**

- 10.000 pengguna terdaftar dalam 90 hari.
- 1.000 WAL pada hari ke-90.
- CAC dan konversi berbayar tidak ditetapkan sampai monetisasi v2; fokus v1 adalah retensi dan pembelajaran.

### 15.4 Metrik kualitas pembelajaran

Karena klaim “mahir” memerlukan bukti, v1 mengukur proksi berikut:

- **Accuracy improvement:** selisih akurasi 5 pelajaran pertama vs 5 pelajaran terakhir per pengguna; target +10 poin persentase.
- **Mastery rate:** ≥ 35% pelajaran yang dimulai mencapai mastered.
- **Error recurrence:** konsep yang salah berulang turun ≥ 30% setelah review.
- **Review effectiveness:** akurasi item review naik dari 55% ke 75% dalam 3 siklus.

Metrik ini bukan klaim kefasihan; digunakan untuk menilai kualitas konten dan mekanisme review.

### 15.5 Ritme pengukuran

- **Harian:** error rate, latency, funnel activation.
- **Mingguan:** cohort retention, engagement, review adherence, content completion.
- **Bulanan:** recalibrasi target, evaluasi eksperimen, audit kualitas konten.
- **Per rilis:** regression metrics dan guardrail.

---

## 16. Roadmap dan Delivery Plan

### 16.1 Ringkasan fase

| Fase | Durasi | Fokus | Hasil utama | Exit criteria |
| --- | --- | --- | --- | --- |
| **Fase 0 — Fondasi & Auth** | 3 minggu | Auth kustom, data, observability, desain | Email/password + bcrypt, sesi server-side, verifikasi email, lupa password, schema v1, event analytics | Rute terlindungi; schema migrasi bersih; alur auth lengkap; build + test lulus |
| **Fase 1 — Core Loop MVP** | 5 minggu | Onboarding, beranda, session runner, progres | Pengguna dapat belajar dan progres tersimpan | E2E: signup → onboarding → lesson → refresh → progres tetap |
| **Fase 2 — Retensi** | 3 minggu | Review SRS, streak/goal, badge, laporan | Alasan untuk kembali setiap hari | Review adherence terukur; D7 beta ≥ 25% |
| **Fase 3 — Konten & Skala** | 4 minggu | A1/A2 lengkap, B1, admin, PWA | Konten cukup untuk 30 hari; operasi konten aman | 12 A1 + 12 A2; import/rollback; audit aksesibilitas |
| **Beta & Rilis** | 4 minggu | UAT, performance, security, rollout | v1.0 publik | Semua kriteria rilis di bagian 19 terpenuhi |

Total estimasi: **19 minggu** hingga v1.0 publik (termasuk buffer integrasi). Jika tim lebih kecil dari asumsi, tambahkan 30–50%.

### 16.2 Detail fase

#### Fase 0 — Fondasi & Auth (Minggu 1–3)

**Deliverable:**

- Implementasi auth kustom: registrasi, login, logout, sesi server-side, ganti password, verifikasi email, lupa password/reset, dan rate limiting.
- Integrasi penyedia email transaksional + template verifikasi, reset, dan konfirmasi; SPF/DKIM/DMARC.
- Hapus Clerk: `ClerkProvider`, halaman Clerk, `app/api/__clerk`, env `CLERK_*`, dependensi `@clerk/*`; ganti `proxy.ts` dengan pengecekan sesi.
- Migrasi user Clerk lama (jika ada): cocokkan email, set `passwordHash = null`, kirim tautan “atur password”.
- Migrasi schema aditif: `Session`, `EmailVerificationToken`, `PasswordResetToken`, `AuthEvent`, `UserStats`, `LessonProgress`, `ExerciseAttempt`, `ReviewItem`, `XpEvent`, `DailyActivity`, `NumberItem`, `NumberAttempt`.
- Content catalog script dari data Grammar/Number Name; ID stabil.
- Setup error tracking, structured logging, event analytics dengan consent.
- Audit dan perbaikan token desain: hapus hex hardcoded dari shell dan modul.
- Setup test: Vitest/Playwright minimal untuk auth, attempt, progress.

**Exit criteria:**

- Pengguna dapat daftar, login, logout, verifikasi email, dan reset password; semua langkah diuji e2e.
- `/en/editor` tidak dapat diakses anonim; sesi yang dicabut ditolak.
- Tidak ada dependensi atau route Clerk yang tersisa.
- User baru otomatis punya `UserStats`.
- `POST /api/v1/attempts` mengembalikan hasil dan menyimpan attempt (dapat diuji via API).
- Build, lint, unit test, dan e2e auth lulus.

#### Fase 1 — Core Loop MVP (Minggu 4–8)

**Deliverable:**

- Onboarding 4 langkah + gate.
- Beranda “Hari ini” dengan rencana dari aturan.
- Session runner yang terhubung API (Grammar + Number Name).
- Ringkasan sesi dan CTA berikutnya.
- Halaman Progress v1.
- XP/level/streak/hearts server-side v1.
- Redirect `/editor` → `/learn`; hapus metafora project.

**Exit criteria:**

- Pengguna dapat menyelesaikan satu pelajaran Grammar dan satu fase Number Name; progres bertahan setelah refresh dan logout/login.
- XP tidak bertambah dua kali saat submit ganda.
- Tidak ada state progres di React context yang menjadi sumber kebenaran.
- UAT internal 5 pengguna tanpa bug blocker.

#### Fase 2 — Retensi (Minggu 9–11)

**Deliverable:**

- SRS engine + antrean review + halaman review.
- Daily goal, streak recovery, badge inti.
- Laporan mingguan in-app.
- Preferensi notifikasi + email pengingat (beta).
- Analytics funnel lengkap.

**Exit criteria:**

- Item review muncul sesuai jadwal; jawaban memperbarui interval.
- Streak dihitung benar di zona waktu pengguna; uji perjalanan lintas zona.
- Email reminder opt-in berfungsi dan dapat unsubscribe.
- D7 closed beta ≥ 25%.

#### Fase 3 — Konten & Skala (Minggu 12–15)

**Deliverable:**

- Tambahan hingga 12 pelajaran A1 dan 12 pelajaran A2 (17 pelajaran baru dari 7 yang sudah ada) dengan 4–6 latihan masing-masing.
- 8 pelajaran B1 tambahan.
- Content validation di CI, admin import/publish/rollback ringan.
- PWA installable + offline sesi aktif.
- Audit aksesibilitas dan perbaikan.
- Performance tuning (bundle, cache, image/audio).

**Exit criteria:**

- Konten A1/A2 lulus review native speaker.
- Import konten idempoten; rollback < 5 menit.
- Lighthouse mobile ≥ 90 untuk perf/accessibility pada halaman Learn dan Lesson.
- Tidak ada pelajaran tanpa penjelasan/latihan.

#### Beta & Rilis (Minggu 16–19)

| Tahap | Audiens | Durasi | Fokus |
| --- | --- | --- | --- |
| Dogfood | Tim internal | 1 minggu | Bug blocker, alur sehari-hari |
| Closed beta | 50–100 pengguna | 1 minggu | Kualitas konten, retensi awal, feedback |
| Public beta | 500–1.000 pengguna | 2 minggu | Stabilitas, performa, funnel |
| v1.0 | Publik | — | Rollout bertahap per locale |

**Rollout:** aktifkan untuk 10% pengguna baru, pantau error/latency/retensi 48 jam, naikkan ke 50%, lalu 100%. Siapkan kill switch untuk modul.

### 16.3 Tim dan effort

| Peran | Alokasi | Tanggung jawab |
| --- | --- | --- |
| Product Manager | 1 FTE | Prioritas, acceptance, koordinasi |
| Product Designer | 1 FTE | Alur, UI, design system, aksesibilitas |
| Full-stack Engineer | 2 FTE | API, DB, session runner, frontend |
| Content Lead | 1 FTE | Kurikulum, QA konten, native review |
| Content Writer (kontrak) | 2 kontributor | 17+ pelajaran baru A1/A2, latihan |
| QA | 0,5 FTE | Test plan, e2e, rilis |
| Data/Analytics | 0,25 FTE | Event, dashboard, eksperimen |

**Asumsi:** tim tersedia penuh waktu; tidak ada ketergantungan pihak ketiga yang memblokir. Jika hanya 1 engineer, prioritaskan Fase 0–1 dan tunda Fase 2–3.

### 16.4 Dependensi

| Dependensi | Pemilik | Risiko jika terlambat |
| --- | --- | --- |
| Domain email + kredensial penyedia email (SPF/DKIM/DMARC) | Engineering | Verifikasi & reset password tidak terkirim |
| Template email verifikasi/reset/konfirmasi | Design/Engineering | Pengguna tidak bisa memulihkan akun |
| Database produksi + backup | Engineering | Progres tidak aman |
| Review native speaker konten A1/A2 | Content | Konten tidak layak rilis |
| Audio Number Name 6 bahasa | Content/Audio | Fase listen tidak berfungsi |
| Kebijakan privasi diperbarui | Legal/Product | Kepatuhan |
| Desain sistem terpadu | Design | UI tidak konsisten |

### 16.5 Setelah v1.0

- Minggu 1–2: stabilization, perbaikan dari feedback, analisis funnel.
- Minggu 3–6: v1.1 (placement test, reference library, vocabulary beta, notifikasi).
- Kuartal berikutnya: v2 AI tutor dan tutor marketplace, didahului validasi retensi dan willingness-to-pay.

---

## 17. Risiko, Asumsi, dan Dependensi

### 17.1 Register risiko

| ID | Risiko | Probabilitas | Dampak | Mitigasi | Pemilik | Sinyal awal |
| --- | --- | --- | --- | --- | --- | --- |
| **R-01** | Scope creep ke AI tutor/marketplace sebelum loop inti selesai | Tinggi | Tinggi | Non-goals v1.0 tertulis; gate keputusan v2 berdasarkan retensi; satu roadmap | Product | Permintaan fitur AI di luar backlog v1 |
| **R-02** | Migrasi auth Clerk → kustom merusak akses pengguna | Sedang | Tinggi | Migrasi aditif; uji di staging; jalur “atur password” via email; monitor error auth; rollback plan | Engineering | Lonjakan 401/403 setelah rilis |
| **R-03** | Kekurangan konten A1/A2 yang direview native | Tinggi | Tinggi | Mulai produksi konten di Fase 0; kontrak penulis; QA checklist; rilis bertahap per level | Content | < 12 pelajaran siap 2 minggu sebelum rilis |
| **R-04** | Gamifikasi terlalu menekan atau terlalu mudah | Sedang | Sedang | Playtest; target akurasi; eksperimen; batas XP; feedback kualitatif | Product/Design | Review adherence turun; keluhan “terlalu sulit” |
| **R-05** | Audio lambat/tidak tersedia di perangkat tertentu | Sedang | Sedang | Preload, fallback TTS, transcript, uji iOS/Android low-end | Engineering | Error audio > 1% sesi |
| **R-06** | Performa buruk di Android low-end | Sedang | Tinggi | Budget bundle; code splitting; uji perangkat nyata; hindari animasi berat | Engineering | LCP > 4 s; crash rate naik |
| **R-07** | Pelanggaran privasi (PII di analytics/log) | Rendah | Tinggi | Review event; consent; retensi; audit | Product/Engineering | Temuan audit |
| **R-08** | Regresi karena tidak ada test | Tinggi | Tinggi | Test kritis di Fase 0; CI wajib; e2e alur utama | Engineering | Bug regression berulang |
| **R-09** | Kualitas terjemahan/RTL buruk | Sedang | Sedang | Review native; uji RTL; fallback English | Design/Content | Teks terpotong/terbalik |
| **R-10** | Ketergantungan pada satu engineer | Sedang | Tinggi | Dokumentasi; pairing; code review; runbook | Engineering | Bus factor 1 |
| **R-11** | Email transaksional gagal/deliverability buruk | Sedang | Tinggi | Penyedia email bereputasi; SPF/DKIM/DMARC; retry; bounce monitoring; opsi hubungi support | Engineering/Product | Bounce > 2%; verifikasi < 80% |
| **R-12** | Consent analytics menurunkan data | Sedang | Rendah | Dashboard agregat; server-side event esensial; transparansi | Growth | Sample < 50% |
| **R-13** | Dark pattern/gamifikasi memicu churn | Rendah | Tinggi | Prinsip etika; batas notifikasi; opsi non-timer; uji pengguna | Product | Keluhan; unsubscribe tinggi |
| **R-14** | Masalah lisensi audio/konten | Sedang | Tinggi | Aset original atau lisensi jelas; dokumentasi; review legal | Content/Legal | Klaim hak cipta |
| **R-15** | Ekspektasi stakeholder tidak selaras dengan baseline | Sedang | Sedang | PRD ini; demo jujur; roadmap bertahap | Product | Permintaan tanggal yang tidak realistis |
| **R-16** | Bug keamanan pada auth kustom (sesi, reset token, bcrypt) | Sedang | Tinggi | Gunakan library standar; code review keamanan; uji token/sesi; rate limit; penetration test sebelum rilis | Engineering | Temuan audit; insiden akses |

### 17.2 Prinsip respons risiko

1. **Rilis kecil, pantau ketat.** Setiap fase punya exit criteria dan kill switch.
2. **Konten adalah jalur kritis.** Jika konten terlambat, kurangi cakupan level, jangan luncurkan level kosong.
3. **Jangan menunda keamanan.** Auth dan privasi adalah syarat rilis, bukan backlog.
4. **Keputusan berdasarkan data.** Setelah 4 minggu, target dan prioritas dikalibrasi ulang.

### 17.3 Asumsi

| ID | Asumsi | Validasi |
| --- | --- | --- |
| **A-01** | Pengguna utama adalah pembelajar dewasa Indonesia/Asia Tenggara yang belajar English | Riset 10–15 wawancara di Fase 0; analytics locale |
| **A-02** | Sesi 5–15 menit lebih realistis daripada 30 menit untuk segmen ini | Eksperimen panjang sesi |
| **A-03** | Konten A1–B1 yang seimbang cukup untuk 30 hari pertama | Content audit dan completion rate |
| **A-04** | Penyedia email transaksional dapat diandalkan untuk verifikasi dan reset password | Review SLA, reputasi domain, uji deliverability |
| **A-05** | SRS ringan cukup; tidak perlu algoritma adaptif kompleks di v1 | Review effectiveness |
| **A-06** | Gamifikasi meningkatkan retensi tanpa merusak pembelajaran | Eksperimen dan guardrail akurasi |
| **A-07** | Tim dapat menyelesaikan v1.0 dalam 19 minggu dengan 2 engineer | Sprint review; jika tidak, kurangi scope |
| **A-08** | Tidak ada kebutuhan monetisasi sebelum v2 | Keputusan bisnis |
| **A-09** | OAuth/social login dan MFA tidak diperlukan untuk v1.0 | Riset pengguna dan data support |

### 17.4 Dependensi eksternal

- **Penyedia email transaksional:** verifikasi email, reset password, konfirmasi, dan pengingat (P1); SLA dan reputasi domain.
- **PostgreSQL terkelola:** backup, region, connection pooling.
- **Hosting (Vercel):** build, edge/CDN, environment.
- **Analytics/error tracking:** pilihan vendor dan consent.
- **Audio/TTS:** rekaman native atau penyedia TTS dengan dukungan 6 bahasa.
- **Legal:** privacy policy, terms, cookie policy, DPA.

---

## 18. Keputusan dan Pertanyaan Terbuka

### 18.1 Log keputusan

| ID | Keputusan | Status | Tanggal | Pemilik |
| --- | --- | --- | --- | --- |
| **D-01** | Fokus module-first, English untuk Indonesia/SEA; AI/marketplace v2 | Proposed | 2026-11-25 | Product |
| **D-02** | Auth kustom email + password (bcrypt), sesi server-side, verifikasi email, lupa password; Clerk dihapus | Proposed | 2026-11-25 | Engineering |
| **D-03** | Content-as-code + katalog DB untuk v1; CMS v1.1 | Proposed | 2026-11-25 | Engineering/Content |
| **D-04** | Ganti “Editor” menjadi “Learn”; hapus project/canvas | Proposed | 2026-11-25 | Product/Design |
| **D-05** | Gamifikasi server-side; leaderboard ditunda | Proposed | 2026-11-25 | Product |
| **D-06** | Target bahasa v1: English; Number Name tetap 6 bahasa | Proposed | 2026-11-25 | Product |
| **D-07** | Konten rilis: 12 A1 + 12 A2 + 8 B1 baru; B2/C1 beta | Proposed | 2026-11-25 | Content |
| **D-08** | API versioning `/api/v1`; envelope dipertahankan | Proposed | 2026-11-25 | Engineering |
| **D-09** | SRS awal memakai SM-2 yang disederhanakan | Proposed | 2026-11-25 | Product/Engineering |
| **D-10** | Tidak ada fitur sosial/leaderboard di v1 | Proposed | 2026-11-25 | Product |

### 18.2 Pertanyaan terbuka

| ID | Pertanyaan | Dampak | Rekomendasi | Pemilik | Tenggat |
| --- | --- | --- | --- | --- | --- |
| **Q-01** | Apakah pasar awal hanya Indonesia, atau seluruh Asia Tenggara? | Prioritas konten, bahasa UI, akuisisi | Mulai Indonesia + English, ekspansi berdasarkan data | Product | Sebelum Fase 1 |
| **Q-02** | Kapan monetisasi dimulai dan model apa (langganan, kredit, lifetime)? | Roadmap v2, harga, paywall | Tunggu D30 ≥ 15% dan willingness-to-pay survey | Product/Business | Akhir Fase 3 |
| **Q-03** | Penyedia video/sesi live untuk tutor marketplace? | Arsitektur v2 | Tunda; evaluasi Daily.co/LiveKit saat v2 dimulai | Engineering | Sebelum v2 |
| **Q-04** | Model AI dan penyedia untuk tutor percakapan? | Biaya, latensi, kualitas | Tunda; buat spike di v2 dengan 1 vendor + fallback | Engineering | Sebelum v2 |
| **Q-05** | Apakah mobile native memerlukan mekanisme token terpisah dari cookie web? | Auth, kompleksitas | Gunakan sesi berbasis token untuk mobile dengan rotasi; jangan memakai ulang cookie web | Engineering | Sebelum mobile |
| **Q-06** | Di region mana data pengguna disimpan? | Kepatuhan, biaya | Region terdekat dengan pasar utama; dokumentasikan | Engineering/Legal | Sebelum rilis |
| **Q-07** | Berapa batas XP harian dan apakah streak freeze perlu di v1? | Balance gamifikasi | 500 XP/hari; freeze di v1.1 | Product | Fase 2 |
| **Q-08** | Apakah konten akan diterjemahkan ke bahasa UI selain English? | Biaya konten, kualitas | Konten bahasa target utama English; UI 12 locale | Content | Fase 3 |
| **Q-09** | Apa nama merek final: Lango, Lango AI, atau LangoPulse? | Branding, domain, dokumen | Gunakan **Lango**; “AI” adalah fitur, bukan nama produk | Product | Segera |
| **Q-10** | Apakah perlu leaderboard opt-in di v1.1? | Sosial, privasi | Tunda sampai ada > 1.000 WAL dan kontrol privasi | Product | Setelah v1 |
| **Q-11** | Penyedia email transaksional mana yang dipakai (Resend, Postmark, SES, lainnya)? | Deliverability, biaya, kepatuhan | Pilih satu dengan reputasi baik, dukungan webhook, dan region yang sesuai; siapkan fallback | Engineering | Sebelum Fase 0 |
| **Q-12** | Apakah OAuth/social login dan MFA masuk v1.1 atau v2? | Auth, keamanan, scope | Tunda; evaluasi setelah v1 berdasarkan data support dan risiko | Product/Engineering | Setelah v1 |

### 18.3 Yang sudah diputuskan oleh PRD ini

- Tidak menambah modul baru sebelum Grammar dan Number Name tersimpan.
- Tidak menggunakan `useState` sebagai sumber kebenaran progres.
- Tidak menampilkan “Projects/New Project” di alur belajar.
- Tidak membangun AI tutor atau marketplace di v1.0.
- Tidak memakai Clerk; auth kustom email + password (bcrypt) dengan sesi server-side.
- Tidak menambahkan OAuth/social login atau MFA di v1.0.
- Tidak merilis level yang tidak memiliki konten cukup.

---

## 19. Kriteria Penerimaan Rilis v1.0

Rilis hanya disetujui jika **semua** item berikut terpenuhi dan ditandatangani oleh Product, Engineering, Design, Content, dan QA.

### 19.1 Fungsional

- [ ] Pengguna baru dapat sign-up, menyelesaikan onboarding, dan menyelesaikan pelajaran pertama tanpa bantuan.
- [ ] Pengguna dapat login, logout, dan tetap login setelah refresh; sesi yang dicabut ditolak.
- [ ] Email verifikasi terkirim dan tautan verifikasi berfungsi; banner hilang setelah verifikasi.
- [ ] Lupa password mengirim tautan; tautan berlaku 30 menit, sekali pakai, dan reset mencabut semua sesi.
- [ ] Password baru disimpan sebagai hash bcrypt; password lama tidak berlaku setelah reset.
- [ ] Tidak ada dependensi, route, env, atau komponen Clerk yang tersisa.
- [ ] Progres (XP, streak, hearts, lesson completion, attempt) bertahan setelah refresh, logout, dan login di perangkat lain.
- [ ] Pengguna dapat melanjutkan pelajaran yang ditinggalkan di soal terakhir.
- [ ] Grammar A1 dan A2 masing-masing memiliki ≥ 12 pelajaran yang dipublikasikan.
- [ ] Number Name berfungsi untuk 6 bahasa dengan 7 fase dan audio.
- [ ] Review menampilkan item jatuh tempo yang benar dan memperbarui jadwal setelah dijawab.
- [ ] XP tidak dapat digandakan dengan refresh, submit ganda, atau manipulasi payload.
- [ ] Streak dihitung benar di zona waktu pengguna.
- [ ] Empty, loading, error, dan offline state tampil di semua layar inti.
- [ ] Redirect `/editor` → `/learn` berfungsi dan tidak ada tautan mati.

### 19.2 Keamanan dan privasi

- [ ] Semua rute aplikasi terlindungi; hanya marketing/auth/katalog yang publik.
- [ ] Tidak ada `userId` dari klien yang dipercaya untuk otorisasi.
- [ ] Password disimpan sebagai bcrypt cost ≥ 12; tidak ada password plaintext di DB/log; kebijakan password diuji.
- [ ] Cookie sesi `HttpOnly; Secure; SameSite=Lax`; token sesi di-hash; sesi dicabut saat logout/reset.
- [ ] Token reset/verifikasi di-hash, sekali pakai, dan kedaluwarsa sesuai batas; token lama tidak valid setelah permintaan baru.
- [ ] Login/forgot password tidak membocorkan keberadaan akun; rate limit teruji.
- [ ] Tidak ada secret fallback di kode produksi; `JWT_SECRET`/`CLERK_*` tidak lagi dipakai.
- [ ] Email transaksional memakai domain terverifikasi (SPF/DKIM/DMARC); template diuji.
- [ ] Privacy policy, terms, dan cookie policy sesuai implementasi.
- [ ] Consent analytics berfungsi; penolakan dihormati.
- [ ] Ekspor dan hapus akun tersedia (P1) atau tercatat sebagai gap yang disetujui.
- [ ] Audit dependency bersih dari kerentanan kritis.

### 19.3 Kualitas dan performa

- [ ] Unit test untuk auth (hash, sesi, token, rate limit), attempt, XP, SRS, dan streak lulus.
- [ ] E2E alur utama lulus di Chromium, WebKit, dan Firefox, termasuk forgot/reset password dan verifikasi email.
- [ ] Security review auth selesai; tidak ada temuan kritis/high terbuka.
- [ ] Lighthouse mobile ≥ 90 untuk performance dan accessibility pada Learn dan Lesson (atau pengecualian terdokumentasi).
- [ ] p95 API ≤ 300 ms di staging dengan beban sintetis 1.000 request/menit.
- [ ] Crash-free session ≥ 99,5% selama public beta.
- [ ] Error tracking aktif dengan alert.
- [ ] Audit aksesibilitas manual pada 3 layar inti selesai; tidak ada blocker WCAG AA.

### 19.4 Konten

- [ ] Semua pelajaran yang dipublikasikan memiliki penjelasan, ≥ 3 latihan, dan penjelasan jawaban.
- [ ] Konten A1/A2 lulus review native speaker.
- [ ] Audio Number Name tersedia atau fallback TTS teruji.
- [ ] Tidak ada teks placeholder/TODO di konten yang tampil.
- [ ] `conceptKey` ada di semua latihan yang masuk review.

### 19.5 Operasional

- [ ] Backup database dan uji restore berhasil.
- [ ] Runbook insiden tersedia (auth, email deliverability, DB, audio, konten).
- [ ] Feature flag dan kill switch untuk modul berfungsi.
- [ ] Dashboard analytics dan error tersedia.
- [ ] Uji kirim email verifikasi/reset/konfirmasi ke Gmail, Outlook, dan satu penyedia lain; cek spam.
- [ ] Rencana rollout 10% → 50% → 100% disetujui.
- [ ] Support/FAQ dan jalur kontak tersedia.

### 19.6 Sign-off

| Peran | Nama | Tanggal | Status |
| --- | --- | --- | --- |
| Product |  |  | ☐ |
| Engineering |  |  | ☐ |
| Design |  |  | ☐ |
| Content |  |  | ☐ |
| QA |  |  | ☐ |

---

## Appendix A — Peta Kode dan Tindakan

| Path | Kondisi | Tindakan v1.0 |
| --- | --- | --- |
| `app/[lang]/editor/*` | Shell “Editor” dengan sidebar project | Ganti menjadi `app/[lang]/learn/*`; redirect 301; hapus metafora project |
| `app/components/editor/editor-navbar.tsx` | Navbar dengan toggle sidebar | Refactor menjadi `app-navbar`; tambah streak/XP |
| `app/components/editor/project-sidebar.tsx` | “My Projects/Shared” | Ganti dengan sidebar modul + review/progress |
| `app/components/editor/welcome-dashboard.tsx` | Daftar modul + status | Pindahkan ke `/learn/modules`; hub modul |
| `app/components/editor/grammar/*` | 60 pelajaran, 4 tipe soal, client-side | Pertahankan komponen; pindahkan progres ke API; validasi konten |
| `app/components/editor/grammar/grammar-data.ts` | 25.067 baris TS | Pisahkan per level/modul; skema Zod; contentVersion |
| `app/components/editor/number-name/*` | 7 fase, client-side, `lang` dari props | Hubungkan API; gunakan target bahasa user; audio pipeline |
| `app/components/editor/number-name/number-data.ts` | 6 bahasa, data angka | Pindahkan ke content registry; tambah transliterasi/audio |
| `app/[lang]/(auth)/sign-in`, `sign-up` | Komponen Clerk dua panel | Ganti dengan form email/password + tautan lupa password |
| `app/[lang]/(auth)/forgot-password`, `reset-password`, `verify-email` | Belum ada | Buat halaman baru sesuai bagian 10.3 |
| `app/lib/auth.ts` | JWT kustom + bcrypt | Pertahankan bcrypt; ganti JWT stateless dengan helper sesi server-side, token reset/verifikasi, dan rate limit |
| `app/lib/clerk.ts` | Helper konfigurasi Clerk | Hapus |
| `app/lib/prisma.ts` | Prisma client dengan adapter pg | Pertahankan; tambah pooling/monitoring |
| `app/lib/schemas/index.ts` | Zod schemas (mock API) | Perluas untuk auth, domain belajar, dan schema konten |
| `app/api/auth/*` | Login/register/refresh/logout JWT | Ganti dengan `/api/v1/auth/*`: register, login, logout, session, forgot/reset, verify/resend |
| `app/api/__clerk/[[...path]]/route.ts` | Proxy Clerk | Hapus |
| `app/api/users/me/*` | Profil & settings dengan JWT | Migrasi ke sesi kustom; jadikan `/api/v1/me` |
| `app/api/daily/exercise/*` | Exercise harian mock-shaped | Ganti dengan session/attempt v1 |
| `app/api/grammar/*` | Detail & history mock-shaped | Ganti dengan katalog/session v1 |
| `app/api/tutor/*` | Pesan/sesi tutor placeholder | Tunda ke v2; jangan tampilkan UI |
| `app/api/lessons/[id]/results/*` | Tidak memverifikasi pemilik | Hapus/ganti dengan sesi terautentikasi |
| `app/api/home/feed/*` | Feed dengan data agregat | Ganti dengan `/api/v1/home` |
| `app/api/community/*`, `app/api/mistakes/*`, `app/api/onboarding/data/*` | Fitur mock/belum terpakai | Audit; hapus atau tunda |
| `proxy.ts` | Clerk middleware; semua `/{locale}/*` publik | Ganti dengan pengecekan cookie sesi; lindungi `/learn`, `/progress`, `/profile`; hapus Clerk |
| `prisma/schema.prisma` | 30 model mock-shaped; belum ada tabel auth | Tambah `Session`, `EmailVerificationToken`, `PasswordResetToken`, `AuthEvent`; `passwordHash`; migrasi bertahap |
| `prisma/seed.ts` | Seed data mock | Pisahkan seed katalog vs demo; buat user demo dengan password ter-hash |
| `.env.example` | Berisi `CLERK_*` dan JWT | Ganti dengan `SESSION_SECRET`, `EMAIL_PROVIDER_*`, `APP_URL`; hapus semua `CLERK_*` |
| `package.json` | `@clerk/nextjs`, `@clerk/ui` | Hapus dependensi Clerk; tambah SDK penyedia email |
| `emails/` | Belum ada | Tambah template verifikasi, reset password, konfirmasi, dan pengingat |
| `docs/API_MOCK_DATA.md` | Referensi mock LangoPulse | Tandai legacy; jangan dijadikan kontrak v1 |
| `context/feature-specs/03-editor-chrome.md` | Spesifikasi editor | Legacy; digantikan IA v1 |
| `context/feature-specs/04-project-dialogs.md` | Dialog project | Legacy; dihapus dari alur belajar |
| `context/feature-specs/02-auth-system.md` | Spesifikasi Clerk | Legacy; jangan implementasikan Clerk; ganti dengan E1 PRD ini |
| `context/architecture-context.md` | Bagian auth masih menyebut Clerk | Perbarui setelah D-02 disetujui: bcrypt, `Session`, token reset/verifikasi, email provider |
| `context/feature-specs/05-gemification-learn-number-to-language-target.md` | Spesifikasi Number Name | Sumber requirement NUM; sinkronkan status |
| `context/feature-specs/06-grammer-features.md` | Spesifikasi Grammar | Sumber requirement GRM; sinkronkan status |
| `public/manifest.json` | Menunjuk ikon `/icons/*` yang tidak ada di `public/` | Tambahkan ikon atau perbarui manifest; uji install PWA |
| `app/locales/*.json` | Copy marketing menjanjikan tutor native | Selaraskan copy dengan v1; aktifkan klaim tutor saat v2 |
| `context/progress-tracker.md` | Menyebut 2.192 latihan | Koreksi menjadi 2.232 berdasarkan audit; perbarui setelah implementasi |

**Catatan audit konten:** hitungan aktual per 25 November 2026 adalah 60 pelajaran dan 2.232 latihan (multiple choice 560, fill-in-the-blank 561, ordering 553, correction 558). Distribusi level: A1 4, A2 3, B1 3, B2 25, C1 25. Angka di `context/progress-tracker.md` (2.192) perlu dikoreksi.

---

## Appendix B — Glosarium

| Istilah | Definisi |
| --- | --- |
| **Activation** | Momen pengguna baru pertama kali mendapatkan nilai inti, didefinisikan sebagai menyelesaikan onboarding + pelajaran pertama dalam 24 jam. |
| **bcrypt** | Algoritma hashing password adaptif dengan salt; cost factor menentukan beban komputasi. Dipakai untuk menyimpan password, bukan mengenkripsi. |
| **Email verification** | Proses membuktikan kepemilikan alamat email melalui token sekali pakai. |
| **Forgot password token** | Token acak sekali pakai yang dikirim via email untuk menetapkan password baru; disimpan sebagai hash dan memiliki masa berlaku. |
| **Session** | Sesi login server-side yang diwakili token opaque di cookie; dapat dicabut dan dirotasi. |
| **CEFR** | Common European Framework of Reference; skala A1–C2 untuk kemampuan bahasa. |
| **Concept key** | Identifier stabil untuk konsep yang diuji (mis. `grammar.past_simple.regular`), dipakai untuk mastery dan SRS. |
| **D1/D7/D30** | Persentase cohort pengguna yang kembali pada hari ke-1/7/30. |
| **Hearts** | Nyawa dalam sesi; berkurang saat salah, diregenerasi seiring waktu. |
| **Idempotency** | Sifat operasi yang dapat diulang tanpa mengubah hasil (mis. submit attempt yang sama tidak memberi XP ganda). |
| **Lesson completion** | Pelajaran yang dimulai dan diselesaikan (semua latihan dijawab). |
| **Mastery** | Status penguasaan konsep/pelajaran berdasarkan akurasi dan attempt berulang, bukan sekadar sekali lulus. |
| **North Star Metric** | Metrik utama yang paling menggambarkan nilai produk; di sini WAL. |
| **Placement test** | Tes singkat untuk menentukan level awal. |
| **SRS** | Spaced Repetition System; penjadwalan review berdasarkan interval dan tingkat kesulitan. |
| **Streak** | Jumlah hari berturut-turut dengan aktivitas belajar yang memenuhi syarat. |
| **WAL** | Weekly Active Learners; pengguna unik yang menyelesaikan ≥ 1 pelajaran/review dalam 7 hari. |
| **XP** | Experience points; mata uang gamifikasi untuk level dan badge. |

---

## Appendix C — Traceability ke Spesifikasi yang Ada

> **Catatan ID:** `GRAM-xx` adalah ID dari spesifikasi Grammar sumber (`context/feature-specs/06-grammer-features.md`), sedangkan `GRM-xx` adalah requirement PRD ini. Keduanya sengaja dibedakan.

| Sumber | Requirement sumber | Requirement PRD | Status saat ini | Tindakan |
| --- | --- | --- | --- | --- |
| `feature-specs/05` §3 Fase 1.1 | Number Flashcard | NUM-02 | Ada (client-only) | Hubungkan progres & audio |
| `feature-specs/05` §3 Fase 1.2 | Listen & Pick | NUM-02 | Ada | Hubungkan API |
| `feature-specs/05` §3 Fase 2.1 | Tap the Number | NUM-02 | Ada | Hubungkan API |
| `feature-specs/05` §3 Fase 2.2 | Spell the Number | NUM-02 | Ada | Hubungkan API |
| `feature-specs/05` §3 Fase 2.3 | Speak the Number | NUM-09 | Tidak ada | Tunda v2 (speech recognition) |
| `feature-specs/05` §3 Fase 3.1 | Speed Quiz | NUM-02 | Ada | Hubungkan API |
| `feature-specs/05` §3 Fase 3.2 | Survival Mode | NUM-02 | Ada | Leaderboard ditunda |
| `feature-specs/05` §3 Fase 3.3 | Friend Challenge | NUM-09 | Tidak ada | Tunda v2 |
| `feature-specs/05` §3 Fase 4.1 | Shopping Simulation | NUM-09 | Tidak ada | Tunda v2 |
| `feature-specs/05` §3 Fase 4.2 | Number in Context | NUM-10 | Tidak ada | v1.1 |
| `feature-specs/05` §3 Fase 5.1 | Mastery Test | NUM-06 | Ada | Hubungkan API & gate |
| `feature-specs/05` §3 Fase 5.2 | Spaced Repetition | NUM-07 | Tidak ada | E7, v1.0 |
| `feature-specs/05` §4 | XP/level/streak/hearts/koin/badge/leaderboard | E8 | Sebagian client-side | Server-side; koin & leaderboard ditunda |
| `feature-specs/05` §5 | 10 level angka | NUM-03 | 7 level | 7 level v1; ordinal/context v1.1 |
| `feature-specs/05` §7 | Audio native, variasi aksen, transliterasi | NUM-04, NUM-08 | TTS client | Rekaman + fallback; QA native |
| `feature-specs/06` GRAM-01..04 | Kurikulum, konten, aturan, topik | GRM-01, GRM-02 | Ada (60 pelajaran) | Seimbangkan A1–B1 |
| `feature-specs/06` GRAM-05..07 | Completion, learning path, 3–5 latihan | GRM-02, GRM-06 | Client-only | API & persistensi |
| `feature-specs/06` GRAM-08..12 | 4 tipe soal, variasi jawaban, konteks | GRM-03, GRM-04 | Ada | Uji variasi & konteks |
| `feature-specs/06` GRAM-13..16 | Confusion detection, needs review, SRS | E7 | Tidak ada | v1.0 |
| `feature-specs/06` GRAM-17..21 | Dashboard, CEFR, kategori, timeline, error analysis | PRG-01..08 | Sebagian visual | Bangun dengan data nyata |
| `feature-specs/06` GRAM-22..26 | XP, streak, badge, leaderboard | E8 | Sebagian client-side | Server-side; leaderboard v2 |
| `feature-specs/06` GRAM-27..30 | Timeline, filter, history, chart | PRG-03, PRG-06 | Tidak ada | v1.1 |
| `feature-specs/06` GRAM-31..33 | Reference library, quick lookup | GRM-09 | Tidak ada | v1.1 |
| `feature-specs/02` | Clerk, route protection, redirect | E1 | Legacy (Clerk) | Digantikan auth kustom email/password; jangan implementasikan Clerk |
| `feature-specs/03` | Editor navbar | — | Ada | Digantikan app shell |
| `feature-specs/04` | Project dialogs | — | Ada | Dihapus dari alur belajar |
| `project-overview` | AI tutor, lesson plan, marketplace, live session | — | Tidak ada | v2; catat sebagai visi, bukan v1 |
| `docs/API_MOCK_DATA.md` | Kontrak mock LangoPulse | — | Sebagian API | Legacy; kontrak v1 di bagian 12 |

---

## Appendix D — Definition of Done untuk Setiap Feature

Sebuah requirement dianggap selesai hanya jika:

1. **Perilaku** sesuai acceptance criteria dan diuji manual.
2. **Test** unit/integration/e2e yang relevan ditambahkan dan lulus di CI.
3. **Persistensi** diverifikasi: refresh, logout/login, dan perangkat lain.
4. **Error handling** mencakup loading, empty, error, offline, dan retry.
5. **Aksesibilitas** dasar: keyboard, label, kontras, focus, reduced motion.
6. **Analytics** event yang relevan terkirim tanpa PII.
7. **Keamanan** otorisasi diverifikasi (tidak bisa mengakses data pengguna lain).
8. **Desain** menggunakan token, bukan hex hardcoded; responsif 360 px.
9. **Dokumentasi** context/progress tracker diperbarui.
10. **Feature flag/kill switch** tersedia untuk fitur berisiko.
11. **QA sign-off** dan tidak ada bug blocker/critical terbuka.

---

## Appendix E — Riwayat Dokumen

| Versi | Tanggal | Perubahan | Penulis |
| --- | --- | --- | --- |
| 0.1 | 2026-11-25 | Audit repositori dan gap analysis awal | Product/Engineering |
| 1.0 | 2026-11-25 | Draft PRD lengkap: visi, scope, requirement, data, API, NFR, metrik, roadmap, risiko | Product |
| 1.1 | 2026-11-25 | Auth diganti dari Clerk menjadi email/password + bcrypt; tambah sesi server-side, verifikasi email, lupa password, data model/API/keamanan/roadmap yang disesuaikan | Product/Engineering |

---

> **Langkah berikutnya:** review bagian 0 dan 18 bersama stakeholder, setujui atau ubah keputusan D-01..D-10, lalu mulai Fase 0. PRD ini harus diperbarui setelah setiap fase atau ketika keputusan terbuka diselesaikan.

