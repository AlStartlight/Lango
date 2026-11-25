"use client";

import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Table2,
  ArrowRight,
} from "lucide-react";
import type { GrammarLesson } from "./types";

interface LessonViewProps {
  lesson: GrammarLesson;
  onStartPractice: () => void;
}

export function LessonView({ lesson, onStartPractice }: LessonViewProps) {
  const { t } = useTranslation();

  return (
    <div className="animate-fade-in-up space-y-8">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="exp-pill bg-exp-tertiary-fixed text-exp-tertiary">
            {lesson.cefrLevel}
          </span>
          <span className="exp-pill bg-exp-container text-exp-on-surface-variant">
            {lesson.categoryLabel}
          </span>
          <span className="text-xs capitalize text-exp-on-surface-muted">
            {lesson.difficulty}
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-exp-on-surface">{lesson.title}</h2>
        <p className="mt-1 text-sm text-exp-on-surface-variant">{lesson.description}</p>
      </div>

      <div className="rounded-2xl border border-exp-container-high bg-exp-surface-lowest p-5">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-exp-tertiary" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wider text-exp-tertiary">
            {t("learning.grammar.explanation")}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-exp-on-surface-variant">
          {lesson.content.explanation}
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-exp-on-surface-variant">
          {t("learning.grammar.keyRules")}
        </h3>
        {lesson.content.rules.map((rule, i) => (
          <div
            key={i}
            className={`rounded-2xl border p-4 ${
              rule.highlight
                ? "border-exp-primary-container/20 bg-exp-primary-container/5"
                : "border-exp-container-high bg-exp-surface-lowest"
            }`}
          >
            <div className="flex items-start gap-3">
              {rule.highlight && (
                <Lightbulb
                  className="mt-0.5 h-4 w-4 shrink-0 text-exp-primary"
                  aria-hidden="true"
                />
              )}
              <div>
                <h4
                  className={`mb-1 text-sm font-semibold ${
                    rule.highlight ? "text-exp-primary" : "text-exp-on-surface"
                  }`}
                >
                  {rule.title}
                </h4>
                <p className="text-sm leading-relaxed text-exp-on-surface-variant">
                  {rule.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-exp-on-surface-variant">
          {t("learning.grammar.examples")}
        </h3>
        {lesson.content.examples.map((ex, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-exp-container-high bg-exp-surface-lowest"
          >
            <div className="space-y-2 p-4">
              <div className="flex items-start gap-2">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-exp-success"
                  aria-hidden="true"
                />
                <div>
                  <span className="text-sm font-medium text-exp-success">
                    {t("learning.feedback.correct")}
                  </span>
                  <p className="mt-0.5 text-sm text-exp-on-surface">{ex.correct}</p>
                </div>
              </div>
              {ex.incorrect && (
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 shrink-0 text-exp-error"
                    aria-hidden="true"
                  />
                  <div>
                    <span className="text-sm font-medium text-exp-error">
                      {t("learning.grammar.commonMistake")}
                    </span>
                    <p className="mt-0.5 text-sm text-exp-error/80 line-through">
                      {ex.incorrect}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {ex.annotation && (
              <div className="border-t border-exp-container-high bg-exp-surface-low px-4 py-2">
                <p className="text-xs text-exp-on-surface-muted">{ex.annotation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {lesson.content.tables && lesson.content.tables.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-exp-on-surface-variant">
            {t("learning.grammar.referenceTable")}
          </h3>
          {lesson.content.tables.map((table, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-exp-container-high bg-exp-surface-lowest"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-exp-container-high">
                      {table.headers.map((h, j) => (
                        <th
                          key={j}
                          scope="col"
                          className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-exp-on-surface-variant"
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
                        className="border-b border-exp-container-high last:border-0"
                      >
                        {row.map((cell, k) => (
                          <td key={k} className="px-4 py-2 text-sm text-exp-on-surface-variant">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {table.caption && (
                <div className="flex items-center gap-1.5 border-t border-exp-container-high bg-exp-surface-low px-4 py-2">
                  <Table2 className="h-3 w-3 text-exp-on-surface-muted" aria-hidden="true" />
                  <p className="text-xs text-exp-on-surface-muted">{table.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {lesson.content.tips && lesson.content.tips.length > 0 && (
        <div className="rounded-2xl border border-exp-container-high bg-exp-surface-lowest p-4">
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-exp-secondary" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider text-exp-secondary">
              {t("learning.grammar.tips")}
            </span>
          </div>
          <ul className="space-y-2">
            {lesson.content.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-sm leading-5 text-exp-secondary" aria-hidden="true">
                  •
                </span>
                <p className="text-sm leading-5 text-exp-on-surface-variant">{tip}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-center pb-8">
        <button
          type="button"
          onClick={onStartPractice}
          className="exp-btn exp-btn-primary"
        >
          {t("learning.grammar.startPractice")}
          <span className="text-xs opacity-80">
            ({t("learning.grammar.exercises", { count: lesson.exercises.length })})
          </span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
