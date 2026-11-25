-- CreateEnum
CREATE TYPE "SpecialDateKind" AS ENUM ('BIRTHDAY', 'ANNIVERSARY', 'MEMORIAL', 'OTHER');

-- CreateTable
CREATE TABLE "SpecialDate" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" "SpecialDateKind" NOT NULL DEFAULT 'OTHER',
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "year" INTEGER,
    "lastRemindedYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpecialDate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpecialDate_ownerId_idx" ON "SpecialDate"("ownerId");

-- CreateIndex
CREATE INDEX "SpecialDate_month_day_idx" ON "SpecialDate"("month", "day");

-- AddForeignKey
ALTER TABLE "SpecialDate" ADD CONSTRAINT "SpecialDate_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
