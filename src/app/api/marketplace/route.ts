// Marketplace API Routes - GET (list) and POST (create)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const revalidate = 30;

// GET /api/marketplace - List all marketplace items with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const faculty = searchParams.get("faculty");
    const search = searchParams.get("search");
    const status = searchParams.get("status") || "available";
    const sellerId = searchParams.get("sellerId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where: any = {
      status,
      fileUrl: {
        not: null,
      },
      NOT: {
        fileUrl: "",
      },
    };

    if (category && category !== "All") {
      where.category = category;
    }

    if (faculty) {
      where.faculty = faculty;
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { course: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.marketplaceItem.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              studentId: true,
              rating: true,
              totalSales: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: skip,
      }),
      prisma.marketplaceItem.count({ where }),
    ]);

    const response = NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    response.headers.set(
      "Cache-Control",
      "public, s-maxage=30, stale-while-revalidate=60"
    );

    return response;
  } catch (error) {
    console.error("Error fetching marketplace items:", error);
    return NextResponse.json(
      { error: "Failed to fetch marketplace items" },
      { status: 500 }
    );
  }
}

// POST /api/marketplace - Create new marketplace item
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      category,
      course,
      condition,
      imageUrl,
      fileUrl,
      fileName,
      fileSize,
      fileType,
      thumbnailUrl,
    } = body;

    // Validation
    if (!title || !description || !price || !category || !course) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate that file is uploaded (required for tradable items)
    if (!fileUrl || fileUrl.trim() === "") {
      return NextResponse.json(
        {
          error:
            "File upload is required. Items without files are not tradable.",
        },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create marketplace item
    const item = await prisma.marketplaceItem.create({
      data: {
        title,
        description,
        price: parseInt(price),
        category,
        course,
        faculty: user.faculty || "Unknown", // Use user's faculty
        condition: "Digital", // All products are digital
        imageUrl: imageUrl || null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileSize: fileSize ? parseInt(fileSize) : null,
        fileType: fileType || null,
        thumbnailUrl: thumbnailUrl || null,
        sellerId: user.id,
        status: "available",
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            studentId: true,
            rating: true,
            totalSales: true,
          },
        },
      },
    });

    // Create user stats if they don't exist (don't increment itemsSold yet - only when item is actually sold)
    await prisma.userStats.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        itemsSold: 0,
        itemsBought: 0,
        totalEarnings: 0,
        totalSpent: 0,
        messagesCount: 0,
        tutoringSessions: 0,
        reviewsGiven: 0,
        reviewsReceived: 0,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating marketplace item:", error);
    return NextResponse.json(
      { error: "Failed to create marketplace item" },
      { status: 500 }
    );
  }
}
