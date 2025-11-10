// Local Storage Management for CampusCircle
import {
  MarketplaceItem,
  Message,
  Conversation,
  TutoringSession,
  User,
  Notification,
  UserStats,
} from "@/types";

// Storage Keys
const STORAGE_KEYS = {
  USER: "campusCircle_user",
  MARKETPLACE_ITEMS: "campusCircle_marketplace_items",
  CONVERSATIONS: "campusCircle_conversations",
  MESSAGES: "campusCircle_messages",
  TUTORING_SESSIONS: "campusCircle_tutoring_sessions",
  NOTIFICATIONS: "campusCircle_notifications",
  USER_STATS: "campusCircle_user_stats",
} as const;

// Generic storage utilities
export const storage = {
  get: <T>(key: string): T | null => {
    if (typeof window === "undefined") return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  clear: (): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },
};

// User Management
export const userStorage = {
  getCurrentUser: (): User | null => {
    return storage.get<User>(STORAGE_KEYS.USER);
  },

  setCurrentUser: (user: User): void => {
    storage.set(STORAGE_KEYS.USER, user);
  },

  updateUser: (updates: Partial<User>): User | null => {
    const currentUser = userStorage.getCurrentUser();
    if (!currentUser) return null;

    const updatedUser = { ...currentUser, ...updates };
    userStorage.setCurrentUser(updatedUser);
    return updatedUser;
  },

  logout: (): void => {
    storage.remove(STORAGE_KEYS.USER);
  },
};

// Marketplace Items Management
export const marketplaceStorage = {
  getItems: (): MarketplaceItem[] => {
    return storage.get<MarketplaceItem[]>(STORAGE_KEYS.MARKETPLACE_ITEMS) || [];
  },

  addItem: (
    item: Omit<MarketplaceItem, "id" | "createdAt">
  ): MarketplaceItem => {
    const items = marketplaceStorage.getItems();
    const newItem: MarketplaceItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    storage.set(STORAGE_KEYS.MARKETPLACE_ITEMS, items);
    return newItem;
  },

  updateItem: (
    id: string,
    updates: Partial<MarketplaceItem>
  ): MarketplaceItem | null => {
    const items = marketplaceStorage.getItems();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    items[index] = { ...items[index], ...updates };
    storage.set(STORAGE_KEYS.MARKETPLACE_ITEMS, items);
    return items[index];
  },

  deleteItem: (id: string): boolean => {
    const items = marketplaceStorage.getItems();
    const filteredItems = items.filter((item) => item.id !== id);
    if (filteredItems.length === items.length) return false;

    storage.set(STORAGE_KEYS.MARKETPLACE_ITEMS, filteredItems);
    return true;
  },

  getItemById: (id: string): MarketplaceItem | null => {
    const items = marketplaceStorage.getItems();
    return items.find((item) => item.id === id) || null;
  },

  searchItems: (query: string, category?: string): MarketplaceItem[] => {
    const items = marketplaceStorage.getItems();
    return items.filter((item) => {
      const matchesQuery =
        query === "" ||
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.course.toLowerCase().includes(query.toLowerCase());

      const matchesCategory = !category || item.category === category;

      return matchesQuery && matchesCategory;
    });
  },
};

// Messages and Conversations Management
export const messageStorage = {
  getConversations: (): Conversation[] => {
    return storage.get<Conversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];
  },

  getMessages: (conversationId: string): Message[] => {
    const allMessages =
      storage.get<Record<string, Message[]>>(STORAGE_KEYS.MESSAGES) || {};
    return allMessages[conversationId] || [];
  },

  addMessage: (
    conversationId: string,
    message: Omit<Message, "id" | "timestamp">
  ): Message => {
    const allMessages =
      storage.get<Record<string, Message[]>>(STORAGE_KEYS.MESSAGES) || {};
    const conversationMessages = allMessages[conversationId] || [];

    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    conversationMessages.push(newMessage);
    allMessages[conversationId] = conversationMessages;
    storage.set(STORAGE_KEYS.MESSAGES, allMessages);

    // Update conversation last message
    messageStorage.updateConversationLastMessage(conversationId, newMessage);

    return newMessage;
  },

  createConversation: (
    otherUserId: string,
    otherUserName: string
  ): Conversation => {
    const conversations = messageStorage.getConversations();

    // Check if conversation already exists
    const existingConversation = conversations.find(
      (conv) => conv.otherUserId === otherUserId
    );

    if (existingConversation) {
      return existingConversation;
    }

    const newConversation: Conversation = {
      id: Date.now().toString(),
      otherUserId,
      otherUserName,
      lastMessage: "",
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
    };

    conversations.push(newConversation);
    storage.set(STORAGE_KEYS.CONVERSATIONS, conversations);
    return newConversation;
  },

  updateConversationLastMessage: (
    conversationId: string,
    message: Message
  ): void => {
    const conversations = messageStorage.getConversations();
    const index = conversations.findIndex((conv) => conv.id === conversationId);
    if (index !== -1) {
      conversations[index].lastMessage = message.content;
      conversations[index].lastMessageTime = message.timestamp;
      storage.set(STORAGE_KEYS.CONVERSATIONS, conversations);
    }
  },

  markConversationAsRead: (conversationId: string): void => {
    const conversations = messageStorage.getConversations();
    const index = conversations.findIndex((conv) => conv.id === conversationId);
    if (index !== -1) {
      conversations[index].unreadCount = 0;
      storage.set(STORAGE_KEYS.CONVERSATIONS, conversations);
    }
  },

  clearAllConversations: (): void => {
    storage.remove(STORAGE_KEYS.CONVERSATIONS);
    storage.remove(STORAGE_KEYS.MESSAGES);
  },
};

