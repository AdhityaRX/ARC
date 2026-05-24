import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { prisma } from "@/lib/db";
import { requireHrOrAdmin } from "@/lib/permissions";

export async function GET(req: Request) {
  const user = await requireHrOrAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  const jobs = await prisma.jobOpening.findMany({
    where: {
      ...(status ? { status: status as "open" | "closed" | "on_hold" } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { department: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      _count: { select: { applicants: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(jobs);
}

const createSchema = z.object({
  title: z.string().min(1).max(500),
  department: z.string().max(255).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  employmentType: z.string().max(100).optional().nullable(),
  experienceLevel: z.string().max(100).optional().nullable(),
  description: z.string().min(20),
  requirements: z.record(z.string(), z.any()).optional(),
  status: z.enum(["open", "closed", "on_hold"]).optional(),
});

export async function POST(req: Request) {
  const user = await requireHrOrAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const job = await prisma.jobOpening.create({
      data: {
        title: data.title,
        department: data.department ?? null,
        location: data.location ?? null,
        employmentType: data.employmentType ?? null,
        experienceLevel: data.experienceLevel ?? null,
        description: data.description,
        requirements: data.requirements ?? {},
        status: data.status ?? "open",
        createdById: user.id,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
