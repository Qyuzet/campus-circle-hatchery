"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useUnreadMessages } from "@/contexts/UnreadMessagesContext";
import Image from "next/image";
import {
  ShoppingCart,
  Users,
  Folders,
  MessageCircle,
  Wallet,
  Heart,
  Search,
  Plus,
  Bell,
  User,
  UserCircle,
  Package,
  Library,
  LogOut,
  GraduationCap,
  Star,
  Brain,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast, Toaster } from "sonner";
import { AddItemButton } from "@/components/marketplace/AddItemButton";
import { isSSRComponentsEnabled } from "@/lib/feature-flags";
import { AIChatButton } from "@/components/my-ai/AIChatButton";
import { pusherClient, getUserTransactionChannel } from "@/lib/pusher";
import { playNotificationSound } from "@/lib/notification-sound";

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: "discovery" | "clubs" | "my-hub" | "wallet" | "my-ai";
  wishlistCount?: number;
  unreadMessagesCount?: number;
  notifications?: Notification[];
}

export function DashboardLayout({
  children,
  activeTab = "discovery",
  wishlistCount = 0,
  unreadMessagesCount = 0,
  notifications = [],
}: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { unreadCount } = useUnreadMessages();

  const displayUnreadCount =
    unreadCount > 0 ? unreadCount : unreadMessagesCount;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [pathname]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  // Listen for real-time payment updates via Pusher
  useEffect(() => {
    if (session?.user?.email && status === "authenticated") {
      const fetchUserId = async () => {
        try {
          const response = await fetch("/api/users/me");
          if (response.ok) {
            const userData = await response.json();
            const userId = userData.id;

            const channelName = getUserTransactionChannel(userId);
            console.log(
              "🔌 [DashboardLayout] Subscribing to transaction channel:",
              channelName
            );
            const channel = pusherClient.subscribe(channelName);

            channel.bind("transaction-updated", (updatedTransaction: any) => {
              console.log(
                "✅ [DashboardLayout] Real-time transaction update received:",
                updatedTransaction
              );

              if (updatedTransaction.status === "COMPLETED") {
                playNotificationSound();
                toast.success("Payment confirmed!", {
                  description: `Your payment for ${updatedTransaction.itemTitle} has been confirmed. Click to view.`,
                  duration: 8000,
                  action: {
                    label: "View",
                    onClick: () => {
                      if (updatedTransaction.itemType === "marketplace") {
                        window.location.href = "/dashboard/my-hub?tab=library";
                      } else if (updatedTransaction.itemType === "event") {
                        window.location.href = "/dashboard/my-hub?tab=events";
                      } else {
                        window.location.href =
                          "/dashboard/my-hub?tab=purchases";
                      }
                    },
                  },
                });

                // Reload notifications to show the new purchase notification
                fetch("/api/notifications")
                  .then((res) => res.json())
                  .then((data) => {
                    setLocalNotifications(data);
                  })
                  .catch((err) =>
                    console.error("Failed to reload notifications:", err)
                  );
              }
            });

            return () => {
              channel.unbind_all();
              pusherClient.unsubscribe(channelName);
              console.log(
                "🔌 [DashboardLayout] Unsubscribed from transaction channel"
              );
            };
          }
        } catch (error) {
          console.error(
            "Failed to fetch user ID for Pusher subscription:",
            error
          );
        }
      };

      fetchUserId();
    }
  }, [session, status]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        showNotifications &&
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(target) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showNotifications]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-campus-blue-dark mx-auto mb-4"></div>
          <p className="text-dark-gray text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    const url = new URL(window.location.href);
    if (query.trim()) {
      url.searchParams.set("search", query);
    } else {
      url.searchParams.delete("search");
    }
    window.history.replaceState({}, "", url.toString());
  };

  const handleMarkAsRead = async (notificationIds: string[]) => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds }),
      });

      setLocalNotifications((prev) =>
        prev.map((n) =>
          notificationIds.includes(n.id) ? { ...n, isRead: true } : n
        )
      );
      router.refresh();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = localNotifications
      .filter((n) => !n.isRead)
      .map((n) => n.id);
    if (unreadIds.length > 0) {
      await handleMarkAsRead(unreadIds);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Toaster position="top-center" richColors />

      {/* Loading Bar */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-blue-100">
          <div
            className="h-full bg-dark-blue animate-[loading_1s_ease-in-out_infinite]"
            style={{ width: "30%" }}
          ></div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-[60] bg-white shadow-sm border-b border-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => router.push("/")}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img
                src="/campus-circle-logo.png"
                alt="CampusCircle Logo"
                className="h-10 sm:h-12 md:h-14 w-auto"
              />
            </button>

            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
              {/* Search Icon for Mobile */}
              <button
                className="sm:hidden relative p-2 text-medium-gray hover:text-dark-gray transition-colors active:scale-95"
                onClick={() => setShowMobileSearch(true)}
                title="Search"
                type="button"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Search Bar - Hidden on mobile, visible on tablet and above */}
              <div className="relative hidden sm:block">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-gray" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue w-40 md:w-48 lg:w-64 transition-colors text-sm"
                />
              </div>

              {!isSSRComponentsEnabled() && (
                <button
                  className="relative p-1.5 sm:p-2 text-medium-gray hover:text-dark-gray transition-colors"
                  onClick={() => router.push("/dashboard?tab=messages")}
                  title="Messages"
                >
                  <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                  {displayUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-campus-green text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs font-semibold">
                      {displayUnreadCount}
                    </span>
                  )}
                </button>
              )}

              {isSSRComponentsEnabled() && (
                <Link
                  href="/dashboard/messages"
                  prefetch={true}
                  onClick={() => setIsNavigating(true)}
                  className="relative p-1.5 sm:p-2 text-medium-gray hover:text-dark-gray transition-colors group"
                  title="Messages"
                >
                  <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                  {displayUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-campus-green text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs font-semibold">
                      {displayUnreadCount}
                    </span>
                  )}
                </Link>
              )}

              {isSSRComponentsEnabled() && (
                <Link
                  href="/dashboard/wallet"
                  prefetch={true}
                  onClick={() => setIsNavigating(true)}
                  className="relative p-1.5 sm:p-2 text-medium-gray hover:text-dark-gray transition-colors group"
                  title="Wallet"
                >
                  <Wallet className="h-5 w-5 sm:h-6 sm:w-6" />
                </Link>
              )}

              {!isSSRComponentsEnabled() && (
                <button
                  className="relative p-1.5 sm:p-2 text-medium-gray hover:text-dark-gray transition-colors"
                  onClick={() => router.push("/dashboard?tab=wishlist")}
                  title="Wishlist"
                >
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              )}

              {isSSRComponentsEnabled() && (
                <Link
                  href="/dashboard/my-hub?tab=wishlist"
                  prefetch={true}
                  onClick={() => setIsNavigating(true)}
                  className="relative p-1.5 sm:p-2 text-medium-gray hover:text-dark-gray transition-colors group"
                  title="Wishlist"
                >
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              <div className="relative">
                <button
                  ref={notificationButtonRef}
                  className="relative p-1.5 sm:p-2 text-medium-gray hover:text-dark-gray transition-colors"
                  onClick={() => setShowNotifications(!showNotifications)}
                  title="Notifications"
                >
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                  {localNotifications.filter((n) => !n.isRead).length > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </button>

                {showNotifications && (
                  <div
                    ref={notificationDropdownRef}
                    className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-light-gray z-50"
                  >
                    <div className="p-4 border-b border-light-gray">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-dark-gray">
                          Notifications
                        </h3>
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-sm text-dark-blue hover:text-blue-700"
                        >
                          Mark all read
                        </button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {localNotifications.length > 0 ? (
                        localNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-light-gray hover:bg-gray-50 cursor-pointer ${
                              !notification.isRead ? "bg-blue-50" : ""
                            }`}
                            onClick={() => {
                              if (!notification.isRead) {
                                handleMarkAsRead([notification.id]);
                              }

                              // Handle notification click based on type
                              if (notification.type === "purchase") {
                                // Redirect to Library for marketplace purchases
                                window.location.href =
                                  "/dashboard/my-hub?tab=library";
                              } else if (notification.type === "sale") {
                                // Redirect to Listings for sales
                                window.location.href =
                                  "/dashboard/my-hub?tab=listings";
                              } else if (notification.type === "message") {
                                // Redirect to Messages
                                window.location.href = "/dashboard/messages";
                              }

                              setShowNotifications(false);
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 hover:opacity-80 transition-opacity focus:outline-none">
                    {session?.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        width={32}
                        height={32}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
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
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session?.user?.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session?.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/account")}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>My Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/my-hub?tab=library")}
                  >
                    <Library className="mr-2 h-4 w-4" />
                    <span>My Library</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/wallet")}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>My Wallet</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      import("@/lib/logout").then((mod) => mod.handleLogout());
                    }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Modal */}
      {showMobileSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] sm:hidden">
          <div className="bg-white p-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-gray" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search..."
                className="pl-10"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileSearch(false)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 lg:pb-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:relative">
          {/* Mobile Navigation - Floating Bottom Bar */}
          <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 px-2 py-3 max-w-md mx-auto">
              <div className="flex justify-around items-center">
                {!isSSRComponentsEnabled() && (
                  <>
                    <Link
                      href="/dashboard"
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                        activeTab === "discovery"
                          ? "text-dark-blue bg-blue-50"
                          : "text-medium-gray hover:text-dark-blue"
                      }`}
                      title="Marketplace"
                    >
                      <ShoppingCart className="h-6 w-6" />
                      <span className="text-xs font-medium">Market</span>
                    </Link>
                    <Link
                      href="/dashboard/clubs?tab=browse"
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                        activeTab === "clubs"
                          ? "text-dark-blue bg-blue-50"
                          : "text-medium-gray hover:text-dark-blue"
                      }`}
                      title="Clubs"
                    >
                      <Users className="h-6 w-6" />
                      <span className="text-xs font-medium">Clubs</span>
                    </Link>
                    <Link
                      href="/dashboard?tab=my-hub"
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                        activeTab === "my-hub"
                          ? "text-dark-blue bg-blue-50"
                          : "text-medium-gray hover:text-dark-blue"
                      }`}
                      title="My Hub"
                    >
                      <Folders className="h-6 w-6" />
                      <span className="text-xs font-medium">My Hub</span>
                    </Link>
                    <Link
                      href="/dashboard?tab=my-ai"
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                        activeTab === "my-ai"
                          ? "text-dark-blue bg-blue-50"
                          : "text-medium-gray hover:text-dark-blue"
                      }`}
                      title="My AI"
                    >
                      <Brain className="h-6 w-6" />
                      <span className="text-xs font-medium">My AI</span>
                    </Link>
                  </>
                )}
                {isSSRComponentsEnabled() && (
                  <>
                    <Link
                      href="/dashboard/marketplace?mode=study"
                      prefetch={true}
                      onClick={() => setIsNavigating(true)}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                        activeTab === "discovery"
                          ? "text-dark-blue bg-blue-50"
                          : "text-medium-gray hover:text-dark-blue"
                      }`}
                      title="Marketplace"
                    >
                      <ShoppingCart className="h-6 w-6" />
                      <span className="text-xs font-medium">Market</span>
                    </Link>
                    <Link
                      href="/dashboard/clubs?tab=browse"
                      prefetch={true}
                      onClick={() => setIsNavigating(true)}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                        activeTab === "clubs"
                          ? "text-dark-blue bg-blue-50"
                          : "text-medium-gray hover:text-dark-blue"
                      }`}
                      title="Clubs"
                    >
                      <Users className="h-6 w-6" />
                      <span className="text-xs font-medium">Clubs</span>
                    </Link>
                    <Link
                      href="/dashboard/my-hub?tab=library"
                      prefetch={true}
                      onClick={() => setIsNavigating(true)}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                        activeTab === "my-hub"
                          ? "text-dark-blue bg-blue-50"
                          : "text-medium-gray hover:text-dark-blue"
                      }`}
                      title="My Hub"
                    >
                      <Folders className="h-6 w-6" />
                      <span className="text-xs font-medium">My Hub</span>
                    </Link>
                    <Link
                      href="/dashboard/my-ai"
                      prefetch={true}
                      onClick={() => setIsNavigating(true)}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                        activeTab === "my-ai"
                          ? "text-dark-blue bg-blue-50"
                          : "text-medium-gray hover:text-dark-blue"
                      }`}
                      title="My AI"
                    >
                      <Brain className="h-6 w-6" />
                      <span className="text-xs font-medium">My AI</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="sticky top-28 bg-white rounded-lg shadow p-6 self-start">
              <nav className="space-y-1">
                {!isSSRComponentsEnabled() && (
                  <>
                    <Link
                      href="/dashboard"
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === "discovery"
                          ? "bg-primary-100 text-dark-blue"
                          : "text-medium-gray hover:bg-secondary-100"
                      }`}
                    >
                      <ShoppingCart className="mr-3 h-5 w-5" />
                      Marketplace
                    </Link>

                    <Link
                      href="/dashboard/clubs?tab=browse"
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === "clubs"
                          ? "bg-primary-100 text-dark-blue"
                          : "text-medium-gray hover:bg-secondary-100"
                      }`}
                    >
                      <Users className="mr-3 h-5 w-5" />
                      Clubs
                    </Link>

                    <Link
                      href="/dashboard?tab=my-hub"
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === "my-hub"
                          ? "bg-primary-100 text-dark-blue"
                          : "text-medium-gray hover:bg-secondary-100"
                      }`}
                    >
                      <Folders className="mr-3 h-5 w-5" />
                      My Hub
                    </Link>

                    <Link
                      href="/dashboard?tab=my-ai"
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === "my-ai"
                          ? "bg-primary-100 text-dark-blue"
                          : "text-medium-gray hover:bg-secondary-100"
                      }`}
                    >
                      <Brain className="mr-3 h-5 w-5" />
                      My AI
                    </Link>
                  </>
                )}

                {isSSRComponentsEnabled() && (
                  <>
                    <Link
                      href="/dashboard/marketplace?mode=study"
                      prefetch={true}
                      onClick={() => setIsNavigating(true)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === "discovery"
                          ? "bg-primary-100 text-dark-blue"
                          : "text-medium-gray hover:bg-secondary-100"
                      }`}
                    >
                      <ShoppingCart className="mr-3 h-5 w-5" />
                      Marketplace
                    </Link>

                    <Link
                      href="/dashboard/clubs?tab=browse"
                      prefetch={true}
                      onClick={() => setIsNavigating(true)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === "clubs"
                          ? "bg-primary-100 text-dark-blue"
                          : "text-medium-gray hover:bg-secondary-100"
                      }`}
                    >
                      <Users className="mr-3 h-5 w-5" />
                      Clubs
                    </Link>

                    <Link
                      href="/dashboard/my-hub?tab=library"
                      prefetch={true}
                      onClick={() => setIsNavigating(true)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === "my-hub"
                          ? "bg-primary-100 text-dark-blue"
                          : "text-medium-gray hover:bg-secondary-100"
                      }`}
                    >
                      <Folders className="mr-3 h-5 w-5" />
                      My Hub
                    </Link>

                    <Link
                      href="/dashboard/my-ai"
                      prefetch={true}
                      onClick={() => setIsNavigating(true)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === "my-ai"
                          ? "bg-primary-100 text-dark-blue"
                          : "text-medium-gray hover:bg-secondary-100"
                      }`}
                    >
                      <Brain className="mr-3 h-5 w-5" />
                      My AI
                    </Link>
                  </>
                )}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <AddItemButton fullWidth size="sm" variant="outline" />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">{children}</div>
        </div>
      </div>

      {/* AI Chat Button */}
      <AIChatButton />
    </div>
  );
}
