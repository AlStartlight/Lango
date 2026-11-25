import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UI_LOCALES, preferredLocaleFromAcceptLanguage } from "./app/lib/i18n/locales";
import { canonicalizeLocaleSegment } from "./app/lib/i18n/paths";
import { LOCALE_COOKIE } from "./app/lib/i18n/locales";

const SESSION_COOKIE = "lango_session";



const PROTECTED_PREFIXES = [
  "/editor",
  "/learn",
  "/onboarding",
  "/progress",
  "/profile",
  "/review",
  "/admin",
];

/** App segments that only exist below a locale segment. */
const APP_SEGMENTS = new Set([
  ...PROTECTED_PREFIXES,
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
]);

function isStatic(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

function preferredLocale(request: NextRequest): {
  locale: string;
  source: "cookie" | "accept" | "default";
} {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && UI_LOCALES.includes(cookieLocale as (typeof UI_LOCALES)[number])) {
    return { locale: cookieLocale, source: "cookie" };
  }

  const accept = request.headers.get("accept-language");
  if (accept) {
    return {
      locale: preferredLocaleFromAcceptLanguage(accept),
      source: "accept",
    };
  }

  return { locale: "en", source: "default" };
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isStatic(pathname)) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0];

  // Root decides between marketing and app based on the session, but still
  // receives the best locale hint for <html lang>.
  if (pathname === "/") {
    const preferred = preferredLocale(request);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-lango-locale", preferred.locale);
    requestHeaders.set("x-lango-locale-source", preferred.source);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (maybeLocale) {
    const canonical = canonicalizeLocaleSegment(maybeLocale);

    if (canonical) {
      // /ja/... and /in/... are permanent aliases.
      if (canonical.alias) {
        const rest = segments.slice(1).join("/");
        const target = `/${canonical.locale}${rest ? `/${rest}` : ""}${search}`;
        return NextResponse.redirect(new URL(target, request.url), 308);
      }

      const locale = canonical.locale;
      const rest = `/${segments.slice(1).join("/")}`;
      const isProtected = PROTECTED_PREFIXES.some(
        (prefix) => rest === prefix || rest.startsWith(`${prefix}/`),
      );

      if (isProtected) {
        const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
        if (!hasSession) {
          const signIn = new URL(`/${locale}/sign-in`, request.url);
          signIn.searchParams.set("next", `${pathname}${search}`);
          return NextResponse.redirect(signIn);
        }
      }

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-lango-locale", locale);
      requestHeaders.set("x-lango-locale-source", "path");
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // A locale-shaped segment followed by an app segment is an unknown locale,
    // not a marketing path. Return a real 404 instead of silently redirecting.
    const looksLikeLocale = /^[a-z]{2}(-[a-zA-Z]{2,4})?$/.test(maybeLocale);
    const nextSegment = segments[1] ? `/${segments[1]}` : "";
    if (looksLikeLocale && APP_SEGMENTS.has(nextSegment)) {
      return NextResponse.rewrite(new URL("/_not-found", request.url), {
        status: 404,
      });
    }
  }

  // No locale segment: apply cookie → Accept-Language → en, then prefix once.
  const preferred = preferredLocale(request);
  const target = `/${preferred.locale}${pathname === "/" ? "" : pathname}${search}`;
  const redirect = NextResponse.redirect(new URL(target, request.url));

  // Remember the fallback source so the layout can reconcile account
  // preference after login if needed.
  redirect.headers.set("x-lango-locale", preferred.locale);
  return redirect;
}
