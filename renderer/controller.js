//controller.js

//Displays main settings
function loadMainSettings() {
  try {
    let data = functions.loadSettings(functions.getPath('settings.txt'));
      const [devicePath, webcamIp, dataPath] = data.split('\n');
      document.getElementById('path-input').value = devicePath;
      document.getElementById('webcam').value = webcamIp;
      document.getElementById('data_saving').value = dataPath;
  } catch (err) {
      console.log("err " + err);
  }
}


function loadPreprocessingSettings() {
  data = functions.loadSettings(functions.getPath('image_preprocessing.txt'));
  
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
}
  

function setActions(){
  // Function to load HTML content into a container
  
  // Add event listeners for the navigation links
  document.getElementById('settings-link').addEventListener('click', (e)=> {
    e.preventDefault();
    document.getElementById('content').innerHTML = ''; // Clear previous content
    functions.loadHTML('content', '../view/settings.html');
    setTimeout(()=>{
    functions.activeScript(functions.getPath("/renderer/settings.js"));
  }, 50)
  setTimeout(()=>{
    loadMainSettings();
  }, 50)
  });
  
  document.getElementById('overview-link').addEventListener('click', (e)=> {
    e.preventDefault();
    document.getElementById('content').innerHTML = ''; // Clear previous content
  });
  
  document.getElementById('newdoc-link').addEventListener('click', (e)=> {
    e.preventDefault();
    document.getElementById('content').innerHTML = ''; // Clear previous content
    functions.loadHTML('content', '../view/new_document.html');
    setTimeout(()=>{
      functions.activeScript(functions.getPath("/renderer/newfile_controller.js"));
    }, 50)
    // setTimeout(()=>{
      // }, 50)
    });
    
    document.getElementById('preprocessing-link').addEventListener('click', (e)=> {
      e.preventDefault();
      document.getElementById('content').innerHTML = ''; // Clear previous content
      functions.loadHTML('content', '../view/image_preprocessing_dashboard.html');
      setTimeout(()=>{
        functions.activeScript(functions.getPath("/renderer/image_preprocessing_settings.js"));
      }, 50)
      setTimeout(()=>{
        loadPreprocessingSettings();
      }, 50)
    });
  };
  
  ipcRenderer.on('settingUpControllers', () =>
    setActions()
  );
  
  functions.loadHTML('navbar-container', '../view/navbar.html');
  setTimeout(()=>{
    setActions();
  }, 50)