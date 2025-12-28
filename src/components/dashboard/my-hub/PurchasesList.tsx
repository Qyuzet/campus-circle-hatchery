"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { paymentAPI } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  orderId: string;
  itemTitle: string;
  itemType: string;
  amount: number;
  status: string;
  createdAt: Date;
}

interface PurchasesListProps {
  transactions: Transaction[];
}

export function PurchasesList({ transactions }: PurchasesListProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const pendingOrders = transactions.filter((t) => t.status === "PENDING");

  useEffect(() => {
    const syncPayments = async () => {
      if (pendingOrders.length > 0) {
        setIsSyncing(true);
        try {
          for (const order of pendingOrders) {
            await paymentAPI.getPaymentStatus(order.orderId);
          }
          router.refresh();
        } catch (error) {
          console.error("Payment sync error:", error);
        } finally {
          setTimeout(() => setIsSyncing(false), 2000);
        }
      }
    };

    syncPayments();

    const interval = setInterval(() => {
      if (pendingOrders.length > 0) {
        syncPayments();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [pendingOrders.length, router]);

  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((order) => (
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
                        : order.itemType === "food"
                        ? "Food"
                        : "Event"}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-semibold">
                  Rp {order.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={
                        order.status === "COMPLETED"
                          ? "flex items-center gap-2 px-3 py-1 bg-green-50 border-l-4 border-green-600 rounded-sm"
                          : order.status === "PENDING"
                          ? "flex items-center gap-2 px-3 py-1 bg-yellow-50 border-l-4 border-yellow-600 rounded-sm"
                          : "flex items-center gap-2 px-3 py-1 bg-red-50 border-l-4 border-red-600 rounded-sm"
                      }
                    >
                      <span
                        className={
                          order.status === "COMPLETED"
                            ? "text-sm font-medium text-green-800"
                            : order.status === "PENDING"
                            ? "text-sm font-medium text-yellow-800"
                            : "text-sm font-medium text-red-800"
                        }
                      >
                        {order.status}
                      </span>
                      {isSyncing && order.status === "PENDING" && (
                        <RefreshCw className="h-3.5 w-3.5 text-yellow-600 animate-spin" />
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-3">
        {transactions.map((order) => (
          <Card
            key={order.id}
            className="p-4 hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm line-clamp-2 mb-1">
                    {order.itemTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.itemType === "marketplace"
                      ? "Study Material"
                      : order.itemType === "food"
                      ? "Food"
                      : "Event"}
                  </p>
                </div>
                <div
                  className={
                    order.status === "COMPLETED"
                      ? "flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border-l-4 border-green-600 rounded-sm flex-shrink-0"
                      : order.status === "PENDING"
                      ? "flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 border-l-4 border-yellow-600 rounded-sm flex-shrink-0"
                      : "flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border-l-4 border-red-600 rounded-sm flex-shrink-0"
                  }
                >
                  <span
                    className={
                      order.status === "COMPLETED"
                        ? "text-xs font-semibold text-green-800"
                        : order.status === "PENDING"
                        ? "text-xs font-semibold text-yellow-800"
                        : "text-xs font-semibold text-red-800"
                    }
                  >
                    {order.status}
                  </span>
                  {isSyncing && order.status === "PENDING" && (
                    <RefreshCw className="h-3.5 w-3.5 text-yellow-600 animate-spin" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">
                    Order Date
                  </span>
                  <span className="text-sm font-medium">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 items-end">
                  <span className="text-xs text-muted-foreground">Amount</span>
                  <span className="font-bold text-base text-blue-600">
                    Rp {order.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
