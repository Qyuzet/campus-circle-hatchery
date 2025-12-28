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
                    {isSyncing && order.status === "PENDING" && (
                      <RefreshCw className="h-3 w-3 text-blue-600 animate-spin" />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-2">
        {transactions.map((order) => (
          <Card key={order.id} className="p-2">
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs line-clamp-1">
                    {order.itemTitle}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {order.itemType === "marketplace"
                      ? "Study Material"
                      : order.itemType === "food"
                      ? "Food"
                      : "Event"}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Badge
                    variant={
                      order.status === "COMPLETED"
                        ? "default"
                        : order.status === "PENDING"
                        ? "secondary"
                        : "destructive"
                    }
                    className="text-[10px] h-4 px-1.5"
                  >
                    {order.status}
                  </Badge>
                  {isSyncing && order.status === "PENDING" && (
                    <RefreshCw className="h-3 w-3 text-blue-600 animate-spin" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="font-semibold text-xs">
                  Rp {order.amount.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
