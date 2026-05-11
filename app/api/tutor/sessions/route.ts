import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError, isMockMode } from "@/lib/api";
import { TutorCreateSessionSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = TutorCreateSessionSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid request: " + parsed.error.message);
  }

  const { language, topic, difficultyLevel, userId } = parsed.data;

  if (isMockMode() || !prisma) {
    return apiResponse({
      id: "session-" + Date.now(),
      title: topic,
      language,
      tutorName: "Lingo AI",
      difficultyLevel,
      messages: [],
    });
  }

  const session = await prisma.tutorSession.create({
    data: {
      id: `session-${Date.now()}`,
      title: topic,
      language,
      tutorName: "Lingo AI",
      userId: userId === "current" ? undefined : userId,
    },
  });

  return apiResponse({
    id: session.id,
    title: session.title,
    language: session.language,
    tutorName: session.tutorName,
    difficultyLevel,
    messages: [],
  });
}
