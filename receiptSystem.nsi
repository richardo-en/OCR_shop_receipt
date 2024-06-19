OutFile "ReceiptInstaller.exe"
InstallDir $PROGRAMFILES\ReceiptSystem
Page directory                ; Directory selection page
Page instfiles                ; Installation progress page
UninstPage uninstConfirm      ; Uninstall confirmation page
UninstPage instfiles          ; Uninstallation progress page

; Function to install dependencies
Function InstallDependencies
    ; Set working directory to where your application files are installed
    SetOutPath "$INSTDIR\resources\app"

    ; Run npm install
    ExecWait '"$SYSDIR\cmd.exe" /c npm install' $0
    DetailPrint "npm dependencies installed."

    ; Run pip install
    ExecWait '"$SYSDIR\cmd.exe" /c pip install -r "$INSTDIR\resources\app\requirements.txt"' $0
    DetailPrint "Python dependencies installed."
FunctionEnd


; Section definitions
Section "MainSection" SecMain

    ; Check for Python
    ExecWait '"$SYSDIR\cmd.exe" /c python --version' $0
    StrCmp $0 "0" PythonInstalled PythonNotInstalled

PythonInstalled:
    DetailPrint "Python is already installed."
    Goto CheckNpm

PythonNotInstalled:
    DetailPrint "Python is not installed. Downloading and installing..."
    ; Download and run the Python installer
    NSISdl::download /TIMEOUT=30000 "https://www.python.org/ftp/python/3.9.9/python-3.9.9.exe" "$TEMP\python-installer.exe"
    ExecWait '"$TEMP\python-installer.exe" /quiet InstallAllUsers=1 PrependPath=1' $0
    DetailPrint "Python installation completed."
    Goto CheckNpm

CheckNpm:
    ; Check for npm
    ExecWait '"$SYSDIR\cmd.exe" /c npm --version' $0
    StrCmp $0 "0" NpmInstalled NpmNotInstalled

NpmInstalled:
    DetailPrint "npm is already installed."

NpmNotInstalled:
    DetailPrint "npm is not installed. Downloading and installing Node.js which includes npm..."
    ; Download and run the Node.js installer
    NSISdl::download /TIMEOUT=30000 "https://nodejs.org/dist/latest-v14.x/node-v14.21.3-x64.msi" "$TEMP\nodejs-installer.msi"
    ExecWait '"$SYSDIR\msiexec.exe" /i "$TEMP\nodejs-installer.msi" /quiet' $0
    DetailPrint "npm installation completed."
SectionEnd

Section "SecInstall"

    ; Install section
    SetOutPath $INSTDIR
    File /r "dist/win-unpacked/*.*"
    CreateShortcut "$DESKTOP\Receipt OCR.lnk" "$INSTDIR\Receipt OCR.exe"

    ; Call the InstallDependencies function
    Call InstallDependencies

SectionEnd
