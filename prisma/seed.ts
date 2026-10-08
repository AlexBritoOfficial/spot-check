import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { mockSpots } from "../src/app/data/mockSpots";
import { mockUsers } from "../src/app/data/mockUsers";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const spotOwnersByName: Record<string, string> = {
  Eggs: "riderNguyen",
  AQ: "riderSilva",
};

const bookmarksByUsername: Record<string, string[]> = {
  riderNguyen: ["Lynch Family Skatepark", "Copley Library"],
  riderSilva: ["Lynch Family Skatepark"],
  riderChen: ["Eggs", "AQ"],
  riderOkafor: ["Copley Library"],
};

async function main() {
  await prisma.bookmark.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.spot.deleteMany();
  await prisma.user.deleteMany();

  const usersByUsername: Record<string, { userId: string }> = {};

  for (const mockUser of mockUsers) {
    const user = await prisma.user.create({
      data: {
        username: mockUser.username,
        email: mockUser.email,
        password: mockUser.password,
      },
    });
    usersByUsername[user.username] = user;
  }

  const spotsByName: Record<string, { id: number; spotId: string }> = {};
  for (const mockSpot of mockSpots) {
    const ownerUsername = spotOwnersByName[mockSpot.name];
    const ownerId = ownerUsername
      ? usersByUsername[ownerUsername].userId
      : null;

    const spot = await prisma.spot.create({
      data: {
        name: mockSpot.name,
        city: mockSpot.city,
        spotType: mockSpot.spot_type,
        description: mockSpot.description,
        features: mockSpot.features,
        difficulty: mockSpot.difficulty,
        isSkateable: mockSpot.is_skateable,
        isPublic: mockSpot.isPublic,
        rating: mockSpot.rating,
        photo: mockSpot.photo,
        status: mockSpot.status,
        createdAt: new Date(mockSpot.created_at),
        ownerId,
      },
    });
    spotsByName[spot.name] = spot;

    await prisma.$executeRaw`
      UPDATE "Spot"
      SET "latLng" = ST_SetSRID(ST_MakePoint(${mockSpot.lat_lng.lng}, ${mockSpot.lat_lng.lat}), 4326)
      WHERE "id" = ${spot.id}
    `;
  }

  for (const [username, spotNames] of Object.entries(bookmarksByUsername)) {
    const user = usersByUsername[username];
    for (const spotName of spotNames) {
      const spot = spotsByName[spotName];
      await prisma.bookmark.create({
        data: {
          userId: user.userId,
          spotId: spot.spotId,
          savedAt: new Date(),
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
