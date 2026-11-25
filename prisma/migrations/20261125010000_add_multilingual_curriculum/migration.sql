-- AlterTable (staged: add nullable, backfill, then enforce NOT NULL/unique)
ALTER TABLE "Language" ADD COLUMN     "code" TEXT,
ADD COLUMN     "direction" TEXT NOT NULL DEFAULT 'ltr',
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "script" TEXT NOT NULL DEFAULT 'latn',
ADD COLUMN     "uiLocale" TEXT;

-- Backfill canonical content codes and UI locales for the 12 seeded languages.
UPDATE "Language" SET
  "code" = CASE "id"
    WHEN 'english' THEN 'en'
    WHEN 'spanish' THEN 'es'
    WHEN 'japanese' THEN 'ja'
    WHEN 'korean' THEN 'ko'
    WHEN 'hindi' THEN 'hi'
    WHEN 'german' THEN 'de'
    WHEN 'arabic' THEN 'ar'
    WHEN 'french' THEN 'fr'
    WHEN 'portuguese' THEN 'pt'
    WHEN 'italian' THEN 'it'
    WHEN 'dutch' THEN 'nl'
    WHEN 'indonesian' THEN 'id'
    ELSE "id"
  END,
  "uiLocale" = CASE "id"
    WHEN 'english' THEN 'en'
    WHEN 'spanish' THEN 'es'
    WHEN 'japanese' THEN 'jp'
    WHEN 'korean' THEN 'ko'
    WHEN 'hindi' THEN 'hi'
    WHEN 'german' THEN 'de'
    WHEN 'arabic' THEN 'ar'
    WHEN 'french' THEN 'fr'
    WHEN 'portuguese' THEN 'pt'
    WHEN 'italian' THEN 'it'
    WHEN 'dutch' THEN 'nl'
    WHEN 'indonesian' THEN 'id'
    ELSE "id"
  END,
  "script" = CASE "id"
    WHEN 'japanese' THEN 'jpan'
    WHEN 'korean' THEN 'hang'
    WHEN 'hindi' THEN 'deva'
    WHEN 'arabic' THEN 'arab'
    ELSE 'latn'
  END,
  "direction" = CASE "id"
    WHEN 'arabic' THEN 'rtl'
    ELSE 'ltr'
  END;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activeLanguageCode" TEXT,
ADD COLUMN     "alwaysShowTranscript" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "curriculumLevel" TEXT,
ADD COLUMN     "explanationLocale" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "uiLocale" TEXT NOT NULL DEFAULT 'en';

-- AlterTable
ALTER TABLE "LessonProgress" ADD COLUMN     "contentVersion" TEXT,
ADD COLUMN     "curriculumId" TEXT,
ADD COLUMN     "languageCode" TEXT,
ADD COLUMN     "lastQuestionId" TEXT,
ADD COLUMN     "resumeState" JSONB;

-- AlterTable
ALTER TABLE "ExerciseAttempt" ADD COLUMN     "accommodation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "answerKeyHash" TEXT,
ADD COLUMN     "curriculumId" TEXT,
ADD COLUMN     "languageCode" TEXT,
ADD COLUMN     "questionType" TEXT,
ADD COLUMN     "questionVersion" INTEGER;

-- AlterTable
ALTER TABLE "SpacedReviewItem" ADD COLUMN     "curriculumId" TEXT;

