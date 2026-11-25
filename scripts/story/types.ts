/**
 * Story-first content model. Authoring source is a set of language kits
 * (frames + lexicon), a world bible, and a generated per-level library.
 * IDs and counts follow docs/PRD-story-first-curriculum.md.
 */

export type StoryScript = "latn" | "jpan" | "hans" | "hang" | "arab" | "deva";

export type RomanizationScheme =
  | "hepburn"
  | "pinyin"
  | "revised"
  | "iast"
  | "ala-lc"
  | "none";

export type Beat =
  | "context"
  | "greeting"
  | "task"
  | "request"
  | "complication"
  | "clue"
  | "turn"
  | "cliffhanger";

export const BEAT_ORDER: Beat[] = [
  "context",
  "greeting",
  "task",
  "request",
  "complication",
  "clue",
  "turn",
  "cliffhanger",
];

export type SlotType =
  | "person"
  | "place"
  | "object"
  | "food"
  | "drink"
  | "time"
  | "weather"
  | "action"
  | "quote"
  | "question"
  | "greeting"
  | "emotion";

export const SLOT_TYPES: SlotType[] = [
  "person",
  "place",
  "object",
  "food",
  "drink",
  "time",
  "weather",
  "action",
  "quote",
  "question",
  "greeting",
  "emotion",
];

export interface LocalizedText {
  id: string;
  en: string;
  ja?: string;
}

export interface Lexeme {
  id: string;
  native: string;
  reading?: string;
  romanization?: string;
  gloss: LocalizedText;
  tags?: string[];
}

export type Lexicon = Record<SlotType, Lexeme[]>;

export interface FrameSegment {
  /** Literal target-language text. Exactly one of `text` or `slot` is set. */
  text?: string;
  /** Slot key from the master frame (personA, place, objectB, ...). */
  slot?: string;
  /** Kana reading for a literal segment (ja). */
  reading?: string;
  /** Romanization for a literal segment (ja/zh). */
  romanization?: string;
}

export interface MasterFrame {
  id: string;
  level: 1 | 2 | 3 | 4 | 5;
  beat: Beat;
  variant: number;
  /** Slot key -> semantic type. */
  slots: Record<string, SlotType>;
  translation: LocalizedText;
  grammar: string[];
  tags?: string[];
}

export interface KitFrame {
  id: string;
  segments: FrameSegment[];
}

export interface GrammarPattern {
  id: string;
  level: number;
  pattern: string;
  meaning: LocalizedText;
  example?: string;
  note?: string;
}

export interface QuestionPhrases {
  meaning: string;
  who: string;
  where: string;
  when: string;
  why: string;
  detail: string;
  next: string;
  culture: string;
  grammar: string;
}

export interface LanguageKit {
  language: string;
  script: StoryScript;
  romanization: RomanizationScheme;
  /** Generic lexicon; world-specific lexemes are merged at generation time. */
  lexicon: Lexicon;
  frames: KitFrame[];
  grammar: GrammarPattern[];
  questionPhrases: QuestionPhrases;
}

export interface WorldCharacterDef {
  id: string;
  name: string;
  nativeName: string;
  role: string;
  age?: number;
  bio: string;
  speechStyle?: string;
  quote?: string;
  position: number;
  /** Lexeme used when the character is referenced in target-language text. */
  lexeme: Lexeme;
}

export interface CultureAnchorDef {
  id: string;
  title: string;
  body: LocalizedText;
  sources: string[];
  reflection: LocalizedText;
  stampId?: string;
  tags?: string[];
}

export type Framework = "JLPT" | "CEFR" | "HSK";

export interface WorldLevelDef {
  tier: "T1" | "T2" | "T3" | "T4" | "T5";
  framework: Framework;
  /** Display level code stored on CurriculumLevel, e.g. N5, A1, HSK1-2. */
  levelCode: string;
  label: string;
  /** Stable lowercase fragment used in IDs, e.g. n5, a1, t1. */
  idPart: string;
  position: number;
}

export interface ArcDef {
  tier: WorldLevelDef["tier"];
  seasonNo: 1 | 2;
  title: string;
  nativeTitle: string;
  synopsis: string;
  mystery: string;
  cliffhanger: string;
  /** Lexeme IDs from the world lexicon. */
  focusObjectIds: string[];
  visitorIds: string[];
  anchorIds: string[];
}

export interface ArcSeed {
  tier: WorldLevelDef["tier"];
  seasonNo: 1 | 2;
  title: string;
  nativeTitle: string;
  synopsis: string;
  mystery: string;
  cliffhanger: string;
}

