// Withdrawal Update API - Update withdrawal status (admin only)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/withdrawals/[id] - Update withdrawal status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, rejectionReason, irisReferenceNo } = body;

    // Validate status
    const validStatuses = [
      "PENDING",
      "APPROVED",
      "PROCESSING",
      "COMPLETED",
      "REJECTED",
      "FAILED",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Get withdrawal
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: params.id },
      include: {
        user: true,
      },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { error: "Withdrawal not found" },
        { status: 404 }
      );
    }

    // Update withdrawal
    const updatedWithdrawal = await prisma.$transaction(async (tx) => {
      // If rejecting, return money to available balance
      if (status === "REJECTED" || status === "FAILED") {
        await tx.userStats.update({
          where: { userId: withdrawal.userId },
          data: {
            availableBalance: {
              increment: withdrawal.amount,
            },
          },
        });
      }

      // If completing, update withdrawn balance
      if (status === "COMPLETED") {
        await tx.userStats.update({
          where: { userId: withdrawal.userId },
          data: {
            withdrawnBalance: {
              increment: withdrawal.amount,
            },
          },
        });
      }

      // Update withdrawal record
      return tx.withdrawal.update({
        where: { id: params.id },
        data: {
          status,
          rejectionReason: status === "REJECTED" ? rejectionReason : undefined,
          irisReferenceNo,
          processedBy: session.user.id,
          processedAt: new Date(),
        },
      });
    });

    // Create notification for user
    let notificationMessage = "";
    let notificationTitle = "";

    switch (status) {
      case "APPROVED":
        notificationTitle = "Withdrawal Approved";
        notificationMessage = `Your withdrawal request for Rp ${withdrawal.amount.toLocaleString()} has been approved and is being processed.`;
        break;
      case "COMPLETED":
        notificationTitle = "💰 Withdrawal Completed";
        notificationMessage = `Your withdrawal of Rp ${withdrawal.amount.toLocaleString()} has been successfully transferred to your bank account.`;
        break;
      case "REJECTED":
        notificationTitle = "Withdrawal Rejected";
        notificationMessage = `Your withdrawal request for Rp ${withdrawal.amount.toLocaleString()} has been rejected. ${
          rejectionReason || ""
        }`;
        break;
      case "FAILED":
        notificationTitle = "Withdrawal Failed";
        notificationMessage = `Your withdrawal request for Rp ${withdrawal.amount.toLocaleString()} has failed. The amount has been returned to your balance.`;
        break;
    }

    if (notificationMessage) {
      await prisma.notification.create({
        data: {
          userId: withdrawal.userId,
          type: "system",
          title: notificationTitle,
          message: notificationMessage,
        },
      });
    }

    return NextResponse.json({
      success: true,
      withdrawal: updatedWithdrawal,
      message: `Withdrawal ${status.toLowerCase()} successfully`,
    });
  } catch (error: any) {
    console.error("Update withdrawal error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/withdrawals/[id] - Get single withdrawal
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
          },
        },
      },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { error: "Withdrawal not found" },
        { status: 404 }
      );
    }

    // Check if user owns this withdrawal (or is admin)
    if (withdrawal.userId !== session.user.id) {
      // TODO: Add admin check here
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      withdrawal,
    });
  } catch (error: any) {
    console.error("Get withdrawal error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
