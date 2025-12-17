import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      include: {
        item: {
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
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(wishlistItems);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: "itemId is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingWishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_itemId: {
          userId: user.id,
          itemId: itemId,
        },
      },
    });

    if (existingWishlistItem) {
      await prisma.wishlistItem.delete({
        where: { id: existingWishlistItem.id },
      });
      return NextResponse.json({ action: "removed", wishlisted: false });
    } else {
      await prisma.wishlistItem.create({
        data: {
          userId: user.id,
          itemId: itemId,
        },
      });
      return NextResponse.json({ action: "added", wishlisted: true });
    }
  } catch (error) {
    console.error("Error toggling wishlist:", error);
    return NextResponse.json(
      { error: "Failed to toggle wishlist" },
      { status: 500 }
    );
  }
}

