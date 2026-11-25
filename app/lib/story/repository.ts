import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import { awardXp, dateKeyInTimezone, touchStreak } from "@/lib/learning/progress";
import {
  getStoryContent,
  nextSceneId,
  previousSceneId,
  type StoryWorldContent,
} from "./content";
import type {
  ArcExport,
  EpisodeExport,
  LocalizedText,
  SceneExport,
  StoryMaterialExport,
} from "../../../scripts/story/types";
import { EPISODE_UNLOCK_RATIO, computeEpisodeStates, type EpisodeStatus } from "./journey";

export interface StoryCatalogWorld {
  id: string;
  languageCode: string;
  title: string;
  nativeTitle: string;
  logline: string;
  setting: string;
  palette: string;
  characters: number;
  arcs: number;
  scenes: number;
  completed: number;
  percent: number;
  nextSceneId: string | null;
}

export interface StoryCatalog {
  language: string;
  world: StoryCatalogWorld | null;
  levels: Array<{ tier: string; label: string; framework: string; arcs: number; scenes: number; completed: number }>;
  continue: { sceneId: string; title: string; episodeTitle: string; worldTitle: string } | null;
  dailyDrop: Array<{ sceneId: string; title: string; episodeTitle: string }>;
}

export interface StoryLineDto {
  id: string;
  order: number;
  speakerId: string | null;
  speakerName: string | null;
  text: string;
  script: string;
  reading: string | null;
  romanization: { scheme: string; value: string } | null;
  translation: LocalizedText;
  tokens: Array<{
    surface: string;
    start: number;
    end: number;
    reading?: string;
    romanization?: string;
    gloss?: LocalizedText;
    pos?: string;
  }> | null;
  audio: { provider: string; voice: string; speed: number; transcript: string } | null;
}

export interface StoryExerciseDto {
  id: string;
  type: string;
  skill: string;
  prompt: string;
  promptSupport: unknown;
  choices: Array<{ id: string; text: string }>;
}

export interface StorySceneDto {
  id: string;
  contentVersion: string;
  languageCode: string;
  level: string;
  tier: string;
  title: string;
  titleRomanization: string | null;
  titleTranslation: LocalizedText;
  setting: string;
  estimatedMinutes: number;
  cliffhanger: string;
  sceneNo: number;
  episode: { id: string; title: string; nativeTitle: string; episodeNo: number; hook: string; recap: string };
  arc: { id: string; title: string; nativeTitle: string; tier: string; levelCode: string; synopsis: string };
  world: { id: string; title: string; nativeTitle: string; palette: string };
  lines: StoryLineDto[];
  cultureNotes: Array<{ id: string; title: string; body: LocalizedText; sources: string[]; reflection: LocalizedText }>;
  materials: Array<{ id: string; type: string; title: string }>;
  exercises: StoryExerciseDto[];
  choices: Array<{ id: string; prompt: string; options: Array<{ id: string; text: string; translation: LocalizedText }> }>;
  progress: { status: string; lastLineId: string | null; minutes: number; completedAt: string | null };
  nextSceneId: string | null;
  previousSceneId: string | null;
}

export interface StoryWorldDetail {
  world: {
    id: string;
    languageCode: string;
    title: string;
    nativeTitle: string;
    logline: string;
    setting: string;
    era: string;
    tone: string;
    palette: string;
    motifs: string[];
    sensitivityNotes: string[];
    characters: StoryWorldContent["world"]["characters"];
    cultureNotes: StoryWorldContent["world"]["cultureNotes"];
  };
  levels: Array<{
    tier: string;
    label: string;
    framework: string;
    levelCode: string;
    arcs: Array<{
      id: string;
      seasonNo: number;
      title: string;
      nativeTitle: string;
      synopsis: string;
      cliffhanger: string;
      episodes: Array<{
        id: string;
        episodeNo: number;
        title: string;
        nativeTitle: string;
        hook: string;
        scenes: number;
        completed: number;
        status: EpisodeStatus;
        firstSceneId: string | null;
        resumeSceneId: string | null;
      }>;
    }>;
  }>;
  completed: number;
  total: number;
  percent: number;
  currentSceneId: string | null;
  startSceneId: string | null;
}

