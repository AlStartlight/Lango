import { z } from "zod";
import { BEAT_ORDER, SLOT_TYPES } from "./types";

const localizedSchema = z
  .object({
    id: z.string().min(1),
    en: z.string().min(1),
    ja: z.string().min(1).optional(),
  })
  .strict();

export const lexemeSchema = z
  .object({
    id: z.string().min(2).max(120),
    native: z.string().min(1).max(300),
    reading: z.string().max(300).optional(),
    romanization: z.string().max(300).optional(),
    gloss: localizedSchema,
    tags: z.array(z.string().min(1).max(40)).max(12).optional(),
  })
  .strict();

const lexiconSchema = z
  .object(
    Object.fromEntries(
      SLOT_TYPES.map((slot) => [slot, z.array(lexemeSchema).min(2).max(80)]),
    ) as Record<(typeof SLOT_TYPES)[number], z.ZodArray<typeof lexemeSchema>>,
  )
  .strict();

export const kitFrameSchema = z
  .object({
    id: z.string().min(3).max(120),
    segments: z
      .array(
        z
          .object({
            text: z.string().min(1).max(1000).optional(),
            slot: z.string().min(1).max(40).optional(),
            reading: z.string().max(1000).optional(),
            romanization: z.string().max(1000).optional(),
          })
          .strict()
          .refine(
            (segment) => Number(Boolean(segment.text)) + Number(Boolean(segment.slot)) === 1,
            { message: "segment must set exactly one of text or slot" },
          ),
      )
      .min(1)
      .max(30),
  })
  .strict();

export const grammarPatternSchema = z
  .object({
    id: z.string().min(2).max(80),
    level: z.number().int().min(1).max(5),
    pattern: z.string().min(1).max(160),
    meaning: localizedSchema,
    example: z.string().max(500).optional(),
    note: z.string().max(1000).optional(),
  })
  .strict();

const questionPhrasesSchema = z
  .object({
    meaning: z.string().min(1).max(300),
    who: z.string().min(1).max(300),
    where: z.string().min(1).max(300),
    when: z.string().min(1).max(300),
    why: z.string().min(1).max(300),
    detail: z.string().min(1).max(300),
    next: z.string().min(1).max(300),
    culture: z.string().min(1).max(300),
    grammar: z.string().min(1).max(300),
  })
  .strict()
  .refine((value) => Object.values(value).every((phrase) => phrase.includes("{term}") || true));

export const languageKitSchema = z
  .object({
    language: z.string().min(2).max(8),
    script: z.enum(["latn", "jpan", "hans", "hang", "arab", "deva"]),
    romanization: z.enum(["hepburn", "pinyin", "revised", "iast", "ala-lc", "none"]),
    lexicon: lexiconSchema,
    frames: z.array(kitFrameSchema).min(40),
    grammar: z.array(grammarPatternSchema).min(5),
    questionPhrases: questionPhrasesSchema,
  })
  .strict();

export const worldCharacterSchema = z
  .object({
    id: z.string().min(2).max(120),
    name: z.string().min(1).max(120),
    nativeName: z.string().min(1).max(120),
    role: z.string().min(1).max(160),
    age: z.number().int().min(1).max(120).optional(),
    bio: z.string().min(1).max(1000),
    speechStyle: z.string().max(300).optional(),
    quote: z.string().max(300).optional(),
    position: z.number().int().min(0).max(20),
    lexeme: lexemeSchema,
  })
  .strict();

export const cultureAnchorSchema = z
  .object({
    id: z.string().min(2).max(120),
    title: z.string().min(1).max(200),
    body: localizedSchema,
    sources: z.array(z.string().min(1).max(300)).min(1),
    reflection: localizedSchema,
    stampId: z.string().max(120).optional(),
    tags: z.array(z.string().min(1).max(40)).max(12).optional(),
  })
  .strict();

const levelSchema = z
  .object({
    tier: z.enum(["T1", "T2", "T3", "T4", "T5"]),
    framework: z.enum(["JLPT", "CEFR", "HSK"]),
    levelCode: z.string().min(1).max(20),
    label: z.string().min(1).max(60),
    idPart: z.string().min(1).max(20),
    position: z.number().int().min(1).max(5),
  })
  .strict();

const arcSeedSchema = z
  .object({
    tier: z.enum(["T1", "T2", "T3", "T4", "T5"]),
    seasonNo: z.union([z.literal(1), z.literal(2)]),
    title: z.string().min(1).max(200),
    nativeTitle: z.string().min(1).max(200),
    synopsis: z.string().min(1).max(1200),
    mystery: z.string().min(1).max(200),
    cliffhanger: z.string().min(1).max(500),
  })
  .strict();

