-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "foodItemId" TEXT;

-- CreateIndex
CREATE INDEX "Transaction_foodItemId_idx" ON "Transaction"("foodItemId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
