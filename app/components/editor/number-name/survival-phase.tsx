"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Flame, Heart, Timer, Trophy, Volume2 } from "lucide-react";
import { getNumberWord, getSpeechLang, generateOptions } from "./number-data";
import { useSpeech, useSpeechGender } from "@/lib/use-speech";
import type { LanguageCode } from "./types";
import { recordNumberAttempt } from "@/lib/learning/number-attempts";

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
  const { t } = useTranslation();
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
  const { speak } = useSpeech();
  const [voiceGender] = useSpeechGender(lang);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onLoseLifeRef = useRef(onLoseLife);
  onLoseLifeRef.current = onLoseLife;
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  const playAudio = useCallback(() => {
    const word = getNumberWord(question.answer, lang);
    speak(word, getSpeechLang(lang), { gender: voiceGender });
  }, [question.answer, lang, speak, voiceGender]);

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
    recordNumberAttempt({
      languageCode: lang,
      value: question.answer,
      phase: "survival",
      answer: value,
    });

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
  const timerColor = timerPct > 40 ? "var(--exp-primary-container)" : timerPct > 15 ? "var(--exp-secondary-container)" : "var(--exp-error)";

  if (!hasStarted) {
    return (
      <div className="flex min-h-[360px] items-center justify-center px-2">
        <div className="exp-card w-full max-w-md p-6 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-exp-error/10 text-exp-error">
            <Flame className="h-8 w-8" aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-semibold leading-6 text-exp-on-surface-variant">
            {t("learning.number.survivalIntro", { count: initialLives })}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="exp-pill bg-exp-surface-low text-exp-on-surface-variant">
              <Heart className="h-3.5 w-3.5 text-exp-error" aria-hidden="true" />
              {initialLives}
            </span>
            <span className="exp-pill bg-exp-surface-low text-exp-on-surface-variant">
              <Timer className="h-3.5 w-3.5 text-exp-secondary" aria-hidden="true" />
              {TIME_LIMIT}s
            </span>
          </div>
          <button
            type="button"
            onClick={() => setHasStarted(true)}
            className="exp-btn exp-btn-primary mt-5 w-full"
          >
            {t("learning.number.startSurvival")}
          </button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="flex min-h-[360px] items-center justify-center px-2 animate-fade-in-up">
        <div className="exp-card w-full max-w-md p-6 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-exp-secondary-fixed text-exp-secondary">
            <Trophy className="h-8 w-8" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-xl font-extrabold text-exp-on-surface">
            {t("learning.number.gameOver")}
          </h3>
          <p className="mt-1 text-sm text-exp-on-surface-variant">
            {t("learning.number.survived")}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-exp-surface-low p-3">
              <p className="text-2xl font-extrabold tabular-nums text-exp-primary">{score}</p>
              <p className="text-[11px] font-bold uppercase tracking-wide text-exp-on-surface-muted">
                {t("learning.common.score")}
              </p>
            </div>
            <div className="rounded-xl bg-exp-surface-low p-3">
              <p className="text-2xl font-extrabold tabular-nums text-exp-secondary">{maxStreak}</p>
              <p className="text-[11px] font-bold uppercase tracking-wide text-exp-on-surface-muted">
                {t("learning.number.bestStreak")}
              </p>
            </div>
          </div>
          <button
            type="button"
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
            className="exp-btn exp-btn-primary mt-4 w-full"
          >
            {t("learning.number.playAgain")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center justify-between w-full max-w-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tabular-nums text-exp-primary">{score}</span>
          <span className="text-xs text-exp-on-surface-muted">{t("learning.number.points")}</span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: initialLives }).map((_, i) => (
            <span
              key={i}
              className={`flex items-center justify-center w-5 h-5 rounded-full text-xs transition-all duration-300 ${
                i < lives
                  ? "text-exp-error bg-red-400/10"
                  : "text-exp-container-high bg-exp-surface-low"
              }`}
            >
              ♥
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-exp-secondary-container/10 border border-orange-400/20">
          <span className="text-sm">🔥</span>
          <span className="text-orange-300 text-xs font-semibold tabular-nums">{streak}</span>
        </div>
      </div>

      <div className="w-full max-w-sm h-1.5 rounded-full bg-exp-surface-low overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-100 ease-linear"
          style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
        />
      </div>

      <button
        onClick={playAudio}
        disabled={showResult}
        className="flex items-center justify-center w-16 h-16 rounded-full bg-exp-surface-lowest border border-exp-primary-container/30 hover:border-exp-primary-container/60 hover:shadow-lg transition-all active:scale-95"
      >
        <Volume2 className="h-7 w-7 text-exp-primary" aria-hidden="true" />
      </button>

      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {question.options.map((value) => {
          const picked = selected === value;
          const answer = value === question.answer;
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
                {t("learning.number.correctXp", {
                  xp: 10 + Math.min(streak, 10) * 2,
                })}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {t("learning.number.answerWas", { answer: question.answer })}{" "}
                {lives > 0
                  ? t("learning.number.livesLeft", { count: lives })
                  : t("learning.number.gameOver")}
              </span>
            )}
          </div>
          {lives > 0 && (
            <button
              onClick={handleNext}
              className="exp-btn exp-btn-primary"
            >
              {t("learning.common.continue")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
