# Feature Spec: Preferensi Bahasa Profil & Katalog Kurikulum Multibahasa

**ID:** FS-08  
**Status:** Draft — siap direview  
**Tanggal:** 2026-11-25  
**Terkait:** FS-07 (`07-user-friendly-learning-ui.md`), FS-09 (`09-multilingual-curriculum-platform.md`), PRD v1.1, `architecture-context.md`, `ui-context.md`  
**Pemilik:** Product + Learning Content  
**Dependensi:** FS-07 P1 (sinkronisasi i18n tanpa flash), migrasi `User.uiLocale`, content pipeline

---

## 1. Ringkasan

FS-08 menambahkan satu bagian baru di halaman profil — **“Bahasa & wilayah”** — yang memisahkan dua preferensi yang saat ini tercampur:

1. **Bahasa tampilan (`uiLocale`)** — bahasa menu, tombol, pesan, dan format. Nilainya menjadi segmen rute `[lang]` dan URL.
2. **Bahasa yang dipelajari (`contentLanguage` / `targetLanguage`)** — bahasa isi kurikulum. Nilainya **tidak** mengubah URL.

Perubahan bahasa tampilan dari profil langsung memindahkan URL sambil mempertahankan sisa path, query, dan hash:

| Aksi di profil | URL sebelum | URL sesudah | Bahasa UI | Bahasa belajar |
|---|---|---|---|---|
| Pilih **Bahasa Indonesia** | `http://localhost:3000/jp/learn` | `http://localhost:3000/id/learn` | Indonesia | tetap Jepang (`ja`) |
| Pilih **日本語** | `http://localhost:3000/id/learn` | `http://localhost:3000/jp/learn` | Jepang | tetap Jepang (`ja`) |
| Pilih **English** sebagai bahasa belajar | `http://localhost:3000/id/learn` | `http://localhost:3000/id/learn` | Indonesia | English (`en`) |
| Aktifkan “Samakan bahasa” lalu pilih **日本語** | `http://localhost:3000/id/learn` | `http://localhost:3000/jp/learn` | Jepang | Jepang (`ja`) |

> Catatan: contoh `/jp/learn` → `/id/learn` berlaku saat bahasa diubah dari switcher header, atau saat pengguna kembali ke belajar setelah mengubah profil. Jika diubah dari halaman profil, path `/profile` dipertahankan (`/jp/profile` → `/id/profile`); yang penting locale berubah dan tidak ada path/query yang hilang.

Selain preferensi, FS-08 menetapkan program konten yang membuat pilihan “bahasa yang dipelajari” benar-benar terisi:

- **Jepang — JLPT N5–N1:** ≥ **10.500 soal** dan **300 pelajaran** (60 pelajaran per jenjang), mencakup kosakata, kanji, tata bahasa, membaca, dan mendengar.
- **Inggris — CEFR A1–C1:** ≥ **10.500 soal** dan **300 pelajaran**; konten Grammar yang ada diimpor, bukan diduplikasi.
- **10 bahasa lain yang didukung Lango** (`id, es, fr, de, pt, it, nl, ko, hi, ar`): target akhir **10.500 soal** per bahasa, dirilis bergelombang.
- **Total akhir:** 12 bahasa × 10.500 soal = **126.000 soal**, 3.600 pelajaran.

> Prinsip utama: **UI boleh berganti bahasa kapan saja; konten tidak pernah “dipinjam” dari bahasa lain.** Jika kurikulum untuk bahasa pilihan belum tersedia, tampilkan empty state yang jujur — jangan diam-diam menampilkan bahasa Inggris.

### 1.1 Keputusan produk yang direkomendasikan

| ID | Keputusan | Alasan |
|---|---|---|
| D-01 | `[lang]` **hanya** bahasa tampilan, bukan bahasa belajar | Menjaga invarian FS-07; satu URL tidak bisa berarti dua hal |
| D-02 | Bahasa belajar disimpan di `User.targetLanguage` sebagai **kode kanonik** (`ja`, bukan `jp`/`Japanese`) | Menghapus fallback diam dan inkonsistensi data |
| D-03 | Preferensi bahasa tampilan disimpan di **`User.uiLocale`** + cookie `lango_locale` | Akun sebagai sumber utama; cookie untuk request tanpa sesi/awal |
| D-04 | URL saat request adalah **otoritas** untuk bahasa tampilan | Deep link `/id/...` harus selalu tampil Indonesia |
| D-05 | Perubahan dari profil memakai **simpan-dulu-baru-navigasi** | Tidak pernah meninggalkan URL yang belum tersimpan/404 |
| D-06 | Mengganti bahasa tampilan **tidak** mengubah bahasa belajar | Dua preferensi independen; ada toggle sinkron opsional |
| D-07 | Konten memakai **kode bahasa kanonik 12 bahasa**; rute `jp` adalah alias | Satu registry untuk UI, konten, TTS, dan API |
| D-08 | Soal JLPT adalah **original, JLPT-aligned**, bukan soal ujian resmi | Alasan hukum/merek; kualitas tetap terukur |
| D-09 | Bank soal disimpan di PostgreSQL; audio di Vercel Blob; impor idempoten | Skala 126 ribu soal tidak cocok sebagai file statis di bundle |
| D-10 | Tidak ada generasi AI saat runtime untuk soal inti | Determinisme, biaya, moderasi, dan kualitas |

### 1.2 Yang perlu dikonfirmasi sebelum implementasi

1. Apakah `[lang]` tetap **UI-only** seperti rekomendasi D-01? Jika produk ingin `[lang]` = bahasa belajar, seluruh IA dan FS-07 harus direvisi.
2. Apakah target 10.500 soal per bahasa adalah **target akhir** (boleh bergelombang), bukan syarat rilis pertama?
3. Bahasa penjelasan prioritas: `en`, `id`, `ja` saja untuk fase awal?

Jika tidak ada jawaban lain, spec ini diimplementasikan dengan rekomendasi di atas.

---

## 2. Masalah & Temuan Audit

### 2.1 Ringkasan

Fondasi locale sudah ada (`app/[lang]`, `app/i18n-config.ts`, `app/lib/i18n/locales.ts`, `app/locales/*.json`), tetapi **preferensi bahasa belum menjadi data akun**, **switcher belum konsisten**, dan **kurikulum belum berskala**. Ada pula tiga kosakata kode bahasa yang saling bertabrakan: kode rute (`jp`), kode konten (`ja`), dan label tampilan (`Japanese`/`Spanish`).

### 2.2 Bukti audit

| Area | Temuan | Bukti | Dampak |
|---|---|---|---|
| Profil | Tidak ada pengaturan bahasa sama sekali; target bahasa hanya ditampilkan sebagai teks | `app/components/auth/profile-panel.tsx` (bagian “Akun” hanya nama, email, target, level, goal, timezone) | Pengguna tidak bisa mengganti bahasa dari profil |
| Header | Switcher mengganti path dengan `window.location.pathname.replace(...)` dan memanggil `i18n.changeLanguage` setelah `router.push` | `app/components/header.tsx` (`changeLanguage`) | Path yang mengandung string locale bisa rusak; tidak ada versi mobile; tidak persisten |
| Provider | Bahasa baru di-set di `useEffect` setelah render pertama | `app/components/I18nProvider.tsx` | Flash teks Inggris pada `/jp`/`/id` di halaman non-editor |
| Data target | `targetLanguage` hanya menerima `en, es, fr, de, id, ja` | `app/lib/auth/validation.ts` (`OnboardingSchema`, `ProfileUpdateSchema`) | 6 bahasa Lango tidak bisa dipilih sebagai bahasa belajar |
| Data legacy | Seed menyimpan nama tampilan (`"Spanish"`) di `targetLanguage`/`learningLanguage`; `PATCH /me` menyalin kode ke `learningLanguage`; `Language.id` berupa slug (`"english"`) | `prisma/seed.ts`, `app/api/v1/me/route.ts` | Dua format bercampur; tidak ada satu identitas bahasa yang bisa diandalkan |
| Konten | `CONTENT_LANGUAGES` hanya 6; `resolveContentLanguage` jatuh ke bahasa default locale jika target tidak valid | `app/lib/i18n/locales.ts` | Pengguna memilih Korea, tetapi mendapat konten Inggris tanpa pemberitahuan |
| Onboarding | Daftar bahasa di-hardcode 6 dan copy-nya Indonesia | `app/components/auth/onboarding-form.tsx` | Daftar tidak sinkron dengan registry; copy tidak mengikuti locale |
| Kurikulum | Grammar hanya Inggris, 60 pelajaran, ±2.232 latihan; tidak ada JLPT | `app/components/editor/grammar/grammar-data.ts` | Tidak ada konten Jepang N5–N1 maupun bank soal 10 ribu |
| Akses konten | `getExerciseCatalogEntry` membaca katalog statis dari modul Grammar | `app/api/v1/attempts/route.ts`, `app/lib/learning/grammar.ts` | API tidak bisa melayani bank soal DB tanpa refactor |
| Proxy | Redirect locale hanya dari `Accept-Language`; tidak membaca cookie/akun; tidak ada alias `ja`/`in` | `proxy.ts`, `app/page.tsx` | Preferensi akun tidak dipakai saat membuka URL tanpa locale |
| Level | `cefrLevel` CEFR-only; tidak ada level JLPT | `prisma/schema.prisma` (`User.cefrLevel`) | Tidak bisa menyimpan N3/N2 dan tidak bisa memetakan framework |
| Font/RTL | Font Latin-only; tidak ada `dir="rtl"`; tidak ada font CJK/Arab/Devanagari | `app/layout.tsx`, `app/globals.css` | `/ar` tidak terbaca sebagai RTL; teks Jepang/Korea/Hindi bergantung fallback sistem |
| Klaim bahasa | `languagesList` memuat Bengali, tetapi Bengali bukan locale yang didukung | `app/utils/flags.ts` | Klaim “semua bahasa” bisa menyesatkan |
| Pengujian | Tidak ada test untuk routing locale, persistensi, atau jumlah soal | `scripts/check-locales.mjs` hanya memeriksa `en/id/jp` | Regresi mudah lolos |

### 2.3 Dampak produk

- Pengguna Indonesia yang belajar Jepang harus menebak URL atau memakai switcher header yang tidak tersimpan.
- Preferensi hilang saat pindah perangkat/browser karena hanya hidup di URL.
- “Semua bahasa didukung” belum benar untuk konten; belum ada cara jujur menampilkan ketersediaan.
- Skala konten 10 ribu soal tidak mungkin dicapai dengan pola `grammar-data.ts` saat ini.

---

## 3. Tujuan, Non-Tujuan, dan Metrik

### 3.1 Tujuan

| ID | Tujuan |
|---|---|
| G-01 | Pengguna dapat mengganti bahasa tampilan dari profil; URL berubah dan preferensi tersimpan ke akun |
| G-02 | URL selalu dapat di-bookmark dan dibagikan; membuka `/id/learn` selalu menampilkan UI Indonesia |
| G-03 | Bahasa tampilan dan bahasa belajar dapat berbeda tanpa saling merusak |
| G-04 | Semua 12 bahasa Lango memiliki identitas kanonik tunggal untuk UI, konten, API, dan TTS |
| G-05 | Jepang memiliki kurikulum JLPT N5–N1 dengan ≥10.500 soal dan 300 pelajaran |
| G-06 | Inggris memiliki kurikulum CEFR A1–C1 dengan ≥10.500 soal dan 300 pelajaran |
| G-07 | 10 bahasa lain memiliki jalur konten yang jelas dan status ketersediaan yang jujur |
| G-08 | Tidak ada fallback konten lintas bahasa, tidak ada flash locale, dan tidak ada URL yang salah setelah ganti bahasa |

### 3.2 Non-tujuan

- Menambah bahasa di luar 12 locale Lango (Bengali, Mandarin, dst.).
- Membuat soal resmi JLPT atau mengklaim afiliasi dengan JEES/Japan Foundation.
- Level C2, TOPIK, HSK, TOEFL, atau sertifikasi resmi lain.
- CMS authoring untuk guru/sekolah.
- Adaptive testing/IRT, placement test adaptif, atau AI tutor yang memilih soal saat runtime.
- Unduhan offline 10 ribu soal.
- Penilaian pengucapan otomatis (speech scoring).
- Menerjemahkan seluruh halaman marketing ke 12 bahasa dalam satu rilis.
- Mengubah penyedia video/audio live session.

### 3.3 Metrik keberhasilan

| Metrik | Target |
|---|---|
| Perubahan bahasa tampilan yang tersimpan | 100% (DB + cookie) |
| Redirect locale yang kehilangan path/query | 0 |
| Locale leak (string EN di UI `id`/`jp` pada layar yang tercakup, locale berstatus `full`) | 0 |
| Flash bahasa Inggris saat cold load `/jp`, `/id` | 0 |
| Pengguna dengan target valid tetapi mendapat konten bahasa lain | 0 |
| Soal Jepang terbit | ≥10.500; ≥2.100 per jenjang |
| Pelajaran Jepang terbit | 300 (60 per jenjang) |
| Soal Inggris terbit | ≥10.500 |
| Duplikat soal (fingerprint/similarity) | <0,5% |
| Soal yang lolos audit kunci jawaban | 100% sampel |
| Audio listening tersedia | 100% soal listening |
| Penjelasan tersedia | 100% soal (minimal satu support locale) |
| Native review sign-off per jenjang | 5/5 (N5–N1) dan 5/5 (A1–C1) |
| P95 simpan preferensi + navigasi | ≤300 ms setelah respons API |
| API ringkasan kurikulum P95 | ≤200 ms |

---

