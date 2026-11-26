"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Loader2,
  Mic,
  Square,
  Volume2,
} from "lucide-react";
import { useSpeech } from "@/lib/use-speech";
import type {
  InterviewEvaluation,
  InterviewLanguage,
  InterviewMode,
  InterviewQuestionPublic,
  InterviewTurnRecord,
} from "@/lib/interview/types";
import {
  INTERVIEW_LOCALE_TO_SPEECH,
  interviewCopy,
  interviewFill,
} from "./interview-copy";
import { ScoreBars } from "./ui";

interface SpeechResultAlternativeLike {
  transcript: string;
}
interface SpeechResultLike {
  isFinal: boolean;
  0: SpeechResultAlternativeLike;
}
interface SpeechResultEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechResultEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const candidate = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return candidate.SpeechRecognition ?? candidate.webkitSpeechRecognition ?? null;
}

function countSpokenSeconds(text: string, language: InterviewLanguage): number {
  if (language === "ja") {
    const characters = (text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]/gu) ?? []).length;
    return Math.round(characters / 5.5);
  }
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.round(words / 2.4);
}

function countWords(text: string, language: InterviewLanguage): number {
  if (language === "ja") {
    return (text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]/gu) ?? []).length;
  }
  return text.split(/\s+/).filter(Boolean).length;
}

function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

