import "server-only";
import { prisma } from "@/lib/prisma";
import type { EpisodeExport, LevelExport } from "../../../scripts/story/types";
import { getStoryContent, type StoryWorldContent } from "./content";

/**
 * Episode journey + unlock engine.
 *
 * Stories are released as episodes. A level is a single ordered track (T1 →
 * T5, arc/season 1 → 2, episode 1 → 20). The first episode of every level is
 * always open so a learner can try any difficulty; the next episode unlocks
 * once the previous one is *mostly* finished (80% of its scenes). That keeps
 * the "binge the next chapter" loop honest: progress is required, but a missed
 * scene does not permanently wedge the journey.
 */

export const EPISODE_UNLOCK_RATIO = 0.8;

export type EpisodeStatus = "completed" | "active" | "available" | "locked";

export interface JourneyEpisodeGate {
  previousEpisodeId: string;
  previousTitle: string;
  previousCompleted: number;
  previousTotal: number;
  /** Scenes still missing before the next episode opens. */
  remaining: number;
  /** Completed scenes required (80% of the previous episode, rounded up). */
  required: number;
}

export interface JourneyEpisodeSummary {
  id: string;
  episodeNo: number;
  title: string;
  nativeTitle: string;
  hook: string;
  cliffhanger: string;
  recap: string;
  arcId: string;
  arcTitle: string;
  arcNativeTitle: string;
  seasonNo: number;
  tier: string;
  framework: string;
  levelCode: string;
  levelLabel: string;
  total: number;
  completed: number;
  percent: number;
  status: EpisodeStatus;
  firstSceneId: string | null;
  resumeSceneId: string | null;
  previousEpisodeId: string | null;
  nextEpisodeId: string | null;
  gate: JourneyEpisodeGate | null;
}

export interface JourneyScene {
  id: string;
  sceneNo: number;
  title: string;
  titleTranslation: { id: string; en: string; ja?: string };
  minutes: number;
  completed: boolean;
  current: boolean;
}

export interface JourneyEpisodeDetail extends JourneyEpisodeSummary {
  scenes: JourneyScene[];
}

export interface JourneyLevelSummary {
  tier: string;
  label: string;
  levelCode: string;
  framework: string;
  episodes: number;
  completedEpisodes: number;
  scenes: number;
  completed: number;
  percent: number;
  /** First episode of the level, always open. */
  firstEpisodeId: string | null;
}

export interface EpisodeJourney {
  language: string;
  world: {
    id: string;
    title: string;
    nativeTitle: string;
    logline: string;
    setting: string;
    palette: string;
  };
  tier: string;
  levelLabel: string;
  levelCode: string;
  framework: string;
  current: JourneyEpisodeDetail | null;
  next: JourneyEpisodeSummary | null;
  previous: JourneyEpisodeSummary | null;
  /** All episode summaries of the current level, in reading order. */
  episodes: JourneyEpisodeSummary[];
  levels: JourneyLevelSummary[];
  unlockedEpisodes: number;
  totalEpisodes: number;
  completedEpisodes: number;
}

interface RawProgress {
  sceneId: string;
  status: string;
}

interface TrackEntry {
  episode: EpisodeExport;
  level: LevelExport;
  arcId: string;
  arcTitle: string;
  arcNativeTitle: string;
  seasonNo: number;
  index: number;
  completed: number;
  touched: boolean;
  status: EpisodeStatus;
  gate: JourneyEpisodeGate | null;
}

export function episodeIdForScene(content: StoryWorldContent, sceneId: string): string | null {
  for (const episode of content.episodes.values()) {
    if (episode.scenes.some((scene) => scene.id === sceneId)) return episode.id;
  }
  return null;
}

export function episodeIdFromSceneId(sceneId: string): string | null {
  try {
    return episodeIdForScene(getStoryContent(sceneId.slice(0, 2)), sceneId);
  } catch {
    return null;
  }
}

function thresholdFor(total: number): number {
  return Math.max(1, Math.ceil(total * EPISODE_UNLOCK_RATIO));
}

export interface EpisodeProgressState {
  completed: number;
  total: number;
  status: EpisodeStatus;
  touched: boolean;
  unlockThreshold: number;
  gate: JourneyEpisodeGate | null;
}