## 4. Definisi & Aturan Bahasa

### 4.1 Istilah

| Istilah | Definisi | Sumber | Contoh |
|---|---|---|---|
| `uiLocale` | Bahasa tampilan pada request saat ini | Segmen pertama URL `[lang]` | `id`, `jp` |
| `uiLocalePreference` | Preferensi bahasa tampilan milik akun | `User.uiLocale` + cookie | `id` |
| `contentLanguage` | Kode bahasa isi kurikulum | `User.targetLanguage` (kanonik) | `ja` |
| `targetLanguage` | Nama field database untuk bahasa belajar | Prisma | `ja` |
| `nativeLanguage` | Bahasa penjelasan/metadata pengguna | `User.nativeLanguage` | `id` |
| `explanationLocale` | Bahasa penjelasan soal yang dipilih | Turunan `nativeLanguage` | `id` |
| `htmlLang` | Nilai atribut `lang` HTML | Turunan `uiLocale` | `ja` untuk `jp` |
| `textDirection` | Arah layout | Turunan `uiLocale` | `rtl` untuk `ar` |
| `framework` | Kerangka level kurikulum | Konten | `JLPT`, `CEFR` |
| `curriculumLevel` | Level pengguna dalam framework | `User.curriculumLevel` | `N3`, `B1` |
| `curriculum` | Satu program bahasa+framework+versi | DB | `ja-jlpt-2026.11` |
| `lesson` | Unit belajar terkecil yang diselesaikan | DB | `ja-jlpt-n5-u01-l03` |
| `question` | Satu soal dalam pelajaran | DB | `ja-jlpt-n5-u01-l03-q0042` |
| `item` | Bahan pembangun soal (kata, kanji, grammar point) | Authoring | `学生` |
| `contentVersion` | Versi immutable dari satu set konten | DB/manifest | `2026.11.0` |
| `availability` | Status ketersediaan kurikulum | Registry/API | `full`, `beta`, `preview`, `none` |

### 4.2 Kode kanonik dan alias

**Kode kanonik** yang dipakai di database, API, dan konten:

```ts
export const LANGUAGE_CODES = [
  "en", "es", "id", "ja", "hi", "de", "ar", "fr", "pt", "it", "nl", "ko",
] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];
```

| Rute UI | Kode konten | Endonym | English | `htmlLang` | `dir` | `speechLocale` | Framework |
|---|---|---|---|---|---|---|---|
| `en` | `en` | English | English | `en` | `ltr` | `en-US` | CEFR |
| `es` | `es` | Español | Spanish | `es` | `ltr` | `es-ES` | CEFR |
| `id` | `id` | Bahasa Indonesia | Indonesian | `id` | `ltr` | `id-ID` | CEFR |
| `jp` | `ja` | 日本語 | Japanese | `ja` | `ltr` | `ja-JP` | JLPT |
| `hi` | `hi` | हिन्दी | Hindi | `hi` | `ltr` | `hi-IN` | CEFR |
| `de` | `de` | Deutsch | German | `de` | `ltr` | `de-DE` | CEFR |
| `ar` | `ar` | العربية | Arabic | `ar` | `rtl` | `ar-SA` | CEFR |
| `fr` | `fr` | Français | French | `fr` | `ltr` | `fr-FR` | CEFR |
| `pt` | `pt` | Português | Portuguese | `pt` | `ltr` | `pt-BR` | CEFR |
| `it` | `it` | Italiano | Italian | `it` | `ltr` | `it-IT` | CEFR |
| `nl` | `nl` | Nederlands | Dutch | `nl` | `ltr` | `nl-NL` | CEFR |
| `ko` | `ko` | 한국어 | Korean | `ko` | `ltr` | `ko-KR` | CEFR |

**Alias rute yang diterima (redirect permanen):**

| Input | Tujuan | Status |
|---|---|---|
| `/ja/...` | `/jp/...` | `308` |
| `/in/...` | `/id/...` | `308` |
| `/en-US/...` | `/en/...` | `308` |
| `/pt-BR/...` | `/pt/...` | `308` |

Aturan:

- `jp` **tidak boleh** muncul di API, database, `contentLanguage`, atau `speechLocale`.
- `ja` **tidak boleh** dipakai sebagai segmen rute publik.
- Kode tidak dikenal: rute → `404`; API → `400 INVALID_LOCALE`/`INVALID_LANGUAGE`.
- Jangan menerima locale dari query `?lang=` untuk mengganti UI; URL path adalah satu-satunya otoritas.

### 4.3 Framework dan level

| Framework | Bahasa | Level | Catatan |
|---|---|---|---|
| JLPT | `ja` | `N5`, `N4`, `N3`, `N2`, `N1` | N5 paling dasar; N1 paling tinggi |
| CEFR | `en, id, es, fr, de, pt, it, nl, ko, hi, ar` | `A1`, `A2`, `B1`, `B2`, `C1` | C2 di luar scope |

`curriculumLevel` harus cocok dengan framework target. Contoh: `targetLanguage=ja` + `curriculumLevel=B1` → `400 INVALID_LEVEL_FOR_FRAMEWORK`. `targetLanguage=en` + `curriculumLevel=N3` → error yang sama.

### 4.4 Aturan bahasa (normatif)

- **R-1** — Teks UI selalu dari `uiLocale`; tidak pernah dari `contentLanguage`.
- **R-2** — Teks soal, pilihan, dan audio selalu dari `contentLanguage`.
- **R-3** — Penjelasan memakai rantai `nativeLanguage → uiLocale (jika didukung) → en`; jika fallback, tampilkan notice terlokalisasi.
- **R-4** — Tidak ada fallback konten lintas bahasa. Kurikulum tidak tersedia = empty state, bukan konten bahasa lain.
- **R-5** — `jp` adalah alias rute; konten/API memakai `ja`.
- **R-6** — Semua pemetaan locale ada di satu modul (`app/lib/i18n/locales.ts` + `paths.ts`); tidak ada mapping lokal di komponen.
- **R-7** — Semua tautan internal memakai helper `localizedHref(locale, path)`; tidak ada `href="/learn"`.
- **R-8** — `<html lang>` dan `dir` diturunkan dari `uiLocale` di root layout.
- **R-9** — Setiap teks konten diberi `lang={contentLanguage}` agar font fallback, screen reader, dan bidi benar.
- **R-10** — Ganti `uiLocale` tidak pernah menulis `targetLanguage`; ganti `targetLanguage` tidak pernah menulis URL.
- **R-11** — Preferensi disimpan sebelum navigasi; tidak ada optimistically-changing URL yang bisa gagal.
- **R-12** — Konten memakai ID stabil dan `contentVersion`; soal yang di-retire tidak dihapus, hanya tidak dikirim ke learner baru.

---

## 5. Ruang Lingkup & Ketersediaan

### 5.1 In scope

- Bagian profil “Bahasa & wilayah”: bahasa tampilan, bahasa belajar, level, bahasa penjelasan, zona waktu, toggle sinkron.
- Persistensi `uiLocale` ke akun + cookie; sinkronisasi login/onboarding.
- Routing locale: switch path, alias, redirect, precedence, 404.
- Registry 12 bahasa + status ketersediaan + API.
- Skema konten kurikulum (DB), impor, versi, QA, dan API baca.
- Kurikulum Jepang JLPT N5–N1 (≥10.500 soal; 300 pelajaran).
- Kurikulum Inggris CEFR A1–C1 (≥10.500 soal; 300 pelajaran).
- Jalur konten 10 bahasa lain (gelombang; target akhir sama).
- Level-aware onboarding dan progress.
- i18n UI 12 locale (bertahap), RTL Arab, font CJK/Arab/Devanagari.
- SEO/metadata, aksesibilitas, analytics, pengujian, dan CI jumlah soal.

### 5.2 Out of scope

- Menambah bahasa baru atau sertifikasi baru.
- Soal resmi/ujian JLPT tiruan yang diklaim resmi.
- CMS guru, marketplace konten pihak ketiga.
- Adaptive testing, IRT, atau AI generation saat learner mengerjakan soal.
- Offline download, mobile app native.
- Terjemahan penuh halaman marketing ke 12 bahasa pada rilis pertama.
- Perubahan pada live session/tutor marketplace.

### 5.3 Status ketersediaan

| Status | Definisi | Label UI |
|---|---|---|
| `full` | 10.500 soal terbit, 300 lesson, 5 level, 100% review/sign-off | “Tersedia” |
| `beta` | 2.100–10.499 soal, minimal 1 level penuh | “Beta · {{count}} soal” |
| `preview` | 175–2.099 soal, minimal 1 unit | “Pratinjau · {{count}} soal” |
| `none` | < 175 soal terbit | “Segera hadir” + alasan |

Aturan UI:

- `full` boleh masuk dashboard utama dan direkomendasikan.
- `beta`/`preview` boleh dipilih, dengan badge dan catatan cakupan.
- `none` tetap terlihat di daftar (agar transparan), tetapi tidak bisa memulai pelajaran; tampilkan CTA “Beri tahu saya” atau “Lihat bahasa lain”.
- Jangan pernah menampilkan kurikulum `none` sebagai kosong tanpa penjelasan.

### 5.4 Matriks 12 bahasa

| Bahasa | Framework | Gelombang konten | Target soal | Pelajaran | Status target |
|---|---|---|---|---|---|
| Jepang (`ja`) | JLPT N5–N1 | A | 10.500 | 300 | Full |
| Inggris (`en`) | CEFR A1–C1 | A | 10.500 | 300 | Full |
| Indonesia (`id`) | CEFR A1–C1 | B | 10.500 | 300 | Beta → Full |
| Spanyol (`es`) | CEFR A1–C1 | B | 10.500 | 300 | Beta → Full |
| Prancis (`fr`) | CEFR A1–C1 | B | 10.500 | 300 | Beta → Full |
| Jerman (`de`) | CEFR A1–C1 | B | 10.500 | 300 | Beta → Full |
| Portugis (`pt`) | CEFR A1–C1 | C | 10.500 | 300 | Preview → Full |
| Italia (`it`) | CEFR A1–C1 | C | 10.500 | 300 | Preview → Full |
| Belanda (`nl`) | CEFR A1–C1 | C | 10.500 | 300 | Preview → Full |
| Korea (`ko`) | CEFR A1–C1 | C | 10.500 | 300 | Preview → Full |
| Hindi (`hi`) | CEFR A1–C1 | C | 10.500 | 300 | Preview → Full |
| Arab (`ar`) | CEFR A1–C1 | C | 10.500 | 300 | Preview → Full |
| **Total** | | | **126.000** | **3.600** | |

### 5.5 Matriks kelengkapan UI locale

| Gelombang | Locale | Status | Catatan |
|---|---|---|---|
| A | `en`, `id`, `jp` | Full | Semua namespace 100%; baseline |
| B | `es`, `fr`, `de`, `pt`, `it`, `nl` | Full | Perlu terjemahan `learning` + `settings` + `curriculum` |
| C | `hi`, `ar`, `ko` | Minimal + audit RTL/script; full setelah v1 | Arab RTL, Devanagari, Hangul; font khusus |

Sampai status `full` tercapai, locale B/C boleh tampil dengan badge **“Beta terjemahan”** dan notice satu baris; fallback hanya untuk UI, tidak untuk konten.

---

## 6. Information Architecture & Alur

### 6.1 Peta layar

```
/[lang]                              marketing publik
/[lang]/sign-in                      auth
/[lang]/onboarding                   pilih bahasa + level + goal
/[lang]/learn                        dashboard belajar (shell yang ada)
   └── module: curriculum            kartu “Kurikulum”
         ├── pilih bahasa/level      dari profil atau dashboard
         ├── lesson list             per level
         ├── lesson view             tujuan + penjelasan
         └── practice                soal + feedback + hasil
/[lang]/profile                      profil
   └── #bahasa                       “Bahasa & wilayah”
```

Catatan implementasi:

- Untuk fase ini, state kurikulum dapat hidup di dalam `/[lang]/learn` yang sudah ada (module + query `?course=ja&level=n5&lesson=...`), bukan menambah route tree baru. Nested route dapat dipertimbangkan di P3 jika bookmark/SEO privat menuntut.
- Query state **wajib** dipertahankan saat ganti locale.
- Tidak ada route publik untuk lesson; area belajar tetap private (`noindex`).

### 6.2 Alur ganti bahasa tampilan

```
[Profil /jp/profile]
  │ pilih “Bahasa Indonesia”
  ▼
[Client] validasi UI_LOCALES + path baru
  │ set pending, disable control
  ▼
[PATCH /api/v1/me { uiLocale: "id" }]
  │ server: auth → validasi → update User.uiLocale → set cookie
  ▼
[200 OK]
  │ i18n.changeLanguage("id")
  │ router.replace("/id/profile", { scroll: false })
  ▼
[Root layout] html lang="id" dir="ltr"
[Toast + aria-live] “Bahasa tampilan diubah ke Bahasa Indonesia.”
```

Kasus gagal:

- `401` → arahkan ke sign-in dengan `next` path saat ini.
- `400` → select kembali ke nilai sebelumnya; tampilkan pesan dari `error.code`.
- Jaringan/timeout (>10 detik) → rollback; tombol “Coba lagi”.
- Jangan pernah mengubah URL jika server belum mengonfirmasi.

### 6.3 Alur ganti bahasa belajar

```
[Profil #bahasa]
  │ pilih “日本語”
  ▼
[Tampilkan] framework JLPT; level N5–N1; estimasi 10.500 soal
  │ pilih level (default N5 jika sebelumnya CEFR)
  ▼
[PATCH /api/v1/me { targetLanguage: "ja", curriculumLevel: "N5" }]
  │ URL TIDAK berubah
  ▼
[Dashboard] chip “Belajar: 日本語”
  │ jika toggle “Samakan bahasa” ON → ikuti alur 6.2 ke /jp
  ▼
[Kurikulum] level N5, lesson list, progress bahasa Jepang
```

