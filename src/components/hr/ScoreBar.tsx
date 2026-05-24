import { cn } from "@/lib/utils";

interface ScoreBarProps {
  label: string;
  score: number;
  weight?: number;
  sublabel?: string;
  className?: string;
}

function scoreColorClass(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 65) return "bg-blue-500";
  if (score >= 45) return "bg-amber-500";
  return "bg-red-500";
}

function scoreTextClass(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 65) return "text-blue-400";
  if (score >= 45) return "text-amber-400";
  return "text-red-400";
}

export function ScoreBar({ label, score, weight, sublabel, className }: ScoreBarProps) {
  const safe = Math.max(0, Math.min(100, score));
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-sm font-medium text-[var(--arc-text-primary)] truncate">
            {label}
          </span>
          {weight !== undefined && (
            <span className="text-[10px] uppercase tracking-wider text-[var(--arc-text-tertiary)]">
              {Math.round(weight * 100)}% wt
            </span>
          )}
        </div>
        <span className={cn("text-sm font-semibold tabular-nums", scoreTextClass(safe))}>
          {Math.round(safe)}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-[var(--arc-bg-tertiary)] overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-[width] duration-700", scoreColorClass(safe))}
          style={{ width: `${safe}%` }}
        />
      </div>
      {sublabel && (
        <p className="text-xs text-[var(--arc-text-tertiary)] leading-relaxed">{sublabel}</p>
      )}
    </div>
  );
}
