"use client";

import { useState, useRef } from "react";
import type { GrammarExercise } from "./types";

interface CorrectionProps {
  exercise: GrammarExercise;
  onAnswer: (correct: boolean) => void;
}

function normalizeCorrection(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[.!?]$/, "")
    .replace(/\s+/g, " ");
}

function isCorrectionCorrect(
  input: string,
  exercise: GrammarExercise,
): boolean {
  const normalized = normalizeCorrection(input);
  const allAnswers = [
    exercise.correctAnswer,
    ...(exercise.answerVariants ?? []),
  ].map((a) => normalizeCorrection(String(a)));

  return allAnswers.includes(normalized);
}

export function Correction({ exercise, onAnswer }: CorrectionProps) {
  const [input, setInput] = useState(exercise.context ?? "");
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (showResult || !input.trim()) return;
    const isCorrect = isCorrectionCorrect(input, exercise);
    setCorrect(isCorrect);
    setShowResult(true);
    setTimeout(() => onAnswer(isCorrect), 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/90 font-medium">{exercise.question}</p>

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

      <div className="space-y-3">
        <div className="rounded-xl bg-red-600/10 border border-red-500/20 px-4 py-3">
          <p className="text-xs text-red-400/60 font-medium mb-1">
            Sentence with error:
          </p>
          <p className="text-sm text-red-400/80 line-through">
            {exercise.context}
          </p>
        </div>

        <div>
          <label className="text-xs text-white/40 font-medium mb-1.5 block">
            Write the corrected sentence:
          </label>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => !showResult && setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={showResult}
            rows={2}
            className={`w-full rounded-xl border bg-[#1e1e1e] px-4 py-3 text-sm text-white placeholder-white/20 outline-none resize-none transition-all duration-200 ${
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
            className="px-5 py-2.5 rounded-xl bg-lime text-[#171717] font-semibold text-sm hover:bg-lime-dark disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97] transition-all duration-150"
          >
            Check Correction
          </button>
        )}
      </div>

      {showResult && (
        <div className="animate-fade-in-up rounded-xl bg-[#252525] border border-[#333] p-4 space-y-2">
          <p
            className={`text-sm font-medium ${
              correct ? "text-green-400" : "text-red-400"
            }`}
          >
            {correct
              ? "✓ Perfect correction!"
              : "✗ Not quite right"}
          </p>
          {!correct && (
            <p className="text-sm text-white/60">
              Correct version:{" "}
              <span className="text-white/90 font-medium">
                {exercise.correctAnswer}
              </span>
            </p>
          )}
          <p className="text-sm text-white/50 leading-relaxed">
            {exercise.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
