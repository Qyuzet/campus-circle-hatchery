# My Hub Components

This directory contains modular components for the My Hub section of the dashboard.

## Structure

### Wallet Tab
- `WalletTab.tsx` - Main wallet tab component (Server Component)
- `WalletBalanceCards.tsx` - Displays wallet balance cards
- `WalletWithdrawalHistory.tsx` - Shows withdrawal history
- `WalletAnalytics.tsx` - Analytics and insights for wallet

### Listings Tab
- `ListingsTab.tsx` - Main listings tab component (Server Component)
- `ListingsGrid.tsx` - Grid display of listings (Client Component)
- `ListingsEmptyState.tsx` - Empty state for listings (Client Component)

### Events Tab
- `EventsTab.tsx` - Main events tab component (Server Component)
- `EventsGrid.tsx` - Grid display of event registrations (Client Component)
- `EventsEmptyState.tsx` - Empty state for events (Client Component)

## Usage

Import the main tab components in your dashboard page:

```tsx
import { WalletTab, ListingsTab, EventsTab } from "@/components/dashboard/my-hub";

// In your component
<WalletTab />
<ListingsTab />
<EventsTab />
```

## Features

### Wallet Tab
- Displays total earnings, available balance, pending balance, and withdrawn balance
- Shows withdrawal history with status badges
- Provides analytics on sales by category and recent activity

### Listings Tab
- Shows all marketplace listings created by the user
- Allows viewing and editing of listings
- Displays listing status, price, and view count

### Events Tab
- Shows all event registrations for the user
- Displays payment status and registration status
- Provides quick access to join online meetings for paid events

## Notes

- Server Components fetch data directly from the database
- Client Components handle user interactions and state management
- All components are responsive and mobile-friendly

