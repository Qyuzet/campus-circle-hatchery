import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MyHubClient } from "@/components/dashboard/my-hub/MyHubClient";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Suspense } from "react";

function MyHubSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-gray-200 animate-pulse rounded-lg w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

export default async function MyHubPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const userId = session.user.id;

  const [
    purchases,
    sales,
    library,
    listings,
    eventRegistrations,
    organizedEvents,
    wishlistItems,
    notifications,
  ] = await Promise.all([
    prisma.transaction.findMany({
      where: { buyerId: userId },
      include: {
        item: true,
        foodItem: true,
        event: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.findMany({
      where: { sellerId: userId },
      include: {
        buyer: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.findMany({
      where: {
        buyerId: userId,
        status: "COMPLETED",
        itemType: "marketplace",
      },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            fileUrl: true,
            fileName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.marketplaceItem.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.eventParticipant.findMany({
      where: {
        userId,
        status: { not: "cancelled" },
      },
      include: {
        event: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { registeredAt: "desc" },
    }),
    prisma.event.findMany({
      where: {
        organizerId: userId,
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                studentId: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            registeredAt: "desc",
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        item: {
          include: {
            seller: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <DashboardLayout
      activeTab="my-hub"
      wishlistCount={wishlistItems.length}
      notifications={notifications}
    >
      <Suspense fallback={<MyHubSkeleton />}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* <h1 className="text-2xl font-bold mb-6">My Hub</h1> */}

          <MyHubClient
            initialTab={searchParams.tab || "purchases"}
            purchases={purchases}
            sales={sales}
            library={library}
            listings={listings}
            eventRegistrations={eventRegistrations}
            organizedEvents={organizedEvents}
            wishlistItems={wishlistItems}
            currentUserId={userId}
          />
        </div>
      </Suspense>
    </DashboardLayout>
  );
}
