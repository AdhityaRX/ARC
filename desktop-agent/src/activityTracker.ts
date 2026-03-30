import { screen, powerMonitor } from 'electron';
import { ApiClient } from './apiClient';
import { ConfigManager } from './configManager';
import { ActivityData } from './types';

interface CursorPosition {
  x: number;
  y: number;
}

interface ActiveWindowInfo {
  title: string;
  app: string;
}

export class ActivityTracker {
  private mouseClicks = 0;
  private keystrokes = 0;
  private mouseDistance = 0;
  private scrollEvents = 0;
  private lastMousePos: CursorPosition = { x: 0, y: 0 };
  private lastActivityTime: number = Date.now();
  private isIdle = false;
  private periodStart: Date = new Date();
  private flushInterval: NodeJS.Timeout | null = null;
  private cursorPollInterval: NodeJS.Timeout | null = null;
  private idleCheckInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastIdleSeconds = 0;
  private currentActiveWindow: ActiveWindowInfo | null = null;
  private activeWinModule: typeof import('active-win') | null = null;
  private running = false;

  constructor(
    private apiClient: ApiClient,
    private configManager: ConfigManager
  ) {}

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    // Dynamically import active-win (ESM module)
    try {
      this.activeWinModule = await import('active-win');
    } catch (error) {
      console.warn('[ActivityTracker] active-win not available:', error);
    }

    // Initialize cursor position
    const cursorPoint = screen.getCursorScreenPoint();
    this.lastMousePos = { x: cursorPoint.x, y: cursorPoint.y };
    this.periodStart = new Date();
    this.lastActivityTime = Date.now();

    this.setupCursorPolling();
    this.setupIdleDetection();
    this.setupFlushInterval();
    this.setupHeartbeat();

    console.log('[ActivityTracker] Started');
  }

  stop(): void {
    this.running = false;

    if (this.cursorPollInterval) {
      clearInterval(this.cursorPollInterval);
      this.cursorPollInterval = null;
    }
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
      this.idleCheckInterval = null;
    }
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    console.log('[ActivityTracker] Stopped');
  }

  /**
   * Polls cursor position every 500ms to track mouse movement distance.
   * Also infers click-like events from position jumps and estimates
   * activity based on idle time changes.
   */
  private setupCursorPolling(): void {
    this.cursorPollInterval = setInterval(async () => {
      if (!this.running) return;

      const config = this.configManager.getConfig();
      if (!config.isEnabled) return;

      const cursorPoint = screen.getCursorScreenPoint();
      const currentPos: CursorPosition = { x: cursorPoint.x, y: cursorPoint.y };

      if (config.trackMouseMovement) {
        const dx = currentPos.x - this.lastMousePos.x;
        const dy = currentPos.y - this.lastMousePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          this.mouseDistance += distance;
          this.lastActivityTime = Date.now();
        }
      }

      this.lastMousePos = currentPos;

      // Track active window
      if (config.trackActiveWindow) {
        this.currentActiveWindow = await this.getActiveWindow();
      }
    }, 500);
  }

  /**
   * Uses Electron's powerMonitor.getSystemIdleTime() to detect idle state
   * and to infer keyboard/mouse activity from idle time resets.
   */
  private setupIdleDetection(): void {
    this.idleCheckInterval = setInterval(() => {
      if (!this.running) return;

      const config = this.configManager.getConfig();
      if (!config.isEnabled) return;

      const idleSeconds = powerMonitor.getSystemIdleTime();
      const idleThresholdSeconds = config.idleTimeoutMin * 60;

      // Detect transition from active to idle
      if (!this.isIdle && idleSeconds >= idleThresholdSeconds) {
        this.isIdle = true;
        console.log('[ActivityTracker] User is now idle');
      }

      // Detect transition from idle to active
      if (this.isIdle && idleSeconds < idleThresholdSeconds) {
        this.isIdle = false;
        this.lastActivityTime = Date.now();
        console.log('[ActivityTracker] User is now active');
      }

      // Infer input activity from idle time resets.
      // If the system idle time decreased since last check, the user
      // performed some input (keyboard or mouse).
      if (idleSeconds < this.lastIdleSeconds && this.lastIdleSeconds > 0) {
        // Idle time reset indicates user input occurred.
        // We attribute this as estimated keystroke/click activity.
        if (config.trackKeystrokes) {
          // Conservative estimate: each idle reset represents roughly
          // some keystrokes or clicks in the polling interval.
          this.keystrokes += 1;
        }
        if (config.trackMouseClicks) {
          this.mouseClicks += 1;
        }
      }

      this.lastIdleSeconds = idleSeconds;
    }, 1000);
  }

  /**
   * Flushes accumulated activity data to the server every 60 seconds.
   */
  private setupFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flush().catch((error) => {
        console.error('[ActivityTracker] Flush error:', error);
      });
    }, 60_000);
  }

  /**
   * Sends heartbeat to server every 30 seconds to maintain session
   * and receive config updates.
   */
  private setupHeartbeat(): void {
    // Send initial heartbeat
    this.apiClient.sendHeartbeat().catch((error) => {
      console.error('[ActivityTracker] Initial heartbeat failed:', error);
    });

    this.heartbeatInterval = setInterval(async () => {
      if (!this.running) return;

      const serverConfig = await this.apiClient.sendHeartbeat();
      if (serverConfig) {
        // Config is already applied inside apiClient.sendHeartbeat()
        if (!serverConfig.isEnabled) {
          console.log('[ActivityTracker] Monitoring disabled by server');
        }
      }
    }, 30_000);
  }

  /**
   * Sends accumulated activity data to the server and resets counters.
   */
  private async flush(): Promise<void> {
    const config = this.configManager.getConfig();
    if (!config.isEnabled || !config.serverUrl) return;

    const now = new Date();

    const data: ActivityData = {
      periodStart: this.periodStart.toISOString(),
      periodEnd: now.toISOString(),
      mouseClicks: this.mouseClicks,
      mouseDistance: Math.round(this.mouseDistance),
      keystrokes: this.keystrokes,
      scrollEvents: this.scrollEvents,
      activeWindowTitle: this.currentActiveWindow?.title ?? null,
      activeAppName: this.currentActiveWindow?.app ?? null,
      isIdle: this.isIdle,
    };

    // Reset counters
    this.mouseClicks = 0;
    this.keystrokes = 0;
    this.mouseDistance = 0;
    this.scrollEvents = 0;
    this.periodStart = now;

    const success = await this.apiClient.sendActivity(data);
    if (!success) {
      console.warn('[ActivityTracker] Failed to send activity data');
    }
  }

  /**
   * Gets the currently active window information.
   */
  private async getActiveWindow(): Promise<ActiveWindowInfo | null> {
    if (!this.activeWinModule) return null;

    try {
      const activeWinFn = (this.activeWinModule as { default?: Function }).default || this.activeWinModule;
      const win = await (activeWinFn as Function)();
      if (win) {
        return {
          title: (win as { title: string }).title || '',
          app: (win as { owner?: { name?: string } }).owner?.name || '',
        };
      }
    } catch (error) {
      // Silently fail - active window detection is best-effort
    }

    return null;
  }

  /**
   * Force flush remaining data (called during shutdown).
   */
  async forceFlush(): Promise<void> {
    await this.flush();
  }
}
