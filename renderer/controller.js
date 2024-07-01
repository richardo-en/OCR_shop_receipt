//controller.js
async function loadMainSettings() {
  try {
    const data = await ipcRenderer.invoke('readFile', 'settings');
    if (data[0]) {
      const { devicePath, webcamIp, dataPath } = data[1];
      document.getElementById('path-input').value = devicePath;
      document.getElementById('webcam').value = webcamIp;
      document.getElementById('data_saving').value = dataPath;
    } else {
      functions.showMessage(data[1], 'error');
      return;
    }
  } catch (err) {
    console.log("err " + err);
  }
}


async function loadPreprocessingSettings() {
  try {
      const data = await ipcRenderer.invoke('readFile', 'image_preprocessing');
      if (data[0]) {
          const settings = data[1];

          // Iterate over each checkbox and set its checked property based on the loaded settings
          const checkboxes = document.querySelectorAll('.preprocessing_checks');
          checkboxes.forEach((checkbox, index) => {
              const setting = settings[index];
              checkbox.checked = setting.checked;

              if (setting.checked) {
                  const parentDiv = checkbox.closest('.form-check');
                  const sliderContainer = parentDiv.querySelector('.specific_values');
                  if (sliderContainer) {
                      sliderContainer.classList.remove('d-none');
                      sliderContainer.classList.add('d-flex', 'flex-column');

                      const ranges = sliderContainer.querySelectorAll('input[type="range"]');
                      setting.ranges.forEach((value, rangeIndex) => {
                          ranges[rangeIndex].value = value;
                      });
                  }
              }
          });

          functions.showMessage("Image preprocessing settings loaded successfully", "success");
      } else {
          functions.showMessage(data[1], 'error');
      }
  } catch (err) {
      console.log("Error loading image preprocessing settings:", err);
      functions.showMessage("Error loading image preprocessing settings", "error");
  }
}


function setActions() {
  // Function to load HTML content into a container

  // Add event listeners for the navigation links
  document.getElementById('settings-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('content').innerHTML = ''; // Clear previous content
    functions.loadHTML('content', '../view/settings.html');
    setTimeout(() => {
      functions.activeScript(functions.getPath("/renderer/settings.js"));
    }, 50)
    setTimeout(() => {
      loadMainSettings();
    }, 50)
  });

  document.getElementById('overview-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('content').innerHTML = ''; // Clear previous content
  });

  document.getElementById('newdoc-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('content').innerHTML = ''; // Clear previous content
    functions.loadHTML('content', '../view/new_document.html');
    setTimeout(() => {
      functions.activeScript(functions.getPath("/renderer/newfile_controller.js"));
    }, 50)
    // setTimeout(()=>{
    // }, 50)
  });

  document.getElementById('preprocessing-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('content').innerHTML = ''; // Clear previous content
    functions.loadHTML('content', '../view/image_preprocessing_dashboard.html');
    setTimeout(() => {
      functions.activeScript(functions.getPath("/renderer/image_preprocessing_settings.js"));
    }, 50)
    setTimeout(() => {
      loadPreprocessingSettings();
    }, 50)
  });
};

ipcRenderer.on('settingUpControllers', () =>
  setActions()
);


ipcRenderer.on('updateStatus', (message, type) => {
  functions.showMessage(message, type);
});

ipcRenderer.on('serverStatus', (message, type) => {
  functions.showMessage(message, type);
});

ipcRenderer.on('loadNavbar', () => {
  functions.loadHTML('navbar-container', '../view/navbar.html');
  setTimeout(() => {
    setActions();
  }, 250)
})

functions.loadHTML('navbar-container', '../view/navbar.html');
setTimeout(() => {
  setActions();
}, 250)