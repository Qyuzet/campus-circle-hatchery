import { prisma } from "@/lib/prisma";
import { WalletTabClient } from "./WalletTabClient";

export async function WalletTab({ userId }: { userId: string }) {
  const [userStats, withdrawals, salesTransactions, purchaseTransactions] =
    await Promise.all([
      prisma.userStats.findUnique({
        where: { userId },
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
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const allTransactions = [
    ...salesTransactions.map((t) => ({ ...t, type: "sale" as const })),
    ...purchaseTransactions.map((t) => ({ ...t, type: "purchase" as const })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <WalletTabClient
      userStats={userStats}
      withdrawals={withdrawals}
      salesTransactions={salesTransactions}
      allTransactions={allTransactions}
    />
  );
}
