"use client";

import { useEffect, useCallback, useRef } from "react";
import { useIplStore } from "@/stores/iplStore";
import { kkrData, miData } from "@/lib/ipl/playerData";
import { cn } from "@/lib/utils";
import { IplHeader } from "@/components/ipl/IplHeader";
import { Scoreboard } from "@/components/ipl/Scoreboard";
import { PredictionPanel } from "@/components/ipl/PredictionPanel";
import { BallByBallPredictor } from "@/components/ipl/BallByBallPredictor";
import { OverPredictions } from "@/components/ipl/OverPredictions";
import { PlayerStatsPanel } from "@/components/ipl/PlayerStats";
import { TeamComparison } from "@/components/ipl/TeamComparison";
import { WinProbabilityChart } from "@/components/ipl/WinProbabilityChart";
import type { LiveScore, MatchPrediction } from "@/lib/ipl/types";

export default function IplPredictorPage() {
  const {
    liveScore, prediction, isConnected, isLoading, theme,
    autoRefresh, scoreHistory, lastFetchTime, error,
    setLiveScore, setPrediction, setConnected, setLoading,
    setError, toggleTheme, setAutoRefresh, addScoreHistory,
    resetMatch,
  } = useIplStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const predictionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLiveScore = useCallback(async () => {
    try {
      const res = await fetch("/api/ipl/live-score", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setLiveScore(data.data as LiveScore);
        setConnected(true);
        setLoading(false);

        const score = data.data as LiveScore;
        addScoreHistory({
          timestamp: new Date().toISOString(),
          team1Score: score.team1.score,
          team2Score: score.team2.score,
          winProb: prediction?.winProbability
            ? (prediction.winner === "KKR" ? prediction.winProbability : 100 - prediction.winProbability)
            : 50,
        });
      }
    } catch {
      setError("Failed to fetch live score");
      setConnected(false);
    }
  }, [setLiveScore, setConnected, setLoading, setError, addScoreHistory, prediction]);

  const fetchPrediction = useCallback(async (score: LiveScore) => {
    try {
      const res = await fetch("/api/ipl/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liveScore: score }),
      });
      const data = await res.json();
      if (data.success) {
        setPrediction(data.data as MatchPrediction);
      }
    } catch {
      // Prediction failed silently, will retry
    }
  }, [setPrediction]);

  useEffect(() => {
    fetchLiveScore();

    if (autoRefresh) {
      intervalRef.current = setInterval(fetchLiveScore, 10000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, fetchLiveScore]);

  useEffect(() => {
    if (liveScore && autoRefresh) {
      fetchPrediction(liveScore);

      predictionIntervalRef.current = setInterval(() => {
        if (liveScore) fetchPrediction(liveScore);
      }, 30000);
    }

    return () => {
      if (predictionIntervalRef.current) clearInterval(predictionIntervalRef.current);
    };
  }, [liveScore?.team1.score, liveScore?.team2.score, autoRefresh, fetchPrediction, liveScore]);

  const handleResetMatch = async () => {
    try {
      await fetch("/api/ipl/live-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset: true }),
      });
      resetMatch();
      setTimeout(fetchLiveScore, 500);
    } catch {
      setError("Failed to reset match");
    }
  };

  const isDark = theme === "dark";

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isDark
        ? "bg-[#0a0a14] text-white"
        : "bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900"
    )}>
      <IplHeader
        theme={theme}
        onToggleTheme={toggleTheme}
        isConnected={isConnected}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
        onResetMatch={handleResetMatch}
        lastFetchTime={lastFetchTime}
      />

      {isLoading && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className={cn(
              "w-16 h-16 rounded-2xl mx-auto flex items-center justify-center",
              "bg-gradient-to-br from-red-600 to-orange-500 shadow-lg shadow-red-500/20"
            )}>
              <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" className="opacity-75" />
              </svg>
            </div>
            <div>
              <p className={cn("text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>
                Loading Match Data
              </p>
              <p className={cn("text-sm", isDark ? "text-white/40" : "text-slate-400")}>
                Connecting to KKR vs MI live feed...
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className={cn(
          "mx-4 mt-4 p-4 rounded-xl text-sm",
          isDark ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-red-50 text-red-600 border border-red-200"
        )}>
          {error}
        </div>
      )}

      {!isLoading && liveScore && (
        <main className="max-w-[1400px] mx-auto px-4 py-6">
          <div className="mb-6">
            <Scoreboard liveScore={liveScore} theme={theme} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prediction && (
                  <PredictionPanel prediction={prediction} theme={theme} />
                )}
                <WinProbabilityChart history={scoreHistory} theme={theme} />
              </div>

              {prediction && (
                <BallByBallPredictor predictions={prediction.ballByBall} theme={theme} />
              )}

              {prediction && (
                <OverPredictions
                  predictions={prediction.overSummary}
                  currentOver={Math.floor(
                    liveScore.currentInnings === 1
                      ? liveScore.team1.overs
                      : liveScore.team2.overs
                  )}
                  theme={theme}
                />
              )}
            </div>

            <div className="space-y-6">
              <TeamComparison kkr={kkrData} mi={miData} theme={theme} />
              <PlayerStatsPanel kkr={kkrData} mi={miData} theme={theme} />
            </div>
          </div>

          <footer className={cn(
            "mt-12 py-6 border-t text-center",
            isDark ? "border-white/5" : "border-slate-200"
          )}>
            <p className={cn(
              "text-xs",
              isDark ? "text-white/20" : "text-slate-400"
            )}>
              IPL Match Predictor — Powered by Claude Opus 4.6 AI
            </p>
            <p className={cn(
              "text-[10px] mt-1",
              isDark ? "text-white/10" : "text-slate-300"
            )}>
              Predictions are AI-generated and for entertainment purposes only. Not affiliated with BCCI or IPL.
            </p>
          </footer>
        </main>
      )}
    </div>
  );
}
