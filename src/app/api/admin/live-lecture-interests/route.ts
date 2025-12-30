import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [interests, total] = await Promise.all([
      prisma.liveLectureInterest.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              faculty: true,
              major: true,
              studentId: true,
            },
          },
        },
      }),
      prisma.liveLectureInterest.count(),
    ]);

    const pricingStats = await prisma.liveLectureInterest.groupBy({
      by: ["preferredPricing"],
      _count: {
        preferredPricing: true,
      },
    });

    const frequencyStats = await prisma.liveLectureInterest.groupBy({
      by: ["frequency"],
      _count: {
        frequency: true,
      },
    });

    return NextResponse.json({
      success: true,
      interests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        pricing: pricingStats,
        frequency: frequencyStats,
      },
    });
  } catch (error: any) {
    console.error("Admin live lecture interests error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
