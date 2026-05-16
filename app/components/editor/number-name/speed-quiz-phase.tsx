"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { getNumberWord, getSpeechLang, generateOptions } from "./number-data";
import { useSpeech } from "@/lib/use-speech";
import type { LanguageCode, SpeedQuizType, SpeedQuizQuestion } from "./types";

interface SpeedQuizPhaseProps {
  numbers: number[];
  lang: LanguageCode;
  onCorrect: (xp: number, fast: boolean) => void;
  onIncorrect: () => void;
  onComplete: (perfect: boolean) => void;
}

const QUESTION_COUNT = 10;
const TIME_LIMIT = 4;
const FAST_THRESHOLD = 2;

function generateQuiz(numbers: number[], lang: LanguageCode): SpeedQuizQuestion[] {
  const pool = numbers.length >= QUESTION_COUNT
    ? [...numbers].sort(() => Math.random() - 0.5).slice(0, QUESTION_COUNT)
    : numbers;
  const types: SpeedQuizType[] = ["listen", "see", "type"];

  return pool.map((num) => {
    const type = types[Math.floor(Math.random() * types.length)]!;
    const word = getNumberWord(num, lang);
    return {
      number: num,
      word,
      answer: num,
      options: generateOptions(num, numbers, 4),
      type,
    };
  });
}

