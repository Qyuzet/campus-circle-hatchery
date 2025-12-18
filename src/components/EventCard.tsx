import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, Star, DollarSign } from "lucide-react";
import { Event } from "@/lib/api";
import Image from "next/image";
import { format } from "date-fns";

interface EventCardProps {
  event: Event;
  onClick?: () => void;
  onRegister?: () => void;
  isRegistered?: boolean;
}

export function EventCard({ event, onClick, onRegister, isRegistered }: EventCardProps) {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isFull = event.maxParticipants ? event.currentParticipants >= event.maxParticipants : false;

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
    <Card className="cursor-pointer hover:shadow-lg transition-all group overflow-hidden">
      <div className="relative h-48 bg-secondary-200 overflow-hidden">
        {event.bannerUrl || event.imageUrl ? (
          <Image
            src={event.bannerUrl || event.imageUrl || ""}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-purple-100">
            <Calendar className="h-16 w-16 text-purple-400" />
          </div>
        )}
        {event.isFeatured && (
          <Badge className="absolute top-2 right-2 bg-yellow-500">
            Featured
          </Badge>
        )}
        {isFull && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            Full
          </Badge>
        )}
      </div>

      <CardContent className="p-4" onClick={onClick}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-lg line-clamp-2">{event.title}</h3>
          <Badge className={getCategoryColor(event.category)}>
            {event.category}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {event.description}
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">
              {format(startDate, "MMM dd, yyyy")} at {format(startDate, "HH:mm")}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">
              {event.isOnline ? "Online Event" : event.location}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 shrink-0" />
            <span>
              {event.currentParticipants} 
              {event.maxParticipants ? ` / ${event.maxParticipants}` : ""} participants
            </span>
          </div>

          {event.price > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4 shrink-0" />
              <span>Rp {event.price.toLocaleString()}</span>
            </div>
          )}
        </div>

        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
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
          >
            {isRegistered ? "Registered" : isFull ? "Full" : "Register"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

