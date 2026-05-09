import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchMockData, apiResponse, apiError, isMockMode } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (isMockMode() || !prisma) {
    const data = await fetchMockData<Record<string, unknown>>("grammar-detail");
    return apiResponse({ ...data, id });
  }

  const detail = await prisma.grammarDetail.findUnique({
    where: { id },
    include: {
      rules: true,
      examples: true,
      quiz: true,
    },
  });

  if (!detail) {
    return apiError("Grammar detail not found", 404);
  }

  return apiResponse({
    id: detail.id,
    title: detail.title,
    subtitle: detail.subtitle,
    category: detail.category,
    genderRules: detail.rules.map((r) => ({
      label: r.label,
      suffix: r.suffix,
      example: r.example,
    })),
    numberRules: [],
    examples: detail.examples.map((e) => ({
      id: e.id,
      phrase: e.phrase,
      translation: e.translation,
      agreementLabel: e.agreementLabel,
      note: e.note,
    })),
    quiz: detail.quiz
      ? {
          prompt: detail.quiz.prompt,
          options: detail.quiz.options,
          correctAnswer: detail.quiz.correctAnswer,
        }
      : null,
  });
}
