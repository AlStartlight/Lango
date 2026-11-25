"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

export function FinishSessionButton({
  lang,
  sessionId,
  label,
  errorLabel,
}: {
  lang: string;
  sessionId: string;
  label: string;
  errorLabel: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/v1/interview/sessions/${sessionId}/complete`,
        { method: "POST" },
      );
      if (!response.ok) {
        const json = (await response.json()) as { error?: { message?: string } };
        setError(json.error?.message ?? errorLabel);
        setLoading(false);
        return;
      }
      router.push(`/${lang}/visa-kerja/laporan/${sessionId}`);
    } catch {
      setError(errorLabel);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => void finish()}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-exp-primary px-4 py-3 text-sm font-extrabold text-exp-on-primary shadow-[0_4px_0_var(--exp-primary)] disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        )}
        {label}
      </button>
      {error && (
        <p role="alert" className="text-[11px] font-bold text-exp-error">
          {error}
        </p>
      )}
    </div>
  );
}
