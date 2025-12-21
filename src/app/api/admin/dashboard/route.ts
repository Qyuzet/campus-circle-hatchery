import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      todayTransactions,
      weekTransactions,
      monthTransactions,
      totalRevenue,
      pendingRevenue,
      activeMarketplace,
      activeFood,
      activeEvents,
      activeTutoring,
      pendingWithdrawals,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.user.count({
        where: {
          updatedAt: { gte: weekAgo },
        },
      }),

      prisma.transaction.count({
        where: {
          createdAt: { gte: today },
        },
      }),

      prisma.transaction.count({
        where: {
          createdAt: { gte: weekAgo },
        },
      }),

      prisma.transaction.count({
        where: {
          createdAt: { gte: monthAgo },
        },
      }),

      prisma.transaction.aggregate({
        where: {
          status: "COMPLETED",
        },
        _sum: {
          amount: true,
        },
      }),

      prisma.transaction.aggregate({
        where: {
          status: "PENDING",
        },
        _sum: {
          amount: true,
        },
      }),

      prisma.marketplaceItem.count({
        where: {
          status: "available",
        },
      }),

      prisma.foodItem.count({
        where: {
          status: "available",
        },
      }),

      prisma.event.count({
        where: {
          startDate: { gte: now },
        },
      }),

      prisma.tutoringSession.count({
        where: {
          status: "available",
        },
      }),

      prisma.withdrawal.count({
        where: {
          status: "PENDING",
        },
      }),

      prisma.transaction.findMany({
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          orderId: true,
          itemTitle: true,
          itemType: true,
          amount: true,
          status: true,
          createdAt: true,
          buyer: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        transactions: {
          today: todayTransactions,
          week: weekTransactions,
          month: monthTransactions,
        },
        revenue: {
          total: totalRevenue._sum.amount || 0,
          pending: pendingRevenue._sum.amount || 0,
        },
        listings: {
          marketplace: activeMarketplace,
          food: activeFood,
          events: activeEvents,
          tutoring: activeTutoring,
          total: activeMarketplace + activeFood + activeEvents + activeTutoring,
        },
        withdrawals: {
          pending: pendingWithdrawals,
        },
      },
      recentActivity,
    });
  } catch (error: any) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
