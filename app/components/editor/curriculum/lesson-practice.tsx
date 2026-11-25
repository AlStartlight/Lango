"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import type {
  AttemptResult,
  LessonCompletionResult,
  LessonDetailDto,
  QuestionDto,
} from "@/lib/learning/curriculum";

interface LessonPracticeProps {
  lesson: LessonDetailDto;
  onExit: () => void;
  onFinished: (result: LessonCompletionResult) => void;
}

function normalizeStartIndex(lesson: LessonDetailDto): number {
  const total = lesson.questions.length;
  if (total === 0) return 0;
  if (lesson.progress.status === "completed" || lesson.progress.status === "mastered") {
    return 0;
  }
  return Math.min(Math.max(lesson.progress.currentExerciseIndex, 0), total - 1);
}

export function LessonPractice({
  lesson,
  onExit,
  onFinished,
}: LessonPracticeProps) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(() => normalizeStartIndex(lesson));
  const [feedback, setFeedback] = useState<AttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");
  const attemptIds = useRef(new Map<string, string>());

  const question = lesson.questions[index];
  const total = lesson.questions.length;
  const isLast = index === total - 1;

  function attemptIdFor(questionId: string): string {
    const existing = attemptIds.current.get(questionId);
    if (existing) return existing;
    const id = crypto.randomUUID();
    attemptIds.current.set(questionId, id);
    return id;
  }

  async function submitAnswer(answer: unknown) {
    if (!question || submitting || feedback) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/v1/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientAttemptId: attemptIdFor(question.id),
          questionId: question.id,
          answer,
          timeSpentMs: 0,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setError(body?.error?.message ?? t("curriculum.error"));
        return;
      }
      setFeedback(body.data as AttemptResult);
    } catch {
      setError(t("curriculum.error"));
    } finally {
      setSubmitting(false);
    }
  }

  async function completeLesson() {
    setCompleting(true);
    setError("");
    try {
      const response = await fetch(
        `/api/v1/lessons/${encodeURIComponent(lesson.id)}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId: lesson.id }),
        },
      );
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setError(body?.error?.message ?? t("curriculum.error"));
        return;
      }
      onFinished(body.data as LessonCompletionResult);
    } catch {
      setError(t("curriculum.error"));
    } finally {
      setCompleting(false);
    }
  }

  function next() {
    setFeedback(null);
    setError("");
    if (isLast) {
      void completeLesson();
    } else {
      setIndex((value) => Math.min(value + 1, total - 1));
    }
  }

  if (total === 0) {
    return (
      <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-exp-on-surface-variant">{t("curriculum.noQuestions")}</p>
        <button
          type="button"
          onClick={onExit}
          className="min-h-11 rounded-xl border border-exp-container-high px-4 text-sm font-medium text-exp-on-surface"
        >
          {t("curriculum.backToLessons")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-exp-surface">
      <div className="sticky top-0 z-20 border-b border-exp-container-high bg-exp-surface-lowest/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={onExit}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-exp-on-surface-variant hover:bg-exp-container"
            aria-label={t("curriculum.backToLessons")}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-exp-on-surface">
              {lesson.title}
            </p>
            <p className="text-xs text-exp-on-surface-muted">
              {t("curriculum.questionOf", {
                current: index + 1,
                total,
              })}
            </p>
          </div>
          <div className="exp-progress w-28 shrink-0">
            <span style={{ width: `${((index + 1) / total) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <QuestionCard
          key={question.id}
          question={question}
          disabled={Boolean(feedback) || submitting}
          onSubmit={submitAnswer}
        />

        {submitting && (
          <p className="mt-4 flex items-center gap-2 text-sm text-exp-on-surface-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {t("curriculum.loading")}
          </p>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-exp-error/30 bg-exp-error/5 px-4 py-3 text-sm text-exp-error">
            {error}
          </p>
        )}

        {feedback && (
          <div
            role="status"
            aria-live="polite"
            className={`mt-5 rounded-2xl border-2 p-4 ${
              feedback.correct
                ? "border-exp-success/40 bg-exp-primary-container/5"
                : "border-exp-error/40 bg-exp-error/5"
            }`}
          >
            <div className="flex items-start gap-2">
              {feedback.correct ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-exp-success" aria-hidden="true" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-exp-error" aria-hidden="true" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-exp-on-surface">
                  {feedback.correct
                    ? t("curriculum.correct")
                    : t("curriculum.incorrect")}
                </p>
                {!feedback.correct && (
                  <p className="mt-1 text-sm text-exp-on-surface-variant">
                    {t("curriculum.correctAnswer", {
                      answer: feedback.correctAnswer,
                    })}
                  </p>
                )}
                {feedback.explanation && (
                  <p className="mt-2 text-sm leading-relaxed text-exp-on-surface-variant">
                    {feedback.explanation}
                  </p>
                )}
                {feedback.xpAwarded > 0 && (
                  <p className="mt-1 text-xs font-medium text-exp-primary">
                    {t("curriculum.xpEarned", { count: feedback.xpAwarded })}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onExit}
            className="min-h-11 rounded-xl px-3 text-sm text-exp-on-surface-muted hover:bg-exp-container"
          >
            {t("curriculum.back")}
          </button>

          {feedback ? (
            <button
              type="button"
              onClick={next}
              disabled={completing}
              className="exp-btn exp-btn-primary disabled:opacity-60"
            >
              {completing ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              {isLast ? t("curriculum.finish") : t("curriculum.next")}
              {!completing && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </button>
          ) : (
            <button
              form="curriculum-question-form"
              type="submit"
              disabled={submitting}
              className="exp-btn exp-btn-primary disabled:opacity-60"
            >
              {submitting && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {t("curriculum.check")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  disabled,
  onSubmit,
}: {
  question: QuestionDto;
  disabled: boolean;
  onSubmit: (answer: unknown) => void;
}) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string>("");
  const [text, setText] = useState("");
  const [ordered, setOrdered] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>(() =>
    question.choices.map((choice) => choice.label),
  );

  const isOrdering = question.type === "ordering";
  const isFill = question.type === "fill_blank" || question.type === "correction";

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;
    if (isOrdering) {
      if (ordered.length > 0) onSubmit({ order: ordered });
      return;
    }
    if (isFill) {
      if (text.trim()) onSubmit(text.trim());
      return;
    }
    if (selected) onSubmit({ choiceId: selected });
  }

  const canSubmit = isOrdering
    ? ordered.length > 0
    : isFill
      ? text.trim().length > 0
      : Boolean(selected);

  return (
    <form id="curriculum-question-form" onSubmit={submit}>
      {question.passage && (
        <div className="mb-4 rounded-2xl border border-exp-container-high bg-exp-surface-lowest p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-exp-on-surface-muted">
            {question.passage.title}
          </p>
          {question.passage.body && (
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-exp-on-surface-variant">
              {question.passage.body}
            </p>
          )}
          {question.passage.audioUrl && (
            <audio className="mt-3 w-full" controls src={question.passage.audioUrl} />
          )}
        </div>
      )}

      <h2 className="text-xl font-extrabold leading-relaxed text-exp-on-surface">
        {question.prompt}
      </h2>
      {question.audioUrl && (
        <audio className="mt-3 w-full" controls src={question.audioUrl} />
      )}

      {isOrdering ? (
        <div className="mt-5">
          <p className="text-xs text-exp-on-surface-muted">{t("curriculum.orderingHint")}</p>
          <div
            className="mt-2 flex min-h-14 flex-wrap items-center gap-2 rounded-xl border border-dashed border-exp-container-high bg-exp-surface-lowest p-2"
            aria-live="polite"
          >
            {ordered.length === 0 ? (
              <span className="px-2 text-sm text-exp-on-surface-muted">—</span>
            ) : (
              ordered.map((token, tokenIndex) => (
                <button
                  key={`${token}-${tokenIndex}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setOrdered((value) => value.filter((_, i) => i !== tokenIndex));
                    setAvailable((value) => [...value, token]);
                  }}
                  className="min-h-10 rounded-lg bg-exp-primary-container/10 px-3 text-sm text-exp-primary"
                >
                  {token}
                </button>
              ))
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {available.map((token, tokenIndex) => (
              <button
                key={`${token}-${tokenIndex}`}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setAvailable((value) => value.filter((_, i) => i !== tokenIndex));
                  setOrdered((value) => [...value, token]);
                }}
                className="min-h-10 rounded-lg border border-exp-container-high bg-exp-surface-lowest px-3 text-sm text-exp-on-surface hover:bg-exp-container disabled:opacity-50"
              >
                {token}
              </button>
            ))}
          </div>
        </div>
      ) : isFill ? (
        <div className="mt-5">
          <label htmlFor="curriculum-answer" className="text-xs text-exp-on-surface-muted">
            {t("curriculum.fillHint")}
          </label>
          <input
            id="curriculum-answer"
            value={text}
            onChange={(event) => setText(event.target.value)}
            disabled={disabled}
            autoComplete="off"
            placeholder={t("curriculum.answerPlaceholder")}
            className="mt-1 min-h-11 w-full rounded-xl border border-exp-container-high bg-exp-surface-lowest px-4 text-sm text-exp-on-surface outline-none focus:border-exp-primary-container focus:ring-2 focus:ring-exp-primary/20"
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-2" role="radiogroup">
          {question.choices.map((choice, choiceIndex) => {
            const active = selected === choice.id;
            return (
              <button
                key={choice.id}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={disabled}
                onClick={() => setSelected(choice.id)}
                className={`exp-answer ${active ? "exp-answer-selected" : ""} disabled:opacity-70`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-exp-container text-xs font-extrabold text-exp-on-surface-variant"
                    aria-hidden="true"
                  >
                    {String.fromCharCode(65 + choiceIndex)}
                  </span>
                  <span className="min-w-0 text-left">{choice.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <button type="submit" className="sr-only" disabled={!canSubmit || disabled}>
        {t("curriculum.check")}
      </button>
    </form>
  );
}

export function LessonResults({
  lesson,
  result,
  onBack,
}: {
  lesson: LessonDetailDto;
  result: LessonCompletionResult;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const passed = result.accuracy >= 80;

  return (
    <div className="flex h-full flex-col items-center justify-center overflow-y-auto bg-exp-surface px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-exp-container-high bg-exp-surface-lowest p-6 text-center">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
            passed ? "bg-exp-primary-container/10" : "bg-exp-secondary-container/10"
          }`}
        >
          {passed ? (
            <CheckCircle2 className="h-7 w-7 text-exp-success" aria-hidden="true" />
          ) : (
            <RotateCcw className="h-7 w-7 text-exp-secondary" aria-hidden="true" />
          )}
        </div>
        <h2 className="mt-4 text-xl font-bold text-exp-on-surface">
          {t("curriculum.resultsTitle")}
        </h2>
        <p className="mt-1 text-sm text-exp-on-surface-variant">{lesson.title}</p>

        <dl className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-exp-surface-low p-3">
            <dt className="text-xs text-exp-on-surface-muted">{t("curriculum.accuracy")}</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-exp-on-surface">
              {result.accuracy}%
            </dd>
          </div>
          <div className="rounded-xl bg-exp-surface-low p-3">
            <dt className="text-xs text-exp-on-surface-muted">{t("learning.common.xp")}</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-exp-primary">
              +{result.xpAwarded}
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-sm text-exp-on-surface-variant">
          {t("curriculum.correctCount", {
            correct: result.correct,
            total: result.total,
          })}
        </p>

        <button
          type="button"
          onClick={onBack}
          className="mt-6 exp-btn exp-btn-primary w-full"
        >
          {t("curriculum.backToLessons")}
        </button>
      </div>
    </div>
  );
}
