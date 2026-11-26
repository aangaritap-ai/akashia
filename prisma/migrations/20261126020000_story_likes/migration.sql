-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'STORY_LIKE';

-- AlterTable
ALTER TABLE "StoryView" ADD COLUMN "likedAt" TIMESTAMP(3);
ALTER TABLE "StoryView" ADD COLUMN "likeNotified" BOOLEAN NOT NULL DEFAULT false;
