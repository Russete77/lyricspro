@echo off
echo ========================================
echo LyricsPro - Debug Test
echo ========================================
echo.

echo Verificando Node.js...
node --version
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado!
    echo Instale em: https://nodejs.org
    pause
    exit /b 1
)
echo.

echo Testando servidor Next.js standalone...
cd /d "%~dp0out\LyricsPro-win32-x64\resources\app\.next\standalone"
echo Diretorio: %cd%
echo.

echo Iniciando servidor...
set ELECTRON=true
set PORT=3000
set HOSTNAME=localhost
set NODE_ENV=production

node server.js

pause
