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
import {
  Calendar,
  Eye,
  ExternalLink,
  MapPin,
  X,
  Clock,
  Users,
  Mail,
  Phone,
  Tag,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  eventType: string;
  startDate: Date;
  endDate: Date;
  location: string;
  venue: string | null;
  price: number;
  isOnline: boolean;
  meetingLink: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  organizer: string;
  contactEmail: string | null;
  contactPhone: string | null;
  maxParticipants: number | null;
  currentParticipants: number;
  tags: string[];
  requirements: string | null;
  registrationDeadline: Date | null;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  avatarUrl: string | null;
}

interface Registration {
  id: string;
  paymentStatus: string | null;
  status: string;
  registeredAt: Date;
  event: Event;
  user: User;
}

interface EventsGridProps {
  registrations: Registration[];
}

export function EventsGrid({ registrations }: EventsGridProps) {
  const [selectedEvent, setSelectedEvent] = useState<Registration | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {registrations.map((registration) => (
          <Card
            key={registration.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedEvent(registration)}
          >
            <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm sm:text-base font-semibold line-clamp-2 mb-1.5 sm:mb-2">
                    {registration.event.title}
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {registration.event.category} •{" "}
                    {registration.event.eventType}
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
                      {registration.paymentStatus === "paid"
                        ? "Paid"
                        : "Pending"}
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
                    onClick={(e) => {
                      e.stopPropagation();
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

      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[95vh] flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between z-10 rounded-t-lg flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-bold">
                Event Registration Details
              </h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 p-3 sm:p-6">
                <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                  {(selectedEvent.event.bannerUrl ||
                    selectedEvent.event.imageUrl) && (
                    <div className="relative w-full aspect-[4/3] lg:aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <Image
                        src={
                          selectedEvent.event.bannerUrl ||
                          selectedEvent.event.imageUrl ||
                          ""
                        }
                        alt={selectedEvent.event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                    <h4 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 text-gray-800">
                      Registration QR Code
                    </h4>
                    <div className="bg-white p-3 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="p-2 bg-white rounded-lg inline-block">
                          <QRCodeSVG
                            value={JSON.stringify({
                              registrationId: selectedEvent.id,
                              eventId: selectedEvent.event.id,
                              eventTitle: selectedEvent.event.title,
                              userName: selectedEvent.user.name,
                              userEmail: selectedEvent.user.email,
                              studentId: selectedEvent.user.studentId,
                              registeredAt: selectedEvent.registeredAt,
                              paymentStatus: selectedEvent.paymentStatus,
                            })}
                            size={140}
                            level="H"
                            includeMargin={true}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-2 font-medium">
                          Show this QR code at the event
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1 font-mono">
                          ID: {selectedEvent.id.slice(0, 12)}...
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedEvent.event.isOnline &&
                    selectedEvent.event.meetingLink &&
                    selectedEvent.paymentStatus === "paid" && (
                      <Button
                        className="w-full"
                        size="sm"
                        onClick={() => {
                          window.open(
                            selectedEvent.event.meetingLink!,
                            "_blank"
                          );
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Join Online Meeting
                      </Button>
                    )}
                </div>

                <div className="lg:col-span-3 space-y-3 sm:space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">
                      {selectedEvent.event.title}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] sm:text-xs px-2 py-0.5"
                      >
                        {selectedEvent.event.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] sm:text-xs px-2 py-0.5"
                      >
                        {selectedEvent.event.eventType}
                      </Badge>
                      <Badge
                        className={
                          selectedEvent.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800 text-[10px] sm:text-xs px-2 py-0.5"
                            : "bg-yellow-100 text-yellow-800 text-[10px] sm:text-xs px-2 py-0.5"
                        }
                      >
                        {selectedEvent.paymentStatus === "paid"
                          ? "Paid"
                          : "Pending"}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs px-2 py-0.5">
                        {selectedEvent.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 sm:p-4 border border-purple-200">
                    <h4 className="font-semibold text-xs sm:text-sm text-purple-900 mb-2">
                      Registered User
                    </h4>
                    <div className="space-y-1.5 text-xs sm:text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="text-purple-700 text-[11px] sm:text-xs">
                          Name:
                        </span>
                        <span className="font-semibold text-purple-900">
                          {selectedEvent.user.name}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-purple-700 text-[11px] sm:text-xs">
                          Student ID:
                        </span>
                        <span className="font-mono text-purple-900 text-[11px] sm:text-xs">
                          {selectedEvent.user.studentId}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-purple-700 text-[11px] sm:text-xs">
                          Email:
                        </span>
                        <span className="font-medium text-purple-900 text-[11px] sm:text-xs truncate max-w-[60%]">
                          {selectedEvent.user.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                    <h4 className="font-semibold text-xs sm:text-sm text-gray-700 mb-2">
                      Registration Invoice
                    </h4>
                    <div className="space-y-1.5 text-xs sm:text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600 text-[11px] sm:text-xs">
                          Registration ID:
                        </span>
                        <span className="font-mono text-[10px] sm:text-xs truncate max-w-[60%]">
                          {selectedEvent.id}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600 text-[11px] sm:text-xs">
                          Registered On:
                        </span>
                        <span className="font-medium text-[11px] sm:text-xs text-right">
                          {format(
                            new Date(selectedEvent.registeredAt),
                            "MMM dd, yyyy"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600 text-[11px] sm:text-xs">
                          Event Price:
                        </span>
                        <span className="font-bold text-blue-600 text-xs sm:text-sm">
                          {selectedEvent.event.price > 0
                            ? `Rp ${selectedEvent.event.price.toLocaleString()}`
                            : "Free"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600 text-[11px] sm:text-xs">
                          Payment Status:
                        </span>
                        <span
                          className={
                            selectedEvent.paymentStatus === "paid"
                              ? "font-semibold text-green-600 text-xs sm:text-sm"
                              : "font-semibold text-yellow-600 text-xs sm:text-sm"
                          }
                        >
                          {selectedEvent.paymentStatus === "paid"
                            ? "Paid"
                            : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1.5 text-xs sm:text-sm">
                      Description
                    </h4>
                    <p className="text-gray-700 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                      {selectedEvent.event.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 text-xs sm:text-sm">
                      Event Information
                    </h4>
                    <div className="bg-white border border-gray-200 rounded-lg p-2.5 sm:p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
                            Start Date & Time
                          </p>
                          <p className="text-xs sm:text-sm font-medium truncate">
                            {format(
                              new Date(selectedEvent.event.startDate),
                              "MMM dd, yyyy"
                            )}
                          </p>
                          <p className="text-xs text-gray-600">
                            {format(
                              new Date(selectedEvent.event.startDate),
                              "p"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-2 flex items-start gap-2">
                        <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
                            End Date & Time
                          </p>
                          <p className="text-xs sm:text-sm font-medium truncate">
                            {format(
                              new Date(selectedEvent.event.endDate),
                              "MMM dd, yyyy"
                            )}
                          </p>
                          <p className="text-xs text-gray-600">
                            {format(new Date(selectedEvent.event.endDate), "p")}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-2 flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
                            Location
                          </p>
                          <p className="text-xs sm:text-sm font-medium">
                            {selectedEvent.event.isOnline
                              ? "Online Event"
                              : selectedEvent.event.location}
                          </p>
                          {selectedEvent.event.venue && (
                            <p className="text-xs text-gray-600 truncate">
                              {selectedEvent.event.venue}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-2 flex items-start gap-2">
                        <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
                            Participants
                          </p>
                          <p className="text-xs sm:text-sm font-medium">
                            {selectedEvent.event.currentParticipants}
                            {selectedEvent.event.maxParticipants
                              ? ` / ${selectedEvent.event.maxParticipants}`
                              : ""}{" "}
                            registered
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedEvent.event.isOnline &&
                    selectedEvent.event.meetingLink && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 sm:p-3">
                        <div className="flex items-start gap-2">
                          <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-blue-900 mb-1">
                              Online Meeting Link
                            </p>
                            <a
                              href={selectedEvent.event.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline break-all font-medium"
                            >
                              {selectedEvent.event.meetingLink}
                            </a>
                            <p className="text-[10px] sm:text-xs text-blue-700 mt-1">
                              Click to join the meeting
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 text-xs sm:text-sm">
                      Organizer Contact
                    </h4>
                    <div className="bg-white border border-gray-200 rounded-lg p-2.5 sm:p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
                            Organizer
                          </p>
                          <p className="text-xs sm:text-sm font-medium truncate">
                            {selectedEvent.event.organizer}
                          </p>
                        </div>
                      </div>

                      {selectedEvent.event.contactEmail && (
                        <div className="border-t border-gray-100 pt-2 flex items-start gap-2">
                          <Mail className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
                              Email
                            </p>
                            <a
                              href={`mailto:${selectedEvent.event.contactEmail}`}
                              className="text-xs sm:text-sm text-blue-600 hover:underline font-medium truncate block"
                            >
                              {selectedEvent.event.contactEmail}
                            </a>
                          </div>
                        </div>
                      )}

                      {selectedEvent.event.contactPhone && (
                        <div className="border-t border-gray-100 pt-2 flex items-start gap-2">
                          <Phone className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
                              Phone
                            </p>
                            <a
                              href={`tel:${selectedEvent.event.contactPhone}`}
                              className="text-xs sm:text-sm text-blue-600 hover:underline font-medium"
                            >
                              {selectedEvent.event.contactPhone}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedEvent.event.tags &&
                    selectedEvent.event.tags.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1.5 text-xs sm:text-sm">
                          Tags
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedEvent.event.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-[10px] sm:text-xs px-2 py-0.5"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {selectedEvent.event.requirements && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1.5 text-xs sm:text-sm">
                        Requirements
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-2.5 sm:p-3 rounded-lg border border-gray-200 leading-relaxed">
                        {selectedEvent.event.requirements}
                      </p>
                    </div>
                  )}

                  {selectedEvent.event.registrationDeadline && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5 sm:p-3">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-orange-900 mb-0.5">
                            Registration Deadline
                          </p>
                          <p className="text-xs text-orange-700">
                            {format(
                              new Date(
                                selectedEvent.event.registrationDeadline
                              ),
                              "MMM dd, yyyy 'at' p"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
