import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireHrOrAdmin } from "@/lib/permissions";
import {
  analyzeResume,
  type ParsedResume,
  type ResumeInput,
  type ResumeScore,
} from "@/lib/resume-analyzer";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireHrOrAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const applicants = await prisma.applicant.findMany({
    where: { jobId: id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      score: true,
      recommendation: true,
      status: true,
      resumeFileName: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(applicants);
}

// Upload + analyze a new resume for this job opening.
// Accepts multipart/form-data with one of:
//   - file (PDF), or
//   - resumeText (plain text)
// Optional override fields: name, email
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireHrOrAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: jobId } = await params;
  const job = await prisma.jobOpening.findUnique({ where: { id: jobId } });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  let resumeInput: ResumeInput;
  let fileName: string | null = null;
  let fileMime: string | null = null;
  let overrideName: string | null = null;
  let overrideEmail: string | null = null;

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    const textField = form.get("resumeText");
    overrideName = (form.get("name") as string | null) || null;
    overrideEmail = (form.get("email") as string | null) || null;

    if (file instanceof File && file.size > 0) {
      fileName = file.name;
      fileMime = file.type || "application/octet-stream";
      const buf = Buffer.from(await file.arrayBuffer());

      if (fileMime === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
        resumeInput = { kind: "pdf", base64: buf.toString("base64") };
      } else {
        // Plain text or markdown — decode as UTF-8
        resumeInput = { kind: "text", text: buf.toString("utf-8") };
      }
    } else if (typeof textField === "string" && textField.trim().length > 0) {
      resumeInput = { kind: "text", text: textField };
    } else {
      return NextResponse.json(
        { error: "Provide a resume file or resumeText" },
        { status: 400 }
      );
    }
  } else {
    const body = (await req.json().catch(() => null)) as {
      resumeText?: string;
      name?: string;
      email?: string;
    } | null;
    if (!body?.resumeText) {
      return NextResponse.json(
        { error: "Provide resumeText in JSON body" },
        { status: 400 }
      );
    }
    resumeInput = { kind: "text", text: body.resumeText };
    overrideName = body.name ?? null;
    overrideEmail = body.email ?? null;
  }

  let parsed: ParsedResume;
  let score: ResumeScore;
  let model: string;
  let totalUsage: { input_tokens: number; output_tokens: number };

  try {
    const result = await analyzeResume(
      {
        title: job.title,
        department: job.department,
        location: job.location,
        employmentType: job.employmentType,
        experienceLevel: job.experienceLevel,
        description: job.description,
        requirements: job.requirements,
      },
      resumeInput
    );
    parsed = result.parsed;
    score = result.score;
    model = result.model;
    totalUsage = result.totalUsage;
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const applicant = await prisma.applicant.create({
    data: {
      jobId,
      uploadedById: user.id,
      name: overrideName || parsed.name || "Unknown Candidate",
      email: overrideEmail || parsed.email || null,
      phone: parsed.phone || null,
      location: parsed.location || null,
      resumeFileName: fileName,
      resumeMime: fileMime,
      resumeText: resumeInput.kind === "text" ? resumeInput.text : null,
      parsedData: parsed as unknown as object,
      score: score.overall_score,
      recommendation: score.recommendation,
      remarks: score as unknown as object,
    },
  });

  await prisma.analysisRun.create({
    data: {
      applicantId: applicant.id,
      score: score.overall_score,
      recommendation: score.recommendation,
      result: score as unknown as object,
      model,
      tokensInput: totalUsage.input_tokens,
      tokensOutput: totalUsage.output_tokens,
    },
  });

  await prisma.apiUsage.create({
    data: {
      userId: user.id,
      feature: "resume_analysis",
      model,
      tokensInput: totalUsage.input_tokens,
      tokensOutput: totalUsage.output_tokens,
    },
  });

  return NextResponse.json(
    {
      id: applicant.id,
      name: applicant.name,
      email: applicant.email,
      score: applicant.score,
      recommendation: applicant.recommendation,
    },
    { status: 201 }
  );
}