- Jika pengguna sudah punya progres di bahasa lama, tampilkan catatan: “Progres bahasa sebelumnya tetap tersimpan.”
- Jika level lama tidak valid untuk framework baru (mis. `B1` → `ja`), reset ke default dan beri notice; jangan hapus progres.
- Jika kurikulum `none`, tetap simpan pilihan, tetapi dashboard menampilkan empty state.

### 6.4 Alur URL tanpa locale

Precedence:

1. Jika URL punya locale valid → pakai itu (otoritas).
2. `User.uiLocale` jika sesi diketahui. Proxy tidak query DB; rekonsiliasi dilakukan sekali di layout ber-sesi ketika locale berasal dari cookie/Accept-Language.
3. Cookie `lango_locale` (jika ada).
4. `Accept-Language` (parse q-values).
5. `en`.

Implementasi precedence tanpa DB di proxy:

- `proxy.ts` menetapkan `x-lango-locale` dan `x-lango-locale-source` (`path` | `cookie` | `accept`).
- Layout `learn`, `profile`, dan `onboarding` membaca sesi; jika `source !== "path"`, `user.uiLocale` valid, dan berbeda, redirect sekali ke `/${user.uiLocale}${rest}` (query dipertahankan) sambil menyegarkan cookie.
- Setelah redirect, `source="path"`, sehingga tidak ada loop dan deep link eksplisit tetap menang.
- Root `/` memakai sesi langsung; tanpa sesi memakai cookie/Accept-Language.

Contoh:

| Request | Kondisi | Hasil |
|---|---|---|
| `/learn` | cookie `id`, tanpa sesi | `302 /id/learn` |
| `/learn` | login, `uiLocale=jp`, cookie `en` | `302 /jp/learn` (rekonsiliasi layout) |
| `/` | login, `uiLocale=id` | `302 /id/learn` |
| `/` | tanpa sesi, `Accept-Language: ja-JP,en;q=0.8` | `302 /jp` |
| `/id/learn` | login, `uiLocale=jp` | tetap `/id/learn` (URL menang, source=path) |
| `/xx/learn` | apa pun | `404` |

### 6.5 Wireframe profil

```
┌─ Profil & pengaturan ────────────────────────────────────────┐
│  [Kembali belajar]                                           │
│                                                              │
│  ┌─ Bahasa & wilayah ─────────────────────────────────────┐  │
│  │ Bahasa tampilan                                      ▾ │  │
│  │ 🇮🇩 Bahasa Indonesia                                     │  │
│  │ Berlaku untuk menu, tombol, dan pesan.                  │  │
│  │                                                         │  │
│  │ Bahasa yang dipelajari                               ▾ │  │
│  │ 🇯🇵 日本語 · JLPT N5–N1 · 10.500 soal · 300 pelajaran    │  │
│  │                                                         │  │
│  │ Level saat ini                                       ▾ │  │
│  │ N3                                                      │  │
│  │                                                         │  │
│  │ Bahasa penjelasan                                    ▾ │  │
│  │ Bahasa Indonesia                                        │  │
│  │                                                         │  │
│  │ Zona waktu                                           ▾ │  │
│  │ Asia/Jakarta (WIB)                                      │  │
│  │                                                         │  │
│  │ [ ] Samakan bahasa tampilan dengan bahasa yang dipelajari│ │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Akun ──────────────────────────────────────────────────┐  │
│  │ ...                                                     │  │
│  └─────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 6.6 Chip bahasa di navbar

```
┌──────────────────────────────────────────────┐
│ 日本語 ▾                                     │
├──────────────────────────────────────────────┤
│ Bahasa tampilan                              │
│  ◉ English   ○ Bahasa Indonesia   ○ 日本語    │
│  ○ Español   ○ Français          ○ Deutsch   │
│  ... (12 locale)                             │
│                                              │
│ Belajar: 🇯🇵 日本語 (JLPT N5–N1)             │
│ [Ubah di profil →]                           │
└──────────────────────────────────────────────┘
```

- Chip menampilkan `uiLocale` (endonym) dan, jika berbeda, `contentLanguage` dengan label “Antarmuka: 日本語 · Belajar: English”.
- Klik bahasa tampilan memakai alur 6.2 (bukan hanya `i18n.changeLanguage`).
- Di mobile, chip harus tersedia di menu (saat ini hanya `md:flex`).

### 6.7 State machine preferensi

```
idle ──select──> saving ──200──> success ──navigate──> idle
                   │
                   ├──4xx/5xx/timeout──> error ──retry──> saving
                   └──401──> redirect sign-in
```

Aturan:

- Selama `saving`, control disabled + spinner + `aria-busy`.
- `success` menampilkan toast dan `aria-live="polite"`.
- `error` mengembalikan nilai select ke nilai sebelumnya; jangan biarkan UI menampilkan nilai yang tidak tersimpan.
- Cegah double submit dengan idempotency di client (satu request aktif).

### 6.8 Dirty-state guard

- Jika form password di profil sedang terisi, mengganti bahasa menampilkan dialog konfirmasi: “Perubahan password yang belum disimpan akan hilang. Ganti bahasa?” dengan aksi “Ganti bahasa”/“Batal”.
- Jika tidak ada input, langsung ganti.
- Dialog harus accessible (focus trap, Escape, label).

---

## 7. Persyaratan Fungsional

### FR-01 — Preferensi locale akun & cookie

- Tambah `User.uiLocale String @default("en")` dengan validasi 12 locale.
- Setiap perubahan `uiLocale` harus:
  1. update DB,
  2. set cookie `lango_locale` (`httpOnly`, `secure` di production, `sameSite=lax`, `path=/`, `maxAge=31536000`),
  3. mengembalikan `uiLocale` di respons.
- Cookie adalah **cache** preferensi akun, bukan sumber utama saat sesi aktif.
- Proxy hanya menetapkan `x-lango-locale` + `x-lango-locale-source`; rekonsiliasi akun dilakukan di layout ber-sesi (lihat 6.4) agar tidak ada query DB di edge/proxy.
- Sinkronisasi cookie wajib terjadi saat: login, register, onboarding selesai, `PATCH /api/v1/me`, dan redirect locale tanpa sesi.
- Jangan memakai `localStorage` sebagai satu-satunya sumber; boleh sebagai cache UI sementara.
- Tambahkan `uiLocale` ke `SessionUser`/`PublicUser` dan query `getSessionUser`/`getSessionContext` agar Server Component profil dan layout tidak perlu query tambahan.
- Jika `User.uiLocale` tidak valid (data legacy), fallback ke `en` dan catat warning; jangan crash.
- Cookie tidak boleh dibaca oleh skrip pihak ketiga (httpOnly) dan tidak berisi PII.

**Acceptance:** login di perangkat baru → `/` mengarah ke locale akun; hapus cookie → login lagi → locale akun tetap; `PATCH` mengubah DB dan `Set-Cookie`.

### FR-02 — URL, switching, dan navigasi locale

- Buat helper tunggal:

```ts
export function localizedHref(locale: UiLocale, path: string): string;
export function switchLocaleInPath(pathname: string, next: UiLocale): string;
export function isUiLocale(value: string): value is UiLocale;
export function toContentLanguage(locale: string): LanguageCode;
export function toHtmlLang(locale: string): string;
export function toTextDirection(locale: string): "ltr" | "rtl";
```

- `switchLocaleInPath` hanya mengganti segmen pertama; tidak boleh memakai `String.replace` pada seluruh path.
- Pertahankan query string dan hash persis; jangan menambah/menghapus parameter.
- Gunakan `router.replace(href, { scroll: false })` untuk perubahan preferensi; jangan `window.location.assign` (kecuali logout).
- Path yang tidak valid setelah switch (mis. path privat yang tidak ada untuk locale baru) → fallback ke `/${locale}/learn` dan catat event.
- Alias rute `ja`→`jp`, `in`→`id`, `en-US`→`en`, `pt-BR`→`pt` di proxy; pertahankan query.
- Unknown locale → `404`; jangan redirect ke `en` (menyembunyikan tautan rusak).
- Semua tautan internal di area belajar/profil memakai `localizedHref`; tambahkan lint rule/pemeriksaan `grep` di CI.
- Switcher header dan profil memakai komponen yang sama (`LocaleSwitcher`); hapus implementasi `window.location.pathname.replace`.
- Untuk pengguna anonim, switcher hanya menulis cookie `lango_locale` lewat `POST /api/v1/locale` dan bernavigasi; jangan memanggil `PATCH /me` atau menampilkan error auth. Komponen menerima prop `isAuthenticated` dari server.
- Tambahkan switcher ke menu mobile.
- Jangan pernah mengubah URL dari dalam `useEffect` yang dipicu data profil; hanya dari aksi pengguna atau redirect server.

**Acceptance:** `/jp/learn?tab=grammar#x` + pilih `id` → `/id/learn?tab=grammar#x`; `/ja/learn` → `308 /jp/learn`; `/xx/learn` → `404`; tidak ada full page reload.

### FR-03 — Bagian profil “Bahasa & wilayah”

- Letakkan section di atas “Akun”, dengan anchor `#bahasa`.
- Field:

| Field | Tipe | Opsi | Perilaku |
|---|---|---|---|
| Bahasa tampilan | Select | 12 locale; endonym + flag | Simpan lalu navigasi (FR-02) |
| Bahasa yang dipelajari | Select | 12 bahasa; badge availability + jumlah soal | Simpan; URL tidak berubah |
| Level saat ini | Select | `N5–N1` untuk `ja`; `A1–C1` lainnya | Simpan; reset jika tidak valid |
| Bahasa penjelasan | Select | `en`, `id`, `ja` (fase awal) | Simpan; fallback notice |
| Zona waktu | Select/search | IANA timezone | Simpan |
| Samakan bahasa | Toggle | on/off, default off | Jika on, ganti target ikut ganti UI |

- Label dan helper text dari i18n; tidak ada string hardcoded.
- Opsi bahasa menampilkan endonym dan label Inggris di sisi kanan (opsional, untuk orientasi).
- Opsi `availability=none` tetap tampil, tetapi disabled dengan alasan “Kurikulum belum tersedia”; atau dapat dipilih tetapi tidak bisa memulai pelajaran. Pilih salah satu dan konsisten; rekomendasi: **boleh dipilih** agar preferensi tersimpan, tetapi CTA belajar disabled.
- Jika `nativeLanguage` berada di luar `en`/`id`/`ja`, tampilkan nilainya dengan badge “Penjelasan belum tersedia” dan fallback ke `en`; jangan mengubah `nativeLanguage` diam-diam.
- Setiap perubahan disimpan otomatis (tanpa tombol “Simpan bahasa”); tampilkan status “Menyimpan…”, “Tersimpan”, atau error.
- Jika `User.uiLocale` berbeda dari `uiLocale` URL (mis. deep link `/id/...` saat preferensi akun `jp`), select menampilkan locale URL yang aktif dan helper “Preferensi akun: 日本語”; jangan menimpa preferensi akun tanpa aksi pengguna.
- Jika `targetLanguage` berubah dan ada progres di bahasa lain, tampilkan catatan bahwa progres tetap ada.
- Jika `curriculumLevel` berubah, jangan reset progres; hanya ubah level tampilan/dashboard.
- Jika `uiLocale` berubah saat form password dirty, jalankan dialog konfirmasi (6.8).
- Semua control minimal 44×44 px; label terhubung via `htmlFor`; helper via `aria-describedby`.
- Gunakan token warna `bg-surface`, `border-default`, `text-primary`, `text-muted`, `accent-primary`; jangan raw hex.
- Mobile: satu kolom, select full-width, sticky toast tidak menutup control.

**Acceptance:** semua field tampil, dapat diubah, persist setelah reload, dan error rollback.

### FR-04 — Pemisahan UI dan pembelajaran

- Mengganti bahasa tampilan **tidak boleh** menyentuh `targetLanguage`, `curriculumLevel`, atau `nativeLanguage`.
- Mengganti bahasa belajar **tidak boleh** mengubah `uiLocale` kecuali toggle “Samakan bahasa” aktif.
- Jika `uiLocale` ≠ bahasa dari `targetLanguage`, tampilkan chip mismatch di navbar: “Antarmuka: X · Belajar: Y” + tautan ke profil.
- Jangan menyimpulkan bahasa belajar dari URL. Membuka `/jp/learn` tidak berarti pengguna belajar Jepang.
- Untuk pengguna baru tanpa target eksplisit: tawarkan satu klik “Belajar {{language}}?” berdasarkan locale, tetapi jangan menulis profil tanpa konfirmasi (lanjutan FS-07 FR-03).
- Toggle “Samakan bahasa” harus dihormati saat target berubah: `ja` → route `jp`; `en` → `en`; dst.
- Jika target adalah `ja` dan UI `jp`, chip tidak menampilkan mismatch.
- Jika target belum punya kurikulum, tampilkan empty state + CTA “Ganti bahasa belajar” dan “Lihat kurikulum yang tersedia”.
- Tidak ada fallback konten otomatis ke `en`; `resolveContentLanguage` hanya fallback untuk nilai **invalid**, bukan untuk bahasa valid yang belum punya kurikulum.

**Acceptance:** switch UI di `/jp/learn` dengan target `ja` tetap menampilkan konten Jepang; switch target ke `en` di `/id/learn` tetap ber-URL `/id/learn` dan menampilkan konten Inggris.

