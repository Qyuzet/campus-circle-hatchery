import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WalletClient } from "@/components/dashboard/wallet/WalletClient";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Suspense } from "react";

function WalletSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-gray-200 animate-pulse rounded-lg w-64" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
      <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
    </div>
  );
}

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const userId = session.user.id;

  const [
    userStatsData,
    withdrawals,
    sales,
    purchases,
    listings,
    wishlistItems,
    notifications,
  ] = await Promise.all([
    prisma.userStats.findUnique({
      where: { userId },
      select: {
        totalEarnings: true,
        availableBalance: true,
        pendingBalance: true,
        withdrawnBalance: true,
        savedBankName: true,
        savedAccountNumber: true,
        savedAccountName: true,
      },
    }),
    prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.findMany({
      where: {
        sellerId: userId,
        status: "COMPLETED",
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.findMany({
      where: {
        buyerId: userId,
        status: "COMPLETED",
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.marketplaceItem.findMany({
      where: {
        sellerId: userId,
        status: "available",
      },
    }),
    prisma.wishlistItem.findMany({
      where: { userId },
      select: {
        itemId: true,
      },
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const userStats = {
    totalEarnings: userStatsData?.totalEarnings || 0,
    availableBalance: userStatsData?.availableBalance || 0,
    pendingBalance: userStatsData?.pendingBalance || 0,
    withdrawnBalance: userStatsData?.withdrawnBalance || 0,
    bankName: userStatsData?.savedBankName || null,
    accountNumber: userStatsData?.savedAccountNumber || null,
    accountHolderName: userStatsData?.savedAccountName || null,
  };

  const allTransactions = [
    ...sales.map((t) => ({ ...t, type: "sale" as const })),
    ...purchases.map((t) => ({ ...t, type: "purchase" as const })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <DashboardLayout
      activeTab="wallet"
      wishlistCount={wishlistItems.length}
      notifications={notifications}
    >
      <Suspense fallback={<WalletSkeleton />}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl font-bold mb-2">Wallet & Withdrawals</h1>
          <p className="text-xs text-muted-foreground mb-6">
            <i>
              *Platform fee: 5% • Holding: 3 days • Min withdrawal: Rp 50,000
            </i>
          </p>

          <WalletClient
            userStats={userStats}
            withdrawals={withdrawals}
            allTransactions={allTransactions}
            activeListingsCount={listings.length}
          />
        </div>
      </Suspense>
    </DashboardLayout>
  );
}
