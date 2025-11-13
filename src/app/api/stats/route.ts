// User Stats API Routes
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/stats - Get current user's stats
export async function GET(request: NextRequest) {
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

    // Get or create user stats
    let stats = await prisma.userStats.findUnique({
      where: { userId: user.id },
    });

    if (!stats) {
      stats = await prisma.userStats.create({
        data: {
          userId: user.id,
        },
      });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}

// PATCH /api/stats - Update user stats (e.g., save bank account)
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const {
      savedPaymentMethod,
      savedAccountNumber,
      savedAccountName,
      savedBankName,
    } = body;

    // Update user stats
    const stats = await prisma.userStats.upsert({
      where: { userId: user.id },
      update: {
        savedPaymentMethod,
        savedAccountNumber,
        savedAccountName,
        savedBankName: savedBankName || null,
      },
      create: {
        userId: user.id,
        savedPaymentMethod,
        savedAccountNumber,
        savedAccountName,
        savedBankName: savedBankName || null,
      },
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error updating user stats:", error);
    return NextResponse.json(
      { error: "Failed to update user stats" },
      { status: 500 }
    );
  }
}
