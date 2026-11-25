"use client";

import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ExerciseFeedback } from "./exercise-feedback";
import type { GrammarExercise } from "./types";

interface CorrectionProps {
  exercise: GrammarExercise;
  onAnswer: (correct: boolean, answer: string) => void;
}

function normalizeCorrection(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[.!?]$/, "")
    .replace(/\s+/g, " ");
}

function isCorrectionCorrect(input: string, exercise: GrammarExercise): boolean {
  const normalized = normalizeCorrection(input);
  const allAnswers = [
    exercise.correctAnswer,
    ...(exercise.answerVariants ?? []),
  ].map((a) => normalizeCorrection(String(a)));

  return allAnswers.includes(normalized);
}

function answerText(value: string | string[]): string {
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export function Correction({ exercise, onAnswer }: CorrectionProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState(exercise.context ?? "");
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const correctAnswer = answerText(exercise.correctAnswer);

  const handleSubmit = () => {
    if (showResult || !input.trim()) return;
    setCorrect(isCorrectionCorrect(input, exercise));
    setShowResult(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleContinue = () => {
    onAnswer(correct, input);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-exp-on-surface">{exercise.question}</p>

      {exercise.hint && !showResult && (
        <div className="flex flex-wrap items-start gap-2">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="min-h-11 text-xs text-exp-on-surface-muted underline-offset-4 hover:text-exp-on-surface-variant hover:underline"
          >
            {showHint
              ? t("learning.grammar.hideHint")
              : t("learning.grammar.showHint")}
          </button>
          {showHint && (
            <p className="text-xs italic text-exp-secondary animate-fade-in-up">
              {exercise.hint}
            </p>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div className="rounded-xl border border-exp-error/20 bg-exp-error/10 px-4 py-3">
          <p className="mb-1 text-xs font-medium text-exp-error/80">
            {t("learning.grammar.sentenceWithError")}:
          </p>
          <p className="text-sm text-exp-error/90 line-through">
            {exercise.context}
          </p>
        </div>

        <div>
          <label
            htmlFor="grammar-correction-input"
            className="mb-1.5 block text-xs font-medium text-exp-on-surface-variant"
          >
            {t("learning.grammar.writeCorrection")}
          </label>
          <textarea
            id="grammar-correction-input"
            ref={textareaRef}
            value={input}
            onChange={(e) => !showResult && setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={showResult}
            rows={2}
            className={`w-full resize-none rounded-xl border bg-exp-surface-lowest px-4 py-3 text-sm text-exp-on-surface placeholder:text-exp-on-surface-muted outline-none transition-colors duration-200 ${
              showResult
                ? correct
                  ? "border-exp-success/60 bg-exp-primary-container/10"
                  : "border-exp-error/50 bg-exp-error/10"
                : "border-exp-container-high focus:border-exp-primary-container/60 focus:ring-2 focus:ring-exp-primary/20"
            }`}
            autoFocus
          />
        </div>

        {!showResult && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="exp-btn exp-btn-primary disabled:cursor-not-allowed"
          >
            {t("learning.grammar.checkAnswer")}
          </button>
        )}
      </div>

      {showResult && (
        <ExerciseFeedback
          correct={correct}
          explanation={exercise.explanation}
          userAnswer={input}
          correctAnswer={correctAnswer}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}
