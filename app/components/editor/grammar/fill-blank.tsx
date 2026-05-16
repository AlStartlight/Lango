"use client";

import { useState, useRef } from "react";
import type { GrammarExercise } from "./types";

interface FillBlankProps {
  exercise: GrammarExercise;
  onAnswer: (correct: boolean) => void;
}

function normalizeAnswer(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[.!?,;:'"“”‘’\-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+$/, "");
}

function isAnswerCorrect(
  input: string,
  exercise: GrammarExercise,
): boolean {
  const normalized = normalizeAnswer(input);
  const allAnswers = [
    exercise.correctAnswer,
    ...(exercise.answerVariants ?? []),
  ];

  if (typeof exercise.correctAnswer === "string") {
    return allAnswers.some(
      (a) => normalizeAnswer(String(a)) === normalized,
    );
  }

  if (Array.isArray(exercise.correctAnswer)) {
    return exercise.correctAnswer.some(
      (a) => normalizeAnswer(String(a)) === normalized,
    );
  }

  return false;
}

export function FillBlank({ exercise, onAnswer }: FillBlankProps) {
  const [input, setInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (showResult || !input.trim()) return;
    const isCorrect = isAnswerCorrect(input, exercise);
    setCorrect(isCorrect);
    setShowResult(true);
    setTimeout(() => onAnswer(isCorrect), 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/90 font-medium">{exercise.question}</p>

      {exercise.context && (
        <div className="rounded-xl bg-[#252525] border border-[#333] p-4">
          <p className="text-sm text-white/80 leading-relaxed">
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
            placeholder="Type your answer..."
            className={`w-full rounded-xl border bg-[#1e1e1e] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 ${
              showResult
                ? correct
                  ? "border-green-500/50 bg-green-600/10"
                  : "border-red-500/40 bg-red-600/10"
                : "border-[#2a2a2a] focus:border-lime/50 focus:ring-2 focus:ring-lime/20"
            }`}
            autoFocus
          />
        </div>
        {!showResult && (
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="shrink-0 px-5 py-3 rounded-xl bg-lime text-[#171717] font-semibold text-sm hover:bg-lime-dark disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97] transition-all duration-150"
          >
            Check
          </button>
        )}
      </div>

      {exercise.hint && !showResult && (
        <div className="flex items-start gap-2">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            {showHint ? "Hide hint" : "Show hint"}
          </button>
          {showHint && (
            <p className="text-xs text-yellow-400/70 italic animate-fade-in-up">
              {exercise.hint}
            </p>
          )}
        </div>
      )}

      {showResult && (
        <div className="animate-fade-in-up rounded-xl bg-[#252525] border border-[#333] p-4 space-y-2">
          <p
            className={`text-sm font-medium ${
              correct ? "text-green-400" : "text-red-400"
            }`}
          >
            {correct
              ? "✓ Correct!"
              : `✗ Not quite. The answer was: ${exercise.correctAnswer}`}
          </p>
          <p className="text-sm text-white/50 leading-relaxed">
            {exercise.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
