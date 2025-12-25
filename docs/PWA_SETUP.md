# Progressive Web App (PWA) Setup

CampusCircle is now a fully functional Progressive Web App that can be installed on mobile devices and desktops.

## Features

### 1. Install Prompt
- Users will see an install prompt after 3 seconds on the landing page
- The prompt appears at the bottom of the screen with install and dismiss options
- Only shows if the app is not already installed

### 2. Smart Redirect Logic
When the app is installed and opened:
- **Not logged in**: Redirects to `/auth/signin` (login page)
- **Already logged in**: Redirects to `/dashboard` (main app)
- **Browser access**: Shows normal landing page

### 3. Offline Support
- Service worker caches essential pages and assets
- App works offline for previously visited pages
- Automatic cache updates when online

### 4. App Shortcuts
Long-press the app icon to access quick shortcuts:
- Dashboard
- Messages

## How to Install

### On Mobile (Android/iOS)

#### Chrome (Android)
1. Visit the website
2. Tap the install prompt that appears, OR
3. Tap the menu (3 dots) > "Install app" or "Add to Home Screen"
4. Confirm installation

#### Safari (iOS)
1. Visit the website
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Name the app and tap "Add"

### On Desktop

#### Chrome/Edge
1. Visit the website
2. Click the install icon in the address bar (computer with down arrow), OR
3. Click the menu (3 dots) > "Install CampusCircle"
4. Confirm installation

## Technical Details

### Files Added
- `public/site.webmanifest` - PWA manifest configuration
- `public/sw.js` - Service worker for offline support
- `src/components/PWARedirect.tsx` - Smart redirect logic
- `src/components/PWAInstaller.tsx` - Install prompt component

### Manifest Configuration
```json
{
  "name": "CampusCircle - All-in-One Campus Platform",
  "short_name": "CampusCircle",
  "start_url": "/dashboard?source=pwa",
  "display": "standalone",
  "theme_color": "#3b82f6"
}
```

### Detection Logic
The app detects PWA mode using:
1. `window.matchMedia("(display-mode: standalone)").matches`
2. `window.navigator.standalone` (iOS)
3. URL parameter `?source=pwa`

## User Experience

### First Time User (PWA)
1. Opens installed app
2. Sees login page
3. Logs in
4. Redirected to dashboard

### Returning User (PWA)
1. Opens installed app
2. Automatically redirected to dashboard
3. No landing page shown

### Browser User
1. Visits website
2. Sees landing page
3. Can browse normally
4. Gets install prompt after 3 seconds

## Benefits

1. **Faster Access**: One tap to open the app
2. **Native Feel**: Runs in standalone mode without browser UI
3. **Offline Support**: Works without internet for cached pages
4. **Push Notifications**: Ready for future notification features
5. **Better UX**: Direct access to dashboard for logged-in users
6. **App-like Experience**: Feels like a native mobile app

## Testing

### Test PWA Redirect
1. Install the app
2. Open it
3. Should redirect to dashboard (if logged in) or login page (if not)

### Test Install Prompt
1. Visit website in browser (not installed)
2. Wait 3 seconds
3. Install prompt should appear at bottom

### Test Offline
1. Install the app
2. Visit dashboard
3. Turn off internet
4. Refresh page
5. Should still load from cache

## Future Enhancements

- Push notifications for new messages
- Background sync for offline actions
- App badge for unread messages
- Share target API for sharing content to CampusCircle

