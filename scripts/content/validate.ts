import "dotenv/config";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { validateContentFile, type ContentUnitFile } from "./lib";

const dir = join(process.cwd(), "content", "pilot");
const files = readdirSync(dir).filter((name) => name.endsWith(".json"));
if (files.length === 0) throw new Error("Tidak ada file konten pilot");

let total = 0;
let failed = false;
for (const name of files) {
  const file = JSON.parse(readFileSync(join(dir, name), "utf8")) as ContentUnitFile;
  const errors = validateContentFile(file);
  total += file.lesson.questions.length;
  if (errors.length) {
    failed = true;
    console.error(`✗ ${name}`);
    for (const error of errors) console.error(`  - ${error}`);
  } else {
    console.log(`✓ ${name} — ${file.lesson.questions.length} soal`);
  }
}
if (failed) process.exit(1);
console.log(`✓ ${files.length} lesson, ${total} soal valid`);
