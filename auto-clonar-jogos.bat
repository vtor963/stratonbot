@echo off
:: AUTO - 1 CLIQUE E PRONTO - NAO PRECISA DAR PERMISSAO NEM FICAR
:: So da duplo clique e vai pro Jiu, quando voltar ta tudo em games/
python auto-clone.py 2>nul
if %errorlevel% neq 0 python3 auto-clone.py 2>nul
powershell -command "Compress-Archive -Path 'games' -DestinationPath 'games-TODOS-OS-JOGOS.zip' -Force" 2>nul
:: Abre automatico pra conferir
if exist "games\index.html" start "" "games\index.html"
exit
