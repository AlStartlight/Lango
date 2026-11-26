import "server-only";
import { prisma as prismaClient } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import { awardXp, dateKeyInTimezone, touchStreak } from "@/lib/learning/progress";
import {
  getInterviewQuestions,
  getInterviewQuestion,
} from "./content";
import { aggregateReadiness, evaluateAnswer } from "./evaluate";
import {
  bandFor,
  type InterviewEvaluation,
  type InterviewLanguage,
  type InterviewMode,
  type InterviewQuestion,
  type InterviewScores,
  type InterviewTrackId,
  type InterviewTurnRecord,
  type InterviewMetrics,
  type InterviewFeedbackCode,
} from "./types";

function getDb() {
  if (!prismaClient) {
    throw new Error("DATABASE_URL is not configured.");
  }
  return prismaClient;
}

export const DRILL_SIZE = 3;
export const SIMULATION_SIZE = 8;
const DRILL_DAILY_LIMIT = 20;
const SIMULATION_DAILY_LIMIT = 5;

export interface InterviewSessionView {
  id: string;
  language: InterviewLanguage;
  track: InterviewTrackId;
  mode: InterviewMode;
  startedAt: string;
  completedAt: string | null;
  readiness: number | null;
  band: string | null;
  xpAwarded: number;
  questions: InterviewQuestion[];
  turns: InterviewTurnRecord[];
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function selectQuestions(
  language: InterviewLanguage,
  track: InterviewTrackId,
  mode: InterviewMode,
): InterviewQuestion[] {
  const size = mode === "drill" ? DRILL_SIZE : SIMULATION_SIZE;
  const all = getInterviewQuestions(language);
  const primary = shuffle(all.filter((question) => question.track === track));
  const fallback = shuffle(
    all.filter((question) => question.track !== track),
  );
  return [...primary, ...fallback].slice(0, size);
}

export async function createInterviewSession(input: {
  userId: string;
  language: InterviewLanguage;
  track: InterviewTrackId;
  mode: InterviewMode;
  locale: string;
}): Promise<InterviewSessionView | { error: string }> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await getDb().interviewSession.count({
    where: {
      userId: input.userId,
      mode: input.mode,
      startedAt: { gte: since },
    },
  });
  const limit =
    input.mode === "drill" ? DRILL_DAILY_LIMIT : SIMULATION_DAILY_LIMIT;
  if (recent >= limit) {
    return { error: "RATE_LIMITED" };
  }

  const questions = selectQuestions(input.language, input.track, input.mode);
  if (questions.length < 3) {
    return { error: "NO_CONTENT" };
  }

  const session = await getDb().interviewSession.create({
    data: {
      userId: input.userId,
      language: input.language,
      track: input.track,
      mode: input.mode,
      locale: input.locale,
      questionIds: questions.map((question) => question.canonicalId),
    },
  });

  return {
    id: session.id,
    language: input.language,
    track: input.track,
    mode: input.mode,
    startedAt: session.startedAt.toISOString(),
    completedAt: null,
    readiness: null,
    band: null,
    xpAwarded: 0,
    questions,
    turns: [],
  };
}

export async function getInterviewSession(
  userId: string,
  sessionId: string,
): Promise<InterviewSessionView | null> {
  const session = await getDb().interviewSession.findFirst({
    where: { id: sessionId, userId },
    include: { turns: { orderBy: { position: "asc" } } },
  });
  if (!session) return null;

  const ids = Array.isArray(session.questionIds)
    ? (session.questionIds as string[])
    : [];
  const language = session.language as InterviewLanguage;
  const questions = ids
    .map((id) => getInterviewQuestion(language, id))
    .filter((question): question is InterviewQuestion => Boolean(question));

  const turns: InterviewTurnRecord[] = session.turns.map((turn) => {
    const scores = turn.scores as unknown as InterviewScores;
    const feedback = turn.feedback as unknown as {
      strengths: InterviewFeedbackCode[];
      improvements: InterviewFeedbackCode[];
      metrics?: InterviewMetrics;
    };
    return {
      id: turn.id,
      questionId: turn.questionId,
      position: turn.position,
      transcript: turn.transcript,
      durationMs: turn.durationMs,
      scores,
      readiness: turn.readiness,
      feedback: {
        strengths: feedback.strengths ?? [],
        improvements: feedback.improvements ?? [],
      },
      metrics:
        feedback.metrics ??
        ({
          words: 0,
          sentences: 0,
          fillerCount: 0,
          fillerRatio: 0,
          metricCount: 0,
          structureGroups: 0,
          estimatedSeconds: Math.round(turn.durationMs / 1000),
          register: "neutral",
        } satisfies InterviewMetrics),
      createdAt: turn.createdAt.toISOString(),
    };
  });

  return {
    id: session.id,
    language,
    track: session.track as InterviewTrackId,
    mode: session.mode as InterviewMode,
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt?.toISOString() ?? null,
    readiness: session.readiness,
    band: session.band,
    xpAwarded: session.xpAwarded,
    questions,
    turns,
  };
}

