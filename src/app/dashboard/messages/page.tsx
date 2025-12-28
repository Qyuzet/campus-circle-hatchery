import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessagesClient } from "@/components/dashboard/messages/MessagesClient";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

function MessagesSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow border border-light-gray h-[calc(100vh-12rem)] sm:h-[600px] flex animate-pulse">
      <div className="w-1/3 border-r border-light-gray p-4 space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 p-4 flex flex-col justify-center items-center">
        <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  );
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: {
    conversation?: string;
    group?: string;
    mode?: string;
    userId?: string;
  };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const userId = session.user.id;
  let selectedConversationId = searchParams.conversation;
  const selectedGroupId = searchParams.group;
  const targetUserId = searchParams.userId;
  const viewMode =
    (searchParams.mode as "conversations" | "groups") || "conversations";

  if (targetUserId && !selectedConversationId) {
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: userId },
        ],
      },
    });

    if (existingConversation) {
      selectedConversationId = existingConversation.id;
    } else {
      const newConversation = await prisma.conversation.create({
        data: {
          user1Id: userId,
          user2Id: targetUserId,
        },
      });
      selectedConversationId = newConversation.id;
    }
  }

  const [conversations, groups, currentUser, wishlistItems, notifications] =
    await Promise.all([
      prisma.conversation.findMany({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
        include: {
          user1: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          user2: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            select: {
              content: true,
              createdAt: true,
              senderId: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      }),
      prisma.group.findMany({
        where: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
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

  const unreadMessagesCount = conversations.filter(
    (c) => c.messages.length > 0 && c.messages[0].senderId !== userId
  ).length;

  return (
    <DashboardLayout
      activeTab="discovery"
      wishlistCount={wishlistItems.length}
      unreadMessagesCount={unreadMessagesCount}
      notifications={notifications}
    >
      <Suspense fallback={<MessagesSkeleton />}>
        <MessagesClient
          initialConversations={conversations}
          initialGroups={groups}
          currentUser={currentUser}
          selectedConversationId={selectedConversationId}
          selectedGroupId={selectedGroupId}
          initialViewMode={viewMode}
        />
      </Suspense>
    </DashboardLayout>
  );
}
