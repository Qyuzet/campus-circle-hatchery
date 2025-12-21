"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Receipt,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

interface DashboardStats {
  users: {
    total: number;
    active: number;
  };
  transactions: {
    today: number;
    week: number;
    month: number;
  };
  revenue: {
    total: number;
    pending: number;
  };
  listings: {
    marketplace: number;
    food: number;
    events: number;
    tutoring: number;
    total: number;
  };
  withdrawals: {
    pending: number;
  };
}

interface RecentActivity {
  id: string;
  orderId: string;
  itemTitle: string;
  itemType: string;
  amount: number;
  status: string;
  createdAt: string;
  buyer: {
    name: string;
    email: string;
  };
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/dashboard");
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setRecentActivity(data.recentActivity);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.users.total.toLocaleString(),
      subtitle: `${stats.users.active} active (7 days)`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Transactions (Month)",
      value: stats.transactions.month.toLocaleString(),
      subtitle: `${stats.transactions.today} today, ${stats.transactions.week} this week`,
      icon: Receipt,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.revenue.total),
      subtitle: `${formatCurrency(stats.revenue.pending)} pending`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Active Listings",
      value: stats.listings.total.toLocaleString(),
      subtitle: `${stats.listings.marketplace} marketplace, ${stats.listings.food} food, ${stats.listings.events} events, ${stats.listings.tutoring} tutoring`,
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {format(lastUpdated, "MMM dd, yyyy HH:mm:ss")}
          </p>
        </div>
        <button
          onClick={loadDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-600">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Item</th>
                  <th className="pb-3 font-medium">Buyer</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="border-b last:border-0">
                    <td className="py-3 font-mono text-xs">{activity.orderId}</td>
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900">{activity.itemTitle}</p>
                        <p className="text-xs text-gray-500 capitalize">{activity.itemType}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900">{activity.buyer.name}</p>
                        <p className="text-xs text-gray-500">{activity.buyer.email}</p>
                      </div>
                    </td>
                    <td className="py-3 font-semibold">{formatCurrency(activity.amount)}</td>
                    <td className="py-3">
                      <Badge
                        className={
                          activity.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : activity.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {activity.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-gray-600">
                      {format(new Date(activity.createdAt), "MMM dd, HH:mm")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

