const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const { updatePresence, clearPresence, connectRpc } = require('./rpc');
const { enableAdBlocking, AD_HIDING_CSS } = require('./adblock');

let mainWindow;

// Electron ships with Chromium's hardware media key handling off, so headphone
// buttons / keyboard play-pause keys never reach the page's Media Session.
// Must be set before the app is ready.
app.commandLine.appendSwitch('enable-features', 'HardwareMediaKeyHandling,MediaSessionService');

function createWindow() {
  const scSession = session.fromPartition('persist:soundcloud');
  // Electron's default UA carries "Electron/x" and the app name tokens, which
  // anti-bot systems read as an automated client and answer with slider
  // challenges (e.g. when adding a track to a playlist). Report as plain Chromium.
  const cleanUA = scSession.getUserAgent()
    .replace(/\s(Electron|soundcloud)\/\S+/gi, '');
  scSession.setUserAgent(cleanUA);
  enableAdBlocking(scSession, { debug: !!process.env.SC_DEBUG_NET });

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      partition: 'persist:soundcloud'
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.insertCSS(AD_HIDING_CSS);
  });

  mainWindow.webContents.setUserAgent(cleanUA);
  mainWindow.loadURL('https://soundcloud.com');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  connectRpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  clearPresence();
  if (process.platform !== 'darwin') app.quit();
});

// Receives now-playing updates pushed from the preload script running
// inside the SoundCloud page (title, artist, artwork, progress, playing state).
ipcMain.on('now-playing', (_event, payload) => {
  updatePresence(payload);
});

ipcMain.on('now-playing-cleared', () => {
  clearPresence();
});
