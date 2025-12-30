"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Eye, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { RegistrantsModal } from "./RegistrantsModal";

interface Participant {
  id: string;
  status: string;
  paymentStatus: string | null;
  registeredAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    studentId: string;
    avatarUrl: string | null;
  };
}

interface OrganizedEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  eventType: string;
  price: number;
  imageUrl: string | null;
  location: string;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  currentParticipants: number;
  isPublished: boolean;
  participants: Participant[];
}

interface MyOrganizedEventsProps {
  events: OrganizedEvent[];
}

export function MyOrganizedEvents({ events }: MyOrganizedEventsProps) {
  const [selectedEvent, setSelectedEvent] = useState<OrganizedEvent | null>(
    null
  );
  const [showRegistrantsModal, setShowRegistrantsModal] = useState(false);

  const handleViewRegistrants = (event: OrganizedEvent) => {
    setSelectedEvent(event);
    setShowRegistrantsModal(true);
  };

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Organized Events</h3>
        <p className="text-sm text-muted-foreground">
          You haven't created any events yet
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3">
        {events.map((event) => (
          <Card
            key={event.id}
            className="border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
          >
            <CardHeader className="p-4 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-semibold text-gray-900 line-clamp-2 mb-2">
                    {event.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-0.5 border-gray-300 text-gray-700"
                    >
                      {event.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-0.5 border-gray-300 text-gray-700"
                    >
                      {event.eventType}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        event.isPublished
                          ? "bg-green-50 text-green-700 border-green-200 text-xs px-2 py-0.5"
                          : "bg-gray-50 text-gray-700 border-gray-300 text-xs px-2 py-0.5"
                      }
                    >
                      {event.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate text-xs">
                    {format(new Date(event.startDate), "MMM dd, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate text-xs">{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs font-medium">
                    {event.currentParticipants} / {event.maxParticipants || "∞"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs font-medium">
                    {event.price > 0
                      ? `Rp ${event.price.toLocaleString()}`
                      : "Free"}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handleViewRegistrants(event)}
                className="w-full text-sm h-9 bg-blue-600 hover:bg-blue-700 text-white"
                variant="default"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Registrants ({event.participants.length})
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedEvent && (
        <RegistrantsModal
          isOpen={showRegistrantsModal}
          onClose={() => setShowRegistrantsModal(false)}
          event={selectedEvent}
        />
      )}
    </>
  );
}
