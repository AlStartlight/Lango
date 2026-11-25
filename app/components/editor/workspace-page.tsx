"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Compass, Swords } from "lucide-react";
import { useModule } from "@/components/editor/number-name/module-context";
import { useLearningLocale } from "@/components/editor/learning-locale-context";
import { NumberNameModule } from "@/components/editor/number-name/number-name-module";
import { GrammarModule } from "@/components/editor/grammar/grammar-module";
import { CurriculumModule } from "@/components/editor/curriculum/curriculum-module";
import { SurvivalCamp } from "@/components/expedition/survival-camp";
import { CONTENT_LANGUAGE_LABELS } from "@/lib/i18n/locales";

const FULLSCREEN_MODULES = new Set(["number-name", "grammar", "curriculum"]);

function ModulePlaceholder({ title }: { title: string }) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-exp-secondary-fixed text-exp-secondary">
        <Swords className="h-7 w-7" aria-hidden="true" />
      </span>
      <p className="text-sm font-extrabold text-exp-on-surface">{title}</p>
      <p className="max-w-sm text-xs font-medium leading-5 text-exp-on-surface-variant">
        {t("learning.states.underDevelopment")}
      </p>
    </div>
  );
}

function moduleTitle(
  t: ReturnType<typeof useTranslation>["t"],
  id: string,
): string {
  return t(`learning.modules.${id}.title`, { defaultValue: id });
}

export function WorkspacePage({ lang }: { lang: string }) {
  const { t } = useTranslation();
  const { activeModule, setActiveModule } = useModule();
  const { contentLanguage, curriculumLevel } = useLearningLocale();
  const appliedDeepLink = useRef(false);

  const selectModule = useCallback(
    (id: string | null) => {
      // Keep the drill in the URL so a session can be refreshed or shared, but
      // replace instead of push so Camp <-> drill toggling stays one step.
      const url = new URL(window.location.href);
      if (id) url.searchParams.set("module", id);
      else url.searchParams.delete("module");
      window.history.replaceState(null, "", url);
      setActiveModule(id);
    },
    [setActiveModule],
  );

  useEffect(() => {
    if (appliedDeepLink.current) return;
    appliedDeepLink.current = true;
    const requested = new URLSearchParams(window.location.search).get("module");
    if (requested && requested !== activeModule) {
      // Deep links from the review queue open the requested module.
      setActiveModule(requested);
    }
  }, [activeModule, setActiveModule]);

  if (!activeModule) {
    return <SurvivalCamp lang={lang} onSelectModule={selectModule} />;
  }

  const isFullscreen = FULLSCREEN_MODULES.has(activeModule);
  let view: ReactNode;

  switch (activeModule) {
    case "number-name":
      view = <NumberNameModule lang={contentLanguage} />;
      break;
    case "grammar":
      view = <GrammarModule lang={contentLanguage} />;
      break;
    case "curriculum":
      view = (
        <CurriculumModule key={`${contentLanguage}-${curriculumLevel ?? "default"}`} />
      );
      break;
    default:
      view = <ModulePlaceholder title={moduleTitle(t, activeModule)} />;
  }

  const title = moduleTitle(t, activeModule);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => selectModule(null)}
            className="exp-btn exp-btn-ghost shrink-0"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("learning.survival.backToCamp")}
          </button>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-exp-primary">
              {t("learning.survival.moduleTag")}
            </p>
            <h1 className="truncate text-lg font-extrabold leading-tight text-exp-on-surface">
              {title}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="exp-pill bg-exp-container text-exp-on-surface-variant">
            {CONTENT_LANGUAGE_LABELS[contentLanguage]}
          </span>
          <Link
            href={`/${lang}/learn`}
            className="exp-pill bg-exp-surface-low text-exp-primary hover:bg-exp-container"
          >
            <Compass className="h-3.5 w-3.5" aria-hidden="true" />
            {t("learning.survival.backToMap")}
          </Link>
        </div>
      </div>

      <div
        key={activeModule}
        className="animate-fade-in-up exp-card overflow-hidden"
      >
        <div
          className={
            isFullscreen
              ? "h-[calc(100dvh-13rem)] min-h-[560px] w-full"
              : "min-h-[420px] w-full"
          }
        >
          {view}
        </div>
      </div>
    </div>
  );
}
