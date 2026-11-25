import "dotenv/config";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { metadataSql } from "./copy-import";
import type { LibraryExport } from "./types";

function main() {
  const root = join(process.cwd(), "content", "stories");
  const languages = readdirSync(root).filter((entry) => !entry.includes("."));
  const statements: string[] = [
    "BEGIN;\n",
    "SET LOCAL statement_timeout = 0;\n",
    "SET LOCAL search_path TO lango;\n",
  ];
  for (const language of languages) {
    const directory = join(root, language, "library");
    let files: string[] = [];
    try {
      files = readdirSync(directory).filter((file) => file.endsWith(".json")).sort();
    } catch {
      continue;
    }
    if (files.length === 0) continue;
    const library = JSON.parse(readFileSync(join(directory, files[0]), "utf8")) as LibraryExport;
    statements.push(metadataSql(library).sql);
  }
  statements.push("COMMIT;\n");
  const path = "/tmp/lango-story-worlds.sql";
  writeFileSync(path, statements.join(""));
  const baseUrl = (process.env.DATABASE_URL ?? "").replace(/\?.*$/, "");
  if (!baseUrl) throw new Error("DATABASE_URL missing");
  const result = spawnSync("psql", [baseUrl, "-v", "ON_ERROR_STOP=1", "-q", "-f", path], {
    encoding: "utf8",
    env: { ...process.env, PGOPTIONS: "-c search_path=lango" },
  });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  console.log(`✓ initialized story worlds, characters and culture notes for ${languages.length} languages`);
}

main();
