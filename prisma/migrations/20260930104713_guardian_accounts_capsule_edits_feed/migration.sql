-- AlterTable
ALTER TABLE "Capsule" ADD COLUMN     "editCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sealed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Guardian" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "MemorialMessage" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
