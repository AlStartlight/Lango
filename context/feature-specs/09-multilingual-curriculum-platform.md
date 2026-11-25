# Feature Spec: Platform Kurikulum Multibahasa 12 Bahasa (JLPT/CEFR)

**Spec ID:** FS-09  
**Status:** Draft — belum diimplementasikan  
**Versi:** 1.0  
**Tanggal:** 2026-11-25  
**Rute acuan:** `/[lang]/learn?module=curriculum`, `/[lang]/learn?module=curriculum&language=ja&level=N5`  
**Area:** `prisma/`, `app/api/v1/**`, `app/lib/learning/**`, `app/components/editor/curriculum/**`, `content/**`, `scripts/content/**`  
**Spec terkait:** FS-07 (learning UI), FS-08 (locale & katalog), PRD Multibahasa (`docs/PRD-multilingual-learning.md`)  
**Baseline konten:** 12 bahasa; 126.000 soal; 3.600 pelajaran; 720 unit

---

## 1. Ringkasan

Spec ini mendefinisikan implementasi teknis untuk menjadikan Lango platform pembelajaran **12 bahasa** dengan kurikulum:

- **Jepang:** JLPT N5–N1, 10.500 soal, 300 pelajaran.
- **Inggris:** CEFR A1–C1, 10.500 soal, 300 pelajaran.
- **10 bahasa lain:** CEFR A1–C1, masing-masing 10.500 soal, 300 pelajaran.
- **Total:** 126.000 soal, 3.600 pelajaran, 720 unit, ±5.200 audio listening, ±11.000 passage/script.

FS-08 sudah menetapkan **dua axis bahasa** (UI locale vs bahasa belajar), registry 12 bahasa, dan katalog kurikulum. FS-09 melengkapi bagian yang belum ada:

1. **Model konten nyata** di PostgreSQL (`Curriculum` → `Question`), bukan data statis di komponen.
2. **Pipeline authoring → QA → review → publish → monitor** untuk 126.000 item.
3. **Progres per bahasa** dan multi-enrollment dalam satu akun.
4. **Kontrak API** yang tidak membocorkan jawaban dan idempoten.
5. **Integrasi UI** ke workspace `/learn` yang sudah ada, tanpa merusak modul Number Name/Grammar.
6. **Migrasi** dari 2.232 latihan Grammar legacy dan data progres yang ada.

### 1.1 Keputusan teknis utama

| # | Keputusan | Alasan |
|---|---|---|
| **T-01** | Konten runtime dibaca dari PostgreSQL, bukan file JSON | Query progres, filter, statistik, dan publish atomik |
| **T-02** | JSON per unit di repo (Git LFS) adalah sumber authoring | Reviewable di PR; CI dapat memvalidasi sebelum import |
| **T-03** | Published content immutable; koreksi membuat `QuestionRevision` + versi baru | Attempt lama tetap valid; statistik tidak tercampur |
| **T-04** | `AnswerKey` hanya di server; DTO tidak pernah memuat jawaban sebelum submit | Mencegah kebocoran dan cheating |
| **T-05** | Satu `UserLanguageProfile` per bahasa; satu bahasa aktif | Multi-bahasa tanpa menimpa progres |
| **T-06** | Streak global; XP/menit/progres per bahasa | Motivasi lintas bahasa tetap terjaga |
| **T-07** | Audio di object storage + CDN; DB hanya metadata | Ukuran DB terkendali; caching |
| **T-08** | AI hanya offline untuk draft; tidak ada AI runtime | Biaya, latensi, dan kualitas terkontrol |
| **T-09** | Tidak ada fallback konten lintas bahasa | Kejujuran produk; mencegah bug “Inggris di mana-mana” |
| **T-10** | Modul baru masuk sebagai `curriculum` module di workspace | Tidak menulis ulang shell `/learn` |

### 1.2 Yang tidak dibangun di spec ini

- Speaking assessment/pronunciation scoring.
- Placement test adaptif (hanya self-select + level guide).
- CMS admin penuh; v1 memakai CLI + PR.
- Framework selain JLPT/CEFR.
- Offline penuh 126.000 soal.
- Checkpoint/level test: P1; desain sampling/session ditunda ke spec lanjutan. Tidak menambah 126.000 soal dan tidak menghalangi P0.
- AI tutor percakapan, booking tutor, live session.

---

## 2. Definisi & Aturan Normatif

### 2.1 Kode bahasa

| Konsep | Nilai | Catatan |
|---|---|---|
| **UI locale** | `en, es, id, jp, hi, de, ar, fr, pt, it, nl, ko` | Rute `/[lang]`; `jp` dipertahankan |
| **Content language** | `en, es, id, ja, hi, de, ar, fr, pt, it, nl, ko` | `jp` → `ja`; BCP-47 `ja` |
| **Legacy language id** | `english`, `spanish`, `japanese`, … | Hanya untuk migrasi |
| **Framework** | `JLPT`, `CEFR` | Jepang JLPT; lainnya CEFR |
| **Level** | `N5,N4,N3,N2,N1`; `A1,A2,B1,B2,C1` | Validasi terhadap framework |
| **Availability** | `full`, `beta`, `preview`, `none` | Dihitung dari published |
| **Question status** | `draft`, `in_review`, `published`, `retired` | Learner hanya `published` |

Aturan:

1. `[lang]` **tidak** menentukan bahasa belajar.
2. `targetLanguage`/`activeLanguage` selalu kode konten (`ja`, bukan `jp`).
3. `uiLocale` menentukan UI dan format; `explanationLocale` menentukan pembahasan.
4. Tidak ada fallback konten lintas bahasa. Jika `none`, tampilkan empty state.

### 2.2 Taxonomy skill

| Skill | Kode | Berlaku |
|---|---|---|
| Kosakata | `vocabulary` | Semua |
| Kanji | `kanji` | Jepang |
| Tata bahasa | `grammar` | Semua |
| Membaca | `reading` | Semua |
| Mendengar | `listening` | Semua |
| Penggunaan bahasa / Use of English | `usage` | Inggris + 10 bahasa lain |

### 2.3 Tipe soal

| Tipe | Kode | Answer key | Catatan |
|---|---|---|---|
| Pilihan ganda | `multiple_choice` | `{ choiceId }` | 3–4 pilihan |
| Isian | `fill_blank` | `{ accepted: string[] }` | Normalisasi per bahasa |
| Urutan | `ordering` | `{ order: string[] }` | Token ID |
| Mencocokkan | `matching` | `{ pairs: [{leftId,rightId}] }` | All-or-nothing v1 |
| Baca kanji | `kanji_reading` | `{ choiceId }` | Furigana hidden |
| Pemahaman bacaan | `reading_comprehension` | `{ choiceId }` | Wajib `passageId` |
| Pemahaman mendengar | `listening_comprehension` | `{ choiceId }` | Wajib `audioAssetId` |
| Koreksi | `correction` | `{ accepted: string[] }` | Tampilkan diff |

Tidak ada `short_answer` bebas dengan AI evaluation di v1.

### 2.4 ID & fingerprint

```
curriculum:  ja-jlpt
level:       ja-jlpt-n5
unit:        ja-jlpt-n5-u01
lesson:      ja-jlpt-n5-u01-l03
question:    ja-jlpt-n5-u01-l03-q0012
passage:     ja-jlpt-n5-u01-p0007
audio:       ja-jlpt-n5-a0007
concept:     ja:jlpt:n5:grammar:kara
```

ID grammar ini adalah bentuk final; contoh ID di FS-08 FR-09 bersifat ilustratif dan mengikuti pola ini (passage menyertakan unit).

Aturan:

- ID stabil, tidak pernah dipakai ulang.
- Published content immutable; perubahan semantik → `version + 1` dan `QuestionRevision`.
- `fingerprint = sha256(normalize(prompt) + "\u0000" + normalize(answerKey) + "\u0000" + level)`; unik.
- `conceptKey` eksplisit, dipakai SRS; bukan turunan dari ID soal.
- `questionVersion` dikirim ke client dan dikembalikan saat submit.

### 2.5 Invariant

1. `answerKey`, `isCorrect`, `explanation` **tidak** ada di DTO sebelum submit.
2. Submit duplikat mengembalikan hasil yang sama; XP tidak ganda.
3. Learner hanya melihat soal `published` dan tidak `retired`.
4. Progress/attempt merujuk ID stabil; ganti versi tidak menghapus progres.
5. Konten `retired` tidak dihitung dalam availability.
6. Semua mutasi progres dalam transaksi.
7. Audio tidak pernah menjadi satu-satunya cara menyelesaikan soal (transcript tersedia).
8. Tidak ada PII di log/analytics konten.
9. Published release tidak dapat diubah; rollback menunjuk release sebelumnya.
10. Content import harus idempoten dan dapat diulang.

---

## 3. Arsitektur

### 3.1 Gambaran sistem

```
┌──────────────────────────────────────────────────────────────────┐
│ Content authoring (repo, Git LFS)                                │
│ content/curricula/{lang}/{framework}/{level}/uNN.json            │
│ content/manifest.json + content/reviews/*.json                   │
└───────────────┬──────────────────────────────────────────────────┘
                │ PR + CI: schema, counts, duplicate, language, audio
                ▼
┌──────────────────────────────────────────────────────────────────┐
│ Import & publish (CLI / GitHub Actions)                          │
│ scripts/content/validate.ts → import.ts → publish.ts             │
└───────────────┬──────────────────────────────────────────────────┘
                │ idempotent upsert + ContentRelease (atomic)
                ▼
┌──────────────────────────────────────────────────────────────────┐
│ PostgreSQL                                                       │
│ Curriculum → Level → Unit → Lesson → Question/Passage/Audio      │
│ QuestionLocalization, ContentReview, QuestionStat, releases      │
└───────────────┬──────────────────────────────────────────────────┘
                │ Prisma (server-only repository)
                ▼
┌──────────────────────────────────────────────────────────────────┐
│ API /api/v1/**                                                   │
│ catalog, lesson DTO, attempts, progress, review, reports          │
└───────────────┬──────────────────────────────────────────────────┘
                │ fetch (client module)
                ▼
┌──────────────────────────────────────────────────────────────────┐
│ /[lang]/learn?module=curriculum                                  │
│ catalog → hub → level → lesson → results                         │
└──────────────────────────────────────────────────────────────────┘

Audio: object storage/CDN  ←  AudioAsset metadata di PostgreSQL
```

### 3.2 Batas sistem

| Layer | Tanggung jawab | Tidak boleh |
|---|---|---|
| `content/` | Sumber authoring, manifest, review sign-off | Dibaca saat runtime |
| `scripts/content/` | Validasi, import, publish, report | Menjalankan AI saat request |
| `app/lib/learning/content-repository.ts` | Query DB, mapping DTO | Mengimpor `content/` |
| `app/api/v1/**` | Validasi input, auth, service call | Logika konten panjang |
| `app/components/editor/curriculum/**` | UI, state, fetch | Menyimpan answer key |
| Object storage | Audio/gambar | Menyimpan progress |

### 3.3 Alur runtime

**Katalog**

1. Client memanggil `GET /api/v1/languages` (cache 1 jam).
2. API membaca registry + count published (materialized/aggregate).
3. Client menampilkan 12 kartu dengan status.

**Pelajaran**

