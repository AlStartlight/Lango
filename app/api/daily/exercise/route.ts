import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchMockData, apiResponse, apiError, isMockMode } from "@/lib/api";
import { ExerciseAnswerSchema } from "@/lib/schemas";

export async function GET() {
  if (isMockMode() || !prisma) {
    const data = await fetchMockData<Record<string, unknown>>("daily");
    return apiResponse(data);
  }

  const exercise = await prisma.exercise.findFirst({
    include: { choices: true },
    orderBy: { createdAt: "desc" },
  });

  if (!exercise) {
    return apiResponse({
      progress: { progressPercent: 0, hearts: 5, xpEarned: 0 },
      exercise: null,
    });
  }

  return apiResponse({
    progress: { progressPercent: 0, hearts: 5, xpEarned: 0 },
    exercise: {
      id: exercise.id,
      xpReward: exercise.xpReward,
      masteryLevel: exercise.masteryLevel,
      flipCard: {
        wordInTargetLanguage: exercise.flipCardWordTarget,
        pronunciation: exercise.flipCardPronunciation,
        wordInNativeLanguage: exercise.flipCardWordNative,
        definition: exercise.flipCardDefinition,
      },
      choices: exercise.choices.map((c) => ({
        id: c.id,
        emoji: c.emoji,
        label: c.label,
      })),
      correctChoiceId: exercise.correctChoiceId,
      aiFeedbackMessage: exercise.aiFeedbackMessage,
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = ExerciseAnswerSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid submission: " + parsed.error.message);
  }

  if (isMockMode() || !prisma) {
    const isCorrect = parsed.data.choiceId === "a";
    return apiResponse({ correct: isCorrect });
  }

  const exercise = await prisma.exercise.findUnique({
    where: { id: parsed.data.exerciseId },
  });

  if (!exercise) {
    return apiError("Exercise not found", 404);
  }

  const isCorrect = parsed.data.choiceId === exercise.correctChoiceId;
  return apiResponse({ correct: isCorrect });
}
