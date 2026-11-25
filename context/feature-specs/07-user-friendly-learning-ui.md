# Feature Spec: Tampilan Pembelajaran User-Friendly & Sesuai Bahasa (EN / ID / JP)

**Spec ID:** FS-07  
**Status:** P0 implemented — P1/P2 pending  
**Versi:** 0.1  
**Tanggal:** 2026-11-25  
**Rute acuan:** `http://localhost:3000/en/editor`, `http://localhost:3000/id/editor`, `http://localhost:3000/jp/editor` (semua redirect ke `/[lang]/learn`)  
**Area:** `app/[lang]/(editor|learn)`, `app/components/editor/**`, `app/locales/**`, `app/lib/**`  
**Spec terkait:** FS-01 Design System, FS-03 Editor Chrome, FS-05 Number Name, FS-06 Grammar

---

## 1. Ringkasan

Spec ini mendefinisikan ulang **tampilan pembelajaran** Lango agar:

1. **User-friendly** — pengguna selalu tahu sedang di mana, harus melakukan apa, dan apa hasilnya; tidak ada jalan buntu, teks kecil yang tidak terbaca, atau umpan balik yang hilang terlalu cepat.
2. **Sesuai bahasa** — seluruh teks antarmuka mengikuti locale rute (`/en`, `/id`, `/jp`), sedangkan isi latihan mengikuti bahasa target pengguna (`targetLanguage`). Kedua hal ini dipisahkan secara eksplisit agar tidak tercampur.
3. **Konsisten dan dapat diakses** — satu sistem komponen, token warna, focus state, label ARIA, dan dukungan keyboard untuk semua modul.

Hasil akhirnya adalah satu pengalaman belajar yang utuh: dashboard → pilih modul → pelajaran → latihan → hasil → lanjut, dengan progres yang tersimpan dan bahasa yang tidak pernah "bocor" ke bahasa lain tanpa alasan.

### Keputusan yang direkomendasikan (ringkas)

| # | Keputusan | Rekomendasi |
|---|---|---|
| D-1 | Kode locale publik `jp` vs standar `ja` | Pertahankan rute `/jp`; gunakan `ja` sebagai kode kanonik internal/konten/TTS |
| D-2 | Bahasa UI vs bahasa isi | Dua sumbu terpisah: UI dari rute, isi dari `targetLanguage` |
| D-3 | Grammar untuk bahasa tanpa konten | Sembunyikan/tandai belum tersedia; jangan tampilkan grammar Inggris di UI Jepang |
| D-4 | Tema editor | Pertahankan *dark focus mode*, tetapi ubah menjadi token semantik `--learn-*` |
| D-5 | Penyimpanan progres | Server untuk XP/streak/penyelesaian; `localStorage` untuk posisi terakhir pada P0, lalu server pada P1 |
| D-6 | 12 locale yang ada | `en`/`id`/`jp` diterjemahkan penuh; locale lain fallback ke `en` + badge |

### Prinsip UX yang dipakai

1. **Orientasi** — pengguna selalu tahu modul, level, fase, dan posisinya.
2. **Satu aksi utama** — setiap layar punya satu CTA yang jelas; aksi sekunder tidak bersaing.
3. **Umpan balik yang menetap** — hasil jawaban tidak hilang sebelum pengguna siap lanjut.
4. **Kontrol pengguna** — tidak ada auto-navigasi; jeda, ulangi, dan keluar selalu tersedia.
5. **Bahasa yang konsisten** — UI mengikuti locale rute; isi mengikuti bahasa target; tidak ada campuran tanpa label.

### Perubahan utama per layar

| Layar | Sekarang | Setelah |
|---|---|---|
| Dashboard | "Projects", "Open project", teks EN | "Studio Belajar", resume card, status modul, teks sesuai locale |
| Sidebar | "My Projects/Shared", overlay tanpa a11y | "Modul/Progres", persistent di desktop, drawer aksesibel |
| Latihan | Umpan balik hilang 0,8–1 dtk, tombol ikon tanpa label | Feedback menetap + jawaban benar/penjelasan, label lengkap |
| Hasil | Hanya soal + penjelasan | Jawabanmu + jawaban benar + penjelasan + ulangi salah |
| Bahasa | EN dipaksa, `jp` tidak dipetakan | UI per rute, konten per `targetLanguage`, `jp`→`ja`/`ja-JP` |

---

## 2. Masalah & Temuan Audit

Audit dilakukan pada kode saat ini (`app/[lang]/learn`, `app/components/editor/**`, `app/locales/**`).

| # | Temuan | Bukti | Dampak UX |
|---|---|---|---|
| A-01 | Seluruh teks editor hardcoded bahasa Inggris; tidak ada satu pun `useTranslation` di area editor | `grep useTranslation app/components/editor` → 0 hasil | `/id` dan `/jp` tetap berbahasa Inggris |
| A-02 | Bahasa isi latihan dipaksa `"en"` di workspace | `workspace-page.tsx:12–13` (`lang="en"`) | Pengguna yang belajar Jepang/Indonesia tetap mendapat konten Inggris |
| A-03 | Kode rute `jp` tidak dipetakan ke kode konten `ja` | `i18n-config.ts:5` (`jp`), `number-data.ts:62` (`ja`), `schemas.ts:17` (`ja`) | Risiko `undefined`, fallback diam-diam ke Inggris, dan TTS salah |
| A-04 | Mastery test hardcoded `"en"` | `mastery-phase.tsx:35` (`getNumberWord(answer, "en")`) | Soal mastery selalu menampilkan kata Inggris |
| A-05 | Grammar mengabaikan prop `lang` | `grammar-module.tsx:565` (`lang: _lang`) | Grammar Inggris tampil di rute bahasa apa pun |
| A-06 | Data angka Jepang tidak lengkap (21–99, ratusan, 2,5 juta); Indonesia juga tidak punya 2,5 juta | `number-data.ts:49–70` | Kata angka jatuh ke angka mentah/Inggris |
| A-07 | Umpan balik benar/salah hilang otomatis | `multiple-choice.tsx:22` (800ms), `fill-blank.tsx:57`, `sentence-ordering.tsx:68`, `correction.tsx:44` (1000ms) | Penjelasan hanya terbaca <1 detik lalu soal berganti |
| A-08 | Number Name tidak memanggil API attempt yang sudah tersedia | Tidak ada `fetch(` di `components/editor/number-name/**`; API ada di `app/api/v1/number-attempts` | XP/progres hilang saat refresh |
| A-09 | Navigasi fase tidak konsisten | Number: semua fase bisa diklik (`number-name-module.tsx:63`); Grammar: hanya fase selesai (`grammar-module.tsx:116`) | Pengguna bisa melompat ke mastery tanpa belajar |
| A-10 | GamificationBar diduplikasi dan metriknya ambigu | `number-name/gamification-bar.tsx` + `grammar/grammar-module.tsx:25–101`; label "day streak" padahal bertambah per jawaban | XP/streak/lives tidak dapat dipercaya |
| A-11 | Drawer sidebar tanpa dialog semantics | `project-sidebar.tsx` — tidak ada `aria-modal`, focus trap, Escape, scroll lock | Pengguna keyboard/screen reader bisa "tersesat" |
| A-12 | Tombol ikon tanpa label | toggle sidebar (`editor-navbar.tsx:16`), tombol audio (`listen-pick-phase.tsx:87`), tombol tutup | Screen reader hanya membaca "button" |
| A-13 | Kontras teks rendah | `text-white/20` (1,90:1), `/30` (2,73:1), `/40` (3,83:1) pada `#1a1a1a`; 21× `text-[10px]`, 2× `text-[8px]` | Teks sekunder/timer tidak terbaca, gagal WCAG AA |
| A-14 | Warna hardcoded, bukan token | 90× `#d2ff5e`, 40× `#252525`, 34× `#2a2a2a`, dst. | Tidak konsisten dengan `ui-context.md` dan sulit dirawat |
| A-15 | Bahasa Inggris berpotensi berkedip saat first paint | `i18n.ts:32` (`lng: 'en'`) + `I18nProvider.tsx:14–18` (`useEffect`) | UI EN muncul sesaat di `/jp` dan `/id` |
| A-16 | `html lang="jp"` bukan BCP-47 yang valid | `app/layout.tsx:47` meneruskan kode rute `jp` apa adanya (fallback `en` bila header pathname tidak tersedia) | Screen reader/SEO salah bahasa; seharusnya `ja` |
| A-17 | Tidak ada resume/continue | State Number Name hanya di memori (`module-context.tsx`); Grammar sudah hidrasi dari server | Refresh = mulai dari nol untuk Number Name |
| A-18 | Review hasil tidak menampilkan jawaban pengguna | `grammar-module.tsx:500–536` hanya menampilkan soal + penjelasan | Pengguna tidak tahu apa yang salah |
| A-19 | Tidak ada metadata/SEO per locale untuk area belajar | `app/[lang]/learn/page.tsx` tanpa `generateMetadata` | Title/description tetap default |
| A-20 | Layout mobile belum diuji untuk sticky action/timer | `h-full`, `pt-14`, grid tetap, `no-scrollbar` | Risiko terpotong di layar kecil dan safe-area iOS |

