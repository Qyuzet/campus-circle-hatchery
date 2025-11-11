"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  MessageCircle,
  ShoppingCart,
  Plus,
  Search,
  Bell,
  User,
  Star,
  Heart,
  Eye,
  Grid,
  List,
  Send,
  X,
  Edit,
  Trash2,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  GraduationCap,
  Video,
  Book,
  TrendingUp,
  Package,
  Library,
} from "lucide-react";
import {
  marketplaceAPI,
  conversationsAPI,
  messagesAPI,
  tutoringAPI,
  notificationsAPI,
  statsAPI,
  transactionsAPI,
  fileAPI,
} from "@/lib/api";
import {
  MarketplaceItem,
  Conversation,
  TutoringSession,
  Notification,
} from "@/types";
import PaymentModal from "@/components/PaymentModal";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("discovery");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showTutoringModal, setShowTutoringModal] = useState(false);
  const [showItemDetailModal, setShowItemDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(
    null
  );
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messageText, setMessageText] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentItem, setPaymentItem] = useState<{
    id: string;
    title: string;
    price: number;
    type: "marketplace" | "tutoring";
  } | null>(null);

  // Data states
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>(
    []
  );
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [tutoringSessions, setTutoringSessions] = useState<TutoringSession[]>(
    []
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userStats, setUserStats] = useState<any>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [salesTransactions, setSalesTransactions] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Initialize data on component mount
  useEffect(() => {
    if (status === "authenticated") {
      loadData();
    }
  }, [status]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showNotifications &&
        !(event.target as Element).closest(".notifications-dropdown")
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load all data in parallel
      const [items, convos, sessions, notifs, stats, sales, purchases] =
        await Promise.all([
          marketplaceAPI.getItems(),
          conversationsAPI.getConversations(),
          tutoringAPI.getSessions({ type: "all" }),
          notificationsAPI.getNotifications(),
          statsAPI.getUserStats(),
          transactionsAPI.getTransactions({
            type: "sales",
            status: "COMPLETED",
          }),
          transactionsAPI.getTransactions({
            type: "purchases",
          }),
        ]);

      setMarketplaceItems(items);
      setConversations(convos);
      setTutoringSessions(sessions);
      setNotifications(notifs);
      setUserStats(stats);
      setSalesTransactions(sales);

      // Combine sales and purchases with type field
      const allTrans = [
        ...sales.map((t: any) => ({ ...t, type: "sale" })),
        ...purchases.map((t: any) => ({ ...t, type: "purchase" })),
      ].sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAllTransactions(allTrans);

      // Set current user from session
      if (session?.user) {
        setCurrentUser(session.user);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      // Optionally show error toast/notification
    } finally {
      setIsLoading(false);
    }
  };

  // Handler functions
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      const items = await marketplaceAPI.getItems({
        search: query,
        category: selectedCategory !== "All" ? selectedCategory : undefined,
      });
      setMarketplaceItems(items);
    } catch (error) {
      console.error("Error searching items:", error);
    }
  };

  const handleCategoryFilter = async (category: string) => {
    setSelectedCategory(category);
    try {
      const items = await marketplaceAPI.getItems({
        search: searchQuery,
        category: category !== "All" ? category : undefined,
      });
      setMarketplaceItems(items);
    } catch (error) {
      console.error("Error filtering items:", error);
    }
  };

  const handleAddItem = async (itemData: any) => {
    try {
      await marketplaceAPI.createItem(itemData);
      // Reload marketplace items
      const items = await marketplaceAPI.getItems();
      setMarketplaceItems(items);
      setShowAddItemModal(false);

      // Reload stats
      const stats = await statsAPI.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Failed to add item. Please try again.");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await marketplaceAPI.deleteItem(itemId);
      // Reload marketplace items
      const items = await marketplaceAPI.getItems();
      setMarketplaceItems(items);
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const msgs = await messagesAPI.getMessages(conversationId);
      setMessages(msgs);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async (conversationId: string, content: string) => {
    if (!content.trim()) return;

    try {
      await messagesAPI.sendMessage(conversationId, content.trim());
      setMessageText("");

      // Reload conversations
      const convos = await conversationsAPI.getConversations();
      setConversations(convos);

      // Reload messages
      await loadMessages(conversationId);

      // Reload stats
      const stats = await statsAPI.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleCreateConversation = async (
    otherUserId: string,
    otherUserName: string
  ) => {
    try {
      const conversation = await conversationsAPI.createConversation(
        otherUserId
      );
      const convos = await conversationsAPI.getConversations();
      setConversations(convos);
      setSelectedConversation(conversation.id);
      setShowMessageModal(true);
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Failed to create conversation. Please try again.");
    }
  };

  const handleAddTutoringSession = async (sessionData: any) => {
    try {
      await tutoringAPI.createSession(sessionData);

      // Reload tutoring sessions
      const sessions = await tutoringAPI.getSessions({ type: "all" });
      setTutoringSessions(sessions);
      setShowTutoringModal(false);

      // Reload stats
      const stats = await statsAPI.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error("Error adding tutoring session:", error);
      alert("Failed to add tutoring session. Please try again.");
    }
  };

  const handleDeleteTutoringSession = async (sessionId: string) => {
    try {
      await tutoringAPI.deleteSession(sessionId);

      // Reload tutoring sessions
      const sessions = await tutoringAPI.getSessions({ type: "all" });
      setTutoringSessions(sessions);
    } catch (error) {
      console.error("Error deleting tutoring session:", error);
      alert("Failed to delete tutoring session. Please try again.");
    }
  };

  const handleItemClick = (item: MarketplaceItem) => {
    setSelectedItem(item);
    setShowItemDetailModal(true);
  };

  const handleBuyItem = async (item: MarketplaceItem) => {
    // Open payment modal
    setPaymentItem({
      id: item.id,
      title: item.title,
      price: item.price,
      type: "marketplace",
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    // Reload data after successful payment
    try {
      const items = await marketplaceAPI.getItems();
      setMarketplaceItems(items);

      const stats = await statsAPI.getUserStats();
      setUserStats(stats);

      const notifs = await notificationsAPI.getNotifications();
      setNotifications(notifs);

      setShowItemDetailModal(false);
      alert("Payment successful! Your purchase has been confirmed.");
    } catch (error) {
      console.error("Error reloading data:", error);
    }
  };

  // Dynamic stats based on real data
  const stats = [
    {
      label: "Items Sold",
      value: marketplaceItems
        .filter(
          (item) => item.sellerId === currentUser?.id && item.status === "sold"
        )
        .length.toString(),
      icon: ShoppingCart,
      color: "bg-dark-blue",
    },
    {
      label: "Items Bought",
      value: (userStats.itemsBought || 0).toString(),
      icon: BookOpen,
      color: "bg-campus-green",
    },
    {
      label: "Messages",
      value: conversations.length.toString(),
      icon: MessageCircle,
      color: "bg-soft-blue",
    },
    {
      label: "Rating",
      value: "5.0",
      icon: Star,
      color: "bg-light-blue",
    },
  ];

  // Get filtered marketplace items
  const filteredItems =
    searchQuery || selectedCategory ? marketplaceItems : marketplaceItems;

  // Show loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-campus-blue-dark mx-auto mb-4"></div>
          <p className="text-dark-gray text-lg">Loading CampusCircle...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (handled by useEffect, but this is a fallback)
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img
                src="/campusCircle-logo.png"
                alt="CampusCircle Logo"
                className="h-6 w-6 sm:h-8 sm:w-8"
              />
              <span className="ml-2 text-lg sm:text-2xl font-bold">
                <span className="bg-gradient-to-r from-campus-blue-light to-campus-blue-dark bg-clip-text text-transparent">
                  Campus
                </span>
                <span className="bg-gradient-to-r from-circle-teal-light to-circle-teal-dark bg-clip-text text-transparent">
                  Circle
                </span>
              </span>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search - Hidden on mobile, shown on larger screens */}
              <div className="relative hidden md:block">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-gray" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search materials, courses..."
                  className="pl-10 pr-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue w-48 lg:w-64 transition-colors"
                />
              </div>

              <div className="relative">
                <button
                  className="relative p-2 text-medium-gray hover:text-dark-gray transition-colors"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                  {notifications.filter((n) => !n.isRead).length > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="notifications-dropdown absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-light-gray z-50">
                    <div className="p-4 border-b border-light-gray">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-dark-gray">
                          Notifications
                        </h3>
                        <button
                          onClick={async () => {
                            try {
                              const notifIds = notifications
                                .filter((n) => !n.isRead)
                                .map((n) => n.id);
                              if (notifIds.length > 0) {
                                await notificationsAPI.markAsRead(notifIds);
                                const notifs =
                                  await notificationsAPI.getNotifications();
                                setNotifications(notifs);
                              }
                            } catch (error) {
                              console.error(
                                "Error marking notifications:",
                                error
                              );
                            }
                          }}
                          className="text-sm text-dark-blue hover:text-blue-700"
                        >
                          Mark all read
                        </button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-light-gray hover:bg-gray-50 cursor-pointer ${
                              !notification.isRead ? "bg-blue-50" : ""
                            }`}
                            onClick={async () => {
                              try {
                                if (!notification.isRead) {
                                  await notificationsAPI.markAsRead([
                                    notification.id,
                                  ]);
                                  const notifs =
                                    await notificationsAPI.getNotifications();
                                  setNotifications(notifs);
                                }
                              } catch (error) {
                                console.error(
                                  "Error marking notification:",
                                  error
                                );
                              }
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              <div
                                className={`p-2 rounded-full ${
                                  notification.type === "message"
                                    ? "bg-blue-100"
                                    : notification.type === "purchase"
                                    ? "bg-green-100"
                                    : notification.type === "tutoring"
                                    ? "bg-purple-100"
                                    : notification.type === "system"
                                    ? "bg-yellow-100"
                                    : "bg-gray-100"
                                }`}
                              >
                                {notification.type === "message" && (
                                  <MessageCircle className="h-4 w-4 text-blue-600" />
                                )}
                                {notification.type === "purchase" && (
                                  <ShoppingCart className="h-4 w-4 text-green-600" />
                                )}
                                {notification.type === "tutoring" && (
                                  <GraduationCap className="h-4 w-4 text-purple-600" />
                                )}
                                {notification.type === "system" && (
                                  <Star className="h-4 w-4 text-yellow-600" />
                                )}
                                {![
                                  "message",
                                  "purchase",
                                  "tutoring",
                                  "system",
                                ].includes(notification.type) && (
                                  <Bell className="h-4 w-4 text-gray-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-dark-gray">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-medium-gray mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-medium-gray mt-2">
                                  {new Date(
                                    notification.createdAt
                                  ).toLocaleString()}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="h-12 w-12 text-medium-gray mx-auto mb-4" />
                          <p className="text-medium-gray">
                            No notifications yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push("/account")}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={32}
                    height={32}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-dark-blue rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
                  </div>
                )}
                <span className="text-xs sm:text-sm font-medium text-dark-gray hidden sm:block">
                  {session?.user?.name || session?.user?.email || "User"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Mobile Navigation */}
          <div className="lg:hidden">
            {/* Mobile Tab Navigation */}
            <div className="bg-white rounded-lg shadow p-2 mb-4">
              <div className="flex justify-around items-center">
                <button
                  onClick={() => setActiveTab("discovery")}
                  className={`flex flex-col items-center p-2 transition-colors ${
                    activeTab === "discovery"
                      ? "text-dark-blue"
                      : "text-medium-gray hover:text-dark-blue"
                  }`}
                  title="Marketplace"
                >
                  <ShoppingCart className="h-5 w-5" />
                </button>
                <button
                  onClick={() => router.push("/orders")}
                  className="flex flex-col items-center p-2 text-medium-gray hover:text-dark-blue transition-colors"
                  title="Orders"
                >
                  <Package className="h-5 w-5" />
                </button>
                <button
                  onClick={() => router.push("/library")}
                  className="flex flex-col items-center p-2 text-medium-gray hover:text-dark-blue transition-colors"
                  title="Library"
                >
                  <Library className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setActiveTab("messages")}
                  className={`flex flex-col items-center p-2 transition-colors relative ${
                    activeTab === "messages"
                      ? "text-dark-blue"
                      : "text-medium-gray hover:text-dark-blue"
                  }`}
                  title="Messages"
                >
                  <MessageCircle className="h-5 w-5" />
                  {userStats && userStats.messagesCount > 0 && (
                    <span className="absolute top-1 right-1 bg-green-status text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {userStats.messagesCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("insights")}
                  className={`flex flex-col items-center p-2 transition-colors ${
                    activeTab === "insights"
                      ? "text-dark-blue"
                      : "text-medium-gray hover:text-dark-blue"
                  }`}
                  title="Analytics"
                >
                  <TrendingUp className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-6">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("discovery")}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "discovery"
                      ? "bg-primary-100 text-dark-blue"
                      : "text-medium-gray hover:bg-secondary-100"
                  }`}
                >
                  <ShoppingCart className="mr-3 h-5 w-5" />
                  Marketplace
                </button>

                <button
                  onClick={() => router.push("/orders")}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-medium-gray hover:bg-secondary-100"
                >
                  <Package className="mr-3 h-5 w-5" />
                  Orders
                </button>

                <button
                  onClick={() => router.push("/library")}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-medium-gray hover:bg-secondary-100"
                >
                  <Library className="mr-3 h-5 w-5" />
                  Library
                </button>

                <button
                  onClick={() => setActiveTab("messages")}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "messages"
                      ? "bg-primary-100 text-dark-blue"
                      : "text-medium-gray hover:bg-secondary-100"
                  }`}
                >
                  <MessageCircle className="mr-3 h-5 w-5" />
                  Messages
                  {conversations.filter((c) => c.unreadCount > 0).length >
                    0 && (
                    <span className="ml-auto bg-green-status bg-opacity-10 text-green-status text-xs rounded-full px-2 py-1">
                      {conversations.filter((c) => c.unreadCount > 0).length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("insights")}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "insights"
                      ? "bg-primary-100 text-dark-blue"
                      : "text-medium-gray hover:bg-secondary-100"
                  }`}
                >
                  <TrendingUp className="mr-3 h-5 w-5" />
                  Analytics
                </button>
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowAddItemModal(true)}
                  className="w-full bg-dark-blue text-white px-4 py-2.5 rounded-md hover:bg-primary-800 transition-colors flex items-center justify-center font-medium"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "discovery" && (
              <div className="space-y-6">
                {/* Header with Search and Filters */}
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <CardTitle className="text-2xl">
                          Discover Study Materials
                        </CardTitle>
                        <CardDescription>
                          Browse and purchase study materials from fellow
                          students
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => setShowAddItemModal(true)}
                        className="md:w-auto"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Item
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Search */}
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by title, course, or description..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      {/* Category Filter */}
                      <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryFilter(e.target.value)}
                        className="px-3 py-2 border border-input rounded-md text-sm bg-background hover:bg-accent transition-colors"
                      >
                        <option value="">All Categories</option>
                        <option value="Notes">📝 Notes</option>
                        <option value="Tutorial">🎥 Tutorial</option>
                        <option value="Tutoring">👨‍🏫 Tutoring</option>
                        <option value="Assignment">📄 Assignment</option>
                        <option value="Book">📚 Book</option>
                        <option value="Other">📦 Other</option>
                      </select>

                      {/* View Mode Toggle */}
                      <div className="flex border border-input rounded-md">
                        <Button
                          variant={viewMode === "grid" ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("grid")}
                          className="rounded-r-none"
                        >
                          <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={viewMode === "list" ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("list")}
                          className="rounded-l-none"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Active Filters */}
                    {(selectedCategory || searchQuery) && (
                      <div className="flex items-center gap-2 mt-4">
                        <span className="text-sm text-muted-foreground">
                          Active filters:
                        </span>
                        {selectedCategory && (
                          <Badge variant="secondary" className="gap-1">
                            {selectedCategory}
                            <button
                              onClick={() => handleCategoryFilter("")}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )}
                        {searchQuery && (
                          <Badge variant="secondary" className="gap-1">
                            Search: "{searchQuery}"
                            <button
                              onClick={() => setSearchQuery("")}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Marketplace Items */}
                <div
                  className={`grid gap-4 ${
                    viewMode === "grid"
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {marketplaceItems.length === 0 ? (
                    <Card className="col-span-full">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No items found
                        </h3>
                        <p className="text-muted-foreground text-center mb-4">
                          {searchQuery || selectedCategory
                            ? "Try adjusting your filters"
                            : "Be the first to add a study material!"}
                        </p>
                        <Button onClick={() => setShowAddItemModal(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    marketplaceItems.map((item) => (
                      <Card
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="cursor-pointer hover:shadow-lg transition-all group"
                      >
                        <CardHeader className="p-0">
                          <div className="aspect-w-16 aspect-h-9 bg-secondary-200 rounded-t-lg overflow-hidden">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div
                                className={`w-full h-48 rounded-t-lg flex items-center justify-center ${
                                  item.category === "Notes"
                                    ? "bg-gradient-to-br from-blue-100 to-blue-200"
                                    : item.category === "Tutorial"
                                    ? "bg-gradient-to-br from-green-100 to-green-200"
                                    : item.category === "Tutoring"
                                    ? "bg-gradient-to-br from-purple-100 to-purple-200"
                                    : item.category === "Assignment"
                                    ? "bg-gradient-to-br from-orange-100 to-orange-200"
                                    : item.category === "Book"
                                    ? "bg-gradient-to-br from-red-100 to-red-200"
                                    : "bg-gradient-to-br from-gray-100 to-gray-200"
                                }`}
                              >
                                <div className="text-center">
                                  {item.category === "Notes" && (
                                    <FileText className="h-12 w-12 text-blue-600 mx-auto mb-1" />
                                  )}
                                  {item.category === "Tutorial" && (
                                    <Video className="h-12 w-12 text-green-600 mx-auto mb-1" />
                                  )}
                                  {item.category === "Tutoring" && (
                                    <GraduationCap className="h-12 w-12 text-purple-600 mx-auto mb-1" />
                                  )}
                                  {item.category === "Assignment" && (
                                    <FileText className="h-12 w-12 text-orange-600 mx-auto mb-1" />
                                  )}
                                  {item.category === "Book" && (
                                    <Book className="h-12 w-12 text-red-600 mx-auto mb-1" />
                                  )}
                                  {![
                                    "Notes",
                                    "Tutorial",
                                    "Tutoring",
                                    "Assignment",
                                    "Book",
                                  ].includes(item.category) && (
                                    <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-1" />
                                  )}
                                  <p className="text-xs font-medium text-gray-600">
                                    {item.category}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-start">
                            <Badge variant="secondary">{item.category}</Badge>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="text-muted-foreground hover:text-red-500 transition-colors"
                            >
                              <Heart className="h-4 w-4" />
                            </button>
                          </div>
                          <div>
                            <CardTitle className="text-lg line-clamp-2 mb-1">
                              {item.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {item.description}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <BookOpen className="h-3 w-3" />
                            <span>{item.course}</span>
                            {item.fileName && (
                              <>
                                <span>•</span>
                                <FileText className="h-3 w-3" />
                                <span>File included</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <div>
                              <p className="text-2xl font-bold text-primary">
                                Rp {item.price.toLocaleString()}
                              </p>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Star className="h-3 w-3 text-yellow-400 mr-1 fill-yellow-400" />
                                {item.rating} ({item.reviewCount || 0})
                              </div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              <p>
                                by{" "}
                                {typeof item.seller === "string"
                                  ? item.seller
                                  : item.seller?.name || "Unknown"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex gap-2 pt-0">
                          {item.sellerId === currentUser?.id ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteItem(item.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreateConversation(
                                    item.sellerId,
                                    typeof item.seller === "string"
                                      ? item.seller
                                      : item.seller?.name || "Unknown"
                                  );
                                }}
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Message
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBuyItem(item);
                                }}
                              >
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                Buy
                              </Button>
                            </>
                          )}
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "sales" && (
              <div>
                <h1 className="text-2xl font-bold text-dark-gray mb-6">
                  Sales Dashboard
                </h1>

                {/* Sales Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white rounded-lg shadow p-6 border border-light-gray">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-medium-gray mb-1">
                          Total Sales
                        </p>
                        <p className="text-2xl font-bold text-dark-gray">
                          {salesTransactions.length}
                        </p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-full">
                        <ShoppingCart className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6 border border-light-gray">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-medium-gray mb-1">
                          Total Revenue
                        </p>
                        <p className="text-2xl font-bold text-dark-gray">
                          Rp{" "}
                          {salesTransactions
                            .reduce((sum, t) => sum + t.amount, 0)
                            .toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-full">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6 border border-light-gray">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-medium-gray mb-1">
                          Average Sale
                        </p>
                        <p className="text-2xl font-bold text-dark-gray">
                          Rp{" "}
                          {salesTransactions.length > 0
                            ? Math.round(
                                salesTransactions.reduce(
                                  (sum, t) => sum + t.amount,
                                  0
                                ) / salesTransactions.length
                              ).toLocaleString()
                            : "0"}
                        </p>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-full">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sales Transactions Table */}
                {salesTransactions.length > 0 ? (
                  <div className="bg-white rounded-lg shadow border border-light-gray overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-light-gray">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                              Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                              Item
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                              Buyer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                              Payment Method
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-light-gray">
                          {salesTransactions.map((transaction) => (
                            <tr
                              key={transaction.id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-gray">
                                {transaction.orderId.substring(0, 12)}...
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-gray">
                                {transaction.itemTitle}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-gray">
                                {transaction.buyer?.name || "Unknown"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                Rp {transaction.amount.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-gray">
                                {transaction.paymentMethod || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-gray">
                                {new Date(
                                  transaction.createdAt
                                ).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-8 text-center border border-light-gray">
                    <TrendingUp className="h-12 w-12 text-medium-gray mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-dark-gray mb-2">
                      No sales yet
                    </h3>
                    <p className="text-medium-gray mb-4">
                      Start selling your study materials to see your sales here!
                    </p>
                    <button
                      onClick={() => setShowAddItemModal(true)}
                      className="bg-dark-blue text-white px-4 py-2 rounded-md hover:bg-primary-800 transition-colors"
                    >
                      Add Your First Item
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "my-items" && (
              <div>
                <h1 className="text-2xl font-bold text-dark-gray mb-6">
                  My Items
                </h1>
                {marketplaceItems.filter(
                  (item) => item.sellerId === currentUser?.id
                ).length > 0 ? (
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {marketplaceItems
                      .filter((item) => item.sellerId === currentUser?.id)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-light-gray"
                        >
                          <div className="aspect-w-16 aspect-h-9 bg-secondary-200 rounded-t-lg">
                            <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-t-lg flex items-center justify-center">
                              <BookOpen className="h-12 w-12 text-dark-blue" />
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="inline-block bg-primary-100 text-dark-blue text-xs px-2 py-1 rounded-full">
                                {item.category}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  item.status === "available"
                                    ? "bg-green-100 text-green-800"
                                    : item.status === "sold"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>
                            <h3 className="font-semibold text-dark-gray mb-1">
                              {item.title}
                            </h3>
                            <p className="text-sm text-medium-gray mb-2 line-clamp-2">
                              {item.description}
                            </p>
                            <p className="text-xs text-medium-gray mb-3">
                              Course: {item.course}
                            </p>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-lg font-bold text-dark-blue">
                                  Rp {item.price.toLocaleString()}
                                </p>
                                <div className="flex items-center text-sm text-medium-gray">
                                  <Star className="h-3 w-3 text-yellow-400 mr-1" />
                                  {item.rating} ({item.reviews})
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-8 text-center border border-light-gray">
                    <BookOpen className="h-12 w-12 text-medium-gray mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-dark-gray mb-2">
                      No items yet
                    </h3>
                    <p className="text-medium-gray mb-4">
                      Start selling your study materials to earn money!
                    </p>
                    <button
                      onClick={() => setShowAddItemModal(true)}
                      className="bg-dark-blue text-white px-4 py-2 rounded-md hover:bg-primary-800 transition-colors"
                    >
                      Add Your First Item
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "messages" && (
              <div className="h-full flex flex-col">
                {/* WhatsApp-style Messages Interface */}
                <div className="bg-white rounded-lg shadow border border-light-gray h-[500px] sm:h-[600px] flex flex-col sm:flex-row">
                  {/* Conversations List */}
                  <div
                    className={`${
                      selectedConversation ? "hidden sm:flex" : "flex"
                    } w-full sm:w-1/3 border-r border-light-gray flex-col`}
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-light-gray bg-gray-50">
                      <h2 className="text-lg font-semibold text-dark-gray">
                        Chats
                      </h2>
                    </div>

                    {/* Conversations */}
                    <div className="flex-1 overflow-y-auto">
                      {conversations.length > 0 ? (
                        conversations.map((conversation) => (
                          <div
                            key={conversation.id}
                            onClick={() =>
                              setSelectedConversation(conversation.id)
                            }
                            className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedConversation === conversation.id
                                ? "bg-blue-50 border-l-4 border-l-dark-blue"
                                : ""
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-dark-blue to-campus-green rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold text-sm">
                                  {conversation.otherUserName
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium text-dark-gray truncate">
                                    {conversation.otherUserName}
                                  </h3>
                                  <span className="text-xs text-medium-gray">
                                    {new Date(
                                      conversation.lastMessageTime
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-medium-gray truncate">
                                    {conversation.lastMessage ||
                                      "No messages yet"}
                                  </p>
                                  {conversation.unreadCount > 0 && (
                                    <span className="bg-campus-green text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                                      {conversation.unreadCount}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <MessageCircle className="h-12 w-12 text-medium-gray mx-auto mb-4" />
                          <p className="text-medium-gray text-sm">
                            No conversations yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chat Area */}
                  <div
                    className={`${
                      selectedConversation ? "flex" : "hidden sm:flex"
                    } flex-1 flex-col`}
                  >
                    {selectedConversation ? (
                      <>
                        {/* Chat Header */}
                        <div className="p-3 sm:p-4 border-b border-light-gray bg-gray-50 flex items-center space-x-3">
                          {/* Back button for mobile */}
                          <button
                            onClick={() => setSelectedConversation(null)}
                            className="sm:hidden p-1 text-medium-gray hover:text-dark-gray"
                          >
                            <X className="h-5 w-5" />
                          </button>
                          <div className="w-10 h-10 bg-gradient-to-br from-dark-blue to-campus-green rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {conversations
                                .find((c) => c.id === selectedConversation)
                                ?.otherUserName.charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-dark-gray">
                              {
                                conversations.find(
                                  (c) => c.id === selectedConversation
                                )?.otherUserName
                              }
                            </h3>
                            <p className="text-xs text-medium-gray">Online</p>
                          </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                          <div className="space-y-4">
                            {messages.length > 0 ? (
                              messages.map((message) => (
                                <div
                                  key={message.id}
                                  className={`flex ${
                                    message.senderId === currentUser?.id
                                      ? "justify-end"
                                      : "justify-start"
                                  }`}
                                >
                                  <div
                                    className={`rounded-lg p-3 max-w-xs shadow-sm ${
                                      message.senderId === currentUser?.id
                                        ? "bg-dark-blue text-white rounded-br-none"
                                        : "bg-white text-dark-gray rounded-bl-none"
                                    }`}
                                  >
                                    <p className="text-sm">{message.content}</p>
                                    <span
                                      className={`text-xs mt-1 block ${
                                        message.senderId === currentUser?.id
                                          ? "text-blue-200"
                                          : "text-medium-gray"
                                      }`}
                                    >
                                      {new Date(
                                        message.createdAt
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <MessageCircle className="h-12 w-12 text-medium-gray mx-auto mb-4" />
                                <p className="text-medium-gray text-sm">
                                  No messages yet. Start the conversation!
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-light-gray bg-white">
                          <div className="flex items-center space-x-3">
                            <input
                              type="text"
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                              placeholder="Type a message..."
                              className="flex-1 p-3 border border-light-gray rounded-full focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && messageText.trim()) {
                                  handleSendMessage(
                                    selectedConversation,
                                    messageText
                                  );
                                }
                              }}
                            />
                            <button
                              onClick={() => {
                                if (messageText.trim()) {
                                  handleSendMessage(
                                    selectedConversation,
                                    messageText
                                  );
                                }
                              }}
                              className="bg-dark-blue text-white p-3 rounded-full hover:bg-primary-800 transition-colors"
                            >
                              <Send className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <MessageCircle className="h-16 w-16 text-medium-gray mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-dark-gray mb-2">
                            Select a conversation
                          </h3>
                          <p className="text-medium-gray">
                            Choose a chat to start messaging
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "academic-support" && (
              <div>
                <h1 className="text-2xl font-bold text-dark-gray mb-6">
                  Academic Support Sessions
                </h1>
                {tutoringSessions.length > 0 ? (
                  <div className="space-y-4">
                    {tutoringSessions.map((session) => (
                      <div
                        key={session.id}
                        className="bg-white rounded-lg shadow border border-light-gray p-4 sm:p-6"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                              <h3 className="text-lg font-semibold text-dark-gray">
                                {session.subject}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  session.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : session.status === "confirmed"
                                    ? "bg-green-100 text-green-800"
                                    : session.status === "completed"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {session.status}
                              </span>
                            </div>
                            <p className="text-medium-gray mb-2">
                              {session.description}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center text-medium-gray">
                                <Calendar className="h-4 w-4 mr-2" />
                                {new Date(
                                  session.scheduledAt
                                ).toLocaleDateString()}
                              </div>
                              <div className="flex items-center text-medium-gray">
                                <Clock className="h-4 w-4 mr-2" />
                                {session.duration} minutes
                              </div>
                              <div className="flex items-center text-medium-gray">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Rp {session.price.toLocaleString()}
                              </div>
                              <div className="flex items-center text-medium-gray">
                                <BookOpen className="h-4 w-4 mr-2" />
                                {session.course}
                              </div>
                            </div>
                            <div className="mt-3 text-sm text-medium-gray">
                              <p>Tutor: {session.tutorName}</p>
                              <p>Student: {session.studentName}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {session.tutorId === currentUser?.id && (
                              <button
                                onClick={() =>
                                  handleDeleteTutoringSession(session.id)
                                }
                                className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleCreateConversation(
                                  session.tutorId === currentUser?.id
                                    ? session.studentId
                                    : session.tutorId,
                                  session.tutorId === currentUser?.id
                                    ? session.studentName
                                    : session.tutorName
                                )
                              }
                              className="bg-soft-blue text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-8 text-center border border-light-gray">
                    <Users className="h-12 w-12 text-medium-gray mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-dark-gray mb-2">
                      No tutoring sessions
                    </h3>
                    <p className="text-medium-gray mb-4">
                      Offer your expertise or find a tutor!
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => setShowTutoringModal(true)}
                        className="bg-campus-green text-white px-4 py-2 rounded-md hover:bg-success-700 transition-colors"
                      >
                        Offer Tutoring
                      </button>
                      <button className="border border-dark-blue text-dark-blue px-4 py-2 rounded-md hover:bg-primary-50 transition-colors">
                        Find a Tutor
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "insights" && (
              <div className="space-y-4">
                {/* Overview Stats */}
                <div className="flex overflow-x-auto gap-3 pb-2 -mx-3 px-3 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible">
                  <Card className="flex-shrink-0 w-[calc(100vw-120px)] min-w-[200px] max-w-[280px] md:w-auto md:max-w-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Revenue
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        Rp{" "}
                        {allTransactions
                          .filter(
                            (t) => t.type === "sale" && t.status === "COMPLETED"
                          )
                          .reduce((sum, t) => sum + t.amount, 0)
                          .toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        From{" "}
                        {
                          allTransactions.filter(
                            (t) => t.type === "sale" && t.status === "COMPLETED"
                          ).length
                        }{" "}
                        sales
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="flex-shrink-0 w-[calc(100vw-120px)] min-w-[200px] max-w-[280px] md:w-auto md:max-w-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Spent
                      </CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        Rp{" "}
                        {allTransactions
                          .filter(
                            (t) =>
                              t.type === "purchase" && t.status === "COMPLETED"
                          )
                          .reduce((sum, t) => sum + t.amount, 0)
                          .toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        From{" "}
                        {
                          allTransactions.filter(
                            (t) =>
                              t.type === "purchase" && t.status === "COMPLETED"
                          ).length
                        }{" "}
                        purchases
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="flex-shrink-0 w-[calc(100vw-120px)] min-w-[200px] max-w-[280px] md:w-auto md:max-w-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Active Listings
                      </CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {
                          marketplaceItems.filter(
                            (item) =>
                              item.sellerId === currentUser?.id &&
                              item.status === "available"
                          ).length
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Out of{" "}
                        {
                          marketplaceItems.filter(
                            (item) => item.sellerId === currentUser?.id
                          ).length
                        }{" "}
                        total items
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="flex-shrink-0 w-[calc(100vw-120px)] min-w-[200px] max-w-[280px] md:w-auto md:max-w-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Avg. Rating
                      </CardTitle>
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats[3].value}</div>
                      <p className="text-xs text-muted-foreground">
                        From all your items
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity & Top Items - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Recent Activity */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {allTransactions.slice(0, 3).length === 0 ? (
                          <div className="text-center py-6 text-sm text-muted-foreground">
                            No recent activity
                          </div>
                        ) : (
                          allTransactions.slice(0, 3).map((transaction) => (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between pb-3 border-b border-border last:border-0 last:pb-0"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`p-1.5 rounded ${
                                    transaction.type === "sale"
                                      ? "bg-green-100"
                                      : "bg-blue-100"
                                  }`}
                                >
                                  {transaction.type === "sale" ? (
                                    <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                                  ) : (
                                    <ShoppingCart className="h-3.5 w-3.5 text-blue-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium line-clamp-1">
                                    {transaction.itemTitle}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(
                                      transaction.createdAt
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p
                                  className={`text-sm font-semibold ${
                                    transaction.type === "sale"
                                      ? "text-green-600"
                                      : "text-blue-600"
                                  }`}
                                >
                                  {transaction.type === "sale" ? "+" : "-"}
                                  {(transaction.amount / 1000).toFixed(0)}k
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Performing Items */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Top Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {marketplaceItems
                          .filter((item) => item.sellerId === currentUser?.id)
                          .sort(
                            (a, b) => (b.viewCount || 0) - (a.viewCount || 0)
                          )
                          .slice(0, 3).length === 0 ? (
                          <div className="text-center py-6 text-sm text-muted-foreground">
                            No items yet
                          </div>
                        ) : (
                          marketplaceItems
                            .filter((item) => item.sellerId === currentUser?.id)
                            .sort(
                              (a, b) => (b.viewCount || 0) - (a.viewCount || 0)
                            )
                            .slice(0, 3)
                            .map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between pb-3 border-b border-border last:border-0 last:pb-0"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium line-clamp-1">
                                    {item.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.category}
                                  </p>
                                </div>
                                <div className="text-right ml-2">
                                  <p className="text-sm font-semibold">
                                    {item.viewCount || 0}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    views
                                  </p>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-dark-gray">Add New Item</h2>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="text-medium-gray hover:text-dark-gray"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <AddItemForm
              onSubmit={handleAddItem}
              onCancel={() => setShowAddItemModal(false)}
            />
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-dark-gray">Send Message</h2>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-medium-gray hover:text-dark-gray"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
                rows={4}
              />
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleSendMessage(selectedConversation, messageText)
                  }
                  className="flex-1 bg-dark-blue text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition-colors flex items-center justify-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </button>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 border border-light-gray text-medium-gray rounded-lg hover:bg-secondary-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tutoring Modal */}
      {showTutoringModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-dark-gray">
                Offer Tutoring
              </h2>
              <button
                onClick={() => setShowTutoringModal(false)}
                className="text-medium-gray hover:text-dark-gray"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <TutoringForm
              onSubmit={handleAddTutoringSession}
              onCancel={() => setShowTutoringModal(false)}
            />
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {showItemDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-dark-gray">
                {selectedItem.title}
              </h2>
              <button
                onClick={() => setShowItemDetailModal(false)}
                className="text-medium-gray hover:text-dark-gray"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Item Image */}
              <div className="aspect-w-16 aspect-h-9 bg-secondary-200 rounded-lg overflow-hidden">
                {selectedItem.imageUrl ? (
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div
                    className={`w-full h-64 rounded-lg flex items-center justify-center ${
                      selectedItem.category === "Notes"
                        ? "bg-gradient-to-br from-blue-100 to-blue-200"
                        : selectedItem.category === "Tutorial"
                        ? "bg-gradient-to-br from-green-100 to-green-200"
                        : selectedItem.category === "Tutoring"
                        ? "bg-gradient-to-br from-purple-100 to-purple-200"
                        : selectedItem.category === "Assignment"
                        ? "bg-gradient-to-br from-orange-100 to-orange-200"
                        : selectedItem.category === "Book"
                        ? "bg-gradient-to-br from-red-100 to-red-200"
                        : "bg-gradient-to-br from-gray-100 to-gray-200"
                    }`}
                  >
                    <div className="text-center">
                      {selectedItem.category === "Notes" && (
                        <FileText className="h-16 w-16 text-blue-600 mx-auto mb-2" />
                      )}
                      {selectedItem.category === "Tutorial" && (
                        <Video className="h-16 w-16 text-green-600 mx-auto mb-2" />
                      )}
                      {selectedItem.category === "Tutoring" && (
                        <GraduationCap className="h-16 w-16 text-purple-600 mx-auto mb-2" />
                      )}
                      {selectedItem.category === "Assignment" && (
                        <FileText className="h-16 w-16 text-orange-600 mx-auto mb-2" />
                      )}
                      {selectedItem.category === "Book" && (
                        <Book className="h-16 w-16 text-red-600 mx-auto mb-2" />
                      )}
                      {![
                        "Notes",
                        "Tutorial",
                        "Tutoring",
                        "Assignment",
                        "Book",
                      ].includes(selectedItem.category) && (
                        <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-2" />
                      )}
                      <p className="text-sm font-medium text-gray-600">
                        {selectedItem.category}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="space-y-4">
                <div>
                  <span className="inline-block bg-primary-100 text-dark-blue text-sm px-3 py-1 rounded-full mb-2">
                    {selectedItem.category}
                  </span>
                  <h3 className="text-xl font-semibold text-dark-gray mb-2">
                    {selectedItem.title}
                  </h3>
                  <p className="text-medium-gray mb-4">
                    {selectedItem.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-medium-gray">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Course: {selectedItem.course}
                  </div>
                  <div className="flex items-center text-sm text-medium-gray">
                    <User className="h-4 w-4 mr-2" />
                    Seller:{" "}
                    {typeof selectedItem.seller === "string"
                      ? selectedItem.seller
                      : selectedItem.seller?.name || "Unknown"}
                  </div>
                  <div className="flex items-center text-sm text-medium-gray">
                    <Star className="h-4 w-4 mr-2 text-yellow-400" />
                    {selectedItem.rating} ({selectedItem.reviews} reviews)
                  </div>
                  {selectedItem.condition && (
                    <div className="flex items-center text-sm text-medium-gray">
                      <Eye className="h-4 w-4 mr-2" />
                      Condition: {selectedItem.condition}
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-bold text-dark-blue">
                      Rp {selectedItem.price.toLocaleString()}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedItem.status === "available"
                          ? "bg-green-100 text-green-800"
                          : selectedItem.status === "sold"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedItem.status}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    {selectedItem.sellerId === currentUser?.id ? (
                      <button
                        onClick={() => {
                          handleDeleteItem(selectedItem.id);
                          setShowItemDetailModal(false);
                        }}
                        className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Delete Item
                      </button>
                    ) : selectedItem.status === "available" ? (
                      <>
                        <button
                          onClick={() => {
                            handleCreateConversation(
                              selectedItem.sellerId,
                              typeof selectedItem.seller === "string"
                                ? selectedItem.seller
                                : selectedItem.seller?.name || "Unknown"
                            );
                            setShowItemDetailModal(false);
                          }}
                          className="flex-1 bg-campus-green text-white px-4 py-3 rounded-lg hover:bg-success-700 transition-colors font-medium"
                        >
                          Message Seller
                        </button>
                        <button
                          onClick={() => handleBuyItem(selectedItem)}
                          className="flex-1 bg-dark-blue text-white px-4 py-3 rounded-lg hover:bg-primary-800 transition-colors font-medium"
                        >
                          Buy Now
                        </button>
                      </>
                    ) : (
                      <div className="flex-1 bg-gray-100 text-gray-500 px-4 py-3 rounded-lg text-center font-medium">
                        {selectedItem.status === "sold"
                          ? "Item Sold"
                          : "Not Available"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentItem && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentItem(null);
          }}
          item={paymentItem}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

// Tutoring Form Component
function TutoringForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    subject: "",
    course: "",
    description: "",
    price: "",
    duration: "60",
    scheduledAt: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.subject ||
      !formData.course ||
      !formData.description ||
      !formData.price ||
      !formData.scheduledAt
    ) {
      alert("Please fill in all required fields");
      return;
    }

    onSubmit({
      ...formData,
      price: parseInt(formData.price),
      duration: parseInt(formData.duration),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-dark-gray mb-1">
          Subject *
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) =>
            setFormData({ ...formData, subject: e.target.value })
          }
          className="w-full p-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
          placeholder="e.g., Data Structures"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-gray mb-1">
          Course *
        </label>
        <input
          type="text"
          value={formData.course}
          onChange={(e) => setFormData({ ...formData, course: e.target.value })}
          className="w-full p-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
          placeholder="e.g., COMP6048"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-gray mb-1">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full p-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
          rows={3}
          placeholder="Describe what you'll teach..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark-gray mb-1">
            Price (Rp) *
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            className="w-full p-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
            placeholder="100000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-gray mb-1">
            Duration (minutes)
          </label>
          <select
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
            className="w-full p-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
          >
            <option value="30">30 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
            <option value="120">120 minutes</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-gray mb-1">
          Scheduled Date & Time *
        </label>
        <input
          type="datetime-local"
          value={formData.scheduledAt}
          onChange={(e) =>
            setFormData({ ...formData, scheduledAt: e.target.value })
          }
          className="w-full p-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="flex-1 bg-campus-green text-white px-4 py-2 rounded-lg hover:bg-success-700 transition-colors"
        >
          Offer Tutoring
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-light-gray text-medium-gray rounded-lg hover:bg-secondary-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Add Item Form Component
function AddItemForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Notes",
    course: "",
    condition: "Good",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      !formData.course
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setUploading(true);
      let fileData = {};

      // Upload file if selected
      if (uploadedFile) {
        setUploadProgress(30);
        const uploadResult = await fileAPI.uploadFile(uploadedFile);
        setUploadProgress(70);
        fileData = {
          fileUrl: uploadResult.url,
          fileName: uploadResult.fileName,
          fileSize: uploadResult.fileSize,
          fileType: uploadResult.fileType,
        };
      }

      setUploadProgress(90);

      // Submit form with file data
      await onSubmit({
        ...formData,
        price: parseInt(formData.price),
        ...fileData,
      });

      setUploadProgress(100);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to add item. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-dark-gray mb-1">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
          placeholder="e.g., Data Structures Notes"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-gray mb-1">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full p-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
          rows={3}
          placeholder="Describe your item..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark-gray mb-1">
            Price (Rp) *
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            className="w-full p-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
            placeholder="50000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-gray mb-1">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full p-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
          >
            <option value="Notes">Notes</option>
            <option value="Tutorial">Tutorial</option>
            <option value="Tutoring">Tutoring</option>
            <option value="Assignment">Assignment</option>
            <option value="Book">Book</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark-gray mb-1">
            Course *
          </label>
          <input
            type="text"
            value={formData.course}
            onChange={(e) =>
              setFormData({ ...formData, course: e.target.value })
            }
            className="w-full p-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
            placeholder="e.g., COMP6048"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-gray mb-1">
            Condition
          </label>
          <select
            value={formData.condition}
            onChange={(e) =>
              setFormData({ ...formData, condition: e.target.value })
            }
            className="w-full p-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
          >
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
        </div>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-dark-gray mb-1">
          Upload File (PDF, DOC, PPT, etc.)
        </label>
        <div className="mt-1">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,image/*,video/*"
            className="w-full p-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue text-sm"
          />
          {uploadedFile && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">
                  {uploadedFile.name}
                </span>
                <span className="text-xs text-green-600">
                  ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setUploadedFile(null)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        <p className="text-xs text-medium-gray mt-1">
          Max file size: 50MB. Supported formats: PDF, Word, PowerPoint, Excel,
          Images, Videos
        </p>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-medium-gray">Uploading...</span>
            <span className="text-dark-blue font-medium">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-dark-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={uploading}
          className="flex-1 bg-dark-blue text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Add Item"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-light-gray text-medium-gray rounded-lg hover:bg-secondary-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Add PaymentModal at the end of Dashboard component - find the closing div and add before it
