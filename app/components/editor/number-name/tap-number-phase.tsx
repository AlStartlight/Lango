"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Volume2 } from "lucide-react";
import { getNumberWord, getSpeechLang } from "./number-data";
import { useSpeech, useSpeechGender } from "@/lib/use-speech";
import type { LanguageCode } from "./types";
import { recordNumberAttempt } from "@/lib/learning/number-attempts";

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
  const { t } = useTranslation();
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const { speak } = useSpeech();
  const [voiceGender] = useSpeechGender(lang);
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
    speak(word, speechLang, { gender: voiceGender });
  }, [currentAnswer, lang, speak, voiceGender]);

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
      recordNumberAttempt({
        languageCode: lang,
        value: currentAnswer,
        phase: "tap-number",
        answer: value,
      });

      if (correct) {
        const elapsed = (Date.now() - startTime) / 1000;
        const lightning = elapsed <= LIGHTNING_THRESHOLD;
        onCorrect(10, lightning ? 5 : 0);
      } else {
        onMiss();
      }
      setShowResult(true);
    },
    [showResult, currentAnswer, startTime, onCorrect, onMiss, lang]
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
        speak(word, getSpeechLang(lang), { gender: voiceGender });
      }
    }
  };

  const timerPct = (timeLeft / TIME_LIMIT) * 100;
  const timerColor = timerPct > 40 ? "var(--exp-primary-container)" : timerPct > 15 ? "var(--exp-secondary-container)" : "var(--exp-error)";

  if (currentAnswer === undefined) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-exp-on-surface-variant">{t("learning.number.notEnoughNumbers")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-3 w-full max-w-xs">
        <div className="w-full h-2 rounded-full bg-exp-surface-low overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
          />
        </div>
        <span
          className="text-xs font-mono tabular-nums"
          style={{ color: timerColor }}
        >
          {t("learning.number.timeLeft", { seconds: timeLeft.toFixed(1) })}
        </span>

        <button
          type="button"
          onClick={playAudio}
          disabled={showResult}
          aria-label={t("learning.audio.play")}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-exp-primary-container/30 bg-exp-surface-lowest transition-colors hover:border-exp-primary-container/60 active:scale-95 disabled:opacity-50"
        >
          <Volume2 className="h-7 w-7 text-exp-primary" aria-hidden="true" />
        </button>
        <span className="text-xs text-exp-on-surface-muted">{t("learning.number.roundOf", { current: round + 1, total: totalRounds })}</span>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        {grid.map((value) => {
          const picked = selected === value;
          const answer = value === currentAnswer;
          let classes =
            "relative rounded-2xl border-2 px-4 py-6 text-2xl font-bold transition-all duration-200 ";

          if (!showResult) {
            classes +=
              "bg-exp-surface-low border-exp-container-high text-exp-on-surface hover:bg-exp-container-high hover:border-exp-outline-variant active:scale-[0.95] cursor-pointer";
          } else if (answer) {
            classes +=
              "bg-exp-primary-container/20 border-exp-success text-exp-success scale-[1.02]";
          } else if (picked && !answer) {
            classes += "bg-exp-error/20 border-exp-error/60 text-exp-error";
          } else {
            classes += "bg-exp-surface-lowest border-exp-container-high text-exp-on-surface-muted";
          }

          return (
            <button
              key={value}
              type="button"
              className={classes}
              onClick={() => handleTap(value)}
              disabled={showResult}
              aria-pressed={picked}
            >
              {showResult && answer && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-exp-primary-container text-exp-on-surface text-xs">
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
                ? "bg-exp-primary-container/10 text-exp-success border border-exp-success/20"
                : "bg-exp-error/10 text-exp-error border border-exp-error/20"
            }`}
          >
            {isCorrect ? (
              <span className="flex items-center gap-2">
                {t("learning.number.correctXp", { xp: 10 })}
                {timeLeft >= TIME_LIMIT - LIGHTNING_THRESHOLD && (
                  <span className="text-xs text-exp-secondary">
                    {t("learning.number.lightningBonus")}
                  </span>
                )}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {t("learning.number.notQuite", { answer: currentAnswer })}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="exp-btn exp-btn-primary"
          >
            {round + 1 >= totalRounds
              ? t("learning.number.completePhase")
              : t("learning.number.nextRound")}
          </button>
        </div>
      )}
    </div>
  );
}
