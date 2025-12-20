// Payment Status API - Check payment transaction status
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTransactionStatus } from "@/lib/midtrans";

// GET /api/payment/status?orderId=xxx - Get payment status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Get transaction from database
    const transaction = await prisma.transaction.findUnique({
      where: { orderId },
      include: {
        item: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this transaction
    if (
      transaction.buyerId !== session.user.id &&
      transaction.sellerId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const currentStatus = transaction.status;

    // Check if payment has expired (only for PENDING status)
    if (
      currentStatus === "PENDING" &&
      transaction.expiresAt &&
      new Date() > transaction.expiresAt
    ) {
      // Payment expired, update status to EXPIRED
      const updatedTransaction = await prisma.transaction.update({
        where: { orderId },
        data: {
          status: "EXPIRED",
          updatedAt: new Date(),
        },
        include: {
          item: true,
          buyer: true,
        },
      });

      console.log("Payment expired:", {
        orderId,
        expiresAt: transaction.expiresAt,
        now: new Date(),
      });

      return NextResponse.json({
        success: true,
        transaction: {
          id: updatedTransaction.id,
          orderId: updatedTransaction.orderId,
          amount: updatedTransaction.amount,
          status: "EXPIRED",
          itemTitle: updatedTransaction.itemTitle,
          createdAt: updatedTransaction.createdAt,
          expiresAt: updatedTransaction.expiresAt,
        },
      });
    }

    // Get latest status from Midtrans
    const midtransStatus = await getTransactionStatus(orderId);

    console.log("Midtrans status check:", {
      orderId,
      success: midtransStatus.success,
      data: midtransStatus.data,
    });

    if (midtransStatus.success && midtransStatus.data) {
      // Update local transaction if status changed
      const midtransTransactionStatus = midtransStatus.data.transaction_status;
      const currentStatus = transaction.status;

      console.log("Status comparison:", {
        midtransStatus: midtransTransactionStatus,
        currentStatus,
      });

      // Map Midtrans status
      const statusMap: Record<string, string> = {
        capture: "COMPLETED",
        settlement: "COMPLETED",
        pending: "PENDING",
        deny: "FAILED",
        cancel: "CANCELLED",
        expire: "EXPIRED",
        failure: "FAILED",
      };

      const newStatus = statusMap[midtransTransactionStatus] || "PENDING";

      console.log("Mapped status:", {
        newStatus,
        willUpdate: newStatus !== currentStatus,
      });

      if (newStatus !== currentStatus) {
        await prisma.transaction.update({
          where: { orderId },
          data: {
            status: newStatus,
            transactionId: midtransStatus.data.transaction_id,
            paymentMethod: midtransStatus.data.payment_type,
            fraudStatus: midtransStatus.data.fraud_status,
          },
        });

        console.log("Transaction updated to:", newStatus);

        // Handle food order creation when payment is completed
        if (
          newStatus === "COMPLETED" &&
          transaction.itemType === "food" &&
          transaction.foodItemId
        ) {
          const existingOrder = await prisma.foodOrder.findFirst({
            where: {
              foodItemId: transaction.foodItemId,
              buyerId: transaction.buyerId,
            },
          });

          if (!existingOrder) {
            const foodItem = await prisma.foodItem.findUnique({
              where: { id: transaction.foodItemId },
            });

            if (foodItem) {
              const quantity = 1;
              const totalPrice = transaction.amount;

              await prisma.foodOrder.create({
                data: {
                  foodItemId: foodItem.id,
                  buyerId: transaction.buyerId,
                  quantity: quantity,
                  totalPrice: totalPrice,
                  pickupTime: foodItem.pickupTime,
                  status: "confirmed",
                },
              });

              await prisma.foodItem.update({
                where: { id: foodItem.id },
                data: {
                  quantity: { decrement: quantity },
                  status:
                    foodItem.quantity - quantity <= 0 ? "sold" : "available",
                },
              });

              console.log("Food order created for transaction:", orderId);
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        transaction: {
          ...transaction,
          status: newStatus,
        },
        midtrans: midtransStatus.data,
      });
    }

    // Return local transaction if Midtrans check failed
    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error: any) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
