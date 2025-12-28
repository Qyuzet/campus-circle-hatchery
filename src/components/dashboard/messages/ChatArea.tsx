"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, Users, UserPlus } from "lucide-react";
import { format } from "date-fns";

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