function localized(value: LocalizedText, locale: string): LocalizedText {
  if (locale === "ja" && value.ja) return value;
  return value;
}

/**
 * One progress read per user/language per request. Catalog, world detail, and
 * episode detail are often needed together on the same page; React `cache`
 * makes them share this query instead of each running its own.
 */
const getLanguageProgress = cache(async function getLanguageProgress(
  userId: string,
  language: string,
): Promise<Array<{ sceneId: string; status: string }>> {
  if (!prisma) return [];
  return prisma.storySceneProgress.findMany({
    where: { userId, languageCode: language },
    select: { sceneId: true, status: true },
  });
});

async function completedSceneIds(userId: string, language: string): Promise<Set<string>> {
  const rows = await getLanguageProgress(userId, language);
  return new Set(rows.filter((row) => row.status === "completed").map((row) => row.sceneId));
}

export const getStoryCatalog = cache(async function getStoryCatalog(
  userId: string,
  language: string,
): Promise<StoryCatalog | null> {
  let content: StoryWorldContent;
  try {
    content = getStoryContent(language);
  } catch {
    return null;
  }
  // Both reads are independent; run them in the same round trip window so a
  // page navigation does not pay two sequential database latencies.
  const [completed, progress] = await Promise.all([
    completedSceneIds(userId, language),
    prisma
      ? prisma.storyProgress.findFirst({ where: { userId, languageCode: language, worldId: content.world.id } })
      : Promise.resolve(null),
  ]);
  const sceneOrder = content.sceneOrder;
  const next = sceneOrder.find((sceneId) => !completed.has(sceneId)) ?? null;
  const currentSceneId = progress?.currentSceneId ?? next;
  const current = currentSceneId ? content.scenes.get(currentSceneId) : null;
  const currentEpisode = current
    ? content.episodes.get(content.episodeBySceneId.get(current.id) ?? "") ?? null
    : null;

  const levelRows = content.levels.map((level) => {
    const scenes = level.arcs.flatMap((arc) => arc.episodes.flatMap((episode) => episode.scenes));
    return {
      tier: level.tier,
      label: level.label,
      framework: level.framework,
      arcs: level.arcs.length,
      scenes: scenes.length,
      completed: scenes.filter((scene) => completed.has(scene.id)).length,
    };
  });

  const dropScenes = sceneOrder.filter((sceneId) => !completed.has(sceneId)).slice(0, 3);
  const sceneTitle = (sceneId: string) => {
    const scene = content.scenes.get(sceneId);
    const episode = content.episodes.get(content.episodeBySceneId.get(sceneId) ?? "");
    return {
      sceneId,
      title: scene?.title ?? sceneId,
      episodeTitle: episode?.title ?? "",
    };
  };

  return {
    language,
    world: {
      id: content.world.id,
      languageCode: content.world.languageCode,
      title: content.world.title,
      nativeTitle: content.world.nativeTitle,
      logline: content.world.logline,
      setting: content.world.setting,
      palette: content.world.palette,
      characters: content.world.characters.length,
      arcs: [...content.arcs.values()].length,
      scenes: content.scenes.size,
      completed: completed.size,
      percent: content.scenes.size === 0 ? 0 : Math.round((completed.size / content.scenes.size) * 100),
      nextSceneId: next,
    },
    levels: levelRows,
    continue:
      current && currentEpisode
        ? {
            sceneId: current.id,
            title: current.title,
            episodeTitle: currentEpisode.title,
            worldTitle: content.world.title,
          }
        : null,
    dailyDrop: dropScenes.map(sceneTitle),
  };
});