---

## 3. Tujuan, Non-Tujuan, dan Metrik

### 3.1 Tujuan

- **G-1** — Semua teks antarmuka di `/en`, `/id`, `/jp` tampil dalam bahasa rute, tanpa campuran bahasa.
- **G-2** — Isi latihan selalu dalam bahasa target pengguna; tidak ada fallback diam-diam ke bahasa lain.
- **G-3** — Pengguna dapat menyelesaikan satu sesi belajar tanpa dead-end, dengan umpan balik yang jelas dan terkontrol pengguna.
- **G-4** — Progres, level, dan posisi terakhir tersimpan serta dapat dilanjutkan.
- **G-5** — Tampilan memenuhi WCAG 2.2 AA untuk area inti (kontras, keyboard, label, target sentuh, reduced motion).
- **G-6** — Satu sistem komponen dan token untuk Number Name + Grammar; tidak ada duplikasi chrome.

### 3.2 Non-Tujuan

- Modul baru (Vocabulary, Speaking, Lesson Planner) — tetap "segera hadir" dengan copy terlokalisasi.
- AI tutor, tutor marketplace, booking, dan live session.
- Penerjemahan penuh 12 locale editor (fokus EN/ID/JP; sisanya fallback EN).
- Dukungan RTL penuh untuk `ar` (disiapkan di token, implementasi terpisah).
- Penulisan kurikulum grammar Jepang/Indonesia skala penuh (dijadwalkan sebagai FS lanjutan).

### 3.3 Metrik keberhasilan

| Metrik | Target |
|---|---|
| Locale leak (string EN di `/id`/`/jp`) | 0 pada layar yang tercakup |
| Waktu sampai latihan pertama | ≤ 3 klik dari dashboard |
| Sesi latihan selesai tanpa jalan buntu | 100% jalur punya CTA keluar/lanjut |
| Umpan balik salah terbaca | 100% tetap tampil sampai pengguna menekan "Lanjut" |
| Kontras teks normal | ≥ 4,5:1 |
| Target sentuh | ≥ 44×44 px |
| Keyboard-only completion | Number Name A1 + satu pelajaran Grammar |
| Refresh/resume | Kembali ke fase/soal terakhir |

---

## 4. Definisi Bahasa (Penting)

Ada **dua bahasa independen** yang tidak boleh dicampur:

| Istilah | Sumber | Contoh | Dipakai untuk |
|---|---|---|---|
| `uiLocale` | Segmen rute `[lang]` | `en`, `id`, `jp` | Semua label, tombol, pesan, tanggal, format angka |
| `contentLanguage` | `user.targetLanguage` (kanonik) | `en`, `id`, `ja` | Kata angka, soal, penjelasan, audio TTS |
| `speechLocale` | Turunan `contentLanguage` | `ja-JP`, `id-ID`, `en-US` | `SpeechSynthesisUtterance.lang` |
| `htmlLang` | Turunan `uiLocale` | `en`, `id`, `ja` | `<html lang>` dan `lang` pada teks |

### 4.1 Tabel pemetaan

| Rute / `uiLocale` | Nama tampilan | `htmlLang` | `contentLanguage` default | `speechLocale` | Catatan |
|---|---|---|---|---|---|
| `en` | English | `en` | `en` | `en-US` | Baseline |
| `id` | Bahasa Indonesia | `id` | `id` | `id-ID` | Lengkapi data 2.500.000 |
| `jp` | 日本語 | `ja` | `ja` | `ja-JP` | Rute publik tetap `jp`; internal `ja` |

Kode konten yang sudah didukung API/schema: `en, es, fr, de, id, ja`. Rute publik memakai `jp`; **jangan** mengirim `jp` ke API/schema.

Contoh penerapan:

| URL | Bahasa UI | `html lang` | Bahasa isi (jika target pengguna) | Audio |
|---|---|---|---|---|
| `/en/editor` | English | `en` | English (`en`) | `en-US` |
| `/id/editor` | Bahasa Indonesia | `id` | Indonesia (`id`) | `id-ID` |
| `/jp/editor` | 日本語 | `ja` | Jepang (`ja`) | `ja-JP` |

### 4.2 Aturan bahasa

- **R-1** — Teks UI **selalu** dari `uiLocale`; tidak pernah dari `contentLanguage`.
- **R-2** — Teks latihan **selalu** dari `contentLanguage`; tidak ada fallback otomatis ke `en` untuk konten (fallback hanya untuk UI).
- **R-3** — Jika konten untuk `contentLanguage` tidak tersedia, tampilkan empty state terlokalisasi + CTA ke modul yang tersedia. Jangan tampilkan konten bahasa lain.
- **R-4** — Satu modul pemetaan: `toContentLanguage(uiLocale)`, `toSpeechLocale(contentLanguage)`, `toHtmlLang(uiLocale)`. Tidak boleh ada mapping lokal di komponen.
- **R-5** — Semua teks latihan diberi atribut `lang={speechLocale}` agar screen reader dan font fallback benar.
- **R-6** — Jika `targetLanguage` ≠ `toContentLanguage(uiLocale)`, tampilkan chip netral: **"Antarmuka: 日本語 · Belajar: English"** (dilokalkan) + tautan ke pengaturan. Jangan diamkan mismatch.
- **R-7** — Tidak ada penggabungan string manual. Selalu interpolasi i18next (`{{count}}`, `{{language}}`, `{{level}}`).
- **R-8** — Angka, tanggal, dan plural memakai `Intl.*` dengan locale yang dipetakan (bukan `toLocaleString()` tanpa argumen).

---

## 5. Ruang Lingkup

### 5.1 In scope

- Shell editor/learn: navbar, sidebar, breadcrumb, language chip, user menu.
- Dashboard pembelajaran.
- Number Name: 7 fase, level, gamification, feedback, ringkasan, persistensi.
- Grammar: dashboard, lesson view, practice, results, feedback.
- i18n EN/ID/JP: kunci, copy, plural, format, `html lang`, metadata.
- Resolusi bahasa target + availability matrix.
- Aksesibilitas, responsif, token warna belajar, state loading/empty/error.
- Penambahan/pemetaan kode locale dan perbaikan data angka.

### 5.2 Out of scope (spesifikasi terpisah)

- Kurikulum grammar ID/JA penuh dan katalog kurikulum multibahasa (FS-08: `08-locale-preference-and-curriculum.md`).
- Modul Vocabulary, Speaking, Lesson Planner.
- Sinkronisasi real-time lintas perangkat.
- Tema terang untuk editor (tetap dark focus mode).
- RTL penuh.
- Analytics produk (dapat menyusul; event tidak wajib di spec ini).

