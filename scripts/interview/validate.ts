import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Validates the Visa Kerja interview seed. Run with `npm run interview:validate`.
 * Exits non-zero when a publish-blocking rule fails.
 */

const ROOT = path.join(process.cwd(), "content", "interview");
const TRACKS = [
  "screening",
  "behavioral",
  "technical",
  "case",
  "closing",
  "panel",
] as const;
const LANGUAGES = ["en", "id", "ja"] as const;

interface Question {
  canonicalId?: unknown;
  track?: unknown;
  rolePack?: unknown;
  level?: unknown;
  prompt?: unknown;
  translation?: unknown;
  romanization?: unknown;
  competencies?: unknown;
  expectedLengthSec?: unknown;
  timeLimitSec?: unknown;
  followUps?: unknown;
  skeleton?: unknown;
  modelAnswer?: unknown;
  keyPhrases?: unknown;
  rubricPoints?: unknown;
  redFlags?: unknown;
  culturalNote?: unknown;
  keywords?: unknown;
}

const errors: string[] = [];
const warnings: string[] = [];

function error(message: string) {
  errors.push(message);
}

function warn(message: string) {
  warnings.push(message);
}

function isStringArray(value: unknown, min: number): boolean {
  return (
    Array.isArray(value) &&
    value.length >= min &&
    value.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}

let total = 0;
const canonicalIds = new Set<string>();

for (const language of LANGUAGES) {
  const file = path.join(ROOT, `questions.${language}.json`);
  const questions = JSON.parse(readFileSync(file, "utf8")) as Question[];
  if (!Array.isArray(questions)) {
    error(`${language}: file is not an array`);
    continue;
  }
  if (questions.length < 20) {
    error(`${language}: expected at least 20 questions, found ${questions.length}`);
  }

  const seen = new Set<string>();
  for (const [index, question] of questions.entries()) {
    total += 1;
    const label = `${language}[${index}] ${String(question.canonicalId ?? "?")}`;

    if (typeof question.canonicalId !== "string" || !/^iv-[a-z]{3}-\d{3}$/.test(question.canonicalId)) {
      error(`${label}: canonicalId must match iv-xxx-000`);
      continue;
    }
    if (seen.has(question.canonicalId)) {
      error(`${label}: duplicate canonicalId inside ${language}`);
    }
    seen.add(question.canonicalId);
    canonicalIds.add(question.canonicalId);

    if (!TRACKS.includes(question.track as (typeof TRACKS)[number])) {
      error(`${label}: unknown track ${String(question.track)}`);
    }
    if (typeof question.prompt !== "string" || question.prompt.trim().length < 8) {
      error(`${label}: prompt is missing or too short`);
    }
    if (typeof question.translation !== "string" || question.translation.trim().length < 5) {
      error(`${label}: translation is missing`);
    }
    if (language === "ja" && (typeof question.romanization !== "string" || question.romanization.trim().length === 0)) {
      error(`${label}: Japanese questions need a romanization`);
    }
    if (!isStringArray(question.competencies, 1)) {
      error(`${label}: needs at least one competency`);
    }
    if (!isStringArray(question.keywords, 3)) {
      error(`${label}: needs at least three keywords`);
    }
    if (!isStringArray(question.followUps, 2)) {
      error(`${label}: needs at least two follow-up questions`);
    }
    if (!isStringArray(question.skeleton, 3)) {
      error(`${label}: needs at least three skeleton steps`);
    }
    if (!isStringArray(question.rubricPoints, 3)) {
      error(`${label}: needs at least three rubric points`);
    }
    if (!isStringArray(question.redFlags, 3)) {
      error(`${label}: needs at least three red flags`);
    }
    if (
      !Array.isArray(question.keyPhrases) ||
      question.keyPhrases.length < 1 ||
      !question.keyPhrases.every(
        (phrase) =>
          typeof phrase === "object" &&
          phrase !== null &&
          typeof (phrase as { target?: unknown }).target === "string" &&
          typeof (phrase as { note?: unknown }).note === "string",
      )
    ) {
      error(`${label}: needs at least one key phrase with target and note`);
    }
    if (typeof question.modelAnswer !== "string" || question.modelAnswer.trim().length < 40) {
      error(`${label}: model answer is missing or too short`);
    }
    if (typeof question.culturalNote !== "string" || question.culturalNote.trim().length < 10) {
      error(`${label}: cultural note is missing`);
    }

    const length = question.expectedLengthSec;
    if (
      !Array.isArray(length) ||
      length.length !== 2 ||
      typeof length[0] !== "number" ||
      typeof length[1] !== "number" ||
      length[0] < 20 ||
      length[1] <= length[0] ||
      length[1] > 300
    ) {
      error(`${label}: expectedLengthSec must be [min,max] within 20..300`);
    }
    if (typeof question.timeLimitSec !== "number" || question.timeLimitSec < 30) {
      error(`${label}: timeLimitSec must be at least 30`);
    }

    const serialized = JSON.stringify(question);
    if (/lorem ipsum|TODO|TBD|placeholder/i.test(serialized)) {
      error(`${label}: placeholder text found`);
    }
    if (language !== "ja" && /[\u3040-\u30ff\u4e00-\u9faf]/.test(serialized)) {
      warn(`${label}: contains Japanese characters in a non-Japanese bank`);
    }
  }
}

const manifest = JSON.parse(readFileSync(path.join(ROOT, "manifest.json"), "utf8")) as {
  languages?: Record<string, { count?: number }>;
};
for (const language of LANGUAGES) {
  if (!manifest.languages?.[language]) {
    error(`manifest: missing language ${language}`);
  }
}

console.log(`Visa Kerja content check`);
console.log(`  languages: ${LANGUAGES.join(", ")}`);
console.log(`  questions: ${total}`);
console.log(`  canonical ids: ${canonicalIds.size}`);
console.log(`  errors: ${errors.length}`);
console.log(`  warnings: ${warnings.length}`);

for (const warning of warnings) console.warn(`  ! ${warning}`);
for (const message of errors) console.error(`  ✗ ${message}`);

if (errors.length > 0) {
  process.exit(1);
}
console.log("  ✓ content is structurally valid");