export const getWorldDetail = cache(async function getWorldDetail(
  userId: string,
  worldId: string,
): Promise<StoryWorldDetail | null> {
  let content: StoryWorldContent;
  try {
    content = getStoryContent(worldId.slice(0, 2));
  } catch {
    return null;
  }
  if (content.world.id !== worldId) return null;
  const [rows, progress] = await Promise.all([
    getLanguageProgress(userId, content.language),
    prisma
      ? prisma.storyProgress.findFirst({ where: { userId, languageCode: content.language, worldId } })
      : Promise.resolve(null),
  ]);
  const completed = new Set(
    rows.filter((row) => row.status === "completed").map((row) => row.sceneId),
  );
  const touched = new Set(rows.map((row) => row.sceneId));
  const states = computeEpisodeStates(
    content,
    completed,
    touched,
    progress?.currentEpisodeId ?? null,
  );
  const levels = content.levels.map((level) => ({
    tier: level.tier,
    label: level.label,
    framework: level.framework,
    levelCode: level.levelCode,
    arcs: level.arcs.map((arc) => ({
      id: arc.id,
      seasonNo: arc.seasonNo,
      title: arc.title,
      nativeTitle: arc.nativeTitle,
      synopsis: arc.synopsis,
      cliffhanger: arc.cliffhanger,
      episodes: arc.episodes.map((episode) => {
        const state = states.get(episode.id);
        const resume =
          episode.scenes.find((scene) => !completed.has(scene.id)) ?? episode.scenes[0] ?? null;
        return {
          id: episode.id,
          episodeNo: episode.episodeNo,
          title: episode.title,
          nativeTitle: episode.nativeTitle,
          hook: episode.hook,
          scenes: episode.scenes.length,
          completed: state?.completed ?? 0,
          status: state?.status ?? ("locked" as EpisodeStatus),
          firstSceneId: episode.scenes[0]?.id ?? null,
          resumeSceneId: resume?.id ?? null,
        };
      }),
    })),
  }));
  return {
    world: {
      ...content.world,
      characters: content.world.characters,
      cultureNotes: content.world.cultureNotes,
    },
    levels,
    completed: completed.size,
    total: content.scenes.size,
    percent: content.scenes.size === 0 ? 0 : Math.round((completed.size / content.scenes.size) * 100),
    currentSceneId:
      progress?.currentSceneId ??
      content.sceneOrder.find((sceneId) => !completed.has(sceneId)) ??
      null,
    startSceneId: content.sceneOrder[0] ?? null,
  };
});

export const getEpisodeDetail = cache(async function getEpisodeDetail(
  userId: string,
  episodeId: string,
): Promise<{
  episode: EpisodeExport;
  arc: ArcExport;
  content: StoryWorldContent;
  scenes: Array<{ id: string; sceneNo: number; title: string; titleTranslation: LocalizedText; minutes: number; completed: boolean; cliffhanger: string }>;
  completed: number;
} | null> {
  const language = episodeId.slice(0, 2);
  let content: StoryWorldContent;
  try {
    content = getStoryContent(language);
  } catch {
    return null;
  }
  const episode = content.episodes.get(episodeId);
  if (!episode) return null;
  const arc = content.arcs.get(episodeId.replace(/-l\d+$/, ""));
  if (!arc) return null;
  const completed = await completedSceneIds(userId, language);
  return {
    episode,
    arc,
    content,
    completed: episode.scenes.filter((scene) => completed.has(scene.id)).length,
    scenes: episode.scenes.map((scene) => ({
      id: scene.id,
      sceneNo: scene.sceneNo,
      title: scene.title,
      titleTranslation: scene.titleTranslation,
      minutes: scene.estimatedMinutes,
      completed: completed.has(scene.id),
      cliffhanger: scene.cliffhanger,
    })),
  };
});

