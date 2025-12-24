// API Client Functions for CampusCircle
// Replaces localStorage with real API calls

import { apiCache, CACHE_KEYS, CACHE_DURATION } from "./cache";

// ============================================
// TYPE DEFINITIONS
// ============================================
export interface FoodItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  foodType: string;
  quantity: number;
  unit: string;
  imageUrl?: string;
  allergens: string[];
  ingredients?: string;
  expiryDate?: Date;
  pickupLocation: string;
  pickupTime: string;
  isHalal: boolean;
  isVegan: boolean;
  isVegetarian: boolean;
  status: string;
  rating: number;
  reviewCount: number;
  viewCount: number;
  sellerId: string;
  seller?: any;
  orders?: any[];
  reviews?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  eventType: string;
  price: number;
  imageUrl?: string;
  bannerUrl?: string;
  location: string;
  venue?: string;
  isOnline: boolean;
  meetingLink?: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline?: Date;
  maxParticipants?: number;
  currentParticipants: number;
  tags: string[];
  requirements?: string;
  organizer: string;
  contactEmail?: string;
  contactPhone?: string;
  status: string;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  organizerId: string;
  organizerUser?: any;
  participants?: any[];
  reviews?: any[];
  updates?: any[];
  createdAt: Date;
  updatedAt: Date;
}

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
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.faculty) params.append("faculty", filters.faculty);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.sellerId) params.append("sellerId", filters.sellerId);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await fetch(`/api/marketplace?${params.toString()}`, {
      next: { revalidate: 30 },
    });
    if (!response.ok) throw new Error("Failed to fetch marketplace items");
    const data = await response.json();
    return data.items || data;
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
  async sendMessage(
    conversationId: string,
    content: string,
    messageType?: string,
    orderData?: any
  ) {
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, content, messageType, orderData }),
    });
    if (!response.ok) throw new Error("Failed to send message");
    return response.json();
  },

  // Send order request message
  async sendOrderRequest(conversationId: string, foodItem: any) {
    const orderData = {
      type: "food_order",
      foodId: foodItem.id,
      foodTitle: foodItem.title,
      foodImage: foodItem.imageUrl,
      price: foodItem.price,
      pickupLocation: foodItem.pickupLocation,
      pickupTime: foodItem.pickupTime,
      status: "pending",
    };

    return this.sendMessage(
      conversationId,
      `Order Request: ${
        foodItem.title
      } - Rp ${foodItem.price.toLocaleString()}`,
      "order_request",
      orderData
    );
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

  async autoReleaseBalances() {
    const response = await fetch("/api/balance/auto-release", {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to auto-release balances");
    return response.json();
  },
};

// ============================================
// PAYMENT API
// ============================================
export const paymentAPI = {
  async createPayment(data: {
    itemId: string;
    itemType: "marketplace" | "tutoring" | "food" | "event";
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
  async uploadFile(file: File, forceCompress: boolean = false) {
    const formData = new FormData();
    formData.append("file", file);
    if (forceCompress) {
      formData.append("forceCompress", "true");
    }

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      const error: any = new Error(errorData.error || "Failed to upload file");
      error.details = errorData.details;
      throw error;
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

      // Fetch the file as a blob to force download instead of opening in browser
      const fileResponse = await fetch(result.downloadUrl);
      const blob = await fileResponse.blob();

      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = result.fileName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
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

// ============================================
// WISHLIST API
// ============================================
export const wishlistAPI = {
  async getWishlist() {
    const response = await fetch("/api/wishlist");
    if (!response.ok) throw new Error("Failed to fetch wishlist");
    return response.json();
  },

  async toggleWishlist(itemId: string) {
    const response = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    if (!response.ok) throw new Error("Failed to toggle wishlist");
    return response.json();
  },
};

// ============================================
// FOOD API
// ============================================
export const foodAPI = {
  async getFoodItems(filters?: {
    category?: string;
    foodType?: string;
    isHalal?: boolean;
    isVegan?: boolean;
    isVegetarian?: boolean;
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.foodType) params.append("foodType", filters.foodType);
    if (filters?.isHalal !== undefined)
      params.append("isHalal", String(filters.isHalal));
    if (filters?.isVegan !== undefined)
      params.append("isVegan", String(filters.isVegan));
    if (filters?.isVegetarian !== undefined)
      params.append("isVegetarian", String(filters.isVegetarian));
    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await fetch(`/api/food?${params.toString()}`, {
      next: { revalidate: 30 },
    });
    if (!response.ok) throw new Error("Failed to fetch food items");
    const data = await response.json();
    return data.items || data;
  },

  async getFoodItem(id: string) {
    const response = await fetch(`/api/food/${id}`);
    if (!response.ok) throw new Error("Failed to fetch food item");
    return response.json();
  },

  async createFoodItem(data: Partial<FoodItem>) {
    const response = await fetch("/api/food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create food item");
    return response.json();
  },

  async updateFoodItem(id: string, data: Partial<FoodItem>) {
    const response = await fetch(`/api/food/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update food item");
    return response.json();
  },

  async deleteFoodItem(id: string) {
    const response = await fetch(`/api/food/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete food item");
    return response.json();
  },

  async createOrder(foodItemId: string, quantity: number, pickupTime: string) {
    const response = await fetch("/api/food/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodItemId, quantity, pickupTime }),
    });
    if (!response.ok) throw new Error("Failed to create order");
    return response.json();
  },

  async getMyOrders(type?: "purchases" | "sales") {
    const params = new URLSearchParams();
    if (type) params.append("type", type);

    const response = await fetch(`/api/food/orders?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch orders");
    return response.json();
  },

  async updateOrderStatus(orderId: string, status: string) {
    const response = await fetch(`/api/food/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error("Failed to update order status");
    return response.json();
  },

  async createReview(foodItemId: string, rating: number, comment?: string) {
    const response = await fetch("/api/food/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodItemId, rating, comment }),
    });
    if (!response.ok) throw new Error("Failed to create review");
    return response.json();
  },

  async getReviews(foodItemId: string) {
    const response = await fetch(`/api/food/reviews?foodItemId=${foodItemId}`);
    if (!response.ok) throw new Error("Failed to fetch reviews");
    return response.json();
  },
};

// ============================================
// EVENT API
// ============================================
export const eventAPI = {
  async getEvents(filters?: {
    category?: string;
    eventType?: string;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    isFeatured?: boolean;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.eventType) params.append("eventType", filters.eventType);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.isFeatured !== undefined)
      params.append("isFeatured", String(filters.isFeatured));
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await fetch(`/api/events?${params.toString()}`, {
      next: { revalidate: 30 },
    });
    if (!response.ok) throw new Error("Failed to fetch events");
    const data = await response.json();
    return data.items || data;
  },

  async getEvent(id: string) {
    const response = await fetch(`/api/events/${id}`);
    if (!response.ok) throw new Error("Failed to fetch event");
    return response.json();
  },

  async createEvent(data: Partial<Event>) {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create event");
    return response.json();
  },

  async updateEvent(id: string, data: Partial<Event>) {
    const response = await fetch(`/api/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update event");
    return response.json();
  },

  async deleteEvent(id: string) {
    const response = await fetch(`/api/events/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete event");
    return response.json();
  },

  async registerForEvent(eventId: string) {
    const response = await fetch(`/api/events/${eventId}/register`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to register for event");
    return response.json();
  },

  async cancelRegistration(eventId: string) {
    const response = await fetch(`/api/events/${eventId}/register`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to cancel registration");
    return response.json();
  },

  async getMyEvents() {
    const response = await fetch("/api/events?myEvents=true");
    if (!response.ok) throw new Error("Failed to fetch my events");
    return response.json();
  },

  async getMyRegistrations() {
    const response = await fetch("/api/events/my-registrations");
    if (!response.ok) throw new Error("Failed to fetch my registrations");
    return response.json();
  },
};
