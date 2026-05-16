"use client";

import { useState, useCallback } from "react";
import { getNumberWord } from "./number-data";
import type { LanguageCode, SpellQuestion } from "./types";

interface SpellPhaseProps {
  numbers: number[];
  lang: LanguageCode;
  onCorrect: (xp: number, noHint: boolean) => void;
  onComplete: () => void;
}

const ROUNDS = 5;

function scrambleWord(word: string): string[] {
  const letters = word.replace(/\s/g, "").split("");
  const shuffled = [...letters];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  if (shuffled.join("") === letters.join("")) {
    return scrambleWord(word);
  }
  return shuffled;
}

function generateQuestions(numbers: number[], lang: LanguageCode): SpellQuestion[] {
  const pool = [...numbers].sort(() => Math.random() - 0.5).slice(0, ROUNDS);
  return pool.map((num) => {
    const word = getNumberWord(num, lang);
    return {
      number: num,
      word,
      scrambledLetters: scrambleWord(word),
      hintUsed: false,
    };
  });
}

export function SpellPhase({
  numbers,
  lang,
  onCorrect,
  onComplete,
}: SpellPhaseProps) {
  const [questions] = useState(() => generateQuestions(numbers, lang));
  const [round, setRound] = useState(0);
  const [placedLetters, setPlacedLetters] = useState<(string | null)[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [hintUsed, setHintUsed] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [started, setStarted] = useState(false);

  const current = questions[round];
  const word = current?.word ?? "";
  const normalizedWord = word.replace(/\s/g, "");
  const wordLength = normalizedWord.length;

  const initRound = useCallback(() => {
    const q = questions[round];
    if (!q) return;
    const scrambled = [...q.scrambledLetters];
    setPlacedLetters(Array(wordLength).fill(null));
    setAvailableLetters(scrambled);
    setHintUsed(false);
    setShowResult(false);
    setIsCorrect(false);
    setStarted(true);
  }, [round, questions, wordLength]);

  if (!started && current) {
    initRound();
  }

  const handlePlace = (letter: string, availIdx: number) => {
    if (showResult) return;
    const firstEmpty = placedLetters.findIndex((l) => l === null);
    if (firstEmpty === -1) return;

    const newPlaced = [...placedLetters];
    newPlaced[firstEmpty] = letter;
    setPlacedLetters(newPlaced);

    const newAvail = [...availableLetters];
    newAvail.splice(availIdx, 1);
    setAvailableLetters(newAvail);
  };

  const handleRemove = (idx: number) => {
    if (showResult) return;
    const letter = placedLetters[idx];
    if (letter === null) return;

    const newPlaced = [...placedLetters];
    newPlaced[idx] = null;
    setPlacedLetters(newPlaced);
    setAvailableLetters([...availableLetters, letter]);
  };

  const handleHint = () => {
    if (hintUsed || showResult) return;
    const firstEmpty = placedLetters.findIndex((l) => l === null);
    if (firstEmpty === -1) return;

    const hintLetter = normalizedWord[firstEmpty];
    if (!hintLetter) return;

    const availIdx = availableLetters.indexOf(hintLetter);
    if (availIdx === -1) return;

    handlePlace(hintLetter, availIdx);
    setHintUsed(true);
  };

  const handleSubmit = () => {
    if (showResult) return;
    const answer = placedLetters.join("");
    const correct = answer === normalizedWord;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      onCorrect(hintUsed ? 10 : 20, !hintUsed);
    }
  };

  const handleNext = () => {
    const nextRound = round + 1;
    if (nextRound >= ROUNDS) {
      onComplete();
    } else {
      setRound(nextRound);
      setStarted(false);
    }
  };

  if (!current) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-white/60">Not enough numbers for this level.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <span className="text-6xl font-bold text-white select-none">
          {current.number}
        </span>
        <span className="text-xs text-white/30">
          {round + 1} of {ROUNDS}
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-2 min-h-[48px]">
        {placedLetters.map((letter, i) => (
          <button
            key={i}
            onClick={() => handleRemove(i)}
            className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center text-lg font-bold transition-all duration-200 ${
              showResult
                ? letter === normalizedWord[i]
                  ? "bg-green-600/20 border-green-500 text-green-400"
                  : "bg-red-600/20 border-red-500/60 text-red-400"
                : letter
                  ? "bg-[#2a2a2a] border-[#444] text-white hover:bg-[#333] active:scale-95 cursor-pointer"
                  : "bg-[#1e1e1e] border-dashed border-[#333] text-white/10"
            }`}
            disabled={showResult}
          >
            {letter ?? ""}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2 min-h-[44px]">
        {availableLetters.map((letter, i) => (
          <button
            key={`${letter}-${i}`}
            onClick={() => handlePlace(letter, i)}
            disabled={showResult}
            className="w-10 h-10 rounded-xl bg-[#d2ff5e]/10 border border-[#d2ff5e]/30 text-[#d2ff5e] text-lg font-semibold hover:bg-[#d2ff5e]/20 active:scale-95 transition-all duration-150 disabled:opacity-30 disabled:cursor-default"
          >
            {letter}
          </button>
        ))}
      </div>

      {!showResult && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={placedLetters.every((l) => l === null)}
            className="px-6 py-2 rounded-xl bg-[#d2ff5e] text-[#171717] font-semibold text-sm hover:bg-[#c4f040] disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97] transition-all duration-150 shadow-lg shadow-[#d2ff5e]/20"
          >
            Check Answer
          </button>
          <button
            onClick={handleHint}
            disabled={hintUsed}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
              hintUsed
                ? "bg-[#252525] text-white/20 cursor-not-allowed"
                : "bg-[#252525] border border-[#444] text-yellow-400 hover:border-yellow-400/50 active:scale-95"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            {hintUsed ? "Hint Used" : "Hint (-5 XP)"}
          </button>
        </div>
      )}

      {showResult && (
        <div className="flex flex-col items-center gap-3 animate-fade-in-up">
          <div
            className={`px-5 py-2 rounded-full text-sm font-medium ${
              isCorrect
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {isCorrect ? (
              <span className="flex items-center gap-2">
                ✍️ Correct! +{hintUsed ? "10" : "20"} XP
              </span>
            ) : (
              <span className="flex items-center gap-2">
                The answer was <span className="font-bold">{current.word}</span>
              </span>
            )}
          </div>
          <button
            onClick={handleNext}
            className="px-8 py-2.5 rounded-xl bg-[#d2ff5e] text-[#171717] font-semibold text-sm hover:bg-[#c4f040] active:scale-[0.97] transition-all duration-150 shadow-lg shadow-[#d2ff5e]/20"
          >
            {round + 1 >= ROUNDS ? "Complete Phase" : "Next Word"}
          </button>
        </div>
      )}
    </div>
  );
}
