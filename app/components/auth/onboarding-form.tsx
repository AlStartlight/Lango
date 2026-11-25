"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  LANGUAGE_SUPPORT_LIST,
  defaultLevelForLanguage,
  isLanguageCode,
  isLevelForLanguage,
  levelsForLanguage,
  toRouteLocale,
  type CurriculumLevelCode,
  type LanguageCode,
} from "@/lib/i18n/locales";

const GOALS = [5, 10, 15, 30] as const;

const LEVEL_DETAILS: Record<string, string> = {
  N5: "Kalimat dasar dan kehidupan sehari-hari",
  N4: "Percakapan sehari-hari dan teks sederhana",
  N3: "Topik familiar dan teks menengah",
  N2: "Topik luas dan teks surat kabar",
  N1: "Topik abstrak dan teks kompleks",
  A1: "Kalimat sederhana dan kosakata dasar",
  A2: "Percakapan sehari-hari yang umum",
  B1: "Topik familiar dan teks sederhana",
  B2: "Diskusi kompleks dan teks panjang",
  C1: "Nuansa bahasa dan topik abstrak",
};


type Step = 0 | 1 | 2 | 3;

interface OnboardingFormProps {
  locale: string;
  initial: {
    targetLanguage: string;
    curriculumLevel: string | null;
    dailyGoalMinutes: number;
    timezone: string;
  };
}

