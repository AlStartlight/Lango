# Story-first authoring kit

This directory is the authoring source for the story-first curriculum in
`docs/PRD-story-first-curriculum.md`. Every language has two source files:

```
content/stories/{lang}/world.json   # story bible, characters, lexicon, culture notes, 10 arc seeds
content/stories/{lang}/kit.json     # 80 sentence frames + lexicon + grammar + question phrases
```

The generator expands them into a complete library:

```
content/stories/{lang}/library/{worldId}-{tier}.json
```

Each level file contains 2 arcs × 20 episodes × 10 scenes = 400 scenes, and each
scene has exactly 4 supporting materials, 5 exercises and 6–12 lines. Five
levels per language give 2,000 scenes + 8,000 supporting materials = 10,000
materials per language. Across 13 languages that is 26,000 scenes + 104,000
supporting materials = 130,000 materials.

## Required files

Use `content/stories/en/world.json` and `content/stories/en/kit.json` as the
canonical examples. Both are validated with Zod in `scripts/story/schema.ts`.

### world.json

- `id` = `{lang}-{slug}` (e.g. `ja-komorebi`)
- `languageCode` = `ja`, `zh`, `id`, etc.
- exactly 5 levels (`T1`–`T5`) with framework `JLPT`, `CEFR`, or `HSK`
  - `ja`: T1=`N5`, T2=`N4`, T3=`N3`, T4=`N2`, T5=`N1`
  - `zh`: T1=`HSK1-2`, T2=`HSK3`, T3=`HSK4`, T4=`HSK5`, T5=`HSK6`, idPart `t1`…`t5`
  - all other languages: T1=`A1` … T5=`C1`
- 4–12 characters, each with a `lexeme` (name in the target language)
- lexicon with at least 4 items for every slot type
- at least 6 culture anchors; every anchor needs at least one real, checkable
  source (official tourism board, museum, university, standards body, etc.) and
  a reflection question in Indonesian and English
- exactly 10 arc seeds: one season 1 and one season 2 for each tier. Each arc has
  a title, native title, synopsis, a `mystery` lexeme id from `lexicon.object`,
  and a cliffhanger.

### kit.json

- `language`, `script` (`jpan`, `hans`, `latn`, `hang`, `arab`, `deva`),
  `romanization` (`hepburn` for ja, `pinyin` for zh, `none` for Latin scripts)
- `frames`: exactly the 80 ids defined in `scripts/story/master-frames.ts`
  (`f-l1-context-1` … `f-l5-cliffhanger-2`). Each frame has `segments` that use
  the master frame's slots exactly once and in a natural target-language order.
  A segment is either `{"text": "..."}` or `{"slot": "personA"}`.
- `lexicon`: at least 4 items for every slot type (`person`, `place`, `object`,
  `food`, `drink`, `time`, `weather`, `action`, `quote`, `question`, `greeting`,
  `emotion`). The generator merges world-specific words into this generic set.
- `grammar`: at least 5 patterns, ideally 2 per level. `pattern` is the target
  language label, `meaning` is `{id, en}`.
- `questionPhrases`: 9 target-language question stems used to build exercises.
  `meaning` must contain `{term}`.

#### Japanese frames

Every lexeme needs `reading` (kana) and `romanization` (Modified Hepburn).
Every literal segment that contains kanji/kana needs `reading` and
`romanization`:

```json
{
  "id": "f-l1-context-1",
  "segments": [
    { "slot": "personA" },
    { "text": "は", "reading": "は", "romanization": "wa" },
    { "slot": "place" },
    { "text": "に着きました。", "reading": "につきました。", "romanization": "ni tsukimashita." },
    { "slot": "weather" }
  ]
}
```

#### Mandarin frames

Every lexeme needs `romanization` (Hanyu Pinyin with tone marks). Every literal
segment with hanzi needs `romanization`. Use simplified characters.

#### Other scripts

Korean, Arabic and Hindi may omit romanization. Still provide natural native
text. Arabic is RTL; do not mix Latin punctuation inside sentences.

## Validation

```bash
npx tsx scripts/story/check-authoring.ts --lang=ja
npx tsx scripts/story/generate.ts --lang=ja --tier=T1
npx tsx scripts/story/validate.ts --lang=ja
```

The first command must pass before the generator is run. Do not edit
`scripts/story/master-frames.ts`, `schema.ts`, or `types.ts`; adapt the language
files instead.

## Content rules

- Story-first, original, contemporary setting from the PRD world map.
- Target-language text is natural and level-appropriate; translations are
  meaning-for-meaning, never word-for-word.
- No stereotypes, no exotic framing, no copied folklore/novel/film text.
- 13+ rating: no explicit sex, graphic violence, hate speech, or political
  campaigning. Handle death/illness/migration with care.
- Culture notes must be specific and sourced, not trivia.
- Characters have agency and their own goals; local characters are not tour
  guides for a foreign protagonist.
- The four supporting materials must quote the scene: vocabulary examples,
  grammar examples, culture reflection, and review cards all point at line ids.

## Packed production assets

`content/stories/{lang}/library/` is generated and gitignored. The files that
actually ship to production are Brotli-packed and committed under
`content/stories/compiled/`. After changing `world.json`, `kit.json`, the
generator, or the packer:

```bash
npm run content:stories:generate
npm run content:stories:pack
npm run check:story:packed
```

Commit both the source changes and the regenerated `content/stories/compiled/`
files. CI runs the same check on pull requests that touch story content.
