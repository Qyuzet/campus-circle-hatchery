"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Download,
  Eye,
  ArrowLeft,
  Search,
  Filter,
  FileText,
  Video,
  Book,
  Grid,
  List,
  ShoppingCart,
  TrendingUp,
  MessageCircle,
  GraduationCap,
  Star,
  Library,
  Plus,
  User,
  Bell,
  Package,
  Wallet,
  Heart,
} from "lucide-react";
import {
  transactionsAPI,
  fileAPI,
  statsAPI,
  notificationsAPI,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast, Toaster } from "sonner";

export default function LibraryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [userStats, setUserStats] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      // Load all data in parallel for faster initial load
      Promise.all([loadLibrary(), loadStats(), loadNotifications()]);
    }
  }, [status, router]);

  const loadLibrary = async () => {
    try {
      const transactions = await transactionsAPI.getTransactions({
        type: "purchases",
        status: "COMPLETED",
        itemType: "marketplace",
      });
      setPurchases(transactions);
    } catch (error) {
      console.error("Error loading library:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await statsAPI.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadNotifications = async () => {
    try {
      const notifs = await notificationsAPI.getNotifications();
      setNotifications(notifs);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

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

  const filteredItems = purchases.filter((item) => {
    const matchesSearch = item.itemTitle
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.item?.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-secondary-50">
      <Toaster position="top-center" richColors />
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-light-gray sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src="/campus-circle-logo.png"
                alt="CampusCircle Logo"
                width={200}
                height={50}
                className="h-12 sm:h-14 w-auto"
              />
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search - Hidden on mobile, shown on larger screens */}
              <div className="relative hidden md:block">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-gray" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search library..."
                  className="pl-10 pr-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue w-48 lg:w-64 transition-colors"
                />
              </div>

              <button
                className="relative p-2 text-medium-gray hover:text-dark-gray transition-colors"
                onClick={() => router.push("/dashboard")}
                title="Wishlist"
              >
                <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

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

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
        {/* Mobile Navigation */}
        <div className="lg:hidden">
          {/* Mobile Tab Navigation */}
          <div className="bg-white rounded-lg shadow p-2 mb-4">
            <div className="flex justify-around items-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 text-medium-gray hover:text-dark-blue transition-colors"
                title="Marketplace"
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
              <button
                onClick={() => router.push("/orders")}
                className="p-2 text-medium-gray hover:text-dark-blue transition-colors"
                title="Orders"
              >
                <Package className="h-5 w-5" />
              </button>
              <button
                onClick={() => router.push("/library")}
                className="p-2 text-dark-blue"
                title="Library"
              >
                <Library className="h-5 w-5" />
              </button>
              <button
                onClick={() => router.push("/dashboard?tab=messages")}
                className="p-2 text-medium-gray hover:text-dark-blue transition-colors relative"
                title="Messages"
              >
                <MessageCircle className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-green-status text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => router.push("/dashboard?tab=wallet")}
                className="p-2 text-medium-gray hover:text-dark-blue transition-colors"
                title="Wallet"
              >
                <Wallet className="h-5 w-5" />
              </button>
              <button
                onClick={() => router.push("/dashboard?tab=insights")}
                className="p-2 text-medium-gray hover:text-dark-blue transition-colors"
                title="Analytics"
              >
                <TrendingUp className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:flex lg:gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <nav className="space-y-1">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-medium-gray hover:bg-secondary-100"
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
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors bg-primary-100 text-dark-blue"
                >
                  <Library className="mr-3 h-5 w-5" />
                  Library
                </button>

                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-medium-gray hover:bg-secondary-100"
                >
                  <MessageCircle className="mr-3 h-5 w-5" />
                  Messages
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-green-status bg-opacity-10 text-green-status text-xs rounded-full px-2 py-1">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => router.push("/dashboard?tab=wallet")}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-medium-gray hover:bg-secondary-100"
                >
                  <Wallet className="mr-3 h-5 w-5" />
                  Wallet
                </button>

                <button
                  onClick={() => router.push("/dashboard?tab=insights")}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-medium-gray hover:bg-secondary-100"
                >
                  <TrendingUp className="mr-3 h-5 w-5" />
                  Analytics
                </button>
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => router.push("/dashboard")}
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
            {/* Stats - Compact */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
              <Card className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-5 sm:h-6 bg-gray-200 rounded w-8 mb-1"></div>
                    <div className="h-2 bg-gray-200 rounded w-12"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-lg sm:text-2xl font-bold">
                      {purchases.length}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Items
                    </p>
                  </>
                )}
              </Card>

              <Card className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-5 sm:h-6 bg-gray-200 rounded w-8 mb-1"></div>
                    <div className="h-2 bg-gray-200 rounded w-12"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-lg sm:text-2xl font-bold">
                      {
                        purchases.filter((p) => p.item?.category === "Notes")
                          .length
                      }
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Notes
                    </p>
                  </>
                )}
              </Card>

              <Card className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1">
                  <Video className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-5 sm:h-6 bg-gray-200 rounded w-8 mb-1"></div>
                    <div className="h-2 bg-gray-200 rounded w-12"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-lg sm:text-2xl font-bold">
                      {
                        purchases.filter((p) => p.item?.category === "Tutorial")
                          .length
                      }
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Tutorials
                    </p>
                  </>
                )}
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="hidden lg:flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your library..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Notes">Notes</SelectItem>
                  <SelectItem value="Book">Book</SelectItem>
                  <SelectItem value="Assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Search and Filters */}
            <div className="lg:hidden flex flex-col gap-3 mb-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your library..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Notes">Notes</SelectItem>
                    <SelectItem value="Book">Book</SelectItem>
                    <SelectItem value="Assignment">Assignment</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Library Items */}
            {filteredItems.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-dark-gray mb-2">
                    No items in your library
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start purchasing study materials to build your library
                  </p>
                  <Button onClick={() => router.push("/dashboard")}>
                    Browse Marketplace
                  </Button>
                </CardContent>
              </Card>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <LibraryItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <LibraryItemRow key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LibraryItemCard({ item }: { item: any }) {
  const [downloading, setDownloading] = React.useState(false);

  const handleDownload = async () => {
    if (!item.item?.fileUrl) {
      toast.error("No file available", {
        description: "This item doesn't have a file attached",
      });
      return;
    }

    try {
      setDownloading(true);
      toast.loading("Downloading file...", { id: item.itemId });
      await fileAPI.downloadFile(
        item.itemId,
        item.item.fileUrl,
        item.item.fileName || item.itemTitle
      );
      toast.success("Download started!", {
        id: item.itemId,
        description: "Check your downloads folder",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed", {
        id: item.itemId,
        description: "Please try again or contact support",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">
              {item.itemTitle}
            </CardTitle>
            <CardDescription className="mt-1">
              {item.item?.category || "Study Material"}
            </CardDescription>
          </div>
          <Badge variant="secondary">{item.item?.category || "Material"}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {item.item?.description || "No description available"}
        </p>
        <div className="mt-4 space-y-1">
          <div className="text-xs text-muted-foreground">
            Purchased on {new Date(item.createdAt).toLocaleDateString()}
          </div>
          {item.item?.fileName && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {item.item.fileName}
              {item.item.fileSize && (
                <span className="ml-1">
                  ({(item.item.fileSize / 1024 / 1024).toFixed(2)} MB)
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          size="sm"
          className="w-full"
          onClick={handleDownload}
          disabled={downloading || !item.item?.fileUrl}
        >
          <Download className="h-4 w-4 mr-1" />
          {downloading ? "Downloading..." : "Download"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function LibraryItemRow({ item }: { item: any }) {
  const [downloading, setDownloading] = React.useState(false);

  const handleDownload = async () => {
    if (!item.item?.fileUrl) {
      toast.error("No file available", {
        description: "This item doesn't have a file attached",
      });
      return;
    }

    try {
      setDownloading(true);
      toast.loading("Downloading file...", { id: item.itemId });
      await fileAPI.downloadFile(
        item.itemId,
        item.item.fileUrl,
        item.item.fileName || item.itemTitle
      );
      toast.success("Download started!", {
        id: item.itemId,
        description: "Check your downloads folder",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed", {
        id: item.itemId,
        description: "Please try again or contact support",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            <div className="bg-primary-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-dark-gray text-sm sm:text-base truncate">
                {item.itemTitle}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {item.item?.category} •{" "}
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
              {item.item?.fileName && (
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {item.item.fileName}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={downloading || !item.item?.fileUrl}
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">
                {downloading ? "Downloading..." : "Download"}
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
