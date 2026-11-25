"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Timer, Volume2 } from "lucide-react";
import { getNumberWord, getSpeechLang, generateOptions } from "./number-data";
import { useSpeech, useSpeechGender } from "@/lib/use-speech";
import type { LanguageCode, SpeedQuizType, SpeedQuizQuestion } from "./types";
import { recordNumberAttempt } from "@/lib/learning/number-attempts";

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
  const { t } = useTranslation();
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
  const { speak } = useSpeech();
  const [voiceGender] = useSpeechGender(lang);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const onIncorrectRef = useRef(onIncorrect);
  onIncorrectRef.current = onIncorrect;

  const current = questions[currentIdx];
  const canProceed = currentIdx < questions.length;

  const playCurrentAudio = useCallback(() => {
    if (!current) return;
    speak(getNumberWord(current.number, lang), getSpeechLang(lang), {
      gender: voiceGender,
    });
  }, [current, lang, speak, voiceGender]);

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
    if (current) {
      recordNumberAttempt({
        languageCode: lang,
        value: current.answer,
        phase: "speed-quiz",
        answer: value,
      });
    }

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
    recordNumberAttempt({
      languageCode: lang,
      value: current.answer,
      phase: "speed-quiz",
      answer: parsed,
    });

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
      <div className="flex min-h-[360px] items-center justify-center px-2">
        <div className="exp-card w-full max-w-md p-6 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-exp-surface-low text-exp-tertiary">
            <Timer className="h-8 w-8" aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-semibold leading-6 text-exp-on-surface-variant">
            {t("learning.number.speedQuizIntro", {
              count: QUESTION_COUNT,
              seconds: TIME_LIMIT,
            })}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="exp-pill bg-exp-surface-low text-exp-on-surface-variant">
              {QUESTION_COUNT} {t("learning.common.question")}
            </span>
            <span className="exp-pill bg-exp-secondary-fixed text-exp-secondary">
              <Timer className="h-3.5 w-3.5" aria-hidden="true" />
              {TIME_LIMIT}s
            </span>
          </div>
          <button
            type="button"
            onClick={() => setHasStarted(true)}
            className="exp-btn exp-btn-primary mt-5 w-full"
          >
            {t("learning.number.startQuiz")}
          </button>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-exp-on-surface-variant">{t("learning.number.noQuestions")}</p>
      </div>
    );
  }

  const timerPct = (timeLeft / TIME_LIMIT) * 100;
  const timerColor = timerPct > 40 ? "var(--exp-primary-container)" : timerPct > 15 ? "var(--exp-secondary-container)" : "var(--exp-error)";

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center justify-between w-full max-w-sm">
        <span className="text-xs text-exp-on-surface-muted">
          {t("learning.number.questionOf", {
            current: currentIdx + 1,
            total: questions.length,
          })}
        </span>
        <span className="text-xs font-semibold tabular-nums" style={{ color: timerColor }}>
          {t("learning.common.score")}: {score}
        </span>
      </div>

      <div className="w-full max-w-sm h-1.5 rounded-full bg-exp-surface-low overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-100 ease-linear"
          style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
        />
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-exp-on-surface-muted uppercase tracking-widest">
          {current.type === "listen"
            ? t("learning.number.listenAndPick")
            : current.type === "see"
              ? t("learning.number.readAndPick")
              : t("learning.number.typeTheNumber")}
        </span>
        {current.type === "listen" && (
          <button
            type="button"
            onClick={playCurrentAudio}
            disabled={showResult}
            aria-label={t("learning.audio.play")}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-exp-primary-container/30 bg-exp-surface-lowest transition-colors hover:border-exp-primary-container/60 active:scale-95"
          >
            <Volume2 className="h-6 w-6 text-exp-primary" aria-hidden="true" />
          </button>
        )}
        {current.type === "see" && (
          <span className="text-5xl font-bold text-exp-on-surface">{current.number}</span>
        )}
        {current.type === "type" && (
          <div className="text-center">
            <p className="text-xl font-semibold text-exp-on-surface-variant mb-3">&quot;{current.word}&quot;</p>
            <input
              ref={inputRef}
              type="number"
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTypeSubmit();
              }}
              disabled={showResult}
              placeholder={t("learning.number.typeNumberPlaceholder")}
              aria-label={t("learning.number.typeNumber")}
              className="w-40 text-center px-4 py-3 rounded-xl bg-exp-surface-low border border-exp-outline-variant text-exp-on-surface text-xl font-bold placeholder:text-exp-on-surface-muted focus:outline-none focus:border-exp-primary-container/50 focus:ring-2 focus:ring-exp-primary/20 transition-all duration-150"
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
                "bg-exp-surface-low border-exp-container-high text-exp-on-surface hover:bg-exp-container-high hover:border-exp-outline-variant active:scale-[0.95]";
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
                className={classes}
                onClick={() => handleSelect(value)}
                disabled={showResult}
              >
                {showResult && answer && (
                  <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-exp-primary-container text-exp-on-surface text-xs">
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
          type="button"
          onClick={handleTypeSubmit}
          className="exp-btn exp-btn-primary"
        >
          {t("learning.common.submit")}
        </button>
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
                {timeLeft >= TIME_LIMIT - FAST_THRESHOLD
                  ? t("learning.number.speedFast", { xp: 15 })
                  : t("learning.number.speedCorrect", { xp: 10 })}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {t("learning.number.answerWas", { answer: current.answer })}
              </span>
            )}
          </div>
          <button
            onClick={handleNext}
            className="exp-btn exp-btn-primary"
          >
            {currentIdx + 1 >= questions.length
              ? t("learning.number.seeResults")
              : t("learning.common.next")}
          </button>
        </div>
      )}
    </div>
  );
}
