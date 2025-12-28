# Testing Guide: SSR Messages Implementation

## Prerequisites

1. Enable SSR components in `.env.local`:
```bash
NEXT_PUBLIC_ENABLE_SSR_COMPONENTS=true
```

2. Start the development server:
```bash
npm run dev
```

3. Ensure you have:
   - At least 2 user accounts
   - Some existing conversations
   - Some existing groups
   - Pusher credentials configured

## Test Cases

### 1. Initial Page Load
**Steps:**
1. Navigate to `http://localhost:3000/dashboard/messages`
2. Observe the page load

**Expected:**
- Page loads quickly with data already visible
- No loading spinner for initial conversations/groups
- Conversations list shows on the left
- Empty state shows on the right (no conversation selected)

**Pass/Fail:** ___

### 2. View Conversations List
**Steps:**
1. Click on "Chats" tab
2. Observe the conversations list

**Expected:**
- All conversations are displayed
- Each shows: avatar, name, last message, timestamp
- Unread badges show if applicable
- List is scrollable if many conversations

**Pass/Fail:** ___

### 3. View Groups List
**Steps:**
1. Click on "Groups" tab
2. Observe the groups list

**Expected:**
- All groups are displayed
- Each shows: group icon, name, last message, member count
- List is scrollable if many groups

**Pass/Fail:** ___

### 4. Open Conversation
**Steps:**
1. Click on a conversation from the list
2. Observe the URL and chat area

**Expected:**
- URL updates to `?conversation=<id>&mode=conversations`
- Chat area opens on the right
- Messages load and display
- Message input is ready
- Conversation is highlighted in the list

**Pass/Fail:** ___

### 5. Send Message
**Steps:**
1. Open a conversation
2. Type a message
3. Press Enter or click Send

**Expected:**
- Message appears immediately (optimistic update)
- Message is sent to server
- Message persists after refresh
- Timestamp is correct

**Pass/Fail:** ___

### 6. Receive Real-time Message
**Steps:**
1. Open a conversation in one browser
2. Send a message from another browser/user
3. Observe the first browser

**Expected:**
- Message appears in real-time
- Notification sound plays
- Toast notification shows
- Conversation list updates with new message

**Pass/Fail:** ___

### 7. Deep Linking
**Steps:**
1. Copy URL with conversation ID: `/dashboard/messages?conversation=<id>`
2. Open in new tab or share with someone
3. Navigate to the URL

**Expected:**
- Page loads with conversation already open
- Messages are visible
- Can send messages immediately

**Pass/Fail:** ___

### 8. Browser Navigation
**Steps:**
1. Open conversation A
2. Open conversation B
3. Click browser back button
4. Click browser forward button

**Expected:**
- Back button returns to conversation A
- Forward button returns to conversation B
- URL updates correctly
- Messages load correctly

**Pass/Fail:** ___

### 9. Mobile Responsive
**Steps:**
1. Open on mobile or resize browser to mobile width
2. View conversations list
3. Open a conversation
4. Send a message

**Expected:**
- Conversations list takes full width
- When conversation opens, list hides
- Back button appears to return to list
- Chat area is usable on mobile
- Keyboard doesn't break layout

**Pass/Fail:** ___

### 10. Group Chat
**Steps:**
1. Click "Groups" tab
2. Open a group
3. Send a message
4. Observe sender names

**Expected:**
- Group opens correctly
- Messages show sender names
- Can send messages
- Real-time updates work
- Member count is visible

**Pass/Fail:** ___

### 11. Empty States
**Steps:**
1. Test with account that has no conversations
2. Test with account that has no groups

**Expected:**
- "No conversations yet" message shows
- "No groups yet" message shows
- Helpful text guides user
- Icons are visible

**Pass/Fail:** ___

### 12. Loading States
**Steps:**
1. Open a conversation
2. Observe loading behavior
3. Send a message while network is slow

**Expected:**
- Loading spinner shows while fetching messages
- Optimistic message shows immediately
- No UI freezing
- Smooth transitions

**Pass/Fail:** ___

### 13. Error Handling
**Steps:**
1. Disconnect internet
2. Try to send a message
3. Reconnect internet

**Expected:**
- Error toast shows
- Optimistic message is removed
- Can retry after reconnection
- No crashes

**Pass/Fail:** ___

### 14. SSR Header Link
**Steps:**
1. Look at the dashboard header
2. Hover over Messages icon
3. Click the Messages icon

**Expected:**
- "SSR" tooltip shows on hover
- Clicking navigates to `/dashboard/messages`
- Unread count badge shows if applicable

**Pass/Fail:** ___

### 15. Performance
**Steps:**
1. Open DevTools Network tab
2. Navigate to `/dashboard/messages`
3. Observe network requests

**Expected:**
- Initial HTML contains data (view source)
- Fewer API calls than CSR version
- Page is interactive quickly
- No unnecessary re-renders

**Pass/Fail:** ___

## Performance Benchmarks

### Metrics to Measure:
- **Time to First Byte (TTFB):** Should be < 500ms
- **First Contentful Paint (FCP):** Should be < 1s
- **Time to Interactive (TTI):** Should be < 2s
- **Total Blocking Time (TBT):** Should be < 300ms

### How to Measure:
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run performance audit
4. Record scores

**Results:**
- Performance Score: ___/100
- TTFB: ___ ms
- FCP: ___ ms
- TTI: ___ ms
- TBT: ___ ms

## Comparison Test

### Test both implementations:
1. CSR: `/dashboard?tab=messages`
2. SSR: `/dashboard/messages`

### Compare:
- Initial load speed
- Time to see data
- Number of network requests
- Bundle size
- User experience

**Winner:** ___

## Known Issues
Document any issues found during testing:

1. Issue: ___
   - Steps to reproduce: ___
   - Expected: ___
   - Actual: ___
   - Severity: ___

## Sign-off

- [ ] All test cases passed
- [ ] Performance is acceptable
- [ ] No critical bugs found
- [ ] Ready for production

**Tested by:** _______________
**Date:** _______________
**Notes:** _______________