export const worldSourceSchema = z
  .object({
    id: z.string().min(3).max(120),
    languageCode: z.string().min(2).max(8),
    slug: z.string().min(2).max(80),
    title: z.string().min(1).max(200),
    nativeTitle: z.string().min(1).max(200),
    logline: z.string().min(1).max(1000),
    setting: z.string().min(1).max(1000),
    era: z.string().min(1).max(200),
    tone: z.string().min(1).max(300),
    palette: z.string().min(1).max(60),
    motifs: z.array(z.string().min(1).max(80)).min(3).max(20),
    sensitivityNotes: z.array(z.string().min(1).max(400)).max(20),
    canon: z.record(z.string(), z.unknown()),
    levels: z.array(levelSchema).length(5),
    characters: z.array(worldCharacterSchema).min(4).max(12),
    lexicon: lexiconSchema,
    anchors: z.array(cultureAnchorSchema).min(6).max(30),
    arcs: z.array(arcSeedSchema).length(10),
  })
  .strict()
  .superRefine((world, context) => {
    const tiers = new Set(world.levels.map((level) => level.tier));
    if (tiers.size !== 5) {
      context.addIssue({ code: "custom", path: ["levels"], message: "all five tiers are required" });
    }
    for (const tier of tiers) {
      const seasons = world.arcs
        .filter((arc) => arc.tier === tier)
        .map((arc) => arc.seasonNo)
        .sort();
      if (seasons.join(",") !== "1,2") {
        context.addIssue({
          code: "custom",
          path: ["arcs"],
          message: `${tier} must have exactly one season 1 and one season 2 arc`,
        });
      }
    }
  });

export const lineExportSchema = z
  .object({
    id: z.string().min(3).max(200),
    order: z.number().int().min(1).max(12),
    speakerId: z.string().max(120).nullable(),
    speakerName: z.string().max(120).nullable(),
    text: z.string().min(1).max(2000),
    script: z.enum(["latn", "jpan", "hans", "hang", "arab", "deva"]),
    reading: z.string().max(3000).optional(),
    romanization: z
      .object({
        scheme: z.enum(["hepburn", "pinyin", "revised", "iast", "ala-lc", "none"]),
        value: z.string().min(1).max(3000),
      })
      .strict()
      .optional(),
    translation: localizedSchema,
    tokens: z
      .array(
        z
          .object({
            surface: z.string().min(1).max(200),
            start: z.number().int().min(0),
            end: z.number().int().min(0),
            reading: z.string().max(200).optional(),
            romanization: z.string().max(200).optional(),
            gloss: localizedSchema.optional(),
            pos: z.string().max(40).optional(),
          })
          .strict(),
      )
      .max(80)
      .optional(),
    audio: z
      .object({
        provider: z.enum(["browser-tts", "prerecorded"]),
        voice: z.string().min(1).max(80),
        speed: z.number().min(0.5).max(1.5),
        transcript: z.string().min(1).max(2000),
      })
      .strict(),
  })
  .strict();

const exerciseSchema = z
  .object({
    id: z.string().min(3).max(200),
    type: z.enum(["multiple_choice", "fill_blank", "listening_comprehension"]),
    skill: z.string().min(1).max(40),
    prompt: z.string().min(1).max(2000),
    promptSupport: localizedSchema.optional(),
    choices: z
      .array(z.object({ id: z.string().min(1).max(20), text: z.string().min(1).max(500) }).strict())
      .min(2)
      .max(8)
      .optional(),
    answerKey: z.record(z.string(), z.unknown()),
    explanation: localizedSchema,
    conceptKey: z.string().min(1).max(200),
    difficulty: z.number().int().min(1).max(5),
    tags: z.array(z.string().min(1).max(40)).max(12),
    lineId: z.string().max(200).optional(),
  })
  .strict();

const materialSchema = z
  .object({
    id: z.string().min(3).max(200),
    type: z.enum(["vocabulary", "grammar", "culture", "review"]),
    order: z.number().int().min(1).max(4),
    title: z.string().min(1).max(300),
    body: z.record(z.string(), z.unknown()),
    audio: z
      .object({
        provider: z.enum(["browser-tts", "prerecorded"]),
        voice: z.string().min(1).max(80),
        speed: z.number().min(0.5).max(1.5),
        transcript: z.string().min(1).max(2000),
      })
      .strict()
      .optional(),
  })
  .strict();

