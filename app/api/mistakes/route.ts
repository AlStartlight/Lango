import { prisma } from "@/lib/prisma";
import { fetchMockData, apiResponse, isMockMode } from "@/lib/api";

export async function GET() {
  if (isMockMode() || !prisma) {
    const data = await fetchMockData<Record<string, unknown>>("review-mistakes");
    return apiResponse(data);
  }

  const mistakes = await prisma.mistake.findMany({
    include: { lessonResult: true },
    orderBy: { lessonResultId: "desc" },
  });

  const lessonId = mistakes[0]?.lessonResult?.lessonId ?? "lesson-001";

  return apiResponse({
    lessonId,
    totalMistakes: mistakes.length,
    mistakes: mistakes.map((m) => ({
      id: m.id,
      type: m.type,
      prompt: m.prompt,
      yourAnswer: m.yourAnswer,
      correctAnswer: m.correctAnswer,
      tip: {
        title: m.tipTitle,
        body: m.tipBody,
      },
    })),
  });
}
