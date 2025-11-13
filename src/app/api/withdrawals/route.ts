// Withdrawals API - Create and list withdrawal requests
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/withdrawals - Get user's withdrawal history
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    // Get withdrawals
    const withdrawals = await prisma.withdrawal.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      withdrawals,
    });
  } catch (error: any) {
    console.error("Get withdrawals error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/withdrawals - Create withdrawal request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      amount,
      paymentMethod,
      accountNumber,
      accountName,
      bankName,
      notes,
    } = body;

    // Validate input
    if (!amount || !paymentMethod || !accountNumber || !accountName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate amount
    const withdrawalAmount = parseInt(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid withdrawal amount" },
        { status: 400 }
      );
    }

    // Minimum withdrawal amount (Rp 50,000)
    const MIN_WITHDRAWAL = 50000;
    if (withdrawalAmount < MIN_WITHDRAWAL) {
      return NextResponse.json(
        {
          error: `Minimum withdrawal amount is Rp ${MIN_WITHDRAWAL.toLocaleString()}`,
        },
        { status: 400 }
      );
    }

    // Get user stats
    const userStats = await prisma.userStats.findUnique({
      where: { userId: session.user.id },
    });

    if (!userStats) {
      return NextResponse.json(
        { error: "User stats not found" },
        { status: 404 }
      );
    }

    // Check if user has sufficient balance
    if (userStats.availableBalance < withdrawalAmount) {
      return NextResponse.json(
        {
          error: `Insufficient balance. Available: Rp ${userStats.availableBalance.toLocaleString()}`,
        },
        { status: 400 }
      );
    }

    // Check for pending withdrawals
    const pendingWithdrawals = await prisma.withdrawal.findMany({
      where: {
        userId: session.user.id,
        status: {
          in: ["PENDING", "APPROVED", "PROCESSING"],
        },
      },
    });

    if (pendingWithdrawals.length > 0) {
      return NextResponse.json(
        {
          error:
            "You have a pending withdrawal request. Please wait for it to be processed.",
        },
        { status: 400 }
      );
    }

    // Create withdrawal request in a transaction
    const withdrawal = await prisma.$transaction(async (tx) => {
      // Deduct from available balance
      await tx.userStats.update({
        where: { userId: session.user.id },
        data: {
          availableBalance: {
            decrement: withdrawalAmount,
          },
        },
      });

      // Create withdrawal record
      return tx.withdrawal.create({
        data: {
          userId: session.user.id,
          amount: withdrawalAmount,
          paymentMethod,
          accountNumber,
          accountName,
          bankName: bankName || null,
          notes,
          status: "PENDING",
        },
      });
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "system",
        title: "Withdrawal Request Submitted",
        message: `Your withdrawal request for Rp ${withdrawalAmount.toLocaleString()} has been submitted and is pending approval.`,
      },
    });

    return NextResponse.json({
      success: true,
      withdrawal,
      message: "Withdrawal request submitted successfully",
    });
  } catch (error: any) {
    console.error("Create withdrawal error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
