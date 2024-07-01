//newFileController.js
function runPythonScript() {
    const fileName = window.sessionStorage.getItem('filename');

<<<<<<< HEAD
    try {

            fetch('http://localhost:5000/manageexcel/create', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ file_name: fileName})
              })
                .then(response => response.json())
                .then(data => {
                  console.log('Server response:', data);
                })
                .catch(error => console.error('Error sending data to server:', error));
                
            

    } catch (err) {
        console.error('Error in runPythonScript:', err);
        functions.showMessage("Something went wrong.\n" + err, "error");
        return false;
    }
=======
    try{
        modules.exec(`python3 "${functions.getPath("model/manage_excel.py")}" "create" "${fileName}"`, (error, stdout, stderr) => {
            if (error) {
                console.log(`exec error: ${error}\nstderr: ${stderr}`);
                functions.showMessage("Failed creating excel file.\n" + error, "error");
                return false;
            }
        });
    }catch (err){
        functions.showMessage("Something went wrong.\n" + error, "error");
        return false;
    }
    // if(functionCalling.connected == false){
    //     functions.showMessage("Cannot locate or call python file.\n" , "error");
    //     return false;
    // }
>>>>>>> origin/main
    return true;
}

async function unInitializeCamera() {
    try {
        const response = await fetch('http://localhost:5000/uninit_camera', {
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

async function initializeCamera() {
    try {
        const response = await fetch('http://localhost:5000/init_camera', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();
<<<<<<< HEAD
        console.log(data);
        if (response.ok) {
            console.log('Camera initialized:', data);
        } else {
            console.error('Failed to initialize camera:', data);
=======
        if (response.ok) {
            console.log('Camera initialized:', data.message);
        } else {
            console.error('Failed to initialize camera:', data.error);
>>>>>>> origin/main
        }
        return true;
    } catch (error) {
        functions.showMessage("Failed initializing camera\n" + error, "error");
        return false;
    }
}

<<<<<<< HEAD

document.getElementById('new-doc').addEventListener('submit', async function (e) {
    e.preventDefault();
    try {
        const data = await ipcRenderer.invoke('readFile', 'settings');
        if (data[0]) {
          const { devicePath, webcamIp, dataPath } = data[1];
          var fileName = document.getElementById('filename-input').value;
          const fullFilePath = modules.joinPath(devicePath, fileName + ".xlsx");
          window.sessionStorage.setItem('filename', fileName);
          window.sessionStorage.setItem('image_counter', 0);
  
              if (!functions.fileExists(fullFilePath)) {
                  if (!initializeCamera())
                      return;
                  try{
                    var result = runPythonScript()
                    if (!result){
                        unInitializeCamera()
                        console.log("disconnecting camera")
                        return;
                    }
                  }catch (err){
                    console.erorr(err);
                  }
                  initializeCamera()
                  document.getElementById('content').innerHTML = '';
                  document.getElementById('navbar-container').innerHTML = '';
                  ipcRenderer.send('loadExcelController');
                  functions.loadHTML('content', functions.getPath('view/excel_viewer.html'));
                  ipcRenderer.send('loadExcelControllers');
                  setTimeout(() => {
                      functions.activeScript(functions.getPath("/renderer/excel_controller.js"));
                  }, 50);
              } else {
                  functions.showMessage("File you want to create already exists", "error");
                  return;
              }
          } else {
              functions.showMessage("Your video stream is not running or your URL is not set properly", "error");
              return;
          }

=======
function checkStreamUrl(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false ); // false for synchronous request
    try{
        xmlHttp.send( null );
    }catch(err){
        return false;
    }
    return true;
}


document.getElementById('new-doc').addEventListener('submit', function (e) {
    e.preventDefault();
    try {
        const settingsPath = functions.getPath('settings.txt');
        const fileContent = functions.loadSettings(settingsPath);
        const lines = fileContent.split('\n');
        var fileName = document.getElementById('filename-input').value;
        const fullFilePath = modules.joinPath(lines[0], fileName + ".xlsx");

        if ((lines[1].length > 1 && checkStreamUrl(lines[1])) || lines[1].length == 1) {
            if (!functions.fileExists(fullFilePath)) {
                if (!initializeCamera())
                    return;
                else if (!runPythonScript()){
                    unInitializeCamera()
                    return;
                }
                window.sessionStorage.setItem('filename', fileName);
                window.sessionStorage.setItem('image_counter', 0);
                document.getElementById('content').innerHTML = '';
                document.getElementById('navbar-container').innerHTML = '';
                ipcRenderer.send('loadExcelController');
                functions.loadHTML('content', functions.getPath('view/excel_viewer.html'));
                ipcRenderer.send('loadExcelControllers');
                setTimeout(() => {
                    functions.activeScript(functions.getPath("/renderer/excel_controller.js"));
                }, 50);
            } else {
                functions.showMessage("File you want to create already exists", "error");
                return;
            }
        } else {
            functions.showMessage("Your video stream is not running or your URL is not set properly", "error");
            return;
        }
>>>>>>> origin/main
    } catch (err) {
        console.log(err.message);
        functions.showMessage("Something went wrong\n" + err, "error");
        return;
    }
});

