# Força fechamento APENAS de processos relacionados ao LyricsPro
Write-Host "Fechando processos Electron/LyricsPro..." -ForegroundColor Yellow

# Mata apenas Electron e LyricsPro (NÃO todos os Node.js!)
@('electron', 'lyricspro') | ForEach-Object {
    $processName = $_
    Get-Process -Name $processName -ErrorAction SilentlyContinue | ForEach-Object {
        Write-Host "Matando: $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor Red
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
}

# Mata apenas processos Node que tenham "next" no caminho (servidor Next.js)
Get-Process -Name node -ErrorAction SilentlyContinue | ForEach-Object {
    $cmdLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
    if ($cmdLine -match "next|lyricspro|transcriptioon-pro\\frontend") {
        Write-Host "Matando Node.js (Next.js): PID $($_.Id)" -ForegroundColor Red
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Aguardando 3 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Tenta deletar pasta out com força
Write-Host "Removendo pasta out..." -ForegroundColor Yellow
if (Test-Path ".\out") {
    Remove-Item -Path ".\out" -Recurse -Force -ErrorAction SilentlyContinue
    if (Test-Path ".\out") {
        Write-Host "AVISO: Pasta out ainda existe (arquivo pode estar travado)" -ForegroundColor Red
    } else {
        Write-Host "Pasta out removida com sucesso!" -ForegroundColor Green
    }
} else {
    Write-Host "Pasta out não existe" -ForegroundColor Cyan
}

Write-Host "`nConcluído! Agora pode rodar o build." -ForegroundColor Green
