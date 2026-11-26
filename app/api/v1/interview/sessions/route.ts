import { z } from "zod";
import { authError, authOk, firstZodMessage } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { createInterviewSession } from "@/lib/interview/repository";
import {
  INTERVIEW_LANGUAGES,
  INTERVIEW_TRACK_IDS,
  toPublicQuestion,
} from "@/lib/interview/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  language: z.enum(INTERVIEW_LANGUAGES),
  track: z.enum(INTERVIEW_TRACK_IDS),
  mode: z.enum(["drill", "simulation"]),
});

export async function POST(request: Request) {
  const context = await getSessionContext();
  if (!context) {
    return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return authError(firstZodMessage(parsed.error), 400, "INVALID_REQUEST");
  }

  const locale = ["en", "id", "ja"].includes(context.user.explanationLocale)
    ? context.user.explanationLocale
    : "en";

  const session = await createInterviewSession({
    userId: context.user.id,
    language: parsed.data.language,
    track: parsed.data.track,
    mode: parsed.data.mode,
    locale,
  });

  if ("error" in session) {
    if (session.error === "RATE_LIMITED") {
      return authError(
        "Batas latihan harian tercapai. Coba lagi besok.",
        429,
        "RATE_LIMITED",
      );
    }
    return authError(
      "Konten untuk bahasa ini belum tersedia.",
      404,
      "NO_CONTENT",
    );
  }

  return authOk({
    ...session,
    questions: session.questions.map(toPublicQuestion),
  });
}
