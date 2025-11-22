# Script para limpar pasta out travada no Windows
Write-Host "Finalizando processos Node/Electron..." -ForegroundColor Yellow

# Matar todos os processos relacionados
Get-Process | Where-Object {
    $_.Name -like '*node*' -or
    $_.Name -like '*electron*' -or
    $_.Name -like '*lyricspro*'
} | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 3

Write-Host "Tentando remover pasta out..." -ForegroundColor Yellow

$outPath = "out"

if (Test-Path $outPath) {
    # Tentar remover normalmente
    try {
        Remove-Item -Path $outPath -Recurse -Force -ErrorAction Stop
        Write-Host "Pasta removida com sucesso!" -ForegroundColor Green
        exit 0
    } catch {
        Write-Host "Falha na remoção normal. Tentando método alternativo..." -ForegroundColor Yellow
    }

    # Método alternativo: renomear e criar nova
    $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $oldName = "out.old.$timestamp"

    try {
        Rename-Item -Path $outPath -NewName $oldName -Force -ErrorAction Stop
        Write-Host "Pasta renomeada para $oldName" -ForegroundColor Green
        Write-Host "Você pode deletar manualmente depois." -ForegroundColor Cyan
        exit 0
    } catch {
        Write-Host "ERRO: Não foi possível remover ou renomear a pasta." -ForegroundColor Red
        Write-Host "Possíveis soluções:" -ForegroundColor Yellow
        Write-Host "1. Feche o Windows Explorer se estiver aberto na pasta" -ForegroundColor White
        Write-Host "2. Reinicie o computador" -ForegroundColor White
        Write-Host "3. Use o Process Explorer para identificar o processo travando" -ForegroundColor White
        exit 1
    }
} else {
    Write-Host "Pasta out não existe." -ForegroundColor Green
    exit 0
}