### FR-05 — Registry bahasa & ketersediaan

- Satu registry di `app/lib/i18n/registry.ts` (atau `app/lib/learning/languages.ts`) untuk 12 bahasa:

```ts
export interface LanguageSupport {
  code: LanguageCode;
  routeLocale: UiLocale;
  label: string;        // endonym
  englishLabel: string;
  flag: string;
  htmlLang: string;
  dir: "ltr" | "rtl";
  speechLocale: string;
  framework: "JLPT" | "CEFR";
  levels: string[];
  status: "full" | "beta" | "preview" | "none"; // deklarasi target; API adalah sumber final
  questionCount: number;                        // snapshot build; API adalah sumber final
  lessonCount: number;                          // snapshot build; API adalah sumber final
  variant?: string;      // en-US, pt-BR, ar-MSA
}
```

- Registry statis memuat metadata; **jumlah soal** diambil dari DB/API agar tidak drift.
- Hapus daftar duplikat di `app/utils/flags.ts`, `onboarding-form.tsx`, dan `header.tsx`; semua membaca registry.
- Tambah `GET /api/v1/languages` (publik, cache) yang mengembalikan `uiLocales` + `learningLanguages` + availability + counts.
- Status dihitung dari soal `published`, bukan draft.
- `bn`/Bengali di `languagesList` harus dihapus atau ditandai tidak didukung; jangan klaim 13 bahasa jika hanya 12 yang punya jalur konten.
- Registry harus aman diimpor server dan client (tanpa `server-only`).

**Acceptance:** semua daftar bahasa di aplikasi berasal dari registry; menambah satu bahasa = satu entri + terjemahan, bukan edit 5 file.

### FR-06 — Kurikulum Jepang JLPT N5–N1

- Framework: JLPT; level: `N5`, `N4`, `N3`, `N2`, `N1`.
- Struktur per level: **12 unit × 5 pelajaran = 60 pelajaran**; setiap pelajaran ±35 soal; total 2.100 soal/level; **10.500 soal** dan **300 pelajaran**.
- Distribusi soal per level:

| Skill | Soal/level | Cakupan |
|---|---|---|
| Kosakata | 620 | kata, kolokasi, konteks kalimat |
| Kanji | 400 | cara baca, okurigana, pemakaian |
| Tata bahasa | 480 | pola, partikel, konjugasi, urutan |
| Membaca | 320 | teks pendek–panjang, pemahaman |
| Mendengar | 280 | audio + transkrip + pertanyaan |
| **Total** | **2.100** | |

- Tipe soal: `multiple_choice`, `fill_blank`, `ordering`, `matching`, `kanji_reading`, `reading_comprehension`, `listening_comprehension`, `correction`.
- Setiap level punya `Passage` untuk membaca/mendengar; soal berbagi passage, bukan menduplikasi teks.
- Kanji/verba/grammar harus mengikuti **level whitelist** (lihat FR-10); N5 tidak boleh memakai kanji N1.
- N5/N4 menyediakan furigana opsional pada kata sulit; N1 tidak.
- Audio listening: pra-generate TTS/voice talent, simpan di Blob, transkrip tersedia, kontrol putar/ulang dan kecepatan 0,8×/1×.
- Penjelasan minimal dalam `id` dan `en`; `ja` untuk mode imersif. Jika belum ada, fallback dengan notice.
- Deskripsi level (untuk onboarding/dashboard):

| Level | Deskripsi | Perkiraan kosakata/kanji |
|---|---|---|
| N5 | Kalimat dasar, kehidupan sehari-hari | ~800 kata / ~100 kanji |
| N4 | Percakapan sehari-hari, teks sederhana | ~1.500 / ~300 |
| N3 | Topik familiar, teks menengah | ~3.700 / ~650 |
| N2 | Topik luas, teks surat kabar | ~6.000 / ~1.000 |
| N1 | Topik abstrak, teks kompleks | ~10.000 / ~2.000 |

> Angka kosakata/kanji adalah **target perencanaan yang lazim**, bukan klaim resmi JLPT. Konten adalah original dan **tidak berafiliasi** dengan JLPT.

**Acceptance:** `GET /api/v1/curricula/ja` melaporkan 5 level, 60 lesson/level, 2.100 soal/level, 10.500 total; semua soal published punya penjelasan; semua listening punya audio.

### FR-07 — Kurikulum Inggris CEFR A1–C1

- Framework: CEFR; level: `A1`, `A2`, `B1`, `B2`, `C1`; 60 pelajaran/level; 2.100 soal/level; **10.500 soal**, **300 pelajaran**.
- Distribusi soal per level:

| Skill | Soal/level |
|---|---|
| Kosakata | 450 |
| Tata bahasa | 600 |
| Membaca | 400 |
| Mendengar | 350 |
| Use of English | 300 |
| **Total** | **2.100** |

- Konten baru memakai **ID baru**. 60 pelajaran Grammar legacy dipetakan lewat `ContentMigrationMap`; hanya 40 latihan A1–B1 yang lolos review boleh diimpor ulang dengan ID baru; 2.112 placeholder B2/C1 **tidak diimpor**.
- Progress `LessonProgress` dipetakan ke lesson baru; `ExerciseAttempt` ikut dipetakan hanya untuk latihan yang diimpor ulang. Attempt placeholder yang tidak dipetakan tetap tersimpan sebagai riwayat read-only, tidak dihitung di statistik baru.
- Rebalance: distribusi lesson saat ini tidak seimbang — A1 4, A2 3, B1 3, B2 25, C1 25 — sehingga A1–B1 perlu ditambah agar tercapai 60 lesson/level.
- Variasi: `en-US` untuk ejaan/audio utama; catatan ejaan `en-GB` bila relevan.
- Listening memakai audio pra-generate; reading memakai passage original.
- Explanation locale: `id`, `en`; `ja` hanya untuk konten Jepang. Minimal `id` + `en` pada rilis.
- Tidak ada klaim resmi TOEFL/IELTS; CEFR-aligned.

**Acceptance:** 10.500 soal published, 300 pelajaran, progress Grammar lama tetap dapat dibuka.

### FR-08 — Kurikulum 10 bahasa lain

- Semua memakai skema dan pipeline yang sama; framework CEFR A1–C1; 60 pelajaran/level; 2.100 soal/level; 10.500 soal/300 pelajaran.
- Kekhususan bahasa:

| Bahasa | Kekhususan konten |
|---|---|
| `id` | Tanpa kanji; fokus afiks, imbuhan, register formal/santai |
| `es` | Gender, konjugasi, `ser/estar`; variasi `es-ES` dengan catatan Latin American |
| `fr` | Gender, konjugasi, liaison; `fr-FR` |
| `de` | Kasus, genus, Wortstellung; `de-DE` |
| `pt` | `pt-BR`; konjugasi, pronomina |
| `it` | Gender, konjugasi, artikula; `it-IT` |
| `nl` | Urutan kata, `de/het`; `nl-NL` |
| `ko` | Hangul, honorifik, partikel; CEFR mapping (TOPIK di luar scope) |
| `hi` | Devanagari, gender/verb agreement; transliterasi opsional |
| `ar` | RTL, MSA (`ar-MSA`), root pattern; transliterasi Latin untuk pemula |

- Untuk `ar`, UI konten (prompt/passage) harus `dir="rtl"`; pilihan jawaban campuran diberi `bidi-isolate`.
- Untuk `hi`/`ko`/`ja`, font khusus dan line-height lebih tinggi.
- Status rilis mengikuti matriks 5.4; jangan rilis `full` sebelum 10.500 soal + review.
- Machine translation tidak boleh dipublikasikan tanpa review penutur asli.

**Acceptance:** 12 bahasa muncul di registry; yang `none` menampilkan empty state; yang `beta` menampilkan badge + count; tidak ada fallback.

### FR-09 — Model konten, versi, dan ID

- Buat tabel konten baru; **jangan** memakai model `Exercise`/`Choice` mock yang terikat `DailyChallenge`.
- ID stabil dan tidak pernah dipakai ulang:

```
curriculum: ja-jlpt
level:      ja-jlpt-n5
lesson:     ja-jlpt-n5-u01-l03
question:   ja-jlpt-n5-u01-l03-q0042
passage:    ja-jlpt-n5-p0007
```

- `contentVersion` semver (`2026.11.0`); satu rilis konten immutable.
- Status: `draft → in_review → published → retired`; learner hanya melihat `published`.
- Jangan hard-delete soal yang sudah punya attempt; set `retired`.
- Progress/attempt tetap merujuk ID stabil; ganti versi tidak menghapus progres.
- Simpan `answerKey` di server; DTO learner **tidak boleh** memuat `answerKey`, `isCorrect`, atau `explanation` sebelum submit.
- Simpan `fingerprint` unik untuk dedupe (normalisasi prompt+answer+level).
- Simpan `source`, `license`, `reviewedBy`, `reviewedAt`, `difficulty`, `tags`, `skill`, `type`.
- `QuestionLocalization` menyimpan prompt/penjelasan per locale support; fallback eksplisit.
- Tambah `languageCode` denormalized di `LessonProgress`/`ExerciseAttempt` untuk filter dashboard dan index.

**Acceptance:** impor dua kali tidak membuat duplikat; ID sama menghasilkan update idempoten; DTO soal tidak membocorkan jawaban.

### FR-10 — Pipeline authoring, QA, dan publish

- Sumber authoring: `content/curricula/{language}/{framework}/{level}/*.json` (atau format setara) yang tervalidasi Zod.
- Pipeline:

```
blueprint → generate/draft → automated QA → human review
→ import (idempotent) → publish contentVersion → monitor
```

- **Tidak ada** generasi soal AI saat learner mengerjakan; AI hanya boleh membantu authoring offline dan wajib review.
- Automated QA minimal:
  1. Skema JSON valid; ID unik; fingerprint unik.
  2. Bahasa prompt sesuai target (language ID); rasio teks target ≥90%.
  3. Tepat satu jawaban benar untuk MCQ; pilihan tidak duplikat; tidak ada jawaban di prompt.
  4. Kanji/kosakata/grammar sesuai whitelist level JLPT.
  5. Panjang passage/script sesuai level; audio ada dan durasi wajar.
  6. Penjelasan ada dan bukan placeholder.
  7. Deteksi duplikat similaritas (SimHash/embedding) <0,9.
  8. Tidak ada konten sensitif/ilegal; moderation.
- Human review:
  - 100% lesson objective, explanation, dan passage.
  - 100% soal N1/N2 dan C1.
  - Sampel acak ≥20% soal N3–N5/A1–B2; jika defect rate >2%, review 100%; >5% tolak level.
  - Penutur asli per bahasa menandatangani `reviewedBy`.
- Publish:
  - `manifest.json` berisi jumlah per level/skill, versi, status, reviewer.
  - `scripts/check-curriculum.mjs` memverifikasi manifest vs DB; gagal CI jika di bawah threshold.
  - Soal `retired` tidak dihitung.
- Monitoring:
  - p-value per soal (target 0,2–0,9); soal terlalu mudah/sulit di-flag.
  - report rate, skip rate, time-on-question.
  - Review ulang soal dengan p-value ekstrem setelah ≥30 attempt.

**Acceptance:** CI menolak rilis jika count < target, duplikat >0,5%, audio/penjelasan hilang, atau fingerprint duplikat.

### FR-11 — Level, progress, dan resume

- `User.curriculumLevel` menyimpan level aktif; validasi terhadap framework target.
- Level awal: dari onboarding (pilihan manual). Placement test adaptif di luar scope.
- Progress per pelajaran memakai `LessonProgress` (unique `userId+lessonId`); attempt memakai `ExerciseAttempt`.
- Tambah `languageCode` denormalized + index `[userId, languageCode, status]`.
- Progress dihitung dari soal published; soal retired dikecualikan.
- Ganti UI locale tidak mengubah progress; ganti target language tidak menghapus progress bahasa lain.
- Ganti `curriculumLevel` tidak menghapus progress; dashboard hanya menampilkan level aktif, dengan akses ke level lain.
- Resume: simpan `currentExerciseIndex` setiap jawaban; setelah refresh/ganti locale, kembali ke soal terakhir.
- Selesaikan pelajaran: semua soal terjawab; akurasi dihitung dari attempt terakhir per soal (mengikuti pola `lessons/[id]/complete`).
- XP/streak memakai `awardXp`/`touchStreak` yang ada; idempotency key mencegah double XP.
- Target level selesai: ≥80% pelajaran level dengan akurasi ≥80%; tampilkan badge, bukan kunci level berikutnya secara paksa.

**Acceptance:** jawab 12 soal, ganti UI locale, refresh → kembali ke soal 12; progress tidak reset; XP tidak dobel.

### FR-12 — Onboarding, auth, dan redirect

- Onboarding membaca registry 12 bahasa, bukan hardcode 6.
- Langkah bahasa menampilkan framework + level yang relevan:
  - `ja` → N5–N1 (default N5).
  - lainnya → A1–C1 (default A1, atau rekomendasi dari `uiLocale`).
- Simpan `targetLanguage` sebagai kode kanonik + `curriculumLevel`.
- Simpan `uiLocale` dari route saat onboarding selesai (jika valid).
- Copy onboarding dari i18n; tidak ada teks Indonesia hardcoded di komponen.
- Setelah onboarding: redirect ke `/${uiLocale}/learn` (bukan `/learn` mentah).
- Login/register:
  - Jika ada `next` same-origin dan valid → hormati.
  - Jika tidak → `/${user.uiLocale}/learn` (learner) atau `/${user.uiLocale}` (role lain).
