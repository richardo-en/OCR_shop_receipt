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
            console.log('Camera initialized:', data.message);
        } else {
            console.error('Failed to initialize camera:', data.error);
        }
    } catch (error) {
        console.error('Error initializing camera:', error);
    }
}


document.getElementById('capture-button').addEventListener('click', function (e) {
    e.preventDefault();
    const startTime = new Date().getTime();
    const excelOverview = document.getElementById('excel-overview');
    excelOverview.innerHTML = ''; 
    try {
        const fileName = window.sessionStorage.getItem('filename');
        const imageCounter = window.sessionStorage.getItem('image_counter');
                
        fetch('http://localhost:5000/capture', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ folder_name: fileName, row_number: imageCounter }),
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(({ status, body }) => {
            const endTime = new Date().getTime();
            console.log(`Python script finished in ${(endTime - startTime) / 1000} seconds.`);
            
            if (status !== 200) {
                console.error(`Error: ${body.message}`);
                if (body.error) {
                    console.error(`Details: ${body.error}`);
                }
                console.log(`Error from OCR: ${body.message}`);
                return;
            }

            const result = body.floats;

            if (result == null) {
                console.log("Numbers were not read correctly");
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
                
                const label1 = document.createElement('label');
                label1.htmlFor = `checkbox-${i/2}`;
                label1.innerText = result[i] + "\t" + result[i + 1];
                label1.className = "form-check-label";

                row.appendChild(checkbox);
                row.appendChild(label1);
                
                excelOverview.appendChild(row);
            }
        })
        .catch(err => {
            console.log("Error from OCR: " + err.message);
        });
    } catch (err) {
        console.log(err.message);
        return;
    }
});



document.getElementById('accept').addEventListener('click', function (e) {
    const checkedData = getCheckedCheckboxes();
    const filename = window.sessionStorage.getItem('filename');
    var imageCounter = window.sessionStorage.getItem('image_counter');

    if (checkedData === null || checkedData.length === 0) {
        console.log("No values were chosen");
        return;
    }

    try {
        modules.exec(`python3 "${functions.getPath("model/manage_excel.py")}" "write" "${filename}" "${JSON.stringify(checkedData)}" "${imageCounter}"`, (error, stdout, stderr) => {
            if (error) {
                console.log(`exec error: ${error}\nstderr: ${stderr}`);
                return;
            }
        });
        const excelOverview = document.getElementById('excel-overview');
        excelOverview.innerHTML = ''; 
        window.sessionStorage.setItem('image_counter', ++imageCounter);
    } catch (err) {
        console.log(err.message);
        return;
    }
});

document.getElementById('stop').addEventListener('click', function (e) {
    e.preventDefault();
    try {
        const filename = window.sessionStorage.getItem('filename');
        modules.exec(`python3 "${functions.getPath("model/minify.py")}" "${filename}"`, (error, stdout, stderr) => {
            if (error) {
                console.log(`exec error: ${error}\nstderr: ${stderr}`);
                return;
            }
            const excelOverview = document.getElementById('content');
            excelOverview.innerHTML = ''; 
            functions.loadHTML('navbar-container', '../view/navbar.html');
            setTimeout(()=>{
                ipcRenderer.send('loadControllers');
            },200)
        });
        window.sessionStorage.removeItem('image_counter');
        window.sessionStorage.removeItem('filename');
        unInitializeCamera();
    } catch (err) {
        console.log(err.message);
        return;
    }
});