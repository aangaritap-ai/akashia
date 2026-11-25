-- CreateEnum
CREATE TYPE "PetSpecies" AS ENUM ('DOG', 'CAT', 'BIRD', 'RABBIT', 'FISH', 'HORSE', 'OTHER');

-- AlterTable
ALTER TABLE "MemorialMessage" ADD COLUMN "petId" TEXT;

-- AlterTable
ALTER TABLE "SpecialDate" ADD COLUMN "petId" TEXT;

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" "PetSpecies" NOT NULL DEFAULT 'OTHER',
    "photoUrl" TEXT,
    "story" TEXT,
    "birthDate" DATE,
    "adoptionDate" DATE,
    "passedDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pet_ownerId_idx" ON "Pet"("ownerId");

-- CreateIndex
CREATE INDEX "MemorialMessage_petId_idx" ON "MemorialMessage"("petId");

-- CreateIndex
CREATE INDEX "SpecialDate_petId_idx" ON "SpecialDate"("petId");

-- AddForeignKey
ALTER TABLE "MemorialMessage" ADD CONSTRAINT "MemorialMessage_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialDate" ADD CONSTRAINT "SpecialDate_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
