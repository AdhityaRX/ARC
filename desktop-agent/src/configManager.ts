import Store from 'electron-store';
import { BrowserWindow } from 'electron';
import { AgentConfig } from './types';

const CONFIG_DEFAULTS: AgentConfig = {
  serverUrl: '',
  authToken: '',
  userId: '',
  screenshotIntervalMin: 5,
  trackMouseClicks: true,
  trackKeystrokes: true,
  trackMouseMovement: true,
  trackActiveWindow: true,
  trackScreenshots: true,
  idleTimeoutMin: 5,
  isEnabled: true,
};

export class ConfigManager {
  private store: Store<AgentConfig>;

  constructor() {
    this.store = new Store<AgentConfig>({
      name: 'arc-monitor-config',
      defaults: CONFIG_DEFAULTS,
    });
  }

  getConfig(): AgentConfig {
    return {
      serverUrl: this.store.get('serverUrl', CONFIG_DEFAULTS.serverUrl),
      authToken: this.store.get('authToken', CONFIG_DEFAULTS.authToken),
      userId: this.store.get('userId', CONFIG_DEFAULTS.userId),
      screenshotIntervalMin: this.store.get('screenshotIntervalMin', CONFIG_DEFAULTS.screenshotIntervalMin),
      trackMouseClicks: this.store.get('trackMouseClicks', CONFIG_DEFAULTS.trackMouseClicks),
      trackKeystrokes: this.store.get('trackKeystrokes', CONFIG_DEFAULTS.trackKeystrokes),
      trackMouseMovement: this.store.get('trackMouseMovement', CONFIG_DEFAULTS.trackMouseMovement),
      trackActiveWindow: this.store.get('trackActiveWindow', CONFIG_DEFAULTS.trackActiveWindow),
      trackScreenshots: this.store.get('trackScreenshots', CONFIG_DEFAULTS.trackScreenshots),
      idleTimeoutMin: this.store.get('idleTimeoutMin', CONFIG_DEFAULTS.idleTimeoutMin),
      isEnabled: this.store.get('isEnabled', CONFIG_DEFAULTS.isEnabled),
    };
  }

  updateConfig(partial: Partial<AgentConfig>): void {
    for (const [key, value] of Object.entries(partial)) {
      if (value !== undefined) {
        this.store.set(key as keyof AgentConfig, value as AgentConfig[keyof AgentConfig]);
      }
    }
  }

  isConfigured(): boolean {
    const config = this.getConfig();
    return config.serverUrl.length > 0 && config.authToken.length > 0;
  }

  showSetupDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      const setupWindow = new BrowserWindow({
        width: 480,
        height: 420,
        resizable: false,
        minimizable: false,
        maximizable: false,
        alwaysOnTop: true,
        title: 'ARC Monitor - Setup',
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      setupWindow.setMenuBarVisibility(false);

      const currentConfig = this.getConfig();

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #1a1a2e; color: #e0e0e0; padding: 32px;
    }
    h1 { font-size: 20px; margin-bottom: 8px; color: #fff; }
    p.subtitle { font-size: 13px; color: #999; margin-bottom: 24px; }
    label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #ccc; }
    input {
      width: 100%; padding: 10px 12px; border: 1px solid #333; border-radius: 6px;
      background: #0f0f23; color: #e0e0e0; font-size: 14px; margin-bottom: 16px;
      outline: none; transition: border-color 0.2s;
    }
    input:focus { border-color: #DC2626; }
    .btn {
      width: 100%; padding: 12px; border: none; border-radius: 6px;
      background: #DC2626; color: #fff; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: background 0.2s;
    }
    .btn:hover { background: #b91c1c; }
    .btn:disabled { background: #555; cursor: not-allowed; }
    .error { color: #f87171; font-size: 12px; margin-bottom: 12px; display: none; }
  </style>
</head>
<body>
  <h1>ARC Monitor Setup</h1>
  <p class="subtitle">Enter your ARC server details to begin monitoring.</p>
  <label for="serverUrl">Server URL</label>
  <input type="url" id="serverUrl" placeholder="https://arc.yourcompany.com" value="${currentConfig.serverUrl}" />
  <label for="authToken">Authentication Token</label>
  <input type="password" id="authToken" placeholder="Paste your auth token" value="${currentConfig.authToken}" />
  <label for="userId">User / Employee ID</label>
  <input type="text" id="userId" placeholder="employee@company.com" value="${currentConfig.userId}" />
  <p class="error" id="error">Please fill in all fields with valid values.</p>
  <button class="btn" id="saveBtn" onclick="save()">Save &amp; Start Monitoring</button>
  <script>
    function save() {
      const serverUrl = document.getElementById('serverUrl').value.trim();
      const authToken = document.getElementById('authToken').value.trim();
      const userId = document.getElementById('userId').value.trim();
      const errorEl = document.getElementById('error');
      if (!serverUrl || !authToken) {
        errorEl.style.display = 'block';
        errorEl.textContent = 'Server URL and Auth Token are required.';
        return;
      }
      try { new URL(serverUrl); } catch {
        errorEl.style.display = 'block';
        errorEl.textContent = 'Please enter a valid URL.';
        return;
      }
      errorEl.style.display = 'none';
      document.getElementById('saveBtn').disabled = true;
      document.getElementById('saveBtn').textContent = 'Saving...';
      // Post config back via document title protocol
      document.title = 'ARC_SAVE:' + JSON.stringify({ serverUrl, authToken, userId });
    }
  </script>
</body>
</html>`;

      setupWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

      // Watch for title change as a message channel
      const titleCheckInterval = setInterval(() => {
        try {
          const title = setupWindow.getTitle();
          if (title.startsWith('ARC_SAVE:')) {
            clearInterval(titleCheckInterval);
            const data = JSON.parse(title.replace('ARC_SAVE:', ''));
            this.updateConfig({
              serverUrl: data.serverUrl,
              authToken: data.authToken,
              userId: data.userId || '',
            });
            setupWindow.close();
            resolve(true);
          }
        } catch {
          // Window may be destroyed
        }
      }, 200);

      setupWindow.on('closed', () => {
        clearInterval(titleCheckInterval);
        resolve(this.isConfigured());
      });
    });
  }
}
