import { z } from "zod";
import { authError, authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { saveStoryProgress } from "@/lib/story/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  sceneId: z.string().min(3).max(200),
  clientEventId: z.string().min(8).max(120),
  status: z.enum(["in_progress", "completed"]),
  lastLineId: z.string().max(200).nullable().optional(),
  minutes: z.number().int().min(0).max(30).optional(),
});

export async function POST(request: Request) {
  const context = await getSessionContext();
  if (!context) return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return authError("Progres tidak valid.", 400, "INVALID_PROGRESS");
  const result = await saveStoryProgress({
    userId: context.user.id,
    timezone: context.user.timezone,
    ...parsed.data,
  });
  if (!result) return authError("Scene tidak ditemukan.", 404, "SCENE_NOT_FOUND");
  return authOk(result);
}
