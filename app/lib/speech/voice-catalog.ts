/**
 * Language-aware voice selection for the Web Speech API.
 *
 * The browser exposes a flat list of installed voices with no reliable gender
 * metadata. We therefore keep a catalogue of known voice actors per language
 * (macOS/iOS, Windows, Edge, Chrome, Android) and score candidates by language
 * first, then gender. A voice from another language is never used for the
 * learner's target language: reading Japanese with an English voice is worse
 * than showing a "no voice installed" message.
 */

export type SpeechGender = "female" | "male";

export interface VoiceLike {
  name: string;
  lang: string;
  voiceURI?: string;
  localService?: boolean;
  default?: boolean;
}

interface VoiceProfile {
  female: readonly string[];
  male: readonly string[];
}

/**
 * Known voice-actor names and identifiers per primary language. Names are
 * matched against the whole voice name, so "Microsoft Nanami Online (Natural)"
 * matches the `nanami` entry.
 */
const VOICE_PROFILES: Record<string, VoiceProfile> = {
  en: {
    female: [
      "samantha",
      "victoria",
      "karen",
      "moira",
      "tessa",
      "fiona",
      "serena",
      "allison",
      "ava",
      "susan",
      "zira",
      "hazel",
      "aria",
      "jenny",
      "michelle",
      "sonia",
      "libby",
      "emily",
      "isla",
      "freya",
      "amy",
      "emma",
      "olivia",
      "sophia",
      "charlotte",
      "alice",
      "nicky",
      "zoe",
      "kate",
      "stephanie",
      "google us english",
      "google uk english female",
      "microsoft zira",
      "microsoft aria",
      "microsoft jenny",
      "microsoft michelle",
      "microsoft sonia",
      "microsoft libby",
      "microsoft natasha",
      "microsoft clara",
    ],
    male: [
      "daniel",
      "alex",
      "fred",
      "thomas",
      "oliver",
      "arthur",
      "david",
      "mark",
      "guy",
      "ryan",
      "eric",
      "christopher",
      "aaron",
      "andrew",
      "brian",
      "george",
      "james",
      "liam",
      "matthew",
      "nathan",
      "william",
      "evan",
      "tom",
      "google uk english male",
      "microsoft david",
      "microsoft mark",
      "microsoft guy",
      "microsoft ryan",
      "microsoft christopher",
      "microsoft eric",
      "microsoft andrew",
      "microsoft brian",
      "microsoft connor",
    ],
  },
  es: {
    female: [
      "monica",
      "paulina",
      "lucia",
      "helena",
      "laura",
      "sabina",
      "elvira",
      "maria",
      "marisol",
      "camila",
      "sofia",
      "valentina",
      "isabella",
      "ximena",
      "google espanol",
      "google espanol de estados unidos",
      "microsoft helena",
      "microsoft sabina",
      "microsoft laura",
      "microsoft elvira",
      "microsoft dalia",
      "microsoft elena",
      "microsoft marina",
      "microsoft nuria",
      "microsoft triana",
    ],
    male: [
      "jorge",
      "diego",
      "enrique",
      "pablo",
      "raul",
      "alvaro",
      "carlos",
      "miguel",
      "juan",
      "mateo",
      "andres",
      "microsoft jorge",
      "microsoft pablo",
      "microsoft raul",
      "microsoft alvaro",
      "microsoft alonso",
      "microsoft gonzalo",
      "microsoft lorenzo",
      "microsoft nil",
    ],
  },
  id: {
    female: [
      "damayanti",
      "gadis",
      "andini",
      "dewi",
      "sari",
      "putri",
      "google bahasa indonesia",
      "microsoft gadis",
      "microsoft damayanti",
    ],
    male: [
      "andika",
      "ardi",
      "budi",
      "dimas",
      "eko",
      "microsoft andika",
      "microsoft ardi",
      "microsoft budi",
    ],
  },
  ja: {
    female: [
      "kyoko",
      "o-ren",
      "oren",
      "haruka",
      "ayumi",
      "sayaka",
      "aoi",
      "nanami",
      "mayu",
      "shiori",
      "nana",
      "mizuki",
      "eri",
      "sakura",
      "tomoko",
      "yuki",
      "google 日本語",
      "google japanese",
      "microsoft haruka",
      "microsoft ayumi",
      "microsoft sayaka",
      "microsoft nanami",
      "microsoft aoi",
      "microsoft mayu",
      "microsoft shiori",
      "microsoft nana",
      "microsoft mizuki",
      "microsoft eri",
      "microsoft sakura",
      "microsoft tomoko",
    ],
    male: [
      "otoya",
      "ichiro",
      "keita",
      "daichi",
      "naoki",
      "takumi",
      "kaito",
      "satoshi",
      "microsoft ichiro",
      "microsoft keita",
      "microsoft daichi",
      "microsoft naoki",
      "microsoft takumi",
      "microsoft kaito",
      "microsoft satoshi",
    ],
  },
  hi: {
    female: [
      "lekha",
      "kalpana",
      "swara",
      "neerja",
      "ananya",
      "kavya",
      "google हिन्दी",
      "google hindi",
      "microsoft swara",
      "microsoft kalpana",
      "microsoft neerja",
      "microsoft ananya",
      "microsoft kavya",
      "microsoft lekha",
    ],
    male: [
      "hemant",
      "madhav",
      "prabhat",
      "arvind",
      "ravi",
      "microsoft hemant",
      "microsoft madhav",
      "microsoft prabhat",
      "microsoft arvind",
      "microsoft ravi",
    ],
  },
  de: {
    female: [
      "anna",
      "petra",
      "marlene",
      "vicki",
      "katja",
      "amala",
      "maja",
      "jana",
      "lena",
      "hedda",
      "seraphina",
      "google deutsch",
      "microsoft katja",
      "microsoft hedda",
      "microsoft amala",
      "microsoft marlene",
      "microsoft seraphina",
      "microsoft louisa",
      "microsoft tanja",
    ],
    male: [
      "stefan",
      "markus",
      "hans",
      "killian",
      "conrad",
      "kasper",
      "microsoft stefan",
      "microsoft killian",
      "microsoft conrad",
      "microsoft kasper",
      "microsoft klaus",
      "microsoft michael",
    ],
  },
  ar: {
    female: [
      "laila",
      "salma",
      "hoda",
      "zariyah",
      "mouna",
      "amany",
      "ameera",
      "google العربية",
      "google arabic",
      "microsoft hoda",
      "microsoft salma",
      "microsoft zariyah",
      "microsoft laila",
      "microsoft ameera",
      "microsoft amany",
      "microsoft mouna",
    ],
    male: [
      "maged",
      "tarik",
      "naayf",
      "shakir",
      "hamed",
      "microsoft naayf",
      "microsoft shakir",
      "microsoft hamed",
      "microsoft tarik",
      "microsoft maged",
    ],
  },
  fr: {
    female: [
      "amelie",
      "audrey",
      "aurelie",
      "julie",
      "celine",
      "denise",
      "lea",
      "vivienne",
      "eloise",
      "hortense",
      "google francais",
      "microsoft hortense",
      "microsoft julie",
      "microsoft celine",
      "microsoft denise",
      "microsoft eloise",
      "microsoft vivienne",
      "microsoft lea",
      "microsoft amelie",
      "microsoft brigitte",
    ],
    male: [
      "thomas",
      "daniel",
      "henri",
      "paul",
      "remy",
      "claude",
      "yves",
      "microsoft thomas",
      "microsoft henri",
      "microsoft paul",
      "microsoft remy",
      "microsoft claude",
      "microsoft yves",
      "microsoft alain",
    ],
  },
  pt: {
    female: [
      "luciana",
      "joana",
      "ines",
      "fernanda",
      "francisca",
      "maria",
      "thalita",
      "yara",
      "helia",
      "google portugues do brasil",
      "google portugues",
      "microsoft maria",
      "microsoft francisca",
      "microsoft ines",
      "microsoft fernanda",
      "microsoft luciana",
      "microsoft thalita",
      "microsoft yara",
      "microsoft helia",
      "microsoft raquel",
    ],
    male: [
      "felipe",
      "ricardo",
      "daniel",
      "duarte",
      "antonio",
      "donato",
      "microsoft daniel",
      "microsoft felipe",
      "microsoft ricardo",
      "microsoft duarte",
      "microsoft antonio",
      "microsoft donato",
      "microsoft henrique",
    ],
  },
  it: {
    female: [
      "alice",
      "elsa",
      "federica",
      "isabella",
      "lucia",
      "giulia",
      "bianca",
      "google italiano",
      "microsoft elsa",
      "microsoft isabella",
      "microsoft federica",
      "microsoft lucia",
      "microsoft giulia",
      "microsoft bianca",
      "microsoft imelda",
    ],
    male: [
      "luca",
      "paolo",
      "cosimo",
      "diego",
      "matteo",
      "benigno",
      "gianni",
      "microsoft cosimo",
      "microsoft diego",
      "microsoft paolo",
      "microsoft luca",
      "microsoft benigno",
      "microsoft gianni",
    ],
  },
  nl: {
    female: [
      "fenna",
      "lotte",
      "claire",
      "colette",
      "google nederlands",
      "microsoft lotte",
      "microsoft fenna",
      "microsoft colette",
      "microsoft claire",
    ],
    male: [
      "ruben",
      "xander",
      "maarten",
      "bram",
      "frank",
      "microsoft ruben",
      "microsoft xander",
      "microsoft maarten",
      "microsoft bram",
      "microsoft frank",
    ],
  },
  ko: {
    female: [
      "yuna",
      "sora",
      "nari",
      "jina",
      "sumi",
      "heami",
      "sunhi",
      "jimin",
      "seohyeon",
      "soyeon",
      "google 한국의",
      "google korean",
      "microsoft heami",
      "microsoft sunhi",
      "microsoft yuna",
      "microsoft jimin",
      "microsoft seohyeon",
      "microsoft soyeon",
    ],
    male: [
      "minsu",
      "gildong",
      "injoon",
      "hyunsu",
      "jinho",
      "bongjin",
      "microsoft injoon",
      "microsoft hyunsu",
      "microsoft gildong",
      "microsoft minsu",
      "microsoft bongjin",
    ],
  },
  zh: {
    female: [
      "tingting",
      "huihui",
      "yaoyao",
      "xiaoxiao",
      "xiaoyi",
      "xiaohan",
      "xiaoqiu",
      "meijia",
      "hiugaai",
      "google 普通话",
      "google 國語",
      "google chinese",
      "microsoft huihui",
      "microsoft yaoyao",
      "microsoft xiaoxiao",
      "microsoft xiaoyi",
      "microsoft xiaohan",
      "microsoft xiaoqiu",
      "microsoft hiugaai",
    ],
    male: [
      "yunxi",
      "yunyang",
      "kangkang",
      "liang",
      "yunjian",
      "wanlung",
      "li-mu",
      "yu-shu",
      "microsoft kangkang",
      "microsoft yunxi",
      "microsoft yunyang",
      "microsoft yunjian",
      "microsoft liang",
      "microsoft wanlung",
    ],
  },
};

