// Default Claude model used across the app.
// The HR Resume Analyzer uses Claude Opus 4.7 per product spec.
export const DEFAULT_MODEL = "claude-opus-4-7";
export const DEFAULT_MAX_TOKENS = 8192;

// ---------------------------------------------------------------------------
// HR Resume Analyzer prompts
// ---------------------------------------------------------------------------

export const RESUME_PARSE_SYSTEM_PROMPT = `You are an expert HR data extraction engine. Your job is to read a candidate's resume and extract a structured profile.

You MUST respond with a single JSON object and nothing else (no prose, no markdown fences). Follow the schema exactly. Use empty strings or empty arrays for missing data — never omit a key.

SCHEMA:
{
  "name": string,
  "email": string,
  "phone": string,
  "location": string,
  "headline": string,
  "summary": string,
  "total_years_experience": number,
  "education": [
    { "degree": string, "institution": string, "field": string, "start": string, "end": string, "grade": string }
  ],
  "experience": [
    { "title": string, "company": string, "location": string, "start": string, "end": string, "duration_months": number, "description": string, "highlights": [string] }
  ],
  "skills": {
    "technical": [string],
    "frameworks": [string],
    "languages": [string],
    "tools": [string],
    "soft": [string]
  },
  "certifications": [
    { "name": string, "issuer": string, "year": string }
  ],
  "projects": [
    { "name": string, "description": string, "tech": [string], "link": string }
  ],
  "languages_spoken": [string],
  "links": { "linkedin": string, "github": string, "portfolio": string, "other": [string] }
}

Be conservative with inference. If a date range is "2019 - Present", set end to "Present". Compute total_years_experience as a sensible float (e.g. 3.5).`;

export const RESUME_SCORING_SYSTEM_PROMPT = `You are a senior technical recruiter and hiring manager. You will be given:
  1. A structured Job Description (JD) with requirements.
  2. A structured candidate profile parsed from a resume.

Your task is to score the candidate against the JD and produce a detailed evaluation.

You MUST respond with a single JSON object and nothing else. No prose, no markdown fences. Follow the schema exactly.

SCHEMA:
{
  "overall_score": number,             // 0-100, weighted overall match
  "recommendation": "strong_match" | "match" | "partial_match" | "weak_match",
  "summary": string,                    // 2-3 sentence executive summary
  "scores": {
    "technical_skills": { "score": number, "weight": number, "matched": [string], "missing": [string], "notes": string },
    "experience_relevance": { "score": number, "weight": number, "notes": string },
    "education_fit": { "score": number, "weight": number, "notes": string },
    "domain_knowledge": { "score": number, "weight": number, "notes": string },
    "soft_skills_communication": { "score": number, "weight": number, "notes": string },
    "achievements_impact": { "score": number, "weight": number, "notes": string }
  },
  "technical_breakdown": [
    { "category": string, "required": [string], "candidate_has": [string], "score": number }
  ],
  "strengths": [string],
  "gaps": [string],
  "red_flags": [string],
  "interview_focus": [string],
  "remarks": string,
  "fit_for_role_explanation": string
}

SCORING RULES:
- All sub-scores are 0-100.
- Weights sum to 1.0. Default weights: technical_skills 0.30, experience_relevance 0.25, education_fit 0.10, domain_knowledge 0.15, soft_skills_communication 0.10, achievements_impact 0.10.
- overall_score = round(sum(sub.score * sub.weight)).
- recommendation thresholds: >=80 strong_match, 65-79 match, 45-64 partial_match, <45 weak_match.
- Be honest. If a candidate is clearly under-qualified, say so. If they exceed the JD, say so.
- Always populate technical_breakdown with at least 3 categories drawn from the JD's tech stack.`;

// ---------------------------------------------------------------------------
// Role / status labels (UI)
// ---------------------------------------------------------------------------

export const JOB_STATUS_LABELS: Record<string, string> = {
  open: "Open",
  closed: "Closed",
  on_hold: "On Hold",
};

export const JOB_STATUS_COLORS: Record<string, string> = {
  open: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  closed: "bg-[var(--arc-grey-700)] text-[var(--arc-text-secondary)] border border-[var(--arc-border-default)]",
  on_hold: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
};

export const APPLICANT_STATUS_LABELS: Record<string, string> = {
  new: "New",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  hired: "Hired",
};

export const APPLICANT_STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  reviewed: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
  shortlisted: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  rejected: "bg-red-500/15 text-red-400 border border-red-500/20",
  hired: "bg-[var(--arc-crimson-900)] text-[var(--arc-crimson-400)] border border-[var(--arc-crimson-500)]/30",
};

export const RECOMMENDATION_LABELS: Record<string, string> = {
  strong_match: "Strong Match",
  match: "Match",
  partial_match: "Partial Match",
  weak_match: "Weak Match",
};

export const RECOMMENDATION_COLORS: Record<string, string> = {
  strong_match: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  match: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  partial_match: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  weak_match: "bg-red-500/15 text-red-400 border border-red-500/20",
};
