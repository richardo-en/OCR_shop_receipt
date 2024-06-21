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
}

function updatePreprocessedImage(action) {
    saveChecks();
    const notProcessedImg = document.getElementById('not_proccesed_image');
    const processedImg = document.getElementById('proccesed_image');
    try{
        modules.exec(`python3 "${("model/image_preprocessing.py")}" "${action}"`, (error, stdout, stderr) => {
            if (error) {
                functions.showMessage("Something went wrong.\n" + error, "error");
                return;
            }
            result = JSON.parse(stdout);
            if (result == null) {
                functions.showMessage("You need to capture image first.", "error");
                return;
            }
            notProcessedImg.dataset.src = ''
            processedImg.dataset.src = '';
        });
    }catch (err){
        functions.showMessage("Something went wrong.\n" + err, "error");
    }
    setTimeout(()=>{

        notProcessedImg.src = functions.getPath('not_preprocessed.png?' + Date.now());
        processedImg.src = functions.getPath('processed_data.png?' + Date.now());
    }, 1000);

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