Write-Host "Updating Database Schema for My AI Feature..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Removing Prisma cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue
Write-Host "  Cache cleared" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Removing Next.js cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Write-Host "  Next.js cache cleared" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Pushing schema to Supabase (safe, no data loss)..." -ForegroundColor Yellow
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Error pushing schema to database!" -ForegroundColor Red
    Write-Host "  Please check your DATABASE_URL in .env.local" -ForegroundColor Red
    exit 1
}
Write-Host "  Schema pushed successfully" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Error generating Prisma Client!" -ForegroundColor Red
    exit 1
}
Write-Host "  Prisma Client generated successfully" -ForegroundColor Green

Write-Host ""
Write-Host "All done! The following tables were added to your database:" -ForegroundColor Cyan
Write-Host "  - AINote (for manual note-taking with AI assistance)" -ForegroundColor White
Write-Host "  - LiveLectureInterest (for tracking user interest)" -ForegroundColor White
Write-Host ""
Write-Host "Your existing data is safe and unchanged." -ForegroundColor Green
Write-Host ""
Write-Host "Now restart your dev server:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host ""

