@echo off
echo.
echo ========================================
echo Fixing Prisma Client Generation Issue
echo ========================================
echo.
echo IMPORTANT: Please stop your dev server (Ctrl+C) before continuing!
echo Press any key when ready...
pause >nul

echo.
echo Attempting to generate Prisma Client...
echo.

timeout /t 2 /nobreak >nul

npx prisma generate

if errorlevel 1 (
    echo.
    echo ========================================
    echo Still having issues? Try this:
    echo ========================================
    echo.
    echo 1. Make sure dev server is stopped
    echo 2. Close VS Code
    echo 3. Run this command in a fresh terminal:
    echo    npx prisma generate
    echo 4. Restart VS Code
    echo 5. Run: npm run dev
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Success! Prisma Client generated.
echo ========================================
echo.
echo Now you can start your dev server:
echo   npm run dev
echo.
echo Then navigate to: http://localhost:3000/dashboard/my-ai
echo.
pause

