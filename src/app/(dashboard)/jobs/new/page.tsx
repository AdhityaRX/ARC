"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function NewJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [experienceLevel, setExperienceLevel] = useState("Mid");
  const [description, setDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [preferredSkills, setPreferredSkills] = useState("");
  const [minYears, setMinYears] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const requirements: Record<string, unknown> = {};
      if (requiredSkills.trim())
        requirements.required_skills = requiredSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      if (preferredSkills.trim())
        requirements.preferred_skills = preferredSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      if (minYears) requirements.min_years_experience = Number(minYears);

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          department: department || null,
          location: location || null,
          employmentType: employmentType || null,
          experienceLevel: experienceLevel || null,
          description,
          requirements,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create job");
      }

      const job = await res.json();
      router.push(`/jobs/${job.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--arc-text-secondary)] hover:text-[var(--arc-text-primary)] mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">New Job Opening</h1>
        <p className="text-sm text-[var(--arc-text-secondary)] mt-1">
          Define the role. Claude Opus 4.7 will score every applicant against this description.
        </p>
      </header>

      <Card className="p-6">
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-sm text-[var(--arc-text-secondary)] mb-1.5">
              Job Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--arc-text-secondary)] mb-1.5">
                Department
              </label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Engineering"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--arc-text-secondary)] mb-1.5">
                Location
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote / Bangalore"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--arc-text-secondary)] mb-1.5">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full h-11 px-3 bg-[var(--arc-bg-tertiary)] border border-[var(--arc-border-default)] rounded-[var(--arc-radius-sm)] text-[var(--arc-text-primary)] text-base"
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--arc-text-secondary)] mb-1.5">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full h-11 px-3 bg-[var(--arc-bg-tertiary)] border border-[var(--arc-border-default)] rounded-[var(--arc-radius-sm)] text-[var(--arc-text-primary)] text-base"
              >
                <option>Intern</option>
                <option>Entry</option>
                <option>Mid</option>
                <option>Senior</option>
                <option>Staff</option>
                <option>Principal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-[var(--arc-text-secondary)] mb-1.5">
              Job Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste the full JD: responsibilities, requirements, nice-to-haves..."
              rows={10}
              required
              minLength={20}
              className="w-full px-3 py-2 bg-[var(--arc-bg-tertiary)] border border-[var(--arc-border-default)] rounded-[var(--arc-radius-sm)] text-[var(--arc-text-primary)] text-sm placeholder:text-[var(--arc-text-tertiary)] resize-y outline-none focus:border-[var(--arc-crimson-500)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--arc-text-secondary)] mb-1.5">
                Required Skills (comma-separated)
              </label>
              <Input
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                placeholder="e.g. Python, PostgreSQL, Kubernetes"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--arc-text-secondary)] mb-1.5">
                Preferred Skills
              </label>
              <Input
                value={preferredSkills}
                onChange={(e) => setPreferredSkills(e.target.value)}
                placeholder="e.g. Rust, gRPC"
              />
            </div>
          </div>

          <div className="w-40">
            <label className="block text-sm text-[var(--arc-text-secondary)] mb-1.5">
              Min Years Exp
            </label>
            <Input
              type="number"
              min={0}
              max={50}
              value={minYears}
              onChange={(e) => setMinYears(e.target.value)}
              placeholder="e.g. 3"
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-900/50 text-red-400 text-sm px-3 py-2 rounded-[var(--arc-radius-sm)]">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Link href="/jobs">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4" />
              {saving ? "Creating..." : "Create Job"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
