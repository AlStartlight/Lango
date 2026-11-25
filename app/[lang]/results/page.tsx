import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Compass,
  Flame,
  Star,
  Target,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";
import { getSessionContext } from "@/lib/auth/session";
import { isUiLocale, resolveContentLanguage } from "@/lib/i18n/locales";
import { getResultsOverview } from "@/lib/story/report";
import { StoryShell } from "@/components/story/story-shell";
import { StoryArtwork } from "@/components/expedition/art";
import { LevelPills } from "@/components/expedition/level-pills";
import { LanguageRail } from "@/components/expedition/language-rail";
import { expeditionCopy } from "@/components/expedition/copy";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

const COPY = {
  en: {
    title: "Results & Evaluation",
    subtitle: "Every chapter you finish is scored, recapped, and linked to the words you collected.",
    episodes: "Chapter reports",
    noResults: "No chapter reports yet",
    noResultsBody: "Finish one story scene to open your first star evaluation.",
    startReading: "Start a chapter",
    episodesDone: "Chapters complete",
    scenes: "Scenes read",
    accuracy: "Overall accuracy",
    xp: "XP from stories",
    minutes: "Minutes explored",
    stars: "Stars earned",
    open: "Open evaluation",
    continue: "Continue chapter",
    watch: "Words in vault",
    level: "Level",
    allLevels: "All levels",
    vault: "Open Word Vault",
    starsFooter: (earned: number, total: number) =>
      `${earned} / ${total} stars collected · keep the trail going to complete every level.`,
  },
  id: {
    title: "Hasil & Evaluasi",
    subtitle: "Setiap babak yang selesai dinilai, direkap, dan terhubung ke kata-kata yang kamu kumpulkan.",
    episodes: "Laporan babak",
    noResults: "Belum ada laporan babak",
    noResultsBody: "Selesaikan satu scene cerita untuk membuka evaluasi bintang pertamamu.",
    startReading: "Mulai babak",
    episodesDone: "Babak tuntas",
    scenes: "Scene dibaca",
    accuracy: "Akurasi keseluruhan",
    xp: "XP dari cerita",
    minutes: "Menit eksplorasi",
    stars: "Bintang didapat",
    open: "Buka evaluasi",
    continue: "Lanjutkan babak",
    watch: "Kata di brankas",
    level: "Level",
    allLevels: "Semua level",
    vault: "Buka Brankas Kata",
    starsFooter: (earned: number, total: number) =>
      `${earned} / ${total} bintang terkumpul · lanjutkan trail untuk menutup seluruh evaluasi level.`,
  },
  ja: {
    title: "結果 & 評価",
    subtitle: "終えた章は採点され、復習カードと集めた単語につながります。",
    episodes: "章レポート",
    noResults: "章レポートはまだありません",
    noResultsBody: "物語のシーンを1つ完了すると、最初の星評価が開きます。",
    startReading: "章を始める",
    episodesDone: "完了した章",
    scenes: "読んだシーン",
    accuracy: "総合正答率",
    xp: "物語の XP",
    minutes: "探索時間",
    stars: "獲得した星",
    open: "評価を開く",
    continue: "章を続ける",
    watch: "金庫の単語",
    level: "レベル",
    allLevels: "すべて",
    vault: "単語金庫を開く",
    starsFooter: (earned: number, total: number) =>
      `${earned} / ${total} 星を獲得 · すべてのレベル評価を完了しましょう。`,
  },
} as const;

function copyFor(locale: string) {
  if (locale === "id") return COPY.id;
  if (locale === "ja" || locale === "jp") return COPY.ja;
  return COPY.en;
}

