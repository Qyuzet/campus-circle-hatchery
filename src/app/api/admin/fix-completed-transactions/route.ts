import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Fixing completed transactions without sellerId...");

    const transactions = await prisma.transaction.findMany({
      where: {
        sellerId: null,
      },
    });

    console.log(
      `Found ${transactions.length} completed transactions without sellerId`
    );

    let updated = 0;
    let skipped = 0;

    for (const transaction of transactions) {
      let sellerId: string | null = null;

      if (transaction.itemType === "marketplace" && transaction.itemId) {
        const item = await prisma.marketplaceItem.findUnique({
          where: { id: transaction.itemId },
          select: { sellerId: true },
        });
        if (item) {
          sellerId = item.sellerId;
        }
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

    console.log(`Fix complete! Updated: ${updated}, Skipped: ${skipped}`);

    return NextResponse.json({
      success: true,
      message: "Fix completed successfully",
      updated,
      skipped,
      total: transactions.length,
    });
  } catch (error: any) {
    console.error("Error during fix:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
