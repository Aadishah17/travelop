-- CreateEnum
CREATE TYPE "TripVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- AlterEnum
ALTER TYPE "PackingCategory" ADD VALUE 'ACCESSORIES';
ALTER TYPE "PackingCategory" ADD VALUE 'CUSTOM';

-- AlterTable
ALTER TABLE "Note" ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "journalDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PackingItem" ADD COLUMN "customCategory" TEXT;

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN "visibility" "TripVisibility" NOT NULL DEFAULT 'PRIVATE';

-- CreateIndex
CREATE INDEX "Note_journalDate_idx" ON "Note"("journalDate");

-- CreateIndex
CREATE INDEX "Trip_visibility_idx" ON "Trip"("visibility");
