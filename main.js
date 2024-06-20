const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const { ipcMain } = require('electron');

// const { autoUpdater, AppUpdater } = require("electron-updater");
function getPath(file) {
  const path = require('path');
  return path.join(__dirname, 'model/', `${file}`);
}

// autoUpdater.autoDownload = false;
// autoUpdater.autoInstallOnAppQuit = true;

let mainWindow;
let pythonServer;


function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.join(__dirname, '/icon.ico'),
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: true,
    }

  });

  mainWindow.loadFile(path.join(__dirname, 'view/index.html'));
  mainWindow.webContents.openDevTools();  // Automatické otvorenie dev tools

  // Toto vám umožní pripojiť sa na tento port pre remote debugging
  // mainWindow.webContents.debugger.attach('1.3');
  // mainWindow.webContents.debugger.sendCommand('Network.enable');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {

  createWindow();
  try {
    console.log(getPath("ocr_server.py"));
    pythonServer = spawn('python3', ['./model/ocr_server.py']);
  } catch (e) {
    console.log("asdasdas\n" + e);
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
    // autoUpdater.checkForUpdates();

  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('quit', () => {
  // pythonServer.kill();
});


ipcMain.on('loadControllers', () => {
  mainWindow.webContents.send('settingUpControllers');
});

