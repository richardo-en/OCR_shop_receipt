// //preload.js
const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const Toastify = require('toastify-js');

contextBridge.exposeInMainWorld('functions', {
  getPath:(file) => {
<<<<<<< HEAD
    return path.join(
      process.env.NODE_ENV === 'production' ? process.resourcesPath : __dirname, `${file}`);
  },
  fileExists:(fullFilePath) => {
    if(fs.existsSync(fullFilePath))
      return true
    else
      return false
  },
=======
    return path.join(__dirname, `${file}`);
  },
  loadSettings:(settingsPath) => {
    return fs.readFileSync(settingsPath, 'utf-8');
  },  
  saveSettings:(settingsPath, data) => {
    try {
      fs.writeFileSync(settingsPath, data, 'utf-8');
      return true; 
    } catch (error) {
      return error; // Ak dôjde k chybe, vrátime chybu
    }
  },
  fileExists:(fullFilePath) => {
    if(fs.existsSync(fullFilePath))
      return true
    else
      return false
  },
>>>>>>> origin/main
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
  },
  showMessage: (message, type) => {
    let errorDesign;
    if(type == "error")
      errorDesign = "#cd5c5c";
    else if(type == "success")
      errorDesign = "#5adbb5";
    else if(type == "warning")
      errorDesign = "#fff44f";

    
    Toastify({
      text: message,
      duration: 2000, // Adjust as needed
      selector : "messages",
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: errorDesign,
        float: "right",
        marginTop:"5px",
        marginRight : "10px",
        borderBottomLeftRadius : "10px",
        borderBottomRightRadius : "10px",
        borderTopLeftRadius : "10px",
        padding:"8px",
        position:"relative"
        
      },
    }).showToast();
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
<<<<<<< HEAD
  invoke: async (channel, ...args) => {
    return ipcRenderer.invoke(channel, ...args);
  }
=======
>>>>>>> origin/main
});

contextBridge.exposeInMainWorld('Toastify', {
  toast: (options) => Toastify(options).showToast(),
});