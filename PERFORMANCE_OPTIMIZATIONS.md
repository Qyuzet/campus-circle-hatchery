# Performance Optimizations

## Issue: Slow Navigation and Constant API Calls

### Problems Identified

#### 1. Aggressive API Polling

The `UnreadMessagesContext` was polling the conversations API every 3 seconds on ALL pages, causing:

- Constant API calls blocking navigation
- Performance degradation when switching pages
- Unnecessary network traffic
- Poor user experience

#### 2. Infinite Re-render Loop in My AI Page

The `BlockEditor` component had an infinite re-render loop caused by:

- `onChange` callback being recreated on every render
- `useEffect` dependency array including the unstable `onChange` function
- This caused the My AI page to freeze and block navigation

### Root Causes

#### API Polling Issue

```typescript
// Before: Aggressive polling every 3 seconds
pollingIntervalRef.current = setInterval(() => {
  refreshUnreadCount();
}, 3000);
```

This was running on every page in the application, even when the user was not on the messages page.

#### Re-render Loop Issue

```typescript
// Before: Unstable callback causing infinite loop
<BlockEditor
  initialBlocks={blocks}
  onChange={(newBlocks) => setBlocks(newBlocks)} // New function every render!
/>;

// In BlockEditor.tsx
useEffect(() => {
  onChange(blocks);
}, [blocks, onChange]); // onChange changes every render, causing infinite loop
```

## Solutions Implemented

### 1. Page Visibility API Integration

Only poll when the browser tab is active:

```typescript
const handleVisibilityChange = () => {
  isPageVisibleRef.current = !document.hidden;

  if (isPageVisibleRef.current) {
    refreshUnreadCount();
  }
};

document.addEventListener("visibilitychange", handleVisibilityChange);
```

### 2. Increased Polling Interval

Changed from 3 seconds to 10 seconds:

```typescript
// After: Less aggressive polling every 10 seconds
pollingIntervalRef.current = setInterval(() => {
  if (isPageVisibleRef.current && !isFetchingRef.current) {
    refreshUnreadCount();
  }
}, 10000);
```

### 3. Request Deduplication

Prevent multiple simultaneous API calls:

```typescript
const isFetchingRef = useRef(false);

const refreshUnreadCount = async () => {
  if (isFetchingRef.current) {
    return; // Skip if already fetching
  }

  try {
    isFetchingRef.current = true;
    // ... fetch logic
  } finally {
    isFetchingRef.current = false;
  }
};
```

### 4. Memoized Callbacks with useCallback

Stabilize the `onChange` callback to prevent recreation on every render:

```typescript
// In CreateNoteForm.tsx and CreateNoteDialog.tsx
const handleBlocksChange = useCallback((newBlocks: Block[]) => {
  setBlocks(newBlocks);
}, []);

<BlockEditor initialBlocks={blocks} onChange={handleBlocksChange} />;
```

### 5. Fixed useEffect Dependency Array

Remove unstable `onChange` from dependency array:

```typescript
// In BlockEditor.tsx
useEffect(() => {
  onChange(blocks);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [blocks]); // Only depend on blocks, not onChange
```

## Performance Improvements

### Before

- API calls: Every 3 seconds (20 calls/minute)
- Runs on: All pages, even when tab is inactive
- Concurrent requests: Possible
- Navigation impact: High (blocking)
- My AI page: Infinite re-renders, completely frozen

### After

- API calls: Every 10 seconds (6 calls/minute)
- Runs on: Only when tab is active
- Concurrent requests: Prevented
- Navigation impact: Minimal
- My AI page: Smooth, no re-render loops

### Impact

- 70% reduction in API calls (20 → 6 per minute)
- 0 API calls when tab is inactive
- Smoother navigation between pages
- Better battery life on mobile devices
- Reduced server load
- My AI page now navigates instantly without freezing
- Block editor works smoothly without performance issues

## Additional Optimizations to Consider

### Future Improvements

1. **WebSocket Integration**: Replace polling with real-time WebSocket connections
2. **Service Worker**: Cache unread counts and sync in background
3. **Request Batching**: Combine multiple API calls into single requests
4. **Exponential Backoff**: Slow down polling when no new messages
5. **Smart Polling**: Only poll when user is likely to receive messages

### Other Polling Intervals in Codebase

- `MessagesClient`: 2s polling (only active on messages page) ✓
- `MessageSellerModal`: 2s polling (only when modal open) ✓
- `PaymentPending`: 10s polling (only on payment page) ✓
- Dashboard payment checks: 5s then 15s (only on dashboard) ✓

All other polling intervals are scoped to specific pages/components and are acceptable.

## Testing Recommendations

1. Test navigation speed between pages (especially from My AI to other pages)
2. Monitor network tab for API call frequency
3. Verify unread count updates when receiving messages
4. Test tab switching behavior
5. Check mobile performance and battery usage
6. Test My AI page block editor functionality
7. Verify no console errors or warnings about re-renders

## Files Modified

- `src/contexts/UnreadMessagesContext.tsx` - API polling optimizations
- `src/components/my-ai/CreateNoteForm.tsx` - useCallback for onChange
- `src/components/my-ai/CreateNoteDialog.tsx` - useCallback for onChange
- `src/components/my-ai/BlockEditor/BlockEditor.tsx` - Fixed useEffect dependencies
