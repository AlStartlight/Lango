import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Award,
  BookMarked,
  Check,
  ChevronRight,
  Flame,
  Gem,
  Gift,
  Lock,
  MapPin,
  Shirt,
  Sparkles,
  Star,
  Store,
  Ticket,
  Trophy,
  Zap,
} from "lucide-react";
import { getSessionContext } from "@/lib/auth/session";
import { isUiLocale, resolveContentLanguage } from "@/lib/i18n/locales";
import { getExpeditionHud } from "@/lib/story/expedition";
import { getResultsOverview } from "@/lib/story/report";
import { getPassport } from "@/lib/story/repository";
import { StoryShell } from "@/components/story/story-shell";
import { StoryArtwork, LangoMascot } from "@/components/expedition/art";
import { LevelPills } from "@/components/expedition/level-pills";
import { LanguageRail } from "@/components/expedition/language-rail";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

const COPY = {
  en: {
    title: "Avatar & Reward Shop",
    shopTag: "Shop & Rewards",
    allLevels: "All levels",
    days: (count: number) => `${count} days`,
    subtitle: "Chapter chests, cultural passport stamps, and collector rewards from your expedition.",
    balance: "XP balance",
    collection: "Lango closet",
    collectionBody: "Cosmetics are earned from chapter chests. Gacha ticket exchange is coming with the shop economy.",
    chapterChests: "Chapter reward chests",
    chapterChestsBody: "Open a completed chapter to see its stars, vocabulary recap, and rewards.",
    openChest: "Open evaluation",
    lockedChest: "Finish the chapter",
    stamps: "Culture passport",
    stampsBody: "Stamps are earned by completing scenes with cultural notes.",
    earned: "Earned",
    locked: "Locked",
    exchange: "Explorer exchange",
    exchangeBody: "Spend XP on avatar cosmetics once the reward economy ships.",
    soon: "Coming soon",
    xpCost: (xp: number) => `${xp} XP`,
    items: { hat: "Explorer Hat", kimono: "Sakura Kimono", glasses: "Detective Lens", pass: "JR Pass Charm", onigiri: "Onigiri Pack", badge: "Trail Badge" },
    noChests: "No completed chapters yet",
    noChestsBody: "Finish a story chapter to earn your first chest.",
    noStamps: "No stamps yet",
    noStampsBody: "Read a scene with a culture note to earn a passport stamp.",
    backToMap: "Adventure map",
    results: "Results & Evaluation",
    vault: "Word Vault",
    stars: (earned: number, total: number) => `${earned}/${total} stars`,
  },
  id: {
    title: "Toko Avatar & Hadiah",
    shopTag: "Toko & Hadiah",
    allLevels: "Semua level",
    days: (count: number) => `${count} Hari`,
    subtitle: "Peti babak, cap paspor budaya, dan hadiah kolektor dari ekspedisimu.",
    balance: "Saldo XP",
    collection: "Lemari Lango",
    collectionBody: "Kosmetik didapat dari peti babak. Penukaran tiket gacha menyusul bersama ekonomi toko.",
    chapterChests: "Peti hadiah babak",
    chapterChestsBody: "Buka babak yang tuntas untuk melihat bintang, rekap kosakata, dan hadiahnya.",
    openChest: "Buka evaluasi",
    lockedChest: "Selesaikan babak",
    stamps: "Paspor budaya",
    stampsBody: "Cap didapat dengan menuntaskan scene yang punya catatan budaya.",
    earned: "Didapat",
    locked: "Terkunci",
    exchange: "Bursa penjelajah",
    exchangeBody: "Tukar XP dengan kosmetik avatar setelah ekonomi hadiah dirilis.",
    soon: "Segera hadir",
    xpCost: (xp: number) => `${xp} XP`,
    items: { hat: "Topi Eksplorasi", kimono: "Kimono Sakura", glasses: "Kaca Detektif", pass: "Gantungan JR Pass", onigiri: "Paket Onigiri", badge: "Badge Trail" },
    noChests: "Belum ada babak tuntas",
    noChestsBody: "Selesaikan satu babak cerita untuk peti pertamamu.",
    noStamps: "Belum ada cap",
    noStampsBody: "Baca scene dengan catatan budaya untuk mendapat cap paspor.",
    backToMap: "Peta petualangan",
    results: "Hasil & Evaluasi",
    vault: "Brankas Kata",
    stars: (earned: number, total: number) => `${earned}/${total} bintang`,
  },
  ja: {
    title: "アバター & 報酬ショップ",
    shopTag: "ショップ & 報酬",
    allLevels: "すべてのレベル",
    days: (count: number) => `${count} 日`,
    subtitle: "章の宝箱、文化パスポートのスタンプ、探検のコレクター報酬。",
    balance: "XP 残高",
    collection: "ランのクローゼット",
    collectionBody: "コスメは章の宝箱から獲得します。ガチャチケット交換はショップ経済と共に登場予定です。",
    chapterChests: "章の報酬宝箱",
    chapterChestsBody: "完了した章を開いて星・語彙の復習・報酬を確認しましょう。",
    openChest: "評価を開く",
    lockedChest: "章を完了する",
    stamps: "文化パスポート",
    stampsBody: "文化ノート付きシーンを完了するとスタンプを獲得します。",
    earned: "獲得",
    locked: "ロック",
    exchange: "探検家の交換所",
    exchangeBody: "報酬経済のリリース後、XP でアバターコスメと交換できます。",
    soon: "近日公開",
    xpCost: (xp: number) => `${xp} XP`,
    items: { hat: "探検家ハット", kimono: "桜の着物", glasses: "探偵レンズ", pass: "JR パスチャーム", onigiri: "おにぎりパック", badge: "トレイルバッジ" },
    noChests: "完了した章はまだありません",
    noChestsBody: "物語の章を完了して最初の宝箱を獲得しましょう。",
    noStamps: "スタンプはまだありません",
    noStampsBody: "文化ノート付きのシーンを読んでパスポートスタンプを獲得しましょう。",
    backToMap: "冒険マップ",
    results: "結果 & 評価",
    vault: "単語金庫",
    stars: (earned: number, total: number) => `${earned}/${total} 星`,
  },
} as const;