export const getSceneDetail = cache(async function getSceneDetail(
  userId: string,
  sceneId: string,
  explanationLocale: string,
): Promise<StorySceneDto | null> {
  const language = sceneId.slice(0, 2);
  let content: StoryWorldContent;
  try {
    content = getStoryContent(language);
  } catch {
    return null;
  }
  const scene = content.scenes.get(sceneId);
  if (!scene) return null;
  const episodeId = content.episodeBySceneId.get(sceneId);
  const episode = episodeId ? content.episodes.get(episodeId) : undefined;
  const arc = episodeId ? content.arcs.get(episodeId.replace(/-l\d+$/, "")) : undefined;
  if (!episode || !arc) return null;
  const level = content.levels.find((item) => item.tier === arc.tier);
  const progress = prisma
    ? await prisma.storySceneProgress.findUnique({ where: { userId_sceneId: { userId, sceneId } } })
    : null;
  const notes = content.world.cultureNotes.filter((note) => scene.cultureNoteIds.includes(note.id));

  return {
    id: scene.id,
    contentVersion: "2026.11.1",
    languageCode: content.language,
    level: level?.levelCode ?? arc.levelCode,
    tier: arc.tier,
    title: scene.title,
    titleRomanization: scene.titleRomanization ?? null,
    titleTranslation: localized(scene.titleTranslation, explanationLocale),
    setting: scene.setting,
    estimatedMinutes: scene.estimatedMinutes,
    cliffhanger: scene.cliffhanger,
    sceneNo: scene.sceneNo,
    episode: {
      id: episode.id,
      title: episode.title,
      nativeTitle: episode.nativeTitle,
      episodeNo: episode.episodeNo,
      hook: episode.hook,
      recap: episode.recap,
    },
    arc: {
      id: arc.id,
      title: arc.title,
      nativeTitle: arc.nativeTitle,
      tier: arc.tier,
      levelCode: arc.levelCode,
      synopsis: arc.synopsis,
    },
    world: {
      id: content.world.id,
      title: content.world.title,
      nativeTitle: content.world.nativeTitle,
      palette: content.world.palette,
    },
    lines: scene.lines.map((line) => ({
      id: line.id,
      order: line.order,
      speakerId: line.speakerId,
      speakerName: line.speakerName,
      text: line.text,
      script: line.script,
      reading: line.reading ?? null,
      romanization: line.romanization ?? null,
      translation: localized(line.translation, explanationLocale),
      tokens: line.tokens ?? null,
      audio: line.audio ?? null,
    })),
    cultureNotes: notes.map((note) => ({
      id: note.id,
      title: note.title,
      body: localized(note.body, explanationLocale),
      sources: note.sources,
      reflection: localized(note.reflection, explanationLocale),
    })),
    materials: scene.materials.map((material) => ({ id: material.id, type: material.type, title: material.title })),
    exercises: scene.exercises.map((exercise) => ({
      id: exercise.id,
      type: exercise.type,
      skill: exercise.skill,
      prompt: exercise.prompt,
      promptSupport: exercise.promptSupport ?? null,
      choices: (exercise.choices ?? []).map((choice) => ({ id: choice.id, text: choice.text })),
    })),
    choices: scene.choices.map((choice) => ({
      id: choice.id,
      prompt: choice.prompt,
      options: choice.options.map((option) => ({ id: option.id, text: option.text, translation: localized(option.translation, explanationLocale) })),
    })),
    progress: {
      status: progress?.status ?? "not_started",
      lastLineId: progress?.lastLineId ?? null,
      minutes: progress?.minutes ?? 0,
      completedAt: progress?.completedAt?.toISOString() ?? null,
    },
    nextSceneId: nextSceneId(content, sceneId),
    previousSceneId: previousSceneId(content, sceneId),
  };
});

export async function getMaterialDetail(
  userId: string,
  materialId: string,
  explanationLocale: string,
): Promise<{
  id: string;
  type: string;
  title: string;
  body: Record<string, unknown>;
  scene: { id: string; title: string };
  world: { id: string; title: string; nativeTitle: string };
} | null> {
  const language = materialId.slice(0, 2);
  let content: StoryWorldContent;
  try {
    content = getStoryContent(language);
  } catch {
    return null;
  }
  const material = content.materials.get(materialId);
  if (!material) return null;
  const sceneId = material.id.replace(/-m\d+$/, "");
  const scene = content.scenes.get(sceneId);
  if (!scene) return null;
  void userId;
  const body = { ...material.body } as Record<string, unknown>;
  if (Array.isArray(body.exercises)) {
    body.exercises = (body.exercises as Array<Record<string, unknown>>).map((exercise) => {
      const { answerKey: _answerKey, explanation: _explanation, ...safe } = exercise;
      return safe;
    });
  }
  if (body.excerpt && typeof body.excerpt === "object") {
    body.excerpt = localized(body.excerpt as LocalizedText, explanationLocale);
  }
  return {
    id: material.id,
    type: material.type,
    title: material.title,
    body,
    scene: { id: scene.id, title: scene.title },
    world: { id: content.world.id, title: content.world.title, nativeTitle: content.world.nativeTitle },
  };
}

