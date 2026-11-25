import { z } from "zod";
import { authError, authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { submitStoryAttempt } from "@/lib/story/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  sceneId: z.string().min(3).max(200),
  exerciseId: z.string().min(3).max(200),
  clientAttemptId: z.string().min(8).max(80),
  answer: z.object({ choiceId: z.string().max(80).optional(), text: z.string().max(2000).optional() }),
  timeSpentMs: z.number().int().min(0).max(30 * 60 * 1000).optional(),
});

export async function POST(request: Request) {
  const context = await getSessionContext();
  if (!context) return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return authError("Jawaban tidak valid.", 400, "INVALID_REQUEST");
  const result = await submitStoryAttempt({
    userId: context.user.id,
    timezone: context.user.timezone,
    explanationLocale: context.user.explanationLocale,
    ...parsed.data,
  });
  if (!result) return authError("Latihan tidak ditemukan.", 404, "EXERCISE_NOT_FOUND");
  return authOk(result);
}
