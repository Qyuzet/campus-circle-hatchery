"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export function PWARedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  useEffect(() => {
    const isPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      searchParams.get("source") === "pwa";

    const currentPath = window.location.pathname;

    if (isPWA && (currentPath === "/" || currentPath === "/signin")) {
      if (status === "loading") {
        return;
      }

      if (session && currentPath === "/signin") {
        router.replace("/dashboard");
      } else if (!session && currentPath === "/") {
        router.replace("/signin");
      } else if (session && currentPath === "/") {
        router.replace("/dashboard");
      }
    }
  }, [session, status, router, searchParams]);

  return null;
}
