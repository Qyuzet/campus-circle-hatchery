/**
 * Feature flag to enable SSR components and disable their CSR equivalents
 *
 * When enabled (true):
 * - SSR pages are accessible: /dashboard/marketplace, /dashboard/clubs, /dashboard/my-hub, /dashboard/wallet, /dashboard/messages
 * - CSR tabs in legacy /dashboard are hidden: Discovery, Clubs, My Hub
 * - Navigation links point to SSR pages
 *
 * When disabled (false):
 * - Only legacy CSR /dashboard page is functional
 * - SSR pages are still accessible but not linked in navigation
 *
 * Set in .env file:
 * NEXT_PUBLIC_ENABLE_SSR_COMPONENTS=true  (Enable SSR, hide CSR)
 * NEXT_PUBLIC_ENABLE_SSR_COMPONENTS=false (Disable SSR, show CSR)
 */
export const isSSRComponentsEnabled = () => {
  return process.env.NEXT_PUBLIC_ENABLE_SSR_COMPONENTS === "true";
};

/**
 * Check if CSR components should be shown
 * Returns true when SSR is disabled
 */
export const isCSRComponentsEnabled = () => {
  return !isSSRComponentsEnabled();
};

/**
 * Get the list of tabs that should be hidden in legacy dashboard
 * when SSR is enabled
 */
export const getHiddenCSRTabs = () => {
  if (isSSRComponentsEnabled()) {
    return ["discovery", "clubs", "my-hub"];
  }
  return [];
};

/**
 * Check if a specific tab should be shown in legacy dashboard
 */
export const shouldShowCSRTab = (tabName: string) => {
  const hiddenTabs = getHiddenCSRTabs();
  return !hiddenTabs.includes(tabName);
};
