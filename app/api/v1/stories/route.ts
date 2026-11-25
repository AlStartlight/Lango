import { authError, authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { getStoryCatalog } from "@/lib/story/repository";
import { isLanguageCode } from "@/lib/i18n/locales";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const context = await getSessionContext();
  if (!context) return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  const url = new URL(request.url);
  const language =
    url.searchParams.get("language") ??
    context.user.activeLanguageCode ??
    context.user.targetLanguage;
  if (!isLanguageCode(language)) {
    return authError("Kode bahasa tidak dikenal.", 400, "INVALID_LANGUAGE");
  }
  let catalog;
  try {
    catalog = await getStoryCatalog(context.user.id, language);
  } catch (error) {
    console.error("story-catalog", error);
    return authError("Cerita gagal dimuat.", 500, "INTERNAL_ERROR");
  }
  if (!catalog) {
    return authError("Cerita belum tersedia untuk bahasa ini.", 404, "STORY_NOT_FOUND");
  }
  return authOk(catalog);
}
