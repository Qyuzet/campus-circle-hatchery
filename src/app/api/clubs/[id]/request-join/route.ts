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

    const club = await prisma.club.findUnique({
      where: { id: params.id },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    if (club.joinMode !== "REQUEST") {
      return NextResponse.json(
        { error: "This club uses direct join mode" },
        { status: 400 }
      );
    }

    if (!user.name || !user.studentId || !user.faculty || !user.major) {
      return NextResponse.json(
        {
          error: "Please complete your profile before requesting to join clubs",
        },
        { status: 400 }
      );
    }

    if (club.isOpenForRegistration) {
      const now = new Date();
      if (club.registrationStartDate && now < club.registrationStartDate) {
        return NextResponse.json(
          { error: "Registration has not started yet" },
          { status: 400 }
        );
      }
      if (club.registrationEndDate && now > club.registrationEndDate) {
        return NextResponse.json(
          { error: "Registration has ended" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Registration is not open" },
        { status: 400 }
      );
    }

    const existingMember = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId: params.id,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "You are already a member of this club" },
        { status: 400 }
      );
    }

    const existingRequest = await prisma.clubJoinRequest.findUnique({
      where: {
        clubId_userId: {
          clubId: params.id,
          userId: user.id,
        },
      },
    });

    if (existingRequest) {
      if (existingRequest.status === "PENDING") {
        return NextResponse.json(
          { error: "You already have a pending request" },
          { status: 400 }
        );
      } else if (existingRequest.status === "APPROVED") {
        return NextResponse.json(
          {
            error: "Your request has been approved. You can now join the club.",
          },
          { status: 400 }
        );
      } else if (existingRequest.status === "REJECTED") {
        await prisma.clubJoinRequest.update({
          where: { id: existingRequest.id },
          data: {
            status: "PENDING",
            requestedAt: new Date(),
            respondedAt: null,
          },
        });
        return NextResponse.json({
          message: "Request resubmitted successfully",
        });
      }
    }

    const joinRequest = await prisma.clubJoinRequest.create({
      data: {
        clubId: params.id,
        userId: user.id,
        status: "PENDING",
      },
    });

    return NextResponse.json(joinRequest);
  } catch (error) {
    console.error("Request join error:", error);
    return NextResponse.json(
      { error: "Failed to submit join request" },
      { status: 500 }
    );
  }
}
