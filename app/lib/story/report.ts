import "server-only";
import { prisma } from "@/lib/prisma";
import { getStoryContent, type StoryWorldContent } from "./content";
import type {
  ArcExport,
  EpisodeExport,
  LevelExport,
  LocalizedText,
  SceneExport,
  VocabularyItem,
} from "../../../scripts/story/types";

export interface ReportSkill {
  skill: string;
  correct: number;
  total: number;
  percent: number;
}

export interface ReportStar {
  key: "vocabulary" | "grammar" | "comprehension";
  label: string;
  detail: string;
  value: number;
  percent: number;
}

export interface ReportVocab {
  conceptKey: string;
  term: string;
  reading: string | null;
  romanization: string | null;
  gloss: string;
  example: string;
  lineId: string;
  sceneId: string;
  sceneTitle: string;
  pos: string | null;
}

export interface EpisodeReport {
  episodeId: string;
  worldId: string;
  language: string;
  palette: string;
  framework: string;
  tier: string;
  levelCode: string;
  levelLabel: string;
  arc: { id: string; title: string; nativeTitle: string; seasonNo: number };
  episode: {
    id: string;
    title: string;
    nativeTitle: string;
    episodeNo: number;
    hook: string;
    recap: string;
    cliffhanger: string;
  };
  scenes: Array<{
    id: string;
    sceneNo: number;
    title: string;
    minutes: number;
    completed: boolean;
    minutesSpent: number;
    completedAt: string | null;
  }>;
  completed: number;
  total: number;
  percent: number;
  isComplete: boolean;
  correct: number;
  answered: number;
  accuracy: number;
  questionsTotal: number;
  xp: number;
  minutes: number;
  streak: number;
  minutesLabel: string;
  completedAt: string | null;
  skills: ReportSkill[];
  stars: ReportStar[];
  starTotal: number;
  vocab: ReportVocab[];
  nextEpisodeId: string | null;
  nextEpisodeTitle: string | null;
  nextSceneId: string | null;
  previousEpisodeId: string | null;
}

export interface EpisodeSummary {
  episodeId: string;
  worldId: string;
  title: string;
  nativeTitle: string;
  episodeNo: number;
  arcTitle: string;
  levelCode: string;
  levelLabel: string;
  framework: string;
  tier: string;
  palette: string;
  completed: number;
  total: number;
  percent: number;
  accuracy: number;
  xp: number;
  minutes: number;
  starTotal: number;
  completedAt: string | null;
}

export interface ResultsOverview {
  language: string;
  world: { id: string; title: string; nativeTitle: string; palette: string };
  levels: Array<{ tier: string; label: string; levelCode: string; framework: string }>;
  episodes: EpisodeSummary[];
  totals: {
    episodesCompleted: number;
    scenesCompleted: number;
    accuracy: number;
    xp: number;
    minutes: number;
    stars: number;
    starTotal: number;
  };
}

function localize(value: LocalizedText | undefined, locale: string): string {
  if (!value) return "";
  const record = value as unknown as Record<string, string>;
  return record[locale] ?? record.id ?? record.en ?? Object.values(record)[0] ?? "";
}

export function episodeIdFromSceneId(sceneId: string): string {
  const arcId = sceneId.replace(/-p\d+$/, "");
  const sceneNumber = Number(sceneId.match(/-p(\d+)$/)?.[1] ?? "1");
  return `${arcId}-l${String(Math.ceil(sceneNumber / 10)).padStart(2, "0")}`;
}

function findLevel(
  content: StoryWorldContent,
  episodeId: string,
): { level: LevelExport; arc: ArcExport; episode: EpisodeExport } | null {
  for (const level of content.levels) {
    for (const arc of level.arcs) {
      const episode = arc.episodes.find((item) => item.id === episodeId);
      if (episode) return { level, arc, episode };
    }
  }
  return null;
}

function nextEpisode(
  content: StoryWorldContent,
  episodeId: string,
): { id: string; title: string; nativeTitle: string } | null {
  const all = content.levels.flatMap((level) =>
    level.arcs.flatMap((arc) =>
      arc.episodes.map((episode) => ({
        id: episode.id,
        title: episode.title,
        nativeTitle: episode.nativeTitle,
      })),
    ),
  );
  const index = all.findIndex((item) => item.id === episodeId);
  if (index < 0 || index + 1 >= all.length) return null;
  return all[index + 1];
}

