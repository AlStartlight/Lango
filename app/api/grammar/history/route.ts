import { prisma } from "@/lib/prisma";
import { fetchMockData, apiResponse, apiError, isMockMode } from "@/lib/api";

export async function GET() {
  if (isMockMode() || !prisma) {
    const data = await fetchMockData<Record<string, unknown>>("grammar-history");
    return apiResponse(data);
  }

  const history = await prisma.userGrammarHistory.findFirst({
    include: {
      reviewItems: true,
      timelineEntries: { orderBy: { date: "desc" } },
    },
  });

  if (!history) {
    return apiResponse({
      masteryPercent: 0,
      outperformedPercent: 0,
      needsReview: [],
      timeline: [],
    });
  }

  return apiResponse({
    masteryPercent: history.masteryPercent,
    outperformedPercent: history.outperformedPercent,
    needsReview: history.reviewItems.map((r) => ({
      id: r.id,
      icon: r.icon,
      title: r.title,
      description: r.description,
      isUrgent: r.isUrgent,
    })),
    timeline: history.timelineEntries.map((t) => ({
      id: t.id,
      score: t.score,
      title: t.title,
      date: t.date,
      description: t.description,
      status: t.status as "Completed" | "Incomplete",
      level: t.level,
    })),
  });
}
