# Architecture Context

## Stack

| Layer              | Technology              | Role                                                                     |
| ------------------ | ----------------------- | ------------------------------------------------------------------------ |
| Framework          | Next.js 16 + TypeScript | Full-stack app with server/client boundaries                             |
| UI                 | Tailwind + shadcn/ui    | Component composition and styling                                        |
| Auth               | Custom email/password  | bcrypt + DB-backed sessions; route guards and role differentiation (learner/tutor) |
| Database           | Prisma + PostgreSQL      | Relational metadata: profiles, multilingual curriculum, progress, lesson plans, bookings |
| Real-time          | Liveblocks              | Live session shared text pad, presence, and co-pilot sidebar state       |
| Background tasks   | Trigger.dev             | Durable AI lesson generation, exercise evaluation, and progress reports  |
| Artifact storage   | Vercel Blob             | Generated lesson plan Markdown and progress report Markdown              |
| Media sessions     | Daily.co (or equivalent)| Video/audio for live tutor sessions (embedded iframe; not self-hosted)   |
| Search / filtering | Prisma full-text search | Tutor browse with language, rating, and availability filters             |

## System Boundaries

- `app/api` — Authenticated request handlers: input validation, ownership checks, task triggering, booking management, and persistence.
- `trigger` — Long-running background jobs: AI lesson plan generation, free-text exercise evaluation, and progress report generation.
- `lib` — Shared infrastructure: Prisma client, session/auth helpers, locale registry, content repository, access control utilities, and type-safe wrappers.
- `content` — Authoring source of truth for curriculum units (validated Zod JSON). Imported idempotently into PostgreSQL; never imported into the client bundle.
- `components` — UI composition: lesson plan editor, exercise widgets, tutor cards, session room, and progress dashboard.
- `prisma` — Database schema and generated client output.
- `data` — Legacy local directory. Not used for new artifacts.

## Storage Model

- **Database (PostgreSQL via Prisma)**: all metadata — learner profiles, tutor profiles, multilingual curriculum (curricula → levels → units → lessons → passages → questions), exercise records, booking records, session metadata, and progress snapshots.
- **Vercel Blob**: generated artifacts — lesson plan Markdown at `lessons/{learnerId}/{planId}.md` and progress reports at `reports/{learnerId}/{reportId}.md`.
- The blob URL is stored in the database (`filePath`) as the canonical reference to the generated artifact.
- Exercise history and scores are stored as structured rows in PostgreSQL, not as blobs.

## Auth and Role Model

- Every user has a Lango account (`User`) with a bcrypt password hash and a role: `learner` or `tutor`.
- Sessions are server-side rows referenced by an httpOnly `lango_session` cookie; `getSessionUser` is the authoritative guard.
- Session, email-verification, and password-reset tokens are stored only as SHA-256 hashes. `AUTH_TOKEN_PEPPER` is the preferred pepper; when it is missing or too short in a deployment, a stable fallback is derived from the secret `DATABASE_URL` and a server warning is logged. Registration persists the user, profile rows, and session in one transaction, and login returns a typed 503 if a session cannot be created.
- Learners own lesson plans, exercise history, bookings, and reports.
- Tutors own availability slots and session records.
- Only the owning learner can mutate their own plan or trigger AI generation.
- Tutor profiles are publicly readable; personal data is protected.
- Liveblocks room tokens for session rooms are issued only after verifying booking membership.

## Starter Lesson Templates

- Prebuilt lesson templates are static structured JSON snapshots stored in the codebase under `data/templates/`.
- Templates are loaded into the active lesson plan when a user imports one.
- Import can occur on plan creation or from within the lesson editor at any time.
- Template data follows the same unit/exercise schema as user-created and AI-generated plans.
- Templates do not require a separate database record; they are resolved by template ID at import time.

## AI Generation Model

### Lesson Plan Generation

