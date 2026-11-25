"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { getNumberWord } from "./number-data";
import type { LanguageCode, SpellQuestion } from "./types";
import { recordNumberAttempt } from "@/lib/learning/number-attempts";

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
  const { t } = useTranslation();
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
    recordNumberAttempt({
      languageCode: lang,
      value: current.number,
      phase: "spell",
      answer,
    });

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
        <p className="text-exp-on-surface-variant">{t("learning.number.notEnoughNumbers")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <span className="text-6xl font-bold text-exp-on-surface select-none">
          {current.number}
        </span>
        <span className="text-xs text-exp-on-surface-muted">
          {t("learning.number.questionOf", { current: round + 1, total: ROUNDS })}
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
                  ? "bg-exp-primary-container/20 border-exp-success text-exp-success"
                  : "bg-exp-error/20 border-exp-error/60 text-exp-error"
                : letter
                  ? "bg-exp-surface-low border-exp-outline-variant text-exp-on-surface hover:bg-exp-container-high active:scale-95 cursor-pointer"
                  : "bg-exp-surface-lowest border-dashed border-exp-container-high text-exp-on-surface-muted"
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
            className="w-10 h-10 rounded-xl bg-exp-primary-container/10 border border-exp-primary-container/30 text-exp-primary text-lg font-semibold hover:bg-exp-primary-container/20 active:scale-95 transition-all duration-150 disabled:opacity-30 disabled:cursor-default"
          >
            {letter}
          </button>
        ))}
      </div>

      {!showResult && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={placedLetters.every((l) => l === null)}
            className="exp-btn exp-btn-primary disabled:opacity-50"
          >
            {t("learning.common.check")}
          </button>
          <button
            type="button"
            onClick={handleHint}
            disabled={hintUsed}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
              hintUsed
                ? "bg-exp-surface-low text-exp-on-surface-muted cursor-not-allowed"
                : "bg-exp-surface-low border border-exp-outline-variant text-exp-secondary hover:border-yellow-400/50 active:scale-95"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            {hintUsed ? t("learning.number.hintUsed") : t("learning.number.hint")}
          </button>
        </div>
      )}

      {showResult && (
        <div className="flex flex-col items-center gap-3 animate-fade-in-up">
          <div
            className={`px-5 py-2 rounded-full text-sm font-medium ${
              isCorrect
                ? "bg-exp-primary-container/10 text-exp-success border border-exp-success/20"
                : "bg-exp-error/10 text-exp-error border border-exp-error/20"
            }`}
          >
            {isCorrect ? (
              <span className="flex items-center gap-2">
                {t("learning.number.correctXp", { xp: hintUsed ? 10 : 20 })}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {t("learning.number.answerWas", { answer: current.word })}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="exp-btn exp-btn-primary"
          >
            {round + 1 >= ROUNDS
              ? t("learning.number.completePhase")
              : t("learning.number.nextWord")}
          </button>
        </div>
      )}
    </div>
  );
}
