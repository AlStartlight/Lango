import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";

export { hashPassword, verifyPassword } from "@/lib/auth/password";

/**
 * Compatibility helper for older route handlers. New code should use
 * `getSessionUser` / `getSessionContext` from `@/lib/auth/session`.
 */
export async function getAuthUser(request: NextRequest) {
  void request;
  const sessionUser = await getSessionUser();
  if (!sessionUser || !prisma) return null;
  return prisma.user.findUnique({ where: { id: sessionUser.id } });
}

export type TokenPayload = {
  sub: string;
  email: string;
};
