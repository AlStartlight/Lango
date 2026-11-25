# UI Context

## Theme

Light with selective dark surfaces. The visual language is warm, inviting, and modern — designed to feel approachable for learners of all ages while retaining a sharp, professional edge for the tutor marketplace and session room. The primary canvas is off-white; AI and interactive elements use vivid accent colors.

All colors are defined as CSS custom properties in `globals.css` and mapped to Tailwind tokens via `@theme inline`. Components must use these tokens — no hardcoded hex values or raw Tailwind color classes like `slate-*` or `zinc-*`.

| Role               | CSS Variable               | Hex / Value                    |
| ------------------ | -------------------------- | ------------------------------ |
| Page background    | `--bg-base`                | `#F9F7F4`                      |
| Surface            | `--bg-surface`             | `#FFFFFF`                      |
| Elevated surface   | `--bg-elevated`            | `#F2EFE9`                      |
| Subtle surface     | `--bg-subtle`              | `#EAE6DF`                      |
| Default border     | `--border-default`         | `#DDD9D0`                      |
| Subtle border      | `--border-subtle`          | `#C9C4BA`                      |
| Primary text       | `--text-primary`           | `#1A1714`                      |
| Secondary text     | `--text-secondary`         | `#4A4640`                      |
| Muted text         | `--text-muted`             | `#837E78`                      |
| Faint text         | `--text-faint`             | `#B0ABA4`                      |
| Brand accent       | `--accent-primary`         | `#FF6B35` (warm orange)        |
| Brand dim          | `--accent-primary-dim`     | `rgba(255, 107, 53, 0.10)`     |
| AI accent          | `--accent-ai`              | `#7C3AED` (violet)             |
| AI dim             | `--accent-ai-dim`          | `rgba(124, 58, 237, 0.10)`     |
| AI text            | `--accent-ai-text`         | `#6D28D9`                      |
| Success            | `--state-success`          | `#16A34A`                      |
| Error              | `--state-error`            | `#DC2626`                      |
| Warning            | `--state-warning`          | `#D97706`                      |
| XP / streak        | `--accent-xp`              | `#F59E0B` (amber)              |
| Session live badge | `--accent-live`            | `#EF4444` (red)                |

Tailwind utility names map to these variables. Use `bg-base`, `bg-surface`, `text-primary`, `text-muted`, `border-default`, `text-brand`, `bg-accent-dim`, `text-ai`, etc.

## Typography

| Role         | Font             | CSS Variable           |
| ------------ | ---------------- | ---------------------- |
| Display / UI | Plus Jakarta Sans| `--font-jakarta`       |
| Body / prose | Lora             | `--font-lora`          |
| Code / mono  | JetBrains Mono   | `--font-mono`          |

All fonts are loaded via `next/font/google` and applied as CSS variables on the `<html>` element. The base `body` uses Plus Jakarta Sans with `antialiased`. Lesson content body text uses Lora for readability.

## Border Radius

| Context             | Class         |
| ------------------- | ------------- |
| Inline / small UI   | `rounded-lg`  |
| Cards / panels      | `rounded-2xl` |
| Modal / overlay     | `rounded-3xl` |
| Pill badges / tags  | `rounded-full`|

## Language Flag Chips

Each language is represented by a flag image chip: `16x16` flag followed by the language name. Used in tutor cards, lesson headers, and profile selectors. Flag assets live at `public/images/flags/{language-code}.png`.

## Lesson Plan Color Palette

Each lesson unit type has a color identity for visual scanning.

| Unit Type       | Background  | Text        | Character          |
| --------------- | ----------- | ----------- | ------------------ |
| Vocabulary      | `#FFF7ED`   | `#C2410C`   | Warm orange        |
| Grammar         | `#EFF6FF`   | `#1D4ED8`   | Cool blue          |
| Listening       | `#F0FDF4`   | `#15803D`   | Fresh green        |
| Speaking        | `#FDF4FF`   | `#7E22CE`   | Violet             |
| Reading         | `#FEFCE8`   | `#A16207`   | Amber              |
| Cultural note   | `#FFF1F2`   | `#BE123C`   | Rose               |
| Review          | `#F8FAFC`   | `#475569`   | Neutral slate      |

