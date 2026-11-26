-- CreateTable
CREATE TABLE "InterviewSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "track" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'id',
    "questionIds" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "readiness" INTEGER,
    "band" TEXT,
    "xpAwarded" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InterviewSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewTurn" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "transcript" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "scores" JSONB NOT NULL,
    "readiness" INTEGER NOT NULL,
    "feedback" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewTurn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InterviewSession_userId_startedAt_idx" ON "InterviewSession"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "InterviewSession_userId_language_startedAt_idx" ON "InterviewSession"("userId", "language", "startedAt");

-- CreateIndex
CREATE INDEX "InterviewTurn_questionId_idx" ON "InterviewTurn"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewTurn_sessionId_position_key" ON "InterviewTurn"("sessionId", "position");

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewTurn" ADD CONSTRAINT "InterviewTurn_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
