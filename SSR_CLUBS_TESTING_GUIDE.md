# SSR Clubs Testing Guide

## How to Test the New SSR Clubs

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Navigate to Clubs Page

Open your browser and go to:
```
http://localhost:3000/dashboard/clubs
```

Or with specific tab:
```
http://localhost:3000/dashboard/clubs?tab=browse
http://localhost:3000/dashboard/clubs?tab=my-clubs
```

## Testing Checklist

### Browse Clubs Tab

- [ ] Page loads with all clubs displayed
- [ ] Clubs are shown in grid layout (2 cols mobile, 3 cols desktop)
- [ ] Each club card shows:
  - [ ] Logo or default icon
  - [ ] Club name and category badge
  - [ ] Description (truncated to 2 lines)
  - [ ] Member count
  - [ ] Registration status badge (Open/Closed/Not Yet Open)
  - [ ] Registration dates (if available)
  - [ ] Website button (if available)
  - [ ] Join/Request button
  - [ ] Support button (top-right corner)

### Join Club Functionality

#### For DIRECT Join Mode Clubs
- [ ] Click "Join Now" button
- [ ] Confirmation dialog appears
- [ ] Click "Confirm"
- [ ] Success toast appears
- [ ] Club appears in "My Clubs" tab
- [ ] Email notification received

#### For REQUEST Join Mode Clubs
- [ ] Click "Request to Join" button
- [ ] Request is submitted
- [ ] Success toast appears
- [ ] Button changes to "Request Pending"
- [ ] Button is disabled

#### Profile Incomplete
- [ ] If profile is incomplete, modal appears
- [ ] Fill in required fields:
  - [ ] Full Name
  - [ ] Student ID
  - [ ] Faculty (dropdown)
  - [ ] Major
- [ ] Click "Save Profile"
- [ ] Success toast appears
- [ ] Can now join clubs

### Registration Validation

#### Not Yet Open
- [ ] Clubs with future start date show "Not Yet Open" badge
- [ ] Shows "Opens on [date]" message
- [ ] Join button is disabled
- [ ] Clicking shows error toast with open date

#### Closed Registration
- [ ] Clubs with past end date show "Closed" badge
- [ ] Join button is disabled
- [ ] Clicking shows "Registration period has ended" error

#### Open Registration
- [ ] Clubs with active registration show "Open" badge
- [ ] Join button is enabled
- [ ] Can join successfully

### My Clubs Tab

- [ ] Tab switches to "My Clubs"
- [ ] URL updates to `?tab=my-clubs`
- [ ] Shows all joined clubs
- [ ] Each club card shows:
  - [ ] Same information as Browse tab
  - [ ] "Leave" button instead of "Join"
  - [ ] Support button

#### Leave Club
- [ ] Click "Leave" button
- [ ] Club is removed from list
- [ ] Success toast appears
- [ ] Club appears in Browse tab again

#### Empty State
- [ ] If no clubs joined, shows empty state
- [ ] Shows "Browse Clubs" button
- [ ] Clicking button switches to Browse tab

### Website Links

- [ ] Clubs with website show "Visit Website" button
- [ ] Clicking opens website in new tab
- [ ] Link has proper security attributes (noopener noreferrer)

### Support Modal

- [ ] Click support button (help icon) on any club card
- [ ] Support modal opens
- [ ] Shows club name in context
- [ ] Can submit support request
- [ ] Modal closes after submission

### Responsive Design

#### Mobile (< 768px)
- [ ] 2 columns grid layout
- [ ] Smaller text sizes
- [ ] Compact spacing
- [ ] Touch-friendly buttons
- [ ] Support button visible and clickable

#### Desktop (>= 768px)
- [ ] 3 columns grid layout (on large screens)
- [ ] Normal text sizes
- [ ] Comfortable spacing
- [ ] Hover effects work

### Tab Navigation

- [ ] Click "Browse Clubs" tab
- [ ] URL updates to `?tab=browse`
- [ ] Content switches to browse view
- [ ] Click "My Clubs" tab
- [ ] URL updates to `?tab=my-clubs`
- [ ] Content switches to my clubs view
- [ ] Browser back/forward buttons work
- [ ] Direct URL navigation works

### Loading States

- [ ] Initial page load shows skeleton
- [ ] Join button shows loading spinner during request
- [ ] "Requesting..." text appears
- [ ] Button is disabled during loading

### Error Handling

- [ ] Network errors show error toast
- [ ] API errors show appropriate messages
- [ ] Failed requests don't break UI
- [ ] Can retry after error

## Common Issues and Solutions

### Issue: Clubs not loading
**Solution:** Check if database has clubs. Run admin panel to create clubs.

### Issue: Can't join clubs
**Solution:** Ensure profile is complete. Check registration dates.

### Issue: Support button not working
**Solution:** Check if SupportModal component is imported correctly.

### Issue: Leave club not working
**Solution:** Check API endpoint `/api/clubs/:id/leave` is working.

## Next Steps After Testing

1. If all tests pass, update navigation links
2. Add SSR Clubs link to dashboard sidebar
3. Add SSR Clubs link to mobile navigation
4. Monitor for any issues
5. Collect user feedback

## Build and Deploy

Once testing is complete:

```bash
# Build for production
npm run build

# Start production server
npm start
```

Check build output for any errors or warnings.

## Success Criteria

- [ ] All features work as expected
- [ ] No console errors
- [ ] Responsive on all screen sizes
- [ ] Fast page load times
- [ ] Smooth user experience
- [ ] All API calls succeed
- [ ] Real-time updates work

## Ready for Production!

Once all tests pass, the SSR Clubs implementation is ready for production deployment!

