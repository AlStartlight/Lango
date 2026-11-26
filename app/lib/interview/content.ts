import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import {
  INTERVIEW_LANGUAGES,
  INTERVIEW_TRACK_IDS,
  type InterviewLanguage,
  type InterviewQuestion,
  type InterviewTrack,
  type InterviewTrackId,
} from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content", "interview");

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(path.join(CONTENT_DIR, file), "utf8")) as T;
}

export interface InterviewManifest {
  version: string;
  generatedAt: string;
  review: string;
  note: string;
  languages: Record<string, { count: number; status: string }>;
}

export const getInterviewManifest = cache((): InterviewManifest =>
  readJson<InterviewManifest>("manifest.json"),
);

export const getInterviewTracks = cache((): InterviewTrack[] =>
  readJson<InterviewTrack[]>("tracks.json"),
);

export function isInterviewLanguage(
  value: string | null | undefined,
): value is InterviewLanguage {
  return (
    typeof value === "string" &&
    (INTERVIEW_LANGUAGES as readonly string[]).includes(value)
  );
}

export const getInterviewQuestions = cache(
  (language: InterviewLanguage): InterviewQuestion[] => {
    const questions = readJson<InterviewQuestion[]>(
      `questions.${language}.json`,
    );
    return questions.filter((question) =>
      (INTERVIEW_TRACK_IDS as readonly string[]).includes(question.track),
    );
  },
);

export function getInterviewQuestion(
  language: InterviewLanguage,
  canonicalId: string,
): InterviewQuestion | null {
  return (
    getInterviewQuestions(language).find(
      (question) => question.canonicalId === canonicalId,
    ) ?? null
  );
}

export function getInterviewQuestionsForTrack(
  language: InterviewLanguage,
  track: InterviewTrackId,
): InterviewQuestion[] {
  return getInterviewQuestions(language).filter(
    (question) => question.track === track,
  );
}

export interface InterviewCatalog {
  language: InterviewLanguage;
  review: string;
  status: string;
  total: number;
  tracks: Array<InterviewTrack & { count: number }>;
}

export function getInterviewCatalog(
  language: InterviewLanguage,
): InterviewCatalog {
  const questions = getInterviewQuestions(language);
  const manifest = getInterviewManifest();
  return {
    language,
    review: manifest.review,
    status: manifest.languages[language]?.status ?? "preview",
    total: questions.length,
    tracks: getInterviewTracks().map((track) => ({
      ...track,
      count: questions.filter((question) => question.track === track.id).length,
    })),
  };
}

/** Available content languages, with counts, for the language rail. */
export function getInterviewLanguageAvailability() {
  const manifest = getInterviewManifest();
  return INTERVIEW_LANGUAGES.map((language) => ({
    code: language,
    count: getInterviewQuestions(language).length,
    status: manifest.languages[language]?.status ?? "preview",
  }));
}
