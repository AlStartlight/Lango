import "dotenv/config";
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { answerKeyHash, sha256 } from "../content/fingerprint";
import { levelLibrarySchema } from "./schema";
import type { LibraryExport } from "./types";

const LANGUAGE_META: Record<string, { id: string; label: string; native: string; icon: string; iconColor: string; script: string; direction: string; uiLocale: string }> = {
  en: { id: "english", label: "English", native: "English", icon: "white-balance-sunny", iconColor: "#3f6900", script: "latn", direction: "ltr", uiLocale: "en" },
  es: { id: "spanish", label: "Spanish", native: "Español", icon: "white-balance-sunny", iconColor: "#3f6900", script: "latn", direction: "ltr", uiLocale: "es" },
  id: { id: "indonesian", label: "Indonesian", native: "Bahasa Indonesia", icon: "white-balance-sunny", iconColor: "#3f6900", script: "latn", direction: "ltr", uiLocale: "id" },
  ja: { id: "japanese", label: "Japanese", native: "日本語", icon: "flower", iconColor: "#ba1a1a", script: "jpan", direction: "ltr", uiLocale: "jp" },
  zh: { id: "chinese", label: "Mandarin", native: "中文", icon: "flower", iconColor: "#ba1a1a", script: "hans", direction: "ltr", uiLocale: "zh" },
  hi: { id: "hindi", label: "Hindi", native: "हिन्दी", icon: "flower", iconColor: "#006e2f", script: "deva", direction: "ltr", uiLocale: "hi" },
  de: { id: "german", label: "German", native: "Deutsch", icon: "white-balance-sunny", iconColor: "#3f6900", script: "latn", direction: "ltr", uiLocale: "de" },
  ar: { id: "arabic", label: "Arabic", native: "العربية", icon: "domain", iconColor: "#006e2f", script: "arab", direction: "rtl", uiLocale: "ar" },
  fr: { id: "french", label: "French", native: "Français", icon: "silverware-fork-knife", iconColor: "#785179", script: "latn", direction: "ltr", uiLocale: "fr" },
  pt: { id: "portuguese", label: "Portuguese", native: "Português", icon: "white-balance-sunny", iconColor: "#3f6900", script: "latn", direction: "ltr", uiLocale: "pt" },
  it: { id: "italian", label: "Italian", native: "Italiano", icon: "silverware-fork-knife", iconColor: "#785179", script: "latn", direction: "ltr", uiLocale: "it" },
  nl: { id: "dutch", label: "Dutch", native: "Nederlands", icon: "white-balance-sunny", iconColor: "#3f6900", script: "latn", direction: "ltr", uiLocale: "nl" },
  ko: { id: "korean", label: "Korean", native: "한국어", icon: "flower", iconColor: "#785179", script: "hang", direction: "ltr", uiLocale: "ko" },
};

type Row = Record<string, unknown>;
const COPY_DIR = "/tmp/lango-story-copy";

function copyEscape(value: unknown): string {
  if (value === null || value === undefined) return "\\N";
  if (Array.isArray(value)) {
    if (value.length === 0) return "{}";
    return `{${value.map((item) => `"${String(item).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`).join(",")}}`;
  }
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "boolean") return value ? "t" : "f";
  if (typeof value === "number") return String(value);
  if (typeof value === "object") return copyEscape(JSON.stringify(value));
  return String(value).replace(/\\/g, "\\\\").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r");
}

function sqlString(value: string): string {
  const tag = value.includes("$lango$") ? "$lango2$" : "$lango$";
  return `${tag}${value}${tag}`;
}

function sqlValue(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value instanceof Date) return `'${value.toISOString()}'::timestamptz`;
  if (Array.isArray(value)) return `ARRAY[${value.map((item) => sqlString(String(item))).join(",")}]::text[]`;
  if (typeof value === "object") return `${sqlString(JSON.stringify(value))}::jsonb`;
  return sqlString(String(value));
}

function writeTsv(directory: string, table: string, columns: string[], rows: Row[]): string | null {
  if (rows.length === 0) return null;
  const path = join(directory, `${table}.tsv`);
  writeFileSync(path, `${rows.map((row) => columns.map((column) => copyEscape(row[column])).join("\t")).join("\n")}\n`);
  return path;
}

function copyCommand(table: string, columns: string[], path: string): string {
  return `\\copy "${table}" (${columns.map((column) => `"${column}"`).join(",")}) FROM '${path}' WITH (FORMAT text, DELIMITER E'\\t', NULL '\\N')\n`;
}

