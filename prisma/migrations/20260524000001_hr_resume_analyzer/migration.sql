-- Note: ALTER TYPE "Role" ADD VALUE 'hr' was applied in the prior migration
-- (20260524000000_add_hr_role) so the new value is already committed.

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('open', 'closed', 'on_hold');

-- CreateEnum
CREATE TYPE "ApplicantStatus" AS ENUM ('new', 'reviewed', 'shortlisted', 'rejected', 'hired');

-- CreateEnum
CREATE TYPE "Recommendation" AS ENUM ('strong_match', 'match', 'partial_match', 'weak_match');

-- AlterTable
ALTER TABLE "api_usage" ADD COLUMN "feature" VARCHAR(100);

-- CreateTable
CREATE TABLE "job_openings" (
    "id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "department" VARCHAR(255),
    "location" VARCHAR(255),
    "employment_type" VARCHAR(100),
    "experience_level" VARCHAR(100),
    "description" TEXT NOT NULL,
    "requirements" JSONB NOT NULL DEFAULT '{}',
    "status" "JobStatus" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_openings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicants" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "uploaded_by_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "location" VARCHAR(255),
    "resume_file_name" VARCHAR(500),
    "resume_mime" VARCHAR(100),
    "resume_text" TEXT,
    "parsed_data" JSONB NOT NULL DEFAULT '{}',
    "score" DECIMAL(5,2),
    "recommendation" "Recommendation",
    "remarks" JSONB NOT NULL DEFAULT '{}',
    "status" "ApplicantStatus" NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applicants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_runs" (
    "id" TEXT NOT NULL,
    "applicant_id" TEXT NOT NULL,
    "score" DECIMAL(5,2),
    "recommendation" "Recommendation",
    "result" JSONB NOT NULL DEFAULT '{}',
    "model" VARCHAR(100),
    "tokens_input" INTEGER NOT NULL DEFAULT 0,
    "tokens_output" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analysis_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_openings_created_by_id_idx" ON "job_openings"("created_by_id");

-- CreateIndex
CREATE INDEX "applicants_job_id_idx" ON "applicants"("job_id");

-- CreateIndex
CREATE INDEX "applicants_email_idx" ON "applicants"("email");

-- CreateIndex
CREATE INDEX "analysis_runs_applicant_id_idx" ON "analysis_runs"("applicant_id");

-- AddForeignKey
ALTER TABLE "job_openings" ADD CONSTRAINT "job_openings_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job_openings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_runs" ADD CONSTRAINT "analysis_runs_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "applicants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
