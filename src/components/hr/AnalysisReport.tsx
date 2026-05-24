import {
  CheckCircle2,
  AlertTriangle,
  Target,
  Lightbulb,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  Code2,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  Globe,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ScoreRing } from "./ScoreRing";
import { ScoreBar } from "./ScoreBar";
import { TechnicalRadar } from "./TechnicalRadar";
import { SkillChips } from "./SkillChips";
import {
  RECOMMENDATION_COLORS,
  RECOMMENDATION_LABELS,
} from "@/lib/constants";
import type { ParsedResume, ResumeScore } from "@/lib/resume-analyzer";

interface AnalysisReportProps {
  applicantName: string;
  applicantEmail?: string | null;
  jobTitle: string;
  jobDepartment?: string | null;
  parsed: ParsedResume;
  score: ResumeScore;
  generatedAt?: Date;
  printMode?: boolean;
}

const SCORE_ORDER: Array<{
  key: keyof ResumeScore["scores"];
  label: string;
  icon: typeof Code2;
}> = [
  { key: "technical_skills", label: "Technical Skills", icon: Code2 },
  { key: "experience_relevance", label: "Experience Relevance", icon: Briefcase },
  { key: "education_fit", label: "Education Fit", icon: GraduationCap },
  { key: "domain_knowledge", label: "Domain Knowledge", icon: Lightbulb },
  { key: "soft_skills_communication", label: "Soft Skills & Communication", icon: Target },
  { key: "achievements_impact", label: "Achievements & Impact", icon: Award },
];

