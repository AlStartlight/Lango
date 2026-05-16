"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { getNumberWord, getSpeechLang } from "./number-data";
import Say from "react-say";
import type { LanguageCode } from "./types";

interface FlashcardPhaseProps {
  numbers: number[];
  lang: LanguageCode;
  onComplete: (xp: number) => void;
}

export function FlashcardPhase({
  numbers,
  lang,
  onComplete,
}: FlashcardPhaseProps) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [speakKey, setSpeakKey] = useState(0);
  const [speakWord, setSpeakWord] = useState("");
  const didComplete = useRef(false);

  const handleFlip = useCallback(
    (num: number) => {
      const word = getNumberWord(num, lang);
      setSpeakWord(word);
      setSpeakKey((k) => k + 1);

      setFlipped((prev) => {
        const next = new Set(prev);
        next.add(num);
        return next;
      });
    },
    [lang]
  );

  useEffect(() => {
    if (flipped.size === numbers.length && !didComplete.current) {
      didComplete.current = true;
      onComplete(numbers.length * 5);
    }
  }, [flipped, numbers.length, onComplete]);

  return (
    <>
      <Say key={speakKey} speak={speakWord} lang={getSpeechLang(lang)} rate={0.9}
        ponyfill={{ speechSynthesis: window.speechSynthesis, SpeechSynthesisUtterance: window.SpeechSynthesisUtterance }} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {numbers.map((num) => {
          const isFlipped = flipped.has(num);
          const word = getNumberWord(num, lang);
          return (
            <button
              key={num}
              onClick={() => !isFlipped && handleFlip(num)}
              disabled={isFlipped}
              className="group [perspective:600px] h-36 w-full outline-none cursor-pointer disabled:cursor-default"
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 ease-out [transform-style:preserve-3d] ${
                  isFlipped ? "[transform:rotateY(180deg)]" : ""
                }`}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-[#252525] to-[#1e1e1e] border border-[#333] [backface-visibility:hidden] group-hover:border-[#444] group-focus-visible:ring-2 group-focus-visible:ring-[#d2ff5e]/50 transition-colors duration-200">
                  <span className="text-5xl font-bold text-white select-none drop-shadow-sm">
                    {num}
                  </span>
                  <span className="text-[10px] text-white/20 mt-2">Tap to reveal</span>
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-[#d2ff5e] to-[#b8e84a] [transform:rotateY(180deg)] [backface-visibility:hidden] gap-1 shadow-lg shadow-[#d2ff5e]/20">
                  <span className="text-3xl font-bold text-[#171717]">{num}</span>
                  <span className="text-base font-semibold text-[#171717]/80">{word}</span>
                  <span className="text-[10px] text-[#171717]/50 mt-1">Tap to hear again</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
