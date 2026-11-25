import { NextRequest } from "next/server";
import { authError, authOk, firstZodMessage } from "@/lib/api/auth-response";
import { LocalePreferenceSchema } from "@/lib/auth/validation";
import { writeLocaleCookie } from "@/lib/i18n/cookie";
import { toHtmlLang, toTextDirection } from "@/lib/i18n/locales";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { getSessionContext } from "@/lib/auth/session";
import { getClientIp } from "@/lib/auth/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cookie-only locale preference for anonymous visitors. Signed-in users must
 * use PATCH /api/v1/me so the account preference is persisted too.
 */
export async function POST(request: NextRequest) {
  const context = await getSessionContext();
  if (context) {
    return authError(
      "Gunakan PATCH /api/v1/me untuk menyimpan preferensi akun.",
      400,
      "USE_ME_ENDPOINT",
    );
  }

  const ip = getClientIp(request);
  const limit = checkRateLimit(`locale:${ip}`, 60, 60 * 1000);
  if (!limit.allowed) {
    return authError("Terlalu banyak permintaan.", 429, "RATE_LIMITED");
  }

  const body = await request.json().catch(() => null);
  const parsed = LocalePreferenceSchema.safeParse(body);
  if (!parsed.success) {
    return authError(firstZodMessage(parsed.error), 400, "INVALID_LOCALE");
  }

  const { uiLocale } = parsed.data;
  await writeLocaleCookie(uiLocale);

  return authOk({
    uiLocale,
    htmlLang: toHtmlLang(uiLocale),
    dir: toTextDirection(uiLocale),
  });
}
