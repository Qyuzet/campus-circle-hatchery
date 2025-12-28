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
  HelpCircle,
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
  onSupportClick?: (eventId: string, eventTitle: string) => void;
}

const EventCardComponent = ({
  event,
  onClick,
  onRegister,
  isRegistered,
  isOwner = false,
  onSupportClick,
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
      className="cursor-pointer hover:border-gray-300 transition-all group overflow-hidden relative border border-gray-200 bg-white"
      onClick={onClick}
      style={{ contentVisibility: "auto" }}
    >
      {onSupportClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSupportClick(event.id, event.title);
          }}
          className="absolute top-1 right-1 z-10 bg-white p-1 transition-all"
          title="Contact Support"
        >
          <HelpCircle className="h-2.5 w-2.5 text-gray-600 hover:text-blue-600 transition-colors" />
        </button>
      )}
      <div className="relative h-28 bg-gray-50 overflow-hidden">
        {event.bannerUrl || event.imageUrl ? (
          <Image
            src={event.bannerUrl || event.imageUrl || ""}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <Calendar className="h-8 w-8 text-gray-300" />
          </div>
        )}
        {event.isFeatured && (
          <Badge className="absolute top-1 right-1 bg-yellow-500 text-[8px] px-1 py-0 font-normal">
            Featured
          </Badge>
        )}
        {isFull && (
          <Badge
            variant="destructive"
            className="absolute top-1 left-1 text-[8px] px-1 py-0 font-normal"
          >
            Full
          </Badge>
        )}
        {isOwner && (
          <Badge className="absolute bottom-1 left-1 bg-blue-600 text-white text-[8px] px-1 py-0 font-normal">
            <Edit className="h-2 w-2 mr-0.5" />
            My Event
          </Badge>
        )}
      </div>

      <CardContent className="p-1 space-y-0.5">
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-normal text-[10px] line-clamp-2 text-gray-900">
            {event.title}
          </h3>
          <Badge
            className={`${getCategoryColor(
              event.category
            )} text-[8px] px-1 py-0 flex-shrink-0 font-normal`}
          >
            {event.category}
          </Badge>
        </div>

        <p className="text-[9px] text-gray-600 line-clamp-1 leading-tight">
          {event.description}
        </p>

        <div className="space-y-0.5 text-[8px]">
          <div className="flex items-center gap-0.5 text-gray-600">
            <Calendar className="h-2 w-2 shrink-0 text-gray-500" />
            <span className="line-clamp-1">
              {format(startDate, "MMM dd, yyyy")} at{" "}
              {format(startDate, "HH:mm")}
            </span>
          </div>

          <div className="flex items-center gap-0.5 text-gray-600">
            <MapPin className="h-2 w-2 shrink-0 text-gray-500" />
            <span className="line-clamp-1">
              {event.isOnline ? "Online Event" : event.location}
            </span>
          </div>

          <div className="flex items-center gap-0.5 text-gray-600">
            <Users className="h-2 w-2 shrink-0 text-gray-500" />
            <span>
              {event.currentParticipants}
              {event.maxParticipants ? ` / ${event.maxParticipants}` : ""}{" "}
              participants
            </span>
          </div>

          {event.price > 0 && (
            <div className="flex items-center gap-0.5 text-gray-600">
              <DollarSign className="h-2 w-2 shrink-0 text-gray-500" />
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
          <div className="flex flex-wrap gap-0.5">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-[7px] px-0.5 py-0 font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-1 pt-0 flex items-center justify-between border-t border-gray-100">
        <div className="text-[8px] text-gray-600 truncate">
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
            className="text-[8px] h-5 px-1.5 font-normal"
          >
            {isRegistered ? "Registered" : isFull ? "Full" : "Register"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export const EventCard = memo(EventCardComponent);
