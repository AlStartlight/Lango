import {
  isUiLocale,
  type UiLocale,
  UI_LOCALES,
} from "./locales";

/** Alias rute yang dikirim sebagai redirect permanen (308). */
export const LOCALE_ALIASES: Record<string, UiLocale> = {
  ja: "jp",
  in: "id",
  "en-us": "en",
  "pt-br": "pt",
};

export function canonicalizeLocaleSegment(
  segment: string,
): { locale: UiLocale; alias: boolean } | null {
  const lowered = segment.toLowerCase();
  if (isUiLocale(lowered)) {
    return { locale: lowered, alias: false };
  }
  const aliased = LOCALE_ALIASES[lowered];
  return aliased ? { locale: aliased, alias: true } : null;
}

export function isLocaleAlias(segment: string): boolean {
  return !isUiLocale(segment) && Boolean(LOCALE_ALIASES[segment.toLowerCase()]);
}

interface PathParts {
  pathname: string;
  query: string;
  hash: string;
}

export function splitPath(input: string): PathParts {
  const hashIndex = input.indexOf("#");
  const hash = hashIndex >= 0 ? input.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? input.slice(0, hashIndex) : input;
  const queryIndex = withoutHash.indexOf("?");
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : "";
  const pathname =
    queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  return { pathname: pathname || "/", query, hash };
}

/**
 * Ganti hanya segmen locale pertama. Query dan hash dipertahankan persis.
 * Path tanpa locale akan diberi prefix locale baru.
 */
export function switchLocaleInPath(input: string, next: UiLocale): string {
  const { pathname, query, hash } = splitPath(input);
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return `/${next}${query}${hash}`;
  }

  const first = canonicalizeLocaleSegment(segments[0]);
  if (first) {
    segments[0] = next;
  } else {
    segments.unshift(next);
  }

  const trailingSlash =
    pathname.endsWith("/") && segments.length > 0 ? "/" : "";
  return `/${segments.join("/")}${trailingSlash}${query}${hash}`;
}

/** Bangun href internal yang selalu ber-locale tanpa double prefix. */
export function localizedHref(locale: UiLocale, path: string): string {
  const { pathname, query, hash } = splitPath(path);
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && canonicalizeLocaleSegment(segments[0])) {
    return `${pathname}${query}${hash}`;
  }
  const suffix = pathname === "/" ? "" : pathname;
  return `/${locale}${suffix}${query}${hash}`;
}

export function stripLocaleFromPath(input: string): string {
  const { pathname, query, hash } = splitPath(input);
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && canonicalizeLocaleSegment(segments[0])) {
    segments.shift();
  }
  const rest = segments.length > 0 ? `/${segments.join("/")}` : "/";
  return `${rest}${query}${hash}`;
}

export function isValidLocaleSegment(segment: string): boolean {
  return isUiLocale(segment);
}

export const SUPPORTED_LOCALES = UI_LOCALES;
