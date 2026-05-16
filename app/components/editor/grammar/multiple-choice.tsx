"use client";

import { useState } from "react";
import type { GrammarExercise } from "./types";

interface MultipleChoiceProps {
  exercise: GrammarExercise;
  onAnswer: (correct: boolean) => void;
}

export function MultipleChoice({ exercise, onAnswer }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSelect = (option: string) => {
    if (showResult) return;
    setSelected(option);
    setShowResult(true);
    const correct = option === exercise.correctAnswer;
    setIsCorrect(correct);
    setTimeout(() => onAnswer(correct), 800);
  };

  return (
    <div className="space-y-4">
      {exercise.context && (
        <div className="rounded-xl bg-[#252525] border border-[#333] px-4 py-3">
          <p className="text-sm text-white/80 italic leading-relaxed">
            {exercise.context}
          </p>
        </div>
      )}

      <p className="text-sm text-white/90 font-medium">{exercise.question}</p>

      <div className="grid gap-2">
        {(exercise.options ?? []).map((option) => {
          const picked = selected === option;
          const isAnswer = option === exercise.correctAnswer;
          let classes =
            "w-full text-left rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ";

          if (!showResult) {
            classes +=
              "bg-[#1e1e1e] border-[#2a2a2a] text-white/70 hover:bg-[#2a2a2a] hover:border-[#444] hover:text-white active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-lime/50";
          } else if (isAnswer) {
            classes +=
              "bg-green-600/15 border-green-500/50 text-green-400 scale-[1.01]";
          } else if (picked && !isAnswer) {
            classes +=
              "bg-red-600/15 border-red-500/40 text-red-400";
          } else {
            classes +=
              "bg-[#1a1a1a] border-[#252525] text-white/20";
          }

          return (
            <button
              key={option}
              className={classes}
              onClick={() => handleSelect(option)}
              disabled={showResult}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {showResult && isAnswer && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-xs font-bold shrink-0">
                    ✓
                  </span>
                )}
                {showResult && picked && !isAnswer && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold shrink-0">
                    ✗
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className="animate-fade-in-up rounded-xl bg-[#252525] border border-[#333] p-4">
          <p
            className={`text-sm font-medium mb-1 ${
              isCorrect ? "text-green-400" : "text-red-400"
            }`}
          >
            {isCorrect ? "✓ Correct!" : "✗ Not quite"}
          </p>
          <p className="text-sm text-white/50 leading-relaxed">
            {exercise.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
