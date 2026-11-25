import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Prisma } from "../../app/lib/generated/prisma/client";
import { answerKeyHash, sha256 } from "../content/fingerprint";
import { createContentPrisma } from "../content/prisma";
import { levelLibrarySchema } from "./schema";
import type { LibraryExport, SceneExport } from "./types";

const LANGUAGE_META: Record<
  string,
  { id: string; label: string; native: string; icon: string; iconColor: string; script: string; direction: string; uiLocale: string }
> = {
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

type CreateManyDelegate = {
  createMany: (args: { data: unknown[]; skipDuplicates?: boolean }) => Promise<unknown>;
};

async function insertRows(
  prisma: ReturnType<typeof createContentPrisma>,
  table: string,
  data: unknown[],
  size = 100,
): Promise<void> {
  for (const batch of chunk(data, size)) {
    await prisma.$transaction(
      async (tx) => {
        await tx.$executeRawUnsafe("SET LOCAL statement_timeout = 0");
        const delegate = (tx as unknown as Record<string, CreateManyDelegate>)[table];
        if (!delegate) throw new Error(`unknown table delegate ${table}`);
        await delegate.createMany({ data: batch, skipDuplicates: true });
      },
      { maxWait: 30_000, timeout: 300_000 },
    );
  }
}

function chunk<T>(items: T[], size = 400): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
  return chunks;
}

async function ensureLanguage(prisma: ReturnType<typeof createContentPrisma>, code: string): Promise<void> {
  const meta = LANGUAGE_META[code];
  if (!meta) throw new Error(`Unknown language ${code}`);
  await prisma.language.upsert({
    where: { code },
    update: {
      label: meta.label,
      native: meta.native,
      uiLocale: meta.uiLocale,
      script: meta.script,
      direction: meta.direction,
      isActive: true,
    },
    create: {
      id: meta.id,
      code,
      uiLocale: meta.uiLocale,
      label: meta.label,
      native: meta.native,
      icon: meta.icon,
      iconColor: meta.iconColor,
      script: meta.script,
      direction: meta.direction,
      isFeatured: ["en", "es"].includes(code),
    },
  });
}

async function ensureCurriculum(
  prisma: ReturnType<typeof createContentPrisma>,
  language: LibraryExport["language"],
  framework: string,
  version: string,
): Promise<string> {
  const id = `${language}-${framework.toLowerCase()}`;
  await prisma.curriculum.upsert({
    where: { languageCode_framework: { languageCode: language, framework } },
    update: { version, status: "published" },
    create: { id, languageCode: language, framework, variant: "story-first", version, status: "published" },
  });
  return id;
}

