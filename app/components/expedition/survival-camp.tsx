"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  BookPlus,
  CalendarCheck,
  CheckCircle2,
  Compass,
  Flame,
  Gem,
  Hash,
  Heart,
  Mic,
  PencilLine,
  RotateCcw,
  Sparkles,
  Swords,
  Target,
  Timer,
  Trophy,
} from "lucide-react";
import { useLearningLocale } from "@/components/editor/learning-locale-context";
import { LangoMascot } from "@/components/expedition/art";
import {
  CONTENT_LANGUAGE_LABELS,
  getLocaleDefinition,
} from "@/lib/i18n/locales";

export type SurvivalModuleId =
  | "curriculum"
  | "number-name"
  | "grammar"
  | "lesson-planner"
  | "vocabulary"
  | "speaking";

export type SurvivalModuleStatus = "ready" | "coming-soon" | "unavailable";

export interface SurvivalModuleMeta {
  id: SurvivalModuleId;
  icon: typeof Hash;
  accentClass: string;
}

/**
 * Drill catalogue for the Survival & Trial camp. Availability is derived from
 * the learner's content language so the hub never advertises a drill the
 * module itself would refuse to open.
 */
export const SURVIVAL_MODULES: readonly SurvivalModuleMeta[] = [
  {
    id: "curriculum",
    icon: BookOpenCheck,
    accentClass: "bg-exp-primary-container/15 text-exp-primary",
  },
  {
    id: "number-name",
    icon: Hash,
    accentClass: "bg-exp-tertiary-fixed text-exp-tertiary",
  },
  {
    id: "grammar",
    icon: PencilLine,
    accentClass: "bg-exp-secondary-fixed text-exp-secondary",
  },
  {
    id: "lesson-planner",
    icon: BookOpen,
    accentClass: "bg-exp-surface-low text-exp-on-surface-muted",
  },
  {
    id: "vocabulary",
    icon: BookPlus,
    accentClass: "bg-exp-surface-low text-exp-on-surface-muted",
  },
  {
    id: "speaking",
    icon: Mic,
    accentClass: "bg-exp-surface-low text-exp-on-surface-muted",
  },
];

const NUMBER_NAME_LANGUAGES = ["en", "es", "fr", "de", "id", "ja"];

export function getSurvivalModuleStatus(
  id: SurvivalModuleId,
  contentLanguage: string,
): SurvivalModuleStatus {
  if (id === "curriculum") return "ready";
  if (id === "number-name") {
    return NUMBER_NAME_LANGUAGES.includes(contentLanguage)
      ? "ready"
      : "unavailable";
  }
  if (id === "grammar") {
    return contentLanguage === "en" ? "ready" : "unavailable";
  }
  return "coming-soon";
}

interface HomeToday {
  streakCurrent: number;
  xpTotal: number;
  xpToday: number;
  minutesToday: number;
  goalMinutes: number;
  dueReview: number;
}

function useToday() {
  const [today, setToday] = useState<HomeToday | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/home/today", { headers: { Accept: "application/json" } })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (cancelled) return;
        if (body?.data) {
          setToday(body.data as HomeToday);
          setState("ready");
        } else {
          setState("error");
        }
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { today, state };
}

