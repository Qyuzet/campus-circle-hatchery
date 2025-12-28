"use client";

import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LibraryEmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-dark-gray mb-2">
        No items in your library
      </h3>
      <p className="text-muted-foreground mb-4">
        Start purchasing study materials to build your library
      </p>
      <Button onClick={() => router.push("/dashboard?tab=discovery")}>
        Browse Marketplace
      </Button>
    </div>
  );
}

