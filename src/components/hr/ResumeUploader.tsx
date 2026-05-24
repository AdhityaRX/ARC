"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface ResumeUploaderProps {
  jobId: string;
  onUploaded?: () => void;
}

export function ResumeUploader({ jobId, onUploaded }: ResumeUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"file" | "text">("file");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, []);

  const reset = () => {
    setFile(null);
    setText("");
    setName("");
    setEmail("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const submit = async () => {
    setError("");
    if (mode === "file" && !file) {
      setError("Choose a resume file (PDF or text)");
      return;
    }
    if (mode === "text" && text.trim().length < 50) {
      setError("Paste at least 50 characters of resume text");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      if (mode === "file" && file) form.append("file", file);
      if (mode === "text") form.append("resumeText", text);
      if (name) form.append("name", name);
      if (email) form.append("email", email);

      const res = await fetch(`/api/jobs/${jobId}/applicants`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      reset();
      onUploaded?.();
      router.push(`/applicants/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setMode("file")}
          className={cn(
            "px-3 py-1.5 text-sm rounded-[var(--arc-radius-sm)] transition-colors cursor-pointer",
            mode === "file"
              ? "bg-[var(--arc-bg-active)] text-[var(--arc-crimson-400)] border border-[var(--arc-crimson-500)]/30"
              : "text-[var(--arc-text-secondary)] hover:bg-[var(--arc-bg-hover)]"
          )}
        >
          Upload PDF / text file
        </button>
        <button
          onClick={() => setMode("text")}
          className={cn(
            "px-3 py-1.5 text-sm rounded-[var(--arc-radius-sm)] transition-colors cursor-pointer",
            mode === "text"
              ? "bg-[var(--arc-bg-active)] text-[var(--arc-crimson-400)] border border-[var(--arc-crimson-500)]/30"
              : "text-[var(--arc-text-secondary)] hover:bg-[var(--arc-bg-hover)]"
          )}
        >
          Paste resume text
        </button>
      </div>

      {mode === "file" ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={cn(
            "relative rounded-[var(--arc-radius-md)] border-2 border-dashed p-8 text-center transition-colors",
            dragOver
              ? "border-[var(--arc-crimson-500)] bg-[var(--arc-bg-active)]"
              : "border-[var(--arc-border-default)] bg-[var(--arc-bg-secondary)]"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.txt,.md,application/pdf,text/plain"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-6 h-6 text-[var(--arc-crimson-400)]" />
              <div className="text-left">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-[var(--arc-text-tertiary)]">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                className="p-1 rounded hover:bg-[var(--arc-bg-hover)] text-[var(--arc-text-tertiary)] hover:text-[var(--arc-text-primary)] z-10 relative cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 pointer-events-none">
              <Upload className="w-8 h-8 text-[var(--arc-text-tertiary)]" />
              <p className="text-sm text-[var(--arc-text-secondary)]">
                Drop a resume PDF here, or click to browse
              </p>
              <p className="text-xs text-[var(--arc-text-tertiary)]">
                PDF or plain text, up to 10 MB
              </p>
            </div>
          )}
        </div>
      ) : (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the full resume content here..."
          rows={12}
          className="w-full px-3 py-2 bg-[var(--arc-bg-tertiary)] border border-[var(--arc-border-default)] rounded-[var(--arc-radius-sm)] text-[var(--arc-text-primary)] text-sm placeholder:text-[var(--arc-text-tertiary)] resize-y outline-none focus:border-[var(--arc-crimson-500)] font-mono"
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[var(--arc-text-tertiary)] mb-1.5 uppercase tracking-wider">
            Candidate name (optional override)
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Leave blank to auto-detect"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--arc-text-tertiary)] mb-1.5 uppercase tracking-wider">
            Email (optional override)
          </label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Leave blank to auto-detect"
            type="email"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-900/50 text-red-400 text-sm px-3 py-2 rounded-[var(--arc-radius-sm)]">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={submit} disabled={uploading}>
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing with Claude Opus 4.7...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Analyze Resume
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
