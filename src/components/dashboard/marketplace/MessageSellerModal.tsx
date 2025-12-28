"use client";

import { useState, useEffect, useRef } from "react";
import { X, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { conversationsAPI, messagesAPI } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUnreadMessages } from "@/contexts/UnreadMessagesContext";

type MessageSellerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    price: number;
    thumbnailUrl?: string | null;
    sellerId: string;
    seller?: {
      name: string | null;
    };
  } | null;
  currentUserId: string;
};

export function MessageSellerModal({
  isOpen,
  onClose,
  item,
  currentUserId,
}: MessageSellerModalProps) {
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageCountRef = useRef<number>(0);
  const { refreshUnreadCount } = useUnreadMessages();

  useEffect(() => {
    if (isOpen && item) {
      createOrGetConversation();
    } else if (!isOpen) {
      refreshUnreadCount();
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isOpen, item]);

  const createOrGetConversation = async () => {
    if (!item) return;

    try {
      const conversation = await conversationsAPI.createConversation(
        item.sellerId
      );
      setConversationId(conversation.id);

      const msgs = await messagesAPI.getMessages(conversation.id);
      setMessages(msgs);
      lastMessageCountRef.current = msgs.length;

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      pollingIntervalRef.current = setInterval(() => {
        fetchNewMessages(conversation.id);
      }, 2000);
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create conversation");
    }
  };

  const fetchNewMessages = async (convId: string) => {
    try {
      const msgs = await messagesAPI.getMessages(convId);

      if (msgs.length > lastMessageCountRef.current) {
        const newMessagesCount = msgs.length - lastMessageCountRef.current;
        const hasNewMessagesFromOther = msgs
          .slice(-newMessagesCount)
          .some((msg: any) => msg.senderId !== currentUserId);

        if (hasNewMessagesFromOther) {
          toast.success(`New message received!`);
        }

        setMessages(msgs);
        lastMessageCountRef.current = msgs.length;

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversationId || !item) return;

    try {
      setIsSending(true);
      const content = messageText.trim();
      setMessageText("");

      await messagesAPI.sendMessage(conversationId, content);

      const msgs = await messagesAPI.getMessages(conversationId);
      setMessages(msgs);
      lastMessageCountRef.current = msgs.length;

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setMessageText(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleViewFullConversation = () => {
    if (item) {
      router.push(`/dashboard/messages?userId=${item.sellerId}`);
      onClose();
    }
  };

  if (!isOpen || !item) return null;

  const sellerName = item.seller?.name || "Seller";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Message Seller</h2>
                <p className="text-xs text-white/80">Chat with {sellerName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-3">
            {item.thumbnailUrl && (
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-sm line-clamp-1">
                {item.title}
              </h3>
              <p className="text-lg font-bold text-blue-600 mt-1">
                Rp {item.price.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">
              Start a conversation about this item
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.senderId === currentUserId
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-lg ${
                    msg.senderId === currentUserId
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-900 border"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-white">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || isSending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleViewFullConversation}
            >
              View Full Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
