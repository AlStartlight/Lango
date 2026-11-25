"use client";

import { useEffect, useState } from "react";
import { Construction } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useModule } from "./module-context";
import { PHASES, LEVELS } from "./types";
import { GamificationBar } from "@/components/editor/shared/gamification-strip";
import { FlashcardPhase } from "./flashcard-phase";
import { ListenPickPhase } from "./listen-pick-phase";
import { TapNumberPhase } from "./tap-number-phase";
import { SpellPhase } from "./spell-phase";
import { SpeedQuizPhase } from "./speed-quiz-phase";
import { SurvivalPhase } from "./survival-phase";
import { MasteryPhase } from "./mastery-phase";
import { SpeechVoicePicker } from "@/components/shared/speech-voice-picker";
import type { LanguageCode, PhaseId } from "./types";
import {
  NUMBER_ATTEMPT_EVENT,
} from "@/lib/learning/number-attempts";

interface NumberNameModuleProps {
  lang?: LanguageCode;
}

interface PersistedNumberProgress {
  totalAttempts: number;
  accuracyPercent: number;
  distinctNumbers: number;
}

export function NumberNameModule({ lang = "en" }: NumberNameModuleProps) {
  const { t } = useTranslation();
  const [persisted, setPersisted] = useState<PersistedNumberProgress | null>(
    null,
  );
  const {
    state,
    setLevel,
    goToPhase,
    nextPhase,
    addXp,
    loseLife,
    addStreak,
    resetStreak,
  } = useModule();

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetch(`/api/v1/number-attempts?language=${lang}`, {
        headers: { Accept: "application/json" },
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((body) => {
          if (!cancelled && body?.data) {
            setPersisted({
              totalAttempts: body.data.totalAttempts ?? 0,
              accuracyPercent: body.data.accuracyPercent ?? 0,
              distinctNumbers: body.data.distinctNumbers ?? 0,
            });
          }
        })
        .catch(() => undefined);
    };

    load();
    const onAttempt = () => load();
    window.addEventListener(NUMBER_ATTEMPT_EVENT, onAttempt);
    return () => {
      cancelled = true;
      window.removeEventListener(NUMBER_ATTEMPT_EVENT, onAttempt);
    };
  }, [lang]);

  const currentLevel =
    LEVELS.find((l) => l.id === state.activeLevelId) ?? LEVELS[0];
  const currentPhase =
    PHASES.find((p) => p.id === state.currentPhase) ?? PHASES[0];

  const isPhaseComplete = (phaseId: PhaseId) =>
    state.completedPhases.includes(phaseId);

  const phaseLabel = (id: PhaseId) =>
    t(`learning.phases.${id}.label`, { defaultValue: id });
  const phaseHeading = (id: PhaseId) =>
    t(`learning.phases.${id}.heading`, { defaultValue: phaseLabel(id) });
  const phaseSub = (id: PhaseId) =>
    t(`learning.phases.${id}.sub`, { defaultValue: "" });

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-exp-surface">
      <GamificationBar
        xp={state.gamification.xp}
        level={state.gamification.level}
        lives={state.gamification.lives}
        streak={state.gamification.streak}
      />

      <p
        className="shrink-0 border-b border-exp-container-high bg-exp-surface-lowest px-6 py-2 text-center text-xs text-exp-on-surface-muted"
        aria-live="polite"
      >
        {persisted && persisted.totalAttempts > 0
          ? t("learning.number.persisted", {
              count: persisted.totalAttempts,
              accuracy: persisted.accuracyPercent,
            })
          : t("learning.number.persistedEmpty")}
      </p>

      <div className="shrink-0 border-b border-exp-container-high">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-6 py-3">
          {LEVELS.map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => setLevel(level.id)}
              aria-pressed={state.activeLevelId === level.id}
              className={`exp-chip shrink-0 ${
                state.activeLevelId === level.id ? "exp-chip-active" : ""
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>

        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto px-6 pb-3">
          {PHASES.map((phase) => {
            const active = state.currentPhase === phase.id;
            const done = isPhaseComplete(phase.id);
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => goToPhase(phase.id)}
                aria-current={active ? "step" : undefined}
                className={`exp-chip shrink-0 ${
                  active
                    ? "exp-chip-active"
                    : done
                      ? "text-exp-success"
                      : "text-exp-on-surface-muted"
                }`}
              >
                {done && (
                  <svg
                    className="mr-1 inline h-3 w-3 text-exp-success"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                )}
                {phaseLabel(phase.id)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 py-8">
          <header className="mb-8 text-center">
            <h1 className="text-lg font-semibold text-exp-on-surface">
              {phaseHeading(state.currentPhase)}
            </h1>
            <p className="mt-1 text-sm text-exp-on-surface-variant">
              {phaseSub(state.currentPhase)}
            </p>
            <div className="mt-3 flex justify-center">
              <SpeechVoicePicker language={lang} />
            </div>
          </header>

          {state.currentPhase === "flashcard" && (
            <div className="animate-fade-in-up">
              <FlashcardPhase
                numbers={currentLevel.numbers}
                lang={lang}
                onComplete={(xp) => {
                  addXp(xp);
                  addStreak();
                }}
              />
            </div>
          )}

          {state.currentPhase === "listen-pick" && (
            <div className="animate-fade-in-up">
              <ListenPickPhase
                numbers={currentLevel.numbers}
                lang={lang}
                onCorrect={(xp) => {
                  addXp(xp);
                  addStreak();
                }}
                onIncorrect={() => {
                  loseLife();
                  resetStreak();
                }}
                onComplete={() => nextPhase()}
              />
            </div>
          )}

          {state.currentPhase === "tap-number" && (
            <div className="animate-fade-in-up">
              <TapNumberPhase
                numbers={currentLevel.numbers}
                lang={lang}
                onCorrect={(xp, bonus) => {
                  addXp(xp + bonus);
                  addStreak();
                }}
                onMiss={() => {
                  loseLife();
                  resetStreak();
                }}
                onComplete={() => nextPhase()}
              />
            </div>
          )}

          {state.currentPhase === "spell" && (
            <div className="animate-fade-in-up">
              <SpellPhase
                numbers={currentLevel.numbers}
                lang={lang}
                onCorrect={(xp, noHint) => {
                  addXp(noHint ? xp : xp - 5);
                  addStreak();
                }}
                onComplete={() => nextPhase()}
              />
            </div>
          )}

          {state.currentPhase === "speed-quiz" && (
            <div className="animate-fade-in-up">
              <SpeedQuizPhase
                numbers={currentLevel.numbers}
                lang={lang}
                onCorrect={(xp, fast) => {
                  addXp(fast ? xp + 5 : xp);
                  addStreak();
                }}
                onIncorrect={() => {
                  loseLife();
                  resetStreak();
                }}
                onComplete={(perfect) => {
                  if (perfect) addXp(50);
                  nextPhase();
                }}
              />
            </div>
          )}

          {state.currentPhase === "survival" && (
            <div className="animate-fade-in-up">
              <SurvivalPhase
                numbers={currentLevel.numbers}
                lang={lang}
                initialLives={state.gamification.lives}
                onCorrect={(xp) => {
                  addXp(xp);
                  addStreak();
                }}
                onLoseLife={() => {
                  loseLife();
                  resetStreak();
                }}
                onGameOver={(score) => {
                  addXp(score * 2);
                }}
              />
            </div>
          )}

          {state.currentPhase === "mastery" && (
            <div className="animate-fade-in-up">
              <MasteryPhase
                numbers={currentLevel.numbers}
                lang={lang}
                onCorrect={(xp) => {
                  addXp(xp);
                  addStreak();
                }}
                onIncorrect={() => {
                  resetStreak();
                }}
                onComplete={(result) => {
                  if (result.passed) {
                    addXp(100);
                    nextPhase();
                  }
                }}
              />
            </div>
          )}

          {!PHASES.some((phase) => phase.id === state.currentPhase) && (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-exp-on-surface-muted">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-exp-secondary-fixed text-exp-secondary">
                <Construction className="h-8 w-8" aria-hidden="true" />
              </span>
              <p className="text-base font-extrabold text-exp-on-surface-variant">
                {currentPhase.label}
              </p>
              <p className="text-sm">
                {t("learning.number.phaseUnderDevelopment")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
