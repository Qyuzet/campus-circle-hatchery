"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WalletBalanceCards } from "./WalletBalanceCards";
import { WithdrawalForm } from "./WithdrawalForm";
import { WalletAnalytics } from "./WalletAnalytics";

interface UserStats {
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  withdrawnBalance: number;
  bankName: string | null;
  accountNumber: string | null;
  accountHolderName: string | null;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  bankName: string | null;
  accountNumber: string;
  createdAt: Date;
  rejectionReason: string | null;
}

interface Transaction {
  id: string;
  amount: number;
  itemTitle: string;
  itemType: string;
  status: string;
  createdAt: Date;
  type: "sale" | "purchase";
}

interface WalletClientProps {
  userStats: UserStats;
  withdrawals: Withdrawal[];
  allTransactions: Transaction[];
  activeListingsCount: number;
}

export function WalletClient({
  userStats,
  withdrawals,
  allTransactions,
  activeListingsCount,
}: WalletClientProps) {
  return (
    <div className="space-y-3">
      <WalletBalanceCards userStats={userStats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <WithdrawalForm
          availableBalance={userStats.availableBalance}
          userStats={userStats}
        />

        <Card className="p-4 border border-gray-300">
          <h3 className="text-sm font-semibold text-dark-gray mb-3">
            Withdrawal History
          </h3>

          <div className="space-y-2">
            {withdrawals.length > 0 ? (
              withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="border border-gray-200 rounded p-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-dark-gray">
                          Rp {withdrawal.amount.toLocaleString()}
                        </p>
                        <Badge
                          className={`text-[10px] px-1.5 py-0 ${
                            withdrawal.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : withdrawal.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : withdrawal.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {withdrawal.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-medium-gray mt-0.5">
                        {withdrawal.bankName || "N/A"} •{" "}
                        {withdrawal.accountNumber}
                      </p>
                      <p className="text-[10px] text-medium-gray mt-0.5">
                        {new Date(withdrawal.createdAt).toLocaleDateString(
                          "id-ID",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                      {withdrawal.rejectionReason && (
                        <p className="text-[10px] text-red-600 mt-1">
                          Reason: {withdrawal.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-medium-gray text-xs">
                  No withdrawal history yet
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <WalletAnalytics
        allTransactions={allTransactions}
        activeListingsCount={activeListingsCount}
      />
    </div>
  );
}
