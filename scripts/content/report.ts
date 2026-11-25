import { createContentPrisma } from "./prisma";

async function main() {
  const prisma = createContentPrisma();
  try {
    const curricula = await prisma.curriculum.findMany({
      include: {
        levels: {
          include: {
            units: {
              include: {
                lessons: {
                  include: {
                    _count: {
                      select: { questions: { where: { status: "published" } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { languageCode: "asc" },
    });

    for (const curriculum of curricula) {
      console.log(
        `\n${curriculum.languageCode}/${curriculum.framework} ${curriculum.version} (${curriculum.status}) — ${curriculum.totalQuestions} questions, ${curriculum.totalLessons} lessons`,
      );
      for (const level of curriculum.levels) {
        const skillCounts = new Map<string, number>();
        for (const unit of level.units) {
          for (const lesson of unit.lessons) {
            skillCounts.set(
              lesson.skill,
              (skillCounts.get(lesson.skill) ?? 0) + lesson._count.questions,
            );
          }
        }
        const skills = [...skillCounts.entries()]
          .map(([skill, count]) => `${skill}:${count}`)
          .join(", ");
        console.log(
          `  ${level.code}: ${level.totalLessons} lessons, ${level.totalQuestions} questions (${skills})`,
        );
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