/**
 * Pure unlock computation for every episode of a language. Exported so
 * library-style screens can show lock states without duplicating the rule.
 */
export function computeEpisodeStates(
  content: StoryWorldContent,
  completedScenes: Set<string>,
  touchedScenes: Set<string>,
  currentEpisodeId: string | null,
): Map<string, EpisodeProgressState> {
  const states = new Map<string, EpisodeProgressState>();

  for (const level of content.levels) {
    const episodes = level.arcs.flatMap((arc) => arc.episodes);
    let previousComplete = false;
    let previousCompleted = 0;
    let previousRequired = 0;
    let previous: EpisodeExport | null = null;

    episodes.forEach((episode, index) => {
      const total = episode.scenes.length;
      const completed = episode.scenes.filter((scene) => completedScenes.has(scene.id)).length;
      const isTouched = episode.scenes.some((scene) => touchedScenes.has(scene.id));
      const complete = total > 0 && completed >= total;
      const gateOpen =
        index === 0 ||
        previousComplete ||
        previousCompleted >= previousRequired ||
        episode.id === currentEpisodeId;
      const unlocked = complete || isTouched || gateOpen;
      const status: EpisodeStatus = complete
        ? "completed"
        : !unlocked
          ? "locked"
          : isTouched || episode.id === currentEpisodeId
            ? "active"
            : "available";
      const required = thresholdFor(total);
      const gate =
        status === "locked" && previous
          ? {
              previousEpisodeId: previous.id,
              previousTitle: previous.nativeTitle || previous.title,
              previousCompleted,
              previousTotal: previous.scenes.length,
              remaining: Math.max(0, previousRequired - previousCompleted),
              required: previousRequired,
            }
          : null;

      states.set(episode.id, {
        completed,
        total,
        status,
        touched: isTouched,
        unlockThreshold: required,
        gate,
      });

      previousComplete = complete;
      previousCompleted = completed;
      previousRequired = required;
      previous = episode;
    });
  }

  return states;
}

function buildLevelTracks(content: StoryWorldContent): Array<{
  level: LevelExport;
  entries: Array<Omit<TrackEntry, "completed" | "touched" | "status" | "gate">>;
}> {
  return content.levels.map((level) => ({
    level,
    entries: level.arcs.flatMap((arc) =>
      arc.episodes.map((episode, episodeIndex, all) => ({
        episode,
        level,
        arcId: arc.id,
        arcTitle: arc.title,
        arcNativeTitle: arc.nativeTitle,
        seasonNo: arc.seasonNo,
        index: episodeIndex + all.length * level.arcs.indexOf(arc),
      })),
    ),
  }));
}

function summarize(
  entry: TrackEntry,
  resumeSceneId: string | null,
): JourneyEpisodeSummary {
  return {
    id: entry.episode.id,
    episodeNo: entry.episode.episodeNo,
    title: entry.episode.title,
    nativeTitle: entry.episode.nativeTitle,
    hook: entry.episode.hook,
    cliffhanger: entry.episode.cliffhanger,
    recap: entry.episode.recap,
    arcId: entry.arcId,
    arcTitle: entry.arcTitle,
    arcNativeTitle: entry.arcNativeTitle,
    seasonNo: entry.seasonNo,
    tier: entry.level.tier,
    framework: entry.level.framework,
    levelCode: entry.level.levelCode,
    levelLabel: entry.level.label,
    total: entry.episode.scenes.length,
    completed: entry.completed,
    percent:
      entry.episode.scenes.length === 0
        ? 0
        : Math.round((entry.completed / entry.episode.scenes.length) * 100),
    status: entry.status,
    firstSceneId: entry.episode.scenes[0]?.id ?? null,
    resumeSceneId,
    previousEpisodeId: null,
    nextEpisodeId: null,
    gate: entry.gate,
  };
}

