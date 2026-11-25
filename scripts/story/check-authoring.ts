import {
  assertWorldLexicon,
  hasKit,
  hasWorld,
  loadKit,
  loadWorld,
  mergedLexicon,
  validateKitCoverage,
  validateKitRomanization,
} from "./load";
import { STORY_LANGUAGES } from "./load";

function checkLanguage(language: string): string[] {
  const errors: string[] = [];
  if (!hasWorld(language)) errors.push(`missing content/stories/${language}/world.json`);
  if (!hasKit(language)) errors.push(`missing content/stories/${language}/kit.json`);
  if (errors.length > 0) return errors;

  try {
    const world = loadWorld(language);
    const kit = loadKit(language);
    errors.push(...validateKitCoverage(kit.data));
    errors.push(...validateKitRomanization(kit.data));
    errors.push(...assertWorldLexicon(world.data));
    const lexicon = mergedLexicon(world.data, kit.data);
    for (const [slot, items] of Object.entries(lexicon)) {
      if (items.length < 2) errors.push(`merged lexicon ${slot}: only ${items.length} items`);
    }
    if (world.data.anchors.length < 6) errors.push("world needs at least 6 culture anchors");
    if (world.data.characters.length < 4) errors.push("world needs at least 4 characters");
    if (world.data.arcs.length !== 10) errors.push("world needs exactly 10 arcs (5 tiers × 2 seasons)");
    if (kit.data.grammar.length < 5) errors.push("kit needs at least 5 grammar patterns");
    if (kit.data.frames.length < 80) errors.push("kit needs 80 frames (all master frame ids)");
  } catch (error) {
    errors.push((error as Error).message);
  }
  return errors;
}

function main() {
  const args = process.argv.slice(2);
  const langArg = args.find((arg) => arg.startsWith("--lang="))?.slice("--lang=".length);
  const languages = langArg ? [langArg] : [...STORY_LANGUAGES];
  let failed = 0;
  for (const language of languages) {
    const errors = checkLanguage(language);
    if (errors.length === 0) {
      const world = loadWorld(language).data;
      const kit = loadKit(language).data;
      const lexicon = mergedLexicon(world, kit);
      console.log(
        `✓ ${language} — ${world.characters.length} characters, ${world.anchors.length} anchors, ${kit.frames.length} frames, lexicon ${Object.entries(lexicon)
          .map(([slot, items]) => `${slot}:${items.length}`)
          .join(" ")}`,
      );
    } else {
      failed += 1;
      console.error(`✗ ${language} — ${errors.length} issue(s)`);
      for (const error of errors.slice(0, 30)) console.error(`  - ${error}`);
    }
  }
  if (failed > 0) process.exit(1);
}

main();