export function AnalysisReport({
  applicantName,
  applicantEmail,
  jobTitle,
  jobDepartment,
  parsed,
  score,
  generatedAt,
  printMode = false,
}: AnalysisReportProps) {
  const recoClass = RECOMMENDATION_COLORS[score.recommendation] ?? "";
  const recoLabel = RECOMMENDATION_LABELS[score.recommendation] ?? score.recommendation;

  return (
    <div className={printMode ? "space-y-6" : "space-y-6"}>
      {/* Header card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
          <ScoreRing score={score.overall_score} size={160} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${recoClass}`}
              >
                {recoLabel}
              </span>
              <span className="text-xs text-[var(--arc-text-tertiary)]">
                Evaluated against · {jobTitle}
                {jobDepartment ? ` · ${jobDepartment}` : ""}
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--arc-text-primary)]">
              {applicantName}
            </h1>
            {parsed.headline && (
              <p className="text-sm text-[var(--arc-text-secondary)] mt-1">
                {parsed.headline}
              </p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-[var(--arc-text-secondary)]">
              {(applicantEmail || parsed.email) && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {applicantEmail || parsed.email}
                </span>
              )}
              {parsed.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  {parsed.phone}
                </span>
              )}
              {parsed.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {parsed.location}
                </span>
              )}
              {parsed.links?.linkedin && (
                <span className="inline-flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" />
                  {parsed.links.linkedin.replace(/^https?:\/\//, "")}
                </span>
              )}
              {parsed.links?.github && (
                <span className="inline-flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" />
                  {parsed.links.github.replace(/^https?:\/\//, "")}
                </span>
              )}
              {parsed.links?.portfolio && (
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  {parsed.links.portfolio.replace(/^https?:\/\//, "")}
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--arc-text-primary)] mt-4 leading-relaxed">
              {score.summary}
            </p>
            {generatedAt && (
              <p className="text-[10px] text-[var(--arc-text-tertiary)] mt-3 uppercase tracking-wider">
                Generated {generatedAt.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Score breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--arc-text-secondary)] mb-5">
            Dimension Scores
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            {SCORE_ORDER.map(({ key, label, icon: Icon }) => {
              const s = score.scores[key];
              if (!s) return null;
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-2 text-[var(--arc-text-secondary)]">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">{label}</span>
                  </div>
                  <ScoreBar label={label} score={Number(s.score) || 0} weight={s.weight} />
                  {s.notes && (
                    <p className="text-xs text-[var(--arc-text-tertiary)] leading-relaxed">
                      {s.notes}
                    </p>
                  )}
                  {(s.matched?.length || s.missing?.length) && (
                    <SkillChips matched={s.matched} missing={s.missing} className="pt-1" />
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--arc-text-secondary)] mb-5">
            Technical Coverage
          </h2>
          {score.technical_breakdown && score.technical_breakdown.length >= 3 ? (
            <div className="flex justify-center">
              <TechnicalRadar items={score.technical_breakdown} size={280} />
            </div>
          ) : (
            <p className="text-xs text-[var(--arc-text-tertiary)]">
              Not enough technical categories to plot.
            </p>
          )}
        </Card>
      </div>

      {/* Technical breakdown table */}
      {score.technical_breakdown && score.technical_breakdown.length > 0 && (
        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--arc-text-secondary)] mb-5">
            Technical Components
          </h2>
          <div className="space-y-4">
            {score.technical_breakdown.map((tb) => (
              <div
                key={tb.category}
                className="rounded-[var(--arc-radius-md)] border border-[var(--arc-border-subtle)] p-4 bg-[var(--arc-bg-secondary)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[var(--arc-crimson-400)]" />
                    {tb.category}
                  </h3>
                  <span className="text-sm font-semibold tabular-nums">
                    {Math.round(tb.score)}/100
                  </span>
                </div>
                <ScoreBar label="" score={tb.score} />
                <SkillChips
                  matched={tb.candidate_has}
                  missing={tb.required.filter(
                    (r) => !(tb.candidate_has || []).some(
                      (h) => h.toLowerCase().includes(r.toLowerCase()) ||
                             r.toLowerCase().includes(h.toLowerCase())
                    )
                  )}
                  className="mt-3"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Strengths / gaps / red flags */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
              Strengths
            </h3>
          </div>
          <ul className="space-y-2">
            {(score.strengths || []).map((s, i) => (
              <li key={i} className="text-sm text-[var(--arc-text-primary)] flex gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>{s}</span>
              </li>
            ))}
            {(!score.strengths || score.strengths.length === 0) && (
              <li className="text-xs text-[var(--arc-text-tertiary)]">None identified.</li>
            )}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
              Gaps
            </h3>
          </div>
          <ul className="space-y-2">
            {(score.gaps || []).map((s, i) => (
              <li key={i} className="text-sm text-[var(--arc-text-primary)] flex gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{s}</span>
              </li>
            ))}
            {(!score.gaps || score.gaps.length === 0) && (
              <li className="text-xs text-[var(--arc-text-tertiary)]">None identified.</li>
            )}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-red-400">
              Red Flags
            </h3>
          </div>
          <ul className="space-y-2">
            {(score.red_flags || []).map((s, i) => (
              <li key={i} className="text-sm text-[var(--arc-text-primary)] flex gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span>{s}</span>
              </li>
            ))}
            {(!score.red_flags || score.red_flags.length === 0) && (
              <li className="text-xs text-[var(--arc-text-tertiary)]">None identified.</li>
            )}
          </ul>
        </Card>
      </div>

      {/* Interview focus & remarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-[var(--arc-crimson-400)]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--arc-text-secondary)]">
              Suggested Interview Focus
            </h3>
          </div>
          <ul className="space-y-2">
            {(score.interview_focus || []).map((s, i) => (
              <li key={i} className="text-sm text-[var(--arc-text-primary)] flex gap-2">
                <span className="text-[var(--arc-crimson-400)] mt-0.5">›</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-[var(--arc-crimson-400)]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--arc-text-secondary)]">
              Hiring Manager Remarks
            </h3>
          </div>
          <p className="text-sm text-[var(--arc-text-primary)] leading-relaxed whitespace-pre-wrap">
            {score.remarks}
          </p>
          {score.fit_for_role_explanation && (
            <>
              <hr className="my-4 border-[var(--arc-border-subtle)]" />
              <p className="text-xs text-[var(--arc-text-secondary)] leading-relaxed whitespace-pre-wrap">
                {score.fit_for_role_explanation}
              </p>
            </>
          )}
        </Card>
      </div>

      {/* Candidate profile */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--arc-text-secondary)] mb-5">
          Candidate Profile
        </h2>

        {parsed.summary && (
          <div className="mb-6">
            <h3 className="text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] mb-2">
              Summary
            </h3>
            <p className="text-sm text-[var(--arc-text-primary)] leading-relaxed">
              {parsed.summary}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] mb-2 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              Experience ({parsed.total_years_experience || 0} yrs)
            </h3>
            <div className="space-y-3">
              {(parsed.experience || []).map((e, i) => (
                <div key={i} className="text-sm border-l-2 border-[var(--arc-border-default)] pl-3">
                  <p className="font-medium text-[var(--arc-text-primary)]">{e.title}</p>
                  <p className="text-[var(--arc-text-secondary)] text-xs">
                    {e.company}
                    {e.location ? ` · ${e.location}` : ""}
                    {(e.start || e.end) ? ` · ${e.start || "?"} – ${e.end || "?"}` : ""}
                  </p>
                  {e.description && (
                    <p className="text-xs text-[var(--arc-text-tertiary)] mt-1 leading-relaxed">
                      {e.description}
                    </p>
                  )}
                  {e.highlights && e.highlights.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {e.highlights.slice(0, 4).map((h, j) => (
                        <li key={j} className="text-xs text-[var(--arc-text-secondary)] flex gap-1.5">
                          <span className="text-[var(--arc-crimson-400)]">›</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                Education
              </h3>
              <div className="space-y-2">
                {(parsed.education || []).map((ed, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-medium">
                      {ed.degree}
                      {ed.field ? ` · ${ed.field}` : ""}
                    </p>
                    <p className="text-xs text-[var(--arc-text-secondary)]">
                      {ed.institution}
                      {ed.end ? ` · ${ed.end}` : ""}
                      {ed.grade ? ` · ${ed.grade}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {parsed.certifications && parsed.certifications.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  Certifications
                </h3>
                <div className="space-y-1">
                  {parsed.certifications.map((c, i) => (
                    <p key={i} className="text-xs text-[var(--arc-text-primary)]">
                      {c.name}
                      {c.issuer ? ` · ${c.issuer}` : ""}
                      {c.year ? ` · ${c.year}` : ""}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {parsed.skills && (
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" />
              Skills
            </h3>
            {(["technical", "frameworks", "languages", "tools", "soft"] as const).map(
              (cat) => {
                const items = parsed.skills[cat];
                if (!items || items.length === 0) return null;
                return (
                  <div key={cat}>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--arc-text-tertiary)] mb-1.5">
                      {cat === "soft" ? "Soft skills" : cat}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((s, i) => (
                        <span
                          key={`${cat}-${i}`}
                          className="px-2 py-0.5 rounded-full text-xs bg-[var(--arc-bg-tertiary)] text-[var(--arc-text-primary)] border border-[var(--arc-border-default)]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        {parsed.projects && parsed.projects.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs uppercase tracking-wider text-[var(--arc-text-tertiary)] mb-2">
              Projects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {parsed.projects.map((p, i) => (
                <div
                  key={i}
                  className="rounded-[var(--arc-radius-sm)] border border-[var(--arc-border-subtle)] p-3 bg-[var(--arc-bg-secondary)]"
                >
                  <p className="text-sm font-medium">{p.name}</p>
                  {p.description && (
                    <p className="text-xs text-[var(--arc-text-secondary)] mt-1">
                      {p.description}
                    </p>
                  )}
                  {p.tech && p.tech.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.tech.map((t, j) => (
                        <span
                          key={j}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--arc-bg-tertiary)] text-[var(--arc-text-secondary)]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
