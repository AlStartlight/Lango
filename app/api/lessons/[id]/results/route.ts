import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchMockData, apiResponse, apiError, isMockMode } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (isMockMode() || !prisma) {
    const data = await fetchMockData<Record<string, unknown>>("lesson-results");
    return apiResponse({ ...data, lessonId: id });
  }

  const result = await prisma.lessonResult.findFirst({
    where: { lessonId: id },
    orderBy: { createdAt: "desc" },
  });

  if (!result) {
    return apiError("Lesson result not found", 404);
  }

  return apiResponse({
    lessonId: result.lessonId,
    userName: result.userName,
    accuracyPercent: result.accuracyPercent,
    xpEarned: result.xpEarned,
    timeTakenSeconds: result.timeTakenSeconds,
    streakDays: result.streakDays,
    outperformedPercent: result.outperformedPercent,
    expertTip: result.expertTip,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (isMockMode() || !prisma) {
    return apiResponse({
      lessonId: id,
      ...body,
      status: "recorded",
    });
  }

  const result = await prisma.lessonResult.create({
    data: {
      lessonId: id,
      userId: body.userId ?? "anonymous",
      userName: body.userName ?? "Learner",
      accuracyPercent: body.accuracyPercent ?? 0,
      xpEarned: body.xpEarned ?? 0,
      timeTakenSeconds: body.timeTakenSeconds ?? 0,
      streakDays: body.streakDays ?? 0,
      outperformedPercent: body.outperformedPercent ?? 0,
      expertTip: body.expertTip ?? "",
    },
  });

  return apiResponse({
    lessonId: result.lessonId,
    status: "recorded",
  });
}
