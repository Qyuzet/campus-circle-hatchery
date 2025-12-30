# My AI Feature - Setup Instructions

## Current Status

✅ **Database Schema Updated Successfully!**

Your Supabase database now has the following new tables:
- `AINote` - For storing AI-powered notes
- `LiveLectureInterest` - For tracking user interest in live lecture feature

✅ **All existing data is safe and unchanged**

⚠️ **Prisma Client needs to be regenerated**

## The Issue

You're seeing this error:
```
EPERM: operation not permitted, rename 'query_engine-windows.dll.node'
```

This is a Windows file locking issue that occurs when:
- Your dev server (`npm run dev`) is running
- The Prisma client files are being used by the running process
- Windows won't allow the files to be replaced while they're in use

## Quick Fix (Choose One Method)

### Method 1: Using the Batch File (Easiest)

1. **Stop your dev server** (Press `Ctrl + C` in the terminal running `npm run dev`)
2. **Wait 5 seconds** for the process to fully stop
3. **Run the fix script:**
   ```cmd
   fix-prisma-client.bat
   ```
4. **Start dev server:**
   ```cmd
   npm run dev
   ```

### Method 2: Manual Steps

1. **Stop your dev server** (Press `Ctrl + C`)
2. **Wait 5 seconds**
3. **Run:**
   ```cmd
   npx prisma generate
   ```
4. **Start dev server:**
   ```cmd
   npm run dev
   ```

### Method 3: If Still Having Issues

Sometimes the process doesn't fully release the files. Try this:

1. **Stop dev server** (Ctrl + C)
2. **Close VS Code completely**
3. **Open a fresh Command Prompt or PowerShell**
4. **Navigate to your project:**
   ```cmd
   cd D:\WORKSPACE\PERSONAL\PORTOFOLIO\VIBING\campusCircle
   ```
5. **Run:**
   ```cmd
   npx prisma generate
   ```
6. **Reopen VS Code**
7. **Start dev server:**
   ```cmd
   npm run dev
   ```

## Verify It's Working

After regenerating the Prisma client and starting the dev server:

1. Navigate to: `http://localhost:3000/dashboard/my-ai`
2. You should see the My AI page with two tabs:
   - **AI Notes** - Create and manage notes
   - **Live Lecture** - Express interest form

If you see the page without errors, everything is working!

## What Was Added

### Database Tables

**AINote Table:**
- Stores user notes with AI-generated summaries
- Fields: title, content, subject, course, tags, aiSummary, aiKeyPoints, etc.

**LiveLectureInterest Table:**
- Tracks user interest in the upcoming live lecture feature
- Fields: email, name, faculty, major, useCase, frequency, features

### New Files Created

**Pages:**
- `src/app/dashboard/my-ai/page.tsx`

**Components:**
- `src/components/my-ai/MyAIClient.tsx`
- `src/components/my-ai/NotesTab.tsx`
- `src/components/my-ai/NoteCard.tsx`
- `src/components/my-ai/CreateNoteDialog.tsx`
- `src/components/my-ai/ViewNoteDialog.tsx`
- `src/components/my-ai/EditNoteDialog.tsx`
- `src/components/my-ai/LiveLectureTab.tsx`

**API Routes:**
- `src/app/api/ai-notes/route.ts`
- `src/app/api/ai-notes/[id]/route.ts`
- `src/app/api/ai-notes/generate-summary/route.ts`
- `src/app/api/live-lecture-interest/route.ts`

**Helper Scripts:**
- `update-ai-schema.bat`
- `update-ai-schema.ps1`
- `fix-prisma-client.bat`
- `scripts/update-ai-schema.js`

## Features

### AI Notes
- Create notes with title, content, subject, course, and tags
- Automatic AI summary generation (for notes 100+ characters)
- AI extracts key points, concepts, and definitions
- Search, filter, and sort functionality
- Full CRUD operations

### Live Lecture (Coming Soon)
- Interest form for users to express demand
- Collects use cases and desired features
- Stores preferences for future development

## Troubleshooting

### Error: "Cannot read properties of undefined (reading 'findMany')"

This means the Prisma client hasn't been regenerated yet. Follow the Quick Fix steps above.

### Error: "EPERM: operation not permitted"

The dev server is still running. Make sure to:
1. Stop the dev server completely
2. Wait a few seconds
3. Try again

### Still Not Working?

1. Check that your `.env.local` has the correct `DATABASE_URL` and `DIRECT_URL`
2. Verify you can connect to Supabase
3. Try restarting your computer (last resort)

## Git Commit

Once everything is working, commit your changes:

```bash
git add .
git commit -m "feat: Add My AI feature with note-taking and live lecture interest form"
git push origin main
```

## Need Help?

If you're still experiencing issues, please provide:
1. The exact error message
2. Whether the dev server is running or stopped
3. The output of `npx prisma generate`

