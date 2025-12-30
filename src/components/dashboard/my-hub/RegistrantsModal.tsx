"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import {
  Mail,
  User,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  Send,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

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
  currentParticipants: number;
  maxParticipants: number;
  participants: Participant[];
}

interface RegistrantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: OrganizedEvent;
}

export function RegistrantsModal({
  isOpen,
  onClose,
  event,
}: RegistrantsModalProps) {
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );

  const paidCount = event.participants.filter(
    (p) => p.paymentStatus === "paid"
  ).length;
  const pendingCount = event.participants.filter(
    (p) => p.paymentStatus === "pending"
  ).length;
  const totalRevenue =
    event.participants.filter((p) => p.paymentStatus === "paid").length *
    event.price;

  const handleSendEmail = (email: string, name: string) => {
    const subject = encodeURIComponent(`Regarding: ${event.title}`);
    const body = encodeURIComponent(
      `Hi ${name},\n\nThank you for registering for ${event.title}.\n\n`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
    toast.success(`Opening email client to contact ${name}`);
  };

  const handleSendMessage = (userId: string, userName: string) => {
    window.location.href = `/dashboard/messages?userId=${userId}`;
    toast.success(`Opening chat with ${userName}`);
  };

  const handleBulkEmail = () => {
    const emails = event.participants.map((p) => p.user.email).join(",");
    const subject = encodeURIComponent(`Important Update: ${event.title}`);
    const body = encodeURIComponent(
      `Dear Participants,\n\nWe have an important update regarding ${event.title}.\n\n`
    );
    window.open(`mailto:${emails}?subject=${subject}&body=${body}`, "_blank");
    toast.success(
      `Opening email client for ${event.participants.length} participants`
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {event.title}
                </DialogTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className="text-xs border-gray-300 text-gray-700"
                  >
                    {event.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-gray-300 text-gray-700"
                  >
                    {event.eventType}
                  </Badge>
                </div>
              </div>
              <Button
                onClick={handleBulkEmail}
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                disabled={event.participants.length === 0}
              >
                <Send className="h-4 w-4 mr-2" />
                Email All
              </Button>
            </div>
          </DialogHeader>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 py-5 bg-gray-50 border-b border-gray-200">
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Total Registrants
            </div>
            <div className="text-3xl font-semibold text-gray-900">
              {event.participants.length}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Paid
            </div>
            <div className="text-3xl font-semibold text-green-600">
              {paidCount}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Pending
            </div>
            <div className="text-3xl font-semibold text-yellow-600">
              {pendingCount}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Revenue
            </div>
            <div className="text-3xl font-semibold text-blue-600">
              {event.price > 0
                ? `Rp ${(totalRevenue / 1000).toFixed(0)}k`
                : "Free"}
            </div>
          </div>
        </div>

        <ScrollArea className="h-[450px] px-6 py-4">
          <div className="space-y-3">
            {event.participants.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No registrants yet</p>
              </div>
            ) : (
              event.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="border border-gray-200 rounded bg-white p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage
                        src={participant.user.avatarUrl || undefined}
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        {participant.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h4 className="font-semibold text-base text-gray-900">
                            {participant.user.name}
                          </h4>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">
                            ID: {participant.user.studentId}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                          <Badge
                            className={
                              participant.paymentStatus === "paid"
                                ? "bg-green-50 text-green-700 border-green-200 text-[10px] font-medium"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px] font-medium"
                            }
                            variant="outline"
                          >
                            {participant.paymentStatus === "paid" ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {participant.paymentStatus === "paid"
                              ? "Paid"
                              : "Pending"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] border-gray-300 text-gray-700"
                          >
                            {participant.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="truncate">
                            {participant.user.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
                            Registered on{" "}
                            {format(
                              new Date(participant.registeredAt),
                              "MMM dd, yyyy 'at' HH:mm"
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <Button
                          onClick={() =>
                            handleSendEmail(
                              participant.user.email,
                              participant.user.name
                            )
                          }
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-8 border-gray-300 hover:bg-gray-50"
                        >
                          <Mail className="h-3.5 w-3.5 mr-1.5" />
                          Email
                        </Button>
                        <Button
                          onClick={() =>
                            handleSendMessage(
                              participant.user.id,
                              participant.user.name
                            )
                          }
                          variant="default"
                          size="sm"
                          className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700"
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
