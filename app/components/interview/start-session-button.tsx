"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { InterviewLanguage, InterviewMode, InterviewTrackId } from "@/lib/interview/types";

export function StartSessionButton({
  lang,
  language,
  track,
  mode,
  label,
  tone = "primary",
}: {
  lang: string;
  language: InterviewLanguage;
  track: InterviewTrackId;
  mode: InterviewMode;
  label: string;
  tone?: "primary" | "outline";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/interview/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, track, mode }),
      });
      const json = (await response.json()) as {
        success?: boolean;
        data?: { id?: string };
        error?: { message?: string };
      };
      if (!response.ok || !json.success || !json.data?.id) {
        setError(json.error?.message ?? "Gagal memulai sesi latihan.");
        return;
      }
      router.push(`/${lang}/visa-kerja/sesi/${json.data.id}`);
    } catch {
      setError("Koneksi gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={start}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold transition-colors disabled:cursor-wait disabled:opacity-70 ${
          tone === "primary"
            ? "bg-exp-primary text-exp-on-primary shadow-[0_3px_0_var(--exp-primary)] hover:bg-exp-primary/90"
            : "border border-exp-container-high bg-exp-surface-lowest text-exp-on-surface hover:bg-exp-container"
        }`}
      >
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
        {label}
      </button>
      {error && (
        <p role="alert" className="max-w-56 text-[10px] font-semibold leading-4 text-exp-error">
          {error}
        </p>
      )}
    </div>
  );
}
