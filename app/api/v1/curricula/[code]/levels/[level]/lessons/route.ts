import { authError, authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { getLessonsForLevel } from "@/lib/learning/content-repository";
import { isContentLanguage, isLanguageCode } from "@/lib/i18n/locales";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string; level: string }> },
) {
  const context = await getSessionContext();
  if (!context) {
    return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  }

  const { code, level } = await params;
  if (!isLanguageCode(code)) {
    return authError("Kode bahasa tidak dikenal.", 400, "INVALID_LANGUAGE");
  }
  const lessons = await getLessonsForLevel(
    code,
    level.toUpperCase(),
    context.user.id,
    isContentLanguage(context.user.explanationLocale)
      ? context.user.explanationLocale
      : "en",
  );

  if (!lessons) {
    return authError(
      "Level atau kurikulum tidak ditemukan.",
      404,
      "LEVEL_NOT_FOUND",
    );
  }

  return authOk({ languageCode: code, level: level.toUpperCase(), lessons });
}
