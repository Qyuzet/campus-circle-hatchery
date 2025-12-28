import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Package } from "lucide-react";
import { SalesList } from "./SalesList";

export async function SalesTab({ userId }: { userId: string }) {
  const transactions = await prisma.transaction.findMany({
    where: {
      sellerId: userId,
      status: "COMPLETED",
    },
    include: {
      buyer: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalSales = transactions.length;
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const pendingSales = await prisma.transaction.count({
    where: {
      sellerId: userId,
      status: "PENDING",
    },
  });

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <Card className="p-2 sm:p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </div>
          <div className="text-xl sm:text-3xl font-bold mb-0.5 sm:mb-1">
            {totalSales}
          </div>
          <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">
            Total Sales
          </p>
        </Card>
        <Card className="p-2 sm:p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          </div>
          <div className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1 truncate">
            Rp{totalRevenue.toLocaleString()}
          </div>
          <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">
            Revenue
          </p>
        </Card>
        <Card className="p-2 sm:p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
          </div>
          <div className="text-xl sm:text-3xl font-bold mb-0.5 sm:mb-1">
            {pendingSales}
          </div>
          <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">
            Pending
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No sales yet</p>
            </div>
          ) : (
            <SalesList transactions={transactions} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
