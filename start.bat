@echo off
echo ========================================
echo  BusinessPilot AI - Development Setup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [INFO] Python and Node.js are installed. Proceeding with setup...
echo.

REM Backend Setup
echo ========================================
echo  Setting up Backend (FastAPI)
echo ========================================

cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo [INFO] Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies
echo [INFO] Installing Python dependencies...
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Python dependencies
    pause
    exit /b 1
)

REM Initialize database
echo [INFO] Initializing database...
if not exist "businesspilot.db" (
    echo [INFO] Creating SQLite database...
    alembic upgrade head
    if %errorlevel% neq 0 (
        echo [WARNING] Database migration failed, continuing anyway...
    )
) else (
    echo [INFO] SQLite database already exists, skipping initialization
)

echo [INFO] Backend dependencies installed successfully!
echo.

REM Frontend Setup
echo ========================================
echo  Setting up Frontend (React)
echo ========================================

cd ..\frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing Node.js dependencies...
    npm install
    
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install Node.js dependencies
        pause
        exit /b 1
    )
) else (
    echo [INFO] Node.js dependencies already installed
)

echo [INFO] Frontend dependencies installed successfully!
echo.

REM Install missing dependencies
echo [INFO] Installing additional required packages...
npm install @tanstack/react-query @types/react-router-dom

echo.

REM Setup complete
echo ========================================
echo  Setup Complete! Starting Applications
echo ========================================
echo.

REM Check if ports are available and set alternatives
echo [INFO] Checking available ports...
set BACKEND_PORT=8002
set FRONTEND_PORT=3002

REM Check if port 8002 is available
netstat -an | find "8002" >nul
if %errorlevel% equ 0 (
    set BACKEND_PORT=8003
    echo [INFO] Port 8002 in use, using 8003 for backend
) else (
    echo [INFO] Using port 8002 for backend
)

REM Check if port 3002 is available
netstat -an | find "3002" >nul
if %errorlevel% equ 0 (
    set FRONTEND_PORT=3003
    echo [INFO] Port 3002 in use, using 3003 for frontend
) else (
    echo [INFO] Using port 3002 for frontend
)

REM Create .env file for frontend with custom port
cd ..\frontend
echo PORT=%FRONTEND_PORT% > .env
echo REACT_APP_API_URL=http://localhost:%BACKEND_PORT% >> .env

REM Start backend in new window
echo [INFO] Starting Backend Server (FastAPI) on port %BACKEND_PORT%...
cd ..\backend
start "BusinessPilot Backend" cmd /k "venv\Scripts\python -m uvicorn main:app --reload --host 0.0.0.0 --port %BACKEND_PORT%"

REM Wait a moment for backend to start
timeout /t 3 >nul

REM Start frontend in new window
echo [INFO] Starting Frontend Server (React) on port %FRONTEND_PORT%...
cd ..\frontend
start "BusinessPilot Frontend" cmd /k "npm start"

echo.
echo ========================================
echo  Applications Started Successfully!
echo ========================================
echo.
echo Backend API: http://localhost:%BACKEND_PORT%
echo Frontend App: http://localhost:%FRONTEND_PORT%
echo API Docs: http://localhost:%BACKEND_PORT%/docs
echo.
echo Both applications are running in separate windows.
echo Close those windows to stop the applications.
echo.

REM Wait for servers to start
echo [INFO] Waiting for servers to start...
echo [INFO] This will take about 15 seconds...
timeout /t 15 >nul

REM Open browser tabs
echo [INFO] Opening browser tabs...
echo [INFO] Opening main app at http://localhost:%FRONTEND_PORT%
start "" "http://localhost:%FRONTEND_PORT%"
if %errorlevel% neq 0 (
    echo [WARNING] Could not automatically open browser for main app
)
timeout /t 2 >nul

echo [INFO] Opening API docs at http://localhost:%BACKEND_PORT%/docs
start "" "http://localhost:%BACKEND_PORT%/docs"
if %errorlevel% neq 0 (
    echo [WARNING] Could not automatically open browser for API docs
)

echo.
echo ========================================
echo  Applications are running!
echo ========================================
echo Frontend App: http://localhost:%FRONTEND_PORT%
echo API Documentation: http://localhost:%BACKEND_PORT%/docs
echo.
echo If the pages don't load immediately, wait a moment for the servers to fully start.
echo You can manually open these URLs in your browser:
echo - Main App: http://localhost:%FRONTEND_PORT%
echo - API Docs: http://localhost:%BACKEND_PORT%/docs
echo.

REM Show system info
echo ========================================
echo  System Information
echo ========================================
echo Python Version:
python --version
echo Node.js Version:
node --version
echo NPM Version:
npm --version
echo.

echo ========================================
echo  BusinessPilot AI is now running!
echo ========================================
echo.
echo The backend and frontend servers are running in separate windows.
echo Close those windows to stop the applications.
echo.
echo ** IMPORTANT: Keep this window open to maintain the applications **
echo.
echo Press Ctrl+C to stop all servers and exit.
echo Or close this window to exit (servers will continue running).
echo.

REM Keep the window open indefinitely
:keep_open
timeout /t 10 >nul
goto keep_open