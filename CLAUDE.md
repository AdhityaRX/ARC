# ARC HR — AI Resume Intelligence

## Project Overview
ARC HR is a web application for hiring teams that uses Claude Opus 4.7 to parse
resumes, score candidates against job descriptions, and maintain a database of
job openings and applicants. Built with Next.js 16, TypeScript, Tailwind CSS,
PostgreSQL, and the Anthropic API.

## Tech Stack
- Next.js 16 (App Router), TypeScript strict, Tailwind CSS v4
- Custom UI components (Button, Input, Badge, Card)
- Prisma ORM with PostgreSQL
- Anthropic SDK (@anthropic-ai/sdk) — Claude Opus 4.7
- NextAuth.js v5 (Credentials provider)
- SVG-only score visualization (no chart libs)

## Architecture
- `/src/app` — Next.js App Router pages
  - `(auth)` — login, register (registration is disabled)
  - `(dashboard)` — main app: `dashboard`, `jobs`, `applicants`, `admin`
  - `report/[id]` — printable PDF report for an applicant
  - `api/` — REST endpoints (jobs, applicants, admin)
- `/src/components`
  - `ui/` — Button, Input, Card, Badge
  - `layout/Sidebar.tsx` — nav with HR + admin links
  - `hr/` — `AnalysisReport`, `ResumeUploader`, `ScoreRing`, `ScoreBar`,
    `TechnicalRadar`, `SkillChips`, `ApplicantActions`, `JobStatusControl`,
    `PrintButton`
- `/src/lib` — `auth.ts`, `db.ts`, `permissions.ts`, `constants.ts`,
  `resume-analyzer.ts`
- `/prisma` — schema and migrations

## Roles
- `super_admin` — manages users (HR + super admin), API config, sees usage
- `hr` — creates job openings, uploads resumes, reviews applicants
- `user` — legacy enum value, no access (redirected at dashboard layout)

Super Admin is the only role that can create users. Public self-registration
is disabled.

## Resume Analysis Flow
1. HR creates a Job Opening with JD and (optional) required/preferred skills.
2. HR uploads a resume (PDF or text) or pastes resume text.
3. `lib/resume-analyzer.ts` runs two Claude Opus 4.7 calls:
   - `parseResume` → structured `ParsedResume` JSON (PDFs are sent as
     `document` blocks; text is sent as `text` blocks).
   - `scoreResume` → structured `ResumeScore` JSON with weighted dimensions,
     technical breakdown, strengths/gaps, interview focus, remarks.
4. Both JSONs are stored on the `Applicant` row. Every score run is appended
   to `AnalysisRun` for history.
5. The report page renders score ring + bars + radar + chips and can be
   printed/saved as PDF.

## Commands
- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run db:migrate` — Run database migrations
- `npm run db:generate` — Generate Prisma client
- `npm run db:seed` — Seed Super Admin (admin@arc.dev / admin123)

## Configuration
The Anthropic API key is set by the Super Admin from **Admin → Settings**.
Falls back to `ANTHROPIC_API_KEY` env var if not configured. Default model
is `claude-opus-4-7`.

## Design Rules
- All backgrounds dark (`--arc-bg-primary/secondary/tertiary`)
- Crimson (`#DC2626`) ONLY for primary actions, active states, accent borders
- <10% crimson visual presence
- Every interactive element has a transition
- The printable report uses inverted (light) styles via `@media print`
