import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { levelLibrarySchema } from "./schema";
import { countTextUnits } from "./render";
import type { LibraryExport, SceneExport } from "./types";

interface FileResult {
  path: string;
  library?: LibraryExport;
  errors: string[];
  warnings: string[];
  sceneCount: number;
  materialCount: number;
  lineCount: number;
  exerciseCount: number;
  choiceCount: number;
  romanizedLines: number;
  totalLines: number;
  units: number[];
}

function libraryFiles(language?: string): string[] {
  const root = join(process.cwd(), "content", "stories");
  const languages = language ? [language] : readdirSync(root).filter((entry) => !entry.includes("."));
  const files: string[] = [];
  for (const lang of languages) {
    const dir = join(root, lang, "library");
    try {
      for (const file of readdirSync(dir)) {
        if (file.endsWith(".json")) files.push(join(dir, file));
      }
    } catch {
      // no library yet
    }
  }
  return files.sort();
}

function validateScene(
  scene: SceneExport,
  library: LibraryExport,
  errors: string[],
  warnings: string[],
): void {
  const prefix = `${scene.id}`;
  const knownNotes = new Set(library.world.cultureNotes.map((note) => note.id));
  for (const noteId of scene.cultureNoteIds) {
    if (!knownNotes.has(noteId)) errors.push(`${prefix}: unknown culture note ${noteId}`);
  }

  const lineIds = new Set(scene.lines.map((line) => line.id));
  if (lineIds.size !== scene.lines.length) errors.push(`${prefix}: duplicate line id`);
  for (const exercise of scene.exercises) {
    if (exercise.lineId && !lineIds.has(exercise.lineId)) {
      errors.push(`${prefix}/${exercise.id}: lineId ${exercise.lineId} not in scene`);
    }
    if (exercise.answerKey.choiceId) {
      const correct = exercise.choices?.find((choice) => choice.id === exercise.answerKey.choiceId);
      if (!correct) errors.push(`${prefix}/${exercise.id}: answer key is not a choice`);
      if (correct && /^[\x20-\x7E]{4,}$/.test(correct.text)) {
        const escaped = correct.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (new RegExp(`\\b${escaped}\\b`, "i").test(exercise.prompt)) {
          errors.push(`${prefix}/${exercise.id}: correct choice leaks into the prompt`);
        }
      }
    }
  }

  for (const material of scene.materials) {
    if (material.type === "vocabulary") {
      const items = (material.body.items as Array<{ lineId?: string }>) ?? [];
      if (items.length < 8 || items.length > 12) {
        warnings.push(`${prefix}/${material.id}: ${items.length} vocabulary items (target 8–12)`);
      }
      for (const item of items) {
        if (item.lineId && !lineIds.has(item.lineId)) {
          errors.push(`${prefix}/${material.id}: vocabulary lineId ${item.lineId} not in scene`);
        }
      }
    }
    if (material.type === "culture") {
      const sources = (material.body.sources as string[]) ?? [];
      if (sources.length === 0) errors.push(`${prefix}/${material.id}: culture note has no source`);
    }
    if (material.type === "review") {
      const listen = (material.body.listenLineIds as string[]) ?? [];
      for (const lineId of listen) {
        if (!lineIds.has(lineId)) errors.push(`${prefix}/${material.id}: listen line ${lineId} not in scene`);
      }
    }
  }

  const units = scene.lines.reduce(
    (total, line) => total + countTextUnits(line.text, line.script),
    0,
  );
  if (units < 120) warnings.push(`${prefix}: ${units} text units (target 120–450)`);
  if (units > 450) errors.push(`${prefix}: ${units} text units exceeds 450`);
}

