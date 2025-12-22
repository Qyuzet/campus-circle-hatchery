import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
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

    const memberships = await prisma.clubMember.findMany({
      where: {
        userId: user.id,
      },
      include: {
        club: {
          include: {
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    const clubs = memberships.map((membership) => ({
      id: membership.club.id,
      name: membership.club.name,
      description: membership.club.description,
      logoUrl: membership.club.logoUrl,
      category: membership.club.category,
      memberCount: membership.club._count.members,
      joinedAt: membership.joinedAt,
      createdAt: membership.club.createdAt,
      updatedAt: membership.club.updatedAt,
    }));

    return NextResponse.json(clubs);
  } catch (error) {
    console.error("Error fetching my clubs:", error);
    return NextResponse.json(
      { error: "Failed to fetch my clubs" },
      { status: 500 }
    );
  }
}
