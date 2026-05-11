import { NextRequest } from 'next/server';
import { apiResponse, apiError } from '@/lib/api';
import { RefreshRequestSchema, RefreshDataSchema } from '@/lib/schemas';
import { verifyRefreshToken, signAccessToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = RefreshRequestSchema.safeParse(body);

  if (!parsed.success) {
    return apiError('Refresh token is required', 400);
  }

  const { refreshToken } = parsed.data;

  try {
    const payload = verifyRefreshToken(refreshToken);

    const newAccessToken = signAccessToken({
      sub: payload.sub,
      email: payload.email,
    });

    const response = {
      accessToken: newAccessToken,
      expiresIn: 3600,
    };

    const validated = RefreshDataSchema.parse(response);
    return apiResponse(validated);
  } catch {
    return apiError('Invalid or expired refresh token', 401);
  }
}
