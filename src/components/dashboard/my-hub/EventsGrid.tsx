"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, ExternalLink, MapPin } from "lucide-react";

interface Event {
  id: string;
  title: string;
  category: string;
  eventType: string;
  startDate: Date;
  location: string;
  price: number;
  isOnline: boolean;
  meetingLink: string | null;
}

interface Registration {
  id: string;
  paymentStatus: string | null;
  status: string;
  event: Event;
}

interface EventsGridProps {
  registrations: Registration[];
}

export function EventsGrid({ registrations }: EventsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-2 md:gap-4">
      {registrations.map((registration) => (
        <Card
          key={registration.id}
          className="hover:shadow-lg transition-shadow"
        >
          <CardHeader className="p-2 md:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xs md:text-lg line-clamp-2">
                  {registration.event.title}
                </CardTitle>
                <p className="text-[10px] md:text-sm text-muted-foreground mt-0.5 md:mt-1">
                  {registration.event.category} • {registration.event.eventType}
                </p>
              </div>
              <div className="flex flex-col items-end gap-0.5 md:gap-2 flex-shrink-0">
                <Badge
                  variant={
                    registration.paymentStatus === "paid"
                      ? "default"
                      : "secondary"
                  }
                  className="text-[10px] md:text-xs h-4 md:h-5 px-1 md:px-2"
                >
                  {registration.paymentStatus === "paid" ? "Paid" : "Pending"}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] md:text-xs h-4 md:h-5 px-1 md:px-2"
                >
                  {registration.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 md:p-6 pt-0">
            <div className="space-y-1 md:space-y-2 text-[10px] md:text-sm">
              <div className="flex items-center gap-1 md:gap-2 text-muted-foreground">
                <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span className="truncate">
                  {new Date(registration.event.startDate).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-muted-foreground">
                <MapPin className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span className="truncate">{registration.event.location}</span>
              </div>
              {registration.event.price > 0 && (
                <div className="flex items-center gap-1 md:gap-2 font-semibold text-dark-blue">
                  <span className="text-xs md:text-sm">
                    Rp {registration.event.price.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-1 md:gap-2 p-2 md:p-6 pt-0">
            {registration.event.isOnline &&
              registration.event.meetingLink &&
              registration.paymentStatus === "paid" && (
                <Button
                  size="sm"
                  className="flex-1 text-[10px] md:text-sm h-7 md:h-9 px-1 md:px-3"
                  onClick={() => {
                    window.open(registration.event.meetingLink!, "_blank");
                  }}
                >
                  <ExternalLink className="h-3 w-3 md:h-4 md:w-4 mr-0.5 md:mr-1" />
                  <span className="hidden md:inline">Join Meeting</span>
                  <span className="md:hidden">Join</span>
                </Button>
              )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