## Exercise Widget Conventions

- Correct answer feedback: `--state-success` background flash + checkmark icon.
- Wrong answer feedback: `--state-error` background flash + explanation block slides in.
- AI evaluation in-progress: violet pulsing spinner with label "AI is reviewing…".
- Score badge: `rounded-full` pill with XP amber background showing points earned.

## Component Library

shadcn/ui on top of Tailwind. No custom design system. Components live in `components/ui/`. Use the `shadcn` CLI to add new components rather than writing them from scratch.

## Layout Patterns

- **Dashboard**: top navbar + left sidebar (collapsible) + main content area + optional right panel for AI tutor chat.
- **Lesson editor**: full-viewport — left unit list panel, center exercise area, right AI tutor sidebar (slide-over).
- **Tutor marketplace**: grid of tutor cards with sticky filter sidebar on the left.
- **Session room**: full-viewport — center video grid, left shared text pad, right AI co-pilot sidebar.
- **Sidebars**: floating overlay with light semi-transparent background and `--border-default` border.
- **Modals and dialogs**: centered overlay, `rounded-3xl`, white background with backdrop blur.
- **Navbar**: top bar with `--bg-surface` background and bottom `--border-default` border. Shows learner streak badge and XP count on the right.

## Progress Dashboard Widgets

- **Streak counter**: flame icon + day count in `--accent-xp` amber.
- **Weekly minutes**: horizontal progress bar in `--accent-primary` orange.
- **Vocabulary mastered**: word count badge with book icon.
- **Grammar units**: completed/total fraction with progress ring.

## Icons

Lucide React. Stroke-based icons only — no filled variants. Icon sizes: `h-4 w-4` for inline, `h-5 w-5` for buttons, `h-6 w-6` for sidebar items, `h-8 w-8` for empty states and feature illustrations.

## Animations

- Page transitions: fade + slight upward slide (`translateY(8px) → 0`, 200ms ease-out).
- Exercise feedback flash: 300ms background color transition.
- AI tutor message stream: text appears token by token; no skeleton loaders for streaming content.
- Lesson plan card hover: `translateY(-2px)` + shadow deepens, 150ms ease.
- Session live badge: slow pulse animation on the red dot indicator.

## Loading States

- **Workspace route transitions use a shimmer skeleton.** `app/[lang]/(expedition)/loading.tsx` streams `WorkspaceDashboardSkeleton` from `app/components/expedition/loading-skeleton.tsx`; it mirrors the dashboard geometry (hero → language/level rail → two-column card grid) so the skeleton-to-content swap does not shift layout. The shell (sidebar/HUD) stays mounted and is never part of the skeleton.
- **Primitives:** `.exp-skeleton` (light surfaces) and `.exp-skeleton-inverse` (on the green hero) in `globals.css`; the moving highlight is the `exp-shimmer` keyframe. Use `<Skeleton>` blocks from the shared module instead of `animate-pulse` or raw grey utilities, and never show fake progress percentages.
- **Accessibility:** the loading region is `role="status"` + `aria-busy` with a short visible-to-screen-readers label; blocks are `aria-hidden`. The shimmer stops under `prefers-reduced-motion` while the base fill remains legible.

## Survival & Trial (Drill Training Camp)

The classic drill workspace moved to `/[lang]/learn/survival` (legacy `/[lang]/editor`, which now redirects) and renders inside the same `StoryShell` / `ExpeditionShell` as every other learner screen. There is no separate dark studio chrome any more: the camp hub (`app/components/expedition/survival-camp.tsx`) opens drills in the main expedition canvas, and each drill runs in a contained module frame with a "Back to camp" control.

Rules:

