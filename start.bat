@echo off
echo Starting HR Dashboard Application...
echo.
echo 1. Starting MongoDB connection...
echo 2. Starting Node.js server...
echo.
echo Server will be available at: http://localhost:5000
echo Login page will be available at: http://localhost:5000/login.html
echo.
echo Default Login Credentials:
echo Employee: employee@example.com / 12345
echo HR: hr@example.com / admin123
echo.
echo Press Ctrl+C to stop the server
echo.
node server.js
pause
