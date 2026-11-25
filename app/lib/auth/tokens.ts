import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const DEV_PEPPER = "lango-dev-token-pepper-change-me";
const MIN_PEPPER_LENGTH = 16;
const FALLBACK_PEPPER_LABEL = "lango-auth-token-pepper:v1";

let warnedAboutFallback = false;

function configuredPepper(): string | null {
  const pepper = process.env.AUTH_TOKEN_PEPPER?.trim();
  return pepper && pepper.length >= MIN_PEPPER_LENGTH ? pepper : null;
}

/**
 * A deployment can be rolled out before `AUTH_TOKEN_PEPPER` is added to the
 * host. Treating that as a hard request-time error used to take sign-in and
 * registration down with an opaque 500. Instead, derive a stable, per-database
 * pepper from `DATABASE_URL` (itself a secret) and keep auth available.
 *
 * The env var still wins whenever it is present; rotate it deliberately to
 * invalidate every outstanding session and email token.
 */
function fallbackPepper(): string | null {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) return null;

  return createHmac("sha256", databaseUrl)
    .update(FALLBACK_PEPPER_LABEL)
    .digest("hex");
}

function getPepper(): string {
  const pepper = configuredPepper();
  if (pepper) return pepper;

  const fallback = fallbackPepper();
  if (fallback) {
    if (process.env.NODE_ENV === "production" && !warnedAboutFallback) {
      warnedAboutFallback = true;
      console.warn(
        "[auth] AUTH_TOKEN_PEPPER is missing or shorter than " +
          `${MIN_PEPPER_LENGTH} characters. Deriving a stable pepper from ` +
          "DATABASE_URL instead. Set AUTH_TOKEN_PEPPER (openssl rand -hex 32) " +
          "to keep sessions valid if the database URL changes.",
      );
    }
    return fallback;
  }

  if (process.env.NODE_ENV === "production") {
    console.error(
      "[auth] Neither AUTH_TOKEN_PEPPER nor DATABASE_URL is configured; " +
        "session and email tokens cannot be hashed.",
    );
    throw new Error(
      "AUTH_TOKEN_PEPPER or DATABASE_URL must be configured in production.",
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
