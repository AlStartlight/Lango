import { authError, authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { getEpisodeDetail } from "@/lib/story/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ worldId: string }> },
) {
  const context = await getSessionContext();
  if (!context) return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  const { worldId } = await params;
  const url = new URL(request.url);
  const episodeId = url.searchParams.get("episodeId");
  if (!episodeId) return authError("episodeId wajib diisi.", 400, "INVALID_REQUEST");
  const detail = await getEpisodeDetail(context.user.id, episodeId);
  if (!detail || detail.content.world.id !== worldId) {
    return authError("Episode tidak ditemukan.", 404, "EPISODE_NOT_FOUND");
  }
  const last = detail.episode.scenes.at(-1);
  return authOk({
    episodeId,
    title: detail.episode.title,
    recap: detail.episode.recap,
    lines: last ? last.lines.slice(-3).map((line) => ({ id: line.id, text: line.text, translation: line.translation })) : [],
    nextEpisodeId: detail.arc.episodes[detail.episode.episodeNo]?.id ?? null,
  });
}
