"use client";

import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ExerciseFeedbackProps {
  correct: boolean;
  explanation?: string;
  userAnswer?: string;
  correctAnswer?: string;
  onContinue: () => void;
  continueLabel?: string;
}

/**
 * Feedback stays mounted until the learner explicitly continues. This prevents
 * the explanation from being replaced by the next exercise after a timeout.
 */
export function ExerciseFeedback({
  correct,
  explanation,
  userAnswer,
  correctAnswer,
  onContinue,
  continueLabel,
}: ExerciseFeedbackProps) {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`animate-fade-in-up space-y-3 rounded-2xl border-2 p-4 ${
        correct
          ? "border-exp-success/40 bg-exp-primary-container/10"
          : "border-exp-error/40 bg-exp-error/10"
      }`}
    >
      <p
        className={`flex items-center gap-2 text-sm font-extrabold ${
          correct ? "text-exp-success" : "text-exp-error"
        }`}
      >
        {correct ? (
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        ) : (
          <XCircle className="h-4 w-4" aria-hidden="true" />
        )}
        {correct
          ? t("learning.feedback.correct")
          : t("learning.feedback.incorrect")}
      </p>

      {userAnswer && (
        <div className="text-sm text-exp-on-surface-variant">
          <span className="text-exp-on-surface-muted">
            {t("learning.feedback.yourAnswer")}:{" "}
          </span>
          <span className="font-medium text-exp-on-surface">{userAnswer}</span>
        </div>
      )}

      {!correct && correctAnswer && (
        <div className="text-sm text-exp-on-surface-variant">
          <span className="text-exp-on-surface-muted">
            {t("learning.feedback.correctAnswer")}:{" "}
          </span>
          <span className="font-medium text-exp-on-surface">{correctAnswer}</span>
        </div>
      )}

      {explanation && (
        <div className="text-sm leading-relaxed text-exp-on-surface-variant">
          <span className="text-exp-on-surface-muted">
            {t("learning.feedback.explanation")}:{" "}
          </span>
          {explanation}
        </div>
      )}

      <button
        type="button"
        onClick={onContinue}
        className="exp-btn exp-btn-primary"
      >
        {continueLabel ?? t("learning.feedback.continue")}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
