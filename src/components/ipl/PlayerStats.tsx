"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TeamData, PlayerStats as PlayerStatsType } from "@/lib/ipl/playerData";

interface PlayerStatsProps {
  kkr: TeamData;
  mi: TeamData;
  theme: "dark" | "light";
}

function PlayerCard({ player, teamColor, theme }: { player: PlayerStatsType; teamColor: string; theme: "dark" | "light" }) {
  const isDark = theme === "dark";
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden",
        isDark
          ? "bg-white/5 border-white/10 hover:bg-white/8"
          : "bg-white border-slate-200 hover:shadow-md"
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3 p-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ backgroundColor: teamColor }}
        >
          {player.name.split(" ").map(n => n[0]).join("")}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn(
              "text-sm font-semibold truncate",
              isDark ? "text-white" : "text-slate-900"
            )}>
              {player.name}
              {player.isCaptain && <span className="text-yellow-500 ml-1">(C)</span>}
              {player.isKeeper && <span className="text-blue-400 ml-1">(WK)</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded font-medium",
              player.role === "Batsman"
                ? isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"
                : player.role === "Bowler"
                ? isDark ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-700"
                : player.role === "Wicket-keeper"
                ? isDark ? "bg-cyan-500/20 text-cyan-300" : "bg-cyan-100 text-cyan-700"
                : isDark ? "bg-purple-500/20 text-purple-300" : "bg-purple-100 text-purple-700"
            )}>
              {player.role}
            </span>
            <span className={cn(
              "text-[10px]",
              isDark ? "text-white/30" : "text-slate-400"
            )}>
              {player.nationality}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className={cn(
            "text-lg font-bold tabular-nums",
            isDark ? "text-white" : "text-slate-900"
          )}>
            {player.batting.average}
          </p>
          <p className={cn(
            "text-[10px]",
            isDark ? "text-white/30" : "text-slate-400"
          )}>
            SR: {player.batting.strikeRate}
          </p>
        </div>
        <svg
          className={cn(
            "w-4 h-4 transition-transform shrink-0",
            expanded && "rotate-180",
            isDark ? "text-white/30" : "text-slate-400"
          )}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {expanded && (
        <div className={cn(
          "px-3 pb-3 pt-0 border-t space-y-3",
          isDark ? "border-white/5" : "border-slate-100"
        )}>
          {/* Batting Stats */}
          <div className="grid grid-cols-4 gap-2 pt-3">
            {[
              { label: "M", value: player.batting.matches },
              { label: "Runs", value: player.batting.runs },
              { label: "HS", value: player.batting.highScore },
              { label: "50s/100s", value: `${player.batting.fifties}/${player.batting.hundreds}` },
              { label: "4s", value: player.batting.fours },
              { label: "6s", value: player.batting.sixes },
              { label: "Dot%", value: `${player.batting.dotBallPct}%` },
              { label: "Boundary%", value: `${player.batting.boundaryPct}%` },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className={cn("text-xs font-bold tabular-nums", isDark ? "text-white/80" : "text-slate-700")}>
                  {stat.value}
                </p>
                <p className={cn("text-[9px]", isDark ? "text-white/30" : "text-slate-400")}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Bowling Stats */}
          {player.bowling && (
            <div>
              <p className={cn("text-[10px] uppercase tracking-wider font-semibold mb-1", isDark ? "text-white/30" : "text-slate-400")}>
                Bowling
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Wkts", value: player.bowling.wickets },
                  { label: "Econ", value: player.bowling.economy },
                  { label: "Avg", value: player.bowling.average },
                  { label: "Best", value: player.bowling.bestFigures },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className={cn("text-xs font-bold tabular-nums", isDark ? "text-white/80" : "text-slate-700")}>
                      {stat.value}
                    </p>
                    <p className={cn("text-[9px]", isDark ? "text-white/30" : "text-slate-400")}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Form */}
          <div>
            <p className={cn("text-[10px] uppercase tracking-wider font-semibold mb-1", isDark ? "text-white/30" : "text-slate-400")}>
              Recent Form (Last 5)
            </p>
            <div className="flex gap-1.5 items-end">
              {player.recentForm.scores.map((score, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <div
                    className={cn(
                      "w-6 rounded-t transition-all",
                      score > 50 ? "bg-gradient-to-t from-green-500 to-emerald-400" :
                      score > 30 ? "bg-gradient-to-t from-yellow-500 to-amber-400" :
                      score > 10 ? "bg-gradient-to-t from-orange-500 to-amber-400" :
                      "bg-gradient-to-t from-red-500 to-red-400"
                    )}
                    style={{ height: `${Math.max(4, score * 0.6)}px` }}
                  />
                  <span className={cn("text-[9px] tabular-nums", isDark ? "text-white/40" : "text-slate-400")}>
                    {score}
                  </span>
                </div>
              ))}
              <div className={cn(
                "flex items-center gap-1 ml-2 px-1.5 py-0.5 rounded text-[9px] font-medium",
                player.recentForm.trend === "rising" ? (isDark ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700") :
                player.recentForm.trend === "declining" ? (isDark ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-700") :
                isDark ? "bg-white/10 text-white/40" : "bg-slate-100 text-slate-500"
              )}>
                {player.recentForm.trend === "rising" ? "↑" : player.recentForm.trend === "declining" ? "↓" : "→"}
                {player.recentForm.trend}
              </div>
            </div>
          </div>

          {/* Phase Performance */}
          <div>
            <p className={cn("text-[10px] uppercase tracking-wider font-semibold mb-1", isDark ? "text-white/30" : "text-slate-400")}>
              Phase Performance (SR / Avg)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Powerplay", sr: player.phases.powerplay.sr, avg: player.phases.powerplay.avg },
                { label: "Middle", sr: player.phases.middle.sr, avg: player.phases.middle.avg },
                { label: "Death", sr: player.phases.death.sr, avg: player.phases.death.avg },
              ].map((phase) => (
                <div key={phase.label} className={cn(
                  "text-center rounded-lg p-1.5",
                  isDark ? "bg-white/5" : "bg-slate-50"
                )}>
                  <p className={cn("text-[9px] font-medium mb-0.5", isDark ? "text-white/40" : "text-slate-400")}>
                    {phase.label}
                  </p>
                  <p className={cn("text-xs font-bold tabular-nums", isDark ? "text-white/70" : "text-slate-700")}>
                    {phase.sr > 0 ? `${phase.sr} / ${phase.avg}` : "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PlayerStatsPanel({ kkr, mi, theme }: PlayerStatsProps) {
  const isDark = theme === "dark";
  const [activeTeam, setActiveTeam] = useState<"kkr" | "mi">("kkr");
  const team = activeTeam === "kkr" ? kkr : mi;

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
          "font-bold text-sm mb-3",
          isDark ? "text-white" : "text-slate-900"
        )}>
          Player Analytics
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTeam("kkr")}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer",
              activeTeam === "kkr"
                ? "bg-gradient-to-r from-[#3A225D] to-[#5a3a8a] text-[#D4AF37] shadow-lg"
                : isDark
                ? "bg-white/5 text-white/40 hover:bg-white/10"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            )}
          >
            KKR ({kkr.players.length})
          </button>
          <button
            onClick={() => setActiveTeam("mi")}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer",
              activeTeam === "mi"
                ? "bg-gradient-to-r from-[#004BA0] to-[#0066cc] text-[#D4AF37] shadow-lg"
                : isDark
                ? "bg-white/5 text-white/40 hover:bg-white/10"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            )}
          >
            MI ({mi.players.length})
          </button>
        </div>
      </div>

      <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
        {team.players.map((player) => (
          <PlayerCard
            key={player.name}
            player={player}
            teamColor={team.color}
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
}