---

## 6. Information Architecture & Alur

### 6.1 Peta layar

```
/[lang]/editor ──redirect──> /[lang]/learn
                                  │
                                  ├── Dashboard (default)
                                  │     ├── Continue card ──> modul terakhir
                                  │     ├── Module cards ──> Number Name / Grammar
                                  │     └── Cara belajar (3 langkah)
                                  │
                                  ├── Number Name
                                  │     └── Level 1..7
                                  │           └── Fase 1..7
                                  │                 └── Ringkasan fase
                                  │                       └── Level summary
                                  │
                                  └── Grammar
                                        └── Dashboard level (A1..C1)
                                              └── Lesson
                                                    └── Practice
                                                          └── Results
```

Global: **Navbar** (breadcrumb + chip bahasa + user menu) dan **Sidebar** (modul + progres).

### 6.2 Alur utama (happy path)

1. Pengguna membuka `/[lang]/learn`.
2. Sistem memuat profil, `uiLocale`, `contentLanguage`, dan progres.
3. Dashboard menampilkan sapaan, bahasa/level, target harian, dan kartu "Lanjutkan belajar" (jika ada sesi terakhir) atau "Mulai belajar".
4. Pengguna memilih modul yang tersedia untuk bahasanya.
5. Pengguna memilih level/pelajaran; melihat tujuan dan estimasi waktu.
6. Pengguna mengerjakan latihan; setiap jawaban mendapat umpan balik yang tetap tampil sampai "Lanjut".
7. Ringkasan/hasil menampilkan skor, XP, jawaban pengguna, jawaban benar, dan penjelasan.
8. Pengguna memilih "Ulangi", "Lanjut ke ...", atau "Kembali ke dashboard".
9. Progres tersimpan; refresh mengembalikan posisi terakhir.

### 6.3 Wireframe ringkas

**Dashboard (desktop)**
```
┌──────────────────────────────────────────────────────────────┐
│ ☰   Studio Belajar / Number Name        [日本語 ▾]  [Avatar] │
├──────────────┬───────────────────────────────────────────────┤
│  BELAJAR     │ おかえりなさい、Asep                          │
│  ▸ Number    │ 学習中の言語: 日本語 · レベル A1               │
│  ▸ Grammar   │ ┌───────────────────────────────────────────┐ │
│              │ │ 学習を続ける                              │ │
│  PROGRES     │ │ Number Name · Level 1 · Flashcard 3/11    │ │
│  ▸ Ringkasan │ │ [続ける →]                                │ │
│              │ └───────────────────────────────────────────┘ │
│              │  学習モジュール                                │
│              │  [Number Name ✓] [Grammar —] [Speaking 準備中]│
└──────────────┴───────────────────────────────────────────────┘
```

**Latihan (mobile)**
```
┌─────────────────────────────┐
│ ←  Number Name   3/10   ♥♥♥ │
├─────────────────────────────┤
│  [==== timer ====]          │
│                             │
│   🔊  Ketuk untuk mendengar │
│                             │
│   [ 7 ]      [ 12 ]         │
│   [ 19 ]     [ 21 ]         │
│                             │
│  ✓ Benar! +10 XP            │
│  [ Lanjut ]                 │  ← sticky, safe-area
└─────────────────────────────┘
```

---

## 7. Persyaratan Fungsional

### FR-01 — Routing, locale, dan metadata

- `/[lang]/editor` tetap redirect ke `/[lang]/learn`; pertahankan query/`next` dan jangan kehilangan locale. Gunakan `redirect()` yang ada; bila perlu `permanentRedirect` setelah rute stabil.
- Semua tautan internal di area belajar **wajib** menyertakan `/${lang}`. Tidak boleh ada `href="/learn"`.
- Validasi `[lang]` terhadap `languages`; locale tidak dikenal → 404 (sudah ada di layout).
- Tambahkan `generateMetadata` untuk `/[lang]/learn` dan modul: title/description terlokalisasi, `robots: { index: false }` untuk area privat.
- `<html lang>` harus memakai `toHtmlLang(uiLocale)` (`jp` → `ja`), bukan kode rute mentah.
- Redirect setelah onboarding/sign-in harus tetap menghormati locale.
- Saat berpindah `uiLocale`, pertahankan path dan modul aktif bila memungkinkan (`/jp/learn` → `/id/learn`).

**Acceptance:** `/jp/editor` → `/jp/learn` → `/jp/sign-in` saat belum login; setelah login tetap di `/jp/...`; `document.documentElement.lang === "ja"` untuk `/jp`.

---

### FR-02 — Arsitektur i18n

- Tambahkan namespace `learning` di `app/locales/{en,id,jp}.json` (struktur di §9). Kunci `en` adalah sumber kebenaran.
- Gunakan `useTranslation()` di **setiap** komponen klien area belajar. Tidak ada string user-facing literal.
- Perbaiki `I18nProvider` agar bahasa aktif diset **sebelum render pertama** (panggil `i18n.changeLanguage(locale)` secara sinkron di body provider dengan guard `if (i18n.language !== locale)`), bukan hanya di `useEffect`. Efek tetap dipertahankan untuk perubahan berikutnya.
- Tambahkan tipe kunci (`app/locales/i18next.d.ts` + `CustomTypeOptions`) agar salah ketik kunci = error TypeScript.
- Tambahkan skrip `scripts/check-locales.mjs` + `npm run check:locales`:
  - semua kunci `en` ada di `id` dan `jp`;
  - tidak ada kunci kosong;
  - nilai non-`en` tidak identik dengan `en` untuk kunci yang wajib diterjemahkan (kecuali istilah seperti "XP").
- Fallback `fallbackLng: "en"` tetap ada, tetapi **hanya untuk UI**. Konten latihan tidak boleh fallback.
- Plural: gunakan sufiks `_one`/`_other`; Jepang dan Indonesia hanya `_other`.
- Format: `Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat` dengan peta locale.

**Acceptance:** Muat `/jp/learn` dengan cache dingin; tidak ada teks EN sebelum teks JP (tidak ada flash). `npm run check:locales` lolos.

---

### FR-03 — Resolusi bahasa target & ketersediaan konten

- `app/[lang]/learn/layout.tsx` dan `editor/layout.tsx` mengirim objek bahasa ke shell:
  ```ts
  interface LearningLocaleContext {
    uiLocale: UiLocale;          // "en" | "id" | "jp"
    contentLanguage: LanguageCode; // "en" | "id" | "ja" | ...
    speechLocale: string;          // "ja-JP"
    htmlLang: string;              // "ja"
  }
  ```
- Sumber `contentLanguage`: `session.user.targetLanguage`; jika tidak valid/tidak didukung, gunakan `toContentLanguage(uiLocale)` dan tampilkan notice.
- Buat **content registry** `app/lib/learning/languages.ts`:
  ```ts
  type Availability = "full" | "partial" | "none";
  interface LanguageSupport {
    code: LanguageCode;
    label: string;        // endonym
    speechLocale: string;
    numberName: Availability;
    grammar: Availability;
  }
  ```
- Matriks MVP:

  | Bahasa | Number Name | Grammar |
  |---|---|---|
  | `en` | full | full |
  | `id` | full (setelah data dilengkapi) | none |
  | `ja` | full (setelah data dilengkapi) | none |
  | `es`, `fr`, `de` | partial | none |
  | lainnya | none | none |

- Sidebar & dashboard hanya menonjolkan modul dengan status ≠ `none`; modul `none` tetap tampil di bagian "Segera hadir" sebagai kartu non-klik dengan label "Belum tersedia untuk {{language}}" dan alasan singkat.
- Jika `grammar === none`, jangan render GrammarModule; tampilkan empty state + CTA ke Number Name.
- Chip bahasa di navbar:
  - menampilkan `contentLanguage` (endonym) + `uiLocale`;
  - menu berisi "Bahasa tampilan" (navigasi locale) dan "Yang dipelajari" (tautan ke profil/onboarding);
  - perubahan bahasa tampilan **tidak** mengubah `targetLanguage`.
