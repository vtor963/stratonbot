@echo off
:: =========================================================
::  PROFITSBET - CLONE 100% RECHEADO - 1 CLIQUE E VAI PRO JIU
::  NAO PRECISA DAR PERMISSAO, NAO PRECISA FICAR
::  So duplo clique aqui e fecha a janela
:: =========================================================
chcp 65001 >nul
echo [RECHEADO] Iniciando clone completo em 2s...
timeout /t 2 /nobreak >nul

:: 1 - Dashboard + 19 jogos (thumbnails reais)
python auto-clone.py >nul 2>&1
if %errorlevel% neq 0 python3 auto-clone.py >nul 2>&1

:: 2 - Lobby do cassino (apresenta jogos) - clona o site gerado
python clone-lobby.py >nul 2>&1
if %errorlevel% neq 0 python3 clone-lobby.py >nul 2>&1

:: 3 - Gera ZIP final pra vender
powershell -command "Compress-Archive -Path 'games','index.html','sign-up.html','forgot-password.html','dashboard.html','public' -DestinationPath 'CLONE-100-RECHEADO-PRA-VENDER.zip' -Force" >nul 2>&1
powershell -command "Compress-Archive -Path 'games' -DestinationPath 'games-TODOS-OS-JOGOS.zip' -Force" >nul 2>&1

:: 4 - Abre pra conferir (se tiver alguem)
if exist "games\index.html" start "" "games\index.html"
if exist "dashboard.html" start "" "dashboard.html#plataformas"

exit
