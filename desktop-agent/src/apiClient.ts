import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import { ConfigManager } from './configManager';
import { ActivityData, HeartbeatResponse, MonitoringConfig } from './types';

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 2000;

export class ApiClient {
  private sessionId: string | null = null;

  constructor(private configManager: ConfigManager) {}

  getSessionId(): string | null {
    return this.sessionId;
  }

  async sendHeartbeat(): Promise<MonitoringConfig | null> {
    const config = this.configManager.getConfig();
    if (!config.serverUrl || !config.authToken) {
      return null;
    }

    try {
      const response = await this.requestWithRetry(
        `${config.serverUrl}/api/monitoring/heartbeat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.authToken}`,
          },
          body: JSON.stringify({
            userId: config.userId,
            agentVersion: '1.0.0',
            platform: process.platform,
            hostname: require('os').hostname(),
          }),
        }
      );

      if (!response) return null;

      const data = (await response.json()) as HeartbeatResponse;
      this.sessionId = data.sessionId;

      // Apply server-side config updates
      if (data.config) {
        this.configManager.updateConfig({
          screenshotIntervalMin: data.config.screenshotIntervalMin,
          trackMouseClicks: data.config.trackMouseClicks,
          trackKeystrokes: data.config.trackKeystrokes,
          trackMouseMovement: data.config.trackMouseMovement,
          trackActiveWindow: data.config.trackActiveWindow,
          trackScreenshots: data.config.trackScreenshots,
          idleTimeoutMin: data.config.idleTimeoutMin,
          isEnabled: data.config.isEnabled,
        });
        return data.config;
      }

      return null;
    } catch (error) {
      console.error('[ApiClient] Heartbeat failed:', error);
      return null;
    }
  }

  async sendActivity(data: ActivityData): Promise<boolean> {
    const config = this.configManager.getConfig();
    if (!config.serverUrl || !config.authToken) {
      return false;
    }

    try {
      const response = await this.requestWithRetry(
        `${config.serverUrl}/api/monitoring/activity`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.authToken}`,
          },
          body: JSON.stringify({
            sessionId: this.sessionId,
            userId: config.userId,
            ...data,
          }),
        }
      );

      return response !== null && response.ok;
    } catch (error) {
      console.error('[ApiClient] Failed to send activity:', error);
      return false;
    }
  }

  async uploadScreenshot(imagePath: string, activeWindowTitle: string): Promise<boolean> {
    const config = this.configManager.getConfig();
    if (!config.serverUrl || !config.authToken) {
      return false;
    }

    try {
      const form = new FormData();
      form.append('screenshot', fs.createReadStream(imagePath));
      form.append('sessionId', this.sessionId || '');
      form.append('userId', config.userId);
      form.append('activeWindowTitle', activeWindowTitle);
      form.append('capturedAt', new Date().toISOString());

      const response = await this.requestWithRetry(
        `${config.serverUrl}/api/monitoring/screenshot`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.authToken}`,
            ...form.getHeaders(),
          },
          body: form,
        }
      );

      return response !== null && response.ok;
    } catch (error) {
      console.error('[ApiClient] Failed to upload screenshot:', error);
      return false;
    }
  }

  async endSession(): Promise<void> {
    const config = this.configManager.getConfig();
    if (!config.serverUrl || !config.authToken || !this.sessionId) {
      return;
    }

    try {
      await fetch(`${config.serverUrl}/api/monitoring/session/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.authToken}`,
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          userId: config.userId,
          endedAt: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('[ApiClient] Failed to end session:', error);
    }
  }

  private async requestWithRetry(
    url: string,
    options: Record<string, unknown>,
    retries: number = MAX_RETRIES
  ): Promise<import('node-fetch').Response | null> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url, options as Parameters<typeof fetch>[1]);

        if (response.ok || response.status < 500) {
          return response;
        }

        // Server error - retry with backoff
        if (attempt < retries - 1) {
          const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
          console.warn(`[ApiClient] Request failed (${response.status}), retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      } catch (error) {
        if (attempt < retries - 1) {
          const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
          console.warn(`[ApiClient] Network error, retrying in ${delay}ms...`, error);
          await this.sleep(delay);
        } else {
          console.error('[ApiClient] All retries exhausted:', error);
        }
      }
    }

    return null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
