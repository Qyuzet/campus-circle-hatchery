import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const foodItem = await prisma.foodItem.findUnique({
      where: { id: params.id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            rating: true,
            email: true,
          },
        },
        reviews: {
          include: {
            user: {
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
        orders: {
          where: {
            status: { in: ["confirmed", "picked_up"] },
          },
        },
      },
    });

    if (!foodItem) {
      return NextResponse.json({ error: "Food item not found" }, { status: 404 });
    }

    await prisma.foodItem.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(foodItem);
  } catch (error) {
    console.error("Error fetching food item:", error);
    return NextResponse.json(
      { error: "Failed to fetch food item" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const foodItem = await prisma.foodItem.findUnique({
      where: { id: params.id },
    });

    if (!foodItem) {
      return NextResponse.json({ error: "Food item not found" }, { status: 404 });
    }

    if (foodItem.sellerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updatedFoodItem = await prisma.foodItem.update({
      where: { id: params.id },
      data: {
        ...body,
        price: body.price ? parseInt(body.price) : undefined,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            rating: true,
          },
        },
      },
    });

    return NextResponse.json(updatedFoodItem);
  } catch (error) {
    console.error("Error updating food item:", error);
    return NextResponse.json(
      { error: "Failed to update food item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const foodItem = await prisma.foodItem.findUnique({
      where: { id: params.id },
    });

    if (!foodItem) {
      return NextResponse.json({ error: "Food item not found" }, { status: 404 });
    }

    if (foodItem.sellerId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.foodItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Food item deleted successfully" });
  } catch (error) {
    console.error("Error deleting food item:", error);
    return NextResponse.json(
      { error: "Failed to delete food item" },
      { status: 500 }
    );
  }
}

