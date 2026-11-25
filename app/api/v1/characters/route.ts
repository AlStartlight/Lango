import { authError, authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { getCharacters } from "@/lib/story/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const context = await getSessionContext();
  if (!context) return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  const worldId = new URL(request.url).searchParams.get("worldId");
  if (!worldId) return authError("worldId wajib diisi.", 400, "INVALID_REQUEST");
  return authOk(await getCharacters(context.user.id, worldId));
}
