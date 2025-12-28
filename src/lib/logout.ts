import { signOut } from "next-auth/react";

export function handleLogout() {
  const isPWA =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone;

  const callbackUrl = isPWA ? "/signin?logout=true" : "/";

  signOut({ callbackUrl });
}
