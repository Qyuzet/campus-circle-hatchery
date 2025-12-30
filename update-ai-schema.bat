@echo off
echo.
echo ========================================
echo Updating Database Schema for My AI Feature
echo ========================================
echo.

echo Step 1: Removing Prisma cache...
if exist "node_modules\.prisma" (
    rmdir /s /q "node_modules\.prisma"
    echo   Cache cleared
) else (
    echo   No cache to clear
)

echo.
echo Step 2: Removing Next.js cache...
if exist ".next" (
    rmdir /s /q ".next"
    echo   Next.js cache cleared
) else (
    echo   No cache to clear
)

echo.
echo Step 3: Pushing schema to Supabase (safe, no data loss)...
call npx prisma db push
if errorlevel 1 (
    echo.
    echo   ERROR: Failed to push schema to database!
    echo   Please check your DATABASE_URL in .env.local
    pause
    exit /b 1
)
echo   Schema pushed successfully

echo.
echo Step 4: Generating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo.
    echo   ERROR: Failed to generate Prisma Client!
    pause
    exit /b 1
)
echo   Prisma Client generated successfully

echo.
echo ========================================
echo All done! The following tables were added:
echo   - AINote (for manual note-taking)
echo   - LiveLectureInterest (for user interest)
echo.
echo Your existing data is safe and unchanged.
echo ========================================
echo.
echo Now restart your dev server:
echo   npm run dev
echo.
pause

