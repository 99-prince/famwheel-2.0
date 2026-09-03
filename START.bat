@echo off
echo Starting FAM WHEEL Backend Server...
cd /d %~dp0server
start "FAM WHEEL - Backend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo Starting FAM WHEEL Frontend...
cd /d %~dp0client
start "FAM WHEEL - Frontend" cmd /k "npm run dev"

timeout /t 5 /nobreak >nul
echo Opening browser...
start http://localhost:5173

echo.
echo Both servers are starting!
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause
