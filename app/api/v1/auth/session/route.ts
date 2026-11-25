import { authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const context = await getSessionContext();

  if (!context) {
    return authOk({ authenticated: false, user: null });
  }

  return authOk({
    authenticated: true,
    user: context.user,
    sessionExpiresAt: context.expiresAt.toISOString(),
  });
}
