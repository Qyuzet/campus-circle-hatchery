// Messages API Routes - GET (list) and POST (send)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { triggerNewMessage } from "@/lib/pusher";

// GET /api/messages?conversationId=xxx - Get messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (conversation.user1Id !== user.id && conversation.user2Id !== user.id) {
      return NextResponse.json(
        { error: "You are not part of this conversation" },
        { status: 403 }
      );
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send a new message
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, content } = body;

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: "conversationId and content are required" },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify conversation exists and get receiver
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (conversation.user1Id !== user.id && conversation.user2Id !== user.id) {
      return NextResponse.json(
        { error: "You are not part of this conversation" },
        { status: 403 }
      );
    }

    // Determine receiver
    const receiverId =
      conversation.user1Id === user.id
        ? conversation.user2Id
        : conversation.user1Id;

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: user.id,
        receiverId,
        conversationId,
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

    // Update conversation last message
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content,
        lastMessageTime: new Date(),
      },
    });

    // Update user stats
    await prisma.userStats.upsert({
      where: { userId: user.id },
      update: {
        messagesCount: { increment: 1 },
      },
      create: {
        userId: user.id,
        messagesCount: 1,
      },
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: "message",
        title: "New Message",
        message: `${user.name} sent you a message`,
      },
    });

    // Trigger real-time event via Pusher
    await triggerNewMessage(conversationId, message);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
