# Code Standards

## General

- Keep modules small and single-purpose.
- Fix root causes — do not layer workarounds.
- Do not mix unrelated concerns in one component or route.
- Respect the system boundaries defined in `architecture-context.md`.

## TypeScript

- Strict mode is required throughout the project.
- Avoid `any`; use explicit interfaces or narrowly scoped types.
- Validate unknown external input at system boundaries before trusting it.
- Use `interface` for object contracts.
- Define shared domain types (LearnerProfile, LessonPlan, ExerciseResult, etc.) in `types/` and import from there — do not redeclare in component files.

## Next.js

- Default to React Server Components.
- Add `"use client"` only when the component needs browser interactivity, streaming state, hooks, or real-time presence.
- Keep route handlers focused on a single responsibility.
- Long-running AI work (lesson generation, exercise evaluation, report generation) belongs in Trigger.dev background tasks, not in request handlers.
- Streaming AI tutor responses use server-sent events via a dedicated API route — not a background task.

## Styling

- Use CSS custom property tokens defined in `globals.css` — no raw Tailwind color classes like `slate-*`, `orange-*`, or hardcoded hex values.
- Reference tokens through their Tailwind utility names: `bg-base`, `bg-surface`, `text-primary`, `text-muted`, `border-default`, `text-brand`, etc.
- Maintain the border radius scale: `rounded-lg` for small elements, `rounded-2xl` for cards, `rounded-3xl` for modals, `rounded-full` for pill badges.
- Unit type colors (vocabulary, grammar, listening, etc.) are defined in `lib/lesson-colors.ts` as a lookup map — never inline these hex values in components.

## API Routes

- Validate and parse request input before any logic runs.
- Enforce auth and ownership checks (Clerk + Prisma role lookup) before any mutation.
- Return consistent, predictable response shapes.
- Keep route handlers thin — push complexity into shared modules or background tasks.
- Booking and session routes must verify that both the learner and tutor exist and are active before creating a booking record.

## Data and Storage

- Learner profiles, tutor profiles, lesson plan metadata, exercise results, booking records, and progress snapshots belong in PostgreSQL via Prisma.
- Generated lesson plan Markdown and progress report Markdown belong in Vercel Blob; Prisma stores only the blob URL reference (`filePath`).
- Do not store large generated content directly in the database.
- Exercise result rows are structured relational data — store score, correct answer, AI explanation, and timestamp as columns, not as a JSON blob.
- Task run records are first-class relational data — treat ownership and run IDs as verified before surfacing status in the UI.

## Exercise Evaluation

- Free-text exercise evaluation is always asynchronous (via Trigger.dev).
- The UI transitions to an "AI is reviewing…" state immediately on submission and polls or subscribes to the task run result.
- Never block the UI thread waiting for AI evaluation.

## AI Tutor Conversations

- Conversation history is maintained client-side in React state and sent in full on each turn.
- The server does not persist conversation turns unless the user explicitly saves a session summary.
- System prompt for the AI tutor must include: target language, learner's current level, active lesson unit topic, and native language for fallback explanations.

## File Organization

- `lib/` — shared infrastructure: Prisma client, Clerk helpers, access control utilities, lesson color map, and type-safe service wrappers.
- `trigger/` — all durable background tasks: lesson plan generation, exercise evaluation, progress report generation.
- `components/` — UI composition only; no business logic. Subdirectories: `lesson/`, `exercise/`, `tutor/`, `session/`, `progress/`, `ui/`.
- `app/api/` — route handlers for auth, booking, task triggering, and persistence.
- `types/` — shared TypeScript interfaces for domain objects.
- `data/templates/` — static JSON lesson template snapshots.
- Name files after the responsibility they contain, not the technology.
