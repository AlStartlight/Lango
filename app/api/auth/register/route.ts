import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiResponse, apiError } from '@/lib/api';
import { RegisterRequestSchema, AuthDataSchema } from '@/lib/schemas';
import { mockRegister } from '@/lib/api/mock/auth';
import { hashPassword, generateTokenPair } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = RegisterRequestSchema.safeParse(body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return apiError(firstError?.message || 'Invalid request', 400);
  }

  const { name, email, password } = parsed.data;

  // Fallback ke mock hanya jika prisma tidak tersedia
  if (!prisma) {
    const result = mockRegister(name, email, password);
    if ('error' in result && result.error) {
      return apiError(result.error, 409);
    }
    return apiResponse(result, 201);
  }

  // ── Production ───────────────────────────────────────────────────────────────
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return apiError('Email already in use', 409);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: passwordHash,
      nativeLanguage: 'English',
      learningLanguage: 'Spanish',
    },
  });

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
  return apiResponse(validated, 201);
}
