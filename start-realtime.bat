@echo off
echo ========================================
echo    HR Dashboard - Real-Time Edition
echo ========================================
echo.
echo Starting Real-Time HR Dashboard Application...
echo.
echo Features:
echo - WebSocket Real-Time Updates
echo - Live Notifications
echo - Smart Auto-Refresh
echo - GPS/WiFi Attendance Tracking
echo - Live Leave Management
echo.
echo ========================================
echo.

echo 1. Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js is installed

echo.
echo 2. Installing/Updating dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully

echo.
echo 3. Starting MongoDB connection...
echo    Make sure MongoDB is running on localhost:27017
echo.

echo 4. Starting Real-Time Server...
echo    Server: http://localhost:5000
echo    Login: http://localhost:5000/login.html
echo    Employee Dashboard: http://localhost:5000/dashboard.html
echo    HR Dashboard: http://localhost:5000/hrdash.html
echo.
echo ========================================
echo    REAL-TIME FEATURES ACTIVE:
echo ========================================
echo 🔌 WebSocket Server: ENABLED
echo 📱 Live Notifications: ENABLED
echo 🔄 Smart Auto-Refresh: ENABLED
echo 📍 GPS Tracking: ENABLED
echo 📶 WiFi Monitoring: ENABLED
echo 📊 Live Charts: ENABLED
echo ========================================
echo.
echo Default Login Credentials:
echo Employee: john.doe@company.com / password123
echo HR: hr@company.com / password123
echo.
echo Fallback Credentials:
echo Employee: employee@example.com / 12345
echo HR: hr@example.com / admin123
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

node server.js

echo.
echo Server stopped. Press any key to exit...
pause >nul
