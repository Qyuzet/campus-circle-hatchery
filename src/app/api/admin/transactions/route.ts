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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";
    const itemType = searchParams.get("itemType") || "";
    const search = searchParams.get("search") || "";
    const dateRange = searchParams.get("dateRange") || "30";

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (itemType) {
      where.itemType = itemType;
    }

    if (search) {
      where.OR = [
        { orderId: { contains: search, mode: "insensitive" } },
        { itemTitle: { contains: search, mode: "insensitive" } },
      ];
    }

    if (dateRange !== "all") {
      const days = parseInt(dateRange);
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);
      where.createdAt = { gte: dateFrom };
    }

    const [transactions, total, stats] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              studentId: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              studentId: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
      prisma.transaction.groupBy({
        by: ["status"],
        where,
        _count: {
          id: true,
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      transactions,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Admin transactions error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

