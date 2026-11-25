import "server-only";
import { prisma } from "@/lib/prisma";
import { dateKeyInTimezone } from "@/lib/learning/progress";
import { getStoryContent } from "./content";
import { getSceneDetail, getStoryCatalog, getWorldDetail } from "./repository";
import type { SessionUser } from "@/lib/auth/session";

export interface ExpeditionHud {
  name: string;
  avatarUrl: string | null;
  streak: number;
  xpTotal: number;
  level: number;
  hearts: number;
  xpToday: number;
  minutesToday: number;
  goalMinutes: number;
  dueReview: number;
}

export interface LeagueRow {
  id: string;
  name: string;
  avatarUrl: string | null;
  xp: number;
  streak: number;
  level: number;
  isMe: boolean;
}

export interface ExpeditionQuest {
  key: "read" | "words" | "xp";
  current: number;
  target: number;
  done: boolean;
  reward: number;
}

export interface QuestNode {
  id: string;
  title: string;
  nativeTitle: string;
  status: "completed" | "active" | "locked";
  stars: number;
  sceneId: string | null;
  scenes: number;
  completed: number;
}

export interface ExpeditionDashboard {
  hud: ExpeditionHud;
  catalog: {
    worldId: string | null;
    worldTitle: string;
    nativeTitle: string;
    logline: string;
    palette: string;
    levelLabel: string;
    levelCode: string;
    completed: number;
    total: number;
    percent: number;
  };
  levels: Array<{ tier: string; label: string; levelCode: string; framework: string; completed: number; scenes: number }>;
  currentNode: {
    sceneId: string | null;
    title: string;
    episodeId: string | null;
    episodeTitle: string;
    nativeTitle: string;
    hook: string;
    arcTitle: string;
    part: number;
    totalParts: number;
    percent: number;
  } | null;
  nodes: QuestNode[];
  starsEarned: number;
  starsTotal: number;
  mission: {
    sceneId: string | null;
    title: string;
    episodeTitle: string;
    hook: string;
    vocabulary: number;
  } | null;
  vocab: Array<{ term: string; reading?: string; romanization?: string; gloss: string }>;
  cultureNote: { title: string; body: string; sources: string[] } | null;
  quests: ExpeditionQuest[];
  league: LeagueRow[];
  readingStats: {
    completed: number;
    inProgress: number;
    notOpened: number;
    sentences: number;
    completedPercent: number;
    level: number;
    range: string;
    topPercent: number;
  };
  currentSceneSetting: string;
  currentWorldId: string | null;
}

export interface PracticeQuestion {
  sceneId: string;
  exerciseId: string;
  skill: string;
  type: string;
  prompt: string;
  choices: Array<{ id: string; text: string }>;
  sceneTitle: string;
  episodeTitle: string;
  context: {
    text: string;
    translation: string;
    romanization: string | null;
  } | null;
}

function localized(
  value: Record<string, string> | undefined,
  locale: string,
): string {
  if (!value) return "";
  return value[locale] ?? value.id ?? value.en ?? Object.values(value)[0] ?? "";
}

export async function getExpeditionHud(
  user: Pick<SessionUser, "id" | "name" | "avatarUrl" | "timezone" | "dailyGoalMinutes">,
): Promise<ExpeditionHud> {
  const fallback: ExpeditionHud = {
    name: user.name,
    avatarUrl: user.avatarUrl,
    streak: 0,
    xpTotal: 0,
    level: 1,
    hearts: 5,
    xpToday: 0,
    minutesToday: 0,
    goalMinutes: user.dailyGoalMinutes ?? 15,
    dueReview: 0,
  };
  if (!prisma) return fallback;

  const todayKey = dateKeyInTimezone(new Date(), user.timezone);
  const today = new Date(`${todayKey}T00:00:00.000Z`);

  const [stats, activity, dueReview] = await Promise.all([
    prisma.userStats.findUnique({ where: { userId: user.id } }),
    prisma.dailyActivity.findUnique({
      where: { userId_date: { userId: user.id, date: today } },
    }),
    prisma.spacedReviewItem.count({
      where: { userId: user.id, status: "active", dueAt: { lte: new Date() } },
    }),
  ]);

  return {
    name: user.name,
    avatarUrl: user.avatarUrl,
    streak: stats?.streakCurrent ?? 0,
    xpTotal: stats?.xpTotal ?? 0,
    level: stats?.level ?? 1,
    hearts: stats?.hearts ?? 5,
    xpToday: activity?.xp ?? 0,
    minutesToday: activity?.minutes ?? 0,
    goalMinutes: user.dailyGoalMinutes ?? 15,
    dueReview,
  };
}

