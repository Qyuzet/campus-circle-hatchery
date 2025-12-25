# Authentication Flow - SSR Landing Page

## Overview

The landing page uses SSR-friendly authentication with NextAuth v5 Server Actions for Google OAuth sign-in.

## How It Works

### 1. User Clicks "Join Now" or "Start Exploring"

When a user clicks any of the call-to-action buttons on the landing page, a form is submitted that triggers a Server Action:

```tsx
<form
  action={async () => {
    "use server";
    await signIn("google", { redirectTo: "/dashboard" });
  }}
>
  <button type="submit">Join Now</button>
</form>
```

### 2. NextAuth Handles Authentication

The Server Action calls the `signIn` function from NextAuth which:

1. Redirects directly to Google OAuth sign-in page (no intermediate page)
2. User authenticates with their Google account
3. Google redirects back to NextAuth callback
4. NextAuth processes the callback
5. Creates/updates the user in the database
6. Creates a session
7. Redirects to the `redirectTo` URL (/dashboard)

### 3. User Lands on Dashboard

After successful authentication, the user is redirected to `/dashboard` with a valid session.

## Button Locations

All buttons use the `GoogleSignInButton` component which wraps the Server Action:

### Navbar (Top Right)

```tsx
<GoogleSignInButton text="Join Now" variant="default" />
```

### Hero Section (Main CTA)

```tsx
<GoogleSignInButton text="Start Exploring" variant="default" />
```

### CTA Section (Bottom)

```tsx
<GoogleSignInButton text="Start Trading Now" variant="default" />
```

## GoogleSignInButton Component

The `GoogleSignInButton` component is located at `src/components/GoogleSignInButton.tsx`:

```tsx
import { signIn } from "@/lib/auth";
import { Button } from "./ui/button";

export default function GoogleSignInButton({
  text = "Join Now",
  variant = "default",
  className,
}) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/dashboard" });
      }}
    >
      <Button type="submit" variant={variant} className={className}>
        {text}
      </Button>
    </form>
  );
}
```

## Why This Approach?

### SSR Compatible

- Server Actions run on the server
- No client-side JavaScript required for auth logic
- SEO-friendly (forms are crawlable)
- Progressive enhancement

### NextAuth v5 Server Actions

- Uses NextAuth v5's recommended approach
- Leverages Server Actions for authentication
- Handles OAuth flow automatically
- Manages session creation
- Redirects to specified URL after success

### Standard HTML Forms

- Uses native `<form>` elements
- Works in all browsers
- Accessible by default
- Progressive enhancement

## Authentication Flow Diagram

```
Landing Page
    |
    | User clicks "Join Now" button
    v
Form submits Server Action
    |
    | signIn("google", { redirectTo: "/dashboard" })
    v
NextAuth redirects to Google OAuth
    |
    | User sees Google sign-in page
    v
User authenticates with Google
    |
    | Google redirects back to NextAuth
    v
NextAuth Callback Handler
    |
    | Processes OAuth callback
    | Creates/updates user in DB
    | Creates session
    v
Redirect to /dashboard
    |
    | User is now authenticated
    v
Dashboard Page (Protected)
```

## Protected Routes

The `/dashboard` route is protected by NextAuth middleware. If a user tries to access it without authentication:

1. They are redirected to the sign-in page
2. After signing in, they are redirected back to `/dashboard`

## Session Management

### Server-Side

```typescript
import { auth } from "@/lib/auth";

const session = await auth();
if (!session?.user) {
  // User is not authenticated
}
```

### Client-Side (Dashboard)

```typescript
import { useSession } from "next-auth/react";

const { data: session, status } = useSession();
if (status === "unauthenticated") {
  router.push("/");
}
```

## Testing the Flow

### 1. Test Sign-In

1. Open the landing page
2. Click "Join Now" in the navbar
3. Verify redirect to Google OAuth
4. Sign in with Google
5. Verify redirect to /dashboard

### 2. Test Callback URL

1. Click "Start Exploring" in the hero section
2. After sign-in, verify you land on /dashboard
3. Check that the session is active

### 3. Test Without JavaScript

1. Disable JavaScript in browser
2. Click any CTA button
3. Verify the link still works
4. OAuth flow should complete normally

## Comparison: Before vs After

### Before (Client-Side)

```tsx
"use client";
import { signIn } from "next-auth/react";

<Button onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
  Join Now
</Button>;
```

- Requires JavaScript
- Client-side only
- Not SEO-friendly
- Needs hydration

### After (Server Action - SSR)

```tsx
import { signIn } from "@/lib/auth";
import { Button } from "./ui/button";

<form
  action={async () => {
    "use server";
    await signIn("google", { redirectTo: "/dashboard" });
  }}
>
  <Button type="submit">Join Now</Button>
</form>;
```

- Server Action (runs on server)
- No client-side JavaScript required
- SEO-friendly (forms are crawlable)
- Progressive enhancement
- Direct Google OAuth redirect
- NextAuth v5 recommended approach

## Benefits

1. **SEO Optimization**: Search engines can crawl forms
2. **Performance**: Server Actions reduce client-side JavaScript
3. **Accessibility**: Standard HTML forms work with assistive technologies
4. **Reliability**: Works even if JavaScript fails to load (progressive enhancement)
5. **Modern Approach**: Uses NextAuth v5's recommended Server Actions pattern
6. **Type Safety**: Server Actions are fully type-safe

## Security

The authentication flow is secure because:

1. OAuth is handled by Google (trusted provider)
2. NextAuth manages session tokens securely
3. CSRF protection is built-in
4. Sessions are stored server-side (JWT strategy)
5. Callback URLs are validated by NextAuth

## Troubleshooting

### Button doesn't redirect

- Check that the `GoogleSignInButton` component is imported correctly
- Verify the `signIn` function is imported from `@/lib/auth`
- Check that the Server Action has the `"use server"` directive
- Check browser console for errors
- Verify NextAuth configuration is correct

### OAuth fails

- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local
- Check that the callback URL is registered in Google Console
- Ensure NEXTAUTH_SECRET is set

### Redirect doesn't work

- Check that callbackUrl is properly encoded
- Verify the dashboard route exists
- Check NextAuth configuration in src/lib/auth.ts

## Next Steps

1. Test the authentication flow in development
2. Verify all buttons redirect correctly
3. Test with JavaScript disabled
4. Deploy and test in production
5. Monitor authentication success rate