function upsertSql(table: string, columns: string[], values: Row, conflictColumns: string[], updateColumns: string[]): string {
  const cols = columns.map((column) => `"${column}"`).join(",");
  const vals = columns
    .map((column) => {
      if (column === "sensitivityNotes" || column === "sources") {
        return values[column] == null ? "NULL" : `${sqlString(JSON.stringify(values[column]))}::jsonb`;
      }
      return sqlValue(values[column]);
    })
    .join(",");
  const updates = updateColumns.map((column) => `"${column}"=EXCLUDED."${column}"`).join(",");
  return `INSERT INTO "${table}" (${cols}) VALUES (${vals}) ON CONFLICT (${conflictColumns.map((column) => `"${column}"`).join(",")}) DO UPDATE SET ${updates};\n`;
}


function buildRows(library: LibraryExport, levelId: string) {
  const version = library.contentVersion;
  const now = new Date();
  const allScenes = library.level.arcs.flatMap((arc) => arc.episodes.flatMap((episode) => episode.scenes));
  const allQuestions = allScenes.flatMap((scene) => scene.exercises);
  const episodeOf = (sceneId: string) => {
    const arcId = sceneId.replace(/-p\d+$/, "");
    const sceneNumber = Number(sceneId.match(/-p(\d+)$/)?.[1] ?? "1");
    return `${arcId}-l${String(Math.ceil(sceneNumber / 10)).padStart(2, "0")}`;
  };

  const units = library.level.arcs.map((arc) => ({ id: arc.id, levelId, position: arc.seasonNo, title: arc.title, goal: arc.synopsis, checkpointQuestionCount: 20 }));
  const lessons = library.level.arcs.flatMap((arc) =>
    arc.episodes.map((episode) => ({ id: episode.id, unitId: arc.id, position: episode.episodeNo, slug: episode.id, title: episode.title, objective: episode.hook, skill: "story", kind: "story_episode", estimatedMinutes: 40, status: "published", contentVersion: version, version: 1, publishedAt: now })),
  );
  const passages = allScenes.map((scene) => ({
    id: scene.id,
    lessonId: episodeOf(scene.id),
    languageCode: library.language,
    kind: "story_scene",
    title: scene.title,
    body: scene.lines.map((line) => line.text).join("\n"),
    promptSupport: { romanization: scene.titleRomanization ?? null },
    translation: scene.lines.map((line) => line.translation.id).join("\n"),
    audioAssetId: null,
    wordCount: scene.lines.reduce((total, line) => total + line.text.split(/\s+/).length, 0),
    difficulty: library.level.position,
    fingerprint: sha256(`story|${scene.id}`),
  }));
  const questions = allQuestions.map((question) => {
    const scene = allScenes.find((item) => question.id.startsWith(item.id))!;
    const sceneNumber = Number(scene.id.match(/-p(\d+)$/)?.[1] ?? "1");
    return {
      id: question.id,
      lessonId: episodeOf(scene.id),
      passageId: scene.id,
      audioAssetId: null,
      position: ((sceneNumber - 1) % 10) * 5 + Number(question.id.split("-q")[1]),
      type: question.type,
      skill: question.skill,
      prompt: question.prompt,
      promptSupport: question.promptSupport ?? null,
      answerKey: question.answerKey,
      answerKeyHash: answerKeyHash(question.answerKey),
      explanation: question.explanation.en,
      explanationLocale: "en",
      conceptKey: question.conceptKey,
      difficulty: question.difficulty,
      tags: question.tags,
      fingerprint: sha256(`story|${question.id}`),
      status: "published",
      contentVersion: version,
      version: 1,
      source: "Lango story engine",
      license: "original",
      generationMeta: { method: "story-engine-v1", aiAssisted: true, humanReviewed: false },
      reviewedBy: null,
      reviewedAt: null,
      reviewStatus: "automated",
      updatedAt: now,
    };
  });
  const questionChoices = allQuestions.flatMap((question) => (question.choices ?? []).map((choice, index) => ({ questionId: question.id, id: choice.id, label: choice.text, position: index + 1, side: null })));
  const arcs = library.level.arcs.map((arc) => ({ id: arc.id, worldId: library.world.id, unitId: arc.id, seasonNo: arc.seasonNo, tier: arc.tier, framework: arc.framework, level: arc.levelCode, position: arc.seasonNo, title: arc.title, nativeTitle: arc.nativeTitle, synopsis: arc.synopsis, culturalAnchors: JSON.stringify(arc.culturalAnchors), cliffhanger: arc.cliffhanger, episodeCount: arc.episodes.length }));
  const episodes = library.level.arcs.flatMap((arc) => arc.episodes.map((episode) => ({ id: episode.id, lessonId: episode.id, arcId: arc.id, episodeNo: episode.episodeNo, title: episode.title, nativeTitle: episode.nativeTitle, hook: episode.hook, recap: episode.recap, cliffhanger: episode.cliffhanger, focusObject: episode.focusObject, culturalAnchor: episode.culturalAnchor, publishedAt: now })));
  const scenes = allScenes.map((scene) => ({ id: scene.id, passageId: scene.id, arcId: scene.id.replace(/-p\d+$/, ""), episodeId: episodeOf(scene.id), sceneNo: scene.sceneNo, title: scene.title, titleRomanization: scene.titleRomanization ?? null, titleTranslation: scene.titleTranslation, setting: scene.setting, estimatedMinutes: scene.estimatedMinutes, cliffhanger: scene.cliffhanger, cultureNoteIds: scene.cultureNoteIds, beat: scene.beat, contentVersion: version, status: "published", publishedAt: now }));
  const lines = allScenes.flatMap((scene) => scene.lines.map((line) => ({ id: line.id, sceneId: scene.id, order: line.order, speakerId: line.speakerId, speakerName: line.speakerName, text: line.text, script: line.script, reading: line.reading ?? null, romanization: line.romanization ?? null, translation: line.translation, tokens: line.tokens ? JSON.stringify(line.tokens) : null, audio: line.audio, audioStartMs: null, audioEndMs: null })));
  const materials = allScenes.flatMap((scene) => scene.materials.map((material) => ({ id: material.id, sceneId: scene.id, type: material.type, order: material.order, title: material.title, body: material.body, audio: material.audio ?? null })));
  const choices = allScenes.flatMap((scene) => scene.choices.map((choice) => ({ id: choice.id, sceneId: scene.id, prompt: choice.prompt, options: JSON.stringify(choice.options), effects: choice.effects ?? null })));
  const reviews = allScenes.map((scene) => ({ id: `${scene.id}-review-qa`, sceneId: scene.id, reviewerId: "automated-story-engine", role: "qa", status: "pending", notes: "AI-assisted draft. Native language, culture and pedagogy review required before human sign-off.", checklist: { schema: true, romanization: true, cultureSource: true, answerKeyServerOnly: true, humanNativeReview: false, humanCultureReview: false, humanPedagogyReview: false } }));
  const revisions = allScenes.map((scene) => ({ id: `${scene.id}-v1`, sceneId: scene.id, version: 1, contentVersion: version, snapshot: { title: scene.title, lineCount: scene.lines.length, exerciseCount: scene.exercises.length, materialTypes: scene.materials.map((material) => material.type), checksum: sha256(JSON.stringify(scene)) }, publishedAt: now }));
  return { units, lessons, passages, questions, questionChoices, arcs, episodes, scenes, lines, materials, choices, reviews, revisions };
}

