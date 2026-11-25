import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  MASTER_FRAME_BY_ID,
  loadKit,
  loadWorld,
  mergedLexicon,
  validateKitCoverage,
  validateKitRomanization,
  type LoadedKit,
  type LoadedWorld,
} from "./load";
import { createRng } from "./random";
import { countTextUnits, renderFrame } from "./render";
import type {
  ArcExport,
  ArcSeed,
  EpisodeExport,
  ExerciseExport,
  Lexeme,
  LibraryExport,
  LineExport,
  LocalizedText,
  SceneExport,
  StoryMaterialExport,
  StoryScript,
  VocabularyItem,
  WorldDef,
  WorldLevelDef,
  WorldSource,
} from "./types";
import { BEAT_ORDER, type Beat } from "./types";

const CONTENT_VERSION = "2026.11.1";
const SCHEMA_VERSION = "1.0.0" as const;

const VOICES: Record<string, string> = {
  ja: "ja-JP",
  zh: "zh-CN",
  en: "en-US",
  id: "id-ID",
  es: "es-ES",
  ko: "ko-KR",
  ar: "ar-SA",
  hi: "hi-IN",
  de: "de-DE",
  fr: "fr-FR",
  pt: "pt-PT",
  it: "it-IT",
  nl: "nl-NL",
};

const SPEEDS = [0.8, 0.9, 1, 1, 1.05];

const LINE_PLAN: Array<{ beat: Beat; speaker: "narrator" | "protagonist" | "visitor" }> = [
  { beat: "context", speaker: "narrator" },
  { beat: "greeting", speaker: "visitor" },
  { beat: "task", speaker: "narrator" },
  { beat: "request", speaker: "visitor" },
  { beat: "complication", speaker: "protagonist" },
  { beat: "clue", speaker: "narrator" },
  { beat: "context", speaker: "narrator" },
  { beat: "turn", speaker: "protagonist" },
  { beat: "complication", speaker: "narrator" },
  { beat: "cliffhanger", speaker: "narrator" },
];

function pad(value: number, size: number): string {
  return String(value).padStart(size, "0");
}

