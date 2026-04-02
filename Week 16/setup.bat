@echo off
REM Quick setup script for Windows
REM This script will install and start the application

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║    🏥  Real-Time Alert System Dashboard - Quick Start         ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Check directories
if not exist backend (
    echo ❌ Backend directory not found
    pause
    exit /b 1
)

if not exist frontend (
    echo ❌ Frontend directory not found
    pause
    exit /b 1
)

echo ✅ Directories found
echo.

REM Install backend
echo 📦 Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed
cd ..
echo.

REM Install frontend
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed
cd ..
echo.

REM Start backend in new terminal
echo 🚀 Starting backend server...
start "Alert System Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak

REM Start frontend in new terminal
echo 🚀 Starting frontend...
start "Alert System Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                   🎉 Setup Complete!                          ║
echo ║                                                                ║
echo ║  📍 Backend:  http://localhost:5000                           ║
echo ║  📍 Frontend: http://localhost:5173                           ║
echo ║                                                                ║
echo ║  ⚠️  Keep both terminal windows open while using the app     ║
echo ║                                                                ║
echo ║  📚 See README.md for full documentation                      ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

pause
