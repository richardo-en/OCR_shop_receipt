//image preprocesing
var settingsData;
async function saveChecks() {
    const checkboxes = document.querySelectorAll('.preprocessing_checks');
    const settings = Array.from(checkboxes).map(checkbox => {
        if (checkbox.checked) {
            const parentDiv = checkbox.closest('.form-check');
            const sliderContainer = parentDiv.querySelector('.specific_values');
            if (sliderContainer) {
                const ranges = Array.from(sliderContainer.querySelectorAll('input[type="range"]')).map(range => range.value);
                return { checked: true, ranges };
            }
            return { checked: true, ranges: [] };
        }
        return { checked: false, ranges: [] };
    });


    const result = await ipcRenderer.invoke('writeFile', 'image_preprocessing', settings);
    settingsData = settings;
    if (result) {
        return true;
    } else {
        functions.showMessage("Error saving image preprocessing settings", "error");
    }
}




async function updatePreprocessedImage(path) {
    saveChecks();
    const notProcessedImg = document.getElementById('not_proccesed_image');
    const processedImg = document.getElementById('proccesed_image');

    try {
        await fetch(`http://localhost:5000${path}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
          })
            .then(response => response.json())
            .then(data => {
              console.log('Server response:', data);
              notProcessedImg.dataset.src = '';
              processedImg.dataset.src = '';
              notProcessedImg.src = functions.getPath('not_preprocessed.png?' + Date.now());
              processedImg.src = functions.getPath('processed_data.png?' + Date.now());
            })
            .catch(error => console.error('Error sending data to server:', error));
    } catch (err) {
        functions.showMessage("Something went wrong.\n" + err, "error");
    }
}


document.querySelectorAll('.preprocessing_checks').forEach((checkbox) => {
    checkbox.addEventListener('change', function (e) {
        const parentDiv = this.closest('.form-check');
        const sliderContainer = parentDiv.querySelector('.specific_values');
        updatePreprocessedImage("/preprocessing/update");
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
        updatePreprocessedImage("/preprocessing/update");
    });
});

document.getElementById('image_preprocessing_options').addEventListener('click', function (e) {
    e.preventDefault()
    if(saveChecks()){
        functions.showMessage("Image preprocessing settings were saved successfully", "success");
    }else{
        return
    }
    document.getElementById('content').innerHTML = '';
})

document.getElementById('img_preprocessing_capture').addEventListener('click', function (e) {
    e.preventDefault()
    updatePreprocessedImage("/preprocessing/capture")
})