"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Heart,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Volume2,
  X,
} from "lucide-react";
import { expeditionCopy, fill } from "@/components/expedition/copy";
import { LangoMascot } from "@/components/expedition/art";
import { useTranslation } from "react-i18next";
import { CONTENT_LANGUAGE_LABELS, toSpeechLocale } from "@/lib/i18n/locales";
import { useSpeech, useSpeechGender } from "@/lib/use-speech";
import type { PracticeQuestion } from "@/lib/story/expedition";

interface Feedback {
  correct: boolean;
  correctAnswer: string;
  explanation: string;
  selected: string;
  xpAwarded: number;
}

export function PracticeQuiz({
  lang,
  locale,
  languageCode,
  questions,
  levels,
}: {
  lang: string;
  locale: string;
  languageCode: string;
  questions: PracticeQuestion[];
  levels: Array<{ tier: string; label: string; levelCode: string }>;
}) {
  const copy = expeditionCopy(locale);
  const { t } = useTranslation();
  const { speak: speakText, cancel: cancelSpeech } = useSpeech();
  const [voiceGender] = useSpeechGender(languageCode);
  const speechLocale = toSpeechLocale(languageCode);
  const languageLabel =
    CONTENT_LANGUAGE_LABELS[languageCode as keyof typeof CONTENT_LANGUAGE_LABELS] ??
    languageCode;
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pending, setPending] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [combo, setCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [showRomaji, setShowRomaji] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const startedAt = useRef(Date.now());
  const question = questions[index];

  const speak = useCallback(
    (text: string) => {
      if (speaking) {
        cancelSpeech();
        setSpeaking(false);
        return;
      }
      const result = speakText(text, speechLocale, {
        gender: voiceGender,
        rate: 0.85,
        onEnd: () => setSpeaking(false),
        onError: (reason) => {
          setSpeaking(false);
          setNotice(
            reason === "no-voice"
              ? t("learning.audio.noVoice", { language: languageLabel })
              : "Audio gagal diputar.",
          );
        },
      });
      if (!result.ok) {
        setSpeaking(false);
        setNotice(
          result.reason === "no-voice"
            ? t("learning.audio.noVoice", { language: languageLabel })
            : "Audio gagal diputar.",
        );
        return;
      }
      setSpeaking(true);
    },
    [
      cancelSpeech,
      languageLabel,
      speakText,
      speaking,
      speechLocale,
      t,
      voiceGender,
    ],
  );

  useEffect(() => {
    startedAt.current = Date.now();
  }, [index]);

  const choose = useCallback(
    async (choiceId: string) => {
      if (!question || pending || feedback) return;
      setPending(true);
      const elapsed = Date.now() - startedAt.current;
      try {
        const response = await fetch("/api/v1/story-attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sceneId: question.sceneId,
            exerciseId: question.exerciseId,
            clientAttemptId: crypto.randomUUID(),
            answer: { choiceId },
            timeSpentMs: Math.min(30 * 60 * 1000, Math.max(0, elapsed)),
          }),
        });
        const payload = await response.json().catch(() => null);
        if (!payload?.data) throw new Error("no result");
        const data = payload.data as {
          correct: boolean;
          correctAnswer: string;
          explanation: string;
          xpAwarded: number;
        };
        setFeedback({ ...data, selected: choiceId, xpAwarded: data.xpAwarded ?? 0 });
        setAnswered((value) => value + 1);
        setTimes((value) => [...value, elapsed]);
        if (data.correct) {
          setCorrectCount((value) => value + 1);
          setCombo((value) => value + 1);
        } else {
          setCombo(0);
          setHearts((value) => Math.max(0, value - 1));
        }
      } catch {
        setNotice(locale === "id" ? "Jawaban belum bisa dinilai. Coba lagi." : "Could not grade this answer. Try again.");
      } finally {
        setPending(false);
      }
    },
    [feedback, locale, pending, question],
  );

  const next = () => {
    if (index + 1 >= questions.length) {
      setDone(true);
      return;
    }
    setIndex((value) => value + 1);
    setFeedback(null);
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!question) return;
      if (event.key === "Enter") {
        if (feedback) {
          event.preventDefault();
          next();
        }
        return;
      }
      if (feedback) return;
      const key = event.key.toUpperCase();
      const choiceIndex = ["A", "B", "C", "D"].indexOf(key);
      if (choiceIndex >= 0 && question.choices[choiceIndex]) {
        void choose(question.choices[choiceIndex].id);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const restart = () => {
    setIndex(0);
    setFeedback(null);
    setDone(false);
    setCorrectCount(0);
    setAnswered(0);
    setTimes([]);
    setHearts(5);
    setCombo(0);
    setNotice(null);
  };

  const accuracy = answered === 0 ? 0 : Math.round((correctCount / answered) * 100);
  const averageTime =
    times.length === 0
      ? 0
      : Math.round(times.reduce((a, b) => a + b, 0) / times.length / 100) / 10;
  const levelRange = levels[0]?.label ?? "";

  const progress = done
    ? 100
    : questions.length === 0
      ? 0
      : Math.round((index / questions.length) * 100);

  if (questions.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <div className="exp-card flex flex-col items-center gap-3 p-10 text-center">
          <LangoMascot className="h-20 w-20" />
          <h1 className="text-xl font-extrabold">{copy.noQuestions}</h1>
          <p className="max-w-md text-sm text-exp-on-surface-variant">{copy.noQuestionsBody}</p>
          <Link href={`/${lang}/stories`} className="exp-btn exp-btn-primary mt-2">
            {copy.backToLibrary}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 lg:py-8">
      {/* HUD */}
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-exp-surface-low px-3 py-3 shadow-sm sm:px-5">
        <Link
          href={`/${lang}/learn`}
          aria-label={copy.backToMap}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-exp-surface-lowest text-exp-on-surface-variant shadow-sm hover:bg-exp-container"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2 text-[10px] font-extrabold sm:text-xs">
            <span className="truncate">
              {done
                ? copy.resultsTitle
                : fill(copy.questionOf, {
                    current: Math.min(index + 1, questions.length),
                    total: questions.length,
                  })}
            </span>
            <span className="shrink-0 text-exp-primary">{progress}%</span>
          </div>
          <div className="exp-progress">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-exp-surface-lowest px-2.5 py-2 shadow-sm">
          {Array.from({ length: 5 }).map((_, heartIndex) => (
            <Heart
              key={heartIndex}
              className={`h-3.5 w-3.5 ${
                heartIndex < hearts
                  ? "fill-exp-error text-exp-error"
                  : "fill-exp-container-highest text-exp-container-highest"
              }`}
              aria-hidden="true"
            />
          ))}
          <span className="ml-0.5 text-[10px] font-extrabold">{hearts}/5</span>
        </div>
      </div>

      {done ? (
        <Results
          copy={copy}
          lang={lang}
          correct={correctCount}
          total={questions.length}
          accuracy={accuracy}
          averageTime={averageTime}
          onRestart={restart}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
            {/* Left context */}
            <div className="flex flex-col gap-4 lg:col-span-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="exp-pill bg-exp-tertiary-fixed px-3 py-1.5 text-exp-on-tertiary-fixed">
                  <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                  {copy.contextual}
                </span>
                <button
                  type="button"
                  onClick={() => setShowRomaji((value) => !value)}
                  aria-pressed={showRomaji}
                  className="flex items-center gap-1.5 rounded-full bg-exp-surface-low px-3 py-1.5 text-[10px] font-extrabold shadow-sm ring-1 ring-exp-container-high"
                >
                  <span className="text-exp-primary">文</span>
                  {copy.romaji}
                  <span
                    className={`flex h-4 w-8 items-center rounded-full p-0.5 ${
                      showRomaji ? "bg-exp-primary" : "bg-exp-container-highest"
                    }`}
                  >
                    <span
                      className={`h-3 w-3 rounded-full bg-exp-surface-lowest shadow-sm transition-transform ${
                        showRomaji ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </span>
                </button>
              </div>

              <div className="flex items-end gap-2">
                <span className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-exp-container shadow-md sm:h-28 sm:w-28">
                  <LangoMascot className="h-24 w-24 sm:h-28 sm:w-28" hat="detective" />
                  <span className="absolute bottom-1 right-1 rounded bg-exp-secondary-container px-1.5 py-0.5 text-[8px] font-extrabold text-exp-on-secondary-container">
                    Detektif Lango
                  </span>
                </span>
                <div className="exp-bubble flex-1 p-3 sm:p-4">
                  <p className="text-xs font-medium leading-5 text-exp-on-surface sm:text-sm">
                    <strong className="font-extrabold text-exp-primary">
                      {question.episodeTitle}
                    </strong>{" "}
                    — {question.prompt}
                  </p>
                </div>
              </div>

              {question.context && (
                <div className="flex flex-col gap-2 rounded-xl bg-exp-surface-low p-3.5 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-exp-on-surface-variant">
                      <Volume2 className="h-3.5 w-3.5 text-exp-primary" aria-hidden="true" />
                      {copy.audioClip}
                    </span>
                    <span className="text-[9px] font-semibold text-exp-outline">
                      {question.sceneTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => speak(question.context?.text ?? "")}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-exp-primary text-exp-on-primary shadow-[0_3px_0_var(--exp-primary)] active:translate-y-0.5"
                      aria-label={copy.audioClip}
                    >
                      <Volume2 className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-bold" lang={languageCode}>
                        {question.context.text}
                      </p>
                      {showRomaji && question.context.romanization && (
                        <p className="line-clamp-1 text-[10px] font-medium italic text-exp-on-surface-variant">
                          {question.context.romanization}
                        </p>
                      )}
                      <p className="line-clamp-1 text-[10px] text-exp-on-surface-variant">
                        {question.context.translation}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => speak(question.context?.text ?? "")}
                      className="shrink-0 rounded-lg bg-exp-container px-2 py-1 text-[9px] font-extrabold text-exp-on-surface-variant hover:bg-exp-container-high"
                    >
                      {copy.playSlow}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex items-center gap-2.5 rounded-xl bg-exp-surface-low p-3 shadow-sm">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-exp-primary/10 text-exp-primary">
                    <Target className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[9px] font-bold text-exp-on-surface-variant">{copy.accuracy}</p>
                    <p className="text-[16px] font-extrabold">{accuracy}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl bg-exp-surface-low p-3 shadow-sm">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-exp-secondary-fixed text-exp-secondary">
                    <Timer className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[9px] font-bold text-exp-on-surface-variant">{copy.avgTime}</p>
                    <p className="text-[16px] font-extrabold">{averageTime}s</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-2.5 lg:col-span-7">
              <div className="flex items-center justify-between pb-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-exp-on-surface-variant">
                  {copy.chooseCorrect}
                </span>
                <span className="hidden text-[10px] font-semibold text-exp-outline sm:block">
                  {copy.keyboardHint}
                </span>
              </div>

              {question.choices.map((choice, choiceIndex) => {
                const isSelected = feedback?.selected === choice.id;
                const showCorrect = Boolean(
                  feedback &&
                    (choice.id === feedback.correctAnswer ||
                      choice.text === feedback.correctAnswer),
                );
                const isWrong = Boolean(feedback && isSelected && !feedback.correct);
                return (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={Boolean(feedback) || pending}
                    onClick={() => void choose(choice.id)}
                    className={`group flex items-start gap-3 rounded-2xl bg-exp-surface-lowest p-4 text-left shadow-sm transition-all ${
                      showCorrect
                        ? "border-2 border-exp-primary-container bg-exp-primary-fixed/10 shadow-[0_4px_0_var(--exp-primary-container)]"
                        : isWrong
                          ? "border-2 border-exp-error shadow-[0_4px_0_var(--exp-error)]"
                          : "border border-exp-container-high border-b-4 hover:bg-exp-surface-low active:translate-y-0.5"
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-extrabold ${
                        showCorrect
                          ? "bg-exp-primary text-exp-on-primary"
                          : isWrong
                            ? "bg-exp-error text-exp-on-primary"
                            : "bg-exp-container-high text-exp-on-surface-variant group-hover:bg-exp-container-highest"
                      }`}
                    >
                      {String.fromCharCode(65 + choiceIndex)}
                    </span>
                    <span className="min-w-0 flex-1 py-1 text-sm font-bold leading-5">
                      {choice.text}
                    </span>
                    {showCorrect && (
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-exp-primary text-exp-on-primary">
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </span>
                    )}
                    {isWrong && (
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-exp-error text-exp-on-primary">
                        <X className="h-4 w-4" aria-hidden="true" />
                      </span>
                    )}
                  </button>
                );
              })}

              {!feedback && (
                <div className="mt-1 flex items-center gap-2 rounded-xl bg-exp-surface-low p-2.5 text-[10px] font-semibold text-exp-on-surface-variant">
                  <Sparkles className="h-3.5 w-3.5 text-exp-tertiary" aria-hidden="true" />
                  {levelRange || copy.difficulty}
                  {pending && <span className="ml-auto animate-pulse">…</span>}
                </div>
              )}

              {!feedback && (
                <div className="mt-1 flex items-start gap-3 rounded-2xl bg-exp-container p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-exp-primary-fixed">
                    <LangoMascot className="h-9 w-9" />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-exp-primary">{copy.tipTitle}</p>
                    <p className="mt-0.5 text-[11px] font-medium leading-5 text-exp-on-surface-variant">
                      {copy.tipBody}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {feedback && (
            <div className="flex flex-col gap-3 rounded-2xl bg-exp-primary/10 p-4 shadow-md ring-1 ring-exp-primary-container sm:p-5">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-exp-primary text-exp-on-primary shadow-[0_4px_0_var(--exp-primary)]">
                    {feedback.correct ? (
                      <Trophy className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Lightbulb className="h-6 w-6" aria-hidden="true" />
                    )}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-[16px] font-extrabold text-exp-primary sm:text-lg">
                        {feedback.correct ? copy.correctTitle : copy.tryAgainTitle}
                      </h2>
                      {feedback.correct && combo > 1 && (
                        <span className="exp-pill bg-exp-secondary-container text-exp-on-secondary-container">
                          <Sparkles className="h-3 w-3" aria-hidden="true" />
                          {fill(copy.combo, { count: combo })}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-bold text-exp-on-surface-variant">
                      <span className="flex items-center gap-1 text-exp-primary">
                        <Sparkles className="h-3 w-3" aria-hidden="true" />+
                        {feedback.xpAwarded} XP
                      </span>
                      <span>·</span>
                      <span>
                        {copy.difficulty}: {levelRange || "—"}
                      </span>
                    </p>
                  </div>
                </div>
                <button type="button" onClick={next} className="exp-btn exp-btn-primary shrink-0">
                  {index + 1 >= questions.length ? copy.finish : copy.nextQuestion}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl bg-exp-surface-lowest p-3 shadow-sm">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-exp-tertiary-fixed text-exp-tertiary">
                  <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold text-exp-tertiary">{copy.explanation}:</p>
                  <p className="mt-0.5 text-xs font-medium leading-5 text-exp-on-surface-variant">
                    {feedback.explanation || copy.tryAgainTitle}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {notice && (
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center justify-between gap-2 rounded-2xl bg-exp-surface-lowest p-3 text-xs font-semibold shadow-lg">
          {notice}
          <button type="button" onClick={() => setNotice(null)} className="font-extrabold text-exp-primary">
            {copy.close}
          </button>
        </div>
      )}
    </div>
  );
}

function Results({
  copy,
  lang,
  correct,
  total,
  accuracy,
  averageTime,
  onRestart,
}: {
  copy: ReturnType<typeof expeditionCopy>;
  lang: string;
  correct: number;
  total: number;
  accuracy: number;
  averageTime: number;
  onRestart: () => void;
}) {
  const xp = correct * 20;
  return (
    <div className="exp-card flex flex-col items-center gap-4 p-6 text-center sm:p-10">
      <span className="grid h-20 w-20 place-items-center rounded-full bg-exp-primary-container text-exp-on-primary-container shadow-[0_6px_0_var(--exp-primary)]">
        <Trophy className="h-10 w-10" aria-hidden="true" />
      </span>
      <h2 className="text-2xl font-extrabold">{copy.resultsTitle}</h2>
      <p className="text-sm font-medium text-exp-on-surface-variant">
        {fill(copy.resultsBody, { correct, total })}
      </p>
      <div className="grid w-full max-w-md grid-cols-3 gap-2">
        <div className="rounded-xl bg-exp-surface-low p-3">
          <p className="text-lg font-extrabold text-exp-primary">{accuracy}%</p>
          <p className="text-[9px] font-bold uppercase text-exp-outline">{copy.accuracy}</p>
        </div>
        <div className="rounded-xl bg-exp-surface-low p-3">
          <p className="text-lg font-extrabold text-exp-secondary">{averageTime}s</p>
          <p className="text-[9px] font-bold uppercase text-exp-outline">{copy.avgTime}</p>
        </div>
        <div className="rounded-xl bg-exp-surface-low p-3">
          <p className="text-lg font-extrabold text-exp-tertiary">{xp}</p>
          <p className="text-[9px] font-bold uppercase text-exp-outline">XP</p>
        </div>
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={onRestart} className="exp-btn exp-btn-ghost">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {copy.retry}
        </button>
        <Link href={`/${lang}/learn`} className="exp-btn exp-btn-primary">
          {copy.backToMap}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link href={`/${lang}/stories`} className="exp-btn exp-btn-soft">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          {copy.backToLibrary}
        </Link>
      </div>
    </div>
  );
}
