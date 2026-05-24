import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireHrOrAdmin } from "@/lib/permissions";

export async function GET(req: Request) {
  const user = await requireHrOrAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const jobId = searchParams.get("jobId");
  const status = searchParams.get("status");

  const applicants = await prisma.applicant.findMany({
    where: {
      ...(jobId ? { jobId } : {}),
      ...(status
        ? { status: status as "new" | "reviewed" | "shortlisted" | "rejected" | "hired" }
        : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      job: { select: { id: true, title: true } },
    },
    orderBy: [{ createdAt: "desc" }],
    take: 200,
  });

  return NextResponse.json(applicants);
}
