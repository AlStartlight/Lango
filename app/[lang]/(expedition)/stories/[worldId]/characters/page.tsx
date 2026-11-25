import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, Sparkles, Users } from "lucide-react";
import { getSessionContext } from "@/lib/auth/session";
import { isUiLocale } from "@/lib/i18n/locales";
import { getCharacters, getWorldDetail } from "@/lib/story/repository";
import { expeditionCopy } from "@/components/expedition/copy";
import { StoryArtwork } from "@/components/expedition/art";
import { resolveCharacterArt } from "@/components/expedition/story-images";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function CharactersPage({
  params,
}: {
  params: Promise<{ lang: string; worldId: string }>;
}) {
  const { lang, worldId } = await params;
  const context = await getSessionContext();
  if (!context) redirect(`/${lang}/sign-in`);
  const uiLocale = isUiLocale(lang) ? lang : "en";
  const copy = expeditionCopy(uiLocale);
  const [world, characters] = await Promise.all([
    getWorldDetail(context.user.id, worldId),
    getCharacters(context.user.id, worldId),
  ]);
  if (!world) notFound();

  return (
    <>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 lg:py-8">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-wide text-exp-outline">
          <Link href={`/${lang}/stories`} className="hover:text-exp-primary">
            {copy.library}
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <Link href={`/${lang}/stories/${worldId}`} className="hover:text-exp-primary">
            {world.world.title}
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span>{copy.studyBuddies}</span>
        </div>

        <StoryArtwork
          variant="shrine"
          palette={world.world.palette}
          setting={world.world.setting}
          worldId={world.world.id}
          className="relative h-40 w-full rounded-2xl shadow-md"
        >
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-exp-inverse-surface/85 via-exp-inverse-surface/20 to-transparent p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-exp-secondary-fixed">
              {copy.studyBuddies}
            </p>
            <p className="text-xl font-extrabold text-exp-on-primary drop-shadow">
              {world.world.nativeTitle}
            </p>
          </div>
        </StoryArtwork>

        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold sm:text-3xl">
            <Users className="h-6 w-6 text-exp-primary" aria-hidden="true" />
            {copy.studyBuddies}
          </h1>
          <p className="mt-1 text-sm font-medium text-exp-on-surface-variant">
            {world.world.nativeTitle} · {world.world.title}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {characters.characters.map((character) => {
            const portrait = resolveCharacterArt(character.name) ?? resolveCharacterArt(character.nativeName);
            return (
            <article key={character.id} className="exp-card flex flex-col gap-3 p-5">
              <div className="flex items-center gap-3">
                <span className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-exp-primary-fixed text-lg font-extrabold text-exp-on-primary-container">
                  {portrait ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={portrait.src} alt="" className="h-full w-full object-cover" style={{ objectPosition: portrait.position }} />
                  ) : (
                    character.nativeName.slice(0, 1)
                  )}
                </span>
                <div>
                  <h2 className="text-[16px] font-extrabold">{character.nativeName}</h2>
                  <p className="text-[11px] font-semibold text-exp-on-surface-variant">
                    {character.role}
                  </p>
                </div>
              </div>
              <p className="text-xs font-medium leading-5 text-exp-on-surface-variant">{character.bio}</p>
              {character.quote && (
                <p className="rounded-xl bg-exp-surface-low p-3 text-xs italic leading-5 text-exp-on-surface-variant">
                  “{character.quote}”
                </p>
              )}
              <div className="mt-auto flex items-center justify-between text-[10px] font-bold text-exp-outline">
                <span>{character.speechStyle}</span>
                <span className="flex items-center gap-1 rounded-full bg-exp-secondary-fixed px-2 py-0.5 text-exp-secondary">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  {character.affinity}
                </span>
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