- Pada kunjungan pertama ke `/[lang]/learn` ketika pengguna belum punya target eksplisit (masih default `en`), tawarkan `toContentLanguage(uiLocale)` sebagai rekomendasi satu klik ("Belajar {{language}}?"). Jangan mengubah profil tanpa konfirmasi.

**Acceptance:** `/jp/learn` dengan `targetLanguage=ja` menampilkan kata angka Jepang dan TTS `ja-JP`. `/id/learn` dengan `targetLanguage=id` menampilkan kata Indonesia. `/jp/learn` dengan `targetLanguage=en` menampilkan chip mismatch dan konten Inggris (bukan Jepang) — konsisten dengan aturan R-2.

---

### FR-04 — Shell: navbar, sidebar, breadcrumb

**Navbar**
- Kiri: tombol toggle sidebar (44×44, `aria-label` = "Buka menu"/"Tutup menu", `aria-expanded`, `aria-controls`).
- Tengah/kiri: breadcrumb `Studio Belajar / [Modul] / [Level/Fase]`; item terakhir `aria-current="page"`.
- Kanan: language chip + user menu.
- Mobile: breadcrumb dipendekkan (hanya modul), judul tetap terlihat.
- Tinggi 56–64px; konten memakai padding-top yang sesuai, tanpa tumpang tindih.

**Sidebar**
- Desktop (≥1024px): **persistent**, lebar 264–280px, dapat di-collapse; konten bergeser (bukan overlay) agar tidak menutupi latihan.
- Tablet (640–1023px): overlay drawer.
- Mobile (<640px): drawer full-height dengan scrim.
- Saat drawer terbuka: focus trap, `Escape` menutup, `aria-modal="true"`, `role="dialog"`, scroll body dikunci, fokus kembali ke tombol pemicu.
- Judul: "Belajar" (bukan "Projects"). Tab: "Modul" dan "Progres". Hapus tab "Shared" yang tidak relevan.
- Item: ikon, judul, deskripsi 1 baris, status (`Tersedia`, `Segera hadir`, `Belum tersedia`), progres ringkas.
- Tombol bawah: "Lanjutkan belajar" (bukan "New Project").

**Acceptance:** Keyboard-only dapat membuka/menutup drawer, berpindah item, dan keluar dengan Escape. Focus terlihat di semua elemen.

---

### FR-05 — Dashboard pembelajaran

Urutan konten:
1. **Sapaan** + tanggal lokal (`Selamat datang kembali`, `Selasa, 25 November`).
2. **Ringkasan bahasa & level**: chip bahasa target, level CEFR, target harian (`15 menit/hari`), streak harian.
3. **Kartu "Lanjutkan belajar"** — jika ada `lastActivity`, tampilkan modul/level/fase/soal terakhir + tombol "Lanjutkan". Jika tidak, kartu "Mulai belajar".
4. **Modul**: grid 1/2/3 kolom; setiap kartu berisi judul, deskripsi 1–2 baris, status, progres, dan CTA. Kartu non-tersedia tidak boleh terlihat seperti tombol aktif.
5. **"Cara belajar"** 3 langkah (Pilih modul → Latihan singkat → Lihat progres), dapat ditutup dan disimpan di `localStorage`.
6. **Catatan ketersediaan** jika ada modul yang belum tersedia untuk bahasa target.

Aturan:
- Tidak menggunakan istilah "project"/"editor" di UI; gunakan "modul"/"studio belajar".
- Tidak ada dua CTA yang bersaing pada satu kartu.
- Empty state (pengguna baru): fokus ke satu rekomendasi modul, bukan grid kosong.
- Jangan tampilkan `0/0` atau progres palsu; sembunyikan jika belum ada data.

**Acceptance:** Pengguna baru melihat satu CTA utama. Pengguna lama melihat resume. Semua teks mengikuti locale.

---

### FR-06 — Number Name UX

**Struktur**
- 7 level (`0–10` … `Millions`); label level dilokalkan, bukan `"Tens (20–90)"`.
- 7 fase linear: Flashcard → Listen & Pick → Tap the Number → Spell → Speed Quiz → Survival → Mastery.
- Fase terkunci sampai fase sebelumnya selesai; fase selesai dapat dibuka ulang untuk review.
- Setiap fase punya: tujuan 1 kalimat, estimasi waktu, status, skor terbaik.
- Menyelesaikan fase menampilkan **ringkasan fase** (akurasi, XP, item yang perlu diulang) dengan CTA "Lanjut ke …" / "Ulangi". **Tidak ada auto-pindah fase.**

**Perbaikan bug/perilaku**
- Hapus `lang="en"` di `workspace-page.tsx`; teruskan `contentLanguage` dari layout/provider.
- Hapus hardcoded `"en"` di `mastery-phase.tsx:35`.
- Perbaiki `getNumberWord` agar memakai `contentLanguage`; lengkapi data `id` (2.500.000) dan `ja` (21–99, 200–900, 2.500.000, 10.000.000) atau buat generator komposisi + unit test.
- Jangan reset XP/level saat berpindah level; simpan per bahasa+level.
- Lives disatukan dengan `hearts` server; jika habis, tampilkan penjelasan + "Coba lagi" (bukan dead-end).
- Fase berwaktu: beri grace 1–2 detik sebelum timer mulai, tombol pause, dan opsi perpanjangan waktu (aksesibilitas). Timer harus punya label teks, bukan hanya warna.
- Survival: setelah "Game Over", selalu ada "Main lagi" dan "Kembali".
- Mastery: tampilkan jawaban benar + kata target saat salah; ambang lulus 75% ditampilkan sejak awal ("Butuh 75% untuk lulus").

**Persistensi**
- Kirim setiap jawaban ke `POST /api/v1/number-attempts` (sudah ada) dengan `clientAttemptId` (UUID, idempoten), `languageCode` kanonik (`ja`), `phase`, `value`, `answer`, `timeSpentMs`.
- Optimistic UI: XP bertambah langsung; jika gagal, tandai "Belum tersimpan" + retry.
- Simpan `lastActivity` (modul, bahasa, level, fase, index) di server (lihat FR-09); `localStorage` sebagai cache.

**Acceptance:** Selesaikan Flashcard → ringkasan muncul → "Lanjut" membuka Listen & Pick. Refresh → kembali ke fase terakhir. Jawaban salah menampilkan kata target + audio replay. Tidak ada kata Inggris ketika `contentLanguage=ja`.

---

### FR-07 — Grammar UX

- Gunakan `contentLanguage`; jika `grammar === "none"`, jangan render modul (FR-03).
- Dashboard:
  - selector CEFR dengan jumlah pelajaran dan deskripsi level;
  - kartu pelajaran: judul, kategori, jumlah soal, estimasi menit, status, skor terakhir;
  - filter kategori + pencarian (opsional P1);
  - "Lanjutkan pelajaran" jika ada posisi terakhir.
- Lesson view:
  - header: level, kategori, judul, deskripsi, estimasi waktu;
  - bagian: Explanation → Key Rules → Examples → Tables → Tips;
  - CTA sticky "Mulai latihan" + "Kembali".
- Practice:
  - **hapus** `setTimeout` auto-advance; jawaban memicu feedback yang tetap tampil sampai "Lanjut";
  - feedback wajib memuat: status, jawaban pengguna, jawaban benar, penjelasan;
  - navigasi keyboard: `1–4`/`A–D` untuk pilihan, `Enter` untuk submit/next, `Esc` untuk keluar dengan konfirmasi;
  - progress bar `role="progressbar"` + `aria-valuenow`; teks "Soal 3 dari 10";
  - focus otomatis ke pertanyaan berikutnya setelah "Lanjut"; focus terlihat;
  - keluar di tengah latihan → dialog "Progresmu tersimpan. Keluar?" (ya/tidak).
