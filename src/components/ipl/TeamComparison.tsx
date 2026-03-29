"use client";

import { cn } from "@/lib/utils";
import type { TeamData } from "@/lib/ipl/playerData";
import { getTeamStrength } from "@/lib/ipl/playerData";

interface TeamComparisonProps {
  kkr: TeamData;
  mi: TeamData;
  theme: "dark" | "light";
}

export function TeamComparison({ kkr, mi, theme }: TeamComparisonProps) {
  const isDark = theme === "dark";
  const kkrStrength = getTeamStrength(kkr);
  const miStrength = getTeamStrength(mi);

  const stats = [
    { label: "Win %", kkr: kkr.stats.winPct, mi: mi.stats.winPct, suffix: "%" },
    { label: "Titles", kkr: kkr.stats.titlesWon, mi: mi.stats.titlesWon, suffix: "" },
    { label: "Avg 1st Inn", kkr: kkr.stats.avgFirstInningsScore, mi: mi.stats.avgFirstInningsScore, suffix: "" },
    { label: "Avg PP", kkr: kkr.stats.avgPowerplayScore, mi: mi.stats.avgPowerplayScore, suffix: "" },
    { label: "Avg Death", kkr: kkr.stats.avgDeathOverRuns, mi: mi.stats.avgDeathOverRuns, suffix: "" },
    { label: "Bat Strength", kkr: kkrStrength.battingStrength, mi: miStrength.battingStrength, suffix: "" },
    { label: "Bowl Strength", kkr: kkrStrength.bowlingStrength, mi: miStrength.bowlingStrength, suffix: "" },
    { label: "H2H Wins", kkr: kkr.h2h.wins, mi: mi.h2h.wins, suffix: "" },
  ];

  return (
    <div className={cn(
      "rounded-2xl overflow-hidden border transition-all duration-300",
      isDark
        ? "bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-white/10"
        : "bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-lg"
    )}>
      <div className={cn(
        "px-4 py-3",
        isDark ? "bg-white/5" : "bg-slate-50"
      )}>
        <h3 className={cn(
          "font-bold text-sm",
          isDark ? "text-white" : "text-slate-900"
        )}>
          Head-to-Head Comparison
        </h3>
      </div>

      <div className="p-4 space-y-3">
        {/* Team Headers */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3A225D] to-[#5a3a8a] flex items-center justify-center text-[10px] font-bold text-[#D4AF37]">
              KKR
            </div>
            <span className={cn("text-xs font-bold", isDark ? "text-purple-300" : "text-purple-700")}>
              {kkr.stats.wins}W / {kkr.stats.losses}L
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-bold", isDark ? "text-blue-300" : "text-blue-700")}>
              {mi.stats.wins}W / {mi.stats.losses}L
            </span>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#004BA0] to-[#0066cc] flex items-center justify-center text-[10px] font-bold text-[#D4AF37]">
              MI
            </div>
          </div>
        </div>

        {/* Stats Bars */}
        {stats.map((stat) => {
          const total = stat.kkr + stat.mi;
          const kkrPct = total > 0 ? (stat.kkr / total) * 100 : 50;

          return (
            <div key={stat.label}>
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "text-xs font-bold tabular-nums",
                  stat.kkr >= stat.mi
                    ? "text-purple-400"
                    : isDark ? "text-white/40" : "text-slate-400"
                )}>
                  {stat.kkr}{stat.suffix}
                </span>
                <span className={cn(
                  "text-[10px] uppercase tracking-wider font-medium",
                  isDark ? "text-white/30" : "text-slate-400"
                )}>
                  {stat.label}
                </span>
                <span className={cn(
                  "text-xs font-bold tabular-nums",
                  stat.mi >= stat.kkr
                    ? "text-blue-400"
                    : isDark ? "text-white/40" : "text-slate-400"
                )}>
                  {stat.mi}{stat.suffix}
                </span>
              </div>
              <div className={cn(
                "h-1.5 rounded-full flex overflow-hidden",
                isDark ? "bg-white/5" : "bg-slate-100"
              )}>
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-l-full transition-all duration-500"
                  style={{ width: `${kkrPct}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-r-full transition-all duration-500"
                  style={{ width: `${100 - kkrPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
