import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Compass, MapPin, Stamp, Trophy } from "lucide-react";
import { getSessionContext } from "@/lib/auth/session";
import {
  LANGUAGE_SUPPORT_LIST,
  isLanguageCode,
  isUiLocale,
  resolveContentLanguage,
} from "@/lib/i18n/locales";
import { getPassport } from "@/lib/story/repository";
import { StoryShell } from "@/components/story/story-shell";
import { expeditionCopy } from "@/components/expedition/copy";
import { storyCopy } from "@/components/story/story-copy";
import { StoryArtwork } from "@/components/expedition/art";
import { resolveSceneArt } from "@/components/expedition/story-images";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function PassportPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ language?: string }>;
}) {
  const { lang } = await params;
  const query = await searchParams;
  const context = await getSessionContext();
  if (!context) redirect(`/${lang}/sign-in`);
  const uiLocale = isUiLocale(lang) ? lang : "en";
  const copy = expeditionCopy(uiLocale);
  const story = storyCopy(uiLocale);
  const requested = query.language && isLanguageCode(query.language) ? query.language : null;
  const language = requested ?? resolveContentLanguage(context.user.targetLanguage, uiLocale);
  const passport = await getPassport(context.user.id, language);
  const earned = passport.stamps.filter((stamp) => stamp.earnedAt).length;

  return (
    <StoryShell lang={lang} active="passport">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 lg:py-8">
        <StoryArtwork
          variant="shrine"
          palette="#855300"
          image={resolveSceneArt({ seed: language, prefer: ["asakusa", "kyotoLanterns", "stationGolden", "shibuyaHachiko"] })}
          className="relative h-44 w-full rounded-2xl"
        >
          <div className="absolute inset-0 flex flex-col justify-between p-5">
            <span className="exp-pill w-fit bg-exp-secondary-container text-exp-on-secondary-container">
              <Stamp className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.passport}
            </span>
            <div>
              <h1 className="text-2xl font-extrabold text-exp-on-primary drop-shadow sm:text-3xl">
                {copy.passport} · {language.toUpperCase()}
              </h1>
              <p className="mt-1 text-xs font-semibold text-exp-container-high sm:text-sm">
                {copy.passport} · {earned}/{passport.stamps.length} · {story.culture}
              </p>
            </div>
          </div>
        </StoryArtwork>

        <div className="flex items-center gap-2 overflow-x-auto exp-scroll-hide">
          {LANGUAGE_SUPPORT_LIST.map((support) => (
            <Link
              key={support.code}
              href={`/${lang}/passport?language=${support.code}`}
              aria-current={support.code === language ? "page" : undefined}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                support.code === language
                  ? "bg-exp-primary text-exp-on-primary"
                  : "bg-exp-surface-lowest text-exp-on-surface-variant hover:bg-exp-container"
              }`}
            >
              {support.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-exp-surface-low p-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-exp-secondary-fixed text-exp-secondary">
              <Trophy className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-extrabold">{copy.badges}</p>
              <p className="text-[11px] font-semibold text-exp-on-surface-variant">
                {earned} / {passport.stamps.length}
              </p>
            </div>
          </div>
          <Link href={`/${lang}/learn`} className="exp-btn exp-btn-ghost text-xs">
            <Compass className="h-4 w-4" aria-hidden="true" />
            {copy.map}
          </Link>
        </div>

        {passport.stamps.length === 0 ? (
          <div className="exp-card flex flex-col items-center gap-2 p-10 text-center">
            <MapPin className="h-8 w-8 text-exp-secondary" aria-hidden="true" />
            <p className="text-sm font-extrabold">{copy.noQuestions}</p>
            <p className="text-xs text-exp-on-surface-variant">{story.language}: {language}</p>
            <Link href={`/${lang}/stories`} className="exp-btn exp-btn-primary mt-2">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              {copy.library}
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {passport.stamps.map((stamp) => {
              const isEarned = Boolean(stamp.earnedAt);
              const body =
                stamp.body[uiLocale as "id" | "en" | "ja"] ?? stamp.body.id ?? stamp.body.en ?? "";
              return (
                <article
                  key={stamp.id}
                  className={`flex flex-col gap-3 rounded-2xl p-4 shadow-sm ${
                    isEarned
                      ? "bg-exp-surface-lowest ring-2 ring-exp-primary-container"
                      : "bg-exp-surface-low opacity-80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-full ${
                        isEarned
                          ? "bg-exp-primary-container text-exp-on-primary-container"
                          : "bg-exp-container-highest text-exp-on-surface-variant"
                      }`}
                    >
                      {isEarned ? <Stamp className="h-5 w-5" aria-hidden="true" /> : <MapPin className="h-5 w-5" aria-hidden="true" />}
                    </span>
                    <span
                      className={`exp-pill ${
                        isEarned
                          ? "bg-exp-primary-fixed text-exp-on-primary-container"
                          : "bg-exp-container text-exp-on-surface-variant"
                      }`}
                    >
                      {isEarned ? copy.completed : copy.locked}
                    </span>
                  </div>
                  <h2 className="text-sm font-extrabold">{stamp.title}</h2>
                  <p className="line-clamp-4 text-[11px] font-medium leading-5 text-exp-on-surface-variant">
                    {body}
                  </p>
                  <p className="mt-auto line-clamp-2 text-[10px] leading-4 text-exp-outline">
                    {stamp.sources.join(" · ")}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </StoryShell>
  );
}
