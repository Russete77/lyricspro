# Build forçado - ignora pasta out travada
Write-Host "=== BUILD FORÇADO ===" -ForegroundColor Cyan

# 1. Matar processos
Write-Host "`n1. Fechando processos..." -ForegroundColor Yellow
.\kill-all.ps1

# 2. Tentar deletar arquivos travados específicos
Write-Host "`n2. Removendo arquivos travados..." -ForegroundColor Yellow
$asarPath = ".\out\LyricsPro-win32-x64\resources\app.asar"
if (Test-Path $asarPath) {
    Remove-Item -Path $asarPath -Force -ErrorAction SilentlyContinue
    if (Test-Path $asarPath) {
        Write-Host "   app.asar ainda travado" -ForegroundColor Red
    } else {
        Write-Host "   app.asar removido!" -ForegroundColor Green
    }
}

# 3. Tentar deletar pasta out
Write-Host "`n3. Tentando remover pasta out completa..." -ForegroundColor Yellow
Remove-Item -Path .\out -Recurse -Force -ErrorAction SilentlyContinue

# 4. Se ainda existe, renomear
if (Test-Path .\out) {
    Write-Host "   AVISO: Pasta out está travada" -ForegroundColor Red
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $newName = "out.old.$timestamp"

    try {
        Rename-Item -Path .\out -NewName $newName -Force -ErrorAction Stop
        Write-Host "   Pasta renomeada para: $newName" -ForegroundColor Green
        Write-Host "   (Delete manualmente depois)" -ForegroundColor Yellow
    } catch {
        Write-Host "   ERRO: Impossível renomear." -ForegroundColor Red
        Write-Host "   Tentando abordagem alternativa..." -ForegroundColor Yellow

        # Última tentativa: criar arquivo .deleteme para marcar
        New-Item -Path ".\out\.deleteme" -ItemType File -Force -ErrorAction SilentlyContinue
        Write-Host "   Pasta marcada para deleção manual" -ForegroundColor Yellow
    }
}

# 4. Rodar build
Write-Host "`n3. Iniciando build do Electron..." -ForegroundColor Yellow
npm run build:electron

Write-Host "`n=== BUILD CONCLUÍDO ===" -ForegroundColor Green
