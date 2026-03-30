export interface ActivityData {
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

export interface MonitoringConfig {
  screenshotIntervalMin: number;
  trackMouseClicks: boolean;
  trackKeystrokes: boolean;
  trackMouseMovement: boolean;
  trackActiveWindow: boolean;
  trackScreenshots: boolean;
  idleTimeoutMin: number;
  isEnabled: boolean;
}

export interface HeartbeatResponse {
  sessionId: string;
  config: MonitoringConfig;
}

export interface AgentConfig {
  serverUrl: string;
  authToken: string;
  userId: string;
  screenshotIntervalMin: number;
  trackMouseClicks: boolean;
  trackKeystrokes: boolean;
  trackMouseMovement: boolean;
  trackActiveWindow: boolean;
  trackScreenshots: boolean;
  idleTimeoutMin: number;
  isEnabled: boolean;
}
