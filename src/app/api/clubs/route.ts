import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clubs = await prisma.club.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    const clubsWithMemberCount = clubs.map((club) => ({
      id: club.id,
      name: club.name,
      description: club.description,
      logoUrl: club.logoUrl,
      category: club.category,
      memberCount: club._count.members,
      createdAt: club.createdAt,
      updatedAt: club.updatedAt,
    }));

    return NextResponse.json(clubsWithMemberCount);
  } catch (error) {
    console.error("Error fetching clubs:", error);
    return NextResponse.json(
      { error: "Failed to fetch clubs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
        { error: "Only admins can create clubs" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, logoUrl, category } = body;

    if (!name || !description || !category) {
      return NextResponse.json(
        { error: "Name, description, and category are required" },
        { status: 400 }
      );
    }

    const club = await prisma.club.create({
      data: {
        name,
        description,
        logoUrl: logoUrl || null,
        category,
      },
    });

    return NextResponse.json(club, { status: 201 });
  } catch (error) {
    console.error("Error creating club:", error);
    return NextResponse.json(
      { error: "Failed to create club" },
      { status: 500 }
    );
  }
}
