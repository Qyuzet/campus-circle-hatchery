import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");

    let where: any = {};

    if (type === "purchases") {
      where.buyerId = user.id;
    } else if (type === "sales") {
      where.foodItem = {
        sellerId: user.id,
      };
    } else {
      where.OR = [
        { buyerId: user.id },
        { foodItem: { sellerId: user.id } },
      ];
    }

    const orders = await prisma.foodOrder.findMany({
      where,
      include: {
        foodItem: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching food orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch food orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { foodItemId, quantity, pickupTime } = body;

    if (!foodItemId || !quantity || !pickupTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const foodItem = await prisma.foodItem.findUnique({
      where: { id: foodItemId },
    });

    if (!foodItem) {
      return NextResponse.json({ error: "Food item not found" }, { status: 404 });
    }

    if (foodItem.status !== "available") {
      return NextResponse.json(
        { error: "Food item is not available" },
        { status: 400 }
      );
    }

    if (foodItem.quantity < quantity) {
      return NextResponse.json(
        { error: "Insufficient quantity available" },
        { status: 400 }
      );
    }

    if (foodItem.sellerId === user.id) {
      return NextResponse.json(
        { error: "Cannot order your own food item" },
        { status: 400 }
      );
    }

    const totalPrice = foodItem.price * quantity;

    const order = await prisma.foodOrder.create({
      data: {
        foodItemId,
        buyerId: user.id,
        quantity,
        totalPrice,
        pickupTime,
      },
      include: {
        foodItem: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    await prisma.foodItem.update({
      where: { id: foodItemId },
      data: {
        quantity: { decrement: quantity },
        status: foodItem.quantity - quantity === 0 ? "sold" : "available",
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating food order:", error);
    return NextResponse.json(
      { error: "Failed to create food order" },
      { status: 500 }
    );
  }
}

