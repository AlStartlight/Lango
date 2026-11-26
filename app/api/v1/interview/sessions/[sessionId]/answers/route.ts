import { z } from "zod";
import { authError, authOk, firstZodMessage } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { submitInterviewAnswer } from "@/lib/interview/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  questionId: z.string().min(3).max(80),
  transcript: z.string().trim().min(1, "Jawaban tidak boleh kosong.").max(6000),
  durationMs: z.number().int().min(0).max(30 * 60 * 1000).default(0),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const context = await getSessionContext();
  if (!context) {
    return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  }

  const { sessionId } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return authError(firstZodMessage(parsed.error), 400, "INVALID_REQUEST");
  }

  const result = await submitInterviewAnswer({
    userId: context.user.id,
    sessionId,
    canonicalId: parsed.data.questionId,
    transcript: parsed.data.transcript,
    durationMs: parsed.data.durationMs,
  });

  if ("error" in result) {
    const map: Record<string, [string, number, string]> = {
      NOT_FOUND: ["Sesi latihan tidak ditemukan.", 404, "NOT_FOUND"],
      SESSION_COMPLETE: ["Sesi ini sudah selesai.", 409, "SESSION_COMPLETE"],
      QUESTION_NOT_IN_SESSION: [
        "Pertanyaan tidak termasuk dalam sesi ini.",
        400,
        "QUESTION_NOT_IN_SESSION",
      ],
      OUT_OF_ORDER: [
        "Jawab pertanyaan sesuai urutan.",
        409,
        "OUT_OF_ORDER",
      ],
      QUESTION_NOT_FOUND: [
        "Pertanyaan tidak ditemukan.",
        404,
        "QUESTION_NOT_FOUND",
      ],
    };
    const [message, status, code] = map[result.error] ?? [
      "Latihan gagal diproses.",
      400,
      "BAD_REQUEST",
    ];
    return authError(message, status, code);
  }

  return authOk(result);
}
