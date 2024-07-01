// settings
<<<<<<< HEAD
document.getElementById('save-settings').addEventListener('click', async function (event) {
=======
document.getElementById('save-settings').addEventListener('click', function (event) {
>>>>>>> origin/main
    event.preventDefault();
    var devicePath = document.getElementById('path-input').value;
    var webcamIp = document.getElementById('webcam').value;
    var dataPath = document.getElementById('data_saving').value;

<<<<<<< HEAD
  const settings = {
    devicePath,
    webcamIp,
    dataPath
  };

  const result = await ipcRenderer.invoke('writeFile', 'settings', settings);
  if (result) {
    functions.showMessage("Settings were saved successfully", "success");
    document.getElementById('content').innerHTML = '';
  } else {
    functions.showMessage("Error saving settings\n" + result, "error");
  }
=======
    var settings = `${devicePath}\n${webcamIp}\n${dataPath}`;
    var settingsStatus = functions.saveSettings(functions.getPath('settings.txt'), settings);
    if(settingsStatus){
        functions.showMessage("Settings were saved successfuly", "success");
        document.getElementById('content').innerHTML = '';
    }
    else
        functions.showMessage("Error saving settings\n" + settingsStatus, "error");
>>>>>>> origin/main
});

document.getElementById('updateApp').addEventListener('click', function (event) {
    event.preventDefault()
    ipcRenderer.send('ManualUpdate');
});