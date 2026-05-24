import Link from "next/link";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/db";
import { requireHrOrAdmin } from "@/lib/permissions";
import { redirect } from "next/navigation";
import {
  APPLICANT_STATUS_COLORS,
  APPLICANT_STATUS_LABELS,
  RECOMMENDATION_COLORS,
  RECOMMENDATION_LABELS,
} from "@/lib/constants";

export default async function ApplicantsPage() {
  const user = await requireHrOrAdmin();
  if (!user) redirect("/login");

  const applicants = await prisma.applicant.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: { job: { select: { id: true, title: true } } },
    take: 200,
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">All Applicants</h1>
        <p className="text-sm text-[var(--arc-text-secondary)] mt-1">
          Master database · {applicants.length} candidates
        </p>
      </header>

      {applicants.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-[var(--arc-text-tertiary)] mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-1">No applicants yet</h3>
          <p className="text-sm text-[var(--arc-text-secondary)]">
            Upload a resume on any open role to populate the database.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--arc-bg-secondary)] border-b border-[var(--arc-border-default)]">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] font-medium">
                  Candidate
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] font-medium">
                  Job
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] font-medium">
                  Score
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] font-medium">
                  Match
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] font-medium">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] font-medium">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-[var(--arc-border-subtle)] hover:bg-[var(--arc-bg-hover)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/applicants/${a.id}`}
                      className="hover:text-[var(--arc-crimson-400)]"
                    >
                      <p className="font-medium">{a.name}</p>
                      {a.email && (
                        <p className="text-xs text-[var(--arc-text-tertiary)]">{a.email}</p>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--arc-text-secondary)]">
                    <Link
                      href={`/jobs/${a.job.id}`}
                      className="hover:text-[var(--arc-text-primary)]"
                    >
                      {a.job.title}
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
        </Card>
      )}
    </div>
  );
}
