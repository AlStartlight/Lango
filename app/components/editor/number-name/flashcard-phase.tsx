"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getNumberWord, getSpeechLang } from "./number-data";
import { useSpeech, useSpeechGender } from "@/lib/use-speech";
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
  const { t } = useTranslation();
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const didComplete = useRef(false);
  const { speak } = useSpeech();
  const [voiceGender] = useSpeechGender(lang);

  const handleFlip = useCallback(
    (num: number) => {
      const word = getNumberWord(num, lang);
      const speechLang = getSpeechLang(lang);
      speak(word, speechLang, { gender: voiceGender });
      setFlipped((prev) => {
        const next = new Set(prev);
        next.add(num);
        return next;
      });
    },
    [lang, speak, voiceGender],
  );

  useEffect(() => {
    if (flipped.size === numbers.length && !didComplete.current) {
      didComplete.current = true;
      onComplete(numbers.length * 5);
    }
  }, [flipped, numbers.length, onComplete]);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {numbers.map((num) => {
        const isFlipped = flipped.has(num);
        const word = getNumberWord(num, lang);
        return (
          <button
            key={num}
            type="button"
            onClick={() => !isFlipped && handleFlip(num)}
            disabled={isFlipped}
            aria-pressed={isFlipped}
            aria-label={isFlipped ? `${num}: ${word}` : String(num)}
            className="group h-36 w-full cursor-pointer outline-none [perspective:600px] disabled:cursor-default"
          >
            <div
              className={`relative h-full w-full transition-transform duration-500 ease-out [transform-style:preserve-3d] ${
                isFlipped ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-exp-container-high bg-exp-surface-lowest shadow-[0_4px_0_var(--exp-container-highest)] transition-all duration-200 [backface-visibility:hidden] group-hover:-translate-y-0.5 group-hover:border-exp-outline-variant group-focus-visible:ring-2 group-focus-visible:ring-exp-primary/50">
                <span className="select-none text-5xl font-extrabold text-exp-on-surface">
                  {num}
                </span>
                <span className="mt-2 text-xs font-bold uppercase tracking-wide text-exp-on-surface-muted">
                  {t("learning.number.tapToReveal")}
                </span>
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-2xl bg-exp-primary-container shadow-[0_4px_0_var(--exp-primary)] [transform:rotateY(180deg)] [backface-visibility:hidden]">
                <span className="text-3xl font-extrabold text-exp-on-primary-container">
                  {num}
                </span>
                <span
                  lang={getSpeechLang(lang)}
                  className="text-base font-bold text-exp-on-primary-container"
                >
                  {word}
                </span>
                <span className="mt-1 text-[11px] font-semibold text-exp-on-primary-container">
                  {t("learning.number.tapToHearAgain")}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
