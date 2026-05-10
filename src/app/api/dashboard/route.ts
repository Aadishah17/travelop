import { fail, ok } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const userId = await requireUserId();

  if (!userId) {
    return fail("Unauthorized.", { status: 401 });
  }

  const [trips, upcomingTrips, activeTrips, expenseTotal] = await Promise.all([
    prisma.trip.count({ where: { ownerId: userId } }),
    prisma.trip.findMany({
      where: { ownerId: userId, startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 5,
      include: {
        stops: { orderBy: { position: "asc" }, take: 3 },
      },
    }),
    prisma.trip.count({ where: { ownerId: userId, status: "ACTIVE" } }),
    prisma.expense.aggregate({
      where: { trip: { ownerId: userId } },
      _sum: { amount: true },
    }),
  ]);

  return ok({
    counts: {
      trips,
      activeTrips,
    },
    upcomingTrips,
    expenseTotal: expenseTotal._sum.amount ?? 0,
  });
}
