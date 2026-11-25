import { z } from "zod";
import { authError, authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { flagStoryScene } from "@/lib/story/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  reason: z.enum(["romanization", "translation", "culture", "audio", "other"]),
  note: z.string().max(1000).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sceneId: string }> },
) {
  const context = await getSessionContext();
  if (!context) return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  const { sceneId } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return authError("Laporan tidak valid.", 400, "INVALID_REQUEST");
  const flag = await flagStoryScene({
    userId: context.user.id,
    sceneId,
    reason: parsed.data.reason,
    note: parsed.data.note,
  });
  if (!flag) return authError("Scene tidak ditemukan.", 404, "SCENE_NOT_FOUND");
  return authOk(flag, 201);
}
