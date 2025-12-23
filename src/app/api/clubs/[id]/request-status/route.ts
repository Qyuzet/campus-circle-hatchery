import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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

    const joinRequest = await prisma.clubJoinRequest.findUnique({
      where: {
        clubId_userId: {
          clubId: params.id,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ request: joinRequest });
  } catch (error) {
    console.error("Get request status error:", error);
    return NextResponse.json(
      { error: "Failed to get request status" },
      { status: 500 }
    );
  }
}

