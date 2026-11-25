import "dotenv/config";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  answerKeyHash,
  contentJson,
  createPrismaClient,
  fingerprint,
  validateContentFile,
  type ContentUnitFile,
} from "./lib";

function argValue(flag: string, fallback: string): string {
  const eq = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (eq) return eq.split("=").slice(1).join("=");
  const index = process.argv.indexOf(flag);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const releaseVersion = argValue("--release", "2026.11.0-pilot");

async function main() {
  const prisma = createPrismaClient();
  const dir = join(process.cwd(), "content", "pilot");
  const files = readdirSync(dir).filter((name) => name.endsWith(".json"));
  if (!files.length) throw new Error("Tidak ada file konten pilot");

  const parsed = files.map((name) => {
    const file = JSON.parse(readFileSync(join(dir, name), "utf8")) as ContentUnitFile;
    const errors = validateContentFile(file);
    if (errors.length) throw new Error(`${name}:\n${errors.join("\n")}`);
    return file;
  });

  const job = await prisma.contentImportJob.create({
    data: { releaseVersion, status: "running" },
  });

  try {
    for (const file of parsed) {
      const language = await prisma.language.findUnique({
        where: { code: file.curriculum.languageCode },
      });
      if (!language) throw new Error(`Language ${file.curriculum.languageCode} belum ada`);

      const curriculum = await prisma.curriculum.upsert({
        where: {
          languageCode_framework: {
            languageCode: file.curriculum.languageCode,
            framework: file.curriculum.framework,
          },
        },
        update: {
          version: file.contentVersion,
          status: file.curriculum.status,
          variant: file.curriculum.variant,
        },
        create: {
          id: file.curriculum.id,
          languageCode: file.curriculum.languageCode,
          framework: file.curriculum.framework,
          variant: file.curriculum.variant,
          version: file.contentVersion,
          status: file.curriculum.status,
        },
      });

      const level = await prisma.curriculumLevel.upsert({
        where: {
          curriculumId_code: { curriculumId: curriculum.id, code: file.level.code },
        },
        update: {
          position: file.level.position,
          title: file.level.title,
          description: file.level.description,
          canDo: file.level.canDo,
          estimatedHours: file.level.estimatedHours,
        },
        create: {
          id: `${curriculum.id}-${file.level.code.toLowerCase()}`,
          curriculumId: curriculum.id,
          code: file.level.code,
          position: file.level.position,
          title: file.level.title,
          description: file.level.description,
          canDo: file.level.canDo,
          estimatedHours: file.level.estimatedHours,
        },
      });

      const unit = await prisma.curriculumUnit.upsert({
        where: { levelId_position: { levelId: level.id, position: file.unit.position } },
        update: {
          title: file.unit.title,
          goal: file.unit.goal,
          checkpointQuestionCount: file.unit.checkpointQuestionCount,
        },
        create: {
          id: file.unit.id,
          levelId: level.id,
          position: file.unit.position,
          title: file.unit.title,
          goal: file.unit.goal,
          checkpointQuestionCount: file.unit.checkpointQuestionCount,
        },
      });

      const lesson = await prisma.curriculumLesson.upsert({
        where: { unitId_position: { unitId: unit.id, position: file.lesson.position } },
        update: {
          slug: file.lesson.slug,
          title: file.lesson.title,
          objective: file.lesson.objective,
          skill: file.lesson.skill,
          estimatedMinutes: file.lesson.estimatedMinutes,
          contentVersion: file.contentVersion,
          status: "draft",
        },
        create: {
          id: file.lesson.id,
          unitId: unit.id,
          position: file.lesson.position,
          slug: file.lesson.slug,
          title: file.lesson.title,
          objective: file.lesson.objective,
          skill: file.lesson.skill,
          estimatedMinutes: file.lesson.estimatedMinutes,
          contentVersion: file.contentVersion,
          status: "draft",
        },
      });

      for (const [locale, material] of Object.entries(file.lesson.materials)) {
        await prisma.lessonLocalization.upsert({
          where: { lessonId_locale: { lessonId: lesson.id, locale } },
          update: { body: contentJson({ blocks: material.blocks }), title: file.lesson.title, objective: file.lesson.objective },
          create: {
            lessonId: lesson.id,
            locale,
            title: file.lesson.title,
            objective: file.lesson.objective,
            body: contentJson({ blocks: material.blocks }),
          },
        });
      }

      const incomingIds = file.lesson.questions.map((question) => question.id);
      await prisma.question.deleteMany({
        where: { lessonId: lesson.id, id: { notIn: incomingIds } },
      });

      for (const question of file.lesson.questions) {
        const fp = fingerprint(question, file.level.code);
        const hash = answerKeyHash(question);
        const data = {
          lessonId: lesson.id,
          position: question.position,
          type: question.type,
          skill: question.skill,
          prompt: question.prompt,
          answerKey: contentJson(question.answerKey),
          answerKeyHash: hash,
          explanation: question.explanations.en,
          explanationLocale: "en",
          conceptKey: question.conceptKey,
          difficulty: question.difficulty ?? 1,
          tags: question.tags ?? [],
          fingerprint: fp,
          contentVersion: file.contentVersion,
          status: "draft" as const,
          source: question.source ?? "Lango pilot",
          license: question.license ?? "original",
          reviewedBy: "Lango pilot review",
          reviewedAt: new Date(),
          reviewStatus: "sampled",
        };
        const saved = await prisma.question.upsert({
          where: { id: question.id },
          update: data,
          create: { id: question.id, ...data },
        });

        await prisma.questionChoice.deleteMany({ where: { questionId: saved.id } });
        if (question.choices?.length) {
          await prisma.questionChoice.createMany({
            data: question.choices.map((choice, index) => ({
              questionId: saved.id,
              id: choice.id,
              label: choice.label,
              position: index + 1,
            })),
          });
        }

        for (const [locale, explanation] of Object.entries(question.explanations)) {
          await prisma.questionLocalization.upsert({
            where: { questionId_locale: { questionId: saved.id, locale } },
            update: { explanation },
            create: { questionId: saved.id, locale, explanation },
          });
        }

        await prisma.questionRevision.upsert({
          where: { questionId_version: { questionId: saved.id, version: 1 } },
          update: {
            snapshot: contentJson({
              id: saved.id,
              prompt: question.prompt,
              choices: question.choices ?? [],
              answerKey: question.answerKey,
              explanations: question.explanations,
            }),
            answerKeyHash: hash,
          },
          create: {
            questionId: saved.id,
            version: 1,
            snapshot: contentJson({
              id: saved.id,
              prompt: question.prompt,
              choices: question.choices ?? [],
              answerKey: question.answerKey,
              explanations: question.explanations,
            }),
            answerKeyHash: hash,
          },
        });
      }

      console.log(
        `✓ import ${lesson.id} — ${file.lesson.questions.length} soal (${file.curriculum.languageCode})`,
      );
    }

    await prisma.contentImportJob.update({
      where: { id: job.id },
      data: {
        status: "succeeded",
        finishedAt: new Date(),
        stats: contentJson({ files: parsed.length, releaseVersion }),
      },
    });
  } catch (error) {
    await prisma.contentImportJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        finishedAt: new Date(),
        error: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
