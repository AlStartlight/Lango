import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { brotliDecompressSync } from "node:zlib";
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
  /** O(1) lookups used by navigation and catalog rendering. */
  sceneIndex: Map<string, number>;
  episodeBySceneId: Map<string, string>;
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
  // Production builds ship only the Brotli-compressed libraries (about 13 MB
  // for all 13 languages) so the server bundle stays inside Vercel's limit.
  // Local development and content validation use the raw JSON.
  const candidates = [
    {
      directory: join(process.cwd(), "content", "stories", "compiled", language),
      suffix: ".json.br",
      packed: true,
    },
    {
      directory: join(process.cwd(), "content", "stories", language, "library"),
      suffix: ".json",
      packed: false,
    },
  ];

  let directory = "";
  let files: string[] = [];
  let packed = false;

  for (const candidate of candidates) {
    try {
      const found = readdirSync(candidate.directory)
        .filter((file) => file.endsWith(candidate.suffix))
        .sort();
      if (found.length > 0) {
        directory = candidate.directory;
        files = found;
        packed = candidate.packed;
        break;
      }
    } catch {
      // Try the next representation.
    }
  }

  if (files.length === 0) {
    throw new Error(`Story library not found for ${language}`);
  }

  let world: LibraryExport["world"] | null = null;
  const levels: LibraryExport["level"][] = [];
  const arcs = new Map<string, ArcExport>();
  const episodes = new Map<string, EpisodeExport>();
  const scenes = new Map<string, SceneExport>();
  const materials = new Map<string, StoryMaterialExport>();
  const episodeBySceneId = new Map<string, string>();

  for (const file of files) {
    const raw = readFileSync(join(directory, file));
    const text = packed
      ? brotliDecompressSync(raw).toString("utf8")
      : raw.toString("utf8");
    const library = JSON.parse(text) as LibraryExport;
    if (library.language !== language) continue;
    world ??= library.world;
    levels.push(library.level);
    for (const arc of library.level.arcs) {
      arcs.set(arc.id, arc);
      for (const episode of arc.episodes) {
        episodes.set(episode.id, episode);
        for (const scene of episode.scenes) {
          scenes.set(scene.id, scene);
          episodeBySceneId.set(scene.id, episode.id);
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
  const sceneIndex = new Map(sceneOrder.map((sceneId, index) => [sceneId, index]));

  return {
    language,
    world,
    levels,
    arcs,
    episodes,
    scenes,
    materials,
    sceneOrder,
    sceneIndex,
    episodeBySceneId,
  };
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
    const episodeId = content.episodeBySceneId.get(sceneId);
    const episode = episodeId ? content.episodes.get(episodeId) : undefined;
    const arcId = episodeId ? episodeId.replace(/-l\d+$/, "") : scene.id.replace(/-p\d+$/, "");
    const arc = content.arcs.get(arcId);
    if (!episode || !arc) return null;
    return { content, scene, episode, arc };
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
  const index = content.sceneIndex.get(sceneId);
  return index !== undefined ? (content.sceneOrder[index + 1] ?? null) : null;
}

export function previousSceneId(content: StoryWorldContent, sceneId: string): string | null {
  const index = content.sceneIndex.get(sceneId);
  return index !== undefined && index > 0 ? (content.sceneOrder[index - 1] ?? null) : null;
}