1. `GET /api/v1/lessons/:id` dengan sesi.
2. Repository memilih lesson + questions `published` + passage/audio metadata.
3. DTO dibentuk tanpa `answerKey`/`explanation`; audio URL ditandatangani.
4. Client merender seluruh soal lesson (30–43; rata-rata 35), resume dari `LessonProgress.currentExerciseIndex`.

**Submit**

1. `POST /api/v1/attempts` dengan `clientAttemptId`, `questionId`, `questionVersion`, answer.
2. Server memuat answer key, menilai, menulis attempt + progress + XP + SRS dalam transaksi.
3. Response berisi correctness, correct answer, explanation, XP.
4. Client menampilkan feedback; tombol lanjut mengambil soal berikutnya dari state lokal.

**Publish**

1. Import menulis konten ke staging (`draft`).
2. QA + review sign-off.
3. Publish membuat `ContentRelease` published, menandai questions/lessons `published`, menghitung manifest.
4. Learner melihat konten pada request berikutnya (cache invalidation).

### 3.4 Mengapa PostgreSQL

- 126.000 soal + 262.500 localization + 11.000 passage masih kecil untuk PostgreSQL (< 10 GB teks).
- Progres dan attempt harus join/filter/agregasi; file JSON tidak praktis.
- Publish/rollback butuh transaksi dan status.
- Object storage hanya untuk blob besar (audio/gambar), sesuai `architecture-context.md`.

---

## 4. Model Konten

### 4.1 Skema Prisma (usulan)

> **Migrasi:** untuk 12 baris `Language` existing, tambahkan `code`/`uiLocale`/`script`/`direction` sebagai **nullable** terlebih dahulu, backfill, lalu `SET NOT NULL` + unique index. Skema di bawah adalah bentuk final, bukan urutan migration. Backfill `script`/`direction` untuk `ar` (arab/rtl), `ja` (jpan/ltr), `hi` (deva/ltr), `ko` (hang/ltr) dalam statement yang sama agar tidak jatuh ke default `latn`/`ltr`.

> FS-09 memperbarui satu detail usulan FS-08 §8.2: `Curriculum` unik per `[languageCode, framework]` (bukan per versi). ID kurikulum harus stabil agar `UserLanguageProfile`/progress tidak putus saat rilis baru; riwayat versi disimpan di `ContentRelease` + `QuestionRevision`. Detail lain mengikuti FS-08.

> Perubahan bersifat aditif. Jangan menghapus model legacy di rilis yang sama. Wajib update `context/architecture-context.md` sebelum migration (lihat §12).

#### 4.1.1 Registry & user

```prisma
model Language {
  id         String   @id                 // legacy slug: "japanese"
  code       String   @unique             // "ja"
  uiLocale   String?  @unique             // "jp"
  label      String
  native     String
  icon       String
  iconColor  String
  script     String   @default("latn")    // jpan | hang | deva | arab | latn
  direction  String   @default("ltr")     // ltr | rtl
  isFeatured Boolean  @default(false)
  corner     String   @default("none")
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  curricula     Curriculum[]
  profiles      UserLanguageProfile[]
  languageStats UserLanguageStats[]
  dailyActivity LanguageDailyActivity[]

  @@index([isActive])
}

model UserLanguageProfile {
  id              String    @id @default(cuid())
  userId          String
  languageCode    String
  curriculumId    String?
  activeLevelCode String?                 // "N5" | "A1" | ...
  isActive        Boolean   @default(false)
  startedAt       DateTime  @default(now())
  lastActiveAt    DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  language   Language    @relation(fields: [languageCode], references: [code], onDelete: Restrict)
  curriculum Curriculum? @relation(fields: [curriculumId], references: [id], onDelete: SetNull)

  @@unique([userId, languageCode])
  @@index([userId, isActive])
  @@index([languageCode, lastActiveAt])
}

// `isActive` adalah denormalisasi untuk query cepat. Sumber kebenaran adalah
// `User.activeLanguageCode`; keduanya di-update dalam satu transaksi.
// `User.curriculumLevel` juga denormalisasi dari profil aktif; update dalam
// transaksi yang sama agar API FS-08 tetap kompatibel.
// Invariant satu aktif per user ditegakkan transaksi + partial unique index SQL:
// CREATE UNIQUE INDEX one_active_language ON "UserLanguageProfile"("userId") WHERE "isActive" = true;
// activeLevelCode divalidasi Zod terhadap CurriculumLevel.code (tidak bisa FK langsung
// karena level code hanya unik per curriculum).

model UserLanguageStats {
  id                String    @id @default(cuid())
  userId            String
  languageCode      String
  xpTotal           Int       @default(0)
  minutesTotal      Int       @default(0)
  lessonsCompleted  Int       @default(0)
  lessonsMastered   Int       @default(0)
  questionsAnswered Int       @default(0)
  accuracyPercent   Int       @default(0)
  lastActivityAt    DateTime?
  updatedAt         DateTime  @updatedAt

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  language Language @relation(fields: [languageCode], references: [code], onDelete: Restrict)

  @@unique([userId, languageCode])
  @@index([languageCode, lastActivityAt])
}

model LanguageDailyActivity {
  id               String   @id @default(cuid())
  userId           String
  languageCode     String
  date             DateTime
  minutes          Int      @default(0)
  xp               Int      @default(0)
  lessonsCompleted Int      @default(0)
  reviewsCompleted Int      @default(0)
  goalMet          Boolean  @default(false)

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  language Language @relation(fields: [languageCode], references: [code], onDelete: Restrict)

  @@unique([userId, languageCode, date])
  @@index([userId, date])
}
```

Perubahan `User`:

```prisma
model User {
  // ...field existing
  uiLocale          String  @default("en")
  explanationLocale String  @default("en")   // id | en | ja
  activeLanguageCode String?                 // kode konten; targetLanguage tetap untuk kompatibilitas
  curriculumLevel   String?                 // denormalisasi level aktif (kompatibel FS-08)
  alwaysShowTranscript Boolean @default(false) // akomodasi aksesibilitas listening

  languageProfiles UserLanguageProfile[]
  languageStats    UserLanguageStats[]
  languageDaily    LanguageDailyActivity[]
  questionReports  QuestionReport[]
}
```

> `User.targetLanguage` tetap ada selama migrasi dan diisi sama dengan `activeLanguageCode`. Setelah stabil, `activeLanguageCode` menjadi sumber kebenaran; `targetLanguage` read-only/legacy.

#### 4.1.2 Kurikulum

```prisma
model Curriculum {
  id           String   @id                 // "ja-jlpt"
  languageCode String
  framework    String                       // "JLPT" | "CEFR"
  variant      String   @default("standard") // "ja-JP", "en-US", "ar-MSA", ...
  version      String                       // "2026.11.0"
  status       String   @default("draft")
  totalQuestions Int    @default(0)
  totalLessons   Int    @default(0)
  publishedAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  language Language           @relation(fields: [languageCode], references: [code], onDelete: Restrict)
  levels   CurriculumLevel[]
  profiles UserLanguageProfile[]

  @@unique([languageCode, framework])
  @@index([languageCode, status])
  @@index([status])
}

// Satu baris Curriculum per bahasa+framework. `version` adalah versi published
// saat ini (di-update atomik saat publish); riwayat immutable ada di ContentRelease.
// Jangan memakai ID berversi seperti "ja-jlpt-2026.11" karena profil/progress
// harus tetap merujuk kurikulum yang sama lintas rilis.

model CurriculumLevel {
  id              String @id                // "ja-jlpt-n5"
  curriculumId    String
  code            String                    // "N5" | "A1"
  position        Int
  title           String
  description     String?
  canDo           String[]
  estimatedHours  Int?
  totalQuestions  Int    @default(0)
  totalLessons    Int    @default(0)

  curriculum Curriculum     @relation(fields: [curriculumId], references: [id], onDelete: Cascade)
  units      CurriculumUnit[]

  @@unique([curriculumId, code])
  @@index([curriculumId, position])
}

model CurriculumUnit {
  id                      String @id        // "ja-jlpt-n5-u01"
  levelId                 String
  position                Int
  title                   String
  goal                    String
  checkpointQuestionCount Int    @default(20)

  level   CurriculumLevel   @relation(fields: [levelId], references: [id], onDelete: Cascade)
  lessons CurriculumLesson[]

  @@unique([levelId, position])
  @@index([levelId, position])
}

model CurriculumLesson {
  id               String   @id             // "ja-jlpt-n5-u01-l03"
  unitId           String
  position         Int
  slug             String
  title            String
  objective        String
  skill            String                   // vocabulary | kanji | grammar | reading | listening | usage
  kind             String   @default("lesson") // lesson | checkpoint | review
  estimatedMinutes Int      @default(8)
  status           String   @default("draft")
  contentVersion   String
  version          Int      @default(1)
  publishedAt      DateTime?

  unit          CurriculumUnit       @relation(fields: [unitId], references: [id], onDelete: Cascade)
  questions     Question[]
  passages      Passage[]
  localizations LessonLocalization[]
  reviews       ContentReview[]

  @@unique([unitId, position])
  @@index([unitId, status])
  @@index([status, skill])
}
```

#### 4.1.3 Materi, passage, audio

```prisma
model LessonLocalization {
  lessonId        String
  locale          String                   // semua kode konten: en, es, id, ja, hi, de, ar, fr, pt, it, nl, ko
  title           String?
  objective       String?
  body            Json?                    // blocks: explanation, rules, examples, tables, tips
  translationStatus String @default("reviewed") // draft | reviewed | fallback

  lesson CurriculumLesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@id([lessonId, locale])
}

model Passage {
  id            String   @id
  lessonId      String
  languageCode  String
  kind          String                     // reading | listening
  title         String
  body          String?                    // null untuk listening; transcript ada di AudioAsset
  promptSupport Json?                      // furigana/transliterasi passage (reading)
  translation   String?
  audioAssetId  String?
  wordCount     Int      @default(0)
  difficulty    Int      @default(1)
  fingerprint   String?  @unique

  lesson    CurriculumLesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  audio     AudioAsset?      @relation(fields: [audioAssetId], references: [id], onDelete: SetNull)
  questions Question[]

  @@index([lessonId, kind])
  @@index([languageCode, kind])
}

model AudioAsset {
  id           String   @id
  storageKey   String   @unique
  url          String
  languageCode String
  durationMs   Int
  transcript   String
  voice        String?
  provider     String?
  checksum     String   @unique
  license      String?
  createdAt    DateTime @default(now())

  passages  Passage[]
  questions Question[]
}
```

#### 4.1.4 Soal

