"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import {
  marketplaceAPI,
  conversationsAPI,
  messagesAPI,
  tutoringAPI,
  notificationsAPI,
  statsAPI,
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

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load all data in parallel
      const [items, convos, sessions, notifs, stats] = await Promise.all([
        marketplaceAPI.getItems(),
        conversationsAPI.getConversations(),
        tutoringAPI.getSessions({ type: "all" }),
        notificationsAPI.getNotifications(),
        statsAPI.getUserStats(),
      ]);

      setMarketplaceItems(items);
      setConversations(convos);
      setTutoringSessions(sessions);
      setNotifications(notifs);
      setUserStats(stats);

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

  const handleSendMessage = async (conversationId: string, content: string) => {
    if (!content.trim()) return;

    try {
      await messagesAPI.sendMessage(conversationId, content.trim());
      setMessageText("");

      // Reload conversations
      const convos = await conversationsAPI.getConversations();
      setConversations(convos);

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
                  {notifications.filter((n) => !n.read).length > 0 && (
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
                                .filter((n) => !n.read)
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
                              !notification.read ? "bg-blue-50" : ""
                            }`}
                            onClick={async () => {
                              try {
                                if (!notification.read) {
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
                                  {notification.content}
                                </p>
                                <p className="text-xs text-medium-gray mt-2">
                                  {new Date(
                                    notification.timestamp
                                  ).toLocaleString()}
                                </p>
                              </div>
                              {!notification.read && (
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

              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-dark-blue rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-dark-gray hidden sm:block">
                  Student ID: 2501234567
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Mobile Navigation */}
          <div className="lg:hidden">
            {/* Mobile Search */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-gray" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search materials, courses..."
                  className="w-full pl-10 pr-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue transition-colors"
                />
              </div>
            </div>

            {/* Mobile Tab Navigation */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex overflow-x-auto space-x-2 pb-2">
                <button
                  onClick={() => setActiveTab("discovery")}
                  className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "discovery"
                      ? "bg-primary-100 text-dark-blue"
                      : "text-medium-gray hover:bg-secondary-100"
                  }`}
                >
                  Discovery
                </button>
                <button
                  onClick={() => setActiveTab("my-items")}
                  className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "my-items"
                      ? "bg-primary-100 text-dark-blue"
                      : "text-medium-gray hover:bg-secondary-100"
                  }`}
                >
                  My Items
                </button>
                <button
                  onClick={() => setActiveTab("messages")}
                  className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "messages"
                      ? "bg-primary-100 text-dark-blue"
                      : "text-medium-gray hover:bg-secondary-100"
                  }`}
                >
                  Messages
                </button>
                <button
                  onClick={() => setActiveTab("academic-support")}
                  className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "academic-support"
                      ? "bg-primary-100 text-dark-blue"
                      : "text-medium-gray hover:bg-secondary-100"
                  }`}
                >
                  Support
                </button>
                <button
                  onClick={() => setActiveTab("insights")}
                  className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "insights"
                      ? "bg-primary-100 text-dark-blue"
                      : "text-medium-gray hover:bg-secondary-100"
                  }`}
                >
                  Insights
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("discovery")}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "discovery"
                      ? "bg-primary-100 text-dark-blue"
                      : "text-medium-gray hover:bg-secondary-100"
                  }`}
                >
                  <ShoppingCart className="mr-3 h-5 w-5" />
                  Discovery
                </button>

                <button
                  onClick={() => setActiveTab("my-items")}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "my-items"
                      ? "bg-primary-100 text-dark-blue"
                      : "text-medium-gray hover:bg-secondary-100"
                  }`}
                >
                  <BookOpen className="mr-3 h-5 w-5" />
                  My Items
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
                  <span className="ml-auto bg-green-status bg-opacity-10 text-green-status text-xs rounded-full px-2 py-1">
                    3
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("academic-support")}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "academic-support"
                      ? "bg-primary-100 text-dark-blue"
                      : "text-medium-gray hover:bg-secondary-100"
                  }`}
                >
                  <GraduationCap className="mr-3 h-5 w-5" />
                  Academic Support
                </button>

                <button
                  onClick={() => setActiveTab("insights")}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "insights"
                      ? "bg-primary-100 text-dark-blue"
                      : "text-medium-gray hover:bg-secondary-100"
                  }`}
                >
                  <Star className="mr-3 h-5 w-5" />
                  Insights
                </button>
              </nav>

              <div className="mt-8">
                <button
                  onClick={() => setShowAddItemModal(true)}
                  className="w-full bg-dark-blue text-white px-4 py-2 rounded-md hover:bg-primary-800 transition-colors flex items-center justify-center"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Item
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 bg-white rounded-lg shadow p-6 border border-light-gray">
              <h3 className="text-lg font-medium text-dark-gray mb-4">
                Your Stats
              </h3>
              <div className="space-y-4">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-dark-gray">
                        {stat.value}
                      </p>
                      <p className="text-xs text-medium-gray">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "discovery" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-dark-gray">
                    Discovery
                  </h1>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryFilter(e.target.value)}
                        className="flex items-center px-3 py-2 border border-light-gray rounded-md text-sm text-medium-gray hover:text-dark-gray transition-colors bg-white"
                      >
                        <option value="">All Categories</option>
                        <option value="Notes">Notes</option>
                        <option value="Tutorial">Tutorial</option>
                        <option value="Tutoring">Tutoring</option>
                        <option value="Assignment">Assignment</option>
                        <option value="Book">Book</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="flex border border-light-gray rounded-md">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 transition-colors ${
                          viewMode === "grid"
                            ? "bg-primary-50 text-dark-blue"
                            : "text-medium-gray"
                        }`}
                      >
                        <Grid className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 transition-colors ${
                          viewMode === "list"
                            ? "bg-primary-50 text-dark-blue"
                            : "text-medium-gray"
                        }`}
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {marketplaceItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="bg-white rounded-lg shadow hover:shadow-lg transition-all border border-light-gray cursor-pointer transform hover:scale-105"
                    >
                      <div className="aspect-w-16 aspect-h-9 bg-secondary-200 rounded-t-lg overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-48 object-cover rounded-t-lg"
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
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="inline-block bg-primary-100 text-dark-blue text-xs px-2 py-1 rounded-full">
                            {item.category}
                          </span>
                          <button className="text-medium-gray hover:text-green-status transition-colors">
                            <Heart className="h-4 w-4" />
                          </button>
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
                          <div className="text-right">
                            <p className="text-sm text-medium-gray">
                              by {item.seller}
                            </p>
                            <div className="flex gap-2 mt-1">
                              {item.sellerId === currentUser?.id ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteItem(item.id);
                                  }}
                                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                                >
                                  Delete
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCreateConversation(
                                        item.sellerId,
                                        item.seller
                                      );
                                    }}
                                    className="bg-campus-green text-white px-3 py-1 rounded text-sm hover:bg-success-700 transition-colors"
                                  >
                                    Message
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleBuyItem(item);
                                    }}
                                    className="bg-dark-blue text-white px-3 py-1 rounded text-sm hover:bg-primary-800 transition-colors"
                                  >
                                    Buy Now
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                            {/* Sample messages */}
                            <div className="flex justify-start">
                              <div className="bg-white rounded-lg rounded-bl-none p-3 max-w-xs shadow-sm">
                                <p className="text-sm text-dark-gray">
                                  Hi! Is the Data Structures notes still
                                  available?
                                </p>
                                <span className="text-xs text-medium-gray mt-1 block">
                                  10:30 AM
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <div className="bg-dark-blue text-white rounded-lg rounded-br-none p-3 max-w-xs">
                                <p className="text-sm">
                                  Yes, it's still available! Would you like to
                                  purchase it?
                                </p>
                                <span className="text-xs text-blue-200 mt-1 block">
                                  10:32 AM
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-start">
                              <div className="bg-white rounded-lg rounded-bl-none p-3 max-w-xs shadow-sm">
                                <p className="text-sm text-dark-gray">
                                  Perfect! How can I pay?
                                </p>
                                <span className="text-xs text-medium-gray mt-1 block">
                                  10:35 AM
                                </span>
                              </div>
                            </div>
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
                                  // Handle send message
                                  setMessageText("");
                                }
                              }}
                            />
                            <button
                              onClick={() => {
                                if (messageText.trim()) {
                                  // Handle send message
                                  setMessageText("");
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
              <div>
                <h1 className="text-2xl font-bold text-dark-gray mb-6">
                  Insights & Opportunities
                </h1>

                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                  {/* Offer Academic Support */}
                  <div className="bg-white rounded-lg shadow p-6 border border-light-gray">
                    <div className="flex items-center mb-4">
                      <div className="p-3 rounded-lg bg-purple-100">
                        <GraduationCap className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-dark-gray">
                          Offer Academic Support
                        </h3>
                        <p className="text-sm text-medium-gray">
                          Share your expertise and help fellow students
                        </p>
                      </div>
                    </div>
                    <p className="text-medium-gray mb-4">
                      Create tutoring sessions, study groups, or one-on-one
                      mentoring opportunities. Set your own rates and schedule.
                    </p>
                    <button
                      onClick={() => setShowTutoringModal(true)}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                    >
                      Create Support Session
                    </button>
                  </div>

                  {/* Sell Study Materials */}
                  <div className="bg-white rounded-lg shadow p-6 border border-light-gray">
                    <div className="flex items-center mb-4">
                      <div className="p-3 rounded-lg bg-blue-100">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-dark-gray">
                          Share Study Materials
                        </h3>
                        <p className="text-sm text-medium-gray">
                          Monetize your notes and resources
                        </p>
                      </div>
                    </div>
                    <p className="text-medium-gray mb-4">
                      Upload your notes, assignments, tutorials, and study
                      guides. Help other students while earning some income.
                    </p>
                    <button
                      onClick={() => setShowAddItemModal(true)}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Upload Materials
                    </button>
                  </div>

                  {/* Performance Analytics */}
                  <div className="bg-white rounded-lg shadow p-6 border border-light-gray">
                    <div className="flex items-center mb-4">
                      <div className="p-3 rounded-lg bg-green-100">
                        <Star className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-dark-gray">
                          Your Performance
                        </h3>
                        <p className="text-sm text-medium-gray">
                          Track your academic contributions
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-medium-gray">Materials Sold</span>
                        <span className="font-semibold text-dark-gray">
                          {stats[0].value}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-medium-gray">
                          Support Sessions
                        </span>
                        <span className="font-semibold text-dark-gray">
                          {tutoringSessions.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-medium-gray">Student Rating</span>
                        <span className="font-semibold text-dark-gray">
                          {stats[3].value} ⭐
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Earning Potential */}
                  <div className="bg-white rounded-lg shadow p-6 border border-light-gray">
                    <div className="flex items-center mb-4">
                      <div className="p-3 rounded-lg bg-yellow-100">
                        <DollarSign className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-dark-gray">
                          Earning Opportunities
                        </h3>
                        <p className="text-sm text-medium-gray">
                          Maximize your academic income
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-dark-gray">
                          💡 Tip: High-demand subjects
                        </p>
                        <p className="text-xs text-medium-gray">
                          Java, Data Structures, Calculus
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-dark-gray">
                          📈 Best times to tutor
                        </p>
                        <p className="text-xs text-medium-gray">
                          Before exams and assignment deadlines
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-dark-gray">
                          💰 Average rates
                        </p>
                        <p className="text-xs text-medium-gray">
                          Rp 75,000 - 150,000 per hour
                        </p>
                      </div>
                    </div>
                  </div>
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
                    Seller: {selectedItem.seller}
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
                              selectedItem.seller
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

  const handleSubmit = (e: React.FormEvent) => {
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

    onSubmit({
      ...formData,
      price: parseInt(formData.price),
    });
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

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="flex-1 bg-dark-blue text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition-colors"
        >
          Add Item
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
