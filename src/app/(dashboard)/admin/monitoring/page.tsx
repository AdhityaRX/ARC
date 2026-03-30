"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Monitor,
  MousePointer,
  Keyboard,
  Camera,
  Clock,
  Download,
  Settings,
  Users,
  Activity,
  Eye,
  RefreshCw,
  ChevronLeft,
  X,
  Zap,
  TrendingUp,
  AppWindow,
} from "lucide-react";

// ---- Types ----

interface MonitoredUser {
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

interface ActivityLogEntry {
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

interface ActivityStats {
  totalKeystrokes: number;
  totalClicks: number;
  totalMouseDistance: number;
  activeTimeMinutes: number;
  idleTimeMinutes: number;
  topApps: { name: string; minutes: number }[];
  hourlyActivity: { hour: number; keystrokes: number; clicks: number }[];
}

interface ScreenshotEntry {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  activeWindowTitle: string | null;
  capturedAt: string;
}

interface MonitoringSettings {
  screenshotIntervalMin: number;
  trackMouseClicks: boolean;
  trackKeystrokes: boolean;
  trackMouseMovement: boolean;
  trackActiveWindow: boolean;
  trackScreenshots: boolean;
  idleTimeoutMin: number;
  isEnabled: boolean;
}

// ---- Toggle Switch Component ----

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
        checked
          ? "bg-[var(--arc-crimson-500)]"
          : "bg-[var(--arc-bg-hover)]"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ---- Status Badge Component ----

function StatusBadge({ status }: { status: "online" | "idle" | "offline" }) {
  const colors = {
    online: "bg-green-500",
    idle: "bg-yellow-500",
    offline: "bg-gray-500",
  };
  const labels = {
    online: "Online",
    idle: "Idle",
    offline: "Offline",
  };

  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={`w-2 h-2 rounded-full ${colors[status]}`} />
      <span className="text-[var(--arc-text-secondary)]">{labels[status]}</span>
    </span>
  );
}

// ---- Screenshot Modal ----

function ScreenshotModal({
  screenshot,
  onClose,
}: {
  screenshot: ScreenshotEntry;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 p-2 text-white hover:text-[var(--arc-crimson-400)] transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
        <img
          src={screenshot.filePath}
          alt={screenshot.activeWindowTitle || "Screenshot"}
          className="max-w-full max-h-[85vh] rounded-lg object-contain"
        />
        <div className="mt-2 text-center">
          <p className="text-sm text-[var(--arc-text-secondary)]">
            {new Date(screenshot.capturedAt).toLocaleString()}
          </p>
          {screenshot.activeWindowTitle && (
            <p className="text-xs text-[var(--arc-text-tertiary)] mt-1">
              {screenshot.activeWindowTitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Main Component ----

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState<
    "live" | "activity" | "screenshots" | "settings" | "reports"
  >("live");

  // Live status
  const [users, setUsers] = useState<MonitoredUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Activity
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [activityFrom, setActivityFrom] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [activityTo, setActivityTo] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  // Screenshots
  const [screenshots, setScreenshots] = useState<ScreenshotEntry[]>([]);
  const [screenshotPage, setScreenshotPage] = useState(1);
  const [hasMoreScreenshots, setHasMoreScreenshots] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] =
    useState<ScreenshotEntry | null>(null);
  const [screenshotFrom, setScreenshotFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [screenshotTo, setScreenshotTo] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [isLoadingScreenshots, setIsLoadingScreenshots] = useState(false);

  // Settings
  const [settings, setSettings] = useState<MonitoringSettings>({
    screenshotIntervalMin: 5,
    trackMouseClicks: true,
    trackKeystrokes: true,
    trackMouseMovement: true,
    trackActiveWindow: true,
    trackScreenshots: true,
    idleTimeoutMin: 5,
    isEnabled: true,
  });
  const [settingsUserId, setSettingsUserId] = useState<string>("global");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Reports
  const [reportFrom, setReportFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [reportTo, setReportTo] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [reportUserId, setReportUserId] = useState<string>("all");
  const [reportFormat, setReportFormat] = useState<"json" | "csv">("csv");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ---- Data Fetching ----

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/monitoring/users");
      if (res.ok) {
        const data = await res.json();
        const items = data.users || data;
        if (Array.isArray(items)) {
          setUsers(
            items.map((u: Record<string, unknown>) => ({
              id: u.id as string,
              name: u.name as string | null,
              email: u.email as string,
              status: (u.latestSessionStatus || u.status || "offline") as "online" | "idle" | "offline",
              hostname: u.hostname as string | null,
              lastHeartbeat: u.lastHeartbeat as string | null,
              todayKeystrokes: (u.todayKeystrokes as number) || 0,
              todayClicks: (u.todayClicks as number) || 0,
              screenshotCount: (u.screenshotCount as number) || 0,
            }))
          );
        }
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
    setIsLoadingUsers(false);
  }, []);

  const fetchActivity = useCallback(async () => {
    if (!selectedUserId) return;
    setIsLoadingActivity(true);
    try {
      const params = new URLSearchParams({
        from: activityFrom,
        to: activityTo,
      });
      const res = await fetch(
        `/api/admin/monitoring/activity/${selectedUserId}?${params}`
      );
      if (res.ok) {
        const data = await res.json();
        setActivityLogs(data.activityLogs || data.logs || []);
        const s = data.stats;
        if (s) {
          // Map API response to our ActivityStats shape
          const activeMinutes = Math.round((s.activeTimeMs || s.activeTimeMinutes * 60000 || 0) / 60000);
          const idleMinutes = Math.round((s.idleTimeMs || s.idleTimeMinutes * 60000 || 0) / 60000);
          const topApps = (s.mostUsedApps || s.topApps || []).map((a: { app?: string; name?: string; count?: number; minutes?: number }) => ({
            name: a.app || a.name || "Unknown",
            minutes: a.count || a.minutes || 0,
          }));
          // Build hourly activity from logs
          const hourlyMap: Record<number, { keystrokes: number; clicks: number }> = {};
          for (let h = 0; h < 24; h++) hourlyMap[h] = { keystrokes: 0, clicks: 0 };
          for (const log of data.activityLogs || data.logs || []) {
            const hour = new Date(log.periodStart).getHours();
            hourlyMap[hour].keystrokes += log.keystrokes || 0;
            hourlyMap[hour].clicks += log.mouseClicks || 0;
          }
          const hourlyActivity = Object.entries(hourlyMap).map(([h, v]) => ({
            hour: parseInt(h),
            keystrokes: v.keystrokes,
            clicks: v.clicks,
          }));

          setActivityStats({
            totalKeystrokes: s.totalKeystrokes || 0,
            totalClicks: s.totalClicks || 0,
            totalMouseDistance: s.totalMouseDistance || 0,
            activeTimeMinutes: activeMinutes,
            idleTimeMinutes: idleMinutes,
            topApps,
            hourlyActivity,
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch activity:", err);
    }
    setIsLoadingActivity(false);
  }, [selectedUserId, activityFrom, activityTo]);

  const fetchScreenshots = useCallback(
    async (page: number = 1, reset: boolean = true) => {
      if (!selectedUserId) return;
      setIsLoadingScreenshots(true);
      try {
        const params = new URLSearchParams({
          from: screenshotFrom,
          to: screenshotTo,
          page: String(page),
        });
        const res = await fetch(
          `/api/admin/monitoring/screenshots/${selectedUserId}?${params}`
        );
        if (res.ok) {
          const data = await res.json();
          const items = data.screenshots || [];
          if (reset) {
            setScreenshots(items);
          } else {
            setScreenshots((prev) => [...prev, ...items]);
          }
          setHasMoreScreenshots(items.length >= 20);
          setScreenshotPage(page);
        }
      } catch (err) {
        console.error("Failed to fetch screenshots:", err);
      }
      setIsLoadingScreenshots(false);
    },
    [selectedUserId, screenshotFrom, screenshotTo]
  );

  const fetchSettings = useCallback(async (userId: string) => {
    try {
      const url =
        userId === "global"
          ? "/api/admin/monitoring/settings"
          : `/api/admin/monitoring/settings/${userId}`;
      const res = await fetch(url);
      if (res.ok) {
        const raw = await res.json();
        const data = raw.config || raw;
        setSettings({
          screenshotIntervalMin: data.screenshotIntervalMin ?? 5,
          trackMouseClicks: data.trackMouseClicks ?? true,
          trackKeystrokes: data.trackKeystrokes ?? true,
          trackMouseMovement: data.trackMouseMovement ?? true,
          trackActiveWindow: data.trackActiveWindow ?? true,
          trackScreenshots: data.trackScreenshots ?? true,
          idleTimeoutMin: data.idleTimeoutMin ?? 5,
          isEnabled: data.isEnabled ?? true,
        });
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  }, []);

  // ---- Effects ----

  useEffect(() => {
    fetchUsers();
    // Auto-refresh every 30 seconds
    refreshIntervalRef.current = setInterval(fetchUsers, 30000);
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [fetchUsers]);

  useEffect(() => {
    if (activeTab === "activity" && selectedUserId) fetchActivity();
  }, [activeTab, selectedUserId, fetchActivity]);

  useEffect(() => {
    if (activeTab === "screenshots" && selectedUserId)
      fetchScreenshots(1, true);
  }, [activeTab, selectedUserId, fetchScreenshots]);

  useEffect(() => {
    if (activeTab === "settings") fetchSettings(settingsUserId);
  }, [activeTab, settingsUserId, fetchSettings]);

  // ---- Handlers ----

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setActiveTab("activity");
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const url =
        settingsUserId === "global"
          ? "/api/admin/monitoring/settings"
          : `/api/admin/monitoring/settings/${settingsUserId}`;
      await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
    setIsSavingSettings(false);
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const params = new URLSearchParams({
        from: reportFrom,
        to: reportTo,
        format: reportFormat,
      });
      if (reportUserId !== "all") params.set("userId", reportUserId);

      const res = await fetch(`/api/admin/monitoring/reports?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `monitoring-report-${reportFrom}-to-${reportTo}.${reportFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
    }
    setIsGeneratingReport(false);
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);
  const tabs = ["live", "activity", "screenshots", "settings", "reports"] as const;
  const tabLabels = {
    live: "Live Status",
    activity: "Activity",
    screenshots: "Screenshots",
    settings: "Settings",
    reports: "Reports",
  };
  const tabIcons = {
    live: Users,
    activity: Activity,
    screenshots: Camera,
    settings: Settings,
    reports: Download,
  };

  // ---- Activity Bar Chart ----

  const maxActivity = activityStats?.hourlyActivity
    ? Math.max(
        ...activityStats.hourlyActivity.map((h) => h.keystrokes + h.clicks),
        1
      )
    : 1;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            {selectedUserId && activeTab !== "live" && activeTab !== "settings" && activeTab !== "reports" && (
              <button
                onClick={() => {
                  setSelectedUserId(null);
                  setActiveTab("live");
                }}
                className="p-1.5 rounded-[var(--arc-radius-sm)] hover:bg-[var(--arc-bg-hover)] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 text-[var(--arc-text-secondary)]" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-semibold">Employee Monitoring</h1>
              {selectedUser && (activeTab === "activity" || activeTab === "screenshots") && (
                <p className="text-sm text-[var(--arc-text-secondary)] mt-0.5">
                  {selectedUser.name || selectedUser.email}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchUsers}
            disabled={isLoadingUsers}
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoadingUsers ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
        <p className="text-[var(--arc-text-secondary)] text-sm mb-8">
          Monitor employee activity, screenshots, and productivity
        </p>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-[var(--arc-border-subtle)] overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tabIcons[tab];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab
                    ? "text-[var(--arc-crimson-400)] border-b-2 border-[var(--arc-crimson-500)]"
                    : "text-[var(--arc-text-secondary)] hover:text-[var(--arc-text-primary)]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tabLabels[tab]}
              </button>
            );
          })}
        </div>

        {/* ==================== LIVE STATUS TAB ==================== */}
        {activeTab === "live" && (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--arc-border-default)]">
                  {[
                    "User",
                    "Status",
                    "Machine",
                    "Last Activity",
                    "Keystrokes",
                    "Clicks",
                    "Screenshots",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[var(--arc-text-secondary)] font-medium bg-[var(--arc-bg-secondary)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-[var(--arc-text-tertiary)]"
                    >
                      No monitored users found
                    </td>
                  </tr>
                )}
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[var(--arc-border-subtle)] hover:bg-[var(--arc-bg-hover)] transition-colors cursor-pointer"
                    onClick={() => handleSelectUser(user.id)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">
                          {user.name || "Unnamed"}
                        </p>
                        <p className="text-xs text-[var(--arc-text-tertiary)]">
                          {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3 text-[var(--arc-text-secondary)]">
                      {user.hostname || "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--arc-text-secondary)]">
                      {user.lastHeartbeat
                        ? new Date(user.lastHeartbeat).toLocaleTimeString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1">
                        <Keyboard className="w-3.5 h-3.5 text-[var(--arc-text-tertiary)]" />
                        {user.todayKeystrokes.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1">
                        <MousePointer className="w-3.5 h-3.5 text-[var(--arc-text-tertiary)]" />
                        {user.todayClicks.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-[var(--arc-text-tertiary)]" />
                        {user.screenshotCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Eye className="w-4 h-4 text-[var(--arc-text-tertiary)] hover:text-[var(--arc-crimson-400)] transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* ==================== ACTIVITY TAB ==================== */}
        {activeTab === "activity" && (
          <div className="space-y-6">
            {!selectedUserId ? (
              <Card className="p-12 text-center">
                <Activity className="w-10 h-10 text-[var(--arc-text-tertiary)] mx-auto mb-3" />
                <p className="text-[var(--arc-text-secondary)]">
                  Select a user from the Live Status tab to view activity
                </p>
              </Card>
            ) : (
              <>
                {/* Date Range */}
                <div className="flex items-center gap-3">
                  <Input
                    type="date"
                    value={activityFrom}
                    onChange={(e) => setActivityFrom(e.target.value)}
                    className="w-40"
                  />
                  <span className="text-[var(--arc-text-tertiary)]">to</span>
                  <Input
                    type="date"
                    value={activityTo}
                    onChange={(e) => setActivityTo(e.target.value)}
                    className="w-40"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={fetchActivity}
                    disabled={isLoadingActivity}
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isLoadingActivity ? "animate-spin" : ""}`}
                    />
                    Load
                  </Button>
                </div>

                {/* Summary Cards */}
                {activityStats && (
                  <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    {[
                      {
                        label: "Keystrokes",
                        value: activityStats.totalKeystrokes.toLocaleString(),
                        icon: Keyboard,
                      },
                      {
                        label: "Clicks",
                        value: activityStats.totalClicks.toLocaleString(),
                        icon: MousePointer,
                      },
                      {
                        label: "Mouse Distance",
                        value: `${(activityStats.totalMouseDistance / 1000).toFixed(1)}k px`,
                        icon: TrendingUp,
                      },
                      {
                        label: "Active Time",
                        value: `${Math.floor(activityStats.activeTimeMinutes / 60)}h ${activityStats.activeTimeMinutes % 60}m`,
                        icon: Zap,
                      },
                      {
                        label: "Idle Time",
                        value: `${Math.floor(activityStats.idleTimeMinutes / 60)}h ${activityStats.idleTimeMinutes % 60}m`,
                        icon: Clock,
                      },
                      {
                        label: "Top App",
                        value: activityStats.topApps[0]?.name || "—",
                        icon: AppWindow,
                      },
                    ].map((stat) => (
                      <Card key={stat.label} className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-[var(--arc-radius-sm)] bg-[var(--arc-crimson-900)] flex items-center justify-center">
                            <stat.icon className="w-4 h-4 text-[var(--arc-crimson-400)]" />
                          </div>
                        </div>
                        <p className="text-lg font-semibold">{stat.value}</p>
                        <p className="text-xs text-[var(--arc-text-tertiary)]">
                          {stat.label}
                        </p>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Hourly Activity Chart */}
                {activityStats?.hourlyActivity &&
                  activityStats.hourlyActivity.length > 0 && (
                    <Card className="p-6">
                      <h3 className="text-sm font-medium text-[var(--arc-text-secondary)] mb-4">
                        Hourly Activity
                      </h3>
                      <div className="h-40 flex items-end gap-1">
                        {activityStats.hourlyActivity.map((h) => {
                          const total = h.keystrokes + h.clicks;
                          const pct = (total / maxActivity) * 100;
                          return (
                            <div
                              key={h.hour}
                              className="flex-1 flex flex-col items-center gap-1"
                            >
                              <div
                                className="w-full bg-[var(--arc-crimson-500)] rounded-t-sm transition-all min-h-[2px]"
                                style={{ height: `${Math.max(pct, 1)}%` }}
                                title={`${h.hour}:00 - ${total} events`}
                              />
                              <span className="text-[10px] text-[var(--arc-text-tertiary)]">
                                {h.hour}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  )}

                {/* Activity Log Table */}
                <Card className="overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--arc-border-default)] bg-[var(--arc-bg-secondary)]">
                    <h3 className="text-sm font-medium">Activity Log</h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--arc-border-default)]">
                        {[
                          "Time Period",
                          "Keystrokes",
                          "Clicks",
                          "Active Window",
                          "Status",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-2.5 text-[var(--arc-text-secondary)] font-medium text-xs"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activityLogs.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center text-[var(--arc-text-tertiary)]"
                          >
                            {isLoadingActivity
                              ? "Loading..."
                              : "No activity logs for this period"}
                          </td>
                        </tr>
                      )}
                      {activityLogs.map((log) => (
                        <tr
                          key={log.id}
                          className="border-b border-[var(--arc-border-subtle)] hover:bg-[var(--arc-bg-hover)] transition-colors"
                        >
                          <td className="px-4 py-2.5 text-[var(--arc-text-secondary)]">
                            {new Date(log.periodStart).toLocaleTimeString()} -{" "}
                            {new Date(log.periodEnd).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-2.5">{log.keystrokes}</td>
                          <td className="px-4 py-2.5">{log.mouseClicks}</td>
                          <td className="px-4 py-2.5 text-[var(--arc-text-secondary)] max-w-[200px] truncate">
                            {log.activeWindowTitle || "—"}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                log.isIdle
                                  ? "bg-yellow-900/30 text-yellow-400"
                                  : "bg-green-900/30 text-green-400"
                              }`}
                            >
                              {log.isIdle ? "Idle" : "Active"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </>
            )}
          </div>
        )}

        {/* ==================== SCREENSHOTS TAB ==================== */}
        {activeTab === "screenshots" && (
          <div className="space-y-6">
            {!selectedUserId ? (
              <Card className="p-12 text-center">
                <Camera className="w-10 h-10 text-[var(--arc-text-tertiary)] mx-auto mb-3" />
                <p className="text-[var(--arc-text-secondary)]">
                  Select a user from the Live Status tab to view screenshots
                </p>
              </Card>
            ) : (
              <>
                {/* Date Filter */}
                <div className="flex items-center gap-3">
                  <Input
                    type="date"
                    value={screenshotFrom}
                    onChange={(e) => setScreenshotFrom(e.target.value)}
                    className="w-40"
                  />
                  <span className="text-[var(--arc-text-tertiary)]">to</span>
                  <Input
                    type="date"
                    value={screenshotTo}
                    onChange={(e) => setScreenshotTo(e.target.value)}
                    className="w-40"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fetchScreenshots(1, true)}
                    disabled={isLoadingScreenshots}
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isLoadingScreenshots ? "animate-spin" : ""}`}
                    />
                    Load
                  </Button>
                </div>

                {/* Screenshots Grid */}
                {screenshots.length === 0 && !isLoadingScreenshots && (
                  <Card className="p-12 text-center">
                    <p className="text-[var(--arc-text-tertiary)]">
                      No screenshots for this period
                    </p>
                  </Card>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {screenshots.map((ss) => (
                    <div
                      key={ss.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedScreenshot(ss)}
                    >
                      <Card className="overflow-hidden hover:border-[var(--arc-crimson-500)] transition-colors">
                        <div className="aspect-video bg-[var(--arc-bg-primary)] relative">
                          <img
                            src={ss.filePath}
                            alt={ss.activeWindowTitle || "Screenshot"}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-3">
                            <Eye className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-[var(--arc-text-secondary)]">
                            {new Date(ss.capturedAt).toLocaleString()}
                          </p>
                          {ss.activeWindowTitle && (
                            <p className="text-xs text-[var(--arc-text-tertiary)] mt-1 truncate">
                              {ss.activeWindowTitle}
                            </p>
                          )}
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>

                {hasMoreScreenshots && screenshots.length > 0 && (
                  <div className="text-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        fetchScreenshots(screenshotPage + 1, false)
                      }
                      disabled={isLoadingScreenshots}
                    >
                      {isLoadingScreenshots ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ==================== SETTINGS TAB ==================== */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">
                Monitoring Configuration
              </h2>

              {/* Scope selector */}
              <div className="mb-6">
                <label className="block text-sm text-[var(--arc-text-secondary)] mb-1.5">
                  Configuration Scope
                </label>
                <select
                  value={settingsUserId}
                  onChange={(e) => setSettingsUserId(e.target.value)}
                  className="w-full max-w-xs h-10 px-3 bg-[var(--arc-bg-tertiary)] border border-[var(--arc-border-default)] rounded-[var(--arc-radius-sm)] text-[var(--arc-text-primary)] text-sm"
                >
                  <option value="global">Global (All Users)</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email} (Per-user override)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-5">
                {/* Screenshot Interval */}
                <div>
                  <label className="block text-sm text-[var(--arc-text-secondary)] mb-1.5">
                    Screenshot Interval
                  </label>
                  <select
                    value={settings.screenshotIntervalMin}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        screenshotIntervalMin: parseInt(e.target.value),
                      })
                    }
                    className="w-full max-w-xs h-10 px-3 bg-[var(--arc-bg-tertiary)] border border-[var(--arc-border-default)] rounded-[var(--arc-radius-sm)] text-[var(--arc-text-primary)] text-sm"
                  >
                    <option value={1}>Every 1 minute</option>
                    <option value={5}>Every 5 minutes</option>
                    <option value={10}>Every 10 minutes</option>
                    <option value={15}>Every 15 minutes</option>
                    <option value={30}>Every 30 minutes</option>
                  </select>
                </div>

                {/* Idle Timeout */}
                <div>
                  <label className="block text-sm text-[var(--arc-text-secondary)] mb-1.5">
                    Idle Timeout (minutes)
                  </label>
                  <Input
                    type="number"
                    value={settings.idleTimeoutMin}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        idleTimeoutMin: parseInt(e.target.value) || 5,
                      })
                    }
                    min={1}
                    max={60}
                    className="max-w-xs"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-4 pt-2">
                  {(
                    [
                      {
                        key: "isEnabled" as const,
                        label: "Monitoring Enabled",
                        desc: "Master switch for all monitoring",
                      },
                      {
                        key: "trackMouseClicks" as const,
                        label: "Track Mouse Clicks",
                        desc: "Count mouse click events",
                      },
                      {
                        key: "trackKeystrokes" as const,
                        label: "Track Keystrokes",
                        desc: "Count keystroke events (not content)",
                      },
                      {
                        key: "trackMouseMovement" as const,
                        label: "Track Mouse Movement",
                        desc: "Track mouse distance traveled",
                      },
                      {
                        key: "trackActiveWindow" as const,
                        label: "Track Active Window",
                        desc: "Record active application name and window title",
                      },
                      {
                        key: "trackScreenshots" as const,
                        label: "Track Screenshots",
                        desc: "Capture periodic screenshots",
                      },
                    ] as const
                  ).map((toggle) => (
                    <div
                      key={toggle.key}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <p className="text-sm font-medium">{toggle.label}</p>
                        <p className="text-xs text-[var(--arc-text-tertiary)]">
                          {toggle.desc}
                        </p>
                      </div>
                      <Toggle
                        checked={settings[toggle.key]}
                        onChange={(val) =>
                          setSettings({ ...settings, [toggle.key]: val })
                        }
                      />
                    </div>
                  ))}
                </div>

                <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
                  <Settings className="w-4 h-4" />
                  {isSavingSettings ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ==================== REPORTS TAB ==================== */}
        {activeTab === "reports" && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Generate Report</h2>
            <div className="space-y-5">
              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div>
                  <label className="block text-sm text-[var(--arc-text-secondary)] mb-1.5">
                    From
                  </label>
                  <Input
                    type="date"
                    value={reportFrom}
                    onChange={(e) => setReportFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--arc-text-secondary)] mb-1.5">
                    To
                  </label>
                  <Input
                    type="date"
                    value={reportTo}
                    onChange={(e) => setReportTo(e.target.value)}
                  />
                </div>
              </div>

              {/* User */}
              <div>
                <label className="block text-sm text-[var(--arc-text-secondary)] mb-1.5">
                  User
                </label>
                <select
                  value={reportUserId}
                  onChange={(e) => setReportUserId(e.target.value)}
                  className="w-full max-w-xs h-10 px-3 bg-[var(--arc-bg-tertiary)] border border-[var(--arc-border-default)] rounded-[var(--arc-radius-sm)] text-[var(--arc-text-primary)] text-sm"
                >
                  <option value="all">All Users</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm text-[var(--arc-text-secondary)] mb-1.5">
                  Format
                </label>
                <div className="flex gap-3">
                  {(["csv", "json"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setReportFormat(fmt)}
                      className={`px-4 py-2 text-sm rounded-[var(--arc-radius-sm)] border transition-colors cursor-pointer ${
                        reportFormat === fmt
                          ? "border-[var(--arc-crimson-500)] bg-[var(--arc-crimson-900)] text-[var(--arc-crimson-400)]"
                          : "border-[var(--arc-border-default)] text-[var(--arc-text-secondary)] hover:bg-[var(--arc-bg-hover)]"
                      }`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
              >
                <Download className="w-4 h-4" />
                {isGeneratingReport ? "Generating..." : "Generate & Download"}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <ScreenshotModal
          screenshot={selectedScreenshot}
          onClose={() => setSelectedScreenshot(null)}
        />
      )}
    </div>
  );
}
