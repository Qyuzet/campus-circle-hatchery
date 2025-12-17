// Download Tracking API Route
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/download - Track file download
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has purchased this item
    const transaction = await prisma.transaction.findFirst({
      where: {
        itemId: itemId,
        buyerId: user.id,
        status: "COMPLETED",
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "You must purchase this item to download it" },
        { status: 403 }
      );
    }

    // Increment download count
    await prisma.marketplaceItem.update({
      where: { id: itemId },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Download tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track download" },
      { status: 500 }
    );
  }
}