- Root `/`:
  - Login → `/${user.uiLocale}/learn`.
  - Tanpa sesi → `/${cookie||acceptLanguage}`.
- Migration pengguna lama:
  - `targetLanguage` "Spanish" → `es`, "Japanese" → `ja`, "jp" → `ja`, dst.
  - `learningLanguage` legacy disinkronkan ke kode; jangan dipakai sebagai sumber baru.
  - `cefrLevel` → `curriculumLevel` (CEFR); untuk target `ja`, default `N5` dan tandai perlu konfirmasi.
  - `AppSettings.appLanguage` → `User.uiLocale`; fallback `en`.

**Acceptance:** onboarding `/id/onboarding` menyimpan `uiLocale=id`; memilih `ja` menampilkan N5–N1; redirect akhir `/id/learn`; tidak ada `"Japanese"` di DB.

### FR-13 — i18n UI, copy, dan 12 locale

- Semua string baru masuk namespace `settings`, `curriculum`, `languages`, `errors`.
- `en` adalah sumber kebenaran; `id`/`jp` wajib 100%; locale B/C wajib untuk namespace baru, lalu menyusul `learning`.
- Tambah tipe kunci (`app/locales/i18next.d.ts`) agar salah ketik = error TypeScript.
- Perluas `scripts/check-locales.mjs`:
  - locales = 12;
  - `en/id/jp` wajib 100% semua namespace;
  - locale B/C wajib `settings`, `curriculum`, `languages`, `common`, `errors`;
  - tidak ada nilai kosong;
  - nilai non-EN tidak identik dengan EN untuk kunci yang wajib diterjemahkan;
  - `learning` yang fallback harus tercatat di `app/locales/locale-meta.json`, bukan diam-diam.
- Fallback `fallbackLng: "en"` hanya untuk UI; konten tidak fallback.
- Perbaiki `I18nProvider` agar bahasa aktif diset **sebelum render pertama** (FS-07 FR-02); tanpa ini AC-14 (tidak ada flash EN) tidak mungkin lolos.
- Plural: `_one`/`_other`; Jepang/Indonesia/Korea hanya `_other`.
- Format angka/tanggal: `Intl.*` dengan locale; jangan `toLocaleString()` tanpa argumen.
- Nama bahasa selalu endonym di select; label Inggris opsional sebagai bantuan.
- Error API dipetakan dari `error.code` ke `errors.<code>`; fallback ke `error.message`.
- Tidak ada string user-facing literal di komponen baru; review PR menolak hardcode.

**Acceptance:** `npm run check:locales` lolos untuk aturan tier; `/ar/profile` tidak menampilkan kunci mentah; tidak ada flash EN.

### FR-14 — RTL, font, dan tipografi multi-script

- Root layout menetapkan `lang` dan `dir` dari header `x-lango-locale`:
  - `jp` → `lang="ja"`, `dir="ltr"`.
  - `ar` → `lang="ar"`, `dir="rtl"`.
  - `hi`/`ko` → `lang` sesuai, `ltr`.
