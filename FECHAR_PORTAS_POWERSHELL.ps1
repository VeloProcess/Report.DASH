# Script PowerShell para fechar todas as portas de servidores
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fechando todas as portas de servidores" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Portas específicas para fechar
$portas = @(3001, 3002, 3003, 3004)

foreach ($porta in $portas) {
    Write-Host "Verificando porta $porta..." -ForegroundColor Yellow
    
    # Buscar processos usando a porta
    $processos = Get-NetTCPConnection -LocalPort $porta -ErrorAction SilentlyContinue | 
                 Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($processos) {
        foreach ($pid in $processos) {
            try {
                $processo = Get-Process -Id $pid -ErrorAction Stop
                Write-Host "  Encontrado: $($processo.ProcessName) (PID: $pid) na porta $porta" -ForegroundColor Yellow
                Stop-Process -Id $pid -Force -ErrorAction Stop
                Write-Host "  [OK] Processo $pid finalizado na porta $porta" -ForegroundColor Green
            } catch {
                Write-Host "  [ERRO] Não foi possível finalizar processo $pid: $_" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "  [OK] Porta $porta está livre" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Finalizando processos Node.js" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$nodeProcessos = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcessos) {
    foreach ($processo in $nodeProcessos) {
        try {
            Stop-Process -Id $processo.Id -Force -ErrorAction Stop
            Write-Host "[OK] Processo Node.js (PID: $($processo.Id)) finalizado" -ForegroundColor Green
        } catch {
            Write-Host "[ERRO] Não foi possível finalizar processo Node.js (PID: $($processo.Id)): $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "[INFO] Nenhum processo Node.js encontrado" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verificando portas ainda em uso..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

foreach ($porta in $portas) {
    $emUso = Get-NetTCPConnection -LocalPort $porta -ErrorAction SilentlyContinue
    if ($emUso) {
        Write-Host "[ATENÇÃO] Porta $porta ainda está em uso!" -ForegroundColor Red
    } else {
        Write-Host "[OK] Porta $porta está livre" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Concluído!" -ForegroundColor Green
Write-Host "Pressione qualquer tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