export default async function ResultsPage({
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
  const copy = copyFor(uiLocale);
  const expedition = expeditionCopy(uiLocale);
  const language = resolveContentLanguage(
    query.language ?? context.user.targetLanguage,
    uiLocale,
  );
  const overview = await getResultsOverview(context.user.id, language);

  const tier = query.tier && /^T[1-5]$/.test(query.tier) ? query.tier : null;
  const episodes = overview
    ? overview.episodes.filter((episode) => (tier ? episode.tier === tier : true))
    : [];

  return (
    <StoryShell lang={lang} active="results">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-exp-primary">
              <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
              {expedition.results}
            </span>
            <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight sm:text-3xl">{copy.title}</h1>
            <p className="mt-1 max-w-2xl text-xs font-medium leading-5 text-exp-on-surface-variant sm:text-sm">
              {copy.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/${lang}/vault`} className="exp-btn exp-btn-soft text-xs">
              <Compass className="h-4 w-4 text-exp-primary" aria-hidden="true" />
              {copy.vault}
            </Link>
            <Link href={`/${lang}/learn`} className="exp-btn exp-btn-primary text-xs">
              {expedition.map}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {overview ? (
          <>
            {/* Stats */}
            <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
              <StatCard icon={<Check className="h-4 w-4" />} value={overview.totals.episodesCompleted} label={copy.episodesDone} tone="bg-exp-primary-fixed text-exp-primary" />
              <StatCard icon={<Timer className="h-4 w-4" />} value={overview.totals.scenesCompleted} label={copy.scenes} tone="bg-exp-container text-exp-primary" />
              <StatCard icon={<Target className="h-4 w-4" />} value={`${overview.totals.accuracy}%`} label={copy.accuracy} tone="bg-exp-tertiary-fixed text-exp-tertiary" />
              <StatCard icon={<Zap className="h-4 w-4" />} value={`+${overview.totals.xp}`} label={copy.xp} tone="bg-exp-secondary-fixed text-exp-secondary" />
              <StatCard icon={<Clock className="h-4 w-4" />} value={`${overview.totals.minutes}m`} label={copy.minutes} tone="bg-exp-container-high text-exp-secondary" />
              <StatCard icon={<Star className="h-4 w-4" />} value={`${overview.totals.stars}`} label={copy.stars} tone="bg-exp-secondary-fixed text-exp-secondary" />
            </section>

            {/* Level rail */}
            <div className="exp-card flex flex-col gap-2 p-3.5">
              <LanguageRail
                active={language}
                label="Bahasa"
                hrefFor={(code) =>
                  `/${lang}/results?language=${code}${tier ? `&tier=${tier}` : ""}`
                }
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <LevelPills
                  levels={overview.levels}
                  activeTier={tier}
                  label={copy.level}
                  hrefFor={(value) =>
                    `/${lang}/results?tier=${value}&language=${language}`
                  }
                />
                <Link
                  href={`/${lang}/results?language=${language}`}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                    tier
                      ? "bg-exp-surface-low text-exp-on-surface-variant hover:bg-exp-container"
                      : "bg-exp-primary text-exp-on-primary"
                  }`}
                >
                  {copy.allLevels}
                </Link>
              </div>
            </div>

            {episodes.length === 0 ? (
              <section className="exp-card flex flex-col items-center gap-3 p-10 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-exp-container text-exp-primary">
                  <Trophy className="h-8 w-8" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg font-extrabold">{copy.noResults}</h2>
                  <p className="mt-1 text-sm text-exp-on-surface-variant">{copy.noResultsBody}</p>
                </div>
                <Link href={`/${lang}/stories`} className="exp-btn exp-btn-primary">
                  {copy.startReading}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </section>
            ) : (
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-extrabold">{copy.episodes}</h2>
                  <span className="exp-pill bg-exp-container text-exp-on-surface-variant">
                    {episodes.length}
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {episodes.map((episode) => {
                    const complete = episode.percent === 100;
                    const stars = Math.max(0, Math.min(9, episode.starTotal));
                    return (
                      <Link
                        key={episode.episodeId}
                        href={`/${lang}/results/${episode.episodeId}`}
                        className="group exp-card flex flex-col overflow-hidden transition-transform hover:-translate-y-0.5"
                      >
                        <div className="relative h-28">
                          <StoryArtwork
                            variantSeed={episode.episodeId}
                            palette={episode.palette}
                            worldId={episode.worldId}
                            overlay={false}
                            className="h-full w-full"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-exp-inverse-surface/90 via-exp-inverse-surface/20 to-transparent" />
                          <span className="absolute left-2.5 top-2.5 rounded-full bg-exp-surface-lowest/90 px-2 py-0.5 text-[10px] font-extrabold text-exp-primary backdrop-blur">
                            {episode.levelCode}
                          </span>
                          <div className="absolute inset-x-3 bottom-2">
                            <p className="text-[9px] font-extrabold uppercase tracking-wide text-exp-secondary-fixed">
                              {episode.arcTitle}
                            </p>
                            <p className="truncate text-sm font-extrabold text-exp-on-primary">
                              {episode.nativeTitle || episode.title}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col gap-2 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                                complete
                                  ? "bg-exp-primary-fixed text-exp-on-primary-container"
                                  : "bg-exp-container-high text-exp-on-surface-variant"
                              }`}
                            >
                              {complete ? copy.episodesDone : `${episode.percent}%`}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-extrabold text-exp-secondary">
                              <Target className="h-3 w-3" aria-hidden="true" />
                              {episode.accuracy}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-bold text-exp-on-surface-variant">
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3 text-exp-secondary" aria-hidden="true" />
                              +{episode.xp} XP
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" aria-hidden="true" />
                              {episode.minutes}m
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-0.5" aria-label={`${stars}/9`}>
                              {Array.from({ length: 9 }).map((_, index) => (
                                <Star
                                  key={index}
                                  className={`h-3 w-3 ${
                                    index < stars
                                      ? "fill-exp-secondary-container text-exp-secondary-container"
                                      : "text-exp-outline-variant"
                                  }`}
                                  aria-hidden="true"
                                />
                              ))}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-extrabold text-exp-primary group-hover:underline">
                              {copy.open}
                              <ChevronRight className="h-3 w-3" aria-hidden="true" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        ) : (
          <section className="exp-card p-10 text-center">
            <p className="text-sm font-bold">{copy.noResults}</p>
          </section>
        )}

        <div className="flex items-center gap-3 rounded-2xl bg-exp-container p-3.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-exp-secondary-fixed text-exp-secondary">
            <Flame className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-[11px] font-medium leading-5 text-exp-on-surface-variant">
            {overview
              ? copy.starsFooter(overview.totals.stars, overview.totals.starTotal)
              : ""}
          </p>
        </div>
      </div>
    </StoryShell>
  );
}

function StatCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  tone: string;
}) {
  return (
    <div className="exp-card flex items-center gap-2 p-2.5">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tone}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[16px] font-extrabold leading-tight">{value}</p>
        <p className="truncate text-[9px] font-bold leading-3 text-exp-on-surface-variant">{label}</p>
      </div>
    </div>
  );
}