/** Short, natural preview phrase per language. */
export const VOICE_SAMPLES: Record<string, string> = {
  en: "Hello, welcome to your lesson.",
  es: "Hola, bienvenido a tu lección.",
  id: "Halo, selamat datang di pelajaranmu.",
  ja: "こんにちは、レッスンへようこそ。",
  hi: "नमस्ते, आपके पाठ में स्वागत है।",
  de: "Hallo, willkommen zu deiner Lektion.",
  ar: "مرحبًا بك في درسك.",
  fr: "Bonjour, bienvenue dans votre leçon.",
  pt: "Olá, bem-vindo à sua lição.",
  it: "Ciao, benvenuto alla tua lezione.",
  nl: "Hallo, welkom bij je les.",
  ko: "안녕하세요, 수업에 오신 것을 환영합니다.",
  zh: "你好，欢迎来到你的课程。",
};

const FEMALE_PATTERN = /\b(female|woman|girl)\b/;
const MALE_PATTERN = /\b(male|man|boy)\b/;
const CJK_FEMALE_PATTERN = /(女性|女声|여성|여자)/;
const CJK_MALE_PATTERN = /(男性|男声|남성|남자)/;

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function compact(value: string): string {
  return normalize(value).replace(/[^\p{L}\p{N}]+/gu, "");
}