// Tutoring Sessions Management
export const tutoringStorage = {
  getSessions: (): TutoringSession[] => {
    return storage.get<TutoringSession[]>(STORAGE_KEYS.TUTORING_SESSIONS) || [];
  },

  addSession: (
    session: Omit<TutoringSession, "id" | "createdAt">
  ): TutoringSession => {
    const sessions = tutoringStorage.getSessions();
    const newSession: TutoringSession = {
      ...session,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    sessions.push(newSession);
    storage.set(STORAGE_KEYS.TUTORING_SESSIONS, sessions);
    return newSession;
  },

  updateSession: (
    id: string,
    updates: Partial<TutoringSession>
  ): TutoringSession | null => {
    const sessions = tutoringStorage.getSessions();
    const index = sessions.findIndex((session) => session.id === id);
    if (index === -1) return null;

    sessions[index] = { ...sessions[index], ...updates };
    storage.set(STORAGE_KEYS.TUTORING_SESSIONS, sessions);
    return sessions[index];
  },

  deleteSession: (id: string): boolean => {
    const sessions = tutoringStorage.getSessions();
    const filteredSessions = sessions.filter((session) => session.id !== id);
    if (filteredSessions.length === sessions.length) return false;

    storage.set(STORAGE_KEYS.TUTORING_SESSIONS, filteredSessions);
    return true;
  },
};

// Notifications Management
export const notificationStorage = {
  getNotifications: (): Notification[] => {
    return storage.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || [];
  },

  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">
  ): Notification => {
    const notifications = notificationStorage.getNotifications();
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    notifications.unshift(newNotification); // Add to beginning
    storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return newNotification;
  },

  markAsRead: (id: string): void => {
    const notifications = notificationStorage.getNotifications();
    const index = notifications.findIndex((notif) => notif.id === id);
    if (index !== -1) {
      notifications[index].read = true;
      storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
  },

  markAllAsRead: (): void => {
    const notifications = notificationStorage.getNotifications();
    notifications.forEach((notif) => (notif.read = true));
    storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },

  getUnreadCount: (): number => {
    const notifications = notificationStorage.getNotifications();
    return notifications.filter((notif) => !notif.read).length;
  },
};

// User Stats Management
export const statsStorage = {
  getUserStats: (): UserStats => {
    return (
      storage.get<UserStats>(STORAGE_KEYS.USER_STATS) || {
        itemsSold: 0,
        itemsBought: 0,
        totalEarnings: 0,
        totalSpent: 0,
        rating: 5.0,
        reviewCount: 0,
        messagesCount: 0,
      }
    );
  },

  updateStats: (updates: Partial<UserStats>): void => {
    const currentStats = statsStorage.getUserStats();
    const updatedStats = { ...currentStats, ...updates };
    storage.set(STORAGE_KEYS.USER_STATS, updatedStats);
  },

  incrementStat: (statName: string, amount: number = 1): void => {
    const stats = statsStorage.getUserStats();
    stats[statName] = (stats[statName] || 0) + amount;
    storage.set(STORAGE_KEYS.USER_STATS, stats);
  },
};

// Reset conversations data to clean state
export const resetConversationsData = (): void => {
  messageStorage.clearAllConversations();

  // Re-initialize clean sample conversations
  const sampleConversations: Conversation[] = [
    {
      id: "conv1",
      otherUserId: "user1",
      otherUserName: "Alex Chen",
      lastMessage: "Hi, is the Data Structures notes still available?",
      lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      unreadCount: 1,
    },
    {
      id: "conv2",
      otherUserId: "user2",
      otherUserName: "Sarah Wilson",
      lastMessage: "Thanks for the tutorial! Very helpful.",
      lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      unreadCount: 0,
    },
    {
      id: "conv3",
      otherUserId: "user3",
      otherUserName: "Mike Johnson",
      lastMessage: "When can we schedule the Java tutoring session?",
      lastMessageTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      unreadCount: 2,
    },
  ];
  storage.set(STORAGE_KEYS.CONVERSATIONS, sampleConversations);
};

// Initialize default data
export const initializeDefaultData = (): void => {
  // Initialize with sample data if no data exists
  if (!storage.get(STORAGE_KEYS.MARKETPLACE_ITEMS)) {
    const sampleItems: MarketplaceItem[] = [
      {
        id: "1",
        title: "Data Structures & Algorithms Notes",
        description:
          "Complete notes for COMP6048 including examples and practice problems",
        price: 50000,
        category: "Notes",
        course: "COMP6048",
        seller: "John Doe",
        sellerId: "user1",
        rating: 4.8,
        reviews: 12,
        imageUrl:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
        status: "available",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Database Systems Tutorial",
        description:
          "Step-by-step tutorial for database design and SQL queries",
        price: 75000,
        category: "Tutorial",
        course: "COMP6047",
        seller: "Jane Smith",
        sellerId: "user2",
        rating: 4.9,
        reviews: 8,
        imageUrl:
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
        status: "available",
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        title: "Java Programming Bootcamp",
        description:
          "1-on-1 tutoring session for Java programming fundamentals",
        price: 100000,
        category: "Tutoring",
        course: "COMP6049",
        seller: "Mike Johnson",
        sellerId: "user3",
        rating: 5.0,
        reviews: 15,
        imageUrl:
          "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop",
        status: "available",
        createdAt: new Date().toISOString(),
      },
    ];
    storage.set(STORAGE_KEYS.MARKETPLACE_ITEMS, sampleItems);
  }

  // Initialize sample conversations
  if (!storage.get(STORAGE_KEYS.CONVERSATIONS)) {
    const sampleConversations: Conversation[] = [
      {
        id: "conv1",
        otherUserId: "user1",
        otherUserName: "Alex Chen",
        lastMessage: "Hi, is the Data Structures notes still available?",
        lastMessageTime: new Date(
          Date.now() - 2 * 60 * 60 * 1000
        ).toISOString(),
        unreadCount: 1,
      },
      {
        id: "conv2",
        otherUserId: "user2",
        otherUserName: "Sarah Wilson",
        lastMessage: "Thanks for the tutorial! Very helpful.",
        lastMessageTime: new Date(
          Date.now() - 24 * 60 * 60 * 1000
        ).toISOString(),
        unreadCount: 0,
      },
      {
        id: "conv3",
        otherUserId: "user3",
        otherUserName: "Mike Johnson",
        lastMessage: "When can we schedule the Java tutoring session?",
        lastMessageTime: new Date(
          Date.now() - 3 * 60 * 60 * 1000
        ).toISOString(),
        unreadCount: 2,
      },
    ];
    storage.set(STORAGE_KEYS.CONVERSATIONS, sampleConversations);
  }

  // Initialize sample tutoring sessions
  if (!storage.get(STORAGE_KEYS.TUTORING_SESSIONS)) {
    const sampleSessions: TutoringSession[] = [
      {
        id: "session1",
        tutorId: "user3",
        studentId: "current-user",
        tutorName: "Mike Johnson",
        studentName: "Current Student",
        subject: "Java Programming",
        course: "COMP6049",
        description: "Learn Java fundamentals and object-oriented programming",
        price: 100000,
        duration: 90,
        status: "confirmed",
        scheduledAt: new Date(
          Date.now() + 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];
    storage.set(STORAGE_KEYS.TUTORING_SESSIONS, sampleSessions);
  }

  // Initialize sample notifications
  if (!storage.get(STORAGE_KEYS.NOTIFICATIONS)) {
    const sampleNotifications: Notification[] = [
      {
        id: "notif1",
        userId: "current-user",
        type: "message",
        title: "New Message",
        content: "John Doe sent you a message about Data Structures notes",
        read: false,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: "notif2",
        userId: "current-user",
        type: "tutoring",
        title: "Tutoring Session Confirmed",
        content:
          "Your Java Programming session with Mike Johnson has been confirmed",
        read: false,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "notif3",
        userId: "current-user",
        type: "system",
        title: "Welcome to CampusCircle!",
        content:
          "Start exploring study materials and connect with fellow students",
        read: true,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "notif4",
        userId: "current-user",
        type: "purchase",
        title: "Payment Received",
        content: "You received Rp 50,000 for your Calculus notes",
        read: false,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "notif5",
        userId: "current-user",
        type: "system",
        title: "New Feature: Academic Support",
        content: "Check out the new Insights tab to offer tutoring services",
        read: false,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
    ];
    storage.set(STORAGE_KEYS.NOTIFICATIONS, sampleNotifications);
  }

  // Initialize user stats if not exists
  if (!storage.get(STORAGE_KEYS.USER_STATS)) {
    statsStorage.updateStats({
      itemsSold: 12,
      itemsBought: 8,
      totalEarnings: 850000,
      totalSpent: 320000,
      rating: 4.9,
      reviewCount: 24,
      messagesCount: 24,
    });
  }
};
