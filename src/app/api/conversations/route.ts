// Conversations API Routes - GET (list) and POST (create)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/conversations - List all conversations for current user
export async function GET(request: NextRequest) {
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

    // Get all conversations where user is either user1 or user2
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: user.id }, { user2Id: user.id }],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            studentId: true,
            avatarUrl: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            studentId: true,
            avatarUrl: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                receiverId: user.id,
                isRead: false,
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageTime: "desc",
      },
    });

    // Transform conversations to include other user info and unread count
    const transformedConversations = conversations.map((conv) => {
      const otherUser = conv.user1Id === user.id ? conv.user2 : conv.user1;

      return {
        id: conv.id,
        otherUserId: otherUser.id,
        otherUserName: otherUser.name,
        otherUserAvatar: otherUser.avatarUrl,
        lastMessage: conv.lastMessage,
        lastMessageTime: conv.lastMessageTime,
        unreadCount: conv._count.messages,
      };
    });

    return NextResponse.json(transformedConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create new conversation
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { otherUserId } = body;

    if (!otherUserId) {
      return NextResponse.json(
        { error: "otherUserId is required" },
        { status: 400 }
      );
    }

    // Get current user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if other user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
    });

    if (!otherUser) {
      return NextResponse.json(
        { error: "Other user not found" },
        { status: 404 }
      );
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: user.id, user2Id: otherUserId },
          { user1Id: otherUserId, user2Id: user.id },
        ],
      },
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        user1Id: user.id,
        user2Id: otherUserId,
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            studentId: true,
            avatarUrl: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            studentId: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
