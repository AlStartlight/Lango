"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Play,
  RefreshCw,
} from "lucide-react";
import { useLearningLocale } from "@/components/editor/learning-locale-context";
import {
  CONTENT_LANGUAGE_LABELS,
  LANGUAGE_REGISTRY,
  type CurriculumLevelCode,
} from "@/lib/i18n/locales";
import type {
  CurriculumProgress,
  CurriculumSummary,
  LessonCompletionResult,
  LessonDetailDto,
  LessonSummary,
} from "@/lib/learning/curriculum";
import { LessonPractice, LessonResults } from "./lesson-practice";

type View = "lessons" | "lesson" | "practice" | "results";

async function apiGet<T>(url: string): Promise<{ data?: T; status: number; code?: string }> {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const body = await response.json().catch(() => null);
  return {
    status: response.status,
    data: body?.data as T | undefined,
    code: body?.error?.code as string | undefined,
  };
}

export function CurriculumModule() {
  const { t } = useTranslation();
  const { uiLocale, contentLanguage, curriculumLevel } = useLearningLocale();
  const [summary, setSummary] = useState<CurriculumSummary | null>(null);
  const [progress, setProgress] = useState<CurriculumProgress | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<CurriculumLevelCode | null>(null);
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [lesson, setLesson] = useState<LessonDetailDto | null>(null);
  const [view, setView] = useState<View>("lessons");
  const [result, setResult] = useState<LessonCompletionResult | null>(null);
  const [loadingCurriculum, setLoadingCurriculum] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [error, setError] = useState("");
  const [deepLessonId] = useState(() =>
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("lesson"),
  );

  const language = LANGUAGE_REGISTRY[contentLanguage];
  const level = selectedLevel ?? summary?.levels[0]?.code ?? null;

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      apiGet<CurriculumSummary>(`/api/v1/curricula/${contentLanguage}`),
      apiGet<CurriculumProgress>(
        `/api/v1/progress/curriculum?language=${contentLanguage}`,
      ),
    ])
      .then(([curriculumResponse, progressResponse]) => {
        if (cancelled) return;
        if (curriculumResponse.status === 404 || !curriculumResponse.data) {
          setSummary(null);
          return;
        }
        setSummary(curriculumResponse.data);
        if (progressResponse.data) setProgress(progressResponse.data);
        const preferred = curriculumResponse.data.levels.find(
          (entry) => entry.code === curriculumLevel,
        );
        setSelectedLevel(
          preferred?.code ?? curriculumResponse.data.levels[0]?.code ?? null,
        );
      })
      .catch(() => {
        if (!cancelled) setError(t("curriculum.error"));
      })
      .finally(() => {
        if (!cancelled) setLoadingCurriculum(false);
      });

    return () => {
      cancelled = true;
    };
  }, [contentLanguage, curriculumLevel, t]);

  useEffect(() => {
    if (!level) return;
    let cancelled = false;

    apiGet<{ lessons: LessonSummary[] }>(
      `/api/v1/curricula/${contentLanguage}/levels/${level}/lessons`,
    )
      .then((response) => {
        if (cancelled) return;
        if (response.data) {
          setLessons(response.data.lessons);
        } else {
          setLessons([]);
        }
      })
      .catch(() => {
        if (!cancelled) setError(t("curriculum.error"));
      })
      .finally(() => {
        if (!cancelled) setLoadingLessons(false);
      });

    return () => {
      cancelled = true;
    };
  }, [contentLanguage, level, t]);

  const grouped = useMemo(() => {
    const groups = new Map<string, { title: string; lessons: LessonSummary[] }>();
    for (const entry of lessons) {
      const group = groups.get(entry.unitId) ?? {
        title: entry.unitTitle,
        lessons: [],
      };
      group.lessons.push(entry);
      groups.set(entry.unitId, group);
    }
    return [...groups.entries()];
  }, [lessons]);

  const openLesson = useCallback(async (id: string) => {
    setLoadingLesson(true);
    setError("");
    try {
      const response = await apiGet<LessonDetailDto>(
        `/api/v1/lessons/${encodeURIComponent(id)}`,
      );
      if (!response.data) {
        setError(t("curriculum.error"));
        return;
      }
      setLesson(response.data);
      setView("lesson");
    } catch {
      setError(t("curriculum.error"));
    } finally {
      setLoadingLesson(false);
    }
  }, [t]);

  useEffect(() => {
    if (deepLessonId) {
      // Deep link from the review queue: fetch the lesson on mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void openLesson(deepLessonId);
    }
  }, [deepLessonId, openLesson]);

  function refreshAfterCompletion(completed: LessonCompletionResult) {
    setResult(completed);
    setView("results");
    void apiGet<CurriculumProgress>(
      `/api/v1/progress/curriculum?language=${contentLanguage}`,
    ).then((response) => {
      if (response.data) setProgress(response.data);
    });
    if (level) {
      void apiGet<{ lessons: LessonSummary[] }>(
        `/api/v1/curricula/${contentLanguage}/levels/${level}/lessons`,
      ).then((response) => {
        if (response.data) setLessons(response.data.lessons);
      });
    }
  }

  function backToLessons() {
    setView("lessons");
    setLesson(null);
    setResult(null);
  }

  if (loadingCurriculum) {
    return (
      <ModuleSkeleton label={t("curriculum.loading")} />
    );
  }

  if (!summary) {
    return (
      <div className="flex h-full flex-col items-center justify-center overflow-y-auto bg-exp-surface px-6 py-16">
        <div className="w-full max-w-lg rounded-2xl border border-exp-container-high bg-exp-surface-lowest p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-exp-surface-low">
            <BookOpenCheck className="h-6 w-6 text-exp-on-surface-muted" aria-hidden="true" />
          </div>
          <h2 className="mt-3 text-lg font-semibold text-exp-on-surface">
            {t("curriculum.emptyTitle")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-exp-on-surface-variant">
            {t("curriculum.emptyBody")}
          </p>
          <p className="mt-1 text-sm font-medium text-exp-on-surface">
            {CONTENT_LANGUAGE_LABELS[contentLanguage]}
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href={`/${uiLocale}/profile#bahasa`}
              className="exp-btn exp-btn-primary"
            >
              {t("curriculum.changeLanguage")}
            </Link>
            <button
              type="button"
              onClick={() => {
                setLoadingCurriculum(true);
                window.location.reload();
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-exp-container-high px-4 text-sm font-medium text-exp-on-surface hover:bg-exp-container"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {t("curriculum.retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "practice" && lesson) {
    return (
      <LessonPractice
        lesson={lesson}
        onExit={() => setView("lesson")}
        onFinished={refreshAfterCompletion}
      />
    );
  }

  if (view === "results" && lesson && result) {
    return (
      <LessonResults lesson={lesson} result={result} onBack={backToLessons} />
    );
  }

  if (view === "lesson" && lesson) {
    return (
      <LessonOverview
        lesson={lesson}
        loading={loadingLesson}
        onBack={backToLessons}
        onStart={() => setView("practice")}
      />
    );
  }

  const completed = progress?.completedLessons ?? 0;
  const totalLessons = progress?.totalLessons ?? summary.totalLessons;

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-exp-surface">
      <header className="border-b border-exp-container-high px-6 pb-5 pt-8 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-exp-primary">
              {t("curriculum.title")}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-exp-on-surface">
              {language.label}
            </h1>
            <p className="mt-1 text-sm text-exp-on-surface-variant">
              {summary.framework} · {summary.levels.length} level ·{" "}
              {t("curriculum.questions", { count: summary.totalQuestions })}
            </p>
          </div>
          <div className="min-w-48">
            <div className="flex items-center justify-between text-xs text-exp-on-surface-muted">
              <span>{t("curriculum.levelProgress", {
                completed,
                total: totalLessons,
              })}</span>
              <span>{progress?.accuracyPercent ?? 0}%</span>
            </div>
            <div className="exp-progress mt-1.5 h-2.5">
              <span
                style={{
                  width: `${totalLessons > 0 ? Math.min(100, Math.round((completed / totalLessons) * 100)) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {summary.levels.map((entry) => {
            const active = entry.code === level;
            const levelProgress = progress?.levels.find(
              (row) => row.code === entry.code,
            );
            return (
              <button
                key={entry.code}
                type="button"
                onClick={() => {
                  if (entry.code !== level) {
                    setLoadingLessons(true);
                    setError("");
                    setSelectedLevel(entry.code);
                  }
                }}
                aria-pressed={active}
                className={`min-h-11 rounded-xl border-2 px-3 text-left text-sm transition-all duration-150 ${
                  active
                    ? "border-exp-primary-container bg-exp-primary-container/10 text-exp-on-surface shadow-[0_3px_0_var(--exp-primary)]"
                    : "border-exp-container-high bg-exp-surface-lowest text-exp-on-surface-variant shadow-[0_3px_0_var(--exp-container-highest)] hover:-translate-y-0.5 hover:bg-exp-surface-low"
                }`}
              >
                <span className="block font-semibold">{entry.code}</span>
                <span className="block text-xs text-exp-on-surface-muted">
                  {t("curriculum.levelProgress", {
                    completed: levelProgress?.completedLessons ?? 0,
                    total: entry.lessons,
                  })}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-exp-on-surface-muted">
          {t("curriculum.availabilityNote")}
        </p>
      </header>

      <div className="flex-1 px-6 py-6 sm:px-8">
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-exp-error/30 bg-exp-error/5 px-4 py-3 text-sm text-exp-error"
          >
            {error}
          </p>
        )}

        {loadingLessons ? (
          <ModuleSkeleton label={t("curriculum.loading")} compact />
        ) : grouped.length === 0 ? (
          <p className="rounded-xl border border-dashed border-exp-container-high px-4 py-8 text-center text-sm text-exp-on-surface-muted">
            {t("curriculum.emptyBody")}
          </p>
        ) : (
          <div className="space-y-7">
            {grouped.map(([unitId, group], groupIndex) => (
              <section key={unitId}>
                <h2 className="text-xs font-medium uppercase tracking-wider text-exp-on-surface-muted">
                  {group.title}
                </h2>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {group.lessons.map((entry) => {
                    const completedEntry =
                      entry.progress.status === "completed" ||
                      entry.progress.status === "mastered";
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => void openLesson(entry.id)}
                        className="group flex min-h-24 items-start gap-3 rounded-xl border border-exp-container-high bg-exp-surface-lowest p-4 text-left shadow-[0_3px_0_var(--exp-container-high)] transition-all duration-150 hover:-translate-y-0.5 hover:border-exp-outline-variant hover:bg-exp-surface-low"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-exp-surface-low text-sm font-semibold text-exp-on-surface-variant">
                          {groupIndex + 1}.{entry.position}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold text-exp-on-surface">
                              {entry.title}
                            </h3>
                            {completedEntry && (
                              <CheckCircle2
                                className="h-4 w-4 shrink-0 text-exp-success"
                                aria-label={t("curriculum.completed")}
                              />
                            )}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-exp-on-surface-muted">
                            {entry.objective}
                          </p>
                          <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-exp-on-surface-muted">
                            <span className="rounded-full bg-exp-surface-low px-2 py-0.5">
                              {t("curriculum.questions", {
                                count: entry.questionCount,
                              })}
                            </span>
                            <span>
                              {t("curriculum.minutes", {
                                count: entry.estimatedMinutes,
                              })}
                            </span>
                            {entry.progress.status === "in_progress" && (
                              <span className="font-medium text-exp-primary">
                                {t("curriculum.inProgress")}
                              </span>
                            )}
                          </p>
                        </div>
                        <ArrowRight
                          className="mt-1 h-4 w-4 shrink-0 text-exp-on-surface-muted transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {loadingLesson && (
          <p className="mt-4 flex items-center gap-2 text-sm text-exp-on-surface-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {t("curriculum.loading")}
          </p>
        )}
      </div>
    </div>
  );
}

function LessonOverview({
  lesson,
  loading,
  onBack,
  onStart,
}: {
  lesson: LessonDetailDto;
  loading: boolean;
  onBack: () => void;
  onStart: () => void;
}) {
  const { t } = useTranslation();
  const started = lesson.progress.status !== "not_started";

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-exp-surface">
      <div className="border-b border-exp-container-high px-6 pb-5 pt-8 sm:px-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-exp-on-surface-muted hover:text-exp-on-surface"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          {t("curriculum.backToLessons")}
        </button>
        <p className="mt-3 text-xs font-medium uppercase tracking-widest text-exp-primary">
          {lesson.level} · {t("curriculum.lesson")}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-exp-on-surface">
          {lesson.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-exp-on-surface-variant">
          {lesson.objective}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onStart}
            disabled={loading}
            className="exp-btn exp-btn-primary disabled:opacity-60"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            {started ? t("curriculum.resume") : t("curriculum.start")}
          </button>
          <span className="text-xs text-exp-on-surface-muted">
            {t("curriculum.questions", { count: lesson.questions.length })} ·{" "}
            {t("curriculum.minutes", { count: lesson.estimatedMinutes })}
          </span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-6 sm:px-8">
        <h2 className="text-sm font-semibold text-exp-on-surface">
          {t("curriculum.materials")}
        </h2>
        <div className="mt-3 space-y-3">
          {lesson.materials.map((block, index) => (
            <div
              key={`${block.type}-${index}`}
              className="rounded-xl border border-exp-container-high bg-exp-surface-lowest p-4"
            >
              {"text" in block && block.text && (
                <p className="text-sm leading-relaxed text-exp-on-surface-variant">
                  {block.text}
                </p>
              )}
              {Array.isArray(block.items) &&
                block.items.length > 0 && (
                  <ul className="space-y-1.5">
                    {block.items.map((item, itemIndex) => {
                      if (typeof item === "string") {
                        return (
                          <li
                            key={itemIndex}
                            className="text-sm leading-relaxed text-exp-on-surface-variant"
                          >
                            {item}
                          </li>
                        );
                      }
                      const example = item as {
                        correct?: string;
                        annotation?: string;
                      };
                      return (
                        <li
                          key={itemIndex}
                          className="rounded-lg bg-exp-surface-low px-3 py-2"
                        >
                          <p className="text-sm font-medium text-exp-on-surface">
                            {example.correct}
                          </p>
                          {example.annotation && (
                            <p className="mt-0.5 text-xs text-exp-on-surface-muted">
                              {example.annotation}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModuleSkeleton({ label, compact }: { label: string; compact?: boolean }) {
  return (
    <div
      className={`flex ${compact ? "" : "h-full"} flex-col gap-3 bg-exp-surface p-6`}
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>
      {!compact && (
        <>
          <div className="h-7 w-52 animate-pulse rounded-lg bg-exp-surface-low" />
          <div className="h-4 w-72 animate-pulse rounded bg-exp-surface-low" />
        </>
      )}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="h-24 animate-pulse rounded-xl bg-exp-surface-lowest" />
        <div className="h-24 animate-pulse rounded-xl bg-exp-surface-lowest" />
        <div className="h-24 animate-pulse rounded-xl bg-exp-surface-lowest" />
        <div className="h-24 animate-pulse rounded-xl bg-exp-surface-lowest" />
      </div>
    </div>
  );
}
