# Story-first library — execution report

Generated from `docs/PRD-story-first-curriculum.md` on 2026-11-25. Source of truth is `content/stories/`; counts are reproducible with `npm run content:stories:report`.

## Headline

| Metric | Result |
| --- | ---: |
| Languages | **13** |
| Story worlds | **13** |
| Episodes / stories | **2,600** |
| Scenes (core story objects) | **26,000** |
| Supporting materials (vocabulary, grammar, culture, review) | **104,000** |
| **Total story learning objects** | **130,000** |
| Lines | **252,528** |
| Exercises | **130,000** |
| Reader choices | **5,200** |
| Objects per story/episode | **50** (10 scenes × [1 scene + 4 supports]) |
| PRD target per story | 20–100 objects |

Each language has 5 levels × 2 arcs × 20 episodes × 10 scenes = 2,000 scenes, plus 8,000 supporting materials = **10,000 learning objects per language**. This is 5× the requested 100-story floor and stays inside the 20–100 objects per story target.

## Per language

| Code | World | Stories (episodes) | Scenes | Supporting | Learning objects | Lines | Romanized lines |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `ar` | ar-hibr-wadaw | 200 | 2,000 | 8,000 | 10,000 | 20,000 | 0/20,000 |
| `de` | de-baeckerei-elbe | 200 | 2,000 | 8,000 | 10,000 | 20,000 | 0/20,000 |
| `en` | en-marrow-bay | 200 | 2,000 | 8,000 | 10,000 | 20,000 | 0/20,000 |
| `es` | es-camino-naranjas | 200 | 2,000 | 8,000 | 10,000 | 20,000 | 0/20,000 |
| `fr` | fr-lettres-de-lyon | 200 | 2,000 | 8,000 | 10,000 | 20,000 | 0/20,000 |
| `hi` | hi-monsoon-letters | 200 | 2,000 | 8,000 | 10,000 | 20,000 | 0/20,000 |
| `id` | id-pasar-subuh | 200 | 2,000 | 8,000 | 10,000 | 20,166 | 0/20,166 |
| `it` | it-forno-di-nonna | 200 | 2,000 | 8,000 | 10,000 | 20,000 | 0/20,000 |
| `ja` | ja-komorebi | 200 | 2,000 | 8,000 | 10,000 | 16,000 | 16,000/16,000 |
| `ko` | ko-seoul-dawn | 200 | 2,000 | 8,000 | 10,000 | 20,002 | 0/20,002 |
| `nl` | nl-fietsen-polder | 200 | 2,000 | 8,000 | 10,000 | 20,000 | 0/20,000 |
| `pt` | pt-saudade-na-feira | 200 | 2,000 | 8,000 | 10,000 | 20,000 | 0/20,000 |
| `zh` | zh-hutong-moli | 200 | 2,000 | 8,000 | 10,000 | 16,360 | 16,360/16,360 |

`ja` uses JLPT N5–N1; `zh` uses HSK 1–2, 3, 4, 5, 6 mapped to T1–T5; the other 11 languages use CEFR A1–C1.

## Story anatomy

```
Language (13)
└── Level (5 per language)
    └── Arc / season (2 per level)
        └── Episode / story (20 per arc)
            └── Scene (10 per episode)
                ├── 6–12 lines (native text, reading, romanization, translation)
                ├── 3–6 exercises (answer key server-only)
                ├── 1 cliffhanger
                └── 4 supporting materials
                    ├── vocabulary set
                    ├── grammar focus
                    ├── culture note (with sources)
                    └── review / listening deck
```

Episode = **50 learning objects**: 10 core scenes + 40 supporting materials. This is the unit the UI calls a "story".

## Where things live

- Story bibles and language kits: `content/stories/{lang}/world.json`, `kit.json`
- Generated per-level libraries: `content/stories/{lang}/library/{worldId}-t{n}.json`
- Machine-readable manifest: `content/stories/manifest.json`
- Reader: `/[lang]/reader/[sceneId]`
- Story home: `/[lang]/stories`; world: `/[lang]/stories/[worldId]`; episode: `/[lang]/stories/[worldId]/[episodeId]`
- Progress/passport/characters: `/[lang]/passport`, `/[lang]/stories/[worldId]/characters`
- APIs: `/api/v1/stories`, `/api/v1/scenes/:id`, `/api/v1/story-progress`, `/api/v1/story-attempts`

## Verification

```bash
npm run content:stories:check -- --lang=ja   # authoring pack
npm run content:stories:validate            # 65 libraries, 0 errors / 0 warnings
npm run test:story                          # counts, schema, romanization samples
npx tsc --noEmit
npm run build
```

Last results: **0 validation errors, 0 warnings**; 26,000 scenes; 104,000 supporting materials; 130,000 learning objects; 100% of `ja` lines have kana readings and Hepburn romaji; 100% of `zh` lines have tone-marked pinyin.

## Publication gate (not yet satisfied)

The generated library is an AI-assisted draft, not a human-reviewed publication. `StoryReview` rows are seeded as `pending`; native-language, cultural, and pedagogy reviewers must sign off before calling the content reviewed. Audio currently uses browser TTS per line; pre-rendered `AudioAsset` files, timestamps, and loudness QA are still to be produced. The full library is available from immutable files; `npm run content:stories:import -- --lang=xx` bulk-imports the FS-09 tables for DB-backed deployments (English/French and Japanese T1 were used to verify the import path).
