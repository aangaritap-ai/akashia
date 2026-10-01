-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deceasedCancelToken" TEXT,
ADD COLUMN     "deceasedPendingAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_deceasedCancelToken_key" ON "User"("deceasedCancelToken");
