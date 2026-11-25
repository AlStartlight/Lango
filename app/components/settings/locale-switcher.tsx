"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import {
  LANGUAGE_REGISTRY,
  UI_LOCALES,
  type UiLocale,
  toContentLanguage,
} from "@/lib/i18n/locales";
import { switchLocaleInPath } from "@/lib/i18n/paths";
import { applyDocumentLocale } from "@/lib/i18n/dom";

interface LocaleSwitcherProps {
  currentLocale: string;
  /** Pass true from authenticated shells to persist to User.uiLocale. */
  isAuthenticated?: boolean;
  /** Show the current learning language hint inside the menu. */
  contentLanguage?: string | null;
  className?: string;
  onLocaleChanged?: (next: UiLocale) => void;
}

interface LocaleApiResponse {
  success?: boolean;
  data?: { user?: { uiLocale?: string } };
  error?: { code?: string; message?: string };
}

function isUiLocaleValue(value: string): value is UiLocale {
  return (UI_LOCALES as readonly string[]).includes(value);
}

export function LocaleSwitcher({
  currentLocale,
  isAuthenticated,
  contentLanguage,
  className = "",
  onLocaleChanged,
}: LocaleSwitcherProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState<UiLocale | null>(null);
  const [error, setError] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const activeLocale = isUiLocaleValue(currentLocale) ? currentLocale : "en";
  const active = LANGUAGE_REGISTRY[toContentLanguage(activeLocale)];
  const learning = contentLanguage
    ? LANGUAGE_REGISTRY[
        isUiLocaleValue(contentLanguage)
          ? toContentLanguage(contentLanguage)
          : (contentLanguage as keyof typeof LANGUAGE_REGISTRY)
      ]
    : null;

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  async function changeLocale(next: UiLocale) {
    if (next === activeLocale || saving) return;
    setError("");
    setSaving(next);

    const query = searchParams.toString();
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const currentPath = `${pathname}${query ? `?${query}` : ""}${hash}`;
    const nextPath = switchLocaleInPath(currentPath, next);

    try {
      let persisted = false;
      if (isAuthenticated !== false) {
        const response = await fetch("/api/v1/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uiLocale: next }),
        });
        if (response.ok) {
          persisted = true;
        } else if (response.status === 401 && isAuthenticated === undefined) {
          // Anonymous marketing visitor: fall through to the cookie endpoint.
          persisted = false;
        } else {
          const body = (await response.json().catch(() => null)) as LocaleApiResponse | null;
          setError(body?.error?.message ?? t("settings.saveError"));
          return;
        }
      }

      if (!persisted) {
        const response = await fetch("/api/v1/locale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uiLocale: next }),
        });
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as LocaleApiResponse | null;
          setError(body?.error?.message ?? t("settings.saveError"));
          return;
        }
      }

      await i18n.changeLanguage(next);
      applyDocumentLocale(next);
      setOpen(false);
      onLocaleChanged?.(next);
      router.replace(nextPath, { scroll: false });
    } catch {
      setError(t("settings.saveError"));
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 items-center gap-2 rounded-xl border border-border-default bg-surface px-3 text-sm text-primary transition-colors hover:bg-elevated"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("settings.uiLocale")}
        aria-busy={Boolean(saving)}
      >
        <Image
          src={active.flag}
          alt=""
          width={20}
          height={14}
          className="h-3.5 w-5 rounded-sm object-cover"
        />
        <span className="hidden sm:inline">{active.label}</span>
        <span className="sm:hidden">{active.code.toUpperCase()}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t("settings.uiLocale")}
          className="absolute right-0 top-12 z-[70] w-72 overflow-hidden rounded-2xl border border-border-default bg-surface p-1.5 shadow-xl"
        >
          <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted">
            {t("settings.uiLocale")}
          </p>
          <div className="max-h-80 overflow-y-auto">
            {UI_LOCALES.map((locale) => {
              const entry = LANGUAGE_REGISTRY[toContentLanguage(locale)];
              const selected = locale === activeLocale;
              return (
                <button
                  key={locale}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => changeLocale(locale)}
                  disabled={Boolean(saving)}
                  className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selected
                      ? "bg-accent-primary-dim text-accent-primary"
                      : "text-secondary-text hover:bg-elevated"
                  }`}
                >
                  <Image
                    src={entry.flag}
                    alt=""
                    width={20}
                    height={14}
                    className="h-3.5 w-5 rounded-sm object-cover"
                  />
                  <span lang={entry.htmlLang} className="flex-1">
                    {entry.label}
                  </span>
                  {saving === locale ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : selected ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : null}
                </button>
              );
            })}
          </div>

          {learning && learning.code !== toContentLanguage(activeLocale) && (
            <p className="border-t border-border-default px-3 py-2 text-xs text-muted">
              {t("learning.shell.targetMismatch", {
                interface: active.label,
                learning: learning.label,
              })}
            </p>
          )}

          {error && (
            <p role="alert" className="px-3 py-2 text-xs text-state-error">
              {error}
            </p>
          )}
          <p className="border-t border-border-default px-3 py-2 text-xs text-muted">
            {t("settings.preferenceNote")}
          </p>
        </div>
      )}
    </div>
  );
}
