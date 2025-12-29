"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Download, DollarSign } from "lucide-react";
import { PurchasesList } from "./PurchasesList";
import { PaymentSyncBanner } from "./PaymentSyncBanner";

interface PurchasesTabClientProps {
  transactions: any[];
  onPaymentCompleted?: () => void;
}

export function PurchasesTabClient({
  transactions,
  onPaymentCompleted,
}: PurchasesTabClientProps) {
  const totalOrders = transactions.length;
  const completedOrders = transactions.filter(
    (t) => t.status === "COMPLETED"
  ).length;
  const totalSpent = transactions
    .filter((t) => t.status === "COMPLETED")
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingOrdersCount = transactions.filter(
    (t) => t.status === "PENDING"
  ).length;

  return (
    <>
      <PaymentSyncBanner pendingOrdersCount={pendingOrdersCount} />

      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6">
        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between mb-0.5 md:mb-1">
            <Package className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </div>
          <div className="text-lg md:text-2xl font-bold">{totalOrders}</div>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            Total Orders
          </p>
        </Card>
        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between mb-0.5 md:mb-1">
            <Download className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </div>
          <div className="text-lg md:text-2xl font-bold">{completedOrders}</div>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            Completed
          </p>
        </Card>
        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between mb-0.5 md:mb-1">
            <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </div>
          <div className="text-sm md:text-xl font-bold truncate">
            Rp{totalSpent.toLocaleString()}
          </div>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            Total Spent
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No purchases yet</p>
            </div>
          ) : (
            <PurchasesList
              transactions={transactions}
              onPaymentCompleted={onPaymentCompleted}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
