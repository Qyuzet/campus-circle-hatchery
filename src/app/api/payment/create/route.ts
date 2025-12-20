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
    const { itemId, itemType, amount: rawAmount, itemTitle } = body;

    // Validate required fields
    if (!itemId || !itemType || !rawAmount || !itemTitle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure amount is an integer (Midtrans requires integer for IDR)
    const amount = Math.round(Number(rawAmount));

    // Validate amount (minimum Rp 1)
    if (amount < 1) {
      return NextResponse.json(
        { error: "Amount must be at least Rp 1" },
        { status: 400 }
      );
    }

    // Validate item type
    if (!["marketplace", "tutoring", "food", "event"].includes(itemType)) {
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
    } else if (itemType === "event") {
      const event = await prisma.event.findUnique({
        where: { id: itemId },
      });

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      if (!event.isPublished) {
        return NextResponse.json(
          { error: "Event is not published yet" },
          { status: 400 }
        );
      }

      if (event.status === "completed" || event.status === "cancelled") {
        return NextResponse.json(
          { error: "Cannot register for this event" },
          { status: 400 }
        );
      }

      if (
        event.registrationDeadline &&
        new Date() > event.registrationDeadline
      ) {
        return NextResponse.json(
          { error: "Registration deadline has passed" },
          { status: 400 }
        );
      }

      if (
        event.maxParticipants &&
        event.currentParticipants >= event.maxParticipants
      ) {
        return NextResponse.json({ error: "Event is full" }, { status: 400 });
      }

      const existingParticipant = await prisma.eventParticipant.findUnique({
        where: {
          eventId_userId: {
            eventId: itemId,
            userId: session.user.id,
          },
        },
      });

      if (existingParticipant) {
        return NextResponse.json(
          { error: "You are already registered for this event" },
          { status: 400 }
        );
      }

      sellerId = event.organizerId;
      item = event;
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
    // Midtrans has a 50 character limit for item names
    const truncatedTitle =
      itemTitle.length > 50 ? itemTitle.substring(0, 47) + "..." : itemTitle;

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
          name: truncatedTitle,
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
        eventId: itemType === "event" ? itemId : null,
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
