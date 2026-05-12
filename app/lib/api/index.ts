import { NextResponse } from 'next/server';

type ApiOptions = {
  revalidate?: number;
  tags?: string[];
};

/**
 * Determines whether to use mock data.
 * Selalu false — semua request pakai database real.
 */
export function isMockMode(): boolean {
  return false;
}

/**
 * Fetch data from mock JSON files. Used when no real database is configured.
 */
export async function fetchMockData<T>(endpoint: string): Promise<T> {
  const data = await import(`@/lib/api/mock/data/${endpoint}.json`);
  return data.default as T;
}

/**
 * Try a Prisma query, falling back to mock data if the database is unavailable.
 */
export async function withFallback<T>(
  mockEndpoint: string,
  prismaQuery: () => Promise<T>
): Promise<T> {
  if (isMockMode()) {
    return fetchMockData<T>(mockEndpoint);
  }
  try {
    return await prismaQuery();
  } catch {
    return fetchMockData<T>(mockEndpoint);
  }
}

/**
 * Standard JSON response wrapper
 */
export function apiResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      error: null,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    },
    {
      status,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    },
  );
}

/**
 * Error response wrapper
 */
export function apiError(message: string, status = 400, code = 'BAD_REQUEST') {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: { code, message },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    },
    { status },
  );
}

/**
 * Generate cache options for fetch
 */
export function cacheOptions(options?: ApiOptions): RequestInit & { next?: Record<string, unknown> } {
  return {
    next: {
      revalidate: options?.revalidate ?? 60,
      tags: options?.tags,
    },
  };
}
