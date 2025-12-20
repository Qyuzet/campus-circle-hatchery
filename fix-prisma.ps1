Write-Host "Fixing Prisma Client..." -ForegroundColor Cyan

Write-Host "Step 1: Removing .prisma cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue

Write-Host "Step 2: Removing .next cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

Write-Host "Step 3: Regenerating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "" 
Write-Host "Done! Now run: npm run dev" -ForegroundColor Green

