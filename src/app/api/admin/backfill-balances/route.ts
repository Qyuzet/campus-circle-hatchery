// Backfill balance data from existing transactions
// Call this endpoint once to populate balance fields for existing users

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (allow for auto-sync in wallet tab for now)
    // In production, you may want to restrict this to admin only
    // const user = await prisma.user.findUnique({
    //   where: { email: session.user.email },
    //   select: { role: true },
    // });
    // if (!user || user.role !== "admin") {
    //   return NextResponse.json(
    //     { error: "Forbidden. Admin access required." },
    //     { status: 403 }
    //   );
    // }

    console.log("🔄 Starting balance backfill...");

    // Get all completed transactions
    const completedTransactions = await prisma.transaction.findMany({
      where: {
        status: "COMPLETED",
        itemType: "marketplace",
      },
      include: {
        item: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    console.log(
      `📊 Found ${completedTransactions.length} completed transactions`
    );

    // Group transactions by seller
    const sellerTransactions = new Map<string, any[]>();

    for (const transaction of completedTransactions) {
      if (transaction.item?.sellerId) {
        const sellerId = transaction.item.sellerId;
        if (!sellerTransactions.has(sellerId)) {
          sellerTransactions.set(sellerId, []);
        }
        sellerTransactions.get(sellerId)!.push(transaction);
      }
    }

    console.log(`👥 Processing ${sellerTransactions.size} sellers...`);

    const results = [];

    // Process each seller
    for (const [sellerId, transactions] of sellerTransactions.entries()) {
      let totalEarnings = 0;
      let pendingBalance = 0;
      let availableBalance = 0;

      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

      for (const transaction of transactions) {
        // Calculate platform fee (5%)
        const platformFee = Math.floor(transaction.amount * 0.05);
        const sellerEarnings = transaction.amount - platformFee;

        totalEarnings += sellerEarnings;

        // Check if transaction is older than 3 days
        const transactionDate = new Date(transaction.createdAt);
        if (transactionDate < threeDaysAgo) {
          // Old enough - add to available balance
          availableBalance += sellerEarnings;
        } else {
          // Still in holding period - add to pending balance
          pendingBalance += sellerEarnings;
        }
      }

      // Update or create user stats
      await prisma.userStats.upsert({
        where: { userId: sellerId },
        update: {
          totalEarnings,
          availableBalance,
          pendingBalance,
          withdrawnBalance: 0, // No withdrawals yet
        },
        create: {
          userId: sellerId,
          totalEarnings,
          availableBalance,
          pendingBalance,
          withdrawnBalance: 0,
          itemsSold: transactions.length,
          itemsBought: 0,
          totalSpent: 0,
          messagesCount: 0,
          tutoringSessions: 0,
          reviewsGiven: 0,
          reviewsReceived: 0,
        },
      });

      results.push({
        sellerId,
        transactionCount: transactions.length,
        totalEarnings,
        availableBalance,
        pendingBalance,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Balance backfill completed successfully",
      summary: {
        totalTransactions: completedTransactions.length,
        sellersUpdated: sellerTransactions.size,
      },
      results,
    });
  } catch (error: any) {
    console.error("Backfill error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
