"use client";

import { cn } from "@/lib/utils";

interface IplHeaderProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  isConnected: boolean;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  onResetMatch: () => void;
  lastFetchTime: string | null;
}

export function IplHeader({
  theme,
  onToggleTheme,
  isConnected,
  autoRefresh,
  onToggleAutoRefresh,
  onResetMatch,
  lastFetchTime,
}: IplHeaderProps) {
  const isDark = theme === "dark";

  return (
    <header className={cn(
      "sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-300",
      isDark
        ? "bg-[#0d0d1a]/80 border-white/10"
        : "bg-white/80 border-slate-200"
    )}>
      <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
            "bg-gradient-to-br from-red-600 to-orange-500 text-white shadow-lg shadow-red-500/20"
          )}>
            IPL
          </div>
          <div>
            <h1 className={cn(
              "text-lg font-black tracking-tight leading-none",
              isDark ? "text-white" : "text-slate-900"
            )}>
              IPL Match Predictor
            </h1>
            <p className={cn(
              "text-[11px] mt-0.5",
              isDark ? "text-white/40" : "text-slate-400"
            )}>
              KKR vs MI — IPL 2026 — Powered by Claude AI
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium",
            isConnected
              ? isDark ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600"
              : isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"
          )}>
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
            )} />
            {isConnected ? "Live" : "Disconnected"}
          </div>

          {/* Last Updated */}
          {lastFetchTime && (
            <span className={cn(
              "text-[10px] hidden sm:block",
              isDark ? "text-white/30" : "text-slate-400"
            )}>
              {new Date(lastFetchTime).toLocaleTimeString()}
            </span>
          )}

          {/* Auto Refresh Toggle */}
          <button
            onClick={onToggleAutoRefresh}
            className={cn(
              "px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer",
              autoRefresh
                ? isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-50 text-blue-600"
                : isDark ? "bg-white/5 text-white/40" : "bg-slate-100 text-slate-400"
            )}
          >
            {autoRefresh ? "Auto ✓" : "Auto ✗"}
          </button>

          {/* Reset Match */}
          <button
            onClick={onResetMatch}
            className={cn(
              "px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer",
              isDark ? "bg-white/5 text-white/40 hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            )}
          >
            Reset
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer",
              isDark
                ? "bg-white/5 text-yellow-400 hover:bg-white/10"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {isDark ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
