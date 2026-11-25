import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { LibraryExport } from "./types";

interface LanguageReport {
  language: string;
  worldId: string;
  levels: Array<{
    tier: string;
    framework: string;
    levelCode: string;
    scenes: number;
    materials: number;
    lines: number;
    exercises: number;
    episodes: number;
    minMaterialsPerEpisode: number;
    maxMaterialsPerEpisode: number;
    romanizedLines: number;
    totalLines: number;
  }>;
  scenes: number;
  materials: number;
  lines: number;
  exercises: number;
  episodes: number;
  minMaterialsPerEpisode: number;
  maxMaterialsPerEpisode: number;
  romanizedLines: number;
  totalLines: number;
  cultureNotes: number;
  sourcedCultureNotes: number;
}

function main() {
  const root = join(process.cwd(), "content", "stories");
  const languages = readdirSync(root).filter((entry) => !entry.includes("."));
  const reports: LanguageReport[] = [];

  for (const language of languages) {
    const directory = join(root, language, "library");
    let files: string[] = [];
    try {
      files = readdirSync(directory).filter((file) => file.endsWith(".json")).sort();
    } catch {
      continue;
    }
    if (files.length === 0) continue;
    const levels: LanguageReport["levels"] = [];
    let worldId = "";
    let cultureNotes = 0;
    let sourcedCultureNotes = 0;
    for (const file of files) {
      const library = JSON.parse(readFileSync(join(directory, file), "utf8")) as LibraryExport;
      worldId = library.world.id;
      cultureNotes = library.world.cultureNotes.length;
      sourcedCultureNotes = library.world.cultureNotes.filter((note) => note.sources.length > 0).length;
      const episodes = library.level.arcs.flatMap((arc) => arc.episodes);
      const materialsPerEpisode = episodes.map((episode) =>
        episode.scenes.reduce((total, scene) => total + scene.materials.length + 1, 0),
      );
      const lines = episodes.flatMap((episode) => episode.scenes.flatMap((scene) => scene.lines));
      levels.push({
        tier: library.level.tier,
        framework: library.level.framework,
        levelCode: library.level.levelCode,
        scenes: library.counts.scenes,
        materials: library.counts.materials,
        lines: library.counts.lines,
        exercises: library.counts.exercises,
        episodes: episodes.length,
        minMaterialsPerEpisode: Math.min(...materialsPerEpisode),
        maxMaterialsPerEpisode: Math.max(...materialsPerEpisode),
        romanizedLines: lines.filter((line) => line.romanization).length,
        totalLines: lines.length,
      });
    }
    reports.push({
      language,
      worldId,
      levels,
      scenes: levels.reduce((total, level) => total + level.scenes, 0),
      materials: levels.reduce((total, level) => total + level.materials, 0),
      lines: levels.reduce((total, level) => total + level.lines, 0),
      exercises: levels.reduce((total, level) => total + level.exercises, 0),
      episodes: levels.reduce((total, level) => total + level.episodes, 0),
      minMaterialsPerEpisode: Math.min(...levels.map((level) => level.minMaterialsPerEpisode)),
      maxMaterialsPerEpisode: Math.max(...levels.map((level) => level.maxMaterialsPerEpisode)),
      romanizedLines: levels.reduce((total, level) => total + level.romanizedLines, 0),
      totalLines: levels.reduce((total, level) => total + level.totalLines, 0),
      cultureNotes,
      sourcedCultureNotes,
    });
  }

  const totals = {
    languages: reports.length,
    scenes: reports.reduce((total, report) => total + report.scenes, 0),
    materials: reports.reduce((total, report) => total + report.materials, 0),
    learningObjects: reports.reduce((total, report) => total + report.scenes + report.materials, 0),
    episodes: reports.reduce((total, report) => total + report.episodes, 0),
    lines: reports.reduce((total, report) => total + report.lines, 0),
    exercises: reports.reduce((total, report) => total + report.exercises, 0),
    minMaterialsPerEpisode: Math.min(...reports.map((report) => report.minMaterialsPerEpisode)),
    maxMaterialsPerEpisode: Math.max(...reports.map((report) => report.maxMaterialsPerEpisode)),
  };

  const manifest = {
    schemaVersion: "1.0.0",
    contentVersion: "2026.11.1",
    generatedAt: new Date().toISOString(),
    generatedBy: "scripts/story/generate.ts",
    libraries: reports,
    totals,
    definition:
      "1 story learning object = 1 scene + 4 supporting materials. 1 episode/story = 10 scenes = 50 learning objects.",
  };
  writeFileSync(join(root, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(
    `${reports.length} languages · ${totals.episodes} episodes · ${totals.scenes} scenes · ${totals.materials} supporting materials · ${totals.learningObjects} learning objects`,
  );
  for (const report of reports) {
    console.log(
      `  ${report.language}: ${report.episodes} stories (episodes), ${report.scenes} scenes, ${report.materials} supporting materials, ${report.minMaterialsPerEpisode}–${report.maxMaterialsPerEpisode} objects/story, ${report.romanizedLines}/${report.totalLines} romanized`,
    );
  }
}

main();
