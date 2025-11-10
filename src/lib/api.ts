// API Client Functions for CampusCircle
// Replaces localStorage with real API calls

// ============================================
// MARKETPLACE API
// ============================================
export const marketplaceAPI = {
  // Get all marketplace items with optional filters
  async getItems(filters?: {
    category?: string;
    faculty?: string;
    search?: string;
    status?: string;
    sellerId?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.faculty) params.append("faculty", filters.faculty);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.sellerId) params.append("sellerId", filters.sellerId);

    const response = await fetch(`/api/marketplace?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch marketplace items");
    return response.json();
  },

  // Get single marketplace item
  async getItem(id: string) {
    const response = await fetch(`/api/marketplace/${id}`);
    if (!response.ok) throw new Error("Failed to fetch marketplace item");
    return response.json();
  },

  // Create new marketplace item
  async createItem(data: {
    title: string;
    description: string;
    price: number;
    category: string;
    course: string;
    faculty: string;
    imageUrl?: string;
    fileUrl?: string;
  }) {
    const response = await fetch("/api/marketplace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create marketplace item");
    return response.json();
  },

  // Update marketplace item
  async updateItem(id: string, data: any) {
    const response = await fetch(`/api/marketplace/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update marketplace item");
    return response.json();
  },

  // Delete marketplace item
  async deleteItem(id: string) {
    const response = await fetch(`/api/marketplace/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete marketplace item");
    return response.json();
  },
};

// ============================================
// CONVERSATIONS API
// ============================================
export const conversationsAPI = {
  // Get all conversations for current user
  async getConversations() {
    const response = await fetch("/api/conversations");
    if (!response.ok) throw new Error("Failed to fetch conversations");
    return response.json();
  },

  // Create new conversation
  async createConversation(otherUserId: string) {
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId }),
    });
    if (!response.ok) throw new Error("Failed to create conversation");
    return response.json();
  },
};

// ============================================
// MESSAGES API
// ============================================
export const messagesAPI = {
  // Get messages for a conversation
  async getMessages(conversationId: string) {
    const response = await fetch(
      `/api/messages?conversationId=${conversationId}`
    );
    if (!response.ok) throw new Error("Failed to fetch messages");
    return response.json();
  },

  // Send a message
  async sendMessage(conversationId: string, content: string) {
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, content }),
    });
    if (!response.ok) throw new Error("Failed to send message");
    return response.json();
  },
};

// ============================================
// TUTORING API
// ============================================
export const tutoringAPI = {
  // Get tutoring sessions
  async getSessions(filters?: {
    type?: "tutor" | "student" | "all";
    status?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.status) params.append("status", filters.status);

    const response = await fetch(`/api/tutoring?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch tutoring sessions");
    return response.json();
  },

  // Get single tutoring session
  async getSession(id: string) {
    const response = await fetch(`/api/tutoring/${id}`);
    if (!response.ok) throw new Error("Failed to fetch tutoring session");
    return response.json();
  },

  // Create tutoring session
  async createSession(data: {
    subject: string;
    course: string;
    description: string;
    price: number;
    duration: number;
    scheduledAt: string;
    studentId?: string;
  }) {
    const response = await fetch("/api/tutoring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create tutoring session");
    return response.json();
  },

  // Update tutoring session
  async updateSession(id: string, data: any) {
    const response = await fetch(`/api/tutoring/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update tutoring session");
    return response.json();
  },

  // Delete tutoring session
  async deleteSession(id: string) {
    const response = await fetch(`/api/tutoring/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete tutoring session");
    return response.json();
  },
};

// ============================================
// NOTIFICATIONS API
// ============================================
export const notificationsAPI = {
  async getNotifications() {
    const response = await fetch("/api/notifications");
    if (!response.ok) throw new Error("Failed to fetch notifications");
    return response.json();
  },

  async markAsRead(notificationIds: string[]) {
    const response = await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationIds }),
    });
    if (!response.ok) throw new Error("Failed to mark notifications as read");
    return response.json();
  },
};

// ============================================
// USER STATS API
// ============================================
export const statsAPI = {
  async getUserStats() {
    const response = await fetch("/api/stats");
    if (!response.ok) throw new Error("Failed to fetch user stats");
    return response.json();
  },
};
