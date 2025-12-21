import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (adminUser?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        userStats: true,
        buyerTransactions: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderId: true,
            itemTitle: true,
            itemType: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
        sellerTransactions: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderId: true,
            itemTitle: true,
            itemType: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
        marketplaceItems: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            createdAt: true,
          },
        },
        foodItems: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            createdAt: true,
          },
        },
        organizedEvents: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            price: true,
            startDate: true,
            createdAt: true,
          },
        },
        tutoringSessions: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            subject: true,
            price: true,
            status: true,
            createdAt: true,
          },
        },
        withdrawals: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            conversationsAsUser1: true,
            conversationsAsUser2: true,
            sentMessages: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const totalRevenue = await prisma.transaction.aggregate({
      where: {
        sellerId: params.id,
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    });

    const totalSpent = await prisma.transaction.aggregate({
      where: {
        buyerId: params.id,
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
      analytics: {
        totalRevenue: totalRevenue._sum.amount || 0,
        totalSpent: totalSpent._sum.amount || 0,
        conversationsCount:
          user._count.conversationsAsUser1 + user._count.conversationsAsUser2,
        messagesCount: user._count.sentMessages,
      },
    });
  } catch (error: any) {
    console.error("Admin user details error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
