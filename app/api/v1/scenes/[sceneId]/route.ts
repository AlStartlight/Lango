import { authError, authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { getSceneDetail } from "@/lib/story/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sceneId: string }> },
) {
  const context = await getSessionContext();
  if (!context) return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  const { sceneId } = await params;
  const locale = new URL(request.url).searchParams.get("locale") ?? context.user.explanationLocale;
  const scene = await getSceneDetail(context.user.id, sceneId, locale);
  if (!scene) return authError("Scene tidak ditemukan.", 404, "SCENE_NOT_FOUND");
  return authOk(
    { scene },
  );
}
