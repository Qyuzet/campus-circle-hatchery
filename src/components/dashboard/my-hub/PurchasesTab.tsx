import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Download, DollarSign } from "lucide-react";
import { PurchasesList } from "./PurchasesList";
import { PaymentSyncBanner } from "./PaymentSyncBanner";

export async function PurchasesTab({ userId }: { userId: string }) {
  const transactions = await prisma.transaction.findMany({
    where: {
      buyerId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

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

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <Card className="p-2 sm:p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </div>
          <div className="text-xl sm:text-3xl font-bold mb-0.5 sm:mb-1">
            {totalOrders}
          </div>
          <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">
            Total Orders
          </p>
        </Card>
        <Card className="p-2 sm:p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <Download className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          </div>
          <div className="text-xl sm:text-3xl font-bold mb-0.5 sm:mb-1">
            {completedOrders}
          </div>
          <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">
            Completed
          </p>
        </Card>
        <Card className="p-2 sm:p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          </div>
          <div className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1 truncate">
            Rp{totalSpent.toLocaleString()}
          </div>
          <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">
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
            <PurchasesList transactions={transactions} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
