import { create } from "zustand";
import type { LiveScore, MatchPrediction } from "@/lib/ipl/types";

interface IplStore {
  // Live score state
  liveScore: LiveScore | null;
  prediction: MatchPrediction | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  theme: "dark" | "light";
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  lastFetchTime: string | null;

  // Score history for charts
  scoreHistory: { timestamp: string; team1Score: number; team2Score: number; winProb: number }[];

  // Actions
  setLiveScore: (score: LiveScore) => void;
  setPrediction: (prediction: MatchPrediction) => void;
  setConnected: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleTheme: () => void;
  setAutoRefresh: (auto: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  addScoreHistory: (entry: { timestamp: string; team1Score: number; team2Score: number; winProb: number }) => void;
  resetMatch: () => void;
}

export const useIplStore = create<IplStore>((set) => ({
  liveScore: null,
  prediction: null,
  isConnected: false,
  isLoading: true,
  error: null,
  theme: "dark",
  autoRefresh: true,
  refreshInterval: 10,
  lastFetchTime: null,
  scoreHistory: [],

  setLiveScore: (score) =>
    set({ liveScore: score, lastFetchTime: new Date().toISOString(), error: null }),

  setPrediction: (prediction) => set({ prediction }),

  setConnected: (connected) => set({ isConnected: connected }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  toggleTheme: () =>
    set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),

  setAutoRefresh: (auto) => set({ autoRefresh: auto }),

  setRefreshInterval: (interval) => set({ refreshInterval: interval }),

  addScoreHistory: (entry) =>
    set((state) => ({
      scoreHistory: [...state.scoreHistory.slice(-100), entry],
    })),

  resetMatch: () =>
    set({
      liveScore: null,
      prediction: null,
      scoreHistory: [],
      isLoading: true,
      error: null,
    }),
}));
