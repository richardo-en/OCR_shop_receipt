document.addEventListener('DOMContentLoaded', () => {
    const $ = require('jquery');

    $(document).ready(function() {
      $('#navbar-container').load('./navbar.html');
  
      function loadSettingsPage() {
        $('#content').empty(); // Clear previous content
        $('#content').load('./settings.html');
      }
  
      function preprocessingPage() {
        $('#content').empty(); // Clear previous content
        $('#content').load('./image_preprocessing_dashboard.html');
      }
  
      window.loadOverview = function() {
        $('#content').empty(); // Clear previous content
      }
  
      function newDoc() {
        $('#content').empty(); // Clear previous content
        $('#content').load('./new_document.html');
      }
  
      $(document).on('click', '#settings-link', function(e) {
        e.preventDefault();
        loadSettingsPage();
      });
  
      $(document).on('click', '#overview-link', function(e) {
        e.preventDefault();
        loadOverview();
      });
  
      $(document).on('click', '#newdoc-link', function(e) {
        e.preventDefault();
        newDoc();
      });
  
      $(document).on('click', '#preprocessing-link', function(e) {
        e.preventDefault();
        preprocessingPage();
      });
    });
  
    // console.log(window.modules.test + " \nasdads");
  });
  