import { NextResponse } from "next/server";

const NO_STORE = {
  "Cache-Control": "no-store, max-age=0",
} as const;

export function authOk<T>(data: T, status = 200) {
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
    { status, headers: NO_STORE },
  );
}

export function authError(
  message: string,
  status = 400,
  code = "BAD_REQUEST",
) {
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
    { status, headers: NO_STORE },
  );
}

export function firstZodMessage(error: {
  issues: Array<{ message: string }>;
}): string {
  return error.issues[0]?.message ?? "Data tidak valid.";
}

export function publicOk<T>(data: T, cacheControl: string) {
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
      status: 200,
      headers: { "Cache-Control": cacheControl },
    },
  );
}
