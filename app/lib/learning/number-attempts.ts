"use client";

export interface NumberAttemptInput {
  languageCode: string;
  value: number;
  phase: string;
  answer: string | number;
  timeSpentMs?: number;
}

export const NUMBER_ATTEMPT_EVENT = "lango:number-attempt";

/**
 * Fire-and-forget persistence for a Number Name answer. The server validates
 * the answer and awards XP; the module listens for the event and refreshes its
 * persisted-progress strip.
 */
export function recordNumberAttempt(input: NumberAttemptInput): void {
  if (typeof window === "undefined") return;

  void fetch("/api/v1/number-attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientAttemptId: crypto.randomUUID(),
      languageCode: input.languageCode,
      value: input.value,
      phase: input.phase,
      answer: input.answer,
      timeSpentMs: input.timeSpentMs ?? 0,
    }),
  })
    .then(async (response) => {
      if (!response.ok) return;
      const body = await response.json().catch(() => null);
      window.dispatchEvent(
        new CustomEvent(NUMBER_ATTEMPT_EVENT, {
          detail: body?.data ?? null,
        }),
      );
    })
    .catch(() => {
      // Persistence must never block the learning flow.
    });
}
