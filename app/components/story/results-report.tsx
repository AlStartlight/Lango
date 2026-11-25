"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BookMarked,
  Check,
  ChevronRight,
  Clock,
  Compass,
  Flame,
  Gift,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  Trophy,
  Volume2,
  Zap,
} from "lucide-react";
import { LangoMascot, StoryArtwork } from "@/components/expedition/art";
import { toSpeechLocale } from "@/lib/i18n/locales";
import { useSpeech, useSpeechGender } from "@/lib/use-speech";
import type { EpisodeReport, ReportStar } from "@/lib/story/report";

const COPY = {
  en: {
    achievement: "Achievement unlocked",
    perfect: "Perfect score",
    starScore: "Stars",
    titleDone: (n: number) => `Chapter ${n} complete: the trail is yours!`,
    titleOpen: (n: number) => `Chapter ${n} evaluation`,
    doneIntro: (episode: string) =>
      `Lango and you closed the chapter “${episode}”. Every new word, grammar pattern, and conversation beat is now part of your expedition journal.`,
    openIntro: "Finish every scene to unlock the full star evaluation for this chapter.",
    starsTitle: "Chapter evaluation",
    starLabels: { vocabulary: "Vocabulary", grammar: "Grammar", comprehension: "Comprehension" },
    accuracy: "Accuracy",
    xp: "XP earned",
    time: "Time spent",
    streak: "Study streak",
    vocab: "Vocabulary recap",
    vocabBody: "Tap a card to hear it. These words are already queued in your Word Vault.",
    gram: "Language mastery",
    sceneTrail: "Scene trail",
    done: "Completed",
    open: "Not read",
    nextMission: "Next mission ready",
    nextBody: "Keep the expedition moving while the story is fresh.",
    rewards: "Rewards earned",
    rewardXp: "XP from this chapter",
    rewardStreak: "Streak kept alive",
    rewardVocab: "Words added to the vault",
    continueChapter: "Continue chapter",
    nextChapter: "Next chapter",
    backToMap: "Adventure map",
    backToResults: "All results",
    retryQuiz: "Practice this chapter",
    perfectScore: "Perfect score badge earned",
    close: "Close",
    toggleFurigana: "Furigana",
    toggleRomaji: "Romaji",
    audio: "Audio",
    mastered: "Mastered",
    reading: "Reading",
    skill: "Skill",
    noVocab: "No vocabulary recorded for this chapter yet.",
    stillOpen: "Chapter in progress",
  },
  id: {
    achievement: "Pencapaian terbuka",
    perfect: "Skor sempurna",
    starScore: "Bintang",
    titleDone: (n: number) => `Babak ${n} selesai: jejak itu milikmu!`,
    titleOpen: (n: number) => `Evaluasi Babak ${n}`,
    doneIntro: (episode: string) =>
      `Lango dan kamu menutup babak “${episode}”. Setiap kata baru, pola tata bahasa, dan beat percakapan kini menjadi bagian jurnal ekspedisimu.`,
    openIntro: "Selesaikan semua scene untuk membuka evaluasi bintang penuh babak ini.",
    starsTitle: "Evaluasi babak",
    starLabels: { vocabulary: "Kosakata", grammar: "Tata bahasa", comprehension: "Pemahaman" },
    accuracy: "Akurasi",
    xp: "XP didapat",
    time: "Waktu",
    streak: "Streak belajar",
    vocab: "Rekap kosakata",
    vocabBody: "Ketuk kartu untuk mendengar. Kata-kata ini sudah masuk ke Brankas Kata.",
    gram: "Penguasaan materi",
    sceneTrail: "Jejak scene",
    done: "Selesai",
    open: "Belum dibaca",
    nextMission: "Misi berikutnya siap",
    nextBody: "Jaga momentum ekspedisi selagi cerita masih segar.",
    rewards: "Hadiah diperoleh",
    rewardXp: "XP dari babak ini",
    rewardStreak: "Streak tetap menyala",
    rewardVocab: "Kata masuk brankas",
    continueChapter: "Lanjutkan babak",
    nextChapter: "Babak berikutnya",
    backToMap: "Peta petualangan",
    backToResults: "Semua hasil",
    retryQuiz: "Latih babak ini",
    perfectScore: "Badge skor sempurna didapat",
    close: "Tutup",
    toggleFurigana: "Furigana",
    toggleRomaji: "Romaji",
    audio: "Suara",
    mastered: "Dikuasai",
    reading: "Cara baca",
    skill: "Skill",
    noVocab: "Belum ada kosakata tercatat untuk babak ini.",
    stillOpen: "Babak masih berjalan",
  },
  ja: {
    achievement: "実績解除",
    perfect: "パーフェクト",
    starScore: "星",
    titleDone: (n: number) => `第${n}章クリア：道はあなたのもの！`,
    titleOpen: (n: number) => `第${n}章の評価`,
    doneIntro: (episode: string) =>
      `ランと一緒に「${episode}」を締めくくりました。新しい単語、文法、会話のビートが探検日誌に刻まれました。`,
    openIntro: "すべてのシーンを読むと、章の星評価が解放されます。",
    starsTitle: "章の評価",
    starLabels: { vocabulary: "語彙", grammar: "文法", comprehension: "読解" },
    accuracy: "正答率",
    xp: "獲得 XP",
    time: "学習時間",
    streak: "連続学習",
    vocab: "語彙の復習",
    vocabBody: "カードをタップして音声を聞けます。単語は単語金庫に入っています。",
    gram: "言語マスタリー",
    sceneTrail: "シーンの足跡",
    done: "完了",
    open: "未読",
    nextMission: "次のミッション準備完了",
    nextBody: "物語が新しいうちに探検を続けましょう。",
    rewards: "獲得報酬",
    rewardXp: "この章の XP",
    rewardStreak: "連続記録継続",
    rewardVocab: "金庫に入った単語",
    continueChapter: "章を続ける",
    nextChapter: "次の章",
    backToMap: "冒険マップ",
    backToResults: "すべての結果",
    retryQuiz: "この章を練習",
    perfectScore: "パーフェクトバッジ獲得",
    close: "閉じる",
    toggleFurigana: "ふりがな",
    toggleRomaji: "ローマ字",
    audio: "音声",
    mastered: "習得",
    reading: "読み",
    skill: "スキル",
    noVocab: "この章の語彙はまだ記録されていません。",
    stillOpen: "章は進行中",
  },
} as const;

