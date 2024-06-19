var fs, path, settings_path, lines;
const { exec } = require('child_process');
window.$ = window.jQuery = require('jquery');

if (typeof fs === 'undefined') {
    var fs = require('fs');
}


if (typeof path === 'undefined') {
    var path = require('path');
}


if (typeof $ === 'undefined') {
}

function getPath(file){
    const path = require('path');
    return path.join(__dirname, '../model', `${file}`);
}

function getCheckedCheckboxes() {
    const checkedCheckboxes = $('#excel-overview input[type="checkbox"]:checked');
    let checkedValues = [];
    checkedCheckboxes.each(function () {
        let value = $(this).val();
        checkedValues.push(JSON.parse(value));
    });
    return checkedValues;
}


window.onload = function(){
    settings_path = path.join(__dirname, './../settings.txt');
    fileContent = fs.readFileSync(settings_path, 'utf-8');
    lines = fileContent.split('\n')
}


document.getElementById('capture-button').addEventListener('click', function (e) {
    e.preventDefault();
    const startTime = new Date().getTime();
    const excelOverview = document.getElementById('excel-overview');
    excelOverview.innerHTML = ''; 
    try {
        const fileName = window.sessionStorage.getItem('filename');
        const image_counter = window.sessionStorage.getItem('image_counter');
        
        console.log(`Sending request with folder_name: ${fileName}, row_number: ${image_counter}`);
        
        fetch('http://localhost:5000/capture', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ folder_name: fileName, row_number: image_counter }),
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
    const checked_data = getCheckedCheckboxes();
    const filename = window.sessionStorage.getItem('filename');
    var image_counter = window.sessionStorage.getItem('image_counter');

    if (checked_data === null || checked_data.length === 0) {
        console.log("No values were chosen");
        return;
    }

    try {
        exec(`python3 "${getPath("manage_excel.py")}" "write" "${filename}" "${JSON.stringify(checked_data)}" "${image_counter}"`, (error, stdout, stderr) => {
            if (error) {
                console.log(`exec error: ${error}\nstderr: ${stderr}`);
                return;
            }
        });
        const excelOverview = document.getElementById('excel-overview');
        excelOverview.innerHTML = ''; 
        window.sessionStorage.setItem('image_counter', ++image_counter);
    } catch (err) {
        console.log(err.message);
        return;
    }
});

document.getElementById('stop').addEventListener('click', function (e) {
    e.preventDefault();
    // let pythonServerPid = window.sessionStorage.getItem('pythonServerPid');
    // if (pythonServerPid) {
    //     try {
    //         process.kill(pythonServerPid);
    //         console.log(`Killed Python server with PID ${pythonServerPid}`);
    //     } catch (err) {
    //         console.log(`Failed to kill Python server: ${err.message}`);
    //     }
    //     window.sessionStorage.removeItem('pythonServerPid');
    // }
    try {
        const filename = window.sessionStorage.getItem('filename');
        exec(`python3 "${getPath("minify.py")}" "${filename}"`, (error, stdout, stderr) => {
            if (error) {
                console.log(`exec error: ${error}\nstderr: ${stderr}`);
                return;
            }
            const excelOverview = document.getElementById('content');
            excelOverview.innerHTML = ''; 
            $('#navbar-container').load('./navbar.html');
        });
        window.sessionStorage.removeItem('image_counter');
        window.sessionStorage.removeItem('filename');
    } catch (err) {
        console.log(err.message);
        return;
    }
});