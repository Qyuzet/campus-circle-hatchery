import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, faculty, major, year, bio, studentId, avatarUrl } = body;

    const updateData: any = {};

    if (name !== undefined && name.trim() !== "") {
      updateData.name = name.trim();
    }

    if (faculty !== undefined && faculty.trim() !== "") {
      updateData.faculty = faculty.trim();
    }

    if (major !== undefined && major.trim() !== "") {
      updateData.major = major.trim();
    }

    if (year !== undefined) {
      const yearNum = parseInt(year);
      if (!isNaN(yearNum) && yearNum >= 1 && yearNum <= 8) {
        updateData.year = yearNum;
      }
    }

    if (bio !== undefined) {
      updateData.bio = bio.trim() || null;
    }

    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl || null;
    }

    if (studentId !== undefined && studentId.trim() !== "") {
      const existingUser = await prisma.user.findUnique({
        where: { studentId: studentId.trim() },
      });

      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          { error: "Student ID already exists" },
          { status: 400 }
        );
      }

      updateData.studentId = studentId.trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        studentId: true,
        faculty: true,
        major: true,
        year: true,
        bio: true,
        avatarUrl: true,
        rating: true,
        totalSales: true,
        totalPurchases: true,
        isVerified: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
