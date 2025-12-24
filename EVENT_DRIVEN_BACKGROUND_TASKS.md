# Event-Driven Background Tasks (No Cron Jobs Required)

This document explains how we replaced cron jobs with event-driven background tasks to work with Vercel's free tier limitations.

## Problem

Vercel free tier only allows daily cron jobs (once per day). We needed:
1. Auto-release balances after 3-day holding period
2. Email notifications for unread messages

## Solution: Event-Driven Approach

### 1. Auto-Release Balances

**Trigger**: When user opens wallet tab in dashboard

**Implementation**:
- Created utility function: `src/lib/auto-release-balance.ts`
- API endpoint: `POST /api/balance/auto-release`
- Frontend integration: Dashboard wallet tab (`src/app/dashboard/page.tsx`)

**How it works**:
1. User opens wallet tab
2. Background API call triggers auto-release check
3. System finds all completed transactions older than 3 days
4. Moves pending balance to available balance
5. Creates notification for user

**Benefits**:
- Real-time updates when user checks their wallet
- No delay waiting for daily cron
- Runs only when needed (saves resources)

### 2. Unread Message Email Notifications

**Trigger**: When message is sent

**Implementation**:
- Created utility function: `src/lib/notify-unread-messages.ts`
- Integrated into: `src/app/api/messages/route.ts`

**How it works**:
1. User sends a message
2. Message is saved to database
3. After 60 seconds (setTimeout), check if message is still unread
4. If unread, send email notification to receiver
5. Mark message as email notification sent

**Benefits**:
- Near real-time notifications (1 minute delay)
- Only sends email if message is truly unread
- No spam if user reads message quickly

## Files Modified

### New Files
- `src/lib/auto-release-balance.ts` - Auto-release balance utility
- `src/lib/notify-unread-messages.ts` - Email notification utility
- `src/app/api/balance/auto-release/route.ts` - API endpoint for auto-release

### Modified Files
- `src/app/api/messages/route.ts` - Added email notification trigger
- `src/lib/api.ts` - Added autoReleaseBalances API method
- `src/app/dashboard/page.tsx` - Trigger auto-release on wallet tab load
- `vercel.json` - Removed cron jobs (now empty)

## Cron Jobs Removed

The following cron endpoints are no longer needed but kept for backward compatibility:
- `/api/cron/notify-unread-messages`
- `/api/cron/release-balances`

You can optionally delete these files if you want to clean up.

## Testing

### Test Auto-Release Balance
1. Create a transaction and complete payment
2. Wait 3 days (or modify the date in database for testing)
3. Open wallet tab in dashboard
4. Check if pending balance moved to available balance

### Test Email Notifications
1. Send a message to another user
2. Wait 60 seconds without the receiver reading it
3. Check email inbox for notification
4. Verify message is marked as emailNotificationSent in database

## Environment Variables Required

Make sure these are set in Vercel:
- `RESEND_API_KEY` - For sending emails
- `RESEND_FROM_EMAIL` - Sender email address
- `USE_REAL_EMAILS` - Set to "true" in production
- `NEXTAUTH_URL` - Your production URL

## Notes

- Auto-release runs in background, doesn't block UI
- Email notifications have 1-minute delay to avoid spam
- Both features are event-driven, no scheduled tasks needed
- Works perfectly with Vercel free tier

