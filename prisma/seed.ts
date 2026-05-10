import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  const demo = await prisma.user.upsert({
    where: { email: "demo@traveloop.app" },
    update: {},
    create: {
      name: "Demo Traveler",
      email: "demo@traveloop.app",
      passwordHash: await hashPassword("Traveloop123!"),
    },
  });

  await prisma.trip.deleteMany({
    where: { ownerId: demo.id, title: "Tokyo Spring Loop" },
  });

  await prisma.trip.create({
    data: {
      ownerId: demo.id,
      title: "Tokyo Spring Loop",
      destination: "Tokyo, Japan",
      description: "A balanced week of food, neighborhoods, museums, and easy day trips.",
      startsAt: new Date("2026-04-06T00:00:00.000Z"),
      endsAt: new Date("2026-04-13T00:00:00.000Z"),
      budget: 2600,
      currency: "USD",
      status: "PLANNED",
      visibility: "PUBLIC",
      stops: {
        create: [
          {
            title: "Shinjuku",
            kind: "CITY",
            address: "Shinjuku City, Tokyo",
            latitude: 35.6938,
            longitude: 139.7034,
            position: 0,
          },
          {
            title: "Asakusa",
            kind: "CITY",
            address: "Taito City, Tokyo",
            latitude: 35.7148,
            longitude: 139.7967,
            position: 1,
          },
        ],
      },
      activities: {
        create: [
          {
            title: "Golden Gai food walk",
            category: "FOOD",
            description: "Small bars and late-night izakaya crawl.",
            startsAt: new Date("2026-04-07T11:30:00.000Z"),
            cost: 85,
            currency: "USD",
            position: 0,
          },
          {
            title: "Senso-ji and Nakamise-dori",
            category: "CULTURE",
            description: "Temple visit and street snacks.",
            startsAt: new Date("2026-04-08T02:00:00.000Z"),
            cost: 20,
            currency: "USD",
            position: 1,
          },
        ],
      },
      expenses: {
        create: [
          { title: "Hotel deposit", amount: 420, currency: "USD", category: "LODGING" },
          { title: "Suica top-up", amount: 45, currency: "USD", category: "TRANSPORT" },
        ],
      },
      packingItems: {
        create: [
          { label: "Passport", category: "DOCUMENTS", packed: true },
          { label: "Universal adapter", category: "ELECTRONICS" },
          { label: "Light rain jacket", category: "CLOTHING" },
        ],
      },
      notes: {
        create: [
          {
            title: "Arrival",
            body: "Pick up pocket Wi-Fi at Haneda before taking the train into Shinjuku.",
            journalDate: new Date("2026-04-06T00:00:00.000Z"),
            pinned: true,
          },
        ],
      },
      sharedItineraries: {
        create: {
          ownerId: demo.id,
          slug: "tokyo-spring-loop-demo",
          permission: "COPY",
        },
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
