import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest, NextFetchEvent } from "next/server"
import { languages } from "./app/i18n-config"

const signInUrl = process.env.CLERK_SIGN_IN_URL || "/sign-in"
const signUpUrl = process.env.CLERK_SIGN_UP_URL || "/sign-up"
const hasClerkKeys =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_placeholder" &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder") &&
  process.env.CLERK_SECRET_KEY &&
  !process.env.CLERK_SECRET_KEY.includes("placeholder")

const isPublicRoute = createRouteMatcher([
  "/",
  signInUrl,
  signUpUrl,
  "/:locale/sign-in",
  "/:locale/sign-up",
  "/api/health(.*)",
  "/api/__clerk(.*)",
  "/_next(.*)",
  "/favicon.ico",
])

const clerk = clerkMiddleware(async (auth, request: NextRequest) => {
  const pathname = request.nextUrl.pathname

  // i18n redirect — add locale prefix to bare paths
  if (
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/api") &&
    !pathname.includes(".") &&
    pathname !== "/favicon.ico"
  ) {
    const pathnameIsMissingLocale = languages.every(
      (lang) => !pathname.startsWith(`/${lang}/`) && pathname !== `/${lang}`
    )

    if (pathnameIsMissingLocale) {
      const locale = "en"
      return NextResponse.redirect(
        new URL(`/${locale}${pathname === "/" ? "" : pathname}`, request.url)
      )
    }
  }

  // Skip static files (manifest.json, icons, images, fonts, etc.) from Clerk auth
  if (pathname.includes(".")) {
    return NextResponse.next()
  }

  // Landing pages under /:locale are public
  const isPublicPath =
    isPublicRoute(request) ||
    languages.some(
      (lang) => pathname === `/${lang}` || pathname.startsWith(`/${lang}/`)
    )

  // Auth protection — only for non-public routes (e.g. /editor)
  if (hasClerkKeys && !isPublicPath) {
    await auth.protect()
  }

  return NextResponse.next()
})

export function proxy(request: NextRequest, event: NextFetchEvent) {
  return clerk(request, event)
}
