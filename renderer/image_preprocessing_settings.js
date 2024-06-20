//image preprocesing

function saveChecks() {
    const filePath = functions.getPath('image_preprocessing.txt');
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

    functions.saveSettings(filePath, settingsString);
    // modules.fs.access(filePath, modules.fs.constants.F_OK, (err) => {
    //     if (err) {
    //         // File doesn't exist, create it
    //         modules.fs.writeFile(filePath, settingsString, (err) => {
    //             if (err) {
    //                 console.log('Error creating settings file:', err);
    //                 return;
    //             }
    //             console.log('Settings file created.');
    //         });
    //     } else {
    //         // File exists, write the settings
    //         modules.fs.writeFile(filePath, settingsString, (err) => {
    //             if (err) {
    //                 console.log('Error saving settings:', err);
    //                 return;
    //             }
    //             // console.log('Settings saved.');
    //         });
    //     }
    // });
}

function updatePreprocessedImage(action) {
    saveChecks();
    const notProcessedImg = document.getElementById('not_proccesed_image');
    const processedImg = document.getElementById('proccesed_image');
    modules.exec(`python3 "${("model/image_preprocessing.py")}" "${action}"`, (error, stdout, stderr) => {
        if (error) {
            console.log(`exec error: ${error}\nstderr: ${stderr}`);
            console.log(`exec error: ${error}\nstderr: ${stderr}`);
            return;
        }
        result = JSON.parse(stdout);
        console.log("asdasd\n" + result);
        if (result == null) {
            console.log("You need to capture image first");
            return;
        }


        notProcessedImg.dataset.src = ''
        processedImg.dataset.src = '';
    });
    setTimeout(()=>{

        notProcessedImg.src = functions.getPath('not_preprocessed.png?' + Date.now());
        processedImg.src = functions.getPath('processed_data.png?' + Date.now());
    }, 1500);

}

document.querySelectorAll('.preprocessing_checks').forEach((checkbox) => {
    checkbox.addEventListener('change', function (e) {
        const parentDiv = this.closest('.form-check');
        const sliderContainer = parentDiv.querySelector('.specific_values');
        updatePreprocessedImage("update");
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
        updatePreprocessedImage("update");
    });
});

document.getElementById('image_preprocessing_options').addEventListener('click', function (e) {
    e.preventDefault()
    saveChecks();
    document.getElementById('content').innerHTML = '';
})

document.getElementById('img_preprocessing_capture').addEventListener('click', function (e) {
    e.preventDefault()
    saveChecks();
    updatePreprocessedImage("capture")
})