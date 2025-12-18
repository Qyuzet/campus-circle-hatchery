import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
      return NextResponse.json(
        { error: "Food item not found" },
        { status: 404 }
      );
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
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const foodItem = await prisma.foodItem.findUnique({
      where: { id: params.id },
    });

    if (!foodItem) {
      return NextResponse.json(
        { error: "Food item not found" },
        { status: 404 }
      );
    }

    if (foodItem.sellerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.price !== undefined) updateData.price = parseInt(body.price);
    if (body.category !== undefined) updateData.category = body.category;
    if (body.foodType !== undefined) updateData.foodType = body.foodType;
    if (body.quantity !== undefined)
      updateData.quantity = parseInt(body.quantity);
    if (body.unit !== undefined) updateData.unit = body.unit;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.allergens !== undefined) updateData.allergens = body.allergens;
    if (body.ingredients !== undefined) {
      updateData.ingredients =
        typeof body.ingredients === "string"
          ? body.ingredients
          : Array.isArray(body.ingredients)
          ? body.ingredients.join(", ")
          : null;
    }
    if (body.expiryDate !== undefined)
      updateData.expiryDate = new Date(body.expiryDate);
    if (body.pickupLocation !== undefined)
      updateData.pickupLocation = body.pickupLocation;
    if (body.pickupTime !== undefined) updateData.pickupTime = body.pickupTime;
    if (body.isHalal !== undefined) updateData.isHalal = body.isHalal;
    if (body.isVegan !== undefined) updateData.isVegan = body.isVegan;
    if (body.isVegetarian !== undefined)
      updateData.isVegetarian = body.isVegetarian;
    if (body.status !== undefined) updateData.status = body.status;

    const updatedFoodItem = await prisma.foodItem.update({
      where: { id: params.id },
      data: updateData,
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
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const foodItem = await prisma.foodItem.findUnique({
      where: { id: params.id },
    });

    if (!foodItem) {
      return NextResponse.json(
        { error: "Food item not found" },
        { status: 404 }
      );
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
