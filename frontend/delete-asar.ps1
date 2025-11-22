# Deletar/Renomear app.asar travado
$asarFile = ".\out\LyricsPro-win32-x64\resources\app.asar"

if (-not (Test-Path $asarFile)) {
    Write-Host "Arquivo app.asar nao existe" -ForegroundColor Green
    exit 0
}

Write-Host "Tentando remover app.asar..." -ForegroundColor Yellow

# Tentativa 1: Deletar diretamente
Remove-Item -Path $asarFile -Force -ErrorAction SilentlyContinue

if (-not (Test-Path $asarFile)) {
    Write-Host "[OK] Arquivo deletado!" -ForegroundColor Green
    exit 0
}

# Tentativa 2: Renomear
Write-Host "Tentando renomear..." -ForegroundColor Yellow
$newName = "app.asar.old." + (Get-Date -Format "yyyyMMddHHmmss")
$newPath = Join-Path (Split-Path $asarFile) $newName

try {
    Rename-Item -Path $asarFile -NewName $newName -Force -ErrorAction Stop
    Write-Host "[OK] Renomeado para: $newName" -ForegroundColor Green
    Write-Host "Agora pode rodar o build novamente" -ForegroundColor Cyan
    exit 0
} catch {
    Write-Host "[ERRO] Impossivel deletar ou renomear" -ForegroundColor Red
    Write-Host "Solucoes:" -ForegroundColor Yellow
    Write-Host "1. Reinicie o PC" -ForegroundColor Gray
    Write-Host "2. Use Unlocker/LockHunter para destravar o arquivo" -ForegroundColor Gray
    Write-Host "3. Desabilite temporariamente o antivirus" -ForegroundColor Gray
    Write-Host "4. Feche todos programas e tente novamente" -ForegroundColor Gray
    exit 1
}
