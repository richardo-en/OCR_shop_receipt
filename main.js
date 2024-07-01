<<<<<<< HEAD
const { app } = require('electron');
const { BrowserWindow, ipcMain, Menu } = require('electron');
=======
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
>>>>>>> origin/main
const { spawn } = require('child_process');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
<<<<<<< HEAD
const fs = require('fs').promises;
const pythonExecutable = getPath('python/bin/python3');

=======
>>>>>>> origin/main

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.autoDownload = false;
<<<<<<< HEAD
process.env.NODE_ENV = 'development';
// const { autoUpdater, AppUpdater } = require("electron-updater");
function getPath(file) {
  const path = require('path');
  return path.join(process.env.NODE_ENV === 'production' ? process.resourcesPath : __dirname, 'model/', `${file}`);
}

function getPythonPath(file) {
  let basePath;
  if (process.env.NODE_ENV === 'production') {
    basePath = process.resourcesPath;
    // Pokud jsou soubory zabaleny v asar archivu
    if (basePath.endsWith('.asar')) {
      basePath = basePath.replace(/\.asar$/, '.asar.unpacked');
    }
  } else {
    basePath = __dirname;
  }
  return path.join(basePath, 'model', file);
=======

// const { autoUpdater, AppUpdater } = require("electron-updater");
function getPath(file) {
  const path = require('path');
  return path.join(__dirname, 'model/', `${file}`);
>>>>>>> origin/main
}


let mainWindow;
// let pythonServer;


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
<<<<<<< HEAD
  if (process.env.NODE_ENV != 'production') {
    mainWindow.webContents.openDevTools();
    mainWindow.webContents.debugger.attach('1.3');
    mainWindow.webContents.debugger.sendCommand('Network.enable');
  }
=======
  mainWindow.webContents.openDevTools();  // Automatické otvorenie dev tools

  // Toto vám umožní pripojiť sa na tento port pre remote debugging
  // mainWindow.webContents.debugger.attach('1.3');
  // mainWindow.webContents.debugger.sendCommand('Network.enable');
>>>>>>> origin/main

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}

<<<<<<< HEAD

async function checkServerRunning(url, interval = 1000, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          clearInterval(intervalId);
          resolve();
        }
      } catch (error) {
        if (Date.now() - startTime >= timeout) {
          clearInterval(intervalId);
          reject(new Error('Server is not running'));
        }
      }
    }, interval);
  });
}

app.whenReady().then(async () => {
  const menu = Menu.buildFromTemplate([]);
  Menu.setApplicationMenu(menu);


  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  try {
    var command =  process.env.NODE_ENV === 'production' ? pythonExecutable : 'python3'
    pythonServer = spawn(command , [`${getPythonPath('ocr_server.py')}`]);
    pythonServer.stdout.on('data', (data) => {
      if (data.toString().includes('Server ready')) {
        mainWindow.webContents.send('serverStatus', 'Python server started successfully', 'success');
      }
    });
  } catch (e) {
    mainWindow.webContents.send('serverStatus', 'Python server did not start successfully!', 'error');
    console.error("Error during starting local server\n" + e);
  }

  try {
    await checkServerRunning('http://localhost:5000');
    const serverUrl = 'http://localhost:5000';

    let filePath = path.join(app.getPath('userData'), 'settings.json');
    let data = await fs.readFile(filePath, 'utf-8');
    let settings = JSON.parse(data);
    await fetch(`${serverUrl}/mainsettings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ main_settings: settings })
    });

    data = await fs.readFile(filePath, 'utf-8');
    settings = JSON.parse(data);
    await fetch(`${serverUrl}/image_preprocessing_settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image_preprocessing_settings: settings })
    });
  } catch (error) {
    console.error('Server is not running:', error);
    mainWindow.webContents.send('serverStatus', 'You cannot scan receipts without local server running', 'error');
    return
  }
  mainWindow.webContents.send('serverStatus', 'Your local server is running properly and you can start working :)', 'success');

=======
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
  
>>>>>>> origin/main
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

<<<<<<< HEAD
ipcMain.on('tryLoadNavbar', () => {
  mainWindow.webContents.send('loadNavbar');
});


autoUpdater.on('update-available', (info) => {
  let message = "New update is available! You can switch to new version in settings. :)"
  if (app.isPackaged)
=======

autoUpdater.on('update-available', (info) => {
  let message = "New update is available! You can switch to new version in settings. :)"
  if(app.isPackaged)
>>>>>>> origin/main
    mainWindow.webContents.send('updateStatus', message, "warning");
});

autoUpdater.on('update-not-available', (info) => {
  let message = "Your app version is latest. There are not any new updates."
<<<<<<< HEAD
  if (app.isPackaged)
=======
  if(app.isPackaged)
>>>>>>> origin/main
    mainWindow.webContents.send('updateStatus', message, "warning");

});

autoUpdater.on('error', (err) => {
  let message = "Something went wrong with updater.\n" + err;
  mainWindow.webContents.send('updateStatus', message, "error");
});

ipcMain.on('ManualUpdate', () => {
<<<<<<< HEAD
  if (app.isPackaged) {
    autoUpdater.checkForUpdates();
  } else {
=======
  if(app.isPackaged){
    autoUpdater.checkForUpdates();
  }else{
>>>>>>> origin/main
    let message = "You are in development mode, therefore you cannot update application.";
    mainWindow.webContents.send('updateStatus', message, "warning");
  }
});

<<<<<<< HEAD
ipcMain.handle('getSettingsPath', (event, file) => {
  const settingsPath = path.join(app.getPath('userData'), `${file}`);
  return settingsPath;
});


=======
>>>>>>> origin/main
autoUpdater.on('update-downloaded', (info) => {
  let message = "Your application was updated.";
  mainWindow.webContents.send('updateStatus', message, "success");
});

<<<<<<< HEAD

ipcMain.handle('readFile', async (event, filename) => {
  try {
    const filePath = path.join(app.getPath('userData'), `${filename}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return [true, JSON.parse(data)];
  } catch (error) {
    console.error(`Error reading file: ${error.toString()}`);  // Logovanie chyby
    return [false, error.toString()];
  }
});

ipcMain.handle('writeFile', async (event, filename, data) => {
  if (filename == 'settings') {
    fetch('http://localhost:5000/mainsettings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ main_settings: data })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Server response:', data);
        // Spracovanie odpovede od servera
      })
      .catch(error => console.error('Error sending data to server:', error));
  } else {
    fetch('http://localhost:5000/image_preprocessing_settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image_preprocessing_settings: data })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Server response:', data);
      })
      .catch(error => console.error('Error sending data to server:', error));
  }
  try {
    const filePath = path.join(app.getPath('userData'), `${filename}.json`);
    fs.writeFile(filePath, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error writing file: ${error.toString()}`);
    return error;
  }
});
=======
>>>>>>> origin/main