export async function getLearnerLeague(userId: string): Promise<LeagueRow[]> {
  if (!prisma) return [];
  const [rows, me] = await Promise.all([
    prisma.user.findMany({
      where: { role: "learner" },
      orderBy: [{ xpPoints: "desc" }, { createdAt: "asc" }],
      take: 10,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        xpPoints: true,
        streakDays: true,
        level: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, avatarUrl: true, xpPoints: true, streakDays: true, level: true },
    }),
  ]);
  const meRow: LeagueRow | null = me
    ? {
        id: me.id,
        name: me.name,
        avatarUrl: me.avatarUrl,
        xp: me.xpPoints,
        streak: me.streakDays,
        level: me.level,
        isMe: true,
      }
    : null;
  const list = rows.map((row) => ({
    id: row.id,
    name: row.name,
    avatarUrl: row.avatarUrl,
    xp: row.xpPoints,
    streak: row.streakDays,
    level: row.level,
    isMe: row.id === userId,
  }));
  if (meRow && !list.some((row) => row.isMe)) list.push(meRow);
  return list.slice(0, 10);
}

function levelRange(tier: string, framework: string): string {
  if (framework === "JLPT") return `JLPT ${tier.replace("T", "N")}`;
  if (framework === "HSK") return `HSK ${tier.replace("T", "")}`;
  return `CEFR ${tier}`;
}

