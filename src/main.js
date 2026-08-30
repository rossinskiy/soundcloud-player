const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const { updatePresence, clearPresence, connectRpc } = require('./rpc');
const { enableAdBlocking, AD_HIDING_CSS } = require('./adblock');

let mainWindow;

function createWindow() {
  const scSession = session.fromPartition('persist:soundcloud');
  enableAdBlocking(scSession);

  if (process.env.SC_DEBUG_NET) {
    scSession.webRequest.onBeforeRequest((details, callback) => {
      if (/ad|sponsor|promo|interstitial|adswizz|dax/i.test(details.url)) {
        console.log('[net]', details.url);
      }
      callback({});
    });
  }

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
