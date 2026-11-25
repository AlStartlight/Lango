import { authError, authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { getWorldDetail } from "@/lib/story/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ worldId: string; arcId: string }> },
) {
  const context = await getSessionContext();
  if (!context) return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  const { worldId, arcId } = await params;
  const world = await getWorldDetail(context.user.id, worldId);
  if (!world) return authError("Dunia cerita tidak ditemukan.", 404, "WORLD_NOT_FOUND");
  for (const level of world.levels) {
    const arc = level.arcs.find((item) => item.id === arcId);
    if (arc) return authOk({ world: world.world, level, arc });
  }
  return authError("Arc tidak ditemukan.", 404, "ARC_NOT_FOUND");
}
