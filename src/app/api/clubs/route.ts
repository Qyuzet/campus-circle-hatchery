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
      memberCount: club.memberCount + club._count.members,
      initialMemberCount: club.memberCount,
      actualMemberCount: club._count.members,
      isOpenForRegistration: club.isOpenForRegistration,
      registrationStartDate: club.registrationStartDate,
      registrationEndDate: club.registrationEndDate,
      registrationLink: club.registrationLink,
      websiteUrl: club.websiteUrl,
      joinMode: club.joinMode,
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
    const {
      name,
      description,
      logoUrl,
      category,
      memberCount,
      isOpenForRegistration,
      registrationStartDate,
      registrationEndDate,
      registrationLink,
      websiteUrl,
      joinMode,
    } = body;

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
        memberCount: memberCount || 0,
        isOpenForRegistration:
          isOpenForRegistration !== undefined ? isOpenForRegistration : true,
        registrationStartDate: registrationStartDate
          ? new Date(registrationStartDate)
          : null,
        registrationEndDate: registrationEndDate
          ? new Date(registrationEndDate)
          : null,
        registrationLink: registrationLink || null,
        websiteUrl: websiteUrl || null,
        joinMode: joinMode || "DIRECT",
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
