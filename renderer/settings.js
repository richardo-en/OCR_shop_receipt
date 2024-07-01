// settings
document.getElementById('save-settings').addEventListener('click', async function (event) {
    event.preventDefault();
    var devicePath = document.getElementById('path-input').value;
    var webcamIp = document.getElementById('webcam').value;
    var dataPath = document.getElementById('data_saving').value;

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
});

document.getElementById('updateApp').addEventListener('click', function (event) {
    event.preventDefault()
    ipcRenderer.send('ManualUpdate');
});