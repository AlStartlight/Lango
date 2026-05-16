"use client";

import { useGrammar } from "./module-context";
import { LessonView } from "./lesson-view";
import { MultipleChoice } from "./multiple-choice";
import { FillBlank } from "./fill-blank";
import { SentenceOrdering } from "./sentence-ordering";
import { Correction } from "./correction";
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

function GamificationBar() {
  const { state } = useGrammar();
  const { gamification } = state;
  const nextLevelXp = gamification.level * 100;
  const progressPct = Math.min(
    100,
    (gamification.xp / nextLevelXp) * 100,
  );
  const progressColor =
    progressPct >= 80
      ? "bg-lime"
      : progressPct >= 40
        ? "bg-yellow-400"
        : "bg-orange-400";

  return (
    <div className="shrink-0 bg-gradient-to-r from-[#1e1e1e] via-[#222] to-[#1e1e1e] border-b border-[#2a2a2a]">
      <div className="flex items-center gap-5 px-6 py-2.5 text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-yellow-400/10">
            <span className="text-yellow-400 text-xs font-bold">✦</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold tabular-nums">
                {gamification.xp}
              </span>
              <span className="text-white/40 text-xs">XP</span>
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  progressPct >= 80
                    ? "bg-lime/20 text-lime"
                    : "bg-yellow-400/20 text-yellow-400"
                }`}
              >
                Lv.{gamification.level}
              </span>
            </div>
            <div className="w-24 h-1 rounded-full bg-[#333] overflow-hidden mt-1">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {gamification.streak > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-400/10 border border-orange-400/20">
            <span className="text-sm">🔥</span>
            <span className="text-orange-300 text-xs font-semibold tabular-nums">
              {gamification.streak}
            </span>
            <span className="text-orange-400/50 text-[10px] hidden sm:inline">
              streak
            </span>
          </div>
        )}

        <div className="flex items-center gap-1 ml-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs transition-all duration-300 ${
                i < gamification.lives
                  ? "text-red-400 bg-red-400/10"
                  : "text-[#333] bg-[#252525]"
              }`}
            >
              ♥
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhaseNav() {
  const { state, goToPhase } = useGrammar();
  const phaseIndex = PHASES.findIndex((p) => p.id === state.currentPhase);

  return (
    <div className="flex items-center gap-1.5 px-6 py-2 overflow-x-auto no-scrollbar border-b border-[#252525]">
      {PHASES.map((phase, i) => {
        const active = state.currentPhase === phase.id;
        const done = i < phaseIndex;
        return (
          <button
            key={phase.id}
            onClick={() => goToPhase(phase.id)}
            disabled={!done && !active}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              active
                ? "bg-lime/10 text-lime border border-lime/20"
                : done
                  ? "text-green-400/70 hover:bg-white/5"
                  : "text-white/20 cursor-not-allowed"
            }`}
          >
            {done && (
              <CheckCircle2 className="w-3 h-3 text-green-400" />
            )}
            {phase.label}
          </button>
        );
      })}
    </div>
  );
}

function DashboardPhase() {
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
        <h2 className="text-lg font-semibold text-white mb-3">
          Select Your Level
        </h2>
        <div className="flex flex-wrap gap-2">
          {CEFR_LEVELS.map((level) => {
            const isActive = activeCefrLevel === level.id;
            const count = levelCounts[level.id] ?? 0;
            return (
              <button
                key={level.id}
                onClick={() => setCefrLevel(level.id)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-lime text-[#171717] shadow-[0_0_12px_-4px_#d2ff5e]"
                    : "bg-[#252525] text-white/50 hover:bg-[#333] hover:text-white/70 border border-[#2a2a2a]"
                }`}
              >
                {level.label}
                <span className="ml-1.5 text-[10px] opacity-60">
                  {count} {count === 1 ? "lesson" : "lessons"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {completedCount > 0 && (
        <div className="rounded-2xl bg-gradient-to-b from-[#252525] to-[#1e1e1e] border border-[#333] p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-lime" />
            <span className="text-xs font-semibold text-lime uppercase tracking-wider">
              Level Progress
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-[#333] overflow-hidden">
              <div
                className="h-full rounded-full bg-lime transition-all duration-500"
                style={{
                  width: `${lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-sm text-white/50 tabular-nums shrink-0">
              {completedCount} / {lessons.length}
            </span>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
          Grammar Lessons — {activeCefrLevel}
        </h3>
        <div className="grid gap-2">
          {lessons.map((lesson) => {
            const isCompleted = completedLessonIds.includes(lesson.id);
            return (
              <button
                key={lesson.id}
                onClick={() => startLesson(lesson.id)}
                className="group flex items-center gap-4 rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] p-4 text-left transition-all duration-200 hover:border-[#3a3a3a] hover:bg-[#222]"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-fuchsia-accent/10 shrink-0">
                  <BookOpen className="h-5 w-5 text-fuchsia-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white group-hover:text-white transition-colors">
                      {lesson.title}
                    </h4>
                    {isCompleted && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-accent shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-white/30">
                      {lesson.categoryLabel}
                    </span>
                    <span className="text-[8px] text-white/15">·</span>
                    <span className="text-[10px] text-white/30 capitalize">
                      {lesson.difficulty}
                    </span>
                    <span className="text-[8px] text-white/15">·</span>
                    <span className="text-[10px] text-white/30">
                      {lesson.exercises.length} exercises
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-lime group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
              </button>
            );
          })}
          {lessons.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-white/30">
              <BookOpen className="h-6 w-6 mb-2 opacity-50" />
              <p className="text-sm">No lessons available yet for this level</p>
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
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-white/40">Lesson not found.</p>
      </div>
    );
  }

  return (
    <LessonView
      lesson={lesson}
      onStartPractice={() => nextPhase()}
    />
  );
}

function PracticePhase() {
  const { state, submitExercise, nextPhase } = useGrammar();
  const lesson = state.activeLessonId
    ? getLessonById(state.activeLessonId)
    : undefined;

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-white/40">Lesson not found.</p>
      </div>
    );
  }

  const exercise = lesson.exercises[state.currentExerciseIndex];

  if (!exercise) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-white/40">No exercises for this lesson.</p>
      </div>
    );
  }

  const exerciseLabels: Record<string, string> = {
    multiple_choice: "Multiple Choice",
    fill_blank: "Fill in the Blank",
    ordering: "Sentence Ordering",
    correction: "Correction",
  };

  const handleAnswer = (isCorrect: boolean) => {
    submitExercise(exercise, isCorrect);
  };

  const allDone =
    state.currentExerciseIndex >= lesson.exercises.length - 1 &&
    Object.keys(state.exerciseResults).length >= lesson.exercises.length;

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PencilLine className="h-4 w-4 text-lime" />
          <span className="text-sm font-medium text-white/70">
            {exerciseLabels[exercise.type] ?? "Exercise"}
          </span>
          <span className="text-xs text-white/30">
            {state.currentExerciseIndex + 1} / {lesson.exercises.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-yellow-400/70">
            +{exercise.points} XP
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {lesson.exercises.map((ex, i) => {
          const result = state.exerciseResults[ex.id];
          let color = "bg-[#333]";
          if (result?.correct === true) color = "bg-green-500";
          else if (result?.correct === false) color = "bg-red-500/60";
          if (i === state.currentExerciseIndex && !result)
            color = "bg-lime/60";
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
          key={exercise.id + "-" + state.currentExerciseIndex}
          exercise={exercise}
          onAnswer={handleAnswer}
        />
      )}
      {!allDone && exercise.type === "fill_blank" && (
        <FillBlank
          key={exercise.id + "-" + state.currentExerciseIndex}
          exercise={exercise}
          onAnswer={handleAnswer}
        />
      )}
      {!allDone && exercise.type === "ordering" && (
        <SentenceOrdering
          key={exercise.id + "-" + state.currentExerciseIndex}
          exercise={exercise}
          onAnswer={handleAnswer}
        />
      )}
      {!allDone && exercise.type === "correction" && (
        <Correction
          key={exercise.id + "-" + state.currentExerciseIndex}
          exercise={exercise}
          onAnswer={handleAnswer}
        />
      )}

      {allDone && (
        <div className="flex flex-col items-center gap-4 pt-4 animate-fade-in-up">
          <div className="rounded-xl bg-lime/10 border border-lime/20 px-6 py-3 text-center">
            <CheckCircle2 className="h-6 w-6 text-lime mx-auto mb-1" />
            <p className="text-sm font-semibold text-lime">
              All exercises completed!
            </p>
            <p className="text-xs text-white/40 mt-1">
              Review your results and see your score.
            </p>
          </div>
          <button
            onClick={() => nextPhase()}
            className="px-8 py-2.5 rounded-xl bg-lime text-[#171717] font-semibold text-sm hover:bg-lime-dark active:scale-[0.97] transition-all duration-150 shadow-lg shadow-lime/20"
          >
            See Results
          </button>
        </div>
      )}
    </div>
  );
}

function ResultsPhase() {
  const { state, returnToDashboard, startLesson } = useGrammar();
  const lesson = state.activeLessonId
    ? getLessonById(state.activeLessonId)
    : undefined;

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-white/40">No results available.</p>
      </div>
    );
  }

  const results = lesson.exercises.map((ex) => ({
    ...ex,
    result: state.exerciseResults[ex.id],
  }));
  const correctCount = results.filter(
    (r) => r.result?.correct,
  ).length;
  const totalPoints = results.reduce(
    (sum, r) => sum + (r.result?.points ?? 0),
    0,
  );
  const accuracy =
    results.length > 0
      ? Math.round((correctCount / results.length) * 100)
      : 0;

  const allLessons = getLessonsByLevel(state.activeCefrLevel);
  const currentIdx = allLessons.findIndex(
    (l) => l.id === state.activeLessonId,
  );
  const nextLesson =
    currentIdx >= 0 && currentIdx < allLessons.length - 1
      ? allLessons[currentIdx + 1]
      : null;

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex flex-col items-center py-4">
        <div className="relative w-28 h-28 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#252525"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#d2ff5e"
              strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - accuracy / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {accuracy}%
            </span>
            <span className="text-[10px] text-white/40">Accuracy</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-green-400 font-semibold tabular-nums">
              {correctCount}/{results.length}
            </p>
            <p className="text-[10px] text-white/40">Correct</p>
          </div>
          <div className="w-px h-8 bg-[#333]" />
          <div className="text-center">
            <p className="text-yellow-400 font-semibold tabular-nums">
              +{totalPoints}
            </p>
            <p className="text-[10px] text-white/40">XP Earned</p>
          </div>
          <div className="w-px h-8 bg-[#333]" />
          <div className="text-center">
            <p className="text-white font-semibold">{lesson.title}</p>
            <p className="text-[10px] text-white/40">Lesson</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider px-1">
          Exercise Review
        </h3>
        {results.map((ex, i) => (
          <div
            key={ex.id}
            className={`rounded-xl border p-3 flex items-start gap-3 ${
              ex.result?.correct
                ? "bg-green-600/5 border-green-500/20"
                : "bg-red-600/5 border-red-500/20"
            }`}
          >
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 mt-0.5 ${
                ex.result?.correct
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              <span className="text-xs font-bold">
                {ex.result?.correct ? "✓" : "✗"}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-white/60">
                  {i + 1}.
                </span>
                <p className="text-sm text-white/80 line-clamp-1">
                  {ex.question}
                </p>
              </div>
              <p className="text-xs text-white/40 mt-0.5 line-clamp-2">
                {ex.explanation}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-3 pt-2 pb-8">
        <button
          onClick={returnToDashboard}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#252525] border border-[#333] text-sm text-white/60 hover:bg-[#2a2a2a] hover:text-white/80 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lessons
        </button>
        {nextLesson && (
          <button
            onClick={() => startLesson(nextLesson.id)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-lime text-[#171717] font-semibold text-sm hover:bg-lime-dark transition-all"
          >
            <Sparkles className="h-4 w-4" />
            Next: {nextLesson.title}
          </button>
        )}
      </div>
    </div>
  );
}

interface GrammarModuleProps {
  lang?: string;
}

export function GrammarModule({ lang: _lang }: GrammarModuleProps) {
  const { state, returnToDashboard } = useGrammar();

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-[#1a1a1a] to-[#151515] overflow-hidden">
      <GamificationBar />

      {state.currentPhase !== "dashboard" && <PhaseNav />}

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 py-6">
          {state.currentPhase !== "dashboard" && (
            <button
              onClick={returnToDashboard}
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/50 mb-4 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All Lessons
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
