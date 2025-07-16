@echo off
echo ========================================
echo  BusinessPilot AI - Demo Setup
echo ========================================
echo.

cd backend
echo [INFO] Setting up test user and sample data...
venv\Scripts\python show_test_credentials.py
echo.

echo [INFO] Starting application...
cd ..
call run-app.bat