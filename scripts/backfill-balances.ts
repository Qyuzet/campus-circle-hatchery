// Backfill balance data from existing transactions
// Run this once to populate balance fields for existing users

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function backfillBalances() {
  console.log("🔄 Starting balance backfill...\n");

  try {
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

    console.log(`📊 Found ${completedTransactions.length} completed transactions\n`);

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

    console.log(`👥 Processing ${sellerTransactions.size} sellers...\n`);

    // Process each seller
    for (const [sellerId, transactions] of sellerTransactions.entries()) {
      console.log(`\n👤 Processing seller: ${sellerId}`);
      console.log(`   Transactions: ${transactions.length}`);

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

      console.log(`   Total Earnings: Rp ${totalEarnings.toLocaleString()}`);
      console.log(`   Available: Rp ${availableBalance.toLocaleString()}`);
      console.log(`   Pending: Rp ${pendingBalance.toLocaleString()}`);

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

      console.log(`   ✅ Updated user stats`);
    }

    console.log("\n\n✅ Balance backfill completed successfully!");
    console.log(`\n📈 Summary:`);
    console.log(`   - Processed ${completedTransactions.length} transactions`);
    console.log(`   - Updated ${sellerTransactions.size} seller accounts`);
  } catch (error) {
    console.error("❌ Error during backfill:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backfill
backfillBalances()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed:", error);
    process.exit(1);
  });

