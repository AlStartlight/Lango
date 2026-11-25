# Stitch artwork

The learner experience uses the illustration set generated for Lango in Google
Stitch. The original exports live in `.prompt-assets/**/code.html`; the app only
serves committed, optimized copies from `public/images/stitch/**` and never
references a remote image host at runtime.

## Why the images are local

- The Stitch HTML points at short-lived `lh3.googleusercontent.com` URLs.
- `next.config.ts` and the app CSP keep the runtime self-contained.
- The images are pre-sized WebP so cards stay fast: scenes ≤1280px wide,
  mascots/portraits ≤640px, chibi avatars ≤320px.
- The source-to-file mapping is stable, so the same story always renders the
  same artwork (deterministic hash, no random covers between server and client).

## Registry

`app/components/expedition/story-images.ts` owns every path:

| Export | Purpose |
| --- | --- |
| `MASCOT_IMAGES` | Lango explorer, detective, celebration and reader poses |
| `CHARACTER_IMAGES` | Aoi portraits (avatar, portrait, watercolor, barista, Shibuya) |
| `AVATAR_IMAGES` | Decorative chibi learner avatars |
| `SCENES` | 26 scene illustrations (station, café, market, lane, shop, forest, water, night, street) |
| `resolveSceneArt` | Deterministic setting → art-group selection |
| `resolveCharacterArt` | Character name → portrait (Aoi only; other characters keep initials) |
| `resolveAvatarArt` | Deterministic learner fallback |
| `SHOWCASE_SCENES` | Curated postcard set for galleries/challenges |

`StoryArtwork` automatically asks the registry for an image unless the caller
passes `image={null}`. `LangoMascot` renders the local mascot images instead of
the old inline vector mascot.

## Curation

55 unique image URLs were found across the HTML exports. 53 downloaded
successfully; two `aida/` URLs (an Akihabara quiz image and an Akihabara store
cover) had already expired and returned an HTML error page, so they were
replaced by the nearby Akihabara/quiz screenshots that still resolve.

Only clean illustrations were kept. Several exports were **screenshots of the
Stitch app** (for example `Peta Petualangan Dashboard`, `Perpustakaan Cerita`)
rather than clean assets; those were not committed. Frames with an embedded
phone/browser chrome were cropped to the illustration.

### Scenes

| File | Subject |
| --- | --- |
| `station-golden.webp` | Shinjuku platform, golden hour |
| `station-dusk.webp` | Platform at dusk with a train |
| `station-cat.webp` | Station-master cat on a bench |
| `shinjuku-day.webp` | Shinjuku crossing in spring |
| `asakusa.webp` | Kaminarimon gate at dusk |
| `kyoto-lanterns.webp` | Lantern-lit Kyoto street |
| `night-market.webp` | Neon night-market alley |
| `cafe-window.webp` | Café window over the crossing |
| `fox-forest.webp` | Mossy forest with torii gates |
| `dragon-palace.webp` | Undersea dragon palace |
| `cafe-cashier.webp` | Café counter at golden hour |
| `cafe-barista.webp` | Warm wood café |
| `cafe-interior.webp` | Cosy café interior |
| `cafe-counter.webp` | Kissaten counter |
| `hachiko.webp` | Hachikō statue |
| `shibuya-hachiko.webp` | Shibuya crossing with Hachikō |
| `akihabara-store.webp` | Electronics store interior |
| `akihabara-neon.webp` | Neon Akihabara |
| `akihabara-street.webp` | Akihabara electric town |
| `akihabara-night.webp` | Akihabara at night |
| `akihabara-sunny.webp` | Sunny Akihabara street |
| `treasure-chest.webp` | Glowing treasure chest |
| `shibuya-crossing.webp` | Shibuya crossing in blossom season |
| `aoi-station.webp` | Aoi on the platform |
| `aoi-akihabara.webp` | Aoi in Akihabara |
| `aoi-cafe.webp` | Aoi at a Shibuya café |

### Characters and mascots

- `characters/aoi-avatar.webp` — clean headshot used for Aoi in the reader.
- `characters/aoi-portrait.webp`, `aoi-watercolor.webp`, `aoi-barista.webp`,
  `aoi-hachiko.webp` — supporting Aoi portraits.
- `mascot/lango-explorer.webp`, `lango-detective.webp`, `lango-celebrate.webp`,
  `lango-reader.webp` — Lango poses cropped from the clean character sheets.
- `avatars/chibi-girl.webp`, `chibi-boy.webp`, `chibi-indonesian.webp`,
  `chibi-bandana.webp`, `learner.webp` — decorative learner fallbacks.
- `brand/lango-logo.webp` — the Lango wordmark/avatar.

## Art direction rules

1. Scenes are chosen by setting keywords (`station`, `café`, `market`, `lane`,
   `shop`, `forest`, `water`, `night`, `street`) and a stable hash. The same
   episode always gets the same cover.
2. Aoi's scenes are only used for the Japanese world. Other worlds keep their
   own world identity and fall back to neutral scene groups.
3. Characters only receive a portrait when the artwork exists for that
   character; everyone else keeps an initial. Never lend Aoi's portrait to
   another character.
4. Artwork is decorative. All `StoryArtwork` images use `alt=""`; the link or
   heading supplies the accessible name.
5. Use `next/image` (already wrapped by `StoryArtwork`/`LangoMascot`) so the
   optimizer serves the right size per viewport.
