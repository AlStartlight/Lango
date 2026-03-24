export const languages = [
  'en',
  'es',
  'id',
  'jp',
  'hi',
  'de',
  'ar',
  'fr',
  'pt',
  'it',
  'nl',
  'ko',
] as const;

export type Language = (typeof languages)[number];
