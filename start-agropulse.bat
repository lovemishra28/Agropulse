@echo off
setlocal
cd /d "%~dp0"

if /I "%~1"=="backend" goto backend
if /I "%~1"=="frontend" goto frontend

if not exist "fertigation-backend" (
    echo [ERROR] Folder not found: fertigation-backend
    pause
    exit /b 1
)

if not exist "fertigation-frontend" (
    echo [ERROR] Folder not found: fertigation-frontend
    pause
    exit /b 1
)

start "AgroPulse Backend" cmd /k ""%~f0" backend"
start "AgroPulse Frontend" cmd /k ""%~f0" frontend"

echo [INFO] Waiting for frontend server to start...
timeout /t 6 /nobreak >nul
start "" "http://localhost:5173"
exit /b 0

:backend
cd /d "%~dp0fertigation-backend"

if not exist "venv\Scripts\python.exe" (
    echo [INFO] Creating backend virtual environment...
    python -m venv venv
)

if not exist "venv\Scripts\python.exe" (
    echo [ERROR] Python virtual environment setup failed.
    echo [HINT] Make sure Python is installed and added to PATH.
    pause
    exit /b 1
)

echo [INFO] Installing/updating backend dependencies...
call "venv\Scripts\python.exe" -m pip install -r requirements.txt

echo [INFO] Checking MongoDB on localhost:27017...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $tcp = New-Object System.Net.Sockets.TcpClient('127.0.0.1',27017); $tcp.Close(); exit 0 } catch { exit 1 }"
if errorlevel 1 (
    sc query MongoDB >nul 2>&1
    if not errorlevel 1 (
        echo [INFO] Attempting to start MongoDB Windows service...
        net start MongoDB >nul 2>&1
        timeout /t 2 /nobreak >nul
    )

    powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $tcp = New-Object System.Net.Sockets.TcpClient('127.0.0.1',27017); $tcp.Close(); exit 0 } catch { exit 1 }"
    if errorlevel 1 (
        echo [WARN] MongoDB is not running. API endpoints that use database will return 503.
        echo [HINT] Start MongoDB locally or set MONGO_URI in fertigation-backend\.env
    )
)

echo [INFO] Starting backend at http://0.0.0.0:8000
call "venv\Scripts\python.exe" -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
exit /b %errorlevel%

:frontend
cd /d "%~dp0fertigation-frontend"

if not exist "node_modules" (
    echo [INFO] Installing frontend dependencies...
    call npm install
)

echo [INFO] Starting frontend dev server...
call npm run dev -- --host localhost --port 5173 --strictPort
exit /b %errorlevel%
