"use client";

import { cn } from "@/lib/utils";
import type { LiveScore } from "@/lib/ipl/types";

interface ScoreboardProps {
  liveScore: LiveScore;
  theme: "dark" | "light";
}

export function Scoreboard({ liveScore, theme }: ScoreboardProps) {
  const isDark = theme === "dark";
  const team1 = liveScore.team1;
  const team2 = liveScore.team2;
  const isFirstInnings = liveScore.currentInnings === 1;

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden border transition-all duration-300",
        isDark
          ? "bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-white/10"
          : "bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-lg"
      )}
    >
      {/* Match Header */}
      <div
        className={cn(
          "px-4 py-2.5 flex items-center justify-between text-xs font-medium",
          isDark ? "bg-white/5 text-white/60" : "bg-slate-100 text-slate-500"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              liveScore.status === "live" ? "bg-green-400" : "bg-yellow-400"
            )} />
            <span className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              liveScore.status === "live" ? "bg-green-500" : "bg-yellow-500"
            )} />
          </span>
          {liveScore.status === "live" ? "LIVE" : liveScore.status === "completed" ? "COMPLETED" : "INNINGS BREAK"}
        </div>
        <span>{liveScore.venue}</span>
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-bold",
          isDark ? "bg-purple-500/20 text-purple-300" : "bg-purple-100 text-purple-700"
        )}>
          IPL 2026
        </span>
      </div>

      {/* Score Display */}
      <div className="p-5">
        <div className="flex items-center justify-between">
          {/* Team 1 */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
                  "bg-gradient-to-br from-[#3A225D] to-[#5a3a8a] text-[#D4AF37]"
                )}
              >
                KKR
              </div>
              <div>
                <p className={cn(
                  "font-semibold text-sm",
                  isDark ? "text-white" : "text-slate-900"
                )}>
                  {team1.shortName}
                </p>
                <p className={cn(
                  "text-xs",
                  isDark ? "text-white/40" : "text-slate-400"
                )}>
                  {team1.name}
                </p>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-4xl font-black tabular-nums tracking-tight",
                isDark ? "text-white" : "text-slate-900",
                isFirstInnings && liveScore.battingTeam === "KKR" && "text-yellow-400"
              )}>
                {team1.score}/{team1.wickets}
              </span>
              <span className={cn(
                "text-base font-medium",
                isDark ? "text-white/50" : "text-slate-400"
              )}>
                ({team1.overs})
              </span>
            </div>
            {team1.overs > 0 && (
              <p className={cn(
                "text-xs mt-1",
                isDark ? "text-white/40" : "text-slate-400"
              )}>
                CRR: {team1.runRate}
              </p>
            )}
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center mx-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-sm font-black",
              isDark
                ? "bg-gradient-to-br from-red-600 to-orange-500 text-white shadow-lg shadow-red-500/20"
                : "bg-gradient-to-br from-red-500 to-orange-400 text-white shadow-lg shadow-red-400/30"
            )}>
              VS
            </div>
            <div className={cn(
              "text-[10px] mt-1 font-medium",
              isDark ? "text-white/30" : "text-slate-300"
            )}>
              INN {liveScore.currentInnings}
            </div>
          </div>

          {/* Team 2 */}
          <div className="flex-1 text-right">
            <div className="flex items-center gap-3 mb-2 justify-end">
              <div>
                <p className={cn(
                  "font-semibold text-sm",
                  isDark ? "text-white" : "text-slate-900"
                )}>
                  {team2.shortName}
                </p>
                <p className={cn(
                  "text-xs",
                  isDark ? "text-white/40" : "text-slate-400"
                )}>
                  {team2.name}
                </p>
              </div>
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
                  "bg-gradient-to-br from-[#004BA0] to-[#0066cc] text-[#D4AF37]"
                )}
              >
                MI
              </div>
            </div>
            <div className="flex items-baseline gap-2 justify-end">
              <span className={cn(
                "text-4xl font-black tabular-nums tracking-tight",
                isDark ? "text-white" : "text-slate-900",
                !isFirstInnings && liveScore.battingTeam === "MI" && "text-blue-400"
              )}>
                {team2.score}/{team2.wickets}
              </span>
              <span className={cn(
                "text-base font-medium",
                isDark ? "text-white/50" : "text-slate-400"
              )}>
                ({team2.overs})
              </span>
            </div>
            {team2.overs > 0 && (
              <p className={cn(
                "text-xs mt-1",
                isDark ? "text-white/40" : "text-slate-400"
              )}>
                CRR: {team2.runRate}
              </p>
            )}
          </div>
        </div>

        {/* Target/Required Info */}
        {liveScore.target && (
          <div className={cn(
            "mt-4 py-2 px-3 rounded-lg text-center text-sm font-medium",
            isDark ? "bg-yellow-500/10 text-yellow-300" : "bg-yellow-50 text-yellow-700 border border-yellow-200"
          )}>
            Target: {liveScore.target} | Need {liveScore.target - (liveScore.currentInnings === 2 ? team2.score : team1.score)} runs from {(20 - (liveScore.currentInnings === 2 ? team2.overs : team1.overs)).toFixed(1)} overs | RRR: {liveScore.requiredRunRate}
          </div>
        )}
      </div>

      {/* Current Players */}
      <div className={cn(
        "px-5 pb-4 grid grid-cols-2 gap-3",
      )}>
        {/* Batsmen */}
        <div className={cn(
          "rounded-xl p-3",
          isDark ? "bg-white/5" : "bg-slate-50"
        )}>
          <p className={cn(
            "text-[10px] uppercase tracking-wider font-semibold mb-2",
            isDark ? "text-white/40" : "text-slate-400"
          )}>
            Batting
          </p>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className={cn(
                "text-sm font-medium flex items-center gap-1",
                isDark ? "text-white" : "text-slate-900"
              )}>
                <span className="text-yellow-500">*</span>
                {liveScore.currentBatsmen.striker.name}
              </span>
              <span className={cn(
                "text-sm font-bold tabular-nums",
                isDark ? "text-white" : "text-slate-900"
              )}>
                {liveScore.currentBatsmen.striker.runs}
                <span className={cn(
                  "text-xs font-normal ml-0.5",
                  isDark ? "text-white/40" : "text-slate-400"
                )}>
                  ({liveScore.currentBatsmen.striker.balls})
                </span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={cn(
                "text-sm",
                isDark ? "text-white/60" : "text-slate-600"
              )}>
                {liveScore.currentBatsmen.nonStriker.name}
              </span>
              <span className={cn(
                "text-sm tabular-nums",
                isDark ? "text-white/60" : "text-slate-600"
              )}>
                {liveScore.currentBatsmen.nonStriker.runs}
                <span className="text-xs ml-0.5">
                  ({liveScore.currentBatsmen.nonStriker.balls})
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Bowler */}
        <div className={cn(
          "rounded-xl p-3",
          isDark ? "bg-white/5" : "bg-slate-50"
        )}>
          <p className={cn(
            "text-[10px] uppercase tracking-wider font-semibold mb-2",
            isDark ? "text-white/40" : "text-slate-400"
          )}>
            Bowling
          </p>
          <div className="space-y-1">
            <p className={cn(
              "text-sm font-medium",
              isDark ? "text-white" : "text-slate-900"
            )}>
              {liveScore.currentBowler.name}
            </p>
            <p className={cn(
              "text-xs tabular-nums",
              isDark ? "text-white/50" : "text-slate-500"
            )}>
              {liveScore.currentBowler.overs}-{liveScore.currentBowler.maidens}-{liveScore.currentBowler.runs}-{liveScore.currentBowler.wickets}
              <span className="ml-2">Econ: {liveScore.currentBowler.economy}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Last Wicket */}
      {liveScore.lastWicket && (
        <div className={cn(
          "px-5 pb-3",
        )}>
          <div className={cn(
            "text-xs py-1.5 px-3 rounded-lg",
            isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"
          )}>
            Last Wicket: {liveScore.lastWicket}
          </div>
        </div>
      )}

      {/* Toss Info */}
      <div className={cn(
        "px-5 py-2.5 text-xs border-t",
        isDark ? "border-white/5 text-white/30" : "border-slate-100 text-slate-400"
      )}>
        {liveScore.toss}
      </div>
    </div>
  );
}
