-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "isOpenForRegistration" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "registrationEndDate" TIMESTAMP(3),
ADD COLUMN     "registrationStartDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Club_isOpenForRegistration_idx" ON "Club"("isOpenForRegistration");
