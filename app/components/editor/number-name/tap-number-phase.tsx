"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { getNumberWord, getSpeechLang } from "./number-data";
import { useSpeech } from "@/lib/use-speech";
import type { LanguageCode } from "./types";

interface TapNumberPhaseProps {
  numbers: number[];
  lang: LanguageCode;
  onCorrect: (xp: number, bonus: number) => void;
  onMiss: () => void;
  onComplete: () => void;
}

const GRID_SIZE = 9;
const TIME_LIMIT = 5;
const LIGHTNING_THRESHOLD = 2;
const ROUNDS = 6;

function pickGridNumbers(answer: number, pool: number[], count: number): number[] {
  const others = pool.filter((n) => n !== answer);
  const shuffled = [...others].sort(() => Math.random() - 0.5);
  const grid = [answer, ...shuffled.slice(0, count - 1)];
  return grid.sort(() => Math.random() - 0.5);
}

export function TapNumberPhase({
  numbers,
  lang,
  onCorrect,
  onMiss,
  onComplete,
}: TapNumberPhaseProps) {
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const speak = useSpeech();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didStart = useRef(false);
  const onMissRef = useRef(onMiss);
  onMissRef.current = onMiss;

  const totalRounds = Math.min(ROUNDS, numbers.length);
  const [questions] = useState(() =>
    [...numbers].sort(() => Math.random() - 0.5).slice(0, totalRounds)
  );

  const currentAnswer = questions[round];
  const grid = currentAnswer !== undefined
    ? pickGridNumbers(currentAnswer, numbers, Math.min(GRID_SIZE, numbers.length))
    : [];

  const playAudio = useCallback(() => {
    if (currentAnswer === undefined) return;
    const word = getNumberWord(currentAnswer, lang);
    const speechLang = getSpeechLang(lang);
    speak(word, speechLang);
  }, [currentAnswer, lang, speak]);

  useEffect(() => {
    if (currentAnswer === undefined) return;
    if (!didStart.current) {
      didStart.current = true;
      setStartTime(Date.now());
      playAudio();
    }
  }, [currentAnswer, playAudio]);

  useEffect(() => {
    if (showResult) return;
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 0.1;
        if (next <= 0) {
          return 0;
        }
        return next;
      });
    }, 100);
    timerRef.current = intervalId;
    return () => {
      clearInterval(intervalId);
      timerRef.current = null;
    };
  }, [round, showResult]);

  useEffect(() => {
    if (timeLeft > 0 || showResult) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSelected(null);
    setIsCorrect(false);
    setShowResult(true);
    onMissRef.current();
  }, [timeLeft, showResult]);

  const handleTap = useCallback(
    (value: number) => {
      if (showResult || currentAnswer === undefined) return;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setSelected(value);

      const correct = value === currentAnswer;
      setIsCorrect(correct);

      if (correct) {
        const elapsed = (Date.now() - startTime) / 1000;
        const lightning = elapsed <= LIGHTNING_THRESHOLD;
        onCorrect(10, lightning ? 5 : 0);
      } else {
        onMiss();
      }
      setShowResult(true);
    },
    [showResult, currentAnswer, startTime, onCorrect, onMiss]
  );

  const handleNext = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const nextRound = round + 1;
    if (nextRound >= totalRounds) {
      onComplete();
    } else {
      setRound(nextRound);
      setSelected(null);
      setShowResult(false);
      setIsCorrect(false);
      setTimeLeft(TIME_LIMIT);
      setStartTime(Date.now());
      const nextQ = questions[nextRound];
      if (nextQ !== undefined) {
        const word = getNumberWord(nextQ, lang);
        speak(word, getSpeechLang(lang));
      }
    }
  };

  const timerPct = (timeLeft / TIME_LIMIT) * 100;
  const timerColor = timerPct > 40 ? "#d2ff5e" : timerPct > 15 ? "#f59e0b" : "#ef4444";

  if (currentAnswer === undefined) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-white/60">Not enough numbers for this level.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-3 w-full max-w-xs">
        <div className="w-full h-2 rounded-full bg-[#252525] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
          />
        </div>
        <span
          className="text-xs font-mono tabular-nums"
          style={{ color: timerColor }}
        >
          {timeLeft.toFixed(1)}s
        </span>

        <button
          onClick={playAudio}
          disabled={showResult}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-b from-[#2a2a2a] to-[#222] border border-[#d2ff5e]/30 hover:border-[#d2ff5e]/60 hover:shadow-[0_0_24px_-8px_#d2ff5e] transition-all active:scale-95"
        >
          <svg className="w-7 h-7 text-[#d2ff5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        </button>
        <span className="text-[11px] text-white/30">Round {round + 1} of {totalRounds}</span>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        {grid.map((value) => {
          const picked = selected === value;
          const answer = value === currentAnswer;
          let classes =
            "relative rounded-2xl border-2 px-4 py-6 text-2xl font-bold transition-all duration-200 ";

          if (!showResult) {
            classes +=
              "bg-[#252525] border-[#333] text-white hover:bg-[#2e2e2e] hover:border-[#555] active:scale-[0.95] cursor-pointer";
          } else if (answer) {
            classes +=
              "bg-green-600/20 border-green-500 text-green-400 scale-[1.02]";
          } else if (picked && !answer) {
            classes += "bg-red-600/20 border-red-500/60 text-red-400";
          } else {
            classes += "bg-[#1e1e1e] border-[#2a2a2a] text-white/20";
          }

          return (
            <button
              key={value}
              className={classes}
              onClick={() => handleTap(value)}
              disabled={showResult}
            >
              {showResult && answer && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-xs">
                  ✓
                </span>
              )}
              {value}
            </button>
          );
        })}
      </div>

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
                ⚡ Correct! +10 XP
                {timeLeft >= TIME_LIMIT - LIGHTNING_THRESHOLD && (
                  <span className="text-yellow-400 text-xs">+5 Lightning</span>
                )}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Miss! It was <span className="font-bold">{currentAnswer}</span>
              </span>
            )}
          </div>
          <button
            onClick={handleNext}
            className="px-8 py-2.5 rounded-xl bg-[#d2ff5e] text-[#171717] font-semibold text-sm hover:bg-[#c4f040] active:scale-[0.97] transition-all duration-150 shadow-lg shadow-[#d2ff5e]/20"
          >
            {round + 1 >= totalRounds ? "Complete Phase" : "Next Round"}
          </button>
        </div>
      )}
    </div>
  );
}
