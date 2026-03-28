-- AlterTable
ALTER TABLE "sites" ADD COLUMN     "pipelineArtifacts" JSONB,
ADD COLUMN     "pipelineMessages" JSONB;
