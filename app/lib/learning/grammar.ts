import type { GrammarExercise, GrammarLesson } from "@/components/editor/grammar/types";
import { getAllLessons, getLessonById } from "@/components/editor/grammar/grammar-data";

interface CatalogEntry {
  lesson: GrammarLesson;
  exercise: GrammarExercise;
}

const exercises = new Map<string, CatalogEntry>();

for (const lesson of getAllLessons()) {
  for (const exercise of lesson.exercises) {
    exercises.set(exercise.id, { lesson, exercise });
  }
}

export function getExerciseCatalogEntry(
  exerciseId: string,
): CatalogEntry | undefined {
  return exercises.get(exerciseId);
}

export function getLessonCatalogEntry(
  lessonId: string,
): GrammarLesson | undefined {
  return getLessonById(lessonId);
}

export function lessonConceptKey(lesson: GrammarLesson): string {
  return `grammar.${lesson.category}.${lesson.id}`;
}

function normalize(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[.!?,;:'"“”‘’\-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+$/, "");
}

function normalizeOrder(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[.!?]/g, "")
    .replace(/\s+/g, " ");
}

function normalizedAnswers(exercise: GrammarExercise): string[] {
  const values = [
    ...(Array.isArray(exercise.correctAnswer)
      ? exercise.correctAnswer
      : [exercise.correctAnswer]),
    ...(exercise.answerVariants ?? []),
  ];
  return values.map((value) => String(value));
}

/**
 * Server-side answer validation. It mirrors the client exercise rules so a
 * learner cannot gain XP by sending an arbitrary boolean.
 */
export function validateGrammarAnswer(
  exercise: GrammarExercise,
  answer: string,
): boolean {
  const normalized = normalize(answer);
  if (!normalized) return false;

  if (exercise.type === "multiple_choice") {
    return normalizedAnswers(exercise).some(
      (value) => normalize(value) === normalized,
    );
  }

  if (exercise.type === "ordering") {
    const target = normalizedAnswers(exercise)[0] ?? "";
    return normalizeOrder(answer) === normalizeOrder(target);
  }

  return normalizedAnswers(exercise).some(
    (value) => normalize(value) === normalized,
  );
}

export function correctAnswerText(exercise: GrammarExercise): string {
  const value = Array.isArray(exercise.correctAnswer)
    ? exercise.correctAnswer[0]
    : exercise.correctAnswer;
  return String(value ?? "");
}