- Use the expedition tokens and primitives only: `.exp-card`, `.exp-btn`, `.exp-chip`, `.exp-answer`, `.exp-progress`, `.exp-pill`. Never reintroduce a parallel dark palette: the legacy `--learn-*` token block and the `EditorShell` / editor navbar / project sidebar components were removed, and `/[lang]/editor` only redirects to the camp.
- The camp hub shows real data: today's minutes/goal, streak, XP today and due reviews from `GET /api/v1/home/today`; drill availability is derived from the content language and must stay honest (Curriculum always, Number Name for `en/es/fr/de/id/ja`, Grammar for `en` today).
- The active drill is reflected in `?module=<id>` with `history.replaceState`, so drills are refreshable/shareable and "Back to camp" clears the parameter. Deep links such as the review queue's `?module=curriculum&lesson=…` open the drill directly.
- `GamificationBar` (`app/components/editor/shared/gamification-strip.tsx`) is the drill-local session HUD (run XP, level, lives, combo streak). The shell HUD owns account-wide streak/XP/hearts, so both can coexist without contradicting each other.
- Minimum readable font size is 12px in UI labels; body copy uses `text-sm`/`text-[16px]`.
- Normal text must reach 4.5:1 contrast. Muted text uses `text-exp-on-surface-muted`; never `text-white/xx`.
- Interactive targets are at least 44×44px, and answer options use letter chips (A–D) with `.exp-answer` selected/correct/wrong states.
- Feedback uses an icon + text, never color alone, and stays mounted until the learner continues.
- CJK text uses the `:lang(ja)` font stack and line-height 1.75.

Reference screenshots: `docs/assets/survival-camp.png` (camp hub), `docs/assets/survival-camp-drill.png` (drill + feedback), `docs/assets/survival-camp-mobile.png` (mobile hub).

## Lango Expedition (Story-First Learning UI)

The learner-facing story experience follows the Stitch "Lango Expedition" design system. Tokens live in `globals.css` under `--exp-*` and map to Tailwind as `bg-exp-surface`, `text-exp-primary`, `border-exp-container-high`, etc. Never hardcode the expedition palette in components.

| Role | Variable | Value |
| --- | --- | --- |
| Page canvas | `--exp-surface` | `#F9F9FF` |
| Cards | `--exp-surface-lowest` | `#FFFFFF` |
| Soft rails / wells | `--exp-surface-low` | `#F0F3FF` |
| Chips / borders | `--exp-container-high` | `#DEE8FF` |
| Sunken track | `--exp-container-highest` | `#D8E3FB` |
| Primary action | `--exp-primary` / `--exp-primary-container` | `#006C49` / `#10B981` |
| Quest amber | `--exp-secondary` / `--exp-secondary-container` | `#855300` / `#FEA619` |
| Magic violet | `--exp-tertiary` | `#494BD6` |
| Body text | `--exp-on-surface` | `#111C2D` |
| Secondary text | `--exp-on-surface-variant` | `#3C4A42` |
| Muted text (AA) | `--exp-on-surface-muted` | `#55655C` |
| Success text | `--exp-success` | `#15803D` |

Primitives (defined in `globals.css`):

- `.exp-card` — white card with 1.25rem radius and 4px bottom bevel.
- `.exp-btn` + `.exp-btn-primary|amber|ghost|soft` — tactile 3D buttons with press-down offsets.
- `.exp-pill` — capsule stats and level badges.
- `.exp-progress` — juicy inset meter with gloss highlight; add `exp-progress-amber` for secondary progress.
- `.exp-chip` / `.exp-chip-active` — capsule segmented-control chips for level and phase rails.
- `.exp-answer` (+ `-selected`, `-correct`, `-wrong`, `-muted`) — 2px outline answer cards with a tactile base lift and letter-chip layout.
- `.exp-bubble` — comic speech bubble with a left tail.
- `.exp-tactile-node`, `.exp-quest-locked` — quest-map checkpoints.
- `.exp-hero`, `.exp-dotted-map`, `.exp-scroll-hide`, `.exp-float`.

Layout rules:

