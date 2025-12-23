import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const membership = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId: params.id,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this club" },
        { status: 400 }
      );
    }

    await prisma.clubMember.delete({
      where: {
        clubId_userId: {
          clubId: params.id,
          userId: user.id,
        },
      },
    });

    await prisma.clubJoinRequest.deleteMany({
      where: {
        clubId: params.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: "Left club successfully" });
  } catch (error) {
    console.error("Error leaving club:", error);
    return NextResponse.json(
      { error: "Failed to leave club" },
      { status: 500 }
    );
  }
}
