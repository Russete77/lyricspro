# Script SUPER AGRESSIVO para destravar e buildar
Write-Host "=== FORCA TOTAL ===" -ForegroundColor Cyan

# 1. Matar TUDO relacionado ao Electron
Write-Host "`n1. Matando TODOS os processos Electron/Node relacionados..." -ForegroundColor Yellow
Get-Process -ErrorAction SilentlyContinue | Where-Object {
    $_.ProcessName -match 'electron|lyricspro' -or
    $_.MainWindowTitle -match 'LyricsPro'
} | ForEach-Object {
    Write-Host "   Matando: $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor Red
    taskkill /PID $_.Id /F /T 2>$null
}

# Matar processos Node do frontend
Get-Process -Name node -ErrorAction SilentlyContinue | ForEach-Object {
    $cmdLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
    if ($cmdLine -match "transcriptioon-pro\\frontend|next|lyricspro") {
        Write-Host "   Matando Node.js: PID $($_.Id)" -ForegroundColor Red
        taskkill /PID $_.Id /F /T 2>$null
    }
}

Write-Host "   Aguardando processos finalizarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 2. Fechar Windows Explorer (ele pode estar travando arquivos)
Write-Host "`n2. Reiniciando Windows Explorer..." -ForegroundColor Yellow
taskkill /f /im explorer.exe 2>$null
Start-Sleep -Seconds 2
Start-Process explorer.exe
Start-Sleep -Seconds 2

# 3. Tentar deletar arquivos específicos
Write-Host "`n3. Removendo arquivos críticos..." -ForegroundColor Yellow

$filesToDelete = @(
    ".\out\LyricsPro-win32-x64\resources\app.asar",
    ".\out\LyricsPro-win32-x64\lyricspro.exe"
)

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Write-Host "   Removendo: $file" -ForegroundColor Gray
        Remove-Item -Path $file -Force -ErrorAction SilentlyContinue
        if (-not (Test-Path $file)) {
            Write-Host "   [OK] Removido!" -ForegroundColor Green
        } else {
            Write-Host "   [ERRO] Ainda travado" -ForegroundColor Red
        }
    }
}

# 4. Tentar deletar pasta out
Write-Host "`n4. Tentando remover pasta out..." -ForegroundColor Yellow
if (Test-Path .\out) {
    # Remover atributo de somente leitura recursivamente
    Get-ChildItem -Path .\out -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object {
        $_.Attributes = 'Normal'
    }

    Remove-Item -Path .\out -Recurse -Force -ErrorAction SilentlyContinue

    if (Test-Path .\out) {
        Write-Host "   AVISO: Pasta ainda existe" -ForegroundColor Red

        # Renomear como último recurso
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $newName = "out.old.$timestamp"

        try {
            Rename-Item -Path .\out -NewName $newName -Force
            Write-Host "   Renomeada para: $newName" -ForegroundColor Yellow
            Write-Host "   (Sera sobrescrito no proximo build)" -ForegroundColor Gray
        } catch {
            Write-Host "   ERRO CRITICO: Impossivel remover ou renomear" -ForegroundColor Red
            Write-Host "   O build tentara sobrescrever, mas pode falhar..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "   [OK] Pasta removida com sucesso!" -ForegroundColor Green
    }
} else {
    Write-Host "   Pasta out nao existe" -ForegroundColor Green
}

# 5. Rodar Next.js build
Write-Host "`n5. Buildando Next.js..." -ForegroundColor Yellow
npm run build:electron
if ($LASTEXITCODE -ne 0) {
    Write-Host "   [ERRO] Erro no build do Next.js" -ForegroundColor Red
    exit 1
}

# 6. Rodar Electron package
Write-Host "`n6. Empacotando Electron..." -ForegroundColor Yellow
npm run package
if ($LASTEXITCODE -ne 0) {
    Write-Host "   [ERRO] Erro no empacotamento" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== BUILD CONCLUIDO COM SUCESSO ===" -ForegroundColor Green
Write-Host "O executavel esta em: .\out\LyricsPro-win32-x64\lyricspro.exe" -ForegroundColor Cyan
