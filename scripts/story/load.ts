import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { MASTER_FRAME_BY_ID, MASTER_FRAMES } from "./master-frames";
import {
  languageKitSchema,
  worldSourceSchema,
  type LanguageKit,
  type MasterFrame,
  type WorldSource,
} from "./schema";
import type { Beat, Lexeme, Lexicon, SlotType } from "./types";
import { BEAT_ORDER, SLOT_TYPES } from "./types";

export const STORY_ROOT = join(process.cwd(), "content", "stories");
export const LIBRARY_ROOT = join(STORY_ROOT);

export const STORY_LANGUAGES = [
  "ja",
  "zh",
  "en",
  "id",
  "es",
  "ko",
  "ar",
  "hi",
  "de",
  "fr",
  "pt",
  "it",
  "nl",
] as const;

export type StoryLanguage = (typeof STORY_LANGUAGES)[number];

export function worldPath(language: string): string {
  return join(STORY_ROOT, language, "world.json");
}

export function kitPath(language: string): string {
  return join(STORY_ROOT, language, "kit.json");
}

export function libraryPath(
  language: string,
  worldId: string,
  tier: string,
): string {
  return join(STORY_ROOT, language, "library", `${worldId}-${tier.toLowerCase()}.json`);
}

export interface LoadedWorld {
  language: StoryLanguage;
  path: string;
  data: WorldSource;
}

export interface LoadedKit {
  language: StoryLanguage;
  path: string;
  data: LanguageKit;
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function loadWorld(language: string): LoadedWorld {
  const path = worldPath(language);
  const result = worldSourceSchema.safeParse(readJson(path));
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 12)
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n  ");
    throw new Error(`Invalid world ${path}:\n  ${issues}`);
  }
  if (result.data.languageCode !== language) {
    throw new Error(`${path}: languageCode ${result.data.languageCode} != ${language}`);
  }
  return { language: language as StoryLanguage, path, data: result.data };
}

export function loadKit(language: string): LoadedKit {
  const path = kitPath(language);
  const result = languageKitSchema.safeParse(readJson(path));
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 12)
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n  ");
    throw new Error(`Invalid kit ${path}:\n  ${issues}`);
  }
  if (result.data.language !== language) {
    throw new Error(`${path}: language ${result.data.language} != ${language}`);
  }
  return { language: language as StoryLanguage, path, data: result.data };
}

export function hasWorld(language: string): boolean {
  return existsSync(worldPath(language));
}

export function hasKit(language: string): boolean {
  return existsSync(kitPath(language));
}

export function validateKitCoverage(kit: LanguageKit): string[] {
  const errors: string[] = [];
  const byId = new Map(kit.frames.map((frame) => [frame.id, frame]));
  const duplicateIds = kit.frames.length - byId.size;
  if (duplicateIds > 0) errors.push(`${duplicateIds} duplicate kit frame id(s)`);

  for (const frame of kit.frames) {
    const master = MASTER_FRAME_BY_ID.get(frame.id);
    if (!master) {
      errors.push(`unknown frame id ${frame.id}`);
      continue;
    }
    const usedSlots = new Set<string>();
    for (const segment of frame.segments) {
      if (segment.slot) {
        usedSlots.add(segment.slot);
        if (!(segment.slot in master.slots)) {
          errors.push(`${frame.id}: slot ${segment.slot} is not declared by the master frame`);
        }
      }
    }
    for (const slot of Object.keys(master.slots)) {
      if (!usedSlots.has(slot)) {
        errors.push(`${frame.id}: master slot ${slot} is missing from the kit frame`);
      }
    }
  }

  for (const master of MASTER_FRAMES) {
    if (!byId.has(master.id)) {
      errors.push(`missing frame ${master.id} (level ${master.level}, ${master.beat})`);
    }
  }

  for (const level of [1, 2, 3, 4, 5] as const) {
    for (const beat of BEAT_ORDER) {
      const count = kit.frames.filter((frame) => {
        const master = MASTER_FRAME_BY_ID.get(frame.id);
        return master?.level === level && master.beat === beat;
      }).length;
      if (count < 2) {
        errors.push(`level ${level} beat ${beat}: only ${count} frame(s), need 2`);
      }
    }
  }

  return errors;
}

export function validateKitRomanization(kit: LanguageKit): string[] {
  const errors: string[] = [];
  const needsRomanization = kit.language === "ja" || kit.language === "zh";
  if (!needsRomanization) return errors;

  for (const slot of SLOT_TYPES) {
    for (const lexeme of kit.lexicon[slot]) {
      if (!lexeme.romanization) {
        errors.push(`lexicon ${slot}/${lexeme.id}: missing romanization`);
      }
      if (kit.language === "ja" && !lexeme.reading) {
        errors.push(`lexicon ${slot}/${lexeme.id}: missing reading`);
      }
    }
  }

  for (const frame of kit.frames) {
    for (const [index, segment] of frame.segments.entries()) {
      if (!segment.text) continue;
      if (!/[^\s\p{P}\p{S}\dA-Za-z]/u.test(segment.text)) continue;
      if (!segment.romanization) {
        errors.push(`${frame.id}: literal segment ${index} "${segment.text}" needs romanization`);
      }
      if (kit.language === "ja" && !segment.reading) {
        errors.push(`${frame.id}: literal segment ${index} "${segment.text}" needs reading`);
      }
    }
  }

  return errors;
}

export function mergedLexicon(world: WorldSource, kit: LanguageKit): Lexicon {
  const merged = {} as Lexicon;
  for (const slot of SLOT_TYPES) {
    const byId = new Map<string, Lexeme>();
    for (const lexeme of kit.lexicon[slot]) byId.set(lexeme.id, lexeme);
    for (const lexeme of world.lexicon[slot]) byId.set(lexeme.id, lexeme);
    if (slot === "person") {
      for (const character of world.characters) byId.set(character.lexeme.id, character.lexeme);
    }
    merged[slot] = [...byId.values()];
  }
  return merged;
}

export function masterFramesFor(level: number, beat: Beat): MasterFrame[] {
  return MASTER_FRAMES.filter((frame) => frame.level === level && frame.beat === beat);
}

export function assertWorldLexicon(world: WorldSource): string[] {
  const errors: string[] = [];
  for (const slot of SLOT_TYPES) {
    if (world.lexicon[slot].length < 2) {
      errors.push(`world lexicon ${slot}: need at least 2 items`);
    }
  }
  const ids = new Set<string>();
  for (const slot of SLOT_TYPES) {
    for (const lexeme of world.lexicon[slot]) {
      if (ids.has(lexeme.id)) errors.push(`duplicate world lexeme id ${lexeme.id}`);
      ids.add(lexeme.id);
    }
  }
  for (const character of world.characters) {
    if (ids.has(character.lexeme.id)) errors.push(`duplicate character lexeme id ${character.lexeme.id}`);
    ids.add(character.lexeme.id);
  }
  return errors;
}

export { MASTER_FRAMES, MASTER_FRAME_BY_ID };
