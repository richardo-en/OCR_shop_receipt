// Check if fs module is already defined
var fs, path, settingsPath;
if (typeof fs === 'undefined') {
    var fs = require('fs');
}

// Check if path module is already defined
if (typeof path === 'undefined') {
    var path = require('path');
}

// Check if jQuery is already defined
if (typeof $ === 'undefined') {
    window.$ = window.jQuery = require('jquery');
}

if (typeof settingsPath === 'undefined') {
    settingsPath = path.join(__dirname, '../settings.txt');
}


$(document).ready(function() {
    loadSettings();

    $('#save-settings').on('click', function(event) {
        event.preventDefault();

        var devicePath = $('#path-input').val();
        var webcamIp = $('#webcam').val();
        var data_path = $('#data_saving').val();

        var settings = `${devicePath}\n${webcamIp}\n${data_path}`;

        try {
            fs.writeFileSync(settingsPath, settings, 'utf-8');
            alert('Settings saved successfully!');
        } catch (err) {
            alert('Error saving settings.');
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