```prisma
model Question {
  id                String   @id
  lessonId          String
  passageId         String?
  audioAssetId      String?
  position          Int
  type              String
  skill             String
  prompt            String
  promptSupport     Json?                    // furigana/transliteration; tanpa HTML mentah
  answerKey         Json                     // server-only
  answerKeyHash     String
  explanation       String                   // default (biasanya en)
  explanationLocale String   @default("en")
  conceptKey        String
  difficulty        Int      @default(1)
  tags              String[]
  fingerprint       String   @unique
  status            String   @default("draft")
  contentVersion    String
  version           Int      @default(1)
  source            String?
  license           String?
  generationMeta    Json?
  reviewedBy        String?
  reviewedAt        DateTime?
  reviewStatus      String   @default("automated") // automated | sampled | full
  retiredAt         DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  lesson        CurriculumLesson      @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  passage       Passage?              @relation(fields: [passageId], references: [id], onDelete: SetNull)
  audio         AudioAsset?           @relation(fields: [audioAssetId], references: [id], onDelete: SetNull)
  choices       QuestionChoice[]
  localizations QuestionLocalization[]
  revisions     QuestionRevision[]
  reviews       ContentReview[]
  stats         QuestionStat[]
  reports       QuestionReport[]
  releaseItems  ContentReleaseItem[]

  @@unique([lessonId, position])
  @@index([lessonId, status])
  @@index([status, type])
  @@index([skill, status])
  @@index([conceptKey])
  @@index([reviewStatus])
}

model QuestionChoice {
  id         String
  questionId String
  label      String
  position   Int
  side       String?                 // "left" | "right" untuk matching; null untuk tipe lain

  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@id([questionId, id])
  @@unique([questionId, position])
}

model QuestionLocalization {
  questionId       String
  locale           String                  // id | en | ja
  prompt           String?
  explanation      String?
  translationStatus String @default("reviewed")

  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@id([questionId, locale])
}

model QuestionRevision {
  id            String   @id @default(cuid())
  questionId    String
  version       Int
  snapshot      Json                       // prompt, choices, answerKey, explanation, meta
  answerKeyHash String
  publishedAt   DateTime?
  publishedBy   String?
  createdAt     DateTime @default(now())

  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([questionId, version])
  @@index([questionId, createdAt])
}
```

#### 4.1.5 Review, statistik, report, release

```prisma
model ContentReview {
  id           String   @id @default(cuid())
  lessonId     String?
  questionId   String?
  reviewerId   String
  reviewerName String
  authorId     String?                   // deteksi reviewer == author
  locale       String?                   // id | en | ja | kode konten
  role         String                    // language_lead | native_reviewer | editor | qa
  status       String                    // pending | approved | changes_requested
  checklist    Json
  notes        String?
  createdAt    DateTime @default(now())

  lesson   CurriculumLesson? @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  question Question?         @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@index([lessonId, status])
  @@index([questionId, status])
  @@unique([questionId, locale, reviewerId])
}

model QuestionStat {
  questionId      String
  questionVersion Int
  attempts        Int     @default(0)
  correct         Int     @default(0)
  pValue          Float?
  pointBiserial   Float?
  avgTimeMs       Int?
  flag            String?                 // too_easy | too_hard | ambiguous | audio_issue | low_discrimination
  lastComputedAt  DateTime?

  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@id([questionId, questionVersion])
  @@index([flag])
  @@index([pValue])
}

model QuestionReport {
  id         String   @id @default(cuid())
  questionId String
  userId     String
  reason     String                     // wrong_answer | audio | explanation | typo | other
  note       String?
  status     String   @default("open")  // open | triaged | fixed | retired | rejected
  createdAt  DateTime @default(now())
  resolvedAt DateTime?

  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([status, createdAt])
  @@index([questionId])
}

model ContentRelease {
  id          String   @id @default(cuid())
  version     String   @unique
  status      String   @default("draft") // draft | published | rolled_back
  manifest    Json
  checksum    String
  notes       String?
  publishedAt DateTime?
  publishedBy String?
  createdAt   DateTime @default(now())

  items ContentReleaseItem[]

  @@index([status, publishedAt])
  // Partial unique: hanya satu release published.
  // CREATE UNIQUE INDEX one_published_release ON "ContentRelease"(status) WHERE status = 'published';
}

model ContentReleaseItem {
  releaseId   String
  questionId  String
  action      String   // add | update | retire
  fromVersion Int?
  toVersion   Int?

  release  ContentRelease @relation(fields: [releaseId], references: [id], onDelete: Cascade)
  question Question       @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@id([releaseId, questionId])
  @@index([questionId])
}

model ContentImportJob {
  id             String   @id @default(cuid())
  releaseVersion String
  status         String   @default("running") // running | succeeded | failed
  stats          Json?
  error          String?
  startedAt      DateTime @default(now())
  finishedAt     DateTime?

  @@index([status, startedAt])
}

model ContentMigrationMap {
  id         String @id @default(cuid())
  legacyType String                    // lesson | exercise | concept
  legacyId   String
  newId      String
  note       String?

  @@unique([legacyType, legacyId])
  @@index([newId])
}
```

### 4.2 Perubahan model existing

```prisma
model LessonProgress {
  // ...existing
  languageCode   String?
  curriculumId   String?
  lastQuestionId String?
  resumeState    Json?
  contentVersion String?

  @@index([userId, languageCode, status])
}

model ExerciseAttempt {
  // ...existing; exerciseId diperlakukan sebagai questionId
  languageCode   String?
  curriculumId   String?
  questionType   String?
  questionVersion Int?
  answerKeyHash  String?
  accommodation  Boolean @default(false)

  @@index([userId, languageCode, createdAt])
  @@index([exerciseId, questionVersion])
}

model SpacedReviewItem {
  // ...existing; conceptKey ber-namespace bahasa
  curriculumId String?
  languageCode String?

  @@index([userId, languageCode, dueAt, status])
}
```

Catatan:

- `ExerciseAttempt.exerciseId` tetap dipakai sebagai `Question.id` untuk kompatibilitas; jangan rename kolom di rilis pertama.
- `LessonProgress.lessonId` sekarang berisi `CurriculumLesson.id`; tidak ada FK agar baris legacy tidak gagal.
- `LessonResult` dan `Mistake` tetap legacy; tidak dipakai untuk kurikulum baru.
- `GrammarDetail`, `GrammarQuiz`, `DailyChallenge`, `Exercise` (mock) tidak dipakai untuk konten baru; jangan hapus sebelum audit dependensi.

### 4.3 Estimasi volume & storage

| Tabel | Baris (target) | Catatan |
|---|---:|---|
| `Curriculum` | 12 | Satu per bahasa |
| `CurriculumLevel` | 60 | 12 × 5 |
| `CurriculumUnit` | 720 | 12 × 5 × 12 |
| `CurriculumLesson` | 3.600 | 300/bahasa |
| `LessonLocalization` | 10.200 | 2 baris untuk target `en`/`id`, 3 baris untuk 10 target lain (target + `id` + `en`) |
| `Question` | 126.000 | |
| `QuestionChoice` | ±450.000 | Rata-rata 3,5 pilihan |
| `QuestionLocalization` | 262.500 | 252.000 (`id`+`en`) + 10.500 `ja` |
| `Passage` | ±11.000 | Reading + listening |
| `AudioAsset` | ±5.200 | Bukan 20.650; audio dibagi |
| `ContentReview` | ±20.000 | 780 sign-off unit/level + ±19.700 sampel soal high-stakes/lower-level; material/passage direview per unit |
| `QuestionStat` | 126.000 | Satu baris per versi aktif |
| `ExerciseAttempt` | Tumbuh | Index `[userId, languageCode, createdAt]` |

Storage:

- Teks: ±3–5 GB (termasuk localization).
- Audio: ±5.200 × 0,5–1,5 MB ≈ 3–8 GB di object storage, bukan DB.
- DB total: < 15 GB pada tahun pertama; aman untuk PostgreSQL managed.

### 4.4 Revision & immutability

Aturan:

1. Saat publish pertama, buat `QuestionRevision` versi 1 dan set `Question.version = 1`.
2. Perubahan published:
   - Typo pada penjelasan yang tidak mengubah jawaban: tetap buat versi baru (audit).
   - Perubahan prompt/answer key: wajib versi baru; soal lama dipertahankan sebagai `retired`.
   - `QuestionRevision.snapshot` menyimpan konten yang dilihat learner.
3. `ExerciseAttempt.questionVersion` mencatat versi yang dinilai.
4. Jika client mengirim versi lama:
   - Nilai terhadap versi tersebut (agar jawaban learner adil).
   - Kembalikan `stale: true` + jawaban benar versi itu.
   - Jangan masukkan attempt ke statistik versi terbaru.
5. `QuestionStat` dipisah per `questionId + questionVersion`; attempt dari versi lama tidak mencampur statistik versi baru.
6. `retired` tidak dihapus; attempt/report tetap.

### 4.5 DTO

```ts
// app/lib/learning/curriculum-dto.ts
export interface LanguageSummaryDto {
  code: string;
  uiLocale: string;
  label: string;
  native: string;
  direction: "ltr" | "rtl";
  framework: "JLPT" | "CEFR";
  availability: "full" | "beta" | "preview" | "none";
  questionCount: number;
  lessonCount: number;
  levels: Array<{ code: string; title: string; questionCount: number }>;
}

export type LessonMaterialBlock =
  | { type: "explanation"; text: string }
  | { type: "rules"; items: string[] }
  | { type: "examples"; items: Array<{ correct: string; incorrect?: string; annotation?: string }> }
  | { type: "table"; headers: string[]; rows: string[][]; caption?: string }
  | { type: "tips"; items: string[] };

export interface LessonProgressDto {
  status: "not_started" | "in_progress" | "completed" | "mastered";
  bestAccuracy: number;
  currentExerciseIndex: number;
  lastQuestionId?: string;
}

export interface PassageDto {
  id: string;
  kind: "reading" | "listening";
  title: string;
  body?: string;              // wajib untuk reading; tidak ada untuk listening
  promptSupport?: {
    furigana?: Array<{ surface: string; reading: string }>;
    transliteration?: string;
  };
  translation?: string;
  audio?: {
    url: string;
    durationMs: number;
  };
}

export interface LessonDto {
  id: string;
  languageCode: string;
  level: string;
  unit: { id: string; title: string; position: number };
  title: string;
  objective: string;
  skill: string;
  estimatedMinutes: number;
  contentVersion: string;
  materials: {
    locale: string;
    blocks: LessonMaterialBlock[];
  };
  passages: PassageDto[];
  questions: QuestionDto[];
  progress?: LessonProgressDto;
}

export interface QuestionDto {
  id: string;
  version: number;
  type: string;
  skill: string;
  prompt: string;
  promptSupport?: {
    furigana?: Array<{ surface: string; reading: string }>;
    transliteration?: string;
  };
  passageId?: string;
  audio?: {
    url: string;
    durationMs: number;
    transcriptAvailable: boolean;
    transcript?: string; // hanya jika user.alwaysShowTranscript; selain itu setelah submit
  };
  choices?: Array<{ id: string; label: string }>;
  orderingTokens?: Array<{ id: string; label: string }>;
  matchingPairs?: {
    left: Array<{ id: string; label: string }>;
    right: Array<{ id: string; label: string }>;
  };
  input?: {
    mode: "text" | "numeric";
    placeholder?: string;
    maxLength?: number;
  };
  // SENGAJA tidak ada answerKey, isCorrect, explanation, transcript listening
}
```

Aturan DTO listening:

- `PassageDto.body` tidak boleh ada untuk `kind="listening"`.
- `audio.transcript` hanya dikirim jika `User.alwaysShowTranscript=true`; setelah submit, `AttemptResultDto.transcript`.
- Test snapshot wajib memastikan tidak ada `transcript`/`body` listening sebelum submit.

`AttemptResultDto`:

```ts
export interface AttemptResultDto {
  correct: boolean;
  score: number;                 // 0 | 100
  correctAnswer: unknown;        // bentuk sesuai tipe
  explanation: string;
  transcript?: string;           // untuk listening, setelah submit
  explanationLocale: string;
  conceptKey: string;
  xpAwarded: number;
  stale: boolean;
  progress: {
    lessonStatus: "in_progress" | "completed" | "mastered";
    currentExerciseIndex: number;
    bestAccuracy: number;
  };
}
```

