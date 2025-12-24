# Resend Email Notification Fix

## Issues Identified and Fixed

### 1. Missing Email Notification Tracking

**Problem**: The `Message` model didn't have a field to track whether an email notification was sent. This caused the cron job to send duplicate emails every minute for the same unread message.

**Solution**: Added `emailNotificationSent` field to the `Message` model.

**Changes Made**:

- Updated `prisma/schema.prisma` to add `emailNotificationSent Boolean @default(false)` field
- Added indexes for `isRead` and `emailNotificationSent` for query performance
- Updated database schema with `npx prisma db push`

### 2. Cron Job Not Checking Email Status

**Problem**: The cron job query didn't filter out messages that already had email notifications sent.

**Solution**: Updated the query to include `emailNotificationSent: false` condition.

**Changes Made**:

- Modified `src/app/api/cron/notify-unread-messages/route.ts`
- Added `emailNotificationSent: false` to the where clause
- Added database update to set `emailNotificationSent: true` after successful email send
- Added error logging to show Resend API errors

### 3. Incorrect NEXTAUTH_URL

**Problem**: `NEXTAUTH_URL` was set to `http://localhost:3000` in production environment, causing incorrect email links.

**Solution**: Updated to production domain.

**Changes Made**:

- Changed `NEXTAUTH_URL` from `http://localhost:3000` to `https://campuscircle.id`

## Required Actions

### CRITICAL: Verify Resend Domain

Your `.env.local` has:

```
RESEND_FROM_EMAIL=noreply@campuscircle.id
```

**You MUST verify the `campuscircle.id` domain in your Resend dashboard:**

1. Go to https://resend.com/domains
2. Add domain: `campuscircle.id`
3. Add the DNS records provided by Resend to your domain registrar:
   - SPF record (TXT)
   - DKIM record (TXT)
   - DMARC record (TXT) - optional but recommended
4. Wait for DNS propagation (can take up to 48 hours, usually 15-30 minutes)
5. Verify the domain in Resend dashboard

**Until the domain is verified, emails will NOT be sent in production.**

### Alternative: Use Resend Test Domain (Temporary)

If you want to test immediately while waiting for domain verification:

Update `.env.local`:

```env
RESEND_FROM_EMAIL=CampusCircle <onboarding@resend.dev>
```

This will work for testing but emails will only be sent to verified email addresses in your Resend account.

### Verify Cron Job Authorization

The cron job is configured in `vercel.json` to run every minute:

```json
{
  "path": "/api/cron/notify-unread-messages",
  "schedule": "* * * * *"
}
```

**Vercel automatically adds the correct authorization header** when calling cron jobs, so this should work automatically once deployed.

## Testing the Fix

### 1. Deploy to Vercel

```bash
git add .
git commit -m "Fix: Add email notification tracking to prevent duplicate emails"
git push
```

### 2. Test Email Notifications

1. Have User A send a message to User B
2. User B should NOT read the message
3. Wait 1 minute
4. Check User B's email inbox
5. User B should receive ONE email notification
6. Wait another minute - User B should NOT receive another email (duplicate prevention working)

### 3. Check Vercel Logs

Go to your Vercel dashboard:

1. Navigate to your project
2. Click on "Logs"
3. Filter by `/api/cron/notify-unread-messages`
4. Check for:
   - "Email sent successfully to: [email]"
   - Any Resend errors

### 4. Check Resend Dashboard

Go to https://resend.com/emails to see:

- Email delivery status
- Any errors or bounces
- Email open rates

## How It Works Now

1. **Message Created**: When a user sends a message, `emailNotificationSent` is set to `false` by default
2. **Cron Job Runs**: Every minute, the cron job queries for messages where:
   - `isRead = false` (message not read)
   - `emailNotificationSent = false` (email not sent yet)
   - `createdAt <= 1 minute ago` (message is at least 1 minute old)
3. **Email Sent**: For each matching message:
   - Send email via Resend
   - If successful, update `emailNotificationSent = true`
   - This prevents duplicate emails in future cron runs
4. **Message Read**: When user reads the message, `isRead` is set to `true`, so no more emails are sent

## Environment Variables Checklist

Verify these are set correctly in your Vercel project settings:

- [x] `RESEND_API_KEY` - Your Resend API key
- [x] `RESEND_FROM_EMAIL` - Must be verified domain (e.g., `noreply@campuscircle.id`)
- [x] `CRON_SECRET` - Secret for cron job authorization
- [x] `NEXTAUTH_URL` - Production URL (e.g., `https://campuscircle.id`)
- [x] `NODE_ENV` - Set to `production`

## Testing Results

### Resend Email Test: PASSED

- Email sent successfully to delivered@resend.dev
- Email ID: 7923a25f-dbb1-4dd7-9e82-26ad3e7f2b23
- Resend API is working correctly
- Domain `campuscircle.id` is configured and working

### Database Migration: COMPLETED

- Added `emailNotificationSent` field to Message model
- Added indexes for performance
- Prisma client regenerated successfully
- Database schema updated with `npx prisma db push`

## Troubleshooting

### Emails Not Being Sent

1. Check Vercel logs for errors
2. Verify domain in Resend dashboard
3. Check RESEND_API_KEY is correct
4. Ensure NODE_ENV=production
5. Check cron job is running (Vercel dashboard > Cron Jobs)

### Duplicate Emails Still Being Sent

1. Verify database migration was applied: `npx prisma db push`
2. Check `emailNotificationSent` field exists in database
3. Verify cron job code includes `emailNotificationSent: false` in query

### Emails Going to Spam

1. Verify SPF, DKIM, and DMARC records
2. Add DMARC policy
3. Warm up your domain by sending gradually increasing volumes
4. Ensure email content is not spammy