- Ganti layout ke **logical properties** (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start/end`) di area profil, navbar, sidebar, dan form; audit komponen belajar.
- Ikon panah/chevron di RTL harus mirror; ikon media (play) tidak.
- Angka, kode, dan istilah teknis tetap LTR dengan `dir="ltr"`/`bdi`.
- Font:
  - Latin: Plus Jakarta Sans (UI), Lora (bacaan).
  - Jepang: Noto Sans JP.
  - Korea: Noto Sans KR.
  - Arab: Noto Sans Arabic.
  - Devanagari: Noto Sans Devanagari.
  - Muat hanya font locale aktif (`preload:false` untuk non-aktif); fallback stack aman.
- Line-height untuk CJK/Arab/Devanagari lebih longgar; jangan memotong glyph.
- Uji campuran: nama pengguna Latin di UI Arab, prompt Jepang di UI Indonesia, tombol Inggris di UI Jepang.
- Konten Arab (passage/soal) wajib `dir="rtl"`; arah blok konten tidak boleh dipaksa mengikuti arah UI bila berbeda.
- `lang` pada teks konten dan opsi bahasa agar screen reader berganti suara.

**Acceptance:** `/ar/learn` RTL penuh, tidak ada horizontal scroll 320px, teks Arab tidak terpotong; `/jp` memakai font Jepang.

### FR-15 — SEO, metadata, dan `hreflang`

- `generateMetadata` per locale memuat title/description terlokalisasi.
- `alternates.languages` untuk 12 locale + `x-default` (`en`), memakai URL rute (`/jp/...`) dengan kode bahasa (`ja`).
- Canonical per locale; jangan canonical ke `en`.
- Area privat (`learn`, `profile`, `onboarding`, `sign-in`) `robots: { index: false, follow: false }`.
- Jangan indeks query state `?lesson=`.
- OG locale mapping: `jp` → `ja_JP`, `id` → `id_ID`, `ar` → `ar_AR`, dst.
- Sitemap memuat locale yang valid; jangan memuat alias `ja`/`in`/`xx`.
- `html lang`/`dir` konsisten dengan metadata.
- 404 untuk locale tidak valid; jangan soft-404.
- Halaman marketing yang belum diterjemahkan penuh diberi `noindex` per locale atau status beta yang jelas; jangan duplikat konten EN di 12 URL tanpa nilai.

**Acceptance:** crawler melihat canonical + hreflang benar; `/id/learn` noindex; tidak ada hreflang ke `/ja/...`.

### FR-16 — Aksesibilitas

- Select bahasa punya `<label>` eksplisit, `aria-describedby` untuk helper, dan status pending `aria-busy`.
- Perubahan bahasa diumumkan via `aria-live="polite"`: “Bahasa tampilan diubah ke …”.
- Fokus setelah navigasi diarahkan ke heading section (`#bahasa`) atau control asal, bukan ke body.
- Keyboard: semua control dapat dioperasikan tanpa mouse; Escape menutup dialog/menu; focus trap di dialog konfirmasi.
- Target sentuh ≥44×44 px; kontras teks ≥4,5:1; status availability tidak hanya warna (ada teks).
- Opsi bahasa memakai `lang` masing-masing; screen reader tidak membaca “Japanese” dengan fonetik Indonesia.
- `prefers-reduced-motion`: toast/animasi tidak wajib.
- Form error: `role="alert"`, terhubung ke field, tidak hanya toast.
- RTL: urutan fokus dan posisi dialog benar.

**Acceptance:** keyboard-only dapat mengganti bahasa, menyimpan, dan kembali; axe tidak menemukan violation kritis di profil.

### FR-17 — Analytics & observability

Event tanpa PII:

| Event | Properti |
|---|---|
| `ui_locale_changed` | `from`, `to`, `surface` (`profile`/`header`), `path_bucket` |
| `learning_language_changed` | `from`, `to`, `framework`, `availability` |
| `curriculum_level_changed` | `language`, `from`, `to` |
| `curriculum_viewed` | `language`, `level`, `availability` |
| `curriculum_lesson_started` | `language`, `level`, `lesson_id` |
| `curriculum_question_answered` | `language`, `level`, `type`, `correct`, `time_ms` |
| `curriculum_empty_state_viewed` | `language`, `reason` |

- Log server: `requestId`, `userId` hash, `from`, `to`, status; jangan log email/PII.
- Dashboard: switch success rate, 404 per locale, empty-state rate, lesson completion per language/level, question p-value.
- Alert: `PATCH /me` 5xx >1% (5 menit), mismatch manifest vs DB, audio 404 >0,1%.

### FR-18 — Performa, caching, dan batas payload

- Ganti locale tidak boleh full reload; gunakan RSC navigation.
- `GET /api/v1/languages`: `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`.
- `GET /api/v1/curricula/:code`: `public, s-maxage=600, stale-while-revalidate=3600`.
- Lesson detail: `private, no-store` (ada progress); atau pisahkan progress dari konten dan cache konten.
- Jangan pernah mengirim 10.500 soal ke client; kirim per pelajaran, maksimal 50 soal per respons.
- Index DB: `Question(lessonId, position)`, `CurriculumLesson(levelId, position)`, `LessonProgress(userId, languageCode, status)`, `ExerciseAttempt(userId, languageCode, createdAt)`.
- Audio lazy-load; preload soal berikutnya; fallback teks jika audio gagal.
- Bundle: registry kecil; jangan impor seluruh konten JSON ke client.
- Cold start `/jp/profile`: satu query sesi + satu query user; tidak ada query konten.
- Empty/error state selalu ada; jangan spinner tanpa batas.

**Acceptance:** Lighthouse mobile performance tidak turun >5 poin; payload lesson <200 KB (tanpa audio); P95 API sesuai 3.3.

---

## 8. Kontrak Data & API

### 8.1 Tipe bersama

```ts
// app/lib/i18n/locales.ts
export const UI_LOCALES = [
  "en", "es", "id", "jp", "hi", "de", "ar", "fr", "pt", "it", "nl", "ko",
] as const;
export type UiLocale = (typeof UI_LOCALES)[number];

export const LANGUAGE_CODES = [
  "en", "es", "id", "ja", "hi", "de", "ar", "fr", "pt", "it", "nl", "ko",
] as const;
export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export type Framework = "JLPT" | "CEFR";
export type CurriculumLevelCode = "N5" | "N4" | "N3" | "N2" | "N1"
  | "A1" | "A2" | "B1" | "B2" | "C1";

export type Availability = "full" | "beta" | "preview" | "none";
export type ContentStatus = "draft" | "in_review" | "published" | "retired";
export type QuestionType =
  | "multiple_choice"
  | "fill_blank"
  | "ordering"
  | "matching"
  | "kanji_reading"
  | "reading_comprehension"
  | "listening_comprehension"
  | "correction";
```

```ts
// app/lib/learning/curriculum.ts
export interface CurriculumSummary {
  id: string;
  languageCode: LanguageCode;
  framework: Framework;
  variant: string;
  version: string;
  status: Availability;
  totalQuestions: number;
  totalLessons: number;
  levels: Array<{
    code: CurriculumLevelCode;
    lessons: number;
    questions: number;
    skills: Record<string, number>;
  }>;
}

export interface LessonSummary {
  id: string;
  level: CurriculumLevelCode;
  title: string;
  objective: string;
  skill: string;
  estimatedMinutes: number;
  questionCount: number;
  progress?: {
    status: "not_started" | "in_progress" | "completed" | "mastered";
    bestAccuracy: number;
    currentExerciseIndex: number;
  };
}

export interface QuestionDto {
  id: string;
  type: QuestionType;
  skill: string;
  prompt: string;
  passageId?: string;
  passage?: {
    id: string;
    title: string;
    body: string;
    audioUrl?: string | null;
  };
  audioUrl?: string | null;
  choices?: Array<{ id: string; label: string }>;
  // SENGAJA tidak ada answerKey / isCorrect / explanation
}
```

### 8.2 Perubahan Prisma (usulan)

```prisma
model User {
  // ...field existing
  uiLocale        String  @default("en")
  curriculumLevel String?
  // cefrLevel tetap untuk kompatibilitas; dianggap legacy setelah migrasi
}

model Language {
  id        String @id          // slug lama: "english"
  code      String @unique      // kanonik: "en"
  uiLocale  String @unique      // rute: "en" / "jp"
  label     String
  native    String
  // ...field existing
}

model Curriculum {
  id            String   @id              // "ja-jlpt"
  languageCode  String                     // "ja"
  framework     String                     // "JLPT" | "CEFR"
  variant       String   @default("standard")
  version       String                     // "2026.11.0"
  status        String   @default("draft")
  publishedAt   DateTime?
  levels        CurriculumLevel[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([languageCode, framework, version])
  @@index([languageCode, status])
}

model CurriculumLevel {
  id           String @id                  // "ja-jlpt-n5"
  curriculumId String
  code         String                      // "N5"
  position     Int
  title        String
  description  String?
  curriculum   Curriculum @relation(fields: [curriculumId], references: [id], onDelete: Cascade)
  units        CurriculumUnit[]

  @@unique([curriculumId, code])
  @@index([curriculumId, position])
}

model CurriculumUnit {
  id        String @id                     // "ja-jlpt-n5-u01"
  levelId   String
  position  Int
  title     String
  level     CurriculumLevel @relation(fields: [levelId], references: [id], onDelete: Cascade)
  lessons   CurriculumLesson[]

  @@unique([levelId, position])
}

model CurriculumLesson {
  id             String @id                // "ja-jlpt-n5-u01-l03"
  unitId         String
  position       Int
  slug           String
  title          String
  objective      String
  skill          String
  estimatedMinutes Int
  status         String @default("draft")
  contentVersion String
  unit           CurriculumUnit @relation(fields: [unitId], references: [id], onDelete: Cascade)
  questions      Question[]
  passages       Passage[]
  localizations  LessonLocalization[]

  @@unique([unitId, position])
  @@index([unitId, position])
}

model LessonLocalization {
  lessonId   String
  locale     String                        // "id", "en", "ja"
  title      String?
  objective  String?
  content    Json?                         // explanation, rules, examples, tables, tips
  lesson     CurriculumLesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@id([lessonId, locale])
}

model Passage {
  id            String @id                 // "ja-jlpt-n5-p0007"
  lessonId      String
  languageCode  String
  title         String
  body          String
  translation   String?
  audioUrl      String?
  lesson        CurriculumLesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  questions     Question[]
}

model Question {
  id                String @id             // "ja-jlpt-n5-u01-l03-q0042"
  lessonId          String
  passageId         String?
  position          Int
  type              String
  skill             String
  prompt            String
  promptSupport     String?
  audioUrl          String?
  answerKey         Json                   // server-only
  explanation       String
  explanationLocale String
  difficulty        Int      @default(1)
  tags              String[]
  source            String?
  license           String?
  fingerprint       String   @unique
  status            String   @default("draft")
  contentVersion    String
  reviewedBy        String?
  reviewedAt        DateTime?
  lesson            CurriculumLesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  passage           Passage? @relation(fields: [passageId], references: [id], onDelete: SetNull)
  choices           QuestionChoice[]
  localizations     QuestionLocalization[]

  @@unique([lessonId, position])
  @@index([lessonId, status])
}

model QuestionChoice {
  id         String
  questionId String
  label      String
  position   Int
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@id([questionId, id])
}

model QuestionLocalization {
  questionId String
  locale     String                        // "id", "en", "ja"
  prompt     String?
  explanation String?
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@id([questionId, locale])
}

model LessonProgress {
  // ...existing
  languageCode String?                     // denormalized untuk filter
  @@index([userId, languageCode, status])
}

model ExerciseAttempt {
  // ...existing
  languageCode String?
  @@index([userId, languageCode, createdAt])
}
```

Catatan:

- `Question.answerKey` tidak pernah di-`select` ke DTO learner.
- `Question.explanation` adalah penjelasan default (biasanya `en`); `QuestionLocalization` menyimpan override per locale (`id`, `ja`, dst.). Jangan menduplikasi soal hanya untuk terjemahan.
- `LessonLocalization` menyimpan materi ajar (explanation, rules, examples, tables, tips) per locale; jangan mengirim materi semua locale ke client.
- `answerKey` berbentuk JSON sesuai tipe: `{ choiceId }` untuk MCQ, `{ accepted: string[] }` untuk isian, `{ order: string[] }` untuk ordering.
- `QuestionChoice` tidak menyimpan `isCorrect`; kebenaran ada di `answerKey` agar tidak bocor.
- `Passage` boleh dipakai beberapa soal; jangan menduplikasi teks.
- `Curriculum.status` dan `Question.status` harus konsisten; publish hanya jika level terkait siap.
- Semua tanggal UTC.

### 8.3 Migrasi & backfill

Urutan aman (zero-downtime):

1. **Prasyarat:** update `context/architecture-context.md` (model konten + locale) sebelum migration.
2. Tambah `Language.code` nullable; backfill mapping; buat unique index setelah bersih.
3. Tambah `User.uiLocale` nullable; backfill dari `AppSettings.appLanguage`, lalu cookie/`en`; set default; jadikan NOT NULL.
4. Migrasi `User.targetLanguage`, `User.learningLanguage`, `LearningSettings.targetLanguage` dari nama tampilan ke kode.
5. Tambah `User.curriculumLevel`; backfill dari `cefrLevel`; untuk target `ja` → `N5` (flag perlu konfirmasi).
6. Buat tabel konten; impor konten awal; biarkan kosong untuk wave berikutnya.
7. Backfill `LessonProgress.languageCode`/`ExerciseAttempt.languageCode` dari katalog.
8. Deploy kode yang membaca `code`/`uiLocale`; pertahankan fallback baca lama selama satu rilis.
9. Setelah stabil, hapus/deprecate `AppSettings.appLanguage` dan `learningLanguage` (atau biarkan read-only).

Mapping:

| Nilai lama | Kode |
|---|---|
| `English`, `en`, `en-US` | `en` |
| `Spanish`, `es`, `es-ES` | `es` |
| `Indonesian`, `id`, `in` | `id` |
| `Japanese`, `ja`, `jp` | `ja` |
| `Korean`, `ko` | `ko` |
| `Hindi`, `hi` | `hi` |
| `German`, `de` | `de` |
| `Arabic`, `ar` | `ar` |
| `French`, `fr` | `fr` |
| `Portuguese`, `pt`, `pt-BR` | `pt` |
| `Italian`, `it` | `it` |
| `Dutch`, `nl` | `nl` |
| lainnya | `en` + catat di log migrasi |

> Nilai `AppSettings.appLanguage` seperti `"English (US)"`, `"Bahasa Indonesia"`, dan `"日本語"` dipetakan dengan mencocokkan prefix/endonym sebelum fallback ke `en`. Jangan menganggap semua nilai lama adalah kode.

Aturan:

- Backfill idempoten; aman dijalankan ulang.
- Jangan drop kolom lama di rilis yang sama dengan penambahan kolom baru.
- Sediakan rollback: kode membaca `uiLocale ?? "en"`; cookie bisa dihapus; konten baru bisa di-`retired`.
- Backup DB sebelum migrasi konten.

> **Kontrak final:** endpoint konten/kurikulum/progres per bahasa mengikuti **FS-09 §6** (termasuk envelope `authOk`/`authError` dan multi-language enrollment). Tabel di bawah adalah ringkasan preferensi locale/profil; jika berbeda, FS-09 menang untuk konten, FS-08 menang untuk URL/locale.

### 8.4 Endpoint

| Endpoint | Auth | Kegunaan | Cache |
|---|---|---|---|
| `PATCH /api/v1/me` | Ya | Simpan `uiLocale`, `targetLanguage`, `curriculumLevel`, `nativeLanguage` | `no-store` |
| `POST /api/v1/locale` | Tidak | Set cookie `lango_locale` untuk pengguna anonim (tanpa DB) | `no-store` |
| `GET /api/v1/languages` | Tidak | Registry + availability + counts | `public, s-maxage=3600` |
| `GET /api/v1/curricula/:code` | Tidak | Ringkasan level/lesson/soal | `public, s-maxage=600` |
| `GET /api/v1/curricula/:code/levels/:level/lessons` | Ya | Daftar pelajaran + progress | `no-store` |
| `GET /api/v1/lessons/:id` | Ya | Lesson + soal tanpa jawaban | `no-store` |
| `POST /api/v1/attempts` | Ya | Nilai jawaban, simpan attempt, kembalikan jawaban/penjelasan | `no-store` |
| `POST /api/v1/lessons/:id/complete` | Ya | Selesaikan pelajaran | `no-store` |
| `GET /api/v1/progress/curriculum?language=ja` | Ya | Ringkasan progress per level | `no-store` |

#### `PATCH /api/v1/me`

Request:

```json
{
  "uiLocale": "id",
  "targetLanguage": "ja",
  "curriculumLevel": "N3",
  "nativeLanguage": "id"
}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_...",
      "uiLocale": "id",
      "targetLanguage": "ja",
      "curriculumLevel": "N3",
      "nativeLanguage": "id"
    }
  },
  "error": null,
  "meta": { "timestamp": "...", "requestId": "..." }
}
```

Aturan:

- Minimal satu field; `.strict()` menolak field tak dikenal.
- `uiLocale` harus anggota `UI_LOCALES`.
- `targetLanguage` harus anggota `LANGUAGE_CODES`.
- `curriculumLevel` harus cocok framework target.
- `nativeLanguage` harus support locale (`en`, `id`, `ja`) atau anggota 12 (untuk penyimpanan; fallback penjelasan).
- Saat `uiLocale` berubah, server **wajib** `Set-Cookie: lango_locale=...`.
- Update `User.account` + `LearningSettings` secara transaksional bila relevan.
- Jangan izinkan `role`/`email` di payload.

#### `POST /api/v1/locale`

Dipakai hanya oleh switcher untuk pengguna anonim (cookie belum tentu ada). Untuk pengguna login, gunakan `PATCH /api/v1/me` agar DB ikut berubah.

Request:

```json
{ "locale": "id" }
```

Respons: `204 No Content` + `Set-Cookie: lango_locale=id; Path=/; HttpOnly; SameSite=Lax`.

Aturan:

- Publik; rate limit per IP.
- Validasi `UI_LOCALES`; tolak `jp`? Tidak — `jp` valid sebagai locale rute.
- Verifikasi `Origin`/`Sec-Fetch-Site` untuk mengurangi CSRF pada cookie.
- Tidak menyentuh database.
- `400 INVALID_LOCALE` jika tidak valid.

#### `GET /api/v1/languages`

Response (ringkas):

```json
{
  "success": true,
  "data": {
    "uiLocales": [
      { "code": "id", "label": "Bahasa Indonesia", "htmlLang": "id", "dir": "ltr" }
    ],
    "learningLanguages": [
      {
        "code": "ja",
        "routeLocale": "jp",
        "label": "日本語",
        "englishLabel": "Japanese",
        "flag": "/images/flags/japan.svg",
        "framework": "JLPT",
        "levels": [
          { "code": "N5", "lessons": 60, "questions": 2100 }
        ],
        "totalQuestions": 10500,
        "totalLessons": 300,
        "status": "full",
        "contentVersion": "2026.11.0"
      }
    ]
  }
}
```

#### `GET /api/v1/curricula/:code`

- `:code` = `LanguageCode` (`ja`, bukan `jp`); `jp` → `400` atau redirect? Pilih `400 INVALID_LANGUAGE` agar API tegas.
- Mengembalikan `CurriculumSummary` + `availability`.
- Tidak mengembalikan soal.

#### `GET /api/v1/lessons/:id`

```json
{
  "success": true,
  "data": {
    "lesson": {
      "id": "ja-jlpt-n5-u01-l03",
      "title": "自己紹介",
      "objective": "Memperkenalkan nama dan asal",
      "estimatedMinutes": 8,
      "questionCount": 35,
      "content": {
        "explanation": "Pola です dan から来ました dipakai untuk memperkenalkan diri.",
        "rules": [{ "title": "Asal", "text": "〜から来ました = datang dari 〜" }],
        "examples": [{ "correct": "インドネシアから来ました。" }],
        "tables": [],
        "tips": ["Partikel から menandai titik awal."]
      }
    },
    "passage": null,
    "questions": [
      {
        "id": "ja-jlpt-n5-u01-l03-q0042",
        "type": "multiple_choice",
        "skill": "vocabulary",
        "prompt": "「学生」の読み方は？",
        "choices": [
          { "id": "a", "label": "がくせい" },
          { "id": "b", "label": "がくしょう" }
        ],
        "audioUrl": null
      }
    ]
  }
}
```

- Tidak ada `answerKey`, `explanation`, `isCorrect`, `reviewedBy`, `source` internal.
- `audioUrl` hanya untuk listening; signed URL bila perlu.

#### `POST /api/v1/attempts`

Request:

```json
{
  "lessonId": "ja-jlpt-n5-u01-l03",
  "questionId": "ja-jlpt-n5-u01-l03-q0042",
  "answer": "a",
  "clientAttemptId": "uuid",
  "timeSpentMs": 4200,
  "exerciseIndex": 4
}
```

Response:

```json
{
  "success": true,
  "data": {
    "correct": true,
    "correctAnswer": "から",
    "correctChoiceId": "a",
    "explanation": "「学生」は「がくせい」と読みます。",
    "xpAwarded": 10,
    "stats": { "xpTotal": 120, "level": 3, "hearts": 5 },
    "idempotent": false
  }
}
```

- Validasi bahwa soal milik lesson, lesson published, dan user berhak.
- Idempotent per `userId + clientAttemptId`.
- Jangan menerima `correct` dari client.
- Rate limit 120/menit/user (mengikuti pola existing).
- Simpan `languageCode` di attempt.

#### Error code

| Kode | HTTP | Pesan UI |
|---|---|---|
| `UNAUTHORIZED` | 401 | Sesi berakhir; masuk lagi |
| `INVALID_LOCALE` | 400 | Bahasa tampilan tidak didukung |
| `INVALID_LANGUAGE` | 400 | Bahasa belajar tidak didukung |
| `INVALID_LEVEL_FOR_FRAMEWORK` | 400 | Level tidak cocok dengan bahasa |
| `CURRICULUM_NOT_AVAILABLE` | 404 | Kurikulum belum tersedia |
| `LESSON_NOT_FOUND` | 404 | Pelajaran tidak ditemukan |
| `CONTENT_VERSION_MISMATCH` | 409 | Konten diperbarui; muat ulang |
| `RATE_LIMITED` | 429 | Terlalu banyak permintaan |
| `VALIDATION_ERROR` | 400 | Data tidak valid |

Bentuk error aktual mengikuti `app/lib/api/auth-response.ts`:

```json
{
  "success": false,
  "data": null,
  "error": { "code": "INVALID_LOCALE", "message": "..." },
  "meta": { "timestamp": "...", "requestId": "..." }
}
```

> Catatan: `ai-workflow-rules.md` masih menyebut bentuk `{ error, code }`. Implementasi baru harus mengikuti helper aktual dan memperbarui dokumen aturan agar konsisten.

---

## 9. Struktur Kunci i18n & Copy

### 9.1 Struktur JSON (contoh `id`)

```json
{
  "settings": {
    "language": {
      "title": "Bahasa & wilayah",
      "description": "Atur bahasa tampilan dan bahasa yang kamu pelajari.",
      "interface": "Bahasa tampilan",
      "interfaceHelp": "Berlaku untuk menu, tombol, dan pesan. Tidak mengubah bahasa yang kamu pelajari.",
      "learning": "Bahasa yang dipelajari",
      "learningHelp": "Konten belajar mengikuti pilihan ini.",
      "level": "Level saat ini",
      "levelHelp": "Level memengaruhi urutan pelajaran yang disarankan.",
      "explanation": "Bahasa penjelasan",
      "explanationHelp": "Dipakai untuk penjelasan soal jika tersedia.",
      "timezone": "Zona waktu",
      "sync": "Samakan bahasa tampilan dengan bahasa yang dipelajari",
      "saving": "Menyimpan…",
      "saved": "Preferensi bahasa disimpan.",
      "error": "Gagal menyimpan preferensi. Coba lagi.",
      "dirtyTitle": "Ganti bahasa tampilan?",
      "dirtyBody": "Perubahan password yang belum disimpan akan hilang.",
      "dirtyConfirm": "Ganti bahasa",
      "dirtyCancel": "Batal"
    }
  },
  "curriculum": {
    "available": "Tersedia",
    "beta": "Beta · {{count}} soal",
    "preview": "Pratinjau · {{count}} soal",
    "comingSoon": "Segera hadir",
    "questionCount": "{{count}} soal",
    "lessonCount": "{{count}} pelajaran",
    "levelCount": "{{count}} jenjang",
    "levels": "Jenjang",
    "start": "Mulai belajar",
    "continue": "Lanjutkan",
    "emptyTitle": "Kurikulum {{language}} belum tersedia",
    "emptyBody": "Kami sedang menyiapkan kontennya. Sementara itu, kamu bisa memilih bahasa lain.",
    "changeLanguage": "Ganti bahasa belajar",
    "browseAvailable": "Lihat kurikulum yang tersedia",
    "mismatch": "Antarmuka: {{ui}} · Belajar: {{content}}",
    "fallbackExplanation": "Penjelasan tersedia dalam {{language}}.",
    "jlpt": {
      "name": "JLPT",
      "levels": { "N5": "N5 · Dasar", "N4": "N4 · Dasar lanjutan", "N3": "N3 · Menengah", "N2": "N2 · Menengah atas", "N1": "N1 · Mahir" }
    },
    "cefr": {
      "name": "CEFR",
      "levels": { "A1": "A1 · Pemula", "A2": "A2 · Dasar", "B1": "B1 · Menengah", "B2": "B2 · Menengah atas", "C1": "C1 · Mahir" }
    }
  },
  "errors": {
    "INVALID_LOCALE": "Bahasa tampilan tidak didukung.",
    "INVALID_LANGUAGE": "Bahasa belajar tidak didukung.",
    "INVALID_LEVEL_FOR_FRAMEWORK": "Level tidak cocok dengan bahasa yang dipilih.",
    "CURRICULUM_NOT_AVAILABLE": "Kurikulum belum tersedia.",
    "NETWORK": "Koneksi terputus. Coba lagi."
  }
}
```

### 9.2 Copy inti (EN / ID / JP)

| Kunci | English | Bahasa Indonesia | 日本語 |
|---|---|---|---|
| `settings.language.title` | Language & region | Bahasa & wilayah | 言語と地域 |
| `settings.language.interface` | Interface language | Bahasa tampilan | 表示言語 |
| `settings.language.interfaceHelp` | Applies to menus, buttons, and messages. Does not change the language you are learning. | Berlaku untuk menu, tombol, dan pesan. Tidak mengubah bahasa yang kamu pelajari. | メニューやボタン、メッセージに適用されます。学習言語は変わりません。 |
| `settings.language.learning` | Learning language | Bahasa yang dipelajari | 学習する言語 |
| `settings.language.learningHelp` | Learning content follows this choice. | Konten belajar mengikuti pilihan ini. | 学習コンテンツはこの選択に従います。 |
| `settings.language.level` | Current level | Level saat ini | 現在のレベル |
| `settings.language.sync` | Match interface to learning language | Samakan bahasa tampilan dengan bahasa yang dipelajari | 表示言語を学習言語に合わせる |
| `settings.language.saved` | Language preferences saved. | Preferensi bahasa disimpan. | 言語設定を保存しました。 |
| `settings.language.error` | Could not save preferences. Try again. | Gagal menyimpan preferensi. Coba lagi. | 設定を保存できませんでした。もう一度お試しください。 |
| `curriculum.available` | Available | Tersedia | 利用可能 |
| `curriculum.beta` | Beta · {{count}} questions | Beta · {{count}} soal | ベータ · {{count}}問 |
| `curriculum.comingSoon` | Coming soon | Segera hadir | 準備中 |
| `curriculum.questionCount` | {{count}} questions | {{count}} soal | {{count}}問 |
| `curriculum.lessonCount` | {{count}} lessons | {{count}} pelajaran | {{count}}レッスン |
| `curriculum.mismatch` | Interface: {{ui}} · Learning: {{content}} | Antarmuka: {{ui}} · Belajar: {{content}} | 表示: {{ui}} · 学習: {{content}} |
| `curriculum.emptyTitle` | The {{language}} curriculum isn’t available yet | Kurikulum {{language}} belum tersedia | {{language}}のカリキュラムはまだありません |
| `curriculum.changeLanguage` | Change learning language | Ganti bahasa belajar | 学習言語を変更 |

### 9.3 Label bahasa

Selalu gunakan endonym dari registry; jangan menerjemahkan nama bahasa di select. Label Inggris hanya sebagai `aria-label`/bantuan.

| Kode | Endonym | English |
|---|---|---|
| `en` | English | English |
| `es` | Español | Spanish |
| `id` | Bahasa Indonesia | Indonesian |
| `ja` | 日本語 | Japanese |
| `hi` | हिन्दी | Hindi |
| `de` | Deutsch | German |
| `ar` | العربية | Arabic |
| `fr` | Français | French |
| `pt` | Português | Portuguese |
| `it` | Italiano | Italian |
| `nl` | Nederlands | Dutch |
| `ko` | 한국어 | Korean |

### 9.4 Pemeriksaan locale

- Perluas `scripts/check-locales.mjs` menjadi 12 locale dengan tier:
  - `en`, `id`, `jp`: semua namespace.
  - `es`, `fr`, `de`, `pt`, `it`, `nl`: `common`, `settings`, `curriculum`, `languages`, `errors`, `learning` (bertahap).
  - `hi`, `ar`, `ko`: sama + audit RTL/script.
- `app/locales/locale-meta.json`:

```json
{
  "en": { "status": "full", "learning": "full" },
  "id": { "status": "full", "learning": "full" },
  "jp": { "status": "full", "learning": "full" },
  "ar": { "status": "beta", "learning": "fallback-en" }
}
```

- CI gagal jika locale `full` kehilangan kunci, nilai kosong, atau nilai identik EN pada kunci wajib.

---

## 10. Arsitektur Implementasi (Usulan)

```
app/
  lib/
    i18n/
      locales.ts              # 12 UI + 12 content, mapping, htmlLang, dir, speech
      paths.ts                # localizedHref, switchLocaleInPath, alias
      registry.ts             # LanguageSupport 12 bahasa (static metadata)
    learning/
      curriculum.ts           # tipe, framework, level, availability
      content-repository.ts   # DB adapter; server-only
      schemas.ts              # Zod attempt/lesson/content
    auth/
      validation.ts           # uiLocale/target/level validation
  components/
    settings/
      language-settings.tsx   # section profil (client)
      locale-switcher.tsx     # shared header/profile switcher
    editor/
      curriculum/
        curriculum-module.tsx
        level-picker.tsx
        lesson-list.tsx
        lesson-view.tsx
        practice.tsx
        results.tsx
  [lang]/
    profile/page.tsx
    learn/layout.tsx
  api/
    v1/
      me/route.ts
      languages/route.ts
      curricula/[code]/route.ts
      curricula/[code]/levels/[level]/lessons/route.ts
      lessons/[id]/route.ts
      lessons/[id]/complete/route.ts
      attempts/route.ts
      progress/curriculum/route.ts
content/
  curricula/
    ja/jlpt/n5/*.json
    en/cefr/a1/*.json
scripts/
  content/validate.ts
  content/import.ts
  content/report.ts
  check-curriculum.mjs
```

Prinsip:

- Halaman profil tetap Server Component; section bahasa adalah Client Component untuk interaksi.
- `content-repository.ts` memakai `import "server-only"`; jangan pernah diimpor client.
- API tipis: validasi → service → respons; tanpa logika konten di route.
- Jangan menambah dependency i18n baru; `i18next`/`react-i18next` sudah ada.
- Jangan memindahkan `app/components/editor/**` ke global pada fase ini; ikuti lokasi aktual.
- Font baru via `next/font/google`; tidak ada CDN font runtime.
- Semua warna memakai token `--learn-*`/`--*`; tidak ada hex baru.

### 10.1 Urutan kerja yang disarankan

1. Update `architecture-context.md` (schema konten + dua axis bahasa).
2. Migrasi `Language.code` + `User.uiLocale` + backfill target.
3. Registry + path helper + tests.
4. Profil section + `PATCH /me` + cookie + header switcher.
5. Proxy precedence + alias + root redirect.
6. API languages/curricula + content tables.
7. Import Inggris (existing) + progress mapping.
8. Kurikulum Jepang N5–N3 → N2–N1 (konten bertahap).
9. UI locale B/C + RTL/font.
10. Analitik, SEO, a11y, CI counts.

---

## 11. Acceptance Criteria

| ID | Skenario | Ekspektasi |
|---|---|---|
| AC-01 | Buka `/id/profile` | Section “Bahasa & wilayah” tampil; 12 opsi di kedua select; endonym; availability |
| AC-02 | Di `/jp/learn`, pilih “Bahasa Indonesia” | URL menjadi `/id/learn`; path/query/hash lain dipertahankan; tanpa full reload |
| AC-03 | Refresh setelah AC-02 | Tetap `/id/learn`; UI Indonesia; DB `uiLocale=id`; cookie `lango_locale=id` |
| AC-04 | Buka browser/perangkat lain lalu login | Diarahkan ke `/id/...`; preferensi akun menang |
| AC-05 | Ganti UI locale saat target `ja` | `targetLanguage` tetap `ja`; konten tetap Jepang; chip mismatch sesuai |
| AC-06 | Ganti target ke `ja` di `/id/learn` | URL tetap `/id/learn`; konten Jepang; level N5–N1; jumlah soal 10.500 |
| AC-07 | Buka `GET /api/v1/curricula/ja` | 5 level; 60 lesson/level; 2.100 soal/level; total 10.500 |
| AC-08 | Buka `GET /api/v1/curricula/en` | 5 level; 60 lesson/level; 2.100 soal/level; total 10.500 |
| AC-09 | Pilih bahasa tanpa kurikulum | Empty state terlokalisasi; CTA ganti bahasa; **tidak** ada konten EN otomatis |
| AC-10 | Buka `/ja/learn` / `/in/learn` | `308` ke `/jp/learn` / `/id/learn`; query dipertahankan |
| AC-11 | Buka `/xx/learn` | `404`, bukan redirect ke `en` |
| AC-12 | Buka `/learn` tanpa locale | Cookie → Accept-Language → `en`; redirect sesuai precedence |
| AC-13 | Buka `/` sambil login `uiLocale=jp` | Redirect `/jp/learn` |
| AC-14 | Cold load `/jp` | Tidak ada flash EN; `html lang="ja"`, `dir="ltr"` |
| AC-15 | Buka `/ar/learn` | `dir="rtl"`; layout mirror; angka/kode tetap LTR; font Arab |
| AC-16 | Ganti bahasa lewat header di mobile | Berfungsi; path dipertahankan; tidak memakai `window.location.assign` |
| AC-17 | Password form terisi lalu ganti bahasa | Dialog konfirmasi; batal tidak mengubah apa pun |
| AC-18 | Simulasi `PATCH /me` gagal | Select rollback; toast error terlokalisasi; URL tidak berubah |
| AC-19 | Onboarding `/id/onboarding` pilih `ja` | Level N5–N1; simpan `uiLocale=id`, `targetLanguage=ja`, `curriculumLevel=N5`; redirect `/id/learn` |
| AC-20 | Migrasi data legacy | `"Spanish"`→`es`, `"Japanese"`→`ja`, `"jp"`→`ja`; tidak ada nama tampilan di target |
| AC-21 | `GET /api/v1/lessons/:id` | Tidak memuat `answerKey`/`isCorrect`/`explanation`; `POST attempts` mengembalikan hasil |
| AC-22 | Impor konten dua kali | Tidak ada duplikat; fingerprint/ID unik; hitungan tetap |
| AC-23 | Soal `retired` | Tidak dihitung di availability; tidak dikirim ke learner baru; attempt lama tetap |
| AC-24 | Ganti UI locale di tengah latihan soal 12 | Setelah refresh kembali ke soal 12; progress/XP tidak reset |
| AC-25 | Ganti target lalu kembali | Progress bahasa lama tetap ada; dashboard menampilkan target aktif |
| AC-26 | `npm run check:locales` | Lolos aturan tier 12 locale; tidak ada kunci kosong |
| AC-27 | `npm run check:curriculum` | Gagal untuk `full` jika <10.500 soal/<300 lesson; `beta` <2.100; `preview` <1 unit; audio/penjelasan hilang; duplikat >0,5% |
| AC-28 | SEO | Canonical + hreflang benar; `x-default=en`; learn noindex; tidak ada hreflang `/ja` |
| AC-29 | A11y | Keyboard-only mengganti bahasa; `aria-live`; 44px; kontras; axe tidak ada violation kritis |
| AC-30 | Build/typecheck/lint | `npm run build`, `npx tsc --noEmit` lolos; lint hanya issue pre-existing yang terdokumentasi |

---

## 12. Rencana Pengujian

### 12.1 Unit

- `switchLocaleInPath`: root, nested, query/hash, alias, invalid, trailing slash.
- `localizedHref`: path tanpa slash, path dengan locale, jangan double-prefix.
- `toContentLanguage`/`toHtmlLang`/`toTextDirection`: 12 locale, `jp`→`ja`, `ar`→rtl.
- `resolveContentLanguage`: target valid tanpa kurikulum **tidak** fallback; target invalid fallback hanya untuk nilai rusak.
- Registry: 12 entri, kode unik, framework/level konsisten, flag ada.
- Validasi Zod: locale/language/level mismatch.
- Mapping migrasi: semua label legacy → kode; idempoten.
- Fingerprint/duplikasi: normalisasi, exact duplicate, near duplicate.
- i18n key parity per tier.

### 12.2 Integrasi

- `PATCH /me`: auth, partial update, cookie, DB, invalid enum, level mismatch.
- Proxy: cookie/account precedence, alias 308, unknown 404, query preserved.
- Login/register/onboarding: cookie sync, redirect locale.
- `GET /languages`: cache header, counts, status.
- `GET /curricula`: 404 untuk `none`, valid untuk `beta`, tidak membocorkan soal.
- `GET /lessons`: auth, published only, no answer fields.
- `POST /attempts`: correct/incorrect, idempotency, rate limit, lesson ownership, retired question.
- `POST /lessons/:id/complete`: all attempted, accuracy, XP idempotent.
- Progress filter by `languageCode`.

### 12.3 E2E (Playwright)

1. Profil: ganti UI locale → URL, cookie, reload, DB.
2. Profil: ganti target → URL tetap, konten berubah, chip.
3. Header mobile: ganti locale di `/jp/learn` → `/id/learn`.
4. Cold load `/jp`: tidak ada flash EN (cek teks pertama + `html lang`).
5. RTL `/ar/profile` dan `/ar/learn`: screenshot + tidak ada overflow.
6. Dirty password form → dialog → batal/lanjut.
7. Network failure saat `PATCH` → rollback.
8. Resume: jawab 12 soal → ganti locale → refresh → soal 12.
9. Onboarding `ja`: pilih N3 → dashboard N3.
10. Empty state `ko` sebelum konten rilis.

### 12.4 Content QA

- Hitung per bahasa/level/skill dari DB published.
- 100% lesson punya objective/explanation.
- 100% listening punya audio + transkrip.
- 100% reading punya passage.
- Duplikat fingerprint = 0; similaritas <0,5%.
- Language ID ≥90% target.
- JLPT whitelist: kanji/kosakata/grammar per level.
- Answer-key audit: sampel 100% benar.
- Review penutur asli: sign-off per level.
- Pilot p-value: 0,2–0,9; flag ekstrem.
- IP check: tidak ada teks dari soal resmi; disclaimer ada.

### 12.5 Matriks manual

| Dimensi | Nilai |
|---|---|
| Locale UI | `en`, `id`, `jp`, `ar`, `hi`, `ko` (sampel B/C) |
| Bahasa belajar | `ja`, `en`, `id`, `ko` (sampel) |
| Framework | JLPT N5–N1, CEFR A1–C1 |
| Layar | Profil, onboarding, dashboard, lesson, practice, results |
| State | Loading, saving, error, empty, offline, resume |
| Perangkat | 320, 375, 768, 1440 px |
| Input | Mouse, touch, keyboard, screen reader |
| Preferensi | Reduced motion, zoom 200%, RTL, dark OS |

---

> **Jadwal program konten:** untuk 126.000 soal, jadwal dan kapasitas yang berlaku adalah **PRD §14 + FS-09 §12** (±72 minggu dengan throughput 2.000–2.500 soal/minggu). Tabel di bawah adalah estimasi awal untuk spec locale/katalog; angka P2–P4 di sini **bukan** komitmen kapasitas konten dan tidak boleh dipakai untuk perencanaan 126.000 soal.

## 13. Rencana Implementasi Bertahap

> Ini adalah program multi-rilis. Estimasi bersifat indikatif dan bergantung pada ukuran tim konten.

### P0 — Fondasi preferensi & URL (1–1,5 minggu)

Deliverable:

- Update `architecture-context.md` untuk dua axis bahasa + model konten.
- Migrasi `Language.code`, `User.uiLocale`, `User.curriculumLevel`; backfill target.
- Registry 12 bahasa + `paths.ts` + tests.
- Section profil “Bahasa & wilayah”; `PATCH /me` + cookie.
- Header switcher shared + mobile; proxy precedence + alias.
- Hapus hardcode 6 bahasa di onboarding.
- Update `check:locales` untuk namespace baru.

Exit: AC-01–05, AC-10–14, AC-17–20, AC-26, AC-30.

### P1 — Platform konten & Inggris (2–3 minggu)

Deliverable:

- Tabel konten (`Curriculum`…`QuestionLocalization`) + repository.
- API `languages`, `curricula`, `lessons`, `attempts` versi DB.
- Import 60 pelajaran Grammar Inggris yang ada + mapping progress.
- Level-aware onboarding + dashboard availability.
- `check:curriculum` + manifest.
- Inggris mulai menuju 10.500 (A1–B1 dulu).

Exit: AC-06–09 sebagian; Inggris ≥6.000 soal; tidak ada regresi progress lama.

### P2 — Jepang JLPT penuh (4–6 minggu)

Deliverable:

- N5–N3 lengkap (6.300 soal) → N2–N1 (4.200 soal).
- 300 pelajaran; audio listening; passage; penjelasan `id`/`en`/`ja`.
- QA native review; p-value pilot; retire soal buruk.
- `GET /curricula/ja` = 10.500.

Exit: AC-07, AC-21–25, AC-27; Jepang `full`.

### P3 — Inggris penuh + gelombang B (6–8 minggu)

Deliverable:

- Inggris 10.500; A1–C1 seimbang.
- `id`, `es`, `fr`, `de` mulai (beta → full).
- UI locale B full (`es`, `fr`, `de`, `pt`, `it`, `nl`).
- SEO/hreflang + analytics.

Exit: AC-08, AC-28; 6 bahasa konten aktif.

### P4 — Gelombang C, RTL, dan polish (8–12 minggu)

Deliverable:

- `pt`, `it`, `nl`, `ko`, `hi`, `ar` hingga 10.500 masing-masing.
- UI locale C full + font/RTL audit.
- Total 126.000 soal / 3.600 pelajaran.
- A11y, performance, monitoring, content ops playbook.

Exit: semua AC; 12 bahasa `full`.

---

## 14. Risiko, Asumsi, dan Pertanyaan Terbuka

### 14.1 Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Skala 126 ribu soal tidak tercapai | Janji “10.000+” gagal | Gelombang + CI count + status `beta` jujur |
| Kualitas soal AI-generated rendah | Kepercayaan turun | Human review 100% explanation, sampling soal, p-value, retire |
| Pelanggaran IP/merek JLPT | Risiko hukum | Original content, disclaimer, legal review, no past papers |
| Biaya audio/TTS besar | Biaya operasional | Pra-generate hanya listening, kompresi, cache, review |
| Terjemahan 12 locale mahal | Locale setengah jadi | Tier + badge beta + fallback UI yang terlihat |
| Migrasi data merusak target | Pengguna kehilangan bahasa | Backfill idempoten, dual-read, backup, rollback |
| `[lang]` disalahartikan sebagai bahasa belajar | UX/IA kacau | D-01, chip mismatch, dokumentasi |
| Duplikat konten EN di 12 URL | SEO buruk | `noindex` untuk yang belum full, hreflang, canonical |
| RTL/script rusak | Tidak terbaca | Font khusus, logical CSS, audit screenshot |
| Tim konten kurang | Rilis molor | Rekrut native reviewer, vendor, prioritaskan ja/en |
| Scope creep ke sertifikasi lain | Fokus hilang | Non-goals, framework extensible tanpa implementasi |
| Progress hilang saat versi konten naik | Frustrasi | ID stabil, retired bukan delete, progress terpisah |

### 14.2 Asumsi

- 12 locale di `app/i18n-config.ts` adalah daftar resmi Lango.
- `jp` tetap rute publik untuk Jepang; `ja` adalah kode konten.
- Pengguna memilih level secara manual; tidak ada placement test di fase ini.
- Audio listening diproduksi sebagai aset, bukan TTS runtime.
- Konten disimpan di PostgreSQL; file JSON hanya sumber impor.
- Tim memiliki penutur asli untuk 12 bahasa (minimal reviewer kontrak).

### 14.3 Pertanyaan terbuka

1. Apakah `[lang]` murni bahasa tampilan? (Rekomendasi: ya.)
2. Apakah target 10.500/ bahasa adalah syarat rilis atau target akhir? (Rekomendasi: target akhir, rilis bergelombang.)
3. Bahasa penjelasan mana yang wajib di peluncuran? (Rekomendasi: `id`, `en`, `ja`.)
4. Variasi bahasa: `pt-BR`, `ar-MSA`, `es-ES` — apakah ada preferensi pasar?
5. Apakah perlu placement test atau cukup pilihan manual?
6. Apakah soal AI-generated boleh dipublikasikan dengan review manusia? (Rekomendasi: ya, dengan sampling dan sign-off.)
7. Apakah perlu unduhan offline untuk 10 ribu soal? (Rekomendasi: tidak.)
8. Apakah header switcher harus tersedia untuk pengguna anonim? (Rekomendasi: ya, cookie saja.)
9. Apakah `AppSettings.appLanguage` dihapus total atau dipertahankan sebagai legacy?
10. Siapa pemilik konten (in-house vs vendor) dan SLA review per level?

---

## 15. Lampiran

### A. Matriks soal Jepang (JLPT)

| Level | Pelajaran | Kosakata | Kanji | Tata bahasa | Membaca | Mendengar | Total |
|---|---|---|---|---|---|---|---|
| N5 | 60 | 620 | 400 | 480 | 320 | 280 | 2.100 |
| N4 | 60 | 620 | 400 | 480 | 320 | 280 | 2.100 |
| N3 | 60 | 620 | 400 | 480 | 320 | 280 | 2.100 |
| N2 | 60 | 620 | 400 | 480 | 320 | 280 | 2.100 |
| N1 | 60 | 620 | 400 | 480 | 320 | 280 | 2.100 |
| **Total** | **300** | **3.100** | **2.000** | **2.400** | **1.600** | **1.400** | **10.500** |

### B. Matriks soal Inggris (CEFR)

| Level | Pelajaran | Kosakata | Tata bahasa | Membaca | Mendengar | Use of English | Total |
|---|---|---|---|---|---|---|---|
| A1 | 60 | 450 | 600 | 400 | 350 | 300 | 2.100 |
| A2 | 60 | 450 | 600 | 400 | 350 | 300 | 2.100 |
| B1 | 60 | 450 | 600 | 400 | 350 | 300 | 2.100 |
| B2 | 60 | 450 | 600 | 400 | 350 | 300 | 2.100 |
| C1 | 60 | 450 | 600 | 400 | 350 | 300 | 2.100 |
| **Total** | **300** | **2.250** | **3.000** | **2.000** | **1.750** | **1.500** | **10.500** |

### C. Matriks soal bahasa lain (per bahasa)

| Level | Pelajaran | Kosakata | Tata bahasa | Membaca | Mendengar | Use of English | Total |
|---|---|---|---|---|---|---|---|
| A1 | 60 | 500 | 600 | 400 | 350 | 250 | 2.100 |
| A2 | 60 | 500 | 600 | 400 | 350 | 250 | 2.100 |
| B1 | 60 | 500 | 600 | 400 | 350 | 250 | 2.100 |
| B2 | 60 | 500 | 600 | 400 | 350 | 250 | 2.100 |
| C1 | 60 | 500 | 600 | 400 | 350 | 250 | 2.100 |
| **Total** | **300** | **2.500** | **3.000** | **2.000** | **1.750** | **1.250** | **10.500** |

### D. Format authoring (contoh)

```json
{
  "lesson": {
    "id": "ja-jlpt-n5-u01-l03",
    "level": "N5",
    "unit": 1,
    "position": 3,
    "title": "自己紹介",
    "objective": "Memperkenalkan nama dan asal dengan pola です/から来ました",
    "skill": "grammar",
    "estimatedMinutes": 8,
    "contentVersion": "2026.11.0"
  },
  "questions": [
    {
      "id": "ja-jlpt-n5-u01-l03-q0042",
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

### E. Referensi

- FS-07: `context/feature-specs/07-user-friendly-learning-ui.md` — dua axis bahasa, shell, i18n, acceptance.
- PRD v1.1: `docs/PRD.md` — scope, roadmap, risiko.
- JLPT: https://www.jlpt.jp/ (informasi resmi level; konten Lango tetap original).
- CEFR: https://www.coe.int/en/web/common-european-framework-reference-languages/ (deskriptor level).
- Next.js 16 docs: `node_modules/next/dist/docs/` — routing, metadata, server/client boundaries.

### F. Definition of Done (ringkas)

- [ ] `User.uiLocale` tersimpan, cookie tersinkron, dan URL mengikuti.
- [ ] Profil punya section “Bahasa & wilayah” yang berfungsi penuh.
- [ ] `[lang]` hanya bahasa tampilan; bahasa belajar independen.
- [ ] Registry 12 bahasa menjadi satu-satunya sumber daftar.
- [ ] Jepang 10.500 soal / 300 pelajaran / 5 jenjang.
- [ ] Inggris 10.500 soal / 300 pelajaran / 5 jenjang.
- [ ] 10 bahasa lain punya jalur + status jujur.
- [ ] Tidak ada fallback konten lintas bahasa.
- [ ] `check:locales` + `check:curriculum` lolos.
- [ ] RTL/font/script audit untuk `ar`, `hi`, `ko`, `ja`.
- [ ] Semua acceptance criteria di §11 lolos.

---

**Catatan akhir:** FS-08 sengaja memisahkan “mengganti bahasa” menjadi dua keputusan produk yang berbeda. Jika tim memutuskan `[lang]` harus mengikuti bahasa belajar, revisi besar diperlukan pada FS-07, IA, dan URL; lakukan keputusan itu **sebelum** P0 dimulai.
