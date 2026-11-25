"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookMarked,
  Brain,
  Check,
  ChevronRight,
  Flame,
  Keyboard,
  Lightbulb,
  MapPin,
  Mic,
  RotateCcw,
  Sparkles,
  Star,
  Timer,
  Volume2,
  X,
} from "lucide-react";
import { StoryArtwork } from "@/components/expedition/art";
import { useTranslation } from "react-i18next";
import { CONTENT_LANGUAGE_LABELS, toSpeechLocale } from "@/lib/i18n/locales";
import { useSpeech, useSpeechGender } from "@/lib/use-speech";
import type { VaultDeck, VaultRating } from "@/lib/story/vault";

interface VaultCopy {
  title: string;
  breadcrumb: string;
  quickMode: string;
  progress: (index: number, total: number, percent: number) => string;
  furigana: string;
  romaji: string;
  autoAudio: string;
  pack: string;
  openExample: string;
  listen: string;
  listenHint: string;
  pronunciation: string;
  pronunciationHint: string;
  micReady: string;
  micUnsupported: string;
  rateTitle: string;
  again: string;
  hard: string;
  good: string;
  easy: string;
  againHint: string;
  hardHint: string;
  goodHint: string;
  easyHint: string;
  wordPack: string;
  words: (count: number) => string;
  relatedLocation: string;
  memoryMetrics: string;
  collected: string;
  accuracy: string;
  streak: string;
  newCards: string;
  mastered: string;
  due: string;
  scheduled: string;
  next: string;
  finish: string;
  saveRest: string;
  shortcuts: string;
  tip: string;
  tipBody: (term: string) => string;
  doneTitle: string;
  doneBody: (count: number) => string;
  reviewAgain: string;
  backToMap: string;
  backToResults: string;
  noCards: string;
  noCardsBody: string;
  xpNote: string;
  stateLabels: Record<string, string>;
  pronunciationError: string;
  audioUnavailable: string;
}

