import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiResponse, apiError, isMockMode } from '@/lib/api';
import { LoginRequestSchema, AuthDataSchema } from '@/lib/schemas';
import { mockLogin } from '@/lib/api/mock/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = LoginRequestSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message || 'Invalid request', 400);
  }

  const { email, password } = parsed.data;

  // ── Mock mode ────────────────────────────────────────────────────────────────
  if (isMockMode() || !prisma) {
    const result = mockLogin(email, password);
    if (!result) {
      return apiError('Invalid email or password', 401);
    }
    return apiResponse(result);
  }

  // ── Production (placeholder — prisma User model has no password field yet) ────
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return apiError('Invalid email or password', 401);
  }

  const response = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      nativeLanguage: user.nativeLanguage,
      learningLanguage: user.learningLanguage,
      dailyGoalMinutes: user.dailyGoalMinutes,
      streakDays: user.streakDays,
      createdAt: user.createdAt.toISOString(),
    },
    token: {
      accessToken: `prod-access-${crypto.randomUUID()}`,
      refreshToken: `prod-refresh-${crypto.randomUUID()}`,
      expiresIn: 3600,
    },
  };

  const validated = AuthDataSchema.parse(response);
  return apiResponse(validated);
}
