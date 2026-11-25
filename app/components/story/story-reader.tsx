"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Compass,
  Headphones,
  Lightbulb,
  Lock,
  MapPin,
  Mic,
  Play,
  Sparkles,
  Star,
  Volume2,
  X,
} from "lucide-react";
import type { StorySceneDto } from "@/lib/story/repository";
import type { EpisodeJourney } from "@/lib/story/journey";
import { storyCopy } from "./story-copy";
import { expeditionCopy, fill } from "@/components/expedition/copy";
import { LangoMascot, StoryArtwork, pickArtVariant } from "@/components/expedition/art";
import { CHARACTER_IMAGES, MASCOT_IMAGES, resolveCharacterArt } from "@/components/expedition/story-images";
import { SpeechVoicePicker } from "@/components/shared/speech-voice-picker";
import { useTranslation } from "react-i18next";
import { CONTENT_LANGUAGE_LABELS, toSpeechLocale } from "@/lib/i18n/locales";
import { useSpeech, useSpeechGender } from "@/lib/use-speech";

const HTML_LANGS: Record<string, string> = {
  ja: "ja",
  zh: "zh-Hans",
  ar: "ar",
  hi: "hi",
  ko: "ko",
};

interface AnswerState {
  selected: string;
  correct: boolean;
  correctAnswer: string;
  explanation: string;
  pending: boolean;
}

interface SelectedWord {
  lineId: string;
  surface: string;
  reading?: string;
  romanization?: string;
  gloss?: string;
  pos?: string;
}

