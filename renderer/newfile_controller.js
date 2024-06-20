//newFileController.js
function runPythonScript() {
    const fileName = window.sessionStorage.getItem('filename');
    modules.exec(`python3 "${functions.getPath("model/manage_excel.py")}" "create" "${fileName}"`, (error, stdout, stderr) => {
        if (error) {
            console.log(`exec error: ${error}\nstderr: ${stderr}`);
            return;
        }
    });
}

async function initializeCamera() {
    try {
        const response = await fetch('http://localhost:5000/init_camera', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();
        if (response.ok) {
            console.log('Camera initialized:', data.message);
        } else {
            console.error('Failed to initialize camera:', data.error);
        }
    } catch (error) {
        console.error('Error initializing camera:', error);
    }
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
        const settingsPath = functions.getPath('settings.txt');
        const fileContent = functions.loadSettings(settingsPath);
        const lines = fileContent.split('\n');
        // if (checkStreamUrl(lines[1])) {    
        var fileName = document.getElementById('filename-input').value;
        const fullFilePath = modules.joinPath(lines[0], fileName + ".xlsx");
        if(!functions.fileExists(fullFilePath)){
            window.sessionStorage.setItem('filename', fileName);
            window.sessionStorage.setItem('image_counter', 0);
            runPythonScript();
            document.getElementById('content').innerHTML = '';
            document.getElementById('navbar-container').innerHTML = '';
            ipcRenderer.send('loadExcelController');
            functions.loadHTML('content', functions.getPath('view/excel_viewer.html'));
            ipcRenderer.send('loadExcelControllers');
            setTimeout(()=>{
                functions.activeScript(functions.getPath("/renderer/excel_controller.js"));
            },50);
            initializeCamera();
        }        

    } catch (err) {
        console.log(err.message);
        event.preventDefault();
    }
});

