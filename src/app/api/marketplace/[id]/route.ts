// Marketplace Item API Routes - GET, PUT, DELETE individual item
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/marketplace/[id] - Get single marketplace item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.marketplaceItem.findUnique({
      where: { id: params.id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            studentId: true,
            faculty: true,
            major: true,
            rating: true,
            totalSales: true,
            avatarUrl: true,
          },
        },
        reviews: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Increment view count
    await prisma.marketplaceItem.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching marketplace item:", error);
    return NextResponse.json(
      { error: "Failed to fetch marketplace item" },
      { status: 500 }
    );
  }
}

// PUT /api/marketplace/[id] - Update marketplace item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if item exists and user is the seller
    const existingItem = await prisma.marketplaceItem.findUnique({
      where: { id: params.id },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (existingItem.sellerId !== user.id) {
      return NextResponse.json(
        { error: "You can only update your own items" },
        { status: 403 }
      );
    }

    // Update item
    const updatedItem = await prisma.marketplaceItem.update({
      where: { id: params.id },
      data: {
        ...body,
        price: body.price ? parseInt(body.price) : undefined,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            studentId: true,
            rating: true,
            totalSales: true,
          },
        },
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating marketplace item:", error);
    return NextResponse.json(
      { error: "Failed to update marketplace item" },
      { status: 500 }
    );
  }
}

// DELETE /api/marketplace/[id] - Delete marketplace item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if item exists and user is the seller
    const existingItem = await prisma.marketplaceItem.findUnique({
      where: { id: params.id },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (existingItem.sellerId !== user.id) {
      return NextResponse.json(
        { error: "You can only delete your own items" },
        { status: 403 }
      );
    }

    console.log(
      `🗑️ Deleting marketplace item from database: ${params.id} - "${existingItem.title}"`
    );

    // Delete item from database (cascade will delete related reviews and transactions)
    await prisma.marketplaceItem.delete({
      where: { id: params.id },
    });

    console.log(`✅ Successfully deleted item ${params.id} from database`);

    return NextResponse.json({
      message: "Item deleted successfully from database",
      deletedItemId: params.id,
      deletedItemTitle: existingItem.title,
    });
  } catch (error) {
    console.error("❌ Error deleting marketplace item from database:", error);
    return NextResponse.json(
      { error: "Failed to delete marketplace item from database" },
      { status: 500 }
    );
  }
}