const COLUMNS: Record<string, string[]> = {
  CurriculumUnit: ["id", "levelId", "position", "title", "goal", "checkpointQuestionCount"],
  CurriculumLesson: ["id", "unitId", "position", "slug", "title", "objective", "skill", "kind", "estimatedMinutes", "status", "contentVersion", "version", "publishedAt"],
  Passage: ["id", "lessonId", "languageCode", "kind", "title", "body", "promptSupport", "translation", "audioAssetId", "wordCount", "difficulty", "fingerprint"],
  Question: ["id", "lessonId", "passageId", "audioAssetId", "position", "type", "skill", "prompt", "promptSupport", "answerKey", "answerKeyHash", "explanation", "explanationLocale", "conceptKey", "difficulty", "tags", "fingerprint", "status", "contentVersion", "version", "source", "license", "generationMeta", "reviewedBy", "reviewedAt", "reviewStatus", "updatedAt"],
  QuestionChoice: ["questionId", "id", "label", "position", "side"],
  StoryArcMeta: ["id", "worldId", "unitId", "seasonNo", "tier", "framework", "level", "position", "title", "nativeTitle", "synopsis", "culturalAnchors", "cliffhanger", "episodeCount"],
  StoryEpisodeMeta: ["id", "lessonId", "arcId", "episodeNo", "title", "nativeTitle", "hook", "recap", "cliffhanger", "focusObject", "culturalAnchor", "publishedAt"],
  StorySceneMeta: ["id", "passageId", "arcId", "episodeId", "sceneNo", "title", "titleRomanization", "titleTranslation", "setting", "estimatedMinutes", "cliffhanger", "cultureNoteIds", "beat", "contentVersion", "status", "publishedAt"],
  StoryLine: ["id", "sceneId", "order", "speakerId", "speakerName", "text", "script", "reading", "romanization", "translation", "tokens", "audio", "audioStartMs", "audioEndMs"],
  StoryMaterial: ["id", "sceneId", "type", "order", "title", "body", "audio"],
  StoryChoice: ["id", "sceneId", "prompt", "options", "effects"],
  StoryReview: ["id", "sceneId", "reviewerId", "role", "status", "notes", "checklist"],
  StoryRevision: ["id", "sceneId", "version", "contentVersion", "snapshot", "publishedAt"],
};