export interface SubmitAnswerResult {
  evaluation: InterviewEvaluation;
  position: number;
  nextPosition: number | null;
  alreadyAnswered: boolean;
}

export async function submitInterviewAnswer(input: {
  userId: string;
  sessionId: string;
  canonicalId: string;
  transcript: string;
  durationMs: number;
}): Promise<SubmitAnswerResult | { error: string }> {
  const session = await getDb().interviewSession.findFirst({
    where: { id: input.sessionId, userId: input.userId },
    include: { turns: true },
  });
  if (!session) return { error: "NOT_FOUND" };
  if (session.completedAt) return { error: "SESSION_COMPLETE" };

  const ids = Array.isArray(session.questionIds)
    ? (session.questionIds as string[])
    : [];
  const position = ids.indexOf(input.canonicalId);
  if (position === -1) return { error: "QUESTION_NOT_IN_SESSION" };

  const existing = session.turns.find((turn) => turn.position === position);
  if (existing) {
    const feedback = existing.feedback as unknown as {
      strengths: InterviewFeedbackCode[];
      improvements: InterviewFeedbackCode[];
      metrics: InterviewMetrics;
    };
    return {
      evaluation: {
        scores: existing.scores as unknown as InterviewScores,
        readiness: existing.readiness,
        feedback: {
          strengths: feedback.strengths ?? [],
          improvements: feedback.improvements ?? [],
        },
        metrics: feedback.metrics,
      },
      position,
      nextPosition:
        session.turns.length < ids.length ? session.turns.length : null,
      alreadyAnswered: true,
    };
  }

  // Answers must arrive in order so the transcript timeline stays trustworthy.
  if (position !== session.turns.length) {
    return { error: "OUT_OF_ORDER" };
  }

  const question = getInterviewQuestion(
    session.language as InterviewLanguage,
    input.canonicalId,
  );
  if (!question) return { error: "QUESTION_NOT_FOUND" };

  const evaluation = evaluateAnswer({
    question,
    transcript: input.transcript,
    durationMs: input.durationMs,
    language: session.language as InterviewLanguage,
  });
  // Text answers: the typing timer is not speaking time. Weight the session by
  // the estimated spoken duration so delivery and aggregation stay comparable.
  const durationMs = Math.max(
    1000,
    Math.round(evaluation.metrics.estimatedSeconds * 1000),
  );

  await getDb().interviewTurn.create({
    data: {
      sessionId: session.id,
      questionId: question.canonicalId,
      position,
      transcript: input.transcript.trim(),
      durationMs,
      scores: evaluation.scores as unknown as Prisma.InputJsonValue,
      readiness: evaluation.readiness,
      feedback: {
        strengths: evaluation.feedback.strengths,
        improvements: evaluation.feedback.improvements,
        metrics: evaluation.metrics,
      } as unknown as Prisma.InputJsonValue,
    },
  });

  return {
    evaluation,
    position,
    nextPosition: position + 1 < ids.length ? position + 1 : null,
    alreadyAnswered: false,
  };
}

export interface CompleteSessionResult {
  readiness: number | null;
  band: string | null;
  xpAwarded: number;
  alreadyCompleted: boolean;
}