- Results:
  - akurasi, XP, benar/total, waktu;
  - review per soal: pertanyaan, **jawabanmu**, **jawaban benar**, penjelasan;
  - filter "Salah saja"; tombol "Ulangi yang salah", "Ulangi pelajaran", "Pelajaran berikutnya";
  - jangan tampilkan `0` XP sebagai kegagalan; beri pesan pertumbuhan.
- Persistensi: pertahankan API `POST /api/v1/attempts` dan `POST /api/v1/lessons/[id]/complete`; simpan `currentExerciseIndex` agar resume tepat.

**Acceptance:** Menjawab salah menampilkan penjelasan dan jawaban benar minimal sampai pengguna menekan "Lanjut". Review hasil memuat jawaban pengguna. Refresh saat latihan mengembalikan soal yang sama.

---

### FR-08 — Sistem umpan balik (shared component)

Buat satu komponen `FeedbackPanel` untuk Number Name dan Grammar:

| State | Isi | Aksi |
|---|---|---|
| `correct` | ikon centang + "Benar!" + XP | Lanjut |
| `incorrect` | ikon silang + "Belum tepat" + jawaban benar + penjelasan + replay audio (jika ada) | Lanjut / Coba lagi |
| `skipped` | "Dilewati" + jawaban benar + penjelasan | Lanjut |
| `timeout` | "Waktu habis" + jawaban benar + penjelasan | Lanjut / Coba lagi |
| `saving` | "Menyimpan…" (non-blocking) | — |
| `save-error` | "Belum tersimpan" | Coba lagi |

Aturan:
- `aria-live="polite"` pada container feedback; `role="status"`.
- Jangan pernah auto-menavigasi < 2 detik; idealnya hanya lewat aksi pengguna.
- Warna tidak boleh satu-satunya penanda: selalu ada ikon + teks.
- Animasi masuk 150–200ms; hormati `prefers-reduced-motion`.
- Feedback tidak boleh menutupi tombol "Lanjut" di layar kecil.

---

### FR-09 — Progres, resume, dan sinkronisasi

- Buat `LearningProgressProvider` (client) yang:
  - menghidrasi statistik dari `GET /api/v1/progress/grammar` (dan endpoint stats yang tersedia);
  - menyimpan `lastActivity` per `contentLanguage` di `localStorage` + server (P1);
  - menyediakan `resumeTarget`, `saveActivity`, `markPhaseComplete`, `resetModule`.
- Status simpan terlihat: `Tersimpan` / `Menyimpan…` / `Offline — akan disinkronkan`.
- Saat offline: antrean attempt disimpan lokal dan dikirim saat online (idempoten).
- "Mulai ulang" selalu meminta konfirmasi dan menjelaskan apa yang direset.
- XP tidak boleh reset saat ganti level/bahasa; gunakan statistik server.
- Jangan menampilkan streak "day" jika yang dihitung adalah jawaban benar. Pisahkan:
  - **Streak harian** (server `streakCurrent`) — tampil di shell/dashboard;
  - **Combo sesi** (jawaban benar berturut-turut) — tampil di dalam latihan dengan label "Combo".

**Acceptance:** Selesaikan 3 soal → refresh → dashboard menampilkan "Lanjutkan" di soal ke-4. XP tidak berubah.

---

### FR-10 — Audio / Text-to-Speech

`useSpeech` ditingkatkan menjadi:

```ts
interface UseSpeechResult {
  speak: (text: string, locale: string) => void;
  cancel: () => void;
  speaking: boolean;
  supported: boolean;
  error: "unsupported" | "no-voice" | "blocked" | null;
}
```

- Pilih voice: exact `lang` → prefix bahasa → voice default; tunggu `voiceschanged`.
- Rate 0.85–0.9; tidak memotong audio saat replay (cancel lalu speak).
- Tombol audio: 44×44, `aria-label` dinamis ("Putar audio"/"Hentikan audio"), state visual + `aria-pressed`.
- Audio hanya diputar setelah gesture pengguna (tidak ada autoplay).
- Jika tidak ada voice untuk bahasa target: tampilkan pesan terlokalisasi + tetap tampilkan kata secara visual; jangan gagal diam-diam.
- Sediakan transkrip/kata setelah jawaban dijawab (aksesibilitas).
- Hormati preferensi mute pengguna.

**Acceptance:** Di `/jp` dengan `targetLanguage=ja`, audio memakai `ja-JP`; jika voice Jepang tidak ada, muncul pesan JP yang jelas, bukan diam.

---

### FR-11 — Loading, empty, error, offline

- Loading: skeleton dengan ukuran sama seperti konten final (tidak ada layout shift).
- Empty: ikon + penjelasan + satu CTA.
- Error: pesan manusiawi, kode error tidak ditampilkan ke pengguna; tombol "Coba lagi".
- Offline: banner "Kamu sedang offline. Progres akan disinkronkan saat online."
- API error dipetakan dari `{ error, code }` ke kunci i18n; tidak pernah menampilkan pesan server mentah (apalagi bahasa Indonesia hardcoded di API) ke UI berbahasa Jepang.
- 401 → redirect ke sign-in dengan `next` yang benar; 403/404 → state yang sesuai.

---

### FR-12 — Aksesibilitas (WCAG 2.2 AA)

- Kontras teks normal ≥ 4,5:1; teks besar ≥ 3:1. Pada `#1a1a1a`, gunakan minimal `text-white/50` untuk teks normal (5,18:1) dan `text-white/70` untuk teks sekunder penting; `white/30` hanya untuk dekorasi.
- Ukuran font minimum 12px; 10px/8px dilarang untuk konten yang perlu dibaca.
- Semua kontrol punya nama aksesibel; ikon dekoratif `aria-hidden`.
- Fokus terlihat (ring 2px + offset) dan urutan fokus logis.
- Target sentuh ≥ 44×44 px.
- Struktur heading benar (satu `h1` per layar), landmark (`header`, `nav`, `main`), skip link.
- `aria-live` untuk feedback dan status simpan; jangan mengumumkan timer setiap 100ms.
- Timer: dapat dijeda/diperpanjang; jangan menghukum pengguna yang butuh waktu.
- Hormati `prefers-reduced-motion`; animasi flip/timer tidak wajib.
- Bahasa teks: `lang` pada `<html>` dan pada kata/soal bahasa target.
- Uji dengan keyboard, screen reader (VoiceOver/NVDA), dan zoom 200%.

---

### FR-13 — Responsif

- Breakpoint: `<640` mobile, `640–1023` tablet, `≥1024` desktop.
- Gunakan `min-h-dvh`/`100dvh`, bukan `100vh`, untuk layar dengan keyboard mobile.
- Konten latihan maksimal 720px; padding 16px mobile, 24–32px desktop.
- Action bar bawah sticky dengan `padding-bottom: env(safe-area-inset-bottom)`.
- Grid dashboard 1/2/3 kolom; kartu tidak memaksa horizontal scroll.
- Timer/angka besar tidak terpotong pada 375×667 dan 320px.
- Tombol utama selalu terlihat tanpa scroll pada layar latihan (kecuali keyboard terbuka).
- Drawer mobile menutup saat navigasi.

---

### FR-14 — Visual & token

- Tambahkan token belajar di `app/globals.css` + `@theme inline`:
  ```css
  --learn-bg: #141414;
  --learn-surface: #1e1e1e;
  --learn-surface-raised: #252525;
  --learn-border: #333333;
  --learn-border-strong: #4a4a4a;
  --learn-text: #f5f5f5;
  --learn-text-secondary: #c7c7c7;
  --learn-text-muted: #a3a3a3;
  --learn-accent: #d2ff5e;
  --learn-accent-strong: #c4f040;
  --learn-accent-ink: #171717;
  --learn-success: #4ade80;
  --learn-danger: #f87171;
  --learn-warning: #fbbf24;
  ```
