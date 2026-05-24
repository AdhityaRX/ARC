import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  label?: string;
  className?: string;
}

function scoreColor(score: number) {
  if (score >= 80) return "#10b981"; // emerald
  if (score >= 65) return "#3b82f6"; // blue
  if (score >= 45) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

export function ScoreRing({ score, size = 140, label, className }: ScoreRingProps) {
  const safe = Math.max(0, Math.min(100, score));
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (safe / 100) * circ;
  const color = scoreColor(safe);

  return (
    <div className={cn("inline-flex flex-col items-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--arc-bg-tertiary)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 700ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-3xl font-semibold tracking-tight"
            style={{ color }}
          >
            {Math.round(safe)}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-[var(--arc-text-tertiary)]">
            / 100
          </span>
        </div>
      </div>
      {label && (
        <span className="mt-2 text-xs text-[var(--arc-text-secondary)] text-center">
          {label}
        </span>
      )}
    </div>
  );
}
