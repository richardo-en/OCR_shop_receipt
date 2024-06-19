const { app, BrowserWindow } = require('electron');
const { spawn, execFile } = require('child_process');
const path = require('path');
// const { autoUpdater, AppUpdater } = require("electron-updater");

// autoUpdater.autoDownload = false;
// autoUpdater.autoInstallOnAppQuit = true;

let mainWindow;
let pythonServer;

function getPath(file){
  const path = require('path');
  return path.join(__dirname, '../model/', `${file}`);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.join(__dirname, '/icon.ico'),
    width: 1920,
    height: 1080,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      nodeIntegration: true,
    }
    
  });
  
  mainWindow.loadFile('./view/index.html');
  // mainWindow.webContents.openDevTools();  // Automatické otvorenie dev tools
  
  // Toto vám umožní pripojiť sa na tento port pre remote debugging
  // mainWindow.webContents.debugger.attach('1.3');
  // mainWindow.webContents.debugger.sendCommand('Network.enable');
  
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  
  createWindow();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0){
      createWindow(); 
    }
    let pythonPath = getPath("ocr_server.py");
    let batPath = getPath("server_manager.bat");
    pythonServer = spawn('python3', [pythonPath]);
    pythonServer.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
    pythonServer.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    pythonServer.on('close', (code) => {
      console.log(`Python server exited with code ${code}`);
    });
  });
  // autoUpdater.checkForUpdates();
  
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('quit', () => {
  pythonServer.kill();
});