- Ganti seluruh raw hex/`bg-[#...]`/`text-white/xx` di komponen editor dengan token/utility turunan. Tidak ada `#d2ff5e` literal di komponen.
- Skala tipe: 12 / 14 / 16 / 20 / 24 / 32; body 14–16px; line-height 1.5 (Latin), 1.75 (CJK).
- Radius: 8px kecil, 16px kartu, 24px modal, full untuk pill.
- Spacing kelipatan 4 (4/8/12/16/24/32).
- Focus ring: `outline: 2px solid var(--learn-accent); outline-offset: 2px`.
- Motion 150–250ms ease-out.
- Font CJK: `:lang(ja) { font-family: "Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif; }`; jangan memuat font CJK 5MB tanpa perlu.
- Ikon: Lucide, ukuran 16/20/24, stroke 1.5–2.

---

### FR-15 — Konten

- Number Name: data `id` dan `ja` lengkap 0–10.000.000 (atau generator + test); tidak ada fallback Inggris.
- Grammar: konten `en` dipertahankan; untuk `id`/`ja` tampilkan belum tersedia. Kurikulum A1 ID/JA dan katalog JLPT/CEFR masuk FS-08 (`08-locale-preference-and-curriculum.md`) dengan skema yang sama (`GrammarLesson`, `GrammarExercise`).
- Label fase/level/kategori diterjemahkan; jangan menerjemahkan istilah teknis CEFR (A1–C1) tetapi beri deskripsi terlokalisasi.
- Copy Indonesia dan Jepang harus ditinjau penutur asli; mesin terjemahan tidak boleh langsung dipublikasikan.
- Tidak ada teks promosi di dalam latihan.

---

## 8. Kontrak Data & API

### 8.1 Tipe bersama

```ts
// app/lib/i18n/locales.ts
export type UiLocale = "en" | "id" | "jp";
export interface LocaleConfig {
  uiLocale: UiLocale;
  label: string;
  htmlLang: string;
  defaultContentLanguage: LanguageCode;
}

// app/lib/learning/languages.ts
export type LanguageCode = "en" | "es" | "fr" | "de" | "id" | "ja";
export type ModuleAvailability = "full" | "partial" | "none";
export interface LanguageSupport {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  speechLocale: string;
  numberName: ModuleAvailability;
  grammar: ModuleAvailability;
}
```

- `LanguageCode` untuk konten **tidak** memakai `jp`.
- `UiLocale` **boleh** `jp`; konversi di satu tempat.
- Perbarui `NumberAttemptSchema`/`OnboardingSchema` hanya jika menambah bahasa baru; untuk saat ini samakan dengan `en, es, fr, de, id, ja`.

### 8.2 Endpoint yang dipakai

| Endpoint | Kegunaan | Perubahan |
|---|---|---|
| `POST /api/v1/number-attempts` | Simpan jawaban Number Name | Wire dari UI; kirim `ja` untuk Jepang |
| `GET /api/v1/progress/grammar` | Hidrasi XP/streak/completed | Tetap |
| `POST /api/v1/attempts` | Simpan jawaban Grammar | Tetap |
| `POST /api/v1/lessons/[id]/complete` | Tandai pelajaran selesai | Tetap |
| `PATCH /api/v1/me` | Ganti target language | Sudah ada; validasi enum `ja` sebelum dipakai chip |

- Error shape tetap `{ error: string; code: string }`; UI memetakan `code` ke i18n.
- Tidak ada endpoint baru untuk MVP resume; gunakan `localStorage` + data stats. Server-side `lastActivity` (P1) memerlukan perubahan schema dan harus diperbarui di `architecture-context.md` lebih dulu.

### 8.3 Event analitik (opsional, P2)

`learning_module_opened`, `phase_completed`, `exercise_answered`, `lesson_completed`, `language_switched` — tanpa PII.

---

## 9. Struktur Kunci i18n & Copy

### 9.1 Struktur JSON

```json
{
  "learning": {
    "common": {
      "back": "Kembali",
      "close": "Tutup",
      "next": "Lanjut",
      "continue": "Lanjutkan",
      "retry": "Coba lagi",
      "loading": "Memuat…",
      "saved": "Progres tersimpan"
    },
    "shell": {
      "studio": "Studio Belajar",
      "openMenu": "Buka menu",
      "closeMenu": "Tutup menu",
      "learningLanguage": "Bahasa yang dipelajari",
      "interfaceLanguage": "Bahasa tampilan",
      "modules": "Modul",
      "progress": "Progres"
    },
    "dashboard": {
      "welcome": "Selamat datang kembali",
      "continueTitle": "Lanjutkan belajar",
      "startTitle": "Mulai belajar",
      "dailyGoal": "Target harian",
      "minutes": "{{count}} menit",
      "available": "Tersedia",
      "comingSoon": "Segera hadir",
      "notAvailable": "Belum tersedia untuk {{language}}"
    },
    "numberName": {
      "title": "Nama Angka",
      "tapToReveal": "Ketuk untuk melihat",
      "tapToHear": "Ketuk untuk mendengar angka",
      "level": "Level {{level}}",
      "phaseProgress": "Fase {{current}} dari {{total}}",
      "lives": "{{count}} nyawa",
      "combo": "Combo {{count}}",
      "timeLeft": "Sisa {{seconds}} detik"
    },
    "grammar": {
      "title": "Latihan Tata Bahasa",
      "selectLevel": "Pilih levelmu",
      "lessons": "{{count}} pelajaran",
      "exercises": "{{count}} soal",
      "startPractice": "Mulai latihan",
      "seeResults": "Lihat hasil",
      "accuracy": "Akurasi",
      "xpEarned": "XP didapat",
      "yourAnswer": "Jawabanmu",
      "correctAnswer": "Jawaban benar"
    },
    "feedback": {
      "correct": "Benar!",
      "incorrect": "Belum tepat",
      "timeout": "Waktu habis",
      "explanation": "Penjelasan",
      "tryAgain": "Coba lagi"
    },
    "audio": {
      "play": "Putar audio",
      "stop": "Hentikan audio",
      "unsupported": "Audio tidak didukung di perangkat ini.",
      "noVoice": "Suara untuk {{language}} tidak tersedia di perangkat ini. Kamu tetap bisa membaca kata dan teksnya."
    },
    "states": {
      "emptyTitle": "Belum ada progres",
      "emptyBody": "Selesaikan satu latihan untuk mulai membangun progresmu.",
      "errorTitle": "Terjadi kesalahan",
      "errorBody": "Coba lagi. Jika masih gagal, muat ulang halaman.",
      "offline": "Kamu sedang offline. Progres akan disinkronkan saat online."
    }
  }
}
```

> Nilai di atas adalah contoh `id`; versi `en`/`jp` wajib diisi dengan kunci yang sama.

### 9.2 Tabel copy inti (EN / ID / JP)

