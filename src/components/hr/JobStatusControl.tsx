"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface JobStatusControlProps {
  jobId: string;
  currentStatus: string;
}

export function JobStatusControl({ jobId, currentStatus }: JobStatusControlProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  const update = async (next: string) => {
    setSaving(true);
    setStatus(next);
    try {
      await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => update(e.target.value)}
      disabled={saving}
      className="h-7 px-2 text-xs bg-[var(--arc-bg-tertiary)] border border-[var(--arc-border-default)] rounded-[var(--arc-radius-sm)] text-[var(--arc-text-primary)] cursor-pointer"
    >
      <option value="open">Open</option>
      <option value="on_hold">On Hold</option>
      <option value="closed">Closed</option>
    </select>
  );
}
