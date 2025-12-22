import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const club = await prisma.club.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const clubWithMemberCount = {
      id: club.id,
      name: club.name,
      description: club.description,
      logoUrl: club.logoUrl,
      category: club.category,
      memberCount: club._count.members,
      createdAt: club.createdAt,
      updatedAt: club.updatedAt,
    };

    return NextResponse.json(clubWithMemberCount);
  } catch (error) {
    console.error("Error fetching club:", error);
    return NextResponse.json(
      { error: "Failed to fetch club" },
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

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can update clubs" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, logoUrl, category } = body;

    const club = await prisma.club.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(category && { category }),
      },
    });

    return NextResponse.json(club);
  } catch (error) {
    console.error("Error updating club:", error);
    return NextResponse.json(
      { error: "Failed to update club" },
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

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can delete clubs" },
        { status: 403 }
      );
    }

    await prisma.club.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Club deleted successfully" });
  } catch (error) {
    console.error("Error deleting club:", error);
    return NextResponse.json(
      { error: "Failed to delete club" },
      { status: 500 }
    );
  }
}