---

## 5. Authoring, QA, dan Publish

### 5.1 Struktur repo

```
content/
  manifest.json
  curricula/
    ja/jlpt/n5/u01.json ... u12.json
    ja/jlpt/n4/u01.json ...
    en/cefr/a1/u01.json ...
    ...
  assets/
    audio/{language}/{audioId}.mp3      # atau manifest ke object storage
  reviews/
    ja-jlpt-n5-u01.json
  blueprints/
    ja-jlpt-n5.json
scripts/
  content/
    validate.ts
    import.ts
    publish.ts
    report.ts
    lib/
      schema.ts
      fingerprint.ts
      language-check.ts
      level-whitelist.ts
```

- Satu file per unit (5 pelajaran), bukan per pelajaran; 720 file.
- Git LFS untuk `content/assets/audio/**` dan file unit > 1 MB.
- `content/manifest.json` menghitung total per bahasa/level/skill/tipe.

### 5.2 Format unit

> Contoh berikut adalah **potongan** untuk menunjukkan bentuk data. Unit lengkap berisi 5 pelajaran; setiap pelajaran `kind=lesson` berisi 30–43 soal, dengan total 2.100 soal/level. ID `l03`/`q0012` hanya ilustrasi.

```json
{
  "schemaVersion": "1.0.0",
  "contentVersion": "2026.11.0",
  "language": "ja",
  "framework": "JLPT",
  "level": "N5",
  "unit": {
    "id": "ja-jlpt-n5-u01",
    "position": 1,
    "title": "Perkenalan Diri",
    "goal": "Memperkenalkan nama, asal, dan pekerjaan",
    "checkpointQuestionCount": 20
  },
  "lessons": [
    {
      "id": "ja-jlpt-n5-u01-l03",
      "position": 3,
      "slug": "self-introduction",
      "title": "自己紹介",
      "objective": "Memperkenalkan nama dan asal dengan です/から来ました",
      "skill": "grammar",
      "estimatedMinutes": 8,
      "materials": {
        "id": {
          "blocks": [
            { "type": "explanation", "text": "..." },
            { "type": "rules", "items": ["..."] },
            { "type": "examples", "items": [{ "correct": "...", "annotation": "..." }] },
            { "type": "tips", "items": ["..."] }
          ]
        },
        "en": { "blocks": [] }
      },
      "passages": [],
      "questions": [
        {
          "id": "ja-jlpt-n5-u01-l03-q0012",
          "position": 12,
          "type": "multiple_choice",
          "skill": "grammar",
          "prompt": "わたしは インドネシア ___ きました。",
          "promptSupport": {
            "furigana": [{ "surface": "来", "reading": "き" }]
          },
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
          "conceptKey": "ja:jlpt:n5:grammar:kara",
          "difficulty": 1,
          "tags": ["particle", "origin", "n5"],
          "source": "Lango curriculum team",
          "license": "original",
          "generation": {
            "model": "draft-model-v1",
            "promptVersion": "ja-n5-grammar-v3",
            "generatedAt": "2026-10-01"
          }
        }
      ]
    }
  ]
}
```

Aturan format:

- `position` soal unik dalam lesson; total per lesson 30–43; total per level 2.100; total per skill sesuai matriks PRD §8.2/FS-09 Lampiran A.
- `explanations` wajib `id` + `en`; `ja` wajib untuk bahasa Jepang.
- `answerKey` tidak boleh ada di DTO; hanya di file authoring + DB.
- `promptSupport.furigana.surface` harus muncul di prompt; validator menolak jika tidak.
- `passages`/`audio` direferensikan dengan ID, bukan path lokal di runtime.

### 5.3 Pipeline command

```bash
npm run content:validate -- --language ja --level N5
npm run content:import   -- --release 2026.11.0
npm run content:publish  -- --release 2026.11.0
npm run content:retire   -- --question <id> --release 2026.11.1
npm run content:report   -- --language ja
npm run check:curriculum
```

Tambahan `package.json`:

```json
{
  "scripts": {
    "content:validate": "tsx scripts/content/validate.ts",
    "content:import": "tsx scripts/content/import.ts",
    "content:publish": "tsx scripts/content/publish.ts",
    "content:report": "tsx scripts/content/report.ts",
    "check:curriculum": "node scripts/check-curriculum.mjs"
  }
}
```

### 5.4 Validasi otomatis

| # | Pemeriksaan | Severity | Aksi |
|---|---|---|---|
| V-01 | Schema JSON valid (Zod) | Blocker | Tolak import |
| V-02 | ID unik global; format sesuai | Blocker | Tolak |
| V-03 | Fingerprint unik | Blocker | Tolak |
| V-04 | Jumlah soal/level = 2.100; per lesson 30–43; total unit 5 lesson | Blocker | Tolak publish |
| V-05 | Tipe/answerKey sesuai kontrak | Blocker | Tolak |
| V-06 | Tepat satu jawaban benar (MCQ) | Blocker | Tolak |
| V-07 | Pilihan tidak duplikat/kosong | Blocker | Tolak |
| V-08 | Jawaban tidak muncul di prompt | Blocker | Tolak |
| V-09 | Prompt ≥90% bahasa target | Blocker | Tolak |
| V-10 | Level whitelist Jepang | Blocker | Tolak |
| V-11 | Passage/audio wajib ada | Blocker | Tolak |
| V-12 | Audio checksum + durasi wajar | Blocker | Tolak |
| V-13 | Penjelasan ada, bukan placeholder | Blocker | Tolak |
| V-14 | Near-duplicate <0,5% | Blocker | Review manual |
| V-15 | Moderation konten sensitif | Blocker | Tolak |
| V-16 | Copyright/plagiarism check | Blocker | Tolak |
| V-17 | Furigana surface ada di prompt | Error | Tolak |
| V-18 | Panjang passage sesuai level | Warning | Review |
| V-19 | Readability sesuai level | Warning | Review |
| V-20 | Distribusi jawaban tidak bias (A/B/C/D) | Warning | Review |
| V-21 | `Passage.promptSupport.surface` muncul di `body` (reading) | Error | Tolak |

Retirement tanpa release penuh: `content:retire --question <id> --release <next>` membuat release delta kecil yang menandai soal `retired`, menulis `QuestionRevision`, dan mencatat `ContentReleaseItem(action="retire")`. Ini memenuhi SLA 72 jam tanpa menunggu rilis konten besar.

Placeholder regex minimal:

```
/\b(this is an example of|example sentence demonstrating|fundamental principle of|lorem ipsum|TODO|TBD|sample sentence)\b/i
```

Ambang count mengikuti status rilis:

| Status | Ambang minimum | Cakupan level |
|---|---|---|
| `preview` | 1 unit (5 lesson, ±175 soal) | 1 unit |
| `beta` | 2.100 soal | 1 level penuh (60 lesson) |
| `full` | 10.500 soal | 5 level × 60 lesson |

`check:curriculum` membaca status dari manifest/DB; jangan menuntut 10.500 saat status masih `beta`. Publish `full` tetap diblokir jika <10.500.

### 5.5 QA psikometrik

- Agregasi malam: `attempts`, `correct`, `pValue`, `pointBiserial`, `avgTimeMs`.
- Minimum 30 attempt untuk kalibrasi; di bawah itu `pValue = null`.
- Flag:
  - `too_hard`: p < 0,2 setelah 30 attempt.
  - `too_easy`: p > 0,9.
  - `low_discrimination`: point-biserial < 0,2.
  - `ambiguous`: distractor terpilih > 40% atau report rate > 5%.
  - `audio_issue`: audio failure rate > 2%.
- Attempt dengan `accommodation=true` (transcript selalu tampil) dikecualikan dari statistik.
- Flag tidak otomatis retire; language lead meninjau.
- Dashboard item health (P2) membaca `QuestionStat`.

### 5.6 Review manusia

| Objek | Cakupan | Sign-off |
|---|---|---|
| Materi pelajaran | 100% | Language lead |
| Passage/audio script | 100% | Native reviewer |
| Soal N1/N2/C1 | 100% | Native reviewer |
| Soal N3–N5/A1–B2 | ≥20% sampel | Native reviewer |
| Soal flagged QA | 100% | Native reviewer |
| Answer key | 100% otomatis + 10% manual | Content QA |

Aturan eskalasi: defect rate sampel > 2% → review 100% unit; defect rate > 5% → tolak seluruh level. Semua soal tetap 100% automated QA; `reviewStatus` mencatat apakah soal hanya automated, disampel, atau direview penuh. Jika `reviewerId == authorId`, tandai dan minta reviewer kedua untuk level high-stakes.

Review record disimpan di `content/reviews/{unitId}.json` dan diimpor ke `ContentReview`:

```json
{
  "unitId": "ja-jlpt-n5-u01",
  "reviewers": [
    {
      "reviewerId": "rev-001",
      "name": "Maya",
      "locale": "ja",
      "authorId": "author-001",
      "role": "native_reviewer",
      "status": "approved",
      "checklist": {
        "naturalness": true,
        "level_fit": true,
        "answer_keys": true,
        "audio": true,
        "culture": true
      },
      "notes": "Semua audio N5 sesuai; 2 item diperbaiki."
    }
  ]
}
```

### 5.7 Publish & rollback

Publish:

1. `content:import` menulis/upsert `draft`.
2. `content:validate` + `check:curriculum` lolos.
3. Buat `ContentRelease` `draft` dengan manifest + checksum.
4. Review sign-off lengkap.
5. `content:publish`:
   - Transaksi: set questions/lessons `published`, update counts, set `Curriculum.version`, set release `published`.
   - Tulis `ContentReleaseItem` untuk setiap question yang berubah (`add`/`update`/`retire`), termasuk `fromVersion`/`toVersion`.
   - Invalidate cache katalog/lesson.
   - Catat `publishedBy`, `publishedAt`.
6. Release lama tetap ada; hanya satu `published` per waktu.

Rollback:

1. `npm run content:rollback -- --release <previous>` (tambahan command).
2. Set release saat ini `rolled_back`; set release sebelumnya `published`.
3. Baca `ContentReleaseItem` release sebelumnya; kembalikan konten dari `QuestionRevision.snapshot` (bukan hanya status). Jika snapshot tidak lengkap, re-import dari git tag release tersebut.
4. Kembalikan status soal/lesson yang berubah berdasarkan item release; hitung ulang counter.
5. Invalidate cache.
6. Target status/pointer < 5 menit; restore konten penuh < 30 menit; tidak menghapus attempt/progress.

### 5.8 Audio pipeline

- Sumber: voice talent (prioritas Jepang N5–N2) atau TTS (bahasa lain; spot-check).
- Format: mono, 64–96 kbps AAC/MP3, loudness -16 LUFS, 15–90 detik.
- Naming: `{audioId}-{checksum}.mp3`; URL immutable per checksum. Saat audio diganti, objek baru dibuat dan objek lama di-retire (jangan reuse URL yang di-cache 1 tahun). Metadata di `AudioAsset`.
- Checksum SHA-256; upload ke object storage; URL CDN.
- Transkrip wajib; diverifikasi reviewer.
- Validasi: durasi, silence, clipping, bahasa (ASR opsional), checksum.
- Fallback: audio gagal → transcript + retry; jangan blokir pelajaran.

---

## 6. API Contracts

### 6.1 Konvensi

