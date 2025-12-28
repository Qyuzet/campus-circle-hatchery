"use client";

import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function EventsEmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">No event registrations yet</p>
      <Button
        onClick={() => router.push("/dashboard?tab=discovery")}
        className="mt-4"
      >
        <Calendar className="h-4 w-4 mr-2" />
        Browse Events
      </Button>
    </div>
  );
}