-- CreateTable
CREATE TABLE "UserLanguageProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "curriculumId" TEXT,
    "activeLevelCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLanguageProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLanguageStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "xpTotal" INTEGER NOT NULL DEFAULT 0,
    "minutesTotal" INTEGER NOT NULL DEFAULT 0,
    "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "lessonsMastered" INTEGER NOT NULL DEFAULT 0,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "accuracyPercent" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLanguageStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LanguageDailyActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "minutes" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "reviewsCompleted" INTEGER NOT NULL DEFAULT 0,
    "goalMet" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LanguageDailyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Curriculum" (
    "id" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "framework" TEXT NOT NULL,
    "variant" TEXT NOT NULL DEFAULT 'standard',
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "totalLessons" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Curriculum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurriculumLevel" (
    "id" TEXT NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "canDo" TEXT[],
    "estimatedHours" INTEGER,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "totalLessons" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CurriculumLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurriculumUnit" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "checkpointQuestionCount" INTEGER NOT NULL DEFAULT 20,

    CONSTRAINT "CurriculumUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurriculumLesson" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'lesson',
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 8,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "contentVersion" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "CurriculumLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonLocalization" (
    "lessonId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT,
    "objective" TEXT,
    "body" JSONB,
    "translationStatus" TEXT NOT NULL DEFAULT 'reviewed',

    CONSTRAINT "LessonLocalization_pkey" PRIMARY KEY ("lessonId","locale")
);

-- CreateTable
CREATE TABLE "AudioAsset" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "transcript" TEXT NOT NULL,
    "voice" TEXT,
    "provider" TEXT,
    "checksum" TEXT NOT NULL,
    "license" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AudioAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Passage" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "promptSupport" JSONB,
    "translation" TEXT,
    "audioAssetId" TEXT,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "fingerprint" TEXT,

    CONSTRAINT "Passage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "passageId" TEXT,
    "audioAssetId" TEXT,
    "position" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "promptSupport" JSONB,
    "answerKey" JSONB NOT NULL,
    "answerKeyHash" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "explanationLocale" TEXT NOT NULL DEFAULT 'en',
    "conceptKey" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "tags" TEXT[],
    "fingerprint" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "contentVersion" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "source" TEXT,
    "license" TEXT,
    "generationMeta" JSONB,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewStatus" TEXT NOT NULL DEFAULT 'automated',
    "retiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionChoice" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "side" TEXT,

    CONSTRAINT "QuestionChoice_pkey" PRIMARY KEY ("questionId","id")
);

-- CreateTable
CREATE TABLE "QuestionLocalization" (
    "questionId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "prompt" TEXT,
    "explanation" TEXT,
    "translationStatus" TEXT NOT NULL DEFAULT 'reviewed',

    CONSTRAINT "QuestionLocalization_pkey" PRIMARY KEY ("questionId","locale")
);

-- CreateTable
CREATE TABLE "QuestionRevision" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "answerKeyHash" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "publishedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentReview" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT,
    "questionId" TEXT,
    "reviewerId" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "authorId" TEXT,
    "locale" TEXT,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "checklist" JSONB NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionStat" (
    "questionId" TEXT NOT NULL,
    "questionVersion" INTEGER NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "pValue" DOUBLE PRECISION,
    "pointBiserial" DOUBLE PRECISION,
    "avgTimeMs" INTEGER,
    "flag" TEXT,
    "lastComputedAt" TIMESTAMP(3),

    CONSTRAINT "QuestionStat_pkey" PRIMARY KEY ("questionId","questionVersion")
);

-- CreateTable
CREATE TABLE "QuestionReport" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "QuestionReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentRelease" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "manifest" JSONB NOT NULL,
    "checksum" TEXT NOT NULL,
    "notes" TEXT,
    "publishedAt" TIMESTAMP(3),
    "publishedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentRelease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentReleaseItem" (
    "releaseId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fromVersion" INTEGER,
    "toVersion" INTEGER,

    CONSTRAINT "ContentReleaseItem_pkey" PRIMARY KEY ("releaseId","questionId")
);

