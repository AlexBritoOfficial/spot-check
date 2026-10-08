-- RenameColumn (snake_case -> camelCase, to match the rest of the schema)
ALTER TABLE "Spot" RENAME COLUMN "spot_type" TO "spotType";
ALTER TABLE "Spot" RENAME COLUMN "is_skateable" TO "isSkateable";
ALTER TABLE "Spot" RENAME COLUMN "created_at" TO "createdAt";
ALTER TABLE "Spot" RENAME COLUMN "lat_lng" TO "latLng";

-- RenameIndex
ALTER INDEX "Spot_lat_lng_idx" RENAME TO "Spot_latLng_idx";

-- Make delete behavior explicit instead of relying on Prisma's implicit defaults
-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";
ALTER TABLE "Bookmark" DROP CONSTRAINT "Bookmark_userId_fkey";
ALTER TABLE "Bookmark" DROP CONSTRAINT "Bookmark_spotId_fkey";

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("spotId") ON DELETE CASCADE ON UPDATE CASCADE;
