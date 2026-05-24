import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import {
  DEFAULT_MAX_TOKENS,
  DEFAULT_MODEL,
  RESUME_PARSE_SYSTEM_PROMPT,
  RESUME_SCORING_SYSTEM_PROMPT,
} from "@/lib/constants";

export type ParsedResume = {
  name: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  summary: string;
  total_years_experience: number;
  education: Array<{
    degree: string;
    institution: string;
    field: string;
    start: string;
    end: string;
    grade: string;
  }>;
  experience: Array<{
    title: string;
    company: string;
    location: string;
    start: string;
    end: string;
    duration_months: number;
    description: string;
    highlights: string[];
  }>;
  skills: {
    technical: string[];
    frameworks: string[];
    languages: string[];
    tools: string[];
    soft: string[];
  };
  certifications: Array<{ name: string; issuer: string; year: string }>;
  projects: Array<{
    name: string;
    description: string;
    tech: string[];
    link: string;
  }>;
  languages_spoken: string[];
  links: { linkedin: string; github: string; portfolio: string; other: string[] };
};

export type ScoreSection = {
  score: number;
  weight: number;
  notes: string;
  matched?: string[];
  missing?: string[];
};

export type ResumeScore = {
  overall_score: number;
  recommendation: "strong_match" | "match" | "partial_match" | "weak_match";
  summary: string;
  scores: {
    technical_skills: ScoreSection;
    experience_relevance: ScoreSection;
    education_fit: ScoreSection;
    domain_knowledge: ScoreSection;
    soft_skills_communication: ScoreSection;
    achievements_impact: ScoreSection;
  };
  technical_breakdown: Array<{
    category: string;
    required: string[];
    candidate_has: string[];
    score: number;
  }>;
  strengths: string[];
  gaps: string[];
  red_flags: string[];
  interview_focus: string[];
  remarks: string;
  fit_for_role_explanation: string;
};

export type Usage = { input_tokens: number; output_tokens: number };

export type ResumeInput =
  | { kind: "text"; text: string }
  | { kind: "pdf"; base64: string };

export async function getAnthropicSettings() {
  const [apiKeySetting, modelSetting, maxTokensSetting] = await Promise.all([
    prisma.systemSetting.findUnique({ where: { key: "anthropic_api_key" } }),
    prisma.systemSetting.findUnique({ where: { key: "model" } }),
    prisma.systemSetting.findUnique({ where: { key: "max_tokens" } }),
  ]);

  const apiKey =
    (apiKeySetting?.value as { value?: string } | undefined)?.value ??
    process.env.ANTHROPIC_API_KEY ??
    "";
  const model =
    (modelSetting?.value as { value?: string } | undefined)?.value ??
    DEFAULT_MODEL;
  const maxTokens =
    (maxTokensSetting?.value as { value?: number } | undefined)?.value ??
    DEFAULT_MAX_TOKENS;

  return { apiKey, model, maxTokens };
}

function extractJson<T>(text: string): T {
  const trimmed = text.trim();
  // Strip optional ```json fences
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenceMatch ? fenceMatch[1] : trimmed;
  // Find the first { and last } in case the model added stray text
  const first = body.indexOf("{");
  const last = body.lastIndexOf("}");
  if (first === -1 || last === -1) {
    throw new Error("Model did not return JSON");
  }
  const json = body.slice(first, last + 1);
  return JSON.parse(json) as T;
}

function buildResumeContent(input: ResumeInput): Anthropic.ContentBlockParam[] {
  if (input.kind === "pdf") {
    return [
      {
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: input.base64,
        },
      },
      {
        type: "text",
        text: "Parse the resume above and return the JSON object per the schema.",
      },
    ];
  }
  return [
    {
      type: "text",
      text: `Parse the following resume text and return the JSON object per the schema.\n\n--- RESUME START ---\n${input.text}\n--- RESUME END ---`,
    },
  ];
}

export async function parseResume(
  client: Anthropic,
  model: string,
  maxTokens: number,
  input: ResumeInput
): Promise<{ parsed: ParsedResume; usage: Usage }> {
  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: RESUME_PARSE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildResumeContent(input) }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  const parsed = extractJson<ParsedResume>(text);
  return {
    parsed,
    usage: {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
    },
  };
}

export type JobInput = {
  title: string;
  department?: string | null;
  location?: string | null;
  employmentType?: string | null;
  experienceLevel?: string | null;
  description: string;
  requirements?: unknown;
};

export async function scoreResume(
  client: Anthropic,
  model: string,
  maxTokens: number,
  job: JobInput,
  candidate: ParsedResume
): Promise<{ result: ResumeScore; usage: Usage }> {
  const userPayload = {
    job: {
      title: job.title,
      department: job.department ?? "",
      location: job.location ?? "",
      employment_type: job.employmentType ?? "",
      experience_level: job.experienceLevel ?? "",
      description: job.description,
      requirements: job.requirements ?? {},
    },
    candidate,
  };

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: RESUME_SCORING_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Evaluate the candidate below against the job description. Return only the JSON object per the schema.\n\n${JSON.stringify(userPayload, null, 2)}`,
      },
    ],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  const result = extractJson<ResumeScore>(text);
  return {
    result,
    usage: {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
    },
  };
}

export async function analyzeResume(
  job: JobInput,
  input: ResumeInput
): Promise<{
  parsed: ParsedResume;
  score: ResumeScore;
  model: string;
  totalUsage: Usage;
}> {
  const { apiKey, model, maxTokens } = await getAnthropicSettings();
  if (!apiKey) {
    throw new Error(
      "Anthropic API key is not configured. A super admin must set it in Admin → Settings."
    );
  }

  const client = new Anthropic({ apiKey });

  const { parsed, usage: parseUsage } = await parseResume(
    client,
    model,
    maxTokens,
    input
  );
  const { result: score, usage: scoreUsage } = await scoreResume(
    client,
    model,
    maxTokens,
    job,
    parsed
  );

  return {
    parsed,
    score,
    model,
    totalUsage: {
      input_tokens: parseUsage.input_tokens + scoreUsage.input_tokens,
      output_tokens: parseUsage.output_tokens + scoreUsage.output_tokens,
    },
  };
}
