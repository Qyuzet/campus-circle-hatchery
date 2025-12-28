"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { conversationsAPI } from "@/lib/api";

interface UnreadMessagesContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const UnreadMessagesContext = createContext<
  UnreadMessagesContextType | undefined
>(undefined);

export function UnreadMessagesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unreadCount, setUnreadCount] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshUnreadCount = async () => {
    try {
      const conversations = await conversationsAPI.getConversations();
      const total = conversations.reduce(
        (sum: number, conv: any) => sum + (conv.unreadCount || 0),
        0
      );
      setUnreadCount(total);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    refreshUnreadCount();

    pollingIntervalRef.current = setInterval(() => {
      refreshUnreadCount();
    }, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return (
    <UnreadMessagesContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  const context = useContext(UnreadMessagesContext);
  if (context === undefined) {
    throw new Error(
      "useUnreadMessages must be used within UnreadMessagesProvider"
    );
  }
  return context;
}

