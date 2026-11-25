import { z } from "zod";
import { authError, authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { isLanguageCode } from "@/lib/i18n/locales";
import { rateVaultCard } from "@/lib/story/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  conceptKey: z.string().min(8).max(200),
  language: z.string().min(2).max(8),
  rating: z.enum(["again", "hard", "good", "easy"]),
  sourceId: z.string().max(200).nullable().optional(),
});

export async function POST(request: Request) {
  const context = await getSessionContext();
  if (!context) return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return authError("Penilaian kartu tidak valid.", 400, "INVALID_REQUEST");
  if (!isLanguageCode(parsed.data.language)) {
    return authError("Kode bahasa tidak dikenal.", 400, "INVALID_LANGUAGE");
  }
  const result = await rateVaultCard({
    userId: context.user.id,
    language: parsed.data.language,
    conceptKey: parsed.data.conceptKey,
    rating: parsed.data.rating,
    sourceId: parsed.data.sourceId ?? null,
  });
  if (!result) return authError("Kartu tidak ditemukan.", 404, "CARD_NOT_FOUND");
  return authOk(result);
}