export function InterviewRunner({
  lang,
  locale,
  language,
  sessionId,
  trackLabel,
  mode,
  questions,
  initialTurns,
}: {
  lang: string;
  locale: string;
  language: InterviewLanguage;
  sessionId: string;
  trackLabel: string;
  mode: InterviewMode;
  questions: InterviewQuestionPublic[];
  initialTurns: InterviewTurnRecord[];
}) {
  const copy = interviewCopy(locale);
  const router = useRouter();
  const { speak } = useSpeech();

  const [index, setIndex] = useState(() =>
    Math.min(initialTurns.length, Math.max(0, questions.length - 1)),
  );
  const [answer, setAnswer] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [savedPosition, setSavedPosition] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [lastPosition, setLastPosition] = useState<number | null>(null);
  const [audioNote, setAudioNote] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const question = questions[index];
  const isSimulation = mode === "simulation";
  const words = countWords(answer, language);
  const spokenSeconds = countSpokenSeconds(answer, language);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [index]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const submit = useCallback(async () => {
    if (!question || answer.trim().length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/v1/interview/sessions/${sessionId}/answers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: question.canonicalId,
            transcript: answer,
            durationMs: elapsed * 1000,
          }),
        },
      );
      const json = (await response.json()) as {
        success?: boolean;
        data?: {
          evaluation: InterviewEvaluation;
          position: number;
          nextPosition: number | null;
        };
        error?: { message?: string };
      };
      if (!response.ok || !json.success || !json.data) {
        setError(json.error?.message ?? copy.submitFailed);
        return;
      }
      setEvaluation(json.data.evaluation);
      setSavedPosition(json.data.position);
      setLastPosition(json.data.nextPosition);
    } catch {
      setError(copy.submitFailed);
    } finally {
      setSubmitting(false);
    }
  }, [answer, copy.submitFailed, elapsed, question, sessionId, submitting]);

  const finishSession = useCallback(async () => {
    if (finishing) return;
    setFinishing(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/v1/interview/sessions/${sessionId}/complete`,
        { method: "POST" },
      );
      if (!response.ok) {
        const json = (await response.json()) as { error?: { message?: string } };
        setError(json.error?.message ?? copy.submitFailed);
        setFinishing(false);
        return;
      }
      router.push(`/${lang}/visa-kerja/laporan/${sessionId}`);
    } catch {
      setError(copy.submitFailed);
      setFinishing(false);
    }
  }, [copy.submitFailed, finishing, lang, router, sessionId]);

  function advance() {
    if (lastPosition === null) {
      void finishSession();
      return;
    }
    setIndex(lastPosition);
    setElapsed(0);
    setAnswer("");
    setEvaluation(null);
    setSavedPosition(null);
    setLastPosition(null);
    setError(null);
    setMicError(null);
  }

  function toggleDictation() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const Constructor = getRecognitionConstructor();
    if (!Constructor) {
      setMicError(copy.micUnsupported);
      return;
    }
    setMicError(null);
    const recognition = new Constructor();
    recognitionRef.current = recognition;
    recognition.lang = INTERVIEW_LOCALE_TO_SPEECH[language] ?? "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      let text = "";
      for (let resultIndex = event.resultIndex; resultIndex < event.results.length; resultIndex += 1) {
        const result = event.results[resultIndex];
        if (result?.isFinal) {
          text += `${result[0]?.transcript ?? ""} `;
        }
      }
      const clean = text.trim();
      if (clean) {
        setAnswer((previous) => (previous ? `${previous.trim()} ${clean}` : clean));
      }
    };
    recognition.onerror = () => {
      setListening(false);
      setMicError(copy.micDenied);
    };
    recognition.onend = () => {
      setListening(false);
    };
    try {
      recognition.start();
      setListening(true);
    } catch {
      setMicError(copy.micUnsupported);
    }
  }

  function playQuestion() {
    if (!question) return;
    const result = speak(question.prompt, INTERVIEW_LOCALE_TO_SPEECH[language]);
    if (!result.ok) {
      if (result.reason === "unsupported") {
        setAudioNote(
          locale === "id"
            ? "Browser ini tidak mendukung audio."
            : locale === "ja"
              ? "このブラウザは音声に対応していません。"
              : "This browser does not support audio.",
        );
      } else {
        setAudioNote(
          locale === "id"
            ? "Suara untuk bahasa ini tidak tersedia di perangkat Anda."
            : locale === "ja"
              ? "この言語の音声が見つかりませんでした。"
              : "No voice is installed for this language on this device.",
        );
      }
      return;
    }
    setAudioNote(null);
  }

  if (!question) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm font-semibold text-exp-on-surface">
          {copy.noTurns}
        </p>
        <Link href={`/${lang}/visa-kerja`} className="mt-4 inline-block text-sm font-extrabold text-exp-primary underline">
          {copy.backToHub}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-5 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href={`/${lang}/visa-kerja`}
          className="inline-flex items-center gap-1 text-xs font-extrabold text-exp-on-surface-variant hover:text-exp-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {copy.backToHub}
        </Link>
        <div className="flex items-center gap-2">
          <span className="exp-pill bg-exp-container text-exp-on-surface">
            {isSimulation ? copy.simulationLabel : copy.drillLabel}
          </span>
          <span className="exp-pill bg-exp-container text-exp-on-surface">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {formatClock(elapsed)}
          </span>
        </div>
      </div>

      <div className="rounded-3xl bg-exp-surface-lowest p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-exp-secondary">
              {trackLabel}
            </span>
            <span className="text-[10px] font-bold text-exp-outline">
              {question.level}
            </span>
          </div>
          <span className="text-[11px] font-bold text-exp-on-surface-variant">
            {interviewFill(copy.questionOf, {
              current: Math.min(index + 1, questions.length),
              total: questions.length,
            })}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5" aria-hidden="true">
          {questions.map((item, dotIndex) => (
            <span
              key={item.canonicalId}
              className={`h-1.5 flex-1 rounded-full ${
                dotIndex < Math.max(index, initialTurns.length)
                  ? "bg-exp-primary"
                  : dotIndex === index
                    ? "bg-exp-secondary"
                    : "bg-exp-container-highest"
              }`}
            />
          ))}
        </div>

        <h1 className="mt-4 text-xl font-extrabold leading-snug text-exp-on-surface sm:text-2xl">
          {question.prompt}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={playQuestion}
            className="inline-flex items-center gap-1.5 rounded-full bg-exp-container px-3 py-1.5 text-[11px] font-extrabold text-exp-on-surface hover:bg-exp-container-high"
          >
            <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.questionAudio}
          </button>
          <span className="text-[11px] font-semibold text-exp-outline">
            {interviewFill(copy.estimatedDuration, { seconds: Math.round((question.expectedLengthSec[0] + question.expectedLengthSec[1]) / 2) })}
          </span>
        </div>

        <details className="mt-3 rounded-xl bg-exp-surface-low px-3 py-2">
          <summary className="cursor-pointer text-[11px] font-extrabold text-exp-on-surface-variant">
            {copy.translationHint}
          </summary>
          <p className="mt-2 text-xs leading-5 text-exp-on-surface-variant">
            {question.translation}
          </p>
          {question.romanization && (
            <p className="mt-1 text-xs italic leading-5 text-exp-outline">
              {question.romanization}
            </p>
          )}
        </details>

        {initialTurns.length > 0 && index === initialTurns.length && (
          <p className="mt-3 rounded-xl bg-exp-secondary-fixed px-3 py-2 text-[11px] font-bold text-exp-secondary">
            {copy.resumeNote}
          </p>
        )}

        <label
          htmlFor="interview-answer"
          className="mt-4 block text-[11px] font-extrabold uppercase tracking-wide text-exp-on-surface-variant"
        >
          {copy.yourAnswer}
        </label>
        <textarea
          id="interview-answer"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault();
              void submit();
            }
          }}
          rows={7}
          maxLength={6000}
          disabled={savedPosition !== null || submitting}
          placeholder={copy.answerPlaceholder}
          className="mt-1 w-full resize-y rounded-2xl border border-exp-container-high bg-exp-surface px-3 py-3 text-sm leading-6 text-exp-on-surface outline-none focus:border-exp-primary disabled:opacity-80"
        />

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-exp-outline">
            <span>{interviewFill(copy.words, { count: words })}</span>
            <span aria-hidden="true">·</span>
            <span>
              {interviewFill(copy.estimatedDuration, { seconds: spokenSeconds })}
            </span>
          </div>
          <button
            type="button"
            onClick={toggleDictation}
            disabled={savedPosition !== null}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold ${
              listening
                ? "bg-exp-error text-exp-on-primary"
                : "bg-exp-container text-exp-on-surface hover:bg-exp-container-high"
            } disabled:opacity-50`}
          >
            {listening ? (
              <Square className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Mic className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {listening ? copy.recordStop : copy.recordStart}
          </button>
        </div>
        {listening && (
          <p aria-live="polite" className="mt-1 text-[11px] font-bold text-exp-primary">
            {copy.listening}
          </p>
        )}
        {micError && (
          <p role="alert" className="mt-1 text-[11px] font-bold text-exp-error">
            {micError}
          </p>
        )}
        {audioNote && (
          <p className="mt-1 text-[11px] font-semibold text-exp-outline">
            {audioNote}
          </p>
        )}

        {error && (
          <p role="alert" className="mt-3 rounded-xl bg-exp-error/10 px-3 py-2 text-xs font-bold text-exp-error">
            {error}
          </p>
        )}

        {savedPosition === null && (
          <button
            type="button"
            onClick={() => void submit()}
            disabled={words === 0 || submitting}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-exp-primary px-4 py-3 text-sm font-extrabold text-exp-on-primary shadow-[0_4px_0_var(--exp-primary)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {submitting ? copy.submitting : copy.submit}
          </button>
        )}
      </div>

      {savedPosition !== null && (
        <div aria-live="polite" className="rounded-3xl bg-exp-surface-lowest p-5 shadow-sm">
          {isSimulation ? (
            <div>
              <p className="text-sm font-extrabold text-exp-on-surface">
                {copy.feedbackHidden}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-exp-outline">
                {interviewFill(copy.words, { count: words })} ·{" "}
                {interviewFill(copy.estimatedDuration, { seconds: spokenSeconds })}
              </p>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-exp-secondary">
                    {copy.scoreLabel}
                  </p>
                  <p className="text-3xl font-extrabold text-exp-on-surface">
                    {evaluation?.readiness ?? "—"}
                    <span className="text-sm font-bold text-exp-outline">/100</span>
                  </p>
                </div>
                {evaluation && (
                  <div className="w-full max-w-xs">
                    <ScoreBars scores={evaluation.scores} labels={copy.dimension} />
                  </div>
                )}
              </div>

              {evaluation && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-exp-surface-low p-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-exp-secondary">
                      {copy.feedbackStrength}
                    </p>
                    <ul className="mt-1 flex flex-col gap-1">
                      {evaluation.feedback.strengths.length === 0 && (
                        <li className="text-xs font-semibold text-exp-on-surface-variant">—</li>
                      )}
                      {evaluation.feedback.strengths.slice(0, 2).map((code) => (
                        <li key={code} className="text-xs leading-5 text-exp-on-surface-variant">
                          {copy.feedback[code]}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-exp-surface-low p-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-exp-error">
                      {copy.feedbackImprove}
                    </p>
                    <ul className="mt-1 flex flex-col gap-1">
                      {evaluation.feedback.improvements.slice(0, 2).map((code) => (
                        <li key={code} className="text-xs leading-5 text-exp-on-surface-variant">
                          {copy.feedback[code]}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <p className="mt-3 text-[11px] font-bold text-exp-outline">
                {interviewFill(copy.words, { count: words })} ·{" "}
                {interviewFill(copy.estimatedDuration, { seconds: spokenSeconds })}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={advance}
            disabled={finishing}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-exp-primary px-4 py-3 text-sm font-extrabold text-exp-on-primary shadow-[0_4px_0_var(--exp-primary)] disabled:opacity-60 sm:w-auto"
          >
            {finishing && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {lastPosition === null ? copy.finish : copy.next}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
