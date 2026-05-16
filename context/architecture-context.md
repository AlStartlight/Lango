# Architecture Context

## Stack

| Layer              | Technology              | Role                                                                     |
| ------------------ | ----------------------- | ------------------------------------------------------------------------ |
| Framework          | Next.js 16 + TypeScript | Full-stack app with server/client boundaries                             |
| UI                 | Tailwind + shadcn/ui    | Component composition and styling                                        |
| Auth               | Clerk                   | User identity, route protection, and role differentiation (learner/tutor)|
| Database           | Prisma + PostgreSQL      | Relational metadata: profiles, lesson plans, bookings, exercise history  |
| Real-time          | Liveblocks              | Live session shared text pad, presence, and co-pilot sidebar state       |
| Background tasks   | Trigger.dev             | Durable AI lesson generation, exercise evaluation, and progress reports  |
| Artifact storage   | Vercel Blob             | Generated lesson plan Markdown and progress report Markdown              |
| Media sessions     | Daily.co (or equivalent)| Video/audio for live tutor sessions (embedded iframe; not self-hosted)   |
| Search / filtering | Prisma full-text search | Tutor browse with language, rating, and availability filters             |

## System Boundaries

- `app/api` — Authenticated request handlers: input validation, ownership checks, task triggering, booking management, and persistence.
- `trigger` — Long-running background jobs: AI lesson plan generation, free-text exercise evaluation, and progress report generation.
- `lib` — Shared infrastructure: Prisma client, Clerk helpers, access control utilities, and type-safe wrappers.
- `components` — UI composition: lesson plan editor, exercise widgets, tutor cards, session room, and progress dashboard.
- `prisma` — Database schema and generated client output.
- `data` — Legacy local directory. Not used for new artifacts.

## Storage Model

- **Database (PostgreSQL via Prisma)**: all metadata — learner profiles, tutor profiles, lesson plans (structure only), exercise records, booking records, session metadata, and progress snapshots.
- **Vercel Blob**: generated artifacts — lesson plan Markdown at `lessons/{learnerId}/{planId}.md` and progress reports at `reports/{learnerId}/{reportId}.md`.
- The blob URL is stored in the database (`filePath`) as the canonical reference to the generated artifact.
- Exercise history and scores are stored as structured rows in PostgreSQL, not as blobs.

## Auth and Role Model

- Every user has a Clerk identity with a role: `learner` or `tutor`.
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

## Invariants

1. Request handlers do not run long-lived AI work — that belongs in background tasks.
2. Metadata and generated artifacts are stored in separate layers (PostgreSQL vs. Vercel Blob).
3. Auth and ownership are enforced at every mutation boundary.
4. Client components are used only where browser interactivity, streaming, or real-time state requires them.
5. The lesson plan schema must remain consistent between user-created, AI-generated, and imported template content.
6. Exercise evaluation results are always persisted before being surfaced in the UI.
7. Video/audio infrastructure is delegated to the third-party session provider; Lango AI owns only the metadata and co-pilot layers.
