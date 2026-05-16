"use client";

import { useState, useEffect } from "react";
import { getNumberWord, getSpeechLang, generateOptions } from "./number-data";
import Say from "react-say";
import type { LanguageCode } from "./types";

interface ListenPickPhaseProps {
  numbers: number[];
  lang: LanguageCode;
  onCorrect: (xp: number) => void;
  onIncorrect: () => void;
  onComplete: () => void;
}

export function ListenPickPhase({
  numbers,
  lang,
  onCorrect,
  onIncorrect,
  onComplete,
}: ListenPickPhaseProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [speakKey, setSpeakKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const questionCount = Math.min(5, numbers.length);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [questions] = useState(() =>
    [...numbers].sort(() => Math.random() - 0.5).slice(0, questionCount)
  );

  const currentQ = questions[currentIdx];
  const currentWord = currentQ !== undefined ? getNumberWord(currentQ, lang) : "";
  const currentLang = getSpeechLang(lang);

  const handlePlay = () => {
    setHasInteracted(true);
    setSpeakKey((k) => k + 1);
  };

  const handleSelect = (value: number) => {
    if (showResult) return;
    if (!hasInteracted) setHasInteracted(true);
    setSelected(value);
    setShowResult(true);

    const correct = value === currentQ;
    setIsCorrect(correct);

    if (correct) {
      onCorrect(10);
    } else {
      onIncorrect();
    }
  };

  const handleNext = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= questionCount) {
      onComplete();
    } else {
      setCurrentIdx(nextIdx);
      setSelected(null);
      setShowResult(false);
      setIsCorrect(false);
    }
  };

  if (!currentQ) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-white/60">No questions available for this level.</p>
      </div>
    );
  }

  const options = generateOptions(currentQ, numbers);

  return (
    <div className="flex flex-col items-center gap-8">
      {mounted && speakKey > 0 && (
        <Say key={speakKey + "-" + currentIdx} speak={currentWord} lang={currentLang} rate={0.9}
          ponyfill={{ speechSynthesis: window.speechSynthesis, SpeechSynthesisUtterance: window.SpeechSynthesisUtterance }} />
      )}

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handlePlay}
          className={`flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-b from-[#2a2a2a] to-[#222] border transition-all duration-300 active:scale-95 group cursor-pointer ${
            !hasInteracted
              ? "border-[#d2ff5e]/50 animate-pulse shadow-[0_0_20px_-6px_#d2ff5e]"
              : "border-[#3a3a3a] hover:border-[#d2ff5e]/50 hover:shadow-[0_0_24px_-8px_#d2ff5e]"
          }`}
          title="Listen"
        >
          <svg className="w-8 h-8 text-white/70 group-hover:text-[#d2ff5e] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        </button>
        {!hasInteracted && (
          <span className="text-[11px] text-[#d2ff5e]/60 animate-pulse">
            Tap to hear the number
          </span>
        )}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: questionCount }).map((_, i) => (
            <div
              key={i}
              className={`w-6 h-1 rounded-full transition-all duration-300 ${
                i < currentIdx
                  ? "bg-green-500"
                  : i === currentIdx
                    ? "bg-white/40 w-8"
                    : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {options.map((value) => {
          const picked = selected === value;
          const answer = value === currentQ;
          let classes =
            "relative rounded-2xl border-2 px-6 py-5 text-xl font-semibold transition-all duration-200 ";

          if (!showResult) {
            classes +=
              "bg-[#252525] border-[#333] text-white hover:bg-[#2e2e2e] hover:border-[#555] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#d2ff5e]/50";
          } else if (answer) {
            classes +=
              "bg-green-600/20 border-green-500 text-green-400 scale-[1.02]";
          } else if (picked && !answer) {
            classes +=
              "bg-red-600/20 border-red-500/60 text-red-400";
          } else {
            classes +=
              "bg-[#1e1e1e] border-[#2a2a2a] text-white/20";
          }

          return (
            <button
              key={value}
              className={classes}
              onClick={() => handleSelect(value)}
              disabled={showResult}
            >
              {showResult && answer && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-xs font-bold">
                  ✓
                </span>
              )}
              {showResult && picked && !answer && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
                  ✗
                </span>
              )}
              {value}
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className="flex flex-col items-center gap-4 animate-fade-in-up">
          <div className={`px-5 py-2 rounded-full text-sm font-medium ${
            isCorrect
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}>
            {isCorrect ? (
              <span className="flex items-center gap-2">🎉 Correct! +10 XP</span>
            ) : (
              <span className="flex items-center gap-2">
                Not quite — it was <span className="font-bold">{currentQ}</span>
              </span>
            )}
          </div>
          <button
            onClick={handleNext}
            className="px-8 py-2.5 rounded-xl bg-[#d2ff5e] text-[#171717] font-semibold text-sm hover:bg-[#c4f040] active:scale-[0.97] transition-all duration-150 shadow-lg shadow-[#d2ff5e]/20"
          >
            {currentIdx + 1 >= questionCount ? "Complete Phase" : "Next Question"}
          </button>
        </div>
      )}
    </div>
  );
}