- Input: user goal prompt, target language, current proficiency level, and weekly availability.
- Execution: durable background task via Trigger.dev.
- Output: structured multi-week plan (milestones, vocabulary targets, grammar topics, daily exercises) saved to Vercel Blob as Markdown and referenced in the database.

### Exercise Evaluation

- Input: exercise definition, learner's free-text answer, and language context.
- Execution: durable background task via Trigger.dev (queued per submission).
- Output: score (0–100), correct answer, and natural language explanation stored in the exercise result row.

### Progress Report Generation

- Input: learner's exercise history, session summaries, and streak data.
- Execution: durable background task via Trigger.dev.
- Output: Markdown narrative progress report saved to Vercel Blob and linked in the database.

### AI Tutor (Conversational)

- Input: conversation history, learner profile context, and active lesson unit.
- Execution: streaming server-sent events from the API route (short, interactive turns — not a background task).
- Output: streamed text displayed in the chat UI.

## Language Axes and Curriculum Platform

Lango separates two independent language preferences:

1. **UI locale** (`uiLocale`) — language of menus, buttons, and messages. It is the `[lang]` route segment (`en`, `id`, `jp`, …) and the request authority. It never implies what the learner studies.
2. **Content language** (`targetLanguage` / `activeLanguageCode`) — canonical language code (`en`, `id`, `ja`, …) of the curriculum. It is stored on the account and never changes the URL by itself.

Rules:

- Route `jp` is an alias for content code `ja`; `ja` must never appear as a public route segment, and `jp` must never appear in API/DB content fields.
- 13 canonical content languages: `en, es, id, ja, zh, hi, de, ar, fr, pt, it, nl, ko`. Twelve have UI locales; `zh` is content-first (Mandarin/HSK) and reuses the active UI locale until its UI translation ships. One registry (`app/lib/i18n/locales.ts`) drives UI, content, TTS, and API metadata.
- Browser TTS never picks a voice from another language. `app/lib/speech/voice-catalog.ts` resolves the installed `SpeechSynthesisVoice` by the content language first, then by the learner's female/male preference (persisted per language in `lango:speech:gender:<lang>`); a missing target-language voice returns `no-voice` instead of reading with the default English voice.
- UI fallback is allowed (`en`); content fallback across languages is forbidden. A language without published curriculum renders an honest empty state.
- Curriculum content is stored in PostgreSQL and addressed by stable IDs (`ja-jlpt-n5-u01-l03-q0042`) with immutable `contentVersion`; JSON files under `content/curricula/**` are the authoring/import source.
- Question `answerKey` is server-only and must never appear in learner DTOs before submission.
- `LessonProgress` / `ExerciseAttempt` carry denormalized `languageCode` so per-language dashboards are index-friendly.


## Story-First Curriculum (PRD v1.0 execution)

The story layer is an additive extension of FS-09, not a second content platform.

