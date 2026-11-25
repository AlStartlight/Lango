import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { brotliCompressSync, constants as zlibConstants } from "node:zlib";

/**
 * Packs the generated story libraries into Brotli-compressed files that can be
 * shipped inside the server bundle. The raw library is ~649 MB; the packed
 * output is ~13 MB, which keeps Vercel function bundles within limits.
 *
 * The raw JSON stays in place for local development and content validation.
 */
const ROOT = process.cwd();
const STORIES = join(ROOT, "content", "stories");
const OUT = join(STORIES, "compiled");

function main() {
  const languages = readdirSync(STORIES).filter((entry) => {
    try {
      return readdirSync(join(STORIES, entry, "library")).length > 0;
    } catch {
      return false;
    }
  });

  let files = 0;
  let rawBytes = 0;
  let packedBytes = 0;

  for (const language of languages) {
    const sourceDir = join(STORIES, language, "library");
    const targetDir = join(OUT, language);
    mkdirSync(targetDir, { recursive: true });

    for (const file of readdirSync(sourceDir).filter((name) => name.endsWith(".json")).sort()) {
      const raw = readFileSync(join(sourceDir, file));
      const packed = brotliCompressSync(raw, {
        params: {
          [zlibConstants.BROTLI_PARAM_QUALITY]: 9,
          [zlibConstants.BROTLI_PARAM_SIZE_HINT]: raw.length,
        },
      });
      writeFileSync(join(targetDir, `${file}.br`), packed);
      files += 1;
      rawBytes += raw.length;
      packedBytes += packed.length;
    }
  }

  console.log(
    `Packed ${files} story libraries for ${languages.length} languages: ` +
      `${(rawBytes / 1024 / 1024).toFixed(1)} MiB -> ` +
      `${(packedBytes / 1024 / 1024).toFixed(1)} MiB`,
  );
}

main();
