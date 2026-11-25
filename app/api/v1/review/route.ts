import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authError, authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { getReviewQueue } from "@/lib/learning/content-repository";
import { isLanguageCode } from "@/lib/i18n/locales";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const addSchema = z.object({
  conceptKey: z.string().min(3).max(200),
  moduleId: z.string().min(1).max(40).default("story"),
  sourceType: z.string().min(1).max(40).default("story_line"),
  sourceId: z.string().max(200).optional(),
  languageCode: z.string().min(2).max(8).optional(),
});

export async function GET(request: Request) {
  const context = await getSessionContext();
  if (!context) {
    return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  }

  const url = new URL(request.url);
  const language = url.searchParams.get("language");
  if (language && !isLanguageCode(language)) {
    return authError("Kode bahasa tidak dikenal.", 400, "INVALID_LANGUAGE");
  }

  return authOk({
    items: await getReviewQueue(context.user.id, language),
  });
}

export async function POST(request: Request) {
  const context = await getSessionContext();
  if (!context) return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  if (!prisma) return authError("Database belum dikonfigurasi.", 503, "SERVICE_UNAVAILABLE");
  const parsed = addSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return authError("Kartu review tidak valid.", 400, "INVALID_REQUEST");
  const item = await prisma.spacedReviewItem.upsert({
    where: { userId_conceptKey: { userId: context.user.id, conceptKey: parsed.data.conceptKey } },
    update: {
      status: "active",
      priority: "medium",
      dueAt: new Date(Date.now() + 86_400_000),
      sourceType: parsed.data.sourceType,
      sourceId: parsed.data.sourceId ?? null,
      moduleId: parsed.data.moduleId,
      languageCode: parsed.data.languageCode ?? context.user.activeLanguageCode ?? context.user.targetLanguage,
    },
    create: {
      userId: context.user.id,
      conceptKey: parsed.data.conceptKey,
      moduleId: parsed.data.moduleId,
      sourceType: parsed.data.sourceType,
      sourceId: parsed.data.sourceId ?? null,
      languageCode: parsed.data.languageCode ?? context.user.activeLanguageCode ?? context.user.targetLanguage,
      dueAt: new Date(Date.now() + 86_400_000),
      intervalDays: 1,
    },
  });
  return authOk({ id: item.id, dueAt: item.dueAt.toISOString() }, 201);
}
