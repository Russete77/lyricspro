@echo off
echo Rodando LyricsPro com logs...
cd /d "%~dp0"
.\out\LyricsPro-win32-x64\lyricspro.exe > electron-output.log 2>&1
echo.
echo Logs salvos em electron-output.log
echo.
type electron-output.log
pause
