import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchMockData, apiResponse, isMockMode } from "@/lib/api";

export async function GET() {
  if (isMockMode() || !prisma) {
    const data = await fetchMockData<Record<string, unknown>>("tutor");
    return apiResponse(data);
  }

  const session = await prisma.tutorSession.findFirst({
    include: { messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  if (!session) {
    return apiResponse({
      id: "",
      title: "",
      language: "",
      tutorName: "",
      messages: [],
    });
  }

  return apiResponse({
    id: session.id,
    title: session.title,
    language: session.language,
    tutorName: session.tutorName,
    messages: session.messages.map((m) => ({
      id: m.id,
      role: m.role as "ai" | "user",
      text: m.text,
      translation: m.translation,
      grammarTip: m.grammarTip,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}
