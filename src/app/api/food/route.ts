import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEmail, getNewListingEmailTemplate } from "@/lib/resend";

export const revalidate = 30;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const foodType = searchParams.get("foodType");
    const isHalal = searchParams.get("isHalal");
    const isVegan = searchParams.get("isVegan");
    const isVegetarian = searchParams.get("isVegetarian");
    const search = searchParams.get("search");
    const status = searchParams.get("status") || "available";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where: any = {
      status,
    };

    if (category) {
      where.category = category;
    }

    if (foodType) {
      where.foodType = foodType;
    }

    if (isHalal === "true") {
      where.isHalal = true;
    }

    if (isVegan === "true") {
      where.isVegan = true;
    }

    if (isVegetarian === "true") {
      where.isVegetarian = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [foodItems, total] = await Promise.all([
      prisma.foodItem.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              rating: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: skip,
      }),
      prisma.foodItem.count({ where }),
    ]);

    const response = NextResponse.json({
      items: foodItems,
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
    console.error("Error fetching food items:", error);
    return NextResponse.json(
      { error: "Failed to fetch food items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      category,
      foodType,
      quantity,
      unit,
      imageUrl,
      allergens,
      ingredients,
      expiryDate,
      pickupLocation,
      pickupTime,
      isHalal,
      isVegan,
      isVegetarian,
      aiMetadata,
    } = body;

    if (
      !title ||
      !description ||
      !price ||
      !category ||
      !foodType ||
      !pickupLocation ||
      !pickupTime
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const foodItem = await prisma.foodItem.create({
      data: {
        title,
        description,
        price: parseInt(price),
        category,
        foodType,
        quantity: quantity ? parseInt(quantity) : 1,
        unit: unit || "pieces",
        imageUrl,
        allergens: allergens || [],
        ingredients,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        pickupLocation,
        pickupTime,
        isHalal: isHalal || false,
        isVegan: isVegan || false,
        isVegetarian: isVegetarian || false,
        aiMetadata: aiMetadata || null,
        sellerId: dbUser.id,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            rating: true,
          },
        },
      },
    });

    const listingUrl = `${process.env.NEXTAUTH_URL}/dashboard?tab=discovery&itemId=${foodItem.id}`;

    // Use real emails if USE_REAL_EMAILS is set to true, otherwise use test email
    const useRealEmails =
      process.env.USE_REAL_EMAILS === "true" ||
      process.env.NODE_ENV === "production";
    const recipientEmail = useRealEmails
      ? dbUser.email
      : "delivered@resend.dev";

    await sendEmail({
      to: recipientEmail,
      subject: "Your food listing is now live!",
      html: getNewListingEmailTemplate(
        dbUser.name,
        "food item",
        foodItem.title,
        foodItem.price,
        listingUrl
      ),
    });

    return NextResponse.json(foodItem, { status: 201 });
  } catch (error) {
    console.error("Error creating food item:", error);
    return NextResponse.json(
      { error: "Failed to create food item" },
      { status: 500 }
    );
  }
}
