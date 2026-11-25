"use client";

import { useTranslation } from "react-i18next";
import { useGrammar } from "./module-context";
import { LessonView } from "./lesson-view";
import { MultipleChoice } from "./multiple-choice";
import { FillBlank } from "./fill-blank";
import { SentenceOrdering } from "./sentence-ordering";
import { Correction } from "./correction";
import { GamificationBar } from "@/components/editor/shared/gamification-strip";
import { CEFR_LEVELS, PHASES } from "./types";
import {
  getLessonsByLevel,
  getLessonById,
  countLessonsByLevel,
} from "./grammar-data";
import {
  BookOpen,
  PencilLine,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useLearningLocale } from "@/components/editor/learning-locale-context";
import { CONTENT_LANGUAGE_LABELS, type ContentLanguage } from "@/lib/i18n/locales";

function PhaseNav() {
  const { t } = useTranslation();
  const { state, goToPhase } = useGrammar();
  const phaseIndex = PHASES.findIndex((p) => p.id === state.currentPhase);

  return (
    <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-exp-container-high px-6 py-2">
      {PHASES.map((phase, i) => {
        const active = state.currentPhase === phase.id;
        const done = i < phaseIndex;
        return (
          <button
            key={phase.id}
            type="button"
            onClick={() => goToPhase(phase.id)}
            disabled={!done && !active}
            aria-current={active ? "step" : undefined}
            className={`exp-chip shrink-0 ${
              active
                ? "exp-chip-active"
                : done
                  ? "text-exp-success"
                  : "cursor-not-allowed text-exp-on-surface-muted"
            }`}
          >
            {done && (
              <CheckCircle2
                className="mr-1 inline h-3 w-3 text-exp-success"
                aria-hidden="true"
              />
            )}
            {t(`learning.grammar.phases.${phase.id}`)}
          </button>
        );
      })}
    </div>
  );
}

