"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { GraduationCap, Volume2 } from "lucide-react";
import { getNumberWord, getSpeechLang, generateOptions } from "./number-data";
import { useSpeech, useSpeechGender } from "@/lib/use-speech";
import type { LanguageCode, MasteryResult, SpeedQuizType } from "./types";
import { recordNumberAttempt } from "@/lib/learning/number-attempts";

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

function generateMasteryTest(
  numbers: number[],
  lang: LanguageCode,
): MasteryQuestion[] {
  const pool = numbers.length >= 10
    ? [...numbers].sort(() => Math.random() - 0.5)
    : [...numbers, ...numbers].sort(() => Math.random() - 0.5);
  const questions: MasteryQuestion[] = [];
  const types: SpeedQuizType[] = ["listen", "see", "type"];

  for (let i = 0; i < QUESTION_COUNT; i++) {
    const answer = pool[i % pool.length]!;
    const word = getNumberWord(answer, lang);
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
  const { t } = useTranslation();
  const [questions] = useState(() => generateMasteryTest(numbers, lang));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [testResult, setTestResult] = useState<MasteryResult | null>(null);
  const { speak } = useSpeech();
  const [voiceGender] = useSpeechGender(lang);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = questions[currentIdx];

  const playAudio = useCallback(() => {
    if (!current) return;
    speak(getNumberWord(current.answer, lang), getSpeechLang(lang), {
      gender: voiceGender,
    });
  }, [current, lang, speak, voiceGender]);

  const handleSelect = (value: number) => {
    if (showResult || finished) return;
    setSelected(value);

    const correct = value === current?.answer;
    setIsCorrect(correct);
    if (current) {
      recordNumberAttempt({
        languageCode: lang,
        value: current.answer,
        phase: "mastery",
        answer: value,
      });
    }

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
    recordNumberAttempt({
      languageCode: lang,
      value: current.answer,
      phase: "mastery",
      answer: parsed,
    });

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
          speak(word, getSpeechLang(lang), { gender: voiceGender });
        }
      }, 100);
    }
  };

  if (!hasStarted) {
    return (
      <div className="flex min-h-[360px] items-center justify-center px-2">
        <div className="exp-card w-full max-w-md p-6 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-exp-tertiary-fixed text-exp-tertiary">
            <GraduationCap className="h-8 w-8" aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-semibold leading-6 text-exp-on-surface-variant">
            {t("learning.number.masteryIntro", {
              count: QUESTION_COUNT,
              percent: PASS_THRESHOLD,
            })}
          </p>
          <div className="mt-4 flex flex-col items-center gap-2">
            <span className="exp-pill bg-exp-surface-low text-exp-on-surface-variant">
              {t("learning.number.masteryNotTimed")}
            </span>
            <span className="exp-pill bg-exp-surface-low text-exp-on-surface-variant">
              {t("learning.number.masteryUnlockNext")}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setHasStarted(true)}
            className="exp-btn exp-btn-primary mt-5 w-full"
          >
            {t("learning.number.startMastery")}
          </button>
        </div>
      </div>
    );
  }

  if (finished && testResult) {
    const passed = testResult.passed;
    return (
      <div className="flex flex-col items-center justify-center gap-5 h-[60vh] animate-fade-in-up">
        <span
          className={`grid h-16 w-16 place-items-center rounded-2xl ${
            passed
              ? "bg-exp-primary-container/15 text-exp-primary"
              : "bg-exp-secondary-fixed text-exp-secondary"
          }`}
        >
          <GraduationCap className="h-8 w-8" aria-hidden="true" />
        </span>
        <div className="text-center">
          <h3 className={`text-xl font-extrabold ${passed ? "text-exp-primary" : "text-exp-secondary"}`}>
            {passed ? t("learning.number.masteryCongratulations") : t("learning.number.masteryKeepPracticing")}
          </h3>
          <p className="text-exp-on-surface-muted mt-1">
            {passed
              ? t("learning.number.masteryBadgeEarned")
              : t("learning.number.masteryFail")}
          </p>
        </div>

        <div className="flex gap-8">
          <div className="flex flex-col items-center">
            <span className={`text-3xl font-bold ${passed ? "text-exp-primary" : "text-exp-secondary"}`}>
              {testResult.score}/{testResult.total}
            </span>
            <span className="text-xs text-exp-on-surface-muted">{t("learning.common.score")}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`text-3xl font-bold ${passed ? "text-exp-success" : "text-exp-error"}`}>
              {testResult.percentage}%
            </span>
            <span className="text-xs text-exp-on-surface-muted">
              {passed ? t("learning.number.masteryPass") : t("learning.number.needPercent", { percent: PASS_THRESHOLD })}
            </span>
          </div>
        </div>

        <div className="w-full max-w-xs h-4 rounded-full bg-exp-surface-low overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              passed ? "bg-exp-primary-container" : "bg-exp-secondary-container"
            }`}
            style={{ width: `${testResult.percentage}%` }}
          />
        </div>

        {passed && (
          <div className="exp-pill bg-exp-primary-container/15 text-exp-primary">
            <span className="text-sm font-bold">{t("learning.number.masteryBadgeEarned")}</span>
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
            className="exp-btn exp-btn-primary"
          >
            {t("learning.number.retryTest")}
          </button>
        )}
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

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center justify-between w-full max-w-sm">
        <span className="text-xs text-exp-on-surface-muted">
          {t("learning.number.questionOf", {
            current: currentIdx + 1,
            total: QUESTION_COUNT,
          })}
        </span>
        <span className="text-xs font-semibold tabular-nums text-exp-primary">
          {t("learning.common.score")}: {score}/{currentIdx + (showResult ? 1 : 0)}
        </span>
      </div>

      <div className="w-full max-w-sm h-1.5 rounded-full bg-exp-surface-low overflow-hidden">
        <div
          className="h-full rounded-full bg-exp-primary-container/40 transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / QUESTION_COUNT) * 100}%` }}
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
            onClick={playAudio}
            disabled={showResult}
            aria-label={t("learning.audio.play")}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-exp-primary-container/30 bg-exp-surface-lowest transition-colors hover:border-exp-primary-container/60 active:scale-95"
          >
            <Volume2 className="h-6 w-6 text-exp-primary" aria-hidden="true" />
          </button>
        )}
        {current.type === "see" && (
          <span className="text-5xl font-bold text-exp-on-surface">{current.answer}</span>
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
                  <span
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-exp-primary-container text-xs font-bold text-exp-on-primary-container"
                    aria-hidden="true"
                  >
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
                {t("learning.number.correctXp", { xp: 10 })}
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
            {currentIdx + 1 >= QUESTION_COUNT
              ? t("learning.number.seeResults")
              : t("learning.common.next")}
          </button>
        </div>
      )}
    </div>
  );
}