export function SpeedQuizPhase({
  numbers,
  lang,
  onCorrect,
  onIncorrect,
  onComplete,
}: SpeedQuizPhaseProps) {
  const [questions] = useState(() => generateQuiz(numbers, lang));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [startTime, setStartTime] = useState(0);
  const [score, setScore] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const speak = useSpeech();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const onIncorrectRef = useRef(onIncorrect);
  onIncorrectRef.current = onIncorrect;

  const current = questions[currentIdx];
  const canProceed = currentIdx < questions.length;

  const playCurrentAudio = useCallback(() => {
    if (!current) return;
    speak(getNumberWord(current.number, lang), getSpeechLang(lang));
  }, [current, lang, speak]);

  useEffect(() => {
    if (!canProceed || !hasStarted) return;
    setStartTime(Date.now());
    setTimeLeft(TIME_LIMIT);
    if (current?.type === "listen") {
      setTimeout(playCurrentAudio, 300);
    }
    if (current?.type === "type" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIdx, hasStarted, canProceed, current, playCurrentAudio]);

  useEffect(() => {
    if (!hasStarted || showResult) return;
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
  }, [currentIdx, hasStarted, showResult]);

  useEffect(() => {
    if (timeLeft > 0 || showResult || !hasStarted) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSelected(null);
    setIsCorrect(false);
    setShowResult(true);
    onIncorrectRef.current();
  }, [timeLeft, showResult, hasStarted]);

  const handleSelect = (value: number) => {
    if (showResult) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSelected(value);

    const correct = value === current?.answer;
    setIsCorrect(correct);

    if (correct) {
      const elapsed = (Date.now() - startTime) / 1000;
      onCorrect(10, elapsed <= FAST_THRESHOLD);
      setScore((s) => s + 1);
    } else {
      onIncorrect();
    }
    setShowResult(true);
  };

  const handleTypeSubmit = () => {
    if (showResult || !current) return;
    if (!typedAnswer.trim()) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const parsed = parseInt(typedAnswer.trim(), 10);
    const correct = parsed === current.answer;
    setIsCorrect(correct);

    if (correct) {
      const elapsed = (Date.now() - startTime) / 1000;
      onCorrect(15, elapsed <= FAST_THRESHOLD);
      setScore((s) => s + 1);
    } else {
      onIncorrect();
    }
    setShowResult(true);
  };

  const handleNext = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const nextIdx = currentIdx + 1;
    if (nextIdx >= questions.length) {
      onComplete(score + (isCorrect ? 1 : 0) >= questions.length);
      return;
    }
    setCurrentIdx(nextIdx);
    setSelected(null);
    setTypedAnswer("");
    setShowResult(false);
    setIsCorrect(false);
  };

  if (!hasStarted) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 h-[60vh]">
        <div className="text-center">
          <p className="text-lg font-semibold text-white/90">Speed Quiz</p>
          <p className="text-sm text-white/40 mt-1">
            {QUESTION_COUNT} questions, {TIME_LIMIT}s each. Answer fast for bonus XP!
          </p>
        </div>
        <button
          onClick={() => setHasStarted(true)}
          className="px-8 py-3 rounded-xl bg-[#d2ff5e] text-[#171717] font-semibold text-base hover:bg-[#c4f040] active:scale-[0.97] transition-all duration-150 shadow-lg shadow-[#d2ff5e]/20"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-white/60">No questions available.</p>
      </div>
    );
  }

  const timerPct = (timeLeft / TIME_LIMIT) * 100;
  const timerColor = timerPct > 40 ? "#d2ff5e" : timerPct > 15 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center justify-between w-full max-w-sm">
        <span className="text-xs text-white/40">
          Question {currentIdx + 1}/{questions.length}
        </span>
        <span className="text-xs font-semibold tabular-nums" style={{ color: timerColor }}>
          Score: {score}
        </span>
      </div>

      <div className="w-full max-w-sm h-1.5 rounded-full bg-[#252525] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-100 ease-linear"
          style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
        />
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] text-white/20 uppercase tracking-widest">
          {current.type === "listen" ? "Listen & Pick" : current.type === "see" ? "Read & Pick" : "Type the Number"}
        </span>
        {current.type === "listen" && (
          <button
            onClick={playCurrentAudio}
            disabled={showResult}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-b from-[#2a2a2a] to-[#222] border border-[#d2ff5e]/30 hover:border-[#d2ff5e]/60 hover:shadow-[0_0_20px_-6px_#d2ff5e] transition-all active:scale-95"
          >
            <svg className="w-6 h-6 text-[#d2ff5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          </button>
        )}
        {current.type === "see" && (
          <span className="text-5xl font-bold text-white">{current.number}</span>
        )}
        {current.type === "type" && (
          <div className="text-center">
            <p className="text-xl font-semibold text-white/60 mb-3">&quot;{current.word}&quot;</p>
            <input
              ref={inputRef}
              type="number"
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTypeSubmit();
              }}
              disabled={showResult}
              placeholder="Type the number..."
              className="w-40 text-center px-4 py-3 rounded-xl bg-[#252525] border border-[#444] text-white text-xl font-bold placeholder:text-white/15 focus:outline-none focus:border-[#d2ff5e]/50 focus:ring-2 focus:ring-[#d2ff5e]/20 transition-all duration-150"
            />
          </div>
        )}
      </div>

      {(current.type === "listen" || current.type === "see") && (
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {current.options.map((value) => {
            const picked = selected === value;
            const answer = value === current.answer;
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
                {current.type === "listen" ? value : getNumberWord(value, lang)}
              </button>
            );
          })}
        </div>
      )}

      {current.type === "type" && !showResult && (
        <button
          onClick={handleTypeSubmit}
          className="px-6 py-2 rounded-xl bg-[#d2ff5e] text-[#171717] font-semibold text-sm hover:bg-[#c4f040] active:scale-[0.97] transition-all duration-150"
        >
          Submit
        </button>
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
                {timeLeft >= TIME_LIMIT - FAST_THRESHOLD ? "⚡ Fast! +15 XP" : "✅ Correct! +10 XP"}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Answer: <span className="font-bold">{current.answer}</span>
              </span>
            )}
          </div>
          <button
            onClick={handleNext}
            className="px-8 py-2.5 rounded-xl bg-[#d2ff5e] text-[#171717] font-semibold text-sm hover:bg-[#c4f040] active:scale-[0.97] transition-all duration-150 shadow-lg shadow-[#d2ff5e]/20"
          >
            {currentIdx + 1 >= questions.length ? "See Results" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
