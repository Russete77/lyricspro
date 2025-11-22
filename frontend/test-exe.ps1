# Script para testar o .exe e capturar logs
Write-Host "Testando LyricsPro.exe..."

# Rodar o .exe e capturar saída
$exePath = ".\out\LyricsPro-win32-x64\lyricspro.exe"

if (Test-Path $exePath) {
    Write-Host "Executável encontrado: $exePath"
    Write-Host "Iniciando aplicação..."

    # Rodar com variável de ambiente para ver logs
    $env:ELECTRON_ENABLE_LOGGING = "1"

    & $exePath 2>&1 | Tee-Object -FilePath "electron-debug.log"

    Write-Host "`nLogs salvos em electron-debug.log"
} else {
    Write-Host "ERRO: Executável não encontrado em $exePath"
}
