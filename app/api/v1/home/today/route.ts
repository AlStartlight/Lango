import { authError, authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { getHomeToday } from "@/lib/learning/content-repository";
import { isContentLanguage } from "@/lib/i18n/locales";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const context = await getSessionContext();
  if (!context) {
    return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  }

  const data = await getHomeToday({
    userId: context.user.id,
    language: context.user.targetLanguage,
    level: context.user.curriculumLevel,
    explanationLocale: isContentLanguage(context.user.explanationLocale)
      ? context.user.explanationLocale
      : "en",
    goalMinutes: context.user.dailyGoalMinutes,
    timezone: context.user.timezone,
  });

  return authOk(data);
}
