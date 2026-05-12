import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiResponse, apiError, isMockMode } from '@/lib/api';
import { LoginRequestSchema, AuthDataSchema } from '@/lib/schemas';
import { mockLogin } from '@/lib/api/mock/auth';
import { verifyPassword, generateTokenPair } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = LoginRequestSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message || 'Invalid request', 400);
  }

  const { email, password } = parsed.data;

  // Fallback ke mock saat dev / DB tidak tersedia
  if (isMockMode()) {
    const result = mockLogin(email, password);
    if (!result) {
      return apiError('Invalid email or password', 401);
    }
    return apiResponse(result);
  }

  // ── Production ───────────────────────────────────────────────────────────────
  if (!prisma) {
    return apiError('Database not configured', 503);
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return apiError('Not registered email or username', 401);
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return apiError('Invalid email or password', 401);
  }

  const payload = { sub: user.id, email: user.email };

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
    token: generateTokenPair(payload),
  };

  const validated = AuthDataSchema.parse(response);
  return apiResponse(validated);
}
