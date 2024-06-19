// Check if fs module is already defined
var settingsPath;
if (typeof $ === 'undefined') {
    window.$ = require('jquery');
}


$(document).ready(function() {
    const fs = require('fs');
    const path = require('path');
    settingsPath = path.join(__dirname, '../settings.txt');
    loadSettings();
    $('#save-settings').on('click', function(event) {
        event.preventDefault();

        var devicePath = $('#path-input').val();
        var webcamIp = $('#webcam').val();
        var data_path = $('#data_saving').val();

        var settings = `${devicePath}\n${webcamIp}\n${data_path}`;

        try {
            fs.writeFileSync(settingsPath, settings, 'utf-8');
            console.log('Settings saved successfully!');
        } catch (err) {
            console.log('Error saving settings.');
            console.error(err);
        }

        window.loadOverview();

    });
});

function handlePathSelection(event) {
    const selectedPath = event.target.files[0].path;
    document.getElementById('path-input').value = selectedPath;
}

function loadSettings() {
    const fs = require('fs');
    fs.readFile(settingsPath, 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        const [devicePath, webcamIp, dataPath] = data.split('\n');
        $('#path-input').val(devicePath);
        $('#webcam').val(webcamIp);
        $('#data_saving').val(dataPath);
    });
}
