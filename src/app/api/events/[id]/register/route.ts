import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        participants: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.isPublished) {
      return NextResponse.json(
        { error: "Event is not published yet" },
        { status: 400 }
      );
    }

    if (event.status === "completed" || event.status === "cancelled") {
      return NextResponse.json(
        { error: "Cannot register for this event" },
        { status: 400 }
      );
    }

    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return NextResponse.json(
        { error: "Registration deadline has passed" },
        { status: 400 }
      );
    }

    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
      return NextResponse.json(
        { error: "Event is full" },
        { status: 400 }
      );
    }

    const existingParticipant = await prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: user.id,
        },
      },
    });

    if (existingParticipant) {
      return NextResponse.json(
        { error: "You are already registered for this event" },
        { status: 400 }
      );
    }

    const participant = await prisma.eventParticipant.create({
      data: {
        eventId: params.id,
        userId: user.id,
        paymentStatus: event.price > 0 ? "pending" : "paid",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            location: true,
          },
        },
      },
    });

    await prisma.event.update({
      where: { id: params.id },
      data: {
        currentParticipants: { increment: 1 },
      },
    });

    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    console.error("Error registering for event:", error);
    return NextResponse.json(
      { error: "Failed to register for event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const participant = await prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: user.id,
        },
      },
      include: {
        event: true,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "You are not registered for this event" },
        { status: 404 }
      );
    }

    if (participant.status === "attended") {
      return NextResponse.json(
        { error: "Cannot cancel after attending the event" },
        { status: 400 }
      );
    }

    await prisma.eventParticipant.update({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: user.id,
        },
      },
      data: {
        status: "cancelled",
      },
    });

    await prisma.event.update({
      where: { id: params.id },
      data: {
        currentParticipants: { decrement: 1 },
      },
    });

    return NextResponse.json({ message: "Registration cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling registration:", error);
    return NextResponse.json(
      { error: "Failed to cancel registration" },
      { status: 500 }
    );
  }
}

