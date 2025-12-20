import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function backfillTransactionSellerId() {
  console.log("Starting to backfill sellerId for existing transactions...");

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        sellerId: null,
      },
      include: {
        item: true,
      },
    });

    console.log(`Found ${transactions.length} transactions without sellerId`);

    let updated = 0;
    let skipped = 0;

    for (const transaction of transactions) {
      let sellerId: string | null = null;

      if (transaction.itemType === "marketplace" && transaction.item) {
        sellerId = transaction.item.sellerId;
      } else if (transaction.itemType === "food") {
        const foodItem = await prisma.foodItem.findFirst({
          where: {
            title: transaction.itemTitle,
          },
          select: {
            sellerId: true,
          },
        });
        if (foodItem) {
          sellerId = foodItem.sellerId;
        }
      } else if (transaction.itemType === "event") {
        const event = await prisma.event.findFirst({
          where: {
            title: transaction.itemTitle,
          },
          select: {
            organizerId: true,
          },
        });
        if (event) {
          sellerId = event.organizerId;
        }
      } else if (transaction.itemType === "tutoring") {
        const tutoringSession = await prisma.tutoringSession.findFirst({
          where: {
            subject: transaction.itemTitle,
          },
          select: {
            tutorId: true,
          },
        });
        if (tutoringSession) {
          sellerId = tutoringSession.tutorId;
        }
      }

      if (sellerId) {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { sellerId },
        });
        updated++;
        console.log(
          `Updated transaction ${transaction.orderId} with sellerId ${sellerId}`
        );
      } else {
        skipped++;
        console.log(
          `Skipped transaction ${transaction.orderId} - could not find seller`
        );
      }
    }

    console.log(`\nBackfill complete!`);
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);
  } catch (error) {
    console.error("Error during backfill:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

backfillTransactionSellerId()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });

