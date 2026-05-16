"use client";

import {
  BookOpen,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Table2,
} from "lucide-react";
import type { GrammarLesson } from "./types";

interface LessonViewProps {
  lesson: GrammarLesson;
  onStartPractice: () => void;
}

export function LessonView({ lesson, onStartPractice }: LessonViewProps) {
  return (
    <div className="animate-fade-in-up space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-fuchsia-accent/10 text-fuchsia-accent/80 border border-fuchsia-accent/20">
            {lesson.cefrLevel}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-accent/10 text-blue-accent/80 border border-blue-accent/20">
            {lesson.categoryLabel}
          </span>
          <span className="text-[11px] text-white/30 capitalize">{lesson.difficulty}</span>
        </div>
        <h2 className="text-xl font-bold text-white">{lesson.title}</h2>
        <p className="text-sm text-white/50 mt-1">{lesson.description}</p>
      </div>

      {/* Explanation */}
      <div className="rounded-2xl bg-gradient-to-b from-[#252525] to-[#1e1e1e] border border-[#333] p-5">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-blue-accent" />
          <span className="text-xs font-semibold text-blue-accent uppercase tracking-wider">
            Explanation
          </span>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">
          {lesson.content.explanation}
        </p>
      </div>

      {/* Rules */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
          Key Rules
        </h3>
        {lesson.content.rules.map((rule, i) => (
          <div
            key={i}
            className={`rounded-2xl border p-4 ${
              rule.highlight
                ? "bg-[#d2ff5e]/5 border-[#d2ff5e]/20"
                : "bg-[#1e1e1e] border-[#2a2a2a]"
            }`}
          >
            <div className="flex items-start gap-3">
              {rule.highlight && (
                <Lightbulb className="h-4 w-4 text-lime shrink-0 mt-0.5" />
              )}
              <div>
                <h4
                  className={`text-sm font-semibold mb-1 ${
                    rule.highlight ? "text-lime" : "text-white/80"
                  }`}
                >
                  {rule.title}
                </h4>
                <p className="text-sm text-white/50 leading-relaxed">
                  {rule.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Examples */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
          Examples
        </h3>
        {lesson.content.examples.map((ex, i) => (
          <div
            key={i}
            className="rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a] overflow-hidden"
          >
            <div className="p-4 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-accent shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-green-accent/80 font-medium">
                    Correct
                  </span>
                  <p className="text-sm text-white/80 mt-0.5">{ex.correct}</p>
                </div>
              </div>
              {ex.incorrect && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm text-red-400/80 font-medium">
                      Common Mistake
                    </span>
                    <p className="text-sm text-red-400/60 mt-0.5 line-through">
                      {ex.incorrect}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {ex.annotation && (
              <div className="bg-[#252525] border-t border-[#2a2a2a] px-4 py-2">
                <p className="text-xs text-white/40">{ex.annotation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tables */}
      {lesson.content.tables && lesson.content.tables.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
            Reference Table
          </h3>
          {lesson.content.tables.map((table, i) => (
            <div
              key={i}
              className="rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a] overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2a2a2a]">
                      {table.headers.map((h, j) => (
                        <th
                          key={j}
                          className="px-4 py-2.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, j) => (
                      <tr
                        key={j}
                        className="border-b border-[#252525] last:border-0"
                      >
                        {row.map((cell, k) => (
                          <td
                            key={k}
                            className="px-4 py-2 text-sm text-white/70"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {table.caption && (
                <div className="flex items-center gap-1.5 bg-[#252525] border-t border-[#2a2a2a] px-4 py-2">
                  <Table2 className="h-3 w-3 text-white/30" />
                  <p className="text-xs text-white/40">{table.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      {lesson.content.tips && lesson.content.tips.length > 0 && (
        <div className="rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-yellow-400" />
            <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
              Learning Tips
            </span>
          </div>
          <ul className="space-y-2">
            {lesson.content.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-yellow-400/60 text-sm leading-5">•</span>
                <p className="text-sm text-white/50 leading-5">{tip}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Start Practice Button */}
      <div className="flex justify-center pb-8">
        <button
          onClick={onStartPractice}
          className="px-8 py-3 rounded-xl bg-lime text-[#171717] font-semibold text-sm hover:bg-lime-dark active:scale-[0.97] transition-all duration-150 shadow-lg shadow-lime/20"
        >
          Start Practice ({lesson.exercises.length} exercises)
        </button>
      </div>
    </div>
  );
}
