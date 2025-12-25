# Legacy Pages Cleanup

## Overview

Removed legacy standalone pages that were replaced by dashboard tabs. All navigation has been updated to redirect to the appropriate dashboard tabs instead of separate pages.

## Pages Removed

### 1. `/orders` Page

- **Status**: REMOVED
- **Reason**: Functionality fully integrated into Dashboard > My Hub > Purchases tab
- **Replacement**: `/dashboard?tab=my-hub&subTab=purchases`

### 2. `/library` Page

- **Status**: REMOVED
- **Reason**: Functionality fully integrated into Dashboard > My Hub > Library tab
- **Replacement**: `/dashboard?tab=my-hub&subTab=library`

### 3. `/marketplace` Directory

- **Status**: REMOVED
- **Reason**: Empty directory, never implemented
- **Replacement**: Dashboard > Discovery tab (default)

## Navigation Updates

### Dashboard Profile Dropdown

**Before:**

```tsx
<DropdownMenuItem onClick={() => router.push("/orders")}>
  <Package className="mr-2 h-4 w-4" />
  <span>My Orders</span>
</DropdownMenuItem>
<DropdownMenuItem onClick={() => router.push("/library")}>
  <Library className="mr-2 h-4 w-4" />
  <span>My Library</span>
</DropdownMenuItem>
```

**After:**

```tsx
<DropdownMenuItem
  onClick={() => {
    setActiveTab("my-hub");
    setMyHubTab("purchases");
  }}
>
  <Package className="mr-2 h-4 w-4" />
  <span>My Orders</span>
</DropdownMenuItem>
<DropdownMenuItem
  onClick={() => {
    setActiveTab("my-hub");
    setMyHubTab("library");
  }}
>
  <Library className="mr-2 h-4 w-4" />
  <span>My Library</span>
</DropdownMenuItem>
```

### Account Page Profile Dropdown

**Before:**

```tsx
<DropdownMenuItem onClick={() => router.push("/orders")}>
  <Package className="mr-2 h-4 w-4" />
  <span>My Orders</span>
</DropdownMenuItem>
<DropdownMenuItem onClick={() => router.push("/library")}>
  <Library className="mr-2 h-4 w-4" />
  <span>My Library</span>
</DropdownMenuItem>
```

**After:**

```tsx
<DropdownMenuItem
  onClick={() =>
    router.push("/dashboard?tab=my-hub&subTab=purchases")
  }
>
  <Package className="mr-2 h-4 w-4" />
  <span>My Orders</span>
</DropdownMenuItem>
<DropdownMenuItem
  onClick={() =>
    router.push("/dashboard?tab=my-hub&subTab=library")
  }
>
  <Library className="mr-2 h-4 w-4" />
  <span>My Library</span>
</DropdownMenuItem>
```

## Dashboard Tab Structure

The dashboard now consolidates all functionality into organized tabs:

### Main Tabs

1. **Discovery** - Marketplace (Study Materials, Food, Events)
2. **Messages** - Conversations and messaging
3. **My Hub** - User's personal content hub
4. **Clubs** - Club browsing and management
5. **Wallet** - Balance and withdrawals

### My Hub Sub-Tabs

1. **Purchases** - All purchase history (replaces `/orders`)
2. **Sales** - Items sold by the user
3. **Library** - Downloaded study materials (replaces `/library`)
4. **Listings** - Active marketplace listings
5. **Events** - Registered events

## Benefits

1. **Unified Experience** - All user functionality in one place
2. **Better Navigation** - No need to navigate between separate pages
3. **Improved Performance** - Lazy loading of tab content
4. **Consistent UI** - Single header and navigation across all features
5. **Reduced Code Duplication** - Shared components and state management

## Files Modified

1. `src/app/dashboard/page.tsx` - Updated profile dropdown navigation
2. `src/app/account/page.tsx` - Updated profile dropdown navigation

## Files Removed

1. `src/app/orders/page.tsx` - Legacy orders page
2. `src/app/library/page.tsx` - Legacy library page
3. `src/app/marketplace/` - Empty directory

## Z-Index Fix

Fixed dropdown menu appearing behind the header by updating z-index values:

**Before:**

- Header: `z-[60]`
- DropdownMenuContent: `z-50` (appeared behind header)
- DropdownMenuSubContent: `z-50` (appeared behind header)

**After:**

- Header: `z-[60]`
- DropdownMenuContent: `z-[70]` (now appears above header)
- DropdownMenuSubContent: `z-[70]` (now appears above header)

This ensures all dropdown menus appear correctly above the sticky header.

## Migration Notes

All existing links to `/orders` and `/library` have been updated to use the dashboard tabs:

- Dashboard profile dropdown (internal state changes)
- Account page profile dropdown (URL redirects)
- Account page action buttons (URL redirects)

The payment success page already uses the correct dashboard tab URLs.
