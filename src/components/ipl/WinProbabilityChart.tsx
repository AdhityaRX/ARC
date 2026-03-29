"use client";

import { cn } from "@/lib/utils";

interface WinProbabilityChartProps {
  history: { timestamp: string; team1Score: number; team2Score: number; winProb: number }[];
  theme: "dark" | "light";
}

export function WinProbabilityChart({ history, theme }: WinProbabilityChartProps) {
  const isDark = theme === "dark";

  // Create SVG line chart from history
  const width = 400;
  const height = 120;
  const padding = { top: 10, right: 10, bottom: 20, left: 30 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const data = history.slice(-50); // Last 50 data points

  const getPath = (values: number[], maxVal: number) => {
    if (values.length < 2) return "";
    return values
      .map((v, i) => {
        const x = padding.left + (i / (values.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - (v / maxVal) * chartHeight;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  const winProbs = data.map((d) => d.winProb);
  const kkrScores = data.map((d) => d.team1Score);
  const miScores = data.map((d) => d.team2Score);

  return (
    <div className={cn(
      "rounded-2xl overflow-hidden border transition-all duration-300",
      isDark
        ? "bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-white/10"
        : "bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-lg"
    )}>
      <div className={cn(
        "px-4 py-3 flex items-center justify-between",
        isDark ? "bg-white/5" : "bg-slate-50"
      )}>
        <h3 className={cn(
          "font-bold text-sm flex items-center gap-2",
          isDark ? "text-white" : "text-slate-900"
        )}>
          <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          Live Win Probability
        </h3>
      </div>

      <div className="p-4">
        {data.length >= 2 ? (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((v) => {
              const y = padding.top + chartHeight - (v / 100) * chartHeight;
              return (
                <g key={v}>
                  <line
                    x1={padding.left} y1={y}
                    x2={width - padding.right} y2={y}
                    stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 5} y={y + 3}
                    textAnchor="end"
                    fill={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                    fontSize="8"
                  >
                    {v}%
                  </text>
                </g>
              );
            })}

            {/* 50% line */}
            <line
              x1={padding.left}
              y1={padding.top + chartHeight / 2}
              x2={width - padding.right}
              y2={padding.top + chartHeight / 2}
              stroke={isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}
              strokeWidth="1"
            />

            {/* KKR Win Probability */}
            <path
              d={getPath(winProbs, 100)}
              fill="none"
              stroke="#7c3aed"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* MI Win Probability */}
            <path
              d={getPath(winProbs.map((p) => 100 - p), 100)}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 2"
            />

            {/* Area fill */}
            {winProbs.length >= 2 && (
              <>
                <path
                  d={`${getPath(winProbs, 100)} L ${width - padding.right} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`}
                  fill="url(#kkrGrad)"
                  opacity="0.15"
                />
                <defs>
                  <linearGradient id="kkrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </>
            )}

            {/* Latest value dot */}
            {winProbs.length > 0 && (
              <>
                <circle
                  cx={padding.left + ((winProbs.length - 1) / Math.max(1, winProbs.length - 1)) * chartWidth}
                  cy={padding.top + chartHeight - (winProbs[winProbs.length - 1] / 100) * chartHeight}
                  r="4"
                  fill="#7c3aed"
                  stroke={isDark ? "#1a1a2e" : "white"}
                  strokeWidth="2"
                />
                <circle
                  cx={padding.left + ((winProbs.length - 1) / Math.max(1, winProbs.length - 1)) * chartWidth}
                  cy={padding.top + chartHeight - ((100 - winProbs[winProbs.length - 1]) / 100) * chartHeight}
                  r="4"
                  fill="#3b82f6"
                  stroke={isDark ? "#1a1a2e" : "white"}
                  strokeWidth="2"
                />
              </>
            )}
          </svg>
        ) : (
          <div className={cn(
            "h-[120px] flex items-center justify-center text-sm",
            isDark ? "text-white/30" : "text-slate-400"
          )}>
            Collecting data points...
          </div>
        )}

        {/* Score Tracker */}
        {data.length > 0 && (
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 rounded bg-purple-500" />
              <span className={cn("text-[10px] font-medium", isDark ? "text-purple-300" : "text-purple-600")}>
                KKR {kkrScores[kkrScores.length - 1] || 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 rounded bg-blue-500" style={{ backgroundImage: "repeating-linear-gradient(90deg, #3b82f6 0, #3b82f6 4px, transparent 4px, transparent 6px)" }} />
              <span className={cn("text-[10px] font-medium", isDark ? "text-blue-300" : "text-blue-600")}>
                MI {miScores[miScores.length - 1] || 0}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
