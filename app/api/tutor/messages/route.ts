import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError, isMockMode } from "@/lib/api";
import { TutorSendMessageSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = TutorSendMessageSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid message: " + parsed.error.message);
  }

  if (isMockMode() || !prisma) {
    return apiResponse({
      id: "msg-" + Date.now(),
      role: "ai",
      text: "¡Excelente! Keep practicing and you'll improve quickly.",
      translation: "Excellent! Keep practicing and you'll improve quickly.",
      grammarTip: null,
      createdAt: new Date().toISOString(),
    });
  }

  const session = await prisma.tutorSession.findUnique({
    where: { id: parsed.data.sessionId },
  });

  if (!session) {
    return apiError("Session not found", 404);
  }

  const userMsg = await prisma.tutorMessage.create({
    data: {
      id: `msg-${Date.now()}`,
      sessionId: parsed.data.sessionId,
      role: "user",
      text: parsed.data.text,
    },
  });

  return apiResponse({
    id: `ai-${Date.now()}`,
    role: "ai",
    text: "Thanks for your message! I'll respond shortly.",
    translation: null,
    grammarTip: null,
    createdAt: new Date().toISOString(),
  });
}
