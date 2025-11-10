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
      transaction.item?.sellerId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get latest status from Midtrans
    const midtransStatus = await getTransactionStatus(orderId);

    if (midtransStatus.success && midtransStatus.data) {
      // Update local transaction if status changed
      const midtransTransactionStatus = midtransStatus.data.transaction_status;
      const currentStatus = transaction.status;

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

