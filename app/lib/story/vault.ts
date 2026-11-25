import "server-only";
import { prisma } from "@/lib/prisma";
import { getStoryContent, type StoryWorldContent } from "./content";
import type { SceneExport } from "../../../scripts/story/types";
import { vocabFromScenes, type ReportVocab } from "./report";

export type VaultState = "new" | "due" | "scheduled" | "mastered";

export interface VaultCard extends ReportVocab {
  state: VaultState;
  dueAt: string | null;
  intervalDays: number;
  reviewCount: number;
  lapses: number;
  easeFactor: number;
}

export interface VaultDeck {
  language: string;
  levelCode: string;
  levelLabel: string;
  tier: string;
  world: { id: string; title: string; nativeTitle: string; palette: string };
  scenes: Array<{ id: string; title: string; setting: string }>;
  cards: VaultCard[];
  metrics: {
    collected: number;
    due: number;
    mastered: number;
    accuracy: number;
    streak: number;
    newToday: number;
  };
  levels: Array<{ tier: string; label: string; levelCode: string; framework: string }>;
}

function pickLevel(content: StoryWorldContent, tier: string | null, levelCode: string | null) {
  if (tier) {
    const byTier = content.levels.find((level) => level.tier === tier);
    if (byTier) return byTier;
  }
  if (levelCode) {
    const byCode = content.levels.find(
      (level) => level.levelCode.toLowerCase() === levelCode.toLowerCase(),
    );
    if (byCode) return byCode;
  }
  return content.levels[0] ?? null;
}

export async function getVaultDeck(
  userId: string,
  language: string,
  locale: string,
  options: { tier?: string | null; levelCode?: string | null; limit?: number } = {},
): Promise<VaultDeck | null> {
  let content: StoryWorldContent;
  try {
    content = getStoryContent(language);
  } catch {
    return null;
  }
  const level = pickLevel(content, options.tier ?? null, options.levelCode ?? null);
  if (!level) return null;

  const levelSceneIds = new Set(
    level.arcs.flatMap((arc) =>
      arc.episodes.flatMap((episode) => episode.scenes.map((scene) => scene.id)),
    ),
  );

  const completedRows = prisma
    ? await prisma.storySceneProgress.findMany({
        where: { userId, languageCode: language, status: "completed" },
        select: { sceneId: true },
        orderBy: { completedAt: "desc" },
        take: 160,
      })
    : [];

  const sceneIds: string[] = [];
  const seenScenes = new Set<string>();
  for (const row of completedRows) {
    if (levelSceneIds.has(row.sceneId) && !seenScenes.has(row.sceneId)) {
      seenScenes.add(row.sceneId);
      sceneIds.push(row.sceneId);
    }
  }
  // Always seed the vault with the opening episodes of the selected level so a
  // fresh learner still has something to review.
  for (const arc of level.arcs) {
    for (const episode of arc.episodes.slice(0, 3)) {
      for (const scene of episode.scenes) {
        if (!seenScenes.has(scene.id)) {
          seenScenes.add(scene.id);
          sceneIds.push(scene.id);
        }
      }
    }
  }

  const scenes = sceneIds
    .map((sceneId) => content.scenes.get(sceneId))
    .filter((scene): scene is SceneExport => Boolean(scene));

  const vocabRows = vocabFromScenes(scenes, locale, 80);
  const conceptKeys = vocabRows.map((row) => row.conceptKey);
  const items = prisma
    ? await prisma.spacedReviewItem.findMany({
        where: {
          userId,
          conceptKey: { in: conceptKeys },
          moduleId: "story",
        },
      })
    : [];
  const itemByKey = new Map(items.map((item) => [item.conceptKey, item]));

  const now = Date.now();
  const cards: VaultCard[] = vocabRows.map((row) => {
    const item = itemByKey.get(row.conceptKey);
    if (!item) {
      return {
        ...row,
        state: "new",
        dueAt: null,
        intervalDays: 0,
        reviewCount: 0,
        lapses: 0,
        easeFactor: 2.5,
      };
    }
    const due = item.dueAt.getTime() <= now;
    const state: VaultState =
      item.intervalDays >= 7 && item.reviewCount >= 3
        ? "mastered"
        : due
          ? "due"
          : "scheduled";
    return {
      ...row,
      state,
      dueAt: item.dueAt.toISOString(),
      intervalDays: item.intervalDays,
      reviewCount: item.reviewCount,
      lapses: item.lapses,
      easeFactor: item.easeFactor,
    };
  });

  const priority: Record<VaultState, number> = { due: 0, new: 1, scheduled: 2, mastered: 3 };
  cards.sort((a, b) => priority[a.state] - priority[b.state]);
  const limit = Math.max(1, Math.min(30, options.limit ?? 8));

  const due = cards.filter((card) => card.state === "due").length;
  const mastered = cards.filter((card) => card.state === "mastered").length;

  const accuracyRow = prisma
    ? await prisma.exerciseAttempt.aggregate({
        where: { userId, languageCode: language },
        _count: { _all: true },
      })
    : null;
  const correctRow = prisma
    ? await prisma.exerciseAttempt.count({
        where: { userId, languageCode: language, isCorrect: true },
      })
    : 0;
  const stats = prisma
    ? await prisma.userStats.findUnique({ where: { userId }, select: { streakCurrent: true } })
    : null;

  return {
    language,
    levelCode: level.levelCode,
    levelLabel: level.label,
    tier: level.tier,
    world: {
      id: content.world.id,
      title: content.world.title,
      nativeTitle: content.world.nativeTitle,
      palette: content.world.palette,
    },
    scenes: scenes.slice(0, 6).map((scene) => ({
      id: scene.id,
      title: scene.title,
      setting: scene.setting,
    })),
    cards: cards.slice(0, limit),
    metrics: {
      collected: cards.length,
      due,
      mastered,
      accuracy:
        accuracyRow && accuracyRow._count._all > 0
          ? Math.round((correctRow / accuracyRow._count._all) * 100)
          : 0,
      streak: stats?.streakCurrent ?? 0,
      newToday: cards.filter((card) => card.state === "new").length,
    },
    levels: content.levels.map((item) => ({
      tier: item.tier,
      label: item.label,
      levelCode: item.levelCode,
      framework: item.framework,
    })),
  };
}

