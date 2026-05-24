"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ApplicantActionsProps {
  applicantId: string;
  currentStatus: string;
}

export function ApplicantActions({
  applicantId,
  currentStatus,
}: ApplicantActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const updateStatus = async (next: string) => {
    setStatus(next);
    await fetch(`/api/applicants/${applicantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  };

  const reanalyze = async () => {
    setReanalyzing(true);
    try {
      const res = await fetch(`/api/applicants/${applicantId}/analyze`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Re-analysis failed");
        return;
      }
      router.refresh();
    } finally {
      setReanalyzing(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this applicant and analysis history?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/applicants/${applicantId}`, {
        method: "DELETE",
      });
      if (res.ok) router.push("/applicants");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => updateStatus(e.target.value)}
        className="h-8 px-2 text-xs bg-[var(--arc-bg-tertiary)] border border-[var(--arc-border-default)] rounded-[var(--arc-radius-sm)] text-[var(--arc-text-primary)] cursor-pointer"
      >
        <option value="new">New</option>
        <option value="reviewed">Reviewed</option>
        <option value="shortlisted">Shortlisted</option>
        <option value="rejected">Rejected</option>
        <option value="hired">Hired</option>
      </select>
      <Button
        variant="secondary"
        size="sm"
        onClick={reanalyze}
        disabled={reanalyzing}
      >
        {reanalyzing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        Re-analyze
      </Button>
      <Button variant="danger" size="sm" onClick={remove} disabled={deleting}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
