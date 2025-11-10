// Tutoring Session API Routes - GET, PUT, DELETE individual session
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/tutoring/[id] - Get single tutoring session
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tutoringSession = await prisma.tutoringSession.findUnique({
      where: { id: params.id },
      include: {
        tutor: {
          select: {
            id: true,
            name: true,
            studentId: true,
            faculty: true,
            major: true,
            rating: true,
            avatarUrl: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            studentId: true,
            faculty: true,
            major: true,
            avatarUrl: true,
            email: true,
          },
        },
      },
    });

    if (!tutoringSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(tutoringSession);
  } catch (error) {
    console.error("Error fetching tutoring session:", error);
    return NextResponse.json(
      { error: "Failed to fetch tutoring session" },
      { status: 500 }
    );
  }
}

// PUT /api/tutoring/[id] - Update tutoring session
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if session exists
    const existingSession = await prisma.tutoringSession.findUnique({
      where: { id: params.id },
    });

    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Only tutor or student can update the session
    if (
      existingSession.tutorId !== user.id &&
      existingSession.studentId !== user.id
    ) {
      return NextResponse.json(
        { error: "You can only update your own sessions" },
        { status: 403 }
      );
    }

    // Update session
    const updatedSession = await prisma.tutoringSession.update({
      where: { id: params.id },
      data: {
        ...body,
        price: body.price ? parseInt(body.price) : undefined,
        duration: body.duration ? parseInt(body.duration) : undefined,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      },
      include: {
        tutor: {
          select: {
            id: true,
            name: true,
            studentId: true,
            faculty: true,
            major: true,
            rating: true,
            avatarUrl: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            studentId: true,
            faculty: true,
            major: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error updating tutoring session:", error);
    return NextResponse.json(
      { error: "Failed to update tutoring session" },
      { status: 500 }
    );
  }
}

// DELETE /api/tutoring/[id] - Delete tutoring session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if session exists
    const existingSession = await prisma.tutoringSession.findUnique({
      where: { id: params.id },
    });

    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Only tutor can delete the session
    if (existingSession.tutorId !== user.id) {
      return NextResponse.json(
        { error: "Only the tutor can delete this session" },
        { status: 403 }
      );
    }

    // Delete session
    await prisma.tutoringSession.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting tutoring session:", error);
    return NextResponse.json(
      { error: "Failed to delete tutoring session" },
      { status: 500 }
    );
  }
}
