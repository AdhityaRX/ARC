import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireHrOrAdmin } from "@/lib/permissions";
import {
  getAnthropicSettings,
  scoreResume,
  type ParsedResume,
} from "@/lib/resume-analyzer";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 300;

// Re-score an applicant against the latest job description.
// Re-uses the previously parsed resume profile — does not re-parse the PDF.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireHrOrAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const applicant = await prisma.applicant.findUnique({
    where: { id },
    include: { job: true },
  });
  if (!applicant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { apiKey, model, maxTokens } = await getAnthropicSettings();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Anthropic API key not configured" },
      { status: 500 }
    );
  }

  const client = new Anthropic({ apiKey });
  const parsed = applicant.parsedData as unknown as ParsedResume;

  try {
    const { result, usage } = await scoreResume(
      client,
      model,
      maxTokens,
      {
        title: applicant.job.title,
        department: applicant.job.department,
        location: applicant.job.location,
        employmentType: applicant.job.employmentType,
        experienceLevel: applicant.job.experienceLevel,
        description: applicant.job.description,
        requirements: applicant.job.requirements,
      },
      parsed
    );

    await prisma.applicant.update({
      where: { id },
      data: {
        score: result.overall_score,
        recommendation: result.recommendation,
        remarks: result as unknown as object,
      },
    });

    await prisma.analysisRun.create({
      data: {
        applicantId: id,
        score: result.overall_score,
        recommendation: result.recommendation,
        result: result as unknown as object,
        model,
        tokensInput: usage.input_tokens,
        tokensOutput: usage.output_tokens,
      },
    });

    await prisma.apiUsage.create({
      data: {
        userId: user.id,
        feature: "resume_rescoring",
        model,
        tokensInput: usage.input_tokens,
        tokensOutput: usage.output_tokens,
      },
    });

    return NextResponse.json({ ok: true, score: result.overall_score });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Re-analysis failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
