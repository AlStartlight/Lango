import "server-only";
import { cookies } from "next/headers";
import { isUiLocale, LOCALE_COOKIE, type UiLocale } from "./locales";

export { LOCALE_COOKIE };
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function parseLocaleCookie(value: string | null | undefined): UiLocale | null {
  if (!value) return null;
  return isUiLocale(value) ? value : null;
}

export async function readLocaleCookie(): Promise<UiLocale | null> {
  const store = await cookies();
  return parseLocaleCookie(store.get(LOCALE_COOKIE)?.value);
}

export async function writeLocaleCookie(locale: UiLocale): Promise<void> {
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
  });
}
