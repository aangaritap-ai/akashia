-- CreateTable
CREATE TABLE "MemorialMessage" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemorialMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MemorialMessage" ADD CONSTRAINT "MemorialMessage_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
