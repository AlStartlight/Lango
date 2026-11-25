import "dotenv/config";
import { createPrismaClient } from "./lib";

async function main() {
  const prisma = createPrismaClient();
  const curricula = await prisma.curriculum.findMany({
    include: {
      language: true,
      levels: {
        include: {
          units: { include: { lessons: { include: { questions: true } } } },
        },
      },
    },
    orderBy: { languageCode: "asc" },
  });

  let totalQuestions = 0;
  let totalLessons = 0;
  for (const curriculum of curricula) {
    const publishedQuestions = curriculum.levels
      .flatMap((level) => level.units)
      .flatMap((unit) => unit.lessons)
      .flatMap((lesson) => lesson.questions)
      .filter((question) => question.status === "published").length;
    const publishedLessons = curriculum.levels
      .flatMap((level) => level.units)
      .flatMap((unit) => unit.lessons)
      .filter((lesson) => lesson.status === "published").length;
    totalQuestions += publishedQuestions;
    totalLessons += publishedLessons;
    console.log(
      `${curriculum.language.code} ${curriculum.framework}: ${publishedQuestions} soal, ${publishedLessons} lesson, status ${curriculum.status}`,
    );
  }
  console.log(`TOTAL: ${totalQuestions} soal, ${totalLessons} lesson`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