export function SurvivalCamp({
  lang,
  onSelectModule,
}: {
  lang: string;
  onSelectModule: (id: string) => void;
}) {
  const { t } = useTranslation();
  const { uiLocale, contentLanguage, hasTargetMismatch } = useLearningLocale();
  const { today, state } = useToday();
  const readyCount = SURVIVAL_MODULES.filter(
    (module) => getSurvivalModuleStatus(module.id, contentLanguage) === "ready",
  ).length;
  const goalPercent = Math.min(
    100,
    Math.round(
      ((today?.minutesToday ?? 0) / Math.max(1, today?.goalMinutes ?? 15)) * 100,
    ),
  );

  const statusLabel = (status: SurvivalModuleStatus) => {
    if (status === "ready") return t("learning.survival.ready");
    if (status === "coming-soon") return t("learning.survival.comingSoon");
    return t("learning.survival.unavailable");
  };

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 py-5 sm:px-6 lg:gap-6 lg:px-8 lg:py-8">
      {/* Camp hero */}
      <section className="exp-hero relative overflow-hidden rounded-3xl p-5 text-exp-on-primary shadow-xl sm:p-7 lg:p-9">
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex min-w-0 flex-col gap-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-exp-on-primary/15 px-3.5 py-1.5 backdrop-blur">
              <Swords className="h-4 w-4 text-exp-secondary-fixed" aria-hidden="true" />
              <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-exp-inverse-on-surface">
                {t("learning.survival.tag")}
              </span>
            </span>
            <h1 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[42px]">
              {t("learning.survival.title")}
            </h1>
            <p className="max-w-2xl text-sm font-semibold leading-6 text-exp-inverse-on-surface/90 sm:text-[16px]">
              {t("learning.survival.intro")}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-exp-on-primary/20 px-3 py-1.5 text-xs font-bold backdrop-blur">
                <Flame className="h-4 w-4 text-exp-secondary-fixed" aria-hidden="true" />
                {today?.streakCurrent ?? 0} {t("learning.survival.streakLabel")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-exp-on-primary/20 px-3 py-1.5 text-xs font-bold backdrop-blur">
                <Gem className="h-4 w-4 text-exp-primary-fixed" aria-hidden="true" />
                {t("learning.shell.learningLanguage")}:{" "}
                {CONTENT_LANGUAGE_LABELS[contentLanguage]}
              </span>
            </div>
          </div>

          <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl border-b-4 border-exp-container-highest bg-exp-surface-lowest p-3.5 text-exp-on-surface shadow-lg">
            <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-exp-primary-fixed">
              <LangoMascot className="h-12 w-12" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-exp-primary">
                  {t("learning.survival.sessionBadge")}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-exp-primary-container" />
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs font-semibold leading-5 text-exp-on-surface-variant">
                {t("learning.survival.step2Body")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        <section className="flex min-w-0 flex-col gap-5 xl:col-span-8">
          {/* Today's training */}
          <div className="exp-card flex flex-col gap-4 p-5 lg:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-exp-secondary-fixed text-exp-secondary">
                  <Target className="h-4 w-4" aria-hidden="true" />
                </span>
                <h2 className="text-[16px] font-extrabold">
                  {t("learning.survival.todayTitle")}
                </h2>
              </div>
              <span className="exp-pill bg-exp-container text-exp-on-surface-variant">
                <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {getLocaleDefinition(uiLocale).label}
              </span>
            </div>

            {state === "error" ? (
              <p
                role="status"
                className="rounded-xl bg-exp-surface-low px-3 py-2.5 text-xs font-semibold text-exp-on-surface-variant"
              >
                {t("learning.survival.statsError")}
              </p>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wide text-exp-on-surface-variant">
                    <span>
                      {today?.minutesToday ?? 0} {t("learning.survival.minutesLabel")}
                    </span>
                    <span className="text-exp-primary">
                      {t("learning.survival.minutesGoal", {
                        goal: today?.goalMinutes ?? 15,
                      })}
                    </span>
                  </div>
                  <div
                    className="exp-progress"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={state === "loading" ? 0 : goalPercent}
                    aria-label={t("learning.survival.todayTitle")}
                  >
                    <span style={{ width: `${state === "loading" ? 0 : goalPercent}%` }} />
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="flex items-center gap-2.5 rounded-xl bg-exp-surface-low p-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-exp-secondary-fixed text-exp-secondary">
                      <Flame className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold tabular-nums">
                        {today?.streakCurrent ?? 0}
                      </p>
                      <p className="truncate text-[11px] font-semibold text-exp-on-surface-variant">
                        {t("learning.survival.streakLabel")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl bg-exp-surface-low p-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-exp-primary-fixed text-exp-primary">
                      <Gem className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold tabular-nums">
                        {today?.xpToday ?? 0}
                      </p>
                      <p className="truncate text-[11px] font-semibold text-exp-on-surface-variant">
                        {t("learning.survival.xpLabel")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl bg-exp-surface-low p-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-exp-tertiary-fixed text-exp-tertiary">
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold tabular-nums">
                        {today?.dueReview ?? 0}
                      </p>
                      <p className="truncate text-[11px] font-semibold text-exp-on-surface-variant">
                        {t("learning.survival.dueReviewLabel")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-exp-surface-low p-2.5">
                  <span className="text-[11px] font-semibold text-exp-on-surface-variant">
                    {t("learning.today.dueReview", { count: today?.dueReview ?? 0 })}
                  </span>
                  <Link
                    href={`/${lang}/review`}
                    className="rounded-full bg-exp-primary px-3 py-1.5 text-[10px] font-extrabold text-exp-on-primary shadow-sm hover:brightness-110"
                  >
                    {t("learning.today.review")}
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Drill grid */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-extrabold text-exp-on-surface">
                {t("learning.dashboard.learningModules")}
              </h2>
              <span className="exp-pill bg-exp-container text-exp-on-surface-variant">
                {t("learning.dashboard.readyCount", {
                  ready: readyCount,
                  coming: SURVIVAL_MODULES.length - readyCount,
                })}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {SURVIVAL_MODULES.map((module) => {
                const status = getSurvivalModuleStatus(module.id, contentLanguage);
                const Icon = module.icon;
                const ready = status === "ready";
                const title = t(`learning.modules.${module.id}.title`, {
                  defaultValue: module.id,
                });
                const description = t(`learning.modules.${module.id}.description`, {
                  defaultValue: "",
                });

                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => ready && onSelectModule(module.id)}
                    disabled={!ready}
                    aria-disabled={!ready}
                    className="group exp-card flex flex-col items-start gap-3 p-5 text-left transition-transform duration-150 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <span
                        className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${module.accentClass}`}
                        aria-hidden="true"
                      >
                        <Icon className="h-6 w-6" />
                      </span>
                      <span
                        className={`exp-pill ${
                          status === "ready"
                            ? "bg-exp-primary-container/15 text-exp-primary"
                            : status === "coming-soon"
                              ? "bg-exp-secondary-fixed text-exp-secondary"
                              : "bg-exp-container text-exp-on-surface-muted"
                        }`}
                      >
                        {status === "ready" ? (
                          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <Timer className="h-3 w-3" aria-hidden="true" />
                        )}
                        {statusLabel(status)}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-[16px] font-extrabold leading-tight text-exp-on-surface">
                        {title}
                      </h3>
                      <p className="mt-1 text-xs font-medium leading-5 text-exp-on-surface-variant">
                        {description}
                      </p>
                      {status === "unavailable" && (
                        <p className="mt-2 text-[11px] font-semibold text-exp-secondary">
                          {t("learning.survival.languageNote", {
                            language: CONTENT_LANGUAGE_LABELS[contentLanguage],
                          })}
                        </p>
                      )}
                    </div>

                    <span
                      className={`mt-auto inline-flex min-h-[18px] items-center gap-1 text-xs font-extrabold ${
                        ready
                          ? "text-exp-primary"
                          : "text-exp-on-surface-muted"
                      }`}
                    >
                      {ready ? (
                        <>
                          {t("learning.survival.openDrill")}
                          <ArrowRight
                            className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="flex min-w-0 flex-col gap-5 xl:col-span-4">
          {/* How the camp works */}
          <div className="exp-card flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-exp-tertiary-fixed text-exp-tertiary">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 className="text-[16px] font-extrabold">
                {t("learning.survival.howToTitle")}
              </h2>
            </div>
            <ol className="flex flex-col gap-3">
              {(["1", "2", "3"] as const).map((step) => (
                <li key={step} className="flex gap-3 rounded-xl bg-exp-surface-low p-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-exp-primary-container text-xs font-extrabold text-exp-on-primary-container">
                    {step}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-exp-on-surface">
                      {t(`learning.survival.step${step}Title`)}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium leading-4 text-exp-on-surface-variant">
                      {t(`learning.survival.step${step}Body`)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Language honesty + shortcuts */}
          <div className="exp-card flex flex-col gap-3 p-5">
            <h2 className="flex items-center gap-2 text-[16px] font-extrabold">
              <Compass className="h-4 w-4 text-exp-primary" aria-hidden="true" />
              {t("learning.survival.backToMap")}
            </h2>
            <p className="text-xs font-medium leading-5 text-exp-on-surface-variant">
              {hasTargetMismatch
                ? t("learning.shell.targetMismatch", {
                    interface: getLocaleDefinition(uiLocale).label,
                    learning: CONTENT_LANGUAGE_LABELS[contentLanguage],
                  })
                : t("learning.survival.step3Body")}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href={`/${lang}/learn`} className="exp-btn exp-btn-primary">
                {t("learning.survival.backToMap")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href={`/${lang}/results`} className="exp-btn exp-btn-ghost">
                <Trophy className="h-4 w-4" aria-hidden="true" />
                {t("learning.survival.results")}
              </Link>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-xl bg-exp-surface-low p-2.5">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-exp-on-surface-variant">
                <Heart className="h-3.5 w-3.5 text-exp-error" aria-hidden="true" />
                {t("learning.shell.learningLanguage")}:{" "}
                {CONTENT_LANGUAGE_LABELS[contentLanguage]}
              </span>
              <Link
                href={`/${lang}/profile`}
                className="text-[10px] font-extrabold text-exp-primary hover:underline"
              >
                {t("learning.shell.editLearningLanguage")}
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
