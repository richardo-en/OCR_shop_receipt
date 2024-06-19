//preload.js
const { contextBridge, ipcRenderer } = require('electron');
// const pathModule = require('path');
// const $ = require('jquery');

contextBridge.exposeInMainWorld('electron', {
  path: () => {
    return pathModule;
  },
  // child_process: {
  //   execFile: (file, args, options) => ipcRenderer.invoke('execFile', file, args, options),
  //   spawn: (command, args, options) => ipcRenderer.invoke('spawn', command, args, options)
  // },
  getPath: (file) => {preload
    const path = require('path');
    return path.join(__dirname,`${file}`);
  },
});

contextBridge.exposeInMainWorld('modules', {
  require: (module) => {
      const mod = require(module);
      return mod;
    },
  test: {
    message:'preload.js is loaded' 
  },
});
