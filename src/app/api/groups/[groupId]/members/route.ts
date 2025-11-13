import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/groups/[groupId]/members - Add members to group
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

    // Check if user is admin of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
        role: "admin",
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Only admins can add members" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userIds } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "User IDs are required" },
        { status: 400 }
      );
    }

    // Get group details
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Add members
    const newMembers = await prisma.groupMember.createMany({
      data: userIds.map((userId: string) => ({
        groupId,
        userId,
        role: "member",
      })),
      skipDuplicates: true,
    });

    // Create notifications
    await prisma.notification.createMany({
      data: userIds.map((userId: string) => ({
        userId,
        type: "group",
        title: "Added to Group",
        message: `${user.name} added you to ${group.name}`,
      })),
    });

    return NextResponse.json({
      message: `${newMembers.count} member(s) added successfully`,
      count: newMembers.count,
    });
  } catch (error) {
    console.error("Error adding members:", error);
    return NextResponse.json(
      { error: "Failed to add members" },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[groupId]/members - Remove member from group
export async function DELETE(
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
    const { searchParams } = new URL(request.url);
    const memberIdToRemove = searchParams.get("userId");

    if (!memberIdToRemove) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user is admin or removing themselves
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

    // Allow if user is admin or removing themselves
    if (membership.role !== "admin" && memberIdToRemove !== user.id) {
      return NextResponse.json(
        { error: "Only admins can remove other members" },
        { status: 403 }
      );
    }

    // Don't allow removing the creator
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (group?.creatorId === memberIdToRemove) {
      return NextResponse.json(
        { error: "Cannot remove the group creator" },
        { status: 400 }
      );
    }

    await prisma.groupMember.deleteMany({
      where: {
        groupId,
        userId: memberIdToRemove,
      },
    });

    return NextResponse.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