const COPY: Record<"en" | "id" | "ja", VaultCopy> = {
  en: {
    title: "Word Vault",
    breadcrumb: "Word Vault",
    quickMode: "Quick Practice Mode (+25 XP)",
    progress: (index, total, percent) => `Card ${index} of ${total} (${percent}% complete)`,
    furigana: "Furigana",
    romaji: "Romaji",
    autoAudio: "Auto-Audio",
    pack: "Vocabulary Pack",
    openExample: "Open example sentence",
    listen: "Listen",
    listenHint: "Tap the word or press Space to hear it spoken.",
    pronunciation: "AI pronunciation practice",
    pronunciationHint: "Speak or tap the mic to compare your pronunciation.",
    micReady: "Microphone ready",
    micUnsupported: "Microphone is not available in this browser.",
    rateTitle: "How well do you remember this word?",
    again: "Again",
    hard: "Hard",
    good: "Good",
    easy: "Easy",
    againHint: "10 min",
    hardHint: "1 day",
    goodHint: "4 days",
    easyHint: "7 days",
    wordPack: "Vocabulary Pack",
    words: (count) => `${count} words`,
    relatedLocation: "Related story location",
    memoryMetrics: "Memory metrics",
    collected: "Words in vault",
    accuracy: "Review accuracy",
    streak: "Active streak",
    newCards: "New",
    mastered: "Mastered",
    due: "Due",
    scheduled: "Scheduled",
    next: "Next",
    finish: "Finish session",
    saveRest: "Save & rest",
    shortcuts: "Shortcuts [1-4: rate, Space: audio]",
    tip: "Lango's explorer tip",
    tipBody: (term) =>
      `Use “${term}” in your own sentence right after this session. Words stick when you say them out loud.`,
    doneTitle: "Vault session complete!",
    doneBody: (count) => `You reviewed ${count} words and kept your memory trail warm.`,
    reviewAgain: "Review again",
    backToMap: "Back to map",
    backToResults: "See results",
    noCards: "No vocabulary cards yet",
    noCardsBody: "Read a story scene first; new words flow into the vault automatically.",
    xpNote: "+25 XP when you finish the deck",
    stateLabels: { new: "New", due: "Due", scheduled: "Scheduled", mastered: "Mastered" },
    pronunciationError: "Speech recognition is not available. Try listening and repeating aloud.",
    audioUnavailable: "Audio is not available on this device. The text is still readable.",
  },
  id: {
    title: "Brankas Kata",
    breadcrumb: "Brankas Kata",
    quickMode: "Mode Latihan Cepat (+25 XP)",
    progress: (index, total, percent) => `Kartu ${index} dari ${total} (${percent}% tuntas)`,
    furigana: "Furigana",
    romaji: "Romaji",
    autoAudio: "Auto-Audio",
    pack: "Paket Kosakata",
    openExample: "Buka contoh kalimat",
    listen: "Putar",
    listenHint: "Ketuk kata atau tekan Spasi untuk mendengar pelafalan.",
    pronunciation: "Latihan pengucapan AI",
    pronunciationHint: "Bicara atau ketuk mikrofon untuk membandingkan pelafalanmu.",
    micReady: "Mikrofon siap",
    micUnsupported: "Mikrofon tidak tersedia di peramban ini.",
    rateTitle: "Pilih seberapa baik anda mengingat kata ini:",
    again: "Ulangi",
    hard: "Sulit",
    good: "Baik",
    easy: "Mudah",
    againHint: "10 mnt",
    hardHint: "1 hari",
    goodHint: "4 hari",
    easyHint: "7 hari",
    wordPack: "Paket Kosakata",
    words: (count) => `${count} kata`,
    relatedLocation: "Lokasi cerita terkait",
    memoryMetrics: "Metrik daya ingat",
    collected: "Kata terkumpul",
    accuracy: "Akurasi ulasan",
    streak: "Streak aktif",
    newCards: "Baru",
    mastered: "Mahir",
    due: "Jatuh tempo",
    scheduled: "Terjadwal",
    next: "Lanjut",
    finish: "Tuntaskan sesi",
    saveRest: "Simpan & istirahat",
    shortcuts: "Shortcut [1–4: nilai, Spasi: suara]",
    tip: "Tips rahasia Lango si Penjelajah",
    tipBody: (term) =>
      `Gunakan “${term}” dalam kalimatmu sendiri setelah sesi ini. Kata lebih lengket kalau diucapkan keras-keras.`,
    doneTitle: "Sesi brankas tuntas!",
    doneBody: (count) => `Kamu mengulas ${count} kata dan menjaga jejak ingatanmu tetap hangat.`,
    reviewAgain: "Ulangi sesi",
    backToMap: "Kembali ke peta",
    backToResults: "Lihat hasil",
    noCards: "Belum ada kartu kosakata",
    noCardsBody: "Baca satu scene cerita dulu; kata baru otomatis masuk ke brankas.",
    xpNote: "+25 XP saat tuntas",
    stateLabels: { new: "Baru", due: "Jatuh tempo", scheduled: "Terjadwal", mastered: "Mahir" },
    pronunciationError: "Pengenalan suara tidak tersedia. Coba dengarkan lalu ulangi dengan suara keras.",
    audioUnavailable: "Audio tidak tersedia di perangkat ini. Teks tetap bisa dibaca.",
  },
  ja: {
    title: "単語金庫",
    breadcrumb: "単語金庫",
    quickMode: "クイック練習 (+25 XP)",
    progress: (index, total, percent) => `カード ${index} / ${total} (${percent}% 完了)`,
    furigana: "ふりがな",
    romaji: "ローマ字",
    autoAudio: "自動音声",
    pack: "語彙パック",
    openExample: "例文を開く",
    listen: "再生",
    listenHint: "単語をタップするかスペースキーで発音を聞けます。",
    pronunciation: "AI 発音練習",
    pronunciationHint: "話すかマイクをタップして発音を比べましょう。",
    micReady: "マイク準備完了",
    micUnsupported: "このブラウザではマイクを利用できません。",
    rateTitle: "この単語をどのくらい覚えていますか？",
    again: "もう一度",
    hard: "難しい",
    good: "良い",
    easy: "簡単",
    againHint: "10分",
    hardHint: "1日",
    goodHint: "4日",
    easyHint: "7日",
    wordPack: "語彙パック",
    words: (count) => `${count} 語`,
    relatedLocation: "関連する物語の場所",
    memoryMetrics: "記憶メトリクス",
    collected: "金庫の単語",
    accuracy: "復習正答率",
    streak: "連続学習",
    newCards: "新規",
    mastered: "習得",
    due: "期限",
    scheduled: "予定",
    next: "次へ",
    finish: "セッション完了",
    saveRest: "保存して休む",
    shortcuts: "ショートカット [1–4: 評価, Space: 音声]",
    tip: "ランの探検家のヒント",
    tipBody: (term) => `このセッションの後、「${term}」で自分の文を作ってみよう。声に出すと記憶に残ります。`,
    doneTitle: "金庫セッション完了！",
    doneBody: (count) => `${count} 語を復習し、記憶の道を温めました。`,
    reviewAgain: "もう一度",
    backToMap: "マップへ",
    backToResults: "結果を見る",
    noCards: "単語カードがまだありません",
    noCardsBody: "まず物語のシーンを読んでください。新しい単語が自動で金庫に入ります。",
    xpNote: "完了で +25 XP",
    stateLabels: { new: "新規", due: "期限", scheduled: "予定", mastered: "習得" },
    pronunciationError: "音声認識が利用できません。聞いてから声に出してみましょう。",
    audioUnavailable: "この端末では音声を再生できません。テキストは読めます。",
  },
};