export async function completeInterviewSession(input: {
  userId: string;
  sessionId: string;
  timezone: string;
}): Promise<CompleteSessionResult | { error: string }> {
  const session = await getDb().interviewSession.findFirst({
    where: { id: input.sessionId, userId: input.userId },
    include: { turns: { orderBy: { position: "asc" } } },
  });
  if (!session) return { error: "NOT_FOUND" };
  if (session.completedAt) {
    return {
      readiness: session.readiness,
      band: session.band,
      xpAwarded: session.xpAwarded,
      alreadyCompleted: true,
    };
  }

  const turns = session.turns.map((turn) => ({
    readiness: turn.readiness,
    durationMs: turn.durationMs,
  }));
  const readiness = aggregateReadiness(turns);
  const band = readiness === null ? null : bandFor(readiness);
  const amount = session.mode === "drill" ? 20 : 80;
  const minutes = Math.max(
    1,
    Math.round(
      session.turns.reduce((total, turn) => total + turn.durationMs, 0) / 60_000,
    ),
  );

  const result = await getDb().$transaction(async (tx) => {
    const xp = await awardXp(tx, {
      userId: input.userId,
      amount,
      sourceType: "visa_kerja_interview",
      sourceId: session.id,
      idempotencyKey: `visa-kerja:${session.id}`,
      timezone: input.timezone,
    });
    const streak = await touchStreak(tx, input.userId, input.timezone);

    const todayKey = dateKeyInTimezone(new Date(), input.timezone);
    const activityDate = new Date(`${todayKey}T00:00:00.000Z`);
    await tx.dailyActivity.upsert({
      where: {
        userId_date: { userId: input.userId, date: activityDate },
      },
      update: {
        minutes: { increment: minutes },
        xp: { increment: xp.awarded },
        lessonsCompleted: { increment: 1 },
      },
      create: {
        userId: input.userId,
        date: activityDate,
        minutes,
        xp: xp.awarded,
        lessonsCompleted: 1,
      },
    });

    const languageExists = await tx.language.findUnique({
      where: { code: session.language },
      select: { code: true },
    });
    if (languageExists) {
      await tx.languageDailyActivity.upsert({
        where: {
          userId_languageCode_date: {
            userId: input.userId,
            languageCode: session.language,
            date: activityDate,
          },
        },
        update: {
          minutes: { increment: minutes },
          xp: { increment: xp.awarded },
          lessonsCompleted: { increment: 1 },
        },
        create: {
          userId: input.userId,
          languageCode: session.language,
          date: activityDate,
          minutes,
          xp: xp.awarded,
          lessonsCompleted: 1,
        },
      });
      await tx.userLanguageStats.upsert({
        where: {
          userId_languageCode: {
            userId: input.userId,
            languageCode: session.language,
          },
        },
        update: {
          minutesTotal: { increment: minutes },
          lessonsCompleted: { increment: 1 },
          lastActivityAt: new Date(),
        },
        create: {
          userId: input.userId,
          languageCode: session.language,
          minutesTotal: minutes,
          lessonsCompleted: 1,
          lastActivityAt: new Date(),
        },
      });
    }

    await tx.interviewSession.update({
      where: { id: session.id },
      data: {
        completedAt: new Date(),
        readiness,
        band,
        xpAwarded: xp.awarded,
      },
    });

    return { xp: xp.awarded, streak };
  });

  return {
    readiness,
    band,
    xpAwarded: result.xp,
    alreadyCompleted: false,
  };
}

export interface InterviewOverview {
  sessions: Array<{
    id: string;
    track: InterviewTrackId;
    mode: InterviewMode;
    readiness: number | null;
    band: string | null;
    startedAt: string;
    completedAt: string | null;
    turns: number;
  }>;
  completedCount: number;
  lastReadiness: number | null;
  previousReadiness: number | null;
  bandForLast: string | null;
  totalTurns: number;
}

export async function getInterviewOverview(
  userId: string,
  language: InterviewLanguage,
): Promise<InterviewOverview> {
  const sessions = await getDb().interviewSession.findMany({
    where: { userId, language },
    orderBy: { startedAt: "desc" },
    take: 8,
    include: { _count: { select: { turns: true } } },
  });

  const completed = sessions.filter(
    (session) => session.completedAt && session.readiness !== null,
  );
  const totals = await getDb().interviewSession.aggregate({
    where: { userId, language, completedAt: { not: null } },
    _count: { _all: true },
  });
  const turnCount = await getDb().interviewTurn.count({
    where: { session: { userId, language } },
  });

  return {
    sessions: sessions.map((session) => ({
      id: session.id,
      track: session.track as InterviewTrackId,
      mode: session.mode as InterviewMode,
      readiness: session.readiness,
      band: session.band,
      startedAt: session.startedAt.toISOString(),
      completedAt: session.completedAt?.toISOString() ?? null,
      turns: session._count.turns,
    })),
    completedCount: totals._count._all,
    lastReadiness: completed[0]?.readiness ?? null,
    previousReadiness: completed[1]?.readiness ?? null,
    bandForLast:
      completed[0]?.readiness == null
        ? null
        : bandFor(completed[0].readiness),
    totalTurns: turnCount,
  };
}