export async function getExpeditionDashboard(
  user: Pick<
    SessionUser,
    "id" | "name" | "avatarUrl" | "timezone" | "dailyGoalMinutes" | "explanationLocale"
  >,
  language: string,
  tierOverride?: string | null,
): Promise<ExpeditionDashboard> {
  const hud = await getExpeditionHud(user);
  const league = await getLearnerLeague(user.id);
  const catalog = await getStoryCatalog(user.id, language);

  const todayKey = dateKeyInTimezone(new Date(), user.timezone);
  const today = new Date(`${todayKey}T00:00:00.000Z`);
  const [completedToday, reviewAddedToday, inProgressCount] = prisma
    ? await Promise.all([
        prisma.storySceneProgress.count({
          where: { userId: user.id, completedAt: { gte: today } },
        }),
        prisma.spacedReviewItem.count({
          where: { userId: user.id, moduleId: "story", createdAt: { gte: today } },
        }),
        prisma.storySceneProgress.count({
          where: { userId: user.id, status: "in_progress" },
        }),
      ])
    : [0, 0, 0];

  if (!catalog?.world) {
    return {
      hud,
      catalog: {
        worldId: null,
        worldTitle: "",
        nativeTitle: "",
        logline: "",
        palette: "#006c49",
        levelLabel: "",
        levelCode: "",
        completed: 0,
        total: 0,
        percent: 0,
      },
      levels: [],
      currentNode: null,
      nodes: [],
      starsEarned: 0,
      starsTotal: 0,
      mission: null,
      vocab: [],
      cultureNote: null,
      quests: [
        { key: "read", current: 0, target: 1, done: false, reward: 15 },
        { key: "words", current: 0, target: 5, done: false, reward: 20 },
        { key: "xp", current: 0, target: 50, done: false, reward: 15 },
      ],
      league,
      readingStats: {
        completed: 0,
        inProgress: 0,
        notOpened: 0,
        sentences: 0,
        completedPercent: 0,
        level: hud.level,
        range: "",
        topPercent: 0,
      },
      currentSceneSetting: "",
      currentWorldId: null,
    };
  }

  const detail = await getWorldDetail(user.id, catalog.world.id);
  const requestedTier =
    tierOverride && /^T[1-5]$/.test(tierOverride) && detail?.levels.some((item) => item.tier === tierOverride)
      ? tierOverride
      : null;

  let scene = catalog.continue
    ? await getSceneDetail(user.id, catalog.continue.sceneId, user.explanationLocale)
    : null;

  if (requestedTier && detail) {
    const content = getStoryContent(language);
    const levelExport = content.levels.find((item) => item.tier === requestedTier);
    const levelMeta = detail.levels.find((item) => item.tier === requestedTier);
    const arcExport = levelExport?.arcs[0];
    const arcMeta = levelMeta?.arcs.find((item) => item.id === arcExport?.id) ?? levelMeta?.arcs[0];
    const episodeMeta =
      arcMeta?.episodes.find((episode) => episode.completed < episode.scenes) ?? arcMeta?.episodes[0];
    const episodeExport = episodeMeta ? content.episodes.get(episodeMeta.id) : null;
    if (episodeExport) {
      const completedRows = prisma
        ? await prisma.storySceneProgress.findMany({
            where: {
              userId: user.id,
              status: "completed",
              sceneId: { in: episodeExport.scenes.map((item) => item.id) },
            },
            select: { sceneId: true },
          })
        : [];
      const completedScenes = new Set(completedRows.map((row) => row.sceneId));
      const targetScene =
        episodeExport.scenes.find((item) => !completedScenes.has(item.id)) ?? episodeExport.scenes[0];
      if (targetScene) {
        scene = await getSceneDetail(user.id, targetScene.id, user.explanationLocale);
      }
    }
  }

  const levels = detail?.levels ?? [];
  const currentLevelIndex = scene
    ? levels.findIndex((level) => level.tier === scene.tier)
    : 0;
  const level = levels[Math.max(0, currentLevelIndex)] ?? levels[0];
  const arc = level?.arcs.find((item) =>
    scene ? item.episodes.some((episode) => episode.id === scene.episode.id) : false,
  ) ?? level?.arcs[0];
  const episodes = arc?.episodes ?? [];
  const currentIndex = scene
    ? episodes.findIndex((episode) => episode.id === scene.episode.id)
    : 0;

  const windowStart = Math.max(0, Math.min(currentIndex - 2, Math.max(0, episodes.length - 5)));
  const nodes: QuestNode[] = episodes.slice(windowStart, windowStart + 5).map((episode) => {
    const active = scene?.episode.id === episode.id;
    const complete = episode.completed >= episode.scenes && episode.scenes > 0;
    const beforeCurrent = episodes.findIndex((item) => item.id === episode.id) < currentIndex;
    const status = complete ? "completed" : active ? "active" : beforeCurrent ? "completed" : "locked";
    return {
      id: episode.id,
      title: episode.title,
      nativeTitle: episode.nativeTitle,
      status,
      stars: complete ? 3 : active ? 1 : 0,
      sceneId: active ? scene?.id ?? null : null,
      scenes: episode.scenes,
      completed: episode.completed,
    };
  });

  const arcCompleted = episodes.reduce((total, episode) => total + episode.completed, 0);
  const arcScenes = episodes.reduce((total, episode) => total + episode.scenes, 0);
  const vocabSeen: Array<{ term: string; reading?: string; romanization?: string; gloss: string }> = [];
  const vocabKeys = new Set<string>();
  for (const line of scene?.lines ?? []) {
    for (const token of line.tokens ?? []) {
      if (!token.gloss || !token.gloss.id || vocabKeys.has(token.surface)) continue;
      vocabKeys.add(token.surface);
      vocabSeen.push({
        term: token.surface,
        reading: token.reading,
        romanization: token.romanization,
        gloss: localized(token.gloss as unknown as Record<string, string>, user.explanationLocale),
      });
      if (vocabSeen.length >= 8) break;
    }
    if (vocabSeen.length >= 8) break;
  }

  const note = scene?.cultureNotes[0] ?? detail?.world.cultureNotes[0] ?? null;
  const totalScenes = catalog.world.scenes;
  const completedScenes = catalog.world.completed;
  const sentences = scene?.lines.length ?? 0;

  return {
    hud,
    catalog: {
      worldId: catalog.world.id,
      worldTitle: catalog.world.title,
      nativeTitle: catalog.world.nativeTitle,
      logline: catalog.world.logline,
      palette: catalog.world.palette,
      levelLabel: level?.label ?? "",
      levelCode: level?.levelCode ?? "",
      completed: completedScenes,
      total: totalScenes,
      percent: catalog.world.percent,
    },
    levels: levels.map((item) => ({
      tier: item.tier,
      label: item.label,
      levelCode: item.levelCode,
      framework: item.framework,
      completed: item.arcs.reduce(
        (total, itemArc) =>
          total + itemArc.episodes.reduce((sum, episode) => sum + episode.completed, 0),
        0,
      ),
      scenes: item.arcs.reduce(
        (total, itemArc) =>
          total + itemArc.episodes.reduce((sum, episode) => sum + episode.scenes, 0),
        0,
      ),
    })),
    currentNode: scene
      ? {
          sceneId: scene.id,
          title: scene.title,
          episodeId: scene.episode.id,
          episodeTitle: scene.episode.title,
          nativeTitle: scene.episode.nativeTitle,
          hook: scene.episode.hook,
          arcTitle: arc?.title ?? scene.arc.title,
          part: scene.sceneNo,
          totalParts: 10,
          percent: arcScenes > 0 ? Math.round((arcCompleted / arcScenes) * 100) : 0,
        }
      : null,
    nodes,
    starsEarned: episodes.filter((episode) => episode.completed >= episode.scenes).length * 3,
    starsTotal: episodes.length * 3,
    mission: scene
      ? {
          sceneId: scene.id,
          title: scene.episode.nativeTitle,
          episodeTitle: scene.episode.title,
          hook: scene.episode.hook,
          vocabulary: vocabSeen.length,
        }
      : null,
    vocab: vocabSeen.slice(0, 5),
    cultureNote: note
      ? {
          title: note.title,
          body: localized(note.body as unknown as Record<string, string>, user.explanationLocale),
          sources: note.sources ?? [],
        }
      : null,
    quests: [
      { key: "read", current: Math.min(1, completedToday), target: 1, done: completedToday > 0, reward: 15 },
      { key: "words", current: Math.min(5, reviewAddedToday), target: 5, done: reviewAddedToday >= 5, reward: 20 },
      { key: "xp", current: Math.min(50, hud.xpToday), target: 50, done: hud.xpToday >= 50, reward: 15 },
    ],
    league,
    readingStats: {
      completed: completedScenes,
      inProgress: inProgressCount,
      notOpened: Math.max(0, totalScenes - completedScenes - inProgressCount),
      sentences,
      completedPercent: catalog.world.percent,
      level: level?.levelCode ? Number(level.levelCode.replace(/\D/g, "")) || hud.level : hud.level,
      range: level?.label ?? levelRange(level?.tier ?? "T1", level?.framework ?? "CEFR"),
      topPercent: Math.max(5, Math.min(99, 100 - Math.min(95, Math.round(catalog.world.percent * 0.9)))),
    },
    currentSceneSetting: scene?.setting ?? detail?.world.setting ?? "",
    currentWorldId: catalog.world.id,
  };
}

