// Tutoring Sessions API Routes - GET (list) and POST (create)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/tutoring - List tutoring sessions
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "tutor" or "student" or "all"
    const status = searchParams.get("status");

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const where: any = {};

    if (type === "tutor") {
      where.tutorId = user.id;
    } else if (type === "student") {
      where.studentId = user.id;
    } else {
      // Get all sessions where user is either tutor or student
      where.OR = [{ tutorId: user.id }, { studentId: user.id }];
    }

    if (status) {
      where.status = status;
    }

    const sessions = await prisma.tutoringSession.findMany({
      where,
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
      orderBy: {
        scheduledAt: "desc",
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching tutoring sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch tutoring sessions" },
      { status: 500 }
    );
  }
}

// POST /api/tutoring - Create new tutoring session
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      subject,
      course,
      description,
      price,
      duration,
      scheduledAt,
      studentId,
    } = body;

    // Validation
    if (
      !subject ||
      !course ||
      !description ||
      !price ||
      !duration ||
      !scheduledAt
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user from database (tutor)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // For now, if studentId is not provided, create as an offer (pending)
    // If studentId is provided, create as a booking request
    const tutoringSession = await prisma.tutoringSession.create({
      data: {
        subject,
        course,
        description,
        price: parseInt(price),
        duration: parseInt(duration),
        scheduledAt: new Date(scheduledAt),
        tutorId: user.id,
        studentId: studentId || user.id, // Temporary: use same user if no student
        status: studentId ? "pending" : "confirmed",
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

    // Update user stats
    await prisma.userStats.upsert({
      where: { userId: user.id },
      update: {
        tutoringSessions: { increment: 1 },
      },
      create: {
        userId: user.id,
        tutoringSessions: 1,
      },
    });

    return NextResponse.json(tutoringSession, { status: 201 });
  } catch (error) {
    console.error("Error creating tutoring session:", error);
    return NextResponse.json(
      { error: "Failed to create tutoring session" },
      { status: 500 }
    );
  }
}
