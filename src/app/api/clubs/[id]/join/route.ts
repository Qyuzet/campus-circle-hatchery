import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, getClubJoinedEmailTemplate } from "@/lib/resend";

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
      user.name && user.studentId && user.faculty && user.major;

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

    if (club.joinMode === "REQUEST") {
      const joinRequest = await prisma.clubJoinRequest.findUnique({
        where: {
          clubId_userId: {
            clubId: params.id,
            userId: user.id,
          },
        },
      });

      if (!joinRequest || joinRequest.status !== "APPROVED") {
        return NextResponse.json(
          { error: "You need an approved request to join this club" },
          { status: 403 }
        );
      }
    }

    const membership = await prisma.clubMember.create({
      data: {
        clubId: params.id,
        userId: user.id,
        status: "JOINED",
      },
    });

    await prisma.clubJoinRequest.deleteMany({
      where: {
        clubId: params.id,
        userId: user.id,
      },
    });

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "system",
        title: "Successfully Joined Club",
        message: `Welcome to ${club.name}!`,
      },
    });

    // Send email notification
    const useRealEmails =
      process.env.USE_REAL_EMAILS === "true" ||
      process.env.NODE_ENV === "production";
    const recipientEmail = useRealEmails ? user.email : "delivered@resend.dev";

    const clubsUrl = `${process.env.NEXTAUTH_URL}/dashboard/clubs?tab=my-clubs`;

    await sendEmail({
      to: recipientEmail,
      subject: `Welcome to ${club.name}!`,
      html: getClubJoinedEmailTemplate(user.name, club.name, clubsUrl),
    });

    return NextResponse.json(
      {
        membership,
        registrationLink: club.registrationLink,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error joining club:", error);
    return NextResponse.json({ error: "Failed to join club" }, { status: 500 });
  }
}
