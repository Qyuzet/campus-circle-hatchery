"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Package,
  Download,
  Eye,
  ArrowLeft,
  Calendar,
  DollarSign,
  ShoppingCart,
  BookOpen,
  TrendingUp,
  MessageCircle,
  GraduationCap,
  Star,
  Library,
  Plus,
  User,
  Bell,
  Search,
  RefreshCw,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { transactionsAPI, statsAPI, notificationsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast, Toaster } from "sonner";

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      loadPurchases();
      loadStats();
      loadNotifications();

      // Auto-refresh every 5 seconds to check for payment updates
      const interval = setInterval(async () => {
        setIsAutoRefreshing(true);
        await loadPurchases(true); // Pass true to check pending orders with Midtrans
        setTimeout(() => setIsAutoRefreshing(false), 500);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [status, router]);

  const loadPurchases = async (checkPendingStatus = false) => {
    try {
      const transactions = await transactionsAPI.getTransactions({
        type: "purchases",
      });
      setPurchases(transactions);

      // Auto-check pending orders with Midtrans
      if (checkPendingStatus) {
        const pendingOrders = transactions.filter(
          (t: any) => t.status === "PENDING"
        );

        for (const order of pendingOrders) {
          try {
            const response = await fetch(
              `/api/payment/status?orderId=${order.orderId}`
            );
            const result = await response.json();

            if (result.success && result.transaction.status !== order.status) {
              // Status changed! Show notification and reload
              if (result.transaction.status === "COMPLETED") {
                toast.success("Payment confirmed! 🎉", {
                  description: `Redirecting to Library...`,
                  duration: 2000,
                });
                // Redirect to Library after 2 seconds
                setTimeout(() => {
                  router.push("/library");
                }, 2000);
              } else if (result.transaction.status === "EXPIRED") {
                toast.error("Payment expired ⏰", {
                  description: "Payment time limit exceeded. Please try again.",
                  duration: 3000,
                });
                // Reload to show updated status
                setTimeout(() => {
                  loadPurchases();
                }, 1500);
              }
            }
          } catch (error) {
            console.error(`Error checking status for ${order.orderId}:`, error);
          }
        }
      }
    } catch (error) {
      console.error("Error loading purchases:", error);
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

  const completedOrders = purchases.filter((p) => p.status === "COMPLETED");
  const pendingOrders = purchases.filter((p) => p.status === "PENDING");
  const failedOrders = purchases.filter(
    (p) =>
      p.status === "FAILED" ||
      p.status === "CANCELLED" ||
      p.status === "EXPIRED"
  );

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
                src="/campusCircle-logo.png"
                alt="CampusCircle Logo"
                width={32}
                height={32}
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
              {/* Auto-refresh indicator */}
              {isAutoRefreshing && (
                <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  <span className="hidden sm:inline">Syncing...</span>
                </div>
              )}

              {/* Search - Hidden on mobile, shown on larger screens */}
              <div className="relative hidden md:block">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-gray" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders..."
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
                className="p-2 text-dark-blue"
                title="Orders"
              >
                <Package className="h-5 w-5" />
              </button>
              <button
                onClick={() => router.push("/library")}
                className="p-2 text-medium-gray hover:text-dark-blue transition-colors"
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
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors bg-primary-100 text-dark-blue"
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
                  <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
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
                      Total
                    </p>
                  </>
                )}
              </Card>

              <Card className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-5 sm:h-6 bg-gray-200 rounded w-8 mb-1"></div>
                    <div className="h-2 bg-gray-200 rounded w-12"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-lg sm:text-2xl font-bold">
                      {completedOrders.length}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Done
                    </p>
                  </>
                )}
              </Card>

              <Card className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-5 sm:h-6 bg-gray-200 rounded w-12 mb-1"></div>
                    <div className="h-2 bg-gray-200 rounded w-10"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm sm:text-xl font-bold truncate">
                      Rp
                      {completedOrders
                        .reduce((sum, p) => sum + p.amount, 0)
                        .toLocaleString()}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Spent
                    </p>
                  </>
                )}
              </Card>
            </div>

            {/* Orders Tabs */}
            <Tabs defaultValue="all" className="space-y-3">
              <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
                <TabsList className="w-full md:w-auto">
                  <TabsTrigger
                    value="all"
                    className="text-xs sm:text-sm whitespace-nowrap"
                  >
                    All Orders ({purchases.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="text-xs sm:text-sm whitespace-nowrap"
                  >
                    Completed ({completedOrders.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="text-xs sm:text-sm whitespace-nowrap"
                  >
                    Pending ({pendingOrders.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="failed"
                    className="text-xs sm:text-sm whitespace-nowrap"
                  >
                    Failed ({failedOrders.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="space-y-4">
                <OrdersTable orders={purchases} router={router} />
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                <OrdersTable orders={completedOrders} router={router} />
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                <OrdersTable orders={pendingOrders} router={router} />
              </TabsContent>

              <TabsContent value="failed" className="space-y-4">
                <OrdersTable orders={failedOrders} router={router} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersTable({ orders, router }: { orders: any[]; router: any }) {
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const handleRefreshStatus = async (orderId: string) => {
    try {
      setRefreshingId(orderId);
      toast.loading("Checking payment status...", { id: orderId });

      const response = await fetch(`/api/payment/status?orderId=${orderId}`);
      const result = await response.json();

      if (result.success) {
        const newStatus = result.transaction.status;

        if (newStatus === "COMPLETED") {
          toast.success("Payment confirmed! 🎉", {
            id: orderId,
            description: "Redirecting to Library...",
            duration: 2000,
          });
          // Redirect to Library after 2 seconds
          setTimeout(() => {
            router.push("/library");
          }, 2000);
        } else if (newStatus === "PENDING") {
          toast.info("Payment still pending", {
            id: orderId,
            description: "Please complete your payment",
          });
        } else if (newStatus === "EXPIRED") {
          toast.error("Payment expired ⏰", {
            id: orderId,
            description: "Payment time limit exceeded. Please try again.",
          });
          // Reload page to show updated status
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast.error(`Payment ${newStatus.toLowerCase()}`, { id: orderId });
          // Reload page to show updated status
          setTimeout(() => window.location.reload(), 1500);
        }
      } else {
        toast.error("Failed to check status", {
          id: orderId,
          description: "Please try again",
        });
      }
    } catch (error) {
      console.error("Error refreshing status:", error);
      toast.error("Connection error", {
        id: orderId,
        description: "Please check your internet connection",
      });
    } finally {
      setRefreshingId(null);
    }
  };

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No orders found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>View and manage your purchases</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.orderId.substring(0, 12)}...
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.itemTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.itemType === "marketplace"
                          ? "Study Material"
                          : "Tutoring Session"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    Rp {order.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge
                        variant={
                          order.status === "COMPLETED"
                            ? "default"
                            : order.status === "PENDING"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {order.status}
                      </Badge>
                      {order.status === "PENDING" && order.expiresAt && (
                        <div className="text-xs text-muted-foreground">
                          Expires:{" "}
                          {new Date(order.expiresAt).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.status === "COMPLETED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push("/library")}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                    {order.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRefreshStatus(order.orderId)}
                        disabled={refreshingId === order.orderId}
                      >
                        <RefreshCw
                          className={`h-4 w-4 mr-1 ${
                            refreshingId === order.orderId ? "animate-spin" : ""
                          }`}
                        />
                        {refreshingId === order.orderId
                          ? "Checking..."
                          : "Refresh"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