function languageOf(value: string | null | undefined): string {
  if (!value) return "";
  return value.toLowerCase().replace(/_/g, "-").split("-")[0] ?? "";
}

export function normalizeSpeechLocale(locale: string): string {
  return locale.trim().replace(/_/g, "-");
}

export function voicesForLanguage<T extends VoiceLike>(
  voices: readonly T[],
  locale: string,
): T[] {
  const language = languageOf(locale);
  if (!language) return [];
  return voices.filter((voice) => languageOf(voice.lang) === language);
}

function genderFromKnownNames(
  voice: VoiceLike,
  language: string,
): SpeechGender | null {
  const name = normalize(voice.name);
  const uri = normalize(voice.voiceURI ?? "");
  if (
    FEMALE_PATTERN.test(name) ||
    FEMALE_PATTERN.test(uri) ||
    CJK_FEMALE_PATTERN.test(name)
  ) {
    return "female";
  }
  if (
    MALE_PATTERN.test(name) ||
    MALE_PATTERN.test(uri) ||
    CJK_MALE_PATTERN.test(name)
  ) {
    return "male";
  }

  const profile = VOICE_PROFILES[language];
  if (!profile) return null;

  // Match name and URI separately: concatenating them can create accidental
  // aliases across the boundary (e.g. "Minsu" + "Minsu" → "sumi").
  const haystacks = [compact(name), compact(uri)].filter(Boolean);
  const matches = (aliases: readonly string[]) =>
    aliases.some((alias) => {
      const needle = compact(alias);
      if (needle.length < 3) {
        return name.includes(alias.toLowerCase());
      }
      return haystacks.some((haystack) => haystack.includes(needle));
    });

  if (matches(profile.female)) return "female";
  if (matches(profile.male)) return "male";
  return null;
}