| Kunci | English | Bahasa Indonesia | 日本語 |
|---|---|---|---|
| `shell.studio` | Learning Studio | Studio Belajar | 学習スタジオ |
| `numberName.title` | Number Name | Nama Angka | 数字の読み方 |
| `grammar.title` | Grammar Practice | Latihan Tata Bahasa | 文法練習 |
| `dashboard.welcome` | Welcome back | Selamat datang kembali | おかえりなさい |
| `dashboard.continueTitle` | Continue learning | Lanjutkan belajar | 学習を続ける |
| `dashboard.startTitle` | Start learning | Mulai belajar | 学習を始める |
| `dashboard.dailyGoal` | Daily goal | Target harian | 1日の目標 |
| `dashboard.available` | Ready | Tersedia | 利用可能 |
| `dashboard.comingSoon` | Coming soon | Segera hadir | 準備中 |
| `dashboard.notAvailable` | Not available for {{language}} yet | Belum tersedia untuk {{language}} | {{language}}ではまだ利用できません |
| `shell.learningLanguage` | Learning language | Bahasa yang dipelajari | 学習中の言語 |
| `shell.interfaceLanguage` | Interface language | Bahasa tampilan | 表示言語 |
| `feedback.correct` | Correct! | Benar! | 正解！ |
| `feedback.incorrect` | Not quite | Belum tepat | おしい！ |
| `feedback.explanation` | Explanation | Penjelasan | 解説 |
| `grammar.yourAnswer` | Your answer | Jawabanmu | あなたの答え |
| `grammar.correctAnswer` | Correct answer | Jawaban benar | 正しい答え |
| `grammar.accuracy` | Accuracy | Akurasi | 正答率 |
| `grammar.xpEarned` | XP earned | XP didapat | 獲得XP |
| `common.next` | Next | Lanjut | 次へ |
| `common.continue` | Continue | Lanjutkan | 続ける |
| `common.retry` | Try again | Coba lagi | もう一度 |
| `common.back` | Back | Kembali | 戻る |
| `common.close` | Close | Tutup | 閉じる |
| `common.saved` | Progress saved | Progres tersimpan | 進捗を保存しました |
| `numberName.tapToReveal` | Tap to reveal | Ketuk untuk melihat | タップして表示 |
| `numberName.tapToHear` | Tap to hear the number | Ketuk untuk mendengar angka | タップして数字を聞く |
| `numberName.lives` | {{count}} lives | {{count}} nyawa | ライフ{{count}} |
| `numberName.combo` | Combo {{count}} | Combo {{count}} | コンボ{{count}} |
| `grammar.startPractice` | Start practice | Mulai latihan | 練習を始める |
| `grammar.seeResults` | See results | Lihat hasil | 結果を見る |
| `grammar.selectLevel` | Select your level | Pilih levelmu | レベルを選択 |
| `audio.play` | Play audio | Putar audio | 音声を再生 |
| `audio.noVoice` | Audio for {{language}} is unavailable on this device. You can still read the word and text. | Suara untuk {{language}} tidak tersedia di perangkat ini. Kamu tetap bisa membaca kata dan teksnya. | {{language}}の音声はこの端末で利用できません。単語とテキストは読めます。 |
| `states.offline` | You're offline. Progress will sync when you're back online. | Kamu sedang offline. Progres akan disinkronkan saat online. | オフラインです。オンラインに戻ると進捗が同期されます。 |

### 9.3 Glosarium istilah

| EN | ID | JP | Catatan |
|---|---|---|---|
| XP | XP | XP | Jangan diterjemahkan |
| Level | Level | レベル | — |
| Streak | Rentetan | 連続学習 | Harian, bukan per jawaban |
| Lives | Nyawa | ライフ | — |
| Accuracy | Akurasi | 正答率 | — |
| Lesson | Pelajaran | レッスン | — |
| Exercise | Soal | 問題 | — |
| Practice | Latihan | 練習 | — |
| Hint | Petunjuk | ヒント | — |
| Review | Ulasan | 復習 | — |
| Module | Modul | 学習モジュール | Bukan "project" |

---

## 10. Arsitektur Implementasi (usulan)

```
app/
  lib/
    i18n/
      locales.ts              # UiLocale, map rute→konten/TTS, toHtmlLang
      use-learning-locale.ts  # hook client
    learning/
      languages.ts            # LanguageSupport + availability
      number-words.ts         # generator + fallback terkontrol (tanpa EN)
  components/
    editor/
      learning-provider.tsx   # locale + progress + lastActivity
      shared/
        learning-header.tsx
        language-chip.tsx
        user-menu-slot.tsx
        feedback-panel.tsx
        gamification-strip.tsx
        progress-ring.tsx
        module-card.tsx
        audio-button.tsx
        empty-state.tsx
        confirm-dialog.tsx
      editor-shell.tsx        # komposisi baru
      editor-navbar.tsx       # breadcrumb + a11y
      project-sidebar.tsx     # → sidebar-nav.tsx (nama baru)
      welcome-dashboard.tsx   # dashboard baru
      workspace-page.tsx      # meneruskan contentLanguage
      number-name/
        number-name-module.tsx
        level-path.tsx
        phase-summary.tsx
        *-phase.tsx
      grammar/
        grammar-module.tsx
        dashboard-phase.tsx
        lesson-view.tsx
        practice-phase.tsx
        results-phase.tsx
  locales/
    en.json id.json jp.json
    i18next.d.ts
scripts/
  check-locales.mjs
```

Catatan:
- `app/components/editor/**` adalah lokasi aktual; jangan memindahkan ke `components/` global pada spec ini.
- Pertahankan pembagian server/client: layout tetap Server Component; provider/komponen interaktif `"use client"`.
- Jangan menambah dependency baru untuk i18n; `i18next`/`react-i18next` sudah ada.
- `Intl` tidak butuh polyfill untuk browser target.

---

## 11. Acceptance Criteria

| ID | Skenario | Ekspektasi |
|---|---|---|
| AC-01 | Buka `/en/learn` (login, target `en`) | Semua chrome EN; Number Name & Grammar tersedia |
| AC-02 | Buka `/id/learn` (target `id`) | Chrome ID; tidak ada string EN; Number Name ID; Grammar menunjukkan "belum tersedia" |
| AC-03 | Buka `/jp/learn` (target `ja`) | Chrome JP; `html lang="ja"`; kata angka Jepang; TTS `ja-JP` |
| AC-04 | Buka `/jp/learn` (target `en`) | Chrome JP; konten EN; chip mismatch terlihat + tautan ubah |
| AC-05 | `/jp/editor` tanpa login | Redirect `/jp/sign-in?next=/jp/editor`; setelah login mendarat di `/jp/learn` |
| AC-06 | Muat `/jp/learn` cache dingin | Tidak ada flash teks EN |
| AC-07 | Jawab salah di Number Name | Kata target + jawaban benar + penjelasan + replay audio; tetap sampai "Lanjut" |
| AC-08 | Jawab salah di Grammar | Jawabanmu, jawaban benar, penjelasan tampil; tidak auto-advance |
| AC-09 | Refresh di tengah latihan | Kembali ke soal/fase terakhir; XP tidak reset |
| AC-10 | Selesaikan satu fase | Ringkasan fase + CTA lanjut; tidak lompat otomatis |
| AC-11 | Selesaikan pelajaran Grammar | Results memuat review lengkap dan aksi ulangi/next |
| AC-12 | Keyboard-only | Dapat membuka sidebar, memilih modul, menjawab, lanjut, keluar |
| AC-13 | Screen reader | Tombol ikon punya nama; feedback diumumkan; heading logis |
| AC-14 | Zoom 200% / 320px | Tidak ada horizontal scroll; CTA tetap terlihat |
| AC-15 | `prefers-reduced-motion` | Tidak ada animasi flip/timer yang mengganggu |
| AC-16 | Audio tanpa voice Jepang | Pesan JP jelas; latihan tetap bisa diselesaikan |
| AC-17 | Offline saat menjawab | Banner offline; jawaban diantrekan; sinkron saat online |
| AC-18 | Ganti bahasa UI | Path dipertahankan; isi latihan tidak berubah |
| AC-19 | `npm run check:locales` | 0 kunci hilang, 0 kunci kosong |
| AC-20 | `npm run lint` + `npm run build` | Lolos (kecuali issue lint pre-existing yang didokumentasikan) |

---

## 12. Rencana Pengujian

### 12.1 Matriks manual

