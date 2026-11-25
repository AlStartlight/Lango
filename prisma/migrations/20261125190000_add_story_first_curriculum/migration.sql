-- CreateTable
CREATE TABLE "StoryWorld" (
    "id" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "nativeTitle" TEXT NOT NULL,
    "logline" TEXT NOT NULL,
    "setting" TEXT NOT NULL,
    "era" TEXT,
    "tone" TEXT NOT NULL,
    "sensitivityNotes" JSONB,
    "coverAssetKey" TEXT,
    "palette" TEXT,
    "canon" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryWorld_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryCharacter" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nativeName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "age" INTEGER,
    "bio" TEXT NOT NULL,
    "avatarAssetKey" TEXT,
    "speechStyle" TEXT,
    "quote" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StoryCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryArcMeta" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "seasonNo" INTEGER NOT NULL,
    "tier" TEXT NOT NULL,
    "framework" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "nativeTitle" TEXT NOT NULL,
    "synopsis" TEXT NOT NULL,
    "culturalAnchors" JSONB NOT NULL,
    "cliffhanger" TEXT,
    "episodeCount" INTEGER NOT NULL DEFAULT 20,

    CONSTRAINT "StoryArcMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryEpisodeMeta" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "arcId" TEXT NOT NULL,
    "episodeNo" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "nativeTitle" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "recap" TEXT,
    "cliffhanger" TEXT,
    "focusObject" TEXT,
    "culturalAnchor" TEXT,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "StoryEpisodeMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorySceneMeta" (
    "id" TEXT NOT NULL,
    "passageId" TEXT NOT NULL,
    "arcId" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "sceneNo" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "titleRomanization" TEXT,
    "titleTranslation" JSONB NOT NULL,
    "setting" TEXT NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 4,
    "cliffhanger" TEXT,
    "cultureNoteIds" TEXT[],
    "beat" JSONB,
    "contentVersion" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'published',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StorySceneMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryLine" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "speakerId" TEXT,
    "speakerName" TEXT,
    "text" TEXT NOT NULL,
    "script" TEXT NOT NULL DEFAULT 'latn',
    "reading" TEXT,
    "romanization" JSONB,
    "translation" JSONB NOT NULL,
    "tokens" JSONB,
    "audio" JSONB,
    "audioStartMs" INTEGER,
    "audioEndMs" INTEGER,

    CONSTRAINT "StoryLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryMaterial" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" JSONB NOT NULL,
    "audio" JSONB,

    CONSTRAINT "StoryMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryCultureNote" (
    "id" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" JSONB NOT NULL,
    "sources" JSONB NOT NULL,
    "reflection" JSONB,
    "sensitivityStatus" TEXT NOT NULL DEFAULT 'pending',
    "stampId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryCultureNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryChoice" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "effects" JSONB,

    CONSTRAINT "StoryChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorySceneProgress" (
    "userId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "lastLineId" TEXT,
    "minutes" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorySceneProgress_pkey" PRIMARY KEY ("userId","sceneId")
);

-- CreateTable
CREATE TABLE "StoryProgress" (
    "userId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "currentArcId" TEXT,
    "currentEpisodeId" TEXT,
    "currentSceneId" TEXT,
    "choices" JSONB,
    "affinity" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryProgress_pkey" PRIMARY KEY ("userId","languageCode","worldId")
);

-- CreateTable
CREATE TABLE "StoryPassportStamp" (
    "userId" TEXT NOT NULL,
    "stampId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryPassportStamp_pkey" PRIMARY KEY ("userId","stampId")
);

-- CreateTable
CREATE TABLE "StoryReview" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "checklist" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryRevision" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "contentVersion" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "StoryRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryFlag" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "StoryFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoryWorld_languageCode_idx" ON "StoryWorld"("languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "StoryWorld_languageCode_slug_key" ON "StoryWorld"("languageCode", "slug");

-- CreateIndex
CREATE INDEX "StoryCharacter_worldId_position_idx" ON "StoryCharacter"("worldId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "StoryArcMeta_unitId_key" ON "StoryArcMeta"("unitId");

-- CreateIndex
CREATE INDEX "StoryArcMeta_worldId_seasonNo_idx" ON "StoryArcMeta"("worldId", "seasonNo");

-- CreateIndex
CREATE UNIQUE INDEX "StoryArcMeta_worldId_tier_seasonNo_key" ON "StoryArcMeta"("worldId", "tier", "seasonNo");

-- CreateIndex
CREATE UNIQUE INDEX "StoryEpisodeMeta_lessonId_key" ON "StoryEpisodeMeta"("lessonId");

-- CreateIndex
CREATE INDEX "StoryEpisodeMeta_arcId_episodeNo_idx" ON "StoryEpisodeMeta"("arcId", "episodeNo");

-- CreateIndex
CREATE UNIQUE INDEX "StoryEpisodeMeta_arcId_episodeNo_key" ON "StoryEpisodeMeta"("arcId", "episodeNo");

-- CreateIndex
CREATE UNIQUE INDEX "StorySceneMeta_passageId_key" ON "StorySceneMeta"("passageId");

-- CreateIndex
CREATE INDEX "StorySceneMeta_arcId_sceneNo_idx" ON "StorySceneMeta"("arcId", "sceneNo");

-- CreateIndex
CREATE INDEX "StorySceneMeta_status_idx" ON "StorySceneMeta"("status");

-- CreateIndex
CREATE UNIQUE INDEX "StorySceneMeta_episodeId_sceneNo_key" ON "StorySceneMeta"("episodeId", "sceneNo");

-- CreateIndex
CREATE INDEX "StoryLine_sceneId_idx" ON "StoryLine"("sceneId");

-- CreateIndex
CREATE UNIQUE INDEX "StoryLine_sceneId_order_key" ON "StoryLine"("sceneId", "order");

-- CreateIndex
CREATE INDEX "StoryMaterial_sceneId_type_idx" ON "StoryMaterial"("sceneId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "StoryMaterial_sceneId_type_order_key" ON "StoryMaterial"("sceneId", "type", "order");

-- CreateIndex
CREATE INDEX "StoryCultureNote_languageCode_idx" ON "StoryCultureNote"("languageCode");

-- CreateIndex
CREATE INDEX "StoryCultureNote_worldId_idx" ON "StoryCultureNote"("worldId");

-- CreateIndex
CREATE INDEX "StoryChoice_sceneId_idx" ON "StoryChoice"("sceneId");

-- CreateIndex
CREATE INDEX "StorySceneProgress_userId_languageCode_status_idx" ON "StorySceneProgress"("userId", "languageCode", "status");

-- CreateIndex
CREATE INDEX "StorySceneProgress_userId_updatedAt_idx" ON "StorySceneProgress"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "StoryProgress_userId_languageCode_idx" ON "StoryProgress"("userId", "languageCode");

-- CreateIndex
CREATE INDEX "StoryPassportStamp_userId_languageCode_idx" ON "StoryPassportStamp"("userId", "languageCode");

-- CreateIndex
CREATE INDEX "StoryReview_sceneId_role_idx" ON "StoryReview"("sceneId", "role");

-- CreateIndex
CREATE INDEX "StoryReview_status_role_idx" ON "StoryReview"("status", "role");

-- CreateIndex
CREATE INDEX "StoryRevision_sceneId_createdAt_idx" ON "StoryRevision"("sceneId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StoryRevision_sceneId_version_key" ON "StoryRevision"("sceneId", "version");

-- CreateIndex
CREATE INDEX "StoryFlag_status_createdAt_idx" ON "StoryFlag"("status", "createdAt");

-- CreateIndex
CREATE INDEX "StoryFlag_sceneId_idx" ON "StoryFlag"("sceneId");

-- AddForeignKey
ALTER TABLE "StoryWorld" ADD CONSTRAINT "StoryWorld_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryCharacter" ADD CONSTRAINT "StoryCharacter_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "StoryWorld"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryArcMeta" ADD CONSTRAINT "StoryArcMeta_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "StoryWorld"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryArcMeta" ADD CONSTRAINT "StoryArcMeta_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "CurriculumUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryEpisodeMeta" ADD CONSTRAINT "StoryEpisodeMeta_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "CurriculumLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryEpisodeMeta" ADD CONSTRAINT "StoryEpisodeMeta_arcId_fkey" FOREIGN KEY ("arcId") REFERENCES "StoryArcMeta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorySceneMeta" ADD CONSTRAINT "StorySceneMeta_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES "Passage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorySceneMeta" ADD CONSTRAINT "StorySceneMeta_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "StoryEpisodeMeta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryLine" ADD CONSTRAINT "StoryLine_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "StorySceneMeta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryMaterial" ADD CONSTRAINT "StoryMaterial_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "StorySceneMeta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryCultureNote" ADD CONSTRAINT "StoryCultureNote_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "StoryWorld"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryChoice" ADD CONSTRAINT "StoryChoice_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "StorySceneMeta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorySceneProgress" ADD CONSTRAINT "StorySceneProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryProgress" ADD CONSTRAINT "StoryProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryProgress" ADD CONSTRAINT "StoryProgress_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "StoryWorld"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryPassportStamp" ADD CONSTRAINT "StoryPassportStamp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryReview" ADD CONSTRAINT "StoryReview_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "StorySceneMeta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryRevision" ADD CONSTRAINT "StoryRevision_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "StorySceneMeta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryFlag" ADD CONSTRAINT "StoryFlag_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "StorySceneMeta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryFlag" ADD CONSTRAINT "StoryFlag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

