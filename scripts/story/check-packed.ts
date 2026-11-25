import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { brotliDecompressSync } from "node:zlib";

/**
 * Verifies that the committed Brotli libraries under content/stories/compiled
 * match what scripts/story/pack.ts would produce from the generated JSON.
 *
 * Run `npm run content:stories:generate` first so the raw libraries exist.
 */
const ROOT = process.cwd();
const STORIES = join(ROOT, "content", "stories");
const COMPILED = join(STORIES, "compiled");

function comparable(raw: Buffer): string {
  const parsed = JSON.parse(raw.toString("utf8")) as Record<string, unknown>;
  // The generator records the generation time; it is metadata, not content.
  // Normalizing it keeps the check deterministic across runs and CI machines.
  parsed.generatedAt = null;
  return JSON.stringify(parsed);
}

function main() {
  if (!existsSync(STORIES)) {
    console.error("content/stories is missing.");
    process.exit(1);
  }

  const languages = readdirSync(STORIES).filter((entry) => {
    try {
      return readdirSync(join(STORIES, entry, "library")).some((file) =>
        file.endsWith(".json"),
      );
    } catch {
      return false;
    }
  });

  if (languages.length === 0) {
    console.error(
      "No raw story libraries found. Run `npm run content:stories:generate` first.",
    );
    process.exit(1);
  }

  const problems: string[] = [];
  const expected = new Set<string>();
  let checked = 0;

  for (const language of languages) {
    const sourceDir = join(STORIES, language, "library");
    const targetDir = join(COMPILED, language);

    for (const file of readdirSync(sourceDir).filter((name) => name.endsWith(".json"))) {
      const relative = `${language}/${file}.br`;
      expected.add(relative);
      const target = join(targetDir, `${file}.br`);

      if (!existsSync(target)) {
        problems.push(`missing  ${relative}`);
        continue;
      }

      const actual = comparable(brotliDecompressSync(readFileSync(target)));
      const wanted = comparable(readFileSync(join(sourceDir, file)));
      checked += 1;

      // Compare decoded content, not compressed bytes: Brotli output can
      // differ across Node/zlib versions while representing the same library.
      if (actual !== wanted) {
        problems.push(`stale    ${relative}`);
      }
    }

    if (existsSync(targetDir)) {
      for (const file of readdirSync(targetDir).filter((name) => name.endsWith(".br"))) {
        const relative = `${language}/${file}`;
        if (!expected.has(relative)) problems.push(`orphaned ${relative}`);
      }
    }
  }

  if (problems.length > 0) {
    console.error(
      "Packed story libraries are out of date. " +
        "Run `npm run content:stories:pack` and commit the result.\n",
    );
    for (const problem of problems) console.error(`  ${problem}`);
    process.exit(1);
  }

  console.log(
    `Packed story libraries are up to date (${checked} files, ${languages.length} languages).`,
  );
}

main();
