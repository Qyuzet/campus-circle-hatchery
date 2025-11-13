// Cron Job - Release pending balances after holding period
// This should be called daily via a cron service (e.g., Vercel Cron, GitHub Actions)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "your-secret-key";

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all completed transactions older than 3 days
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

    // Process each transaction
    for (const transaction of oldTransactions) {
      if (!transaction.item) continue;

      const sellerId = transaction.item.sellerId;

      // Calculate seller earnings (after 5% platform fee)
      const platformFee = Math.floor(transaction.amount * 0.05);
      const sellerEarnings = transaction.amount - platformFee;

      // Get current user stats
      const userStats = await prisma.userStats.findUnique({
        where: { userId: sellerId },
      });

      if (!userStats) continue;

      // Check if this amount is still in pending balance
      if (userStats.pendingBalance >= sellerEarnings) {
        // Move from pending to available
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

        // Create notification
        await prisma.notification.create({
          data: {
            userId: sellerId,
            type: "system",
            title: "💰 Balance Available",
            message: `Rp ${sellerEarnings.toLocaleString()} from your sale is now available for withdrawal!`,
          },
        });

        releasedCount++;
        totalReleased += sellerEarnings;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Released ${releasedCount} pending balances`,
      totalReleased,
      processedTransactions: oldTransactions.length,
    });
  } catch (error: any) {
    console.error("Release balances error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

