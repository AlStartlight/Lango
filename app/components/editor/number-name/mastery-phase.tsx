"use client";

import { useState, useCallback, useRef } from "react";
import { getNumberWord, getSpeechLang, generateOptions } from "./number-data";
import { useSpeech } from "@/lib/use-speech";
import type { LanguageCode, MasteryResult, SpeedQuizType } from "./types";

interface MasteryPhaseProps {
  numbers: number[];
  lang: LanguageCode;
  onCorrect: (xp: number) => void;
  onIncorrect: () => void;
  onComplete: (result: MasteryResult) => void;
}

const QUESTION_COUNT = 20;
const PASS_THRESHOLD = 75;

interface MasteryQuestion {
  answer: number;
  word: string;
  options: number[];
  type: SpeedQuizType;
}

function generateMasteryTest(numbers: number[]): MasteryQuestion[] {
  const pool = numbers.length >= 10
    ? [...numbers].sort(() => Math.random() - 0.5)
    : [...numbers, ...numbers].sort(() => Math.random() - 0.5);
  const questions: MasteryQuestion[] = [];
  const types: SpeedQuizType[] = ["listen", "see", "type"];

  for (let i = 0; i < QUESTION_COUNT; i++) {
    const answer = pool[i % pool.length]!;
    const word = getNumberWord(answer, "en");
    const type = types[i % types.length]!;
    questions.push({
      answer,
      word,
      options: generateOptions(answer, pool.slice(0, 12), 4),
      type,
    });
  }
  return questions;
}

