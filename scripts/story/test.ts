import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { MASTER_FRAMES } from "./master-frames";
import {
  loadKit,
  loadWorld,
  validateKitCoverage,
  validateKitRomanization,
} from "./load";
import { levelLibrarySchema } from "./schema";

const LANGUAGES = ["en", "es", "id", "ja", "zh", "hi", "de", "ar", "fr", "pt", "it", "nl", "ko"] as const;

function testFrames(): void {
  assert.equal(MASTER_FRAMES.length, 80, "80 master frames");
  assert.equal(new Set(MASTER_FRAMES.map((frame) => frame.id)).size, 80, "unique frame ids");
  for (const level of [1, 2, 3, 4, 5]) {
    for (const beat of ["context", "greeting", "task", "request", "complication", "clue", "turn", "cliffhanger"]) {
      assert.equal(
        MASTER_FRAMES.filter((frame) => frame.level === level && frame.beat === beat).length,
        2,
        `level ${level} ${beat} has 2 frames`,
      );
    }
  }
}

function testPacks(): void {
  for (const language of LANGUAGES) {
    const world = loadWorld(language);
    const kit = loadKit(language);
    assert.equal(world.data.levels.length, 5, `${language} has five levels`);
    assert.equal(world.data.arcs.length, 10, `${language} has ten arc seeds`);
    assert.deepEqual(validateKitCoverage(kit.data), [], `${language} kit covers every master frame`);
    assert.deepEqual(validateKitRomanization(kit.data), [], `${language} kit romanization is complete`);
  }
}

function testLibraries(): void {
  const manifest = JSON.parse(
    readFileSync(join(process.cwd(), "content", "stories", "manifest.json"), "utf8"),
  ) as {
    totals: { languages: number; episodes: number; scenes: number; materials: number; learningObjects: number; minMaterialsPerEpisode: number; maxMaterialsPerEpisode: number };
    libraries: Array<{ language: string; minMaterialsPerEpisode: number; maxMaterialsPerEpisode: number }>;
  };
  assert.equal(manifest.totals.languages, 13);
  assert.equal(manifest.totals.episodes, 2600);
  assert.equal(manifest.totals.scenes, 26000);
  assert.equal(manifest.totals.materials, 104000);
  assert.equal(manifest.totals.learningObjects, 130000);
  assert.ok(manifest.totals.minMaterialsPerEpisode >= 20, "each story has at least 20 materials");
  assert.ok(manifest.totals.maxMaterialsPerEpisode <= 100, "each story has at most 100 materials");
  for (const library of manifest.libraries) {
    assert.equal(library.minMaterialsPerEpisode, 50);
    assert.equal(library.maxMaterialsPerEpisode, 50);
  }

  let scenes = 0;
  let materials = 0;
  let lines = 0;
  for (const language of LANGUAGES) {
    const directory = join(process.cwd(), "content", "stories", language, "library");
    const files = readdirSync(directory).filter((file) => file.endsWith(".json"));
    assert.equal(files.length, 5, `${language} has five level files`);
    for (const file of files) {
      const parsed = levelLibrarySchema.safeParse(JSON.parse(readFileSync(join(directory, file), "utf8")));
      assert.equal(parsed.success, true, `${language}/${file} passes schema`);
      if (!parsed.success) continue;
      const library = parsed.data;
      assert.equal(library.level.arcs.length, 2);
      assert.equal(library.counts.scenes, 400);
      assert.equal(library.counts.materials, 1600);
      for (const arc of library.level.arcs) {
        assert.equal(arc.episodes.length, 20);
        for (const episode of arc.episodes) {
          assert.equal(episode.scenes.length, 10);
          for (const scene of episode.scenes) {
            assert.equal(scene.materials.length, 4);
            assert.ok(scene.exercises.length >= 3 && scene.exercises.length <= 6);
            assert.ok(scene.lines.length >= 6 && scene.lines.length <= 12);
            if (language === "ja" || language === "zh") {
              for (const line of scene.lines) assert.ok(line.romanization?.value, `${line.id} romanized`);
            }
          }
        }
      }
      scenes += library.counts.scenes;
      materials += library.counts.materials;
      lines += library.counts.lines;
    }
  }
  assert.equal(scenes, 26000);
  assert.equal(materials, 104000);
  assert.ok(lines > 200000, "more than 200k story lines");
}

function testRomanizationSamples(): void {
  const ja = JSON.parse(
    readFileSync(join(process.cwd(), "content", "stories", "ja", "library", "ja-komorebi-t1.json"), "utf8"),
  );
  const jaLine = ja.level.arcs[0].episodes[0].scenes[0].lines.find(
    (line: { romanization?: { value: string } }) => line.romanization?.value,
  );
  assert.ok(jaLine.romanization.value.length > 0);
  assert.match(jaLine.romanization.value, /^[A-Z]/);

  const zh = JSON.parse(
    readFileSync(join(process.cwd(), "content", "stories", "zh", "library", "zh-hutong-moli-t1.json"), "utf8"),
  );
  const zhLines = zh.level.arcs[0].episodes[0].scenes[0].lines;
  assert.ok(zhLines.every((line: { romanization?: { value: string } }) => line.romanization?.value));
  const pinyin = zhLines.map((line: { romanization: { value: string } }) => line.romanization.value).join(" ");
  assert.match(pinyin, /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/);
}

function main(): void {
  testFrames();
  testPacks();
  testLibraries();
  testRomanizationSamples();
  console.log("✓ story test suite passed");
  console.log("  80 master frames · 13 language packs · 26,000 scenes · 104,000 supporting materials");
  console.log("  2,600 episodes/stories · 50 learning objects per story (PRD target 20–100) · 130,000 total objects");
}

main();
