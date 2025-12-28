import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountClient } from "@/components/account/AccountClient";
import { Toaster } from "sonner";

function AccountSkeleton() {
  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-campus-blue-dark mx-auto mb-4"></div>
        <p className="text-dark-gray text-lg">Loading account...</p>
      </div>
    </div>
  );
}

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const userId = session.user.id;

  const [userProfile, userStats, notifications] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
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
    }),
    prisma.userStats.findUnique({
      where: { userId },
      select: {
        itemsSold: true,
        itemsBought: true,
        totalEarnings: true,
        totalSpent: true,
        messagesCount: true,
        tutoringSessions: true,
        reviewsGiven: true,
        reviewsReceived: true,
      },
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  if (!userProfile) {
    redirect("/signin");
  }

  const stats = userStats || {
    itemsSold: 0,
    itemsBought: 0,
    totalEarnings: 0,
    totalSpent: 0,
    messagesCount: 0,
    tutoringSessions: 0,
    reviewsGiven: 0,
    reviewsReceived: 0,
  };

  const averageRating = userProfile.rating || 5.0;
  const statsWithRating = {
    ...stats,
    averageRating,
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <Toaster position="top-center" richColors />
      <Suspense fallback={<AccountSkeleton />}>
        <AccountClient
          userProfile={userProfile}
          userStats={statsWithRating}
          unreadCount={unreadCount}
        />
      </Suspense>
    </>
  );
}