function copyFor(locale: string) {
  if (locale === "id") return COPY.id;
  if (locale === "ja" || locale === "jp") return COPY.ja;
  return COPY.en;
}

function starLabel(copy: ReturnType<typeof copyFor>, key: ReportStar["key"]): string {
  return copy.starLabels[key];
}

const SKILL_LABELS: Record<string, { en: string; id: string; ja: string }> = {
  vocabulary: { en: "Vocabulary", id: "Kosakata", ja: "語彙" },
  grammar: { en: "Grammar", id: "Tata bahasa", ja: "文法" },
  reading: { en: "Reading", id: "Membaca", ja: "読解" },
  inference: { en: "Inference", id: "Inferensi", ja: "推論" },
  culture: { en: "Culture", id: "Budaya", ja: "文化" },
  listening: { en: "Listening", id: "Menyimak", ja: "聴解" },
  comprehension: { en: "Comprehension", id: "Pemahaman", ja: "理解" },
};

function skillLabel(skill: string, locale: string): string {
  const entry = SKILL_LABELS[skill];
  if (!entry) return skill;
  if (locale === "id") return entry.id;
  if (locale === "ja" || locale === "jp") return entry.ja;
  return entry.en;
}

export function ResultsReport({
  report,
  lang,
  locale,
}: {
  report: EpisodeReport;
  lang: string;
  locale: string;
}) {
  const copy = copyFor(locale);
  const { speak: speakText, cancel: cancelSpeech } = useSpeech();
  const [voiceGender] = useSpeechGender(report.language);
  const speechLocale = toSpeechLocale(report.language);
  const isCjk = report.language === "ja" || report.language === "zh";
  const [furigana, setFurigana] = useState(report.language === "ja");
  const [romaji, setRomaji] = useState(isCjk);
  const [playing, setPlaying] = useState<string | null>(null);
  const [openVocab, setOpenVocab] = useState<string | null>(null);

  const speak = (text: string, id: string) => {
    if (playing === id) {
      cancelSpeech();
      setPlaying(null);
      return;
    }
    const result = speakText(text, speechLocale, {
      gender: voiceGender,
      rate: 0.85,
      onEnd: () => setPlaying(null),
      onError: () => setPlaying(null),
    });
    if (!result.ok) {
      setPlaying(null);
      return;
    }
    setPlaying(id);
  };

  const accuracy = report.answered === 0 ? 0 : report.accuracy;
  const nextHref = report.nextEpisodeId
    ? `/${lang}/stories/${report.worldId}/${report.nextEpisodeId}`
    : `/${lang}/stories`;
  const continueHref = report.nextSceneId
    ? `/${lang}/reader/${report.nextSceneId}`
    : nextHref;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold text-exp-on-surface-variant">
          <Link href={`/${lang}/learn`} className="hover:text-exp-primary">
            {copy.backToMap}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-exp-outline" aria-hidden="true" />
          <Link href={`/${lang}/results`} className="hover:text-exp-primary">
            {copy.backToResults}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-exp-outline" aria-hidden="true" />
          <span>
            {report.arc.nativeTitle} · EP {report.episode.episodeNo}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="exp-pill bg-exp-primary-fixed text-exp-on-primary-container">
            {report.levelCode}
          </span>
          <span className="exp-pill bg-exp-secondary-fixed text-exp-secondary">
            <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            {report.starTotal}/9
          </span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-exp-primary-container bg-gradient-to-br from-exp-primary-fixed/60 via-exp-surface-lowest to-exp-secondary-fixed/40 p-5 shadow-[0_6px_0_var(--exp-container-high)] sm:p-7">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-exp-primary-container/20 blur-2xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="relative shrink-0">
              <span className="grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-exp-surface-lowest shadow-lg ring-4 ring-exp-primary-container sm:h-28 sm:w-28">
                <LangoMascot className="h-24 w-24" />
              </span>
              <span className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-exp-secondary-container px-2 py-0.5 text-[9px] font-extrabold text-exp-on-secondary-container shadow">
                <Trophy className="h-3 w-3" aria-hidden="true" />
                MVP
              </span>
            </div>
            <div className="min-w-0">
              <span className="flex w-fit items-center gap-1.5 rounded-full bg-exp-surface-lowest/80 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-exp-primary shadow-sm">
                <Check className="h-3 w-3" aria-hidden="true" />
                {report.isComplete ? copy.achievement : copy.stillOpen}
              </span>
              <h1 className="mt-2 max-w-2xl text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                {report.isComplete
                  ? copy.titleDone(report.episode.episodeNo)
                  : copy.titleOpen(report.episode.episodeNo)}
              </h1>
              <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-exp-on-surface-variant">
                {report.isComplete
                  ? copy.doneIntro(report.episode.nativeTitle || report.episode.title)
                  : copy.openIntro}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link href={`/${lang}/vault`} className="exp-pill bg-exp-surface-lowest text-exp-primary shadow-sm">
                  <BookMarked className="h-3.5 w-3.5" aria-hidden="true" />
                  {copy.vocab}
                </Link>
                <Link
                  href={`/${lang}/practice`}
                  className="exp-pill bg-exp-surface-lowest text-exp-secondary shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  {copy.retryQuiz}
                </Link>
              </div>
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4 lg:max-w-md">
            <Stat icon={<Target className="h-4 w-4" />} value={`${accuracy}%`} label={copy.accuracy} />
            <Stat icon={<Zap className="h-4 w-4" />} value={`+${report.xp}`} label={copy.xp} />
            <Stat icon={<Clock className="h-4 w-4" />} value={report.minutesLabel} label={copy.time} />
            <Stat icon={<Flame className="h-4 w-4" />} value={`${report.streak}`} label={copy.streak} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
        <div className="flex flex-col gap-4 xl:col-span-8">
          {/* Star evaluation */}
          <section className="exp-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <Star className="h-5 w-5 fill-exp-secondary-container text-exp-secondary-container" aria-hidden="true" />
                {copy.starsTitle}
              </h2>
              <span className="exp-pill bg-exp-container text-exp-on-surface-variant">
                {copy.starScore}: {report.starTotal}/9
              </span>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {report.stars.map((star) => (
                <div
                  key={star.key}
                  className={`relative flex flex-col gap-2 rounded-2xl border-2 p-3 ${
                    star.value >= 2
                      ? "border-exp-primary-container bg-exp-primary-fixed/25"
                      : star.value === 1
                        ? "border-exp-secondary-container bg-exp-secondary-fixed/30"
                        : "border-exp-container-high bg-exp-surface-low"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-exp-surface-lowest shadow-sm">
                      <Star
                        className={`h-6 w-6 ${
                          star.value >= 2
                            ? "fill-exp-secondary-container text-exp-secondary-container"
                            : "text-exp-outline-variant"
                        }`}
                        aria-hidden="true"
                      />
                    </span>
                    <div className="flex gap-0.5" aria-hidden="true">
                      {[0, 1, 2].map((i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < star.value
                              ? "fill-exp-secondary-container text-exp-secondary-container"
                              : "text-exp-outline-variant"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-exp-outline">
                      {starLabel(copy, star.key)}
                    </p>
                    <p className="text-sm font-extrabold leading-tight">{star.detail}</p>
                  </div>
                  <span
                    className={`w-fit rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                      star.value >= 2
                        ? "bg-exp-primary text-exp-on-primary"
                        : star.value === 1
                          ? "bg-exp-secondary-container text-exp-on-secondary-container"
                          : "bg-exp-container-high text-exp-on-surface-variant"
                    }`}
                  >
                    {star.percent}%
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Vocabulary recap */}
          <section className="exp-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-extrabold">
                  <BookMarked className="h-5 w-5 text-exp-primary" aria-hidden="true" />
                  {copy.vocab}
                </h2>
                <p className="mt-0.5 text-xs font-medium text-exp-on-surface-variant">{copy.vocabBody}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {isCjk && (
                  <Toggle active={furigana} onClick={() => setFurigana((value) => !value)}>
                    {copy.toggleFurigana}
                  </Toggle>
                )}
                {isCjk && (
                  <Toggle active={romaji} onClick={() => setRomaji((value) => !value)}>
                    {copy.toggleRomaji}
                  </Toggle>
                )}
              </div>
            </div>
            {report.vocab.length === 0 ? (
              <p className="mt-3 rounded-xl bg-exp-surface-low p-4 text-xs text-exp-on-surface-variant">
                {copy.noVocab}
              </p>
            ) : (
              <div className="mt-3 grid gap-2.5 md:grid-cols-2">
                {report.vocab.slice(0, 8).map((word) => (
                  <div
                    key={word.conceptKey}
                    className={`rounded-2xl border-2 p-3 transition-colors ${
                      openVocab === word.conceptKey
                        ? "border-exp-primary-container bg-exp-primary-fixed/20"
                        : "border-exp-container-high bg-exp-surface-lowest"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-lg font-extrabold leading-tight" lang={report.language === "ja" ? "ja" : undefined}>
                          {word.term}
                        </p>
                        <p className="text-[10px] font-bold text-exp-outline">
                          {furigana && word.reading ? word.reading : ""}
                          {romaji && word.romanization ? ` · ${word.romanization}` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <span className="rounded-full bg-exp-primary-fixed px-2 py-0.5 text-[9px] font-extrabold text-exp-on-primary-container">
                          {copy.mastered}
                        </span>
                        <button
                          type="button"
                          onClick={() => speak(word.term, word.conceptKey)}
                          className="grid h-8 w-8 place-items-center rounded-full bg-exp-container text-exp-primary"
                          aria-label={copy.audio}
                        >
                          <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-sm font-bold text-exp-on-surface-variant">{word.gloss}</p>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenVocab((current) => (current === word.conceptKey ? null : word.conceptKey))
                      }
                      className="mt-1.5 flex items-center gap-1 text-[10px] font-extrabold text-exp-primary hover:underline"
                    >
                      {copy.reading}
                      <ChevronRight
                        className={`h-3 w-3 transition-transform ${
                          openVocab === word.conceptKey ? "rotate-90" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                    {openVocab === word.conceptKey && (
                      <p className="mt-1.5 rounded-lg bg-exp-surface-low p-2 text-[11px] font-medium leading-5 text-exp-on-surface-variant">
                        {word.example}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Skill mastery */}
          <section className="exp-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <Compass className="h-5 w-5 text-exp-tertiary" aria-hidden="true" />
                {copy.gram}
              </h2>
              <span className="exp-pill bg-exp-container text-exp-on-surface-variant">
                {report.correct}/{report.answered} · {accuracy}%
              </span>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {report.skills.length === 0 ? (
                <p className="rounded-xl bg-exp-surface-low p-3 text-xs text-exp-on-surface-variant">
                  {copy.openIntro}
                </p>
              ) : (
                report.skills.map((skill) => (
                  <div key={skill.skill} className="rounded-xl bg-exp-surface-low p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold">
                        {skillLabel(skill.skill, locale)}
                      </span>
                      <span className="text-[10px] font-extrabold text-exp-primary">{skill.percent}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-exp-container-highest">
                      <div
                        className="h-full rounded-full bg-exp-primary-container"
                        style={{ width: `${skill.percent}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Scene trail */}
          <section className="exp-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-extrabold">{copy.sceneTrail}</h2>
              <span className="exp-pill bg-exp-container text-exp-on-surface-variant">
                {report.completed}/{report.total}
              </span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {report.scenes.map((scene) => (
                <Link
                  key={scene.id}
                  href={`/${lang}/reader/${scene.id}`}
                  className="flex items-center gap-2.5 rounded-xl bg-exp-surface-low p-2.5 transition-colors hover:bg-exp-container"
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-extrabold ${
                      scene.completed
                        ? "bg-exp-primary-container text-exp-on-primary-container"
                        : "bg-exp-container-high text-exp-on-surface-variant"
                    }`}
                  >
                    {scene.completed ? <Check className="h-4 w-4" aria-hidden="true" /> : scene.sceneNo}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold">{scene.title}</span>
                    <span className="block text-[10px] font-medium text-exp-outline">
                      {scene.completed ? copy.done : copy.open} · {scene.minutesSpent || scene.minutes}m
                    </span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-exp-outline" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right rail */}
        <aside className="flex w-full flex-col gap-4 xl:col-span-4">
          <section className="relative overflow-hidden rounded-2xl shadow-md">
            <StoryArtwork
              variantSeed={report.episodeId}
              palette={report.palette}
              worldId={report.worldId}
              overlay={false}
              className="h-40 w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-exp-inverse-surface/90 via-exp-inverse-surface/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-exp-secondary-fixed">
                {report.arc.nativeTitle}
              </span>
              <h3 className="truncate text-lg font-extrabold text-exp-on-primary">
                {report.episode.nativeTitle || report.episode.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-5 text-exp-container-high">
                {report.episode.recap}
              </p>
            </div>
          </section>

          <section className="exp-card flex flex-col gap-2.5 p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-exp-secondary-fixed text-exp-secondary">
                <Gift className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="text-sm font-extrabold">{copy.rewards}</h3>
            </div>
            <Reward icon={<Zap className="h-4 w-4" />} label={copy.rewardXp} value={`+${report.xp} XP`} />
            <Reward icon={<Flame className="h-4 w-4" />} label={copy.rewardStreak} value={`${report.streak} Hari`} />
            <Reward icon={<BookMarked className="h-4 w-4" />} label={copy.rewardVocab} value={`${report.vocab.length}`} />
            <Link href={`/${lang}/vault`} className="mt-1 flex items-center justify-between rounded-xl bg-exp-primary px-3 py-2.5 text-xs font-extrabold text-exp-on-primary shadow-[0_3px_0_var(--exp-primary)] hover:brightness-105">
              <span className="flex items-center gap-1.5">
                <BookMarked className="h-4 w-4" aria-hidden="true" />
                {copy.vocab}
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>

          <section className="exp-card flex flex-col gap-2 p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-exp-tertiary-fixed text-exp-tertiary">
                <Target className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-extrabold">{copy.nextMission}</h3>
                <p className="text-[10px] font-medium text-exp-on-surface-variant">{copy.nextBody}</p>
              </div>
            </div>
            <p className="rounded-xl bg-exp-surface-low p-2.5 text-xs font-bold leading-5">
              {report.nextEpisodeTitle ?? copy.continueChapter}
            </p>
            <Link href={nextHref} className="exp-btn exp-btn-primary text-xs">
              {copy.nextChapter}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>

          <div className="flex items-center gap-3 rounded-2xl bg-exp-container p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-exp-primary-fixed">
              <LangoMascot className="h-9 w-9" />
            </span>
            <p className="text-[11px] font-medium leading-5 text-exp-on-surface-variant">
              “
              {report.starTotal === 9
                ? copy.perfectScore
                : report.isComplete
                  ? copy.titleDone(report.episode.episodeNo)
                  : copy.stillOpen}
              ”
            </p>
          </div>
        </aside>
      </div>

      {/* Sticky dock */}
      <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-exp-surface-lowest/95 p-3 shadow-[0_8px_30px_-12px_rgba(17,28,45,0.35)] backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/${lang}/results`} className="exp-btn exp-btn-ghost min-h-9 text-xs">
            {copy.backToResults}
          </Link>
          <Link href={`/${lang}/practice`} className="exp-btn exp-btn-soft min-h-9 text-xs">
            <RotateCcw className="h-4 w-4 text-exp-secondary" aria-hidden="true" />
            {copy.retryQuiz}
          </Link>
        </div>
        <Link
          href={report.isComplete ? nextHref : continueHref}
          className="exp-btn exp-btn-primary min-h-10 w-full text-xs sm:w-auto"
        >
          {report.isComplete ? copy.nextChapter : copy.continueChapter}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-exp-surface-lowest/80 px-2 py-2 text-center shadow-sm backdrop-blur">
      <span className="text-exp-primary">{icon}</span>
      <span className="mt-0.5 text-[16px] font-extrabold leading-tight">{value}</span>
      <span className="text-[9px] font-bold leading-3 text-exp-on-surface-variant">{label}</span>
    </div>
  );
}

function Reward({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-exp-surface-low px-2.5 py-2">
      <span className="flex items-center gap-2 text-[11px] font-bold text-exp-on-surface-variant">
        <span className="text-exp-primary">{icon}</span>
        {label}
      </span>
      <span className="text-xs font-extrabold text-exp-primary">{value}</span>
    </div>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-8 rounded-full px-2.5 text-[9px] font-extrabold transition-colors ${
        active
          ? "bg-exp-primary/10 text-exp-primary ring-1 ring-exp-primary-container"
          : "bg-exp-surface-low text-exp-on-surface-variant"
      }`}
    >
      {children}
    </button>
  );
}
