import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const eventType = searchParams.get("eventType");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const isFeatured = searchParams.get("isFeatured");

    const where: any = {
      isPublished: true,
    };

    if (category) {
      where.category = category;
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (status) {
      where.status = status;
    } else {
      where.status = { in: ["upcoming", "ongoing"] };
    }

    if (isFeatured === "true") {
      where.isFeatured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { organizer: { contains: search, mode: "insensitive" } },
      ];
    }

    if (startDate) {
      where.startDate = { gte: new Date(startDate) };
    }

    if (endDate) {
      where.endDate = { lte: new Date(endDate) };
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        organizerUser: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        participants: {
          select: {
            id: true,
            status: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
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
      category,
      eventType,
      price,
      imageUrl,
      bannerUrl,
      location,
      venue,
      isOnline,
      meetingLink,
      startDate,
      endDate,
      registrationDeadline,
      maxParticipants,
      tags,
      requirements,
      organizer,
      contactEmail,
      contactPhone,
      isPublished,
    } = body;

    if (
      !title ||
      !description ||
      !category ||
      !eventType ||
      !location ||
      !startDate ||
      !endDate ||
      !organizer
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        category,
        eventType,
        price: parseInt(price) || 0,
        imageUrl,
        bannerUrl,
        location,
        venue,
        isOnline: isOnline || false,
        meetingLink,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        registrationDeadline: registrationDeadline
          ? new Date(registrationDeadline)
          : null,
        maxParticipants: parseInt(maxParticipants) || 0,
        tags: tags || [],
        requirements,
        organizer,
        contactEmail,
        contactPhone,
        isPublished: isPublished || false,
        organizerId: dbUser.id,
      },
      include: {
        organizerUser: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
