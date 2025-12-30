export interface User {
  id: string;
  studentId: string;
  name: string;
  email: string;
  faculty: string;
  major: string;
  year: number;
  avatar?: string;
  rating: number;
  totalSales: number;
  totalPurchases: number;
  joinedAt: string;
  bio?: string;
  skills?: string[];
}

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: "Notes" | "Tutorial" | "Tutoring" | "Assignment" | "Book" | "Other";
  course: string;
  faculty: string;
  sellerId: string;
  seller:
    | string
    | {
        id: string;
        name: string;
        studentId: string;
        rating: number;
        totalSales: number;
      };
  imageUrl?: string;
  images?: string[];
  tags?: string[];
  condition?: "New" | "Like New" | "Good" | "Fair";
  isDigital?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  thumbnailUrl?: string;
  rating: number;
  reviews: number;
  reviewCount: number;
  views?: number;
  viewCount: number;
  downloadCount: number;
  favorites?: number;
  status: "available" | "sold" | "pending";
  createdAt: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  itemId?: string;
  isRead: boolean;
  timestamp: string;
}

export interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface TutoringSession {
  id: string;
  tutorId: string;
  studentId: string;
  tutorName: string;
  studentName: string;
  subject: string;
  course: string;
  description: string;
  price: number;
  duration: number; // in minutes
  status: "pending" | "confirmed" | "completed" | "cancelled";
  scheduledAt: string;
  createdAt: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  itemId?: string;
  sessionId?: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: "message" | "purchase" | "sale" | "review" | "tutoring" | "system";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface UserStats {
  itemsSold: number;
  itemsBought: number;
  totalEarnings: number;
  totalSpent: number;
  rating: number;
  reviewCount: number;
  messagesCount: number;
  [key: string]: number; // Allow dynamic stat names
}

export interface AINote {
  id: string;
  userId: string;
  title: string;
  content: string;
  rawContent?: string;
  subject?: string;
  course?: string;
  tags: string[];
  aiSummary?: string;
  aiKeyPoints?: {
    points: string[];
    concepts: string[];
    definitions: Record<string, string>;
  };
  aiMetadata?: {
    wordCount: number;
    readingTime: number;
    difficulty: string;
    topics: string[];
  };
  noteType: "MANUAL" | "LIVE_LECTURE" | "IMPORTED";
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LiveLectureInterest {
  id: string;
  userId: string;
  email: string;
  name: string;
  faculty: string;
  major: string;
  useCase: string;
  frequency: string;
  features: string[];
  createdAt: string;
}
