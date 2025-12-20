// Payment Creation API - Create Midtrans payment transaction
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createTransaction,
  generateOrderId,
  MidtransTransactionParams,
} from "@/lib/midtrans";

// POST /api/payment/create - Create a new payment transaction
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, itemType, amount, itemTitle } = body;

    // Validate required fields
    if (!itemId || !itemType || !amount || !itemTitle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate item type
    if (!["marketplace", "tutoring", "food"].includes(itemType)) {
      return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
    }

    // Verify item exists and get details
    let item: any = null;
    let sellerId: string | null = null;

    if (itemType === "marketplace") {
      item = await prisma.marketplaceItem.findUnique({
        where: { id: itemId },
        include: { seller: true },
      });

      if (!item) {
        return NextResponse.json(
          { error: "Marketplace item not found" },
          { status: 404 }
        );
      }

      // Check if item is available
      if (item.status !== "available") {
        return NextResponse.json(
          { error: "Item is not available" },
          { status: 400 }
        );
      }

      // Prevent buying own item
      if (item.sellerId === session.user.id) {
        return NextResponse.json(
          { error: "Cannot buy your own item" },
          { status: 400 }
        );
      }

      sellerId = item.sellerId;
    } else if (itemType === "tutoring") {
      item = await prisma.tutoringSession.findUnique({
        where: { id: itemId },
        include: { tutor: true },
      });

      if (!item) {
        return NextResponse.json(
          { error: "Tutoring session not found" },
          { status: 404 }
        );
      }

      // Check if session is available
      if (item.status !== "available") {
        return NextResponse.json(
          { error: "Session is not available" },
          { status: 400 }
        );
      }

      // Prevent booking own session
      if (item.tutorId === session.user.id) {
        return NextResponse.json(
          { error: "Cannot book your own tutoring session" },
          { status: 400 }
        );
      }

      sellerId = item.tutorId;
    } else if (itemType === "food") {
      item = await prisma.foodItem.findUnique({
        where: { id: itemId },
        include: { seller: true },
      });

      if (!item) {
        return NextResponse.json(
          { error: "Food item not found" },
          { status: 404 }
        );
      }

      // Check if item is available
      if (item.status !== "available") {
        return NextResponse.json(
          { error: "Food item is not available" },
          { status: 400 }
        );
      }

      // Prevent buying own item
      if (item.sellerId === session.user.id) {
        return NextResponse.json(
          { error: "Cannot buy your own food item" },
          { status: 400 }
        );
      }

      sellerId = item.sellerId;
    }

    // Generate unique order ID
    const orderId = generateOrderId(itemType.toUpperCase());

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare Midtrans transaction parameters
    const transactionParams: MidtransTransactionParams = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      item_details: [
        {
          id: itemId,
          price: amount,
          quantity: 1,
          name: itemTitle,
        },
      ],
      customer_details: {
        first_name: user.name || "Student",
        email: user.email,
        phone: user.studentId || undefined,
      },
      callbacks: {
        finish: `${process.env.NEXTAUTH_URL}/payment/success?order_id=${orderId}`,
        error: `${process.env.NEXTAUTH_URL}/payment/error?order_id=${orderId}`,
        pending: `${process.env.NEXTAUTH_URL}/payment/pending?order_id=${orderId}`,
      },
    };

    // Create Midtrans transaction
    const midtransResult = await createTransaction(transactionParams);

    if (!midtransResult.success) {
      return NextResponse.json(
        { error: midtransResult.error || "Failed to create payment" },
        { status: 500 }
      );
    }

    // Calculate expiry time (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Save transaction to database
    const transaction = await prisma.transaction.create({
      data: {
        orderId,
        amount,
        status: "PENDING",
        paymentProvider: "midtrans",
        snapToken: midtransResult.token,
        snapUrl: midtransResult.redirect_url,
        itemType,
        itemTitle,
        buyerId: session.user.id,
        sellerId,
        itemId: itemType === "marketplace" ? itemId : null,
        foodItemId: itemType === "food" ? itemId : null,
        expiresAt,
      },
    });

    // Return payment details
    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        orderId: transaction.orderId,
        amount: transaction.amount,
        status: transaction.status,
      },
      payment: {
        token: midtransResult.token,
        redirect_url: midtransResult.redirect_url,
      },
    });
  } catch (error: any) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
