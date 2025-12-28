# SSR Components Feature Flag Guide

This guide explains how to toggle SSR (Server-Side Rendered) components in the Campus Circle dashboard.

## What are SSR Components?

SSR components are server-side rendered pages that fetch data on the server before sending HTML to the client. This provides better performance and SEO, but uses more server compute power.

Currently available SSR components:

- My Hub (New) - `/dashboard/my-hub`
- Wallet (New) - `/dashboard/wallet`
- Marketplace (New) - `/dashboard/marketplace`

## How to Toggle SSR Components

### Enable SSR Components

In your `.env.local` file, set:

```env
NEXT_PUBLIC_ENABLE_SSR_COMPONENTS=true
```

This will show SSR component links in:

- Desktop sidebar (with green "SSR" badge)
- User dropdown menu (with sparkles icon)
- Header icons (Wallet icon with green "SSR" badge)

### Disable SSR Components

In your `.env.local` file, set:

```env
NEXT_PUBLIC_ENABLE_SSR_COMPONENTS=false
```

This will hide all SSR component links from the dashboard, reducing server compute power usage during development.

## When to Disable SSR Components

Disable SSR components when:

- You're developing other features and want to reduce server load
- You're testing on a low-resource environment
- You want to focus on the client-side rendered components only
- You're deploying to a staging environment with limited resources

## When to Enable SSR Components

Enable SSR components when:

- You're testing the SSR functionality
- You're ready to deploy to production
- You want to compare performance between CSR and SSR versions
- You're developing new SSR features

## Identifying SSR Components

SSR components are marked with:

- Green "SSR" badge in the sidebar
- Sparkles icon in dropdown menus
- Green "SSR" badge on header icons
- "(New)" or "(New SSR)" in the link text

## Technical Details

The feature flag is implemented using:

- Environment variable: `NEXT_PUBLIC_ENABLE_SSR_COMPONENTS`
- Utility function: `isSSRComponentsEnabled()` in `src/lib/feature-flags.ts`
- Conditional rendering in `src/app/dashboard/page.tsx`

## Notes

- After changing the environment variable, restart your development server
- The feature flag only affects the visibility of links, not the actual SSR pages
- SSR pages can still be accessed directly via URL even when the flag is disabled
- This is a development/deployment convenience feature, not a security feature
