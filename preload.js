// //preload.js
const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

contextBridge.exposeInMainWorld('functions', {
  getPath:(file) => {
    return path.join(__dirname, `${file}`);
  },
  loadSettings:(settingsPath) => {
    return fs.readFileSync(settingsPath, 'utf-8');
  },  
  saveSettings:(settingsPath, data) => {
    return fs.writeFileSync(settingsPath, data, 'utf-8');
  },
  fileExists:(fullFilePath) => {
    return fs.existsSync(fullFilePath)
  },
  loadHTML:(containerId, url) => {
    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.getElementById(containerId).innerHTML = html;
          })
        .catch(error => {
            console.warn('Error loading HTML:', error);
          });
},
activeScript :(newActiveScript, callback) => {
  var script = document.createElement('script');
  script.async = true; // Ensure script is loaded asynchronously
  script.src = newActiveScript;
  
  script.onload = function() {
    if (callback) {
      callback();
      }
    };
    
    script.onerror = function(error) {
      console.error('Error loading script:', error);
      if (callback) {
        callback(error); // Pass error to the callback if needed
      }
    };
    document.head.appendChild(script);
  }
});

contextBridge.exposeInMainWorld('modules', {
  exec: (command, callback) => exec(command, (error, stdout, stderr) => {
    callback(error, stdout, stderr);
  }),
  joinPath: (...args) => path.join(...args),
});

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args)),
});

contextBridge.exposeInMainWorld('Toastify', {
  toast: (options) => Toastify(options).showToast(),
});