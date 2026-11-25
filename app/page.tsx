import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSessionUser } from "./lib/auth/session";
import {
  isUiLocale,
  preferredLocaleFromAcceptLanguage,
  toRouteLocale,
} from "./lib/i18n/locales";

export default async function RootPage() {
  const headersList = await headers();
  const headerLocale = headersList.get("x-lango-locale");

  let user = null;
  try {
    user = await getSessionUser();
  } catch {
    // If the database is temporarily unavailable, fall back to marketing.
  }

  if (user && isUiLocale(user.uiLocale)) {
    redirect(`/${toRouteLocale(user.uiLocale)}/learn`);
  }

  if (headerLocale && isUiLocale(headerLocale)) {
    redirect(`/${headerLocale}`);
  }

  const locale = preferredLocaleFromAcceptLanguage(
    headersList.get("accept-language"),
  );
  redirect(`/${locale}`);
}
