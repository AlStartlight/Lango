import { NextRequest } from 'next/server';
import { apiResponse, apiError } from '@/lib/api';
import { RefreshRequestSchema } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = RefreshRequestSchema.safeParse(body);

  if (!parsed.success) {
    return apiError('Refresh token is required', 400);
  }

  const { refreshToken } = parsed.data;

  // ── Mock mode ────────────────────────────────────────────────────────────────
  if (!refreshToken.startsWith('mock-refresh-') && !refreshToken.startsWith('prod-refresh-')) {
    return apiError('Invalid refresh token', 401);
  }

  return apiResponse({
    accessToken: `mock-access-${crypto.randomUUID()}`,
    expiresIn: 3600,
  });
}
