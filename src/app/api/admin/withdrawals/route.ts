// Admin Withdrawals API - Get all withdrawal requests (admin only)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/withdrawals - Get all withdrawals (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    // Get withdrawals with user info
    const withdrawals = await prisma.withdrawal.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    // Get summary stats
    const stats = await prisma.withdrawal.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      success: true,
      withdrawals,
      stats,
    });
  } catch (error: any) {
    console.error("Get admin withdrawals error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