export function metadataSql(library: LibraryExport): { sql: string; levelId: string } {
  const meta = LANGUAGE_META[library.language];
  if (!meta) throw new Error(`Unknown language ${library.language}`);
  const curriculumId = `${library.language}-${library.level.framework.toLowerCase()}`;
  const levelId = `${curriculumId}-${library.level.levelCode.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
  const now = new Date();
  const world = library.world;
  const parts: string[] = [];
  parts.push(
    upsertSql(
      "Language",
      ["id", "code", "uiLocale", "label", "native", "icon", "iconColor", "script", "direction", "isFeatured", "isActive", "updatedAt"],
      { ...meta, code: library.language, isFeatured: ["en", "es"].includes(library.language), isActive: true, updatedAt: now },
      ["code"],
      ["label", "native", "uiLocale", "script", "direction", "isActive", "updatedAt"],
    ),
  );
  parts.push(
    upsertSql(
      "Curriculum",
      ["id", "languageCode", "framework", "variant", "version", "status", "publishedAt", "updatedAt"],
      { id: curriculumId, languageCode: library.language, framework: library.level.framework, variant: "story-first", version: library.contentVersion, status: "published", publishedAt: now, updatedAt: now },
      ["languageCode", "framework"],
      ["variant", "version", "status", "publishedAt", "updatedAt"],
    ),
  );
  parts.push(
    upsertSql(
      "CurriculumLevel",
      ["id", "curriculumId", "code", "position", "title", "description", "canDo", "estimatedHours"],
      { id: levelId, curriculumId, code: library.level.levelCode, position: library.level.position, title: library.level.label, description: `${world.title}: story-first level ${library.level.tier}`, canDo: [], estimatedHours: 90 },
      ["curriculumId", "code"],
      ["position", "title", "description", "canDo", "estimatedHours"],
    ),
  );
  parts.push(
    upsertSql(
      "StoryWorld",
      ["id", "languageCode", "slug", "title", "nativeTitle", "logline", "setting", "era", "tone", "sensitivityNotes", "coverAssetKey", "palette", "canon", "updatedAt"],
      { id: world.id, languageCode: world.languageCode, slug: world.slug, title: world.title, nativeTitle: world.nativeTitle, logline: world.logline, setting: world.setting, era: world.era, tone: world.tone, sensitivityNotes: world.sensitivityNotes, coverAssetKey: null, palette: world.palette, canon: world.canon, updatedAt: now },
      ["id"],
      ["languageCode", "slug", "title", "nativeTitle", "logline", "setting", "era", "tone", "sensitivityNotes", "palette", "canon", "updatedAt"],
    ),
  );
  parts.push(`DELETE FROM "StoryCharacter" WHERE "worldId"=${sqlString(world.id)};\n`);
  for (const character of world.characters) {
    parts.push(
      `INSERT INTO "StoryCharacter" ("id","worldId","name","nativeName","role","age","bio","avatarAssetKey","speechStyle","quote","position") VALUES (${[
        character.id, world.id, character.name, character.nativeName, character.role, character.age ?? null, character.bio, null, character.speechStyle ?? null, character.quote ?? null, character.position,
      ].map(sqlValue).join(",")});\n`,
    );
  }
  for (const note of world.cultureNotes) {
    parts.push(
      upsertSql(
        "StoryCultureNote",
        ["id", "languageCode", "worldId", "title", "body", "sources", "reflection", "sensitivityStatus", "stampId"],
        { id: note.id, languageCode: world.languageCode, worldId: world.id, title: note.title, body: note.body, sources: note.sources, reflection: note.reflection, sensitivityStatus: "reviewed-source-list", stampId: note.stampId ?? null },
        ["id"],
        ["title", "body", "sources", "reflection", "sensitivityStatus", "stampId"],
      ),
    );
  }
  return { sql: parts.join(""), levelId };
}

function libraryFiles(language?: string): string[] {
  const root = join(process.cwd(), "content", "stories");
  const languages = language ? [language] : readdirSync(root).filter((entry) => !entry.includes("."));
  const files: string[] = [];
  for (const lang of languages) {
    try {
      for (const file of readdirSync(join(root, lang, "library"))) if (file.endsWith(".json")) files.push(join(root, lang, "library", file));
    } catch {
      // no library
    }
  }
  return files.sort();
}

async function main() {
  const args = process.argv.slice(2);
  const langArg = args.find((arg) => arg.startsWith("--lang="))?.slice("--lang=".length);
  const files = libraryFiles(langArg);
  if (files.length === 0) throw new Error("No story library files found");
  mkdirSync(COPY_DIR, { recursive: true });
  const baseUrl = (process.env.DATABASE_URL ?? "").replace(/\?.*$/, "");
  if (!baseUrl) throw new Error("DATABASE_URL missing");
  const total = { scenes: 0, materials: 0, questions: 0, lines: 0 };
  for (const file of files) {
    const parsed = levelLibrarySchema.safeParse(JSON.parse(readFileSync(file, "utf8")));
    if (!parsed.success) throw new Error(`${file}: ${parsed.error.issues[0]?.message}`);
    const library = parsed.data;
    const { sql: metadata, levelId } = metadataSql(library);
    const directory = join(COPY_DIR, `${library.language}-${library.level.tier.toLowerCase()}`);
    mkdirSync(directory, { recursive: true });
    const rows = buildRows(library, levelId);
    const arcIds = library.level.arcs.map((arc) => arc.id);
    const sql: string[] = [
      "BEGIN;\n",
      "SET LOCAL statement_timeout = 0;\n",
      "SET LOCAL search_path TO lango;\n",
      metadata,
    ];
    sql.push(`DELETE FROM "CurriculumUnit" WHERE "id" IN (${arcIds.map((id) => sqlString(id)).join(",")});\n`);
    const order: Array<[keyof typeof rows, string]> = [
      ["units", "CurriculumUnit"],
      ["lessons", "CurriculumLesson"],
      ["passages", "Passage"],
      ["questions", "Question"],
      ["questionChoices", "QuestionChoice"],
      ["arcs", "StoryArcMeta"],
      ["episodes", "StoryEpisodeMeta"],
      ["scenes", "StorySceneMeta"],
      ["lines", "StoryLine"],
      ["materials", "StoryMaterial"],
      ["choices", "StoryChoice"],
      ["reviews", "StoryReview"],
      ["revisions", "StoryRevision"],
    ];
    for (const [key, table] of order) {
      const path = writeTsv(directory, table, COLUMNS[table], rows[key] as Row[]);
      if (path) sql.push(copyCommand(table, COLUMNS[table], path));
    }
    sql.push("COMMIT;\n");
    const scriptPath = join(directory, "import.sql");
    writeFileSync(scriptPath, sql.join(""));
    const result = spawnSync("psql", [baseUrl, "-v", "ON_ERROR_STOP=1", "-q", "-f", scriptPath], {
      encoding: "utf8",
      env: { ...process.env, PGOPTIONS: "-c search_path=lango" },
    });
    if (result.status !== 0) throw new Error(`psql failed for ${file}:\n${result.stderr}\n${result.stdout}`);
    total.scenes += rows.scenes.length;
    total.materials += rows.materials.length;
    total.questions += rows.questions.length;
    total.lines += rows.lines.length;
    console.log(`✓ ${library.language} ${library.level.tier}: ${rows.scenes.length} scenes, ${rows.materials.length} materials, ${rows.questions.length} questions, ${rows.lines.length} lines`);
  }
  console.log("\n✓ COPY import complete:", total);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error("✗ copy import failed:", error.stack ?? error.message);
    process.exit(1);
  });
}
