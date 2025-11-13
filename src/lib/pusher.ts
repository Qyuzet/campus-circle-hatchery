// Pusher Configuration for Real-time Messaging
import Pusher from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance (for sending events)
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1",
  useTLS: true,
});

// Client-side Pusher instance (for receiving events)
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY || "",
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1",
  }
);

// Enable Pusher logging in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (PusherClient as any).logToConsole = true;
}

// Helper function to get conversation channel name
export const getConversationChannel = (conversationId: string) => {
  return `conversation-${conversationId}`;
};

// Helper function to trigger new message event
export const triggerNewMessage = async (
  conversationId: string,
  message: any
) => {
  try {
    await pusherServer.trigger(
      getConversationChannel(conversationId),
      "new-message",
      message
    );
    return { success: true };
  } catch (error) {
    console.error("Pusher trigger error:", error);
    return { success: false, error };
  }
};

// Helper function to trigger typing indicator
export const triggerTypingIndicator = async (
  conversationId: string,
  userId: string,
  isTyping: boolean
) => {
  try {
    await pusherServer.trigger(
      getConversationChannel(conversationId),
      "typing",
      { userId, isTyping }
    );
    return { success: true };
  } catch (error) {
    console.error("Pusher typing trigger error:", error);
    return { success: false, error };
  }
};
