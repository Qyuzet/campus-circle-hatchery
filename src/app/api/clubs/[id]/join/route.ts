import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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

    const isProfileComplete =
      user.fullName &&
      user.phoneNumber &&
      user.address &&
      user.university &&
      user.major;

    if (!isProfileComplete) {
      return NextResponse.json(
        { error: "Please complete your profile before joining a club" },
        { status: 400 }
      );
    }

    const club = await prisma.club.findUnique({
      where: { id: params.id },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    if (!club.isOpenForRegistration) {
      return NextResponse.json(
        { error: "This club is not currently accepting new members" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (
      club.registrationStartDate &&
      now < new Date(club.registrationStartDate)
    ) {
      return NextResponse.json(
        {
          error: `Registration opens on ${new Date(
            club.registrationStartDate
          ).toLocaleDateString()}`,
        },
        { status: 400 }
      );
    }

    if (club.registrationEndDate && now > new Date(club.registrationEndDate)) {
      return NextResponse.json(
        { error: "Registration period has ended" },
        { status: 400 }
      );
    }

    const existingMembership = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId: params.id,
          userId: user.id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "Already a member of this club" },
        { status: 400 }
      );
    }

    const membership = await prisma.clubMember.create({
      data: {
        clubId: params.id,
        userId: user.id,
      },
    });

    await prisma.club.update({
      where: { id: params.id },
      data: {
        memberCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(membership, { status: 201 });
  } catch (error) {
    console.error("Error joining club:", error);
    return NextResponse.json({ error: "Failed to join club" }, { status: 500 });
  }
}
