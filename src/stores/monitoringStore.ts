import { create } from "zustand";

export interface MonitoredUser {
  id: string;
  name: string | null;
  email: string;
  status: "online" | "idle" | "offline";
  hostname: string | null;
  lastHeartbeat: string | null;
  todayKeystrokes: number;
  todayClicks: number;
  screenshotCount: number;
}

export interface ActivityLogEntry {
  id: string;
  periodStart: string;
  periodEnd: string;
  mouseClicks: number;
  mouseDistance: number;
  keystrokes: number;
  scrollEvents: number;
  activeWindowTitle: string | null;
  activeAppName: string | null;
  isIdle: boolean;
}

export interface ActivityStats {
  totalKeystrokes: number;
  totalClicks: number;
  totalMouseDistance: number;
  activeTimeMinutes: number;
  idleTimeMinutes: number;
  topApps: { name: string; minutes: number }[];
  hourlyActivity: { hour: number; keystrokes: number; clicks: number }[];
}

export interface ScreenshotEntry {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  activeWindowTitle: string | null;
  capturedAt: string;
}

export interface MonitoringSettings {
  screenshotIntervalMin: number;
  trackMouseClicks: boolean;
  trackKeystrokes: boolean;
  trackMouseMovement: boolean;
  trackActiveWindow: boolean;
  trackScreenshots: boolean;
  idleTimeoutMin: number;
  isEnabled: boolean;
}

interface MonitoringState {
  users: MonitoredUser[];
  selectedUserId: string | null;
  activityLogs: ActivityLogEntry[];
  activityStats: ActivityStats | null;
  screenshots: ScreenshotEntry[];
  settings: MonitoringSettings | null;
  isLoading: boolean;

  setUsers: (users: MonitoredUser[]) => void;
  setSelectedUserId: (id: string | null) => void;
  setActivityLogs: (logs: ActivityLogEntry[]) => void;
  setActivityStats: (stats: ActivityStats | null) => void;
  setScreenshots: (screenshots: ScreenshotEntry[]) => void;
  appendScreenshots: (screenshots: ScreenshotEntry[]) => void;
  setSettings: (settings: MonitoringSettings | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useMonitoringStore = create<MonitoringState>((set) => ({
  users: [],
  selectedUserId: null,
  activityLogs: [],
  activityStats: null,
  screenshots: [],
  settings: null,
  isLoading: false,

  setUsers: (users) => set({ users }),
  setSelectedUserId: (selectedUserId) =>
    set({ selectedUserId, activityLogs: [], activityStats: null, screenshots: [] }),
  setActivityLogs: (activityLogs) => set({ activityLogs }),
  setActivityStats: (activityStats) => set({ activityStats }),
  setScreenshots: (screenshots) => set({ screenshots }),
  appendScreenshots: (newScreenshots) =>
    set((state) => ({ screenshots: [...state.screenshots, ...newScreenshots] })),
  setSettings: (settings) => set({ settings }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