-- CreateTable
CREATE TABLE "ContentImportJob" (
    "id" TEXT NOT NULL,
    "releaseVersion" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "stats" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "ContentImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentMigrationMap" (
    "id" TEXT NOT NULL,
    "legacyType" TEXT NOT NULL,
    "legacyId" TEXT NOT NULL,
    "newId" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "ContentMigrationMap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserLanguageProfile_userId_isActive_idx" ON "UserLanguageProfile"("userId", "isActive");

-- CreateIndex
CREATE INDEX "UserLanguageProfile_languageCode_lastActiveAt_idx" ON "UserLanguageProfile"("languageCode", "lastActiveAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserLanguageProfile_userId_languageCode_key" ON "UserLanguageProfile"("userId", "languageCode");

-- CreateIndex
CREATE INDEX "UserLanguageStats_languageCode_lastActivityAt_idx" ON "UserLanguageStats"("languageCode", "lastActivityAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserLanguageStats_userId_languageCode_key" ON "UserLanguageStats"("userId", "languageCode");

-- CreateIndex
CREATE INDEX "LanguageDailyActivity_userId_date_idx" ON "LanguageDailyActivity"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "LanguageDailyActivity_userId_languageCode_date_key" ON "LanguageDailyActivity"("userId", "languageCode", "date");

-- CreateIndex
CREATE INDEX "Curriculum_languageCode_status_idx" ON "Curriculum"("languageCode", "status");

-- CreateIndex
CREATE INDEX "Curriculum_status_idx" ON "Curriculum"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Curriculum_languageCode_framework_key" ON "Curriculum"("languageCode", "framework");

-- CreateIndex
CREATE INDEX "CurriculumLevel_curriculumId_position_idx" ON "CurriculumLevel"("curriculumId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumLevel_curriculumId_code_key" ON "CurriculumLevel"("curriculumId", "code");

-- CreateIndex
CREATE INDEX "CurriculumUnit_levelId_position_idx" ON "CurriculumUnit"("levelId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumUnit_levelId_position_key" ON "CurriculumUnit"("levelId", "position");

-- CreateIndex
CREATE INDEX "CurriculumLesson_unitId_status_idx" ON "CurriculumLesson"("unitId", "status");

-- CreateIndex
CREATE INDEX "CurriculumLesson_status_skill_idx" ON "CurriculumLesson"("status", "skill");

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumLesson_unitId_position_key" ON "CurriculumLesson"("unitId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "AudioAsset_storageKey_key" ON "AudioAsset"("storageKey");

-- CreateIndex
CREATE UNIQUE INDEX "AudioAsset_checksum_key" ON "AudioAsset"("checksum");

-- CreateIndex
CREATE UNIQUE INDEX "Passage_fingerprint_key" ON "Passage"("fingerprint");

-- CreateIndex
CREATE INDEX "Passage_lessonId_kind_idx" ON "Passage"("lessonId", "kind");

-- CreateIndex
CREATE INDEX "Passage_languageCode_kind_idx" ON "Passage"("languageCode", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "Question_fingerprint_key" ON "Question"("fingerprint");

-- CreateIndex
CREATE INDEX "Question_lessonId_status_idx" ON "Question"("lessonId", "status");

-- CreateIndex
CREATE INDEX "Question_status_type_idx" ON "Question"("status", "type");

-- CreateIndex
CREATE INDEX "Question_skill_status_idx" ON "Question"("skill", "status");

-- CreateIndex
CREATE INDEX "Question_conceptKey_idx" ON "Question"("conceptKey");

-- CreateIndex
CREATE INDEX "Question_reviewStatus_idx" ON "Question"("reviewStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Question_lessonId_position_key" ON "Question"("lessonId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionChoice_questionId_position_key" ON "QuestionChoice"("questionId", "position");

-- CreateIndex
CREATE INDEX "QuestionRevision_questionId_createdAt_idx" ON "QuestionRevision"("questionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionRevision_questionId_version_key" ON "QuestionRevision"("questionId", "version");

-- CreateIndex
CREATE INDEX "ContentReview_lessonId_status_idx" ON "ContentReview"("lessonId", "status");

-- CreateIndex
CREATE INDEX "ContentReview_questionId_status_idx" ON "ContentReview"("questionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ContentReview_questionId_locale_reviewerId_key" ON "ContentReview"("questionId", "locale", "reviewerId");

-- CreateIndex
CREATE INDEX "QuestionStat_flag_idx" ON "QuestionStat"("flag");

-- CreateIndex
CREATE INDEX "QuestionStat_pValue_idx" ON "QuestionStat"("pValue");

-- CreateIndex
CREATE INDEX "QuestionReport_status_createdAt_idx" ON "QuestionReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "QuestionReport_questionId_idx" ON "QuestionReport"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentRelease_version_key" ON "ContentRelease"("version");

-- CreateIndex
CREATE INDEX "ContentRelease_status_publishedAt_idx" ON "ContentRelease"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "ContentReleaseItem_questionId_idx" ON "ContentReleaseItem"("questionId");

-- CreateIndex
CREATE INDEX "ContentImportJob_status_startedAt_idx" ON "ContentImportJob"("status", "startedAt");

-- CreateIndex
CREATE INDEX "ContentMigrationMap_newId_idx" ON "ContentMigrationMap"("newId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentMigrationMap_legacyType_legacyId_key" ON "ContentMigrationMap"("legacyType", "legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Language_uiLocale_key" ON "Language"("uiLocale");

-- Enforce canonical language codes after backfill.
ALTER TABLE "Language" ALTER COLUMN "code" SET NOT NULL,
ALTER COLUMN "uiLocale" SET NOT NULL;

-- Partial unique invariants (not expressible in Prisma schema)
CREATE UNIQUE INDEX "UserLanguageProfile_one_active_key"
  ON "UserLanguageProfile"("userId") WHERE "isActive" = true;
CREATE UNIQUE INDEX "ContentRelease_one_published_key"
  ON "ContentRelease"("status") WHERE "status" = 'published';

-- CreateIndex
CREATE INDEX "Language_isActive_idx" ON "Language"("isActive");

-- CreateIndex
CREATE INDEX "LessonProgress_userId_languageCode_status_idx" ON "LessonProgress"("userId", "languageCode", "status");

-- CreateIndex
CREATE INDEX "ExerciseAttempt_userId_languageCode_createdAt_idx" ON "ExerciseAttempt"("userId", "languageCode", "createdAt");

-- CreateIndex
CREATE INDEX "ExerciseAttempt_exerciseId_questionVersion_idx" ON "ExerciseAttempt"("exerciseId", "questionVersion");

-- CreateIndex
CREATE INDEX "SpacedReviewItem_userId_languageCode_dueAt_status_idx" ON "SpacedReviewItem"("userId", "languageCode", "dueAt", "status");

-- AddForeignKey
ALTER TABLE "UserLanguageProfile" ADD CONSTRAINT "UserLanguageProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLanguageProfile" ADD CONSTRAINT "UserLanguageProfile_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLanguageProfile" ADD CONSTRAINT "UserLanguageProfile_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLanguageStats" ADD CONSTRAINT "UserLanguageStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLanguageStats" ADD CONSTRAINT "UserLanguageStats_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageDailyActivity" ADD CONSTRAINT "LanguageDailyActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageDailyActivity" ADD CONSTRAINT "LanguageDailyActivity_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curriculum" ADD CONSTRAINT "Curriculum_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumLevel" ADD CONSTRAINT "CurriculumLevel_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumUnit" ADD CONSTRAINT "CurriculumUnit_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "CurriculumLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumLesson" ADD CONSTRAINT "CurriculumLesson_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "CurriculumUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonLocalization" ADD CONSTRAINT "LessonLocalization_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "CurriculumLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passage" ADD CONSTRAINT "Passage_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "CurriculumLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passage" ADD CONSTRAINT "Passage_audioAssetId_fkey" FOREIGN KEY ("audioAssetId") REFERENCES "AudioAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "CurriculumLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES "Passage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_audioAssetId_fkey" FOREIGN KEY ("audioAssetId") REFERENCES "AudioAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionChoice" ADD CONSTRAINT "QuestionChoice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionLocalization" ADD CONSTRAINT "QuestionLocalization_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionRevision" ADD CONSTRAINT "QuestionRevision_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "CurriculumLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionStat" ADD CONSTRAINT "QuestionStat_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionReport" ADD CONSTRAINT "QuestionReport_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionReport" ADD CONSTRAINT "QuestionReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReleaseItem" ADD CONSTRAINT "ContentReleaseItem_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "ContentRelease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReleaseItem" ADD CONSTRAINT "ContentReleaseItem_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

