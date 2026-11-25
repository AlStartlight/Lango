import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  ArcExport,
  EpisodeExport,
  LibraryExport,
  SceneExport,
  StoryMaterialExport,
} from "../../../scripts/story/types";

export interface StoryWorldContent {
  language: string;
  world: LibraryExport["world"];
  levels: LibraryExport["level"][];
  arcs: Map<string, ArcExport>;
  episodes: Map<string, EpisodeExport>;
  scenes: Map<string, SceneExport>;
  materials: Map<string, StoryMaterialExport>;
  sceneOrder: string[];
}

interface CacheEntry {
  content: StoryWorldContent;
  touched: number;
}

const globalCache = globalThis as unknown as {
  __langoStoryContentCache?: Map<string, CacheEntry>;
  __langoStoryContentTick?: number;
};

const cache = globalCache.__langoStoryContentCache ?? new Map<string, CacheEntry>();
globalCache.__langoStoryContentCache = cache;
const MAX_CACHE = 3;

function readLanguage(language: string): StoryWorldContent {
  const directory = join(process.cwd(), "content", "stories", language, "library");
  let files: string[] = [];
  try {
    files = readdirSync(directory).filter((file) => file.endsWith(".json")).sort();
  } catch {
    throw new Error(`Story library not found for ${language}`);
  }
  if (files.length === 0) throw new Error(`Story library is empty for ${language}`);

  let world: LibraryExport["world"] | null = null;
  const levels: LibraryExport["level"][] = [];
  const arcs = new Map<string, ArcExport>();
  const episodes = new Map<string, EpisodeExport>();
  const scenes = new Map<string, SceneExport>();
  const materials = new Map<string, StoryMaterialExport>();

  for (const file of files) {
    const library = JSON.parse(readFileSync(join(directory, file), "utf8")) as LibraryExport;
    if (library.language !== language) continue;
    world ??= library.world;
    levels.push(library.level);
    for (const arc of library.level.arcs) {
      arcs.set(arc.id, arc);
      for (const episode of arc.episodes) {
        episodes.set(episode.id, episode);
        for (const scene of episode.scenes) {
          scenes.set(scene.id, scene);
          for (const material of scene.materials) materials.set(material.id, material);
        }
      }
    }
  }
  if (!world) throw new Error(`No world metadata for ${language}`);
  levels.sort((a, b) => a.position - b.position);
  // Preserve curriculum order (T1 → T5, season 1 → 2, episode, scene) instead
  // of lexicographic ID order, which would put N1 before N5.
  const sceneOrder = levels.flatMap((level) =>
    level.arcs.flatMap((arc) =>
      arc.episodes.flatMap((episode) => episode.scenes.map((scene) => scene.id)),
    ),
  );

  return { language, world, levels, arcs, episodes, scenes, materials, sceneOrder };
}

export function getStoryContent(language: string): StoryWorldContent {
  const now = (globalCache.__langoStoryContentTick ?? 0) + 1;
  globalCache.__langoStoryContentTick = now;
  const cached = cache.get(language);
  if (cached) {
    cached.touched = now;
    return cached.content;
  }
  const content = readLanguage(language);
  cache.set(language, { content, touched: now });
  if (cache.size > MAX_CACHE) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].touched - b[1].touched)[0];
    if (oldest) cache.delete(oldest[0]);
  }
  return content;
}

export function findWorldByLanguage(language: string): StoryWorldContent | null {
  try {
    return getStoryContent(language);
  } catch {
    return null;
  }
}

export function findScene(sceneId: string): {
  content: StoryWorldContent;
  scene: SceneExport;
  episode: EpisodeExport;
  arc: ArcExport;
} | null {
  const language = sceneId.slice(0, 2);
  try {
    const content = getStoryContent(language);
    const scene = content.scenes.get(sceneId);
    if (!scene) return null;
    const episode = content.episodes.get(scene.id.replace(/-p\d+$/, "").replace(/(.*)-p\d+$/, "$1"));
    // Episode ids are arcId-lNN; derive from the scene number.
    const arcId = scene.id.replace(/-p\d+$/, "");
    const sceneNumber = Number(scene.id.match(/-p(\d+)$/)?.[1] ?? "1");
    const episodeId = `${arcId}-l${String(Math.ceil(sceneNumber / 10)).padStart(2, "0")}`;
    const resolvedEpisode = content.episodes.get(episodeId) ?? episode;
    const arc = content.arcs.get(arcId);
    if (!resolvedEpisode || !arc) return null;
    return { content, scene, episode: resolvedEpisode, arc };
  } catch {
    return null;
  }
}

export function findMaterial(materialId: string): {
  content: StoryWorldContent;
  material: StoryMaterialExport;
  scene: SceneExport;
  episode: EpisodeExport;
  arc: ArcExport;
} | null {
  const language = materialId.slice(0, 2);
  try {
    const content = getStoryContent(language);
    const material = content.materials.get(materialId);
    if (!material) return null;
    const sceneId = material.id.replace(/-m\d+$/, "");
    const scene = content.scenes.get(sceneId);
    if (!scene) return null;
    const found = findScene(sceneId);
    if (!found) return null;
    return { content, material, scene, episode: found.episode, arc: found.arc };
  } catch {
    return null;
  }
}

export function findEpisode(episodeId: string): {
  content: StoryWorldContent;
  episode: EpisodeExport;
  arc: ArcExport;
} | null {
  const language = episodeId.slice(0, 2);
  try {
    const content = getStoryContent(language);
    const episode = content.episodes.get(episodeId);
    if (!episode) return null;
    const arcId = episodeId.replace(/-l\d+$/, "");
    const arc = content.arcs.get(arcId);
    if (!arc) return null;
    return { content, episode, arc };
  } catch {
    return null;
  }
}

export function findWorld(worldId: string): StoryWorldContent | null {
  const language = worldId.slice(0, 2);
  try {
    const content = getStoryContent(language);
    return content.world.id === worldId ? content : null;
  } catch {
    return null;
  }
}

export function nextSceneId(content: StoryWorldContent, sceneId: string): string | null {
  const index = content.sceneOrder.indexOf(sceneId);
  return index >= 0 ? (content.sceneOrder[index + 1] ?? null) : null;
}

export function previousSceneId(content: StoryWorldContent, sceneId: string): string | null {
  const index = content.sceneOrder.indexOf(sceneId);
  return index > 0 ? (content.sceneOrder[index - 1] ?? null) : null;
}
