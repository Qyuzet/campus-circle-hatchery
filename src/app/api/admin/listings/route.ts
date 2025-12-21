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
    const type = searchParams.get("type") || "marketplace";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    let listings: any[] = [];
    let total = 0;

    if (type === "marketplace") {
      const where: any = {};

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      if (status) {
        where.status = status;
      }

      [listings, total] = await Promise.all([
        prisma.marketplaceItem.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
                studentId: true,
              },
            },
          },
        }),
        prisma.marketplaceItem.count({ where }),
      ]);
    } else if (type === "food") {
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      if (status) {
        where.status = status;
      }

      [listings, total] = await Promise.all([
        prisma.foodItem.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
                studentId: true,
              },
            },
          },
        }),
        prisma.foodItem.count({ where }),
      ]);
    } else if (type === "events") {
      const where: any = {};

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      [listings, total] = await Promise.all([
        prisma.event.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            organizerUser: {
              select: {
                id: true,
                name: true,
                email: true,
                studentId: true,
              },
            },
            _count: {
              select: {
                participants: true,
              },
            },
          },
        }),
        prisma.event.count({ where }),
      ]);
    } else if (type === "tutoring") {
      const where: any = {};

      if (search) {
        where.OR = [
          { subject: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      if (status) {
        where.status = status;
      }

      [listings, total] = await Promise.all([
        prisma.tutoringSession.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            tutor: {
              select: {
                id: true,
                name: true,
                email: true,
                studentId: true,
              },
            },
          },
        }),
        prisma.tutoringSession.count({ where }),
      ]);
    }

    return NextResponse.json({
      success: true,
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Admin listings error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