async function ensureLevel(
  prisma: ReturnType<typeof createContentPrisma>,
  curriculumId: string,
  levelCode: string,
  position: number,
  title: string,
  description: string,
): Promise<string> {
  const id = `${curriculumId}-${levelCode.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
  await prisma.curriculumLevel.upsert({
    where: { curriculumId_code: { curriculumId, code: levelCode } },
    update: { title, description, position, canDo: [], estimatedHours: 90 },
    create: {
      id,
      curriculumId,
      code: levelCode,
      position,
      title,
      description,
      canDo: [],
      estimatedHours: 90,
    },
  });
  const row = await prisma.curriculumLevel.findUnique({ where: { curriculumId_code: { curriculumId, code: levelCode } } });
  if (!row) throw new Error(`failed to create level ${levelCode}`);
  return row.id;
}

async function importWorld(
  prisma: ReturnType<typeof createContentPrisma>,
  library: LibraryExport,
): Promise<void> {
  const world = library.world;
  await prisma.storyWorld.upsert({
    where: { id: world.id },
    update: {
      languageCode: world.languageCode,
      slug: world.slug,
      title: world.title,
      nativeTitle: world.nativeTitle,
      logline: world.logline,
      setting: world.setting,
      era: world.era,
      tone: world.tone,
      palette: world.palette,
      sensitivityNotes: world.sensitivityNotes as Prisma.InputJsonValue,
      canon: world.canon as Prisma.InputJsonValue,
    },
    create: {
      id: world.id,
      languageCode: world.languageCode,
      slug: world.slug,
      title: world.title,
      nativeTitle: world.nativeTitle,
      logline: world.logline,
      setting: world.setting,
      era: world.era,
      tone: world.tone,
      palette: world.palette,
      sensitivityNotes: world.sensitivityNotes as Prisma.InputJsonValue,
      canon: world.canon as Prisma.InputJsonValue,
    },
  });

  await prisma.storyCharacter.deleteMany({ where: { worldId: world.id } });
  await prisma.storyCharacter.createMany({
    data: world.characters.map((character) => ({
      id: character.id,
      worldId: world.id,
      name: character.name,
      nativeName: character.nativeName,
      role: character.role,
      age: character.age ?? null,
      bio: character.bio,
      avatarAssetKey: null,
      speechStyle: character.speechStyle ?? null,
      quote: character.quote ?? null,
      position: character.position,
    })),
  });

  for (const note of world.cultureNotes) {
    await prisma.storyCultureNote.upsert({
      where: { id: note.id },
      update: {
        languageCode: world.languageCode,
        worldId: world.id,
        title: note.title,
        body: note.body as Prisma.InputJsonValue,
        sources: note.sources as Prisma.InputJsonValue,
        reflection: note.reflection as Prisma.InputJsonValue,
        sensitivityStatus: "reviewed-source-list",
        stampId: note.stampId ?? null,
      },
      create: {
        id: note.id,
        languageCode: world.languageCode,
        worldId: world.id,
        title: note.title,
        body: note.body as Prisma.InputJsonValue,
        sources: note.sources as Prisma.InputJsonValue,
        reflection: note.reflection as Prisma.InputJsonValue,
        sensitivityStatus: "reviewed-source-list",
        stampId: note.stampId ?? null,
      },
    });
  }
}

async function importLevel(
  prisma: ReturnType<typeof createContentPrisma>,
  library: LibraryExport,
  levelId: string,
): Promise<{ lessons: number; questions: number; lines: number; materials: number }> {
  const arcIds = library.level.arcs.map((arc) => arc.id);
  // Story metadata and the structural Curriculum rows cascade from the unit.
  // Learner progress rows intentionally have no FK to these rows, so re-import
  // keeps a learner's scene IDs and history.
  await prisma.curriculumUnit.deleteMany({ where: { id: { in: arcIds } } });

  const scenes = library.level.arcs.flatMap((arc) => arc.episodes.flatMap((episode) => episode.scenes));
  const allLines = scenes.flatMap((scene) => scene.lines);
  const allMaterials = scenes.flatMap((scene) => scene.materials);
  const allQuestions = scenes.flatMap((scene) => scene.exercises);
  const episodeRows = library.level.arcs.flatMap((arc) => arc.episodes);
  const version = library.contentVersion;
  const now = new Date();

  const units = library.level.arcs.map((arc) => ({
    id: arc.id,
    levelId,
    position: arc.seasonNo,
    title: arc.title,
    goal: arc.synopsis,
    checkpointQuestionCount: 20,
  }));
  const lessons = episodeRows.map((episode, index) => {
    const arc = library.level.arcs.find((item) => episode.id.startsWith(item.id))!;
    return {
      id: episode.id,
      unitId: arc.id,
      position: episode.episodeNo,
      slug: episode.id,
      title: episode.title,
      objective: episode.hook,
      skill: "story",
      kind: "story_episode",
      estimatedMinutes: 40,
      status: "published",
      contentVersion: version,
      version: 1,
      publishedAt: now,
    };
  });
  const passages = scenes.map((scene) => {
    const arcId = scene.id.replace(/-p\d+$/, "");
    const sceneNumber = Number(scene.id.match(/-p(\d+)$/)?.[1] ?? "1");
    const episodeId = `${arcId}-l${String(Math.ceil(sceneNumber / 10)).padStart(2, "0")}`;
    return {
      id: scene.id,
      lessonId: episodeId,
      languageCode: library.language,
      kind: "story_scene",
      title: scene.title,
      body: scene.lines.map((line) => line.text).join("\n"),
      promptSupport: { romanization: scene.titleRomanization ?? null } as Prisma.InputJsonValue,
      translation: scene.lines.map((line) => line.translation.id).join("\n"),
      audioAssetId: null,
      wordCount: scene.lines.reduce((total, line) => total + line.text.split(/\s+/).length, 0),
      difficulty: library.level.position,
      fingerprint: sha256(`story|${scene.id}`),
    };
  });
  const questions = allQuestions.map((question) => {
    const scene = scenes.find((item) => question.id.startsWith(item.id))!;
    const arcId = scene.id.replace(/-p\d+$/, "");
    const sceneNumber = Number(scene.id.match(/-p(\d+)$/)?.[1] ?? "1");
    const episodeId = `${arcId}-l${String(Math.ceil(sceneNumber / 10)).padStart(2, "0")}`;
    return {
      id: question.id,
      lessonId: episodeId,
      passageId: scene.id,
      audioAssetId: null,
      position: ((sceneNumber - 1) % 10) * 5 + Number(question.id.split("-q")[1]),
      type: question.type,
      skill: question.skill,
      prompt: question.prompt,
      promptSupport: (question.promptSupport ?? null) as Prisma.InputJsonValue,
      answerKey: question.answerKey as Prisma.InputJsonValue,
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
      generationMeta: {
        method: "story-engine-v1",
        aiAssisted: true,
        humanReviewed: false,
      } as Prisma.InputJsonValue,
      reviewStatus: "automated",
      reviewedBy: null,
      reviewedAt: null,
    };
  });

  await insertRows(prisma, "curriculumUnit", units, 100);
  await insertRows(prisma, "curriculumLesson", lessons, 100);
  await insertRows(prisma, "passage", passages, 40);
  await insertRows(prisma, "question", questions, 80);
  const questionChoiceRows = allQuestions.flatMap((question) =>
    (question.choices ?? []).map((choice, index) => ({
      questionId: question.id,
      id: choice.id,
      label: choice.text,
      position: index + 1,
      side: null,
    })),
  );
  await insertRows(prisma, "questionChoice", questionChoiceRows, 200);

  const arcRows = library.level.arcs.map((arc) => ({
    id: arc.id,
    worldId: library.world.id,
    unitId: arc.id,
    seasonNo: arc.seasonNo,
    tier: arc.tier,
    framework: arc.framework,
    level: arc.levelCode,
    position: arc.seasonNo,
    title: arc.title,
    nativeTitle: arc.nativeTitle,
    synopsis: arc.synopsis,
    culturalAnchors: arc.culturalAnchors as Prisma.InputJsonValue,
    cliffhanger: arc.cliffhanger,
    episodeCount: arc.episodes.length,
  }));
  const episodeMetas = episodeRows.map((episode) => {
    const arc = library.level.arcs.find((item) => episode.id.startsWith(item.id))!;
    return {
      id: episode.id,
      lessonId: episode.id,
      arcId: arc.id,
      episodeNo: episode.episodeNo,
      title: episode.title,
      nativeTitle: episode.nativeTitle,
      hook: episode.hook,
      recap: episode.recap,
      cliffhanger: episode.cliffhanger,
      focusObject: episode.focusObject,
      culturalAnchor: episode.culturalAnchor,
      publishedAt: now,
    };
  });
  const sceneMetas = scenes.map((scene) => {
    const arcId = scene.id.replace(/-p\d+$/, "");
    const sceneNumber = Number(scene.id.match(/-p(\d+)$/)?.[1] ?? "1");
    const episodeId = `${arcId}-l${String(Math.ceil(sceneNumber / 10)).padStart(2, "0")}`;
    return {
    id: scene.id,
    passageId: scene.id,
    arcId,
    episodeId,
    sceneNo: scene.sceneNo,
    title: scene.title,
    titleRomanization: scene.titleRomanization ?? null,
    titleTranslation: scene.titleTranslation as Prisma.InputJsonValue,
    setting: scene.setting,
    estimatedMinutes: scene.estimatedMinutes,
    cliffhanger: scene.cliffhanger,
    cultureNoteIds: scene.cultureNoteIds,
    beat: scene.beat as Prisma.InputJsonValue,
    contentVersion: version,
    status: "published",
    publishedAt: now,
    };
  });
  const lines = allLines.map((line) => ({
    id: line.id,
    sceneId: line.id.replace(/-s\d+$/, ""),
    order: line.order,
    speakerId: line.speakerId,
    speakerName: line.speakerName,
    text: line.text,
    script: line.script,
    reading: line.reading ?? null,
    romanization: (line.romanization ?? null) as Prisma.InputJsonValue,
    translation: line.translation as Prisma.InputJsonValue,
    tokens: (line.tokens ?? null) as Prisma.InputJsonValue,
    audio: line.audio as Prisma.InputJsonValue,
    audioStartMs: null,
    audioEndMs: null,
  }));
  const materials = allMaterials.map((material) => ({
    id: material.id,
    sceneId: material.id.replace(/-m\d+$/, ""),
    type: material.type,
    order: material.order,
    title: material.title,
    body: material.body as Prisma.InputJsonValue,
    audio: (material.audio ?? null) as Prisma.InputJsonValue,
  }));
  const choiceRows = scenes.flatMap((scene) =>
    scene.choices.map((choice) => ({
      id: choice.id,
      sceneId: scene.id,
      prompt: choice.prompt,
      options: choice.options as Prisma.InputJsonValue,
      effects: (choice.effects ?? null) as Prisma.InputJsonValue,
    })),
  );
  const reviews = scenes.map((scene) => ({
    id: `${scene.id}-review-qa`,
    sceneId: scene.id,
    reviewerId: "automated-story-engine",
    role: "qa",
    status: "pending",
    notes: "AI-assisted draft. Native language, culture and pedagogy review required before human sign-off.",
    checklist: {
      schema: true,
      romanization: true,
      cultureSource: true,
      answerKeyServerOnly: true,
      humanNativeReview: false,
      humanCultureReview: false,
      humanPedagogyReview: false,
    } as Prisma.InputJsonValue,
  }));
  const revisions = scenes.map((scene) => ({
    id: `${scene.id}-v1`,
    sceneId: scene.id,
    version: 1,
    contentVersion: version,
    snapshot: {
      title: scene.title,
      lineCount: scene.lines.length,
      exerciseCount: scene.exercises.length,
      materialTypes: scene.materials.map((material) => material.type),
      checksum: sha256(JSON.stringify(scene)),
    } as Prisma.InputJsonValue,
    publishedAt: now,
  }));

  await insertRows(prisma, "storyArcMeta", arcRows, 50);
  await insertRows(prisma, "storyEpisodeMeta", episodeMetas, 100);
  await insertRows(prisma, "storySceneMeta", sceneMetas, 80);
  await insertRows(prisma, "storyLine", lines, 120);
  await insertRows(prisma, "storyMaterial", materials, 50);
  await insertRows(prisma, "storyChoice", choiceRows, 100);
  await insertRows(prisma, "storyReview", reviews, 100);
  await insertRows(prisma, "storyRevision", revisions, 50);

  return { lessons: lessons.length, questions: questions.length, lines: lines.length, materials: materials.length };
}

function libraryFiles(language?: string): string[] {
  const root = join(process.cwd(), "content", "stories");
  const languages = language ? [language] : readdirSync(root).filter((entry) => !entry.includes("."));
  const files: string[] = [];
  for (const lang of languages) {
    try {
      for (const file of readdirSync(join(root, lang, "library"))) {
        if (file.endsWith(".json")) files.push(join(root, lang, "library", file));
      }
    } catch {
      // no library
    }
  }
  return files.sort();
}

async function recomputeTotals(prisma: ReturnType<typeof createContentPrisma>, language: string): Promise<void> {
  const curricula = await prisma.curriculum.findMany({
    where: { languageCode: language },
    include: { levels: { include: { units: { include: { lessons: { where: { status: "published" }, include: { questions: { where: { status: "published" } } } } } } } } },
  });
  for (const curriculum of curricula) {
    let totalQuestions = 0;
    let totalLessons = 0;
    for (const level of curriculum.levels) {
      let levelQuestions = 0;
      let levelLessons = 0;
      for (const unit of level.units) {
        for (const lesson of unit.lessons) {
          levelLessons += 1;
          levelQuestions += lesson.questions.length;
        }
      }
      totalQuestions += levelQuestions;
      totalLessons += levelLessons;
      await prisma.curriculumLevel.update({
        where: { id: level.id },
        data: { totalQuestions: levelQuestions, totalLessons: levelLessons },
      });
    }
    await prisma.curriculum.update({
      where: { id: curriculum.id },
      data: { totalQuestions, totalLessons, status: totalLessons > 0 ? "published" : "draft" },
    });
  }
}

async function main() {
  const args = process.argv.slice(2);
  const langArg = args.find((arg) => arg.startsWith("--lang="))?.slice("--lang=".length);
  const files = libraryFiles(langArg);
  if (files.length === 0) throw new Error("No library files found. Run content:stories:generate first.");
  const prisma = createContentPrisma();
  let totals = { lessons: 0, questions: 0, lines: 0, materials: 0 };
  try {
    for (const file of files) {
      const parsed = levelLibrarySchema.safeParse(JSON.parse(readFileSync(file, "utf8")));
      if (!parsed.success) {
        throw new Error(`${file}: ${parsed.error.issues.slice(0, 3).map((issue) => issue.message).join("; ")}`);
      }
      const library = parsed.data;
      await ensureLanguage(prisma, library.language);
      const curriculumId = await ensureCurriculum(prisma, library.language, library.level.framework, library.contentVersion);
      const levelId = await ensureLevel(
        prisma,
        curriculumId,
        library.level.levelCode,
        library.level.position,
        library.level.label,
        `${library.world.title}: story-first level ${library.level.tier}`,
      );
      await importWorld(prisma, library);
      const counts = await importLevel(prisma, library, levelId);
      totals = {
        lessons: totals.lessons + counts.lessons,
        questions: totals.questions + counts.questions,
        lines: totals.lines + counts.lines,
        materials: totals.materials + counts.materials,
      };
      console.log(
        `✓ ${library.language} ${library.level.tier}: ${counts.lessons} lessons, ${counts.questions} questions, ${counts.lines} lines, ${counts.materials} materials`,
      );
    }
    const languages = [...new Set(files.map((file) => JSON.parse(readFileSync(file, "utf8")).language as string))];
    for (const language of languages) await recomputeTotals(prisma, language);
    console.log(`\n✓ imported ${files.length} level libraries:`, totals);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("✗ story import failed:", error.stack ?? error.message);
  process.exit(1);
});