export function MasteryPhase({
  numbers,
  lang,
  onCorrect,
  onIncorrect,
  onComplete,
}: MasteryPhaseProps) {
  const [questions] = useState(() => generateMasteryTest(numbers));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [testResult, setTestResult] = useState<MasteryResult | null>(null);
  const speak = useSpeech();
  const inputRef = useRef<HTMLInputElement>(null);

  const current = questions[currentIdx];

  const playAudio = useCallback(() => {
    if (!current) return;
    speak(getNumberWord(current.answer, lang), getSpeechLang(lang));
  }, [current, lang, speak]);

  const handleSelect = (value: number) => {
    if (showResult || finished) return;
    setSelected(value);

    const correct = value === current?.answer;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      onCorrect(10);
    } else {
      onIncorrect();
    }
    setShowResult(true);
  };

  const handleTypeSubmit = () => {
    if (showResult || finished || !current) return;
    if (!typedAnswer.trim()) return;

    const parsed = parseInt(typedAnswer.trim(), 10);
    const correct = parsed === current.answer;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      onCorrect(10);
    } else {
      onIncorrect();
    }
    setShowResult(true);
  };

  const handleNext = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= QUESTION_COUNT) {
      const percentage = Math.round((score / QUESTION_COUNT) * 100);
      const passed = percentage >= PASS_THRESHOLD;
      const result: MasteryResult = {
        score,
        total: QUESTION_COUNT,
        percentage,
        passed,
        breakdown: [
          { correct: score, total: QUESTION_COUNT, phase: "mastery" },
        ],
      };
      setTestResult(result);
      setFinished(true);
      onComplete(result);
    } else {
      setCurrentIdx(nextIdx);
      setSelected(null);
      setTypedAnswer("");
      setShowResult(false);
      setIsCorrect(false);
      setTimeout(() => {
        const next = questions[nextIdx];
        if (next?.type === "type" && inputRef.current) {
          inputRef.current.focus();
        } else if (next?.type === "listen") {
          const word = getNumberWord(next.answer, lang);
          speak(word, getSpeechLang(lang));
        }
      }, 100);
    }
  };

  if (!hasStarted) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 h-[60vh]">
        <div className="text-center">
          <p className="text-lg font-semibold text-white/90">Mastery Test</p>
          <p className="text-sm text-white/40 mt-1">
            {QUESTION_COUNT} questions across all phases. Score ≥{PASS_THRESHOLD}% to pass.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 text-xs text-white/30">
          <span>🟢 Questions are not timed — take your time</span>
          <span>🌟 Pass to unlock the next level</span>
        </div>
        <button
          onClick={() => setHasStarted(true)}
          className="px-8 py-3 rounded-xl bg-[#d2ff5e] text-[#171717] font-semibold text-base hover:bg-[#c4f040] active:scale-[0.97] transition-all duration-150 shadow-lg shadow-[#d2ff5e]/20"
        >
          Start Mastery Test
        </button>
      </div>
    );
  }

  if (finished && testResult) {
    const passed = testResult.passed;
    return (
      <div className="flex flex-col items-center justify-center gap-5 h-[60vh] animate-fade-in-up">
        <div className="text-6xl">{passed ? "🎓" : "📚"}</div>
        <div className="text-center">
          <h3 className={`text-xl font-bold ${passed ? "text-[#d2ff5e]" : "text-orange-400"}`}>
            {passed ? "Congratulations!" : "Keep Practicing"}
          </h3>
          <p className="text-white/40 mt-1">
            {passed
              ? "You've earned the Number Master badge!"
              : "You need more practice. Try again!"}
          </p>
        </div>

        <div className="flex gap-8">
          <div className="flex flex-col items-center">
            <span className={`text-3xl font-bold ${passed ? "text-[#d2ff5e]" : "text-orange-400"}`}>
              {testResult.score}/{testResult.total}
            </span>
            <span className="text-xs text-white/40">Score</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`text-3xl font-bold ${passed ? "text-green-400" : "text-red-400"}`}>
              {testResult.percentage}%
            </span>
            <span className="text-xs text-white/40">
              {passed ? "Passed!" : `Need ≥${PASS_THRESHOLD}%`}
            </span>
          </div>
        </div>

        <div className="w-full max-w-xs h-4 rounded-full bg-[#252525] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              passed ? "bg-[#d2ff5e]" : "bg-orange-400"
            }`}
            style={{ width: `${testResult.percentage}%` }}
          />
        </div>

        {passed && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#d2ff5e]/10 border border-[#d2ff5e]/30">
            <span className="text-sm">🌟</span>
            <span className="text-sm font-medium text-[#d2ff5e]">Number Master Badge Earned!</span>
          </div>
        )}

        {!passed && (
          <button
            onClick={() => {
              setHasStarted(true);
              setFinished(false);
              setCurrentIdx(0);
              setSelected(null);
              setTypedAnswer("");
              setShowResult(false);
              setIsCorrect(false);
              setScore(0);
              setTestResult(null);
            }}
            className="px-8 py-2.5 rounded-xl bg-[#d2ff5e] text-[#171717] font-semibold text-sm hover:bg-[#c4f040] active:scale-[0.97] transition-all duration-150 shadow-lg shadow-[#d2ff5e]/20"
          >
            Retry Test
          </button>
        )}
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

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center justify-between w-full max-w-sm">
        <span className="text-xs text-white/40">
          Question {currentIdx + 1}/{QUESTION_COUNT}
        </span>
        <span className="text-xs font-semibold tabular-nums text-[#d2ff5e]">
          Score: {score}/{currentIdx + (showResult ? 1 : 0)}
        </span>
      </div>

      <div className="w-full max-w-sm h-1.5 rounded-full bg-[#252525] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#d2ff5e]/40 transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / QUESTION_COUNT) * 100}%` }}
        />
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] text-white/20 uppercase tracking-widest">
          {current.type === "listen" ? "Listen & Pick" : current.type === "see" ? "Read & Pick" : "Type the Number"}
        </span>
        {current.type === "listen" && (
          <button
            onClick={playAudio}
            disabled={showResult}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-b from-[#2a2a2a] to-[#222] border border-[#d2ff5e]/30 hover:border-[#d2ff5e]/60 hover:shadow-[0_0_20px_-6px_#d2ff5e] transition-all active:scale-95"
          >
            <svg className="w-6 h-6 text-[#d2ff5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          </button>
        )}
        {current.type === "see" && (
          <span className="text-5xl font-bold text-white">{current.answer}</span>
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
              <span className="flex items-center gap-2">✅ Correct! +10 XP</span>
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
            {currentIdx + 1 >= QUESTION_COUNT ? "See Results" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
