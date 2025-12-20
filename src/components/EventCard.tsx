import React, { memo, useMemo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Star,
  DollarSign,
  Edit,
} from "lucide-react";
import { Event } from "@/lib/api";
import Image from "next/image";
import { format } from "date-fns";

interface EventCardProps {
  event: Event;
  onClick?: () => void;
  onRegister?: () => void;
  isRegistered?: boolean;
  isOwner?: boolean;
}

const EventCardComponent = ({
  event,
  onClick,
  onRegister,
  isRegistered,
  isOwner = false,
}: EventCardProps) => {
  const startDate = useMemo(() => new Date(event.startDate), [event.startDate]);
  const endDate = useMemo(() => new Date(event.endDate), [event.endDate]);
  const isFull = useMemo(
    () =>
      event.maxParticipants
        ? event.currentParticipants >= event.maxParticipants
        : false,
    [event.maxParticipants, event.currentParticipants]
  );

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Academic: "bg-blue-100 text-blue-700",
      Social: "bg-pink-100 text-pink-700",
      Sports: "bg-green-100 text-green-700",
      Workshop: "bg-purple-100 text-purple-700",
      Competition: "bg-orange-100 text-orange-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow group overflow-hidden"
      onClick={onClick}
      style={{ contentVisibility: "auto" }}
    >
      <div className="relative h-32 md:h-48 bg-secondary-200 overflow-hidden">
        {event.bannerUrl || event.imageUrl ? (
          <Image
            src={event.bannerUrl || event.imageUrl || ""}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-purple-100">
            <Calendar className="h-10 w-10 md:h-16 md:w-16 text-purple-400" />
          </div>
        )}
        {event.isFeatured && (
          <Badge className="absolute top-1 right-1 md:top-2 md:right-2 bg-yellow-500 text-[9px] md:text-xs h-4 md:h-5 px-1 md:px-2">
            Featured
          </Badge>
        )}
        {isFull && (
          <Badge
            variant="destructive"
            className="absolute top-1 left-1 md:top-2 md:left-2 text-[9px] md:text-xs h-4 md:h-5 px-1 md:px-2"
          >
            Full
          </Badge>
        )}
        {isOwner && (
          <Badge className="absolute bottom-1 left-1 md:bottom-2 md:left-2 bg-blue-600 text-white text-[9px] md:text-xs h-4 md:h-5 px-1 md:px-2">
            <Edit className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
            My Event
          </Badge>
        )}
      </div>

      <CardContent className="p-2 md:p-4">
        <div className="flex items-start justify-between gap-1 md:gap-2 mb-1 md:mb-2">
          <h3 className="font-bold text-xs md:text-lg line-clamp-2">
            {event.title}
          </h3>
          <Badge
            className={`${getCategoryColor(
              event.category
            )} text-[9px] md:text-xs h-4 md:h-5 px-1 md:px-2 flex-shrink-0`}
          >
            {event.category}
          </Badge>
        </div>

        <p className="text-[10px] md:text-sm text-muted-foreground line-clamp-2 mb-1.5 md:mb-3">
          {event.description}
        </p>

        <div className="space-y-1 md:space-y-2 text-[10px] md:text-sm">
          <div className="flex items-center gap-1 md:gap-2 text-muted-foreground">
            <Calendar className="h-2.5 w-2.5 md:h-4 md:w-4 shrink-0" />
            <span className="line-clamp-1">
              {format(startDate, "MMM dd, yyyy")} at{" "}
              {format(startDate, "HH:mm")}
            </span>
          </div>

          <div className="flex items-center gap-1 md:gap-2 text-muted-foreground">
            <MapPin className="h-2.5 w-2.5 md:h-4 md:w-4 shrink-0" />
            <span className="line-clamp-1">
              {event.isOnline ? "Online Event" : event.location}
            </span>
          </div>

          <div className="flex items-center gap-1 md:gap-2 text-muted-foreground">
            <Users className="h-2.5 w-2.5 md:h-4 md:w-4 shrink-0" />
            <span>
              {event.currentParticipants}
              {event.maxParticipants ? ` / ${event.maxParticipants}` : ""}{" "}
              <span className="hidden md:inline">participants</span>
            </span>
          </div>

          {event.price > 0 && (
            <div className="flex items-center gap-1 md:gap-2 text-muted-foreground">
              <DollarSign className="h-2.5 w-2.5 md:h-4 md:w-4 shrink-0" />
              <span>
                Rp{" "}
                {event.price >= 1000
                  ? `${(event.price / 1000).toFixed(0)}K`
                  : event.price.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-0.5 md:gap-1 mt-1.5 md:mt-3">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-[9px] md:text-xs h-4 md:h-5 px-1 md:px-2"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-2 md:p-4 pt-0 flex items-center justify-between">
        <div className="text-[10px] md:text-xs text-muted-foreground truncate">
          by {event.organizer}
        </div>
        {onRegister && (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRegister();
            }}
            disabled={isFull || isRegistered}
            variant={isRegistered ? "outline" : "default"}
            className="text-[10px] md:text-sm h-7 md:h-9 px-2 md:px-3"
          >
            {isRegistered ? "Registered" : isFull ? "Full" : "Register"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export const EventCard = memo(EventCardComponent);