| Dimensi | Nilai |
|---|---|
| Locale UI | `en`, `id`, `jp` |
| Konten | `en`, `id`, `ja` (serta mismatch) |
| Modul | Dashboard, Number Name (7 fase), Grammar (lesson/practice/results) |
| State | Loading, empty, error, offline, resume, selesai |
| Perangkat | 320px, 375px (iPhone SE), 768px, 1440px |
| Input | Mouse, touch, keyboard-only, screen reader |
| Preferensi | Reduced motion, zoom 200%, dark mode OS |

### 12.2 Pemeriksaan otomatis (minimum)

- `npm run check:locales` — paritas kunci EN/ID/JP.
- Unit test murni (`node --test` atau vitest bila ditambahkan):
  - `toContentLanguage("jp") === "ja"`, `toHtmlLang("jp") === "ja"`;
  - `getNumberWord(21, "ja")`, `getNumberWord(2_500_000, "id")` menghasilkan kata yang diharapkan;
  - tidak ada `undefined`/string angka mentah untuk 0–10.000.000 pada `en`, `id`, `ja`.
- `npm run lint`, `npm run build`.
- (Opsional P2) Playwright: 3 locale × happy path + screenshot.

### 12.3 Audit aksesibilitas

- Lighthouse/axe pada dashboard, latihan, hasil.
- Uji VoiceOver (macOS/iOS) untuk label tombol audio dan feedback.
- Uji tab order dan Escape pada drawer.
- Cek kontras dengan tool (rasio pada §2 A-13).

---

## 13. Rencana Implementasi Bertahap

### P0 — Fondasi (3–5 hari)

- [x] `app/lib/i18n/locales.ts` + `toContentLanguage`/`toHtmlLang`/`toSpeechLocale`.
- [x] Kunci `learning` EN/ID/JP + `check:locales` + tipe kunci.
- [x] Sinkronkan `I18nProvider` (tanpa flash) dan `html lang`.
- [x] Teruskan `contentLanguage` dari layout → shell → workspace → modul; hapus `lang="en"`.
- [x] Perbaiki hardcoded `"en"` di mastery; perbaiki data angka `id`/`ja`.
- [x] Lokalisasi shell, sidebar, dashboard, label fase/level.
- [x] Feedback: hapus auto-advance; `FeedbackPanel` dengan jawaban benar + penjelasan.
- [x] Token `--learn-*`; ganti raw hex/opacity rendah; minimal font 12px.
- [x] `aria-label` tombol ikon; focus ring; `aria-live` feedback.

### P1 — Pengalaman & persistensi (4–6 hari)

- [ ] Sidebar desktop persistent + drawer aksesibel (focus trap/Escape).
- [ ] Dashboard baru: resume card, bahasa/level, daily goal, cara belajar.
- [ ] Ringkasan fase Number Name + navigasi linear + level path.
- [ ] Wire `POST /api/v1/number-attempts` + optimistic UI + error retry.
- [ ] Grammar: feedback/answers review, resume exercise, exit confirm.
- [x] Audio hook baru + state unsupported/no-voice (voice per bahasa + pilihan female/male).
- [ ] Responsif + sticky action bar + `dvh`/safe-area.
- [ ] Loading/empty/error/offline state.

### P2 — Konten & kualitas (terpisah)

- [ ] Katalog kurikulum multibahasa, termasuk grammar A1 `id`/`ja` (FS-08) — konten, bukan sekadar terjemahan UI.
- [ ] Terjemahan 9 locale lain atau badge "English only".
- [ ] Playwright + visual regression.
- [ ] Analytics event.

**Definition of Done:** AC-01…AC-20 lolos; tidak ada teks **UI** EN di `/id`/`/jp` pada layar yang dicakup; build dan lint bersih (atau issue pre-existing terdokumentasi); `progress-tracker.md` diperbarui.

---

## 14. Risiko & Keputusan Terbuka

| # | Risiko/Keputusan | Dampak | Mitigasi |
|---|---|---|---|
| R-01 | Kualitas terjemahan JP/ID | Kepercayaan pengguna | Review penutur asli; jangan rilis hasil mesin mentah |
| R-02 | Biaya konten kurikulum multibahasa | Modul/kurikulum kosong di banyak locale | Empty state jelas + roadmap FS-08 |
| R-03 | Voice TTS Jepang tidak tersedia di sebagian perangkat | Latihan listening gagal | Fallback visual + pesan jelas |
| R-04 | Scope creep redesign total | P0 mundur | Batasi P0 pada fondasi + feedback + a11y |
| R-05 | Perubahan schema untuk resume server | Migrasi data | P0 pakai localStorage; schema di P1 dengan update architecture-context |
| R-06 | 12 locale lain | Inkonsistensi | Fallback EN + badge; prioritas EN/ID/JP |
| D-01 | Rute `/ja` sebagai alias `/jp` | SEO/tautan lama | Pertahankan `/jp`; opsional 301 `/ja/*` → `/jp/*` |
| D-02 | Tema terang untuk belajar | Konsistensi brand | Tetap dark focus mode; token memudahkan migrasi nanti |
| D-03 | "Streak" = harian vs combo | Data membingungkan | Pisahkan streak harian dan combo sesi |

---

## 15. Lampiran — Bukti Audit

| File | Baris | Fakta |
|---|---|---|
| `app/[lang]/editor/page.tsx` | 12 | `/editor` redirect ke `/learn` |
| `app/components/editor/workspace-page.tsx` | 12–13 | `lang="en"` hardcoded untuk kedua modul |
| `app/components/editor/number-name/mastery-phase.tsx` | 35 | `getNumberWord(answer, "en")` |
| `app/components/editor/grammar/grammar-module.tsx` | 565 | `lang: _lang` diabaikan |
| `app/components/editor/number-name/number-data.ts` | 62–70 | Data `ja` tidak lengkap; kunci `ja`, rute `jp` |
| `app/components/editor/number-name/number-data.ts` | 73–75 | Fallback ke `en`/angka mentah |
| `app/components/editor/grammar/multiple-choice.tsx` | 22 | Auto-advance 800ms |
| `app/components/editor/grammar/fill-blank.tsx` | 57 | Auto-advance 1000ms |
| `app/components/editor/grammar/sentence-ordering.tsx` | 68 | Auto-advance 1000ms |
| `app/components/editor/grammar/correction.tsx` | 44 | Auto-advance 1000ms |
| `app/components/editor/grammar/module-context.tsx` | 69–115, 141–245 | Sudah ada hidrasi + persistensi Grammar |
| `app/components/editor/number-name/module-context.tsx` | 47–133 | State Number Name hanya memori |
| `app/components/editor/project-sidebar.tsx` | 66–187 | Drawer tanpa dialog semantics |
| `app/components/editor/editor-navbar.tsx` | 16–27 | Toggle tanpa `aria-label` |
| `app/components/editor/number-name/listen-pick-phase.tsx` | 87–99 | Tombol audio tanpa label |
| `app/components/editor/number-name/gamification-bar.tsx` | 49–55 | Label "day streak" untuk hitungan per jawaban |
| `app/components/editor/grammar/grammar-module.tsx` | 25–101 | GamificationBar duplikat |
| `app/locales/*.json` | — | Tidak ada namespace `learning`; 374 baris marketing |
| `app/i18n.ts` | 32 | `lng: "en"` |
| `app/components/I18nProvider.tsx` | 14–18 | Perubahan bahasa di `useEffect` |
| `app/layout.tsx` | 47 | `<html lang>` memakai kode rute (`jp`) |
| `app/lib/auth/validation.ts` | 75, 90 | Enum bahasa target memakai `ja` |
| `app/lib/learning/schemas.ts` | 17, 22 | Enum konten memakai `ja` |
| `app/globals.css` | 6–11, 34–52 | Token global ada, tetapi editor memakai hex mentah |
| `app/components/editor/**` | — | 90× `#d2ff5e`, 21× `text-[10px]`, 2× `text-[8px]` |
