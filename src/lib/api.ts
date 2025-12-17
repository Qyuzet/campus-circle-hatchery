// API Client Functions for CampusCircle
// Replaces localStorage with real API calls

import { apiCache, CACHE_KEYS, CACHE_DURATION } from "./cache";

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
    condition?: string;
    imageUrl?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    thumbnailUrl?: string;
  }) {
    const response = await fetch("/api/marketplace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create marketplace item");
    }
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
  async getNotifications(useCache = true) {
    if (useCache) {
      const cached = apiCache.get(CACHE_KEYS.NOTIFICATIONS);
      if (cached) return cached;
    }

    const response = await fetch("/api/notifications");
    if (!response.ok) throw new Error("Failed to fetch notifications");
    const data = await response.json();

    apiCache.set(CACHE_KEYS.NOTIFICATIONS, data, CACHE_DURATION.SHORT);
    return data;
  },

  async markAsRead(notificationIds: string[]) {
    const response = await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationIds }),
    });
    if (!response.ok) throw new Error("Failed to mark notifications as read");

    apiCache.invalidate(CACHE_KEYS.NOTIFICATIONS);
    return response.json();
  },
};

// ============================================
// USER STATS API
// ============================================
export const statsAPI = {
  async getUserStats(useCache = true) {
    if (useCache) {
      const cached = apiCache.get(CACHE_KEYS.USER_STATS);
      if (cached) return cached;
    }

    const response = await fetch("/api/stats");
    if (!response.ok) throw new Error("Failed to fetch user stats");
    const data = await response.json();

    apiCache.set(CACHE_KEYS.USER_STATS, data, CACHE_DURATION.MEDIUM);
    return data;
  },
};

// ============================================
// PAYMENT API
// ============================================
export const paymentAPI = {
  async createPayment(data: {
    itemId: string;
    itemType: "marketplace" | "tutoring";
    amount: number;
    itemTitle: string;
  }) {
    const response = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create payment");
    }
    return await response.json();
  },

  async getPaymentStatus(orderId: string) {
    const response = await fetch(`/api/payment/status?orderId=${orderId}`);
    if (!response.ok) throw new Error("Failed to get payment status");
    return await response.json();
  },
};

// ============================================
// TRANSACTIONS API
// ============================================
export const transactionsAPI = {
  async getTransactions(
    filters?: {
      type?: "purchases" | "sales";
      status?: string;
      itemType?: "marketplace" | "tutoring";
    },
    useCache = true
  ) {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.itemType) params.append("itemType", filters.itemType);

    const cacheKey = `transactions-${params.toString()}`;

    if (useCache) {
      const cached = apiCache.get(cacheKey);
      if (cached) return cached;
    }

    const response = await fetch(`/api/transactions?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch transactions");
    const data = await response.json();
    const transactions = data.transactions;

    apiCache.set(cacheKey, transactions, CACHE_DURATION.MEDIUM);
    return transactions;
  },

  async checkPurchase(itemId: string) {
    const response = await fetch(
      `/api/transactions/check-purchase?itemId=${itemId}`
    );
    if (!response.ok) throw new Error("Failed to check purchase");
    return await response.json();
  },
};

// ============================================
// WITHDRAWALS API
// ============================================
export const withdrawalsAPI = {
  async getWithdrawals(filters?: { status?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);

    const response = await fetch(`/api/withdrawals?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch withdrawals");
    const data = await response.json();
    return data.withdrawals;
  },

  async createWithdrawal(data: {
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
    notes?: string;
  }) {
    const response = await fetch("/api/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create withdrawal");
    }
    return response.json();
  },

  async updateWithdrawalStatus(
    id: string,
    data: {
      status: string;
      rejectionReason?: string;
      irisReferenceNo?: string;
    }
  ) {
    const response = await fetch(`/api/withdrawals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update withdrawal");
    return response.json();
  },

  async getAdminWithdrawals(filters?: { status?: string; limit?: number }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await fetch(`/api/admin/withdrawals?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch admin withdrawals");
    return response.json();
  },
};

// ============================================
// FILE UPLOAD/DOWNLOAD API
// ============================================
export const fileAPI = {
  // Upload file
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload file");
    }

    return response.json();
  },

  // Download file (with verification and tracking)
  async downloadFile(itemId: string, fileUrl: string, fileName: string) {
    try {
      // Verify purchase and get download URL
      const response = await fetch(`/api/download?itemId=${itemId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to download file");
      }

      const result = await response.json();

      // Create a temporary link and trigger download
      const a = document.createElement("a");
      a.href = result.downloadUrl;
      a.download = result.fileName;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      throw error;
    }
  },
};

// ============================================
// USERS API
// ============================================
export const usersAPI = {
  // Get all users (for member selection)
  async getUsers(search?: string) {
    const url = search
      ? `/api/users?search=${encodeURIComponent(search)}`
      : "/api/users";
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
  },
};

// ============================================
// GROUPS API
// ============================================
export const groupsAPI = {
  // Get all groups for current user
  async getGroups() {
    const response = await fetch("/api/groups");
    if (!response.ok) throw new Error("Failed to fetch groups");
    return response.json();
  },

  // Get single group details
  async getGroup(groupId: string) {
    const response = await fetch(`/api/groups/${groupId}`);
    if (!response.ok) throw new Error("Failed to fetch group");
    return response.json();
  },

  // Create new group
  async createGroup(data: {
    name: string;
    description?: string;
    memberIds?: string[];
  }) {
    const response = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create group");
    return response.json();
  },

  // Update group details
  async updateGroup(
    groupId: string,
    data: { name?: string; description?: string }
  ) {
    const response = await fetch(`/api/groups/${groupId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update group");
    return response.json();
  },

  // Delete group
  async deleteGroup(groupId: string) {
    const response = await fetch(`/api/groups/${groupId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete group");
    return response.json();
  },

  // Add members to group
  async addMembers(groupId: string, userIds: string[]) {
    const response = await fetch(`/api/groups/${groupId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds }),
    });
    if (!response.ok) throw new Error("Failed to add members");
    return response.json();
  },

  // Remove member from group
  async removeMember(groupId: string, userId: string) {
    const response = await fetch(
      `/api/groups/${groupId}/members?userId=${userId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("Failed to remove member");
    return response.json();
  },

  // Get group messages
  async getMessages(groupId: string) {
    const response = await fetch(`/api/groups/${groupId}/messages`);
    if (!response.ok) throw new Error("Failed to fetch group messages");
    return response.json();
  },

  // Send group message
  async sendMessage(groupId: string, content: string) {
    const response = await fetch(`/api/groups/${groupId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error("Failed to send group message");
    return response.json();
  },
};

// ============================================
// USER API
// ============================================
export const userAPI = {
  async updateProfile(data: {
    name?: string;
    faculty?: string;
    major?: string;
    year?: number;
    bio?: string;
    studentId?: string;
    avatarUrl?: string;
  }) {
    const response = await fetch("/api/user/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update profile");
    }
    return response.json();
  },

  async getProfile() {
    const response = await fetch("/api/user/me");
    if (!response.ok) throw new Error("Failed to fetch profile");
    return response.json();
  },
};