- `ExpeditionShell` (`app/components/expedition/expedition-shell.tsx`) owns the fixed 288px sidebar, mobile drawer, HUD (streak / XP / hearts / daily target) and profile chip. All learner routes live under the `app/[lang]/(expedition)` route group, whose shared `layout.tsx` resolves the session + HUD + story catalog once and renders `StoryShell`. Pages must not render `StoryShell` themselves: the layout keeps the sidebar and HUD mounted across navigation, so only the page segment refetches when a link is clicked. The active sidebar item is derived client-side from `usePathname`; `loading.tsx` in the same group is the instant navigation skeleton.
- Navigation is: Peta Petualangan (`/learn`), Cerita Interaktif (reader), Latihan & Kuis (`/practice`), Brankas Kata (`/vault`), Hasil & Evaluasi (`/results`), Perpustakaan Cerita (`/stories`), Papan Peringkat (`/leaderboard`), Toko Avatar & Hadiah (`/store`), plus Paspor, **Survival & Trial** (`/learn/survival`, the drill training camp) and **Suasana Belajar** (`/settings/ambience`).
- **Level and content-language rails:** `LevelPills` (`app/components/expedition/level-pills.tsx`) and `LanguageRail` (`app/components/expedition/language-rail.tsx`) are link-only Server Components. They change the story tier via `?tier=T1..T5` and the story language via `?language=<code>` without touching the UI locale in the URL or the saved account preference. All story pages (`/learn`, `/stories`, `/practice`, `/vault`, `/results`, `/store`) accept these parameters.
- **Brankas Kata:** `/[lang]/vault` is a Spaced Repetition study session built from the vocabulary materials of the selected story level. Rating buttons 1–4 (`again/hard/good/easy`) call `POST /api/v1/review/rate`, which stores SM-2-style state in `SpacedReviewItem`; finishing a session calls `POST /api/v1/review/complete` for the daily +25 XP bonus (idempotent per local day).
- **Hasil & Evaluasi:** `/[lang]/results` lists chapter reports; `/[lang]/results/[episodeId]` shows the star evaluation, per-skill mastery, XP/time/streak stats, vocabulary recap, scene trail, and next-chapter CTA. Reports are derived from `StorySceneProgress` + `ExerciseAttempt` rows whose `exerciseId` belongs to the episode; never count curriculum attempts that share the same lesson ID.
- **Store:** `/[lang]/store` presents real chapter chests, earned culture passport stamps, and the collector catalog. Gacha pulls and XP exchange are explicitly marked as shipping with the reward economy; do not fake pull results.
- **Cerita Interaktif (episode hub + reader):** the sidebar "Cerita Interaktif" entry points at `/[lang]/reader`, an episode-first hub (continue hero with the episode's scene trail, 6-episode rail around the current chapter, locked-episode teaser, reading-journey stats, level rail). The reader (`/[lang]/reader/[sceneId]`) mirrors the Stitch visual-novel screens: episode HUD with "Langkah Cerita" dots, step rails, tappable word bubbles, choice card, language spotlight, notebook, mission rail, and a sticky action dock. On mobile the reader shows one dialogue line at a time and the dock advances line by line ("Berikutnya") until the checkpoint; desktop shows the full dialogue stream.
- **Episode unlocks:** a level (T1–T5) is one ordered track. The first episode of every level is always open, and the next episode unlocks when the previous one reaches 80% of its scenes (all scenes complete still defines a "completed" episode). `app/lib/story/journey.ts` is the single source of truth (`computeEpisodeStates`, `getEpisodeJourney`); the hub, library, world page, episode page, and reader all read lock state from it. Reading a locked episode's scene redirects to `/[lang]/reader?locked=<episodeId>`, which explains the gate and links back to the previous episode. Never fake an unlock or bypass the gate in UI code.
- Story artwork is local, committed artwork at `public/images/stitch/**`; never hot-link a remote image host. The Google Stitch illustration set is registered in `app/components/expedition/story-images.ts` and rendered through `StoryArtwork` / `LangoMascot` (`app/components/expedition/art.tsx`) with `next/image`.
  - `resolveSceneArt({ seed, setting, worldId })` maps the scene setting/region to an art group (station, café, market, lane, shop, forest, water, night, street), picks deterministically from a stable hash, and hides Aoi character illustrations outside the Japanese world.
  - `resolveCharacterArt(name)` supplies Aoi's portrait; unknown speakers keep their initial (never borrow a portrait from another character).
  - `resolveAvatarArt(seed)` is the decorative fallback for learner avatars.
  - Pass `image={null}` to `StoryArtwork` only when a vector fallback is explicitly wanted. Every other story surface gets the local illustration automatically.
  - Artwork is decorative: `StoryArtwork` images use `alt=""`; the accessible name always comes from the surrounding heading/link.
  - Provenance, curation and the source-to-file mapping live in `docs/stitch-artwork.md`. Assets are pre-sized WebP (≤1280px scenes, ≤720px mascots) and served from the app, so no runtime image host is involved.
- Copy lives in `app/components/expedition/copy.ts` (EN/ID/JA, EN fallback) and is interpolated with `fill()`.
- Avoid Tailwind's `text-base` utility in new UI: the legacy `--color-base` token makes `text-base` also set text color to `--bg-base`. Use `text-[16px]` or an explicit `text-exp-*` color instead.

## Learning Ambience (Suasana Belajar)

A device-local atmosphere for the learner workspace: falling sakura, snowfall, drizzle, a day/night sky and a synthesized soundscape. It never touches account data and only renders inside the expedition shell — never on public or auth pages.

- **Layers.** `AmbienceProvider` wraps `ExpeditionShell`. `AmbienceLayer` (fixed, `z-0`, `aria-hidden`) owns the sky gradient, sun/moon, stars, hills and readability scrim. `AmbienceOverlay` (fixed, `z-55`: above `<main>`, below the header/sidebar/dock) adds a per-phase card tint plus weather particles masked away from the screen centre, so dialogue stays readable while the scenery is still visible over the cards.
- **Scenes.** `sakura`, `snow`, `rain`, `none`. **Time of day.** `auto` (local clock), `day`, `night`, `cycle` (day → dusk → night → dawn, 2-minute buckets).
- **Sound.** Synthesized in the browser with Web Audio (`app/components/expedition/ambience/ambient-audio.ts`): birdsong, crickets, rain, wind. No audio assets. Off by default; honours autoplay policy, shows a tap-to-resume hint when blocked, and "match the scene" picks rain for drizzle, wind for snow, crickets at night, birds otherwise.
- **Motion.** `auto` (respects `prefers-reduced-motion` with a calmer, slower particle set), `full`, `calm`, `off`.
- **Tokens.** `--amb-*` in `globals.css`, keyed by `data-amb-phase="dawn|day|dusk|night"` on the layer/overlay. The particle canvas reads the tokens at mount; never hardcode ambience colours in components.
- **Copy.** `app/components/expedition/ambience/ambience-copy.ts` (EN/ID/JA, EN fallback).
- **Surfaces.** A floating `AmbienceDock` (bottom-right, raised above the reader action dock) on every shell page, and the full studio at `/[lang]/settings/ambience` (presets, scenery, time, sound, volume, motion, reset). The dock panel and settings controls are 44px targets; Escape/outside-click closes the panel.
- **Storage.** `localStorage` key `lango:ambience:v1` via `app/lib/ambience/prefs.ts`, read through `useSyncExternalStore` with the default as the server snapshot, so hydration is stable and there is no schema change.
- **Performance & a11y.** Layers are `aria-hidden` and `pointer-events-none`; the canvas pauses when the tab is hidden, caps DPR at 2, and prints hidden. Sound state is announced with icon + text, never colour alone.

Reference screenshots: `docs/assets/ambience-learn-day.png`, `ambience-learn-night.png`, `ambience-learn-rain.png`, `ambience-learn-snow.png`, `ambience-dock.png`, `ambience-settings.png`, `ambience-mobile.png`.
