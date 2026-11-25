"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { ExerciseFeedback } from "./exercise-feedback";
import type { GrammarExercise } from "./types";

interface OrderingProps {
  exercise: GrammarExercise;
  onAnswer: (correct: boolean, answer: string) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function normalizeOrderAnswer(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[.!?]/g, "")
    .replace(/\s+/g, " ");
}

export function SentenceOrdering({ exercise, onAnswer }: OrderingProps) {
  const { t } = useTranslation();
  const answerKey = Array.isArray(exercise.correctAnswer)
    ? exercise.correctAnswer[0] ?? ""
    : exercise.correctAnswer;

  const words = answerKey.split(" ").filter(Boolean);

  const [shuffled, setShuffled] = useState<string[]>(() => shuffleArray(words));
  const [arranged, setArranged] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const moveToArranged = (index: number) => {
    if (showResult) return;
    const word = shuffled[index];
    if (!word) return;
    setShuffled((prev) => prev.filter((_, i) => i !== index));
    setArranged((prev) => [...prev, word]);
  };

  const moveToShuffled = (index: number) => {
    if (showResult) return;
    const word = arranged[index];
    if (!word) return;
    setArranged((prev) => prev.filter((_, i) => i !== index));
    setShuffled((prev) => [...prev, word]);
  };

  const handleSubmit = () => {
    const userAnswer = arranged.join(" ");
    const correct =
      normalizeOrderAnswer(userAnswer) === normalizeOrderAnswer(answerKey);
    setIsCorrect(correct);
    setShowResult(true);
  };

  const handleReset = () => {
    setShuffled(shuffleArray(words));
    setArranged([]);
    setShowResult(false);
  };

  const handleContinue = () => {
    onAnswer(isCorrect, arranged.join(" "));
  };

  if (shuffled.length === 0 && arranged.length === 0) return null;

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-exp-on-surface">{exercise.question}</p>

      {exercise.hint && !showResult && (
        <p className="text-xs italic text-exp-secondary">{exercise.hint}</p>
      )}

      <div className="flex min-h-[60px] flex-wrap gap-2 rounded-xl border-2 border-dashed border-exp-outline-variant bg-exp-surface-low p-3">
        {arranged.length === 0 && (
          <p className="w-full py-3 text-center text-xs text-exp-on-surface-muted">
            {t("learning.grammar.arrangedArea")}
          </p>
        )}
        {arranged.map((word, i) => (
          <button
            key={`arr-${word}-${i}`}
            type="button"
            onClick={() => moveToShuffled(i)}
            className="exp-btn exp-btn-soft min-h-9 px-3 py-1.5 text-xs"
          >
            {word}
            <ArrowLeft className="h-3 w-3 text-exp-on-surface-muted" aria-hidden="true" />
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {shuffled.map((word, i) => (
          <button
            key={`shuf-${word}-${i}`}
            type="button"
            onClick={() => moveToArranged(i)}
            className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-exp-container-high bg-exp-surface-lowest px-3 py-1.5 text-sm text-exp-on-surface-variant transition-colors hover:border-exp-outline-variant hover:bg-exp-container hover:text-exp-on-surface active:scale-[0.97]"
          >
            {word}
            <ArrowRight className="h-3 w-3 text-exp-on-surface-muted" aria-hidden="true" />
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {!showResult && arranged.length > 0 && (
          <>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-exp-container-high bg-exp-surface-low px-4 py-2 text-xs text-exp-on-surface-variant transition-colors hover:bg-exp-container-high hover:text-exp-on-surface"
            >
              <RefreshCw className="h-3 w-3" aria-hidden="true" />
              {t("learning.common.reset")}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={arranged.length !== words.length}
              className="exp-btn exp-btn-primary disabled:cursor-not-allowed"
            >
              {t("learning.grammar.checkAnswer")}
            </button>
          </>
        )}
      </div>

      {showResult && (
        <ExerciseFeedback
          correct={isCorrect}
          explanation={exercise.explanation}
          userAnswer={arranged.join(" ")}
          correctAnswer={answerKey}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}
