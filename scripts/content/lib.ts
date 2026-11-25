import { createHash } from "node:crypto";
import { Prisma, PrismaClient } from "../../app/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export interface ContentChoice {
  id: string;
  label: string;
}

export interface ContentQuestion {
  id: string;
  position: number;
  type: "multiple_choice" | "fill_blank";
  skill: string;
  prompt: string;
  choices?: ContentChoice[];
  answerKey: { choiceId?: string; accepted?: string[] };
  explanations: Record<string, string>;
  conceptKey: string;
  difficulty?: number;
  tags?: string[];
  source?: string;
  license?: string;
}

export interface ContentLesson {
  id: string;
  position: number;
  slug: string;
  title: string;
  objective: string;
  skill: string;
  estimatedMinutes: number;
  materials: Record<string, { blocks: unknown[] }>;
  passages: unknown[];
  questions: ContentQuestion[];
}

export interface ContentUnitFile {
  schemaVersion: string;
  contentVersion: string;
  curriculum: {
    id: string;
    languageCode: string;
    framework: string;
    variant: string;
    status: string;
  };
  level: {
    code: string;
    position: number;
    title: string;
    description: string;
    canDo: string[];
    estimatedHours: number;
  };
  unit: {
    id: string;
    position: number;
    title: string;
    goal: string;
    checkpointQuestionCount: number;
  };
  lesson: ContentLesson;
}

export function createPrismaClient(): PrismaClient {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL missing");
  const url = new URL(raw);
  url.searchParams.delete("schema");
  const adapter = new PrismaPg(url.toString(), {
    schema: process.env.DB_SCHEMA || "lango",
  });
  return new PrismaClient({ adapter });
}

export function normalizeText(value: string): string {
  return value.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
}

export function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => `${JSON.stringify(key)}:${stableJson(child)}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function fingerprint(question: ContentQuestion, level: string): string {
  return sha256(
    [
      normalizeText(question.prompt),
      stableJson(question.answerKey),
      level.toUpperCase(),
    ].join("\u0000"),
  );
}

export function answerKeyHash(question: ContentQuestion): string {
  return sha256(stableJson(question.answerKey));
}

export const PLACEHOLDER_RE =
  /\b(this is an example of|example sentence demonstrating|fundamental principle of|lorem ipsum|TODO|TBD|sample sentence)\b/i;

export function validateContentFile(file: ContentUnitFile): string[] {
  const errors: string[] = [];
  const lesson = file.lesson;

  if (!lesson.id.startsWith(`${file.unit.id}-`)) {
    errors.push(`${lesson.id}: lesson id harus diawali ${file.unit.id}-`);
  }
  if (lesson.questions.length !== 35) {
    errors.push(`${lesson.id}: butuh 35 soal, ditemukan ${lesson.questions.length}`);
  }

  const ids = new Set<string>();
  const fingerprints = new Set<string>();
  for (const [index, question] of lesson.questions.entries()) {
    const expectedPosition = index + 1;
    if (question.position !== expectedPosition) {
      errors.push(`${question.id}: position ${question.position} != ${expectedPosition}`);
    }
    if (ids.has(question.id)) errors.push(`${question.id}: id duplikat`);
    ids.add(question.id);
    if (!question.id.startsWith(`${lesson.id}-`)) {
      errors.push(`${question.id}: id soal harus diawali ${lesson.id}-`);
    }
    if (!question.prompt.trim()) errors.push(`${question.id}: prompt kosong`);
    if (PLACEHOLDER_RE.test(question.prompt)) {
      errors.push(`${question.id}: prompt mengandung placeholder`);
    }

    const explanationId = question.explanations?.id?.trim();
    const explanationEn = question.explanations?.en?.trim();
    if (!explanationId) errors.push(`${question.id}: explanation id kosong`);
    if (!explanationEn) errors.push(`${question.id}: explanation en kosong`);
    if (explanationId && PLACEHOLDER_RE.test(explanationId)) {
      errors.push(`${question.id}: explanation id mengandung placeholder`);
    }
    if (explanationEn && PLACEHOLDER_RE.test(explanationEn)) {
      errors.push(`${question.id}: explanation en mengandung placeholder`);
    }

    if (question.type === "multiple_choice") {
      const choices = question.choices ?? [];
      if (choices.length < 3 || choices.length > 4) {
        errors.push(`${question.id}: MCQ butuh 3–4 pilihan`);
      }
      const labels = new Set<string>();
      for (const choice of choices) {
        if (!choice.label.trim()) errors.push(`${question.id}: label pilihan kosong`);
        if (labels.has(choice.label)) errors.push(`${question.id}: pilihan duplikat`);
        labels.add(choice.label);
      }
      if (!question.answerKey.choiceId) {
        errors.push(`${question.id}: answerKey.choiceId wajib`);
      } else if (!choices.some((choice) => choice.id === question.answerKey.choiceId)) {
        errors.push(`${question.id}: answerKey tidak ada di pilihan`);
      }
    } else if (!question.answerKey.accepted?.length) {
      errors.push(`${question.id}: answerKey.accepted wajib untuk isian`);
    }

    const fp = fingerprint(question, file.level.code);
    if (fingerprints.has(fp)) errors.push(`${question.id}: fingerprint duplikat`);
    fingerprints.add(fp);
  }

  return errors;
}

export function contentJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}