function copyFor(locale: string) {
  if (locale === "id") return COPY.id;
  if (locale === "ja" || locale === "jp") return COPY.ja;
  return COPY.en;
}

export default async function StorePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ language?: string; tier?: string }>;
}) {
  const { lang } = await params;
  const query = await searchParams;
  const context = await getSessionContext();
  if (!context) redirect(`/${lang}/sign-in`);
  const uiLocale = isUiLocale(lang) ? lang : "en";
  const copy = copyFor(uiLocale);
  const language = resolveContentLanguage(query.language ?? context.user.targetLanguage, uiLocale);
  const [hud, overview, passport] = await Promise.all([
    getExpeditionHud(context.user),
    getResultsOverview(context.user.id, language),
    getPassport(context.user.id, language),
  ]);

  const tier = query.tier && /^T[1-5]$/.test(query.tier) ? query.tier : null;
  const episodes = overview
    ? overview.episodes.filter((episode) => (tier ? episode.tier === tier : true))
    : [];
  const completedEpisodes = episodes.filter((episode) => episode.percent === 100);
  const pendingEpisodes = episodes.filter((episode) => episode.percent < 100).slice(0, 3);
  const earnedStamps = passport.stamps.filter((stamp) => stamp.earnedAt);

  const cosmetics = [
    { icon: Shirt, name: copy.items.hat, price: 300, tone: "bg-exp-primary-fixed text-exp-primary" },
    { icon: Sparkles, name: copy.items.kimono, price: 450, tone: "bg-exp-secondary-fixed text-exp-secondary" },
    { icon: Gem, name: copy.items.glasses, price: 250, tone: "bg-exp-tertiary-fixed text-exp-tertiary" },
    { icon: Ticket, name: copy.items.pass, price: 200, tone: "bg-exp-container-high text-exp-on-surface-variant" },
    { icon: Gift, name: copy.items.onigiri, price: 150, tone: "bg-exp-primary-fixed text-exp-primary" },
    { icon: Award, name: copy.items.badge, price: 350, tone: "bg-exp-secondary-fixed text-exp-secondary" },
  ];

  return (
    <StoryShell lang={lang} active="store">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-exp-primary">
              <Store className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.shopTag}
            </span>
            <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight sm:text-3xl">{copy.title}</h1>
            <p className="mt-1 max-w-2xl text-xs font-medium leading-5 text-exp-on-surface-variant sm:text-sm">
              {copy.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/${lang}/results`} className="exp-btn exp-btn-soft text-xs">
              <Trophy className="h-4 w-4 text-exp-secondary" aria-hidden="true" />
              {copy.results}
            </Link>
            <Link href={`/${lang}/learn`} className="exp-btn exp-btn-primary text-xs">
              {copy.backToMap}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Gacha-style hero */}
        <section className="relative overflow-hidden rounded-3xl border-2 border-exp-primary-container bg-gradient-to-br from-exp-primary-fixed/60 via-exp-surface-lowest to-exp-tertiary-fixed/30 p-5 shadow-[0_6px_0_var(--exp-container-high)] sm:p-7">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-exp-primary-container/20 blur-2xl" />
          <div className="relative flex flex-col items-center gap-5 text-center lg:flex-row lg:items-center lg:text-left">
            <div className="relative shrink-0">
              <span className="grid h-32 w-32 place-items-center rounded-full bg-exp-surface-lowest shadow-lg ring-8 ring-exp-primary-fixed sm:h-40 sm:w-40">
                <LangoMascot className="h-28 w-28 sm:h-36 sm:w-36" />
              </span>
              <span className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-exp-secondary-container px-2.5 py-1 text-[10px] font-extrabold text-exp-on-secondary-container shadow">
                <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                {copy.collection}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-exp-surface-lowest/80 px-3 py-1 text-[10px] font-extrabold text-exp-primary shadow-sm">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {context.user.levelLabel || `${copy.balance} ${hud.level}`}
              </span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{copy.collection}</h2>
              <p className="mt-1 max-w-2xl text-xs font-medium leading-6 text-exp-on-surface-variant sm:text-sm">
                {copy.collectionBody}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <span className="exp-pill bg-exp-surface-lowest text-exp-primary shadow-sm">
                  <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                  {hud.xpTotal.toLocaleString("en-US")} XP
                </span>
                <span className="exp-pill bg-exp-surface-lowest text-exp-secondary shadow-sm">
                  <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                  {copy.days(hud.streak)}
                </span>
                <span className="exp-pill bg-exp-surface-lowest text-exp-tertiary shadow-sm">
                  <Award className="h-3.5 w-3.5" aria-hidden="true" />
                  {earnedStamps.length}/{passport.stamps.length} {copy.earned}
                </span>
              </div>
            </div>
            <div className="grid shrink-0 grid-cols-3 gap-2 lg:grid-cols-1">
              {cosmetics.slice(0, 3).map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.name} className="flex items-center gap-2 rounded-xl bg-exp-surface-lowest/80 p-2 shadow-sm backdrop-blur">
                    <span className={`grid h-8 w-8 place-items-center rounded-lg ${item.tone}`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="hidden min-w-0 lg:block">
                      <span className="block truncate text-[10px] font-extrabold">{item.name}</span>
                      <span className="block text-[9px] font-bold text-exp-outline">{copy.soon}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="exp-card flex flex-col gap-2 p-3.5">
          <LanguageRail
            active={language}
            label="Bahasa"
            hrefFor={(code) => `/${lang}/store?language=${code}${tier ? `&tier=${tier}` : ""}`}
          />
          {overview ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <LevelPills
                levels={overview.levels}
                activeTier={tier}
                label="Level"
                hrefFor={(value) => `/${lang}/store?tier=${value}&language=${language}`}
              />
              <Link
                href={`/${lang}/store?language=${language}`}
                className="rounded-full bg-exp-surface-low px-2.5 py-1 text-[10px] font-extrabold text-exp-on-surface-variant hover:bg-exp-container"
              >
                {copy.allLevels}
              </Link>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
          <div className="flex flex-col gap-4 xl:col-span-8">
            {/* Chapter chests */}
            <section className="exp-card p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-extrabold">
                    <Gift className="h-5 w-5 text-exp-secondary" aria-hidden="true" />
                    {copy.chapterChests}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-exp-on-surface-variant">
                    {copy.chapterChestsBody}
                  </p>
                </div>
                <span className="exp-pill bg-exp-container text-exp-on-surface-variant">
                  {completedEpisodes.length}
                </span>
              </div>

              {completedEpisodes.length === 0 && pendingEpisodes.length === 0 ? (
                <div className="mt-3 rounded-2xl bg-exp-surface-low p-6 text-center">
                  <p className="text-sm font-extrabold">{copy.noChests}</p>
                  <p className="mt-1 text-xs text-exp-on-surface-variant">{copy.noChestsBody}</p>
                  <Link href={`/${lang}/stories?language=${language}`} className="exp-btn exp-btn-primary mt-3 text-xs">
                    {copy.backToMap}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              ) : (
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {[...completedEpisodes, ...pendingEpisodes].slice(0, 6).map((episode) => {
                    const complete = episode.percent === 100;
                    return (
                      <div
                        key={episode.episodeId}
                        className={`flex flex-col gap-2 rounded-2xl border-2 p-3 ${
                          complete
                            ? "border-exp-primary-container bg-exp-primary-fixed/20"
                            : "border-exp-container-high bg-exp-surface-low"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-full bg-exp-surface-lowest px-2 py-0.5 text-[9px] font-extrabold text-exp-primary">
                            {episode.levelCode}
                          </span>
                          <span className="flex items-center gap-0.5">
                            {Array.from({ length: 3 }).map((_, index) => (
                              <Star
                                key={index}
                                className={`h-3 w-3 ${
                                  index < Math.ceil(episode.starTotal / 3)
                                    ? "fill-exp-secondary-container text-exp-secondary-container"
                                    : "text-exp-outline-variant"
                                }`}
                                aria-hidden="true"
                              />
                            ))}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-extrabold">{episode.nativeTitle || episode.title}</p>
                          <p className="text-[10px] font-semibold text-exp-on-surface-variant">
                            {episode.arcTitle} · EP {episode.episodeNo}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-exp-outline">
                            {complete ? copy.stars(episode.starTotal, 9) : `${episode.percent}%`}
                          </span>
                          {complete ? (
                            <Link
                              href={`/${lang}/results/${episode.episodeId}`}
                              className="flex items-center gap-1 text-[10px] font-extrabold text-exp-primary hover:underline"
                            >
                              {copy.openChest}
                              <ChevronRight className="h-3 w-3" aria-hidden="true" />
                            </Link>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-extrabold text-exp-outline">
                              <Lock className="h-3 w-3" aria-hidden="true" />
                              {copy.lockedChest}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Culture passport */}
            <section className="exp-card p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-extrabold">
                    <MapPin className="h-5 w-5 text-exp-primary" aria-hidden="true" />
                    {copy.stamps}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-exp-on-surface-variant">{copy.stampsBody}</p>
                </div>
                <span className="exp-pill bg-exp-container text-exp-on-surface-variant">
                  {earnedStamps.length}/{passport.stamps.length}
                </span>
              </div>
              {passport.stamps.length === 0 ? (
                <p className="mt-3 rounded-xl bg-exp-surface-low p-4 text-xs text-exp-on-surface-variant">
                  {copy.noStampsBody}
                </p>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {passport.stamps.slice(0, 8).map((stamp) => {
                    const earned = Boolean(stamp.earnedAt);
                    return (
                      <div
                        key={stamp.id}
                        className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-center ${
                          earned
                            ? "border-exp-primary-container bg-exp-primary-fixed/20"
                            : "border-dashed border-exp-container-high bg-exp-surface-low opacity-80"
                        }`}
                      >
                        <span
                          className={`grid h-11 w-11 place-items-center rounded-full ${
                            earned
                              ? "bg-exp-primary text-exp-on-primary"
                              : "bg-exp-container-high text-exp-on-surface-variant"
                          }`}
                        >
                          {earned ? (
                            <Check className="h-5 w-5" aria-hidden="true" />
                          ) : (
                            <Lock className="h-4 w-4" aria-hidden="true" />
                          )}
                        </span>
                        <p className="line-clamp-2 text-[10px] font-extrabold leading-4">{stamp.title}</p>
                        <span className="text-[9px] font-bold text-exp-outline">
                          {earned ? copy.earned : copy.locked}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="flex w-full flex-col gap-4 xl:col-span-4">
            <section className="exp-card p-4">
              <h2 className="flex items-center gap-2 text-sm font-extrabold">
                <Gem className="h-4 w-4 text-exp-tertiary" aria-hidden="true" />
                {copy.exchange}
              </h2>
              <p className="mt-1 text-[11px] font-medium leading-5 text-exp-on-surface-variant">
                {copy.exchangeBody}
              </p>
              <div className="mt-2 flex flex-col gap-1.5">
                {cosmetics.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-2 rounded-xl bg-exp-surface-low p-2"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${item.tone}`}>
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[11px] font-extrabold">{item.name}</span>
                          <span className="block text-[9px] font-bold text-exp-secondary">
                            {copy.xpCost(item.price)}
                          </span>
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-exp-container-high px-2 py-1 text-[9px] font-extrabold text-exp-on-surface-variant">
                        {copy.soon}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="relative overflow-hidden rounded-2xl shadow-md">
              <StoryArtwork
                variant="shrine"
                palette={overview?.world.palette}
                worldId={overview?.world.id}
                className="h-36 w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-exp-inverse-surface/90 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-extrabold uppercase tracking-wide text-exp-secondary-fixed">
                    {overview?.world.nativeTitle ?? copy.collection}
                  </p>
                  <p className="truncate text-sm font-extrabold text-exp-on-primary">{copy.collection}</p>
                </div>
                <Link href={`/${lang}/vault`} className="exp-pill bg-exp-surface-lowest text-exp-primary shadow-sm">
                  <BookMarked className="h-3.5 w-3.5" aria-hidden="true" />
                  {copy.vault}
                </Link>
              </div>
            </section>

            <div className="flex items-center gap-3 rounded-2xl bg-exp-container p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-exp-secondary-fixed text-exp-secondary">
                <Trophy className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-[11px] font-medium leading-5 text-exp-on-surface-variant">
                {overview ? copy.stars(overview.totals.stars, overview.totals.starTotal) : ""}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </StoryShell>
  );
}
