import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { email, name, faculty, major, useCase, frequency, features } = body;

    if (!useCase || !frequency || !features || features.length === 0) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existingInterest = await prisma.liveLectureInterest.findFirst({
      where: { userId: user.id },
    });

    let interest;
    if (existingInterest) {
      interest = await prisma.liveLectureInterest.update({
        where: { id: existingInterest.id },
        data: {
          useCase,
          frequency,
          features,
        },
      });
    } else {
      interest = await prisma.liveLectureInterest.create({
        data: {
          userId: user.id,
          email,
          name,
          faculty,
          major,
          useCase,
          frequency,
          features,
        },
      });
    }

    return NextResponse.json(interest, { status: 201 });
  } catch (error) {
    console.error("Error submitting live lecture interest:", error);
    return NextResponse.json(
      { error: "Failed to submit interest" },
      { status: 500 }
    );
  }
}

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

    const interest = await prisma.liveLectureInterest.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(interest);
  } catch (error) {
    console.error("Error fetching live lecture interest:", error);
    return NextResponse.json(
      { error: "Failed to fetch interest" },
      { status: 500 }
    );
  }
}

