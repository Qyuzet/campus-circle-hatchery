// Payment Notification API - Handle Midtrans payment notifications
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySignature, mapTransactionStatus } from "@/lib/midtrans";

// POST /api/payment/notification - Handle Midtrans notification callback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      signature_key,
      transaction_id,
      payment_type,
    } = body;

    console.log("Midtrans notification received:", {
      order_id,
      transaction_status,
      fraud_status,
    });

    // Verify signature
    const isValid = verifySignature(
      order_id,
      status_code,
      gross_amount,
      signature_key
    );

    if (!isValid) {
      console.error("Invalid signature for order:", order_id);
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Find transaction in database
    const transaction = await prisma.transaction.findUnique({
      where: { orderId: order_id },
      include: {
        item: true,
        buyer: true,
      },
    });

    if (!transaction) {
      console.error("Transaction not found:", order_id);
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Map Midtrans status to our status
    const newStatus = mapTransactionStatus(transaction_status);

    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { orderId: order_id },
      data: {
        status: newStatus,
        transactionId: transaction_id,
        paymentMethod: payment_type,
        fraudStatus: fraud_status,
      },
    });

    // Handle successful payment
    if (newStatus === "COMPLETED") {
      // Update marketplace item status if applicable
      if (transaction.itemType === "marketplace" && transaction.itemId) {
        await prisma.marketplaceItem.update({
          where: { id: transaction.itemId },
          data: { status: "sold" },
        });

        // Update seller stats
        const item = transaction.item;
        if (item) {
          await prisma.userStats.update({
            where: { userId: item.sellerId },
            data: {
              itemsSold: { increment: 1 },
              totalEarnings: { increment: transaction.amount },
            },
          });
        }
      }

      // Update buyer stats
      await prisma.userStats.update({
        where: { userId: transaction.buyerId },
        data: {
          itemsBought: { increment: 1 },
          totalSpent: { increment: transaction.amount },
        },
      });

      // Create notification for seller
      if (transaction.item) {
        await prisma.notification.create({
          data: {
            userId: transaction.item.sellerId,
            type: "sale",
            title: "Item Sold!",
            message: `Your item "${
              transaction.itemTitle
            }" has been sold for Rp ${transaction.amount.toLocaleString()}`,
          },
        });
      }

      // Create notification for buyer
      await prisma.notification.create({
        data: {
          userId: transaction.buyerId,
          type: "purchase",
          title: "🎉 Payment Successful!",
          message: `Your purchase of "${transaction.itemTitle}" has been confirmed. Access it from your Library.`,
        },
      });
    }

    // Handle failed payment
    if (newStatus === "FAILED" || newStatus === "CANCELLED") {
      // Restore item availability if marketplace item
      if (transaction.itemType === "marketplace" && transaction.itemId) {
        await prisma.marketplaceItem.update({
          where: { id: transaction.itemId },
          data: { status: "available" },
        });
      }

      // Create notification for buyer
      await prisma.notification.create({
        data: {
          userId: transaction.buyerId,
          type: "system",
          title: "Payment Failed",
          message: `Your payment for "${
            transaction.itemTitle
          }" was ${newStatus.toLowerCase()}`,
        },
      });
    }

    console.log("Transaction updated:", {
      orderId: order_id,
      status: newStatus,
    });

    return NextResponse.json({
      success: true,
      message: "Notification processed",
    });
  } catch (error: any) {
    console.error("Payment notification error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
