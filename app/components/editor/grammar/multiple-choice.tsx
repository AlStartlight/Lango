"use client";

import { useState } from "react";
import { ExerciseFeedback } from "./exercise-feedback";
import type { GrammarExercise } from "./types";

interface MultipleChoiceProps {
  exercise: GrammarExercise;
  onAnswer: (correct: boolean, answer: string) => void;
}

function answerText(value: string | string[]): string {
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export function MultipleChoice({ exercise, onAnswer }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const correctAnswer = answerText(exercise.correctAnswer);
  const isCorrect = selected === correctAnswer;

  const handleSelect = (option: string) => {
    if (showResult) return;
    setSelected(option);
    setShowResult(true);
  };

  const handleContinue = () => {
    if (!selected) return;
    onAnswer(isCorrect, selected);
  };

  return (
    <div className="space-y-4">
      {exercise.context && (
        <div className="rounded-xl border border-exp-container-high bg-exp-surface-low px-4 py-3">
          <p className="text-sm italic leading-relaxed text-exp-on-surface-variant">
            {exercise.context}
          </p>
        </div>
      )}

      <p className="text-sm font-medium text-exp-on-surface">{exercise.question}</p>

      <div className="grid gap-2" role="group" aria-label={exercise.question}>
        {(exercise.options ?? []).map((option, index) => {
          const picked = selected === option;
          const isAnswer = option === correctAnswer;
          let classes =
            "exp-answer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-primary/60";

          if (showResult) {
            if (isAnswer) classes += " exp-answer-correct";
            else if (picked) classes += " exp-answer-wrong";
            else classes += " exp-answer-muted";
          }

          return (
            <button
              key={option}
              type="button"
              className={classes}
              onClick={() => handleSelect(option)}
              disabled={showResult}
              aria-pressed={picked}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-exp-container text-xs font-extrabold text-exp-on-surface-variant"
                  aria-hidden="true"
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="min-w-0 text-left">{option}</span>
              </span>
              {showResult && isAnswer && (
                <span className="shrink-0 text-sm font-bold text-exp-success" aria-hidden="true">
                  ✓
                </span>
              )}
              {showResult && picked && !isAnswer && (
                <span className="shrink-0 text-sm font-bold text-exp-error" aria-hidden="true">
                  ✗
                </span>
              )}
            </button>
          );
        })}
      </div>

      {showResult && (
        <ExerciseFeedback
          correct={isCorrect}
          explanation={exercise.explanation}
          userAnswer={selected ?? undefined}
          correctAnswer={correctAnswer}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}
