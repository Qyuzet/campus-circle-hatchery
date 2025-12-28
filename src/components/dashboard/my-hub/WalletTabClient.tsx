"use client";

import { useRouter } from "next/navigation";
import { WalletBalanceCards } from "./WalletBalanceCards";
import { WithdrawalForm } from "@/components/WithdrawalForm";
import { WalletWithdrawalHistory } from "./WalletWithdrawalHistory";
import { WalletAnalytics } from "./WalletAnalytics";

interface UserStats {
  id: string;
  userId: string;
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  withdrawnBalance: number;
  updatedAt: Date;
}

interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  bankName: string | null;
  accountNumber: string;
  accountName: string;
  processedBy: string | null;
  processedAt: Date | null;
  rejectionReason: string | null;
  irisReferenceNo: string | null;
  irisStatus: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Transaction {
  id: string;
  orderId: string;
  itemId: string | null;
  itemTitle: string;
  itemType: string;
  amount: number;
  status: string;
  buyerId: string;
  sellerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface WalletTabClientProps {
  userStats: UserStats | null;
  withdrawals: Withdrawal[];
  salesTransactions: Transaction[];
  allTransactions: (Transaction & { type: "sale" | "purchase" })[];
}

export function WalletTabClient({
  userStats,
  withdrawals,
  salesTransactions,
  allTransactions,
}: WalletTabClientProps) {
  const router = useRouter();

  const handleWithdrawalSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          Platform fee: 5% • Holding period: 3 days • Minimum withdrawal: Rp
          50,000
        </p>
      </div>

      <WalletBalanceCards userStats={userStats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WithdrawalForm
          availableBalance={userStats?.availableBalance || 0}
          userStats={userStats}
          onSuccess={handleWithdrawalSuccess}
        />

        <WalletWithdrawalHistory withdrawals={withdrawals} />
      </div>

      <WalletAnalytics
        salesTransactions={salesTransactions}
        allTransactions={allTransactions}
      />
    </div>
  );
}
