"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  bankName?: string;
  accountNumber: string;
  accountName: string;
  notes?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    studentId?: string;
  };
}

interface Stats {
  status: string;
  _count: { id: number };
  _sum: { amount: number };
}

export default function WithdrawalManagement() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("PENDING");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadWithdrawals();
  }, [filter]);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const url = filter
        ? `/api/admin/withdrawals?status=${filter}`
        : "/api/admin/withdrawals";
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setWithdrawals(data.withdrawals);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to load withdrawals:", error);
      toast.error("Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    withdrawalId: string,
    newStatus: string
  ) => {
    setProcessing(withdrawalId);
    try {
      const response = await fetch(`/api/withdrawals/${withdrawalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      toast.success(`Withdrawal ${newStatus.toLowerCase()}`);
      loadWithdrawals();
    } catch (error: any) {
      toast.error(error.message || "Failed to update withdrawal");
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-blue-100 text-blue-800",
      PROCESSING: "bg-purple-100 text-purple-800",
      COMPLETED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      FAILED: "bg-gray-100 text-gray-800",
    };
    return <Badge className={colors[status] || ""}>{status}</Badge>;
  };

  const getSummary = (status: string) => {
    const stat = stats.find((s) => s.status === status);
    return {
      count: stat?._count.id || 0,
      total: stat?._sum.amount || 0,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Withdrawal Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Approve or reject withdrawal requests
          </p>
        </div>
        <button
          onClick={loadWithdrawals}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["PENDING", "APPROVED", "COMPLETED", "REJECTED"].map((status) => {
          const summary = getSummary(status);
          return (
            <Card key={status}>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600 mb-1">{status}</div>
                <div className="text-2xl font-bold text-gray-900">
                  {summary.count}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Rp {summary.total.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["PENDING", "APPROVED", "PROCESSING", "COMPLETED", "REJECTED"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${
                filter === status
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-600"
              }`}
            >
              {status}
            </button>
          )
        )}
      </div>

      {/* Withdrawals List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            </CardContent>
          </Card>
        ) : withdrawals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No {filter.toLowerCase()} withdrawals
            </CardContent>
          </Card>
        ) : (
          withdrawals.map((withdrawal) => (
            <Card key={withdrawal.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: User & Bank Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(withdrawal.status)}
                      <span className="text-xs text-gray-500">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {withdrawal.user.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {withdrawal.user.email} •{" "}
                      {withdrawal.user.studentId || "No ID"}
                    </div>
                    <div className="mt-2 text-xs text-gray-700 space-y-1">
                      <div>
                        <strong>Method:</strong>{" "}
                        {withdrawal.paymentMethod === "GOPAY"
                          ? "GoPay"
                          : withdrawal.paymentMethod}
                        {withdrawal.bankName && ` - ${withdrawal.bankName}`}
                      </div>
                      <div>
                        <strong>Account:</strong> {withdrawal.accountNumber} -{" "}
                        {withdrawal.accountName}
                      </div>
                      {withdrawal.notes && (
                        <div className="text-gray-600">
                          <strong>Notes:</strong> {withdrawal.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xl font-bold text-gray-900">
                      Rp {withdrawal.amount.toLocaleString()}
                    </div>

                    {withdrawal.status === "PENDING" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUpdateStatus(withdrawal.id, "REJECTED")
                          }
                          disabled={processing === withdrawal.id}
                          className="text-xs border-red-300 text-red-700 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(withdrawal.id, "APPROVED")
                          }
                          disabled={processing === withdrawal.id}
                          className="text-xs bg-blue-600 hover:bg-blue-700"
                        >
                          {processing === withdrawal.id
                            ? "Processing..."
                            : "Approve"}
                        </Button>
                      </div>
                    )}

                    {withdrawal.status === "APPROVED" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleUpdateStatus(withdrawal.id, "COMPLETED")
                        }
                        disabled={processing === withdrawal.id}
                        className="text-xs bg-green-600 hover:bg-green-700"
                      >
                        {processing === withdrawal.id
                          ? "Processing..."
                          : "Mark Completed"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
