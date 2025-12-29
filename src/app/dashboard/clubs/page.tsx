import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClubsClient } from "@/components/dashboard/clubs/ClubsClient";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

function ClubsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-light-gray">
        <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
        <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const userId = session.user.id;
  const activeSubTab = (searchParams.tab as "browse" | "my-clubs") || "browse";

  const [
    allClubs,
    myClubMemberships,
    clubJoinRequests,
    userProfile,
    wishlistItems,
    notifications,
  ] = await Promise.all([
    prisma.club.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.clubMember.findMany({
      where: {
        userId,
        status: "JOINED",
      },
      include: {
        club: true,
      },
    }),
    prisma.clubJoinRequest.findMany({
      where: {
        userId,
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
    prisma.wishlistItem.findMany({
      where: { userId },
      select: {
        itemId: true,
      },
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const myClubs = myClubMemberships.map((m) => m.club);

  const isProfileComplete =
    userProfile?.name &&
    userProfile?.studentId &&
    userProfile?.faculty &&
    userProfile?.major;

  return (
    <DashboardLayout
      activeTab="clubs"
      wishlistCount={wishlistItems.length}
      notifications={notifications}
    >
      <Suspense fallback={<ClubsSkeleton />}>
        <ClubsClient
          initialAllClubs={allClubs}
          initialMyClubs={myClubs}
          initialClubJoinRequests={clubJoinRequests}
          initialSubTab={activeSubTab}
          userId={userId}
          isProfileComplete={!!isProfileComplete}
          userProfile={userProfile}
        />
      </Suspense>
    </DashboardLayout>
  );
}