export async function getPassport(userId: string, language: string): Promise<{
  language: string;
  stamps: Array<{ id: string; title: string; body: LocalizedText; sources: string[]; earnedAt: string | null }>;
}> {
  let content: StoryWorldContent;
  try {
    content = getStoryContent(language);
  } catch {
    return { language, stamps: [] };
  }
  const earned = prisma
    ? await prisma.storyPassportStamp.findMany({ where: { userId, languageCode: language } })
    : [];
  const byStamp = new Map(earned.map((row) => [row.stampId, row]));
  return {
    language,
    stamps: content.world.cultureNotes
      .filter((note) => Boolean(note.stampId))
      .map((note) => ({
        id: note.stampId!,
        title: note.title,
        body: note.body,
        sources: note.sources,
        earnedAt: byStamp.get(note.stampId!)?.earnedAt.toISOString() ?? null,
      })),
  };
}

export async function getCharacters(userId: string, worldId: string): Promise<{
  worldId: string;
  characters: Array<{
    id: string;
    name: string;
    nativeName: string;
    role: string;
    age: number | null;
    bio: string;
    speechStyle: string | null;
    quote: string | null;
    affinity: number;
  }>;
}> {
  let content: StoryWorldContent;
  try {
    content = getStoryContent(worldId.slice(0, 2));
  } catch {
    return { worldId, characters: [] };
  }
  const progress = prisma
    ? await prisma.storyProgress.findFirst({ where: { userId, languageCode: content.language, worldId } })
    : null;
  const affinity = (progress?.affinity as Record<string, number> | null) ?? {};
  return {
    worldId,
    characters: content.world.characters.map((character) => ({
      id: character.id,
      name: character.name,
      nativeName: character.nativeName,
      role: character.role,
      age: character.age ?? null,
      bio: character.bio,
      speechStyle: character.speechStyle ?? null,
      quote: character.quote ?? null,
      affinity: affinity[character.id] ?? 0,
    })),
  };
}

export interface ProgressInput {
  userId: string;
  timezone: string;
  sceneId: string;
  clientEventId: string;
  status: "in_progress" | "completed";
  lastLineId?: string | null;
  minutes?: number;
}

