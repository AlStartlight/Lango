import { z } from "zod";
import { authError, authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { saveStoryChoice } from "@/lib/story/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  sceneId: z.string().min(3).max(200),
  choiceId: z.string().min(3).max(200),
  optionId: z.string().min(1).max(40),
});

export async function POST(request: Request) {
  const context = await getSessionContext();
  if (!context) return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return authError("Pilihan tidak valid.", 400, "INVALID_REQUEST");
  const result = await saveStoryChoice({ userId: context.user.id, ...parsed.data });
  if (!result) return authError("Pilihan tidak ditemukan.", 404, "CHOICE_NOT_FOUND");
  return authOk(result);
}