- Base: `/api/v1`.
- Auth: sesi server-side existing (`Session` cookie).
- Response sukses (sama dengan `authOk` existing): `{ "success": true, "data": ..., "error": null, "meta": { "timestamp": "...", "requestId": "..." } }`.
- Error (sama dengan `authError` existing): `{ "success": false, "data": null, "error": { "code": "CODE", "message": "..." }, "meta": { "timestamp": "...", "requestId": "..." } }`.
- Jangan membuat envelope baru; gunakan `app/lib/api/auth-response.ts`.
- Tanggal ISO-8601 UTC.
- Semua endpoint mutasi: CSRF/origin check + rate limit.
- Cache:
  - Publik: `Cache-Control: public, s-maxage=..., stale-while-revalidate=...`.
  - Privat: `private, no-store` atau `private, max-age=300`.
- Idempotency: `clientAttemptId` wajib untuk attempt.

### 6.2 `GET /api/v1/languages`

Auth: tidak. Cache 1 jam.

Response:

```json
{
  "success": true,
  "error": null,
  "data": [
    {
      "code": "ja",
      "uiLocale": "jp",
      "label": "Japanese",
      "native": "日本語",
      "direction": "ltr",
      "framework": "JLPT",
      "availability": "full",
      "questionCount": 10500,
      "lessonCount": 300,
      "levels": [
        { "code": "N5", "title": "N5 · Dasar", "questionCount": 2100 }
      ]
    }
  ],
  "meta": { "timestamp": "2026-11-25T09:00:00.000Z", "requestId": "req_123" }
}
```

Aturan: `availability` dihitung dari published; `questionCount` = published, bukan draft. `label` = nama Inggris/admin, `native` = endonym; UI memakai `native`.

### 6.3 `GET /api/v1/curricula/:language`

Auth: tidak. Cache 10 menit.

Response:

```json
{
  "success": true,
  "error": null,
  "data": {
    "languageCode": "ja",
    "framework": "JLPT",
    "version": "2026.11.0",
    "status": "full",
    "totalQuestions": 10500,
    "totalLessons": 300,
    "levels": [
      {
        "code": "N5",
        "title": "N5 · Dasar",
        "description": "Kalimat dasar, kehidupan sehari-hari",
        "canDo": ["Memperkenalkan diri", "..."],
        "lessonCount": 60,
        "questionCount": 2100,
        "skills": { "vocabulary": 620, "kanji": 400, "grammar": 480, "reading": 320, "listening": 280 }
      }
    ]
  },
  "meta": { "timestamp": "2026-11-25T09:00:00.000Z", "requestId": "req_123" }
}
```

404 `CURRICULUM_NOT_AVAILABLE` jika tidak ada published.

### 6.4 `GET /api/v1/curricula/:language/levels/:level/lessons`

Auth: ya. Cache: `private, no-store`.

Response:

```json
{
  "success": true,
  "error": null,
  "data": {
    "level": "N5",
    "units": [
      {
        "id": "ja-jlpt-n5-u01",
        "position": 1,
        "title": "Perkenalan Diri",
        "goal": "...",
        "checkpointQuestionCount": 20,
        "lessons": [
          {
            "id": "ja-jlpt-n5-u01-l01",
            "position": 1,
            "title": "Kosakata: Salam",
            "objective": "...",
            "skill": "vocabulary",
            "estimatedMinutes": 8,
            "questionCount": 35,
            "progress": {
              "status": "in_progress",
              "bestAccuracy": 74,
              "currentExerciseIndex": 12
            }
          }
        ]
      }
    ]
  },
  "meta": { "timestamp": "2026-11-25T09:00:00.000Z", "requestId": "req_123" }
}
```

Filter/pencarian (FR-16):

- `GET /api/v1/curricula/:language/lessons?level=N5&skill=reading&q=particle&limit=20`
- Auth: ya; `private, no-store`.
- `q` mencari `title`/`objective` dengan PostgreSQL FTS + `pg_trgm`; batas 20; cursor opsional.
- `skill` dan `level` divalidasi; hasil hanya lesson `published`.
- Response: daftar `LessonSummary` + `total`; query kosong mengembalikan daftar default level.
- Index: GIN `to_tsvector('simple', title || ' ' || objective)` dan `pg_trgm` untuk typo; tambahkan via SQL migration (Prisma tidak mendukung GIN tsvector secara native).

### 6.5 `GET /api/v1/lessons/:id`

Auth: ya. Cache: `private, no-store` (respons memuat progress); konten immutable boleh di-cache di server/CDN internal. Sertakan ETag untuk konten.

Response: `LessonDto` (§4.5). Aturan:

- Hanya soal `published` dan tidak `retired`.
- Tidak ada `answerKey`, `isCorrect`, `explanation`.
- `audio.url` ditandatangani, berlaku 1 jam.
- `progress` dihitung dari `LessonProgress`.
- 404 `LESSON_NOT_FOUND`; 403 jika bukan bahasa aktif? Tidak—learner boleh membuka bahasa lain yang terdaftar; otomatis set aktif? Jangan auto-set; UI yang memutuskan.

### 6.6 `POST /api/v1/attempts`

Auth: ya. Rate limit: 60/menit/user.

Request:

```json
{
  "clientAttemptId": "0192f2b0-...",
  "questionId": "ja-jlpt-n5-u01-l03-q0012",
  "questionVersion": 1,
  "answer": { "choiceId": "a" },
  "timeSpentMs": 4200,
  "accommodation": false
}
```

Validasi:

- `clientAttemptId` UUID; unik per user.
- `questionId` published; lesson published.
- `questionVersion` ada; jika bukan current, nilai versi tersebut dan `stale=true`.
- Bentuk answer sesuai tipe.
- `timeSpentMs` 0–600000.
- `accommodation` hanya jika user setting transcript selalu tampil.

Scoring:

| Tipe | Aturan |
|---|---|
| `multiple_choice`, `kanji_reading`, `reading_comprehension`, `listening_comprehension` | `answer.choiceId === answerKey.choiceId` |
| `fill_blank`, `correction` | Normalisasi per bahasa; cocok dengan `accepted[]` |
| `ordering` | Sequence token ID sama persis |
| `matching` | Semua pasangan benar; v1 all-or-nothing |

Response:

```json
{
  "success": true,
  "error": null,
  "data": {
    "correct": true,
    "score": 100,
    "correctAnswer": { "choiceId": "a" },
    "explanation": "...",
    "explanationLocale": "id",
    "conceptKey": "ja:jlpt:n5:grammar:kara",
    "xpAwarded": 10,
    "stale": false,
    "progress": { "lessonStatus": "in_progress", "currentExerciseIndex": 13, "bestAccuracy": 75 }
  },
  "meta": { "timestamp": "2026-11-25T09:00:00.000Z", "requestId": "req_123" }
}
```

Idempotensi: jika `[userId, clientAttemptId]` sudah ada, kembalikan hasil tersimpan tanpa XP baru.

Error:

| Code | HTTP | Arti |
|---|---|---|
| `QUESTION_NOT_FOUND` | 404 | Soal tidak ada |
| `QUESTION_RETIRED` | 410 | Soal retired; learner baru tidak boleh |
| `INVALID_ANSWER` | 400 | Bentuk jawaban salah |
| `STALE_QUESTION_VERSION` | 409 | Versi tidak dikenal (bukan current/one-prior) |
| `DUPLICATE_ATTEMPT` | 200 | Kembalikan hasil lama (bukan error) |
| `RATE_LIMITED` | 429 | Terlalu banyak submit |

### 6.7 `POST /api/v1/lessons/:id/complete`

Auth: ya.

Request:

```json
{ "clientCompletionId": "uuid" }
```

Aturan:

- Semua soal dalam lesson harus punya attempt (v1: 100%; tidak ada skip).
- Hitung akurasi dari attempt terbaru per soal.
- `LessonProgress.status = completed`; `mastered` jika bestAccuracy ≥ 90.
- XP bonus 20; perfect +30; idempotent via `XpEvent` key.
- Response: accuracy, XP, mistakes, nextLessonId, reviewDueCount.

### 6.8 `GET /api/v1/progress?language=ja`

Auth: ya. Alias FS-08: `GET /api/v1/progress/curriculum?language=ja` boleh ditambahkan sebagai route tipis yang memanggil handler yang sama.

Response:

```json
{
  "success": true,
  "error": null,
  "data": {
    "languageCode": "ja",
    "level": "N5",
    "xpTotal": 1240,
    "minutesTotal": 320,
    "lessonsCompleted": 18,
    "lessonsMastered": 12,
    "accuracyPercent": 78,
    "streakDays": 7,
    "reviewDue": 8,
    "levels": [
      { "code": "N5", "completedLessons": 18, "totalLessons": 60, "percent": 30 }
    ],
    "recentLessons": []
  },
  "meta": { "timestamp": "2026-11-25T09:00:00.000Z", "requestId": "req_123" }
}
```

### 6.9 `POST /api/v1/me/languages`

Auth: ya.

Request:

```json
{ "languageCode": "ja", "level": "N5", "activate": true }
```

Aturan:

- Upsert `UserLanguageProfile`.
- `activate=true` → set semua `isActive=false`, set target ini true, update `User.activeLanguageCode`.
- Jika level tidak cocok framework → 400.
- Tidak menghapus progres bahasa lain.

### 6.10 `PATCH /api/v1/me`

Request:

```json
{
  "activeLanguage": "ja",
  "curriculumLevel": "N5",
  "explanationLocale": "id",
  "uiLocale": "id",
  "alwaysShowTranscript": false
}
```

Validasi:

- `activeLanguage` harus terdaftar + punya curriculum. Alias kompatibilitas FS-08: `targetLanguage` diterima dan dipetakan ke `activeLanguage`; `nativeLanguage` opsional.
- `curriculumLevel` valid untuk framework bahasa aktif (setelah `activeLanguage` diterapkan).
- `explanationLocale` ∈ `id|en|ja`.
- `uiLocale` ∈ 12 locale.
- `alwaysShowTranscript` boolean (opsional).

### 6.11 `POST /api/v1/reports`

Request:

```json
{ "questionId": "...", "reason": "wrong_answer", "note": "Jawaban seharusnya ..." }
```

Aturan:

- Rate limit 10/jam/user.
- `reason` ∈ `wrong_answer|audio|explanation|typo|other`.
- Simpan `QuestionReport`; set `QuestionStat.flag` jika perlu.
- Response 201 + id.

### 6.12 `GET /api/v1/review?language=ja`

Response: due items + representative question id + conceptKey + dueAt + priority.

### 6.13 Admin & content health (P2)

Semua endpoint admin memerlukan role `admin`/`content_lead`; bukan learner API.

| Endpoint | Kegunaan |
|---|---|
| `GET /api/v1/admin/content/health` | Aggregate coverage/quality per bahasa |
| `PATCH /api/v1/admin/reports/:id` | Triase laporan: `triaged`, `fixed`, `retired`, `rejected` + catatan |
| `POST /api/v1/admin/questions/:id/retire` | Retire soal + buat delta release; alasan wajib |

`PATCH reports` mengubah `QuestionReport.status`, mencatat admin, dan menulis `ContentReleaseItem` jika `retired`. `POST retire` memicu command `content:retire` (idempoten), bukan menghapus baris.

### 6.14 Event analytics

Nama event final (jangan menduplikasi dengan FS-08):

