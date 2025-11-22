# Script para limpar e rebuildar o Electron

Write-Host "Matando processos..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*electron*" -or $_.ProcessName -like "*lyricspro*" -or $_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Aguardando libera��o de arquivos..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "Removendo pasta out..." -ForegroundColor Yellow
if (Test-Path ".\out") {
    Remove-Item -Path ".\out" -Recurse -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 2

Write-Host "Rebuilding Electron..." -ForegroundColor Green
npx electron-forge make

Write-Host "`nConclu�do!" -ForegroundColor Green
Write-Host "Execut�vel em: .\out\make\squirrel.windows\x64\LyricsPro-1.0.0 Setup.exe" -ForegroundColor Cyan
