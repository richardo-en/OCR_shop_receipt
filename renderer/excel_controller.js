//excel controller
function getCheckedCheckboxes() {
    const checkedCheckboxes = document.querySelectorAll('#excel-overview input[type="checkbox"]:checked');
    let checkedValues = [];
    checkedCheckboxes.forEach(checkbox => {
        let value = checkbox.value;
        checkedValues.push(JSON.parse(value));
    });
    return checkedValues;
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
            functions.showMessage("Error uninitializing camera. There wasn't propably any connection runnig." , "error");
        } else {
            functions.showMessage("Camera was stopped." , "success");
        }
        return true;
    } catch (error) {
        functions.showMessage("Error uninitializing camera.\n" + error, "error");
        return false;
    }
}


document.getElementById('capture-button').addEventListener('click', async function (e) {
    e.preventDefault();
    const imageCounter = window.sessionStorage.getItem('image_counter');
    const startTime = new Date().getTime();
    const excelOverview = document.getElementById('excel-overview');
    excelOverview.innerHTML = ''; 
    try {
        const fileName = window.sessionStorage.getItem('filename');
                
        await fetch('http://localhost:5000/capture', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ row_number: imageCounter }),
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(({ status, body }) => {
            const endTime = new Date().getTime();
            console.log(`Python script finished in ${(endTime - startTime) / 1000} seconds.`);  
            console.log(body.message);
            if (status !== 200) {
                functions.showMessage(`Error: ${body.message}`, "error");
                if (body.error) {
                    functions.showMessage(`Details: ${body.error}`, "error");
                }
                return;
            }
            
            const result = body.floats;
            
            if (result == null) {
                functions.showMessage("Numbers were not read correctly", "error");
                return;
            }

            for (let i = 0; i < result.length; i += 2) {
                const row = document.createElement('div');
                row.className = "form-check";
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `checkbox-${i/2}`;
                checkbox.src = `checkbox-${i/2}`;
                checkbox.className = "form-check-check";
                checkbox.value = JSON.stringify([parseFloat(result[i]), parseFloat(result[i + 1])]);
                checkbox.style = "transform: scale(1.4);"
                const label1 = document.createElement('label');
                label1.htmlFor = `checkbox-${i/2}`;
                label1.innerText = result[i] + "\t" + result[i + 1];
                label1.className = "form-check-label fs-4 mx-4";

                row.appendChild(checkbox);
                row.appendChild(label1);
                
                excelOverview.appendChild(row);
            }
        })
        .catch(err => {
            functions.showMessage("Error from OCR: " + err, "error");
        });
    } catch (err) {
        functions.showMessage("Something wen wrong" + err, "error");
        return;
    }
});



document.getElementById('accept').addEventListener('click', function (e) {
    const checkedData = getCheckedCheckboxes();
    var imageCounter = window.sessionStorage.getItem('image_counter');
    
    if (checkedData === null || checkedData.length === 0) {
        functions.showMessage("No values were chosen", "error");
        return;
    }

    console.log(JSON.stringify({ 
        row_number : parseInt(imageCounter, 10),
        data : checkedData
    }));

    try {
        fetch('http://localhost:5000/manageexcel/write', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                row_number : parseInt(imageCounter, 10),
                data : checkedData
            })
          })
            .then(response => response.json())
            .then(data => {
              const excelOverview = document.getElementById('excel-overview');
              excelOverview.innerHTML = ''; 
              window.sessionStorage.setItem('image_counter', ++imageCounter);
              console.log(data);
            })
            .catch(error => console.error('Error sending data to server:', error));
    } catch (err) {
        functions.showMessage(err,'error');
        return;
    }
});

document.getElementById('stop').addEventListener('click', async function (e) {
    e.preventDefault();
    const fileContent = await ipcRenderer.invoke('readFile', 'settings');
    
    if(fileContent[0] == true){
    const { devicePath, webcamIp, dataPath } = fileContent[1];
        const filename = window.sessionStorage.getItem('filename');
        try {
            await fetch('http://localhost:5000/manageexcel/stop', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                }
              })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                })
                .catch(error => console.error('Error sending data to server:', error));
            } catch (err) {
                functions.showMessage(err,'error');
                return;
            }
            const excelOverview = document.getElementById('content');
            excelOverview.innerHTML = ''; 
            window.sessionStorage.removeItem('image_counter');
            window.sessionStorage.removeItem('filename');
            ipcRenderer.send('tryLoadNavbar');
        functions.showMessage("Your file was saved successfuly." , "success");
    }else{
        functions.showMessage(fileContent[1], 'error');
        return;
    }
});