`curriculum_viewed`, `language_enrolled`, `language_activated`, `level_selected`, `lesson_started`, `question_answered`, `lesson_completed`, `lesson_abandoned`, `review_started`, `review_completed`, `audio_failed`, `question_reported`, `content_release_published`.

Properti minimum mengikuti PRD §13.3. Tidak ada PII.

---

## 7. Frontend Integration

### 7.1 Modul di workspace

Tambahkan `curriculum` ke modul yang sudah ada:

```tsx
// app/components/editor/workspace-page.tsx
const FULLSCREEN_MODULES = new Set(["number-name", "grammar", "curriculum"]);

switch (activeModule) {
  case "curriculum":
    view = <CurriculumModule />;
    break;
  // ...
}
```

- Sidebar: entry “Kurikulum” dengan status + bahasa aktif.
- `ModuleContext` menambah `curriculum`.
- Jangan menghapus modul lama; feature flag `curriculum_v2` mengontrol visibilitas.

### 7.2 Route & deep link

Karena `/learn` saat ini adalah workspace client, v1 memakai query params:

```
/[lang]/learn?module=curriculum
/[lang]/learn?module=curriculum&language=ja
/[lang]/learn?module=curriculum&language=ja&level=N5
/[lang]/learn?module=curriculum&language=ja&level=N5&lesson=ja-jlpt-n5-u01-l03
```

Aturan:

- `useSearchParams` membaca state; bungkus komponen dengan `<Suspense>` agar build Next.js 16 tidak gagal saat prerender.
- Navigasi memakai `router.push(..., { scroll: false })`, bukan full reload.
- Params tidak valid → fallback ke hub + toast, bukan crash.
- `lesson` tanpa `level`/`language` → resolve dari lesson API lalu replace URL.
- Back/forward browser bekerja.
- `module=curriculum` dipertahankan saat pindah level/lesson.
- Kunci final: `module`, `language`, `level`, `lesson`. Contoh `course=` di FS-08 adalah legacy; jangan mencampur keduanya.

> Path-based routes (`/learn/curriculum/...`) dapat ditambahkan nanti; jangan refactor shell di P0.

### 7.3 Komponen

```
app/components/editor/curriculum/
  curriculum-module.tsx       # shell + fetch + state machine
  curriculum-catalog.tsx      # 12 bahasa
  language-hub.tsx            # 5 level + guide
  level-path.tsx              # 12 unit + 5 lesson
  lesson-intro.tsx            # objective + vocab preview
  lesson-player.tsx           # materi + soal + progress
  question-renderers/
    multiple-choice.tsx
    fill-blank.tsx
    ordering.tsx
    matching.tsx
    kanji-reading.tsx
    reading-comprehension.tsx
    listening-comprehension.tsx
    correction.tsx
  feedback-panel.tsx
  results-screen.tsx
  report-dialog.tsx
  progress-summary.tsx
  hooks/
    use-curriculum-catalog.ts
    use-lesson.ts
    use-attempt.ts
```

- Semua komponen client karena interaktif.
- Tidak ada `answerKey` di props/state.
- Feedback memakai token `--learn-*`, bukan hex.
- Audio memakai satu komponen shared; jangan duplikasi kontrol.

### 7.4 State machine

```
catalog:
  idle → loading → ready
                ↘ error

lesson:
  loading → ready → practicing → submitting → feedback → next
                                  ↘ error (retry)
  feedback → results (setelah soal terakhir)
  any → paused/exit (simpan posisi)
```

Aturan:

- `submitting` menonaktifkan tombol; tidak ada double submit.
- Error submit: jawaban tetap di state; tombol retry memakai `clientAttemptId` sama.
- Feedback tidak auto-advance.
- `results` hanya setelah `POST complete` sukses; jika gagal, tampilkan retry.

### 7.5 Fetch & cache

- Katalog: fetch sekali per sesi; simpan di memory; `staleTime` 5 menit.
- Hub/level: fetch saat dibuka; cache per `language+level`.
- Lesson: fetch per lesson; `AbortController` saat unmount.
- Jangan memuat semua soal sekaligus? 30–43 soal aman (<250 KB). Muat semua untuk resume/next tanpa latency.
- Preload audio soal pertama setelah lesson ready.
- Tidak menambahkan dependency data-fetching baru; gunakan `fetch` + hooks.
- Offline v1: tidak ada queue penuh. Jika submit gagal, jawaban tetap di state + `clientAttemptId`; tampilkan retry. Posisi terakhir boleh di `localStorage` untuk resume visual, tetapi sumber kebenaran tetap server.

### 7.6 Aksesibilitas & script

- `dir` pada container konten mengikuti `Language.direction`.
- `lang` pada elemen konten mengikuti kode konten (`ja`, `ar`, `hi`).
- Furigana: render `promptSupport.furigana` menjadi `<ruby>`; jangan `dangerouslySetInnerHTML`.
- Arab: `bidi-isolate` pada pilihan Latin; layout memakai logical properties (`ms-`, `me-`, `ps-`, `pe-`).
- Keyboard: angka 1–4 memilih; Enter submit/lanjut; Escape menutup dialog; focus trap di dialog.
- `aria-live="polite"` untuk feedback; `aria-live="assertive"` hanya error kritis.
- Audio: tombol play/pause berlabel; transcript toggle; tidak ada autoplay.
- Transkrip sebelum submit: setting `alwaysShowTranscript`; attempt `accommodation=true`; dikecualikan dari statistik.

### 7.7 Performance UI

- Lazy-load renderer soal yang jarang (matching/ordering) bila perlu.
- Virtualisasi tidak diperlukan untuk 30–43 soal.
- Audio `preload="metadata"`; preload penuh hanya soal aktif.
- Hindari render ulang seluruh daftar saat feedback; memo per soal.
- Bundle target: curriculum module ≤ 120 KB gzip tambahan.

---

## 8. Progress, Scoring, dan Gamifikasi

### 8.1 Status lesson

| Status | Aturan |
|---|---|
| `not_started` | Belum ada attempt |
| `in_progress` | Ada attempt, belum semua soal |
| `completed` | Semua soal punya attempt + `POST complete` |
| `mastered` | `completed` + bestAccuracy ≥ 90 |

- `currentExerciseIndex` = index soal pertama yang belum dijawab; bukan sekadar terakhir.
- `bestAccuracy` = maksimum akurasi attempt complete.
- Unit selesai = 5 lesson `completed`.
- Level progress = jumlah lesson `completed` / 60.

### 8.2 Scoring

- Benar = 100, salah = 0; tidak ada partial credit v1.
- Lesson accuracy = `correct / total * 100`, dibulatkan.
- Checkpoint = 20–30 soal; hasil per skill; tidak mengklaim skor resmi.
- `matching` all-or-nothing; feedback menampilkan pasangan benar/salah.
- `ordering`: exact sequence; feedback menampilkan urutan benar.
- `correction`: accepted variants; feedback diff kata.

### 8.3 Normalisasi jawaban

| Bahasa | Aturan |
|---|---|
| Latin (`en, es, id, fr, de, pt, it, nl`) | NFC, trim, collapse spaces, lowercase, normalisasi apostrof, buang tanda akhir |
| Jepang (`ja`) | NFKC, full-width → half-width untuk alfanumerik, trim; kanji/kana tidak diubah |
| Korea (`ko`) | NFC, trim, collapse spaces |
| Hindi (`hi`) | NFC, trim; varian nukta diterima jika terdaftar |
| Arab (`ar`) | NFKC, buang harakat/tatweel, normalisasi alef (`أإآ`→`ا`), trim |

Aturan diberlakukan di server; client hanya menampilkan. `accepted[]` harus memuat varian yang sah.

### 8.4 XP

| Aksi | XP | Idempotency |
|---|---:|---|
| Jawaban benar pertama | 10 | `attempt:{attemptId}` |
| Jawaban benar ulang | 2 | `attempt:{attemptId}` |
| Lesson complete | 20 | `lesson:{lessonId}:complete` |
| Perfect lesson | 30 | `lesson:{lessonId}:perfect` |

- Daily cap 500; `XpEvent` ledger.
- XP per bahasa di `UserLanguageStats`; total global di `UserStats`.
- Tidak ada XP untuk review? Review benar 2 XP; wrong 0.

### 8.5 Hearts

- 5 hearts; salah mengurangi 1; regen 1/30 menit.
- Hearts 0 → learner dapat melanjutkan mode “Latihan bebas” tanpa XP, atau berhenti.
- Checkpoint tidak menghabiskan hearts.
- Hearts global (bukan per bahasa); dokumentasikan di UI.

### 8.6 SRS

- `conceptKey` namespaced: `{language}:{framework}:{level}:{skill}:{slug}`.
- Salah → upsert item, `dueAt = now + 1 day`, `lapses++`.
- Benar di review → interval × ease; max 180 hari.
- Review item memilih soal published per conceptKey; jika tidak ada, item di-skip.
- Ganti bahasa tidak mengubah due item bahasa lain.
- Legacy conceptKey `grammar.*` tetap ada; tidak dihapus; UI menandai legacy jika tidak resolve.

### 8.7 Streak

- Global: satu hari dianggap aktif jika ada minimal 1 attempt/lesson di bahasa mana pun.
- `DailyActivity` global tetap dipakai; `LanguageDailyActivity` untuk laporan per bahasa.
- Timezone mengikuti `User.timezone`.

---

## 9. Migrasi & Kompatibilitas

### 9.1 Baseline data

- 12 `Language` rows di seed; belum ada `code`/`uiLocale`/`direction`.
- 60 lesson Grammar legacy; 2.232 exercise; 2.112 placeholder (2.192 di antaranya berasal dari batch B2/C1).
- `User.targetLanguage` menyimpan nama tampilan/kode campuran.
- `LessonProgress`/`ExerciseAttempt` memakai ID legacy.
- Tidak ada tabel konten baru.

### 9.2 Urutan migrasi zero-downtime

1. **Prasyarat:** update `context/architecture-context.md` (model konten, dua axis, storage); bersihkan daftar bahasa duplikat (`app/utils/flags.ts` Bengali/`bn`, union 21 kode di `number-name/types.ts`) agar hanya 12 kode yang valid.
2. Migration aditif: tambah `Language.code`/`uiLocale`/`script`/`direction` sebagai nullable; tambah kolom nullable ke `User`, `LessonProgress`, `ExerciseAttempt`; buat tabel baru.
3. Backfill `Language.code`/`uiLocale`/`script`/`direction` dari mapping (termasuk `ar`/`ja`/`hi`/`ko`); setelah bersih, baru `SET NOT NULL` + unique index `code`/`uiLocale`.
4. Backfill `User.uiLocale` dari cookie/`AppSettings.appLanguage`/`en`; `explanationLocale` default `en`.
5. Buat `UserLanguageProfile` dari `User.targetLanguage`; set satu aktif.
6. Migrasi `User.targetLanguage`/`LearningSettings.targetLanguage` ke kode konten; backfill `User.curriculumLevel` dari `cefrLevel`/profil aktif.
7. Import konten pilot (draft); publish setelah review.
8. Mapping legacy:
   - 60 lesson → `ContentMigrationMap` (`lesson`).
   - Exercise yang layak (40 A1–B1) → `question`; placeholder tidak dipetakan.
   - Update `LessonProgress.lessonId` ke new ID; `currentExerciseIndex` reset ke 0 jika mapping tidak eksak; `bestAccuracy` dipertahankan.
   - Backfill `ExerciseAttempt.exerciseId` ke `Question.id` hanya untuk mapping yang ada; attempt tanpa mapping dibiarkan legacy/read-only.
