# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Number Name Gamification Module

## Current Goal

- Implement Number Name learning module with Flashcard (Phase 1.1) and Listen & Pick (Phase 1.2), integrated into editor sidebar

## Completed

- [x] Install and configure shadcn/ui (base-nova style, components.json written)
- [x] Add shadcn components: Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea
- [x] Create `app/lib/utils.ts` with `cn()` helper (clsx + tailwind-merge)
- [x] Add shadcn CSS theme tokens to `globals.css` (`@theme inline` + `:root`)
- [x] Install `@base-ui/react` (shadcn v4 base layer)
- [x] Install `@clerk/nextjs` and `@clerk/ui`
- [x] Create `proxy.ts` at project root with Clerk `clerkMiddleware` + i18n + route protection (Next.js 16 proxy function)
- [x] Remove old `middleware.ts` (replaced by `proxy.ts`)
- [x] Create Clerk Frontend API proxy route (`app/api/__clerk/[[...path]]/route.ts`)
- [x] Wrap root layout with `ClerkProvider` using Clerk `dark` theme (conditional on valid keys)
- [x] Move auth pages under `[lang]` route group: `app/[lang]/(auth)/sign-in/`, `app/[lang]/(auth)/sign-up/`
- [x] Auth two-panel layout: logo + feature list left, Clerk form right
- [x] Sign-in page with CSS variable-based Clerk `dark` appearance (no hardcoded colors)
- [x] Sign-up page with CSS variable-based Clerk `dark` appearance (no hardcoded colors)
- [x] Locale redirect at root `/sign-in` → `Accept-Language` based `/[lang]/sign-in`
- [x] Locale redirect at root `/sign-up` → `Accept-Language` based `/[lang]/sign-up`
- [x] Update root `/` — authenticated → `/editor`, unauthenticated → `/[lang]/sign-in`
- [x] Create `/editor` layout with `UserButton` in top navbar
- [x] Create `/editor` page (placeholder dashboard)
- [x] Add Clerk env vars to `.env.local` and `.env.example`
- [x] Add Clerk CDN domains to CSP in `next.config.ts`
- [x] Add `app/lib/clerk.ts` — `isClerkConfigured()` helper
- [x] Create `components/editor/editor-navbar.tsx` — fixed top navbar with sidebar toggle
- [x] Create `components/editor/project-sidebar.tsx` — floating sidebar with Tabs (My Projects, Shared) and New Project button
- [x] Create `components/editor/dialog-pattern.tsx` — reusable DialogPattern and ConfirmDialog components
- [x] Integrate EditorNavbar + ProjectSidebar into `app/[lang]/editor/layout.tsx` via EditorShell
- [x] Create Number Name module types, data, and context (`components/editor/number-name/`)
- [x] Create Flashcard Phase — 3D flip cards with number-word + SpeechSynthesis audio
- [x] Create Listen & Pick Phase — audio playback, 4-option quiz with XP/streak/lives
- [x] Create GamificationBar — XP bar, level, streak, lives display
- [x] Update ProjectSidebar with Number Name module entry in "My Projects" tab
- [x] Wire Number Name module into EditorShell via ModuleProvider context
- [x] Create Grammar Module (`components/editor/grammar/`) — types, data, context, and 4 exercise components
- [x] Grammar curriculum data: 10 English lessons across A1, A2, B1 levels (structured content + 3-4 exercises each)
- [x] Exercise types: Multiple Choice, Fill-in-the-Blank, Sentence Ordering, Correction
- [x] Grammar Dashboard with CEFR level selector, progress bar, and lesson list
- [x] Lesson view with explanations, rules, examples, grammar tables, and learning tips
- [x] Practice phase with sequential exercises, progress dots, and results summary
- [x] GamificationBar for grammar module (XP, level, streak, lives)
- [x] Wire Grammar module into sidebar (status: ready), EditorShell (GrammarProvider), and page.tsx

## In Progress

- None (Editor Chrome completed)

## Next Up

- [ ] Auth and learner/tutor profile creation (Clerk + Prisma schema)
- [ ] Lesson plan schema, creation API, and empty plan UI
- [ ] Starter lesson template library and import
- [ ] AI lesson plan generation via Trigger.dev
- [ ] Exercise engine: display, submission, AI evaluation
- [ ] Tutor browse page and profile view
- [ ] Booking flow and booking management
- [ ] Session room: Liveblocks shared text pad + AI co-pilot sidebar
- [ ] Progress dashboard widgets
- [ ] Progress report generation and download

## Open Questions

- Which video/audio provider should be used for live tutor sessions? (Daily.co assumed; confirm before building session room.)
- Should tutor availability be managed as calendar slots in the database or delegated to a third-party scheduling tool?
- What languages are supported at launch? (French, Spanish, Arabic, English assumed from Lango reference.)
- Should the AI tutor conversation history be persisted to the database for session replay, or kept client-side only?
- Is group session booking in scope for the initial release?

## Architecture Decisions

- Add decisions that affect the system design or data model here as they are resolved.

## Session Notes

- Add context needed to resume work in the next session here.
