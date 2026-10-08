-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "SpotType" AS ENUM ('park', 'street', 'diy');

-- CreateEnum
CREATE TYPE "Feature" AS ENUM ('ledge', 'rail', 'plaza', 'stairs', 'skatepark');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('beginner', 'intermediate', 'advanced', 'pro');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'pending', 'closed');

-- CreateTable
CREATE TABLE "Spot" (
    "id" SERIAL NOT NULL,
    "spotId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "spot_type" "SpotType" NOT NULL,
    "description" TEXT,
    "features" "Feature"[],
    "difficulty" "Difficulty" NOT NULL,
    "is_skateable" BOOLEAN NOT NULL,
    "isPublic" BOOLEAN NOT NULL,
    "rating" INTEGER NOT NULL,
    "lat_lng" geography(Point, 4326),
    "photo" TEXT,
    "status" "Status" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT,

    CONSTRAINT "Spot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "profileId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "homecity" TEXT NOT NULL,
    "stance" TEXT NOT NULL,
    "profileImage" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "yearsSkating" INTEGER NOT NULL,
    "filmer" BOOLEAN NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" SERIAL NOT NULL,
    "bookmarkId" TEXT NOT NULL,
    "spotId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Spot_spotId_key" ON "Spot"("spotId");

-- CreateIndex
CREATE INDEX "Spot_lat_lng_idx" ON "Spot" USING GIST ("lat_lng");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_profileId_key" ON "Profile"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_bookmarkId_key" ON "Bookmark"("bookmarkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");

-- AddForeignKey
ALTER TABLE "Spot" ADD CONSTRAINT "Spot_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("spotId") ON DELETE RESTRICT ON UPDATE CASCADE;