async function loadProgress(userId: string, language: string) {
  if (!prisma) {
    return {
      rows: [] as RawProgress[],
      currentEpisodeId: null as string | null,
    };
  }
  const [rows, progress] = await Promise.all([
    prisma.storySceneProgress.findMany({
      where: { userId, languageCode: language },
      select: { sceneId: true, status: true },
    }),
    prisma.storyProgress.findFirst({
      where: { userId, languageCode: language },
      select: { currentEpisodeId: true, currentSceneId: true },
    }),
  ]);
  return {
    rows: rows as RawProgress[],
    currentEpisodeId: progress?.currentEpisodeId ?? null,
  };
}

/**
 * Load the reading journey for one language and one episode (or the episode
 * the learner was last reading). Returns null when the language has no story
 * library.
 */
export async function getEpisodeJourney(
  userId: string,
  options: { language: string; episodeId?: string | null; tier?: string | null },
): Promise<EpisodeJourney | null> {
  let content: StoryWorldContent;
  try {
    content = getStoryContent(options.language);
  } catch {
    return null;
  }

  const { rows, currentEpisodeId } = await loadProgress(userId, content.language);
  const completedScenes = new Set(
    rows.filter((row) => row.status === "completed").map((row) => row.sceneId),
  );
  const touchedScenes = new Set(
    rows
      .filter((row) => row.status === "completed" || row.status === "in_progress")
      .map((row) => row.sceneId),
  );

  const states = computeEpisodeStates(
    content,
    completedScenes,
    touchedScenes,
    currentEpisodeId,
  );

  const tracks = buildLevelTracks(content).map((track) => {
    const entries: TrackEntry[] = track.entries.map((base) => {
      const state = states.get(base.episode.id);
      return {
        ...base,
        completed: state?.completed ?? 0,
        touched: state?.touched ?? false,
        status: state?.status ?? "locked",
        gate: state?.gate ?? null,
      };
    });
    return { level: track.level, entries };
  });

  const allEntries = tracks.flatMap((track) => track.entries);
  const byId = new Map(allEntries.map((entry) => [entry.episode.id, entry]));

  const selectedTier =
    options.tier && /^T[1-5]$/.test(options.tier)
      ? options.tier
      : null;
  const candidates = selectedTier
    ? allEntries.filter((entry) => entry.level.tier === selectedTier)
    : allEntries;

  const selected =
    (options.episodeId ? byId.get(options.episodeId) : null) ??
    (currentEpisodeId ? byId.get(currentEpisodeId) : null) ??
    candidates.find((entry) => entry.status === "active") ??
    candidates.find((entry) => entry.status === "available" && entry.completed === 0) ??
    candidates.find((entry) => entry.status !== "locked") ??
    candidates[0] ??
    null;

  // A caller asking for a specific locked episode still gets its data so the
  // UI can explain the gate instead of rendering a 404.
  if (!selected) return null;

  const levelTrack =
    tracks.find((track) => track.level.tier === selected.level.tier)?.entries ?? [];
  const selectedIndex = levelTrack.findIndex((entry) => entry.episode.id === selected.episode.id);
  const previousTrackEntry = selectedIndex > 0 ? levelTrack[selectedIndex - 1] : null;
  const nextTrackEntry =
    selectedIndex >= 0 && selectedIndex < levelTrack.length - 1
      ? levelTrack[selectedIndex + 1]
      : null;

  const episodeScenes = selected.episode.scenes;
  const resumeScene =
    episodeScenes.find((scene) => !completedScenes.has(scene.id)) ?? episodeScenes[0] ?? null;

  const summaryFor = (entry: TrackEntry, extra?: { next?: TrackEntry | null; previous?: TrackEntry | null }) => {
    const resume =
      entry.episode.scenes.find((scene) => !completedScenes.has(scene.id)) ??
      entry.episode.scenes[0] ??
      null;
    return {
      ...summarize(entry, resume?.id ?? null),
      previousEpisodeId: extra?.previous?.episode.id ?? null,
      nextEpisodeId: extra?.next?.episode.id ?? null,
    } satisfies JourneyEpisodeSummary;
  };

  const episodes = levelTrack.map((entry, index) => {
    const summary = summarize(
      entry,
      null,
    );
    summary.previousEpisodeId = levelTrack[index - 1]?.episode.id ?? null;
    summary.nextEpisodeId = levelTrack[index + 1]?.episode.id ?? null;
    return summary;
  });

  const current: JourneyEpisodeDetail = {
    ...summaryFor(selected, { next: nextTrackEntry, previous: previousTrackEntry }),
    resumeSceneId: resumeScene?.id ?? null,
    scenes: episodeScenes.map((scene) => ({
      id: scene.id,
      sceneNo: scene.sceneNo,
      title: scene.title,
      titleTranslation: scene.titleTranslation,
      minutes: scene.estimatedMinutes,
      completed: completedScenes.has(scene.id),
      current: scene.id === resumeScene?.id,
    })),
  };

  const levels: JourneyLevelSummary[] = tracks.map((track) => {
    const scenes = track.entries.reduce((total, entry) => total + entry.episode.scenes.length, 0);
    const completed = track.entries.reduce((total, entry) => total + entry.completed, 0);
    return {
      tier: track.level.tier,
      label: track.level.label,
      levelCode: track.level.levelCode,
      framework: track.level.framework,
      episodes: track.entries.length,
      completedEpisodes: track.entries.filter((entry) => entry.status === "completed").length,
      scenes,
      completed,
      percent: scenes === 0 ? 0 : Math.round((completed / scenes) * 100),
      firstEpisodeId: track.entries[0]?.episode.id ?? null,
    };
  });

  return {
    language: content.language,
    world: {
      id: content.world.id,
      title: content.world.title,
      nativeTitle: content.world.nativeTitle,
      logline: content.world.logline,
      setting: content.world.setting,
      palette: content.world.palette,
    },
    tier: selected.level.tier,
    levelLabel: selected.level.label,
    levelCode: selected.level.levelCode,
    framework: selected.level.framework,
    current,
    next: nextTrackEntry
      ? summaryFor(nextTrackEntry, {
          next: levelTrack[selectedIndex + 2] ?? null,
          previous: selected,
        })
      : null,
    previous: previousTrackEntry
      ? summaryFor(previousTrackEntry, {
          next: selected,
          previous: levelTrack[selectedIndex - 2] ?? null,
        })
      : null,
    episodes,
    levels,
    unlockedEpisodes: allEntries.filter((entry) => entry.status !== "locked").length,
    totalEpisodes: allEntries.length,
    completedEpisodes: allEntries.filter((entry) => entry.status === "completed").length,
  };
}

