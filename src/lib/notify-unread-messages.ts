import { prisma } from "@/lib/prisma";
import { sendEmail, getUnreadMessageEmailTemplate } from "@/lib/resend";

export async function notifyUnreadMessages(conversationId?: string) {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    const whereClause: any = {
      isRead: false,
      emailNotificationSent: false,
      createdAt: {
        lte: oneMinuteAgo,
      },
    };

    if (conversationId) {
      whereClause.conversationId = conversationId;
    }

    const unreadMessages = await prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        conversation: {
          select: {
            id: true,
          },
        },
      },
    });

    let emailsSent = 0;
    const processedReceivers = new Set<string>();

    for (const message of unreadMessages) {
      if (processedReceivers.has(message.receiverId)) {
        continue;
      }

      const conversationUrl = `${process.env.NEXTAUTH_URL}/dashboard?tab=messages&conversation=${message.conversation.id}`;

      const useRealEmails =
        process.env.USE_REAL_EMAILS === "true" ||
        process.env.NODE_ENV === "production";
      const recipientEmail = useRealEmails
        ? message.receiver.email
        : "delivered@resend.dev";

      const emailResult = await sendEmail({
        to: recipientEmail,
        subject: `New message from ${message.sender.name}`,
        html: getUnreadMessageEmailTemplate(
          message.receiver.name,
          message.sender.name,
          message.content,
          conversationUrl
        ),
      });

      if (emailResult.success) {
        await prisma.message.update({
          where: { id: message.id },
          data: { emailNotificationSent: true },
        });
        emailsSent++;
        processedReceivers.add(message.receiverId);
      }
    }

    return {
      success: true,
      emailsSent,
      totalUnreadMessages: unreadMessages.length,
    };
  } catch (error) {
    console.error("Notify unread messages error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

