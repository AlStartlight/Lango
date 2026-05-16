"use client";

import { useModule } from "./module-context";
import { PHASES, LEVELS } from "./types";
import { GamificationBar } from "./gamification-bar";
import { FlashcardPhase } from "./flashcard-phase";
import { ListenPickPhase } from "./listen-pick-phase";
import { TapNumberPhase } from "./tap-number-phase";
import { SpellPhase } from "./spell-phase";
import { SpeedQuizPhase } from "./speed-quiz-phase";
import { SurvivalPhase } from "./survival-phase";
import { MasteryPhase } from "./mastery-phase";
import type { LanguageCode, PhaseId } from "./types";

interface NumberNameModuleProps {
  lang?: LanguageCode;
}

export function NumberNameModule({
  lang = "en",
}: NumberNameModuleProps) {
  const { state, setLevel, goToPhase, nextPhase, addXp, loseLife, addStreak, resetStreak, resetModule } =
    useModule();

  const currentLevel = LEVELS.find((l) => l.id === state.activeLevelId) ?? LEVELS[0];
  const currentPhase = PHASES.find((p) => p.id === state.currentPhase) ?? PHASES[0];

  const isPhaseComplete = (phaseId: PhaseId) =>
    state.completedPhases.includes(phaseId);

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-[#1a1a1a] to-[#151515] overflow-hidden">
      <GamificationBar
        xp={state.gamification.xp}
        level={state.gamification.level}
        lives={state.gamification.lives}
        streak={state.gamification.streak}
      />

      <div className="shrink-0 border-b border-[#252525]">
        <div className="flex items-center gap-2 px-6 py-3 overflow-x-auto no-scrollbar">
          {LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => setLevel(level.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                state.activeLevelId === level.id
                  ? "bg-[#d2ff5e] text-[#171717] shadow-[0_0_12px_-4px_#d2ff5e]"
                  : "bg-[#252525] text-white/50 hover:bg-[#333] hover:text-white/70 border border-[#2a2a2a]"
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 px-6 pb-3 overflow-x-auto no-scrollbar">
          {PHASES.map((phase) => {
            const active = state.currentPhase === phase.id;
            const done = isPhaseComplete(phase.id);
            return (
              <button
                key={phase.id}
                onClick={() => goToPhase(phase.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  active
                    ? "bg-white/10 text-white border border-white/15 shadow-sm"
                    : done
                      ? "text-green-400/70 hover:bg-white/5"
                      : "text-white/30 hover:text-white/50 hover:bg-white/5"
                }`}
              >
                {done && (
                  <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
                {phase.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 py-8">
          {state.currentPhase === "flashcard" && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-8">
                <h2 className="text-lg font-semibold text-white/90">Number Flashcard</h2>
                <p className="text-sm text-white/40 mt-1">Tap each card to see the name and hear pronunciation</p>
              </div>
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
              <div className="text-center mb-8">
                <h2 className="text-lg font-semibold text-white/90">Listen & Pick</h2>
                <p className="text-sm text-white/40 mt-1">Hear a number — choose the right answer</p>
              </div>
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
              <div className="text-center mb-8">
                <h2 className="text-lg font-semibold text-white/90">Tap the Number</h2>
                <p className="text-sm text-white/40 mt-1">Find the number before time runs out</p>
              </div>
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
              <div className="text-center mb-8">
                <h2 className="text-lg font-semibold text-white/90">Spell the Number</h2>
                <p className="text-sm text-white/40 mt-1">Arrange letters to spell the number correctly</p>
              </div>
              <SpellPhase
                numbers={currentLevel.numbers}
                lang={lang}
                onCorrect={(xp, noHint) => {
                  if (!noHint) {
                    addXp(xp - 5);
                  } else {
                    addXp(xp);
                  }
                  addStreak();
                }}
                onComplete={() => nextPhase()}
              />
            </div>
          )}

          {state.currentPhase === "speed-quiz" && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-8">
                <h2 className="text-lg font-semibold text-white/90">Speed Quiz</h2>
                <p className="text-sm text-white/40 mt-1">Answer quickly under pressure — bonus XP for fast answers</p>
              </div>
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
              <div className="text-center mb-8">
                <h2 className="text-lg font-semibold text-white/90">Survival Mode</h2>
                <p className="text-sm text-white/40 mt-1">Stay alive as long as you can — answer quickly or lose a life</p>
              </div>
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
              <div className="text-center mb-8">
                <h2 className="text-lg font-semibold text-white/90">Mastery Test</h2>
                <p className="text-sm text-white/40 mt-1">Prove you've mastered numbers in this level</p>
              </div>
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

          {state.currentPhase !== "flashcard" &&
            state.currentPhase !== "listen-pick" &&
            state.currentPhase !== "tap-number" &&
            state.currentPhase !== "spell" &&
            state.currentPhase !== "speed-quiz" &&
            state.currentPhase !== "survival" &&
            state.currentPhase !== "mastery" && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-white/30 gap-4">
                <div className="text-6xl opacity-50">🚧</div>
                <p className="text-base font-medium text-white/50">{currentPhase.label}</p>
                <p className="text-sm text-white/20">This phase is under development.</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
