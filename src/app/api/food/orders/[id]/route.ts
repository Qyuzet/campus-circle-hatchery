import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

    const order = await prisma.foodOrder.findUnique({
      where: { id: params.id },
      include: {
        foodItem: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.buyerId !== user.id && order.foodItem.sellerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "confirmed", "picked_up", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (status === "cancelled" && order.status !== "pending") {
      return NextResponse.json(
        { error: "Can only cancel pending orders" },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.foodOrder.update({
      where: { id: params.id },
      data: { status },
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

    if (status === "cancelled") {
      await prisma.foodItem.update({
        where: { id: order.foodItemId },
        data: {
          quantity: { increment: order.quantity },
          status: "available",
        },
      });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating food order:", error);
    return NextResponse.json(
      { error: "Failed to update food order" },
      { status: 500 }
    );
  }
}
