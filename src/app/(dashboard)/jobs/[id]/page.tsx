import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  User as UserIcon,
  Clock,
  Upload,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/db";
import { requireHrOrAdmin } from "@/lib/permissions";
import { notFound, redirect } from "next/navigation";
import {
  APPLICANT_STATUS_COLORS,
  APPLICANT_STATUS_LABELS,
  JOB_STATUS_COLORS,
  JOB_STATUS_LABELS,
  RECOMMENDATION_COLORS,
  RECOMMENDATION_LABELS,
} from "@/lib/constants";
import { ResumeUploader } from "@/components/hr/ResumeUploader";
import { JobStatusControl } from "@/components/hr/JobStatusControl";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireHrOrAdmin();
  if (!user) redirect("/login");

  const { id } = await params;
  const job = await prisma.jobOpening.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true, email: true } },
      applicants: {
        orderBy: [{ score: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          name: true,
          email: true,
          score: true,
          recommendation: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!job) notFound();

  const requirements = (job.requirements ?? {}) as {
    required_skills?: string[];
    preferred_skills?: string[];
    min_years_experience?: number;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--arc-text-secondary)] hover:text-[var(--arc-text-primary)] mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        All Jobs
      </Link>

      {/* Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">{job.title}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-sm text-[var(--arc-text-secondary)]">
              {job.department && (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  {job.department}
                </span>
              )}
              {job.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {job.location}
                </span>
              )}
              {job.experienceLevel && <span>· {job.experienceLevel}</span>}
              {job.employmentType && <span>· {job.employmentType}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider ${JOB_STATUS_COLORS[job.status]}`}
            >
              {JOB_STATUS_LABELS[job.status]}
            </span>
            <JobStatusControl jobId={job.id} currentStatus={job.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5 pt-5 border-t border-[var(--arc-border-subtle)]">
          <div className="md:col-span-2">
            <h3 className="text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] mb-2">
              Description
            </h3>
            <p className="text-sm text-[var(--arc-text-primary)] whitespace-pre-wrap leading-relaxed">
              {job.description}
            </p>
          </div>
          <div className="space-y-4">
            {requirements.required_skills && requirements.required_skills.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] mb-2">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {requirements.required_skills.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2 py-0.5 rounded-full bg-[var(--arc-crimson-900)] text-[var(--arc-crimson-400)] border border-[var(--arc-crimson-500)]/20"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {requirements.preferred_skills && requirements.preferred_skills.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] mb-2">
                  Preferred Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {requirements.preferred_skills.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2 py-0.5 rounded-full bg-[var(--arc-bg-tertiary)] text-[var(--arc-text-secondary)] border border-[var(--arc-border-default)]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {requirements.min_years_experience !== undefined && (
              <div>
                <h3 className="text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] mb-1">
                  Min Experience
                </h3>
                <p className="text-sm">{requirements.min_years_experience}+ years</p>
              </div>
            )}
            <div className="text-xs text-[var(--arc-text-tertiary)] flex items-center gap-1.5">
              <UserIcon className="w-3 h-3" />
              Created by {job.createdBy.name || job.createdBy.email}
            </div>
            <div className="text-xs text-[var(--arc-text-tertiary)] flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {new Date(job.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      </Card>

      {/* Resume Upload */}
      <Card className="p-6 mb-6" accent>
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-4 h-4 text-[var(--arc-crimson-400)]" />
          <h2 className="text-base font-semibold">Add Applicant</h2>
        </div>
        <ResumeUploader jobId={job.id} />
      </Card>

      {/* Applicants */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-[var(--arc-border-subtle)] flex items-center justify-between">
          <h2 className="text-base font-semibold">
            Applicants{" "}
            <span className="text-[var(--arc-text-tertiary)] font-normal">
              · {job.applicants.length}
            </span>
          </h2>
        </div>
        {job.applicants.length === 0 ? (
          <div className="p-10 text-center text-sm text-[var(--arc-text-tertiary)]">
            No applicants yet. Upload a resume above to begin.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--arc-bg-secondary)] border-b border-[var(--arc-border-default)]">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] font-medium">
                  Rank
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] font-medium">
                  Candidate
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] font-medium">
                  Score
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] font-medium">
                  Recommendation
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] font-medium">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] font-medium">
                  Uploaded
                </th>
              </tr>
            </thead>
            <tbody>
              {job.applicants.map((a, i) => (
                <tr
                  key={a.id}
                  className="border-b border-[var(--arc-border-subtle)] hover:bg-[var(--arc-bg-hover)] transition-colors"
                >
                  <td className="px-4 py-3 text-[var(--arc-text-tertiary)] tabular-nums">
                    #{i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/applicants/${a.id}`}
                      className="block hover:text-[var(--arc-crimson-400)]"
                    >
                      <p className="font-medium">{a.name}</p>
                      {a.email && (
                        <p className="text-xs text-[var(--arc-text-tertiary)]">{a.email}</p>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums font-semibold">
                    {a.score !== null ? Math.round(Number(a.score)) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {a.recommendation ? (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${RECOMMENDATION_COLORS[a.recommendation]}`}
                      >
                        {RECOMMENDATION_LABELS[a.recommendation]}
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--arc-text-tertiary)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${APPLICANT_STATUS_COLORS[a.status]}`}
                    >
                      {APPLICANT_STATUS_LABELS[a.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--arc-text-tertiary)]">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