9. Deploy kode baru di belakang flag `curriculum_v2`; dual-read progress (new ID, fallback legacy).
10. Aktifkan modul untuk beta; monitor.
11. Setelah 2 release stabil: jadikan `activeLanguageCode` sumber kebenaran; `targetLanguage` legacy read-only; hapus flag.

### 9.3 Mapping kode

| Nilai lama | Baru |
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
| lainnya | `en` + log migrasi; `bn`/`zh`/`ru` dihapus dari union/flags, bukan dipetakan diam-diam |

Aturan:

- Backfill idempoten; aman dijalankan ulang.
- Jangan drop kolom lama di rilis yang sama.
- Backup DB sebelum migration.
- Rollback: flag off; kode membaca `activeLanguageCode ?? targetLanguage`; konten baru dapat di-retire.

### 9.4 Nasib konten Grammar lama

- **B2/C1**: 2.112 exercise placeholder → **tidak diimpor**; diganti total.
- **A1–B1**: 40 exercise (4+3+3 lesson) → audit; jika lolos, impor sebagai bagian dari 10.500 Inggris dengan ID baru; jika tidak, tulis ulang.
- **Attempt**: `ExerciseAttempt.exerciseId` dipetakan ke `Question.id` baru hanya untuk 40 exercise yang diimpor ulang. Attempt placeholder B2/C1 tidak dipetakan; tetap tersimpan sebagai riwayat read-only dan tidak masuk statistik soal baru.
- Progress lama: pertahankan `LessonProgress` completion/accuracy; jangan klaim mastery baru tanpa review.
- UI: tampilkan notice satu kali “Konten Grammar diperbarui” jika progress lama dipetakan; jangan reset XP.

---

## 10. Non-Functional Requirements

### 10.1 Performance

| Metrik | Target | Cara ukur |
|---|---|---|
| p95 `GET /languages` | ≤ 100 ms (cache) | APM |
| p95 `GET /lessons/:id` | ≤ 300 ms | APM |
| p95 `POST /attempts` | ≤ 500 ms | APM |
| LCP lesson mobile 4G | ≤ 2,5 s | Web Vitals |
| Audio start | ≤ 1 s | Synthetic |
| Payload lesson | ≤ 250 KB gzip | Build/network |
| Curriculum bundle tambahan | ≤ 120 KB gzip | Build analysis |

Strategi:

- Index: `Question(lessonId,status)`, `ExerciseAttempt(userId,languageCode,createdAt)`, `SpacedReviewItem(userId,languageCode,dueAt,status)`.
- `select` eksplisit; jangan pernah `include` answerKey ke DTO.
- Cache katalog 1 jam; lesson private 5 menit; audio immutable 1 tahun.
- Materialized counters (`totalQuestions`, `totalLessons`, `UserLanguageStats`) untuk menghindari count besar per request.
- Audio CDN; signed URL 1 jam. Tanda tangan dibuat batch per lesson (HMAC lokal), bukan 30–43 panggilan jaringan.

### 10.2 Skala

- 10.000 DAU awal; 5.000 concurrent learner.
- 126.000 soal; ±450.000 pilihan; ±262.500 localization.
- Connection pooling; query timeout 5 s; statement timeout 10 s.
- Import 126.000 item: target benchmark < 30 menit dengan `createMany`/`COPY` batch 500; bukan AC keras sampai diukur.
- Publish < 5 menit; rollback status < 5 menit; restore penuh < 30 menit (benchmark, bukan AC keras).

### 10.3 Keamanan

- Answer key hanya server; audit DTO di CI (test snapshot).
- Auth + ownership: attempt hanya untuk user sendiri; report hanya untuk user sendiri.
- Rate limit: attempt 60/menit; report 10/jam; login existing.
- Input validation Zod; tolak `answer` yang tidak sesuai tipe.
- Audio signed URL; jangan publikasi storage key.
- Content import memakai service token/CI; tidak ada endpoint publik untuk publish.
- Admin health endpoint: role check.
- Log redaction: jangan log jawaban mentah, token, audio URL signed.
- CSP: audio CDN domain; font lokal.

### 10.4 Privasi

- Attempt/progress dapat diekspor/dihapus.
- Tidak ada PII di `QuestionReport.note` (UI memperingatkan; server memfilter email/telepon opsional).
- Retensi log 90 hari; event agregat 24 bulan.
- Prompt AI authoring tidak berisi data learner.
- Audio voice talent: simpan release form; tidak ada data learner.

### 10.5 i18n, script, aksesibilitas

- UI 12 locale; tier sesuai FS-08.
- Konten mengikuti `languageCode`; penjelasan mengikuti `explanationLocale`.
- RTL untuk `ar`; font `Noto Naskh Arabic`/`IBM Plex Sans Arabic`.
- CJK: `Noto Sans JP`/`Noto Sans KR`; line-height 1.75.
- Devanagari: `Noto Sans Devanagari`.
- Furigana via `<ruby>`; jangan HTML mentah.
- WCAG 2.1 AA; keyboard-only; axe CI.
- Transcript audio; setting `alwaysShowTranscript`.

### 10.6 Observability

- Structured log: `requestId`, `userId` hash, `route`, `languageCode`, `lessonId`, `latency`, `status`.
- Metrics: request count/latency, attempt correct rate, audio failure, import duration, publish status.
- Alerts:
  - 5xx > 1%.
  - audio failure > 2%.
  - import/publish failed.
  - item report rate > 5%.
- Dashboard: coverage, quality, learning, ops.

### 10.7 Biaya

- Ukur biaya per soal published: drafting + review + audio + QA.
- Target indikatif: biaya konten ≤ 35% dari revenue per learner Pro (jika monetisasi aktif).
- Optimasi: reuse audio/passage; TTS untuk non-Jepang; review sampling; cache.
- Jangan memakai AI runtime untuk menekan biaya—latensi dan kualitas lebih buruk.

---

## 11. Rencana Pengujian

### 11.1 Unit

- Normalisasi jawaban: Latin/Jepang/Korea/Hindi/Arab; full-width; harakat; apostrof.
- Scoring semua tipe: benar/salah, accepted variants, ordering, matching.
- Fingerprint: normalisasi, duplikat, near-duplicate.
- Level whitelist Jepang: kanji/kosakata/grammar.
- DTO redaction: tidak ada `answerKey`/`explanation`; listening `PassageDto.body`/`transcript` tidak ada sebelum submit (kecuali `alwaysShowTranscript`).
- Availability: published vs draft/retired.
- Progress: status, currentExerciseIndex, mastery.
- XP idempotency: attempt/lesson/perfect.
- Concept key: namespace, review resolution.
- Locale/route: `jp`→`ja`, invalid level, fallback explanation.
- Revision: stale version dinilai benar, stat tidak tercampur.

### 11.2 Integrasi

- `GET /languages`: 12, count published, cache header.
- `GET /curricula/ja`: 5 level, 60 lesson, 2.100 soal, total 10.500.
- `GET /lessons/:id`: auth, published only, no answer fields, audio signed.
- `POST /attempts`: correct/incorrect, duplicate, rate limit, retired, stale.
- `POST /complete`: all attempted, accuracy, XP idempotent.
- `POST /me/languages`: add/activate, no progress loss.
- `PATCH /me`: invalid level, explanation locale.
- `POST /reports`: rate limit, status.
- `GET /review`: due only, language filter.
- Content import: idempotent, count, rollback.

### 11.3 Content QA

- Counts per language/level/skill/type = manifest/DB.
- 0 placeholder; 100% explanation id/en (+ja).
- 100% listening audio + transcript; 100% reading passage.
- 0 duplicate fingerprint; near-duplicate < 0,5%.
- Language ratio ≥ 90%; level whitelist; furigana valid.
- Answer key audit; choice uniqueness; no answer in prompt.
- Moderation/copyright check.
- Review sign-off per level.
- Pilot p-value: flag only, no auto-retire.

### 11.4 E2E (Playwright)

1. Onboarding Jepang N5 → dashboard → lesson → 30–43 soal → results.
2. Resume: jawab 12 soal → refresh → soal 12.
3. Ganti bahasa Jepang → Inggris → kembali; progress tetap.
4. Ganti UI locale `id` → `jp`; konten tetap.
5. Arab RTL: layout, pilihan, audio, feedback.
6. Furigana toggle Jepang.
7. Audio gagal → transcript + retry.
8. Report soal → status.
9. Beta/none empty state.
10. Keyboard-only menyelesaikan 5 soal.
11. (P1, setelah desain checkpoint) Checkpoint N5 → hasil per skill.
12. 404 lesson invalid.

### 11.5 Load & security

- Load: 5.000 concurrent lesson fetch; p95 < 300 ms.
- Import 126.000 item < 30 menit.
- Publish < 5 menit; rollback status < 5 menit; restore penuh < 30 menit.
- Security: answer leakage, IDOR attempt, duplicate XP, rate limit, signed audio expiry, admin endpoint.
- Fuzz answer payload (Zod).

### 11.6 Manual matrix

| Dimensi | Nilai |
|---|---|
| Bahasa | `ja`, `en`, `ar`, `hi`, `ko` (sampel) |
| Level | N5, N2, N1; A1, B2, C1 |
| Layar | Katalog, hub, level, lesson, results, review |
| Perangkat | 360, 375, 768, 1440 px |
| Input | Mouse, touch, keyboard, screen reader |
| Preferensi | Reduced motion, 200% zoom, RTL, transcript |
| Jaringan | 4G, offline, audio gagal |

---

## 12. Rollout Plan

> Sama dengan PRD §14; di sini ditambahkan gate teknis. Angka soal adalah **kumulatif**; 70 soal pilot P0 termasuk dalam 12.600 P1.

| Fase | Durasi | Cakupan | Gate teknis |
|---|---:|---|---|
| **P0 — Fondasi** | 4 minggu | Schema, pipeline, registry, 2 pelajaran pilot (70 soal) | Migration dry-run; import/publish/rollback; API pilot; DTO redaction |
| **P1 — Jepang N5–N3 + Inggris A1–B1** | 8 minggu | 12.600 soal | `beta`; counts; 100% audio/passage; review sample; E2E |
| **P2 — Jepang N2–N1 + Inggris B2–C1** | 10 minggu | 21.000 soal | `full` ja/en; 0 placeholder; count CI; performance |
| **P3 — Gelombang B** | 18 minggu | `id`, `es`, `fr`, `de`; 63.000 | 6 bahasa `full`; RTL/font; migration progress |
| **P4 — Gelombang C** | 26 minggu | `pt`, `it`, `nl`, `ko`, `hi`, `ar`; 126.000 | 12 `full`; a11y; load; audit |
| **P5 — Skala & polish** | 6 minggu | Content health, cost, analytics | Semua AC; runbook |

### 12.1 Gate `full`

- 10.500 published; 300 lesson; 5 level.
- 100% materi/audio/penjelasan.
- 0 placeholder; 0 known wrong answer.
- Native sign-off per level.
- `check:curriculum` lolos.
- Performance + a11y lolos.
- Rollback diuji.

### 12.2 Gate `beta`

- Minimal 2.100 published (1 level).
- Review tercatat.
- Audio untuk level tersebut.
- Badge + count benar.
- Tidak ada klaim `full`.

### 12.3 Feature flag

