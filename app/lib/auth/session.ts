import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { addDays, generateToken, hashToken } from "./tokens";

export const SESSION_COOKIE = "lango_session";

const DEFAULT_SESSION_DAYS = 7;
const REMEMBER_SESSION_DAYS = 30;
const ABSOLUTE_SESSION_DAYS = 90;
const LAST_USED_UPDATE_MS = 60 * 60 * 1000;

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  nativeLanguage: string;
  learningLanguage: string;
  targetLanguage: string;
  uiLocale: string;
  curriculumLevel: string | null;
  explanationLocale: string;
  activeLanguageCode: string | null;
  cefrLevel: string;
  dailyGoalMinutes: number;
  timezone: string;
  emailVerifiedAt: string | null;
  onboardingCompletedAt: string | null;
  xpPoints: number;
  streakDays: number;
  level: number;
  levelLabel: string;
  isPro: boolean;
}

export interface SessionContext {
  user: SessionUser;
  sessionId: string;
  rememberMe: boolean;
  expiresAt: Date;
}

function toSessionUser(user: {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  nativeLanguage: string;
  learningLanguage: string;
  targetLanguage: string;
  uiLocale: string;
  curriculumLevel: string | null;
  explanationLocale: string;
  activeLanguageCode: string | null;
  cefrLevel: string;
  dailyGoalMinutes: number;
  timezone: string;
  emailVerifiedAt: Date | null;
  onboardingCompletedAt: Date | null;
  xpPoints: number;
  streakDays: number;
  level: number;
  levelLabel: string;
  isPro: boolean;
}): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role,
    nativeLanguage: user.nativeLanguage,
    learningLanguage: user.learningLanguage,
    targetLanguage: user.targetLanguage,
    uiLocale: user.uiLocale,
    curriculumLevel: user.curriculumLevel,
    explanationLocale: user.explanationLocale,
    activeLanguageCode: user.activeLanguageCode,
    cefrLevel: user.cefrLevel,
    dailyGoalMinutes: user.dailyGoalMinutes,
    timezone: user.timezone,
    emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
    onboardingCompletedAt: user.onboardingCompletedAt?.toISOString() ?? null,
    xpPoints: user.xpPoints,
    streakDays: user.streakDays,
    level: user.level,
    levelLabel: user.levelLabel,
    isPro: user.isPro,
  };
}

async function writeSessionCookie(rawToken: string, expiresAt: Date) {
  const store = await cookies();
  store.set(SESSION_COOKIE, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function createSession(
  userId: string,
  rememberMe = false,
): Promise<{ token: string; expiresAt: Date }> {
  if (!prisma) throw new Error("Database is not configured");

  const token = generateToken();
  const expiresAt = addDays(
    new Date(),
    rememberMe ? REMEMBER_SESSION_DAYS : DEFAULT_SESSION_DAYS,
  );

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      rememberMe,
      expiresAt,
    },
  });

  await writeSessionCookie(token, expiresAt);
  return { token, expiresAt };
}

export async function getSessionContext(): Promise<SessionContext | null> {
  if (!prisma) return null;

  const store = await cookies();
  const rawToken = store.get(SESSION_COOKIE)?.value;
  if (!rawToken) return null;

  const now = new Date();
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt <= now) {
    return null;
  }

  const absoluteExpiry = addDays(session.createdAt, ABSOLUTE_SESSION_DAYS);
  if (absoluteExpiry <= now) {
    await prisma.session
      .update({ where: { id: session.id }, data: { revokedAt: now } })
      .catch(() => undefined);
    return null;
  }

  // Sliding expiry, written at most once per hour to avoid a write per request.
  if (now.getTime() - session.lastUsedAt.getTime() > LAST_USED_UPDATE_MS) {
    const slidingDays = session.rememberMe
      ? REMEMBER_SESSION_DAYS
      : DEFAULT_SESSION_DAYS;
    const nextExpiry = new Date(
      Math.min(addDays(now, slidingDays).getTime(), absoluteExpiry.getTime()),
    );

    await prisma.session
      .update({
        where: { id: session.id },
        data: { lastUsedAt: now, expiresAt: nextExpiry },
      })
      .catch(() => undefined);
  }

  return {
    user: toSessionUser(session.user),
    sessionId: session.id,
    rememberMe: session.rememberMe,
    expiresAt: session.expiresAt,
  };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const context = await getSessionContext();
  return context?.user ?? null;
}

export async function revokeCurrentSession(): Promise<void> {
  if (!prisma) return;

  const store = await cookies();
  const rawToken = store.get(SESSION_COOKIE)?.value;

  if (rawToken) {
    await prisma.session
      .updateMany({
        where: { tokenHash: hashToken(rawToken), revokedAt: null },
        data: { revokedAt: new Date() },
      })
      .catch(() => undefined);
  }

  store.delete(SESSION_COOKIE);
}

export async function revokeAllSessions(
  userId: string,
  exceptSessionId?: string,
): Promise<void> {
  if (!prisma) return;

  await prisma.session.updateMany({
    where: {
      userId,
      revokedAt: null,
      ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
    },
    data: { revokedAt: new Date() },
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
