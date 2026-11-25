import {
  getLocaleDefinition,
  toHtmlLang,
  toScript,
  toTextDirection,
  type UiLocale,
} from "./locales";

const SCRIPT_CLASSES = ["script-latn", "script-jpan", "script-hang", "script-deva", "script-arab"];

/**
 * Keep <html lang>/<dir> and the script font class in sync after a client-side
 * locale switch. Server-rendered pages already set these; client navigation
 * alone does not rerender the root layout.
 */
export function applyDocumentLocale(locale: UiLocale): void {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.lang = toHtmlLang(locale);
  html.dir = toTextDirection(locale);
  html.dataset.script = toScript(locale);

  const body = document.body;
  if (!body) return;
  for (const className of SCRIPT_CLASSES) body.classList.remove(className);
  body.classList.add(`script-${toScript(locale)}`);
  body.dataset.uiLocale = getLocaleDefinition(locale).htmlLang;
}
