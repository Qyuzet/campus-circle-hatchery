import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { triggerNewMessage } from "@/lib/pusher";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;
    const messageId = params.id;

    if (!action || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'accept' or 'reject'" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const originalMessage = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!originalMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (originalMessage.receiverId !== user.id) {
      return NextResponse.json(
        { error: "You are not the recipient of this order request" },
        { status: 403 }
      );
    }

    if (originalMessage.messageType !== "order_request") {
      return NextResponse.json(
        { error: "This message is not an order request" },
        { status: 400 }
      );
    }

    const orderData = originalMessage.orderData as any;

    if (orderData?.status !== "pending") {
      return NextResponse.json(
        { error: "This order request has already been responded to" },
        { status: 400 }
      );
    }

    const updatedOriginalMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        orderData: {
          ...orderData,
          status: action === "accept" ? "accepted" : "rejected",
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Trigger Pusher event to update the original message in UI
    await triggerNewMessage(
      originalMessage.conversationId,
      updatedOriginalMessage
    );

    let responseMessage;

    if (action === "accept") {
      responseMessage = await prisma.message.create({
        data: {
          content: `Order accepted! Please proceed with payment.`,
          senderId: user.id,
          receiverId: originalMessage.senderId,
          conversationId: originalMessage.conversationId,
          messageType: "payment_request",
          orderData: {
            ...orderData,
            status: "awaiting_payment",
            originalMessageId: messageId,
          },
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });
    } else {
      responseMessage = await prisma.message.create({
        data: {
          content: `Order request declined.`,
          senderId: user.id,
          receiverId: originalMessage.senderId,
          conversationId: originalMessage.conversationId,
          messageType: "text",
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });
    }

    await prisma.conversation.update({
      where: { id: originalMessage.conversationId },
      data: {
        lastMessage: responseMessage.content,
        lastMessageTime: new Date(),
      },
    });

    await prisma.notification.create({
      data: {
        userId: originalMessage.senderId,
        type: "message",
        title: action === "accept" ? "Order Accepted" : "Order Declined",
        message:
          action === "accept"
            ? `${user.name} accepted your order request`
            : `${user.name} declined your order request`,
      },
    });

    await triggerNewMessage(originalMessage.conversationId, responseMessage);

    return NextResponse.json(responseMessage, { status: 201 });
  } catch (error) {
    console.error("Error responding to order request:", error);
    return NextResponse.json(
      { error: "Failed to respond to order request" },
      { status: 500 }
    );
  }
}