const choiceSchema = z
  .object({
    id: z.string().min(3).max(200),
    prompt: z.string().min(1).max(500),
    options: z
      .array(
        z
          .object({
            id: z.string().min(1).max(20),
            text: z.string().min(1).max(500),
            translation: localizedSchema,
            affinity: z.record(z.string(), z.number()).optional(),
          })
          .strict(),
      )
      .min(2)
      .max(3),
    effects: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const sceneExportSchema = z
  .object({
    id: z.string().min(3).max(200),
    sceneNo: z.number().int().min(1).max(10),
    title: z.string().min(1).max(300),
    titleRomanization: z.string().max(300).optional(),
    titleTranslation: localizedSchema,
    setting: z.string().min(1).max(500),
    estimatedMinutes: z.number().int().min(3).max(6),
    cliffhanger: z.string().min(1).max(500),
    cultureNoteIds: z.array(z.string().min(1)).min(1).max(3),
    beat: z
      .object({
        hook: z.string().min(1).max(1000),
        context: z.string().min(1).max(1000),
        complication: z.string().min(1).max(1000),
        languageFocus: z.string().min(1).max(1000),
        turn: z.string().min(1).max(1000),
        cliffhanger: z.string().min(1).max(1000),
      })
      .strict(),
    lines: z.array(lineExportSchema).min(6).max(12),
    exercises: z.array(exerciseSchema).min(3).max(6),
    materials: z.array(materialSchema).length(4),
    choices: z.array(choiceSchema).max(3),
  })
  .strict()
  .superRefine((scene, context) => {
    const types = scene.materials.map((material) => material.type).sort();
    if (types.join(",") !== "culture,grammar,review,vocabulary") {
      context.addIssue({
        code: "custom",
        path: ["materials"],
        message: "scene must have exactly one vocabulary, grammar, culture and review material",
      });
    }
    const orders = scene.lines.map((line) => line.order).sort((a, b) => a - b);
    if (orders.join(",") !== Array.from({ length: scene.lines.length }, (_, i) => i + 1).join(",")) {
      context.addIssue({ code: "custom", path: ["lines"], message: "line order must be 1..n" });
    }
    for (const exercise of scene.exercises) {
      if (exercise.choices && !exercise.choices.some((choice) => choice.id === exercise.answerKey.choiceId)) {
        context.addIssue({
          code: "custom",
          path: ["exercises", exercise.id],
          message: "answerKey.choiceId must reference a choice",
        });
      }
    }
  });

export const episodeExportSchema = z
  .object({
    id: z.string().min(3).max(200),
    episodeNo: z.number().int().min(1).max(20),
    title: z.string().min(1).max(300),
    nativeTitle: z.string().min(1).max(300),
    hook: z.string().min(1).max(1000),
    recap: z.string().min(1).max(2000),
    cliffhanger: z.string().min(1).max(1000),
    focusObject: z.string().min(1).max(200),
    culturalAnchor: z.string().min(1).max(200),
    scenes: z.array(sceneExportSchema).length(10),
  })
  .strict();

export const arcExportSchema = z
  .object({
    id: z.string().min(3).max(200),
    seasonNo: z.number().int().min(1).max(2),
    tier: z.string().min(1).max(10),
    framework: z.enum(["JLPT", "CEFR", "HSK"]),
    levelCode: z.string().min(1).max(20),
    title: z.string().min(1).max(300),
    nativeTitle: z.string().min(1).max(300),
    synopsis: z.string().min(1).max(2000),
    culturalAnchors: z.array(z.string().min(1)).min(2),
    cliffhanger: z.string().min(1).max(1000),
    episodes: z.array(episodeExportSchema).length(20),
  })
  .strict();

export const levelLibrarySchema = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    contentVersion: z.string().regex(/^\d{4}\.\d{2}\.\d+$/),
    generatedAt: z.string().min(1),
    language: z.string().min(2).max(8),
    world: z
      .object({
        id: z.string().min(3),
        languageCode: z.string().min(2),
        slug: z.string().min(2),
        title: z.string().min(1),
        nativeTitle: z.string().min(1),
        logline: z.string().min(1),
        setting: z.string().min(1),
        era: z.string().min(1),
        tone: z.string().min(1),
        palette: z.string().min(1),
        motifs: z.array(z.string()),
        sensitivityNotes: z.array(z.string()),
        canon: z.record(z.string(), z.unknown()),
        characters: z.array(worldCharacterSchema.omit({ lexeme: true })),
        cultureNotes: z.array(cultureAnchorSchema),
      })
      .strict(),
    level: z
      .object({
        tier: z.string().min(1),
        framework: z.enum(["JLPT", "CEFR", "HSK"]),
        levelCode: z.string().min(1),
        label: z.string().min(1),
        position: z.number().int().min(1).max(5),
        arcs: z.array(arcExportSchema).length(2),
      })
      .strict(),
    counts: z
      .object({
        arcs: z.number().int(),
        episodes: z.number().int(),
        scenes: z.number().int(),
        materials: z.number().int(),
        lines: z.number().int(),
        exercises: z.number().int(),
        choices: z.number().int(),
      })
      .strict(),
  })
  .strict();

export { BEAT_ORDER, SLOT_TYPES };
