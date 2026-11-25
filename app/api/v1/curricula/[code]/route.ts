import { authError, publicOk } from "@/lib/api/auth-response";
import { getCurriculumSummary } from "@/lib/learning/content-repository";
import { isLanguageCode } from "@/lib/i18n/locales";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  if (!isLanguageCode(code)) {
    return authError("Kode bahasa tidak dikenal.", 400, "INVALID_LANGUAGE");
  }
  const summary = await getCurriculumSummary(code);

  if (!summary) {
    return authError(
      "Kurikulum untuk bahasa ini belum tersedia.",
      404,
      "CURRICULUM_NOT_FOUND",
    );
  }

  return publicOk(
    summary,
    "public, s-maxage=600, stale-while-revalidate=3600",
  );
}
