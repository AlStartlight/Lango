"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Volume2 } from "lucide-react";
import {
  getNumberWord,
  getSpeechLang,
  generateOptions,
} from "./number-data";
import { useSpeech, useSpeechGender } from "@/lib/use-speech";
import type { LanguageCode } from "./types";
import { recordNumberAttempt } from "@/lib/learning/number-attempts";

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
  const { t } = useTranslation();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const questionCount = Math.min(5, numbers.length);
  const [questions] = useState(() =>
    [...numbers].sort(() => Math.random() - 0.5).slice(0, questionCount),
  );
  const { speak } = useSpeech();
  const [voiceGender] = useSpeechGender(lang);

  const currentQ = questions[currentIdx];
  const currentWord =
    currentQ !== undefined ? getNumberWord(currentQ, lang) : "";
  const currentLang = getSpeechLang(lang);

  // Keep the options stable while the result panel is open. Re-generating
  // them on every render could hide the option the learner picked.
  const options = useMemo(
    () =>
      currentQ !== undefined ? generateOptions(currentQ, numbers) : [],
    [currentQ, numbers],
  );

  const handlePlay = () => {
    setHasInteracted(true);
    speak(currentWord, currentLang, { gender: voiceGender });
  };

  const handleSelect = (value: number) => {
    if (showResult) return;
    if (!hasInteracted) setHasInteracted(true);
    setSelected(value);
    setShowResult(true);

    const correct = value === currentQ;
    setIsCorrect(correct);
    recordNumberAttempt({
      languageCode: lang,
      value: currentQ,
      phase: "listen-pick",
      answer: value,
    });

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
      const nextQ = questions[nextIdx];
      const nextWord = nextQ !== undefined ? getNumberWord(nextQ, lang) : "";
      speak(nextWord, currentLang, { gender: voiceGender });
      setCurrentIdx(nextIdx);
      setSelected(null);
      setShowResult(false);
      setIsCorrect(false);
    }
  };

  if (currentQ === undefined) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-exp-on-surface-variant">
          {t("learning.number.notEnoughNumbers")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handlePlay}
          aria-label={t("learning.audio.play")}
          className="exp-tactile-node relative h-20 w-20"
        >
          <Volume2 className="h-8 w-8" aria-hidden="true" />
        </button>
        {!hasInteracted && (
          <span className="text-xs font-bold text-exp-primary">
            {t("learning.number.tapToHear")}
          </span>
        )}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: questionCount }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i < currentIdx
                  ? "w-6 bg-exp-primary-container"
                  : i === currentIdx
                    ? "w-8 bg-exp-primary-container"
                    : "w-6 bg-exp-surface-low"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid w-full max-w-sm grid-cols-2 gap-3">
        {options.map((value) => {
          const picked = selected === value;
          const answer = value === currentQ;
          let classes =
            "relative min-h-14 rounded-2xl border-2 px-6 py-5 text-xl font-extrabold shadow-[0_4px_0_var(--exp-container-highest)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-primary/60 ";

          if (!showResult) {
            classes +=
              "border-exp-container-high bg-exp-surface-lowest text-exp-on-surface hover:-translate-y-0.5 hover:border-exp-outline-variant hover:bg-exp-surface-low active:translate-y-0";
          } else if (answer) {
            classes +=
              "border-exp-success bg-exp-primary-container/15 text-exp-success shadow-[0_4px_0_rgba(21,128,61,0.3)]";
          } else if (picked && !answer) {
            classes +=
              "border-exp-error bg-exp-error/10 text-exp-error shadow-[0_4px_0_rgba(186,26,26,0.28)]";
          } else {
            classes +=
              "border-exp-container-high bg-exp-surface text-exp-on-surface-muted shadow-none";
          }

          return (
            <button
              key={value}
              type="button"
              className={classes}
              onClick={() => handleSelect(value)}
              disabled={showResult}
              aria-pressed={picked}
            >
              {showResult && answer && (
                <span
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-exp-primary-container text-xs font-bold text-exp-on-primary-container"
                  aria-hidden="true"
                >
                  ✓
                </span>
              )}
              {showResult && picked && !answer && (
                <span
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-exp-error text-xs font-bold text-exp-inverse-on-surface"
                  aria-hidden="true"
                >
                  ✗
                </span>
              )}
              {value}
            </button>
          );
        })}
      </div>

      {showResult && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-4 animate-fade-in-up"
        >
          <div
            className={`rounded-full border px-5 py-2 text-sm font-medium ${
              isCorrect
                ? "border-exp-success/20 bg-exp-primary-container/10 text-exp-success"
                : "border-exp-error/20 bg-exp-error/10 text-exp-error"
            }`}
          >
            {isCorrect ? (
              <span>{t("learning.number.correctXp", { xp: 10 })}</span>
            ) : (
              <span>
                {t("learning.number.notQuite", {
                  answer: `${currentQ} (${currentWord})`,
                })}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="exp-btn exp-btn-primary"
          >
            {currentIdx + 1 >= questionCount
              ? t("learning.number.completePhase")
              : t("learning.number.nextQuestion")}
          </button>
        </div>
      )}
    </div>
  );
}
