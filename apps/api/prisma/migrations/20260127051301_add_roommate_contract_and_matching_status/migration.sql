-- CreateEnum
CREATE TYPE "MatchingStatus" AS ENUM ('SEARCHING', 'MATCHED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'SIGNED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "matchingStatus" "MatchingStatus" NOT NULL DEFAULT 'SEARCHING';

-- CreateTable
CREATE TABLE "RoommateContract" (
    "id" TEXT NOT NULL,
    "chatRoomId" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "contractData" JSONB NOT NULL,
    "signatureA" BOOLEAN NOT NULL DEFAULT false,
    "signatureB" BOOLEAN NOT NULL DEFAULT false,
    "signedAt" TIMESTAMP(3),

    CONSTRAINT "RoommateContract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoommateContract_chatRoomId_key" ON "RoommateContract"("chatRoomId");

-- AddForeignKey
ALTER TABLE "RoommateContract" ADD CONSTRAINT "RoommateContract_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommateContract" ADD CONSTRAINT "RoommateContract_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommateContract" ADD CONSTRAINT "RoommateContract_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
