"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Receipt,
  Package,
  MessageSquare,
  Menu,
  X,
  Search,
  RefreshCw,
  Wallet,
  FileImage,
} from "lucide-react";

import DashboardOverview from "@/components/admin/DashboardOverview";
import UserManagement from "@/components/admin/UserManagement";
import TransactionMonitor from "@/components/admin/TransactionMonitor";
import ListingsManagement from "@/components/admin/ListingsManagement";
import ConversationsMonitor from "@/components/admin/ConversationsMonitor";
import WithdrawalManagement from "@/components/admin/WithdrawalManagement";
import DocumentThumbnails from "@/components/admin/DocumentThumbnails";
import ClubsManagement from "@/components/admin/ClubsManagement";

type Section =
  | "dashboard"
  | "users"
  | "transactions"
  | "listings"
  | "conversations"
  | "withdrawals"
  | "thumbnails"
  | "clubs";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      checkAdminRole();
    }
  }, [status, router]);

  const checkAdminRole = async () => {
    try {
      const response = await fetch("/api/user/me");
      const data = await response.json();

      if (data.role !== "admin") {
        toast.error("Access denied. Admin only.");
        router.push("/dashboard");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Failed to check role:", error);
      router.push("/dashboard");
    } finally {
      setCheckingRole(false);
    }
  };

  if (checkingRole || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  const navigation: { id: Section; name: string; icon: any }[] = [
    { id: "dashboard" as const, name: "Dashboard", icon: LayoutDashboard },
    { id: "users" as const, name: "Users", icon: Users },
    { id: "transactions" as const, name: "Transactions", icon: Receipt },
    { id: "listings" as const, name: "Listings", icon: Package },
    {
      id: "conversations" as const,
      name: "Conversations",
      icon: MessageSquare,
    },
    { id: "clubs" as const, name: "Clubs", icon: Users },
    { id: "withdrawals" as const, name: "Withdrawals", icon: Wallet },
    { id: "thumbnails" as const, name: "Thumbnails", icon: FileImage },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <img
                src="/campus-circle-logo.png"
                alt="Logo"
                className="h-10 w-auto"
              />
              <Badge className="bg-red-600 text-white">ADMIN</Badge>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id as Section);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 hidden lg:block">
              {navigation.find((n) => n.id === activeSection)?.name}
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6">
          {activeSection === "dashboard" && <DashboardOverview />}
          {activeSection === "users" && <UserManagement />}
          {activeSection === "transactions" && <TransactionMonitor />}
          {activeSection === "listings" && <ListingsManagement />}
          {activeSection === "conversations" && <ConversationsMonitor />}
          {activeSection === "clubs" && <ClubsManagement />}
          {activeSection === "withdrawals" && <WithdrawalManagement />}
          {activeSection === "thumbnails" && <DocumentThumbnails />}
        </main>
      </div>
    </div>
  );
}