function validateFile(path: string): FileResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    return {
      path,
      errors: [`invalid JSON: ${(error as Error).message}`],
      warnings,
      sceneCount: 0,
      materialCount: 0,
      lineCount: 0,
      exerciseCount: 0,
      choiceCount: 0,
      romanizedLines: 0,
      totalLines: 0,
      units: [],
    };
  }
  const parsed = levelLibrarySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      path,
      errors: parsed.error.issues
        .slice(0, 15)
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`),
      warnings,
      sceneCount: 0,
      materialCount: 0,
      lineCount: 0,
      exerciseCount: 0,
      choiceCount: 0,
      romanizedLines: 0,
      totalLines: 0,
      units: [],
    };
  }
  const library = parsed.data;
  let sceneCount = 0;
  let materialCount = 0;
  let lineCount = 0;
  let exerciseCount = 0;
  let choiceCount = 0;
  let romanizedLines = 0;
  let totalLines = 0;
  const units: number[] = [];
  const sceneIds = new Set<string>();

  for (const arc of library.level.arcs) {
    if (arc.tier !== library.level.tier) errors.push(`${arc.id}: tier mismatch`);
    for (const episode of arc.episodes) {
      if (episode.scenes.length !== 10) errors.push(`${episode.id}: ${episode.scenes.length} scenes`);
      for (const scene of episode.scenes) {
        sceneCount += 1;
        if (sceneIds.has(scene.id)) errors.push(`${scene.id}: duplicate scene id`);
        sceneIds.add(scene.id);
        materialCount += scene.materials.length;
        lineCount += scene.lines.length;
        exerciseCount += scene.exercises.length;
        choiceCount += scene.choices.length;
        totalLines += scene.lines.length;
        for (const line of scene.lines) {
          if (line.romanization) romanizedLines += 1;
          if ((library.language === "ja" || library.language === "zh") && !line.romanization) {
            errors.push(`${line.id}: missing romanization`);
          }
        }
        const sceneUnits = scene.lines.reduce(
          (total, line) => total + countTextUnits(line.text, line.script),
          0,
        );
        units.push(sceneUnits);
        validateScene(scene, library, errors, warnings);
      }
    }
  }

  const expectedScenes = 2 * 20 * 10;
  if (sceneCount !== expectedScenes) errors.push(`expected ${expectedScenes} scenes, got ${sceneCount}`);
  if (materialCount !== expectedScenes * 4) errors.push(`expected ${expectedScenes * 4} materials, got ${materialCount}`);
  if (library.counts.scenes !== sceneCount) errors.push(`counts.scenes mismatch`);
  if (library.counts.materials !== materialCount) errors.push(`counts.materials mismatch`);
  if (library.counts.lines !== lineCount) errors.push(`counts.lines mismatch`);
  if (library.counts.exercises !== exerciseCount) errors.push(`counts.exercises mismatch`);
  if (library.counts.choices !== choiceCount) errors.push(`counts.choices mismatch`);

  return {
    path,
    library,
    errors,
    warnings,
    sceneCount,
    materialCount,
    lineCount,
    exerciseCount,
    choiceCount,
    romanizedLines,
    totalLines,
    units,
  };
}

function main() {
  const args = process.argv.slice(2);
  const langArg = args.find((arg) => arg.startsWith("--lang="))?.slice("--lang=".length);
  const strict = args.includes("--strict");
  const files = libraryFiles(langArg);
  if (files.length === 0) {
    console.error("No story library files found. Run content:stories:generate first.");
    process.exit(1);
  }

  let scenes = 0;
  let materials = 0;
  let lines = 0;
  let exercises = 0;
  let choices = 0;
  let romanized = 0;
  let errorCount = 0;
  let warningCount = 0;
  const allUnits: number[] = [];
  const byLanguage = new Map<string, { scenes: number; materials: number; levels: number }>();

  for (const file of files) {
    const result = validateFile(file);
    if (result.library) {
      const language = result.library.language;
      const current = byLanguage.get(language) ?? { scenes: 0, materials: 0, levels: 0 };
      current.scenes += result.sceneCount;
      current.materials += result.materialCount;
      current.levels += 1;
      byLanguage.set(language, current);
    }
    scenes += result.sceneCount;
    materials += result.materialCount;
    lines += result.lineCount;
    exercises += result.exerciseCount;
    choices += result.choiceCount;
    romanized += result.romanizedLines;
    errorCount += result.errors.length;
    warningCount += result.warnings.length;
    allUnits.push(...result.units);

    const status = result.errors.length === 0 ? "✓" : "✗";
    console.log(
      `${status} ${relative(process.cwd(), file)} — ${result.sceneCount} scenes, ${result.materialCount} materials, ${result.lineCount} lines, ${result.errors.length} errors, ${result.warnings.length} warnings`,
    );
    for (const error of result.errors.slice(0, 10)) console.error(`   error: ${error}`);
    if (strict) {
      for (const warning of result.warnings.slice(0, 10)) console.error(`   warning: ${warning}`);
    }
  }

  console.log("\nPer language:");
  for (const [language, counts] of [...byLanguage.entries()].sort()) {
    const complete = counts.scenes === 2000 && counts.materials === 10000;
    console.log(
      `  ${complete ? "✓" : "·"} ${language}: ${counts.levels}/5 levels, ${counts.scenes} scenes, ${counts.materials} materials`,
    );
  }

  const min = allUnits.length ? Math.min(...allUnits) : 0;
  const max = allUnits.length ? Math.max(...allUnits) : 0;
  const avg = allUnits.length ? allUnits.reduce((a, b) => a + b, 0) / allUnits.length : 0;
  console.log(
    `\n${files.length} files · ${scenes} scenes · ${materials} materials · ${lines} lines · ${exercises} exercises · ${choices} choices`,
  );
  console.log(
    `romanization: ${romanized}/${lines} lines · text units: min ${min}, max ${max}, avg ${avg.toFixed(1)}`,
  );
  console.log(`${errorCount} errors, ${warningCount} warnings`);

  if (errorCount > 0 || (strict && warningCount > 0)) process.exit(1);
}

main();
