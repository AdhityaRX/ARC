import Link from "next/link";
import { Plus, MapPin, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/db";
import { requireHrOrAdmin } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS } from "@/lib/constants";

export default async function JobsPage() {
  const user = await requireHrOrAdmin();
  if (!user) redirect("/login");

  const jobs = await prisma.jobOpening.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: {
      createdBy: { select: { name: true } },
      _count: { select: { applicants: true } },
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Job Openings</h1>
          <p className="text-sm text-[var(--arc-text-secondary)] mt-1">
            {jobs.length} {jobs.length === 1 ? "role" : "roles"} tracked
          </p>
        </div>
        <Link href="/jobs/new">
          <Button>
            <Plus className="w-4 h-4" />
            New Job
          </Button>
        </Link>
      </header>

      {jobs.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="w-12 h-12 text-[var(--arc-text-tertiary)] mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-1">No job openings yet</h3>
          <p className="text-sm text-[var(--arc-text-secondary)] mb-5">
            Create your first opening to start collecting and ranking applicants.
          </p>
          <Link href="/jobs/new">
            <Button>
              <Plus className="w-4 h-4" />
              Create First Opening
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((j) => (
            <Link key={j.id} href={`/jobs/${j.id}`}>
              <Card className="p-5 hover:border-[var(--arc-border-strong)] transition-colors cursor-pointer h-full">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-semibold tracking-tight line-clamp-1">
                    {j.title}
                  </h3>
                  <span
                    className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${JOB_STATUS_COLORS[j.status]}`}
                  >
                    {JOB_STATUS_LABELS[j.status]}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--arc-text-tertiary)] mb-3">
                  {j.department && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {j.department}
                    </span>
                  )}
                  {j.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {j.location}
                    </span>
                  )}
                  {j.experienceLevel && <span>· {j.experienceLevel}</span>}
                  {j.employmentType && <span>· {j.employmentType}</span>}
                </div>
                <p className="text-sm text-[var(--arc-text-secondary)] line-clamp-3 leading-relaxed">
                  {j.description}
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--arc-border-subtle)]">
                  <span className="text-xs text-[var(--arc-text-tertiary)]">
                    {j.createdBy.name || "—"} · {new Date(j.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs font-medium text-[var(--arc-text-primary)]">
                    {j._count.applicants}{" "}
                    {j._count.applicants === 1 ? "applicant" : "applicants"}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
