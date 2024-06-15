var fs, path, settings_path, new_file_name;
if (typeof fs === 'undefined') {
    var fs = require('fs');
}


if (typeof path === 'undefined') {
    var path = require('path');
}


if (typeof $ === 'undefined') {
    window.$ = window.jQuery = require('jquery');
}
const { exec } = require('child_process');


function runPythonScript() {
    const fileName = window.sessionStorage.getItem('filename');
    exec(`python3 model/manage_excel.py "create" "${fileName}"`, (error, stdout, stderr) => {
        if (error) {
            alert(`exec error: ${error}\nstderr: ${stderr}`);
            return;
        }
    });
}


async function checkStreamUrl(url) {
    try {
        const response = await fetch(url, {
            method: 'HEAD', // Only fetch the headers, not the entire content
            mode: 'no-cors' // This mode allows requests to be made without CORS checks
        });
        // Since we are using no-cors mode, fetch will not throw errors for valid URLs.
        return true;
    } catch (error) {
        return false;
    }
}

document.getElementById('new-doc').addEventListener('submit', function (e) {
    e.preventDefault();
    try {
        const settings_path = path.join(__dirname, '../settings.txt');
        const fileContent = fs.readFileSync(settings_path, 'utf-8');
        const lines = fileContent.split('\n');
        if (checkStreamUrl(lines[1])) {    
            var fileName = document.getElementById('filename-input').value;
            console.log(fileName);
            const fullFilePath = path.join(lines[0], fileName + ".xlsx");
            if(!fs.existsSync(fullFilePath)){
                window.sessionStorage.setItem('filename', fileName);
                window.sessionStorage.setItem('image_counter', 0);
                runPythonScript();
                $('#content').empty();
                $('#navbar-container').empty();
                $('#content').load('./excel_viewer.html');
            }        
        }else{
            alert("Something went wrong with connection to your webcam");
            $('#content').empty();
            return;
        }
    } catch (err) {
        alert(err.message);
        event.preventDefault();
    }
});

