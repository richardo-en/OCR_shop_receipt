@echo off
echo Running OCR server as administrator with script path: %1
powershell -Command "Start-Process 'python' -ArgumentList '\"%1\"' -Verb RunAs"
