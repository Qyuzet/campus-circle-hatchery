const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('Updating Database Schema for My AI Feature');
console.log('========================================\n');

function runCommand(command, description) {
  console.log(`${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`  ✓ ${description} completed\n`);
    return true;
  } catch (error) {
    console.error(`  ✗ ${description} failed`);
    console.error(`  Error: ${error.message}\n`);
    return false;
  }
}

function removeDirectory(dirPath, description) {
  console.log(`${description}...`);
  try {
    const fullPath = path.join(process.cwd(), dirPath);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`  ✓ ${description} completed\n`);
    } else {
      console.log(`  ℹ No cache to clear\n`);
    }
    return true;
  } catch (error) {
    console.error(`  ✗ ${description} failed`);
    console.error(`  Error: ${error.message}\n`);
    return false;
  }
}

async function main() {
  console.log('Step 1: Removing Prisma cache');
  removeDirectory('node_modules/.prisma', 'Clearing Prisma cache');

  console.log('Step 2: Removing Next.js cache');
  removeDirectory('.next', 'Clearing Next.js cache');

  console.log('Step 3: Pushing schema to Supabase (safe, no data loss)');
  const pushSuccess = runCommand('npx prisma db push', 'Pushing schema to database');
  
  if (!pushSuccess) {
    console.error('\n❌ Failed to push schema to database!');
    console.error('Please check your DATABASE_URL in .env.local\n');
    process.exit(1);
  }

  console.log('Step 4: Generating Prisma Client');
  const generateSuccess = runCommand('npx prisma generate', 'Generating Prisma Client');
  
  if (!generateSuccess) {
    console.error('\n❌ Failed to generate Prisma Client!\n');
    process.exit(1);
  }

  console.log('========================================');
  console.log('✅ All done! The following tables were added:');
  console.log('   - AINote (for manual note-taking with AI assistance)');
  console.log('   - LiveLectureInterest (for tracking user interest)');
  console.log('\n✅ Your existing data is safe and unchanged.');
  console.log('========================================\n');
  console.log('Now restart your dev server:');
  console.log('  npm run dev\n');
}

main().catch((error) => {
  console.error('❌ An error occurred:', error);
  process.exit(1);
});

