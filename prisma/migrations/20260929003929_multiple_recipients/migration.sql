/*
  Warnings:

  - You are about to drop the column `delivered` on the `Capsule` table. All the data in the column will be lost.
  - You are about to drop the column `deliveredAt` on the `Capsule` table. All the data in the column will be lost.
  - You are about to drop the column `recipientEmail` on the `Capsule` table. All the data in the column will be lost.
  - You are about to drop the column `recipientName` on the `Capsule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Capsule" DROP COLUMN "delivered",
DROP COLUMN "deliveredAt",
DROP COLUMN "recipientEmail",
DROP COLUMN "recipientName";

-- CreateTable
CREATE TABLE "CapsuleRecipient" (
    "id" TEXT NOT NULL,
    "capsuleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "CapsuleRecipient_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CapsuleRecipient" ADD CONSTRAINT "CapsuleRecipient_capsuleId_fkey" FOREIGN KEY ("capsuleId") REFERENCES "Capsule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
