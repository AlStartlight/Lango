# AI Workflow Rules

## Development Philosophy

Build incrementally. Each session should deliver a vertically complete, working slice of functionality — not scaffolding without behaviour. A "done" feature means it renders, responds, persists, and handles errors.

## Scoping Rules

1. **One feature unit per session.** Do not start a second feature before the current one is complete and working end-to-end.
2. **No speculative abstractions.** Do not build infrastructure for features that are not yet in scope. Build what is needed now; refactor when the second use case arrives.
3. **Schema changes are deliberate.** Any change to the Prisma schema requires updating `architecture-context.md` before writing migration or application code.
4. **Background tasks are explicit boundaries.** When a feature requires a Trigger.dev task, define the task input/output interface before implementing either side.
5. **Client components are the exception.** Before adding `"use client"`, confirm that the interactivity cannot be achieved with a Server Component + server action.

## Delivery Approach

### Starting a Session

1. Read `progress-tracker.md` to understand current phase and next step.
2. Identify the single feature unit to implement.
3. Read the relevant context files for that feature (architecture, UI, code standards).
4. State the implementation plan in one paragraph before writing any code.

### During a Session

- Implement the feature end-to-end: schema → API route → background task (if needed) → UI component.
- Keep each file change focused. Do not refactor unrelated code in the same diff.
- If you encounter an architectural ambiguity, resolve it in `architecture-context.md` before proceeding.
- If UI decisions are unclear, resolve them in `ui-context.md` before building the component.

### Ending a Session

1. Update `progress-tracker.md`: move completed items, note what is in progress, add session notes.
2. If any context file was changed during the session, confirm the change is reflected consistently across all dependent files.
3. Leave the codebase in a runnable state — no half-implemented features that break the build.

## Feature Delivery Order (Suggested)

The following order minimises blockers and maximises testable progress at each step:

1. Auth and learner/tutor profile creation
2. Lesson plan schema, creation API, and empty plan UI
3. Starter lesson template library and import into active plan
4. AI lesson plan generation (Trigger.dev task + progress indicator)
5. Exercise engine: display, submission, and AI evaluation task
6. Tutor browse page and profile view
7. Booking flow and booking management
8. Session room: Liveblocks shared text pad + AI co-pilot sidebar
9. Progress dashboard: streak, weekly minutes, vocabulary, grammar units
10. Progress report generation (Trigger.dev task) and download

## Open Questions Protocol

- When a question blocks implementation, add it to `progress-tracker.md` under Open Questions.
- Do not invent an answer and proceed — surface it and make the minimal assumption explicit.
- When a question is resolved, move it to Architecture Decisions with the chosen answer.

## Error Handling Expectations

- Every API route must return a typed error shape: `{ error: string; code: string }`.
- Background tasks must handle retries gracefully — operations must be idempotent where possible.
- UI components must handle loading, error, and empty states explicitly — no silent failures.
- AI generation failures must surface a human-readable error message and offer a retry action.