export function OnboardingForm({ locale, initial }: OnboardingFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const detectedTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || initial.timezone;
    } catch {
      return initial.timezone;
    }
  }, [initial.timezone]);

  const [step, setStep] = useState<Step>(0);
  const initialTarget = isLanguageCode(initial.targetLanguage)
    ? initial.targetLanguage
    : "en";
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>(initialTarget);
  const [curriculumLevel, setCurriculumLevel] = useState<CurriculumLevelCode>(
    initial.curriculumLevel &&
      isLevelForLanguage(initialTarget, initial.curriculumLevel)
      ? (initial.curriculumLevel as CurriculumLevelCode)
      : defaultLevelForLanguage(initialTarget),
  );
  const levels = levelsForLanguage(targetLanguage);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number>(
    GOALS.includes(initial.dailyGoalMinutes as (typeof GOALS)[number])
      ? initial.dailyGoalMinutes
      : 15,
  );
  const [timezone, setTimezone] = useState(detectedTimezone);
  const [motivation, setMotivation] = useState<string>("career");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canContinue = step === 0 ? Boolean(targetLanguage) : true;

  async function submit() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/v1/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetLanguage,
          curriculumLevel,
          uiLocale: locale,
          dailyGoalMinutes,
          timezone,
          motivation,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error?.message ?? t("onboarding.saveError"));
        return;
      }

      const body = await response.json().catch(() => null);
      const preferred =
        typeof body?.data?.user?.uiLocale === "string"
          ? toRouteLocale(body.data.user.uiLocale)
          : toRouteLocale(locale);
      router.push(`/${preferred}/learn`);
    } catch {
      setError(t("onboarding.connectionError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl">
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between text-xs font-medium text-muted-text">
          <span>
            {t("onboarding.step", { current: step + 1, total: 4 })}
          </span>
          <span>{Math.round(((step + 1) / 4) * 100)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-subtle">
          <div
            className="h-full rounded-full bg-accent-primary transition-all duration-300"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-state-error/30 bg-state-error/5 px-4 py-3 text-sm text-state-error"
        >
          {error}
        </div>
      )}

      {step === 0 && (
        <section>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            {t("onboarding.languageTitle")}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-secondary-text">
            {t("onboarding.languageBody")}
          </p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {LANGUAGE_SUPPORT_LIST.map((language) => {
              const active = targetLanguage === language.code;
              return (
                <button
                  key={language.code}
                  type="button"
                  lang={language.htmlLang}
                  onClick={() => {
                    setTargetLanguage(language.code);
                    if (!isLevelForLanguage(language.code, curriculumLevel)) {
                      setCurriculumLevel(defaultLevelForLanguage(language.code));
                    }
                  }}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    active
                      ? "border-accent-primary bg-accent-primary/5"
                      : "border-default bg-surface hover:border-border-subtle"
                  }`}
                >
                  <span className="block text-sm font-semibold text-primary">
                    {language.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-text">
                    {t("onboarding.languageDetail", {
                      framework: language.framework,
                      skills: [
                        t("onboarding.skillsVocabulary"),
                        t("onboarding.skillsGrammar"),
                        t("onboarding.skillsReading"),
                        ...(language.code === "ja"
                          ? [t("onboarding.skillsKanji")]
                          : []),
                        t("onboarding.skillsListening"),
                      ].join(" · "),
                    })}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {step === 1 && (
        <section>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            {t("onboarding.levelTitle")}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-secondary-text">
            {t("onboarding.levelFramework", {
              framework: targetLanguage === "ja" ? "JLPT" : "CEFR",
            })}{" "}
            {t("onboarding.levelBody")}
          </p>
          <div className="mt-6 space-y-2">
            {levels.map((level) => {
              const active = curriculumLevel === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setCurriculumLevel(level)}
                  lang={targetLanguage}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-colors ${
                    active
                      ? "border-accent-primary bg-accent-primary/5"
                      : "border-default bg-surface hover:border-border-subtle"
                  }`}
                >
                  <span>
                    <span className="block text-sm font-semibold text-primary">
                      {level}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-text">
                      {t(`onboarding.levelDetails.${level}`, {
                        defaultValue: LEVEL_DETAILS[level],
                      })}
                    </span>
                  </span>
                  <span
                    className={`h-4 w-4 rounded-full border ${
                      active
                        ? "border-accent-primary bg-accent-primary"
                        : "border-border-subtle"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {step === 2 && (
        <section>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            {t("onboarding.goalTitle")}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-secondary-text">
            {t("onboarding.goalBody")}
          </p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {GOALS.map((goal) => {
              const active = dailyGoalMinutes === goal;
              return (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setDailyGoalMinutes(goal)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    active
                      ? "border-accent-primary bg-accent-primary/5"
                      : "border-default bg-surface hover:border-border-subtle"
                  }`}
                >
                  <span className="block text-lg font-bold text-primary">
                    {t("onboarding.goalMinutes", { count: goal })}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-text">
                    {goal <= 10
                      ? t("onboarding.goalBusy")
                      : t("onboarding.goalFaster")}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-6">
            <label
              htmlFor="motivation"
              className="mb-1.5 block text-sm font-medium text-primary"
            >
              {t("onboarding.motivationLabel")}
            </label>
            <select
              id="motivation"
              value={motivation}
              onChange={(event) => setMotivation(event.target.value)}
              className="h-11 w-full rounded-xl border border-default bg-surface px-4 text-sm text-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
            >
              <option value="career">{t("onboarding.motivationCareer")}</option>
              <option value="exam">{t("onboarding.motivationExam")}</option>
              <option value="travel">{t("onboarding.motivationTravel")}</option>
              <option value="hobby">{t("onboarding.motivationHobby")}</option>
              <option value="family">{t("onboarding.motivationFamily")}</option>
            </select>
          </div>
        </section>
      )}

      {step === 3 && (
        <section>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            {t("onboarding.lastTitle")}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-secondary-text">
            {t("onboarding.lastBody")}
          </p>
          <div className="mt-6">
            <label
              htmlFor="timezone"
              className="mb-1.5 block text-sm font-medium text-primary"
            >
              {t("onboarding.timezoneLabel")}
            </label>
            <input
              id="timezone"
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              className="h-11 w-full rounded-xl border border-default bg-surface px-4 text-sm text-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
            />
            <p className="mt-2 text-xs text-muted-text">
              {t("onboarding.detected", { timezone: detectedTimezone })}
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-default bg-elevated p-4 text-sm text-secondary-text">
            <p className="font-semibold text-primary">
              {t("onboarding.planTitle")}
            </p>
            <p className="mt-1">
              {t("onboarding.planBody", {
                level: curriculumLevel,
                minutes: dailyGoalMinutes,
              })}
            </p>
          </div>
        </section>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((current) => (current > 0 ? ((current - 1) as Step) : current))}
          disabled={step === 0 || loading}
          className="h-11 rounded-xl border border-default px-5 text-sm font-medium text-secondary-text transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("onboarding.back")}
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep((current) => ((current + 1) as Step))}
            disabled={!canContinue}
            className="h-11 rounded-xl bg-accent-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("onboarding.next")}
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="h-11 rounded-xl bg-accent-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t("onboarding.saving") : t("onboarding.start")}
          </button>
        )}
      </div>
    </div>
  );
}