- **Authoring source:** `content/stories/{lang}/world.json` (story bible, characters, lexicon, culture notes, 10 arc seeds) and `kit.json` (80 sentence frames, lexicon, grammar, question phrases). `scripts/story/master-frames.ts` defines the shared 80-frame contract; every language kit covers every frame.
- **Generated library:** `content/stories/{lang}/library/{worldId}-{tier}.json`, five files per language. Each level is 2 arcs × 20 episodes × 10 scenes = 400 scenes; each scene has 6–12 lines, 3–6 exercises, one cliffhanger and exactly four supporting materials (vocabulary, grammar, culture, review). One episode/story therefore contains 10 scenes × (1 + 4) = **50 learning objects**, inside the 20–100 target.
- **Counts:** 13 languages × 5 levels × 400 scenes = **26,000 scenes**; 26,000 × 4 = **104,000 supporting materials**; **130,000 learning objects**; 2,600 episodes/stories.
- **Future tiers:** Japanese `ja` maps N5–N1 to T1–T5; Mandarin `zh` maps HSK 1–2, 3, 4, 5, 6 to T1–T5; the other 11 languages map CEFR A1–C1.
- **Runtime content:** the reader serves the immutable generated library files through `app/lib/story/content.ts` (server-only, lazy per-language cache). This keeps scene payloads small and avoids loading 130k DB rows on the request path. The same scenes can be bulk-imported into the FS-09 tables with `content:stories:import` for DB-backed deployments.
- **Deployment packaging:** the raw libraries are ~649 MB and stay gitignored. `npm run content:stories:pack` produces committed Brotli files under `content/stories/compiled/` (~14 MB total for all 13 languages); regenerate them with `content:stories:generate` + `content:stories:pack` whenever the authoring source changes. `next.config.ts` traces those files only into the routes that can render story content. `app/lib/story/content.ts` prefers the packed files and falls back to raw JSON for local development.
- **Persisted state:** `StorySceneProgress` (resume, completion, minutes), `StoryProgress` (current scene, choices, affinity), `StoryPassportStamp`, `StoryFlag`, `StoryReview`, `StoryRevision`, plus the existing `LessonProgress`, `ExerciseAttempt`, `XpEvent`, `DailyActivity`, `UserLanguageStats`, and `LanguageDailyActivity`. Attempts are idempotent by `clientEventId`; scene completion awards XP once per scene.
- **APIs:** `GET /api/v1/stories`, `/stories/:worldId`, `/stories/:worldId/arcs/:arcId`, `/episodes/:episodeId`, `/scenes/:sceneId`, `/materials/:materialId`, `/passport`, `/characters`, `/stories/:worldId/recap`; `POST /api/v1/story-progress`, `/story-choices`, `/story-attempts`, `/scenes/:sceneId/flag`, `/review`, `/review/rate`, `/review/complete`.
- **Level & language rails:** `?tier=T1..T5` and `?language=<code>` are read-only selectors for story screens. They never persist to `User` and never change the `[lang]` UI locale.
- **Derived reports:** chapter reports (`/results`, `/results/:episodeId`) are computed on read from `StorySceneProgress`, `ExerciseAttempt`, and `XpEvent`; no report table is added.
- **Episode journey:** episode unlocks are derived on read from `StorySceneProgress` by `app/lib/story/journey.ts` (first episode per level open; next episode opens at 80% of the previous episode's scenes). No unlock table or column is added; the reader redirects locked episodes to `/[lang]/reader?locked=<episodeId>` and the completion response (`POST /api/v1/story-progress`) carries the episode snapshot (`complete`, `remaining`, `nextEpisodeUnlocked`). Attempts are attributed to an episode only when their `exerciseId` is one of that episode's scene exercises (story episode IDs share the curriculum lesson ID namespace).
- **Word Vault SRS:** vocabulary cards reuse `SpacedReviewItem` (`moduleId='story'`, `sourceType='story_word'`, `conceptKey='story:word:<lang>:<sceneId>:<term>'`). `POST /api/v1/review/rate` applies SM-2 updates; `POST /api/v1/review/complete` awards the daily vault bonus. No new tables.
- **Answer-key boundary:** the scene/material DTOs never include `answerKey` or `explanation`; grading happens in `POST /api/v1/story-attempts` (file-backed, works for all languages) or the existing `/api/v1/attempts` for imported curriculum rows.
- **Romanization:** 100% of `ja`/`zh` lines carry romaji/pinyin in the generated library; `ja` lines carry kana readings. The reader defaults romanization on for `ja`/`zh`, supports furigana for `ja`, and persists toggles locally.
- **Quality gate:** the generated library is schema-validated by `content:stories:validate` (0 errors, 0 warnings). Human native/culture/pedagogy review remains the publication gate; `StoryReview` rows are seeded as `pending` and the UI/report expose that backlog.

## Visa Kerja Interview Practice (PRD execution)

`/[lang]/visa-kerja` adds interview rehearsal on top of the expedition shell. It is feature-flagged by content availability, not by a second platform.

- **Content source:** `content/interview/questions.{en,id,ja}.json` (20 questions per language, canonical ids shared across languages) and `content/interview/tracks.json`; `manifest.json` records version, review state and per-language counts. Structural checks run in `npm run interview:validate` (unique ids, 6 tracks, 3 keywords, 2 follow-ups, 3 rubric points, 3 red flags, key phrases, cultural note, romanization for `ja`, placeholder scan).
- **Question contract:** prompt, translation, romanization, competencies, expected length, time limit, follow-ups, skeleton, model answer, key phrases, rubric points, red flags, cultural note, evaluator keywords. The public DTO strips the guideline; only the hub/report/guide server components read the full question.
- **Selection:** `drill` = 3 questions, `simulation` = 8 questions. The selected order is snapshotted into `InterviewSession.questionIds`; answers are only accepted in order. Rate limits are 20 drills and 5 simulations per user per 24h.
- **Evaluation v1:** `app/lib/interview/evaluate.ts` is deterministic and server-only. Five dimensions (content, structure, evidence, language/register, delivery) are scored 1–5 from keyword overlap, answer-structure markers per track, numeric evidence (including kanji numerals), register detection (です/ます, slang, first person), filler ratio and spoken-length proximity. Readiness = weighted mean ×20, clamped 20–100. The LLM evaluator in the PRD is not wired (no API key in this deployment); the JSON shape and the "pre-checks before LLM" boundary are already in place.
- **Persistence:** `InterviewSession` (language, track, mode, locale, questionIds snapshot, readiness, band, xpAwarded) and `InterviewTurn` (ordered transcript, duration, scores, readiness, feedback codes/metrics). Feedback is stored as codes so the UI localizes it; no free text is persisted.
- **XP and activity:** completion awards 20 XP (drill) or 80 XP (simulation) once per session via `XpEvent` idempotency (`visa-kerja:<sessionId>`), updates `DailyActivity`, `LanguageDailyActivity` and `UserLanguageStats` with the estimated spoken minutes, and calls `touchStreak`.
- **APIs:** `POST /api/v1/interview/sessions`, `POST /api/v1/interview/sessions/:id/answers`, `POST /api/v1/interview/sessions/:id/complete`. Session reads happen in server components through `app/lib/interview/repository.ts` and are scoped by `userId`.
- **Surfaces:** hub (`/visa-kerja`), guided model answers (`/visa-kerja/panduan`), session runner (`/visa-kerja/sesi/:id`), report (`/visa-kerja/laporan/:id`). The sidebar entry sits above Passport and is derived from the pathname in `ExpeditionShell`.
- **Voice:** question audio uses the shared `useSpeech` voice catalogue; dictation uses the browser `SpeechRecognition` API when available and falls back to typing. No audio is uploaded or stored in v1.
- **Honesty:** the report and hub label readiness as a practice signal, never a hiring prediction; content is labelled beta until native review.

## Invariants

1. Request handlers do not run long-lived AI work — that belongs in background tasks.
2. Metadata and generated artifacts are stored in separate layers (PostgreSQL vs. Vercel Blob).
3. Auth and ownership are enforced at every mutation boundary.
4. Client components are used only where browser interactivity, streaming, or real-time state requires them.
5. The lesson plan schema must remain consistent between user-created, AI-generated, and imported template content.
6. Exercise evaluation results are always persisted before being surfaced in the UI.
7. Video/audio infrastructure is delegated to the third-party session provider; Lango AI owns only the metadata and co-pilot layers.

8. UI locale changes never mutate `targetLanguage`; target-language changes never mutate the URL.
9. Locale preferences are persisted before navigation (DB + `lango_locale` cookie), and the URL wins for the current request.
10. Published curriculum content is immutable per `contentVersion`; retired questions are hidden from new learners but keep attempts/progress.
11. Interview scores and readiness are computed and stored server-side; model output (future LLM evaluator) is never trusted as the score.
12. Interview feedback is persisted as localized codes + numeric metrics, not as generated prose.
