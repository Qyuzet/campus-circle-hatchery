import { config } from "dotenv";
import { prisma } from "../src/lib/prisma";

config({ path: ".env.local" });

async function testPaymentWebhook() {
  console.log("Finding recent pending transactions...\n");

  const pendingTransactions = await prisma.transaction.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      buyer: { select: { name: true, email: true } },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  if (pendingTransactions.length === 0) {
    console.log("No pending transactions found.");
    return;
  }

  console.log(`Found ${pendingTransactions.length} pending transaction(s):\n`);

  pendingTransactions.forEach((tx, index) => {
    console.log(`${index + 1}. Order ID: ${tx.orderId}`);
    console.log(`   Item: ${tx.itemTitle}`);
    console.log(`   Amount: Rp ${tx.amount.toLocaleString()}`);
    console.log(`   Buyer: ${tx.buyer.name} (${tx.buyer.email})`);
    console.log(`   Created: ${tx.createdAt.toLocaleString()}\n`);
  });

  console.log("\nTo manually trigger the webhook for a transaction:");
  console.log("1. Copy the Order ID from above");
  console.log("2. Go to Midtrans Dashboard > Transactions");
  console.log("3. Find the transaction and click 'Resend Webhook'");
  console.log("\nOR use this curl command (replace ORDER_ID):");
  console.log(`
curl -X POST http://localhost:3000/api/payment/notification \\
  -H "Content-Type: application/json" \\
  -d '{
    "order_id": "ORDER_ID_HERE",
    "transaction_status": "settlement",
    "fraud_status": "accept",
    "status_code": "200",
    "gross_amount": "AMOUNT_HERE",
    "signature_key": "SIGNATURE_HERE",
    "transaction_id": "TEST-TRANSACTION-ID",
    "payment_type": "bank_transfer"
  }'
  `);
}

testPaymentWebhook()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

