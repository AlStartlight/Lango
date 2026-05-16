import type { LanguageCode } from "./types";

const NUMBER_NAMES: Partial<Record<LanguageCode, Record<number, string>>> = {
  en: {
    0: "zero", 1: "one", 2: "two", 3: "three", 4: "four",
    5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten",
    11: "eleven", 12: "twelve", 13: "thirteen", 14: "fourteen", 15: "fifteen",
    16: "sixteen", 17: "seventeen", 18: "eighteen", 19: "nineteen", 20: "twenty",
    30: "thirty", 40: "forty", 50: "fifty", 60: "sixty", 70: "seventy",
    80: "eighty", 90: "ninety", 100: "one hundred", 200: "two hundred",
    300: "three hundred", 400: "four hundred", 500: "five hundred",
    600: "six hundred", 700: "seven hundred", 800: "eight hundred",
    900: "nine hundred", 1000: "one thousand", 2000: "two thousand",
    5000: "five thousand", 9999: "nine thousand nine hundred ninety-nine",
    1_000_000: "one million", 2_500_000: "two point five million",
    10_000_000: "ten million",
  },
  es: {
    0: "cero", 1: "uno", 2: "dos", 3: "tres", 4: "cuatro",
    5: "cinco", 6: "seis", 7: "siete", 8: "ocho", 9: "nueve", 10: "diez",
    11: "once", 12: "doce", 13: "trece", 14: "catorce", 15: "quince",
    16: "dieciséis", 17: "diecisiete", 18: "dieciocho", 19: "diecinueve", 20: "veinte",
    30: "treinta", 40: "cuarenta", 50: "cincuenta", 60: "sesenta", 70: "setenta",
    80: "ochenta", 90: "noventa", 100: "cien", 200: "doscientos",
    300: "trescientos", 400: "cuatrocientos", 500: "quinientos",
    600: "seiscientos", 700: "setecientos", 800: "ochocientos",
    900: "novecientos", 1000: "mil", 2000: "dos mil",
    5000: "cinco mil", 9999: "nueve mil novecientos noventa y nueve",
    1_000_000: "un millón", 2_500_000: "dos millones quinientos mil",
    10_000_000: "diez millones",
  },
  fr: {
    0: "zéro", 1: "un", 2: "deux", 3: "trois", 4: "quatre",
    5: "cinq", 6: "six", 7: "sept", 8: "huit", 9: "neuf", 10: "dix",
    11: "onze", 12: "douze", 13: "treize", 14: "quatorze", 15: "quinze",
    16: "seize", 17: "dix-sept", 18: "dix-huit", 19: "dix-neuf", 20: "vingt",
    30: "trente", 40: "quarante", 50: "cinquante", 60: "soixante", 70: "soixante-dix",
    80: "quatre-vingts", 90: "quatre-vingt-dix", 100: "cent",
    1000: "mille", 1_000_000: "un million",
  },
  de: {
    0: "null", 1: "eins", 2: "zwei", 3: "drei", 4: "vier",
    5: "fünf", 6: "sechs", 7: "sieben", 8: "acht", 9: "neun", 10: "zehn",
    11: "elf", 12: "zwölf", 13: "dreizehn", 14: "vierzehn", 15: "fünfzehn",
    16: "sechzehn", 17: "siebzehn", 18: "achtzehn", 19: "neunzehn", 20: "zwanzig",
    30: "dreißig", 40: "vierzig", 50: "fünfzig", 60: "sechzig", 70: "siebzig",
    80: "achtzig", 90: "neunzig", 100: "einhundert", 1000: "eintausend",
  },
  id: {
    0: "nol", 1: "satu", 2: "dua", 3: "tiga", 4: "empat",
    5: "lima", 6: "enam", 7: "tujuh", 8: "delapan", 9: "sembilan", 10: "sepuluh",
    11: "sebelas", 12: "dua belas", 13: "tiga belas", 14: "empat belas", 15: "lima belas",
    16: "enam belas", 17: "tujuh belas", 18: "delapan belas", 19: "sembilan belas", 20: "dua puluh",
    30: "tiga puluh", 40: "empat puluh", 50: "lima puluh", 60: "enam puluh",
    70: "tujuh puluh", 80: "delapan puluh", 90: "sembilan puluh", 100: "seratus",
    200: "dua ratus", 300: "tiga ratus", 400: "empat ratus", 500: "lima ratus",
    600: "enam ratus", 700: "tujuh ratus", 800: "delapan ratus", 900: "sembilan ratus",
    1000: "seribu", 2000: "dua ribu", 5000: "lima ribu",
    9999: "sembilan ribu sembilan ratus sembilan puluh sembilan",
    1_000_000: "satu juta", 10_000_000: "sepuluh juta",
  },
  ja: {
    0: "zero", 1: "ichi", 2: "ni", 3: "san", 4: "yon",
    5: "go", 6: "roku", 7: "nana", 8: "hachi", 9: "kyuu", 10: "juu",
    11: "juu ichi", 12: "juu ni", 13: "juu san", 14: "juu yon", 15: "juu go",
    16: "juu roku", 17: "juu nana", 18: "juu hachi", 19: "juu kyuu", 20: "ni juu",
    30: "san juu", 40: "yon juu", 50: "go juu", 60: "roku juu",
    70: "nana juu", 80: "hachi juu", 90: "kyuu juu", 100: "hyaku",
    1000: "sen", 1_000_000: "hyaku man",
  },
};

export function getNumberWord(num: number, lang: LanguageCode): string {
  return NUMBER_NAMES[lang]?.[num] ?? NUMBER_NAMES.en?.[num] ?? String(num);
}

export function getSupportedLanguages(): LanguageCode[] {
  return Object.keys(NUMBER_NAMES) as LanguageCode[];
}

export function getSpeechLang(lang: LanguageCode): string {
  const map: Record<LanguageCode, string> = {
    en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE",
    it: "it-IT", nl: "nl-NL", pt: "pt-PT",
    ar: "ar-SA", hi: "hi-IN", bn: "bn-BD",
    id: "id-ID", ja: "ja-JP", ko: "ko-KR", zh: "zh-CN",
    ru: "ru-RU", sv: "sv-SE", da: "da-DK", fi: "fi-FI",
    no: "nb-NO", pl: "pl-PL", tr: "tr-TR",
  };
  return map[lang] ?? "en-US";
}

export function generateOptions(correct: number, levelNumbers: number[], count: number = 4): number[] {
  const pool = levelNumbers.filter((n) => n !== correct);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const options = [correct, ...shuffled.slice(0, count - 1)];
  return options.sort(() => Math.random() - 0.5);
}
