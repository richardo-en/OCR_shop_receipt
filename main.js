const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;
let pythonServer;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // Ak chcete používať require vo vašom renderer skripte
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
  
  pythonServer = spawn('python3', ['model/ocr_server.py']);
  pythonServer.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  pythonServer.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  pythonServer.on('close', (code) => {
    console.log(`Python server exited with code ${code}`);
  });
  
  createWindow();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('quit', () => {
  pythonServer.kill();
});


// app.on('activate', () => {
//   if (mainWindow === null) {
//     createWindow();
//   }
// });