"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import type { GrammarExercise } from "./types";

interface OrderingProps {
  exercise: GrammarExercise;
  onAnswer: (correct: boolean) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function SentenceOrdering({ exercise, onAnswer }: OrderingProps) {
  const answerKey = Array.isArray(exercise.correctAnswer)
    ? exercise.correctAnswer[0]
    : exercise.correctAnswer;

  const words = answerKey.split(" ").filter(Boolean);

  const [shuffled, setShuffled] = useState<string[]>([]);
  const [arranged, setArranged] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    setShuffled(shuffleArray(words));
    setArranged([]);
    setShowResult(false);
  }, [exercise.id]);

  const moveToArranged = useCallback(
    (index: number) => {
      if (showResult) return;
      setShuffled((prev) => {
        const word = prev[index];
        setArranged((a) => [...a, word]);
        return prev.filter((_, i) => i !== index);
      });
    },
    [showResult],
  );

  const moveToShuffled = useCallback(
    (index: number) => {
      if (showResult) return;
      setArranged((prev) => {
        const word = prev[index];
        setShuffled((s) => [...s, word]);
        return prev.filter((_, i) => i !== index);
      });
    },
    [showResult],
  );

  const handleSubmit = () => {
    const userAnswer = arranged.join(" ");
    const correct = normalizeOrderAnswer(userAnswer) === normalizeOrderAnswer(answerKey);
    setIsCorrect(correct);
    setShowResult(true);
    setTimeout(() => onAnswer(correct), 1000);
  };

  const handleReset = () => {
    setShuffled(shuffleArray(words));
    setArranged([]);
    setShowResult(false);
  };

  if (shuffled.length === 0 && arranged.length === 0) return null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/90 font-medium">{exercise.question}</p>

      {exercise.hint && !showResult && (
        <p className="text-xs text-yellow-400/70 italic">{exercise.hint}</p>
      )}

      {/* Arranged area (your sentence) */}
      <div className="min-h-[60px] rounded-xl bg-[#252525] border-2 border-dashed border-[#3a3a3a] p-3 flex flex-wrap gap-2">
        {arranged.length === 0 && (
          <p className="text-xs text-white/20 w-full text-center py-3">
            Tap words below to build your sentence
          </p>
        )}
        {arranged.map((word, i) => (
          <button
            key={`arr-${word}-${i}`}
            onClick={() => moveToShuffled(i)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-lime/15 border border-lime/30 text-sm font-medium text-white/80 hover:bg-lime/25 transition-colors"
          >
            {word}
            <ArrowLeft className="h-3 w-3 text-white/30" />
          </button>
        ))}
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2">
        {shuffled.map((word, i) => (
          <button
            key={`shuf-${word}-${i}`}
            onClick={() => moveToArranged(i)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1e1e1e] border border-[#333] text-sm text-white/60 hover:bg-[#2a2a2a] hover:text-white/80 hover:border-[#555] transition-all duration-150 active:scale-[0.95]"
          >
            {word}
            <ArrowRight className="h-3 w-3 text-white/20" />
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {!showResult && arranged.length > 0 && (
          <>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#252525] border border-[#333] text-xs text-white/50 hover:bg-[#2a2a2a] hover:text-white/70 transition-all"
            >
              <RefreshCw className="h-3 w-3" />
              Reset
            </button>
            <button
              onClick={handleSubmit}
              disabled={arranged.length !== words.length}
              className="px-5 py-2 rounded-xl bg-lime text-[#171717] font-semibold text-sm hover:bg-lime-dark disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97] transition-all duration-150"
            >
              Check Answer
            </button>
          </>
        )}
      </div>

      {showResult && (
        <div className="animate-fade-in-up rounded-xl bg-[#252525] border border-[#333] p-4 space-y-2">
          <p
            className={`text-sm font-medium ${
              isCorrect ? "text-green-400" : "text-red-400"
            }`}
          >
            {isCorrect ? "✓ Correct order!" : "✗ Incorrect order"}
          </p>
          {!isCorrect && (
            <p className="text-sm text-white/60">
              Correct sentence:{" "}
              <span className="text-white/90 font-medium">{answerKey}.</span>
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

function normalizeOrderAnswer(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[.!?]/g, "")
    .replace(/\s+/g, " ");
}
