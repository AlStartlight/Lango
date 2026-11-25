import "dotenv/config";
import { createPrismaClient, contentJson, sha256, stableJson } from "./lib";

function argValue(flag: string, fallback: string): string {
  const eq = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (eq) return eq.split("=").slice(1).join("=");
  const index = process.argv.indexOf(flag);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const version = argValue("--release", "2026.11.0-pilot");

async function main() {
  const prisma = createPrismaClient();
  const allLessons = await prisma.curriculumLesson.findMany({
    include: {
      questions: {
        select: {
          id: true,
          version: true,
          type: true,
          choices: { select: { id: true } },
        },
      },
      unit: { include: { level: { include: { curriculum: true } } } },
    },
  });
  const isComplete = (lesson: (typeof allLessons)[number]) =>
    lesson.questions.length > 0 &&
    lesson.questions.every(
      (question) =>
        question.type !== "multiple_choice" || question.choices.length >= 2,
    );
  const lessons = allLessons.filter(isComplete);
  if (!lessons.length) throw new Error("Tidak ada lesson lengkap untuk dipublish");

  // Empty/incomplete lessons are scaffolding, not learner-facing content.
  const incompleteLessonIds = allLessons
    .filter((lesson) => !isComplete(lesson))
    .map((lesson) => lesson.id);
  if (incompleteLessonIds.length) {
    await prisma.curriculumLesson.updateMany({
      where: { id: { in: incompleteLessonIds } },
      data: { status: "draft" },
    });
  }

  const now = new Date();
  const curriculumIds = new Set<string>();
  const lessonIds = new Set<string>();
  const questionIds = new Set<string>();
  for (const lesson of lessons) {
    lessonIds.add(lesson.id);
    curriculumIds.add(lesson.unit.level.curriculum.id);
    for (const question of lesson.questions) questionIds.add(question.id);
  }

  await prisma.$transaction(async (tx) => {
    await tx.curriculumLesson.updateMany({
      where: { id: { in: [...lessonIds] } },
      data: { status: "published", publishedAt: now },
    });
    await tx.question.updateMany({
      where: { lessonId: { in: [...lessonIds] } },
      data: { status: "published" },
    });
    const otherLessonIds = (
      await tx.curriculumLesson.findMany({
        where: { id: { notIn: [...lessonIds] } },
        select: { id: true },
      })
    ).map((lesson) => lesson.id);
    if (otherLessonIds.length) {
      await tx.question.updateMany({
        where: { lessonId: { in: otherLessonIds } },
        data: { status: "draft" },
      });
    }

    for (const curriculumId of curriculumIds) {
      const [questionCount, lessonCount] = await Promise.all([
        tx.question.count({ where: { lesson: { unit: { level: { curriculumId } } }, status: "published" } }),
        tx.curriculumLesson.count({ where: { unit: { level: { curriculumId } }, status: "published" } }),
      ]);
      await tx.curriculum.update({
        where: { id: curriculumId },
        data: {
          status: "published",
          publishedAt: now,
          totalQuestions: questionCount,
          totalLessons: lessonCount,
        },
      });

      const levels = await tx.curriculumLevel.findMany({
        where: { curriculumId },
        select: { id: true },
      });
      for (const level of levels) {
        const levelQuestionCount = await tx.question.count({
          where: {
            lesson: { unit: { levelId: level.id } },
            status: "published",
          },
        });
        const levelLessonCount = await tx.curriculumLesson.count({
          where: {
            unit: { levelId: level.id },
            status: "published",
          },
        });
        await tx.curriculumLevel.update({
          where: { id: level.id },
          data: {
            totalQuestions: levelQuestionCount,
            totalLessons: levelLessonCount,
          },
        });
      }
    }

    await tx.contentRelease.updateMany({
      where: { status: "published", version: { not: version } },
      data: { status: "rolled_back" },
    });

    const manifest = {
      version,
      publishedAt: now.toISOString(),
      lessonCount: lessonIds.size,
      questionCount: questionIds.size,
    };
    const release = await tx.contentRelease.upsert({
      where: { version },
      update: {
        status: "published",
        manifest: contentJson(manifest),
        checksum: sha256(stableJson(manifest)),
        publishedAt: now,
        publishedBy: "content-pipeline",
      },
      create: {
        version,
        status: "published",
        manifest: contentJson(manifest),
        checksum: sha256(stableJson(manifest)),
        publishedAt: now,
        publishedBy: "content-pipeline",
      },
    });

    const questions = await tx.question.findMany({
      where: { lessonId: { in: [...lessonIds] } },
      select: { id: true, version: true },
    });
    await tx.contentReleaseItem.createMany({
      data: questions.map((question) => ({
        releaseId: release.id,
        questionId: question.id,
        action: "add",
        toVersion: question.version,
      })),
      skipDuplicates: true,
    });
  });

  console.log(`✓ published ${lessonIds.size} lesson / ${questionIds.size} soal as ${version}`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
