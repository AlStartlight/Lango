import { authError, authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { getLessonDetail } from "@/lib/learning/content-repository";
import { isContentLanguage } from "@/lib/i18n/locales";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await getSessionContext();
  if (!context) {
    return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  }

  const { id } = await params;
  const explanationLocale = isContentLanguage(context.user.explanationLocale)
    ? context.user.explanationLocale
    : "en";
  const lesson = await getLessonDetail(
    decodeURIComponent(id),
    context.user.id,
    explanationLocale,
  );

  if (!lesson) {
    return authError("Pelajaran tidak ditemukan.", 404, "NOT_FOUND");
  }

  // DTO intentionally excludes answerKey/isCorrect/explanation.
  return authOk(lesson);
}
