"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Package } from "lucide-react";
import { SalesList } from "./SalesList";

interface SalesTabClientProps {
  transactions: any[];
}

export function SalesTabClient({ transactions }: SalesTabClientProps) {
  const completedTransactions = transactions.filter(
    (t) => t.status === "COMPLETED"
  );
  const totalSales = completedTransactions.length;
  const totalRevenue = completedTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const pendingSales = transactions.filter((t) => t.status === "PENDING").length;

  return (
    <>
      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6">
        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between mb-0.5 md:mb-1">
            <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </div>
          <div className="text-lg md:text-2xl font-bold">{totalSales}</div>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            Total Sales
          </p>
        </Card>
        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between mb-0.5 md:mb-1">
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </div>
          <div className="text-sm md:text-xl font-bold truncate">
            Rp{totalRevenue.toLocaleString()}
          </div>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            Revenue
          </p>
        </Card>
        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between mb-0.5 md:mb-1">
            <Package className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </div>
          <div className="text-lg md:text-2xl font-bold">{pendingSales}</div>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            Pending
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
        </CardHeader>
        <CardContent>
          {completedTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No sales yet</p>
            </div>
          ) : (
            <SalesList transactions={completedTransactions} />
          )}
        </CardContent>
      </Card>
    </>
  );
}

