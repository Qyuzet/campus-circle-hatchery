import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WalletBalanceCardsProps {
  userStats: {
    totalEarnings: number;
    availableBalance: number;
    pendingBalance: number;
    withdrawnBalance: number;
  } | null;
}

export function WalletBalanceCards({ userStats }: WalletBalanceCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="p-2 sm:p-4 pb-1 sm:pb-2">
          <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground">
            Total Earnings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 pt-0">
          <div className="text-base sm:text-2xl font-bold text-blue-600 mb-0.5 sm:mb-1">
            Rp {(userStats?.totalEarnings || 0).toLocaleString()}
          </div>
          <p className="text-[9px] sm:text-xs text-muted-foreground">
            After platform fee
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="p-2 sm:p-4 pb-1 sm:pb-2">
          <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground">
            Available
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 pt-0">
          <div className="text-base sm:text-2xl font-bold text-green-600 mb-0.5 sm:mb-1">
            Rp {(userStats?.availableBalance || 0).toLocaleString()}
          </div>
          <p className="text-[9px] sm:text-xs text-muted-foreground">
            Ready to withdraw
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="p-2 sm:p-4 pb-1 sm:pb-2">
          <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground">
            Pending
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 pt-0">
          <div className="text-base sm:text-2xl font-bold text-orange-600 mb-0.5 sm:mb-1">
            Rp {(userStats?.pendingBalance || 0).toLocaleString()}
          </div>
          <p className="text-[9px] sm:text-xs text-muted-foreground">
            3-day hold
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="p-2 sm:p-4 pb-1 sm:pb-2">
          <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground">
            Withdrawn
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 pt-0">
          <div className="text-base sm:text-2xl font-bold text-purple-600 mb-0.5 sm:mb-1">
            Rp {(userStats?.withdrawnBalance || 0).toLocaleString()}
          </div>
          <p className="text-[9px] sm:text-xs text-muted-foreground">
            All-time
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
