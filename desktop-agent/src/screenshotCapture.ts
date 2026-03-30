import path from 'path';
import os from 'os';
import fs from 'fs';
import { ApiClient } from './apiClient';
import { ConfigManager } from './configManager';

export class ScreenshotCapture {
  private captureInterval: NodeJS.Timeout | null = null;
  private screenshotModule: typeof import('screenshot-desktop') | null = null;
  private activeWinModule: typeof import('active-win') | null = null;
  private tempDir: string;
  private running = false;

  constructor(
    private apiClient: ApiClient,
    private configManager: ConfigManager
  ) {
    this.tempDir = path.join(os.tmpdir(), 'arc-monitor-screenshots');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    // Dynamically import ESM modules
    try {
      this.screenshotModule = await import('screenshot-desktop');
    } catch (error) {
      console.error('[ScreenshotCapture] screenshot-desktop not available:', error);
      return;
    }

    try {
      this.activeWinModule = await import('active-win');
    } catch (error) {
      console.warn('[ScreenshotCapture] active-win not available:', error);
    }

    const config = this.configManager.getConfig();
    if (!config.trackScreenshots) {
      console.log('[ScreenshotCapture] Screenshots disabled by config');
      return;
    }

    this.scheduleCapture(config.screenshotIntervalMin);
    console.log(`[ScreenshotCapture] Started with ${config.screenshotIntervalMin} min interval`);
  }

  stop(): void {
    this.running = false;
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }
    this.cleanupTempDir();
    console.log('[ScreenshotCapture] Stopped');
  }

  updateInterval(minutes: number): void {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }
    if (this.running && minutes > 0) {
      this.scheduleCapture(minutes);
      console.log(`[ScreenshotCapture] Interval updated to ${minutes} min`);
    }
  }

  private scheduleCapture(intervalMinutes: number): void {
    const intervalMs = intervalMinutes * 60 * 1000;

    // Capture immediately on start
    this.capture().catch((error) => {
      console.error('[ScreenshotCapture] Initial capture failed:', error);
    });

    this.captureInterval = setInterval(() => {
      if (!this.running) return;

      const config = this.configManager.getConfig();
      if (!config.isEnabled || !config.trackScreenshots) return;

      this.capture().catch((error) => {
        console.error('[ScreenshotCapture] Capture failed:', error);
      });
    }, intervalMs);
  }

  private async capture(): Promise<void> {
    if (!this.screenshotModule) {
      console.warn('[ScreenshotCapture] Screenshot module not loaded');
      return;
    }

    const config = this.configManager.getConfig();
    if (!config.isEnabled || !config.trackScreenshots) return;

    const filename = `screenshot-${Date.now()}.png`;
    const filepath = path.join(this.tempDir, filename);

    try {
      // Capture screenshot
      const screenshotFn =
        (this.screenshotModule as { default?: Function }).default || this.screenshotModule;
      await (screenshotFn as Function)({ filename: filepath, format: 'png' });

      // Get active window title for metadata
      const activeWindowTitle = await this.getActiveWindowTitle();

      // Upload to server
      const success = await this.apiClient.uploadScreenshot(filepath, activeWindowTitle);

      if (success) {
        console.log('[ScreenshotCapture] Screenshot captured and uploaded');
      } else {
        console.warn('[ScreenshotCapture] Screenshot upload failed');
      }
    } catch (error) {
      console.error('[ScreenshotCapture] Capture error:', error);
    } finally {
      // Clean up temp file
      this.safeDeleteFile(filepath);
    }
  }

  private async getActiveWindowTitle(): Promise<string> {
    if (!this.activeWinModule) return 'Unknown';

    try {
      const activeWinFn =
        (this.activeWinModule as { default?: Function }).default || this.activeWinModule;
      const win = await (activeWinFn as Function)();
      if (win) {
        const title = (win as { title?: string }).title || '';
        const app = (win as { owner?: { name?: string } }).owner?.name || '';
        return title ? `${app} - ${title}` : app || 'Unknown';
      }
    } catch {
      // Best-effort
    }

    return 'Unknown';
  }

  private safeDeleteFile(filepath: string): void {
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch (error) {
      console.warn('[ScreenshotCapture] Failed to delete temp file:', filepath, error);
    }
  }

  private cleanupTempDir(): void {
    try {
      if (fs.existsSync(this.tempDir)) {
        const files = fs.readdirSync(this.tempDir);
        for (const file of files) {
          this.safeDeleteFile(path.join(this.tempDir, file));
        }
      }
    } catch (error) {
      console.warn('[ScreenshotCapture] Failed to cleanup temp dir:', error);
    }
  }
}