function previousEpisodeId(content: StoryWorldContent, episodeId: string): string | null {
  const all = content.levels.flatMap((level) =>
    level.arcs.flatMap((arc) => arc.episodes.map((episode) => episode.id)),
  );
  const index = all.indexOf(episodeId);
  return index > 0 ? all[index - 1] : null;
}

export function vocabFromScenes(
  scenes: SceneExport[],
  locale: string,
  limit = 12,
): ReportVocab[] {
  const seen = new Set<string>();
  const rows: ReportVocab[] = [];
  for (const scene of scenes) {
    const tokens = new Map<string, { reading?: string; romanization?: string; pos?: string }>();
    for (const line of scene.lines) {
      for (const token of line.tokens ?? []) {
        if (!tokens.has(token.surface)) {
          tokens.set(token.surface, {
            reading: token.reading,
            romanization: token.romanization,
            pos: token.pos,
          });
        }
      }
    }
    for (const material of scene.materials) {
      if (material.type !== "vocabulary") continue;
      const items = (material.body.items ?? []) as VocabularyItem[];
      for (const item of items) {
        const key = `${scene.id}:${item.term}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const token = tokens.get(item.term);
        rows.push({
          conceptKey: `story:word:${scene.id.slice(0, 2)}:${scene.id}:${item.term}`.slice(0, 200),
          term: item.term,
          reading: item.reading ?? token?.reading ?? null,
          romanization: item.romanization ?? token?.romanization ?? null,
          gloss: localize(item.gloss, locale),
          example: item.example,
          lineId: item.lineId,
          sceneId: scene.id,
          sceneTitle: scene.title,
          pos: item.pos ?? token?.pos ?? null,
        });
        if (rows.length >= limit) return rows;
      }
    }
  }
  return rows;
}

function latestAttempts<T extends { exerciseId: string; createdAt: Date; isCorrect: boolean; xpAwarded: number; timeSpentMs: number }>(
  rows: T[],
): T[] {
  const latest = new Map<string, T>();
  for (const row of rows) {
    const existing = latest.get(row.exerciseId);
    if (!existing || row.createdAt > existing.createdAt) latest.set(row.exerciseId, row);
  }
  return [...latest.values()];
}

function starValue(percent: number): number {
  if (percent >= 90) return 3;
  if (percent >= 70) return 2;
  if (percent >= 40) return 1;
  return 0;
}

function minutesLabel(minutes: number): string {
  if (minutes <= 0) return "0m";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}j ${rest}m` : `${hours}j`;
}

export async function getEpisodeReport(
  userId: string,
  timezone: string,
  episodeId: string,
  locale: string,
): Promise<EpisodeReport | null> {
  let content: StoryWorldContent;
  try {
    content = getStoryContent(episodeId.slice(0, 2));
  } catch {
    return null;
  }
  const found = findLevel(content, episodeId);
  if (!found) return null;
  const { level, arc, episode } = found;
  const sceneIds = episode.scenes.map((scene) => scene.id);
  const exerciseById = new Map(
    episode.scenes.flatMap((scene) => scene.exercises.map((exercise) => [exercise.id, exercise] as const)),
  );
  const exerciseIds = [...exerciseById.keys()];

  const [progressRows, attemptRows, xpRows, stats] = prisma
    ? await Promise.all([
        prisma.storySceneProgress.findMany({ where: { userId, sceneId: { in: sceneIds } } }),
        prisma.exerciseAttempt.findMany({
          where: { userId, lessonId: episodeId, exerciseId: { in: exerciseIds } },
          orderBy: { createdAt: "desc" },
        }),
        prisma.xpEvent.findMany({
          where: {
            userId,
            OR: [
              { sourceType: "story_scene", sourceId: { in: sceneIds } },
              { sourceType: "story_attempt", sourceId: { in: exerciseIds } },
            ],
          },
          select: { amount: true },
        }),
        prisma.userStats.findUnique({ where: { userId }, select: { streakCurrent: true } }),
      ])
    : [[], [], [], null];

  const progressByScene = new Map(progressRows.map((row) => [row.sceneId, row]));
  const scenes = episode.scenes.map((scene) => {
    const row = progressByScene.get(scene.id);
    return {
      id: scene.id,
      sceneNo: scene.sceneNo,
      title: scene.title,
      minutes: scene.estimatedMinutes,
      completed: row?.status === "completed",
      minutesSpent: row?.minutes ?? 0,
      completedAt: row?.completedAt?.toISOString() ?? null,
    };
  });
  const completed = scenes.filter((scene) => scene.completed).length;
  const percent = scenes.length === 0 ? 0 : Math.round((completed / scenes.length) * 100);
  const isComplete = completed === scenes.length && scenes.length > 0;

  const latest = latestAttempts(attemptRows);
  const answered = latest.length;
  const correct = latest.filter((row) => row.isCorrect).length;
  const accuracy = answered === 0 ? 0 : Math.round((correct / answered) * 100);

  const skillBuckets = new Map<string, { correct: number; total: number }>();
  for (const row of latest) {
    const exercise = exerciseById.get(row.exerciseId);
    const skill = exercise?.skill ?? "comprehension";
    const bucket = skillBuckets.get(skill) ?? { correct: 0, total: 0 };
    bucket.total += 1;
    if (row.isCorrect) bucket.correct += 1;
    skillBuckets.set(skill, bucket);
  }

  const skills: ReportSkill[] = [...skillBuckets.entries()].map(([skill, bucket]) => ({
    skill,
    correct: bucket.correct,
    total: bucket.total,
    percent: bucket.total === 0 ? 0 : Math.round((bucket.correct / bucket.total) * 100),
  }));

  const vocabSkill = skills.find((skill) => skill.skill === "vocabulary");
  const grammarSkill = skills.find((skill) => skill.skill === "grammar");
  const comprehensionSkills = skills.filter(
    (skill) => skill.skill !== "vocabulary" && skill.skill !== "grammar",
  );
  const comprehensionTotal = comprehensionSkills.reduce(
    (acc, skill) => ({ correct: acc.correct + skill.correct, total: acc.total + skill.total }),
    { correct: 0, total: 0 },
  );
  const comprehensionPercent =
    comprehensionTotal.total === 0
      ? accuracy
      : Math.round((comprehensionTotal.correct / comprehensionTotal.total) * 100);

  const vocabRows = vocabFromScenes(episode.scenes, locale, 12);
  const vocabularyPercent = vocabSkill?.percent ?? accuracy;
  const grammarPercent = grammarSkill?.percent ?? accuracy;

  const stars: ReportStar[] = [
    {
      key: "vocabulary",
      label: "Kosakata",
      detail:
        vocabRows.length > 0
          ? `${vocabRows.length} kata kunci dari bab ini`
          : "Belum ada kosakata yang tercatat",
      value: starValue(vocabularyPercent),
      percent: vocabularyPercent,
    },
    {
      key: "grammar",
      label: "Tata bahasa",
      detail:
        episode.scenes[0]?.beat.languageFocus ?? "Pola bahasa utama bab ini",
      value: starValue(grammarPercent),
      percent: grammarPercent,
    },
    {
      key: "comprehension",
      label: "Pemahaman",
      detail:
        comprehensionTotal.total > 0
          ? `Akurasi ${comprehensionPercent}% dari ${comprehensionTotal.total} soal pemahaman`
          : `Akurasi ${accuracy}% dari ${answered} soal`,
      value: starValue(comprehensionPercent),
      percent: comprehensionPercent,
    },
  ];

  const minutes = progressRows.reduce((sum, row) => sum + (row.minutes ?? 0), 0);
  const xp = xpRows.reduce((sum, row) => sum + row.amount, 0);
  const next = nextEpisode(content, episodeId);
  const firstIncomplete = scenes.find((scene) => !scene.completed);

  return {
    episodeId,
    worldId: content.world.id,
    language: content.language,
    palette: content.world.palette,
    framework: level.framework,
    tier: level.tier,
    levelCode: level.levelCode,
    levelLabel: level.label,
    arc: {
      id: arc.id,
      title: arc.title,
      nativeTitle: arc.nativeTitle,
      seasonNo: arc.seasonNo,
    },
    episode: {
      id: episode.id,
      title: episode.title,
      nativeTitle: episode.nativeTitle,
      episodeNo: episode.episodeNo,
      hook: episode.hook,
      recap: episode.recap,
      cliffhanger: episode.cliffhanger,
    },
    scenes,
    completed,
    total: scenes.length,
    percent,
    isComplete,
    correct,
    answered,
    accuracy,
    questionsTotal: exerciseIds.length,
    xp,
    minutes,
    streak: stats?.streakCurrent ?? 0,
    minutesLabel: minutesLabel(minutes),
    completedAt:
      scenes
        .map((scene) => scene.completedAt)
        .filter((value): value is string => Boolean(value))
        .sort()
        .at(-1) ?? null,
    skills,
    stars,
    starTotal: stars.reduce((sum, star) => sum + star.value, 0),
    vocab: vocabRows,
    nextEpisodeId: next?.id ?? null,
    nextEpisodeTitle: next?.nativeTitle ?? next?.title ?? null,
    nextSceneId: firstIncomplete?.id ?? null,
    previousEpisodeId: previousEpisodeId(content, episodeId),
  };
}

export async function getResultsOverview(
  userId: string,
  language: string,
): Promise<ResultsOverview | null> {
  let content: StoryWorldContent;
  try {
    content = getStoryContent(language);
  } catch {
    return null;
  }

  const [progressRows, attempts, xpRows] = prisma
    ? await Promise.all([
        prisma.storySceneProgress.findMany({
          where: { userId, languageCode: language },
          orderBy: { updatedAt: "desc" },
        }),
        prisma.exerciseAttempt.findMany({
          where: { userId, languageCode: language },
          orderBy: { createdAt: "desc" },
          take: 4000,
        }),
        prisma.xpEvent.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 5000,
          select: { amount: true, sourceType: true, sourceId: true },
        }),
      ])
    : [[], [], []];

  const progressByEpisode = new Map<
    string,
    { completed: number; minutes: number; completedAt: Date | null }
  >();
  for (const row of progressRows) {
    const episodeId = episodeIdFromSceneId(row.sceneId);
    const bucket = progressByEpisode.get(episodeId) ?? { completed: 0, minutes: 0, completedAt: null };
    if (row.status === "completed") {
      bucket.completed += 1;
      if (row.completedAt && (!bucket.completedAt || row.completedAt > bucket.completedAt)) {
        bucket.completedAt = row.completedAt;
      }
    }
    bucket.minutes += row.minutes ?? 0;
    progressByEpisode.set(episodeId, bucket);
  }

  const attemptsByEpisode = new Map<string, typeof attempts>();
  for (const row of attempts) {
    const bucket = attemptsByEpisode.get(row.lessonId) ?? [];
    bucket.push(row);
    attemptsByEpisode.set(row.lessonId, bucket);
  }

  const episodeById = new Map<string, { level: LevelExport; arc: ArcExport; episode: EpisodeExport }>();
  for (const level of content.levels) {
    for (const arc of level.arcs) {
      for (const episode of arc.episodes) {
        episodeById.set(episode.id, { level, arc, episode });
      }
    }
  }

  const episodeIds = new Set(attemptsByEpisode.keys());
  for (const episodeId of progressByEpisode.keys()) episodeIds.add(episodeId);

  let totalXp = 0;
  let totalMinutes = 0;
  let totalScenes = 0;
  let totalAccuracyNumerator = 0;
  let totalAccuracyDenominator = 0;
  let starTotal = 0;

  const episodes: EpisodeSummary[] = [];
  for (const episodeId of episodeIds) {
    const meta = episodeById.get(episodeId);
    if (!meta) continue;
    const progress = progressByEpisode.get(episodeId) ?? { completed: 0, minutes: 0, completedAt: null };
    if (progress.completed === 0 && !attemptsByEpisode.has(episodeId)) continue;
    const exerciseIds = new Set(
      meta.episode.scenes.flatMap((scene) => scene.exercises.map((exercise) => exercise.id)),
    );
    const latest = latestAttempts(
      (attemptsByEpisode.get(episodeId) ?? []).filter((row) => exerciseIds.has(row.exerciseId)),
    );
    const correct = latest.filter((row) => row.isCorrect).length;
    const accuracy = latest.length === 0 ? 0 : Math.round((correct / latest.length) * 100);
    const xp = xpRows
      .filter(
        (row) =>
          (row.sourceType === "story_scene" &&
            row.sourceId !== null &&
            episodeIdFromSceneId(row.sourceId) === episodeId) ||
          (row.sourceType === "story_attempt" && row.sourceId !== null && exerciseIds.has(row.sourceId)),
      )
      .reduce((sum, row) => sum + row.amount, 0);

    const exerciseSkill = new Map(
      meta.episode.scenes.flatMap((scene) =>
        scene.exercises.map((exercise) => [exercise.id, exercise.skill] as const),
      ),
    );
    const skillBuckets = new Map<string, { correct: number; total: number }>();
    for (const row of latest) {
      const skill = exerciseSkill.get(row.exerciseId) ?? "comprehension";
      const bucket = skillBuckets.get(skill) ?? { correct: 0, total: 0 };
      bucket.total += 1;
      if (row.isCorrect) bucket.correct += 1;
      skillBuckets.set(skill, bucket);
    }
    const skillPercent = (skill: string) => {
      const bucket = skillBuckets.get(skill);
      return bucket && bucket.total > 0 ? Math.round((bucket.correct / bucket.total) * 100) : accuracy;
    };
    const comprehensionSkills = [...skillBuckets.keys()].filter(
      (skill) => skill !== "vocabulary" && skill !== "grammar",
    );
    const comprehensionPercent =
      comprehensionSkills.length === 0
        ? accuracy
        : Math.round(
            (comprehensionSkills.reduce(
              (sum, skill) => sum + (skillBuckets.get(skill)?.correct ?? 0),
              0,
            ) /
              Math.max(
                1,
                comprehensionSkills.reduce(
                  (sum, skill) => sum + (skillBuckets.get(skill)?.total ?? 0),
                  0,
                ),
              )) *
              100,
          );
    const stars =
      starValue(skillPercent("vocabulary")) +
      starValue(skillPercent("grammar")) +
      starValue(comprehensionPercent);

    totalXp += xp;
    totalMinutes += progress.minutes;
    totalScenes += progress.completed;
    totalAccuracyNumerator += correct;
    totalAccuracyDenominator += latest.length;
    starTotal += stars;

    episodes.push({
      episodeId,
      worldId: content.world.id,
      title: meta.episode.title,
      nativeTitle: meta.episode.nativeTitle,
      episodeNo: meta.episode.episodeNo,
      arcTitle: meta.arc.nativeTitle,
      levelCode: meta.level.levelCode,
      levelLabel: meta.level.label,
      framework: meta.level.framework,
      tier: meta.level.tier,
      palette: content.world.palette,
      completed: progress.completed,
      total: meta.episode.scenes.length,
      percent:
        meta.episode.scenes.length === 0
          ? 0
          : Math.round((progress.completed / meta.episode.scenes.length) * 100),
      accuracy,
      xp,
      minutes: progress.minutes,
      starTotal: stars,
      completedAt: progress.completedAt?.toISOString() ?? null,
    });
  }

  episodes.sort((a, b) => {
    const aTime = a.completedAt ? Date.parse(a.completedAt) : 0;
    const bTime = b.completedAt ? Date.parse(b.completedAt) : 0;
    if (aTime !== bTime) return bTime - aTime;
    return a.episodeNo - b.episodeNo;
  });

  return {
    language,
    world: {
      id: content.world.id,
      title: content.world.title,
      nativeTitle: content.world.nativeTitle,
      palette: content.world.palette,
    },
    levels: content.levels.map((level) => ({
      tier: level.tier,
      label: level.label,
      levelCode: level.levelCode,
      framework: level.framework,
    })),
    episodes,
    totals: {
      episodesCompleted: episodes.filter((episode) => episode.percent === 100).length,
      scenesCompleted: totalScenes,
      accuracy:
        totalAccuracyDenominator === 0
          ? 0
          : Math.round((totalAccuracyNumerator / totalAccuracyDenominator) * 100),
      xp: totalXp,
      minutes: totalMinutes,
      stars: starTotal,
      starTotal: episodes.length * 9,
    },
  };
}