function vaultCopy(locale: string): VaultCopy {
  if (locale === "id") return COPY.id;
  if (locale === "ja" || locale === "jp") return COPY.ja;
  return COPY.en;
}

const RATINGS: Array<{ key: VaultRating; tone: string; hintKey: keyof VaultCopy }> = [
  { key: "again", tone: "bg-exp-error/10 text-exp-error border-exp-error/40", hintKey: "againHint" },
  { key: "hard", tone: "bg-exp-secondary-fixed/50 text-exp-secondary border-exp-secondary/40", hintKey: "hardHint" },
  { key: "good", tone: "bg-exp-tertiary-fixed text-exp-on-tertiary-fixed border-exp-tertiary/30", hintKey: "goodHint" },
  { key: "easy", tone: "bg-exp-primary-fixed text-exp-on-primary-container border-exp-primary-container", hintKey: "easyHint" },
];

export function WordVault({
  data,
  lang,
  locale,
}: {
  data: VaultDeck;
  lang: string;
  locale: string;
}) {
  const copy = vaultCopy(locale);
  const { t } = useTranslation();
  const { speak: speakText, cancel: cancelSpeech } = useSpeech();
  const [voiceGender] = useSpeechGender(data.language);
  const speechLocale = toSpeechLocale(data.language);
  const languageLabel =
    CONTENT_LANGUAGE_LABELS[data.language as keyof typeof CONTENT_LANGUAGE_LABELS] ??
    data.language;
  const [index, setIndex] = useState(0);
  const [rated, setRated] = useState<Record<string, VaultRating>>({});
  const [showFurigana, setShowFurigana] = useState(data.language === "ja");
  const [showRomaji, setShowRomaji] = useState(["ja", "zh"].includes(data.language));
  const [autoAudio, setAutoAudio] = useState(true);
  const [showExample, setShowExample] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [earnedXp, setEarnedXp] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const lastSpoken = useRef<string | null>(null);

  const cards = data.cards;
  const card = cards[index] ?? cards[0]!;
  const percent = cards.length === 0 ? 0 : Math.round((Object.keys(rated).length / cards.length) * 100);
  const cjk = data.language === "ja" || data.language === "zh";

  const speak = useCallback(
    (text: string, id: string, rate = 0.9) => {
      if (lastSpoken.current === id && speaking) {
        cancelSpeech();
        setSpeaking(false);
        lastSpoken.current = null;
        return;
      }
      const result = speakText(text, speechLocale, {
        gender: voiceGender,
        rate,
        onEnd: () => setSpeaking(false),
        onError: (reason) => {
          setSpeaking(false);
          lastSpoken.current = null;
          setNotice(
            reason === "no-voice"
              ? t("learning.audio.noVoice", { language: languageLabel })
              : copy.audioUnavailable,
          );
        },
      });
      if (!result.ok) {
        setSpeaking(false);
        lastSpoken.current = null;
        setNotice(
          result.reason === "no-voice"
            ? t("learning.audio.noVoice", { language: languageLabel })
            : copy.audioUnavailable,
        );
        return;
      }
      lastSpoken.current = id;
      setSpeaking(true);
    },
    [
      cancelSpeech,
      copy.audioUnavailable,
      languageLabel,
      speakText,
      speaking,
      speechLocale,
      t,
      voiceGender,
    ],
  );

  useEffect(() => {
    if (!card || !autoAudio) return;
    const timer = window.setTimeout(() => speak(card.term, `auto-${card.conceptKey}`, 0.85), 350);
    return () => window.clearTimeout(timer);
    // Only auto-play when the active card changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card?.conceptKey, autoAudio]);

  const completeSession = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/review/complete", { method: "POST" });
      const payload = await response.json().catch(() => null);
      setEarnedXp(payload?.data?.xpAwarded ?? 0);
    } catch {
      setEarnedXp(null);
    }
  }, []);

  const rate = useCallback(
    async (rating: VaultRating) => {
      if (!card) return;
      setRated((current) => ({ ...current, [card.conceptKey]: rating }));
      setReviewed((value) => value + 1);
      try {
        await fetch("/api/v1/review/rate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conceptKey: card.conceptKey,
            language: data.language,
            rating,
            sourceId: `${card.sceneId}:${card.term}`,
          }),
        });
      } catch {
        setNotice(copy.pronunciationError);
      }
      const next = index + 1;
      if (next >= cards.length) {
        setDone(true);
        void completeSession();
      } else {
        setIndex(next);
        setShowExample(false);
      }
    },
    [card, cards.length, completeSession, copy.pronunciationError, data.language, index],
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!card || done) return;
      if (event.key === " ") {
        event.preventDefault();
        speak(card.term, `manual-${card.conceptKey}`);
        return;
      }
      const map: Record<string, VaultRating> = { "1": "again", "2": "hard", "3": "good", "4": "easy" };
      const rating = map[event.key];
      if (rating) {
        event.preventDefault();
        void rate(rating);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [card, done, rate, speak]);

  const startListening = () => {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
            .SpeechRecognition ??
          (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition
        : undefined;
    if (!SpeechRecognition) {
      setNotice(copy.pronunciationError);
      return;
    }
    setListening(true);
    window.setTimeout(() => {
      setListening(false);
      setNotice(copy.pronunciationHint);
    }, 2200);
  };

  const locationScenes = useMemo(() => {
    if (!card) return data.scenes.slice(0, 2);
    const related = data.scenes.filter((scene) => scene.id === card.sceneId);
    return (related.length > 0 ? related : data.scenes).slice(0, 2);
  }, [card, data.scenes]);

  if (cards.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <div className="exp-card flex flex-col items-center gap-3 p-10 text-center">
          <BookMarked className="h-14 w-14 text-exp-primary" aria-hidden="true" />
          <h1 className="text-xl font-extrabold">{copy.noCards}</h1>
          <p className="max-w-md text-sm text-exp-on-surface-variant">{copy.noCardsBody}</p>
          <Link href={`/${lang}/stories`} className="exp-btn exp-btn-primary mt-2">
            {copy.backToMap}
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      {/* Breadcrumb + quick mode */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-[11px] font-extrabold text-exp-on-surface-variant">
          <Link href={`/${lang}/learn`} className="hover:text-exp-primary">
            {copy.breadcrumb}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-exp-outline" aria-hidden="true" />
          <span className="truncate">
            {copy.progress(index + 1, cards.length, percent)}
          </span>
        </div>
        <span className="exp-pill bg-exp-secondary-fixed text-exp-secondary">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          {copy.quickMode}
        </span>
      </div>

      {/* Header card */}
      <section className="exp-card flex flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-exp-primary-fixed text-exp-primary shadow-sm">
              <BookMarked className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-exp-primary px-2 py-0.5 text-[10px] font-extrabold text-exp-on-primary">
                  {data.levelCode}
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-exp-secondary">
                  {data.levelLabel}
                </span>
              </div>
              <h1 className="mt-0.5 text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">
                {copy.title}: {copy.words(cards.length)}
              </h1>
              <p className="mt-0.5 text-[11px] font-medium leading-5 text-exp-on-surface-variant">
                {data.world.nativeTitle} · {data.levelLabel} ·{" "}
                {copy.progress(index + 1, cards.length, percent)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {cjk && (
              <Toggle active={showFurigana} onClick={() => setShowFurigana((value) => !value)}>
                {copy.furigana}: {showFurigana ? "ON" : "OFF"}
              </Toggle>
            )}
            {cjk && (
              <Toggle active={showRomaji} onClick={() => setShowRomaji((value) => !value)}>
                {copy.romaji}: {showRomaji ? "ON" : "OFF"}
              </Toggle>
            )}
            <Toggle active={autoAudio} onClick={() => setAutoAudio((value) => !value)}>
              <Volume2 className="mr-1 inline h-3 w-3" aria-hidden="true" />
              {copy.autoAudio}: {autoAudio ? "ON" : "OFF"}
            </Toggle>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wide text-exp-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-exp-primary" aria-hidden="true" />
              Ulangan Spaced Repetition (SRS)
            </span>
            <span>{copy.xpNote}</span>
          </div>
          <div className="exp-progress">
            <span style={{ width: `${Math.max(percent, done ? 100 : 0)}%` }} />
          </div>
        </div>
      </section>

      {done ? (
        <section className="exp-card flex flex-col items-center gap-4 p-8 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-exp-primary-fixed text-exp-primary shadow-[0_6px_0_var(--exp-primary-container)]">
            <Check className="h-10 w-10" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold">{copy.doneTitle}</h2>
            <p className="mt-1 text-sm font-medium text-exp-on-surface-variant">
              {copy.doneBody(reviewed)}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="exp-pill bg-exp-secondary-fixed text-exp-secondary">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {earnedXp === null ? "…" : `+${earnedXp}`} XP
            </span>
            <span className="exp-pill bg-exp-container text-exp-on-surface-variant">
              <Brain className="h-4 w-4" aria-hidden="true" />
              {reviewed} {copy.words(reviewed)}
            </span>
            <span className="exp-pill bg-exp-primary-fixed text-exp-on-primary-container">
              <Flame className="h-4 w-4" aria-hidden="true" />
              {data.metrics.streak} {copy.streak}
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDone(false);
                setIndex(0);
                setRated({});
                setReviewed(0);
              }}
              className="exp-btn exp-btn-ghost"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {copy.reviewAgain}
            </button>
            <Link href={`/${lang}/results`} className="exp-btn exp-btn-soft">
              {copy.backToResults}
            </Link>
            <Link href={`/${lang}/learn`} className="exp-btn exp-btn-primary">
              {copy.backToMap}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-8">
            {/* Study card */}
            <section className="relative overflow-hidden rounded-3xl border-2 border-exp-container-high bg-gradient-to-b from-exp-surface-lowest via-exp-surface-lowest to-exp-primary-fixed/25 p-4 shadow-[0_6px_0_var(--exp-container-high)] sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="exp-pill bg-exp-container text-exp-on-surface-variant">
                  <BookMarked className="h-3.5 w-3.5" aria-hidden="true" />
                  {data.levelCode} · {card.pos ?? copy.pack}
                </span>
                <button
                  type="button"
                  onClick={() => setShowExample((value) => !value)}
                  className="rounded-full bg-exp-surface-lowest px-3 py-1.5 text-[10px] font-extrabold text-exp-primary shadow-sm hover:bg-exp-container"
                >
                  {copy.openExample}
                </button>
              </div>

              <div className="mt-4 flex flex-col items-center text-center">
                <button
                  type="button"
                  onClick={() => speak(card.term, `big-${card.conceptKey}`)}
                  className="grid h-16 w-16 place-items-center rounded-full bg-exp-primary text-exp-on-primary shadow-[0_5px_0_var(--exp-primary)] transition-transform active:translate-y-0.5"
                  aria-label={copy.listen}
                >
                  <Volume2 className="h-7 w-7" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => speak(card.term, `word-${card.conceptKey}`)}
                  className="mt-3 rounded-xl px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-exp-primary-container"
                >
                  <span
                    className="block text-4xl font-extrabold tracking-tight sm:text-5xl"
                    lang={data.language === "ja" ? "ja" : undefined}
                  >
                    {card.term}
                  </span>
                </button>
                {(showFurigana && card.reading) || (showRomaji && card.romanization) ? (
                  <p className="mt-1 text-sm font-semibold text-exp-on-surface-variant">
                    {showFurigana && card.reading ? card.reading : ""}
                    {showRomaji && card.romanization ? ` · ${card.romanization}` : ""}
                  </p>
                ) : null}
                <span className="mt-3 rounded-full bg-exp-container px-4 py-1.5 text-sm font-extrabold text-exp-on-primary-container">
                  {card.gloss}
                </span>
              </div>

              {showExample && (
                <div className="mt-4 rounded-2xl border border-exp-container-high bg-exp-surface-lowest p-3 text-left">
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-exp-secondary">
                    {copy.openExample}
                  </p>
                  <p className="mt-1 text-sm font-medium leading-6" lang={data.language === "ja" ? "ja" : undefined}>
                    {card.example}
                  </p>
                </div>
              )}

              {/* Pronunciation panel */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-exp-surface-low p-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <button
                    type="button"
                    onClick={startListening}
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-exp-on-primary shadow-[0_3px_0_var(--exp-primary)] transition-transform active:translate-y-0.5 ${
                      listening ? "animate-pulse bg-exp-tertiary" : "bg-exp-primary"
                    }`}
                    aria-label={copy.pronunciation}
                  >
                    <Mic className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold">{copy.pronunciation}</p>
                    <p className="line-clamp-2 text-[10px] font-medium text-exp-on-surface-variant">
                      {copy.pronunciationHint}
                    </p>
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-exp-surface-lowest px-2.5 py-1 text-[9px] font-extrabold text-exp-primary shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-exp-primary-container" />
                  {copy.micReady}
                </span>
              </div>
            </section>

            {/* Rating */}
            <section className="exp-card flex flex-col gap-3 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-extrabold uppercase tracking-wide text-exp-on-surface-variant">
                  {copy.rateTitle}
                </p>
                <span className="flex items-center gap-1 rounded-full bg-exp-container px-2 py-1 text-[9px] font-extrabold text-exp-on-surface-variant">
                  <Keyboard className="h-3 w-3" aria-hidden="true" />
                  {copy.shortcuts}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {RATINGS.map((rating, ratingIndex) => (
                  <button
                    key={rating.key}
                    type="button"
                    onClick={() => void rate(rating.key)}
                    className={`flex min-h-[64px] flex-col items-center justify-center gap-0.5 rounded-2xl border-2 px-2 py-2 text-center font-extrabold shadow-[0_3px_0_var(--exp-container-high)] transition-transform active:translate-y-0.5 ${rating.tone} ${
                      rated[card.conceptKey] === rating.key ? "ring-2 ring-exp-primary" : ""
                    }`}
                  >
                    <span className="text-[10px] opacity-60">{ratingIndex + 1}</span>
                    <span className="text-sm">{copy[rating.key]}</span>
                    <span className="text-[9px] font-semibold opacity-70">
                      {copy[rating.hintKey] as string}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Tip */}
            <section className="flex items-start gap-3 rounded-2xl bg-gradient-to-r from-exp-primary-fixed/50 to-exp-surface-low p-4 shadow-sm">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-exp-primary-container text-exp-on-primary-container shadow-[0_3px_0_var(--exp-primary)]">
                <Lightbulb className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-exp-secondary">
                  {copy.tip}
                </p>
                <p className="mt-0.5 text-xs font-medium leading-5 text-exp-on-surface-variant">
                  {copy.tipBody(card.term)}
                </p>
              </div>
            </section>
          </div>

          {/* Right rail */}
          <aside className="flex w-full flex-col gap-4 lg:col-span-4">
            <section className="exp-card flex flex-col gap-2.5 p-4">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-extrabold">
                  <BookMarked className="h-4 w-4 text-exp-primary" aria-hidden="true" />
                  {copy.wordPack}
                </h2>
                <span className="exp-pill bg-exp-container text-exp-on-surface-variant">
                  {copy.words(cards.length)}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {cards.map((item, itemIndex) => {
                  const active = itemIndex === index;
                  const state = rated[item.conceptKey] ? "reviewed" : item.state;
                  return (
                    <button
                      key={item.conceptKey}
                      type="button"
                      onClick={() => {
                        setIndex(itemIndex);
                        setShowExample(false);
                      }}
                      className={`flex items-center gap-2 rounded-xl p-2 text-left transition-colors ${
                        active ? "bg-exp-primary-fixed/50 ring-2 ring-exp-primary-container" : "bg-exp-surface-low hover:bg-exp-container"
                      }`}
                    >
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-extrabold ${
                          item.state === "mastered"
                            ? "bg-exp-secondary-container text-exp-on-secondary-container"
                            : "bg-exp-surface-lowest text-exp-on-surface-variant"
                        }`}
                      >
                        {item.state === "mastered" ? <Star className="h-4 w-4" aria-hidden="true" /> : itemIndex + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-extrabold" lang={data.language === "ja" ? "ja" : undefined}>
                          {item.term}
                        </span>
                        <span className="block truncate text-[10px] text-exp-on-surface-variant">
                          {item.reading ? `${item.reading} · ` : ""}
                          {item.gloss}
                        </span>
                      </span>
                      <span className="shrink-0 text-[9px] font-extrabold uppercase text-exp-outline">
                        {copy.stateLabels[state] ?? ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="exp-card overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-4">
                <h2 className="flex items-center gap-2 text-sm font-extrabold">
                  <MapPin className="h-4 w-4 text-exp-secondary" aria-hidden="true" />
                  {copy.relatedLocation}
                </h2>
              </div>
              <div className="mt-2 flex flex-col gap-2 p-3">
                {locationScenes.map((scene) => (
                  <Link
                    key={scene.id}
                    href={`/${lang}/reader/${scene.id}`}
                    className="group relative h-28 overflow-hidden rounded-xl"
                  >
                    <StoryArtwork
                      variantSeed={scene.id}
                      palette={data.world.palette}
                      setting={scene.setting}
                      worldId={data.world.id}
                      overlay={false}
                      className="h-full w-full"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-exp-inverse-surface/85 to-transparent" />
                    <span className="absolute inset-x-3 bottom-2">
                      <span className="block text-[9px] font-extrabold uppercase tracking-wide text-exp-secondary-fixed">
                        {scene.setting}
                      </span>
                      <span className="block truncate text-xs font-extrabold text-exp-on-primary">
                        {scene.title}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="exp-card flex flex-col gap-3 p-4">
              <h2 className="flex items-center gap-2 text-sm font-extrabold">
                <Brain className="h-4 w-4 text-exp-tertiary" aria-hidden="true" />
                {copy.memoryMetrics}
              </h2>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Metric value={data.metrics.collected} label={copy.collected} tone="text-exp-primary" />
                <Metric value={`${data.metrics.accuracy}%`} label={copy.accuracy} tone="text-exp-secondary" />
                <Metric value={`${data.metrics.streak}H`} label={copy.streak} tone="text-exp-tertiary" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full bg-exp-primary-fixed px-2 py-1 text-[9px] font-extrabold text-exp-on-primary-container">
                  {data.metrics.mastered} {copy.mastered}
                </span>
                <span className="rounded-full bg-exp-secondary-fixed px-2 py-1 text-[9px] font-extrabold text-exp-secondary">
                  {data.metrics.due} {copy.due}
                </span>
                <span className="rounded-full bg-exp-container px-2 py-1 text-[9px] font-extrabold text-exp-on-surface-variant">
                  {data.metrics.newToday} {copy.newCards}
                </span>
              </div>
            </section>
          </aside>
        </div>
      )}

      {/* Sticky dock */}
      {!done && (
        <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-exp-surface-lowest/95 p-3 shadow-[0_8px_30px_-12px_rgba(17,28,45,0.35)] backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDone(true);
                if (reviewed > 0) void completeSession();
              }}
              className="exp-btn exp-btn-ghost min-h-9 text-xs"
            >
              <Timer className="h-4 w-4 text-exp-primary" aria-hidden="true" />
              {copy.saveRest}
            </button>
            <span className="hidden items-center gap-1 text-[10px] font-bold text-exp-on-surface-variant sm:flex">
              <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.shortcuts}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void rate("good")}
            className="exp-btn exp-btn-primary min-h-10 w-full text-xs sm:w-auto"
          >
            {copy.next}: {cards[index + 1]?.term ?? copy.finish}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {notice && (
        <div className="fixed inset-x-4 bottom-20 z-50 mx-auto flex max-w-md items-center justify-between gap-2 rounded-2xl border border-exp-container-high bg-exp-surface-lowest p-3 text-xs font-semibold text-exp-on-surface-variant shadow-lg">
          {notice}
          <button type="button" onClick={() => setNotice(null)} className="font-extrabold text-exp-primary">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
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

function Metric({ value, label, tone }: { value: string | number; label: string; tone: string }) {
  return (
    <div className="rounded-xl bg-exp-surface-low px-1 py-2">
      <p className={`text-lg font-extrabold leading-tight ${tone}`}>{value}</p>
      <p className="text-[9px] font-bold leading-3 text-exp-on-surface-variant">{label}</p>
    </div>
  );
}
