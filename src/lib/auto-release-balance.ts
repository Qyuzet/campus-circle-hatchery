import { prisma } from "@/lib/prisma";

export async function autoReleaseBalances() {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const oldTransactions = await prisma.transaction.findMany({
      where: {
        status: "COMPLETED",
        createdAt: {
          lte: threeDaysAgo,
        },
      },
      include: {
        item: true,
      },
    });

    let releasedCount = 0;
    let totalReleased = 0;

    for (const transaction of oldTransactions) {
      if (!transaction.item) continue;

      const sellerId = transaction.item.sellerId;
      const platformFee = Math.floor(transaction.amount * 0.05);
      const sellerEarnings = transaction.amount - platformFee;

      const userStats = await prisma.userStats.findUnique({
        where: { userId: sellerId },
      });

      if (!userStats) continue;

      if (userStats.pendingBalance >= sellerEarnings) {
        await prisma.userStats.update({
          where: { userId: sellerId },
          data: {
            pendingBalance: {
              decrement: sellerEarnings,
            },
            availableBalance: {
              increment: sellerEarnings,
            },
          },
        });

        await prisma.notification.create({
          data: {
            userId: sellerId,
            type: "system",
            title: "Balance Available",
            message: `Rp ${sellerEarnings.toLocaleString()} from your sale is now available for withdrawal!`,
          },
        });

        releasedCount++;
        totalReleased += sellerEarnings;
      }
    }

    return {
      success: true,
      releasedCount,
      totalReleased,
    };
  } catch (error) {
    console.error("Auto-release balance error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

