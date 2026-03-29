"use client";

import { cn } from "@/lib/utils";
import type { OverPrediction } from "@/lib/ipl/types";

interface OverPredictionsProps {
  predictions: OverPrediction[];
  currentOver: number;
  theme: "dark" | "light";
}

export function OverPredictions({ predictions, currentOver, theme }: OverPredictionsProps) {
  const isDark = theme === "dark";

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "powerplay":
        return isDark ? "text-cyan-400 bg-cyan-500/10" : "text-cyan-700 bg-cyan-50";
      case "middle":
        return isDark ? "text-amber-400 bg-amber-500/10" : "text-amber-700 bg-amber-50";
      case "death":
        return isDark ? "text-red-400 bg-red-500/10" : "text-red-700 bg-red-50";
      default:
        return isDark ? "text-white/40 bg-white/5" : "text-slate-400 bg-slate-50";
    }
  };

  const getRunsBarWidth = (runs: number) => Math.min(100, (runs / 20) * 100);

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
          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Over-by-Over Forecast
        </h3>
      </div>

      <div className="p-4">
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
          {predictions.map((over) => {
            const isPast = over.overNumber <= currentOver;
            const isCurrent = over.overNumber === currentOver + 1;

            return (
              <div
                key={over.overNumber}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all text-xs",
                  isCurrent && (isDark ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-yellow-50 border border-yellow-200"),
                  isPast && (isDark ? "opacity-40" : "opacity-50"),
                  !isPast && !isCurrent && (isDark ? "hover:bg-white/5" : "hover:bg-slate-50")
                )}
              >
                <span className={cn(
                  "w-8 text-center font-bold tabular-nums",
                  isDark ? "text-white/50" : "text-slate-400"
                )}>
                  {over.overNumber}
                </span>

                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase w-16 text-center",
                  getPhaseColor(over.phase)
                )}>
                  {over.phase === "powerplay" ? "PP" : over.phase === "death" ? "DTH" : "MID"}
                </span>

                <div className="flex-1 flex items-center gap-2">
                  <div className={cn(
                    "flex-1 h-2 rounded-full overflow-hidden",
                    isDark ? "bg-white/5" : "bg-slate-100"
                  )}>
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        over.predictedRuns > 12
                          ? "bg-gradient-to-r from-red-500 to-orange-500"
                          : over.predictedRuns > 8
                          ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                          : "bg-gradient-to-r from-emerald-500 to-teal-500"
                      )}
                      style={{ width: `${getRunsBarWidth(over.predictedRuns)}%` }}
                    />
                  </div>
                  <span className={cn(
                    "w-8 text-right font-bold tabular-nums",
                    isDark ? "text-white/70" : "text-slate-600"
                  )}>
                    {over.predictedRuns}
                  </span>
                </div>

                {over.predictedWickets > 0 && (
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded",
                    isDark ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-600"
                  )}>
                    {over.predictedWickets}W
                  </span>
                )}

                <span className={cn(
                  "w-20 text-[10px] truncate",
                  isDark ? "text-white/30" : "text-slate-400"
                )}>
                  {over.bowler}
                </span>
              </div>
            );
          })}
        </div>

        {predictions.length === 0 && (
          <div className={cn(
            "text-center py-8 text-sm",
            isDark ? "text-white/30" : "text-slate-400"
          )}>
            Waiting for over predictions...
          </div>
        )}

        {/* Phase Legend */}
        <div className={cn(
          "flex gap-4 mt-3 pt-3 border-t justify-center",
          isDark ? "border-white/5" : "border-slate-100"
        )}>
          {[
            { label: "Powerplay (1-6)", phase: "powerplay" },
            { label: "Middle (7-15)", phase: "middle" },
            { label: "Death (16-20)", phase: "death" },
          ].map((item) => (
            <div key={item.phase} className="flex items-center gap-1.5">
              <div className={cn("px-1.5 py-0.5 rounded text-[9px] font-semibold", getPhaseColor(item.phase))}>
                {item.phase === "powerplay" ? "PP" : item.phase === "death" ? "DTH" : "MID"}
              </div>
              <span className={cn(
                "text-[10px]",
                isDark ? "text-white/30" : "text-slate-400"
              )}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
