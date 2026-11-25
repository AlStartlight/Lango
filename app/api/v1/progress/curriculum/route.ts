import { authError, authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { getCurriculumProgress } from "@/lib/learning/content-repository";
import { isLanguageCode } from "@/lib/i18n/locales";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const context = await getSessionContext();
  if (!context) {
    return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  }

  const url = new URL(request.url);
  const language = url.searchParams.get("language") ?? context.user.targetLanguage;

  if (!isLanguageCode(language)) {
    return authError("Kode bahasa tidak dikenal.", 400, "INVALID_LANGUAGE");
  }

  const progress = await getCurriculumProgress(context.user.id, language);
  if (!progress) {
    return authError(
      "Kurikulum untuk bahasa ini belum tersedia.",
      404,
      "CURRICULUM_NOT_FOUND",
    );
  }

  return authOk(progress);
}
