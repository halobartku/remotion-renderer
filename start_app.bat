@echo off
echo Starting Remotion Studio...
cd renderer
if %errorlevel% neq 0 (
    echo Error: Could not find 'renderer' directory.
    pause
    exit /b
)

echo Installing dependencies if needed...
if not exist node_modules (
    call npm install
)

echo Starting Server...
call npm run start-server
pause