/**
 * Post-completion snapshot used by the reader's "episode finished" moment.
 * Runs its own light query so the route handler stays simple.
 */
export async function getEpisodeUnlockSnapshot(
  userId: string,
  episodeId: string,
): Promise<{
  episodeId: string;
  completed: number;
  total: number;
  complete: boolean;
  unlockThreshold: number;
  nextEpisodeId: string | null;
  nextEpisodeTitle: string | null;
  nextEpisodeUnlocked: boolean;
  remaining: number;
} | null> {
  let content: StoryWorldContent;
  try {
    content = getStoryContent(episodeId.slice(0, 2));
  } catch {
    return null;
  }
  const episode = content.episodes.get(episodeId);
  if (!episode) return null;
  const completed = prisma
    ? await prisma.storySceneProgress.count({
        where: {
          userId,
          status: "completed",
          sceneId: { in: episode.scenes.map((scene) => scene.id) },
        },
      })
    : 0;
  const total = episode.scenes.length;
  const complete = total > 0 && completed >= total;
  const required = thresholdFor(total);
  const nextEpisode = findNextEpisode(content, episodeId);
  return {
    episodeId,
    completed,
    total,
    complete,
    unlockThreshold: required,
    nextEpisodeId: nextEpisode?.id ?? null,
    nextEpisodeTitle: nextEpisode?.nativeTitle || nextEpisode?.title || null,
    nextEpisodeUnlocked: complete || completed >= required,
    remaining: Math.max(0, required - completed),
  };
}

function findNextEpisode(content: StoryWorldContent, episodeId: string): EpisodeExport | null {
  for (const level of content.levels) {
    const episodes = level.arcs.flatMap((arc) => arc.episodes);
    const index = episodes.findIndex((episode) => episode.id === episodeId);
    if (index >= 0) return episodes[index + 1] ?? null;
  }
  return null;
}
