import { authError, authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { getMaterialDetail } from "@/lib/story/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ materialId: string }> },
) {
  const context = await getSessionContext();
  if (!context) return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  const { materialId } = await params;
  const locale = new URL(request.url).searchParams.get("locale") ?? context.user.explanationLocale;
  const material = await getMaterialDetail(context.user.id, materialId, locale);
  if (!material) return authError("Materi tidak ditemukan.", 404, "MATERIAL_NOT_FOUND");
  return authOk(material);
}
