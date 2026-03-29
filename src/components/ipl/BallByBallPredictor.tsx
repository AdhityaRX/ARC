"use client";

import { cn } from "@/lib/utils";
import type { BallPrediction } from "@/lib/ipl/types";

interface BallByBallPredictorProps {
  predictions: BallPrediction[];
  theme: "dark" | "light";
}

function getBallColor(prediction: string, isDark: boolean): string {
  switch (prediction) {
    case "dot":
    case "0":
      return isDark ? "bg-white/10 text-white/40" : "bg-slate-100 text-slate-400";
    case "1":
      return isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-50 text-emerald-600";
    case "2":
      return isDark ? "bg-emerald-500/30 text-emerald-200" : "bg-emerald-100 text-emerald-700";
    case "3":
      return isDark ? "bg-teal-500/30 text-teal-200" : "bg-teal-100 text-teal-700";
    case "4":
      return isDark ? "bg-blue-500/30 text-blue-200" : "bg-blue-100 text-blue-700";
    case "6":
      return isDark ? "bg-purple-500/30 text-purple-200" : "bg-purple-100 text-purple-700";
    case "wicket":
      return isDark ? "bg-red-500/30 text-red-200" : "bg-red-100 text-red-700";
    case "wide":
    case "no_ball":
      return isDark ? "bg-yellow-500/20 text-yellow-300" : "bg-yellow-50 text-yellow-600";
    default:
      return isDark ? "bg-white/10 text-white/40" : "bg-slate-100 text-slate-400";
  }
}

function getBallLabel(prediction: string): string {
  switch (prediction) {
    case "dot": return "0";
    case "wicket": return "W";
    case "wide": return "WD";
    case "no_ball": return "NB";
    default: return prediction;
  }
}

export function BallByBallPredictor({ predictions, theme }: BallByBallPredictorProps) {
  const isDark = theme === "dark";

  // Group by over
  const overGroups: Record<number, BallPrediction[]> = {};
  for (const p of predictions) {
    if (!overGroups[p.over]) overGroups[p.over] = [];
    overGroups[p.over].push(p);
  }

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
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          Ball-by-Ball Prediction
        </h3>
        <span className={cn(
          "text-[10px] px-2 py-0.5 rounded-full font-medium",
          isDark ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700"
        )}>
          Next {predictions.length} balls
        </span>
      </div>

      <div className="p-4 space-y-3">
        {Object.entries(overGroups).map(([over, balls]) => (
          <div key={over}>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full",
                isDark ? "bg-white/10 text-white/50" : "bg-slate-200 text-slate-500"
              )}>
                Over {over}
              </span>
              <div className={cn(
                "flex-1 h-px",
                isDark ? "bg-white/5" : "bg-slate-100"
              )} />
            </div>
            <div className="flex flex-wrap gap-2">
              {balls.map((ball, idx) => (
                <div
                  key={idx}
                  className="group relative"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold",
                      "transition-all duration-200 cursor-pointer",
                      "hover:scale-110 hover:shadow-lg",
                      getBallColor(ball.prediction, isDark)
                    )}
                  >
                    {getBallLabel(ball.prediction)}
                  </div>
                  {/* Tooltip */}
                  <div className={cn(
                    "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs",
                    "opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10",
                    "whitespace-nowrap min-w-[160px]",
                    isDark ? "bg-black/90 text-white border border-white/10" : "bg-slate-800 text-white"
                  )}>
                    <p className="font-bold">Over {ball.over}.{ball.ball}</p>
                    <p className="text-white/70">{ball.reasoning}</p>
                    <p className="text-yellow-300 mt-1">Confidence: {ball.confidence}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {predictions.length === 0 && (
          <div className={cn(
            "text-center py-8 text-sm",
            isDark ? "text-white/30" : "text-slate-400"
          )}>
            Waiting for prediction data...
          </div>
        )}

        {/* Legend */}
        <div className={cn(
          "flex flex-wrap gap-3 pt-3 border-t",
          isDark ? "border-white/5" : "border-slate-100"
        )}>
          {[
            { label: "Dot", color: getBallColor("dot", isDark) },
            { label: "1-3", color: getBallColor("1", isDark) },
            { label: "Four", color: getBallColor("4", isDark) },
            { label: "Six", color: getBallColor("6", isDark) },
            { label: "Wicket", color: getBallColor("wicket", isDark) },
            { label: "Extra", color: getBallColor("wide", isDark) },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={cn("w-3 h-3 rounded", item.color)} />
              <span className={cn(
                "text-[10px]",
                isDark ? "text-white/40" : "text-slate-400"
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
