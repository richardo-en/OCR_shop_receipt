var fs;
if (typeof fs === 'undefined') {
    var fs = require('fs');
}

// if (typeof exec === 'undefined') {
// }

function getPath(file){
    const path = require('path');
    return path.join(__dirname, '../model/', `${file}`);
}

function loadSettingsFromFile() {
    const path = require('path');
    // const filePath = 'image_preprocessing.txt';
    const filePath = path.join(__dirname, '../image_preprocessing.txt');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.log('Error reading settings file:', err);
            return;
        }
        
        const settings = data.split('\n').map(value => value.trim());
        
        // Iterate over each checkbox and set its checked property based on the loaded settings
        const checkboxes = document.querySelectorAll('.preprocessing_checks');
        checkboxes.forEach((checkbox, index) => {
            const settingValues = settings[index].split(',');
            const isChecked = settingValues[0] === '1';
            checkbox.checked = isChecked;
            
            if (isChecked) {
                const parentDiv = checkbox.closest('.form-check');
                const sliderContainer = parentDiv.querySelector('.specific_values');
                if (sliderContainer) {
                    sliderContainer.classList.remove('d-none');
                    sliderContainer.classList.add('d-flex', 'flex-column');
                    
                    const ranges = sliderContainer.querySelectorAll('input[type="range"]');
                    settingValues.slice(1).forEach((value, rangeIndex) => {
                        ranges[rangeIndex].value = value;
                    });
                }
            }
        });
    });
}

function save_checks(){
    const path = require('path');
    // const filePath = 'image_preprocessing.txt';
    const filePath = path.join(__dirname, '../image_preprocessing.txt');
    const checkboxes = document.querySelectorAll('.preprocessing_checks');
    const settings = Array.from(checkboxes).map(checkbox => {
        if (checkbox.checked) {
            const parentDiv = checkbox.closest('.form-check');
            const sliderContainer = parentDiv.querySelector('.specific_values');
            if (sliderContainer) {
                const ranges = Array.from(sliderContainer.querySelectorAll('input[type="range"]')).map(range => range.value);
                return ['1', ...ranges].join(',');
            }
            return '1';
        }
        return '0';
    });
    const settingsString = settings.join('\n');
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File doesn't exist, create it
            fs.writeFile(filePath, settingsString, (err) => {
                if (err) {
                    console.log('Error creating settings file:', err);
                    return;
                }
                console.log('Settings file created.');
            });
        } else {
            // File exists, write the settings
            fs.writeFile(filePath, settingsString, (err) => {
                if (err) {
                    console.log('Error saving settings:', err);
                    return;
                }
                // console.log('Settings saved.');
            });
        }
    });
}

function update_preprocessed_image(action){
    const path = require('path');
    // console.log("calling");
    const { exec } = require('child_process');
    save_checks();
        exec(`python3 "${getPath("image_preprocessing.py")}" "${action}"`, (error, stdout, stderr) => {
            if (error) {
                console.log(`exec error: ${error}\nstderr: ${stderr}`);
                console.log(`exec error: ${error}\nstderr: ${stderr}`);
                return;
            }
            result = JSON.parse(stdout);   
            // console.log("asdasd " + result);
            if(result == null){
                console.log("You need to capture image first");
                return;
            } 
            const notProcessedImg = document.getElementById('not_proccesed_image');
            const processedImg = document.getElementById('proccesed_image');
            
    
            notProcessedImg.dataset.src = ''
            processedImg.dataset.src = '';
            console.log(path.join(__dirname, '../not_preprocessed.png?' + Date.now()));
            notProcessedImg.src = path.join(__dirname, '../not_preprocessed.png?' + Date.now());
            processedImg.src = path.join(__dirname, '../processed_data.png?' + Date.now());
            });

    }
// Call the function to load settings when the page loads
loadSettingsFromFile();

document.querySelectorAll('.preprocessing_checks').forEach((checkbox) => {
    checkbox.addEventListener('change', function (e) {
        const parentDiv = this.closest('.form-check');
        const sliderContainer = parentDiv.querySelector('.specific_values');
        update_preprocessed_image("update");
        if (sliderContainer) {
            if (this.checked) {
                sliderContainer.classList.remove('d-none');
                sliderContainer.classList.add('d-flex', 'flex-column');
            } else {
                sliderContainer.classList.remove('d-flex', 'flex-column');
                sliderContainer.classList.add('d-none');
            }
        }
    });
});


document.querySelectorAll('.form-range').forEach((checkbox) => {
    checkbox.addEventListener('change', function (e) {
        update_preprocessed_image("update");
    });
});

document.getElementById('image_preprocessing_options').addEventListener('click', function (e) {
    e.preventDefault()
    save_checks();
    $('#content').empty();
})

document.getElementById('img_preprocessing_capture').addEventListener('click', function (e) {
    e.preventDefault()
    const { exec } = require('child_process');
    save_checks();
    update_preprocessed_image("capture")
})