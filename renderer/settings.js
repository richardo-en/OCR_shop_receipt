// settings
document.getElementById('save-settings').addEventListener('click', function (event) {
    event.preventDefault();
    var devicePath = document.getElementById('path-input').value;
    var webcamIp = document.getElementById('webcam').value;
    var dataPath = document.getElementById('data_saving').value;

    var settings = `${devicePath}\n${webcamIp}\n${dataPath}`;

    try {
        functions.saveSettings(functions.getPath('settings.txt'), settings);
        console.log('Settings saved successfully!');
    } catch (err) {
        console.log('Error saving settings.');
        console.log(err);
    }
    document.getElementById('content').innerHTML = '';

});