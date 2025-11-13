import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { triggerGroupMessage } from "@/lib/pusher";

// GET /api/groups/[groupId]/messages - Get group messages
export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
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

    const { groupId } = params;

    // Check if user is a member of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 }
      );
    }

    const messages = await prisma.groupMessage.findMany({
      where: { groupId },
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

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching group messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST /api/groups/[groupId]/messages - Send group message
export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
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

    const { groupId } = params;

    // Check if user is a member of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Create message
    const message = await prisma.groupMessage.create({
      data: {
        content: content.trim(),
        groupId,
        senderId: user.id,
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

    // Update group's updatedAt timestamp
    await prisma.group.update({
      where: { id: groupId },
      data: { updatedAt: new Date() },
    });

    // Get all group members except sender for notifications
    const members = await prisma.groupMember.findMany({
      where: {
        groupId,
        userId: {
          not: user.id,
        },
      },
      include: {
        user: true,
      },
    });

    // Get group details
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    // Create notifications for other members
    if (members.length > 0 && group) {
      await prisma.notification.createMany({
        data: members.map((member) => ({
          userId: member.userId,
          type: "message",
          title: "New Group Message",
          message: `${user.name} sent a message in ${group.name}`,
        })),
      });
    }

    // Trigger real-time event via Pusher
    await triggerGroupMessage(groupId, message);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending group message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
