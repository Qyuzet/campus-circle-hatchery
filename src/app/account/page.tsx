"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Bell,
  ShoppingCart,
  Package,
  Library,
  MessageCircle,
  TrendingUp,
  Plus,
  LogOut,
  Mail,
  Calendar,
  Edit,
  Save,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { statsAPI, notificationsAPI } from "@/lib/api";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userStats, setUserStats] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      loadData();
      setEditedName(session?.user?.name || "");
    }
  }, [status, router, session]);

  const loadData = async () => {
    try {
      const [stats, notifs] = await Promise.all([
        statsAPI.getUserStats(),
        notificationsAPI.getNotifications(),
      ]);
      setUserStats(stats);
      setNotifications(notifs);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-campus-blue-dark mx-auto mb-4"></div>
          <p className="text-dark-gray text-lg">Loading account...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-light-gray sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold text-dark-gray">
                CampusCircle
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button className="relative p-2 text-medium-gray hover:text-dark-gray transition-colors">
                <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => router.push("/account")}
                className="flex items-center space-x-2"
              >
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
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
        <div className="lg:hidden mb-4">
          <div className="bg-white rounded-lg shadow p-2">
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
                onClick={() => router.push("/dashboard?tab=insights")}
                className="p-2 text-medium-gray hover:text-dark-blue transition-colors"
                title="Analytics"
              >
                <TrendingUp className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0">
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
                  onClick={() => router.push("/dashboard")}
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
          <div className="flex-1 space-y-4">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">My Account</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {session?.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-24 h-24 rounded-full border-4 border-primary-100"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-dark-blue rounded-full flex items-center justify-center border-4 border-primary-100">
                        <User className="h-12 w-12 text-white" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-center sm:text-left">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              // TODO: Implement update user API
                              setIsEditing(false);
                            }}
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditedName(session?.user?.name || "");
                              setIsEditing(false);
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                          <h2 className="text-2xl font-bold text-dark-gray">
                            {session?.user?.name || "User"}
                          </h2>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="p-1 hover:bg-secondary-100 rounded transition-colors"
                          >
                            <Edit className="h-4 w-4 text-medium-gray" />
                          </button>
                        </div>
                        <div className="space-y-2 text-sm text-medium-gray">
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{session?.user?.email}</span>
                          </div>
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Member since {new Date().getFullYear()}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="flex overflow-x-auto gap-3 pb-2 -mx-3 px-3 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:overflow-visible">
              <Card className="flex-shrink-0 w-[calc(25vw-20px)] min-w-[100px] max-w-[140px] md:w-auto md:max-w-none">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-dark-gray">
                      {userStats?.itemsSold || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Items Sold</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="flex-shrink-0 w-[calc(25vw-20px)] min-w-[100px] max-w-[140px] md:w-auto md:max-w-none">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-dark-gray">
                      {userStats?.itemsBought || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Items Bought
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="flex-shrink-0 w-[calc(25vw-20px)] min-w-[100px] max-w-[140px] md:w-auto md:max-w-none">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-dark-gray">
                      {userStats?.messagesCount || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Messages</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="flex-shrink-0 w-[calc(25vw-20px)] min-w-[100px] max-w-[140px] md:w-auto md:max-w-none">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-dark-gray">
                      {userStats?.averageRating?.toFixed(1) || "5.0"}
                    </p>
                    <p className="text-sm text-muted-foreground">Rating</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/orders")}
                >
                  <Package className="mr-2 h-4 w-4" />
                  View My Orders
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/library")}
                >
                  <Library className="mr-2 h-4 w-4" />
                  View My Library
                </Button>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
