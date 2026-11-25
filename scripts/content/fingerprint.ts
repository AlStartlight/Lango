import { createHash } from "node:crypto";
import type { UnitFile } from "./schema";

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function normalizeForFingerprint(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.!?,;:'"“”‘’\-—–]/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Stable dedupe key: language + level + normalized prompt + normalized answer.
 * Includes the question type to avoid collisions between a reading prompt and
 * a grammar prompt that happen to share text.
 */
export function questionFingerprint(
  file: Pick<UnitFile, "language" | "level">,
  question: {
    type: string;
    prompt: string;
    answerKey: Record<string, unknown>;
    choices?: Array<{ id: string; label: string }>;
    answerText?: string;
  },
): string {
  const choiceLabel =
    typeof question.answerKey.choiceId === "string"
      ? question.choices?.find(
          (choice) => choice.id === question.answerKey.choiceId,
        )?.label
      : undefined;
  const answer = JSON.stringify(question.answerKey, Object.keys(question.answerKey).sort());
  return sha256(
    [
      file.language,
      file.level,
      question.type,
      normalizeForFingerprint(question.prompt),
      normalizeForFingerprint(answer),
      normalizeForFingerprint(choiceLabel ?? "") ||
        normalizeForFingerprint(question.answerText ?? ""),
    ].join("|"),
  );
}

export function answerKeyHash(answerKey: Record<string, unknown>): string {
  return sha256(JSON.stringify(answerKey));
}