function clean(value: string): string {
  return value
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([.!?。！？])\1+/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function byTags(items: Lexeme[], tags: string[]): Lexeme[] {
  const filtered = items.filter((item) => item.tags?.some((tag) => tags.includes(tag)));
  return filtered.length > 0 ? filtered : items;
}

interface ScenePlan {
  sceneNo: number;
  episodeNo: number;
  sceneId: string;
  episodeId: string;
  arcId: string;
  arcSeed: ArcSeed;
  level: WorldLevelDef;
  levelIndex: number;
  protagonist: Lexeme;
  visitor: Lexeme;
  visitorCharacter: WorldDef["characters"][number];
  protagonistCharacter: WorldDef["characters"][number];
  place: Lexeme;
  placeB: Lexeme;
  object: Lexeme;
  objectB: Lexeme;
  anchor: WorldSource["anchors"][number];
  time: Lexeme;
  weather: Lexeme;
  action: Lexeme;
  actionB: Lexeme;
  drink: Lexeme;
  food: Lexeme;
  greeting: Lexeme;
  quote: Lexeme;
  question: Lexeme;
  emotion: Lexeme;
}

function buildScenePlan(
  world: WorldDef,
  source: WorldSource,
  kit: LoadedKit,
  level: WorldLevelDef,
  levelIndex: number,
  arc: ArcSeed,
  arcIndex: number,
  episodeNo: number,
  sceneNo: number,
  sceneId: string,
  episodeId: string,
  arcId: string,
): ScenePlan {
  const lexicon = mergedLexicon(source, kit.data);
  const rng = createRng(sceneId, "plan");
  const protagonistCharacter = world.characters[0];
  const visitorCharacter =
    world.characters[1 + ((arcIndex * 20 + episodeNo) % Math.max(1, world.characters.length - 1))];
  const protagonist = protagonistCharacter.lexeme;
  let visitor = visitorCharacter.lexeme;
  if (visitor.id === protagonist.id) {
    visitor = rng.pick(world.characters.filter((character) => character.lexeme.id !== protagonist.id)).lexeme;
  }

  const objects = source.lexicon.object;
  const mysteryObject = objects.find((item) => item.id === arc.mystery);
  const objectPool = mysteryObject
    ? [mysteryObject, ...objects.filter((item) => item.id !== mysteryObject.id)]
    : objects;
  const objectIndex = episodeNo === 1 ? 0 : (arcIndex * 20 + episodeNo + sceneNo) % objectPool.length;
  const object = objectPool[objectIndex];
  const objectB = objectPool[(objectIndex + 1 + (sceneNo % 3)) % objectPool.length] ?? object;

  const places = source.lexicon.place;
  const place = places[(arcIndex * 20 + episodeNo + sceneNo) % places.length];
  const placeB = places[(places.indexOf(place) + 1) % places.length];

  const anchor = source.anchors[(arcIndex * 20 + episodeNo + sceneNo) % source.anchors.length];
  const times = source.lexicon.time;
  const weathers = byTags(source.lexicon.weather, [anchor.tags?.[0] ?? "", "fog", "rain", "clear", "warm", "cold"]);
  const actions = source.lexicon.action;
  const drinks = source.lexicon.drink;
  const foods = source.lexicon.food;

  return {
    sceneNo,
    episodeNo,
    sceneId,
    episodeId,
    arcId,
    arcSeed: arc,
    level,
    levelIndex,
    protagonist,
    visitor,
    visitorCharacter,
    protagonistCharacter,
    place,
    placeB,
    object,
    objectB,
    anchor,
    time: rng.pick(times),
    weather: rng.pick(weathers),
    action: rng.pick(actions),
    actionB: rng.pick(actions),
    drink: rng.pick(drinks),
    food: rng.pick(foods),
    greeting: rng.pick(source.lexicon.greeting),
    quote: rng.pick(byTags(source.lexicon.quote, ["mystery", "emotion"])),
    question: rng.pick(source.lexicon.question),
    emotion: rng.pick(source.lexicon.emotion),
  };
}

function slotValue(
  slot: string,
  type: string,
  plan: ScenePlan,
  source: WorldSource,
  rng: ReturnType<typeof createRng>,
): Lexeme {
  if (type === "person") {
    if (slot === "personA") return plan.protagonist;
    if (slot === "personB") return plan.visitor;
    return rng.pick(source.lexicon.person);
  }
  if (type === "place") return slot.endsWith("B") ? plan.placeB : plan.place;
  if (type === "object") return slot.endsWith("B") ? plan.objectB : plan.object;
  if (type === "food") return plan.food;
  if (type === "drink") return plan.drink;
  if (type === "time") return plan.time;
  if (type === "weather") return plan.weather;
  if (type === "action") return slot.endsWith("B") ? plan.actionB : plan.action;
  if (type === "quote" || type === "question") {
    const lexeme = type === "quote" ? plan.quote : plan.question;
    const strip = type === "quote"
      ? (value: string) => value.replace(/[.。]+$/u, "")
      : (value: string) => value;
    return {
      ...lexeme,
      native: strip(lexeme.native),
      gloss: { ...lexeme.gloss, id: strip(lexeme.gloss.id), en: strip(lexeme.gloss.en) },
    };
  }
  if (type === "greeting") return plan.greeting;
  if (type === "emotion") return plan.emotion;
  throw new Error(`unsupported slot type ${type}`);
}

function speakerFor(
  role: "narrator" | "protagonist" | "visitor",
  plan: ScenePlan,
): { id: string | null; name: string | null; lexeme: Lexeme | null } {
  if (role === "narrator") return { id: null, name: null, lexeme: null };
  if (role === "protagonist") {
    return {
      id: plan.protagonistCharacter.id,
      name: plan.protagonistCharacter.nativeName,
      lexeme: plan.protagonist,
    };
  }
  return {
    id: plan.visitorCharacter.id,
    name: plan.visitorCharacter.nativeName,
    lexeme: plan.visitor,
  };
}

function pickFrame(
  kit: LoadedKit,
  levelIndex: number,
  beat: Beat,
  rng: ReturnType<typeof createRng>,
) {
  let candidates = kit.data.frames.filter((frame) => {
    const master = MASTER_FRAME_BY_ID.get(frame.id);
    return master?.level === levelIndex && master.beat === beat;
  });
  if (candidates.length === 0) {
    candidates = kit.data.frames.filter((frame) => {
      const master = MASTER_FRAME_BY_ID.get(frame.id);
      return master?.beat === beat;
    });
  }
  if (candidates.length === 0) {
    throw new Error(`no kit frame for beat ${beat} level ${levelIndex}`);
  }
  return rng.pick(candidates);
}

function renderBeat(
  plan: ScenePlan,
  source: WorldSource,
  kit: LoadedKit,
  beat: Beat,
  order: number,
  rng: ReturnType<typeof createRng>,
  excludeFrameId?: string,
) {
  let kitFrame = pickFrame(kit, plan.levelIndex, beat, rng);
  if (excludeFrameId) {
    const alternatives = kit.data.frames.filter((frame) => {
      const master = MASTER_FRAME_BY_ID.get(frame.id);
      return master?.level === plan.levelIndex && master.beat === beat && frame.id !== excludeFrameId;
    });
    if (alternatives.length > 0) kitFrame = rng.pick(alternatives);
  }
  const master = MASTER_FRAME_BY_ID.get(kitFrame.id);
  if (!master) throw new Error(`unknown master frame ${kitFrame.id}`);
  const values = new Map<string, Lexeme>();
  for (const [slot, type] of Object.entries(master.slots)) {
    values.set(slot, slotValue(slot, type, plan, source, rng));
  }
  return {
    kitFrame,
    master,
    values,
    rendered: renderFrame(master, kitFrame, values, kit.data.script, kit.data.romanization),
  };
}

function buildLine(
  plan: ScenePlan,
  source: WorldSource,
  kit: LoadedKit,
  beat: Beat,
  speakerRole: "narrator" | "protagonist" | "visitor",
  order: number,
  extend = false,
): { line: LineExport; lexemes: Lexeme[]; grammar: string[] } {
  const rng = createRng(plan.sceneId, "line", order);
  const first = renderBeat(plan, source, kit, beat, order, rng);
  const second = extend ? renderBeat(plan, source, kit, beat, order, rng, first.kitFrame.id) : null;
  const rendered = second
    ? {
        text: `${first.rendered.text} ${second.rendered.text}`,
        reading: [first.rendered.reading, second.rendered.reading].filter(Boolean).join(" "),
        romanization: [first.rendered.romanization, second.rendered.romanization].filter(Boolean).join(" "),
        translation: {
          id: `${first.rendered.translation.id} ${second.rendered.translation.id}`,
          en: `${first.rendered.translation.en} ${second.rendered.translation.en}`,
        },
        tokens: first.rendered.tokens && second.rendered.tokens
          ? (() => {
              const offset = Array.from(first.rendered.text).length + 1;
              return [
                ...first.rendered.tokens,
                ...second.rendered.tokens.map((token) => ({
                  ...token,
                  start: token.start + offset,
                  end: token.end + offset,
                })),
              ];
            })()
          : undefined,
      }
    : first.rendered;
  const speaker = speakerFor(speakerRole, plan);
  const audio = {
    provider: "browser-tts" as const,
    voice: VOICES[kit.data.language] ?? kit.data.language,
    speed: SPEEDS[plan.levelIndex - 1],
    transcript: rendered.text,
  };
  const line: LineExport = {
    id: `${plan.sceneId}-s${pad(order, 2)}`,
    order,
    speakerId: speaker.id,
    speakerName: speaker.name,
    text: rendered.text,
    script: kit.data.script,
    reading: rendered.reading,
    romanization: rendered.romanization
      ? { scheme: kit.data.romanization, value: rendered.romanization }
      : undefined,
    translation: rendered.translation,
    tokens: rendered.tokens,
    audio,
  };
  const lexemes = [...first.values.values(), ...(second ? second.values.values() : [])];
  return {
    line,
    lexemes: [...new Map(lexemes.map((lexeme) => [lexeme.id, lexeme])).values()],
    grammar: [...new Set([...first.master.grammar, ...(second?.master.grammar ?? [])])],
  };
}

function makeChoices(
  correct: string,
  pool: string[],
  rng: ReturnType<typeof createRng>,
): { choices: Array<{ id: string; text: string }>; choiceId: string } {
  const distractors = unique(pool.filter((item) => item && item !== correct)).slice(0, 2);
  while (distractors.length < 2) distractors.push(`—${distractors.length + 1}`);
  const items = [correct, ...distractors];
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swap = rng.int(index + 1);
    [items[index], items[swap]] = [items[swap], items[index]];
  }
  const choices = items.map((text, index) => ({ id: `c${index + 1}`, text }));
  const correctIndex = items.indexOf(correct);
  return { choices, choiceId: `c${correctIndex + 1}` };
}

