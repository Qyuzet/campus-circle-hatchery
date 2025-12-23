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
    });

    return NextResponse.json(joinRequest);
  } catch (error) {
    console.error("Update request error:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}

