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