export async function saveStoryProgress(input: ProgressInput): Promise<{
  sceneId: string;
  status: string;
  xpEarned: number;
  streakDays: number;
  nextSceneId: string | null;
  passportStamp: { id: string; earned: boolean } | null;
  episode: {
    id: string;
    title: string;
    completed: number;
    total: number;
    complete: boolean;
    unlockThreshold: number;
    remaining: number;
    nextEpisodeId: string | null;
    nextEpisodeTitle: string | null;
    nextEpisodeUnlocked: boolean;
  } | null;
} | null> {
  if (!prisma) return null;
  const found = (() => {
    try {
      return getStoryContent(input.sceneId.slice(0, 2));
    } catch {
      return null;
    }
  })();
  if (!found) return null;
  const scene = found.scenes.get(input.sceneId);
  if (!scene) return null;
  const arcId = scene.id.replace(/-p\d+$/, "");
  const sceneNumber = Number(scene.id.match(/-p(\d+)$/)?.[1] ?? "1");
  const episodeId = `${arcId}-l${String(Math.ceil(sceneNumber / 10)).padStart(2, "0")}`;
  const next = nextSceneId(found, scene.id);
  const minutes = Math.max(0, Math.min(30, Math.round(input.minutes ?? 0)));
  const episode =
    [...found.episodes.values()].find((item) =>
      item.scenes.some((itemScene) => itemScene.id === scene.id),
    ) ?? null;
  const episodeTotal = episode?.scenes.length ?? 0;
  const unlockThreshold = Math.max(1, Math.ceil(episodeTotal * EPISODE_UNLOCK_RATIO));
  const nextEpisode = episode ? findNextEpisodeAfter(found, episode.id) : null;

  return prisma.$transaction(async (tx) => {
    const existing = await tx.storySceneProgress.findUnique({
      where: { userId_sceneId: { userId: input.userId, sceneId: input.sceneId } },
    });
    const wasCompleted = existing?.status === "completed";
    const now = new Date();
    await tx.storySceneProgress.upsert({
      where: { userId_sceneId: { userId: input.userId, sceneId: input.sceneId } },
      update: {
        status: input.status,
        lastLineId: input.lastLineId ?? existing?.lastLineId ?? null,
        minutes: existing?.minutes ?? minutes,
        completedAt: input.status === "completed" ? existing?.completedAt ?? now : existing?.completedAt ?? null,
        worldId: found.world.id,
        languageCode: found.language,
      },
      create: {
        userId: input.userId,
        sceneId: input.sceneId,
        worldId: found.world.id,
        languageCode: found.language,
        status: input.status,
        lastLineId: input.lastLineId ?? null,
        minutes,
        completedAt: input.status === "completed" ? now : null,
      },
    });

    const episodeCompleted = episode
      ? await tx.storySceneProgress.count({
          where: {
            userId: input.userId,
            status: "completed",
            sceneId: { in: episode.scenes.map((item) => item.id) },
          },
        })
      : 0;

    await tx.storyProgress.upsert({
      where: { userId_languageCode_worldId: { userId: input.userId, languageCode: found.language, worldId: found.world.id } },
      update: {
        currentSceneId: input.sceneId,
        currentEpisodeId: episodeId,
        currentArcId: arcId,
      },
      create: {
        userId: input.userId,
        languageCode: found.language,
        worldId: found.world.id,
        currentArcId: arcId,
        currentEpisodeId: episodeId,
        currentSceneId: input.sceneId,
      },
    });

    let xpEarned = 0;
    let streakDays = 0;
    let passportStamp: { id: string; earned: boolean } | null = null;

    if (input.status === "completed" && !wasCompleted) {
      const todayKey = dateKeyInTimezone(now, input.timezone);
      const activityDate = new Date(`${todayKey}T00:00:00.000Z`);
      const xp = await awardXp(tx, {
        userId: input.userId,
        amount: 20,
        sourceType: "story_scene",
        sourceId: input.sceneId,
        idempotencyKey: `story-scene:${input.sceneId}`,
        timezone: input.timezone,
      });
      xpEarned = xp.awarded;
      const streak = await touchStreak(tx, input.userId, input.timezone);
      streakDays = streak.streakCurrent;

      await tx.dailyActivity.upsert({
        where: { userId_date: { userId: input.userId, date: activityDate } },
        update: { minutes: { increment: minutes }, lessonsCompleted: { increment: 1 } },
        create: { userId: input.userId, date: activityDate, minutes, xp: xpEarned, lessonsCompleted: 1 },
      });
      await tx.languageDailyActivity.upsert({
        where: { userId_languageCode_date: { userId: input.userId, languageCode: found.language, date: activityDate } },
        update: { minutes: { increment: minutes }, lessonsCompleted: { increment: 1 } },
        create: { userId: input.userId, languageCode: found.language, date: activityDate, minutes, xp: xpEarned, lessonsCompleted: 1 },
      });
      await tx.userLanguageStats.upsert({
        where: { userId_languageCode: { userId: input.userId, languageCode: found.language } },
        update: { minutesTotal: { increment: minutes }, lessonsCompleted: { increment: 1 }, lastActivityAt: now },
        create: { userId: input.userId, languageCode: found.language, minutesTotal: minutes, lessonsCompleted: 1, lastActivityAt: now },
      });
      await tx.lessonProgress.upsert({
        where: { userId_lessonId: { userId: input.userId, lessonId: episodeId } },
        update: {
          status: "completed",
          completedAt: now,
          contentVersion: "2026.11.1",
          resumeState: { sceneId: input.sceneId, lineId: input.lastLineId ?? null, position: 0, updatedAt: now.toISOString() },
        },
        create: {
          userId: input.userId,
          lessonId: episodeId,
          status: "completed",
          languageCode: found.language,
          contentVersion: "2026.11.1",
          completedAt: now,
          resumeState: { sceneId: input.sceneId, lineId: input.lastLineId ?? null, position: 0, updatedAt: now.toISOString() },
        },
      });

      const stampNote = found.world.cultureNotes.find((note) => scene.cultureNoteIds.includes(note.id) && note.stampId);
      if (stampNote?.stampId) {
        const stamp = await tx.storyPassportStamp.upsert({
          where: { userId_stampId: { userId: input.userId, stampId: stampNote.stampId } },
          update: {},
          create: { userId: input.userId, stampId: stampNote.stampId, languageCode: found.language },
        });
        passportStamp = { id: stamp.stampId, earned: true };
      }
    } else {
      const stats = await tx.userStats.findUnique({ where: { userId: input.userId } });
      streakDays = stats?.streakCurrent ?? 0;
    }

    return {
      sceneId: input.sceneId,
      status: input.status,
      xpEarned,
      streakDays,
      nextSceneId: next,
      passportStamp,
      episode: episode
        ? {
            id: episode.id,
            title: episode.nativeTitle || episode.title,
            completed: episodeCompleted,
            total: episodeTotal,
            complete: episodeTotal > 0 && episodeCompleted >= episodeTotal,
            unlockThreshold,
            remaining: Math.max(0, unlockThreshold - episodeCompleted),
            nextEpisodeId: nextEpisode?.id ?? null,
            nextEpisodeTitle: nextEpisode
              ? nextEpisode.nativeTitle || nextEpisode.title
              : null,
            nextEpisodeUnlocked:
              episodeTotal > 0 &&
              (episodeCompleted >= episodeTotal || episodeCompleted >= unlockThreshold),
          }
        : null,
    };
  });
}

