/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `itemTitle` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemType` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Transaction_transactionId_key";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "fraudStatus" TEXT,
ADD COLUMN     "itemTitle" TEXT NOT NULL,
ADD COLUMN     "itemType" TEXT NOT NULL,
ADD COLUMN     "orderId" TEXT NOT NULL,
ADD COLUMN     "snapToken" TEXT,
ADD COLUMN     "snapUrl" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING',
ALTER COLUMN "paymentProvider" SET DEFAULT 'midtrans',
ALTER COLUMN "itemId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_orderId_key" ON "Transaction"("orderId");

-- CreateIndex
CREATE INDEX "Transaction_orderId_idx" ON "Transaction"("orderId");