- `curriculum_v2`: mengontrol visibilitas modul.
- `curriculum_language_{code}`: mengontrol bahasa per rollout.
- `curriculum_audio_transcript`: setting aksesibilitas.
- Flag dibaca server + client; default off untuk produksi sampai gate lolos.

---

## 13. Acceptance Criteria (Teknis)

| ID | Skenario | Ekspektasi |
|---|---|---|
| **AC-01** | `GET /api/v1/languages` | 12 bahasa; count published; status benar |
| **AC-02** | `GET /api/v1/curricula/ja` | 5 level; 60 lesson/level; 2.100 soal/level; 10.500 |
| **AC-03** | `GET /api/v1/curricula/en` | 5 level; 60 lesson/level; 2.100 soal/level; 10.500 |
| **AC-04** | 10 bahasa lain | Masing-masing 10.500; total 126.000 |
| **AC-05** | Lesson DTO | Tidak ada `answerKey`/`isCorrect`/`explanation` |
| **AC-06** | Submit benar/salah | Hasil + penjelasan; attempt tersimpan |
| **AC-07** | Submit duplikat | Hasil sama; XP tidak ganda |
| **AC-08** | Stale version | Dinilai versi yang dilihat; `stale=true`; stat tidak tercampur |
| **AC-09** | Resume | Refresh kembali ke soal belum dijawab |
| **AC-10** | Multi-bahasa | 2+ profil; aktif satu; progres terpisah |
| **AC-11** | Ganti bahasa | Progres lama tetap; tidak ada reset |
| **AC-12** | No fallback | Bahasa `none` → empty state; tidak ada konten Inggris |
| **AC-13** | Audio | 100% listening punya audio + transcript; fallback error |
| **AC-14** | RTL/font | Arab RTL; Jepang furigana; Hindi/Korea font |
| **AC-15** | A11y | Keyboard-only; axe kritis 0; target 44 px |
| **AC-16** | Content QA | 0 placeholder; 0 duplicate; count = manifest |
| **AC-17** | Review | Sign-off; 100% N1/N2/C1; sample level lain |
| **AC-18** | Publish | Atomic; cache invalidated; learner melihat versi baru |
| **AC-19** | Rollback | Status < 5 menit; restore penuh < 30 menit; progress/attempt tidak rusak |
| **AC-20** | Migration | Progres legacy dipetakan; tidak ada kehilangan completion |
| **AC-21** | Performance | p95 lesson ≤ 300 ms; LCP ≤ 2,5 s; audio ≤ 1 s |
| **AC-22** | Security | Tidak ada IDOR; rate limit; signed audio |
| **AC-23** | Report | Laporan masuk; soal kritis dapat di-retire |
| **AC-24** | Analytics | Event + properti; tidak ada PII |
| **AC-25** | Search/filter | `q`/`skill`/`level` hanya published; < 300 ms; injection aman |
| **AC-26** | Build | `npm run build`, `npx tsc --noEmit`, lint lolos |

---

## 14. Risiko & Pertanyaan Terbuka

### 14.1 Risiko teknis

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Import 126.000 item lambat | Rilis molor | Batch 500; index minimal saat import; ukur |
| Query count per request | p95 naik | Materialized counters; cache |
| Answer key bocor | Cheating | DTO test; code review; no client key |
| Versi soal membingungkan | Statistik rusak | `questionVersion` eksplisit; stale handling |
| Audio signed URL expire | Playback gagal | Refresh URL saat error; TTL 1 jam |
| Migration progress | Kehilangan data | Backup; mapping; dual-read; flag |
| RTL/furigana layout | UI rusak | Audit screenshot; Playwright visual |
| Content import duplikat | Data kotor | Fingerprint unique; idempotent upsert |
| Payload lesson besar | LCP | ≤250KB; lazy audio; cache |
| 12 bahasa menguji kapasitas | QA tidak konsisten | Sampling; language lead; CI |

### 14.2 Pertanyaan terbuka

1. Apakah target 30–43 soal/pelajaran (rata-rata 35) final, atau 25 untuk mobile?
2. Apakah `matching` perlu partial credit?
3. Apakah transkrip boleh tampil sebelum submit secara default?
4. Apakah audio Jepang N3–N5 memakai TTS atau voice talent?
5. ~~Apakah `full` harus 10.500 atau 10.000 + 500 cadangan?~~ **Diputuskan:** gate `full` = 10.500; 500 soal tambahan adalah buffer konten, bukan pengganti gate.
6. Apakah level checkpoint wajib atau opsional?
7. Apakah report learner perlu status yang terlihat?
8. Apakah konten boleh diimpor dari CSV selain JSON?
9. Apakah perlu admin UI untuk review, atau CLI cukup?
10. Apakah audio perlu signed URL atau cukup CDN publik?

---

## 15. Lampiran

### A. Matriks per level

**Jepang (JLPT)** — 60 lesson, 2.100 soal/level:

| Skill | Lesson | Soal |
|---|---:|---:|
| Kosakata | 18 | 620 |
| Kanji | 12 | 400 |
| Tata bahasa | 14 | 480 |
| Membaca | 8 | 320 |
| Mendengar | 8 | 280 |
| **Total** | **60** | **2.100** |

Tipe: MCQ 650; fill 220; kanji 400; ordering 50; matching 100; reading 320; listening 280; correction 80.

**Inggris (CEFR)** — 60 lesson, 2.100 soal/level:

| Skill | Lesson | Soal |
|---|---:|---:|
| Kosakata | 15 | 450 |
| Tata bahasa | 18 | 600 |
| Membaca | 10 | 400 |
| Mendengar | 10 | 350 |
| Use of English | 7 | 300 |
| **Total** | **60** | **2.100** |

Tipe: MCQ 600; fill 450; ordering 100; matching 150; reading 400; listening 350; correction 50.

**10 bahasa lain (CEFR)** — 60 lesson, 2.100 soal/level:

| Skill | Lesson | Soal |
|---|---:|---:|
| Kosakata | 15 | 500 |
| Tata bahasa | 18 | 600 |
| Membaca | 10 | 400 |
| Mendengar | 10 | 350 |
| Penggunaan bahasa | 7 | 250 |
| **Total** | **60** | **2.100** |

Tipe: sama dengan Inggris.

### B. Contoh unit JSON (potongan)

```json
{
  "schemaVersion": "1.0.0",
  "contentVersion": "2026.11.0",
  "language": "ja",
  "framework": "JLPT",
  "level": "N5",
  "unit": {
    "id": "ja-jlpt-n5-u01",
    "position": 1,
    "title": "Perkenalan Diri",
    "goal": "Memperkenalkan nama, asal, dan pekerjaan",
    "checkpointQuestionCount": 20
  },
  "lessons": [
    {
      "id": "ja-jlpt-n5-u01-l01",
      "position": 1,
      "slug": "greetings",
      "title": "Salam",
      "objective": "Menggunakan salam dasar pada waktu yang tepat",
      "skill": "vocabulary",
      "estimatedMinutes": 8,
      "materials": {
        "id": {
          "blocks": [
            { "type": "explanation", "text": "Salam Jepang dipengaruhi waktu dan konteks." },
            { "type": "examples", "items": [{ "correct": "おはようございます", "annotation": "pagi, formal" }] }
          ]
        },
        "en": { "blocks": [{ "type": "explanation", "text": "Japanese greetings depend on time and formality." }] }
      },
      "passages": [],
      "questions": []
    }
  ]
}
```

### C. Kontrak tipe soal

| Tipe | `answerKey` | UI | Feedback |
|---|---|---|---|
| `multiple_choice` | `{ choiceId }` | 4 tombol | Pilihan benar disorot |
| `fill_blank` | `{ accepted: string[] }` | Input teks | Jawaban diterima + penjelasan |
| `ordering` | `{ order: string[] }` | Tap/drag token | Urutan benar |
| `matching` | `{ pairs: [{leftId,rightId}] }` | Dua kolom | Pasangan benar/salah |
| `kanji_reading` | `{ choiceId }` | 4 pilihan kana | Cara baca + furigana |
| `reading_comprehension` | `{ choiceId }` | Passage + pilihan | Kutipan passage + penjelasan |
| `listening_comprehension` | `{ choiceId }` | Audio + pilihan | Transcript + penjelasan |
| `correction` | `{ accepted: string[] }` | Input teks | Diff + aturan |

### D. Checklist review

- [ ] Objective jelas dan sesuai level.
- [ ] Materi tidak generik; contoh natural.
- [ ] Semua answer key benar.
- [ ] Pilihan pengecoh masuk akal; tidak ada jawaban di prompt.
- [ ] Level whitelist (Jepang) dipatuhi.
- [ ] Furigana/transliterasi benar.
- [ ] Audio jelas, durasi wajar, transkrip cocok.
- [ ] Passage sesuai panjang/level.
- [ ] Tidak ada konten sensitif/plagiarisme.
- [ ] Explanation `id`/`en` (dan `ja`) spesifik.
- [ ] Tidak ada placeholder.
- [ ] Bahasa target ≥90%.
- [ ] Format/typography konsisten.

### E. Error codes

| Code | HTTP | Keterangan |
|---|---|---|
| `INVALID_LANGUAGE` | 400 | Kode bahasa tidak dikenal |
| `INVALID_LEVEL` | 400 | Level tidak cocok framework |
| `CURRICULUM_NOT_AVAILABLE` | 404 | Belum ada published |
| `LESSON_NOT_FOUND` | 404 | Lesson tidak ada |
| `QUESTION_NOT_FOUND` | 404 | Soal tidak ada |
| `QUESTION_RETIRED` | 410 | Soal retired |
| `INVALID_ANSWER` | 400 | Bentuk jawaban salah |
| `STALE_QUESTION_VERSION` | 409 | Versi tidak dikenal |
| `LESSON_INCOMPLETE` | 409 | Complete sebelum semua soal |
| `RATE_LIMITED` | 429 | Terlalu banyak request |
| `INTERNAL` | 500 | Error tak terduga |

### F. Perintah & CI

```bash
npm run db:generate
npm run db:migrate
npm run content:validate
npm run content:import -- --release 2026.11.0
npm run content:publish -- --release 2026.11.0
npm run check:curriculum
npx tsc --noEmit
npm run lint
npm run build
```

CI wajib menjalankan:

1. `content:validate` untuk file yang berubah.
2. `check:curriculum` terhadap DB staging.
3. Unit + integration test.
4. DTO redaction test.
5. `tsc --noEmit`.
6. Lint (hanya issue pre-existing yang terdokumentasi).

### G. Referensi

- FS-07: `context/feature-specs/07-user-friendly-learning-ui.md`
- FS-08: `context/feature-specs/08-locale-preference-and-curriculum.md`
- PRD Multibahasa: `docs/PRD-multilingual-learning.md`
- Arsitektur: `context/architecture-context.md`
- UI: `context/ui-context.md`
- Kode standar: `context/code-standards.md`
- JLPT: https://www.jlpt.jp/
- CEFR: https://www.coe.int/en/web/common-european-framework-reference-languages/
- Next.js 16 docs: `node_modules/next/dist/docs/`

---

**Catatan akhir:** FS-09 sengaja memisahkan **konten** (immutable, berversi, direview) dari **progres** (mutable, per learner) dan dari **authoring source** (repo). Jika salah satu batas ini dilanggar, 126.000 soal akan menjadi beban operasional, bukan aset produk.
