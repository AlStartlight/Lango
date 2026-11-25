"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Loader2 } from "lucide-react";
import {
  LANGUAGE_SUPPORT_LIST,
  UI_LOCALES,
  defaultLevelForLanguage,
  isLanguageCode,
  isLevelForLanguage,
  levelsForLanguage,
  toContentLanguage,
  toRouteLocale,
  type CurriculumLevelCode,
  type LanguageCode,
  type UiLocale,
} from "@/lib/i18n/locales";
import { switchLocaleInPath } from "@/lib/i18n/paths";
import { applyDocumentLocale } from "@/lib/i18n/dom";
import type { LanguageAvailability } from "@/lib/learning/curriculum";

interface LanguageSettingsProps {
  locale: string;
  user: {
    uiLocale: string;
    targetLanguage: string;
    curriculumLevel: string | null;
    explanationLocale: string;
    timezone: string;
  };
  availability: Partial<Record<LanguageCode, LanguageAvailability>>;
  hasUnsavedPassword?: boolean;
}

type SaveState = "idle" | "saving" | "saved" | "error";

function selectClasses() {
  return "mt-1 min-h-11 w-full rounded-xl border border-default bg-base px-3 text-sm text-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15 disabled:opacity-60";
}

export function LanguageSettings({
  locale,
  user,
  availability,
  hasUnsavedPassword = false,
}: LanguageSettingsProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialTarget = isLanguageCode(user.targetLanguage)
    ? user.targetLanguage
    : "en";
  const initialLevel = isLevelForLanguage(initialTarget, user.curriculumLevel ?? "")
    ? (user.curriculumLevel as CurriculumLevelCode)
    : defaultLevelForLanguage(initialTarget);

  const [uiLocale, setUiLocale] = useState<UiLocale>(
    (UI_LOCALES as readonly string[]).includes(locale)
      ? (locale as UiLocale)
      : "en",
  );
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>(initialTarget);
  const [curriculumLevel, setCurriculumLevel] =
    useState<CurriculumLevelCode>(initialLevel);
  const [explanationLocale, setExplanationLocale] = useState(
    ["en", "id", "ja"].includes(user.explanationLocale)
      ? user.explanationLocale
      : "en",
  );
  const [syncLanguages, setSyncLanguages] = useState(false);
  const [state, setState] = useState<SaveState>("idle");
  const [error, setError] = useState("");
  const [pendingLocale, setPendingLocale] = useState<UiLocale | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const levels = levelsForLanguage(targetLanguage);
  const targetSupport = LANGUAGE_SUPPORT_LIST.find(
    (language) => language.code === targetLanguage,
  );
  const targetCounts = availability[targetLanguage];

  const availabilityLabel = useMemo(() => {
    const counts = availability[targetLanguage];
    if (!counts || counts.status === "none") {
      return t("settings.availabilityNone");
    }
    if (counts.status === "full") return t("settings.availabilityFull");
    if (counts.status === "beta") {
      return t("settings.availabilityBeta", { count: counts.totalQuestions });
    }
    return t("settings.availabilityPreview", {
      count: counts.totalQuestions,
    });
  }, [availability, targetLanguage, t]);

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    [],
  );

  function flashSaved() {
    setState("saved");
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setState("idle"), 2500);
  }

  async function save(
    payload: Record<string, unknown>,
    navigation?: { nextLocale: UiLocale },
  ) {
    setState("saving");
    setError("");
    try {
      const response = await fetch("/api/v1/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setError(body?.error?.message ?? t("settings.saveError"));
        setState("error");
        return false;
      }

      flashSaved();

      if (navigation) {
        const query = searchParams.toString();
        const hash = typeof window !== "undefined" ? window.location.hash : "";
        const currentPath = `${pathname}${query ? `?${query}` : ""}${hash}`;
        await i18n.changeLanguage(navigation.nextLocale);
        applyDocumentLocale(navigation.nextLocale);
        router.replace(switchLocaleInPath(currentPath, navigation.nextLocale), {
          scroll: false,
        });
      }
      return true;
    } catch {
      setError(t("settings.saveError"));
      setState("error");
      return false;
    }
  }

  async function applyUiLocale(next: UiLocale) {
    if (next === uiLocale) return;
    const previous = {
      uiLocale,
      targetLanguage,
      curriculumLevel,
    };
    setUiLocale(next);
    const payload: Record<string, unknown> = { uiLocale: next };

    if (syncLanguages) {
      const nextTarget = toContentLanguage(next);
      const nextLevel = isLevelForLanguage(nextTarget, curriculumLevel)
        ? curriculumLevel
        : defaultLevelForLanguage(nextTarget);
      payload.targetLanguage = nextTarget;
      payload.curriculumLevel = nextLevel;
      setTargetLanguage(nextTarget);
      setCurriculumLevel(nextLevel);
    }

    const ok = await save(payload, { nextLocale: next });
    if (!ok) {
      setUiLocale(previous.uiLocale);
      setTargetLanguage(previous.targetLanguage);
      setCurriculumLevel(previous.curriculumLevel);
    }
  }

  function requestUiLocale(next: UiLocale) {
    if (next === uiLocale) return;
    if (hasUnsavedPassword) {
      setPendingLocale(next);
      return;
    }
    void applyUiLocale(next);
  }

  async function applyTargetLanguage(next: LanguageCode) {
    if (next === targetLanguage) return;
    const previous = {
      targetLanguage,
      curriculumLevel,
      uiLocale,
    };
    const nextLevel = isLevelForLanguage(next, curriculumLevel)
      ? curriculumLevel
      : defaultLevelForLanguage(next);
    const nextUi = syncLanguages ? toRouteLocale(next) : uiLocale;
    setTargetLanguage(next);
    setCurriculumLevel(nextLevel);
    if (syncLanguages) setUiLocale(nextUi);

    const payload: Record<string, unknown> = {
      targetLanguage: next,
      curriculumLevel: nextLevel,
      ...(syncLanguages ? { uiLocale: nextUi } : {}),
    };

    const ok = syncLanguages
      ? await save(payload, { nextLocale: nextUi })
      : await save(payload);

    if (!ok) {
      setTargetLanguage(previous.targetLanguage);
      setCurriculumLevel(previous.curriculumLevel);
      setUiLocale(previous.uiLocale);
    }
  }

  async function applyLevel(next: CurriculumLevelCode) {
    if (next === curriculumLevel) return;
    const previous = curriculumLevel;
    setCurriculumLevel(next);
    const ok = await save({ curriculumLevel: next });
    if (!ok) setCurriculumLevel(previous);
  }

  async function applyExplanationLocale(next: string) {
    if (next === explanationLocale) return;
    const previous = explanationLocale;
    setExplanationLocale(next);
    const ok = await save({ explanationLocale: next });
    if (!ok) setExplanationLocale(previous);
  }

  const currentUiLabel = LANGUAGE_SUPPORT_LIST.find(
    (language) => language.routeLocale === uiLocale,
  )?.label;

  return (
    <section
      id="bahasa"
      aria-labelledby="language-settings-title"
      className="rounded-2xl border border-default bg-surface p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="language-settings-title"
            className="text-sm font-semibold uppercase tracking-wider text-muted-text"
          >
            {t("settings.languageSection")}
          </h2>
          <p className="mt-1 text-sm text-secondary-text">
            {t("settings.preferenceNote")}
          </p>
        </div>
        <div aria-live="polite" className="min-h-6 text-xs">
          {state === "saving" && (
            <span className="inline-flex items-center gap-1.5 text-muted-text">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              {t("settings.saving")}
            </span>
          )}
          {state === "saved" && (
            <span className="inline-flex items-center gap-1.5 text-state-success">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              {t("settings.saved")}
            </span>
          )}
          {state === "error" && (
            <span role="alert" className="text-state-error">
              {error}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ui-locale" className="text-sm font-medium text-primary">
            {t("settings.uiLocale")}
          </label>
          <select
            id="ui-locale"
            value={uiLocale}
            onChange={(event) => requestUiLocale(event.target.value as UiLocale)}
            disabled={state === "saving"}
            aria-describedby="ui-locale-help"
            aria-busy={state === "saving"}
            className={selectClasses()}
          >
            {UI_LOCALES.map((entry) => {
              const language = LANGUAGE_SUPPORT_LIST.find(
                (item) => item.routeLocale === entry,
              );
              return (
                <option key={entry} value={entry} lang={language?.htmlLang}>
                  {language?.label ?? entry}
                </option>
              );
            })}
          </select>
          <p id="ui-locale-help" className="mt-1.5 text-xs text-muted-text">
            {t("settings.uiLocaleHelp")}
          </p>
          {user.uiLocale !== uiLocale && (
            <p className="mt-1 text-xs text-muted-text">
              {t("settings.accountPreference", {
                language:
                  LANGUAGE_SUPPORT_LIST.find(
                    (language) => language.routeLocale === user.uiLocale,
                  )?.label ?? user.uiLocale,
              })}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="target-language"
            className="text-sm font-medium text-primary"
          >
            {t("settings.targetLanguage")}
          </label>
          <select
            id="target-language"
            value={targetLanguage}
            onChange={(event) =>
              void applyTargetLanguage(event.target.value as LanguageCode)
            }
            disabled={state === "saving"}
            aria-describedby="target-language-help"
            className={selectClasses()}
          >
            {LANGUAGE_SUPPORT_LIST.map((language) => (
              <option key={language.code} value={language.code}>
                {language.label}
              </option>
            ))}
          </select>
          <p id="target-language-help" className="mt-1.5 text-xs text-muted-text">
            {t("settings.targetLanguageHelp")}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-default px-2 py-0.5 text-secondary-text">
              {targetSupport?.framework}
            </span>
            <span className="rounded-full border border-default px-2 py-0.5 text-secondary-text">
              {availabilityLabel}
            </span>
            {targetCounts && targetCounts.totalQuestions > 0 && (
              <>
                <span className="text-muted-text">
                  {t("settings.questionsCount", {
                    count: targetCounts.totalQuestions,
                  })}
                </span>
                <span className="text-muted-text">
                  {t("settings.lessonsCount", {
                    count: targetCounts.totalLessons,
                  })}
                </span>
              </>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="curriculum-level"
            className="text-sm font-medium text-primary"
          >
            {t("settings.curriculumLevel")}
          </label>
          <select
            id="curriculum-level"
            value={curriculumLevel}
            onChange={(event) =>
              void applyLevel(event.target.value as CurriculumLevelCode)
            }
            disabled={state === "saving"}
            className={selectClasses()}
          >
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-muted-text">
            {t("settings.targetProgressNote")}
          </p>
        </div>

        <div>
          <label
            htmlFor="explanation-locale"
            className="text-sm font-medium text-primary"
          >
            {t("settings.explanationLocale")}
          </label>
          <select
            id="explanation-locale"
            value={explanationLocale}
            onChange={(event) => void applyExplanationLocale(event.target.value)}
            disabled={state === "saving"}
            className={selectClasses()}
          >
            <option value="en">English</option>
            <option value="id">Bahasa Indonesia</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      </div>

      <label className="mt-5 flex min-h-11 items-center gap-3 rounded-xl border border-default bg-base px-3 py-2 text-sm text-secondary-text">
        <input
          type="checkbox"
          checked={syncLanguages}
          onChange={(event) => setSyncLanguages(event.target.checked)}
          className="h-4 w-4 rounded border-default accent-accent-primary"
        />
        {t("settings.syncLanguages")}
      </label>

      <p className="mt-4 text-xs text-muted-text">
        {t("settings.timezone")}: {user.timezone}
      </p>

      {pendingLocale && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="language-confirm-title"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
          onKeyDown={(event) => {
            if (event.key === "Escape") setPendingLocale(null);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-default bg-surface p-6 shadow-xl">
            <h3
              id="language-confirm-title"
              className="text-base font-semibold text-primary"
            >
              {t("settings.switchLanguage")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary-text">
              {t("settings.dirtyPasswordPrompt")}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingLocale(null)}
                className="min-h-11 rounded-xl border border-default px-4 text-sm font-medium text-secondary-text hover:bg-elevated"
              >
                {t("settings.cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = pendingLocale;
                  setPendingLocale(null);
                  if (next) void applyUiLocale(next);
                }}
                className="min-h-11 rounded-xl bg-accent-primary px-4 text-sm font-semibold text-white hover:bg-accent-primary/90"
              >
                {t("settings.switchLanguage")}
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {state === "saved" && currentUiLabel
          ? t("settings.languageChanged", { language: currentUiLabel })
          : ""}
      </p>
    </section>
  );
}
