import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const DEV_PEPPER = "lango-dev-token-pepper-change-me";

function getPepper(): string {
  const pepper = process.env.AUTH_TOKEN_PEPPER;
  if (pepper && pepper.length >= 16) return pepper;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_TOKEN_PEPPER must be set to at least 16 characters in production.",
    );
  }

  return DEV_PEPPER;
}

/** Raw token sent to the client (cookie or email link). Never stored in DB. */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Stable, one-way representation persisted in the database. */
export function hashToken(rawToken: string): string {
  return createHash("sha256")
    .update(`${rawToken}.${getPepper()}`)
    .digest("hex");
}

export function hashValue(value: string): string {
  return createHash("sha256")
    .update(`${value}.${getPepper()}`)
    .digest("hex");
}

export function safeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}
