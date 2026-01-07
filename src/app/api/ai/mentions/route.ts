import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    // Fetch all mentionable items in parallel
    const [notes, libraryItems, myListings, events, users] = await Promise.all([
      // User's AI notes
      prisma.aINote.findMany({
        where: {
          userId,
          ...(search && {
            title: { contains: search, mode: "insensitive" },
          }),
        },
        select: {
          id: true,
          title: true,
          subject: true,
          course: true,
          content: true,
          aiSummary: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),

      // Purchased marketplace items (library)
      prisma.transaction.findMany({
        where: {
          buyerId: userId,
          status: "COMPLETED",
          itemType: "marketplace",
          ...(search && {
            item: {
              title: { contains: search, mode: "insensitive" },
            },
          }),
        },
        select: {
          id: true,
          item: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              course: true,
              aiMetadata: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // User's own marketplace listings
      prisma.marketplaceItem.findMany({
        where: {
          sellerId: userId,
          ...(search && {
            title: { contains: search, mode: "insensitive" },
          }),
        },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          course: true,
          price: true,
          status: true,
          aiMetadata: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // Events user registered for or organized
      prisma.event.findMany({
        where: {
          OR: [
            { organizerId: userId },
            { participants: { some: { userId } } },
          ],
          ...(search && {
            title: { contains: search, mode: "insensitive" },
          }),
        },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          location: true,
          organizerId: true,
        },
        orderBy: { startDate: "desc" },
        take: 10,
      }),

      // Other users (for collaboration mentions)
      prisma.user.findMany({
        where: {
          id: { not: userId },
          ...(search && {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }),
        },
        select: {
          id: true,
          name: true,
          studentId: true,
          avatarUrl: true,
          faculty: true,
        },
        orderBy: { name: "asc" },
        take: 10,
      }),
    ]);

    // Format library items
    const formattedLibrary = libraryItems
      .filter((t) => t.item)
      .map((t) => ({
        id: t.item!.id,
        title: t.item!.title,
        description: t.item!.description,
        category: t.item!.category,
        course: t.item!.course,
        aiMetadata: t.item!.aiMetadata,
        type: "library" as const,
      }));

    return NextResponse.json({
      notes,
      library: formattedLibrary,
      listings: myListings,
      events: events.map((e) => ({
        ...e,
        isOrganizer: e.organizerId === userId,
      })),
      users,
    });
  } catch (error) {
    console.error("Error fetching mentions:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentions" },
      { status: 500 }
    );
  }
}