export interface WorldSource {
  id: string;
  languageCode: string;
  slug: string;
  title: string;
  nativeTitle: string;
  logline: string;
  setting: string;
  era: string;
  tone: string;
  palette: string;
  motifs: string[];
  sensitivityNotes: string[];
  canon: Record<string, unknown>;
  levels: WorldLevelDef[];
  characters: WorldCharacterDef[];
  lexicon: Lexicon;
  anchors: CultureAnchorDef[];
  arcs: ArcSeed[];
}

export interface WorldDef {
  id: string;
  languageCode: string;
  slug: string;
  title: string;
  nativeTitle: string;
  logline: string;
  setting: string;
  era: string;
  tone: string;
  palette: string;
  motifs: string[];
  sensitivityNotes: string[];
  canon: Record<string, unknown>;
  levels: WorldLevelDef[];
  characters: WorldCharacterDef[];
  lexicon: Lexicon;
  anchors: CultureAnchorDef[];
  arcs: ArcDef[];
}


export interface LineExport {
  id: string;
  order: number;
  speakerId: string | null;
  speakerName: string | null;
  text: string;
  script: StoryScript;
  reading?: string;
  romanization?: { scheme: RomanizationScheme; value: string };
  translation: LocalizedText;
  tokens?: Array<{
    surface: string;
    start: number;
    end: number;
    reading?: string;
    romanization?: string;
    gloss?: LocalizedText;
    pos?: string;
  }>;
  audio: {
    provider: "browser-tts" | "prerecorded";
    voice: string;
    speed: number;
    transcript: string;
  };
}

export interface ExerciseChoice {
  id: string;
  text: string;
}

export interface ExerciseExport {
  id: string;
  type: "multiple_choice" | "fill_blank" | "listening_comprehension";
  skill: string;
  prompt: string;
  promptSupport?: LocalizedText;
  choices?: ExerciseChoice[];
  answerKey: Record<string, unknown>;
  explanation: LocalizedText;
  conceptKey: string;
  difficulty: number;
  tags: string[];
  lineId?: string;
}

export interface VocabularyItem {
  term: string;
  reading?: string;
  romanization?: string;
  gloss: LocalizedText;
  lineId: string;
  example: string;
  pos?: string;
}

export interface StoryMaterialExport {
  id: string;
  type: "vocabulary" | "grammar" | "culture" | "review";
  order: number;
  title: string;
  body: Record<string, unknown>;
  audio?: {
    provider: "browser-tts" | "prerecorded";
    voice: string;
    speed: number;
    transcript: string;
  };
}

export interface StoryChoiceExport {
  id: string;
  prompt: string;
  options: Array<{
    id: string;
    text: string;
    translation: LocalizedText;
    affinity?: Record<string, number>;
  }>;
  effects?: Record<string, unknown>;
}

export interface SceneExport {
  id: string;
  sceneNo: number;
  title: string;
  titleRomanization?: string;
  titleTranslation: LocalizedText;
  setting: string;
  estimatedMinutes: number;
  cliffhanger: string;
  cultureNoteIds: string[];
  beat: {
    hook: string;
    context: string;
    complication: string;
    languageFocus: string;
    turn: string;
    cliffhanger: string;
  };
  lines: LineExport[];
  exercises: ExerciseExport[];
  materials: StoryMaterialExport[];
  choices: StoryChoiceExport[];
}

export interface EpisodeExport {
  id: string;
  episodeNo: number;
  title: string;
  nativeTitle: string;
  hook: string;
  recap: string;
  cliffhanger: string;
  focusObject: string;
  culturalAnchor: string;
  scenes: SceneExport[];
}

export interface ArcExport {
  id: string;
  seasonNo: number;
  tier: string;
  framework: Framework;
  levelCode: string;
  title: string;
  nativeTitle: string;
  synopsis: string;
  culturalAnchors: string[];
  cliffhanger: string;
  episodes: EpisodeExport[];
}

export interface LevelExport {
  tier: string;
  framework: Framework;
  levelCode: string;
  label: string;
  position: number;
  arcs: ArcExport[];
}

export interface LibraryExport {
  schemaVersion: "1.0.0";
  contentVersion: string;
  generatedAt: string;
  language: string;
  world: {
    id: string;
    languageCode: string;
    slug: string;
    title: string;
    nativeTitle: string;
    logline: string;
    setting: string;
    era: string;
    tone: string;
    palette: string;
    motifs: string[];
    sensitivityNotes: string[];
    canon: Record<string, unknown>;
    characters: Array<Omit<WorldCharacterDef, "lexeme">>;
    cultureNotes: CultureAnchorDef[];
  };
  level: LevelExport;
  counts: {
    arcs: number;
    episodes: number;
    scenes: number;
    materials: number;
    lines: number;
    exercises: number;
    choices: number;
  };
}
