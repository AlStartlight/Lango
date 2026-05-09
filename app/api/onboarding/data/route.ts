import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchMockData, apiResponse, isMockMode } from "@/lib/api";
import { type Language, type GoalOption } from "@/lib/schemas";

export async function GET() {
  if (isMockMode() || !prisma) {
    const data = await fetchMockData<{
      availableLanguages: Language[];
      goalOptions: GoalOption[];
    }>("onboarding");
    return apiResponse(data);
  }

  const [languages, goalOptions] = await Promise.all([
    prisma.language.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.goalOption.findMany({ orderBy: { minutesPerDay: "asc" } }),
  ]);

  return apiResponse({
    availableLanguages: languages,
    goalOptions,
  });
}
