import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { languages } from './i18n-config';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log('Middleware executing for pathname:', pathname);

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    console.log('Skipping middleware for excluded path');
    return NextResponse.next();
  }

  const pathnameIsMissingLocale = languages.every(
    (lang) => !pathname.startsWith(`/${lang}/`) && pathname !== `/${lang}`
  );

  if (pathnameIsMissingLocale) {
    const locale = 'en';
    return NextResponse.redirect(
      new URL(`/${locale}${pathname === '/' ? '/' : pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|admin).*)'],
};
