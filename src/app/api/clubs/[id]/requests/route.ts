import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  sendEmail,
  getClubRequestApprovedEmailTemplate,
  getClubRequestRejectedEmailTemplate,
} from "@/lib/resend";

export async function GET(
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const requests = await prisma.clubJoinRequest.findMany({
      where: { clubId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            faculty: true,
            major: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { requestedAt: "desc" },
    });

    const members = await prisma.clubMember.findMany({
      where: { clubId: params.id },
      select: {
        userId: true,
        status: true,
      },
    });

    const memberMap = new Map(members.map((m) => [m.userId, m.status]));

    const requestsWithStatus = requests.map((req) => ({
      ...req,
      memberStatus: memberMap.get(req.userId) || null,
    }));

    return NextResponse.json(requestsWithStatus);
  } catch (error) {
    console.error("Get club requests error:", error);
    return NextResponse.json(
      { error: "Failed to get club requests" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { requestId, action } = body;

    if (!requestId || !action) {
      return NextResponse.json(
        { error: "Request ID and action are required" },
        { status: 400 }
      );
    }

    if (action !== "APPROVED" && action !== "REJECTED") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const joinRequest = await prisma.clubJoinRequest.update({
      where: { id: requestId },
      data: {
        status: action,
        respondedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const useRealEmails =
      process.env.USE_REAL_EMAILS === "true" ||
      process.env.NODE_ENV === "production";
    const recipientEmail = useRealEmails
      ? joinRequest.user.email
      : "delivered@resend.dev";

    if (action === "APPROVED") {
      // Create in-app notification
      await prisma.notification.create({
        data: {
          userId: joinRequest.user.id,
          type: "system",
          title: "Club Request Approved",
          message: `Your request to join ${joinRequest.club.name} has been approved! Click to join now.`,
        },
      });

      // Send email notification
      const joinUrl = `${process.env.NEXTAUTH_URL}/dashboard/clubs?tab=browse`;

      await sendEmail({
        to: recipientEmail,
        subject: `Your request to join ${joinRequest.club.name} was approved`,
        html: getClubRequestApprovedEmailTemplate(
          joinRequest.user.name,
          joinRequest.club.name,
          joinUrl
        ),
      });
    } else if (action === "REJECTED") {
      // Create in-app notification
      await prisma.notification.create({
        data: {
          userId: joinRequest.user.id,
          type: "system",
          title: "Club Request Not Approved",
          message: `Your request to join ${joinRequest.club.name} was not approved.`,
        },
      });

      // Send email notification
      await sendEmail({
        to: recipientEmail,
        subject: `Update on your request to join ${joinRequest.club.name}`,
        html: getClubRequestRejectedEmailTemplate(
          joinRequest.user.name,
          joinRequest.club.name
        ),
      });
    }

    return NextResponse.json(joinRequest);
  } catch (error) {
    console.error("Update request error:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}
