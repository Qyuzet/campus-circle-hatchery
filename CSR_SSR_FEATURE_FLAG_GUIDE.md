# CSR/SSR Feature Flag Guide

## Overview

This guide explains how to toggle between Client-Side Rendering (CSR) and Server-Side Rendering (SSR) components in the Campus Circle application.

**IMPORTANT:** The feature flag now works as a clean toggle - when SSR is enabled, ONLY SSR navigation shows (no duplicates). When disabled, ONLY CSR navigation shows.

## Feature Flag System

### Environment Variable

The feature flag is controlled by a single environment variable:

```bash
NEXT_PUBLIC_ENABLE_SSR_COMPONENTS=true   # Enable SSR, hide CSR
NEXT_PUBLIC_ENABLE_SSR_COMPONENTS=false  # Disable SSR, show CSR
```

### Location

Add this to your `.env` or `.env.local` file in the project root.

## What Gets Toggled

### When SSR is ENABLED (`true`)

**Navigation Shows (Clean - No Duplicates):**

- Marketplace (Link to `/dashboard/marketplace`)
- Clubs (Link to `/dashboard/clubs`)
- My Hub (Link to `/dashboard/my-hub`)
- Messages (CSR tab - not yet converted)

**Hidden:**

- All CSR tab buttons for Discovery, Clubs, My Hub
- All CSR content sections

**Visible:**

- Migration notice card with quick links
- Only Messages tab content is available
- All SSR pages accessible via navigation links

**User Experience:**

- Clean navigation (no duplicates!)
- Faster initial page loads
- Better SEO
- Deep linking support with URL parameters
- Clicking navigation items navigates to SSR pages

### When SSR is DISABLED (`false`)

**Visible CSR Features:**

- All legacy `/dashboard` tabs work normally
- Discovery (Marketplace) tab
- Clubs tab
- My Hub tab
- Messages tab (CSR version)

**Hidden SSR Features:**

- SSR navigation links are hidden
- No migration notice shown
- SSR pages are still accessible via direct URL but not linked

## How to Toggle

### Enable SSR (Recommended for Production)

1. Open `.env` or `.env.local`
2. Add or update:
   ```bash
   NEXT_PUBLIC_ENABLE_SSR_COMPONENTS=true
   ```
3. Restart your development server:
   ```bash
   npm run dev
   ```
4. Clear browser cache and reload

### Disable SSR (Fallback to CSR)

1. Open `.env` or `.env.local`
2. Add or update:
   ```bash
   NEXT_PUBLIC_ENABLE_SSR_COMPONENTS=false
   ```
3. Restart your development server
4. Clear browser cache and reload

## Implementation Details

### Feature Flag Functions

Located in `src/lib/feature-flags.ts`:

```typescript
// Check if SSR is enabled
isSSRComponentsEnabled(): boolean

// Check if CSR should be shown
isCSRComponentsEnabled(): boolean

// Get list of hidden CSR tabs
getHiddenCSRTabs(): string[]

// Check if specific tab should show
shouldShowCSRTab(tabName: string): boolean
```

### Modified Files

1. **`src/lib/feature-flags.ts`**

   - Enhanced feature flag system
   - Added helper functions for tab visibility

2. **`src/app/dashboard/page.tsx`**
   - Conditionally hide CSR tabs in navigation
   - Conditionally hide CSR content sections
   - Show migration notice when SSR enabled
   - Default to "messages" tab when SSR enabled

## Testing

### Test SSR Mode

1. Set `NEXT_PUBLIC_ENABLE_SSR_COMPONENTS=true`
2. Restart server
3. Visit `/dashboard`
4. Verify:
   - Discovery, Clubs, My Hub tabs are hidden
   - Migration notice is shown
   - SSR links are visible with green badges
   - Default tab is "Messages"

### Test CSR Mode

1. Set `NEXT_PUBLIC_ENABLE_SSR_COMPONENTS=false`
2. Restart server
3. Visit `/dashboard`
4. Verify:
   - All tabs are visible
   - No migration notice
   - No SSR badges
   - Default tab is "Discovery"

## Deployment Strategy

### Recommended Approach

1. **Development:** Test with SSR enabled
2. **Staging:** Deploy with SSR enabled
3. **Production:** Deploy with SSR enabled
4. **Rollback Plan:** If issues occur, set to `false` and redeploy

### Environment-Specific Configuration

**Development (`.env.local`):**

```bash
NEXT_PUBLIC_ENABLE_SSR_COMPONENTS=true
```

**Production (Vercel/Hosting Platform):**
Add environment variable in hosting dashboard:

```
NEXT_PUBLIC_ENABLE_SSR_COMPONENTS=true
```

## Benefits of SSR Mode

1. **Performance:** Faster initial page loads
2. **SEO:** Better search engine indexing
3. **UX:** Deep linking with URL parameters
4. **Maintenance:** Cleaner, modular code
5. **Scalability:** Easier to add new features

## Troubleshooting

### SSR pages not showing

- Check environment variable is set correctly
- Restart development server
- Clear browser cache
- Check browser console for errors

### CSR tabs still visible

- Verify `.env` file is in project root
- Check variable name is exact: `NEXT_PUBLIC_ENABLE_SSR_COMPONENTS`
- Restart server (required for env changes)

### Migration notice not showing

- Ensure SSR is enabled
- Check you're on `/dashboard` route
- Clear browser cache

## Future Cleanup

Once SSR is stable in production, consider:

1. Remove legacy CSR code from `/dashboard/page.tsx`
2. Redirect `/dashboard` to `/dashboard/marketplace`
3. Remove feature flag system
4. Delete unused CSR components