function translation(value: LocalizedText): LocalizedText {
  return { id: value.id, en: value.en };
}

function buildExercises(
  plan: ScenePlan,
  kit: LoadedKit,
  lines: LineExport[],
  vocabulary: VocabularyItem[],
  patterns: Array<{ pattern: string; meaning: LocalizedText }>,
  lexicon: ReturnType<typeof mergedLexicon>,
  anchors: WorldSource["anchors"],
  rng: ReturnType<typeof createRng>,
): ExerciseExport[] {
  const phrases = kit.data.questionPhrases;
  const quoteLine = lines.find((line) => !/["「『]/.test(line.text)) ?? lines[0];
  const turnLine = lines.find((line, index) => index >= 6 && !/["「『]/.test(line.text)) ?? lines[Math.min(7, lines.length - 1)];
  const correctPerson = plan.protagonistCharacter.nativeName;
  const personPool = plan.protagonistCharacter
    ? [plan.protagonistCharacter.nativeName, plan.visitorCharacter.nativeName]
    : [];
  const who = makeChoices(correctPerson, personPool, rng);

  const firstVocab =
    vocabulary.find((item) => {
      const term = item.term.toLowerCase();
      const gloss = item.gloss.id.toLowerCase();
      return !term.includes(gloss) && !gloss.includes(term);
    }) ?? vocabulary[0];
  const vocabPool = [...lexicon.food, ...lexicon.object, ...lexicon.place].map((item) => item.gloss.id);
  const meaning = makeChoices(firstVocab?.gloss.id ?? plan.object.gloss.id, vocabPool, rng);

  const correctPattern = patterns[0] ?? kit.data.grammar.find((item) => item.level === plan.levelIndex) ?? kit.data.grammar[0];
  const patternPool = kit.data.grammar.map((item) => item.meaning.id);
  const grammar = makeChoices(correctPattern.meaning.id, patternPool, rng);

  const emotion = makeChoices(
    plan.emotion.native,
    lexicon.emotion.map((item) => item.native),
    rng,
  );

  const anchorChoices = makeChoices(
    plan.anchor.title,
    anchors.map((anchor) => anchor.title),
    rng,
  );

  return [
    {
      id: `${plan.sceneId}-q01`,
      type: "multiple_choice",
      skill: "reading",
      prompt: `${phrases.who}`,
      choices: who.choices,
      answerKey: { choiceId: who.choiceId },
      explanation: {
        id: `Kutipan itu menceritakan ${plan.protagonistCharacter.name}.`,
        en: `The quote is about ${plan.protagonistCharacter.name}.`,
      },
      conceptKey: `${kit.data.language}:${plan.level.levelCode}:${plan.sceneId}:comprehension`,
      difficulty: plan.levelIndex,
      tags: ["comprehension", "reading"],
      lineId: quoteLine.id,
    },
    {
      id: `${plan.sceneId}-q02`,
      type: "multiple_choice",
      skill: "vocabulary",
      prompt: phrases.meaning.replace("{term}", firstVocab?.term ?? plan.object.native),
      choices: meaning.choices,
      answerKey: { choiceId: meaning.choiceId },
      explanation: {
        id: `Kata itu muncul dalam adegan: "${firstVocab?.example ?? lines[0].text}"`,
        en: `The word appears in the scene: "${firstVocab?.example ?? lines[0].text}"`,
      },
      conceptKey: `${kit.data.language}:${plan.level.levelCode}:${plan.sceneId}:vocab`,
      difficulty: plan.levelIndex,
      tags: ["vocabulary"],
      lineId: lines[0].id,
    },
    {
      id: `${plan.sceneId}-q03`,
      type: "multiple_choice",
      skill: "grammar",
      prompt: phrases.meaning.replace("{term}", correctPattern.pattern),
      choices: grammar.choices,
      answerKey: { choiceId: grammar.choiceId },
      explanation: {
        id: `Pola ${correctPattern.pattern} berarti ${correctPattern.meaning.id}.`,
        en: `The pattern ${correctPattern.pattern} means ${correctPattern.meaning.en}.`,
      },
      conceptKey: `${kit.data.language}:${plan.level.levelCode}:${plan.sceneId}:grammar`,
      difficulty: plan.levelIndex,
      tags: ["grammar"],
      lineId: turnLine.id,
    },
    {
      id: `${plan.sceneId}-q04`,
      type: "multiple_choice",
      skill: "inference",
      prompt: `${turnLine.text} ${phrases.why}`,
      choices: emotion.choices,
      answerKey: { choiceId: emotion.choiceId },
      explanation: {
        id: `Adegan ini menunjukkan bahwa tokoh merasa ${plan.emotion.gloss.id}.`,
        en: `The scene shows that the character feels ${plan.emotion.gloss.en}.`,
      },
      conceptKey: `${kit.data.language}:${plan.level.levelCode}:${plan.sceneId}:inference`,
      difficulty: plan.levelIndex,
      tags: ["inference"],
      lineId: turnLine.id,
    },
    {
      id: `${plan.sceneId}-q05`,
      type: "multiple_choice",
      skill: "culture",
      prompt: `${phrases.culture}`,
      choices: anchorChoices.choices,
      answerKey: { choiceId: anchorChoices.choiceId },
      explanation: {
        id: `Adegan ini berlatar ${plan.anchor.title}.`,
        en: `This scene is grounded in ${plan.anchor.title}.`,
      },
      conceptKey: `${kit.data.language}:${plan.level.levelCode}:${plan.sceneId}:culture`,
      difficulty: plan.levelIndex,
      tags: ["culture"],
      lineId: lines[0].id,
    },
  ];
}

function buildMaterials(
  plan: ScenePlan,
  kit: LoadedKit,
  lines: LineExport[],
  vocabulary: VocabularyItem[],
  patterns: Array<{ pattern: string; meaning: LocalizedText }>,
  rng: ReturnType<typeof createRng>,
): StoryMaterialExport[] {
  const vocabTitles = vocabulary.slice(0, 3).map((item) => item.term).join(", ");
  const grammarExercises = patterns.slice(0, 2).flatMap((pattern, patternIndex) =>
    [0, 1, 2].map((offset) => {
      const line = lines[(patternIndex + offset) % lines.length];
      const choices = [pattern.pattern, ...kit.data.grammar.filter((item) => item.pattern !== pattern.pattern).slice(0, 2).map((item) => item.pattern)];
      return {
        id: `g${patternIndex + 1}-${offset + 1}`,
        prompt: `${kit.data.questionPhrases.grammar} "${line.text}"`,
        choices: choices.map((text, index) => ({ id: `c${index + 1}`, text })),
        answerKey: { choiceId: "c1" },
        explanation: { id: `Pola ini muncul di baris ${line.order}.`, en: `This pattern appears in line ${line.order}.` },
      };
    }),
  );

  return [
    {
      id: `${plan.sceneId}-m01`,
      type: "vocabulary",
      order: 1,
      title: `${kit.data.language === "en" ? "Key words" : "Kata kunci"}: ${vocabTitles}`,
      body: {
        items: vocabulary.map((item) => ({
          term: item.term,
          reading: item.reading,
          romanization: item.romanization,
          gloss: item.gloss,
          lineId: item.lineId,
          example: item.example,
        })),
        total: vocabulary.length,
      },
    },
    {
      id: `${plan.sceneId}-m02`,
      type: "grammar",
      order: 2,
      title: `${kit.data.language === "en" ? "Grammar focus" : "Fokus tata bahasa"}: ${patterns.map((item) => item.pattern).join(" / ")}`,
      body: {
        patterns: patterns.map((item) => ({
          pattern: item.pattern,
          meaning: item.meaning,
          example: lines.find((line) => line.text.length > 0)?.text,
        })),
        exercises: grammarExercises,
      },
    },
    {
      id: `${plan.sceneId}-m03`,
      type: "culture",
      order: 3,
      title: `${kit.data.language === "en" ? "Culture note" : "Catatan budaya"}: ${plan.anchor.title}`,
      body: {
        noteId: plan.anchor.id,
        title: plan.anchor.title,
        excerpt: plan.anchor.body,
        whyItMatters: {
          id: `Catatan ini menjelaskan latar keputusan tokoh di adegan ${plan.sceneNo}.`,
          en: `This note explains the cultural background of a choice in scene ${plan.sceneNo}.`,
        },
        reflection: plan.anchor.reflection,
        sources: plan.anchor.sources,
        stampId: plan.anchor.stampId,
      },
    },
    {
      id: `${plan.sceneId}-m04`,
      type: "review",
      order: 4,
      title: `${kit.data.language === "en" ? "Review" : "Ulasan"}: ${plan.arcSeed.title}`,
      body: {
        cards: vocabulary.slice(0, 10).map((item) => ({
          front: item.term,
          back: item.gloss,
          lineId: item.lineId,
          example: item.example,
        })),
        listenLineIds: lines.slice(0, 3).map((line) => line.id),
        total: vocabulary.length,
      },
      audio: {
        provider: "browser-tts",
        voice: lines[0].audio.voice,
        speed: lines[0].audio.speed,
        transcript: lines[0].text,
      },
    },
  ];
}

function buildScene(
  plan: ScenePlan,
  source: WorldSource,
  kit: LoadedKit,
): SceneExport {
  const lexicon = mergedLexicon(source, kit.data);
  const rng = createRng(plan.sceneId, "scene");
  const lines: LineExport[] = [];
  const allLexemes = new Map<string, { lexeme: Lexeme; lineId: string; example: string }>();
  const grammar = new Set<string>();

  const isCjk = kit.data.script === "jpan" || kit.data.script === "hans";
  const linePlan = isCjk
    ? [
        { beat: "context" as Beat, speaker: "narrator" as const },
        { beat: "greeting" as Beat, speaker: "visitor" as const },
        { beat: "task" as Beat, speaker: "narrator" as const },
        { beat: "request" as Beat, speaker: "visitor" as const },
        { beat: "complication" as Beat, speaker: "protagonist" as const },
        { beat: "clue" as Beat, speaker: "narrator" as const },
        { beat: "turn" as Beat, speaker: "protagonist" as const },
        { beat: "cliffhanger" as Beat, speaker: "narrator" as const },
      ]
    : LINE_PLAN;
  for (const [index, item] of linePlan.entries()) {
    const extend = !isCjk && index < 6 && (plan.levelIndex <= 2 || index % 2 === 0);
    const built = buildLine(plan, source, kit, item.beat, item.speaker, index + 1, extend);
    lines.push(built.line);
    for (const lexeme of built.lexemes) {
      if (!allLexemes.has(lexeme.id)) {
        allLexemes.set(lexeme.id, { lexeme, lineId: built.line.id, example: built.line.text });
      }
    }
    for (const pattern of built.grammar) grammar.add(pattern);
  }

  let units = lines.reduce((total, line) => total + countTextUnits(line.text, kit.data.script), 0);
  let extra = 1;
  while (units < 120 && lines.length < 12) {
    const beat: Beat = extra % 2 === 0 ? "turn" : "task";
    const built = buildLine(
      plan,
      source,
      kit,
      beat,
      extra % 2 === 0 ? "protagonist" : "narrator",
      lines.length + 1,
      true,
    );
    lines.push(built.line);
    for (const lexeme of built.lexemes) {
      if (!allLexemes.has(lexeme.id)) {
        allLexemes.set(lexeme.id, { lexeme, lineId: built.line.id, example: built.line.text });
      }
    }
    units += countTextUnits(built.line.text, kit.data.script);
    extra += 1;
  }

  const vocabEntries = [...allLexemes.values()].filter((entry) => {
    if (entry.lexeme.id.includes("-char-")) return false;
    return !entry.lexeme.tags?.some((tag) => ["protagonist", "friend", "mentor", "memory", "cat", "role"].includes(tag));
  });
  const vocabulary: VocabularyItem[] = vocabEntries.slice(0, 12).map((entry) => ({
    term: entry.lexeme.native,
    reading: entry.lexeme.reading,
    romanization: entry.lexeme.romanization,
    gloss: entry.lexeme.gloss,
    lineId: entry.lineId,
    example: entry.example,
  }));
  if (vocabulary.length < 8) {
    for (const slot of ["object", "place", "food", "drink", "action"] as const) {
      for (const lexeme of lexicon[slot]) {
        if (vocabulary.length >= 8) break;
        if (vocabulary.some((item) => item.term === lexeme.native)) continue;
        vocabulary.push({
          term: lexeme.native,
          reading: lexeme.reading,
          romanization: lexeme.romanization,
          gloss: lexeme.gloss,
          lineId: lines[0].id,
          example: lines[0].text,
        });
      }
    }
  }

  const levelPatterns = kit.data.grammar.filter((item) => item.level === plan.levelIndex);
  const patternPool = levelPatterns.length > 0 ? levelPatterns : kit.data.grammar;
  const usedPatterns = [...patternPool]
    .sort((a, b) => ((createRng(plan.sceneId, a.id).next() > createRng(plan.sceneId, b.id).next()) ? -1 : 1))
    .slice(0, 2)
    .map((item) => ({ pattern: item.pattern, meaning: item.meaning }));

  const exercises = buildExercises(plan, kit, lines, vocabulary, usedPatterns, lexicon, source.anchors, rng);
  const materials = buildMaterials(plan, kit, lines, vocabulary, usedPatterns, rng);

  const choices: SceneExport["choices"] = [];
  if (plan.sceneNo === 4 || plan.sceneNo === 9) {
    const options = [
      {
        id: "c1",
        text: `「${plan.greeting.native}」`,
        translation: { id: `«${plan.greeting.gloss.id}»`, en: `"${plan.greeting.gloss.en}"` },
        affinity: { [plan.visitorCharacter.id]: 1 },
      },
      {
        id: "c2",
        text: `「${plan.quote.native}」`,
        translation: { id: `«${plan.quote.gloss.id}»`, en: `"${plan.quote.gloss.en}"` },
        affinity: { [plan.protagonistCharacter.id]: 1 },
      },
      {
        id: "c3",
        text: `「${plan.question.native}」`,
        translation: { id: `«${plan.question.gloss.id}»`, en: `"${plan.question.gloss.en}"` },
      },
    ];
    choices.push({
      id: `${plan.sceneId}-c01`,
      prompt: kit.data.questionPhrases.next,
      options,
      effects: { sceneId: plan.sceneId, episodeId: plan.episodeId },
    });
  }

  const unitsForMinutes = lines.reduce((total, line) => total + countTextUnits(line.text, kit.data.script), 0);
  const divisor = kit.data.script === "jpan" || kit.data.script === "hans" ? 90 : 30;
  const estimatedMinutes = Math.max(3, Math.min(6, Math.round(unitsForMinutes / divisor)));

  const rawTitle =
    plan.sceneNo % 3 === 1
      ? plan.object.native
      : plan.sceneNo % 3 === 2
        ? plan.place.native
        : plan.object.native;
  const sceneTitle =
    kit.data.script === "latn" ? rawTitle.replace(/^([a-z])/, (letter) => letter.toUpperCase()) : rawTitle;

  return {
    id: plan.sceneId,
    sceneNo: plan.sceneNo,
    title: sceneTitle,
    titleRomanization: plan.object.romanization,
    titleTranslation: plan.object.gloss,
    setting: `${plan.place.native} · ${plan.anchor.title}`,
    estimatedMinutes,
    cliffhanger: lines[lines.length - 1].text,
    cultureNoteIds: [plan.anchor.id],
    beat: {
      hook: lines[0].text,
      context: lines[Math.min(2, lines.length - 1)].text,
      complication: lines[Math.min(4, lines.length - 1)].text,
      languageFocus: usedPatterns.map((item) => item.pattern).join(" / "),
      turn: lines[Math.min(7, lines.length - 1)].text,
      cliffhanger: lines[lines.length - 1].text,
    },
    lines,
    exercises,
    materials,
    choices,
  };
}

function buildEpisode(
  world: WorldDef,
  source: WorldSource,
  kit: LoadedKit,
  level: WorldLevelDef,
  levelIndex: number,
  arc: ArcSeed,
  arcIndex: number,
  episodeNo: number,
  arcId: string,
): EpisodeExport {
  const episodeId = `${arcId}-l${pad(episodeNo, 2)}`;
  const scenes: SceneExport[] = [];
  for (let sceneNo = 1; sceneNo <= 10; sceneNo += 1) {
    const sceneId = `${arcId}-p${pad((episodeNo - 1) * 10 + sceneNo, 4)}`;
    const plan = buildScenePlan(
      world,
      source,
      kit,
      level,
      levelIndex,
      arc,
      arcIndex,
      episodeNo,
      sceneNo,
      sceneId,
      episodeId,
      arcId,
    );
    scenes.push(buildScene(plan, source, kit));
  }
  const first = scenes[0];
  const objectNative = first.title;
  return {
    id: episodeId,
    episodeNo,
    title: `Episode ${episodeNo} — ${first.titleTranslation.en}`,
    nativeTitle: objectNative,
    hook: first.beat.hook,
    recap:
      episodeNo === 1
        ? `${source.title}: the story begins at ${first.setting}.`
        : `Previously: ${arc.title} continues. ${first.beat.context}`,
    cliffhanger: first.cliffhanger,
    focusObject: first.title,
    culturalAnchor: first.cultureNoteIds[0],
    scenes,
  };
}

function buildArc(
  world: WorldDef,
  source: WorldSource,
  kit: LoadedKit,
  level: WorldLevelDef,
  levelIndex: number,
  seed: ArcSeed,
  seasonNo: 1 | 2,
): ArcExport {
  const arcId = `${source.languageCode.toLowerCase()}-${level.framework.toLowerCase()}-${level.idPart}-u0${seasonNo}`;
  const arcIndex = (levelIndex - 1) * 2 + (seasonNo - 1);
  const episodes: EpisodeExport[] = [];
  for (let episodeNo = 1; episodeNo <= 20; episodeNo += 1) {
    episodes.push(buildEpisode(world, source, kit, level, levelIndex, seed, arcIndex, episodeNo, arcId));
  }
  return {
    id: arcId,
    seasonNo,
    tier: level.tier,
    framework: level.framework,
    levelCode: level.levelCode,
    title: seed.title,
    nativeTitle: seed.nativeTitle,
    synopsis: seed.synopsis,
    culturalAnchors: unique(episodes.map((episode) => episode.culturalAnchor)),
    cliffhanger: seed.cliffhanger,
    episodes,
  };
}

function enrichWorld(world: WorldSource): WorldDef {
  const arcs = world.arcs.map((seed) => {
    const objects = world.lexicon.object;
    const mysteryIndex = Math.max(0, objects.findIndex((item) => item.id === seed.mystery));
    return {
      ...seed,
      focusObjectIds: [objects[mysteryIndex], ...objects.filter((_, index) => index !== mysteryIndex)].map((item) => item.id),
      visitorIds: world.characters.slice(1).map((character) => character.id),
      anchorIds: world.anchors.map((anchor) => anchor.id),
    };
  });
  return { ...world, arcs } as WorldDef;
}

export function generateLanguageLevel(language: string, tier?: string): LibraryExport[] {
  const loadedWorld = loadWorld(language);
  const loadedKit = loadKit(language);
  const coverage = validateKitCoverage(loadedKit.data);
  const romanization = validateKitRomanization(loadedKit.data);
  if (coverage.length > 0) {
    throw new Error(`${language} kit is incomplete:\n${coverage.slice(0, 10).join("\n")}`);
  }
  if (romanization.length > 0) {
    throw new Error(`${language} romanization is incomplete:\n${romanization.slice(0, 10).join("\n")}`);
  }
  const source = loadedWorld.data;
  const world = enrichWorld(source);
  const libraries: LibraryExport[] = [];

  for (const [index, level] of source.levels.entries()) {
    if (tier && level.tier !== tier) continue;
    const levelIndex = index + 1;
    const seeds = source.arcs.filter((arc) => arc.tier === level.tier).sort((a, b) => a.seasonNo - b.seasonNo);
    if (seeds.length !== 2) throw new Error(`${language} ${level.tier}: expected 2 arcs`);
    const arcs = seeds.map((seed) => buildArc(world, source, loadedKit, level, levelIndex, seed, seed.seasonNo));
    const scenes = arcs.flatMap((arc) => arc.episodes.flatMap((episode) => episode.scenes));
    const materials = scenes.reduce((total, scene) => total + scene.materials.length, 0);
    const lines = scenes.reduce((total, scene) => total + scene.lines.length, 0);
    const exercises = scenes.reduce((total, scene) => total + scene.exercises.length, 0);
    const choices = scenes.reduce((total, scene) => total + scene.choices.length, 0);

    libraries.push({
      schemaVersion: SCHEMA_VERSION,
      contentVersion: CONTENT_VERSION,
      generatedAt: new Date().toISOString(),
      language,
      world: {
        id: source.id,
        languageCode: source.languageCode,
        slug: source.slug,
        title: source.title,
        nativeTitle: source.nativeTitle,
        logline: source.logline,
        setting: source.setting,
        era: source.era,
        tone: source.tone,
        palette: source.palette,
        motifs: source.motifs,
        sensitivityNotes: source.sensitivityNotes,
        canon: source.canon,
        characters: source.characters.map(({ lexeme: _lexeme, ...character }) => character),
        cultureNotes: source.anchors,
      },
      level: {
        tier: level.tier,
        framework: level.framework,
        levelCode: level.levelCode,
        label: level.label,
        position: level.position,
        arcs,
      },
      counts: {
        arcs: arcs.length,
        episodes: arcs.reduce((total, arc) => total + arc.episodes.length, 0),
        scenes: scenes.length,
        materials,
        lines,
        exercises,
        choices,
      },
    });
  }

  return libraries;
}

export function writeLanguage(language: string, tier?: string): LibraryExport[] {
  const libraries = generateLanguageLevel(language, tier);
  const world = loadWorld(language).data;
  for (const library of libraries) {
    const path = `content/stories/${language}/library/${world.id}-${library.level.tier.toLowerCase()}.json`;
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(library));
    console.log(
      `${path}: ${library.counts.scenes} scenes, ${library.counts.materials} materials, ${library.counts.lines} lines`,
    );
  }
  return libraries;
}

async function main() {
  const args = process.argv.slice(2);
  const langArg = args.find((arg) => arg.startsWith("--lang="))?.slice("--lang=".length);
  const tierArg = args.find((arg) => arg.startsWith("--tier="))?.slice("--tier=".length);
  const languages = langArg ? [langArg] : (["ja", "zh", "en", "id", "es", "ko", "ar", "hi", "de", "fr", "pt", "it", "nl"] as const);
  let totalScenes = 0;
  let totalMaterials = 0;
  for (const language of languages) {
    try {
      const libraries = writeLanguage(language, tierArg);
      totalScenes += libraries.reduce((total, library) => total + library.counts.scenes, 0);
      totalMaterials += libraries.reduce((total, library) => total + library.counts.materials, 0);
    } catch (error) {
      console.error(`✗ ${language}: ${(error as Error).message}`);
      if (langArg) process.exit(1);
    }
  }
  console.log(`\nGenerated ${totalScenes} scenes and ${totalMaterials} materials.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
