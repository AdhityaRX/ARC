import Link from "next/link";
import { Briefcase, Users, FileCheck2, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/db";
import { requireHrOrAdmin } from "@/lib/permissions";
import { redirect } from "next/navigation";
import {
  APPLICANT_STATUS_COLORS,
  APPLICANT_STATUS_LABELS,
  JOB_STATUS_COLORS,
  JOB_STATUS_LABELS,
  RECOMMENDATION_COLORS,
  RECOMMENDATION_LABELS,
} from "@/lib/constants";

export default async function DashboardPage() {
  const user = await requireHrOrAdmin();
  if (!user) redirect("/login");

  const [
    openJobs,
    totalJobs,
    totalApplicants,
    shortlisted,
    recentJobs,
    recentApplicants,
  ] = await Promise.all([
    prisma.jobOpening.count({ where: { status: "open" } }),
    prisma.jobOpening.count(),
    prisma.applicant.count(),
    prisma.applicant.count({ where: { status: "shortlisted" } }),
    prisma.jobOpening.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { applicants: true } } },
    }),
    prisma.applicant.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { job: { select: { id: true, title: true } } },
    }),
  ]);

  const stats = [
    { label: "Open Roles", value: openJobs, total: totalJobs, icon: Briefcase },
    { label: "Total Applicants", value: totalApplicants, icon: Users },
    { label: "Shortlisted", value: shortlisted, icon: FileCheck2 },
    {
      label: "Conversion",
      value:
        totalApplicants > 0
          ? `${Math.round((shortlisted / totalApplicants) * 100)}%`
          : "0%",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user.name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-sm text-[var(--arc-text-secondary)] mt-1">
          Resume intelligence powered by Claude Opus 4.7
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[var(--arc-radius-sm)] bg-[var(--arc-crimson-900)] flex items-center justify-center">
                <s.icon className="w-5 h-5 text-[var(--arc-crimson-400)]" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-semibold tabular-nums">
                  {s.value}
                  {s.total !== undefined && (
                    <span className="text-sm text-[var(--arc-text-tertiary)] font-normal">
                      {" "}
                      / {s.total}
                    </span>
                  )}
                </p>
                <p className="text-xs text-[var(--arc-text-tertiary)] uppercase tracking-wider">
                  {s.label}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--arc-text-secondary)]">
              Recent Job Openings
            </h2>
            <Link href="/jobs" className="text-xs text-[var(--arc-crimson-400)] hover:underline">
              View all
            </Link>
          </div>
          {recentJobs.length === 0 ? (
            <p className="text-sm text-[var(--arc-text-tertiary)] py-8 text-center">
              No job openings yet.{" "}
              <Link href="/jobs/new" className="text-[var(--arc-crimson-400)] hover:underline">
                Create one
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-2">
              {recentJobs.map((j) => (
                <li key={j.id}>
                  <Link
                    href={`/jobs/${j.id}`}
                    className="block p-3 rounded-[var(--arc-radius-sm)] hover:bg-[var(--arc-bg-hover)] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{j.title}</p>
                        <p className="text-xs text-[var(--arc-text-tertiary)]">
                          {j.department || "—"}
                          {j.location ? ` · ${j.location}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-[var(--arc-text-secondary)]">
                          {j._count.applicants}{" "}
                          {j._count.applicants === 1 ? "applicant" : "applicants"}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${JOB_STATUS_COLORS[j.status]}`}
                        >
                          {JOB_STATUS_LABELS[j.status]}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent Applicants */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--arc-text-secondary)]">
              Latest Applicants
            </h2>
            <Link
              href="/applicants"
              className="text-xs text-[var(--arc-crimson-400)] hover:underline"
            >
              View all
            </Link>
          </div>
          {recentApplicants.length === 0 ? (
            <p className="text-sm text-[var(--arc-text-tertiary)] py-8 text-center">
              No applicants yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {recentApplicants.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/applicants/${a.id}`}
                    className="block p-3 rounded-[var(--arc-radius-sm)] hover:bg-[var(--arc-bg-hover)] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{a.name}</p>
                        <p className="text-xs text-[var(--arc-text-tertiary)] truncate">
                          {a.job.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {a.score !== null && (
                          <span className="text-sm font-semibold tabular-nums">
                            {Math.round(Number(a.score))}
                          </span>
                        )}
                        {a.recommendation && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${RECOMMENDATION_COLORS[a.recommendation]}`}
                          >
                            {RECOMMENDATION_LABELS[a.recommendation]}
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${APPLICANT_STATUS_COLORS[a.status]}`}
                        >
                          {APPLICANT_STATUS_LABELS[a.status]}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
