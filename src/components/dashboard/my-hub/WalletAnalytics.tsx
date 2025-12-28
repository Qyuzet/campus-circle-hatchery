import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  itemTitle: string;
  itemType: string;
  amount: number;
  status: string;
  createdAt: Date;
  type: "sale" | "purchase";
}

interface WalletAnalyticsProps {
  salesTransactions: any[];
  allTransactions: Transaction[];
}

export function WalletAnalytics({
  salesTransactions,
  allTransactions,
}: WalletAnalyticsProps) {
  const completedSales = allTransactions.filter(
    (t) => t.type === "sale" && t.status === "COMPLETED"
  );
  const totalRevenue = completedSales.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h2 className="text-lg font-semibold text-dark-gray mb-4">
        Analytics & Insights
      </h2>

      <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
        <Card>
          <CardHeader className="pb-1 md:pb-2 p-2 md:p-6">
            <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6 pt-0">
            <div className="text-lg md:text-2xl font-bold">
              {completedSales.length}
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
              Completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 md:pb-2 p-2 md:p-6">
            <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6 pt-0">
            <div className="text-sm md:text-2xl font-bold truncate">
              Rp {totalRevenue.toLocaleString()}
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
              Before fee
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 md:pb-2 p-2 md:p-6">
            <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
              Avg Sale
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6 pt-0">
            <div className="text-sm md:text-2xl font-bold truncate">
              Rp{" "}
              {completedSales.length > 0
                ? Math.round(totalRevenue / completedSales.length).toLocaleString()
                : 0}
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["Study Material", "Food", "Event"].map((category) => {
                const categoryType =
                  category === "Study Material"
                    ? "marketplace"
                    : category.toLowerCase();
                const count = completedSales.filter(
                  (t) => t.itemType === categoryType
                ).length;
                const total = completedSales.length;
                const percentage =
                  total > 0 ? Math.round((count / total) * 100) : 0;

                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-dark-blue h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allTransactions
                .filter((t) => t.type === "sale")
                .slice(0, 5)
                .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between pb-3 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {transaction.itemTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-semibold">
                        Rp {transaction.amount.toLocaleString()}
                      </p>
                      <Badge
                        variant={
                          transaction.status === "COMPLETED"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              {allTransactions.filter((t) => t.type === "sale").length === 0 && (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No sales yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

