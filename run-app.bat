@echo off
echo ========================================
echo  BusinessPilot AI - Starting Application
echo ========================================
echo.

REM Kill any existing servers first
taskkill /f /im python.exe 2>nul
taskkill /f /im node.exe 2>nul
timeout /t 2 >nul

REM Start backend server
echo [INFO] Starting Backend Server...
cd backend
start "BusinessPilot Backend" cmd /k "venv\Scripts\python -m uvicorn main:app --host 0.0.0.0 --port 8004"
cd ..

REM Wait for backend to start
echo [INFO] Waiting for backend to start...
timeout /t 10 >nul

REM Start frontend server
echo [INFO] Starting Frontend Server...
cd frontend
echo PORT=3004 > .env
echo REACT_APP_API_URL=http://localhost:8004 >> .env
start "BusinessPilot Frontend" cmd /k "npm start"
cd ..

REM Wait for frontend to start
echo [INFO] Waiting for frontend to start...
timeout /t 15 >nul

REM Open browser
echo [INFO] Opening browser...
start "" "http://localhost:3004"
timeout /t 2 >nul
start "" "http://localhost:8004/docs"

echo.
echo ========================================
echo  Application Started Successfully!
echo ========================================
echo.
echo Frontend App: http://localhost:3004
echo Backend API: http://localhost:8004
echo API Documentation: http://localhost:8004/docs
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the applications.
echo.
echo Press any key to exit this window...
pause >nul