function findNextEpisodeAfter(
  content: StoryWorldContent,
  episodeId: string,
): EpisodeExport | null {
  for (const level of content.levels) {
    const episodes = level.arcs.flatMap((arc) => arc.episodes);
    const index = episodes.findIndex((episode) => episode.id === episodeId);
    if (index >= 0) return episodes[index + 1] ?? null;
  }
  return null;
}

export async function saveStoryChoice(input: {
  userId: string;
  sceneId: string;
  choiceId: string;
  optionId: string;
}): Promise<{ sceneId: string; choiceId: string; optionId: string; affinity: Record<string, number> } | null> {
  if (!prisma) return null;
  let content: StoryWorldContent;
  try {
    content = getStoryContent(input.sceneId.slice(0, 2));
  } catch {
    return null;
  }
  const scene = content.scenes.get(input.sceneId);
  const choice = scene?.choices.find((item) => item.id === input.choiceId);
  const option = choice?.options.find((item) => item.id === input.optionId);
  if (!choice || !option) return null;
  const progress = await prisma.storyProgress.findFirst({
    where: { userId: input.userId, languageCode: content.language, worldId: content.world.id },
  });
  const affinity = { ...((progress?.affinity as Record<string, number> | null) ?? {}) };
  for (const [characterId, delta] of Object.entries(option.affinity ?? {})) {
    affinity[characterId] = (affinity[characterId] ?? 0) + delta;
  }
  const choices = { ...((progress?.choices as Record<string, string> | null) ?? {}), [choice.id]: option.id };
  await prisma.storyProgress.upsert({
    where: { userId_languageCode_worldId: { userId: input.userId, languageCode: content.language, worldId: content.world.id } },
    update: { choices, affinity },
    create: {
      userId: input.userId,
      languageCode: content.language,
      worldId: content.world.id,
      choices,
      affinity,
    },
  });
  return { sceneId: input.sceneId, choiceId: choice.id, optionId: option.id, affinity };
}

export async function flagStoryScene(input: {
  userId: string;
  sceneId: string;
  reason: string;
  note?: string;
}): Promise<{ id: string } | null> {
  if (!prisma) return null;
  const scene = (() => {
    try {
      return getStoryContent(input.sceneId.slice(0, 2)).scenes.get(input.sceneId);
    } catch {
      return null;
    }
  })();
  if (!scene) return null;
  const flag = await prisma.storyFlag.create({
    data: {
      id: crypto.randomUUID(),
      sceneId: input.sceneId,
      userId: input.userId,
      reason: input.reason,
      note: input.note ?? null,
    },
  });
  return { id: flag.id };
}

export function getNextSceneIdFor(sceneId: string): string | null {
  try {
    const content = getStoryContent(sceneId.slice(0, 2));
    return nextSceneId(content, sceneId);
  } catch {
    return null;
  }
}

export type { StoryWorldContent };

