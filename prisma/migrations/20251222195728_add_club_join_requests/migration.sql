-- AlterTable
ALTER TABLE "ClubMember" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'JOINED';

-- CreateTable
CREATE TABLE "ClubJoinRequest" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "ClubJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClubJoinRequest_clubId_idx" ON "ClubJoinRequest"("clubId");

-- CreateIndex
CREATE INDEX "ClubJoinRequest_userId_idx" ON "ClubJoinRequest"("userId");

-- CreateIndex
CREATE INDEX "ClubJoinRequest_status_idx" ON "ClubJoinRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ClubJoinRequest_clubId_userId_key" ON "ClubJoinRequest"("clubId", "userId");

-- CreateIndex
CREATE INDEX "ClubMember_status_idx" ON "ClubMember"("status");

-- AddForeignKey
ALTER TABLE "ClubJoinRequest" ADD CONSTRAINT "ClubJoinRequest_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubJoinRequest" ADD CONSTRAINT "ClubJoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
