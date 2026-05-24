import Link from "next/link";
import { ArrowLeft, Download, RefreshCw, History } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/db";
import { requireHrOrAdmin } from "@/lib/permissions";
import { notFound, redirect } from "next/navigation";
import { AnalysisReport } from "@/components/hr/AnalysisReport";
import { ApplicantActions } from "@/components/hr/ApplicantActions";
import {
  APPLICANT_STATUS_COLORS,
  APPLICANT_STATUS_LABELS,
  RECOMMENDATION_COLORS,
  RECOMMENDATION_LABELS,
} from "@/lib/constants";
import type { ParsedResume, ResumeScore } from "@/lib/resume-analyzer";

export default async function ApplicantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireHrOrAdmin();
  if (!user) redirect("/login");

  const { id } = await params;
  const applicant = await prisma.applicant.findUnique({
    where: { id },
    include: {
      job: true,
      uploadedBy: { select: { name: true, email: true } },
      analysisRuns: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!applicant) notFound();

  const parsed = applicant.parsedData as unknown as ParsedResume;
  const score = applicant.remarks as unknown as ResumeScore;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <Link
          href={`/jobs/${applicant.job.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--arc-text-secondary)] hover:text-[var(--arc-text-primary)]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {applicant.job.title}
        </Link>

        <div className="flex items-center gap-2">
          <ApplicantActions
            applicantId={applicant.id}
            currentStatus={applicant.status}
          />
          <Link href={`/report/${applicant.id}`} target="_blank">
            <Button variant="secondary" size="sm">
              <Download className="w-4 h-4" />
              Download Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Status / metadata strip */}
      <div className="flex flex-wrap items-center gap-2 mb-6 text-xs text-[var(--arc-text-tertiary)]">
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${APPLICANT_STATUS_COLORS[applicant.status]}`}
        >
          {APPLICANT_STATUS_LABELS[applicant.status]}
        </span>
        {applicant.recommendation && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${RECOMMENDATION_COLORS[applicant.recommendation]}`}
          >
            {RECOMMENDATION_LABELS[applicant.recommendation]}
          </span>
        )}
        <span>
          Uploaded by {applicant.uploadedBy.name || applicant.uploadedBy.email} ·{" "}
          {new Date(applicant.createdAt).toLocaleString()}
        </span>
        {applicant.resumeFileName && (
          <span>· File: {applicant.resumeFileName}</span>
        )}
      </div>

      {/* The full analysis report */}
      <AnalysisReport
        applicantName={applicant.name}
        applicantEmail={applicant.email}
        jobTitle={applicant.job.title}
        jobDepartment={applicant.job.department}
        parsed={parsed}
        score={score}
        generatedAt={applicant.updatedAt}
      />

      {/* Analysis history */}
      {applicant.analysisRuns.length > 1 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-[var(--arc-text-tertiary)]" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--arc-text-secondary)]">
              Re-Analysis History
            </h2>
          </div>
          <div className="space-y-2">
            {applicant.analysisRuns.map((run, i) => (
              <div
                key={run.id}
                className="flex items-center justify-between text-xs px-3 py-2 rounded-[var(--arc-radius-sm)] bg-[var(--arc-bg-secondary)] border border-[var(--arc-border-subtle)]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[var(--arc-text-tertiary)]">
                    {i === 0 ? "Latest" : `Run ${applicant.analysisRuns.length - i}`}
                  </span>
                  <span className="font-medium tabular-nums">
                    Score: {run.score !== null ? Math.round(Number(run.score)) : "—"}
                  </span>
                  {run.recommendation && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider ${RECOMMENDATION_COLORS[run.recommendation]}`}
                    >
                      {RECOMMENDATION_LABELS[run.recommendation]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[var(--arc-text-tertiary)]">
                  <span>{run.model}</span>
                  <span>
                    {(run.tokensInput + run.tokensOutput).toLocaleString()} tokens
                  </span>
                  <span>{new Date(run.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-[10px] text-[var(--arc-text-tertiary)] mt-6 flex items-center gap-1.5">
        <RefreshCw className="w-3 h-3" />
        Re-analyzing pulls the latest JD and re-scores against the parsed resume.
      </div>
    </div>
  );
}
