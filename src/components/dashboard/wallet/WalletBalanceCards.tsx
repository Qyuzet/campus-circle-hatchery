"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserStats {
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  withdrawnBalance: number;
}

interface WalletBalanceCardsProps {
  userStats: UserStats;
}

export function WalletBalanceCards({ userStats }: WalletBalanceCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
      <Card className="border border-gray-300">
        <CardHeader className="p-2 sm:p-3 pb-1 sm:pb-2">
          <CardTitle className="text-[10px] sm:text-xs font-medium text-medium-gray leading-tight">
            Total
            <br className="sm:hidden" />
            Earnings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 pt-0">
          <div className="text-sm sm:text-lg font-semibold text-dark-gray leading-tight break-all">
            Rp {userStats.totalEarnings.toLocaleString()}
          </div>
          <p className="text-[8px] sm:text-[10px] text-medium-gray mt-0.5 leading-tight">
            After platform fee
          </p>
        </CardContent>
      </Card>

      <Card className="border border-gray-300">
        <CardHeader className="p-2 sm:p-3 pb-1 sm:pb-2">
          <CardTitle className="text-[10px] sm:text-xs font-medium text-medium-gray leading-tight">
            Available
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 pt-0">
          <div className="text-sm sm:text-lg font-semibold text-dark-gray leading-tight break-all">
            Rp {userStats.availableBalance.toLocaleString()}
          </div>
          <p className="text-[8px] sm:text-[10px] text-medium-gray mt-0.5 leading-tight">
            Ready to withdraw
          </p>
        </CardContent>
      </Card>

      <Card className="border border-gray-300">
        <CardHeader className="p-2 sm:p-3 pb-1 sm:pb-2">
          <CardTitle className="text-[10px] sm:text-xs font-medium text-medium-gray leading-tight">
            Pending
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 pt-0">
          <div className="text-sm sm:text-lg font-semibold text-dark-gray leading-tight break-all">
            Rp {userStats.pendingBalance.toLocaleString()}
          </div>
          <p className="text-[8px] sm:text-[10px] text-medium-gray mt-0.5 leading-tight">
            3-day hold
          </p>
        </CardContent>
      </Card>

      <Card className="border border-gray-300">
        <CardHeader className="p-2 sm:p-3 pb-1 sm:pb-2">
          <CardTitle className="text-[10px] sm:text-xs font-medium text-medium-gray leading-tight">
            Withdrawn
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 pt-0">
          <div className="text-sm sm:text-lg font-semibold text-dark-gray leading-tight break-all">
            Rp {userStats.withdrawnBalance.toLocaleString()}
          </div>
          <p className="text-[8px] sm:text-[10px] text-medium-gray mt-0.5 leading-tight">
            All-time
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

