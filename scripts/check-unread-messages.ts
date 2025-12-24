import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });

const prisma = new PrismaClient();

async function checkUnreadMessages() {
  console.log("Checking unread messages in database...\n");

  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const now = new Date();

    console.log(`Current time: ${now.toISOString()}`);
    console.log(`One minute ago: ${oneMinuteAgo.toISOString()}\n`);

    const allUnreadMessages = await prisma.message.findMany({
      where: {
        isRead: false,
      },
      include: {
        sender: {
          select: {
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    console.log(`Total unread messages: ${allUnreadMessages.length}\n`);

    if (allUnreadMessages.length === 0) {
      console.log("No unread messages found.");
      process.exit(0);
    }

    console.log("Recent unread messages:");
    console.log("=".repeat(80));

    for (const msg of allUnreadMessages) {
      const age = Math.floor((now.getTime() - msg.createdAt.getTime()) / 1000);
      const isOldEnough = msg.createdAt <= oneMinuteAgo;
      const emailSent = (msg as any).emailNotificationSent || false;

      console.log(`\nMessage ID: ${msg.id}`);
      console.log(`From: ${msg.sender.name} (${msg.sender.email})`);
      console.log(`To: ${msg.receiver.name} (${msg.receiver.email})`);
      console.log(`Content: ${msg.content.substring(0, 50)}...`);
      console.log(`Created: ${msg.createdAt.toISOString()}`);
      console.log(`Age: ${age} seconds`);
      console.log(`Old enough (>60s): ${isOldEnough ? "YES" : "NO"}`);
      console.log(`Email notification sent: ${emailSent ? "YES" : "NO"}`);
      console.log(`Should send email: ${isOldEnough && !emailSent ? "YES" : "NO"}`);
    }

    console.log("\n" + "=".repeat(80));

    const eligibleMessages = await prisma.message.findMany({
      where: {
        isRead: false,
        emailNotificationSent: false,
        createdAt: {
          lte: oneMinuteAgo,
        },
      },
    });

    console.log(
      `\nMessages eligible for email notification: ${eligibleMessages.length}`
    );

    if (eligibleMessages.length > 0) {
      console.log("\nThese messages should trigger email notifications:");
      for (const msg of eligibleMessages) {
        console.log(`- Message ID: ${msg.id} (${msg.content.substring(0, 30)}...)`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUnreadMessages();

