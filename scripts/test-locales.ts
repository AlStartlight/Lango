import assert from "node:assert/strict";
import {
  LANGUAGE_REGISTRY,
  LANGUAGE_SUPPORT_LIST,
  availabilityFromCounts,
  defaultLevelForLanguage,
  isCurriculumLevel,
  isLevelForLanguage,
  normalizeLanguageCode,
  preferredLocaleFromAcceptLanguage,
  toContentLanguage,
  toHtmlLang,
  toRouteLocale,
  toTextDirection,
} from "../app/lib/i18n/locales";
import {
  localizedHref,
  switchLocaleInPath,
} from "../app/lib/i18n/paths";

assert.equal(switchLocaleInPath("/jp/learn?tab=grammar#x", "id"), "/id/learn?tab=grammar#x");
assert.equal(switchLocaleInPath("/learn", "id"), "/id/learn");
assert.equal(switchLocaleInPath("/", "jp"), "/jp");
assert.equal(switchLocaleInPath("/jp/learn/", "id"), "/id/learn/");
assert.equal(switchLocaleInPath("/ja/learn?x=1", "id"), "/id/learn?x=1");

assert.equal(localizedHref("jp", "/learn"), "/jp/learn");
assert.equal(localizedHref("jp", "/jp/learn"), "/jp/learn");
assert.equal(localizedHref("jp", "/"), "/jp");

assert.equal(toContentLanguage("jp"), "ja");
assert.equal(toContentLanguage("id"), "id");
assert.equal(toHtmlLang("jp"), "ja");
assert.equal(toTextDirection("ar"), "rtl");
assert.equal(toTextDirection("jp"), "ltr");
assert.equal(toRouteLocale("ja"), "jp");
assert.equal(toRouteLocale("jp"), "jp");

assert.equal(normalizeLanguageCode("Spanish"), "es");
assert.equal(normalizeLanguageCode("Japanese"), "ja");
assert.equal(normalizeLanguageCode("Mandarin"), "zh");
assert.equal(normalizeLanguageCode("zh-CN"), "zh");
assert.equal(normalizeLanguageCode("jp"), "ja");
assert.equal(normalizeLanguageCode("in"), "id");
assert.equal(normalizeLanguageCode("unknown"), "en");

assert.equal(LANGUAGE_SUPPORT_LIST.length, 13);
assert.equal(new Set(LANGUAGE_SUPPORT_LIST.map((entry) => entry.code)).size, 13);
// zh is a content language first; its UI route reuses an existing locale.
assert.equal(new Set(LANGUAGE_SUPPORT_LIST.map((entry) => entry.routeLocale)).size, 12);
assert.equal(LANGUAGE_REGISTRY.ja.framework, "JLPT");
assert.equal(LANGUAGE_REGISTRY.en.framework, "CEFR");
assert.equal(LANGUAGE_REGISTRY.zh.framework, "HSK");
assert.deepEqual(LANGUAGE_REGISTRY.zh.levels, ["HSK1-2", "HSK3", "HSK4", "HSK5", "HSK6"]);
assert.equal(isCurriculumLevel("HSK1-2"), true);
assert.deepEqual(LANGUAGE_REGISTRY.ja.levels, ["N5", "N4", "N3", "N2", "N1"]);
assert.equal(defaultLevelForLanguage("ja"), "N5");
assert.equal(defaultLevelForLanguage("ko"), "A1");
assert.equal(isLevelForLanguage("ja", "N3"), true);
assert.equal(isLevelForLanguage("ja", "B1"), false);

assert.equal(preferredLocaleFromAcceptLanguage("ja-JP,en;q=0.8"), "jp");
assert.equal(preferredLocaleFromAcceptLanguage("in-ID,en;q=0.5"), "id");
assert.equal(preferredLocaleFromAcceptLanguage("pt-BR"), "pt");
assert.equal(preferredLocaleFromAcceptLanguage("xx-YY,es;q=0.7"), "es");

assert.equal(availabilityFromCounts(0, 0), "none");
assert.equal(availabilityFromCounts(175, 5), "preview");
assert.equal(availabilityFromCounts(2_100, 60), "beta");
assert.equal(availabilityFromCounts(10_500, 300), "full");

console.log("✓ locale/routing unit checks passed (13 content languages, 12 UI locales)");
