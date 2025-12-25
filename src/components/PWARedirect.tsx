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

    if (isPWA && window.location.pathname === "/") {
      if (status === "loading") {
        return;
      }

      if (session) {
        router.replace("/dashboard");
      } else {
        router.replace("/auth/signin");
      }
    }
  }, [session, status, router, searchParams]);

  return null;
}