export interface VoiceMatch<T extends VoiceLike> {
  voice: T | null;
  /** True when the chosen voice matches the requested gender. */
  genderMatched: boolean;
  /** True when at least one voice exists for the requested language. */
  languageMatched: boolean;
}

function preferVoice<T extends VoiceLike>(
  voices: readonly T[],
  locale: string,
): T | null {
  if (voices.length === 0) return null;
  const normalized = normalizeSpeechLocale(locale).toLowerCase();
  const quality = (voice: T) =>
    /natural|neural|premium|enhanced|siri/i.test(voice.name) ? 2 : 0;

  return (
    [...voices].sort((a, b) => {
      const aExact = a.lang.toLowerCase().replace(/_/g, "-") === normalized;
      const bExact = b.lang.toLowerCase().replace(/_/g, "-") === normalized;
      if (aExact !== bExact) return aExact ? -1 : 1;
      const highQuality = quality(b) - quality(a);
      if (highQuality !== 0) return highQuality;
      const local = Number(Boolean(b.localService)) - Number(Boolean(a.localService));
      if (local !== 0) return local;
      const fallback = Number(Boolean(b.default)) - Number(Boolean(a.default));
      if (fallback !== 0) return fallback;
      return a.name.localeCompare(b.name);
    })[0] ?? null
  );
}

/**
 * Pick the best installed voice for a BCP-47 locale and optional gender.
 * Language matching is mandatory; gender is best-effort and never causes a
 * different-language voice to be used.
 */
export function pickVoice<T extends VoiceLike>(
  voices: readonly T[],
  locale: string,
  gender?: SpeechGender,
): VoiceMatch<T> {
  const normalized = normalizeSpeechLocale(locale);
  const language = languageOf(normalized);
  const candidates = voicesForLanguage(voices, normalized);
  if (candidates.length === 0) {
    return { voice: null, genderMatched: false, languageMatched: false };
  }

  if (gender) {
    const sameGender = candidates.filter(
      (voice) => genderFromKnownNames(voice, language) === gender,
    );
    if (sameGender.length > 0) {
      return {
        voice: preferVoice(sameGender, normalized),
        genderMatched: true,
        languageMatched: true,
      };
    }

    // Unknown-gender voices are a better fallback than a known opposite voice.
    const unknown = candidates.filter(
      (voice) => genderFromKnownNames(voice, language) === null,
    );
    if (unknown.length > 0) {
      return {
        voice: preferVoice(unknown, normalized),
        genderMatched: false,
        languageMatched: true,
      };
    }
  }

  return {
    voice: preferVoice(candidates, normalized),
    genderMatched: false,
    languageMatched: true,
  };
}

export interface VoiceAvailability<T extends VoiceLike> {
  language: string;
  total: number;
  female: T | null;
  male: T | null;
  femaleMatched: boolean;
  maleMatched: boolean;
  /** Both genders resolve to the same installed voice. */
  singleVoice: boolean;
}

export function getVoiceAvailability<T extends VoiceLike>(
  voices: readonly T[],
  locale: string,
): VoiceAvailability<T> {
  const candidates = voicesForLanguage(voices, locale);
  const femaleMatch = pickVoice(voices, locale, "female");
  const maleMatch = pickVoice(voices, locale, "male");
  const female = femaleMatch.voice;
  const male = maleMatch.voice;
  return {
    language: languageOf(locale),
    total: candidates.length,
    female,
    male,
    femaleMatched: femaleMatch.genderMatched,
    maleMatched: maleMatch.genderMatched,
    singleVoice:
      candidates.length === 1 ||
      (female !== null && male !== null && female.voiceURI === male.voiceURI),
  };
}

export function voiceGenderLabel(voice: VoiceLike | null): SpeechGender | null {
  if (!voice) return null;
  return genderFromKnownNames(voice, languageOf(voice.lang));
}
