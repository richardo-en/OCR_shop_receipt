const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.autoDownload = false;

// const { autoUpdater, AppUpdater } = require("electron-updater");
function getPath(file) {
  const path = require('path');
  return path.join(__dirname, 'model/', `${file}`);
}


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

  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}

app.whenReady().then(() => {
  const menu = Menu.buildFromTemplate([]);
  Menu.setApplicationMenu(menu);


  createWindow();
  try {
    pythonServer = spawn('python3', ['./model/ocr_server.py']);    
  } catch (e) {
    mainWindow.webContents.send('serverStatus', 'Python server did not started successfully!','error');
    console.log("error during starting local server\n" + e);
  }
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  // mainWindow.webContents.send('loadMainWindow');
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", "http://localhost:5000", false ); 
  try{
    xmlHttp.send( null );
  }catch(err){
    mainWindow.webContents.send('serverStatus', 'You cannot scan receipts without local server running', 'error');
  }
  mainWindow.webContents.send('serverStatus', 'Python server started successfully','success');
  
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('quit', () => {
  pythonServer.kill();
});


ipcMain.on('loadControllers', () => {
  mainWindow.webContents.send('settingUpControllers');
});


autoUpdater.on('update-available', (info) => {
  let message = "New update is available! You can switch to new version in settings. :)"
  if(app.isPackaged)
    mainWindow.webContents.send('updateStatus', message, "warning");
});

autoUpdater.on('update-not-available', (info) => {
  let message = "Your app version is latest. There are not any new updates."
  if(app.isPackaged)
    mainWindow.webContents.send('updateStatus', message, "warning");

});

autoUpdater.on('error', (err) => {
  let message = "Something went wrong with updater.\n" + err;
  mainWindow.webContents.send('updateStatus', message, "error");
});

ipcMain.on('ManualUpdate', () => {
  if(app.isPackaged){
    autoUpdater.checkForUpdates();
  }else{
    let message = "You are in development mode, therefore you cannot update application.";
    mainWindow.webContents.send('updateStatus', message, "warning");
  }
});

autoUpdater.on('update-downloaded', (info) => {
  let message = "Your application was updated.";
  mainWindow.webContents.send('updateStatus', message, "success");
});

