// Transactions API - List user transactions
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/transactions - Get user's transactions
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "purchases" or "sales"
    const status = searchParams.get("status");
    const itemType = searchParams.get("itemType"); // "marketplace" or "tutoring"

    // Build where clause
    const where: any = {};

    if (type === "purchases") {
      where.buyerId = session.user.id;
    } else if (type === "sales") {
      where.sellerId = session.user.id;
    } else {
      // Get both purchases and sales
      where.OR = [{ buyerId: session.user.id }, { sellerId: session.user.id }];
    }

    if (status) {
      where.status = status;
    }

    if (itemType) {
      where.itemType = itemType;
    }

    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        item: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
                studentId: true,
              },
            },
          },
        },
        buyer: {
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
    });

    // Add role to each transaction (buyer or seller)
    const transactionsWithRole = transactions.map((t) => ({
      ...t,
      userRole: t.buyerId === session.user.id ? "buyer" : "seller",
    }));

    return NextResponse.json({
      success: true,
      transactions: transactionsWithRole,
    });
  } catch (error: any) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
