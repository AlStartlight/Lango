import { authError, authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { getEpisodeDetail } from "@/lib/story/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ episodeId: string }> },
) {
  const context = await getSessionContext();
  if (!context) return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  const { episodeId } = await params;
  const detail = await getEpisodeDetail(context.user.id, episodeId);
  if (!detail) return authError("Episode tidak ditemukan.", 404, "EPISODE_NOT_FOUND");
  return authOk({
    episode: detail.episode,
    arc: detail.arc,
    world: detail.content.world,
    scenes: detail.scenes,
    completed: detail.completed,
    total: detail.scenes.length,
  });
}
