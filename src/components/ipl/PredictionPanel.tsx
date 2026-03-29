"use client";

import { cn } from "@/lib/utils";
import type { MatchPrediction } from "@/lib/ipl/types";

interface PredictionPanelProps {
  prediction: MatchPrediction;
  theme: "dark" | "light";
}

export function PredictionPanel({ prediction, theme }: PredictionPanelProps) {
  const isDark = theme === "dark";
  const isKKRWinning = prediction.winner === "KKR";

  return (
    <div className={cn(
      "rounded-2xl overflow-hidden border transition-all duration-300",
      isDark
        ? "bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-white/10"
        : "bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-lg"
    )}>
      {/* Header */}
      <div className={cn(
        "px-4 py-3 flex items-center justify-between",
        isDark ? "bg-white/5" : "bg-slate-50"
      )}>
        <h3 className={cn(
          "font-bold text-sm flex items-center gap-2",
          isDark ? "text-white" : "text-slate-900"
        )}>
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          AI Match Prediction
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
            isDark ? "bg-purple-500/20 text-purple-300" : "bg-purple-100 text-purple-700"
          )}>
            Claude Opus 4.6
          </span>
        </h3>
        <span className={cn(
          "text-[10px]",
          isDark ? "text-white/30" : "text-slate-400"
        )}>
          Updated: {new Date(prediction.lastUpdated).toLocaleTimeString()}
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Win Probability */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={cn(
              "text-sm font-bold",
              isKKRWinning
                ? "text-purple-400"
                : isDark ? "text-blue-400" : "text-blue-600"
            )}>
              KKR {isKKRWinning ? prediction.winProbability : 100 - prediction.winProbability}%
            </span>
            <span className={cn(
              "text-sm font-bold",
              !isKKRWinning
                ? "text-blue-400"
                : isDark ? "text-purple-400" : "text-purple-600"
            )}>
              {!isKKRWinning ? prediction.winProbability : 100 - prediction.winProbability}% MI
            </span>
          </div>
          <div className={cn(
            "h-3 rounded-full overflow-hidden flex",
            isDark ? "bg-white/10" : "bg-slate-200"
          )}>
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-l-full transition-all duration-1000 ease-out"
              style={{ width: `${isKKRWinning ? prediction.winProbability : 100 - prediction.winProbability}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-r-full transition-all duration-1000 ease-out"
              style={{ width: `${!isKKRWinning ? prediction.winProbability : 100 - prediction.winProbability}%` }}
            />
          </div>
          <div className={cn(
            "flex items-center justify-center mt-2 gap-2 text-xs",
            isDark ? "text-white/50" : "text-slate-500"
          )}>
            <span className={cn(
              "font-bold text-lg",
              isKKRWinning ? "text-purple-400" : "text-blue-400"
            )}>
              {prediction.winner}
            </span>
            predicted to win
          </div>
        </div>

        {/* Predicted Scores */}
        <div className="grid grid-cols-2 gap-3">
          <div className={cn(
            "rounded-xl p-3 text-center",
            isDark ? "bg-purple-500/10 border border-purple-500/20" : "bg-purple-50 border border-purple-200"
          )}>
            <p className={cn(
              "text-[10px] uppercase tracking-wider font-semibold mb-1",
              isDark ? "text-purple-300/60" : "text-purple-500"
            )}>
              KKR Predicted
            </p>
            <p className={cn(
              "text-2xl font-black tabular-nums",
              isDark ? "text-purple-300" : "text-purple-700"
            )}>
              {prediction.predictedScore1.runs}/{prediction.predictedScore1.wickets}
            </p>
            <p className={cn(
              "text-xs",
              isDark ? "text-purple-300/40" : "text-purple-400"
            )}>
              ({prediction.predictedScore1.overs} ov)
            </p>
          </div>
          <div className={cn(
            "rounded-xl p-3 text-center",
            isDark ? "bg-blue-500/10 border border-blue-500/20" : "bg-blue-50 border border-blue-200"
          )}>
            <p className={cn(
              "text-[10px] uppercase tracking-wider font-semibold mb-1",
              isDark ? "text-blue-300/60" : "text-blue-500"
            )}>
              MI Predicted
            </p>
            <p className={cn(
              "text-2xl font-black tabular-nums",
              isDark ? "text-blue-300" : "text-blue-700"
            )}>
              {prediction.predictedScore2?.runs || "—"}/{prediction.predictedScore2?.wickets || "—"}
            </p>
            <p className={cn(
              "text-xs",
              isDark ? "text-blue-300/40" : "text-blue-400"
            )}>
              ({prediction.predictedScore2?.overs || 20} ov)
            </p>
          </div>
        </div>

        {/* Momentum */}
        <div className={cn(
          "rounded-xl p-3 text-center",
          isDark ? "bg-white/5" : "bg-slate-50"
        )}>
          <p className={cn(
            "text-[10px] uppercase tracking-wider font-semibold mb-1",
            isDark ? "text-white/40" : "text-slate-400"
          )}>
            Match Momentum
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className={cn(
              "text-sm font-bold",
              prediction.momentum === "team1" ? "text-purple-400" : isDark ? "text-white/30" : "text-slate-300"
            )}>
              KKR
            </span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-5 h-2 rounded-full transition-all",
                    prediction.momentum === "team1" && i <= 3 ? "bg-purple-500" :
                    prediction.momentum === "team2" && i >= 3 ? "bg-blue-500" :
                    prediction.momentum === "even" && i === 3 ? "bg-yellow-500" :
                    isDark ? "bg-white/10" : "bg-slate-200"
                  )}
                />
              ))}
            </div>
            <span className={cn(
              "text-sm font-bold",
              prediction.momentum === "team2" ? "text-blue-400" : isDark ? "text-white/30" : "text-slate-300"
            )}>
              MI
            </span>
          </div>
        </div>

        {/* Man of the Match */}
        <div className={cn(
          "rounded-xl p-3 flex items-center gap-3",
          isDark ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-yellow-50 border border-yellow-200"
        )}>
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-lg",
            "bg-gradient-to-br from-yellow-400 to-orange-500"
          )}>
            🏆
          </div>
          <div>
            <p className={cn(
              "text-[10px] uppercase tracking-wider font-semibold",
              isDark ? "text-yellow-300/60" : "text-yellow-600"
            )}>
              Predicted MOTM
            </p>
            <p className={cn(
              "text-sm font-bold",
              isDark ? "text-yellow-300" : "text-yellow-700"
            )}>
              {prediction.manOfTheMatch}
            </p>
          </div>
        </div>

        {/* Key Factors */}
        <div>
          <p className={cn(
            "text-[10px] uppercase tracking-wider font-semibold mb-2",
            isDark ? "text-white/40" : "text-slate-400"
          )}>
            Key Factors
          </p>
          <div className="space-y-1.5">
            {prediction.keyFactors.map((factor, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-2 text-xs",
                  isDark ? "text-white/60" : "text-slate-600"
                )}
              >
                <span className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
                  isDark ? "bg-white/10 text-white/60" : "bg-slate-200 text-slate-500"
                )}>
                  {i + 1}
                </span>
                {factor}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
