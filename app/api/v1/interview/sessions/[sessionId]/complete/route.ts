import { authError, authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { completeInterviewSession } from "@/lib/interview/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const context = await getSessionContext();
  if (!context) {
    return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  }

  const { sessionId } = await params;
  const result = await completeInterviewSession({
    userId: context.user.id,
    sessionId,
    timezone: context.user.timezone,
  });

  if ("error" in result) {
    return authError("Sesi latihan tidak ditemukan.", 404, "NOT_FOUND");
  }

  return authOk(result);
}
