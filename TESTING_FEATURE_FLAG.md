# Testing CSR/SSR Feature Flag

## Quick Test Checklist

### Test 1: Enable SSR Mode

**Setup:**
```bash
# In .env or .env.local
NEXT_PUBLIC_ENABLE_SSR_COMPONENTS=true
```

**Steps:**
1. Restart dev server: `npm run dev`
2. Clear browser cache (Ctrl+Shift+Delete)
3. Visit `http://localhost:3000/dashboard`

**Expected Results:**
- [ ] Mobile bottom navigation shows only "Messages" tab
- [ ] Desktop sidebar shows only "Messages" tab
- [ ] Green migration notice card is visible at top
- [ ] Migration notice has 4 buttons: Marketplace, Clubs, My Hub, Wallet
- [ ] No "Discovery", "Clubs", or "My Hub" CSR tabs visible
- [ ] Default active tab is "Messages"
- [ ] SSR navigation links visible with green "SSR" badges

**Test Navigation:**
- [ ] Click "Marketplace" button in notice - goes to `/dashboard/marketplace`
- [ ] Click "Clubs" button in notice - goes to `/dashboard/clubs`
- [ ] Click "My Hub" button in notice - goes to `/dashboard/my-hub`
- [ ] Click "Wallet" button in notice - goes to `/dashboard/wallet`

### Test 2: Disable SSR Mode (CSR Fallback)

**Setup:**
```bash
# In .env or .env.local
NEXT_PUBLIC_ENABLE_SSR_COMPONENTS=false
```

**Steps:**
1. Restart dev server: `npm run dev`
2. Clear browser cache
3. Visit `http://localhost:3000/dashboard`

**Expected Results:**
- [ ] Mobile bottom navigation shows: Market, Clubs, My Hub tabs
- [ ] Desktop sidebar shows: Marketplace, Clubs, My Hub tabs
- [ ] No migration notice card visible
- [ ] All CSR tabs are functional
- [ ] Default active tab is "Discovery" (Marketplace)
- [ ] No green "SSR" badges visible

**Test Navigation:**
- [ ] Click "Market" tab - shows marketplace content
- [ ] Click "Clubs" tab - shows clubs content
- [ ] Click "My Hub" tab - shows my hub content
- [ ] All tabs work without page reload

### Test 3: SSR Pages Direct Access

**Setup:**
```bash
NEXT_PUBLIC_ENABLE_SSR_COMPONENTS=true
```

**Test URLs:**
- [ ] `/dashboard/marketplace` - Loads marketplace page
- [ ] `/dashboard/marketplace?mode=study` - Shows study materials
- [ ] `/dashboard/marketplace?mode=food` - Shows food items
- [ ] `/dashboard/marketplace?mode=event` - Shows events
- [ ] `/dashboard/clubs` - Loads clubs page
- [ ] `/dashboard/clubs?tab=browse` - Shows browse clubs
- [ ] `/dashboard/clubs?tab=my-clubs` - Shows my clubs
- [ ] `/dashboard/my-hub` - Loads my hub page
- [ ] `/dashboard/my-hub?tab=purchases` - Shows purchases
- [ ] `/dashboard/my-hub?tab=library` - Shows library
- [ ] `/dashboard/my-hub?tab=sales` - Shows sales
- [ ] `/dashboard/wallet` - Loads wallet page
- [ ] `/dashboard/messages` - Loads messages page

### Test 4: Feature Flag Functions

**Test in Browser Console:**

```javascript
// Should return true when SSR enabled
isSSRComponentsEnabled()

// Should return false when SSR enabled
isCSRComponentsEnabled()

// Should return ["discovery", "clubs", "my-hub"] when SSR enabled
getHiddenCSRTabs()

// Should return false for hidden tabs when SSR enabled
shouldShowCSRTab("discovery")
shouldShowCSRTab("clubs")
shouldShowCSRTab("my-hub")

// Should return true for messages tab
shouldShowCSRTab("messages")
```

### Test 5: Mobile Responsiveness

**SSR Mode (true):**
- [ ] Mobile: Only Messages tab visible in bottom bar
- [ ] Tablet: Same as mobile
- [ ] Desktop: Only Messages in sidebar

**CSR Mode (false):**
- [ ] Mobile: All tabs visible in bottom bar
- [ ] Tablet: All tabs visible
- [ ] Desktop: All tabs visible in sidebar

### Test 6: Performance Comparison

**SSR Pages:**
1. Open DevTools Network tab
2. Visit `/dashboard/marketplace`
3. Check "Time to First Byte" (TTFB)
4. Check "First Contentful Paint" (FCP)

**CSR Pages:**
1. Set SSR to false
2. Visit `/dashboard` and click Discovery tab
3. Compare TTFB and FCP

**Expected:** SSR should have faster FCP

### Test 7: Deep Linking

**SSR Mode:**
- [ ] Share link `/dashboard/clubs?tab=my-clubs`
- [ ] Open in new tab
- [ ] Should open directly to "My Clubs" tab

**CSR Mode:**
- [ ] Share link `/dashboard?tab=clubs`
- [ ] Open in new tab
- [ ] Should open to clubs tab (if supported)

## Common Issues

### Issue: Changes not reflecting

**Solution:**
1. Restart dev server
2. Clear browser cache
3. Hard reload (Ctrl+Shift+R)

### Issue: Both CSR and SSR visible

**Solution:**
1. Check `.env` file location (must be in project root)
2. Verify variable name is exact: `NEXT_PUBLIC_ENABLE_SSR_COMPONENTS`
3. Check for typos in value: `true` or `false` (lowercase)

### Issue: Migration notice not showing

**Solution:**
1. Ensure you're on `/dashboard` route (not `/dashboard/marketplace`)
2. Verify SSR is enabled
3. Clear browser cache

## Automated Testing Script

```bash
# Test SSR Mode
echo "NEXT_PUBLIC_ENABLE_SSR_COMPONENTS=true" > .env.local
npm run dev &
sleep 5
curl http://localhost:3000/dashboard | grep "New SSR Features Available"

# Test CSR Mode
echo "NEXT_PUBLIC_ENABLE_SSR_COMPONENTS=false" > .env.local
npm run dev &
sleep 5
curl http://localhost:3000/dashboard | grep "Marketplace"
```

## Deployment Testing

### Staging Environment

1. Set environment variable in hosting platform
2. Deploy to staging
3. Run all tests above
4. Verify no console errors
5. Test on multiple devices

### Production Rollout

1. Deploy with SSR enabled
2. Monitor error logs
3. Check analytics for page load times
4. Have rollback plan ready (set to false)

## Success Criteria

- [ ] All tests pass in SSR mode
- [ ] All tests pass in CSR mode
- [ ] No console errors in either mode
- [ ] Navigation works smoothly
- [ ] Performance is better in SSR mode
- [ ] Deep linking works in SSR mode
- [ ] Mobile experience is good in both modes

