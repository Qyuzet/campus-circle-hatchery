// Payment Notification API - Handle Midtrans payment notifications
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySignature, mapTransactionStatus } from "@/lib/midtrans";
import { sendEmail, getPurchaseNotificationEmailTemplate } from "@/lib/resend";

// POST /api/payment/notification - Handle Midtrans notification callback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      signature_key,
      transaction_id,
      payment_type,
    } = body;

    console.log("Midtrans notification received:", {
      order_id,
      transaction_status,
      fraud_status,
    });

    // Verify signature
    const isValid = verifySignature(
      order_id,
      status_code,
      gross_amount,
      signature_key
    );

    if (!isValid) {
      console.error("Invalid signature for order:", order_id);
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Find transaction in database
    const transaction = await prisma.transaction.findUnique({
      where: { orderId: order_id },
      include: {
        item: true,
        buyer: true,
      },
    });

    if (!transaction) {
      console.error("Transaction not found:", order_id);
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Map Midtrans status to our status
    const newStatus = mapTransactionStatus(transaction_status);

    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { orderId: order_id },
      data: {
        status: newStatus,
        transactionId: transaction_id,
        paymentMethod: payment_type,
        fraudStatus: fraud_status,
      },
    });

    // Trigger Pusher event for real-time transaction update
    const { triggerTransactionUpdate } = await import("@/lib/pusher");
    await triggerTransactionUpdate(transaction.buyerId, updatedTransaction);
    console.log("✅ Pusher transaction update event sent to buyer");

    // Handle successful payment
    if (newStatus === "COMPLETED") {
      // Update marketplace item status if applicable
      if (transaction.itemType === "marketplace" && transaction.itemId) {
        await prisma.marketplaceItem.update({
          where: { id: transaction.itemId },
          data: { status: "sold" },
        });
      }

      // Handle food order creation
      if (transaction.itemType === "food" && transaction.foodItemId) {
        const foodItem = await prisma.foodItem.findUnique({
          where: { id: transaction.foodItemId },
        });

        if (foodItem) {
          const quantity = 1;
          const totalPrice = transaction.amount;

          await prisma.foodOrder.create({
            data: {
              foodItemId: foodItem.id,
              buyerId: transaction.buyerId,
              quantity: quantity,
              totalPrice: totalPrice,
              pickupTime: foodItem.pickupTime,
              status: "confirmed",
            },
          });

          await prisma.foodItem.update({
            where: { id: foodItem.id },
            data: {
              quantity: { decrement: quantity },
              status: foodItem.quantity - quantity <= 0 ? "sold" : "available",
            },
          });

          // Update message orderData status to "paid"
          // Find all payment_request messages and check orderData
          const paymentMessages = await prisma.message.findMany({
            where: {
              messageType: "payment_request",
            },
          });

          const matchingMessage = paymentMessages.find((msg) => {
            const orderData = msg.orderData as any;
            return (
              orderData &&
              orderData.foodId === foodItem.id &&
              orderData.status === "awaiting_payment"
            );
          });

          if (matchingMessage) {
            const orderData = matchingMessage.orderData as any;
            await prisma.message.update({
              where: { id: matchingMessage.id },
              data: {
                orderData: {
                  ...orderData,
                  status: "paid",
                },
              },
            });

            // Trigger Pusher event to update UI in real-time
            const { triggerNewMessage } = await import("@/lib/pusher");
            const updatedMessage = await prisma.message.findUnique({
              where: { id: matchingMessage.id },
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                  },
                },
                receiver: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                  },
                },
              },
            });

            if (updatedMessage) {
              await triggerNewMessage(
                matchingMessage.conversationId,
                updatedMessage
              );
            }

            console.log("✅ Message updated via webhook, Pusher event sent");
          }
        }
      }

      // Handle event registration
      if (transaction.itemType === "event" && transaction.eventId) {
        const event = await prisma.event.findUnique({
          where: { id: transaction.eventId },
        });

        if (event) {
          // Create or update event participant
          const existingParticipant = await prisma.eventParticipant.findUnique({
            where: {
              eventId_userId: {
                eventId: transaction.eventId,
                userId: transaction.buyerId,
              },
            },
          });

          if (existingParticipant) {
            // Update existing participant payment status
            await prisma.eventParticipant.update({
              where: { id: existingParticipant.id },
              data: {
                paymentStatus: "paid",
                transactionId: transaction.orderId,
              },
            });
          } else {
            // Create new participant
            await prisma.eventParticipant.create({
              data: {
                eventId: transaction.eventId,
                userId: transaction.buyerId,
                paymentStatus: "paid",
                transactionId: transaction.orderId,
                status: "registered",
              },
            });

            // Increment participant count
            await prisma.event.update({
              where: { id: transaction.eventId },
              data: {
                currentParticipants: { increment: 1 },
              },
            });
          }

          console.log("✅ Event registration completed via webhook");
        }
      }

      // Update seller stats for ALL transaction types (marketplace, food, events, tutoring)
      if (transaction.sellerId) {
        // Calculate platform fee (5% commission)
        const platformFee = Math.floor(transaction.amount * 0.05);
        const sellerEarnings = transaction.amount - platformFee;

        await prisma.userStats.upsert({
          where: { userId: transaction.sellerId },
          update: {
            itemsSold: { increment: 1 },
            totalEarnings: { increment: sellerEarnings },
            // Add to pending balance (3-day holding period)
            pendingBalance: { increment: sellerEarnings },
          },
          create: {
            userId: transaction.sellerId,
            itemsSold: 1,
            totalEarnings: sellerEarnings,
            pendingBalance: sellerEarnings,
            availableBalance: 0,
            withdrawnBalance: 0,
            itemsBought: 0,
            totalSpent: 0,
            messagesCount: 0,
            tutoringSessions: 0,
            reviewsGiven: 0,
            reviewsReceived: 0,
          },
        });
      }

      // Update buyer stats
      await prisma.userStats.upsert({
        where: { userId: transaction.buyerId },
        update: {
          itemsBought: { increment: 1 },
          totalSpent: { increment: transaction.amount },
        },
        create: {
          userId: transaction.buyerId,
          itemsBought: 1,
          totalSpent: transaction.amount,
          itemsSold: 0,
          totalEarnings: 0,
          availableBalance: 0,
          pendingBalance: 0,
          withdrawnBalance: 0,
          messagesCount: 0,
          tutoringSessions: 0,
          reviewsGiven: 0,
          reviewsReceived: 0,
        },
      });

      // Create notification for seller
      if (transaction.sellerId) {
        await prisma.notification.create({
          data: {
            userId: transaction.sellerId,
            type: "sale",
            title: "Item Sold!",
            message: `Your item "${
              transaction.itemTitle
            }" has been sold for Rp ${transaction.amount.toLocaleString()}`,
          },
        });

        const seller = await prisma.user.findUnique({
          where: { id: transaction.sellerId },
          select: { name: true, email: true },
        });

        const buyer = await prisma.user.findUnique({
          where: { id: transaction.buyerId },
          select: { name: true },
        });

        if (seller && buyer) {
          const ordersUrl = `${process.env.NEXTAUTH_URL}/orders`;

          // Use real emails if USE_REAL_EMAILS is set to true, otherwise use test email
          const useRealEmails =
            process.env.USE_REAL_EMAILS === "true" ||
            process.env.NODE_ENV === "production";
          const recipientEmail = useRealEmails
            ? seller.email
            : "delivered@resend.dev";

          console.log(
            `Sending sale notification email to seller: ${seller.name} (${recipientEmail})`
          );

          const emailResult = await sendEmail({
            to: recipientEmail,
            subject: `You made a sale: ${transaction.itemTitle}`,
            html: getPurchaseNotificationEmailTemplate(
              seller.name,
              transaction.itemTitle,
              transaction.itemType,
              transaction.amount,
              buyer.name,
              ordersUrl
            ),
          });

          if (emailResult.success) {
            console.log(
              `✅ Sale notification email sent successfully to ${seller.name}`
            );
          } else {
            console.error(
              `❌ Failed to send sale notification email to ${seller.name}:`,
              emailResult.error
            );
          }
        } else {
          console.error(
            `❌ Cannot send email - seller or buyer not found. Seller: ${seller?.name}, Buyer: ${buyer?.name}`
          );
        }
      }

      // Create notification for buyer
      await prisma.notification.create({
        data: {
          userId: transaction.buyerId,
          type: "purchase",
          title: "Payment Successful!",
          message: `Your purchase of "${
            transaction.itemTitle
          }" has been confirmed. ${
            transaction.itemType === "marketplace"
              ? "Access it from your Library."
              : transaction.itemType === "food"
              ? "Your order is confirmed!"
              : ""
          }`,
        },
      });
    }

    // Handle failed payment
    if (newStatus === "FAILED" || newStatus === "CANCELLED") {
      // Restore item availability if marketplace item
      if (transaction.itemType === "marketplace" && transaction.itemId) {
        await prisma.marketplaceItem.update({
          where: { id: transaction.itemId },
          data: { status: "available" },
        });
      }

      // Create notification for buyer
      await prisma.notification.create({
        data: {
          userId: transaction.buyerId,
          type: "system",
          title: "Payment Failed",
          message: `Your payment for "${
            transaction.itemTitle
          }" was ${newStatus.toLowerCase()}`,
        },
      });
    }

    console.log("Transaction updated:", {
      orderId: order_id,
      status: newStatus,
    });

    return NextResponse.json({
      success: true,
      message: "Notification processed",
    });
  } catch (error: any) {
    console.error("Payment notification error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
