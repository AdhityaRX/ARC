import {
  app,
  Tray,
  Menu,
  nativeImage,
  Notification,
  dialog,
  shell,
} from 'electron';
import path from 'path';
import { ActivityTracker } from './activityTracker';
import { ScreenshotCapture } from './screenshotCapture';
import { ApiClient } from './apiClient';
import { ConfigManager } from './configManager';

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

let tray: Tray | null = null;
let activityTracker: ActivityTracker | null = null;
let screenshotCapture: ScreenshotCapture | null = null;
let apiClient: ApiClient | null = null;
let configManager: ConfigManager | null = null;
let isShuttingDown = false;

function getTrayIconPath(): string {
  // In production, assets are relative to the app root
  // In dev, they are relative to the project root
  const iconPath = path.join(
    app.isPackaged ? process.resourcesPath : path.join(__dirname, '..'),
    'assets',
    'icon.ico'
  );
  return iconPath;
}

function createTrayIcon(): nativeImage {
  const iconPath = getTrayIconPath();
  try {
    const icon = nativeImage.createFromPath(iconPath);
    if (!icon.isEmpty()) {
      return icon.resize({ width: 16, height: 16 });
    }
  } catch {
    // Fall through to default icon
  }

  // Create a simple default 16x16 red circle icon if no icon file exists
  const size = 16;
  const canvas = Buffer.alloc(size * size * 4);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = 6;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const offset = (y * size + x) * 4;
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        canvas[offset] = 0xdc;     // R (crimson)
        canvas[offset + 1] = 0x26; // G
        canvas[offset + 2] = 0x26; // B
        canvas[offset + 3] = 0xff; // A
      } else {
        canvas[offset] = 0x00;
        canvas[offset + 1] = 0x00;
        canvas[offset + 2] = 0x00;
        canvas[offset + 3] = 0x00;
      }
    }
  }

  return nativeImage.createFromBuffer(canvas, { width: size, height: size });
}

function buildTrayMenu(): Menu {
  const config = configManager?.getConfig();
  const serverUrl = config?.serverUrl || 'http://localhost:3000';

  return Menu.buildFromTemplate([
    {
      label: 'Status: Monitoring Active',
      enabled: false,
      icon: undefined,
    },
    {
      label: 'View Dashboard',
      click: () => {
        shell.openExternal(`${serverUrl}/dashboard`).catch((err) => {
          console.error('[Main] Failed to open dashboard:', err);
        });
      },
    },
    { type: 'separator' },
    {
      label: 'About ARC Monitor',
      click: () => {
        dialog.showMessageBox({
          type: 'info',
          title: 'About ARC Monitor',
          message: 'ARC Employee Monitoring Agent v1.0.0',
          detail:
            'This application monitors workplace activity as per company policy.\n\n' +
            'What is tracked:\n' +
            '  - Mouse movement distance (aggregate)\n' +
            '  - Keyboard activity count (NOT individual keys)\n' +
            '  - Active application/window names\n' +
            '  - Periodic screenshots\n' +
            '  - Idle/active status\n\n' +
            'All monitoring is transparent. Your employer has configured this tool ' +
            'in accordance with workplace monitoring policies.\n\n' +
            'For questions, contact your IT administrator.',
          buttons: ['OK'],
        });
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        gracefulShutdown();
      },
    },
  ]);
}

function showStartupNotification(): void {
  if (!Notification.isSupported()) return;

  const notification = new Notification({
    title: 'ARC Monitoring Active',
    body:
      'Your activity is being monitored as per company policy. ' +
      'Click the system tray icon for details.',
    silent: false,
  });

  notification.show();
}

async function initializeMonitoring(): Promise<void> {
  configManager = new ConfigManager();

  // Show setup dialog if not configured
  if (!configManager.isConfigured()) {
    const configured = await configManager.showSetupDialog();
    if (!configured) {
      console.log('[Main] Setup cancelled, exiting');
      app.quit();
      return;
    }
  }

  apiClient = new ApiClient(configManager);
  activityTracker = new ActivityTracker(apiClient, configManager);
  screenshotCapture = new ScreenshotCapture(apiClient, configManager);

  // Create system tray
  const icon = createTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip('ARC Monitor - Active');
  tray.setContextMenu(buildTrayMenu());

  // Show notification
  showStartupNotification();

  // Start tracking modules
  await activityTracker.start();
  await screenshotCapture.start();

  console.log('[Main] ARC Monitor initialized and running');
}

async function gracefulShutdown(): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log('[Main] Shutting down gracefully...');

  try {
    // Stop trackers
    if (activityTracker) {
      await activityTracker.forceFlush();
      activityTracker.stop();
    }

    if (screenshotCapture) {
      screenshotCapture.stop();
    }

    // Notify server of session end
    if (apiClient) {
      await apiClient.endSession();
    }
  } catch (error) {
    console.error('[Main] Error during shutdown:', error);
  }

  // Destroy tray
  if (tray) {
    tray.destroy();
    tray = null;
  }

  app.quit();
}

// ---- App Lifecycle ----

app.on('ready', async () => {
  // Don't show in dock on macOS (tray-only app)
  if (process.platform === 'darwin') {
    app.dock?.hide();
  }

  try {
    await initializeMonitoring();
  } catch (error) {
    console.error('[Main] Failed to initialize:', error);
    dialog.showErrorBox(
      'ARC Monitor Error',
      `Failed to start monitoring: ${error instanceof Error ? error.message : String(error)}`
    );
    app.quit();
  }
});

// Handle second instance attempt
app.on('second-instance', () => {
  // Show a notification that the app is already running
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: 'ARC Monitor',
      body: 'ARC Monitor is already running. Check the system tray.',
      silent: true,
    });
    notification.show();
  }
});

app.on('before-quit', async (event) => {
  if (!isShuttingDown) {
    event.preventDefault();
    await gracefulShutdown();
  }
});

// Prevent the app from quitting when all windows are closed (tray-only app)
app.on('window-all-closed', () => {
  // Do nothing - this is a tray-only app, don't quit when windows close
});

// Handle uncaught errors gracefully
process.on('uncaughtException', (error) => {
  console.error('[Main] Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Main] Unhandled rejection:', reason);
});
