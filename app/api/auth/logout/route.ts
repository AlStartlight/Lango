import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api';

export async function POST(_request: NextRequest) {
  return apiResponse({ message: 'Logged out successfully' });
}
