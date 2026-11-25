import "server-only";
import { prisma } from "@/lib/prisma";
import { hashValue } from "./tokens";

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function getUserAgent(request: Request): string {
  return request.headers.get("user-agent") || "unknown";
}

export async function logAuthEvent(input: {
  userId?: string | null;
  event: string;
  request: Request;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  if (!prisma) return;

  try {
    await prisma.authEvent.create({
      data: {
        userId: input.userId ?? null,
        event: input.event,
        ipHash: hashValue(getClientIp(input.request)),
        userAgentHash: hashValue(getUserAgent(input.request)),
        metadata: input.metadata as never,
      },
    });
  } catch (error) {
    // Auth must not fail because audit logging failed.
    console.error("[auth] failed to write audit event", {
      event: input.event,
      error: error instanceof Error ? error.message : "unknown",
    });
  }
}