function DashboardPhase() {
  const { t } = useTranslation();
  const { state, startLesson, setCefrLevel } = useGrammar();
  const { activeCefrLevel, completedLessonIds } = state;
  const lessons = getLessonsByLevel(activeCefrLevel);
  const levelCounts = countLessonsByLevel();
  const completedCount = lessons.filter((l) =>
    completedLessonIds.includes(l.id),
  ).length;

  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <h2 className="mb-3 text-lg font-extrabold text-exp-on-surface">
          {t("learning.grammar.selectLevel")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {CEFR_LEVELS.map((level) => {
            const isActive = activeCefrLevel === level.id;
            const count = levelCounts[level.id] ?? 0;
            const label = t(`learning.grammar.cefr.${level.id}.label`, {
              defaultValue: level.label,
            });
            return (
              <button
                key={level.id}
                type="button"
                onClick={() => setCefrLevel(level.id)}
                aria-pressed={isActive}
                className={`exp-chip shrink-0 px-4 py-2 text-sm ${
                  isActive ? "exp-chip-active" : ""
                }`}
              >
                {label}
                <span className="ml-1.5 text-xs opacity-70">
                  {t("learning.grammar.lessons", { count })}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {completedCount > 0 && (
        <div className="rounded-2xl border border-exp-container-high bg-exp-surface-lowest p-4">
          <div className="mb-2 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-exp-primary" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider text-exp-primary">
              {t("learning.grammar.levelProgress")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="exp-progress h-2.5 flex-1">
              <span
                style={{
                  width: `${lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="shrink-0 text-sm tabular-nums text-exp-on-surface-variant">
              {completedCount} / {lessons.length}
            </span>
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-exp-on-surface-variant">
          {t("learning.grammar.grammarLessons")} — {activeCefrLevel}
        </h3>
        <div className="grid gap-2">
          {lessons.map((lesson) => {
            const isCompleted = completedLessonIds.includes(lesson.id);
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => startLesson(lesson.id)}
                className="group flex items-center gap-4 rounded-2xl border border-exp-container-high bg-exp-surface-lowest p-4 text-left shadow-[0_3px_0_var(--exp-container-high)] transition-all duration-150 hover:-translate-y-0.5 hover:border-exp-outline-variant hover:bg-exp-surface-low"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-exp-tertiary-fixed text-exp-tertiary">
                  <BookOpen className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="truncate text-sm font-semibold text-exp-on-surface">
                      {lesson.title}
                    </h4>
                    {isCompleted && (
                      <CheckCircle2
                        className="h-3.5 w-3.5 shrink-0 text-exp-success"
                        aria-label={t("learning.grammar.correctCount")}
                      />
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-exp-on-surface-muted">
                      {lesson.categoryLabel}
                    </span>
                    <span className="text-xs text-exp-on-surface-muted">·</span>
                    <span className="text-xs capitalize text-exp-on-surface-muted">
                      {lesson.difficulty}
                    </span>
                    <span className="text-xs text-exp-on-surface-muted">·</span>
                    <span className="text-xs text-exp-on-surface-muted">
                      {t("learning.grammar.exercises", {
                        count: lesson.exercises.length,
                      })}
                    </span>
                  </div>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-exp-on-surface-muted transition-colors group-hover:text-exp-primary"
                  aria-hidden="true"
                />
              </button>
            );
          })}
          {lessons.length === 0 && (
            <div className="flex h-32 flex-col items-center justify-center text-exp-on-surface-muted">
              <BookOpen className="mb-2 h-6 w-6 opacity-50" aria-hidden="true" />
              <p className="text-sm">{t("learning.grammar.noLessons")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LessonPhase() {
  const { state, nextPhase } = useGrammar();
  const lesson = state.activeLessonId
    ? getLessonById(state.activeLessonId)
    : undefined;

  if (!lesson) {
    return <EmptyState messageKey="learning.grammar.notFound" />;
  }

  return <LessonView lesson={lesson} onStartPractice={nextPhase} />;
}

function PracticePhase() {
  const { t } = useTranslation();
  const { state, submitExercise, nextPhase } = useGrammar();
  const lesson = state.activeLessonId
    ? getLessonById(state.activeLessonId)
    : undefined;

  if (!lesson) {
    return <EmptyState messageKey="learning.grammar.notFound" />;
  }

  const exercise = lesson.exercises[state.currentExerciseIndex];

  if (!exercise) {
    return <EmptyState messageKey="learning.grammar.noExercises" />;
  }

  const exerciseLabels: Record<string, string> = {
    multiple_choice: t("learning.grammar.exerciseTypeMC"),
    fill_blank: t("learning.grammar.exerciseTypeFill"),
    ordering: t("learning.grammar.exerciseTypeOrdering"),
    correction: t("learning.grammar.exerciseTypeCorrection"),
  };

  const handleAnswer = (isCorrect: boolean, answer: string) => {
    submitExercise(exercise, isCorrect, answer);
  };

  const allDone =
    state.currentExerciseIndex >= lesson.exercises.length - 1 &&
    Object.keys(state.exerciseResults).length >= lesson.exercises.length;

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PencilLine className="h-4 w-4 text-exp-primary" aria-hidden="true" />
          <span className="text-sm font-medium text-exp-on-surface-variant">
            {exerciseLabels[exercise.type] ?? t("learning.common.question")}
          </span>
          <span className="text-xs text-exp-on-surface-muted">
            {t("learning.grammar.questionOf", {
              current: state.currentExerciseIndex + 1,
              total: lesson.exercises.length,
            })}
          </span>
        </div>
        <span className="text-xs font-medium text-exp-secondary">
          +{exercise.points} {t("learning.common.xp")}
        </span>
      </div>

      <div
        className="flex items-center gap-1.5"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={lesson.exercises.length}
        aria-valuenow={Object.keys(state.exerciseResults).length}
        aria-label={t("learning.grammar.questionOf", {
          current: state.currentExerciseIndex + 1,
          total: lesson.exercises.length,
        })}
      >
        {lesson.exercises.map((ex, i) => {
          const result = state.exerciseResults[ex.id];
          let color = "bg-exp-surface-low";
          if (result?.correct === true) color = "bg-exp-primary-container";
          else if (result?.correct === false) color = "bg-exp-error/70";
          if (i === state.currentExerciseIndex && !result)
            color = "bg-exp-primary-container/60";
          return (
            <div
              key={ex.id}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${color}`}
            />
          );
        })}
      </div>

      {!allDone && exercise.type === "multiple_choice" && (
        <MultipleChoice
          key={`${exercise.id}-${state.currentExerciseIndex}`}
          exercise={exercise}
          onAnswer={handleAnswer}
        />
      )}
      {!allDone && exercise.type === "fill_blank" && (
        <FillBlank
          key={`${exercise.id}-${state.currentExerciseIndex}`}
          exercise={exercise}
          onAnswer={handleAnswer}
        />
      )}
      {!allDone && exercise.type === "ordering" && (
        <SentenceOrdering
          key={`${exercise.id}-${state.currentExerciseIndex}`}
          exercise={exercise}
          onAnswer={handleAnswer}
        />
      )}
      {!allDone && exercise.type === "correction" && (
        <Correction
          key={`${exercise.id}-${state.currentExerciseIndex}`}
          exercise={exercise}
          onAnswer={handleAnswer}
        />
      )}

      {allDone && (
        <div className="flex flex-col items-center gap-4 pt-4 animate-fade-in-up">
          <div className="rounded-xl border border-exp-primary-container/20 bg-exp-primary-container/10 px-6 py-3 text-center">
            <CheckCircle2
              className="mx-auto mb-1 h-6 w-6 text-exp-primary"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold text-exp-primary">
              {t("learning.grammar.allDoneTitle")}
            </p>
            <p className="mt-1 text-xs text-exp-on-surface-variant">
              {t("learning.grammar.allDoneBody")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => nextPhase()}
            className="exp-btn exp-btn-primary"
          >
            {t("learning.grammar.seeResults")}
          </button>
        </div>
      )}
    </div>
  );
}

function ResultsPhase() {
  const { t } = useTranslation();
  const { state, returnToDashboard, startLesson } = useGrammar();
  const lesson = state.activeLessonId
    ? getLessonById(state.activeLessonId)
    : undefined;

  if (!lesson) {
    return <EmptyState messageKey="learning.grammar.noResults" />;
  }

  const results = lesson.exercises.map((ex) => {
    const correctAnswer = Array.isArray(ex.correctAnswer)
      ? ex.correctAnswer[0] ?? ""
      : ex.correctAnswer;
    return {
      ...ex,
      correctAnswer,
      result: state.exerciseResults[ex.id],
    };
  });
  const correctCount = results.filter((r) => r.result?.correct).length;
  const totalPoints = results.reduce(
    (sum, r) => sum + (r.result?.points ?? 0),
    0,
  );
  const accuracy =
    results.length > 0
      ? Math.round((correctCount / results.length) * 100)
      : 0;

  const allLessons = getLessonsByLevel(state.activeCefrLevel);
  const currentIdx = allLessons.findIndex((l) => l.id === state.activeLessonId);
  const nextLesson =
    currentIdx >= 0 && currentIdx < allLessons.length - 1
      ? allLessons[currentIdx + 1]
      : null;

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex flex-col items-center py-4">
        <div className="relative mb-4 h-28 w-28">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--exp-surface-low)"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--exp-primary-container)"
              strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - accuracy / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-exp-on-surface">
              {accuracy}%
            </span>
            <span className="text-xs text-exp-on-surface-muted">
              {t("learning.grammar.accuracy")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="font-semibold tabular-nums text-exp-success">
              {correctCount}/{results.length}
            </p>
            <p className="text-xs text-exp-on-surface-muted">
              {t("learning.grammar.correctCount")}
            </p>
          </div>
          <div className="h-8 w-px bg-exp-container-high" aria-hidden="true" />
          <div className="text-center">
            <p className="font-semibold tabular-nums text-exp-secondary">
              +{totalPoints}
            </p>
            <p className="text-xs text-exp-on-surface-muted">
              {t("learning.grammar.xpEarned")}
            </p>
          </div>
          <div className="h-8 w-px bg-exp-container-high" aria-hidden="true" />
          <div className="text-center">
            <p className="font-semibold text-exp-on-surface">{lesson.title}</p>
            <p className="text-xs text-exp-on-surface-muted">
              {t("learning.grammar.lessonLabel")}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-exp-on-surface-variant">
          {t("learning.grammar.exerciseReview")}
        </h3>
        {results.map((ex, i) => {
          const correct = ex.result?.correct;
          return (
            <div
              key={ex.id}
              className={`flex items-start gap-3 rounded-xl border p-3 ${
                correct
                  ? "border-exp-success/20 bg-exp-primary-container/5"
                  : "border-exp-error/20 bg-exp-error/5"
              }`}
            >
              <div
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  correct
                    ? "bg-exp-primary-container/20 text-exp-success"
                    : "bg-exp-error/20 text-exp-error"
                }`}
                aria-hidden="true"
              >
                <span className="text-xs font-bold">{correct ? "✓" : "✗"}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-exp-on-surface-muted">
                    {i + 1}.
                  </span>
                  <p className="line-clamp-1 text-sm text-exp-on-surface">
                    {ex.question}
                  </p>
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-exp-on-surface-variant">
                  {ex.explanation}
                </p>
                {!correct && ex.result?.answer && (
                  <p className="mt-1 text-xs text-exp-on-surface-muted">
                    {t("learning.feedback.yourAnswer")}: {ex.result.answer}
                  </p>
                )}
                {!correct && (
                  <p className="mt-0.5 text-xs text-exp-on-surface-muted">
                    {t("learning.feedback.correctAnswer")}: {ex.correctAnswer}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-3 pt-2 pb-8">
        <button
          type="button"
          onClick={returnToDashboard}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-exp-container-high bg-exp-surface-low px-6 py-2.5 text-sm text-exp-on-surface-variant transition-colors hover:bg-exp-container-high hover:text-exp-on-surface"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("learning.grammar.backToLessons")}
        </button>
        {nextLesson && (
          <button
            type="button"
            onClick={() => startLesson(nextLesson.id)}
            className="exp-btn exp-btn-primary"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {t("learning.grammar.nextLesson", { lesson: nextLesson.title })}
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ messageKey }: { messageKey: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex h-48 items-center justify-center">
      <p className="text-sm text-exp-on-surface-muted">{t(messageKey)}</p>
    </div>
  );
}

interface GrammarModuleProps {
  lang?: ContentLanguage;
}

export function GrammarModule({ lang = "en" }: GrammarModuleProps) {
  const { t } = useTranslation();
  const { uiLocale } = useLearningLocale();
  const { state, returnToDashboard } = useGrammar();

  if (lang !== "en") {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-exp-secondary-fixed text-exp-secondary">
          <BookOpen className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="text-base font-extrabold text-exp-on-surface">
          {t("learning.grammar.title")}
        </p>
        <p className="max-w-sm text-xs font-medium leading-5 text-exp-on-surface-variant">
          {t("learning.dashboard.unavailableNote", {
            language: CONTENT_LANGUAGE_LABELS[lang],
          })}
        </p>
        <Link
          href={`/${uiLocale}/profile`}
          className="exp-btn exp-btn-soft mt-1 text-xs"
        >
          {t("learning.shell.editLearningLanguage")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-exp-surface">
      <GamificationBar
        xp={state.gamification.xp}
        level={state.gamification.level}
        lives={state.gamification.lives}
        streak={state.gamification.streak}
      />

      {state.currentPhase !== "dashboard" && <PhaseNav />}

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 py-6">
          {state.currentPhase !== "dashboard" && (
            <button
              type="button"
              onClick={returnToDashboard}
              className="mb-4 flex min-h-11 items-center gap-1.5 text-xs text-exp-on-surface-muted transition-colors hover:text-exp-on-surface-variant"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {t("learning.grammar.allLessons")}
            </button>
          )}

          {state.currentPhase === "dashboard" && <DashboardPhase />}
          {state.currentPhase === "lesson" && <LessonPhase />}
          {state.currentPhase === "practice" && <PracticePhase />}
          {state.currentPhase === "results" && <ResultsPhase />}
        </div>
      </div>
    </div>
  );
}
