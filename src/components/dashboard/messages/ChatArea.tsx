"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, Users, UserPlus } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

interface ChatAreaProps {
  messages: any[];
  messageText: string;
  isSendingMessage: boolean;
  loadingConversation: boolean;
  currentUserId: string;
  chatTitle: string;
  isGroup?: boolean;
  memberCount?: number;
  onBack: () => void;
  onMessageChange: (text: string) => void;
  onSendMessage: () => void;
  onShowMembers?: () => void;
  onAddMembers?: () => void;
  onAcceptOrder?: (messageId: string) => void;
  onRejectOrder?: (messageId: string) => void;
  onPayOrder?: (message: any) => void;
}

export function ChatArea({
  messages,
  messageText,
  isSendingMessage,
  loadingConversation,
  currentUserId,
  chatTitle,
  isGroup = false,
  memberCount,
  onBack,
  onMessageChange,
  onSendMessage,
  onShowMembers,
  onAddMembers,
  onAcceptOrder,
  onRejectOrder,
  onPayOrder,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="p-4 border-b border-light-gray bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="sm:hidden"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-10 h-10 bg-dark-blue rounded-full flex items-center justify-center flex-shrink-0">
            {isGroup ? (
              <Users className="h-5 w-5 text-white" />
            ) : (
              <span className="text-white font-semibold">
                {chatTitle.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-dark-gray">{chatTitle}</h3>
            {isGroup && memberCount && (
              <p className="text-xs text-medium-gray">{memberCount} members</p>
            )}
          </div>
        </div>
        {isGroup && (
          <div className="flex gap-2">
            <button
              onClick={onShowMembers}
              className="p-2 text-medium-gray hover:text-dark-gray hover:bg-gray-100 rounded-lg transition-colors"
              title="View members"
            >
              <Users className="h-5 w-5" />
            </button>
            <button
              onClick={onAddMembers}
              className="p-2 text-medium-gray hover:text-dark-gray hover:bg-gray-100 rounded-lg transition-colors"
              title="Add members"
            >
              <UserPlus className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0">
        {loadingConversation ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-blue"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-medium-gray">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === currentUserId;

            return (
              <div
                key={message.id}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                {message.messageType === "order_request" ? (
                  <div className="max-w-[85%] w-full">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm">
                      <div className="flex items-start gap-3">
                        {message.orderData?.foodImage && (
                          <Image
                            src={message.orderData.foodImage}
                            alt={message.orderData.foodTitle || "Food"}
                            width={60}
                            height={60}
                            className="rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 mb-1">
                            {message.orderData?.foodTitle}
                          </p>
                          <p className="text-sm text-gray-700 font-medium mb-1">
                            Rp {message.orderData?.price?.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600 mb-1">
                            Pickup: {message.orderData?.pickupLocation}
                          </p>
                          <p className="text-xs text-gray-600 mb-2">
                            Time: {message.orderData?.pickupTime}
                          </p>

                          {message.orderData?.status === "pending" &&
                            message.receiverId === currentUserId && (
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    if (onAcceptOrder) {
                                      onAcceptOrder(message.id);
                                    }
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (onRejectOrder) {
                                      onRejectOrder(message.id);
                                    }
                                  }}
                                  className="border-red-600 text-red-600 hover:bg-red-50 flex-1"
                                >
                                  Decline
                                </Button>
                              </div>
                            )}

                          {message.orderData?.status === "accepted" && (
                            <p className="text-xs text-green-600 font-medium mt-2">
                              ✓ Accepted
                            </p>
                          )}

                          {message.orderData?.status === "rejected" && (
                            <p className="text-xs text-red-600 font-medium mt-2">
                              ✗ Declined
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs mt-2 block text-gray-500">
                        {format(new Date(message.createdAt), "HH:mm")}
                      </span>
                    </div>
                  </div>
                ) : message.messageType === "payment_request" ? (
                  <div className="max-w-[85%] w-full">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-dark-gray font-semibold mb-3">
                        {message.content}
                      </p>

                      {message.orderData?.status === "awaiting_payment" &&
                        message.receiverId === currentUserId && (
                          <Button
                            size="sm"
                            onClick={() => {
                              if (onPayOrder) {
                                onPayOrder(message);
                              }
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white w-full"
                          >
                            Pay Now - Rp{" "}
                            {message.orderData?.price?.toLocaleString()}
                          </Button>
                        )}

                      {message.orderData?.status === "paid" && (
                        <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
                          <p className="text-sm text-green-700 font-semibold">
                            ✓ Payment Completed
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-medium-gray mt-3">
                        {format(new Date(message.createdAt), "HH:mm")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOwnMessage
                        ? "bg-dark-blue text-white"
                        : "bg-white text-dark-gray border border-gray-200"
                    }`}
                  >
                    {isGroup && !isOwnMessage && (
                      <p className="text-xs font-semibold mb-1 opacity-75">
                        {message.sender?.name}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? "text-blue-100" : "text-medium-gray"
                      }`}
                    >
                      {format(new Date(message.createdAt), "HH:mm")}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-light-gray bg-white">
        <div className="flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isSendingMessage}
          />
          <Button
            onClick={onSendMessage}
            disabled={!messageText.trim() || isSendingMessage}
            className="bg-dark-blue hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
