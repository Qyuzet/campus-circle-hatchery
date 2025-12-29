import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MarketplaceClient } from "@/components/dashboard/marketplace/MarketplaceClient";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

function MarketplaceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-20 bg-gray-200 animate-pulse rounded-lg" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { mode?: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const userId = session.user.id;
  const contentMode =
    (searchParams.mode as "study" | "food" | "event") || "study";

  const [
    marketplaceItems,
    foodItems,
    events,
    myEventRegistrations,
    wishlistItems,
    myPurchases,
    userProfile,
    notifications,
  ] = await Promise.all([
    prisma.marketplaceItem.findMany({
      where: {
        fileUrl: {
          not: null,
        },
        NOT: {
          fileUrl: "",
        },
        status: "available",
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            studentId: true,
            rating: true,
            totalSales: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    }),
    prisma.foodItem.findMany({
      where: {
        status: "available",
      },
      include: {
        seller: {
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
      take: 100,
    }),
    prisma.event.findMany({
      where: {
        isPublished: true,
      },
      include: {
        organizerUser: {
          select: {
            id: true,
            name: true,
            email: true,
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
      take: 100,
    }),
    prisma.eventParticipant.findMany({
      where: {
        userId,
        status: { not: "cancelled" },
      },
      select: {
        eventId: true,
      },
    }),
    prisma.wishlistItem.findMany({
      where: { userId },
      select: {
        itemId: true,
      },
    }),
    prisma.transaction.findMany({
      where: {
        buyerId: userId,
        status: "COMPLETED",
        itemId: {
          not: null,
        },
      },
      select: {
        itemId: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true,
        faculty: true,
        major: true,
        year: true,
      },
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <DashboardLayout
      activeTab="discovery"
      wishlistCount={wishlistItems.length}
      notifications={notifications}
    >
      <Suspense fallback={<MarketplaceSkeleton />}>
        <MarketplaceClient
          initialMarketplaceItems={marketplaceItems}
          initialFoodItems={foodItems}
          initialEvents={events}
          initialContentMode={contentMode}
          myEventRegistrations={myEventRegistrations.map((r) => r.eventId)}
          wishlistItemIds={wishlistItems.map((w) => w.itemId)}
          myPurchasedItemIds={myPurchases
            .map((p) => p.itemId)
            .filter((id): id is string => id !== null)}
          userId={userId}
          userProfile={userProfile}
        />
      </Suspense>
    </DashboardLayout>
  );
}
