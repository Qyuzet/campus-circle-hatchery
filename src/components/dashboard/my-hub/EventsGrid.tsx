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
    <div className="grid grid-cols-1 gap-4">
      {registrations.map((registration) => (
        <Card
          key={registration.id}
          className="hover:shadow-lg transition-shadow"
        >
          <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm sm:text-base font-semibold line-clamp-2 mb-1.5 sm:mb-2">
                  {registration.event.title}
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {registration.event.category} • {registration.event.eventType}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 sm:gap-2 flex-shrink-0">
                <div
                  className={
                    registration.paymentStatus === "paid"
                      ? "inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 bg-green-50 border-l-4 border-green-600 rounded-sm"
                      : "inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 bg-yellow-50 border-l-4 border-yellow-600 rounded-sm"
                  }
                >
                  <span
                    className={
                      registration.paymentStatus === "paid"
                        ? "text-[10px] sm:text-xs font-semibold text-green-800"
                        : "text-[10px] sm:text-xs font-semibold text-yellow-800"
                    }
                  >
                    {registration.paymentStatus === "paid" ? "Paid" : "Pending"}
                  </span>
                </div>
                <div className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 bg-blue-50 border-l-4 border-blue-600 rounded-sm">
                  <span className="text-[10px] sm:text-xs font-semibold text-blue-800">
                    {registration.status}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>
                  {new Date(registration.event.startDate).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>{registration.event.location}</span>
              </div>
              {registration.event.price > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-sm sm:text-base font-bold text-blue-600">
                    Rp {registration.event.price.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
          {registration.event.isOnline &&
            registration.event.meetingLink &&
            registration.paymentStatus === "paid" && (
              <CardFooter className="p-3 sm:p-4 pt-0">
                <Button
                  size="sm"
                  className="w-full text-xs sm:text-sm h-8 sm:h-9"
                  onClick={() => {
                    window.open(registration.event.meetingLink!, "_blank");
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
              </CardFooter>
            )}
        </Card>
      ))}
    </div>
  );
}
