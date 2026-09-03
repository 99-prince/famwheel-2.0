@echo off
echo.
echo ==========================================
echo   FAM WHEEL 2.0 - Full-Stack Setup
echo ==========================================
echo.

echo [1/4] Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (echo ERROR: npm install failed in server && pause && exit /b 1)

echo.
echo [2/4] Setting up PostgreSQL database...
call npx prisma generate
call npx prisma db push
if %errorlevel% neq 0 (echo ERROR: Database setup failed && pause && exit /b 1)

echo.
echo [3/4] Seeding database with demo data...
call node src/prisma/seed.js

echo.
cd ..
echo [4/4] Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (echo ERROR: npm install failed in client && pause && exit /b 1)

cd ..
echo.
echo ==========================================
echo   SETUP COMPLETE!
echo ==========================================
echo.
echo To start the app, open TWO terminal windows:
echo.
echo   Terminal 1 (Backend):  cd server ^&^& npm run dev
echo   Terminal 2 (Frontend): cd client ^&^& npm run dev
echo.
echo Then open: http://localhost:5173
echo.
echo Demo Accounts:
echo   Farmer   : farmer@demo.com    / demo123
echo   Buyer    : buyer@demo.com     / demo123
echo   Transport: transport@demo.com / demo123
echo   Admin    : admin@demo.com     / admin123
echo.
pause
