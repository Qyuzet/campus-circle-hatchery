import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, getUnreadMessageEmailTemplate } from "@/lib/resend";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "your-secret-key";

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    const unreadMessages = await prisma.message.findMany({
      where: {
        isRead: false,
        emailNotificationSent: false,
        createdAt: {
          lte: oneMinuteAgo,
        },
      },
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

      // Use real emails if USE_REAL_EMAILS is set to true, otherwise use test email
      const useRealEmails =
        process.env.USE_REAL_EMAILS === "true" ||
        process.env.NODE_ENV === "production";
      const recipientEmail = useRealEmails
        ? message.receiver.email
        : "delivered@resend.dev";

      console.log(
        `Sending email notification to ${message.receiver.name} (${recipientEmail})`
      );

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
        console.log(
          `Email sent successfully for message from ${message.sender.name} to ${message.receiver.name}`
        );
      } else {
        console.error(
          `Failed to send email for message from ${message.sender.name} to ${message.receiver.name}`,
          emailResult.error
        );
      }
    }

    console.log(`Unread message notifications sent: ${emailsSent}`);

    return NextResponse.json({
      success: true,
      message: `Sent ${emailsSent} email notifications for unread messages`,
      totalUnreadMessages: unreadMessages.length,
      emailsSent,
    });
  } catch (error) {
    console.error("Error sending unread message notifications:", error);
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 }
    );
  }
}
