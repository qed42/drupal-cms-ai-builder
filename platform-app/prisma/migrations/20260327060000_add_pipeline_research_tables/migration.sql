-- AlterTable: sites — add pipeline tracking columns
ALTER TABLE "sites" ADD COLUMN "pipelinePhase" TEXT;
ALTER TABLE "sites" ADD COLUMN "pipelineError" TEXT;

-- AlterTable: onboarding_sessions — add research preview columns
ALTER TABLE "onboarding_sessions" ADD COLUMN "research_preview" JSONB;
ALTER TABLE "onboarding_sessions" ADD COLUMN "preview_input_hash" TEXT;

-- AlterTable: blueprints — add generation tracking and versioning columns
ALTER TABLE "blueprints" ADD COLUMN "originalPayload" JSONB;
ALTER TABLE "blueprints" ADD COLUMN "generationStep" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "blueprints" ADD COLUMN "generationError" TEXT;

-- CreateTable
CREATE TABLE "research_briefs" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "content" JSONB NOT NULL,
    "model" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_briefs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_plans" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "researchBriefId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "content" JSONB NOT NULL,
    "model" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blueprint_versions" (
    "id" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "label" TEXT,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blueprint_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "research_briefs_siteId_version_key" ON "research_briefs"("siteId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "content_plans_siteId_version_key" ON "content_plans"("siteId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "blueprint_versions_blueprintId_version_key" ON "blueprint_versions"("blueprintId", "version");

-- AddForeignKey
ALTER TABLE "research_briefs" ADD CONSTRAINT "research_briefs_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_plans" ADD CONSTRAINT "content_plans_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_plans" ADD CONSTRAINT "content_plans_researchBriefId_fkey" FOREIGN KEY ("researchBriefId") REFERENCES "research_briefs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blueprint_versions" ADD CONSTRAINT "blueprint_versions_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
