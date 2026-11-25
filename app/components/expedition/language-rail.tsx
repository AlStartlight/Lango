import Link from "next/link";
import { LANGUAGE_SUPPORT_LIST } from "@/lib/i18n/locales";

/**
 * Content-language rail. The UI locale stays in the URL prefix while the
 * story content language is an explicit query parameter, matching the
 * "UI locale never changes target language" invariant.
 */
export function LanguageRail({
  languages,
  active,
  hrefFor,
  label,
}: {
  languages?: typeof LANGUAGE_SUPPORT_LIST;
  active: string;
  hrefFor: (code: string) => string;
  label?: string;
}) {
  const list = languages ?? LANGUAGE_SUPPORT_LIST;
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 exp-scroll-hide">
      {label ? (
        <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-wide text-exp-outline">
          {label}
        </span>
      ) : null}
      {list.map((support) => (
        <Link
          key={support.code}
          href={hrefFor(support.code)}
          prefetch={false}
          aria-current={support.code === active ? "page" : undefined}
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold transition-colors ${
            support.code === active
              ? "bg-exp-primary text-exp-on-primary"
              : "bg-exp-surface-lowest text-exp-on-surface-variant hover:bg-exp-container"
          }`}
        >
          {support.label}
        </Link>
      ))}
    </div>
  );
}
