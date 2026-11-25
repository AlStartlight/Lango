import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/session";
import { isUiLocale, resolveContentLanguage } from "@/lib/i18n/locales";
import { getVaultDeck } from "@/lib/story/vault";
import { LevelPills } from "@/components/expedition/level-pills";
import { LanguageRail } from "@/components/expedition/language-rail";
import { WordVault } from "@/components/story/word-vault";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function VaultPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tier?: string; language?: string }>;
}) {
  const { lang } = await params;
  const query = await searchParams;
  const context = await getSessionContext();
  if (!context) redirect(`/${lang}/sign-in`);
  const uiLocale = isUiLocale(lang) ? lang : "en";
  const language = resolveContentLanguage(
    query.language ?? context.user.targetLanguage,
    uiLocale,
  );
  const tier = query.tier && /^T[1-5]$/.test(query.tier) ? query.tier : null;
  const deck = await getVaultDeck(
    context.user.id,
    language,
    ["id", "en", "ja"].includes(context.user.explanationLocale)
      ? context.user.explanationLocale
      : uiLocale,
    { tier, levelCode: context.user.curriculumLevel, limit: 8 },
  );

  if (!deck) {
    return (
      <>
        <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6">
          <div className="exp-card p-10">
            <p className="text-lg font-extrabold">Brankas Kata</p>
            <p className="mt-2 text-sm text-exp-on-surface-variant">
              Cerita untuk bahasa ini belum tersedia.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-2 px-4 pt-4 sm:px-6 lg:px-8">
        <LanguageRail
          active={language}
          label="Bahasa"
          hrefFor={(code) =>
            `/${lang}/vault?language=${code}${tier ? `&tier=${tier}` : ""}`
          }
        />
        <LevelPills
          levels={deck.levels}
          activeTier={tier ?? deck.tier}
          label="Level"
          hrefFor={(value) =>
            `/${lang}/vault?tier=${value}&language=${language}`
          }
        />
      </div>
      <WordVault data={deck} lang={lang} locale={uiLocale} />
    </>
  );
}