export type VaultRating = "again" | "hard" | "good" | "easy";

const RATING_LABEL: Record<VaultRating, string> = {
  again: "Ulangi",
  hard: "Sulit",
  good: "Baik",
  easy: "Mudah",
};

export async function rateVaultCard(input: {
  userId: string;
  language: string;
  conceptKey: string;
  rating: VaultRating;
  sourceId?: string | null;
}): Promise<{
  conceptKey: string;
  rating: VaultRating;
  label: string;
  intervalDays: number;
  dueAt: string;
  reviewCount: number;
  easeFactor: number;
} | null> {
  if (!prisma) return null;
  if (!input.conceptKey.startsWith(`story:word:${input.language}:`)) return null;
  const existing = await prisma.spacedReviewItem.findUnique({
    where: { userId_conceptKey: { userId: input.userId, conceptKey: input.conceptKey } },
  });

  const now = new Date();
  const ease = existing?.easeFactor ?? 2.5;
  const interval = existing?.intervalDays ?? 0;
  const lapses = existing?.lapses ?? 0;

  let nextInterval = 1;
  let nextEase = ease;
  let nextLapses = lapses;
  switch (input.rating) {
    case "again":
      nextInterval = 0;
      nextEase = Math.max(1.3, ease - 0.2);
      nextLapses = lapses + 1;
      break;
    case "hard":
      nextInterval = Math.max(1, Math.round(interval * 1.2));
      nextEase = Math.max(1.3, ease - 0.15);
      break;
    case "good":
      nextInterval = Math.max(1, Math.round(interval === 0 ? 1 : interval * ease));
      break;
    case "easy":
      nextInterval = Math.max(2, Math.round((interval === 0 ? 1 : interval) * ease * 1.3));
      nextEase = Math.min(3.2, ease + 0.15);
      break;
  }

  const dueAt =
    input.rating === "again"
      ? new Date(now.getTime() + 10 * 60 * 1000)
      : new Date(now.getTime() + nextInterval * 86_400_000);

  const item = await prisma.spacedReviewItem.upsert({
    where: { userId_conceptKey: { userId: input.userId, conceptKey: input.conceptKey } },
    update: {
      status: "active",
      easeFactor: nextEase,
      intervalDays: nextInterval,
      dueAt,
      lapses: nextLapses,
      reviewCount: (existing?.reviewCount ?? 0) + 1,
      lastReviewedAt: now,
      priority: input.rating === "again" ? "high" : "medium",
      sourceId: input.sourceId ?? existing?.sourceId ?? null,
    },
    create: {
      userId: input.userId,
      conceptKey: input.conceptKey,
      moduleId: "story",
      sourceType: "story_word",
      sourceId: input.sourceId ?? null,
      languageCode: input.language,
      easeFactor: nextEase,
      intervalDays: nextInterval,
      dueAt,
      lapses: nextLapses,
      reviewCount: 1,
      lastReviewedAt: now,
      priority: input.rating === "again" ? "high" : "medium",
    },
  });

  return {
    conceptKey: item.conceptKey,
    rating: input.rating,
    label: RATING_LABEL[input.rating],
    intervalDays: item.intervalDays,
    dueAt: item.dueAt.toISOString(),
    reviewCount: item.reviewCount,
    easeFactor: item.easeFactor,
  };
}
