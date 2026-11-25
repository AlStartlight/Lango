import "server-only";
import { prisma } from "@/lib/prisma";
import {
  addDays,
  addMinutes,
  generateToken,
  hashToken,
  hashValue,
} from "./tokens";
import {
  appUrl,
  passwordResetEmail,
  sendEmail,
  verificationEmail,
} from "./email";

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  nativeLanguage: string;
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

export function toPublicUser(user: {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  nativeLanguage: string;
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
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role,
    nativeLanguage: user.nativeLanguage,
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

export async function issueEmailVerification(user: {
  id: string;
  name: string;
  email: string;
}): Promise<{ devUrl: string; delivered: boolean }> {
  if (!prisma) throw new Error("Database is not configured");

  const now = new Date();
  await prisma.emailVerificationToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: now },
  });

  const rawToken = generateToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: addDays(now, 1),
    },
  });

  const url = appUrl(
    `/en/verify-email?token=${encodeURIComponent(rawToken)}`,
  );
  const template = verificationEmail(user.name, url);
  const result = await sendEmail({
    to: user.email,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });

  return { devUrl: url, delivered: result.delivered };
}

export async function issuePasswordReset(user: {
  id: string;
  name: string;
  email: string;
}, request: Request): Promise<{ delivered: boolean }> {
  if (!prisma) throw new Error("Database is not configured");

  const now = new Date();
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: now },
  });

  const rawToken = generateToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: addMinutes(now, 30),
      requestedIpHash: hashValue(
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          "unknown",
      ),
    },
  });

  const url = appUrl(
    `/en/reset-password?token=${encodeURIComponent(rawToken)}`,
  );
  const template = passwordResetEmail(user.name, url);
  const result = await sendEmail({
    to: user.email,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });

  return { delivered: result.delivered };
}
