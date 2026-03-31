-- AlterTable
ALTER TABLE "onboarding_sessions" ADD COLUMN     "design_preferences" JSONB,
ADD COLUMN     "generation_mode" TEXT NOT NULL DEFAULT 'design_system';