export async function getPracticeSet(
  user: Pick<SessionUser, "id" | "explanationLocale">,
  language: string,
  limit = 8,
): Promise<PracticeQuestion[]> {
  let content;
  try {
    content = getStoryContent(language);
  } catch {
    return [];
  }
  const completed = prisma
    ? new Set(
        (
          await prisma.storySceneProgress.findMany({
            where: { userId: user.id, languageCode: language, status: "completed" },
            select: { sceneId: true },
          })
        ).map((row) => row.sceneId),
      )
    : new Set<string>();

  const start = content.sceneOrder.findIndex((sceneId) => !completed.has(sceneId));
  const ordered = [
    ...content.sceneOrder.slice(Math.max(0, start)),
    ...content.sceneOrder.slice(0, Math.max(0, start)),
  ];

  const questions: PracticeQuestion[] = [];
  for (const sceneId of ordered) {
    if (questions.length >= limit) break;
    const scene = content.scenes.get(sceneId);
    if (!scene) continue;
    const arcId = scene.id.replace(/-p\d+$/, "");
    const sceneNumber = Number(scene.id.match(/-p(\d+)$/)?.[1] ?? "1");
    const episodeId = `${arcId}-l${String(Math.ceil(sceneNumber / 10)).padStart(2, "0")}`;
    const episode = content.episodes.get(episodeId);
    const firstLine = scene.lines[0];
    for (const exercise of scene.exercises) {
      if (questions.length >= limit) break;
      if (!exercise.choices || exercise.choices.length < 2) continue;
      const choices = exercise.choices.map((choice) => ({ id: choice.id, text: choice.text }));
      questions.push({
        sceneId: scene.id,
        exerciseId: exercise.id,
        skill: exercise.skill,
        type: exercise.type,
        prompt: exercise.prompt,
        choices,
        sceneTitle: scene.title,
        episodeTitle: episode?.nativeTitle ?? scene.title,
        context: firstLine
          ? {
              text: firstLine.text,
              translation: localized(
                firstLine.translation as unknown as Record<string, string>,
                user.explanationLocale,
              ),
              romanization: firstLine.romanization?.value ?? null,
            }
          : null,
      });
    }
  }
  return questions;
}
