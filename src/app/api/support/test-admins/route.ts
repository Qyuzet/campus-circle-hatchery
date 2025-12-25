import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { 
        id: true,
        email: true, 
        name: true,
        role: true,
      },
    });

    return NextResponse.json({
      count: admins.length,
      admins: admins,
    });
  } catch (error: any) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

