"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { getNumberWord, getSpeechLang, generateOptions } from "./number-data";
import { useSpeech } from "@/lib/use-speech";
import type { LanguageCode } from "./types";

interface SurvivalPhaseProps {
  numbers: number[];
  lang: LanguageCode;
  initialLives: number;
  onCorrect: (xp: number, streak: number) => void;
  onLoseLife: (remaining: number) => void;
  onGameOver: (score: number, maxStreak: number) => void;
}

const TIME_LIMIT = 6;

function pickRandomQuestion(numbers: number[]): { answer: number; options: number[] } {
  const answer = numbers[Math.floor(Math.random() * numbers.length)]!;
  return { answer, options: generateOptions(answer, numbers, 4) };
}

export function SurvivalPhase({
  numbers,
  lang,
  initialLives,
  onCorrect,
  onLoseLife,
  onGameOver,
}: SurvivalPhaseProps) {
  const [question, setQuestion] = useState(() => pickRandomQuestion(numbers));
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(initialLives);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [gameOver, setGameOver] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const speak = useSpeech();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onLoseLifeRef = useRef(onLoseLife);
  onLoseLifeRef.current = onLoseLife;
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  const playAudio = useCallback(() => {
    const word = getNumberWord(question.answer, lang);
    speak(word, getSpeechLang(lang));
  }, [question.answer, lang, speak]);

  useEffect(() => {
    if (!hasStarted || gameOver || showResult) return;
    playAudio();
  }, [question, hasStarted, gameOver, showResult, playAudio]);

  useEffect(() => {
    if (!hasStarted || gameOver || showResult) return;
    setTimeLeft(TIME_LIMIT);
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
  }, [question, hasStarted, gameOver, showResult]);

  useEffect(() => {
    if (timeLeft > 0 || showResult || gameOver || !hasStarted) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsCorrect(false);
    setShowResult(true);
    setStreak(0);
    setLives((prev) => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        return 0;
      }
      onLoseLifeRef.current(newLives);
      return newLives;
    });
  }, [timeLeft, showResult, gameOver, hasStarted]);

  useEffect(() => {
    if (lives > 0 || !hasStarted) return;
    if (!gameOver) {
      setGameOver(true);
      onGameOverRef.current(score, maxStreak);
    }
  }, [lives, hasStarted, gameOver, score, maxStreak]);

  const handleSelect = (value: number) => {
    if (showResult || gameOver) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSelected(value);

    const correct = value === question.answer;
    setIsCorrect(correct);

    if (correct) {
      const newScore = score + 1;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      setMaxStreak((prev) => Math.max(prev, newStreak));
      onCorrect(10 + Math.min(newStreak - 1, 10) * 2, newStreak);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setStreak(0);
      if (newLives <= 0) {
        setGameOver(true);
        onGameOver(score, maxStreak);
      } else {
        onLoseLife(newLives);
      }
    }
    setShowResult(true);
  };

  const handleNext = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (lives <= 0) {
      setGameOver(true);
      onGameOver(score, maxStreak);
      return;
    }
    setQuestion(pickRandomQuestion(numbers));
    setSelected(null);
    setShowResult(false);
    setIsCorrect(false);
  };

  const timerPct = (timeLeft / TIME_LIMIT) * 100;
  const timerColor = timerPct > 40 ? "#d2ff5e" : timerPct > 15 ? "#f59e0b" : "#ef4444";

  if (!hasStarted) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 h-[60vh]">
        <div className="text-center">
          <p className="text-lg font-semibold text-white/90">Survival Mode</p>
          <p className="text-sm text-white/40 mt-1">
            Answer as many as you can. You have {initialLives} lives. Good luck!
          </p>
        </div>
        <button
          onClick={() => setHasStarted(true)}
          className="px-8 py-3 rounded-xl bg-[#d2ff5e] text-[#171717] font-semibold text-base hover:bg-[#c4f040] active:scale-[0.97] transition-all duration-150 shadow-lg shadow-[#d2ff5e]/20"
        >
          Start Survival
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 h-[60vh] animate-fade-in-up">
        <div className="text-6xl">🏆</div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-white">Game Over</h3>
          <p className="text-white/40 mt-1">You survived with these stats:</p>
        </div>
        <div className="flex gap-8">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-[#d2ff5e]">{score}</span>
            <span className="text-xs text-white/40">Score</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-yellow-400">{maxStreak}</span>
            <span className="text-xs text-white/40">Best Streak</span>
          </div>
        </div>
        <button
          onClick={() => {
            setQuestion(pickRandomQuestion(numbers));
            setSelected(null);
            setShowResult(false);
            setIsCorrect(false);
            setScore(0);
            setStreak(0);
            setMaxStreak(0);
            setLives(initialLives);
            setGameOver(false);
            setTimeLeft(TIME_LIMIT);
          }}
          className="px-8 py-2.5 rounded-xl bg-[#d2ff5e] text-[#171717] font-semibold text-sm hover:bg-[#c4f040] active:scale-[0.97] transition-all duration-150 shadow-lg shadow-[#d2ff5e]/20"
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center justify-between w-full max-w-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tabular-nums text-[#d2ff5e]">{score}</span>
          <span className="text-xs text-white/30">pts</span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: initialLives }).map((_, i) => (
            <span
              key={i}
              className={`flex items-center justify-center w-5 h-5 rounded-full text-xs transition-all duration-300 ${
                i < lives
                  ? "text-red-400 bg-red-400/10"
                  : "text-[#333] bg-[#252525]"
              }`}
            >
              ♥
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-400/10 border border-orange-400/20">
          <span className="text-sm">🔥</span>
          <span className="text-orange-300 text-xs font-semibold tabular-nums">{streak}</span>
        </div>
      </div>

      <div className="w-full max-w-sm h-1.5 rounded-full bg-[#252525] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-100 ease-linear"
          style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
        />
      </div>

      <button
        onClick={playAudio}
        disabled={showResult}
        className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-b from-[#2a2a2a] to-[#222] border border-[#d2ff5e]/30 hover:border-[#d2ff5e]/60 hover:shadow-[0_0_24px_-8px_#d2ff5e] transition-all active:scale-95"
      >
        <svg className="w-7 h-7 text-[#d2ff5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        </svg>
      </button>

      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {question.options.map((value) => {
          const picked = selected === value;
          const answer = value === question.answer;
          let classes =
            "relative rounded-2xl border-2 px-4 py-4 text-lg font-semibold transition-all duration-200 ";

          if (!showResult) {
            classes +=
              "bg-[#252525] border-[#333] text-white hover:bg-[#2e2e2e] hover:border-[#555] active:scale-[0.95]";
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
              onClick={() => handleSelect(value)}
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
                ✅ +{10 + Math.min(streak, 10) * 2} XP
              </span>
            ) : (
              <span className="flex items-center gap-2">
                It was <span className="font-bold">{question.answer}</span>{" "}
                {lives > 0 ? `(${lives} lives left)` : "Game Over!"}
              </span>
            )}
          </div>
          {lives > 0 && (
            <button
              onClick={handleNext}
              className="px-8 py-2.5 rounded-xl bg-[#d2ff5e] text-[#171717] font-semibold text-sm hover:bg-[#c4f040] active:scale-[0.97] transition-all duration-150 shadow-lg shadow-[#d2ff5e]/20"
            >
              Continue
            </button>
          )}
        </div>
      )}
    </div>
  );
}
