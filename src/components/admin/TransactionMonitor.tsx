"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  itemTitle: string;
  itemType: string;
  paymentMethod: string | null;
  createdAt: string;
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface Stats {
  status: string;
  _count: { id: number };
  _sum: { amount: number | null };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function TransactionMonitor() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [itemTypeFilter, setItemTypeFilter] = useState("");
  const [dateRange, setDateRange] = useState("30");

  useEffect(() => {
    loadTransactions();
  }, [pagination.page, search, statusFilter, itemTypeFilter, dateRange]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        dateRange,
      });

      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (itemTypeFilter) params.append("itemType", itemTypeFilter);

      const response = await fetch(`/api/admin/transactions?${params}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions);
        setStats(data.stats);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "FAILED":
        return "bg-red-100 text-red-700";
      case "EXPIRED":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case "marketplace":
        return "bg-blue-100 text-blue-700";
      case "food":
        return "bg-orange-100 text-orange-700";
      case "event":
        return "bg-purple-100 text-purple-700";
      case "tutoring":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Transaction Monitor
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {pagination.total} total transactions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadTransactions}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.status}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 capitalize">
                      {stat.status.toLowerCase()}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat._count.id}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Rp {(stat._sum.amount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                      stat.status
                    )}`}
                  >
                    {stat.status}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by order ID or item title..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="EXPIRED">Expired</option>
            </select>

            {/* Item Type Filter */}
            <select
              value={itemTypeFilter}
              onChange={(e) => {
                setItemTypeFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="marketplace">Marketplace</option>
              <option value="food">Food</option>
              <option value="event">Event</option>
              <option value="tutoring">Tutoring</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-sm text-gray-600">
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Item</th>
                  <th className="p-4 font-medium">Buyer</th>
                  <th className="p-4 font-medium">Seller</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-medium text-gray-900">
                          {tx.orderId}
                        </p>
                        <p className="text-xs text-gray-500">
                          {tx.paymentMethod || "N/A"}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-gray-900">
                          {tx.itemTitle}
                        </p>
                        <div
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${getItemTypeColor(
                            tx.itemType
                          )}`}
                        >
                          {tx.itemType}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-900">{tx.buyer.name}</p>
                        <p className="text-xs text-gray-500">
                          {tx.buyer.email}
                        </p>
                      </td>
                      <td className="p-4">
                        {tx.seller ? (
                          <>
                            <p className="text-gray-900">{tx.seller.name}</p>
                            <p className="text-xs text-gray-500">
                              {tx.seller.email}
                            </p>
                          </>
                        ) : (
                          <p className="text-gray-500">-</p>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-gray-900">
                        Rp {tx.amount.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            tx.status
                          )}`}
                        >
                          {tx.status}
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">
                        {format(new Date(tx.createdAt), "MMM dd, yyyy HH:mm")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && transactions.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} transactions
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                  className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