export async function submitStoryAttempt(input: {
  userId: string;
  timezone: string;
  sceneId: string;
  exerciseId: string;
  clientAttemptId: string;
  answer: { choiceId?: string; text?: string };
  explanationLocale: string;
  timeSpentMs?: number;
}): Promise<{
  correct: boolean;
  correctAnswer: string;
  explanation: string;
  xpAwarded: number;
  idempotent: boolean;
  stats: { xpTotal: number; level: number; streakCurrent: number };
} | null> {
  if (!prisma) return null;
  let content: StoryWorldContent;
  try {
    content = getStoryContent(input.sceneId.slice(0, 2));
  } catch {
    return null;
  }
  const scene = content.scenes.get(input.sceneId);
  if (!scene) return null;
  const exercise = scene.exercises.find((item) => item.id === input.exerciseId);
  if (!exercise) return null;
  const correctChoiceId = typeof exercise.answerKey.choiceId === "string" ? exercise.answerKey.choiceId : null;
  const chosen = input.answer.choiceId ?? input.answer.text ?? "";
  const correct = correctChoiceId !== null && chosen === correctChoiceId;
  const correctChoice = exercise.choices?.find((choice) => choice.id === correctChoiceId);
  const explanation = localized(exercise.explanation, input.explanationLocale);
  const explanationText = explanation[input.explanationLocale as "id" | "en" | "ja"] ?? explanation.id;
  const episodeId = (() => {
    const arcId = scene.id.replace(/-p\d+$/, "");
    const sceneNumber = Number(scene.id.match(/-p(\d+)$/)?.[1] ?? "1");
    return `${arcId}-l${String(Math.ceil(sceneNumber / 10)).padStart(2, "0")}`;
  })();

  const existing = await prisma.exerciseAttempt.findUnique({
    where: { userId_clientAttemptId: { userId: input.userId, clientAttemptId: input.clientAttemptId } },
  });
  if (existing) {
    const stats = await prisma.userStats.findUnique({ where: { userId: input.userId } });
    return {
      correct: existing.isCorrect,
      correctAnswer: correctChoice?.text ?? "",
      explanation: explanationText,
      xpAwarded: existing.xpAwarded,
      idempotent: true,
      stats: { xpTotal: stats?.xpTotal ?? 0, level: stats?.level ?? 1, streakCurrent: stats?.streakCurrent ?? 0 },
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    const previous = await tx.exerciseAttempt.count({
      where: { userId: input.userId, exerciseId: exercise.id },
    });
    const xp = await awardXp(tx, {
      userId: input.userId,
      amount: correct ? (previous === 0 ? 15 : 10) : 0,
      sourceType: "story_attempt",
      sourceId: exercise.id,
      idempotencyKey: `story-attempt:${input.clientAttemptId}`,
      timezone: input.timezone,
    });
    await tx.exerciseAttempt.create({
      data: {
        clientAttemptId: input.clientAttemptId,
        userId: input.userId,
        exerciseId: exercise.id,
        lessonId: episodeId,
        answer: input.answer as Prisma.InputJsonValue,
        isCorrect: correct,
        score: correct ? 100 : 0,
        timeSpentMs: input.timeSpentMs ?? 0,
        attemptNumber: previous + 1,
        xpAwarded: xp.awarded,
        languageCode: content.language,
        questionType: exercise.type,
        questionVersion: 1,
      },
    });
    const existingProgress = await tx.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: input.userId, lessonId: episodeId } },
    });
    await tx.lessonProgress.upsert({
      where: { userId_lessonId: { userId: input.userId, lessonId: episodeId } },
      update: {
        status: existingProgress?.status === "completed" ? "completed" : "in_progress",
        attemptCount: { increment: 1 },
        lastQuestionId: exercise.id,
      },
      create: {
        userId: input.userId,
        lessonId: episodeId,
        status: "in_progress",
        attemptCount: 1,
        languageCode: content.language,
        lastQuestionId: exercise.id,
      },
    });
    const streak = await touchStreak(tx, input.userId, input.timezone);
    const stats = await tx.userStats.findUnique({ where: { userId: input.userId } });
    return {
      xpAwarded: xp.awarded,
      stats: { xpTotal: stats?.xpTotal ?? 0, level: stats?.level ?? 1, streakCurrent: streak.streakCurrent },
    };
  });

  return {
    correct,
    correctAnswer: correctChoice?.text ?? "",
    explanation: explanationText,
    xpAwarded: result.xpAwarded,
    idempotent: false,
    stats: result.stats,
  };
}