export function StoryReader({
  scene,
  locale,
  journey,
}: {
  scene: StorySceneDto;
  locale: string;
  journey: EpisodeJourney;
}) {
  const copy = storyCopy(locale);
  const expCopy = expeditionCopy(locale);
  const { t } = useTranslation();
  const { speak: speakText, cancel: cancelSpeech } = useSpeech();
  const [voiceGender] = useSpeechGender(scene.languageCode);
  const speechLocale = toSpeechLocale(scene.languageCode);
  const languageLabel =
    CONTENT_LANGUAGE_LABELS[scene.languageCode as keyof typeof CONTENT_LANGUAGE_LABELS] ??
    scene.languageCode;
  const isCjk = scene.languageCode === "ja" || scene.languageCode === "zh";
  const [romanization, setRomanization] = useState(isCjk);
  const [furigana, setFurigana] = useState(scene.languageCode === "ja");
  const [translation, setTranslation] = useState(scene.tier === "T1");
  const [focus, setFocus] = useState(false);
  const [large, setLarge] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [activeLine, setActiveLine] = useState(() => {
    const index = scene.progress.lastLineId
      ? scene.lines.findIndex((line) => line.id === scene.progress.lastLineId)
      : 0;
    return index >= 0 ? index : 0;
  });
  const [selected, setSelected] = useState<SelectedWord | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [checkpoint, setCheckpoint] = useState(false);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [choicePicked, setChoicePicked] = useState<string | null>(null);
  const [finished, setFinished] = useState<{
    xp: number;
    streak: number;
    next: string | null;
    episode: {
      id: string;
      title: string;
      completed: number;
      total: number;
      complete: boolean;
      remaining: number;
      nextEpisodeId: string | null;
      nextEpisodeTitle: string | null;
      nextEpisodeUnlocked: boolean;
    } | null;
  } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [savedLines, setSavedLines] = useState<Set<string>>(new Set());
  const startedAt = useRef(0);
  const lastSave = useRef(0);

  const minutes = useCallback(() => {
    if (!startedAt.current) startedAt.current = Date.now();
    return Math.max(1, Math.min(30, Math.round((Date.now() - startedAt.current) / 60000)));
  }, []);

  const saveProgress = useCallback(
    async (status: "in_progress" | "completed", lastLineId: string | null) => {
      try {
        const response = await fetch("/api/v1/story-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sceneId: scene.id,
            clientEventId: crypto.randomUUID(),
            status,
            lastLineId,
            minutes: minutes(),
          }),
        });
        const payload = await response.json().catch(() => null);
        return payload?.data ?? null;
      } catch {
        return null;
      }
    },
    [minutes, scene.id],
  );

  useEffect(() => {
    void saveProgress("in_progress", scene.lines[0]?.id ?? null);
    return () => {
      window.speechSynthesis?.cancel();
    };
    // The scene is immutable for the lifetime of the reader.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  const revealLine = (index: number) => {
    setActiveLine(index);
    const lineId = scene.lines[index]?.id ?? null;
    // eslint-disable-next-line react-hooks/purity -- event handler, not render
    const now = Date.now();
    if (lineId && now - lastSave.current > 5000) {
      lastSave.current = now;
      void saveProgress("in_progress", lineId);
    }
  };

  const firstLineRef = useRef(activeLine);
  useEffect(() => {
    // Only follow line changes the learner makes; the initial render must not
    // yank the page past the episode header and artwork. Comparing against the
    // first rendered line also survives StrictMode's double effect run.
    if (activeLine === firstLineRef.current) return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 639px)").matches) return;
    const node = document.querySelector('[data-active-line="true"]');
    node?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeLine]);

  const speak = (text: string, id: string, speed: number) => {
    if (speakingId === id) {
      cancelSpeech();
      setSpeakingId(null);
      return;
    }
    const result = speakText(text, speechLocale, {
      gender: voiceGender,
      rate: speed,
      onEnd: () => setSpeakingId(null),
      onError: (reason) => {
        setSpeakingId(null);
        setNotice(
          reason === "no-voice"
            ? t("learning.audio.noVoice", { language: languageLabel })
            : "Audio gagal diputar. Teks tetap bisa dibaca.",
        );
      },
    });
    if (!result.ok) {
      setSpeakingId(null);
      setNotice(
        result.reason === "no-voice"
          ? t("learning.audio.noVoice", { language: languageLabel })
          : "Audio gagal diputar. Teks tetap bisa dibaca.",
      );
      return;
    }
    setSpeakingId(id);
  };

  const choose = async (exerciseId: string, choiceId: string) => {
    setAnswers((current) => ({
      ...current,
      [exerciseId]: { selected: choiceId, correct: false, correctAnswer: "", explanation: "", pending: true },
    }));
    try {
      const response = await fetch("/api/v1/story-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneId: scene.id,
          exerciseId,
          clientAttemptId: crypto.randomUUID(),
          answer: { choiceId },
          timeSpentMs: 0,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!payload?.data) throw new Error("no result");
      const data = payload.data as { correct: boolean; correctAnswer: string; explanation: string };
      setAnswers((current) => ({
        ...current,
        [exerciseId]: {
          selected: choiceId,
          correct: data.correct,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation,
          pending: false,
        },
      }));
    } catch {
      setAnswers((current) => ({
        ...current,
        [exerciseId]: {
          selected: choiceId,
          correct: false,
          correctAnswer: "",
          explanation: "Jawaban belum bisa dinilai. Coba lagi.",
          pending: false,
        },
      }));
    }
  };

  const chooseOption = async (choiceId: string, optionId: string) => {
    setChoicePicked(optionId);
    try {
      await fetch("/api/v1/story-choices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneId: scene.id, choiceId, optionId }),
      });
    } catch {
      // A choice is a soft signal; failure should not block reading.
    }
  };

  const finish = async () => {
    const result = await saveProgress("completed", scene.lines.at(-1)?.id ?? null);
    setFinished({
      xp: result?.xpEarned ?? 0,
      streak: result?.streakDays ?? 0,
      next: result?.nextSceneId ?? scene.nextSceneId,
      episode: result?.episode ?? null,
    });
    setCheckpoint(false);
  };

  const addToReview = async (input: {
    conceptKey: string;
    sourceId?: string;
    label: string;
  }) => {
    try {
      await fetch("/api/v1/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptKey: input.conceptKey,
          moduleId: "story",
          sourceType: "story_line",
          sourceId: input.sourceId,
          languageCode: scene.languageCode,
        }),
      });
      setNotice(`${input.label} ${copy.addToReview.toLowerCase()}.`);
    } catch {
      setNotice("Belum bisa menyimpan. Coba lagi.");
    }
  };

  const saveSentence = async () => {
    const line = scene.lines[activeLine];
    if (!line) return;
    await addToReview({
      conceptKey: `story:${scene.languageCode}:line:${line.id}`.slice(0, 200),
      sourceId: line.id,
      label: copy.save,
    });
    setSavedLines((current) => new Set(current).add(line.id));
  };

  const allAnswered = useMemo(
    () =>
      scene.exercises.length > 0 &&
      scene.exercises.every((exercise) => answers[exercise.id] && !answers[exercise.id].pending),
    [answers, scene.exercises],
  );

  const progressPercent =
    scene.lines.length === 0 ? 0 : Math.round(((activeLine + 1) / scene.lines.length) * 100);
  const htmlLang = HTML_LANGS[scene.languageCode] ?? scene.languageCode;
  const showTranslation = !focus && translation;
  const showRomanization = !focus && romanization;
  const active = scene.lines[activeLine];
  const stagePortrait =
    resolveCharacterArt(active?.speakerName) ??
    (scene.languageCode === "ja" ? CHARACTER_IMAGES.aoiAvatar : null);
  const stageName =
    active?.speakerName ?? (scene.languageCode === "ja" ? "Aoi" : "Lango");
  const episodeScenes =
    journey.current && journey.current.id === scene.episode.id ? journey.current.scenes : [];
  const stepTotal = episodeScenes.length || journey.current?.total || 10;
  const stepIndex = Math.max(0, episodeScenes.findIndex((item) => item.id === scene.id));
  const stepNo = episodeScenes.length > 0 ? stepIndex + 1 : scene.sceneNo;
  const stepDone = episodeScenes.filter((item) => item.completed).length;
  const vocab = useMemo(() => {
    const seen = new Map<string, { term: string; reading?: string; romanization?: string; gloss: string; lineId: string }>();
    for (const line of scene.lines) {
      for (const token of line.tokens ?? []) {
        if (!token.gloss || seen.has(token.surface)) continue;
        seen.set(token.surface, {
          term: token.surface,
          reading: token.reading,
          romanization: token.romanization,
          gloss: token.gloss[locale as "id" | "en"] ?? token.gloss.id,
          lineId: line.id,
        });
        if (seen.size >= 6) break;
      }
      if (seen.size >= 6) break;
    }
    return [...seen.values()];
  }, [scene.lines, locale]);

  const cultureNote = scene.cultureNotes[0] ?? null;
  const noteBody = cultureNote
    ? (cultureNote.body[locale as "id" | "en" | "ja"] ??
      cultureNote.body.id ??
      cultureNote.body.en ??
      "")
    : "";
  const grammarMaterial = scene.materials.find((material) => material.type === "grammar");
  const missionTotal = scene.choices.length + scene.exercises.length;
  const missionDone =
    (choicePicked ? 1 : 0) + Object.values(answers).filter((answer) => !answer.pending).length;
  const missionPercent = missionTotal === 0 ? 0 : Math.round((missionDone / missionTotal) * 100);
  const answeredList = Object.values(answers).filter((answer) => !answer.pending);
  const comprehensionPercent =
    answeredList.length === 0
      ? 0
      : Math.round((answeredList.filter((answer) => answer.correct).length / answeredList.length) * 100);

  return (
    <div className="flex flex-col">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        {/* Episode HUD */}
        <div className="exp-card flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <Link
                href={`/${locale}/reader`}
                aria-label={copy.backToEpisode}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-exp-container text-exp-on-surface shadow-[0_3px_0_var(--exp-outline-variant)] transition-transform hover:bg-exp-container-high active:translate-y-0.5"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </Link>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="exp-pill bg-exp-primary/10 text-exp-primary">
                    {scene.arc.nativeTitle} ·{" "}
                    {fill(expCopy.episodeNo, { number: scene.episode.episodeNo })}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-extrabold text-exp-on-surface-variant">
                    <ClockIcon /> {fill(expCopy.minutesLeft, { count: scene.estimatedMinutes })}
                  </span>
                  {journey.current?.status === "completed" && (
                    <span className="flex items-center gap-1 rounded-full bg-exp-primary-fixed px-2 py-0.5 text-[9px] font-extrabold text-exp-on-primary-container">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      {expCopy.completed}
                    </span>
                  )}
                </div>
                <h1 className="mt-1 text-lg font-extrabold leading-tight tracking-tight sm:text-xl">
                  {scene.title}
                </h1>
                <p className="mt-0.5 line-clamp-1 text-[11px] font-semibold text-exp-on-surface-variant">
                  {scene.episode.nativeTitle}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-exp-on-surface-variant">
                  {expCopy.storySteps}{" "}
                  <span className="text-exp-primary">
                    {stepNo} / {stepTotal}
                  </span>
                </span>
                <div className="flex max-w-[280px] flex-wrap justify-end gap-1">
                  {episodeScenes.length === 0 ? (
                    <span className="h-2 w-8 rounded-full bg-exp-container-highest" />
                  ) : (
                    episodeScenes.map((item, index) => (
                      <span
                        key={item.id}
                        title={item.title}
                        className={`h-2 rounded-full transition-all ${
                          item.id === scene.id
                            ? "w-6 bg-exp-primary shadow-[0_0_0_2px_var(--exp-primary-fixed)]"
                            : item.completed
                              ? "w-4 bg-exp-primary-container"
                              : index < stepIndex
                                ? "w-4 bg-exp-primary-container/50"
                                : "w-4 bg-exp-container-highest"
                        }`}
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-exp-surface-low px-2.5 py-1.5 shadow-inner">
                <button
                  type="button"
                  onClick={() => active && speak(active.text, active.id, speed)}
                  aria-label={active && speakingId === active.id ? copy.stop : copy.audio}
                  className="grid h-9 w-9 place-items-center rounded-full bg-exp-primary text-exp-on-primary shadow-[0_3px_0_var(--exp-primary)] active:translate-y-0.5"
                >
                  <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                </button>
                <div className="flex items-end gap-0.5 px-1" aria-hidden="true">
                  {[3, 6, 4, 7, 2, 4].map((height, index) => (
                    <span
                      key={index}
                      className={`w-1 rounded-full ${index < 4 ? "bg-exp-primary-container" : "bg-exp-container-highest"}`}
                      style={{ height: `${height * 2}px` }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSpeed((value) => (value === 1 ? 0.8 : value === 0.8 ? 0.6 : 1))}
                  aria-label={expCopy.audioSpeed}
                  className="rounded-full bg-exp-container-highest px-2.5 py-1 text-[10px] font-extrabold hover:bg-exp-container"
                >
                  {speed.toFixed(1)}x
                </button>
                <button
                  type="button"
                  onClick={() => setTranslation((value) => !value)}
                  aria-pressed={translation}
                  className="flex items-center gap-1 rounded-full bg-exp-tertiary-fixed px-2.5 py-1 text-[10px] font-extrabold text-exp-on-tertiary-fixed"
                >
                  <SubtitlesIcon />
                  {scene.languageCode.toUpperCase()} / {locale.toUpperCase()}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {isCjk && (
              <Toggle active={romanization} onClick={() => setRomanization((value) => !value)}>
                {copy.romanization}
              </Toggle>
            )}
            {scene.languageCode === "ja" && (
              <Toggle active={furigana} onClick={() => setFurigana((value) => !value)}>
                {copy.furigana}
              </Toggle>
            )}
            <Toggle active={translation} onClick={() => setTranslation((value) => !value)}>
              {copy.translation}
            </Toggle>
            <Toggle
              active={focus}
              onClick={() => {
                setFocus((value) => !value);
                if (!focus) {
                  setRomanization(false);
                  setTranslation(false);
                }
              }}
            >
              {copy.focusMode}
            </Toggle>
            <Toggle active={large} onClick={() => setLarge((value) => !value)}>
              Aa
            </Toggle>
            <span className="ml-auto flex items-center gap-1 rounded-full bg-exp-surface-low px-2.5 py-1 text-[10px] font-extrabold text-exp-on-surface-variant">
              <BookOpen className="h-3 w-3 text-exp-primary" aria-hidden="true" />
              {fill(expCopy.partProgress, { done: stepDone, total: stepTotal })}
            </span>
          </div>
          <div className="exp-progress">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
          {/* Story canvas */}
          <div className="flex flex-col gap-4 lg:col-span-8">
            <StoryArtwork
              variant={pickArtVariant(`${scene.id}-${scene.setting}`)}
              palette={scene.world.palette}
              variantSeed={scene.id}
              setting={scene.setting}
              worldId={scene.world.id}
              priority
              className="h-56 w-full rounded-2xl shadow-md sm:h-72"
            >
              <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-exp-inverse-surface/80 px-3 py-1.5 text-[10px] font-extrabold text-exp-inverse-on-surface shadow-sm backdrop-blur">
                    <MapPin className="h-3.5 w-3.5 text-exp-secondary-container" aria-hidden="true" />
                    {scene.setting}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-exp-primary/90 px-2.5 py-1.5 text-[10px] font-extrabold text-exp-on-primary shadow-sm backdrop-blur">
                    <SparkIcon />
                    {expCopy.understanding}: {comprehensionPercent}%
                  </span>
                </div>
                <div className="flex items-end justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-exp-primary-fixed shadow-lg ring-4 ring-exp-surface-lowest">
                      <LangoMascot className="h-10 w-10" image={stagePortrait ?? undefined} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-[16px] font-extrabold text-exp-surface-lowest drop-shadow">
                        {stageName}
                      </h2>
                      <p className="truncate text-[11px] font-semibold text-exp-container-high drop-shadow">
                        {scene.episode.title}
                      </p>
                    </div>
                  </div>
                  <span className="hidden rounded-full bg-exp-secondary-container px-2.5 py-1 text-[10px] font-extrabold text-exp-on-secondary-container sm:block">
                    {fill(expCopy.partProgress, { done: stepDone, total: stepTotal })}
                  </span>
                </div>
              </div>
            </StoryArtwork>

            {/* Scene step rail — keeps the episode's parts one tap away */}
            <div className="exp-card flex items-center gap-2 overflow-x-auto p-2.5 exp-scroll-hide">
              <span className="shrink-0 pl-1 pr-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-exp-outline">
                {expCopy.storySteps}
              </span>
              {episodeScenes.map((item, index) => {
                const isCurrent = item.id === scene.id;
                return (
                  <Link
                    key={item.id}
                    href={`/${locale}/reader/${item.id}`}
                    aria-current={isCurrent ? "page" : undefined}
                    title={item.title}
                    className={`flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2 transition-colors ${
                      isCurrent
                        ? "bg-exp-primary text-exp-on-primary shadow-[0_3px_0_var(--exp-primary)]"
                        : item.completed
                          ? "bg-exp-primary-fixed/50 text-exp-on-primary-container hover:bg-exp-primary-fixed"
                          : "bg-exp-surface-low text-exp-on-surface-variant hover:bg-exp-container"
                    }`}
                  >
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full text-[9px] font-extrabold ${
                        isCurrent
                          ? "bg-exp-on-primary/20"
                          : item.completed
                            ? "bg-exp-primary text-exp-on-primary"
                            : "bg-exp-container-high text-exp-on-surface-variant"
                      }`}
                    >
                      {item.completed && !isCurrent ? (
                        <Check className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="max-w-24 truncate text-[10px] font-extrabold">
                      {item.title}
                    </span>
                  </Link>
                );
              })}
              <Link
                href={`/${locale}/stories/${scene.world.id}/${scene.episode.id}`}
                className="ml-auto flex shrink-0 items-center gap-1 rounded-xl bg-exp-container px-2.5 py-2 text-[10px] font-extrabold text-exp-primary hover:bg-exp-container-high"
              >
                {copy.episodes}
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>

            {/* Dialogue stream */}
            <div className="exp-card flex flex-col gap-4 p-4 sm:p-5">
              {scene.lines.map((line, index) => {
                const isActive = index === activeLine;
                return (
                  <article
                    key={line.id}
                    data-active-line={isActive ? "true" : undefined}
                    onClick={() => revealLine(index)}
                    className={`${
                      isActive ? "flex" : "hidden sm:flex"
                    } cursor-pointer items-start gap-3 rounded-2xl p-2 transition-colors ${
                      isActive ? "bg-exp-surface-low" : "hover:bg-exp-surface-low/60"
                    }`}
                  >
                    <div className="flex w-10 shrink-0 flex-col items-center gap-1">
                      <span
                        className={`grid h-10 w-10 place-items-center overflow-hidden rounded-full text-xs font-extrabold shadow-sm ${
                          isActive ? "bg-exp-primary-fixed" : "bg-exp-container"
                        }`}
                      >
                        {resolveCharacterArt(line.speakerName) ? (
                          <LangoMascot
                            className="h-9 w-9"
                            image={resolveCharacterArt(line.speakerName) ?? undefined}
                          />
                        ) : line.speakerName ? (
                          line.speakerName.slice(0, 1)
                        ) : (
                          <LangoMascot className="h-9 w-9" />
                        )}
                      </span>
                      <span className="max-w-10 truncate text-[9px] font-bold text-exp-on-surface-variant">
                        {line.speakerName ?? "Lango"}
                      </span>
                    </div>

                    <div
                      className={`relative flex-1 rounded-2xl bg-exp-surface-lowest p-3.5 shadow-sm sm:p-4 ${
                        isActive ? "border-2 border-exp-primary-container" : "border border-exp-container-high"
                      }`}
                    >
                      {isActive && (
                        <div className="flex items-center justify-between gap-2 pb-2">
                          <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-exp-primary">
                            <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                            {expCopy.listenTapWord}
                          </span>
                          <span className="text-[9px] font-semibold text-exp-outline">
                            {line.reading ? "Kana" : ""}
                          </span>
                        </div>
                      )}
                      <p
                        lang={htmlLang}
                        dir={scene.languageCode === "ar" ? "rtl" : "ltr"}
                        className={`flex flex-wrap items-center gap-x-1 gap-y-1.5 font-bold leading-relaxed ${
                          large ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
                        }`}
                      >
                        {line.tokens && line.tokens.length > 0
                          ? line.tokens.map((token, tokenIndex) => {
                              const ruby =
                                furigana &&
                                scene.languageCode === "ja" &&
                                token.reading &&
                                /^[\u3400-\u9fff]+$/.test(token.surface);
                              const content = ruby ? (
                                <ruby>
                                  {token.surface}
                                  <rt className="text-[0.5em] font-medium text-exp-outline">{token.reading}</rt>
                                </ruby>
                              ) : (
                                token.surface
                              );
                              if (!token.gloss) {
                                return (
                                  <span
                                    key={`${line.id}-${tokenIndex}`}
                                    className="rounded-md px-0.5 text-exp-on-surface"
                                  >
                                    {content}
                                  </span>
                                );
                              }
                              return (
                                <button
                                  key={`${line.id}-${tokenIndex}`}
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSelected({
                                      lineId: line.id,
                                      surface: token.surface,
                                      reading: token.reading,
                                      romanization: token.romanization,
                                      gloss: token.gloss?.[locale as "id" | "en"] ?? token.gloss?.id,
                                      pos: token.pos,
                                    });
                                  }}
                                  className={`rounded-lg px-1.5 py-0.5 transition-all hover:-translate-y-0.5 hover:bg-exp-primary-fixed hover:text-exp-on-primary-container ${
                                    isActive
                                      ? "bg-exp-container-highest text-exp-on-surface"
                                      : "bg-exp-surface-low text-exp-on-surface-variant"
                                  }`}
                                >
                                  {content}
                                </button>
                              );
                            })
                          : line.text}
                      </p>
                      {showRomanization && line.romanization && (
                        <p className="mt-2 text-[11px] font-medium italic leading-5 text-exp-on-surface-variant" lang="ja-Latn">
                          {line.romanization.value}
                        </p>
                      )}
                      {showTranslation && (
                        <p className="mt-2 flex items-start gap-1.5 border-t border-exp-container-high pt-2 text-xs font-medium leading-5 text-exp-on-surface-variant">
                          <span className="mt-0.5 text-exp-secondary" aria-hidden="true">
                            <TranslateIcon />
                          </span>
                          {line.translation[locale as "id" | "en" | "ja"] ?? line.translation.id}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            speak(line.text, line.id, line.audio?.speed ?? 1);
                          }}
                          className="inline-flex items-center gap-1 rounded-full bg-exp-container px-2.5 py-1 text-[10px] font-bold text-exp-on-surface-variant hover:bg-exp-container-high"
                        >
                          <Volume2 className="h-3 w-3" aria-hidden="true" />
                          {speakingId === line.id ? copy.stop : copy.audio}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setActiveLine(index);
                            void saveSentence();
                          }}
                          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold text-exp-primary hover:bg-exp-primary/10"
                        >
                          <Bookmark className="h-3 w-3" aria-hidden="true" />
                          {savedLines.has(line.id) ? copy.save : expCopy.saveSentence}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Explorer tip */}
            <div className="flex items-start gap-3 rounded-2xl bg-gradient-to-r from-exp-primary-fixed/40 to-exp-surface-low p-4 shadow-sm">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-exp-primary-container shadow-[0_3px_0_var(--exp-primary)]">
                <LangoMascot className="h-11 w-11" image={MASCOT_IMAGES.reader} />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-extrabold text-exp-on-primary-container">
                    {copy.grammar}
                  </h4>
                  {grammarMaterial && (
                    <span className="rounded-full bg-exp-primary px-2 py-0.5 text-[9px] font-extrabold text-exp-on-primary">
                      {grammarMaterial.title.slice(0, 24)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs font-medium leading-5 text-exp-on-surface-variant">
                  {noteBody || expCopy.tipBody}
                </p>
              </div>
            </div>

            {/* Story choices */}
            {scene.choices.length > 0 && (
              <div className="flex flex-col gap-3 rounded-2xl bg-exp-container p-4 shadow-inner sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-[16px] font-extrabold">
                    <Compass className="h-5 w-5 text-exp-secondary" aria-hidden="true" />
                    {expCopy.choosePath}
                  </h3>
                  <span className="rounded-full bg-exp-surface-lowest px-3 py-1 text-[10px] font-bold text-exp-on-surface-variant shadow-sm">
                    {expCopy.choosePathDesc}
                  </span>
                </div>
                {scene.choices.map((choice) => (
                  <div key={choice.id} className="flex flex-col gap-2">
                    <p className="text-sm font-semibold">{choice.prompt}</p>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {choice.options.map((option, optionIndex) => {
                        const picked = choicePicked === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => void chooseOption(choice.id, option.id)}
                            className={`group flex flex-col justify-between gap-2 rounded-xl bg-exp-surface-lowest p-3.5 text-left shadow-[0_4px_0_var(--exp-outline-variant)] transition-all active:translate-y-1 active:shadow-[0_1px_0_var(--exp-outline-variant)] ${
                              picked ? "border-2 border-exp-primary-container" : "hover:border-2 hover:border-exp-primary-container"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-exp-primary text-[10px] font-extrabold text-exp-on-primary">
                                  {String.fromCharCode(65 + optionIndex)}
                                </span>
                                <span className="text-sm font-extrabold leading-5">{option.text}</span>
                              </div>
                              {picked && <Check className="h-4 w-4 text-exp-primary" aria-hidden="true" />}
                            </div>
                            <p className="text-[11px] font-medium leading-5 text-exp-on-surface-variant">
                              {option.translation[locale as "id" | "en"] ?? option.translation.id}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="exp-pill bg-exp-secondary-fixed text-exp-secondary">
                                <HeartIcon /> +10 {expCopy.relationship}
                              </span>
                              <span className="exp-pill bg-exp-tertiary-fixed text-exp-on-tertiary-fixed">
                                +15 XP
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Checkpoint / exercises */}
            {!checkpoint && !finished && (
              <div className="exp-card flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-extrabold">{expCopy.checkpoint}</p>
                  <p className="text-xs text-exp-on-surface-variant">
                    {scene.exercises.length} {copy.choose.toLowerCase()} · {scene.cliffhanger}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckpoint(true)}
                  className="exp-btn exp-btn-primary"
                >
                  {copy.finish}
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}

            {checkpoint && !finished && (
              <section className="exp-card flex flex-col gap-4 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[16px] font-extrabold">{expCopy.checkpoint}</h2>
                  <button
                    type="button"
                    onClick={() => setCheckpoint(false)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-exp-container text-exp-on-surface-variant"
                    aria-label={copy.close}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {scene.exercises.map((exercise, exerciseIndex) => {
                  const answer = answers[exercise.id];
                  return (
                    <div key={exercise.id} className="rounded-2xl border border-exp-container-high p-3.5">
                      <p className="text-[10px] font-extrabold uppercase tracking-wide text-exp-outline">
                        {expCopy.answer} {exerciseIndex + 1}/{scene.exercises.length}
                      </p>
                      <p className="mt-1 text-sm font-bold leading-6" lang={htmlLang}>
                        {exercise.prompt}
                      </p>
                      <div className="mt-2.5 grid gap-2">
                        {exercise.choices.map((choice, choiceIndex) => {
                          const isSelected = answer?.selected === choice.id;
                          const isCorrect =
                            answer &&
                            answer.correct &&
                            (isSelected || choice.text === answer.correctAnswer);
                          const isWrong = answer && !answer.correct && isSelected;
                          return (
                            <button
                              key={choice.id}
                              type="button"
                              disabled={Boolean(answer)}
                              onClick={() => void choose(exercise.id, choice.id)}
                              className={`flex items-center gap-2.5 rounded-xl border-2 p-2.5 text-left text-sm font-semibold transition-colors ${
                                isCorrect
                                  ? "border-exp-primary-container bg-exp-primary-fixed/30"
                                  : isWrong
                                    ? "border-exp-error bg-exp-error/10"
                                    : "border-exp-container-high hover:border-exp-primary-container disabled:opacity-60"
                              }`}
                            >
                              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-exp-container-high text-[10px] font-extrabold">
                                {String.fromCharCode(65 + choiceIndex)}
                              </span>
                              {choice.text}
                            </button>
                          );
                        })}
                      </div>
                      {answer && !answer.pending && (
                        <div
                          className={`mt-2.5 rounded-xl p-3 text-xs ${
                            answer.correct
                              ? "bg-exp-primary-fixed/30 text-exp-on-primary-container"
                              : "bg-exp-error/10 text-exp-error"
                          }`}
                        >
                          <p className="font-extrabold">
                            {answer.correct ? expCopy.correct : expCopy.incorrect}
                          </p>
                          {!answer.correct && answer.correctAnswer && (
                            <p className="mt-1">Jawaban: {answer.correctAnswer}</p>
                          )}
                          {answer.explanation && (
                            <p className="mt-1 text-exp-on-surface-variant">{answer.explanation}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => void finish()}
                  disabled={!allAnswered && scene.exercises.length > 0}
                  className="exp-btn exp-btn-primary w-full"
                >
                  {copy.finish}
                </button>
              </section>
            )}

            {finished && (
              <section className="exp-card flex flex-col gap-0 overflow-hidden p-0">
                <div className="flex flex-col gap-2 bg-gradient-to-br from-exp-primary-fixed/70 via-exp-surface-low to-exp-surface-lowest p-5">
                  <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-exp-primary">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    {finished.episode?.complete
                      ? expCopy.episodeCompleteTitle
                      : expCopy.completedTitle}
                  </span>
                  <h2 className="text-xl font-extrabold leading-tight">
                    {scene.episode.nativeTitle || scene.title}
                  </h2>
                  <p className="text-sm leading-6 text-exp-on-surface-variant">
                    {finished.episode?.complete
                      ? fill(expCopy.episodeCompleteBody, {
                          episode: scene.episode.nativeTitle,
                        })
                      : scene.cliffhanger}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="exp-pill bg-exp-primary-fixed text-exp-on-primary-container">
                      {fill(expCopy.xpEarned, { xp: finished.xp })}
                    </span>
                    <span className="exp-pill bg-exp-container text-exp-on-surface-variant">
                      {fill(expCopy.streakLabel, { count: finished.streak })}
                    </span>
                    {finished.episode && (
                      <span className="exp-pill bg-exp-surface-lowest text-exp-on-surface shadow-sm">
                        {fill(expCopy.partProgress, {
                          done: finished.episode.completed,
                          total: finished.episode.total,
                        })}
                      </span>
                    )}
                  </div>
                  {finished.episode && (
                    <div className="exp-progress mt-1">
                      <span
                        style={{
                          width: `${Math.round(
                            (finished.episode.completed / Math.max(1, finished.episode.total)) * 100,
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                {finished.episode?.nextEpisodeId &&
                  finished.episode.nextEpisodeUnlocked && (
                    <div className="mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-exp-primary-container bg-exp-primary-fixed/30 p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-exp-primary-container shadow-[0_3px_0_var(--exp-primary)]">
                          <CheckCircle2
                            className="h-6 w-6 text-exp-on-primary-container"
                            aria-hidden="true"
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-exp-on-primary-container">
                            {expCopy.episodeUnlocked}
                          </p>
                          <p className="line-clamp-2 text-[11px] font-semibold leading-5 text-exp-on-surface-variant">
                            {fill(expCopy.episodeUnlockedBody, {
                              episode: finished.episode.nextEpisodeTitle ?? "",
                            })}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/${locale}/stories/${scene.world.id}/${finished.episode.nextEpisodeId}`}
                        className="exp-btn exp-btn-primary text-xs"
                      >
                        {expCopy.openNextEpisode}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  )}

                {finished.episode &&
                  !finished.episode.complete &&
                  finished.episode.nextEpisodeId &&
                  !finished.episode.nextEpisodeUnlocked && (
                    <div className="mx-4 mt-4 flex items-start gap-3 rounded-2xl bg-exp-container p-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-exp-surface-lowest text-exp-secondary">
                        <Lock className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-extrabold">{expCopy.episodeLocked}</p>
                        <p className="mt-0.5 text-[11px] font-medium leading-5 text-exp-on-surface-variant">
                          {fill(expCopy.unlockRequirement, {
                            remaining: finished.episode.remaining,
                            episode: scene.episode.nativeTitle,
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                <div className="flex flex-wrap gap-2 p-4">
                  {finished.next && episodeScenes.some((item) => item.id === finished.next) ? (
                    <Link
                      href={`/${locale}/reader/${finished.next}`}
                      className="exp-btn exp-btn-primary"
                    >
                      {expCopy.nextScene}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  ) : finished.episode && !finished.episode.complete ? (
                    <Link
                      href={`/${locale}/stories/${scene.world.id}/${scene.episode.id}`}
                      className="exp-btn exp-btn-primary"
                    >
                      {expCopy.continueEpisode}
                    </Link>
                  ) : null}
                  <Link
                    href={`/${locale}/results/${scene.episode.id}`}
                    className="exp-btn exp-btn-amber"
                  >
                    <Star className="h-4 w-4" aria-hidden="true" />
                    {expCopy.results}
                  </Link>
                  <Link
                    href={`/${locale}/stories/${scene.world.id}/${scene.episode.id}`}
                    className="exp-btn exp-btn-ghost"
                  >
                    {copy.backToEpisode}
                  </Link>
                  <Link href={`/${locale}/stories`} className="exp-btn exp-btn-soft">
                    {expCopy.backToLibrary}
                  </Link>
                </div>
              </section>
            )}

            {/* Bottom dock */}
            <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-exp-container-high bg-exp-surface-lowest/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-8px_30px_-12px_rgba(17,28,45,0.25)] backdrop-blur sm:-mx-0 sm:rounded-2xl sm:border-0 sm:pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => active && speak(active.text, `${active.id}-practice`, 0.8)}
                  className="exp-btn exp-btn-ghost text-xs"
                  aria-label={expCopy.practicePronunciation}
                >
                  <Mic className="h-4 w-4 text-exp-primary" aria-hidden="true" />
                  <span className="hidden sm:inline">{expCopy.practicePronunciation}</span>
                </button>
                <button
                  type="button"
                  onClick={() => void saveSentence()}
                  className="exp-btn exp-btn-soft text-xs"
                >
                  <Bookmark className="h-4 w-4 text-exp-secondary" aria-hidden="true" />
                  <span className="hidden sm:inline">{expCopy.saveSentence}</span>
                </button>
              </div>
              {finished ? (
                finished.next && episodeScenes.some((item) => item.id === finished.next) ? (
                  <Link
                    href={`/${locale}/reader/${finished.next}`}
                    className="exp-btn exp-btn-primary flex-1 justify-center sm:flex-none"
                  >
                    {expCopy.nextScene}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : finished.episode?.nextEpisodeUnlocked && finished.episode.nextEpisodeId ? (
                  <Link
                    href={`/${locale}/stories/${scene.world.id}/${finished.episode.nextEpisodeId}`}
                    className="exp-btn exp-btn-primary flex-1 justify-center sm:flex-none"
                  >
                    {expCopy.nextEpisode}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <Link
                    href={`/${locale}/results/${scene.episode.id}`}
                    className="exp-btn exp-btn-primary flex-1 justify-center sm:flex-none"
                  >
                    {expCopy.results}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (activeLine < scene.lines.length - 1) {
                      revealLine(activeLine + 1);
                    } else {
                      setCheckpoint(true);
                    }
                  }}
                  className="exp-btn exp-btn-primary flex-1 justify-center sm:flex-none"
                >
                  {activeLine < scene.lines.length - 1 ? copy.next : expCopy.finishScene}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Right rail */}
          <aside className="flex w-full flex-col gap-4 lg:col-span-4">
            <div className="exp-card flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-extrabold">
                  <Lightbulb className="h-4 w-4 text-exp-tertiary" aria-hidden="true" />
                  {expCopy.grammarSpotlight}
                </h3>
                <span className="rounded-full bg-exp-tertiary-fixed px-2 py-0.5 text-[9px] font-extrabold text-exp-on-tertiary-fixed">
                  {scene.level}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-exp-tertiary-fixed text-sm font-extrabold text-exp-tertiary">
                  {cultureNote?.title.slice(0, 1) ?? "文"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold">{cultureNote?.title ?? copy.grammar}</p>
                  <p className="mt-1 line-clamp-5 text-xs font-medium leading-5 text-exp-on-surface-variant">
                    {cultureNote?.body?.id ?? cultureNote?.body?.en ?? grammarMaterial?.title ?? expCopy.tipBody}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-exp-surface-low px-3 py-2">
                <span className="text-[10px] font-bold text-exp-on-surface-variant">
                  {expCopy.understanding}
                </span>
                <span className="flex items-center gap-0.5">
                  {[0, 1, 2].map((index) => (
                    <Star
                      key={index}
                      className={`h-3.5 w-3.5 ${
                        index < Math.max(1, Math.ceil((progressPercent / 100) * 3))
                          ? "fill-exp-secondary-container text-exp-secondary-container"
                          : "text-exp-outline-variant"
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </span>
              </div>
            </div>

            <div className="exp-card flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-extrabold">
                  <BookOpen className="h-4 w-4 text-exp-secondary" aria-hidden="true" />
                  {expCopy.wordNotebook}
                </h3>
                <span className="rounded-full bg-exp-container px-2 py-0.5 text-[9px] font-extrabold text-exp-on-surface-variant">
                  {fill(expCopy.savedWords, { count: vocab.length })}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {vocab.length === 0 ? (
                  <p className="text-xs text-exp-on-surface-variant">{expCopy.noVocab}</p>
                ) : (
                  vocab.map((word) => (
                    <div
                      key={word.term}
                      className="flex items-center justify-between gap-2 rounded-xl bg-exp-surface-low p-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-extrabold" lang={htmlLang}>
                          {word.term}{" "}
                          {word.reading && word.reading !== word.term && (
                            <span className="font-medium text-exp-outline">[{word.reading}]</span>
                          )}
                        </p>
                        <p className="truncate text-[10px] text-exp-on-surface-variant">{word.gloss}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => speak(word.term, `vocab-${word.term}`, 0.9)}
                          aria-label={copy.audio}
                          className="grid h-7 w-7 place-items-center rounded-full bg-exp-surface-lowest text-exp-primary shadow-sm"
                        >
                          <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void addToReview({
                              conceptKey: `story:${scene.languageCode}:${word.term}`.slice(0, 200),
                              sourceId: word.lineId,
                              label: word.term,
                            })
                          }
                          aria-label={copy.addToReview}
                          className="grid h-7 w-7 place-items-center rounded-full bg-exp-surface-lowest text-exp-secondary shadow-sm"
                        >
                          <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Link
                href={`/${locale}/vault`}
                className="flex items-center justify-center gap-1 rounded-xl bg-exp-container py-2 text-[10px] font-extrabold text-exp-primary hover:bg-exp-container-high"
              >
                {expCopy.testFlashcards}
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>

            <div className="exp-card flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-extrabold">
                  <Compass className="h-4 w-4 text-exp-primary" aria-hidden="true" />
                  {expCopy.missionProgress}
                </h3>
                <span className="exp-pill bg-exp-primary-fixed text-exp-on-primary-container">
                  {missionDone}/{missionTotal || 1}
                </span>
              </div>
              <div className="exp-progress">
                <span style={{ width: `${missionPercent}%` }} />
              </div>
              <p className="text-[11px] font-medium leading-5 text-exp-on-surface-variant">
                {expCopy.missionDesc}
              </p>
              <div className="rounded-xl bg-exp-secondary-fixed/40 p-2.5 text-[10px] font-semibold leading-4 text-exp-secondary">
                +15 XP · {expCopy.relationship}
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-exp-container p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-exp-primary-container text-exp-on-primary-container">
                <Headphones className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-exp-primary">
                  {expCopy.audioClip}
                </p>
                <p className="text-[10px] text-exp-on-surface-variant">{expCopy.audioSpeed}</p>
              </div>
            </div>

            <SpeechVoicePicker language={scene.languageCode} />
          </aside>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-exp-container-high bg-exp-surface-lowest p-4 shadow-2xl">
          <div className="mx-auto flex w-full max-w-3xl items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-lg font-extrabold" lang={htmlLang}>
                {selected.surface}
              </p>
              {selected.reading && <p className="text-xs text-exp-outline">{selected.reading}</p>}
              {selected.romanization && (
                <p className="text-xs text-exp-outline">{selected.romanization}</p>
              )}
              {selected.gloss && (
                <p className="mt-2 text-sm font-medium text-exp-on-surface-variant">
                  {selected.gloss}
                </p>
              )}
              {selected.pos && (
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-exp-outline">
                  {selected.pos}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  void addToReview({
                    conceptKey: `story:${scene.languageCode}:${selected.surface}`.slice(0, 200),
                    sourceId: selected.lineId,
                    label: selected.surface,
                  });
                  setSelected(null);
                }}
                className="exp-btn exp-btn-primary min-h-9 px-3 text-xs"
              >
                {copy.addToReview}
              </button>
              <button
                type="button"
                onClick={() => speak(selected.surface, `selected-${selected.surface}`, 0.9)}
                className="exp-btn exp-btn-ghost min-h-9 px-3 text-xs"
              >
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                {copy.audio}
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="exp-btn exp-btn-soft min-h-9 px-3 text-xs"
              >
                {copy.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {notice && (
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center justify-between gap-2 rounded-2xl border border-exp-container-high bg-exp-surface-lowest p-3 text-xs font-semibold text-exp-on-surface-variant shadow-lg">
          {notice}
          <button type="button" onClick={() => setNotice(null)} className="font-extrabold text-exp-primary">
            {copy.close}
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
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-8 rounded-full px-3 text-[10px] font-extrabold transition-colors ${
        active
          ? "bg-exp-primary/10 text-exp-primary ring-1 ring-exp-primary-container"
          : "bg-exp-surface-low text-exp-on-surface-variant hover:bg-exp-container"
      }`}
    >
      {children}
    </button>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 4.5V8l2.5 1.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M8 1.5 9.5 6l4.5 1.5L9.5 9 8 13.5 6.5 9 2 7.5 6.5 6Z" fill="currentColor" />
    </svg>
  );
}

function SubtitlesIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
      <rect x="1.5" y="3.5" width="13" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 9.5h3M9 9.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function TranslateIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M2 3h6M5 2v1c0 3-1.5 5-3.5 6M7 3c0 3 1.5 5 3.5 6" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M8.5 13 11 6l2.5 7M9.5 11h3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden="true">
      <path d="M8 13.5S2 10 2 6.2A3.2 3.2 0 0 1 8 4a3.2 3.2 0 0 1 6 2.2C14 10 8 13.5 8 13.5Z" fill="currentColor" />
    </svg>
  );
}
