import { NextRequest } from "next/server";
import { authOk } from "@/lib/api/auth-response";
import { revokeCurrentSession } from "@/lib/auth/session";
import { logAuthEvent } from "@/lib/auth/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  await revokeCurrentSession();
  await logAuthEvent({ event: "logout", request });
  return authOk({ loggedOut: true });
}
