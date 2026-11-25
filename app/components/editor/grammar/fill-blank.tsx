"use client";

import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ExerciseFeedback } from "./exercise-feedback";
import type { GrammarExercise } from "./types";

interface FillBlankProps {
  exercise: GrammarExercise;
  onAnswer: (correct: boolean, answer: string) => void;
}

function normalizeAnswer(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[.!?,;:'"“”‘’\-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+$/, "");
}

function isAnswerCorrect(input: string, exercise: GrammarExercise): boolean {
  const normalized = normalizeAnswer(input);
  const allAnswers = [
    exercise.correctAnswer,
    ...(exercise.answerVariants ?? []),
  ];

  if (typeof exercise.correctAnswer === "string") {
    return allAnswers.some((a) => normalizeAnswer(String(a)) === normalized);
  }

  if (Array.isArray(exercise.correctAnswer)) {
    return exercise.correctAnswer.some(
      (a) => normalizeAnswer(String(a)) === normalized,
    );
  }

  return false;
}

function answerText(value: string | string[]): string {
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export function FillBlank({ exercise, onAnswer }: FillBlankProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const correctAnswer = answerText(exercise.correctAnswer);

  const handleSubmit = () => {
    if (showResult || !input.trim()) return;
    setCorrect(isAnswerCorrect(input, exercise));
    setShowResult(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const handleContinue = () => {
    onAnswer(correct, input);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-exp-on-surface">{exercise.question}</p>

      {exercise.context && (
        <div className="rounded-xl border border-exp-container-high bg-exp-surface-low p-4">
          <p className="text-sm leading-relaxed text-exp-on-surface-variant">
            {exercise.context}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => !showResult && setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={showResult}
            placeholder={t("learning.grammar.typeAnswer")}
            aria-label={t("learning.grammar.typeAnswer")}
            className={`min-h-11 w-full rounded-xl border bg-exp-surface-lowest px-4 py-3 text-sm text-exp-on-surface placeholder:text-exp-on-surface-muted outline-none transition-colors duration-200 ${
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
            className="exp-btn exp-btn-primary shrink-0 disabled:cursor-not-allowed"
          >
            {t("learning.common.check")}
          </button>
        )}
      </div>

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
