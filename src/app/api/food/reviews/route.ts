import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const foodItemId = searchParams.get("foodItemId");

    if (!foodItemId) {
      return NextResponse.json(
        { error: "Food item ID is required" },
        { status: 400 }
      );
    }

    const reviews = await prisma.foodReview.findMany({
      where: { foodItemId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching food reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch food reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { foodItemId, rating, comment } = body;

    if (!foodItemId || !rating) {
      return NextResponse.json(
        { error: "Food item ID and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const foodItem = await prisma.foodItem.findUnique({
      where: { id: foodItemId },
    });

    if (!foodItem) {
      return NextResponse.json({ error: "Food item not found" }, { status: 404 });
    }

    const existingReview = await prisma.foodReview.findFirst({
      where: {
        foodItemId,
        userId: user.id,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this food item" },
        { status: 400 }
      );
    }

    const hasOrdered = await prisma.foodOrder.findFirst({
      where: {
        foodItemId,
        buyerId: user.id,
        status: { in: ["confirmed", "picked_up"] },
      },
    });

    if (!hasOrdered) {
      return NextResponse.json(
        { error: "You can only review food items you have ordered" },
        { status: 400 }
      );
    }

    const review = await prisma.foodReview.create({
      data: {
        foodItemId,
        userId: user.id,
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    const allReviews = await prisma.foodReview.findMany({
      where: { foodItemId },
    });

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.foodItem.update({
      where: { id: foodItemId },
      data: {
        rating: avgRating,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating food review:", error);
    return NextResponse.json(
      { error: "Failed to create food review" },
      { status: 500 }
    );
  }
}

