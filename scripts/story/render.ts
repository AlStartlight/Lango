import type {
  FrameSegment,
  KitFrame,
  Lexeme,
  LocalizedText,
  MasterFrame,
  StoryScript,
} from "./types";

function cpLength(value: string): number {
  return Array.from(value).length;
}

function fill(text: string, values: Map<string, Lexeme>, locale: "id" | "en"): string {
  return text.replace(/\{([A-Za-z0-9_]+)\}/g, (_, key: string) => {
    const lexeme = values.get(key);
    if (!lexeme) throw new Error(`missing slot value ${key}`);
    return lexeme.gloss[locale];
  });
}

export interface RenderedFrame {
  text: string;
  reading?: string;
  romanization?: string;
  translation: LocalizedText;
  tokens: Array<{
    surface: string;
    start: number;
    end: number;
    reading?: string;
    romanization?: string;
    gloss?: LocalizedText;
    pos?: string;
  }>;
}

function cleanupText(value: string): string {
  return value
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([.!?。！？])\1+/g, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/^([a-z])/, (letter) => letter.toUpperCase())
    .trim();
}

function cleanupRomanization(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?。、，．！？])/g, "$1")
    .replace(/([「『（(])\s+/g, "$1")
    .replace(/\s+([」』）)])/g, "$1")
    .trim();
}

export function renderFrame(
  master: MasterFrame,
  frame: KitFrame,
  values: Map<string, Lexeme>,
  script: StoryScript,
  scheme: string,
): RenderedFrame {
  const pieces: Array<{
    text: string;
    reading?: string;
    romanization?: string;
    gloss?: LocalizedText;
    slot?: string;
  }> = [];

  for (const segment of frame.segments) {
    if (segment.slot) {
      const lexeme = values.get(segment.slot);
      if (!lexeme) throw new Error(`${master.id}: missing lexeme for slot ${segment.slot}`);
      pieces.push({
        text: lexeme.native,
        reading: lexeme.reading,
        romanization: lexeme.romanization,
        gloss: lexeme.gloss,
        slot: segment.slot,
      });
    } else if (segment.text) {
      pieces.push({
        text: segment.text,
        reading: segment.reading,
        romanization: segment.romanization,
      });
    }
  }

  let text = "";
  let reading = "";
  let romanization = "";
  const tokens: RenderedFrame["tokens"] = [];
  let offset = 0;

  for (const piece of pieces) {
    const start = offset;
    text += piece.text;
    offset += cpLength(piece.text);
    tokens.push({
      surface: piece.text,
      start,
      end: offset,
      reading: piece.reading,
      romanization: piece.romanization,
      gloss: piece.gloss,
      pos: piece.gloss ? "word" : "particle",
    });
    if (piece.reading) reading += piece.reading;
    else reading += piece.text;
    if (piece.romanization) romanization += `${piece.romanization} `;
    else if (script === "latn") romanization += `${piece.text} `;
  }

  const usesRomanization = (script === "jpan" || script === "hans") && scheme !== "none";
  const romanizationValue = usesRomanization
    ? cleanupRomanization(romanization).replace(/^[a-z]/, (letter) => letter.toUpperCase())
    : undefined;

  return {
    text: cleanupText(text),
    reading: script === "jpan" ? reading : undefined,
    romanization: romanizationValue,
    translation: {
      id: cleanupText(fill(master.translation.id, values, "id")),
      en: cleanupText(fill(master.translation.en, values, "en")),
    },
    tokens: script === "latn" ? undefined : tokens,
  };
}

export function countTextUnits(text: string, script: StoryScript): number {
  if (script === "jpan" || script === "hans") {
    return Array.from(text).filter((char) => !/[\s\p{P}\p{S}]/u.test(char)).length;
  }
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function speakerLabel(
  speaker: { name: string; nativeName: string } | null,
  script: StoryScript,
): string | null {
  if (!speaker) return null;
  return script === "latn" ? speaker.name : speaker.nativeName;
}
